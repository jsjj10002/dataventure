# Python 기반 AI Engine Dockerfile (uv 사용)
FROM python:3.11-slim AS base

# 작업 디렉토리 설정
WORKDIR /app

# Python 환경 설정
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# uv 바이너리를 공식 distroless 이미지에서 복사 (Astral 공식 권장 방법)
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# 시스템 의존성 설치
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# 의존성 설치 단계
FROM base AS deps

# requirements.txt 복사 및 설치 (uv 사용)
COPY requirements.txt .
RUN uv pip install --system --no-cache -r requirements.txt

# 실행 단계
FROM base AS runner

# 프로덕션 환경 설정
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# 보안을 위한 non-root 사용자 생성
RUN addgroup --system --gid 1001 python && \
    adduser --system --uid 1001 --gid 1001 fastapi

# 의존성 복사
COPY --from=deps /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=deps /usr/local/bin /usr/local/bin

# 애플리케이션 코드 복사
COPY --chown=fastapi:python ./app ./app

USER fastapi

EXPOSE 8000

ENV PORT=8000

# 헬스체크
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health').read()"

# Uvicorn 서버 실행
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

