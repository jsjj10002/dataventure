"""
질문 생성 API 라우터
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.models.question import (
    QuestionGenerationRequest,
    QuestionGenerationResponse
)
from app.services.question_generator import (
    generate_first_question,
    generate_next_question,
    generate_next_question_stream,
    analyze_interview_depth
)
import json

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


@router.post("/generate-question-stream")
async def generate_question_stream(request: QuestionGenerationRequest):
    """
    AI 인터뷰 질문 생성 (Streaming)
    
    Server-Sent Events (SSE)를 통해 실시간으로 질문을 스트리밍합니다.
    응답 지연을 줄이고 사용자 경험을 개선합니다.
    """
    try:
        # 대화 히스토리와 마지막 답변 검증
        if not request.conversationHistory or not request.lastAnswer:
            raise HTTPException(
                status_code=400,
                detail="대화 히스토리와 마지막 답변이 필요합니다."
            )
        
        # 대화 깊이 분석
        conversation_list = [msg.model_dump() for msg in request.conversationHistory]
        depth_analysis = analyze_interview_depth(conversation_list)
        
        if not depth_analysis["should_continue"]:
            # 인터뷰 종료 메시지를 스트리밍으로 전송
            async def closing_stream():
                closing_message = "충분한 대화를 나눴습니다. 마지막으로 하고 싶은 말씀이나 질문이 있으신가요?"
                yield f"data: {json.dumps({'content': closing_message, 'type': 'closing'})}\n\n"
                yield "data: [DONE]\n\n"
            
            return StreamingResponse(
                closing_stream(),
                media_type="text/event-stream"
            )
        
        # 프로필 정보 추출
        candidate_profile = request.candidateProfile.model_dump() if request.candidateProfile else None
        job_posting = request.jobPosting.model_dump() if request.jobPosting else None
        
        # Streaming 응답 생성
        async def event_generator():
            try:
                # OpenAI Streaming 호출
                for content_chunk in generate_next_question_stream(
                    conversation_history=conversation_list,
                    last_answer=request.lastAnswer,
                    candidate_profile=candidate_profile,
                    job_posting=job_posting
                ):
                    # SSE 형식으로 전송
                    yield f"data: {json.dumps({'content': content_chunk})}\n\n"
                
                # 스트리밍 종료 신호
                yield "data: [DONE]\n\n"
                
            except Exception as e:
                print(f"[Question API] Streaming 오류: {e}")
                # 에러 메시지 전송
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
        
        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"  # Nginx 버퍼링 비활성화
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"[Question API] Streaming 엔드포인트 오류: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Streaming 질문 생성 중 오류가 발생했습니다: {str(e)}"
        )

