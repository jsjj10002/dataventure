# 스트리밍 면접 시스템 설정 가이드

## 개요

이 문서는 **Whisper + GPT-4o + ElevenLabs** 스트리밍 파이프라인을 사용하는 실시간 음성 면접 시스템의 설정 방법을 안내합니다.

---

## 1. 필수 API 키 발급

### A. OpenAI API 키 (Whisper + GPT-4o)

1. **OpenAI 계정 생성**
   - https://platform.openai.com/ 접속
   - 회원가입 또는 로그인

2. **API 키 발급**
   - Dashboard → "API keys" 메뉴
   - "Create new secret key" 클릭
   - 키 이름 입력 (예: `flex-ai-recruiter`)
   - 생성된 키를 **안전하게 저장** (한 번만 표시됨)

3. **요금 플랜**
   - Pay-as-you-go (사용량 기반 과금)
   - 10분 면접 예상 비용: 약 $2-3
   - Whisper: $0.006/분
   - GPT-4o: $0.15/1K tokens
   - 공식 가격 정보: https://openai.com/api/pricing

### B. ElevenLabs API 키 (TTS)

1. **ElevenLabs 계정 생성**
   - https://elevenlabs.io/ 접속
   - 회원가입 또는 로그인

2. **API 키 발급**
   - Profile Icon → "Profile + API key" 메뉴
   - API 키 복사

3. **음성 ID 선택 (선택사항)**
   - Library → Voices
   - 원하는 음성 선택 (예: Adam - 남성 음성)
   - Voice ID 복사 (예: `pNInz6obpgDQGcFmaJgB`)

4. **요금 플랜**
   - Free tier: 월 10,000 characters (테스트용)
   - Creator: $5/month (30,000 characters)
   - Pro: $22/month (100,000 characters)
   - 10분 면접 예상 비용: ~1,000 characters
   - 공식 가격 정보: https://elevenlabs.io/pricing

---

## 2. 환경 변수 설정

### A. 백엔드 환경 변수 (`service-ai/.env`)

`service-ai` 폴더에 `.env` 파일을 생성하고 다음 내용을 입력하세요:

```bash
# OpenAI API
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4o

# ElevenLabs API
ELEVENLABS_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxx

# ElevenLabs 음성 ID (기본값: Adam - 남성)
ELEVENLABS_VOICE_ID=pNInz6obpgDQGcFmaJgB

# 서버 포트
PORT=8000
```

**주의사항:**
- `OPENAI_API_KEY`를 실제 발급받은 키로 교체하세요.
- `ELEVENLABS_API_KEY`를 실제 발급받은 키로 교체하세요.
- `.env` 파일은 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다.

### B. 프론트엔드 환경 변수 (`app-web/.env.local`)

`app-web` 폴더에 `.env.local` 파일을 생성하고 다음 내용을 입력하세요:

```bash
# 아바타 URL
NEXT_PUBLIC_AVATAR_MODEL_URL=https://models.readyplayer.me/65a8dba831b23abb4f401bae.glb

# 스트리밍 WebSocket URL
NEXT_PUBLIC_STREAMING_WS_URL=ws://localhost:8000/api/v1/ai/ws/streaming-interview

# 백엔드 API URL
NEXT_PUBLIC_API_URL=http://localhost:8080
```

**주의사항:**
- 프로덕션 배포 시 `localhost`를 실제 도메인으로 변경하세요.
- `.env.local` 파일은 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다.

---

## 3. 종속성 설치

### A. 백엔드 (`service-ai`)

```bash
cd service-ai

# Python 가상 환경 생성 (선택사항, 권장)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 종속성 설치
pip install -r requirements.txt
```

**새로 추가된 라이브러리:**
- `elevenlabs==1.2.2` - ElevenLabs TTS API 클라이언트
- `pydub==0.25.1` - 오디오 형식 변환 (WebM → WAV)
- `websockets==12.0` - WebSocket 통신

**pydub 추가 설정 (오디오 변환용):**

pydub는 FFmpeg 또는 libav가 필요합니다.

- **Windows**: 
  ```bash
  # Chocolatey로 설치
  choco install ffmpeg
  ```

- **Mac**:
  ```bash
  brew install ffmpeg
  ```

- **Linux**:
  ```bash
  sudo apt-get install ffmpeg
  ```

### B. 프론트엔드 (`app-web`)

```bash
cd app-web

# 종속성 설치
npm install
```

---

## 4. 서비스 실행

### 개발 환경

터미널을 3개 열어 각각 실행하세요:

#### 터미널 1: 백엔드 Core (service-core)

```bash
cd service-core
npm run dev
```
- 실행 포트: `http://localhost:8080`

#### 터미널 2: 백엔드 AI (service-ai)

```bash
cd service-ai
source venv/bin/activate  # 가상 환경 활성화
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- 실행 포트: `http://localhost:8000`

#### 터미널 3: 프론트엔드 (app-web)

```bash
cd app-web
npm run dev
```
- 실행 포트: `http://localhost:3000`

### Docker Compose (추천)

