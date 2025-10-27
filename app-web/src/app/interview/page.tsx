'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useInterviewStore } from '@/stores/interview-store';
import ChatMessage from '@/components/interview/ChatMessage';

export default function InterviewPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const {
    currentInterview,
    messages,
    isConnected,
    isProcessing,
    error,
    startInterview,
    sendMessage,
    endInterview,
    clearError,
    disconnect,
  } = useInterviewStore();

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 인증 확인
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  // 인터뷰 자동 시작 (최초 진입 시)
  useEffect(() => {
    if (user && !currentInterview) {
      startInterview({ candidateId: user.id });
    }

    // 컴포넌트 언마운트 시 Socket.IO 연결 해제
    return () => {
      if (currentInterview?.status === 'IN_PROGRESS') {
        // 진행 중인 인터뷰가 있으면 일단 유지
        // disconnect();
      }
    };
  }, [user, currentInterview]);

  // 메시지 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 메시지 전송
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!inputMessage.trim() || isProcessing) {
      return;
    }

    sendMessage(inputMessage.trim());
    setInputMessage('');
  };

  // 인터뷰 종료
  const handleEndInterview = () => {
    if (confirm('인터뷰를 종료하시겠습니까? 평가 결과를 생성합니다.')) {
      endInterview();
      
      // 잠시 후 평가 결과 페이지로 이동
      setTimeout(() => {
        if (currentInterview) {
          disconnect();
          router.push(`/evaluation/${currentInterview.id}`);
        }
      }, 3000); // 평가 생성 시간을 고려하여 3초 대기
    }
  };

  if (!user) {
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold text-gray-900">AI 인터뷰</h1>
            {isConnected && (
              <p className="text-xs text-green-600">● 연결됨</p>
            )}
            {!isConnected && (
              <p className="text-xs text-red-600">● 연결 끊김</p>
            )}
          </div>
          <button
            onClick={handleEndInterview}
            disabled={isProcessing || !currentInterview}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            인터뷰 종료
          </button>
        </div>
      </header>

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border-b border-red-200">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {messages.length === 0 && !isProcessing && (
            <div className="text-center text-gray-500 mt-12">
              <p>AI 면접관이 질문을 준비하고 있습니다...</p>
            </div>
          )}

          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {/* AI 처리 중 표시 */}
          {isProcessing && (
            <div className="flex justify-start mb-4">
              <div className="bg-gray-100 rounded-lg px-4 py-3">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-sm text-gray-600">AI가 생각 중...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 입력 영역 */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="답변을 입력하세요..."
              disabled={isProcessing || !currentInterview}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isProcessing || !currentInterview}
              className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              전송
            </button>
          </form>
          <p className="mt-2 text-xs text-gray-500 text-center">
            Enter 키를 눌러 답변을 전송할 수 있습니다
          </p>
        </div>
      </div>
    </div>
  );
}

