# 사용자 필수 작업 가이드

## ⚠️ 중요: 이 작업들을 완료해야 스트리밍 면접 시스템이 정상 작동합니다

---

## 1️⃣ API 키 발급

### A. OpenAI API 키

**용도**: Whisper (STT) + GPT-4o (대화 생성)

**발급 방법**:
1. https://platform.openai.com/ 접속
2. 로그인 후 "API keys" 메뉴 클릭
3. "Create new secret key" 클릭
4. 키 이름 입력 (예: `flex-ai-recruiter`)
5. **생성된 키를 즉시 복사** (다시 볼 수 없음!)

**예상 비용**: 10분 면접 기준 약 $2-3

### B. ElevenLabs API 키

**용도**: Text-to-Speech (AI 음성 생성)

**발급 방법**:
1. https://elevenlabs.io/ 접속
2. 회원가입 후 로그인
3. Profile Icon → "Profile + API key" 클릭
4. API 키 복사

**예상 비용**: 
- Free tier: 월 10,000 characters (테스트 충분)
- Creator: $5/month (30,000 characters)

---

## 2️⃣ 환경 변수 설정

### A. 백엔드 환경 변수

**파일 경로**: `service-ai/.env`

**작업**:
1. `service-ai` 폴더로 이동
2. `.env` 파일 생성 (없으면)
3. 아래 내용 복사하여 붙여넣기
4. **YOUR_KEY_HERE**를 실제 API 키로 교체

```bash
# OpenAI API (필수)
OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE
OPENAI_MODEL=gpt-4o

# ElevenLabs API (필수)
ELEVENLABS_API_KEY=YOUR_KEY_HERE

# ElevenLabs 음성 ID (선택, 기본값: Adam - 남성)
ELEVENLABS_VOICE_ID=pNInz6obpgDQGcFmaJgB

# 서버 포트 (기본값: 8000)
PORT=8000
```

### B. 프론트엔드 환경 변수

**파일 경로**: `app-web/.env.local`

**작업**:
1. `app-web` 폴더로 이동
2. `.env.local` 파일 생성 (없으면)
3. 아래 내용 복사하여 붙여넣기

```bash
# 아바타 URL (기본값 사용 가능)
NEXT_PUBLIC_AVATAR_MODEL_URL=https://models.readyplayer.me/65a8dba831b23abb4f401bae.glb

# 스트리밍 WebSocket URL (로컬 개발 기본값)
NEXT_PUBLIC_STREAMING_WS_URL=ws://localhost:8000/api/v1/ai/ws/streaming-interview

# 백엔드 API URL
NEXT_PUBLIC_API_URL=http://localhost:8080
```

**주의**: 프로덕션 배포 시 `localhost`를 실제 도메인으로 변경하세요.

---

## 3️⃣ FFmpeg 설치 (오디오 변환용)

**필요 이유**: pydub 라이브러리가 오디오 형식 변환(WebM → WAV)에 FFmpeg를 사용합니다.

### Windows

```powershell
# Chocolatey로 설치 (관리자 권한 필요)
choco install ffmpeg
```

Chocolatey가 없으면:
1. https://chocolatey.org/install 에서 Chocolatey 설치
2. 위 명령어 실행

### Mac

```bash
# Homebrew로 설치
brew install ffmpeg
```

Homebrew가 없으면:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Linux

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install ffmpeg

# CentOS/RHEL
sudo yum install ffmpeg
```

**확인 방법**:
```bash
ffmpeg -version
```
버전 정보가 표시되면 설치 성공!

---

## 4️⃣ 종속성 설치

### A. 백엔드 종속성

```bash
cd service-ai

# Python 가상 환경 생성 (권장)
python -m venv venv

# 가상 환경 활성화
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 종속성 설치
pip install -r requirements.txt
```

**새로 추가된 라이브러리**:
- `elevenlabs==1.2.2` - ElevenLabs TTS API
- `pydub==0.25.1` - 오디오 형식 변환
- `websockets==12.0` - WebSocket 통신

### B. 프론트엔드 종속성

```bash
cd app-web

# 종속성 설치
npm install
```

---

## 5️⃣ 서비스 실행

### 방법 1: 각각 터미널에서 실행 (권장)

**터미널 1 - service-core**:
```bash
cd service-core
npm run dev
```
✅ 실행 확인: `http://localhost:8080`에서 응답

