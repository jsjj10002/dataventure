# PROJECT BLUEPRINT - flex-AI-Recruiter
> 살아있는 설계도 (Living Blueprint)  
> 최종 업데이트: 2025-10-27

## 목차
- [1. 프로젝트 개요](#1-프로젝트-개요)
- [2. 시스템 아키텍처](#2-시스템-아키텍처)
- [3. 기술 스택](#3-기술-스택)
- [4. 폴더 구조](#4-폴더-구조)
- [5. 데이터베이스 스키마](#5-데이터베이스-스키마)
- [6. API 명세서](#6-api-명세서)
- [7. AI 엔진 명세서](#7-ai-엔진-명세서)
- [8. 환경 변수](#8-환경-변수)
- [9. 배포 전략](#9-배포-전략)
- [10. 개발 로드맵](#10-개발-로드맵)

---

## 1. 프로젝트 개요

### 1.1 제품 정보
- **제품명:** flex-AI-Recruiter
- **목표:** 기존 채용 시장의 비효율성을 해결하는 대화형 AI 채용 매칭 플랫폼
- **핵심 가치:** 자연스러운 AI 인터뷰를 통한 객관적이고 전문적인 평가 및 매칭

### 1.2 핵심 기능
1. **Interface (대화형 UI):** Eva와 같이 자연스럽고 최고 디자인의 대화형 AI 인터뷰어
2. **Engine (AI 엔진):** 실시간 맞춤형 질문 생성 및 답변 분석 (꼬리 질문 포함)
3. **Feedback (평가 시스템):** ★ 객관적, 전문적, 깊이있는 통계 분석에 의거한 평가체계
4. **Matching (매칭 알고리즘):** 구직자-기업 간 AI 매칭 (추천 근거 제시)

---

## 2. 시스템 아키텍처

### 2.1 마이크로서비스 아키텍처 (MSA)

```
┌─────────────────────────────────────────────────────────────┐
│                         Client                              │
│                  (Next.js + React)                          │
│              app-web (Port: 3000)                           │
└─────────────┬───────────────────────────────────────────────┘
              │
              │ HTTP/REST + WebSocket
              │
┌─────────────┴───────────────────────────────────────────────┐
│                   API Gateway Layer                         │
└─────────────┬───────────────────────────┬───────────────────┘
              │                           │
              │                           │
┌─────────────▼──────────┐   ┌───────────▼──────────────────┐
│  Service 1: Core API   │   │  Service 2: AI Engine        │
│  (Node.js + Express)   │   │  (Python + FastAPI)          │
│  service-core          │   │  service-ai                  │
│  Port: 8080            │   │  Port: 8000                  │
│                        │   │                              │
│  - 사용자 인증         │   │  - LLM 질문 생성             │
│  - 채용 공고 관리      │   │  - 답변 분석                 │
│  - 프로필 관리         │   │  - 평가 및 피드백            │
│  - Socket.IO (채팅)    │   │  - 임베딩 생성               │
│  - 매칭 중개           │   │  - 매칭 알고리즘             │
└────────────┬───────────┘   └───────────┬──────────────────┘
             │                           │
             └───────────┬───────────────┘
                         │
              ┌──────────▼──────────┐
              │   PostgreSQL        │
              │   + pgvector        │
              │   (AWS RDS / GCP)   │
              └─────────────────────┘
```

### 2.2 서비스 역할 분리
- **app-web:** 사용자 인터페이스, SSR/SSG, SEO 최적화
- **service-core:** I/O 집약적 작업 (인증, CRUD, 실시간 채팅)
- **service-ai:** 연산 집약적 AI 작업 (LLM API 호출, 임베딩, 평가 분석)

---

## 3. 기술 스택

### 3.1 Frontend (app-web)
| 카테고리 | 기술 | 버전 | 선택 이유 |
|---------|------|------|----------|
| 프레임워크 | Next.js | 14.x | SSR/SSG, 최적화된 React 프레임워크 |
| UI 라이브러리 | React | 18.x | 강력한 생태계, 컴포넌트 기반 |
| 스타일링 | Tailwind CSS | 3.x | Utility-First, 빠른 개발 속도 |
| 상태 관리 | Zustand | 4.x | 단순하고 강력한 전역 상태 관리 |
| 서버 상태 | TanStack Query | 5.x | 서버 데이터 페칭, 캐싱, 동기화 |
| 타입 시스템 | TypeScript | 5.x | 타입 안정성 |
| 실시간 통신 | Socket.IO Client | 4.x | WebSocket 통신 |

### 3.2 Backend - Service 1: Core API (service-core)
| 카테고리 | 기술 | 버전 | 선택 이유 |
|---------|------|------|----------|
| 런타임 | Node.js | 20.x LTS | I/O 집약적 작업에 최적화 |
| 프레임워크 | Express | 4.x | 검증된 웹 프레임워크 |
| 타입 시스템 | TypeScript | 5.x | 타입 안정성 |
| ORM | Prisma | 5.x | 타입스크립트 기반 차세대 ORM |
| 인증 | JWT + bcrypt | - | 표준 토큰 기반 인증 |
| 실시간 통신 | Socket.IO | 4.x | 양방향 실시간 채팅 |
| 환경 변수 | dotenv | - | .env 파일 로딩 |

### 3.3 Backend - Service 2: AI Engine (service-ai)
| 카테고리 | 기술 | 버전 | 선택 이유 |
|---------|------|------|----------|
| 언어 | Python | 3.11+ | AI/ML 생태계의 표준 |
| 프레임워크 | FastAPI | 0.104+ | 비동기 처리, 자동 문서화 |
| LLM | OpenAI API | GPT-4 | 자연스러운 대화, 질문 생성 |
| STT/TTS | OpenAI Whisper/TTS | - | 음성 인터뷰 |
| 임베딩 | Sentence-Transformers | - | ko-sbert-nli (한국어 특화) |
| 벡터 연산 | NumPy | - | 임베딩 유사도 계산 |
| HTTP 클라이언트 | httpx | - | 비동기 HTTP 호출 |
| 환경 변수 | python-dotenv | - | .env 파일 로딩 |

### 3.4 Database
| 카테고리 | 기술 | 선택 이유 |
|---------|------|----------|
| RDBMS | PostgreSQL 15+ | 안정적인 관계형 DB |
| 벡터 검색 | pgvector 확장 | PostgreSQL 내 벡터 저장/검색 |
| 호스팅 | AWS RDS / GCP Cloud SQL | 관리형 데이터베이스 서비스 |

### 3.5 Infrastructure & DevOps
| 카테고리 | 기술 | 선택 이유 |
|---------|------|----------|
| 클라우드 | GCP | Cloud Run, GKE, Cloud SQL |
| 컨테이너 | Docker | 서비스별 컨테이너화 |
| CI/CD | GitHub Actions | 자동 테스트 및 배포 |
| 버전 관리 | Git (Git-flow) | feature/develop/main 브랜치 전략 |

### 3.6 Testing
| 카테고리 | 기술 | 대상 |
|---------|------|------|
| Frontend | Jest + React Testing Library | app-web |
| Backend (Node) | Jest | service-core |
| Backend (Python) | Pytest | service-ai |

---

## 4. 폴더 구조

```
flex-AI-Recruiter/
├── app-web/                      # Frontend (Next.js)
│   ├── public/                   # 정적 파일
│   ├── src/
│   │   ├── app/                  # Next.js 14 App Router
│   │   ├── components/           # React 컴포넌트
│   │   ├── hooks/                # Custom Hooks
│   │   ├── stores/               # Zustand 스토어
│   │   ├── lib/                  # 유틸리티, API 클라이언트
│   │   └── types/                # TypeScript 타입 정의
│   ├── .env.local                # 환경 변수 (로컬)
│   ├── .env.example              # 환경 변수 예시
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── service-core/                 # Backend Core API (Node.js)
│   ├── src/
│   │   ├── controllers/          # 컨트롤러
│   │   ├── routes/               # Express 라우터
│   │   ├── middlewares/          # 인증, 에러 핸들링
│   │   ├── services/             # 비즈니스 로직
│   │   ├── socket/               # Socket.IO 이벤트 핸들러
│   │   ├── utils/                # 유틸리티
│   │   └── index.ts              # 진입점
│   ├── prisma/
│   │   └── schema.prisma         # Prisma 스키마
│   ├── tests/                    # Jest 테스트
│   ├── .env                      # 환경 변수
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── service-ai/                   # Backend AI Engine (Python)
│   ├── app/
│   │   ├── api/                  # FastAPI 라우터
│   │   ├── services/             # AI 서비스 로직
│   │   ├── models/               # Pydantic 모델
│   │   ├── utils/                # 유틸리티
│   │   └── main.py               # FastAPI 진입점
│   ├── tests/                    # Pytest 테스트
│   ├── .env                      # 환경 변수
│   ├── .env.example
│   ├── requirements.txt
│   └── Dockerfile
│
├── .github/
│   └── workflows/                # GitHub Actions CI/CD
│       ├── test-frontend.yml
│       ├── test-backend-core.yml
│       ├── test-backend-ai.yml
│       └── deploy-production.yml
│
├── docs/                         # 추가 문서
│   ├── API.md                    # API 상세 문서
│   └── DEPLOYMENT.md             # 배포 가이드
│
├── .gitignore
├── README.md
├── PROJECT_BLUEPRINT.md          # 이 파일
└── project.rules                 # 프로젝트 수행 규칙
```

---

## 5. 데이터베이스 스키마

### 5.1 ERD 개요
*(Prisma 스키마를 기반으로 생성 예정)*

### 5.2 주요 테이블 (초안)

#### User (사용자)
```prisma
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  passwordHash  String
  name          String
  role          Role     @default(CANDIDATE)  // CANDIDATE | RECRUITER | ADMIN
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  candidateProfile CandidateProfile?
  recruiterProfile RecruiterProfile?
  interviews       Interview[]
}

enum Role {
  CANDIDATE
  RECRUITER
  ADMIN
}
```

#### CandidateProfile (구직자 프로필)
```prisma
model CandidateProfile {
  id              String   @id @default(uuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])
  
  resumeText      String?  @db.Text
  resumeUrl       String?  // Cloud Storage URL
  resumeEmbedding Float[]  // pgvector
  
  skills          String[] // ["Python", "FastAPI", ...]
  experience      Int?     // 경력 (년)
  education       String?
  desiredPosition String?
  desiredSalary   Int?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

#### RecruiterProfile (채용담당자 프로필)
```prisma
model RecruiterProfile {
  id          String   @id @default(uuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id])
  
  companyName String
  companyUrl  String?
  position    String   // 채용담당자 직책
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  jobPostings JobPosting[]
}
```

#### JobPosting (채용 공고)
```prisma
model JobPosting {
  id              String   @id @default(uuid())
  recruiterId     String
  recruiter       RecruiterProfile @relation(fields: [recruiterId], references: [id])
  
  title           String
  description     String   @db.Text
  requirements    String[] // 필수 요건
  preferredSkills String[] // 우대 사항
  
  position        String   // 직무
  experienceMin   Int?     // 최소 경력
  experienceMax   Int?     // 최대 경력
  salaryMin       Int?
  salaryMax       Int?
  
  status          JobStatus @default(ACTIVE)  // ACTIVE | CLOSED
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  interviews      Interview[]
}

enum JobStatus {
  ACTIVE
  CLOSED
}
```

#### Interview (인터뷰 세션)
```prisma
model Interview {
  id              String   @id @default(uuid())
  candidateId     String
  candidate       User     @relation(fields: [candidateId], references: [id])
  jobPostingId    String?
  jobPosting      JobPosting? @relation(fields: [jobPostingId], references: [id])
  
  status          InterviewStatus @default(IN_PROGRESS)
  startedAt       DateTime @default(now())
  completedAt     DateTime?
  
  // Relations
  messages        InterviewMessage[]
  evaluation      Evaluation?
}

enum InterviewStatus {
  IN_PROGRESS
  COMPLETED
  ABANDONED
}
```

#### InterviewMessage (인터뷰 대화 기록)
```prisma
model InterviewMessage {
  id            String   @id @default(uuid())
  interviewId   String
  interview     Interview @relation(fields: [interviewId], references: [id])
  
  role          MessageRole  // AI | CANDIDATE
  content       String   @db.Text
  contentType   ContentType  @default(TEXT)  // TEXT | AUDIO
  audioUrl      String?  // TTS 생성 음성 URL
  
  embedding     Float[]  // 답변 임베딩 (pgvector)
  
  createdAt     DateTime @default(now())
}

enum MessageRole {
  AI
  CANDIDATE
}

enum ContentType {
  TEXT
  AUDIO
}
```

#### Evaluation (평가 결과)
```prisma
model Evaluation {
  id            String   @id @default(uuid())
  interviewId   String   @unique
  interview     Interview @relation(fields: [interviewId], references: [id])
  
  // 평가 점수 (0-100)
  technicalScore      Float
  communicationScore  Float
  problemSolvingScore Float
  overallScore        Float
  
  // 통계 분석 기반 피드백
  strengthsJson       String   @db.Text  // JSON 형태
  weaknessesJson      String   @db.Text
  detailedFeedback    String   @db.Text
  
  // 매칭 정보
  matchingScore       Float?   // 특정 공고와의 매칭 점수
  matchingReason      String?  @db.Text
  
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}
```

### 5.3 pgvector 확장 활성화
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

---

## 6. API 명세서

### 6.1 Service Core (Node.js) - REST API

#### 인증 (Authentication)
- `POST /api/v1/auth/register` - 회원가입
- `POST /api/v1/auth/login` - 로그인
- `POST /api/v1/auth/logout` - 로그아웃
- `GET /api/v1/auth/me` - 현재 사용자 정보 조회 (JWT 필요)

#### 사용자 프로필 (User Profile)
- `GET /api/v1/users/:userId/profile` - 프로필 조회
- `PUT /api/v1/users/:userId/profile` - 프로필 수정
- `POST /api/v1/candidates/:candidateId/resume` - 이력서 업로드

#### 채용 공고 (Job Postings)
- `GET /api/v1/jobs` - 공고 목록 조회 (페이지네이션, 필터)
- `GET /api/v1/jobs/:jobId` - 공고 상세 조회
- `POST /api/v1/jobs` - 공고 생성 (채용담당자 전용)
- `PUT /api/v1/jobs/:jobId` - 공고 수정
- `DELETE /api/v1/jobs/:jobId` - 공고 삭제

#### 인터뷰 (Interview)
- `POST /api/v1/interviews` - 인터뷰 시작
- `GET /api/v1/interviews/:interviewId` - 인터뷰 정보 조회
- `POST /api/v1/interviews/:interviewId/complete` - 인터뷰 완료

#### 평가 (Evaluation)
- `GET /api/v1/evaluations/:interviewId` - 평가 결과 조회

#### 매칭 (Matching)
- `GET /api/v1/candidates/:candidateId/recommendations` - 구직자에게 추천 공고
- `GET /api/v1/jobs/:jobId/recommendations` - 공고에 추천 후보자

### 6.2 Service Core (Node.js) - Socket.IO Events

#### 클라이언트 → 서버
- `interview:start` - 인터뷰 세션 시작
- `interview:message` - 사용자 메시지 전송 (텍스트/음성)
- `interview:end` - 인터뷰 종료 요청

#### 서버 → 클라이언트
- `interview:question` - AI 질문 수신
- `interview:processing` - AI 처리 중 상태
- `interview:error` - 에러 발생

### 6.3 Service AI (Python) - Internal API

*(service-core에서만 호출, 외부 노출 안 함)*

#### AI 질문 생성
- `POST /internal/ai/generate-question`
  - Request: `{ interviewId, previousMessages, candidateProfile, jobPosting }`
  - Response: `{ question, questionType }`

#### 답변 분석
- `POST /internal/ai/analyze-answer`
  - Request: `{ interviewId, question, answer }`
  - Response: `{ analysis, followUpNeeded, followUpQuestion }`

#### 평가 생성
- `POST /internal/ai/generate-evaluation`
  - Request: `{ interviewId, allMessages }`
  - Response: `{ evaluation: { scores, strengths, weaknesses, feedback } }`

#### 임베딩 생성
- `POST /internal/ai/create-embedding`
  - Request: `{ text }`
  - Response: `{ embedding: [0.1, 0.2, ...] }`

#### 매칭 점수 계산
- `POST /internal/ai/calculate-match`
  - Request: `{ candidateId, jobPostingId }`
  - Response: `{ matchScore, reason }`

---

## 7. AI 엔진 명세서

### 7.1 LLM 프롬프트 전략

#### 질문 생성 (Question Generation)
- **모델:** GPT-4
- **역할:** 전문 HR 면접관
- **입력:** 이력서, 공고, 이전 대화 내역
- **출력:** 맞춤형 질문 (기술/경험/상황 기반)

#### 답변 분석 (Answer Analysis)
- **모델:** GPT-4
- **역할:** 답변 품질 평가자
- **입력:** 질문, 답변
- **출력:** 점수, 키워드, 꼬리 질문 필요 여부

#### 평가 생성 (Evaluation Generation)
- **모델:** GPT-4
- **역할:** 통계 분석가 + HR 전문가
- **입력:** 전체 대화 기록, 평가 기준
- **출력:** 정량적 점수 + 정성적 피드백 (강점, 약점, 개선 방안)

### 7.2 임베딩 전략
- **모델:** `jhgan/ko-sbert-nli` (Sentence-Transformers)
- **용도:**
  - 이력서 임베딩 → pgvector 저장
  - 답변 임베딩 → 유사도 기반 평가
  - 공고 임베딩 → 매칭 알고리즘

### 7.3 매칭 알고리즘
- **방법:** 코사인 유사도 + 규칙 기반 필터링
  1. 이력서 임베딩 vs 공고 임베딩 (벡터 유사도)
  2. 필수 요건 충족 여부 (규칙)
  3. 경력/연봉 범위 매칭
  4. GPT-4를 통한 매칭 근거 생성

---

## 8. 환경 변수

### 8.1 app-web (.env.local)
```env
NEXT_PUBLIC_CORE_API_URL=http://localhost:8080
NEXT_PUBLIC_SOCKET_URL=http://localhost:8080
```

### 8.2 service-core (.env)
```env
# 서버 설정
PORT=8080
NODE_ENV=development

# 데이터베이스 (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/flex_recruiter?schema=public"

# JWT 인증
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# AI 서비스 URL
AI_SERVICE_URL=http://localhost:8000

# 파일 업로드 (Cloud Storage)
GCP_PROJECT_ID=your-gcp-project-id
GCP_STORAGE_BUCKET=flex-recruiter-files
```

### 8.3 service-ai (.env)
```env
# 서버 설정
PORT=8000

# OpenAI API
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 데이터베이스 (벡터 검색용)
DATABASE_URL="postgresql://user:password@localhost:5432/flex_recruiter?schema=public"

# 임베딩 모델
EMBEDDING_MODEL=jhgan/ko-sbert-nli

# GCP (선택)
GCP_PROJECT_ID=your-gcp-project-id
```

---

## 9. 배포 전략

### 9.1 개발 환경
- **로컬:** Docker Compose로 모든 서비스 실행
- **데이터베이스:** 로컬 PostgreSQL + pgvector

### 9.2 스테이징 환경
- **Frontend:** Vercel (자동 배포)
- **Backend:** GCP Cloud Run (develop 브랜치)
- **Database:** GCP Cloud SQL (스테이징 인스턴스)

### 9.3 프로덕션 환경
- **Frontend:** Vercel (main 브랜치)
- **Backend:** GCP Cloud Run 또는 GKE (main 브랜치)
- **Database:** GCP Cloud SQL (프로덕션 인스턴스)
- **CI/CD:** GitHub Actions
  - PR → 자동 테스트
  - main 병합 → 자동 배포

---

## 10. 개발 로드맵

### Sprint 0: 프로젝트 초기화 ✓ 완료
- [x] 프로젝트 구조 생성
- [x] 각 서비스 기본 설정 및 Dockerfile
- [x] PostgreSQL + pgvector 로컬 환경 구축
- [x] GitHub 저장소 및 브랜치 전략 수립

### Sprint 1: 인증 및 기본 CRUD ✓ 완료
- [x] 사용자 회원가입/로그인 (JWT)
- [x] Prisma 스키마 정의 및 마이그레이션
- [x] 기본 프로필 CRUD API
- [x] Next.js 기본 레이아웃 및 인증 페이지
- [x] JWT 인증 미들웨어 구현
- [x] 인증 상태 관리 (Zustand)
- [x] 회원가입/로그인 UI
- [x] 대시보드 페이지

### Sprint 2: Interface - 대화형 UI ✓ 완료
- [x] Socket.IO 연동 (실시간 채팅)
- [x] AI 인터뷰 UI 컴포넌트 (채팅 인터페이스)
- [x] 인터뷰 세션 관리 (시작/종료/재연결)
- [x] OpenAI GPT-4 질문 생성 통합
- [x] 실시간 메시지 주고받기
- [x] 반응형 디자인
- [ ] STT/TTS 통합 (추후 구현) (Tailwind CSS)

### Sprint 3: Engine - AI 질문 생성 (1주)
- [ ] FastAPI AI 서비스 기본 구조
- [ ] OpenAI GPT-4 질문 생성 API
- [ ] 이력서/공고 기반 맞춤형 질문 로직
- [ ] 꼬리 질문 생성 메커니즘

### Sprint 4: Feedback - 평가 시스템 (2주) ★ ✓ 완료
- [x] 답변 분석 AI 엔진 (GPT-4 기반)
- [x] 통계 분석 기반 평가 알고리즘
  - 기술 역량 점수 (0-100)
  - 커뮤니케이션 점수 (0-100)
  - 문제 해결 능력 점수 (0-100)
  - 종합 점수 및 일관성 분석
- [x] 정성적 피드백 생성 (강점/약점/개선 방안)
- [x] 평가 결과 저장 및 조회 API
- [x] 평가 결과 UI (점수 차트, 피드백)

### Sprint 5: Matching - 매칭 알고리즘 (2주) ✓ 완료
- [x] Sentence-Transformers 한국어 임베딩 모델 통합 (jhgan/ko-sbert-nli)
- [x] 임베딩 생성 서비스 (이력서, 채용 공고)
- [x] 코사인 유사도 기반 매칭 알고리즘
- [x] 규칙 기반 보정 (경력, 기술 스택)
- [x] 매칭 근거 생성 (GPT-4)
- [x] 채용 공고 CRUD API
- [x] 추천 API (구직자용/기업용)
- [x] 채용 공고 목록 및 상세 페이지 UI
- [x] AI 추천 공고 페이지 UI

### Sprint 6: 테스트 & 최적화 (1주)
- [ ] 단위 테스트 작성 (Jest, Pytest)
- [ ] E2E 테스트 (Playwright)
- [ ] 성능 최적화 (캐싱, DB 인덱스)
- [ ] 보안 점검 (SQL Injection, XSS 방어)

### Sprint 7: 배포 & CI/CD (1주)
- [ ] Dockerfile 및 Docker Compose 최종 검증
- [ ] GCP Cloud Run/GKE 배포 스크립트
- [ ] GitHub Actions CI/CD 파이프라인
- [ ] 모니터링 및 로깅 (Cloud Logging, Sentry)

---

## 변경 이력
- **2025-10-27:** 초기 설계도 작성 (Sprint 0)
- **2025-10-27:** Sprint 1 완료 - 인증 API 및 프로필 CRUD, 프론트엔드 인증 UI 구현
- **2025-10-27:** Sprint 2 완료 - Socket.IO 실시간 채팅, OpenAI GPT-4 질문 생성, AI 인터뷰 UI
- **2025-10-27:** Sprint 4 완료 - 통계 기반 평가 시스템, GPT-4 피드백 생성, 평가 결과 UI
- **2025-10-27:** Sprint 5 완료 - Sentence-Transformers 매칭, 채용 공고 CRUD, AI 추천 시스템

