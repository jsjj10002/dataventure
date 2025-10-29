'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, MessageSquare, Clock, Target, Loader2, Play, Check, Plus, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/authStore';
import { interviewAPI } from '@/lib/api';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import { PermissionTestModal } from '@/components/interview/PermissionTestModal';

// 샘플 질문 (실제로는 프로필 기반 생성)
const SAMPLE_QUESTIONS = [
  { id: 1, text: '자기소개를 간단히 해주세요.', category: '공통' },
  { id: 2, text: '왜 이 직무에 지원하셨나요?', category: '공통' },
  { id: 3, text: '가장 자랑스러운 프로젝트 경험은 무엇인가요?', category: '공통' },
  { id: 4, text: '팀워크 경험을 구체적으로 말씀해주세요.', category: '공통' },
  { id: 5, text: '주어진 데이터를 보고 어떤 인사이트를 도출하시겠습니까?', category: '정보분석' },
  { id: 6, text: '예상치 못한 문제가 발생했을 때 어떻게 대처하시나요?', category: '문제해결' },
  { id: 7, text: '두 개의 상충되는 목표 사이에서 어떻게 균형을 맞추시겠습니까?', category: '유연한사고' },
  { id: 8, text: '고객을 설득한 경험을 말씀해주세요.', category: '협상설득' },
  { id: 9, text: '사용하는 알고리즘이나 자료구조에 대해 설명해주세요.', category: 'IT능력' },
  { id: 10, text: '5년 후 자신의 모습은 어떨 것 같나요?', category: '공통' },
];

