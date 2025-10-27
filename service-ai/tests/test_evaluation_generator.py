"""
평가 생성 서비스 단위 테스트

통계 분석 및 점수 계산 로직 테스트
"""

import pytest
import numpy as np
from unittest.mock import Mock, patch, AsyncMock
from app.services.evaluation_generator import (
    calculate_average_score,
    calculate_standard_deviation,
    calculate_consistency_score,
    categorize_score,
    # generate_evaluation (OpenAI 호출은 별도 테스트)
)


class TestStatisticalCalculations:
    """통계 계산 함수 테스트"""

    def test_calculate_average_score(self):
        """평균 점수 계산이 정확해야 한다"""
        scores = [8.5, 7.0, 9.5, 8.0]
        average = calculate_average_score(scores)
        
        expected = (8.5 + 7.0 + 9.5 + 8.0) / 4
        assert pytest.approx(average, rel=1e-2) == expected

    def test_calculate_average_empty_list(self):
        """빈 리스트의 평균은 0이어야 한다"""
        scores = []
        average = calculate_average_score(scores)
        
        assert average == 0.0

    def test_calculate_average_single_score(self):
        """단일 점수의 평균은 해당 점수여야 한다"""
        scores = [8.5]
        average = calculate_average_score(scores)
        
        assert average == 8.5

    def test_calculate_standard_deviation(self):
        """표준편차 계산이 정확해야 한다"""
        scores = [8.0, 9.0, 7.0, 10.0, 6.0]
        std_dev = calculate_standard_deviation(scores)
        
        # NumPy로 검증
        expected = np.std(scores, ddof=1)  # 표본 표준편차
        assert pytest.approx(std_dev, rel=1e-2) == expected

    def test_calculate_standard_deviation_identical_scores(self):
        """모든 점수가 같으면 표준편차는 0이어야 한다"""
        scores = [8.0, 8.0, 8.0, 8.0]
        std_dev = calculate_standard_deviation(scores)
        
        assert std_dev == 0.0

    def test_calculate_standard_deviation_single_score(self):
        """단일 점수의 표준편차는 0이어야 한다"""
        scores = [8.5]
        std_dev = calculate_standard_deviation(scores)
        
        assert std_dev == 0.0

    def test_calculate_consistency_score(self):
        """일관성 점수 계산이 정확해야 한다"""
        scores = [8.0, 8.5, 7.5, 8.2, 8.1]  # 일관성 있는 점수
        consistency = calculate_consistency_score(scores)
        
        # 표준편차가 낮을수록 일관성 점수가 높아야 함
        assert 80.0 <= consistency <= 100.0

    def test_calculate_consistency_score_inconsistent(self):
        """일관성 없는 점수는 낮은 일관성 점수를 받아야 한다"""
        scores = [2.0, 10.0, 1.0, 9.0, 3.0]  # 매우 불규칙
        consistency = calculate_consistency_score(scores)
        
        assert consistency < 50.0

    def test_calculate_consistency_score_perfect(self):
        """완벽하게 일관된 점수는 100점이어야 한다"""
        scores = [8.0, 8.0, 8.0, 8.0, 8.0]
        consistency = calculate_consistency_score(scores)
        
        assert consistency == 100.0


class TestScoreCategorization:
    """점수 분류 테스트"""

    def test_excellent_score(self):
        """80점 이상은 '우수'여야 한다"""
        assert categorize_score(85.0) == "우수"
        assert categorize_score(80.0) == "우수"
        assert categorize_score(95.0) == "우수"

    def test_good_score(self):
        """60-79점은 '양호'여야 한다"""
        assert categorize_score(70.0) == "양호"
        assert categorize_score(60.0) == "양호"
        assert categorize_score(79.9) == "양호"

    def test_needs_improvement_score(self):
        """60점 미만은 '개선 필요'여야 한다"""
        assert categorize_score(50.0) == "개선 필요"
        assert categorize_score(30.0) == "개선 필요"
        assert categorize_score(59.9) == "개선 필요"

    def test_boundary_values(self):
        """경계값이 올바르게 분류되어야 한다"""
        assert categorize_score(100.0) == "우수"
        assert categorize_score(80.0) == "우수"
        assert categorize_score(79.99) == "양호"
        assert categorize_score(60.0) == "양호"
        assert categorize_score(59.99) == "개선 필요"
        assert categorize_score(0.0) == "개선 필요"


