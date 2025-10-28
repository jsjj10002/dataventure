import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../../middlewares/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/v1/profile/candidate/:id
 * 구직자 프로필 조회
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    const profile = await prisma.candidateProfile.findUnique({
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
 * PUT /api/v1/profile/candidate/:id
 * 구직자 프로필 업데이트
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.user) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    const {
      photoUrl,
      bio,
      educationJson,
      experienceJson,
      projectsJson,
      skillsJson,
      portfolioUrl,
      blogUrl,
      githubUrl,
      linkedinUrl,
      resumeUrl,
      portfolioFileUrl,
      desiredPosition,
      desiredSalary,
    } = req.body;

    // 권한 확인 (본인만 수정 가능)
    const profile = await prisma.candidateProfile.findUnique({
      where: { id },
    });

    if (!profile) {
      return res.status(404).json({ error: '프로필을 찾을 수 없습니다.' });
    }

    if (profile.userId !== req.user.id) {
      return res.status(403).json({ error: '권한이 없습니다.' });
    }

    const updatedProfile = await prisma.candidateProfile.update({
      where: { id },
      data: {
        photoUrl,
        bio,
        educationJson: educationJson ? JSON.stringify(educationJson) : undefined,
        experienceJson: experienceJson ? JSON.stringify(experienceJson) : undefined,
        projectsJson: projectsJson ? JSON.stringify(projectsJson) : undefined,
        skillsJson: skillsJson ? JSON.stringify(skillsJson) : undefined,
        portfolioUrl,
        blogUrl,
        githubUrl,
        linkedinUrl,
        resumeUrl,
        portfolioFileUrl,
        desiredPosition,
        desiredSalary,
      },
    });

    res.json(updatedProfile);
  } catch (error) {
    console.error('프로필 업데이트 오류:', error);
    res.status(500).json({ error: '프로필 업데이트에 실패했습니다.' });
  }
});

export default router;
