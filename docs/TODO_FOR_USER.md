# 🎯 사용자 작업 목록 (빠짐없이 정리)

> **작성일**: 2025-10-28  
> **중요도**: 🔴 필수 / 🟡 권장 / 🟢 선택

---

## 📌 한눈에 보는 체크리스트

### 🔴 필수 작업 (30분)
- [ ] 1. 데이터베이스 마이그레이션
- [ ] 2. Python NumPy 설치
- [ ] 3. 환경 변수 확인
- [ ] 4. 프론트엔드 빌드 테스트
- [ ] 5. 서비스 실행 확인

### 🟡 권장 작업 (2-3시간)
- [ ] 6. 백엔드 API 연동
- [ ] 7. 파일 업로드 기능 구현
- [ ] 8. 테스트 실행

### 🟢 선택 작업 (추후)
- [ ] 9. 음성 기능 (STT/TTS)
- [ ] 10. 3D 아바타
- [ ] 11. 프로덕션 배포

---

## 🔴 필수 작업 (반드시 수행)

### ✅ 작업 1: 데이터베이스 마이그레이션

**명령어**:
```bash
cd /workspace/service-core
npx prisma migrate dev --name sprint_8_9_enhanced_features
npx prisma generate
```

**목적**: 
- CandidateProfile에 12개 필드 추가
- RecruiterProfile에 4개 필드 추가
- Interview에 4개 필드 추가 (모드, 타이머)
- Evaluation 재설계 (8개 평가 항목)
- Notification 테이블 신규 생성

**확인**:
```bash
npx prisma migrate status
# "Database schema is up to date!" 출력 확인
```

**⚠️ 주의**: 기존 데이터가 있다면 백업 필수!
```bash
pg_dump -U your_user -d flex_recruiter > backup.sql
```

---

### ✅ 작업 2: Python 의존성 설치

**명령어**:
```bash
cd /workspace/service-ai
echo "numpy>=1.24.0" >> requirements.txt
pip install numpy>=1.24.0
```

**목적**: 통계 계산용 NumPy 설치

**확인**:
```bash
python -c "import numpy; print(numpy.__version__)"
# 버전 번호 출력 확인
```

---

### ✅ 작업 3: 환경 변수 확인 및 설정

**확인할 파일 3개**:

#### 3-1. service-ai/.env
```bash
cat /workspace/service-ai/.env
```

**필수 변수**:
```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-5
DATABASE_URL="postgresql://user:password@host:5432/flex_recruiter"
PORT=8000
```

**없으면 생성**:
```bash
cd /workspace/service-ai
cp .env.example .env
nano .env  # 또는 vi .env
```

#### 3-2. service-core/.env
```bash
cat /workspace/service-core/.env
```

**필수 변수**:
```env
PORT=8080
NODE_ENV=development
DATABASE_URL="postgresql://user:password@host:5432/flex_recruiter?schema=public"
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
AI_SERVICE_URL=http://localhost:8000
```

#### 3-3. app-web/.env.local
```bash
cat /workspace/app-web/.env.local
```

**필수 변수**:
```env
NEXT_PUBLIC_CORE_API_URL=http://localhost:8080
NEXT_PUBLIC_SOCKET_URL=http://localhost:8080
```

**없으면 생성**:
```bash
cd /workspace/app-web
echo "NEXT_PUBLIC_CORE_API_URL=http://localhost:8080" > .env.local
echo "NEXT_PUBLIC_SOCKET_URL=http://localhost:8080" >> .env.local
```

---

### ✅ 작업 4: 프론트엔드 빌드 테스트

**명령어**:
```bash
cd /workspace/app-web
npm install
npm run build
```

**성공 시 출력**:
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Creating an optimized production build
✓ Collecting page data
✓ Generating static pages (10/10)
```

**실패 시**:
```bash
# 에러 로그 확인
npm run build 2>&1 | tee build-error.log
cat build-error.log

# 캐시 삭제 후 재시도
rm -rf .next node_modules
npm install
npm run build
```

---

### ✅ 작업 5: 서비스 실행 확인

**3개 터미널 필요** (tmux 또는 screen 권장)

#### 터미널 1: Backend Core
```bash
cd /workspace/service-core
npm run dev
```
**확인**: http://localhost:8080/health
**예상 응답**: `{"status":"ok","timestamp":"...","uptime":...}`

#### 터미널 2: Backend AI
```bash
cd /workspace/service-ai
uvicorn app.main:app --reload --port 8000
```
**확인**: http://localhost:8000/health
**예상 응답**: `{"status":"healthy","service":"AI Engine"}`

#### 터미널 3: Frontend
```bash
cd /workspace/app-web
npm run dev
```
**확인**: http://localhost:3000
**예상 결과**: 새로운 홈 페이지 표시

---

## 🟡 권장 작업 (기능 완성)

### ✅ 작업 6: 백엔드 API 연동

**우선순위 높음** (6개 파일):

#### 6-1. 프로필 저장 API
**파일**: `/workspace/app-web/src/app/profile/candidate/page.tsx`

**현재 코드** (42-49 라인):
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  
  // TODO: API 호출
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  setIsLoading(false);
  alert('프로필이 저장되었습니다!');
};
```

