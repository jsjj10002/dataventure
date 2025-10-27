'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import apiClient from '@/lib/api-client';

interface EvaluationScores {
  technical: number;
  communication: number;
  problemSolving: number;
  overall: number;
}

interface EvaluationFeedback {
  strengths: string[];
  weaknesses: string[];
  summary: string;
}

interface EvaluationData {
  id: string;
  interviewId: string;
  scores: EvaluationScores;
  feedback: EvaluationFeedback;
  matchingScore?: number;
  matchingReason?: string;
  createdAt: string;
  interview: {
    id: string;
    status: string;
    startedAt: string;
    completedAt: string;
    jobPosting?: {
      title: string;
      position: string;
    };
  };
}

export default function EvaluationPage({ params }: { params: { interviewId: string } }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [evaluation, setEvaluation] = useState<EvaluationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    fetchEvaluation();
  }, [isAuthenticated, params.interviewId]);

  const fetchEvaluation = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.get(`/api/v1/evaluations/${params.interviewId}`);
      setEvaluation(response.data.evaluation);
    } catch (err: any) {
      console.error('평가 조회 실패:', err);
      setError(err.response?.data?.message || '평가 결과를 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">평가 결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">오류 발생</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            대시보드로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (!evaluation) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-600';
    if (score >= 60) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">인터뷰 평가 결과</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← 대시보드로
          </button>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 인터뷰 정보 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">인터뷰 정보</h2>
          <div className="grid grid-cols-2 gap-4">
            {evaluation.interview.jobPosting && (
              <>
                <div>
                  <p className="text-sm text-gray-500">공고</p>
                  <p className="font-medium">{evaluation.interview.jobPosting.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">직무</p>
                  <p className="font-medium">{evaluation.interview.jobPosting.position}</p>
                </div>
              </>
            )}
            <div>
              <p className="text-sm text-gray-500">완료 시간</p>
              <p className="font-medium">
                {new Date(evaluation.interview.completedAt).toLocaleString('ko-KR')}
              </p>
            </div>
          </div>
        </div>

        {/* 종합 점수 */}
        <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg shadow-lg p-8 mb-6 text-white">
          <h2 className="text-2xl font-bold mb-2">종합 점수</h2>
          <div className="flex items-end">
            <span className="text-6xl font-bold">{evaluation.scores.overall.toFixed(1)}</span>
            <span className="text-2xl mb-2 ml-2">/ 100</span>
          </div>
          <p className="mt-2 text-primary-100">
            {evaluation.scores.overall >= 80 ? '우수한 성과입니다!' :
             evaluation.scores.overall >= 60 ? '양호한 성과입니다.' :
             '개선이 필요합니다.'}
          </p>
        </div>

        {/* 세부 점수 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">세부 평가</h2>
          <div className="space-y-6">
            {/* 기술 역량 */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">기술 역량</span>
                <span className={`text-sm font-bold ${getScoreColor(evaluation.scores.technical)}`}>
                  {evaluation.scores.technical.toFixed(1)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${getScoreBgColor(evaluation.scores.technical)} transition-all duration-500`}
                  style={{ width: `${evaluation.scores.technical}%` }}
                ></div>
              </div>
            </div>

            {/* 커뮤니케이션 */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">커뮤니케이션</span>
                <span className={`text-sm font-bold ${getScoreColor(evaluation.scores.communication)}`}>
                  {evaluation.scores.communication.toFixed(1)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${getScoreBgColor(evaluation.scores.communication)} transition-all duration-500`}
                  style={{ width: `${evaluation.scores.communication}%` }}
                ></div>
              </div>
            </div>

            {/* 문제 해결 능력 */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">문제 해결 능력</span>
                <span className={`text-sm font-bold ${getScoreColor(evaluation.scores.problemSolving)}`}>
                  {evaluation.scores.problemSolving.toFixed(1)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${getScoreBgColor(evaluation.scores.problemSolving)} transition-all duration-500`}
                  style={{ width: `${evaluation.scores.problemSolving}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* 평가 요약 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">전체 평가</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{evaluation.feedback.summary}</p>
        </div>

        {/* 강점 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-green-700 mb-4">💪 강점</h2>
          <ul className="space-y-2">
            {evaluation.feedback.strengths.map((strength, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span className="text-gray-700">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 약점 및 개선 방안 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-yellow-700 mb-4">📈 개선 방안</h2>
          <ul className="space-y-2">
            {evaluation.feedback.weaknesses.map((weakness, index) => (
              <li key={index} className="flex items-start">
                <span className="text-yellow-600 mr-2">→</span>
                <span className="text-gray-700">{weakness}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/interview')}
            className="flex-1 px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            다시 인터뷰 시작
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
          >
            대시보드로
          </button>
        </div>
      </main>
    </div>
  );
}

