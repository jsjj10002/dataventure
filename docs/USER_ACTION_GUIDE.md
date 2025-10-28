# 사용자 필수 작업 가이드

> **작성일**: 2025-10-28  
> **대상**: Project Owner  
> **목적**: Sprint 8-9 완료 후 사용자가 직접 수행해야 하는 모든 작업을 단계별로 안내

---

## 📋 목차

1. [작업 개요](#1-작업-개요)
2. [필수 작업 (순서대로 진행)](#2-필수-작업-순서대로-진행)
3. [선택 작업](#3-선택-작업)
4. [검증 방법](#4-검증-방법)
5. [문제 해결](#5-문제-해결)

---

## 1. 작업 개요

Sprint 8-9에서 다음이 완료되었습니다:
- ✅ 프론트엔드 전체 페이지 구현
- ✅ 백엔드 평가/질문 시스템 고도화
- ✅ 데이터베이스 스키마 확장

이제 **사용자가 직접 수행**해야 하는 작업:
- 🔧 데이터베이스 마이그레이션
- 🔧 의존성 설치
- 🔧 환경 변수 설정
- 🔧 백엔드-프론트엔드 API 연동
- 🔧 파일 업로드 설정
- 🔧 빌드 및 테스트

**예상 소요 시간**: 2-3시간

---

## 2. 필수 작업 (순서대로 진행)

### ✅ Step 1: 데이터베이스 마이그레이션

**목적**: 확장된 스키마를 데이터베이스에 반영

#### 1.1 마이그레이션 실행
```bash
cd /workspace/service-core

# 마이그레이션 생성 및 적용
npx prisma migrate dev --name sprint_8_9_enhanced_features

# Prisma Client 재생성
npx prisma generate
```

#### 1.2 마이그레이션 확인
```bash
# 마이그레이션이 성공했는지 확인
npx prisma migrate status

# 데이터베이스 스키마 확인
npx prisma db pull
```

#### 1.3 예상 변경 사항
- `candidate_profiles` 테이블에 12개 컬럼 추가
  - `profileImageUrl`, `portfolioUrl`, `bio`, `careerHistory`, `projects`
  - `githubUrl`, `blogUrl`, `linkedinUrl`, `portfolioWebUrl`
  - `uniqueUrl`
  
- `recruiter_profiles` 테이블에 4개 컬럼 추가
  - `companyLogo`, `companyDescription`, `companyVision`, `uniqueUrl`
  
- `interviews` 테이블에 4개 컬럼 추가
  - `mode`, `timeLimitSeconds`, `isVoiceMode`, `elapsedSeconds`
  
- `evaluations` 테이블 재설계 (11개 컬럼 추가)
  - 의사소통능력: `deliveryScore`, `vocabularyScore`, `comprehensionScore`, `communicationAvg`
  - 직무역량: `informationAnalysis`, `problemSolving`, `flexibleThinking`, `negotiation`, `itSkills`
  - 기타: `recommendedPositions` (기존 필드 이름 변경 가능)
  
- `notifications` 테이블 신규 생성
  - `id`, `userId`, `type`, `title`, `message`, `link`, `isRead`, `createdAt`

**⚠️ 주의**: 기존 데이터가 있다면 백업 필수!
```bash
# PostgreSQL 백업 (실행 전 확인)
pg_dump -U your_user -d flex_recruiter > backup_before_sprint8_9.sql
```

---

### ✅ Step 2: Python 의존성 설치

**목적**: service-ai에 NumPy 추가

#### 2.1 requirements.txt 업데이트
```bash
cd /workspace/service-ai

# NumPy 추가
echo "numpy>=1.24.0" >> requirements.txt
```

#### 2.2 의존성 설치
```bash
pip install -r requirements.txt

# 또는 직접 설치
pip install numpy>=1.24.0
```

#### 2.3 설치 확인
```bash
python -c "import numpy; print(f'NumPy version: {numpy.__version__}')"
# 출력 예: NumPy version: 1.24.3
```

---

### ✅ Step 3: 환경 변수 설정

**목적**: 새로운 기능에 필요한 환경 변수 추가

#### 3.1 service-ai/.env 확인
```bash
cd /workspace/service-ai
cat .env
```

**필수 변수**:
```env
# 기존 변수 (확인)
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-5
DATABASE_URL="postgresql://user:password@host:5432/flex_recruiter"
PORT=8000

# 새로 추가 (선택)
EMBEDDING_MODEL=jhgan/ko-sbert-nli
```

#### 3.2 service-core/.env 확인
```bash
cd /workspace/service-core
cat .env
```

**필수 변수**:
```env
# 기존 변수 (확인)
PORT=8080
NODE_ENV=development
DATABASE_URL="postgresql://user:password@host:5432/flex_recruiter?schema=public"
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
AI_SERVICE_URL=http://localhost:8000

# 파일 업로드용 (나중에 추가 예정)
GCP_PROJECT_ID=your-gcp-project-id
GCP_STORAGE_BUCKET=flex-recruiter-files
```

#### 3.3 app-web/.env.local 확인
```bash
cd /workspace/app-web
cat .env.local
```

**필수 변수**:
```env
NEXT_PUBLIC_CORE_API_URL=http://localhost:8080
NEXT_PUBLIC_SOCKET_URL=http://localhost:8080
```

---

### ✅ Step 4: 프론트엔드 빌드 테스트

**목적**: 새로운 페이지들이 정상적으로 빌드되는지 확인

#### 4.1 의존성 설치 확인
```bash
cd /workspace/app-web

# 누락된 패키지가 있는지 확인
npm install
```

#### 4.2 빌드 실행
```bash
npm run build
```

**예상 출력**:
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Creating an optimized production build
✓ Collecting page data
✓ Generating static pages (8/8)
✓ Finalizing page optimization

Route (app)                              Size
┌ ○ /                                    5.2 kB
├ ○ /auth/login                          3.1 kB
├ ○ /auth/register                       3.2 kB
├ ○ /dashboard/recruiter                 12.4 kB
├ ○ /evaluation/[id]                     18.7 kB
├ ○ /interview/setup                     8.9 kB
├ ○ /interview/start                     15.2 kB
├ ○ /profile/candidate                   14.3 kB
├ ○ /profile/recruiter                   9.1 kB
└ ○ /search                              10.8 kB
```

#### 4.3 에러 발생 시
**일반적인 에러**:
1. **Module not found**: `npm install` 다시 실행
2. **Type errors**: `npm run lint` 실행 후 확인
3. **Build failed**: 로그 확인 후 해당 파일 수정

**에러 로그 확인**:
```bash
# 상세 로그 출력
npm run build 2>&1 | tee build.log
cat build.log
```

---

### ✅ Step 5: 개발 서버 실행 테스트

**목적**: 모든 서비스가 정상적으로 실행되는지 확인

#### 5.1 service-core 실행
```bash
cd /workspace/service-core

# 개발 모드 실행
npm run dev

# 또는 production 모드
npm run build
npm run start
```

**확인 URL**: http://localhost:8080/health
**예상 응답**:
```json
{
  "status": "ok",
  "timestamp": "2025-10-28T...",
  "uptime": 123
}
```

#### 5.2 service-ai 실행
```bash
cd /workspace/service-ai

# 개발 모드 실행
uvicorn app.main:app --reload --port 8000

# 또는
python -m app.main
```

**확인 URL**: http://localhost:8000/health
**예상 응답**:
```json
{
  "status": "healthy",
  "service": "AI Engine"
}
```

#### 5.3 app-web 실행
```bash
cd /workspace/app-web

# 개발 모드 실행
npm run dev
```

**확인 URL**: http://localhost:3000
**예상 결과**: 새로운 홈 페이지가 표시됨

---

### ✅ Step 6: 백엔드 API 연동 (중요!)

**목적**: 프론트엔드의 TODO 주석을 실제 API 호출로 교체

#### 6.1 연동이 필요한 파일 목록

**우선순위 높음** (핵심 기능):
1. `/workspace/app-web/src/app/profile/candidate/page.tsx`
   - `handleSubmit`: 프로필 저장 API
   - 파일 업로드 API

2. `/workspace/app-web/src/app/profile/recruiter/page.tsx`
   - `handleSubmit`: 회사 정보 저장 API
   - 파일 업로드 API

3. `/workspace/app-web/src/app/interview/start/page.tsx`
   - `handleSend`: 메시지 전송 API
   - Socket.IO 실시간 통신

4. `/workspace/app-web/src/app/evaluation/[id]/page.tsx`
   - 평가 결과 조회 API

5. `/workspace/app-web/src/app/dashboard/recruiter/page.tsx`
   - 지원자 목록 조회 API
   - 통계 데이터 조회 API

6. `/workspace/app-web/src/app/search/page.tsx`
   - 통합 검색 API

**우선순위 중간**:
7. `/workspace/app-web/src/components/layout/NotificationPanel.tsx`
   - 알림 목록 조회 API
   - 알림 읽음/삭제 API

#### 6.2 API 연동 예시

**예시 1: 프로필 저장**

현재 코드 (TODO):
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

변경 후:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_CORE_API_URL}/api/v1/candidates/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Zustand store에서 가져오기
      },
      body: JSON.stringify({
        name: formData.name,
        education: formData.education,
        skills: skills,
        experience: formData.experience,
        // ... 나머지 필드
      })
    });
    
    if (!response.ok) throw new Error('저장 실패');
    
    alert('프로필이 저장되었습니다!');
  } catch (error) {
    console.error('프로필 저장 오류:', error);
    alert('저장 중 오류가 발생했습니다.');
  } finally {
    setIsLoading(false);
  }
};
```

**예시 2: Socket.IO 연동**

인터뷰 페이지에 추가:
```typescript
import { io } from 'socket.io-client';

// 컴포넌트 내부
useEffect(() => {
  const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);
  
  socket.on('connect', () => {
    console.log('Socket connected');
  });
  
  socket.on('interview:question', (data) => {
    const aiMessage: Message = {
      role: 'AI',
      content: data.question,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, aiMessage]);
  });
  
  return () => {
    socket.disconnect();
  };
}, []);
```

#### 6.3 연동 작업 순서

1. **인증 상태 관리 구현**
   ```bash
   # Zustand store 업데이트
   # /workspace/app-web/src/stores/auth-store.ts
   ```

2. **API 클라이언트 함수 작성**
   ```bash
   # /workspace/app-web/src/lib/api-client.ts 업데이트
   ```

3. **각 페이지별 API 연동**
   - 프로필 페이지 → 인터뷰 → 평가 → 대시보드 순서

4. **에러 처리 및 로딩 상태 추가**

---

### ✅ Step 7: 파일 업로드 설정 (GCP Cloud Storage)

**목적**: 프로필 이미지, 이력서, 포트폴리오 업로드 기능 활성화

#### 7.1 GCP Cloud Storage 버킷 생성

1. **GCP Console 접속**
   - https://console.cloud.google.com/storage

2. **버킷 생성**
   ```
   버킷 이름: flex-recruiter-files
   위치 유형: Region
   위치: asia-northeast3 (서울)
   스토리지 클래스: Standard
   액세스 제어: Uniform (균일한 액세스 제어)
   ```

3. **CORS 설정**
   ```json
   [
     {
       "origin": ["http://localhost:3000", "https://yourdomain.com"],
       "method": ["GET", "POST", "PUT", "DELETE"],
       "responseHeader": ["Content-Type"],
       "maxAgeSeconds": 3600
     }
   ]
   ```

#### 7.2 서비스 계정 권한 설정

```bash
# service-core용 서비스 계정에 권한 추가
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:service-core@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"
```

#### 7.3 환경 변수 업데이트

**service-core/.env**:
```env
GCP_PROJECT_ID=your-gcp-project-id
GCP_STORAGE_BUCKET=flex-recruiter-files
GCP_SERVICE_ACCOUNT_KEY=/path/to/service-account-key.json
```

#### 7.4 파일 업로드 API 구현

**service-core에 추가**:
```bash
cd /workspace/service-core

# Multer와 GCP Storage 라이브러리 설치
npm install multer @google-cloud/storage
```

**파일 업로드 라우터 생성**:
```typescript
// /workspace/service-core/src/routes/upload.ts
import { Router } from 'express';
import multer from 'multer';
import { Storage } from '@google-cloud/storage';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: process.env.GCP_SERVICE_ACCOUNT_KEY
});
const bucket = storage.bucket(process.env.GCP_STORAGE_BUCKET!);

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const blob = bucket.file(`uploads/${Date.now()}_${req.file.originalname}`);
    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType: req.file.mimetype
      }
    });

    blobStream.on('error', (err) => {
      console.error('Upload error:', err);
      res.status(500).json({ error: 'Upload failed' });
    });

    blobStream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      res.json({ url: publicUrl });
    });

    blobStream.end(req.file.buffer);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;
```

#### 7.5 프론트엔드 파일 업로드 구현

```typescript
// 프로필 페이지에서 사용
const handleFileUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${process.env.NEXT_PUBLIC_CORE_API_URL}/api/v1/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const data = await response.json();
  return data.url; // GCS URL 반환
};
```

---

### ✅ Step 8: 테스트 실행

**목적**: 모든 기능이 정상 작동하는지 확인

#### 8.1 백엔드 테스트
```bash
cd /workspace/service-core
npm test

cd /workspace/service-ai
pytest
```

#### 8.2 프론트엔드 테스트
```bash
cd /workspace/app-web
npm test
```

#### 8.3 E2E 테스트
```bash
cd /workspace/app-web
npx playwright test
```

---

## 3. 선택 작업

### 🔸 Option 1: 음성 기능 구현

**OpenAI Whisper (STT) 설정**:
```bash
cd /workspace/service-ai
pip install openai-whisper
```

**OpenAI TTS 설정**:
```python
# /workspace/service-ai/app/services/tts_service.py
from openai import OpenAI
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def text_to_speech(text: str) -> bytes:
    response = client.audio.speech.create(
        model="tts-1",
        voice="alloy",
        input=text
    )
    return response.content
```

---

### 🔸 Option 2: 3D 아바타 통합

**Ready Player Me API**:
```bash
npm install @readyplayerme/rpm-react
```

또는 **간단한 2D 아바타** 사용:
```bash
npm install react-avatar
```

---

### 🔸 Option 3: 프로덕션 배포

#### 프론트엔드 (Vercel)
```bash
# Vercel CLI 설치
npm i -g vercel

cd /workspace/app-web
vercel --prod
```

#### 백엔드 (GCP Cloud Run)
```bash
# service-core 배포
gcloud run deploy service-core \
  --source . \
  --region asia-northeast3 \
  --allow-unauthenticated

# service-ai 배포
gcloud run deploy service-ai \
  --source . \
  --region asia-northeast3 \
  --allow-unauthenticated
```

---

## 4. 검증 방법

### ✅ 체크리스트

#### 데이터베이스
- [ ] 마이그레이션 성공
- [ ] 모든 테이블 생성 확인
- [ ] 인덱스 생성 확인

#### 백엔드
- [ ] service-core 정상 실행
- [ ] service-ai 정상 실행
- [ ] Health check 응답 확인

#### 프론트엔드
- [ ] 빌드 성공
- [ ] 개발 서버 실행
- [ ] 모든 페이지 로드 확인

#### 기능 테스트
- [ ] 회원가입/로그인
- [ ] 프로필 작성
- [ ] AI 인터뷰 진행
- [ ] 평가 결과 확인
- [ ] 검색 기능

---

## 5. 문제 해결

### 🔧 일반적인 문제

#### 문제 1: 마이그레이션 실패
```
Error: P3005: The database schema is not empty.
```

**해결**:
```bash
# 기존 마이그레이션 초기화
npx prisma migrate reset

# 또는 강제 적용
npx prisma db push --accept-data-loss
```

#### 문제 2: 빌드 에러 (Type errors)
```
Type 'X' is not assignable to type 'Y'
```

**해결**:
```bash
# 타입 확인
npm run lint

# TypeScript 재컴파일
rm -rf .next
npm run build
```

#### 문제 3: API 연결 실패 (CORS)
```
Access to fetch blocked by CORS policy
```

**해결** (service-core):
```typescript
// /workspace/service-core/src/index.ts
import cors from 'cors';

app.use(cors({
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
  credentials: true
}));
```

#### 문제 4: Socket.IO 연결 실패
```
WebSocket connection failed
```

**해결**:
```typescript
// Socket.IO 서버 설정 확인
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true
  }
});
```

---

## 📞 도움이 필요하면

1. **로그 확인**
   ```bash
   # service-core 로그
   cd /workspace/service-core
   npm run dev 2>&1 | tee logs/service-core.log
   
   # service-ai 로그
   cd /workspace/service-ai
   uvicorn app.main:app --log-level debug
   ```

2. **문제 보고**
   - 에러 메시지 전체 복사
   - 재현 단계 기록
   - 환경 정보 (OS, Node 버전, Python 버전)

---

## 📊 진행 상황 추적

### 작업 체크리스트

- [ ] **Step 1**: 데이터베이스 마이그레이션
- [ ] **Step 2**: Python 의존성 설치
- [ ] **Step 3**: 환경 변수 설정
- [ ] **Step 4**: 프론트엔드 빌드 테스트
- [ ] **Step 5**: 개발 서버 실행 테스트
- [ ] **Step 6**: 백엔드 API 연동
- [ ] **Step 7**: 파일 업로드 설정
- [ ] **Step 8**: 테스트 실행

### 선택 작업
- [ ] 음성 기능 구현
- [ ] 3D 아바타 통합
- [ ] 프로덕션 배포

---

**작업 완료 후**: 이 문서를 체크하며 모든 항목을 확인하세요! ✅