**변경 후**:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  
  try {
    // FormData 수집
    const formData = new FormData(e.target as HTMLFormElement);
    const profileData = {
      name: formData.get('name'),
      education: formData.get('education'),
      experience: parseInt(formData.get('experience') as string),
      desiredPosition: formData.get('desiredPosition'),
      desiredSalary: parseInt(formData.get('desiredSalary') as string),
      bio: formData.get('bio'),
      skills: skills,
      careerHistory: JSON.stringify(careers),
      projects: JSON.stringify(projects),
      githubUrl: formData.get('githubUrl'),
      blogUrl: formData.get('blogUrl'),
      linkedinUrl: formData.get('linkedinUrl'),
      portfolioWebUrl: formData.get('portfolioWebUrl')
    };

    // API 호출
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_CORE_API_URL}/api/v1/candidates/profile`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // 또는 Zustand store
        },
        body: JSON.stringify(profileData)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '저장 실패');
    }

    alert('프로필이 저장되었습니다!');
    // router.push('/dashboard');
  } catch (error) {
    console.error('프로필 저장 오류:', error);
    alert(error instanceof Error ? error.message : '저장 중 오류가 발생했습니다.');
  } finally {
    setIsLoading(false);
  }
};
```

**동일한 방식으로 연동**:
- `/workspace/app-web/src/app/profile/recruiter/page.tsx`

#### 6-2. Socket.IO 인터뷰 연동
**파일**: `/workspace/app-web/src/app/interview/start/page.tsx`

**추가 코드** (컴포넌트 상단):
```typescript
import { io, Socket } from 'socket.io-client';

export default function InterviewPage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  
  // Socket.IO 연결
  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected');
      // 인터뷰 시작
      socketInstance.emit('interview:start', {
        mode: 'ACTUAL',
        timeLimitSeconds: 900,
        isVoiceMode: false
      });
    });

    socketInstance.on('interview:started', (data) => {
      console.log('Interview started:', data);
      // 첫 질문 추가
      const aiMessage: Message = {
        role: 'AI',
        content: data.question,
        timestamp: new Date()
      };
      setMessages([aiMessage]);
    });

    socketInstance.on('interview:question', (data) => {
      const aiMessage: Message = {
        role: 'AI',
        content: data.question,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    });

    socketInstance.on('interview:error', (error) => {
      console.error('Interview error:', error);
      alert(error.message);
      setIsLoading(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // 메시지 전송 수정
  const handleSend = async () => {
    if (!input.trim() || isLoading || !socket) return;

    const userMessage: Message = {
      role: 'CANDIDATE',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Socket.IO로 전송
    socket.emit('interview:message', {
      content: userMessage.content,
      contentType: 'TEXT'
    });
  };
  
  // ... 나머지 코드
}
```

#### 6-3. 평가 결과 조회
**파일**: `/workspace/app-web/src/app/evaluation/[id]/page.tsx`