export default function InterviewSetupPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  
  // 인터뷰 설정
  const [mode, setMode] = useState<'PRACTICE' | 'ACTUAL'>('PRACTICE');
  const [isVoiceMode, setIsVoiceMode] = useState(true);
  const [duration, setDuration] = useState(15); // 분
  const [isLoading, setIsLoading] = useState(false);
  
  // 권한 테스트 모달
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  
  // 질문 선택 (연습 모드)
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [customQuestion, setCustomQuestion] = useState('');
  const [customQuestions, setCustomQuestions] = useState<string[]>([]);

  // 인증 확인
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다.');
      router.push('/auth/login');
      return;
    }
    
    if (user?.role !== 'CANDIDATE') {
      toast.error('구직자만 인터뷰를 진행할 수 있습니다.');
      router.push('/');
      return;
    }
  }, [isAuthenticated, user]);

  // 질문 토글
  const toggleQuestion = (questionId: number) => {
    setSelectedQuestions((prev) => {
      if (prev.includes(questionId)) {
        return prev.filter((id) => id !== questionId);
      } else if (prev.length < 5) {
        return [...prev, questionId];
      } else {
        toast.error('최대 5개까지 선택할 수 있습니다.');
        return prev;
      }
    });
  };

  // 커스텀 질문 추가
  const addCustomQuestion = () => {
    if (!customQuestion.trim()) {
      toast.error('질문을 입력해주세요.');
      return;
    }
    if (customQuestions.length >= 5) {
      toast.error('최대 5개까지 추가할 수 있습니다.');
      return;
    }
    setCustomQuestions([...customQuestions, customQuestion.trim()]);
    setCustomQuestion('');
  };

  // 커스텀 질문 삭제
  const removeCustomQuestion = (index: number) => {
    setCustomQuestions(customQuestions.filter((_, i) => i !== index));
  };

  // 인터뷰 시작 버튼 클릭 -> 권한 모달 표시
  const handleStartInterview = () => {
    if (!user) {
      toast.error('사용자 정보를 찾을 수 없습니다.');
      return;
    }
    
    // 연습 모드에서 질문 선택 검증
    if (mode === 'PRACTICE') {
      const totalQuestions = selectedQuestions.length + customQuestions.length;
      if (totalQuestions === 0) {
        toast.error('최소 1개 이상의 질문을 선택하거나 추가해주세요.');
        return;
      }
    }
    
    // 권한 테스트 모달 표시
    setShowPermissionModal(true);
  };

  // 권한 확인 후 실제 인터뷰 시작
  const proceedToInterview = async () => {
    // 모달 닫기
    setShowPermissionModal(false);
    
    // 로딩 시작
    setIsLoading(true);
    
    try {
      // 백엔드에 인터뷰 시작 요청
      const response = await interviewAPI.start({
        mode: mode,
        duration: duration,
        // 선택된 질문 전달 (추후 구현)
        // selectedQuestions: mode === 'PRACTICE' ? selectedQuestions : undefined,
        // customQuestions: mode === 'PRACTICE' ? customQuestions : undefined,
      });
      
      const { interviewId } = response.data;
      
      toast.success('인터뷰가 생성되었습니다!');
      
      // 인터뷰 진행 페이지로 이동
      // 선택한 대화 방식(음성/채팅)도 URL 파라미터로 전달
      router.push(`/interview/start?id=${interviewId}&voiceMode=${isVoiceMode}`);
    } catch (error: any) {
      console.error('인터뷰 시작 실패:', error);
      toast.error(error.response?.data?.error || '인터뷰 시작에 실패했습니다.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 relative">
      {/* 로딩 오버레이 */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
            <div className="relative">
              {/* 회전하는 원 */}
              <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              {/* 중앙 아이콘 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white animate-pulse" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-white text-lg font-semibold">인터뷰 시작 중...</p>
              <p className="text-white/70 text-sm mt-1">잠시만 기다려주세요</p>
            </div>
          </div>
        </div>
      )}
      
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
                  className={`flex flex-col items-start gap-3 rounded-lg p-6 text-left transition-all ${
                    mode === 'PRACTICE'
                      ? 'border-[3px] border-blue-600 bg-blue-50 shadow-lg ring-2 ring-blue-300'
                      : 'border-2 border-gray-200 hover:border-gray-300'
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
                  onClick={() => setMode('ACTUAL')}
                  className={`flex flex-col items-start gap-3 rounded-lg p-6 text-left transition-all ${
                    mode === 'ACTUAL'
                      ? 'border-[3px] border-blue-600 bg-blue-50 shadow-lg ring-2 ring-blue-300'
                      : 'border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full p-2 ${
                      mode === 'ACTUAL' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
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
                    className={`flex items-center gap-3 rounded-lg p-4 transition-all ${
                      isVoiceMode
                        ? 'border-[3px] border-green-600 bg-green-50 shadow-lg ring-2 ring-green-300'
                        : 'border-2 border-gray-200 hover:border-gray-300'
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
                    className={`flex items-center gap-3 rounded-lg p-4 transition-all ${
                      !isVoiceMode
                        ? 'border-[3px] border-green-600 bg-green-50 shadow-lg ring-2 ring-green-300'
                        : 'border-2 border-gray-200 hover:border-gray-300'
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
                      className={`flex flex-col items-center gap-2 rounded-lg p-4 transition-all ${
                        duration === time
                          ? 'border-[3px] border-purple-600 bg-purple-50 shadow-lg ring-2 ring-purple-300'
                          : 'border-2 border-gray-200 hover:border-gray-300'
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

          {/* 질문 선택 (연습 모드만) */}
          {mode === 'PRACTICE' && (
            <Card>
              <CardHeader>
                <CardTitle>질문 선택</CardTitle>
                <CardDescription>
                  제공된 질문 중 최대 5개를 선택하거나, 직접 질문을 추가하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 추천 질문 목록 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    프로필 기반 추천 질문 ({selectedQuestions.length}/5 선택)
                  </h4>
                  <div className="space-y-2">
                    {SAMPLE_QUESTIONS.map((q) => (
                      <label
                        key={q.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedQuestions.includes(q.id)
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedQuestions.includes(q.id)}
                          onChange={() => toggleQuestion(q.id)}
                          className="mt-1 h-4 w-4 text-primary rounded focus:ring-primary"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{q.text}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                            {q.category}
                          </span>
                        </div>
                        {selectedQuestions.includes(q.id) && (
                          <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* 커스텀 질문 추가 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    직접 만든 질문 ({customQuestions.length}/5)
                  </h4>
                  
                  {/* 입력 */}
                  <div className="flex gap-2 mb-3">
                    <Input
                      placeholder="질문을 입력하세요..."
                      value={customQuestion}
                      onChange={(e) => setCustomQuestion(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addCustomQuestion()}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={addCustomQuestion}
                      disabled={customQuestions.length >= 5}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* 커스텀 질문 목록 */}
                  {customQuestions.length > 0 && (
                    <div className="space-y-2">
                      {customQuestions.map((q, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 rounded-lg border border-primary bg-primary/5"
                        >
                          <p className="flex-1 text-sm text-gray-900">{q}</p>
                          <button
                            type="button"
                            onClick={() => removeCustomQuestion(index)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 총 선택 개수 표시 */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    총 {selectedQuestions.length + customQuestions.length}개 질문 선택됨
                    {(selectedQuestions.length + customQuestions.length) === 0 && 
                      ' (최소 1개 이상 선택해주세요)'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 실전 모드 안내 */}
          {mode === 'ACTUAL' && (
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
            
            {/* 개발 테스트 버튼 (개발 환경에서만 표시) */}
            {process.env.NODE_ENV === 'development' && (
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => router.push('/interview/test-chat')}
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                개발 테스트
              </Button>
            )}
            
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

      {/* 권한 테스트 모달 */}
      <PermissionTestModal
        isOpen={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
        onConfirm={proceedToInterview}
        isVoiceMode={isVoiceMode}
      />
    </div>
  );
}
