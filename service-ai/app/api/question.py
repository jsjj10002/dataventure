"""
질문 생성 API 라우터
"""

from fastapi import APIRouter, HTTPException
from app.models.question import (
    QuestionGenerationRequest,
    QuestionGenerationResponse
)
from app.services.question_generator import (
    generate_first_question,
    generate_next_question,
    analyze_interview_depth
)

router = APIRouter()


@router.post("/generate-question", response_model=QuestionGenerationResponse)
async def generate_question(request: QuestionGenerationRequest):
    """
    AI 인터뷰 질문 생성
    
    첫 번째 질문 또는 대화 히스토리 기반 꼬리 질문 생성
    """
    try:
        # 첫 번째 질문 생성
        if request.isFirstQuestion:
            candidate_profile = request.candidateProfile.model_dump() if request.candidateProfile else None
            job_posting = request.jobPosting.model_dump() if request.jobPosting else None
            
            question = generate_first_question(
                candidate_profile=candidate_profile,
                job_posting=job_posting
            )
            
            return QuestionGenerationResponse(
                question=question,
                questionType="open"
            )
        
        # 다음 질문 생성 (대화 히스토리 기반)
        else:
            if not request.conversationHistory or not request.lastAnswer:
                raise HTTPException(
                    status_code=400,
                    detail="대화 히스토리와 마지막 답변이 필요합니다."
                )
            
            # 대화 깊이 분석
            conversation_list = [msg.model_dump() for msg in request.conversationHistory]
            depth_analysis = analyze_interview_depth(conversation_list)
            
            if not depth_analysis["should_continue"]:
                # 인터뷰 종료 권장
                return QuestionGenerationResponse(
                    question="충분한 대화를 나눴습니다. 마지막으로 하고 싶은 말씀이나 질문이 있으신가요?",
                    questionType="closing"
                )
            
            candidate_profile = request.candidateProfile.model_dump() if request.candidateProfile else None
            job_posting = request.jobPosting.model_dump() if request.jobPosting else None
            
            question = generate_next_question(
                conversation_history=conversation_list,
                last_answer=request.lastAnswer,
                candidate_profile=candidate_profile,
                job_posting=job_posting
            )
            
            return QuestionGenerationResponse(
                question=question,
                questionType="follow-up"
            )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"[Question API] 질문 생성 오류: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"질문 생성 중 오류가 발생했습니다: {str(e)}"
        )