**추가 코드**:
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function EvaluationPage() {
  const params = useParams();
  const [evaluationData, setEvaluationData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvaluation = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_CORE_API_URL}/api/v1/evaluations/${params.id}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (!response.ok) throw new Error('평가 결과를 불러올 수 없습니다');

        const data = await response.json();
        setEvaluationData(data);
      } catch (error) {
        console.error('평가 조회 오류:', error);
        alert('평가 결과를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvaluation();
  }, [params.id]);

  if (isLoading) {
    return <div>로딩 중...</div>; // 스켈레톤 사용
  }

  // ... 나머지 코드
}
```

#### 6-4. 알림 API
**파일**: `/workspace/app-web/src/components/layout/NotificationPanel.tsx`

**추가 코드**:
```typescript
useEffect(() => {
  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_CORE_API_URL}/api/v1/notifications`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) throw new Error('알림 조회 실패');

      const data = await response.json();
      setNotifications(data.notifications);
    } catch (error) {
      console.error('알림 조회 오류:', error);
    }
  };

  fetchNotifications();
}, []);
```

#### 6-5. 검색 API
**파일**: `/workspace/app-web/src/app/search/page.tsx`

**handleSearch 함수 수정**:
```typescript
const handleSearch = async () => {
  if (!searchTerm.trim()) return;

  setIsLoading(true);
  
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_CORE_API_URL}/api/v1/search?q=${encodeURIComponent(searchTerm)}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    if (!response.ok) throw new Error('검색 실패');

    const data = await response.json();
    setResults(data.results);
  } catch (error) {
    console.error('검색 오류:', error);
    alert('검색 중 오류가 발생했습니다.');
  } finally {
    setIsLoading(false);
  }
};
```

#### 6-6. 대시보드 데이터
**파일**: `/workspace/app-web/src/app/dashboard/recruiter/page.tsx`

**추가 코드**:
```typescript
useEffect(() => {
  const fetchDashboardData = async () => {
    try {
      const [applicantsRes, statsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_CORE_API_URL}/api/v1/recruiters/applicants`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_CORE_API_URL}/api/v1/recruiters/stats`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      const applicantsData = await applicantsRes.json();
      const statsData = await statsRes.json();

      setApplicants(applicantsData.applicants);
      setStats(statsData);
    } catch (error) {
      console.error('대시보드 데이터 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  fetchDashboardData();
}, []);
```

---

### ✅ 작업 7: 백엔드 API 엔드포인트 구현

**현재 미구현된 엔드포인트**:

#### 7-1. 프로필 API (service-core)

**생성할 파일**: `/workspace/service-core/src/controllers/profileController.ts`

```typescript
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 구직자 프로필 수정
export const updateCandidateProfile = async (req: Request, res: Response) => {
  try {
    const { candidateId } = req.params;
    const userId = req.user?.id; // JWT에서 추출

    // 권한 확인
    const profile = await prisma.candidateProfile.findUnique({
      where: { id: candidateId }
    });

    if (!profile || profile.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // 프로필 업데이트
    const updated = await prisma.candidateProfile.update({
      where: { id: candidateId },
      data: {
        ...req.body,
        updatedAt: new Date()
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 채용담당자 프로필 수정
export const updateRecruiterProfile = async (req: Request, res: Response) => {
  try {
    const { recruiterId } = req.params;
    const userId = req.user?.id;

    const profile = await prisma.recruiterProfile.findUnique({
      where: { id: recruiterId }
    });

    if (!profile || profile.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updated = await prisma.recruiterProfile.update({
      where: { id: recruiterId },
      data: {
        ...req.body,
        updatedAt: new Date()
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

**라우터 추가**: `/workspace/service-core/src/routes/profile.ts`

```typescript
import { Router } from 'express';
import { updateCandidateProfile, updateRecruiterProfile } from '../controllers/profileController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.put('/candidates/:candidateId/profile', authenticate, updateCandidateProfile);
router.put('/recruiters/:recruiterId/profile', authenticate, updateRecruiterProfile);

