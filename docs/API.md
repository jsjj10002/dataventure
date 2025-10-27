# API 상세 문서 (요약)

본 문서는 핵심 엔드포인트, 권한 정책, 개발용 테스트 콘솔 안내를 제공한다. 상세 스키마는 추후 OpenAPI로 대체한다.

## 권한 정책
- RECRUITER 전용: `POST/PUT/DELETE /api/v1/jobs/*`, `GET /api/v1/recommendations/candidates/:jobId`
- CANDIDATE 전용: `GET /api/v1/recommendations/jobs`
- 공용 읽기: `GET /api/v1/jobs`, `GET /api/v1/jobs/:id`

## 인증
- POST `/api/v1/auth/register`
- POST `/api/v1/auth/login`
- GET `/api/v1/auth/me` (JWT)

## 사용자/프로필
- GET `/api/v1/users/:userId/profile`
- PUT `/api/v1/candidates/:candidateId/profile` (JWT)
- PUT `/api/v1/recruiters/:recruiterId/profile` (JWT)

## 채용 공고
- POST `/api/v1/jobs` (RECRUITER)
- GET `/api/v1/jobs`
- GET `/api/v1/jobs/:id`
- PUT `/api/v1/jobs/:id` (RECRUITER - 본인)
- DELETE `/api/v1/jobs/:id` (RECRUITER - 본인)

## 인터뷰(실시간)
- Socket.IO 이벤트
  - client→server: `interview:start`, `interview:message`, `interview:end`
  - server→client: `interview:started`, `interview:processing`, `interview:question`, `interview:ended`, `interview:error`
- REST 조회
  - GET `/api/v1/interviews` (JWT)
  - GET `/api/v1/interviews/:interviewId` (JWT)

## 평가
- GET `/api/v1/evaluations/:interviewId` (JWT)

## 추천/매칭
- GET `/api/v1/recommendations/jobs` (CANDIDATE)
- GET `/api/v1/recommendations/candidates/:jobId` (RECRUITER)

## 개발용 테스트 콘솔
- 프론트 경로 `/test`
- 기능: 인터뷰 시작/메시지/종료, 공고 목록, 추천 공고

## AI 모델 주의사항
- `OPENAI_MODEL=gpt-5` 기본값
- 일부 gpt-5 계열 모델은 `temperature`, `max_tokens` 미지원 → 현재 서버는 해당 옵션을 사용하지 않음

