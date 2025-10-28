# 🚀 전체 서비스 실행 가이드

**업데이트**: 2025-10-28  
**모든 이슈 해결 완료** ✅

---

## ✅ 사전 준비 (완료 확인)

- [x] Docker Desktop 실행 중
- [x] Node.js 설치
- [x] Python + uv 설치
- [x] 환경 변수 설정 (`.env` 파일들)

---

## 🔧 이슈 해결 완료

### ✅ 이슈 1: PostgreSQL 포트 충돌 → 해결됨
- 기존 `flex-postgres` 컨테이너 제거 완료
- `flex-recruiter-db` 정상 실행 중

### ✅ 이슈 2: FastAPI 실행 실패 → 해결됨
- `uvicorn` 직접 사용하도록 변경
- 실행 스크립트 생성: `service-ai/start.bat` (Windows), `service-ai/start.sh` (Linux/Mac)

---

## 🚀 서비스 실행 (4개 터미널)

### Terminal 1: PostgreSQL ✅
```bash
# 프로젝트 루트에서
docker-compose up -d postgres

# 확인
docker ps
# → flex-recruiter-db가 Up 상태여야 함
```

**포트**: 5432  
**상태**: ✅ 실행 중  
**접속**: `postgresql://postgres:postgres@localhost:5432/flex_ai_recruiter`

---

### Terminal 2: service-core (백엔드 API) ✅
```bash
cd service-core
npm run dev
```

**포트**: 8080  
**상태**: ✅ 실행 중  
**API**: http://localhost:8080  
**헬스체크**: http://localhost:8080/health (예정)

#### 출력 예시:
```
╔═══════════════════════════════════════════════════════╗
║  flex-AI-Recruiter Core API                          ║
║  Environment: development                              ║
║  Port: 8080                                        ║
║  Socket.IO: Enabled                                   ║
║  Database: Configured                                ║
╚═══════════════════════════════════════════════════════╝
```

---

### Terminal 3: service-ai (AI 서비스) ✅ (수정됨)

#### 방법 A: 스크립트 사용 (추천)
```bash
# Windows
cd service-ai
start.bat

# Linux/Mac
cd service-ai
chmod +x start.sh
./start.sh
```

#### 방법 B: 직접 실행
```bash
cd service-ai
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**포트**: 8000  
**상태**: ✅ 해결됨  
**API**: http://localhost:8000  
**Swagger UI**: http://localhost:8000/docs

#### 출력 예시:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

---

### Terminal 4: app-web (프론트엔드) ✅
```bash
cd app-web
npm run dev
```

**포트**: 3000  
**상태**: ✅ 실행 중  
**URL**: http://localhost:3000

#### 출력 예시:
```
▲ Next.js 14.2.33
- Local:        http://localhost:3000
- Environments: .env

✓ Ready in 6.1s
```

---

## 📊 서비스 상태 확인

### 모든 서비스가 정상 실행 중인지 확인:

```bash
# PostgreSQL
docker ps | grep flex-recruiter-db
# → Up 5 seconds 표시되어야 함

# service-core
curl http://localhost:8080
# → API 응답 또는 "Cannot GET /" (정상)

# service-ai
curl http://localhost:8000
# → {"detail":"Not Found"} (정상, /docs로 접속)

# app-web
curl http://localhost:3000
# → HTML 응답
```

### 브라우저 확인:
1. **프론트엔드**: http://localhost:3000
2. **AI API 문서**: http://localhost:8000/docs
3. **백엔드 API**: http://localhost:8080 (API 엔드포인트는 `/api/v1/...`)

---

## 🎯 테스트 시나리오

### 1. 회원가입 & 로그인 (구현 필요)
- [ ] `/auth/register` 페이지 구현 예정
- [ ] `/auth/login` 페이지 구현 예정

### 2. 프로필 작성
- ✅ 구직자: http://localhost:3000/profile/candidate
- ✅ 채용담당자: http://localhost:3000/profile/recruiter

### 3. AI 인터뷰
- ✅ 설정: http://localhost:3000/interview/setup
- ✅ 진행: http://localhost:3000/interview/start?id=...

### 4. 평가 결과
- ✅ http://localhost:3000/evaluation/:id

### 5. 검색
- ✅ http://localhost:3000/search?q=검색어

### 6. 알림
- ✅ 우측 상단 종 아이콘 클릭

---

## 🛑 서비스 중지

### 개별 중지:
```bash
# Ctrl+C로 각 터미널에서 중지
```

### PostgreSQL 중지:
```bash
docker-compose down
```

### 모두 중지:
```bash
# 모든 터미널에서 Ctrl+C
docker-compose down
```

---

## 🐛 문제 해결

### PostgreSQL 연결 실패
```bash
# 컨테이너 재시작
docker-compose restart postgres

# 로그 확인
docker logs flex-recruiter-db

# 직접 접속 테스트
docker exec -it flex-recruiter-db psql -U postgres -d flex_ai_recruiter
```

### service-core 연결 실패
```bash
# Prisma 클라이언트 재생성
cd service-core
npx prisma generate

# DB 마이그레이션 재실행
npx prisma migrate dev
```

### service-ai 실행 실패
```bash
# 종속성 재설치
cd service-ai
uv pip install -r requirements.txt

# 환경 확인
uv run python --version
uv pip list
```

### app-web 빌드 실패
```bash
# node_modules 재설치
cd app-web
rm -rf node_modules package-lock.json
npm install

# Next.js 캐시 삭제
rm -rf .next
npm run dev
```

---

## 📝 환경 변수 체크리스트

### service-core/.env
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/flex_ai_recruiter"
JWT_SECRET="your-secret-key-here"
GOOGLE_CLOUD_PROJECT_ID="your-project-id"
GOOGLE_CLOUD_STORAGE_BUCKET="your-bucket-name"
GOOGLE_APPLICATION_CREDENTIALS="./path-to-service-account.json"
```

### service-ai/.env
```bash
OPENAI_API_KEY="sk-..."
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/flex_ai_recruiter"
```

### app-web/.env.local
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

## 🎉 성공 확인

모든 서비스가 정상 실행되면:

```
✅ PostgreSQL    → docker ps (flex-recruiter-db Up)
✅ service-core  → http://localhost:8080
✅ service-ai    → http://localhost:8000/docs
✅ app-web       → http://localhost:3000
```

**축하합니다! 모든 서비스가 정상 작동 중입니다!** 🎉

---

## 🔄 자동 실행 스크립트 (선택사항)

### Windows: `start-all.bat`
```batch
@echo off
echo Starting all services...

start cmd /k "docker-compose up -d postgres"
timeout /t 5
start cmd /k "cd service-core && npm run dev"
start cmd /k "cd service-ai && start.bat"
start cmd /k "cd app-web && npm run dev"

echo All services starting...
echo Check each terminal window for status.
pause
```

### Linux/Mac: `start-all.sh`
```bash
#!/bin/bash
echo "Starting all services..."

# PostgreSQL
docker-compose up -d postgres
sleep 5

# service-core
gnome-terminal -- bash -c "cd service-core && npm run dev; exec bash"

# service-ai
gnome-terminal -- bash -c "cd service-ai && ./start.sh; exec bash"

# app-web
gnome-terminal -- bash -c "cd app-web && npm run dev; exec bash"

echo "All services started!"
echo "Check each terminal for status."
```

---

**다음 단계**: 로그인/회원가입 페이지 구현 🚀

