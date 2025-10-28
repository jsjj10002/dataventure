# ⚡ 빠른 시작 가이드

> **Sprint 8-9 완료 후 사용자 필수 작업**  
> **예상 소요 시간**: 30분 (API 연동 제외)

---

## 🚀 즉시 실행할 명령어 (순서대로)

### ✅ 1단계: 데이터베이스 마이그레이션 (5분)
```bash
cd /workspace/service-core
npx prisma migrate dev --name sprint_8_9_enhanced_features
npx prisma generate
```

**결과 확인**:
```bash
npx prisma migrate status
# ✅ 출력: "Database schema is up to date!"
```

---

### ✅ 2단계: Python 의존성 설치 (2분)
```bash
cd /workspace/service-ai

# NumPy 추가
echo "numpy>=1.24.0" >> requirements.txt
pip install numpy>=1.24.0
```

**결과 확인**:
```bash
python -c "import numpy; print('NumPy OK:', numpy.__version__)"
# ✅ 출력: "NumPy OK: 1.24.3"
```

---

### ✅ 3단계: 프론트엔드 빌드 테스트 (3분)
```bash
cd /workspace/app-web
npm install
npm run build
```

**결과 확인**:
```
✅ 출력에서 다음 확인:
✓ Compiled successfully
✓ Creating an optimized production build
✓ Generating static pages (10/10)
```

---

### ✅ 4단계: 서비스 실행 (3개 터미널 필요)

#### 터미널 1: service-core
```bash
cd /workspace/service-core
npm run dev
```
**확인**: http://localhost:8080/health

#### 터미널 2: service-ai
```bash
cd /workspace/service-ai
uvicorn app.main:app --reload --port 8000
```
**확인**: http://localhost:8000/health

#### 터미널 3: app-web
```bash
cd /workspace/app-web
npm run dev
```
**확인**: http://localhost:3000

---

## 📋 사용자가 직접 해야 하는 작업 체크리스트

### 🔴 필수 작업 (반드시 수행)

#### [ ] 1. 환경 변수 확인
**service-ai/.env**:
```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-5
DATABASE_URL="postgresql://user:password@host:5432/flex_recruiter"
PORT=8000
```

**service-core/.env**:
```env
PORT=8080
DATABASE_URL="postgresql://user:password@host:5432/flex_recruiter?schema=public"
JWT_SECRET=your-super-secret-jwt-key-change-in-production
AI_SERVICE_URL=http://localhost:8000
```

**app-web/.env.local**:
```env
NEXT_PUBLIC_CORE_API_URL=http://localhost:8080
NEXT_PUBLIC_SOCKET_URL=http://localhost:8080
```

---

#### [ ] 2. API 연동 코드 작성 (가장 중요!)

**현재 상태**: 프론트엔드에 `// TODO: API 호출` 주석으로 표시됨  
**필요 작업**: 실제 API 호출 코드로 교체

**연동이 필요한 파일 (6개)**:

1. **`/workspace/app-web/src/app/profile/candidate/page.tsx`**
   - `handleSubmit` 함수: 프로필 저장 API
   - 파일 업로드 핸들러

2. **`/workspace/app-web/src/app/profile/recruiter/page.tsx`**
   - `handleSubmit` 함수: 회사 정보 저장 API

3. **`/workspace/app-web/src/app/interview/start/page.tsx`**
   - `handleSend` 함수: 메시지 전송
   - Socket.IO 연결 및 이벤트 처리

4. **`/workspace/app-web/src/app/evaluation/[id]/page.tsx`**
   - 평가 결과 조회 API
   - 실제 데이터로 차트 업데이트

5. **`/workspace/app-web/src/app/dashboard/recruiter/page.tsx`**
   - 지원자 목록 조회 API
   - 통계 데이터 조회 API

6. **`/workspace/app-web/src/app/search/page.tsx`**
   - 검색 API 연동

**API 연동 예시 코드**: `/workspace/docs/USER_ACTION_GUIDE.md` 참고

---

#### [ ] 3. 파일 업로드 기능 구현 (선택, 하지만 권장)

##### 3-1. GCP Cloud Storage 버킷 생성
```bash
# GCP Console에서 수동 생성
버킷 이름: flex-recruiter-files
위치: asia-northeast3 (서울)
```

또는 CLI:
```bash
gsutil mb -p YOUR_PROJECT_ID -c STANDARD -l asia-northeast3 gs://flex-recruiter-files/
```

##### 3-2. 서비스 계정 권한 설정
```bash
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:service-core@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"
```

##### 3-3. service-core에 업로드 라우터 추가
```bash
cd /workspace/service-core
npm install multer @google-cloud/storage
```

**파일 생성**: `/workspace/service-core/src/routes/upload.ts`
**내용**: `/workspace/docs/USER_ACTION_GUIDE.md` Step 7 참고

