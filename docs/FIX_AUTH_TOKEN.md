# 인증 토큰 이슈 해결

## 문제 상황

채용담당자가 로그인 후 대시보드 접근 시 "인증 토큰이 제공되지 않았습니다" 에러가 발생하며 로그인 페이지와 홈 화면을 무한 반복하는 문제

## 원인 분석

### localStorage 키 불일치

1. **로그인 시 (authStore.ts)**:
   ```typescript
   localStorage.setItem('token', token);  // 'token' 키로 저장
   ```

2. **API 요청 시 (api-client.ts)**:
   ```typescript
   localStorage.getItem('auth_token');  // 'auth_token' 키를 찾음 ❌
   ```

3. **결과**:
   - 토큰을 찾지 못함 → Authorization 헤더 없음 → 401 Unauthorized
   - 401 에러 발생 → 로그인 페이지로 리다이렉트 → 무한 반복

## 해결 방법

### ✅ 수정 완료

모든 파일에서 localStorage 키를 `'token'`으로 통일했습니다:

- `app-web/src/lib/api-client.ts`
- `app-web/src/stores/auth-store.ts`
- `app-web/src/stores/authStore.ts`

### 사용자 조치사항

#### 1. 기존 localStorage 정리

브라우저에서 다음 작업을 수행하세요:

**방법 1: 개발자 도구 (권장)**
```javascript
// 개발자 도구(F12) → Console 탭에서 실행
localStorage.removeItem('auth_token');  // 이전 키 삭제
localStorage.clear();  // 또는 전체 초기화
```

**방법 2: 시크릿 모드**
- Ctrl + Shift + N (Chrome) 또는 Ctrl + Shift + P (Firefox)
- 새 시크릿 창에서 로그인

#### 2. 서비스 재시작

```bash
# app-web 재시작
cd app-web
npm run dev
```

#### 3. 로그인 테스트

1. http://localhost:3000 접속
2. 로그아웃 (이미 로그인되어 있다면)
3. 다시 로그인
4. 대시보드 접근 확인

## 검증

### localStorage 확인

개발자 도구 → Application 탭 → Local Storage → http://localhost:3000

**정상 상태:**
```
token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
user: {"id":"...","email":"...","role":"RECRUITER"}
auth-storage: {...}  // Zustand persist
```

### API 요청 확인

개발자 도구 → Network 탭 → API 요청 확인

**정상 요청 헤더:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 예방 조치

앞으로 이런 문제를 방지하기 위해:

1. ✅ localStorage 키를 `'token'`으로 통일
2. ✅ API 클라이언트 인터셉터에서 일관된 키 사용
3. ✅ 중복 파일 제거 (auth-store.ts는 거의 미사용)

---

**수정 완료 날짜:** 2025-10-29  
**관련 이슈:** 채용담당자 대시보드 401 Unauthorized 무한 루프

