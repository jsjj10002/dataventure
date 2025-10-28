'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mic, MicOff, Send, Loader2, Clock, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/stores/authStore';
import { interviewAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import axios from 'axios';

interface Message {
  role: 'AI' | 'USER';
  content: string;
  timestamp: Date;
}

function InterviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const interviewId = searchParams.get('id');
  
  const { user, isAuthenticated } = useAuthStore();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15분 (초)
  const [isInterviewActive, setIsInterviewActive] = useState(true);
  const [interviewMode, setInterviewMode] = useState<'PRACTICE' | 'REAL'>('PRACTICE');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 인증 확인
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다.');
      router.push('/login');
      return;
    }
    
    if (!interviewId) {
      toast.error('인터뷰 ID를 찾을 수 없습니다.');
      router.push('/interview/setup');
      return;
    }
    
    loadInterview();
  }, [isAuthenticated, interviewId]);

  // 인터뷰 정보 로드
  const loadInterview = async () => {
    if (!interviewId) return;
    
    try {
      const response = await interviewAPI.get(interviewId);
      const interview = response.data;
      
      setInterviewMode(interview.mode);
      setTimeLeft(interview.timeLimitSeconds);
      
      // AI 인사 메시지
      setMessages([{
        role: 'AI',
        content: '안녕하세요! AI 면접관입니다. 편안하게 대화하듯이 답변해주시면 됩니다. 준비되셨나요?',
        timestamp: new Date(),
      }]);
      
      // 타이머 시작
      startTimer();
    } catch (error: any) {
      console.error('인터뷰 로드 실패:', error);
      toast.error('인터뷰를 불러오는데 실패했습니다.');
      router.push('/interview/setup');
    }
  };

  // 타이머 시작
  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleEndInterview();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 타이머 정리
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // 메시지 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 메시지 전송
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSending || !interviewId) return;
    
    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // 사용자 메시지 추가
    const newUserMessage: Message = {
      role: 'USER',
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newUserMessage]);
    
    setIsSending(true);
    
    try {
      // AI 서비스에 메시지 전송
      const aiResponse = await axios.post(`http://localhost:8000/api/v1/ai/chat`, {
        interviewId,
        message: userMessage,
      });
      
      const aiMessage = aiResponse.data.reply;
      
      // AI 응답 추가
      const newAiMessage: Message = {
        role: 'AI',
        content: aiMessage,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newAiMessage]);
      
      // 백엔드에 메시지 기록 저장
      await interviewAPI.addMessage(interviewId, {
        role: 'USER',
        content: userMessage,
      });
      
      await interviewAPI.addMessage(interviewId, {
        role: 'AI',
        content: aiMessage,
      });
    } catch (error: any) {
      console.error('메시지 전송 실패:', error);
      toast.error('메시지 전송에 실패했습니다.');
    } finally {
      setIsSending(false);
    }
  };

  // 음성 녹음 (간단한 구현)
  const handleToggleRecording = () => {
    if (isRecording) {
      // 녹음 중지
      setIsRecording(false);
      toast.success('녹음이 중지되었습니다.');
    } else {
      // 녹음 시작
      setIsRecording(true);
      toast.success('녹음이 시작되었습니다.');
      
      // TODO: 실제 Web Audio API 또는 라이브러리 사용
    }
  };

  // 인터뷰 종료
  const handleEndInterview = async () => {
    if (!interviewId) return;
    
    setIsInterviewActive(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    try {
      // 인터뷰 완료 처리
      await interviewAPI.complete(interviewId, {
        elapsedSeconds: 15 * 60 - timeLeft,
      });
      
      toast.success('인터뷰가 종료되었습니다. 평가 중입니다...');
      
      // 평가 페이지로 이동 (평가는 비동기로 진행)
      setTimeout(() => {
        router.push(`/evaluation/${interviewId}`);
      }, 2000);
    } catch (error: any) {
      console.error('인터뷰 종료 실패:', error);
      toast.error('인터뷰 종료 처리에 실패했습니다.');
    }
  };

  // 시간 포맷 (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-gray-900 text-white">
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-gray-700 bg-gray-800 px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <span className="text-xl font-mono font-semibold">
              {formatTime(timeLeft)}
            </span>
          </div>
          <div className="h-4 w-px bg-gray-600" />
          <span className="text-sm text-gray-400">
            {interviewMode === 'PRACTICE' ? '연습 모드' : '실전 모드'}
          </span>
        </div>
        
        <Button
          variant="destructive"
          onClick={handleEndInterview}
          disabled={!isInterviewActive}
        >
          인터뷰 종료
        </Button>
      </div>

      {/* 메시지 영역 */}
      <div className="flex h-[calc(100vh-140px)] overflow-hidden">
        {/* 채팅 영역 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-4xl space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 ${
                  msg.role === 'USER' ? 'flex-row-reverse' : ''
                }`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  msg.role === 'AI' ? 'bg-primary' : 'bg-gray-600'
                }`}>
                  {msg.role === 'AI' ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
                </div>
                
                <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  msg.role === 'AI' 
                    ? 'bg-gray-700 text-white' 
                    : 'bg-primary text-white'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p className="mt-1 text-xs opacity-60">
                    {msg.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isSending && (
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="max-w-[70%] rounded-2xl bg-gray-700 px-4 py-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* 입력 영역 */}
      <div className="border-t border-gray-700 bg-gray-800 px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-end gap-3">
          {/* 음성 녹음 버튼 */}
          <Button
            type="button"
            size="lg"
            variant={isRecording ? 'destructive' : 'outline'}
            onClick={handleToggleRecording}
            disabled={!isInterviewActive}
            className="shrink-0"
          >
            {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          
          {/* 텍스트 입력 */}
          <Textarea
            placeholder="메시지를 입력하세요..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={!isInterviewActive || isSending}
            rows={2}
            className="flex-1 resize-none bg-gray-700 text-white placeholder:text-gray-400"
          />
          
          {/* 전송 버튼 */}
          <Button
            type="button"
            size="lg"
            onClick={handleSendMessage}
            disabled={!isInterviewActive || isSending || !inputMessage.trim()}
            className="shrink-0"
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function InterviewStartPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    }>
      <InterviewContent />
    </Suspense>
  );
}
