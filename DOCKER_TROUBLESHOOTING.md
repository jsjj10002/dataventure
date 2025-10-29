# Docker 문제 해결 가이드

## 🔍 현재 발견된 문제들

### 1. ✅ service-core: `ts-node-dev: not found` (해결됨)

**증상**:
```bash
flex-recruiter-core | sh: 1: ts-node-dev: not found
```

**원인**:
- Docker 컨테이너가 이전에 빌드되었고, `ts-node-dev`가 포함되지 않음
- 또는 `node_modules`가 volume mount로 덮어씌워짐

**해결 방법**:

#### 방법 1: 컨테이너 재빌드 (권장)
```bash
# 1. 컨테이너 중지 및 제거
docker-compose down

# 2. 이미지 재빌드 (캐시 무시)
docker-compose build --no-cache service-core

# 3. 다시 시작
docker-compose up -d

# 4. 로그 확인
docker-compose logs -f service-core
```

#### 방법 2: Volume 초기화
```bash
# 1. 컨테이너와 볼륨 모두 제거
docker-compose down -v

# 2. 재빌드 및 시작
docker-compose up --build -d
```

#### 방법 3: 컨테이너 내부에서 직접 설치
```bash
# 임시 해결책 (재시작 시 사라짐)
docker-compose exec service-core npm install

# Prisma 재생성
docker-compose exec service-core npx prisma generate
```

---

### 2. ✅ OPENAI_API_KEY 환경 변수 누락 (해결 방법)

**증상**:
```bash
time="2025-10-29T16:27:58+09:00" level=warning msg="The \"OPENAI_API_KEY\" variable is not set. Defaulting to a blank string."
```

**해결 방법**:

#### 프로젝트 루트에 `.env` 파일 생성:
```bash
# .env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
```

#### 또는 docker-compose.yml 수정:
```yaml
service-ai:
  environment:
    - OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx  # 직접 입력
```

⚠️ **주의**: `.env` 파일은 `.gitignore`에 포함되어야 함

---

### 3. ✅ 브라우저 콘솔: ERR_CONNECTION_REFUSED (해결됨)

**증상**:
```
GET http://localhost:8080/api/v1/notifications net::ERR_CONNECTION_REFUSED
```

**원인**:
- service-core가 시작되지 않아서 8080 포트가 열리지 않음

**해결 방법**:
1. service-core를 재빌드 (위 방법 1 참조)
2. service-core가 정상 실행되는지 확인:
```bash
docker-compose logs service-core
```

정상 로그:
```
[Socket.IO] 서버 시작됨: http://0.0.0.0:8080
[Prisma] 데이터베이스 연결 성공
```

---

### 4. ⚠️ Service Worker 에러 (무시 가능)

**증상**:
```
service-worker.js:22 Uncaught (in promise) TypeError: Failed to fetch
```

**원인**:
- Next.js PWA 관련 에러
- 개발 환경에서 자주 발생
- **심각하지 않음** - 서비스 작동에 영향 없음

**해결 방법** (선택사항):
```typescript
// next.config.js에서 PWA 비활성화
module.exports = {
  // ... other config
  pwa: {
    disable: process.env.NODE_ENV === 'development',
  },
};
```

---

## 🚀 완전 초기화 및 재시작 절차

모든 문제를 해결하기 위한 완전 초기화:

```bash
# 1. 모든 컨테이너, 볼륨, 네트워크 제거
docker-compose down -v --remove-orphans

# 2. Docker 빌드 캐시 정리
docker system prune -a

# 3. 프로젝트 루트에 .env 파일 확인
cat .env  # OPENAI_API_KEY 확인

# 4. service-core 의존성 재설치 (호스트)
cd service-core
npm install
cd ..

# 5. 전체 재빌드 (캐시 무시)
docker-compose build --no-cache

# 6. 시작
docker-compose up -d

# 7. 로그 모니터링
docker-compose logs -f
```

---

## 📊 상태 확인 명령어

### 컨테이너 상태 확인
```bash
docker-compose ps
```

정상 출력:
```
NAME                    STATUS          PORTS
flex-recruiter-core     Up 2 minutes    0.0.0.0:8080->8080/tcp
flex-recruiter-ai       Up 2 minutes    0.0.0.0:8000->8000/tcp
flex-recruiter-web      Up 2 minutes    0.0.0.0:3000->3000/tcp
flex-recruiter-db       Up 2 minutes    0.0.0.0:5432->5432/tcp
```

### Health Check 상태
```bash
docker ps --format "table {{.Names}}\t{{.Status}}"
```

### 특정 서비스 로그
```bash
# service-core 로그 (최근 100줄)
docker-compose logs --tail=100 service-core

# 실시간 로그
docker-compose logs -f service-core

# 모든 서비스 로그
docker-compose logs -f
```

### 컨테이너 내부 접근
```bash
# service-core 내부 쉘 접근
docker-compose exec service-core /bin/bash

# 내부에서 명령 실행
docker-compose exec service-core npm list ts-node-dev
docker-compose exec service-core npx prisma generate
```

---

## 🔧 개별 서비스 재시작

```bash
# service-core만 재시작
docker-compose restart service-core

# service-core만 재빌드 및 재시작
docker-compose up -d --build service-core

# 로그 확인
docker-compose logs -f service-core
```

---

## 🐛 디버깅 팁

### 1. package.json 확인
```bash
# service-core의 package.json에 ts-node-dev 있는지 확인
cat service-core/package.json | grep ts-node-dev
```

### 2. Dockerfile.dev 확인
```bash
# npm install (not npm ci --only=production) 사용하는지 확인
cat service-core/Dockerfile.dev
```

### 3. Volume Mount 문제
```bash
# 호스트의 node_modules가 컨테이너 덮어쓰기 방지
# docker-compose.yml에서:
volumes:
  - ./service-core:/app
  - /app/node_modules  # 이 줄이 있어야 함
```

### 4. 네트워크 문제
```bash
# 컨테이너 간 네트워크 확인
docker network inspect dataveture_default

# service-core의 IP 확인
docker inspect flex-recruiter-core | grep IPAddress
```

---

## ✅ 최종 체크리스트

- [ ] `docker-compose down -v`로 완전 정리
- [ ] `.env` 파일에 `OPENAI_API_KEY` 설정
- [ ] `service-core/package.json`에 `ts-node-dev` 존재 확인
- [ ] `docker-compose build --no-cache` 실행
- [ ] `docker-compose up -d` 실행
- [ ] `docker-compose logs -f` 로 에러 없는지 확인
- [ ] 브라우저에서 `http://localhost:3000` 접속
- [ ] 브라우저 콘솔에 `ERR_CONNECTION_REFUSED` 없는지 확인

---

## 🆘 여전히 문제가 있다면

### 1. 전체 환경 정보 수집
```bash
# 시스템 정보
docker --version
docker-compose --version
node --version
npm --version

# 컨테이너 상태
docker-compose ps
docker-compose logs --tail=50 service-core
```

### 2. service-core 상세 디버깅
```bash
# 컨테이너 내부 접속
docker-compose exec service-core /bin/bash

# 내부에서 확인
ls -la /app
cat /app/package.json
ls -la /app/node_modules | grep ts-node
npm list ts-node-dev
which ts-node-dev
```

### 3. 로그 파일 저장
```bash
# 모든 로그를 파일로 저장
docker-compose logs > docker-logs.txt
```

---

## 📚 참고 자료

- Docker Compose 공식 문서: https://docs.docker.com/compose/
- Next.js Docker 가이드: https://nextjs.org/docs/deployment
- Node.js Dockerfile Best Practices: https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md

