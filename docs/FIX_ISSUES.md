# 🔧 이슈 해결 가이드

**발견 일시**: 2025-10-28  
**이슈 개수**: 2개

---

## ❌ 이슈 1: PostgreSQL 포트 충돌

### 증상
```
Bind for 0.0.0.0:5432 failed: port is already allocated
```

### 원인
- 5432 포트가 이미 사용 중
- 기존 PostgreSQL이 실행 중이거나 Docker 컨테이너가 남아있음

### 해결 방법 (3가지 중 선택)

#### 방법 A: 기존 Docker 컨테이너 확인 및 정리 (추천)
```bash
# 실행 중인 컨테이너 확인
docker ps -a

# flex-recruiter-db 컨테이너가 있다면 삭제
docker rm -f flex-recruiter-db

# 다시 시작
docker-compose up -d postgres
```

#### 방법 B: 시스템 PostgreSQL 중지
```powershell
# PowerShell (관리자 권한)
Get-Service -Name postgresql* | Stop-Service

# 또는 서비스 관리자에서 PostgreSQL 서비스 중지
```

#### 방법 C: Docker Compose 포트 변경
`docker-compose.yml` 파일 수정:
```yaml
postgres:
  ports:
    - "5433:5432"  # 외부 포트를 5433으로 변경
```

그리고 `.env` 파일의 `DATABASE_URL` 포트도 변경:
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/flex_ai_recruiter"
```

---

## ❌ 이슈 2: FastAPI 실행 실패

### 증상
```
error: Failed to spawn: `fastapi`
Caused by: program not found
```

### 원인
- `uv`로 설치한 환경에서 `fastapi` CLI를 직접 호출할 수 없음
- `fastapi` 명령어는 별도 패키지 (`fastapi-cli`) 필요

### 해결 방법 (2가지 중 선택)

#### 방법 A: uvicorn 직접 사용 (추천)
```bash
cd service-ai
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 방법 B: fastapi-cli 설치
```bash
cd service-ai
uv pip install fastapi-cli
uv run fastapi dev app/main.py --host 0.0.0.0 --port 8000
```

---

## 🚀 최종 실행 명령어 (수정 버전)

### Terminal 1: PostgreSQL
```bash
# 기존 컨테이너 정리
docker ps -a
docker rm -f flex-recruiter-db

# 재시작
docker-compose up -d postgres

# 확인
docker ps
```

### Terminal 2: service-core (정상 작동 중 ✅)
```bash
cd service-core
npm run dev
# → http://localhost:8080 ✅
```

### Terminal 3: service-ai (수정됨 ⚠️)
```bash
cd service-ai
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
# → http://localhost:8000
```

### Terminal 4: app-web (정상 작동 중 ✅)
```bash
cd app-web
npm run dev
# → http://localhost:3000 ✅
```

---

## 📝 영구 해결책

### service-ai 실행 스크립트 생성

`service-ai/start.sh` (Linux/Mac):
```bash
#!/bin/bash
cd "$(dirname "$0")"
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

`service-ai/start.bat` (Windows):
```batch
@echo off
cd %~dp0
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

권한 부여 (Linux/Mac):
```bash
chmod +x service-ai/start.sh
```

실행:
```bash
# Linux/Mac
./start.sh

# Windows
start.bat
```

---

## ✅ 확인 사항

실행 후 다음을 확인하세요:

1. **PostgreSQL**: `docker ps` → `flex-recruiter-db` 실행 중
2. **service-core**: http://localhost:8080 응답
3. **service-ai**: http://localhost:8000/docs 접속 가능 (Swagger UI)
4. **app-web**: http://localhost:3000 접속 가능

---

## 🐛 추가 디버깅

### PostgreSQL 연결 테스트
```bash
# Docker 내부 접속
docker exec -it flex-recruiter-db psql -U postgres -d flex_ai_recruiter

# 테이블 확인
\dt

# 종료
\q
```

### service-ai 로그 확인
```bash
cd service-ai
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --log-level debug
```

---

## 📞 문제 지속 시

위 방법으로 해결되지 않으면:

1. **포트 사용 확인**:
   ```powershell
   # PowerShell
   netstat -ano | findstr :5432
   netstat -ano | findstr :8000
   ```

2. **프로세스 강제 종료**:
   ```powershell
   # PID 확인 후
   taskkill /PID <PID> /F
   ```

3. **Docker 완전 초기화**:
   ```bash
   docker-compose down -v
   docker system prune -a
   docker-compose up -d
   ```

