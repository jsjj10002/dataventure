import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../../middlewares/auth.middleware';
import axios from 'axios';

const router = Router();
const prisma = new PrismaClient();
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * POST /api/v1/interview/start
 * 인터뷰 시작 (질문 생성 및 인터뷰 세션 생성)
 */
router.post('/start', authenticateToken, async (req, res) => {
  try {
    const { mode, duration, selectedQuestions, customQuestions } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    const userId = req.user.id;

    // 구직자 확인
    if (req.user.role !== 'CANDIDATE') {
      return res.status(403).json({ error: '구직자만 인터뷰를 시작할 수 있습니다.' });
    }

    // 프로필 조회
    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: '프로필을 먼저 작성해주세요.' });
    }

    // AI 서비스에 질문 생성 요청
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/v1/interview/generate-questions`, {
      profile: {
        education: profile.educationJson,
        experience: profile.experienceJson,
        projects: profile.projectsJson,
        skills: profile.skillsJson,
        desiredPosition: profile.desiredPosition,
      },
      mode,
      selectedQuestions,
      customQuestions,
    });

    const { questions, interviewPlan } = aiResponse.data;

    // 인터뷰 세션 생성
    const interview = await prisma.interview.create({
      data: {
        candidateId: userId,
        mode: mode === 'practice' ? 'PRACTICE' : 'REAL',
        timeLimitSeconds: duration || 900,
        isVoiceMode: mode === 'practice' ? false : true,
        status: 'IN_PROGRESS',
      },
    });

    res.json({
      interviewId: interview.id,
      questions,
      interviewPlan,
      duration: interview.timeLimitSeconds,
    });
  } catch (error) {
    console.error('인터뷰 시작 오류:', error);
    res.status(500).json({ 
      error: '인터뷰 시작에 실패했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * GET /api/v1/interview/:id
 * 인터뷰 정보 조회
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    const interview = await prisma.interview.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!interview) {
      return res.status(404).json({ error: '인터뷰를 찾을 수 없습니다.' });
    }

    // 권한 확인 (본인만 조회 가능)
    if (interview.candidateId !== req.user.id) {
      return res.status(403).json({ error: '권한이 없습니다.' });
    }

    res.json(interview);
  } catch (error) {
    console.error('인터뷰 조회 오류:', error);
    res.status(500).json({ error: '인터뷰 조회에 실패했습니다.' });
  }
});

/**
 * PUT /api/v1/interview/:id/complete
 * 인터뷰 완료
 */
router.put('/:id/complete', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { elapsedSeconds } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    const interview = await prisma.interview.findUnique({
      where: { id },
    });

    if (!interview) {
      return res.status(404).json({ error: '인터뷰를 찾을 수 없습니다.' });
    }

    // 권한 확인
    if (interview.candidateId !== req.user.id) {
      return res.status(403).json({ error: '권한이 없습니다.' });
    }

    // 인터뷰 완료 처리
    const updatedInterview = await prisma.interview.update({
      where: { id },
      data: {
        completedAt: new Date(),
        elapsedSeconds: elapsedSeconds || null,
        status: 'COMPLETED',
      },
    });

    // AI 서비스에 평가 요청 (비동기)
    axios.post(`${AI_SERVICE_URL}/api/v1/evaluation/analyze`, {
      interviewId: id,
    }).catch(err => {
      console.error('평가 요청 오류:', err);
    });

    res.json({
      message: '인터뷰가 완료되었습니다. 평가가 진행 중입니다.',
      interviewId: updatedInterview.id,
    });
  } catch (error) {
    console.error('인터뷰 완료 오류:', error);
    res.status(500).json({ error: '인터뷰 완료 처리에 실패했습니다.' });
  }
});

/**
 * POST /api/v1/interview/:id/message
 * 인터뷰 메시지 추가 (대화 기록)
 */
router.post('/:id/message', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { role, content, contentType, audioUrl } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    const interview = await prisma.interview.findUnique({
      where: { id },
    });

    if (!interview) {
      return res.status(404).json({ error: '인터뷰를 찾을 수 없습니다.' });
    }

    // 권한 확인
    if (interview.candidateId !== req.user.id) {
      return res.status(403).json({ error: '권한이 없습니다.' });
    }

    const message = await prisma.interviewMessage.create({
      data: {
        interviewId: id,
        role: role || 'CANDIDATE',
        content,
        contentType: contentType || 'TEXT',
        audioUrl: audioUrl || null,
      },
    });

    res.json(message);
  } catch (error) {
    console.error('메시지 저장 오류:', error);
    res.status(500).json({ error: '메시지 저장에 실패했습니다.' });
  }
});

export default router;
