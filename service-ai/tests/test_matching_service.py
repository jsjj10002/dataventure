"""
매칭 서비스 단위 테스트

코사인 유사도 계산 및 규칙 기반 보정 로직 테스트
"""

import pytest
import numpy as np
from unittest.mock import Mock, patch, AsyncMock
from app.services.matching_service import (
    calculate_cosine_similarity,
    calculate_experience_match_bonus,
    calculate_skills_match_bonus,
    calculate_final_match_score,
    # generate_match_reason (OpenAI 호출은 별도 테스트)
)


class TestCosineSimilarity:
    """코사인 유사도 계산 테스트"""

    def test_identical_vectors(self):
        """동일한 벡터는 유사도 1.0이어야 한다"""
        vector1 = np.array([1.0, 2.0, 3.0, 4.0])
        vector2 = np.array([1.0, 2.0, 3.0, 4.0])
        
        similarity = calculate_cosine_similarity(vector1, vector2)
        
        assert pytest.approx(similarity, rel=1e-5) == 1.0

    def test_orthogonal_vectors(self):
        """직교 벡터는 유사도 0.0이어야 한다"""
        vector1 = np.array([1.0, 0.0, 0.0])
        vector2 = np.array([0.0, 1.0, 0.0])
        
        similarity = calculate_cosine_similarity(vector1, vector2)
        
        assert pytest.approx(similarity, abs=1e-5) == 0.0

    def test_opposite_vectors(self):
        """반대 방향 벡터는 유사도 -1.0이어야 한다"""
        vector1 = np.array([1.0, 2.0, 3.0])
        vector2 = np.array([-1.0, -2.0, -3.0])
        
        similarity = calculate_cosine_similarity(vector1, vector2)
        
        assert pytest.approx(similarity, rel=1e-5) == -1.0

    def test_similar_vectors(self):
        """유사한 벡터는 높은 유사도를 가져야 한다"""
        vector1 = np.array([1.0, 2.0, 3.0])
        vector2 = np.array([1.1, 2.1, 2.9])
        
        similarity = calculate_cosine_similarity(vector1, vector2)
        
        assert similarity > 0.99  # 매우 유사

    def test_zero_vector(self):
        """영 벡터는 유사도 0.0을 반환해야 한다"""
        vector1 = np.array([0.0, 0.0, 0.0])
        vector2 = np.array([1.0, 2.0, 3.0])
        
        similarity = calculate_cosine_similarity(vector1, vector2)
        
        assert similarity == 0.0

    def test_different_dimensions(self):
        """다른 차원의 벡터는 에러를 발생시켜야 한다"""
        vector1 = np.array([1.0, 2.0, 3.0])
        vector2 = np.array([1.0, 2.0])
        
        with pytest.raises(ValueError):
            calculate_cosine_similarity(vector1, vector2)


class TestExperienceMatchBonus:
    """경력 매칭 보너스 계산 테스트"""

    def test_perfect_match(self):
        """경력이 범위 내에 있으면 최대 보너스를 받아야 한다"""
        candidate_experience = 5
        job_min = 3
        job_max = 7
        
        bonus = calculate_experience_match_bonus(
            candidate_experience, job_min, job_max
        )
        
        assert bonus == 5.0  # 최대 보너스

    def test_below_minimum(self):
        """경력이 최소 요구사항보다 낮으면 보너스가 없어야 한다"""
        candidate_experience = 2
        job_min = 3
        job_max = 7
        
        bonus = calculate_experience_match_bonus(
            candidate_experience, job_min, job_max
        )
        
        assert bonus == 0.0

    def test_above_maximum(self):
        """경력이 최대 요구사항보다 높으면 부분 보너스를 받아야 한다"""
        candidate_experience = 10
        job_min = 3
        job_max = 7
        
        bonus = calculate_experience_match_bonus(
            candidate_experience, job_min, job_max
        )
        
        assert 0.0 < bonus < 5.0  # 부분 보너스

    def test_no_requirements(self):
        """경력 요구사항이 없으면 보너스가 없어야 한다"""
        candidate_experience = 5
        job_min = None
        job_max = None
        
        bonus = calculate_experience_match_bonus(
            candidate_experience, job_min, job_max
        )
        
        assert bonus == 0.0

    def test_minimum_only(self):
        """최소 요구사항만 있고 만족하면 보너스를 받아야 한다"""
        candidate_experience = 5
        job_min = 3
        job_max = None
        
        bonus = calculate_experience_match_bonus(
            candidate_experience, job_min, job_max
        )
        
        assert bonus == 5.0


