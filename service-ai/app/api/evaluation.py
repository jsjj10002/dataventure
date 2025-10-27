"""
평가 생성 API 라우터
"""

from fastapi import APIRouter, HTTPException
from app.models.evaluation import (
    EvaluationRequest,
    EvaluationResponse
)
from app.services.evaluation_generator import generate_complete_evaluation

router = APIRouter()


@router.post("/generate-evaluation", response_model=EvaluationResponse)
async def generate_evaluation(request: EvaluationRequest):
    """
    인터뷰 평가 생성
    
    전체 대화 기록을 분석하여 종합 평가 및 피드백 생성
    """
    try:
        if not request.conversationHistory or len(request.conversationHistory) < 2:
            raise HTTPException(
                status_code=400,
                detail="최소 2개 이상의 대화 기록이 필요합니다."
            )
        
        # 대화 히스토리 변환
        conversation_list = [
            {"role": msg["role"], "content": msg["content"]}
            for msg in request.conversationHistory
        ]
        
        # 프로필 및 공고 정보
        candidate_profile = request.candidateProfile if request.candidateProfile else None
        job_posting = request.jobPosting if request.jobPosting else None
        
        # 평가 생성
        evaluation_result = generate_complete_evaluation(
            conversation_history=conversation_list,
            candidate_profile=candidate_profile,
            job_posting=job_posting
        )
        
        return EvaluationResponse(
            scores=evaluation_result["scores"],
            statistics=evaluation_result["statistics"],
            feedback=evaluation_result["feedback"],
            message="평가가 성공적으로 생성되었습니다."
        )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"[Evaluation API] 평가 생성 오류: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"평가 생성 중 오류가 발생했습니다: {str(e)}"
        )

