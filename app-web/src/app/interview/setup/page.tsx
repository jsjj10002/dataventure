'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, MessageSquare, Clock, Target, Loader2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/authStore';
import { interviewAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function InterviewSetupPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  
  // 인터뷰 설정
  const [mode, setMode] = useState<'PRACTICE' | 'REAL'>('PRACTICE');
  const [isVoiceMode, setIsVoiceMode] = useState(true);
  const [duration, setDuration] = useState(15); // 분
  const [isLoading, setIsLoading] = useState(false);

  // 인증 확인
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다.');
      router.push('/login');
      return;
    }
    
    if (user?.role !== 'CANDIDATE') {
      toast.error('구직자만 인터뷰를 진행할 수 있습니다.');
      router.push('/');
      return;
    }
  }, [isAuthenticated, user]);

  // 인터뷰 시작
  const handleStartInterview = async () => {
    if (!user) {
      toast.error('사용자 정보를 찾을 수 없습니다.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 백엔드에 인터뷰 시작 요청
      const response = await interviewAPI.start({
        mode: mode,
        duration: duration,
      });
      
      const { interviewId } = response.data;
      
      toast.success('인터뷰가 생성되었습니다!');
      
      // 인터뷰 진행 페이지로 이동
      router.push(`/interview/start?id=${interviewId}`);
    } catch (error: any) {
      console.error('인터뷰 시작 실패:', error);
      toast.error(error.response?.data?.error || '인터뷰 시작에 실패했습니다.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">AI 인터뷰 설정</h1>
          <p className="mt-2 text-gray-600">
            인터뷰 모드와 설정을 선택하세요
          </p>
        </div>

        <div className="mx-auto max-w-3xl space-y-6">
          {/* 모드 선택 */}
          <Card>
            <CardHeader>
              <CardTitle>인터뷰 모드 선택</CardTitle>
              <CardDescription>
                연습 모드는 자유롭게 연습할 수 있으며, 실전 모드는 결과가 프로필에 반영됩니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {/* 연습 모드 */}
                <button
                  type="button"
                  onClick={() => setMode('PRACTICE')}
                  className={`flex flex-col items-start gap-3 rounded-lg border-2 p-6 text-left transition-all ${
                    mode === 'PRACTICE'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full p-2 ${
                      mode === 'PRACTICE' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Target className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">연습 모드</h3>
                      <p className="text-sm text-gray-600">자유로운 연습</p>
                    </div>
                  </div>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• 채팅/음성 모드 선택 가능</li>
                    <li>• 시간 제한 자유 설정 (5~20분)</li>
                    <li>• 프로필에 반영되지 않음</li>
                    <li>• 스크립트 및 피드백 제공</li>
                  </ul>
                </button>

                {/* 실전 모드 */}
                <button
                  type="button"
                  onClick={() => setMode('REAL')}
                  className={`flex flex-col items-start gap-3 rounded-lg border-2 p-6 text-left transition-all ${
                    mode === 'REAL'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full p-2 ${
                      mode === 'REAL' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Play className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">실전 모드</h3>
                      <p className="text-sm text-gray-600">공식 평가</p>
                    </div>
                  </div>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• 음성 모드만 가능</li>
                    <li>• 15분 고정</li>
                    <li>• 프로필에 결과 반영</li>
                    <li>• 채용담당자가 확인 가능</li>
                  </ul>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* 음성/채팅 모드 선택 (연습 모드만) */}
          {mode === 'PRACTICE' && (
            <Card>
              <CardHeader>
                <CardTitle>대화 방식 선택</CardTitle>
                <CardDescription>
                  채팅 또는 음성으로 인터뷰를 진행할 수 있습니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {/* 음성 모드 */}
                  <button
                    type="button"
                    onClick={() => setIsVoiceMode(true)}
                    className={`flex items-center gap-3 rounded-lg border-2 p-4 transition-all ${
                      isVoiceMode
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Mic className="h-6 w-6 text-primary" />
                    <div className="text-left">
                      <h4 className="font-medium">음성 모드</h4>
                      <p className="text-sm text-gray-600">실제 면접과 유사</p>
                    </div>
                  </button>

                  {/* 채팅 모드 */}
                  <button
                    type="button"
                    onClick={() => setIsVoiceMode(false)}
                    className={`flex items-center gap-3 rounded-lg border-2 p-4 transition-all ${
                      !isVoiceMode
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <MessageSquare className="h-6 w-6 text-primary" />
                    <div className="text-left">
                      <h4 className="font-medium">채팅 모드</h4>
                      <p className="text-sm text-gray-600">편한 텍스트 대화</p>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 시간 설정 (연습 모드만) */}
          {mode === 'PRACTICE' && (
            <Card>
              <CardHeader>
                <CardTitle>시간 설정</CardTitle>
                <CardDescription>
                  인터뷰 진행 시간을 선택하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 grid-cols-4">
                  {[5, 10, 15, 20].map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setDuration(time)}
                      className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                        duration === time
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Clock className="h-5 w-5 text-primary" />
                      <span className="font-semibold">{time}분</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 실전 모드 안내 */}
          {mode === 'REAL' && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="text-amber-900">실전 모드 안내</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-amber-800">
                  <li>• 음성 모드로만 진행되며, 15분간 진행됩니다</li>
                  <li>• 인터뷰 결과는 프로필에 저장되어 채용담당자가 확인할 수 있습니다</li>
                  <li>• AI가 자동으로 질문을 생성하고, 답변을 평가합니다</li>
                  <li>• 평가 항목: 의사소통 능력, 직무 역량 (정보분석, 문제해결 등)</li>
                  <li>• 인터뷰 완료 후 상세한 피드백과 추천 직무를 제공합니다</li>
                </ul>
              </CardContent>
            </Card>
          )}

          {/* 시작 버튼 */}
          <div className="flex justify-center gap-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => router.back()}
            >
              취소
            </Button>
            <Button
              type="button"
              size="lg"
              onClick={handleStartInterview}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  인터뷰 생성 중...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  인터뷰 시작
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
