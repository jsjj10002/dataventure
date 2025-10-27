"""
flex-AI-Recruiter - AI Engine (FastAPI)
Service 2: AI 질문 생성, 답변 분석, 평가, 매칭 알고리즘
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# 환경 변수 로딩
load_dotenv()

# FastAPI 앱 생성
app = FastAPI(
    title="flex-AI-Recruiter AI Engine",
    description="AI 기반 인터뷰 질문 생성, 답변 분석, 평가 및 매칭 서비스",
    version="0.1.0",
)

# CORS 설정 (service-core에서만 접근)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],  # service-core URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ===== Health Check =====
@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "flex-AI-Recruiter AI Engine",
        "status": "healthy",
        "version": "0.1.0",
    }


@app.get("/health")
async def health_check():
    """상세 Health check"""
    openai_api_key = os.getenv("OPENAI_API_KEY")
    
    return {
        "status": "healthy",
        "openai_configured": bool(openai_api_key and openai_api_key.startswith("sk-")),
        "embedding_model": os.getenv("EMBEDDING_MODEL", "jhgan/ko-sbert-nli"),
    }


# ===== AI API 라우터 =====
from app.api import question, evaluation, matching

app.include_router(question.router, prefix="/internal/ai", tags=["Question Generation"])
app.include_router(evaluation.router, prefix="/internal/ai", tags=["Evaluation"])
app.include_router(matching.router, prefix="/internal/ai", tags=["Matching"])


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
    )

