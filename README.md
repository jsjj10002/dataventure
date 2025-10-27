# flex-AI-Recruiter

> 대화형 AI 기반 채용 매칭 플랫폼

## 프로젝트 개요

**flex-AI-Recruiter**는 AI 인터뷰를 통해 구직자의 역량을 객관적이고 전문적으로 평가하고, 최적의 채용 공고와 매칭하는 혁신적인 SaaS 플랫폼입니다.

### 핵심 기능
1. **대화형 AI 인터뷰:** 자연스러운 대화를 통한 맞춤형 질문 생성 및 꼬리 질문
2. **통계 기반 평가:** 객관적이고 깊이있는 분석에 의거한 전문적 피드백
3. **AI 매칭:** 구직자-기업 간 최적 매칭 (추천 근거 제시)
4. **음성 지원:** STT/TTS를 통한 음성 인터뷰

## 기술 스택

### Frontend
- **Framework:** Next.js 14 (React 18, TypeScript)
- **Styling:** Tailwind CSS
- **State Management:** Zustand + TanStack Query
- **Real-time:** Socket.IO Client

### Backend
- **Service 1 (Core API):** Node.js + Express + TypeScript + Socket.IO
- **Service 2 (AI Engine):** Python + FastAPI
- **ORM:** Prisma
- **Database:** PostgreSQL + pgvector

### AI/ML
- **LLM:** OpenAI GPT-4
- **STT/TTS:** OpenAI Whisper/TTS
- **Embedding:** Sentence-Transformers (ko-sbert-nli)

### Infrastructure
- **Cloud:** GCP (Cloud Run, Cloud SQL, Cloud Storage)
- **CI/CD:** GitHub Actions
- **Container:** Docker

## 프로젝트 구조

```
flex-AI-Recruiter/
├── app-web/              # Frontend (Next.js)
├── service-core/         # Backend Core API (Node.js)
├── service-ai/           # Backend AI Engine (Python)
├── docs/                 # 문서
├── .github/workflows/    # CI/CD
├── PROJECT_BLUEPRINT.md  # 살아있는 설계도
└── project.rules         # 프로젝트 수행 규칙
```

## 시작하기

### 사전 요구사항
- Node.js 20.x LTS
- Python 3.11+
- PostgreSQL 15+ (pgvector 확장 포함)
- Docker & Docker Compose (선택)

### 환경 변수 설정

각 서비스의 `.env.example` 파일을 복사하여 `.env` 파일을 생성하고, 실제 값으로 채워주세요.

```bash
# Frontend
cp app-web/.env.example app-web/.env.local

# Backend Core
cp service-core/.env.example service-core/.env

# Backend AI
cp service-ai/.env.example service-ai/.env
```

### 로컬 개발 환경 실행

#### 1. 데이터베이스 실행
```bash
# PostgreSQL + pgvector (Docker 사용)
docker run -d \
  --name postgres-flex-recruiter \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=flex_recruiter \
  -p 5432:5432 \
  pgvector/pgvector:pg15
```

#### 2. Backend Core (service-core)
```bash
cd service-core
npm install
npx prisma migrate dev --name init
npm run dev  # Port 8080
```

#### 3. Backend AI (service-ai)
```bash
cd service-ai
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

#### 4. Frontend (app-web)
```bash
cd app-web
npm install
npm run dev  # Port 3000
```

### Docker Compose로 한번에 실행 (추후 제공)
```bash
docker-compose up
```

## 개발 가이드

### 브랜치 전략 (Git-flow)
- `main`: 프로덕션 배포 브랜치
- `develop`: 개발 통합 브랜치
- `feature/*`: 기능 개발 브랜치

### 커밋 컨벤션
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 코드
chore: 빌드 설정, 패키지 등
```

### 테스트 실행
```bash
# Frontend
cd app-web && npm test

# Backend Core
cd service-core && npm test

# Backend AI
cd service-ai && pytest
```

## 문서

- [PROJECT_BLUEPRINT.md](./PROJECT_BLUEPRINT.md): 살아있는 설계도 (아키텍처, API 명세서, DB 스키마)
- [project.rules](./project.rules): 프로젝트 수행 규칙 (AI-사용자 협업 프로토콜)
- [docs/API.md](./docs/API.md): API 상세 문서 (추후)
- [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md): 배포 가이드 (추후)

## 로드맵

- [x] Sprint 0: 프로젝트 초기화
- [ ] Sprint 1: 인증 및 기본 CRUD
- [ ] Sprint 2: 대화형 UI
- [ ] Sprint 3: AI 질문 생성
- [ ] Sprint 4: 평가 시스템 ★
- [ ] Sprint 5: 매칭 알고리즘
- [ ] Sprint 6: 테스트 & 최적화
- [ ] Sprint 7: 배포 & CI/CD

## 라이센스

Proprietary - All Rights Reserved

## 문의

프로젝트 관련 문의는 프로젝트 오너에게 연락해주세요.

