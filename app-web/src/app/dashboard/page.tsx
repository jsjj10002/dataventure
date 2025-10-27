'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout, fetchCurrentUser } = useAuthStore();

  useEffect(() => {
    // 인증되지 않은 경우 로그인 페이지로 리다이렉트
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // 토큰은 있지만 user 정보가 없는 경우 (새로고침)
    if (isAuthenticated && !user) {
      fetchCurrentUser();
    }
  }, [isAuthenticated, isLoading, user, router, fetchCurrentUser]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            flex-AI-Recruiter
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow px-6 py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            환영합니다, {user.name}님!
          </h2>
          
          <div className="space-y-4">
            <div className="border-l-4 border-primary-500 pl-4">
              <p className="text-sm text-gray-500">이메일</p>
              <p className="text-lg font-medium">{user.email}</p>
            </div>

            <div className="border-l-4 border-primary-500 pl-4">
              <p className="text-sm text-gray-500">역할</p>
              <p className="text-lg font-medium">
                {user.role === 'CANDIDATE' ? '구직자' : 
                 user.role === 'RECRUITER' ? '채용담당자' : '관리자'}
              </p>
            </div>

            <div className="border-l-4 border-primary-500 pl-4">
              <p className="text-sm text-gray-500">가입일</p>
              <p className="text-lg font-medium">
                {new Date(user.createdAt).toLocaleDateString('ko-KR')}
              </p>
            </div>
          </div>

          {/* 다음 단계 안내 */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              다음 단계
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.role === 'CANDIDATE' && (
                <>
                  <Link
                    href="/interview"
                    className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all cursor-pointer block"
                  >
                    <h4 className="font-medium text-gray-900 mb-2">
                      AI 인터뷰 시작
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      대화형 AI와 함께 인터뷰를 진행하고 피드백을 받으세요.
                    </p>
                    <span className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                      인터뷰 시작하기 →
                    </span>
                  </Link>
                  <Link
                    href="/recommendations"
                    className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all cursor-pointer block"
                  >
                    <h4 className="font-medium text-gray-900 mb-2">AI 추천 공고</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      AI가 분석한 맞춤 채용 공고를 확인하세요.
                    </p>
                    <span className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                      추천 공고 보기 →
                    </span>
                  </Link>
                  <Link
                    href="/jobs"
                    className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all cursor-pointer block"
                  >
                    <h4 className="font-medium text-gray-900 mb-2">전체 채용 공고</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      모든 채용 공고를 둘러보세요.
                    </p>
                    <span className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                      공고 보기 →
                    </span>
                  </Link>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">프로필 관리</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      이력서와 프로필을 관리하세요.
                    </p>
                    <span className="text-sm text-gray-400">준비 중</span>
                  </div>
                </>
              )}
              {user.role === 'RECRUITER' && (
                <>
                  <Link href="/test" className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 transition-colors block">
                    <h4 className="font-medium text-gray-900 mb-2">
                      채용 공고 등록
                    </h4>
                    <p className="text-sm text-gray-600">
                      새로운 채용 공고를 등록하고 AI가 후보자를 매칭해드립니다.
                    </p>
                  </Link>
                  <Link href="/test" className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 transition-colors block">
                    <h4 className="font-medium text-gray-900 mb-2">
                      추천 후보자 확인
                    </h4>
                    <p className="text-sm text-gray-600">
                      AI가 분석한 후보자 평가 결과를 확인하세요.
                    </p>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

