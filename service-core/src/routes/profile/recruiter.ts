import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/v1/profile/recruiter/me
 * 현재 로그인한 채용담당자의 프로필 조회
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    let profile = await prisma.recruiterProfile.findUnique({
      where: { userId: req.user.id },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    // 프로필이 없으면 자동 생성
    if (!profile) {
      const newProfile = await prisma.recruiterProfile.create({
        data: {
          userId: req.user.id,
          companyName: '', // 필수 필드 기본값
          position: '채용담당자', // 필수 필드 기본값
        },
      });
      
      profile = await prisma.recruiterProfile.findUnique({
        where: { id: newProfile.id },
        include: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      });
    }

    res.json(profile);
  } catch (error) {
    console.error('프로필 조회 오류:', error);
    res.status(500).json({ error: '프로필 조회에 실패했습니다.' });
  }
});

/**
 * GET /api/v1/profile/recruiter/:id
 * 채용담당자 프로필 조회
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    const profile = await prisma.recruiterProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    if (!profile) {
      return res.status(404).json({ error: '프로필을 찾을 수 없습니다.' });
    }

    res.json(profile);
  } catch (error) {
    console.error('프로필 조회 오류:', error);
    res.status(500).json({ error: '프로필 조회에 실패했습니다.' });
  }
});

/**
 * PUT /api/v1/profile/recruiter/:id
 * 채용담당자 프로필 업데이트
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    const {
      companyName,
      companyLogoUrl,
      companyDescription,
      companyWebsite,
      position,
      department,
      idealCandidate,
      hiringPositionsJson,
    } = req.body;

    // 권한 확인 (본인만 수정 가능)
    const profile = await prisma.recruiterProfile.findUnique({
      where: { id },
    });

    if (!profile) {
      return res.status(404).json({ error: '프로필을 찾을 수 없습니다.' });
    }

    if (profile.userId !== req.user.id) {
      return res.status(403).json({ error: '권한이 없습니다.' });
    }

    // JSON 데이터 처리 헬퍼
    const toJsonString = (data: any) => {
      if (!data) return null;
      if (typeof data === 'string') return data;
      if (Array.isArray(data)) return JSON.stringify(data);
      return JSON.stringify(data);
    };

    const updatedProfile = await prisma.recruiterProfile.update({
      where: { id },
      data: {
        ...(companyName !== undefined && { companyName }),
        ...(companyLogoUrl !== undefined && { companyLogoUrl }),
        ...(companyDescription !== undefined && { companyDescription }),
        ...(companyWebsite !== undefined && { companyWebsite }),
        ...(position !== undefined && { position }),
        ...(department !== undefined && { department }),
        ...(idealCandidate !== undefined && { idealCandidate }),
        ...(hiringPositionsJson !== undefined && { hiringPositionsJson: toJsonString(hiringPositionsJson) }),
      },
    });

    res.json(updatedProfile);
  } catch (error) {
    console.error('프로필 업데이트 오류:', error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    res.status(500).json({ 
      error: '프로필 업데이트에 실패했습니다.',
      details: errorMessage 
    });
  }
});

export default router;
