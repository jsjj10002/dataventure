"""
임베딩 생성 서비스
Sentence-Transformers를 사용한 텍스트 임베딩
"""

from typing import List
from sentence_transformers import SentenceTransformer
import numpy as np

# 한국어 특화 모델 로드 (전역 변수로 한 번만 로드)
# jhgan/ko-sbert-nli: 한국어 NLI 데이터로 학습된 SBERT 모델
_model = None


def get_embedding_model():
    """임베딩 모델 싱글톤 패턴으로 로드"""
    global _model
    if _model is None:
        print("[Embedding Service] 임베딩 모델 로딩 중...")
        _model = SentenceTransformer('jhgan/ko-sbert-nli')
        print("[Embedding Service] 임베딩 모델 로딩 완료")
    return _model


def generate_embedding(text: str) -> List[float]:
    """
    텍스트를 벡터로 변환
    
    Args:
        text: 임베딩할 텍스트
    
    Returns:
        768차원 벡터 (리스트)
    """
    if not text or not text.strip():
        # 빈 텍스트는 영벡터 반환
        return [0.0] * 768
    
    model = get_embedding_model()
    embedding = model.encode(text, convert_to_numpy=True)
    
    # NumPy 배열을 Python 리스트로 변환
    return embedding.tolist()


def generate_candidate_embedding(
    resume_text: str = None,
    skills: List[str] = None,
    experience: int = None,
    desired_position: str = None
) -> List[float]:
    """
    구직자 프로필을 임베딩으로 변환
    
    Args:
        resume_text: 이력서 텍스트
        skills: 기술 스택 리스트
        experience: 경력 (년)
        desired_position: 희망 직무
    
    Returns:
        768차원 벡터
    """
    # 텍스트 조합
    text_parts = []
    
    if resume_text:
        text_parts.append(resume_text)
    
    if skills:
        text_parts.append(f"기술 스택: {', '.join(skills)}")
    
    if experience is not None:
        text_parts.append(f"경력: {experience}년")
    
    if desired_position:
        text_parts.append(f"희망 직무: {desired_position}")
    
    combined_text = " ".join(text_parts)
    
    return generate_embedding(combined_text)


def generate_job_posting_embedding(
    title: str = None,
    description: str = None,
    position: str = None,
    requirements: List[str] = None,
    preferred_skills: List[str] = None
) -> List[float]:
    """
    채용 공고를 임베딩으로 변환
    
    Args:
        title: 공고 제목
        description: 공고 설명
        position: 직무
        requirements: 필수 요건
        preferred_skills: 우대 사항
    
    Returns:
        768차원 벡터
    """
    # 텍스트 조합
    text_parts = []
    
    if title:
        text_parts.append(f"제목: {title}")
    
    if position:
        text_parts.append(f"직무: {position}")
    
    if description:
        text_parts.append(description)
    
    if requirements:
        text_parts.append(f"필수 요건: {', '.join(requirements)}")
    
    if preferred_skills:
        text_parts.append(f"우대 사항: {', '.join(preferred_skills)}")
    
    combined_text = " ".join(text_parts)
    
    return generate_embedding(combined_text)


def calculate_cosine_similarity(embedding1: List[float], embedding2: List[float]) -> float:
    """
    두 임베딩 간의 코사인 유사도 계산
    
    Args:
        embedding1: 첫 번째 벡터
        embedding2: 두 번째 벡터
    
    Returns:
        코사인 유사도 (-1 ~ 1, 높을수록 유사)
    """
    vec1 = np.array(embedding1)
    vec2 = np.array(embedding2)
    
    # 코사인 유사도 = (A · B) / (||A|| * ||B||)
    dot_product = np.dot(vec1, vec2)
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    
    if norm1 == 0 or norm2 == 0:
        return 0.0
    
    similarity = dot_product / (norm1 * norm2)
    
    return float(similarity)


def calculate_matching_score(
    candidate_embedding: List[float],
    job_posting_embedding: List[float],
    candidate_profile: dict = None,
    job_posting: dict = None
) -> float:
    """
    매칭 점수 계산 (벡터 유사도 + 규칙 기반)
    
    Args:
        candidate_embedding: 구직자 임베딩
        job_posting_embedding: 공고 임베딩
        candidate_profile: 구직자 프로필 (선택)
        job_posting: 공고 정보 (선택)
    
    Returns:
        매칭 점수 (0-100)
    """
    # 1. 벡터 유사도 (0-1)
    cosine_sim = calculate_cosine_similarity(candidate_embedding, job_posting_embedding)
    
    # 2. 벡터 유사도를 0-100 스케일로 변환
    # -1~1 범위를 0~100으로 변환: (sim + 1) / 2 * 100
    base_score = ((cosine_sim + 1) / 2) * 100
    
    # 3. 규칙 기반 보정 (선택)
    bonus = 0
    
    if candidate_profile and job_posting:
        # 경력 매칭 보정
        candidate_exp = candidate_profile.get("experience", 0)
        min_exp = job_posting.get("experienceMin", 0)
        max_exp = job_posting.get("experienceMax", 100)
        
        if min_exp <= candidate_exp <= max_exp:
            bonus += 5  # 경력 범위 내면 +5점
        
        # 기술 스택 매칭 보정
        candidate_skills = set(candidate_profile.get("skills", []))
        required_skills = set(job_posting.get("requirements", []))
        preferred_skills = set(job_posting.get("preferredSkills", []))
        
        if candidate_skills & required_skills:  # 교집합
            # 필수 기술 매칭 개수에 비례
            match_ratio = len(candidate_skills & required_skills) / len(required_skills) if required_skills else 0
            bonus += match_ratio * 10  # 최대 +10점
        
        if candidate_skills & preferred_skills:
            # 우대 기술 매칭
            match_ratio = len(candidate_skills & preferred_skills) / len(preferred_skills) if preferred_skills else 0
            bonus += match_ratio * 5  # 최대 +5점
    
    # 4. 최종 점수 (0-100 범위로 클램핑)
    final_score = min(100, base_score + bonus)
    
    return round(final_score, 2)