```bash
# 프로젝트 루트에서
docker-compose up -d
```

---

## 5. 스트리밍 면접 사용 방법

### A. 접속 방법

1. 브라우저에서 `http://localhost:3000` 접속
2. 로그인
3. 면접 설정 페이지에서 "인터뷰 시작"
4. **스트리밍 버전 사용**: URL을 `/interview/start-streaming?id=...`으로 변경

### B. 면접 진행

1. **연결 확인**: "AI 면접관과 연결되었습니다!" 토스트 메시지 확인
2. **AI 인사말**: 자동으로 AI의 인사말이 재생됩니다
3. **답변하기**:
   - 마이크 버튼(🎤) 클릭
   - 답변을 말합니다
   - 다시 마이크 버튼 클릭하여 전송
4. **AI 응답**: 
   - 텍스트가 실시간으로 스트리밍됩니다 (자막)
   - 음성이 자동 재생됩니다
5. **반복**: 3-4 과정을 반복합니다
6. **종료**: 우측 상단 "인터뷰 종료" 버튼 클릭

### C. 기능

| 기능 | 설명 |
|------|------|
| **실시간 음성 인식** | Whisper API로 사용자 음성을 실시간으로 텍스트로 변환 |
| **스트리밍 AI 응답** | GPT-4o가 텍스트를 스트리밍으로 생성 (즉시 표시) |
| **고품질 TTS** | ElevenLabs로 AI 응답을 자연스러운 음성으로 변환 |
| **자막** | 사용자와 AI의 대화를 실시간 자막으로 표시 |
| **웹캠 PiP** | 사용자 웹캠을 Picture-in-Picture로 표시 |
| **타이머** | 남은 시간 표시 |

---

## 6. 트러블슈팅

### A. "WebSocket 연결 실패" 에러

**원인**: 백엔드 AI 서비스가 실행되지 않음

**해결**:
```bash
cd service-ai
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

백엔드 로그에서 다음 메시지 확인:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### B. "API 키가 유효하지 않습니다" 에러

**원인**: 환경 변수가 설정되지 않았거나 잘못됨

**해결**:
1. `service-ai/.env` 파일 확인
2. API 키가 올바르게 입력되었는지 확인
3. 서비스 재시작

### C. "pydub 에러: Unable to find ffmpeg"

**원인**: FFmpeg가 설치되지 않음

**해결**:
- Windows: `choco install ffmpeg`
- Mac: `brew install ffmpeg`
- Linux: `sudo apt-get install ffmpeg`

설치 후 서비스 재시작

### D. "마이크를 찾을 수 없습니다"

**원인**: 브라우저 권한 또는 마이크 미연결

**해결**:
1. 브라우저 주소창 왼쪽의 잠금 아이콘 클릭
2. 마이크 권한을 "허용"으로 변경
3. 페이지 새로고침
4. 마이크가 물리적으로 연결되어 있는지 확인

### E. "음성이 재생되지 않음"

**원인**: 오디오 코덱 문제 또는 ElevenLabs API 오류

**해결**:
1. 브라우저 콘솔에서 에러 확인 (F12)
2. ElevenLabs API 키 확인
3. 브라우저가 오디오 자동 재생을 허용하는지 확인
4. Chrome 권장 (최상의 호환성)

---

## 7. 성능 최적화

### A. 응답 속도 개선

| 최적화 항목 | 방법 |
|------------|------|
| **네트워크 지연** | 백엔드를 사용자와 가까운 리전에 배포 |
| **Whisper 모델** | `whisper-1` (기본값) 유지 |
| **GPT-4o 토큰** | `max_tokens=150`으로 제한 (현재 설정) |
| **ElevenLabs 지연** | `optimize_streaming_latency=1` 설정 (현재 적용) |

### B. 비용 최적화

| 항목 | 비용 절감 방법 |
|------|---------------|
| **OpenAI** | GPT-4o-mini 사용 고려 (저렴하지만 품질 낮음) |
| **ElevenLabs** | 무료 tier 활용 (테스트용) |
| **Whisper** | 음성 청크 크기 최적화 (1초 단위) |

---

## 8. 다음 단계

- [ ] 프로덕션 배포 (AWS, GCP, Azure)
- [ ] HTTPS/WSS 적용
- [ ] 면접 녹화 기능 추가
- [ ] 실시간 평가 기능 추가
- [ ] 다국어 지원

---

## 9. 참고 자료

- **OpenAI Whisper API**: https://platform.openai.com/docs/guides/speech-to-text
- **OpenAI GPT-4o**: https://platform.openai.com/docs/models/gpt-4o
- **ElevenLabs API**: https://elevenlabs.io/docs/api-reference/streaming
- **FastAPI WebSocket**: https://fastapi.tiangolo.com/advanced/websockets
- **Next.js 환경변수**: https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables

---

## 10. 지원

문제가 발생하면:
1. 이 문서의 트러블슈팅 섹션 확인
2. 백엔드 로그 확인 (`service-ai` 터미널)
3. 브라우저 콘솔 확인 (F12)
4. GitHub Issues에 문의