##### 3-4. 환경 변수 추가
```env
# service-core/.env
GCP_PROJECT_ID=your-gcp-project-id
GCP_STORAGE_BUCKET=flex-recruiter-files
```

---

#### [ ] 4. 백엔드 API 엔드포인트 구현

**현재 상태**: 프론트엔드는 준비됨, 백엔드 API 일부 미구현  
**필요 작업**: 다음 엔드포인트 구현

**구현이 필요한 API (service-core)**:
```
✅ 이미 구현됨:
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- GET /api/v1/auth/me
- POST /api/v1/jobs
- GET /api/v1/jobs
- Socket.IO 인터뷰 기본 기능

⏳ 구현 필요:
1. PUT /api/v1/candidates/:id/profile (확장된 필드)
2. PUT /api/v1/recruiters/:id/profile (확장된 필드)
3. GET /api/v1/notifications
4. PATCH /api/v1/notifications/:id/read
5. DELETE /api/v1/notifications/:id
6. GET /api/v1/search
7. POST /api/v1/upload (파일 업로드)
```

**AI 서비스 엔드포인트 추가 (service-ai)**:
```
⏳ 구현 필요:
1. POST /internal/ai/evaluate-enhanced (향상된 평가)
2. POST /internal/ai/generate-question-enhanced (RAG 기반 질문)
```

**작업 방법**:
1. `/workspace/service-core/src/controllers/` 에 컨트롤러 추가
2. `/workspace/service-core/src/routes/` 에 라우터 추가
3. `/workspace/service-ai/app/api/` 에 엔드포인트 추가

---

### 🟡 선택 작업 (기능 향상)

#### [ ] 5. 음성 기능 구현
```bash
cd /workspace/service-ai
pip install openai-whisper
```

**구현**:
- STT: OpenAI Whisper
- TTS: OpenAI TTS API
- 실시간 음성 인터뷰

---

#### [ ] 6. 3D 아바타 통합
```bash
cd /workspace/app-web
npm install @readyplayerme/rpm-react
# 또는
npm install react-avatar
```

---

#### [ ] 7. 프로덕션 배포

**프론트엔드 (Vercel)**:
```bash
npm i -g vercel
cd /workspace/app-web
vercel --prod
```

**백엔드 (GCP Cloud Run)**:
```bash
# service-core
cd /workspace/service-core
gcloud run deploy service-core \
  --source . \
  --region asia-northeast3

# service-ai
cd /workspace/service-ai
gcloud run deploy service-ai \
  --source . \
  --region asia-northeast3
```

---

## 🧪 테스트 (권장)

### 단위 테스트
```bash
# 백엔드 Core
cd /workspace/service-core
npm test

# 백엔드 AI
cd /workspace/service-ai
pytest

# 프론트엔드
cd /workspace/app-web
npm test
```

### E2E 테스트
```bash
cd /workspace/app-web
npx playwright test
```

---

## 📊 최종 체크리스트

### 완료 확인
- [ ] 데이터베이스 마이그레이션 완료
- [ ] Python NumPy 설치 완료
- [ ] 프론트엔드 빌드 성공
- [ ] 3개 서비스 모두 실행됨
- [ ] Health check 응답 확인
- [ ] 홈 페이지 로드 확인

### API 연동 확인
- [ ] 프로필 저장 API
- [ ] 인터뷰 Socket.IO 연동
- [ ] 평가 결과 조회 API
- [ ] 알림 API
- [ ] 검색 API

### 파일 업로드 (선택)
- [ ] GCP Storage 버킷 생성
- [ ] 서비스 계정 권한 설정
- [ ] 업로드 라우터 구현
- [ ] 프론트엔드 업로드 핸들러

---

## 🆘 문제 발생 시

### 빠른 해결 방법

**마이그레이션 실패**:
```bash
npx prisma migrate reset
npx prisma db push --accept-data-loss
```

**빌드 에러**:
```bash
rm -rf .next node_modules
npm install
npm run build
```

**서버 실행 안 됨**:
```bash
# 포트 사용 중 확인
lsof -i :8080
lsof -i :8000
lsof -i :3000

# 프로세스 종료
kill -9 [PID]
```

---

## 📚 참고 문서

1. **상세 가이드**: `/workspace/docs/USER_ACTION_GUIDE.md` (800 라인)
2. **API 문서**: `/workspace/docs/API.md` (업데이트됨)
3. **변경 사항**: `/workspace/CHANGES.md`
4. **작업 리포트**: `/workspace/SPRINT_8_9_REPORT.md`
5. **전체 설계도**: `/workspace/PROJECT_BLUEPRINT.md`

---

**시작하기**: 위의 1-4단계를 순서대로 실행하세요! 🚀

