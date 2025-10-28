# 🚀 여기서 시작하세요!

> **Sprint 8-9 완료 후 가장 먼저 읽을 문서**

---

## 📌 지금 바로 실행할 명령어 (5분)

**터미널에서 순서대로 복사-붙여넣기**:

```bash
# 1. 데이터베이스 마이그레이션
cd /workspace/service-core && npx prisma migrate dev --name sprint_8_9_enhanced_features && npx prisma generate

# 2. Python NumPy 설치
cd /workspace/service-ai && pip install numpy>=1.24.0

# 3. 프론트엔드 빌드
cd /workspace/app-web && npm install && npm run build
```

**성공하면 ✅ 표시됨**

---

## 📚 다음에 읽을 문서 (중요도순)

### 🔴 필수 (반드시 읽기)
1. **[`TODO_FOR_USER.md`](./TODO_FOR_USER.md)** (28KB) ⭐⭐⭐
   - **가장 상세한 작업 가이드**
   - 모든 작업을 빠짐없이 정리
   - 코드 예시 포함
   
2. **[`QUICK_START.md`](./QUICK_START.md)** (8KB) ⭐⭐
   - 빠른 시작 가이드
   - 체크리스트 형식

### 🟡 권장 (기능 이해)
3. **[`SPRINT_8_9_REPORT.md`](./SPRINT_8_9_REPORT.md)** (17KB)
   - 완료된 작업 상세 리포트
   - 기능별 설명

4. **[`CHANGES.md`](./CHANGES.md)** (12KB)
   - 변경 사항 요약
   - 파일 목록

### 🟢 참고 (필요시)
5. **[`docs/USER_ACTION_GUIDE.md`](./docs/USER_ACTION_GUIDE.md)** (18KB)
   - 상세 가이드 (문제 해결 포함)

6. **[`docs/API.md`](./docs/API.md)** (12KB)
   - API 문서 (업데이트됨)
   - 요청/응답 예시

7. **[`PROJECT_BLUEPRINT.md`](./PROJECT_BLUEPRINT.md)** (31KB)
   - 전체 설계도
   - 로드맵

---

## ✅ 필수 작업 요약

### 1️⃣ 지금 실행 (5분)
```bash
# 위의 3개 명령어 실행
```

### 2️⃣ 환경 변수 확인 (2분)
```bash
# service-ai/.env
OPENAI_API_KEY=sk-xxxxx...

# service-core/.env
DATABASE_URL="postgresql://..."
JWT_SECRET=your-secret

# app-web/.env.local
NEXT_PUBLIC_CORE_API_URL=http://localhost:8080
```

### 3️⃣ 서비스 실행 (3개 터미널)
```bash
# 터미널 1
cd /workspace/service-core && npm run dev

# 터미널 2
cd /workspace/service-ai && uvicorn app.main:app --reload --port 8000

# 터미널 3
cd /workspace/app-web && npm run dev
```

**확인**:
- http://localhost:8080/health
- http://localhost:8000/health
- http://localhost:3000

---

## 🎯 다음 단계

### 핵심 작업 (2-3시간)
**프론트엔드 6개 파일의 API 연동**:
1. 프로필 페이지 (2개)
2. 인터뷰 페이지 (1개)
3. 평가 페이지 (1개)
4. 대시보드 (1개)
5. 검색 (1개)

**상세 코드**: [`TODO_FOR_USER.md`](./TODO_FOR_USER.md) → 작업 6 참고

**백엔드 7개 API 구현**:
1. 프로필 수정 API (2개)
2. 알림 API (4개)
3. 검색 API (1개)

**상세 코드**: [`TODO_FOR_USER.md`](./TODO_FOR_USER.md) → 작업 7 참고

---

## 📊 완료 현황

### ✅ 완료된 것
- 프론트엔드 9개 페이지
- 백엔드 평가 시스템
- RAG 기반 질문 생성
- 데이터베이스 스키마
- UI/UX 디자인

### ⏳ 남은 것
- API 연동 (프론트 6개, 백엔드 7개)
- 파일 업로드 (선택)
- 음성 기능 (선택)

---

## 🆘 문제 발생 시

### 빠른 해결
```bash
# 마이그레이션 실패
npx prisma migrate reset

# 빌드 실패
rm -rf .next && npm install && npm run build

# 포트 사용 중
lsof -i :8080
kill -9 [PID]
```

### 상세 가이드
- [`docs/USER_ACTION_GUIDE.md`](./docs/USER_ACTION_GUIDE.md) - 문제 해결 섹션
- [`TODO_FOR_USER.md`](./TODO_FOR_USER.md) - 코드 예시

---

## 🎊 시작!

1. **위의 3개 명령어 실행**
2. **서비스 3개 실행**
3. **http://localhost:3000 접속**
4. **새로운 UI 확인!**

그 다음은 [`TODO_FOR_USER.md`](./TODO_FOR_USER.md)를 보며 API 연동하세요! 🚀

