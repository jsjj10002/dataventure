"""
평가 및 피드백 생성 서비스
통계 분석 결과를 바탕으로 종합 평가 생성
"""

from typing import Dict, List
from openai import OpenAI
import os
import json

# OpenAI 클라이언트 초기화
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def generate_comprehensive_feedback(
    analyzed_answers: List[Dict],
    aggregate_scores: Dict,
    candidate_profile: Dict = None,
    job_posting: Dict = None
) -> Dict:
    """
    종합 평가 및 피드백 생성
    
    Args:
        analyzed_answers: 분석된 답변 리스트
        aggregate_scores: 집계 점수
        candidate_profile: 구직자 프로필
        job_posting: 채용 공고
    
    Returns:
        평가 결과 딕셔너리 (strengths, weaknesses, recommendations, summary)
    """
    
    system_prompt = """당신은 HR 평가 전문가이자 커리어 코치입니다.
인터뷰 답변 분석 결과를 바탕으로 종합적이고 건설적인 피드백을 제공하세요.

피드백 작성 원칙:
1. 객관적 데이터에 기반한 평가
2. 구체적인 예시 포함
3. 긍정적이고 건설적인 톤
4. 실행 가능한 개선 방안 제시
5. 한국어로 작성

JSON 형식으로 응답하세요:
{
  "strengths": ["강점 1", "강점 2", "강점 3"],
  "weaknesses": ["약점 1", "약점 2"],
  "recommendations": ["개선 방안 1", "개선 방안 2", "개선 방안 3"],
  "summary": "전체 평가 요약",
  "technical_feedback": "기술 역량 상세 피드백",
  "communication_feedback": "커뮤니케이션 상세 피드백",
  "problem_solving_feedback": "문제 해결 능력 상세 피드백"
}"""

    # 컨텍스트 구성
    context_parts = [
        "다음은 인터뷰 답변 분석 결과입니다.\n",
        f"\n## 통계 요약",
        f"- 기술 역량 평균: {aggregate_scores['technical_avg']}/10",
        f"- 커뮤니케이션 평균: {aggregate_scores['communication_avg']}/10",
        f"- 문제 해결 능력 평균: {aggregate_scores['problem_solving_avg']}/10",
        f"- 종합 평균: {aggregate_scores['overall_avg']}/10",
        f"- 일관성: {aggregate_scores['consistency']}/10",
        f"- 분석된 답변 수: {aggregate_scores['answer_count']}개\n"
    ]
    
    # 상위 3개 답변 (점수 기준)
    sorted_answers = sorted(
        analyzed_answers,
        key=lambda x: (x["technical_score"] + x["communication_score"] + x["problem_solving_score"]) / 3,
        reverse=True
    )
    
    context_parts.append("\n## 우수 답변 예시 (상위 3개)")
    for i, ans in enumerate(sorted_answers[:3], 1):
        avg_score = (ans["technical_score"] + ans["communication_score"] + ans["problem_solving_score"]) / 3
        context_parts.append(f"\n{i}. 평균 점수: {avg_score:.1f}/10")
        context_parts.append(f"   질문: {ans['question'][:100]}...")
        context_parts.append(f"   답변: {ans['answer'][:100]}...")
        context_parts.append(f"   키워드: {', '.join(ans.get('keywords', []))}")
    
    # 하위 답변 (개선 필요)
    context_parts.append("\n## 개선 필요 답변")
    for i, ans in enumerate(sorted_answers[-2:], 1):
        avg_score = (ans["technical_score"] + ans["communication_score"] + ans["problem_solving_score"]) / 3
        context_parts.append(f"\n{i}. 평균 점수: {avg_score:.1f}/10")
        context_parts.append(f"   질문: {ans['question'][:100]}...")
        context_parts.append(f"   답변: {ans['answer'][:100]}...")
    
    if candidate_profile:
        skills = candidate_profile.get("skills", [])
        if skills:
            context_parts.append(f"\n## 지원자 기술 스택\n{', '.join(skills)}")
    
    if job_posting:
        position = job_posting.get("position")
        if position:
            context_parts.append(f"\n## 지원 직무\n{position}")
    
    context_parts.append("\n위 정보를 바탕으로 종합 평가와 피드백을 작성해주세요.")
    
    user_prompt = "\n".join(context_parts)
    
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=1500,
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        
        # 필수 필드 검증
        required_fields = ["strengths", "weaknesses", "recommendations", "summary"]
        for field in required_fields:
            if field not in result:
                result[field] = []
        
        return result
        
    except Exception as e:
        print(f"[Evaluation Generator] 피드백 생성 오류: {e}")
        # 기본 피드백 반환
        return {
            "strengths": ["성실하게 인터뷰에 참여하셨습니다."],
            "weaknesses": ["평가 중 오류가 발생했습니다."],
            "recommendations": ["다시 시도해주세요."],
            "summary": "평가 생성 중 오류가 발생했습니다.",
            "technical_feedback": "분석 오류",
            "communication_feedback": "분석 오류",
            "problem_solving_feedback": "분석 오류"
        }


def calculate_final_scores(aggregate_scores: Dict) -> Dict:
    """
    최종 점수 계산 (0-100 스케일로 변환)
    
    Args:
        aggregate_scores: 집계 점수 (0-10 스케일)
    
    Returns:
        최종 점수 딕셔너리 (0-100 스케일)
    """
    
    return {
        "technicalScore": round(aggregate_scores["technical_avg"] * 10, 2),
        "communicationScore": round(aggregate_scores["communication_avg"] * 10, 2),
        "problemSolvingScore": round(aggregate_scores["problem_solving_avg"] * 10, 2),
        "overallScore": round(aggregate_scores["overall_avg"] * 10, 2)
    }


def generate_complete_evaluation(
    conversation_history: List[Dict],
    candidate_profile: Dict = None,
    job_posting: Dict = None
) -> Dict:
    """
    완전한 평가 생성 (전체 프로세스)
    
    Args:
        conversation_history: 전체 대화 기록
        candidate_profile: 구직자 프로필
        job_posting: 채용 공고
    
    Returns:
        완전한 평가 결과
    """
    
    from app.services.answer_analyzer import (
        analyze_all_answers,
        calculate_aggregate_scores
    )
    
    # 1. 모든 답변 분석
    analyzed_answers = analyze_all_answers(conversation_history)
    
    # 2. 집계 점수 계산
    aggregate_scores = calculate_aggregate_scores(analyzed_answers)
    
    # 3. 최종 점수 계산 (0-100 스케일)
    final_scores = calculate_final_scores(aggregate_scores)
    
    # 4. 종합 피드백 생성
    feedback = generate_comprehensive_feedback(
        analyzed_answers,
        aggregate_scores,
        candidate_profile,
        job_posting
    )
    
    # 5. 결과 통합
    return {
        "scores": final_scores,
        "statistics": aggregate_scores,
        "feedback": feedback,
        "analyzed_answers": analyzed_answers
    }

