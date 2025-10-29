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

    // mode 검증
    const validModes = ['PRACTICE', 'ACTUAL'];
    const interviewMode = mode?.toUpperCase() || 'PRACTICE';
    
    if (!validModes.includes(interviewMode)) {
      return res.status(400).json({ 
        error: `유효하지 않은 mode 값입니다. 허용된 값: ${validModes.join(', ')}` 
      });
    }

    // 프로필 조회
    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: '프로필을 먼저 작성해주세요.' });
    }

    // AI 서비스에 질문 생성 요청
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/internal/ai/generate-question`, {
      profile: {
        education: profile.education, // 스키마 필드명 수정
        experience: profile.careerHistory, // 스키마 필드명 수정
        projects: profile.projects, // 스키마 필드명 수정
        skills: profile.skills, // 스키마 필드명 수정 (String[] 배열)
        desiredPosition: profile.desiredPosition,
      },
      mode: interviewMode,
      selectedQuestions,
      customQuestions,
    });

    const { questions, interviewPlan } = aiResponse.data;

    // 인터뷰 세션 생성
    const interview = await prisma.interview.create({
      data: {
        candidateId: userId,
        mode: interviewMode,
        timeLimitSeconds: duration ? duration * 60 : 900, // 분을 초로 변환
        isVoiceMode: interviewMode === 'ACTUAL',
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
    
    // Prisma validation error 처리
    if (error instanceof Error && error.message.includes('Invalid')) {
      return res.status(400).json({ 
        error: '잘못된 데이터 형식입니다.',
        details: error.message 
      });
    }
    
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

    // AI 서비스에서 평가 생성 및 저장 (비동기)
    (async () => {
      try {
        console.log(`[평가 생성 시작] 인터뷰 ID: ${id}`);
        
        // 1. 메시지 조회
        const messages = await prisma.interviewMessage.findMany({
          where: { interviewId: id },
          orderBy: { createdAt: 'asc' },
        });

        console.log(`[평가 생성] 메시지 ${messages.length}개 조회됨`);

        if (messages.length < 2) {
          console.error(`[평가 생성 실패] 메시지가 부족합니다. (${messages.length}개, 최소 2개 필요)`);
          return;
        }

        // 2. 프로필 조회
        const profile = await prisma.candidateProfile.findUnique({
          where: { userId: interview.candidateId },
        });

        console.log(`[평가 생성] 프로필 조회: ${profile ? '성공' : '없음'}`);

        // 3. AI 서비스 호출 (올바른 경로)
        console.log(`[평가 생성] AI 서비스 호출 중... URL: ${AI_SERVICE_URL}/internal/ai/generate-evaluation`);
        
        // 프로필 데이터 준비 (JSON 문자열을 파싱)
        let profileData = null;
        if (profile) {
          try {
            profileData = {
              education: profile.educationJson ? (typeof profile.educationJson === 'string' ? JSON.parse(profile.educationJson) : profile.educationJson) : null,
              experience: profile.experienceJson ? (typeof profile.experienceJson === 'string' ? JSON.parse(profile.experienceJson) : profile.experienceJson) : null,
              projects: profile.projectsJson ? (typeof profile.projectsJson === 'string' ? JSON.parse(profile.projectsJson) : profile.projectsJson) : null,
              skills: profile.skillsJson ? (typeof profile.skillsJson === 'string' ? JSON.parse(profile.skillsJson) : profile.skillsJson) : null,
              desiredPosition: profile.desiredPosition,
              bio: profile.bio,
            };
          } catch (parseError) {
            console.error('[평가 생성] 프로필 JSON 파싱 오류:', parseError);
            // 파싱 실패 시 원본 데이터 사용
            profileData = {
              desiredPosition: profile.desiredPosition,
              bio: profile.bio,
            };
          }
        }
        
        const aiResponse = await axios.post(
          `${AI_SERVICE_URL}/internal/ai/generate-evaluation`,
          {
            interviewId: id, // 필수 필드 추가
            conversationHistory: messages.map(m => ({
              role: m.role.toLowerCase(),
              content: m.content
            })),
            candidateProfile: profileData,
            jobPosting: null,
          }
        );

        console.log(`[평가 생성] AI 서비스 응답 수신`);
        console.log(`[평가 생성] 점수:`, JSON.stringify(aiResponse.data.scores, null, 2));

        const { scores, feedback } = aiResponse.data;

        // 4. 평가 결과를 DB에 저장
        const evaluation = await prisma.evaluation.create({
          data: {
            interviewId: id,
            // 점수 매핑 (AI 서비스 응답 형식에서 DB 스키마로)
            deliveryScore: scores.communicationScore || 0,
            vocabularyScore: scores.communicationScore || 0,
            comprehensionScore: scores.communicationScore || 0,
            communicationAvg: scores.communicationScore || 0,
            informationAnalysis: scores.technicalScore || 0,
            problemSolving: scores.problemSolvingScore || 0,
            flexibleThinking: scores.problemSolvingScore || 0,
            negotiation: scores.communicationScore || 0,
            itSkills: scores.technicalScore || 0,
            overallScore: scores.overallScore || 0,
            strengthsJson: JSON.stringify(feedback.strengths || []),
            weaknessesJson: JSON.stringify(feedback.weaknesses || []),
            detailedFeedback: feedback.summary || '',
            recommendedPositions: JSON.stringify([]),
          },
        });

        console.log(`[평가 생성 완료] 평가 ID: ${evaluation.id}, 종합 점수: ${evaluation.overallScore}`);

        // 5. 알림 생성
        await prisma.notification.create({
          data: {
            userId: interview.candidateId,
            type: 'EVALUATION_COMPLETED',
            title: '인터뷰 평가 완료',
            message: `${interview.mode === 'PRACTICE' ? '연습' : '실전'} 인터뷰 평가가 완료되었습니다. 종합 점수: ${evaluation.overallScore}점`,
            link: `/evaluation/${id}`,
          },
        });

        console.log(`[평가 생성] 알림 생성 완료`);
      } catch (evalError) {
        console.error('[평가 생성 오류] 상세 정보:', evalError);
        if (evalError instanceof Error) {
          console.error('[평가 생성 오류] 메시지:', evalError.message);
          console.error('[평가 생성 오류] 스택:', evalError.stack);
        }
        
        // 평가 생성 실패 시 알림
        try {
          await prisma.notification.create({
            data: {
              userId: interview.candidateId,
              type: 'SYSTEM',
              title: '평가 생성 지연',
              message: '인터뷰 평가가 생성 중입니다. 잠시 후 확인해주세요.',
              link: `/dashboard`,
            },
          });
        } catch (notifError) {
          console.error('[평가 생성] 알림 생성 오류:', notifError);
        }
      }
    })();

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

    // content 필수 검증
    if (!content) {
      return res.status(400).json({ error: '메시지 내용이 필요합니다.' });
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

    // enum 값 검증
    const validRoles = ['AI', 'CANDIDATE'];
    const validContentTypes = ['TEXT', 'AUDIO'];
    
    const messageRole = role || 'CANDIDATE';
    const messageContentType = contentType || 'TEXT';
    
    if (!validRoles.includes(messageRole)) {
      return res.status(400).json({ 
        error: `유효하지 않은 role 값입니다. 허용된 값: ${validRoles.join(', ')}` 
      });
    }
    
    if (!validContentTypes.includes(messageContentType)) {
      return res.status(400).json({ 
        error: `유효하지 않은 contentType 값입니다. 허용된 값: ${validContentTypes.join(', ')}` 
      });
    }

    const message = await prisma.interviewMessage.create({
      data: {
        interviewId: id,
        role: messageRole,
        content,
        contentType: messageContentType,
        audioUrl: audioUrl || null,
      },
    });

    res.json(message);
  } catch (error) {
    console.error('메시지 저장 오류:', error);
    
    // Prisma validation error 처리
    if (error instanceof Error && error.message.includes('Invalid')) {
      return res.status(400).json({ 
        error: '잘못된 데이터 형식입니다.',
        details: error.message 
      });
    }
    
    res.status(500).json({ error: '메시지 저장에 실패했습니다.' });
  }
});

export default router;
