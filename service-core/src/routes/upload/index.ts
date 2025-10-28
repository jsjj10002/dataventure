import { Router } from 'express';
import { Storage } from '@google-cloud/storage';
import multer from 'multer';
import { authenticateToken } from '../../middlewares/auth.middleware';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GCP Storage 설정
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

const bucketName = process.env.GCP_STORAGE_BUCKET || 'recruiter-files';
const bucket = storage.bucket(bucketName);

// Multer 설정 (메모리 스토리지)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB 제한
  },
  fileFilter: (req, file, cb) => {
    // 허용된 파일 형식
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword', // .doc
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('지원하지 않는 파일 형식입니다.'));
    }
  },
});

/**
 * POST /api/v1/upload
 * 파일 업로드 (이미지, 이력서, 포트폴리오)
 */
router.post('/', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: '파일이 업로드되지 않았습니다.' });
    }

    const { type = 'general' } = req.body; // photo, resume, portfolio, general
    const userId = req.user.id;
    const file = req.file;

    // 파일명 생성 (UUID + 원본 확장자)
    const ext = path.extname(file.originalname);
    const filename = `${type}/${userId}/${uuidv4()}${ext}`;

    // GCP Storage에 업로드
    const blob = bucket.file(filename);
    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType: file.mimetype,
        metadata: {
          originalName: file.originalname,
          uploadedBy: userId,
          uploadedAt: new Date().toISOString(),
        },
      },
    });

    return new Promise((resolve, reject) => {
      blobStream.on('error', (error) => {
        console.error('파일 업로드 오류:', error);
        reject(error);
      });

      blobStream.on('finish', async () => {
        // 공개 URL 생성
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;

        res.json({
          message: '파일이 업로드되었습니다.',
          url: publicUrl,
          filename: file.originalname,
          size: file.size,
          type: file.mimetype,
        });
        resolve(true);
      });

      blobStream.end(file.buffer);
    });
  } catch (error) {
    console.error('파일 업로드 오류:', error);
    res.status(500).json({ 
      error: '파일 업로드에 실패했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * POST /api/v1/upload/multiple
 * 여러 파일 업로드
 */
router.post('/multiple', authenticateToken, upload.array('files', 5), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ error: '파일이 업로드되지 않았습니다.' });
    }

    const { type = 'general' } = req.body;
    const userId = req.user.id;
    const uploadedFiles: any[] = [];

    // 모든 파일 업로드
    for (const file of req.files) {
      const ext = path.extname(file.originalname);
      const filename = `${type}/${userId}/${uuidv4()}${ext}`;

      const blob = bucket.file(filename);
      await blob.save(file.buffer, {
        resumable: false,
        metadata: {
          contentType: file.mimetype,
          metadata: {
            originalName: file.originalname,
            uploadedBy: userId,
            uploadedAt: new Date().toISOString(),
          },
        },
      });

      const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;
      uploadedFiles.push({
        url: publicUrl,
        filename: file.originalname,
        size: file.size,
        type: file.mimetype,
      });
    }

    res.json({
      message: `${uploadedFiles.length}개의 파일이 업로드되었습니다.`,
      files: uploadedFiles,
    });
  } catch (error) {
    console.error('파일 업로드 오류:', error);
    res.status(500).json({ 
      error: '파일 업로드에 실패했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * DELETE /api/v1/upload
 * 파일 삭제
 */
router.delete('/', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL이 제공되지 않았습니다.' });
    }

    // URL에서 파일명 추출
    const filename = url.replace(`https://storage.googleapis.com/${bucketName}/`, '');
    
    // 본인이 업로드한 파일인지 확인
    if (!filename.includes(req.user.id)) {
      return res.status(403).json({ error: '권한이 없습니다.' });
    }

    // 파일 삭제
    await bucket.file(filename).delete();

    res.json({ message: '파일이 삭제되었습니다.' });
  } catch (error) {
    console.error('파일 삭제 오류:', error);
    res.status(500).json({ 
      error: '파일 삭제에 실패했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

export default router;

