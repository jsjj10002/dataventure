# 🚀 서비스 실행 가이드

Sprint 8-9 백엔드 API 구현이 완료되었습니다. 이제 3개 서비스를 실행하여 테스트할 수 있습니다.

---

## 📋 사전 확인사항

### ✅ 1. PostgreSQL 실행 확인

```cmd
docker ps
```

**예상 출력:**
```
CONTAINER ID   IMAGE             COMMAND                   CREATED             STATUS         PORTS                    NAMES
d88079b1f636   ankane/pgvector   "docker-entrypoint.s…"   About an hour ago   Up About an hour   0.0.0.0:5432->5432/tcp   flex-postgres
```

### ✅ 2. 데이터베이스 마이그레이션 확인

```cmd
cd service-core
npx prisma migrate status
```

**예상 출력:**
```
3 migrations found in prisma/migrations
Database schema is up to date!
```

### ✅ 3. 환경 변수 확인

**service-core/.env**
```env
PORT=8080
DATABASE_URL="postgresql://postgres:aA19929183927%40@localhost:5432/flex_recruiter?schema=public"
JWT_SECRET=c15c31c1a5ed3dc14499c863ad85ccf5c3f56e1299d8a8d330fe2ca880d62aaa
AI_SERVICE_URL=http://localhost:8000
GCP_PROJECT_ID=dataventureterabyte
GCP_STORAGE_BUCKET=recruiter-files
GOOGLE_APPLICATION_CREDENTIALS=./dataventureterabyte-f84cd9454e02.json
```

**service-ai/.env**
```env
PORT=8000
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-5
DATABASE_URL="postgresql://postgres:aA19929183927%40@localhost:5432/flex_recruiter?schema=public"
EMBEDDING_MODEL=jhgan/ko-sbert-nli
GCP_PROJECT_ID=dataventureterabyte
```

---

## 🎯 서비스 실행 순서

### Terminal 1: Core Service (백엔드)

```cmd
cd C:\Users\박재석\개발\DATAVETURE\service-core
npm run dev
```

**예상 출력:**
```
╔═══════════════════════════════════════════════════════╗
║  flex-AI-Recruiter Core API                          ║
║  Environment: development                             ║
║  Port: 8080                                          ║
║  Socket.IO: Enabled                                   ║
║  Database: Configured                                 ║
╚═══════════════════════════════════════════════════════╝
```

**테스트:**
```cmd
curl http://localhost:8080
```

---

### Terminal 2: AI Service (Python)

```cmd
cd C:\Users\박재석\개발\DATAVETURE\service-ai
uv run uvicorn app.main:app --reload --port 8000
```

**예상 출력:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**테스트:**
```cmd
curl http://localhost:8000/health
```

---

### Terminal 3: Web Frontend (Next.js)

```cmd
cd C:\Users\박재석\개발\DATAVETURE\app-web
npm run dev
```

**예상 출력:**
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

 ✓ Ready in 2.5s
```

**브라우저:**
```
http://localhost:3000
```

---

## 🧪 API 테스트

### 1. Health Check

**Core Service:**
```cmd
curl http://localhost:8080
```

**AI Service:**
```cmd
curl http://localhost:8000/health
```

### 2. 회원가입 테스트

```cmd
curl -X POST http://localhost:8080/api/v1/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\",\"name\":\"테스트사용자\",\"role\":\"CANDIDATE\"}"
```

### 3. 로그인 테스트

```cmd
curl -X POST http://localhost:8080/api/v1/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

**응답:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "test@example.com",
    "name": "테스트사용자",
    "role": "CANDIDATE"
  }
}
```

### 4. 프로필 조회 (인증 필요)

```cmd
set TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

curl http://localhost:8080/api/v1/profile/candidate/:id ^
  -H "Authorization: Bearer %TOKEN%"
```

### 5. 검색 테스트

```cmd
curl "http://localhost:8080/api/v1/search?q=개발자" ^
  -H "Authorization: Bearer %TOKEN%"
```

### 6. 알림 조회

```cmd
curl http://localhost:8080/api/v1/notifications ^
  -H "Authorization: Bearer %TOKEN%"
```

---

## 🐛 문제 해결

### 문제 1: Port already in use

**증상:**
```
Error: listen EADDRINUSE: address already in use :::8080
```

**해결:**
```cmd
# Windows에서 포트 사용 중인 프로세스 확인
netstat -ano | findstr :8080

# PID 확인 후 종료
taskkill /PID <PID> /F
```

### 문제 2: PostgreSQL 연결 실패

**증상:**
```
Error: Can't reach database server at `localhost:5432`
```

**해결:**
```cmd
# Docker 컨테이너 확인
docker ps -a

# 중지된 경우 시작
docker start flex-postgres
```

### 문제 3: OpenAI API Key 오류

**증상:**
```
Error: OpenAI API key not found
```

**해결:**
```cmd
# service-ai/.env 확인
cd service-ai
type .env | findstr OPENAI
```

### 문제 4: Python 패키지 오류

**증상:**
```
ModuleNotFoundError: No module named 'numpy'
```

**해결:**
```cmd
cd service-ai
uv pip install -r requirements.txt
```

---

## 📊 실행 상태 확인

### 포트 확인

| 서비스 | 포트 | URL |
|--------|------|-----|
| PostgreSQL | 5432 | localhost:5432 |
| Core Service | 8080 | http://localhost:8080 |
| AI Service | 8000 | http://localhost:8000 |
| Web Frontend | 3000 | http://localhost:3000 |

### 프로세스 확인

```cmd
# 모든 포트 확인
netstat -ano | findstr "3000 8000 8080 5432"
```

---

## 🎉 성공 확인

모든 서비스가 정상 실행되면:

1. ✅ Core Service: http://localhost:8080 접속 시 JSON 응답
2. ✅ AI Service: http://localhost:8000/health 접속 시 "healthy" 응답
3. ✅ Frontend: http://localhost:3000 접속 시 홈페이지 표시
4. ✅ PostgreSQL: `docker ps`에서 flex-postgres 실행 중

---

## 🔄 서비스 종료

### 방법 1: Ctrl+C (권장)

각 터미널에서 `Ctrl+C`를 눌러 graceful shutdown

### 방법 2: 강제 종료

```cmd
# 포트별로 프로세스 종료
taskkill /F /IM node.exe
taskkill /F /IM python.exe
```

### Docker 종료

```cmd
docker stop flex-postgres
```

---

## 📝 로그 확인

### Core Service 로그
- 콘솔에 실시간 출력
- 요청 로깅: `[2025-10-28T...] GET /api/v1/...`

### AI Service 로그
- Uvicorn 로그
- FastAPI 요청/응답 로그

### Frontend 로그
- Next.js 개발 서버 로그
- 브라우저 개발자 도구 (F12)

---

## 🎯 다음 단계

서비스가 정상 실행되면:

1. ✅ 브라우저에서 회원가입/로그인 테스트
2. ✅ 프로필 작성 테스트
3. ✅ 인터뷰 시작 테스트 (AI 서비스 연동)
4. ✅ 평가 결과 확인
5. ✅ 알림 기능 테스트

**준비 완료!** 🚀

