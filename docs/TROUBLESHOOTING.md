# 트러블슈팅 가이드

> flex-AI-Recruiter 프로젝트의 일반적인 문제 해결 방법

## 목차

1. [AI 인터뷰 질문 생성 실패](#1-ai-인터뷰-질문-생성-실패)
2. [채용담당자 프로필 저장 실패](#2-채용담당자-프로필-저장-실패)
3. [Next.js ChunkLoadError](#3-nextjs-chunkloaderror)
4. [Service-AI 연결 실패](#4-service-ai-연결-실패)
5. [데이터베이스 연결 오류](#5-데이터베이스-연결-오류)
6. [로그인 후 무한 리다이렉트 (401 Unauthorized)](#6-로그인-후-무한-리다이렉트-401-unauthorized)

---

## 1. AI 인터뷰 질문 생성 실패

### 증상
- AI 인터뷰 설정 페이지(`/interview/setup`)에서 질문 생성 시 60-90초 타임아웃 발생
- "질문 생성에 실패했습니다" 토스트 메시지 표시

### 원인
1. `service-ai` 서비스가 실행되지 않음
2. `OPENAI_API_KEY`가 설정되지 않거나 잘못됨
3. OpenAI API 연결 문제

### 해결 방법

#### Step 1: service-ai 실행 확인

```bash
# Windows
cd service-ai
uvicorn app.main:app --reload --port 8000

# 또는 start.bat 사용
start.bat
```

브라우저에서 http://localhost:8000/health 접속하여 확인:
```json
{
  "status": "healthy",
  "openai_configured": true,
  "openai_connection": true,
  "embedding_model": "jhgan/ko-sbert-nli",
  "openai_model": "gpt-4o"
}
```

#### Step 2: OPENAI_API_KEY 확인

**파일:** `service-ai/.env`

```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4o
PORT=8000
```

**확인 사항:**
- API 키가 `sk-`로 시작하는지 확인
- 따옴표 없이 직접 입력 (예: ~~`"sk-..."`~~ → `sk-...`)
- 공백이나 줄바꿈 없이 입력

#### Step 3: OpenAI API 키 테스트

```bash
cd service-ai
python check-health.py
```

**성공 예시:**
```
✓ OPENAI_API_KEY: sk-proj-xxxxx... (설정됨)
✓ OpenAI API 연결 성공
✓ gpt-4o 모델 사용 가능
✓ 질문 생성 성공
```

#### Step 4: API 키 발급 (필요 시)

1. https://platform.openai.com/ 접속
2. 로그인 → "API keys" 메뉴
3. "Create new secret key" 클릭
4. 생성된 키를 즉시 복사 (다시 볼 수 없음!)
5. `service-ai/.env` 파일에 붙여넣기

---

## 2. 채용담당자 프로필 저장 실패

### 증상
- 프로필 저장 시 500 Internal Server Error
- 콘솔에 `Unknown argument 'companyLogoUrl'` 에러 표시

### 원인
- 백엔드 Prisma 스키마 필드명 불일치 (수정 완료)

### 해결 방법

**이미 수정되었습니다.** 다음 사항을 확인하세요:

1. **service-core 재시작**
   ```bash
   cd service-core
   npm run dev
   ```

2. **브라우저 캐시 삭제**
   - Ctrl + Shift + R (하드 리프레시)
   - 또는 개발자 도구 → Network 탭 → "Disable cache" 체크

---

## 3. Next.js ChunkLoadError

### 증상
- 대시보드 또는 특정 페이지 접근 시 다음 에러 발생:
  ```
  ChunkLoadError: Loading chunk app/layout failed.
  ```

### 원인
- Next.js 빌드 캐시(`.next` 폴더) 손상
- Hot Module Replacement (HMR) 오류

### 해결 방법

#### 즉시 해결 (Windows)

```cmd
cd app-web
rmdir /s /q .next
npm run dev
```

#### 즉시 해결 (Linux/Mac)

```bash
cd app-web
rm -rf .next
npm run dev
```

#### 또는 clean 스크립트 사용

**package.json에 추가:**
```json
{
  "scripts": {
    "clean": "rm -rf .next && rm -rf node_modules/.cache",
    "dev:clean": "npm run clean && npm run dev"
  }
}
```

**사용:**
```bash
npm run dev:clean
```

---

## 4. Service-AI 연결 실패

### 증상
- 프론트엔드에서 "AI 서비스에 연결할 수 없습니다" 에러
- `ERR_NETWORK` 또는 `ECONNREFUSED` 에러

### 해결 방법

#### 1. service-ai 실행 확인
```bash
# Windows
cd service-ai
start.bat

# Linux/Mac
cd service-ai
sh start.sh
```

#### 2. 포트 충돌 확인
```bash
# Windows
netstat -ano | findstr :8000

# Linux/Mac
lsof -i :8000
```

포트가 사용 중이면:
- 해당 프로세스 종료
- 또는 `.env` 파일에서 `PORT=8001`로 변경

#### 3. 환경 변수 확인

**app-web/.env.local**
```bash
NEXT_PUBLIC_AI_API_URL=http://localhost:8000
```

---

## 5. 데이터베이스 연결 오류

### 증상
- service-core 시작 시 Prisma 연결 오류
- "Can't reach database server" 에러

### 해결 방법

#### 1. PostgreSQL 실행 확인

```bash
# Docker 컨테이너 상태 확인
docker ps

# PostgreSQL 재시작 (필요 시)
docker restart flex-postgres
```

#### 2. DATABASE_URL 확인

**service-core/.env**
```bash
DATABASE_URL="postgresql://postgres:비밀번호@localhost:5432/flex_recruiter?schema=public"
```

#### 3. 연결 테스트

```bash
cd service-core
npx prisma db push
npx prisma studio
```

---

## 6. 로그인 후 무한 리다이렉트 (401 Unauthorized)

### 증상
- 로그인 후 대시보드 접근 시 "인증 토큰이 제공되지 않았습니다" 에러
- 로그인 페이지 ↔ 홈 화면을 무한 반복
- 콘솔에 401 Unauthorized 에러 반복 출력

### 원인
- localStorage 키 불일치 (`'token'` vs `'auth_token'`)
- 이전 버전의 토큰이 잘못된 키로 저장됨

### 해결 방법

#### Step 1: localStorage 정리

**방법 1: 정리 페이지 사용 (권장)**
```
http://localhost:3000/clear-storage.html
```
→ "이전 토큰만 삭제" 버튼 클릭

**방법 2: 개발자 도구**
```javascript
// F12 → Console 탭
localStorage.removeItem('auth_token');  // 이전 키 삭제
localStorage.clear();  // 또는 전체 초기화
```

**방법 3: 시크릿 모드**
- Ctrl + Shift + N (Chrome)
- 시크릿 창에서 다시 로그인

#### Step 2: 로그아웃 후 재로그인

1. 현재 세션 로그아웃
2. 브라우저 새로고침 (Ctrl + F5)
3. 다시 로그인
4. 대시보드 접근 테스트

#### Step 3: 검증

**localStorage 확인** (F12 → Application → Local Storage):
```
✓ token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
✓ user: {"id":"...","email":"...","role":"RECRUITER"}
✓ auth-storage: {...}
```

**API 요청 헤더 확인** (F12 → Network):
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 예방

이 문제는 **수정 완료**되었습니다. 새로 로그인하는 사용자는 영향받지 않습니다.

---

## 추가 도움말

### 모든 서비스 재시작

**Windows:**
```cmd
# 전체 종료
stop-all.bat

# 전체 시작
start-all.bat
```

### 로그 확인

- **service-core**: 터미널 출력
- **service-ai**: 터미널 출력
- **app-web**: 브라우저 콘솔 (F12)

### 문제가 계속되는 경우

1. 모든 서비스 종료
2. Docker 컨테이너 재시작
3. 캐시 삭제 (`.next`, `node_modules/.cache`)
4. 종속성 재설치 (`npm install`, `pip install -r requirements.txt`)
5. 서비스 순서대로 재시작:
   - PostgreSQL (Docker)
   - service-core
   - service-ai
   - app-web

---

## 문의

문제가 해결되지 않으면 다음 정보와 함께 문의하세요:

1. 에러 메시지 전체 (스크린샷)
2. 실행 중인 서비스 목록
3. 환경 변수 설정 (API 키 제외)
4. 브라우저 콘솔 로그