export default router;
```

#### 7-2. 알림 API (service-core)

**생성할 파일**: `/workspace/service-core/src/controllers/notificationController.ts`

```typescript
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 알림 목록 조회
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { limit = 20, offset = 0, unreadOnly = false } = req.query;

    const where: any = { userId };
    if (unreadOnly === 'true') {
      where.isRead = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string)
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, isRead: false } })
    ]);

    res.json({ notifications, total, unreadCount });
  } catch (error) {
    console.error('Notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 알림 읽음 처리
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user?.id;

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });

    if (!notification || notification.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 모두 읽음 처리
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 알림 삭제
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user?.id;

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });

    if (!notification || notification.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await prisma.notification.delete({
      where: { id: notificationId }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

#### 7-3. 검색 API (service-core)

**생성할 파일**: `/workspace/service-core/src/controllers/searchController.ts`

```typescript
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const search = async (req: Request, res: Response) => {
  try {
    const { q, type = 'all', limit = 20, offset = 0 } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query required' });
    }

    const searchTerm = q.toLowerCase();
    const results: any[] = [];
    const counts = { candidate: 0, job: 0, company: 0 };

    // 구직자 검색
    if (type === 'all' || type === 'candidate') {
      const candidates = await prisma.candidateProfile.findMany({
        where: {
          OR: [
            { user: { name: { contains: searchTerm, mode: 'insensitive' } } },
            { desiredPosition: { contains: searchTerm, mode: 'insensitive' } },
            { skills: { hasSome: [searchTerm] } }
          ]
        },
        include: { user: true },
        take: type === 'candidate' ? parseInt(limit as string) : 10
      });

      counts.candidate = candidates.length;

      results.push(...candidates.map(c => ({
        type: 'candidate',
        id: c.id,
        title: c.user.name,
        subtitle: `${c.desiredPosition} · ${c.experience}년 경력`,
        description: c.bio || '프로필 작성 중',
        tags: c.skills
      })));
    }

    // 채용 공고 검색
    if (type === 'all' || type === 'job') {
      const jobs = await prisma.jobPosting.findMany({
        where: {
          AND: [
            { status: 'ACTIVE' },
            {
              OR: [
                { title: { contains: searchTerm, mode: 'insensitive' } },
                { position: { contains: searchTerm, mode: 'insensitive' } },
                { requirements: { hasSome: [searchTerm] } }
              ]
            }
          ]
        },
        include: { recruiter: true },
        take: type === 'job' ? parseInt(limit as string) : 10
      });

      counts.job = jobs.length;

      results.push(...jobs.map(j => ({
        type: 'job',
        id: j.id,
        title: j.title,
        subtitle: j.recruiter.companyName,
        description: j.description.substring(0, 200),
        tags: [...j.requirements, ...j.preferredSkills].slice(0, 5)
      })));
    }

    // 회사 검색
    if (type === 'all' || type === 'company') {
      const companies = await prisma.recruiterProfile.findMany({
        where: {
          companyName: { contains: searchTerm, mode: 'insensitive' }
        },
        take: type === 'company' ? parseInt(limit as string) : 10
      });

      counts.company = companies.length;

      results.push(...companies.map(c => ({
        type: 'company',
        id: c.id,
        title: c.companyName,
        subtitle: c.position,
        description: c.companyDescription || '회사 소개 작성 중',
        tags: []
      })));
    }

    res.json({
      results,
      total: results.length,
      counts
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

#### 7-4. 향상된 평가 API (service-ai)

**생성할 파일**: `/workspace/service-ai/app/api/enhanced_evaluation.py`

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict
from app.services.enhanced_evaluation import generate_complete_evaluation_enhanced

router = APIRouter()

class EvaluationRequest(BaseModel):
    conversation_history: List[Dict]
    candidate_profile: Dict = None

@router.post("/internal/ai/evaluate-enhanced")
async def evaluate_enhanced(request: EvaluationRequest):
    """향상된 평가 생성"""
    try:
        result = generate_complete_evaluation_enhanced(
            conversation_history=request.conversation_history,
            candidate_profile=request.candidate_profile
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

**main.py에 추가**:
```python
# /workspace/service-ai/app/main.py
from app.api.enhanced_evaluation import router as enhanced_eval_router

app.include_router(enhanced_eval_router, tags=["Enhanced Evaluation"])
```

---

### ✅ 작업 8: 파일 업로드 구현

#### 8-1. GCP Cloud Storage 버킷 생성

**GCP Console 방법**:
1. https://console.cloud.google.com/storage 접속
2. "버킷 만들기" 클릭
3. 설정:
   ```
   이름: flex-recruiter-files
   위치 유형: Region
   위치: asia-northeast3 (서울)
   스토리지 클래스: Standard
   공개 액세스: 균일한 액세스 제어
   ```
4. "만들기" 클릭

**CLI 방법**:
```bash
gsutil mb -p YOUR_PROJECT_ID -c STANDARD -l asia-northeast3 gs://flex-recruiter-files/
```

#### 8-2. CORS 설정
```bash
# cors.json 파일 생성
cat > /tmp/cors.json << 'EOF'
[
  {
    "origin": ["http://localhost:3000", "https://yourdomain.com"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
EOF

# CORS 적용
gsutil cors set /tmp/cors.json gs://flex-recruiter-files
```

#### 8-3. 서비스 계정 권한
```bash
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"
```

#### 8-4. 업로드 라이브러리 설치
```bash
cd /workspace/service-core
npm install multer @google-cloud/storage
```

#### 8-5. 업로드 라우터 생성

**파일**: `/workspace/service-core/src/routes/upload.ts`

**내용**: `/workspace/docs/USER_ACTION_GUIDE.md` Step 7.4 참고 (코드 복사)

#### 8-6. 라우터 등록

**파일**: `/workspace/service-core/src/index.ts`

```typescript
import uploadRouter from './routes/upload';

app.use('/api/v1', uploadRouter);
```

#### 8-7. 환경 변수 추가
```bash
cd /workspace/service-core
nano .env
```

**추가**:
```env
GCP_PROJECT_ID=your-gcp-project-id
GCP_STORAGE_BUCKET=flex-recruiter-files
GCP_SERVICE_ACCOUNT_KEY=/path/to/service-account-key.json
```

---

### ✅ 작업 9: 테스트 실행

#### 9-1. 백엔드 테스트
```bash
# Core API
cd /workspace/service-core
npm test

# AI Service
cd /workspace/service-ai
pytest
```

#### 9-2. 프론트엔드 테스트
```bash
cd /workspace/app-web
npm test
```

#### 9-3. E2E 테스트
```bash
cd /workspace/app-web
npx playwright test
```

---

## 🟢 선택 작업 (추후 진행)

### [ ] 10. 음성 기능 (STT/TTS)

#### 10-1. Whisper 설치
```bash
cd /workspace/service-ai
pip install openai-whisper
```

#### 10-2. TTS 서비스 생성
**파일**: `/workspace/service-ai/app/services/tts_service.py`

```python
from openai import OpenAI
import os

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def text_to_speech(text: str) -> bytes:
    """텍스트를 음성으로 변환"""
    response = client.audio.speech.create(
        model="tts-1",
        voice="alloy",  # alloy, echo, fable, onyx, nova, shimmer
        input=text
    )
    return response.content
```

#### 10-3. STT 서비스 생성
**파일**: `/workspace/service-ai/app/services/stt_service.py`

```python
from openai import OpenAI
import os

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def speech_to_text(audio_file_path: str) -> str:
    """음성을 텍스트로 변환"""
    with open(audio_file_path, 'rb') as audio_file:
        transcript = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            language="ko"
        )
    return transcript.text
```

---

### [ ] 11. 3D 아바타

#### 11-1. Ready Player Me 설치
```bash
cd /workspace/app-web
npm install @readyplayerme/rpm-react
```

#### 11-2. 아바타 컴포넌트 생성
**파일**: `/workspace/app-web/src/components/interview/Avatar3D.tsx`

```typescript
import { Avatar } from '@readyplayerme/rpm-react';

export default function Avatar3D() {
  return (
    <Avatar
      modelSrc="https://models.readyplayer.me/YOUR_AVATAR_ID.glb"
      animationSrc="idle"
      style={{ width: '100%', height: '400px' }}
    />
  );
}
```

**간단한 대안**: react-avatar
```bash
npm install react-avatar
```

---

### [ ] 12. 프로덕션 배포

#### 12-1. 프론트엔드 (Vercel)
```bash
npm i -g vercel
cd /workspace/app-web
vercel --prod
```

**환경 변수 설정** (Vercel Dashboard):
```
NEXT_PUBLIC_CORE_API_URL=https://service-core-staging-...run.app
NEXT_PUBLIC_SOCKET_URL=https://service-core-staging-...run.app
```

#### 12-2. 백엔드 (GCP Cloud Run)
```bash
# service-core 재배포
cd /workspace/service-core
gcloud run deploy service-core \
  --source . \
  --region asia-northeast3 \
  --allow-unauthenticated

# service-ai 재배포
cd /workspace/service-ai
gcloud run deploy service-ai \
  --source . \
  --region asia-northeast3 \
  --allow-unauthenticated
```

---

## 📝 요약: 지금 바로 실행할 명령어

```bash
# 1. 데이터베이스 마이그레이션
cd /workspace/service-core && npx prisma migrate dev --name sprint_8_9_enhanced_features && npx prisma generate

# 2. Python 의존성
cd /workspace/service-ai && echo "numpy>=1.24.0" >> requirements.txt && pip install numpy>=1.24.0

# 3. 프론트엔드 빌드
cd /workspace/app-web && npm install && npm run build

# 4. 서비스 실행 (3개 터미널에서)
# 터미널 1:
cd /workspace/service-core && npm run dev

# 터미널 2:
cd /workspace/service-ai && uvicorn app.main:app --reload --port 8000

# 터미널 3:
cd /workspace/app-web && npm run dev
```

---

## ⚠️ 중요 사항

1. **데이터베이스 백업**: 마이그레이션 전 백업 필수
2. **API 연동**: 프론트엔드 6개 파일의 TODO 주석 교체
3. **백엔드 API**: 7개 엔드포인트 구현 필요
4. **환경 변수**: 3개 파일 (.env) 확인

---

**문제 발생 시**: `/workspace/docs/USER_ACTION_GUIDE.md` 참고
**API 상세**: `/workspace/docs/API.md` 참고
**전체 리포트**: `/workspace/SPRINT_8_9_REPORT.md` 참고