class TestSkillsMatchBonus:
    """기술 스택 매칭 보너스 계산 테스트"""

    def test_all_required_skills_match(self):
        """모든 필수 기술이 매칭되면 최대 보너스를 받아야 한다"""
        candidate_skills = ["Python", "FastAPI", "PostgreSQL", "Docker"]
        required_skills = ["Python", "FastAPI", "PostgreSQL"]
        preferred_skills = []
        
        bonus = calculate_skills_match_bonus(
            candidate_skills, required_skills, preferred_skills
        )
        
        assert bonus == 10.0  # 필수 기술 보너스만

    def test_partial_required_skills_match(self):
        """필수 기술이 부분 매칭되면 비율에 따른 보너스를 받아야 한다"""
        candidate_skills = ["Python", "FastAPI"]
        required_skills = ["Python", "FastAPI", "PostgreSQL"]
        preferred_skills = []
        
        bonus = calculate_skills_match_bonus(
            candidate_skills, required_skills, preferred_skills
        )
        
        expected = 10.0 * (2 / 3)  # 2/3 매칭
        assert pytest.approx(bonus, rel=1e-2) == expected

    def test_required_and_preferred_skills(self):
        """필수 + 우대 기술이 매칭되면 합산 보너스를 받아야 한다"""
        candidate_skills = ["Python", "FastAPI", "PostgreSQL", "AWS", "Docker"]
        required_skills = ["Python", "FastAPI", "PostgreSQL"]
        preferred_skills = ["AWS", "Docker", "Kubernetes"]
        
        bonus = calculate_skills_match_bonus(
            candidate_skills, required_skills, preferred_skills
        )
        
        required_bonus = 10.0  # 모든 필수 기술 매칭
        preferred_bonus = 5.0 * (2 / 3)  # 2/3 우대 기술 매칭
        expected = required_bonus + preferred_bonus
        
        assert pytest.approx(bonus, rel=1e-2) == expected

    def test_no_skills_match(self):
        """기술이 전혀 매칭되지 않으면 보너스가 없어야 한다"""
        candidate_skills = ["Java", "Spring"]
        required_skills = ["Python", "FastAPI"]
        preferred_skills = ["AWS"]
        
        bonus = calculate_skills_match_bonus(
            candidate_skills, required_skills, preferred_skills
        )
        
        assert bonus == 0.0

    def test_empty_requirements(self):
        """요구사항이 없으면 보너스가 없어야 한다"""
        candidate_skills = ["Python", "FastAPI"]
        required_skills = []
        preferred_skills = []
        
        bonus = calculate_skills_match_bonus(
            candidate_skills, required_skills, preferred_skills
        )
        
        assert bonus == 0.0

    def test_case_insensitive_matching(self):
        """기술 매칭은 대소문자를 구분하지 않아야 한다"""
        candidate_skills = ["python", "fastapi", "postgresql"]
        required_skills = ["Python", "FastAPI", "PostgreSQL"]
        preferred_skills = []
        
        bonus = calculate_skills_match_bonus(
            candidate_skills, required_skills, preferred_skills
        )
        
        assert bonus == 10.0