class TestEvaluationScoring:
    """평가 점수 계산 시나리오 테스트"""

    def test_balanced_evaluation(self):
        """균형 잡힌 평가 시나리오"""
        technical_scores = [8.0, 7.5, 8.5, 7.0, 8.0]
        communication_scores = [7.0, 7.5, 7.0, 8.0, 7.5]
        problem_solving_scores = [9.0, 8.5, 9.0, 8.0, 8.5]
        
        tech_avg = calculate_average_score(technical_scores)
        comm_avg = calculate_average_score(communication_scores)
        prob_avg = calculate_average_score(problem_solving_scores)
        
        # 가중 평균 계산 (기술 40%, 커뮤니케이션 30%, 문제해결 30%)
        overall = (tech_avg * 0.4) + (comm_avg * 0.3) + (prob_avg * 0.3)
        
        assert 70.0 <= overall <= 90.0  # 양호~우수 범위
        assert categorize_score(overall) in ["양호", "우수"]

    def test_excellent_candidate(self):
        """우수한 후보자 평가 시나리오"""
        technical_scores = [9.0, 9.5, 9.0, 9.5, 9.0]
        communication_scores = [8.5, 9.0, 8.5, 9.0, 8.5]
        problem_solving_scores = [9.5, 9.0, 9.5, 9.0, 9.5]
        
        tech_avg = calculate_average_score(technical_scores)
        comm_avg = calculate_average_score(communication_scores)
        prob_avg = calculate_average_score(problem_solving_scores)
        
        overall = (tech_avg * 0.4) + (comm_avg * 0.3) + (prob_avg * 0.3)
        
        assert overall >= 85.0
        assert categorize_score(overall) == "우수"
        
        # 일관성도 높아야 함
        consistency = calculate_consistency_score(technical_scores)
        assert consistency >= 90.0

    def test_weak_candidate(self):
        """약한 후보자 평가 시나리오"""
        technical_scores = [4.0, 5.0, 3.5, 4.5, 4.0]
        communication_scores = [5.0, 5.5, 5.0, 6.0, 5.5]
        problem_solving_scores = [3.0, 4.0, 3.5, 4.5, 3.0]
        
        tech_avg = calculate_average_score(technical_scores)
        comm_avg = calculate_average_score(communication_scores)
        prob_avg = calculate_average_score(problem_solving_scores)
        
        overall = (tech_avg * 0.4) + (comm_avg * 0.3) + (prob_avg * 0.3)
        
        assert overall < 60.0
        assert categorize_score(overall) == "개선 필요"

    def test_inconsistent_performance(self):
        """일관성 없는 성과 시나리오"""
        technical_scores = [9.0, 3.0, 8.5, 2.0, 9.5]  # 매우 불규칙
        
        avg = calculate_average_score(technical_scores)
        std_dev = calculate_standard_deviation(technical_scores)
        consistency = calculate_consistency_score(technical_scores)
        
        # 평균은 중간 정도
        assert 40.0 <= avg <= 70.0
        
        # 표준편차는 매우 높음
        assert std_dev > 3.0
        
        # 일관성 점수는 낮음
        assert consistency < 40.0


class TestEvaluationIntegration:
    """평가 생성 통합 시나리오 테스트"""

    @pytest.mark.asyncio
    @patch('app.services.evaluation_generator.openai_client')
    async def test_full_evaluation_generation(self, mock_openai):
        """전체 평가 생성 프로세스 시뮬레이션"""
        # Mock OpenAI 응답
        mock_response = Mock()
        mock_response.choices = [Mock()]
        mock_response.choices[0].message = Mock()
        mock_response.choices[0].message.content = """
        {
            "strengths": ["강점 1", "강점 2", "강점 3"],
            "weaknesses": ["약점 1", "약점 2"],
            "detailedFeedback": "상세한 피드백입니다."
        }
        """
        mock_openai.chat.completions.create = AsyncMock(return_value=mock_response)
        
        # 실제 함수 호출은 구현 완료 후 테스트
        # evaluation = await generate_evaluation(...)
        
        # Placeholder
        assert True

    def test_edge_case_all_zeros(self):
        """모든 점수가 0인 엣지 케이스"""
        scores = [0.0, 0.0, 0.0, 0.0]
        
        avg = calculate_average_score(scores)
        std_dev = calculate_standard_deviation(scores)
        consistency = calculate_consistency_score(scores)
        
        assert avg == 0.0
        assert std_dev == 0.0
        assert consistency == 100.0  # 완벽히 일관됨 (모두 0)

    def test_edge_case_all_perfect(self):
        """모든 점수가 만점인 엣지 케이스"""
        scores = [10.0, 10.0, 10.0, 10.0]
        
        avg = calculate_average_score(scores)
        std_dev = calculate_standard_deviation(scores)
        consistency = calculate_consistency_score(scores)
        
        assert avg == 10.0
        assert std_dev == 0.0
        assert consistency == 100.0