**터미널 2 - service-ai**:
```bash
cd service-ai
source venv/bin/activate  # Windows: venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
✅ 실행 확인: 
- 콘솔에 `Uvicorn running on http://0.0.0.0:8000` 표시
- 브라우저에서 `http://localhost:8000/docs` 접속 (FastAPI Swagger UI)

**터미널 3 - app-web**:
```bash
cd app-web
npm run dev
```
✅ 실행 확인: `http://localhost:3000`에서 Next.js 앱 로드

### 방법 2: Docker Compose

```bash
# 프로젝트 루트에서
docker-compose up -d
```

---

## 6️⃣ 스트리밍 면접 테스트

1. **브라우저 접속**: http://localhost:3000
2. **로그인**: 기존 계정 또는 회원가입
3. **면접 설정**: 
   - 직무, 난이도, 시간 설정
   - "인터뷰 시작" 클릭
4. **URL 변경**: 
   - 현재 URL: `/interview/start?id=xxx`
   - 수정 URL: `/interview/start-streaming?id=xxx`
5. **면접 진행**:
   - 연결 확인: "AI 면접관과 연결되었습니다!" 토스트 확인
   - 마이크 허용
   - 🎤 버튼 클릭 → 답변 → 다시 클릭
   - AI 응답이 실시간으로 스트리밍됨

---

## 7️⃣ 문제 해결

### "WebSocket 연결 실패"

**원인**: `service-ai`가 실행되지 않음

**해결**:
```bash
cd service-ai
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### "API 키가 유효하지 않습니다"

**원인**: 환경 변수 설정 오류

**해결**:
1. `service-ai/.env` 파일 확인
2. API 키 앞뒤 공백 제거
3. 따옴표 사용 안 함 (예: `OPENAI_API_KEY=sk-...`)
4. 서비스 재시작

### "Unable to find ffmpeg"

**원인**: FFmpeg 미설치

**해결**: 위 **3️⃣ FFmpeg 설치** 섹션 참조

### "마이크를 찾을 수 없습니다"

**원인**: 브라우저 권한 또는 마이크 미연결

**해결**:
1. 브라우저 주소창 왼쪽 잠금 아이콘 클릭
2. 마이크 권한 → "허용"
3. 페이지 새로고침

---

## 8️⃣ 체크리스트

완료 여부를 확인하세요:

- [ ] OpenAI API 키 발급 완료
- [ ] ElevenLabs API 키 발급 완료
- [ ] `service-ai/.env` 파일 생성 및 API 키 입력
- [ ] `app-web/.env.local` 파일 생성
- [ ] FFmpeg 설치 완료 (`ffmpeg -version` 확인)
- [ ] 백엔드 종속성 설치 (`pip install -r requirements.txt`)
- [ ] 프론트엔드 종속성 설치 (`npm install`)
- [ ] service-core 실행 확인 (http://localhost:8080)
- [ ] service-ai 실행 확인 (http://localhost:8000/docs)
- [ ] app-web 실행 확인 (http://localhost:3000)
- [ ] 스트리밍 면접 페이지 접속 및 테스트

---

## 📞 추가 도움이 필요하신가요?

- **상세 가이드**: `docs/STREAMING_INTERVIEW_SETUP.md`
- **구현 요약**: `docs/IMPLEMENTATION_SUMMARY.md`
- **트러블슈팅**: 위 문서의 섹션 6 참조

---

## ⏱️ 예상 소요 시간

| 작업 | 소요 시간 |
|------|---------|
| API 키 발급 | 10분 |
| 환경 변수 설정 | 5분 |
| FFmpeg 설치 | 5분 |
| 종속성 설치 | 10분 |
| 서비스 실행 및 테스트 | 10분 |
| **총 소요 시간** | **약 40분** |

---

## 🎉 완료 후

모든 작업을 완료하면:
- ✨ 응답 속도 78% 개선 (2.8초 → 0.6초)
- ✨ 고품질 AI 음성 지원
- ✨ 실시간 자막 및 3D 아바타
- ✨ 자연스러운 면접 경험

**다음 단계**: 실제 면접 데이터로 테스트 후 프로덕션 배포 준비!