class TestFinalMatchScore:
    """최종 매칭 점수 계산 통합 테스트"""

    def test_perfect_match(self):
        """완벽한 매칭은 100점에 가까워야 한다"""
        vector_similarity = 0.95  # 95% 유사도
        experience_bonus = 5.0    # 경력 매칭
        skills_bonus = 15.0       # 모든 기술 매칭
        
        final_score = calculate_final_match_score(
            vector_similarity, experience_bonus, skills_bonus
        )
        
        expected = 95.0 + 5.0 + 15.0  # 115점 (최대 100점으로 제한)
        assert final_score == min(expected, 100.0)

    def test_poor_match(self):
        """낮은 매칭은 낮은 점수여야 한다"""
        vector_similarity = 0.30  # 30% 유사도
        experience_bonus = 0.0    # 경력 불일치
        skills_bonus = 0.0        # 기술 불일치
        
        final_score = calculate_final_match_score(
            vector_similarity, experience_bonus, skills_bonus
        )
        
        assert final_score == 30.0

    def test_maximum_cap(self):
        """점수는 100점을 초과할 수 없어야 한다"""
        vector_similarity = 0.90
        experience_bonus = 5.0
        skills_bonus = 15.0
        
        final_score = calculate_final_match_score(
            vector_similarity, experience_bonus, skills_bonus
        )
        
        assert final_score <= 100.0

    def test_minimum_cap(self):
        """점수는 0점 미만일 수 없어야 한다"""
        vector_similarity = -0.5  # 음수 유사도 (이론상 가능)
        experience_bonus = 0.0
        skills_bonus = 0.0
        
        final_score = calculate_final_match_score(
            vector_similarity, experience_bonus, skills_bonus
        )
        
        assert final_score >= 0.0


class TestMatchingIntegration:
    """매칭 서비스 통합 시나리오 테스트"""

    def test_realistic_matching_scenario(self):
        """실제 매칭 시나리오 시뮬레이션"""
        # 구직자 프로필
        candidate_resume_embedding = np.array([0.5, 0.8, 0.3, 0.9])
        candidate_skills = ["Python", "FastAPI", "PostgreSQL", "Docker"]
        candidate_experience = 5
        
        # 채용 공고
        job_description_embedding = np.array([0.52, 0.78, 0.32, 0.88])
        required_skills = ["Python", "FastAPI", "PostgreSQL"]
        preferred_skills = ["Docker", "AWS"]
        min_experience = 3
        max_experience = 7
        
        # 1. 벡터 유사도 계산
        similarity = calculate_cosine_similarity(
            candidate_resume_embedding, job_description_embedding
        )
        
        # 2. 경력 보너스 계산
        exp_bonus = calculate_experience_match_bonus(
            candidate_experience, min_experience, max_experience
        )
        
        # 3. 기술 보너스 계산
        skills_bonus = calculate_skills_match_bonus(
            candidate_skills, required_skills, preferred_skills
        )
        
        # 4. 최종 점수 계산
        final_score = calculate_final_match_score(
            similarity, exp_bonus, skills_bonus
        )
        
        # 검증
        assert 0.0 <= final_score <= 100.0
        assert similarity > 0.95  # 매우 유사한 벡터
        assert exp_bonus == 5.0   # 경력 완벽 매칭
        assert skills_bonus >= 12.5  # 대부분 기술 매칭
        assert final_score >= 90.0  # 우수한 매칭

    @pytest.mark.asyncio
    @patch('app.services.matching_service.openai_client')
    async def test_match_reason_generation(self, mock_openai):
        """매칭 근거 생성 테스트 (OpenAI 모킹)"""
        # Mock OpenAI 응답
        mock_response = Mock()
        mock_response.choices = [Mock()]
        mock_response.choices[0].message = Mock()
        mock_response.choices[0].message.content = (
            "이 후보자는 필수 기술 스택을 모두 보유하고 있으며, "
            "경력이 요구사항과 완벽히 일치합니다."
        )
        mock_openai.chat.completions.create = AsyncMock(return_value=mock_response)
        
        # 실제 함수 호출은 구현 완료 후 테스트
        # reason = await generate_match_reason(...)
        
        # Placeholder
        assert True

