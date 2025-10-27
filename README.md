# flex-AI-Recruiter 🤖

<div align="center">

**AI 기반 대화형 채용 매칭 플랫폼**

[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.13-blue.svg)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

[기능](#주요-기능) • [기술 스택](#기술-스택) • [시작하기](#시작하기) • [API 문서](#api-엔드포인트) • [로드맵](#개발-로드맵)

</div>

---

## 📖 프로젝트 개요

**flex-AI-Recruiter**는 OpenAI GPT-4와 Sentence-Transformers를 활용한 차세대 채용 플랫폼입니다. 
전통적인 이력서 검토와 면접을 혁신하여, AI와의 자연스러운 대화를 통해 구직자의 역량을 객관적으로 평가하고, 
최적의 채용 공고와 매칭합니다.

### 🎯 핵심 가치

- **객관적 평가**: GPT-4 기반 통계 분석으로 기술 역량, 커뮤니케이션, 문제 해결 능력을 정량화
- **맞춤형 인터뷰**: 실시간 대화 분석을 통한 동적 질문 생성 및 꼬리 질문
- **지능형 매칭**: Sentence-Transformers 임베딩과 코사인 유사도로 구직자-공고 매칭 (근거 제시)
- **실시간 상호작용**: Socket.IO 기반 즉각적인 피드백과 자연스러운 대화 흐름

---

## ✨ 주요 기능

### 1. 대화형 AI 인터뷰 💬
- **실시간 채팅**: Socket.IO 기반 끊김 없는 대화
- **동적 질문 생성**: 이력서와 공고 기반 맞춤형 질문 (GPT-4)
- **꼬리 질문**: 대화 흐름에 따른 심화 질문 자동 생성
- **세션 관리**: 인터뷰 시작/일시정지/재연결 지원

### 2. 통계 기반 평가 시스템 📊
- **다차원 분석**: 기술 역량, 커뮤니케이션, 문제 해결 능력 (0-100점)
- **정성적 피드백**: GPT-4가 생성하는 강점/약점/개선 방안
- **일관성 분석**: 답변 간 일관성 및 신뢰도 평가
- **시각화**: 점수 차트 및 색상 코딩 (우수/양호/개선 필요)

### 3. AI 매칭 알고리즘 🎯
- **임베딩 벡터**: Sentence-Transformers (ko-sbert-nli) 768차원
- **코사인 유사도**: 프로필-공고 간 유사도 측정
- **규칙 기반 보정**: 경력 범위, 기술 스택 매칭에 따른 점수 조정
- **매칭 근거**: GPT-4가 설명하는 추천 이유 (100-200자)
- **양방향 추천**: 구직자에게 공고 추천 / 기업에게 후보자 추천

### 4. 채용 공고 관리 📋
- **CRUD API**: 공고 생성, 조회, 수정, 삭제
- **필터링**: 직무, 회사, 경력, 기술 스택 필터
- **페이지네이션**: 대량 데이터 효율적 처리
- **상태 관리**: ACTIVE, CLOSED, DRAFT

---

## 🛠 기술 스택

### Frontend
- **Framework**: Next.js 14 (App Router, React 18, TypeScript)
- **Styling**: Tailwind CSS (반응형 디자인)
- **State Management**: 
  - Zustand (클라이언트 상태)
  - TanStack Query (서버 상태)
- **Real-time**: Socket.IO Client
- **HTTP Client**: Axios (인터셉터, 자동 토큰 관리)

### Backend Core (Node.js)
- **Runtime**: Node.js 20.x LTS
- **Framework**: Express.js + TypeScript
- **Real-time**: Socket.IO Server
- **ORM**: Prisma (PostgreSQL)
- **Authentication**: JWT (jsonwebtoken, bcryptjs)
- **Validation**: Custom middleware

### Backend AI (Python)
- **Framework**: FastAPI
- **LLM**: OpenAI GPT-4 (질문 생성, 평가, 매칭 근거)
- **Embedding**: Sentence-Transformers (`jhgan/ko-sbert-nli`)
- **Analysis**: NumPy (통계 계산)
- **Async**: asyncio

### Database
- **RDBMS**: PostgreSQL 15+
- **Extensions**: pgvector (벡터 검색, 추후 활용)
- **ORM**: Prisma Schema

### Infrastructure
- **Containerization**: Docker, Docker Compose
- **Cloud**: GCP (계획)
  - Cloud Run (서버리스 컨테이너)
  - Cloud SQL (관리형 PostgreSQL)
  - Cloud Storage (파일 저장)
- **CI/CD**: GitHub Actions (테스트 자동화)
- **Monitoring**: 계획 중 (Cloud Logging, Sentry)

---

## 📁 프로젝트 구조

```
flex-AI-Recruiter/
├── app-web/                    # Frontend (Next.js)
│   ├── src/
│   │   ├── app/               # App Router 페이지
│   │   │   ├── auth/          # 로그인/회원가입
│   │   │   ├── dashboard/     # 대시보드
│   │   │   ├── interview/     # AI 인터뷰
│   │   │   ├── evaluation/    # 평가 결과
│   │   │   ├── jobs/          # 채용 공고
│   │   │   └── recommendations/ # AI 추천
│   │   ├── components/        # 재사용 컴포넌트
│   │   ├── stores/            # Zustand 스토어
│   │   ├── lib/               # 유틸리티
│   │   └── types/             # TypeScript 타입
│   ├── public/                # 정적 파일
│   └── package.json
│
├── service-core/              # Backend Core API (Node.js)
│   ├── src/
│   │   ├── controllers/       # Express 컨트롤러
│   │   │   ├── auth.controller.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── interview.controller.ts
│   │   │   ├── evaluation.controller.ts
│   │   │   ├── jobPosting.controller.ts
│   │   │   └── recommendation.controller.ts
│   │   ├── routes/            # API 라우터
│   │   ├── services/          # 비즈니스 로직
│   │   ├── middlewares/       # 인증, 에러 핸들링
│   │   ├── socket/            # Socket.IO 핸들러
│   │   └── utils/             # JWT, 헬퍼 함수
│   ├── prisma/
│   │   ├── schema.prisma      # DB 스키마
│   │   └── migrations/        # 마이그레이션
│   └── package.json
│
├── service-ai/                # Backend AI Engine (Python)
│   ├── app/
│   │   ├── api/               # FastAPI 라우터
│   │   │   ├── question.py    # 질문 생성
│   │   │   ├── evaluation.py  # 평가 생성
│   │   │   └── matching.py    # 매칭
│   │   ├── services/          # AI 서비스
│   │   │   ├── question_generator.py
│   │   │   ├── answer_analyzer.py
│   │   │   ├── evaluation_generator.py
│   │   │   ├── embedding_service.py
│   │   │   └── matching_service.py
│   │   ├── models/            # Pydantic 모델
│   │   └── utils/             # 헬퍼 함수
│   ├── requirements.txt
│   └── pyproject.toml
│
├── docs/                      # 문서
│   ├── API.md                # API 명세서
│   └── DEPLOYMENT.md         # 배포 가이드
│
├── .github/
│   └── workflows/            # GitHub Actions
│       ├── test-frontend.yml
│       ├── test-backend-core.yml
│       └── test-backend-ai.yml
│
├── PROJECT_BLUEPRINT.md      # 살아있는 설계도 ⭐
├── docker-compose.yml        # 로컬 개발 환경
├── .gitignore
└── README.md
```

---

## 🚀 시작하기

### 사전 요구사항

- **Node.js**: 20.x LTS 이상
- **Python**: 3.11+ (3.13 권장)
- **PostgreSQL**: 15+ (pgvector 확장 포함)
- **Docker** (선택): Docker Desktop 또는 Docker CLI
- **API Keys**: OpenAI API Key (필수)

### 1️⃣ 저장소 클론

```bash
git clone https://github.com/your-username/flex-AI-Recruiter.git
cd flex-AI-Recruiter
```

### 2️⃣ 환경 변수 설정

각 서비스의 `.env.example` 파일을 복사하여 `.env` 파일을 생성한다.

#### Frontend (`app-web/.env.local`)
```bash
cp app-web/.env.example app-web/.env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=http://localhost:8080
```

#### Backend Core (`service-core/.env`)
```bash
cp service-core/.env.example service-core/.env
```

```env
# Database
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/flex_recruiter"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# AI Service
AI_SERVICE_URL=http://localhost:8000

# Server
PORT=8080
NODE_ENV=development
```

#### Backend AI (`service-ai/.env`)
```bash
cp service-ai/.env.example service-ai/.env
```

```env
# OpenAI API (필수!)
OPENAI_API_KEY=sk-...your-openai-api-key...

# Embedding Model
EMBEDDING_MODEL=jhgan/ko-sbert-nli

# Server
PORT=8000
```

### 3️⃣ 데이터베이스 실행

#### Docker 사용 (권장)
```bash
docker run -d \
  --name postgres-flex-recruiter \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=flex_recruiter \
  -p 5432:5432 \
  pgvector/pgvector:pg15
```

#### 로컬 PostgreSQL 사용
PostgreSQL 15+를 설치하고 pgvector 확장을 활성화한다:
```sql
CREATE DATABASE flex_recruiter;
\c flex_recruiter
CREATE EXTENSION vector;
```

### 4️⃣ 서비스 실행

#### Backend Core (Port 8080)
```bash
cd service-core
npm install
npx prisma migrate dev --name init  # DB 스키마 생성
npm run dev
```

#### Backend AI (Port 8000)
```bash
cd service-ai
pip install -r requirements.txt
# 또는 uv 사용: uv pip install -r requirements.txt

python -m uvicorn app.main:app --reload --port 8000
```

**참고**: 첫 실행 시 Sentence-Transformers 모델 (`jhgan/ko-sbert-nli`, 약 450MB)이 자동 다운로드되어 1-2분 소요됨.

#### Frontend (Port 3000)
```bash
cd app-web
npm install
npm run dev
```

### 5️⃣ 접속

브라우저에서 http://localhost:3000 접속

1. **회원가입**: `/auth/register` (CANDIDATE 또는 RECRUITER 선택)
2. **로그인**: `/auth/login`
3. **AI 인터뷰**: `/interview`
4. **평가 결과**: `/evaluation/:interviewId`
5. **AI 추천 공고**: `/recommendations` (구직자 전용)
6. **채용 공고**: `/jobs`

---

## 📡 API 엔드포인트

### 인증 (Auth)
- `POST /api/v1/auth/register` - 회원가입
- `POST /api/v1/auth/login` - 로그인
- `POST /api/v1/auth/logout` - 로그아웃
- `GET /api/v1/auth/me` - 현재 사용자 조회

### 사용자 (User)
- `GET /api/v1/users/:id` - 사용자 조회
- `PUT /api/v1/users/:id` - 사용자 정보 수정

### 인터뷰 (Interview)
- `POST /api/v1/interviews` - 인터뷰 생성
- `GET /api/v1/interviews` - 인터뷰 목록
- `GET /api/v1/interviews/:id` - 인터뷰 상세
- **Socket.IO Events**:
  - `interview:start` - 인터뷰 시작
  - `interview:message` - 메시지 전송
  - `interview:end` - 인터뷰 종료
  - `interview:reconnect` - 재연결

### 평가 (Evaluation)
- `GET /api/v1/evaluations` - 평가 목록
- `GET /api/v1/evaluations/:interviewId` - 평가 조회

### 채용 공고 (Job Posting)
- `POST /api/v1/jobs` - 공고 생성 (RECRUITER)
- `GET /api/v1/jobs` - 공고 목록
- `GET /api/v1/jobs/:id` - 공고 상세
- `PUT /api/v1/jobs/:id` - 공고 수정
- `DELETE /api/v1/jobs/:id` - 공고 삭제

### 추천 (Recommendation)
- `GET /api/v1/recommendations/jobs` - 추천 공고 (구직자용)
- `GET /api/v1/recommendations/candidates/:jobId` - 추천 후보자 (기업용)

### AI 서비스 (Internal)
- `POST /internal/ai/generate-question` - 질문 생성
- `POST /internal/ai/generate-evaluation` - 평가 생성
- `POST /internal/ai/calculate-match` - 매칭 점수 계산
- `POST /internal/ai/recommend-jobs` - 공고 추천
- `POST /internal/ai/recommend-candidates` - 후보자 추천

상세 API 문서: [docs/API.md](./docs/API.md) (작성 예정)

---

## 🧪 테스트

### Frontend (Jest + React Testing Library)
```bash
cd app-web
npm test
npm run test:coverage
```

### Backend Core (Jest)
```bash
cd service-core
npm test
npm run test:coverage
```

### Backend AI (Pytest)
```bash
cd service-ai
pytest
pytest --cov=app
```

---

## 📚 개발 가이드

### 브랜치 전략 (Git-flow)
- `main`: 프로덕션 배포 브랜치 (안정 버전)
- `develop`: 개발 통합 브랜치
- `feature/*`: 기능 개발 브랜치
- `hotfix/*`: 긴급 버그 수정

### 커밋 컨벤션 (Conventional Commits)
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅 (기능 변경 없음)
refactor: 코드 리팩토링
test: 테스트 코드 추가/수정
chore: 빌드 설정, 패키지 업데이트 등
```

예시:
```bash
git commit -m "feat: AI 추천 시스템 구현 (Sentence-Transformers)"
git commit -m "fix: JWT 토큰 만료 오류 수정"
git commit -m "docs: README API 문서 추가"
```

---

## 📈 개발 로드맵

### ✅ 완료된 Sprint

- [x] **Sprint 0**: 프로젝트 초기화 (2025-10-27)
  - MSA 아키텍처 구축
  - Docker Compose 설정
  - PostgreSQL + pgvector
  - 프로젝트 설계도 작성

- [x] **Sprint 1**: 인증 및 프로필 관리 (2025-10-27)
  - JWT 기반 회원가입/로그인
  - Prisma ORM 및 DB 스키마
  - 사용자 프로필 CRUD API
  - 인증 상태 관리 (Zustand)

- [x] **Sprint 2**: 대화형 UI (2025-10-27)
  - Socket.IO 실시간 채팅
  - OpenAI GPT-4 질문 생성
  - 인터뷰 세션 관리
  - React 채팅 UI

- [x] **Sprint 4**: 평가 시스템 ⭐ (2025-10-27)
  - GPT-4 기반 답변 분석
  - 통계 분석 (기술/커뮤니케이션/문제해결)
  - 정성적 피드백 생성
  - 평가 결과 UI

- [x] **Sprint 5**: 매칭 알고리즘 (2025-10-27)
  - Sentence-Transformers 한국어 모델
  - 코사인 유사도 + 규칙 기반 매칭
  - GPT-4 매칭 근거 생성
  - 채용 공고 CRUD
  - AI 추천 시스템

### 🔜 예정된 Sprint

- [ ] **Sprint 3**: AI 질문 생성 고도화
  - 이력서 파싱 및 분석
  - 공고 요구사항 기반 질문
  - 난이도 조절

- [ ] **Sprint 6**: 테스트 & 최적화
  - 단위 테스트 (Jest, Pytest)
  - E2E 테스트 (Playwright)
  - 성능 최적화 (캐싱, DB 인덱스)
  - 보안 점검

- [ ] **Sprint 7**: 배포 & CI/CD
  - GCP Cloud Run 배포
  - Cloud SQL 마이그레이션
  - GitHub Actions CI/CD
  - 모니터링 (Cloud Logging, Sentry)

- [ ] **Sprint 8**: 추가 기능
  - STT/TTS 음성 인터뷰
  - 프로필 관리 UI
  - 채용담당자 대시보드
  - 이메일 알림

---

## 🔑 핵심 기술 하이라이트

### 1. GPT-4 기반 답변 분석
- 각 답변을 **기술 역량**, **커뮤니케이션**, **문제 해결 능력** 3가지 기준으로 평가 (0-10점)
- 키워드 추출 및 답변 깊이 분석
- 통계 집계: 평균, 표준편차, 일관성 점수

### 2. Sentence-Transformers 임베딩
- **모델**: `jhgan/ko-sbert-nli` (한국어 NLI 학습)
- **차원**: 768차원 벡터
- 프로필 텍스트 → 벡터 / 공고 텍스트 → 벡터
- 코사인 유사도로 매칭 점수 계산

### 3. 하이브리드 매칭 알고리즘
```
최종 점수 = 벡터 유사도 (0-100) + 규칙 기반 보정 (0-20)

규칙 기반 보정:
- 경력 범위 매칭: +5점
- 필수 기술 매칭: +10점 (비율에 따라)
- 우대 기술 매칭: +5점 (비율에 따라)
```

### 4. 실시간 통신 (Socket.IO)
- **이벤트 기반 아키텍처**: 비동기 메시지 처리
- **Room 관리**: 각 인터뷰는 독립된 Room
- **재연결 지원**: 네트워크 끊김 시 자동 재연결
- **상태 동기화**: 프론트엔드-백엔드 실시간 동기화

---

## 📄 문서

- [PROJECT_BLUEPRINT.md](./PROJECT_BLUEPRINT.md): 살아있는 설계도 (아키텍처, API 명세서, DB 스키마)
- [.cursor/rules/projectrules.mdc](./.cursor/rules/projectrules.mdc): 프로젝트 수행 규칙 (AI-사용자 협업 프로토콜)
- [docs/API.md](./docs/API.md): API 상세 문서 (작성 예정)
- [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md): 배포 가이드 (작성 예정)

---

## 🐛 문제 해결 (Troubleshooting)

### PostgreSQL 인증 오류
```bash
# 비밀번호에 특수문자가 있는 경우 URL 인코딩
# 예: aA19929183927@ → aA19929183927%40
DATABASE_URL="postgresql://postgres:aA19929183927%40@localhost:5432/flex_recruiter"
```

### Sentence-Transformers 모델 다운로드 실패
```bash
# 수동 다운로드
python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('jhgan/ko-sbert-nli')"
```

### Node.js 메모리 부족
```bash
# package.json scripts에 메모리 증가 옵션 추가
"dev": "NODE_OPTIONS=--max-old-space-size=4096 tsx watch src/index.ts"
```

---

## 🤝 기여 가이드

현재 이 프로젝트는 비공개입니다. 기여를 원하시면 프로젝트 오너에게 연락해주세요.

---

## 📝 라이선스

Proprietary - All Rights Reserved

이 소프트웨어와 관련 문서 파일("소프트웨어")는 독점 소유물입니다. 
소프트웨어의 사용, 복사, 수정, 병합, 게시, 배포, 재라이선스 또는 판매는 명시적 서면 허가 없이 금지됩니다.

---

## 👤 제작자

**Project Owner**: [박재석]

**Built with**:
- OpenAI GPT-4
- Sentence-Transformers
- Next.js, Node.js, FastAPI
- PostgreSQL, Socket.IO

---

## 📞 문의

프로젝트 관련 문의:
- 이메일: [이메일 주소]
- GitHub Issues: [이슈 페이지 링크]

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with ❤️ using AI and modern web technologies

</div>
