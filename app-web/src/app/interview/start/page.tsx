'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Mic, Video, VideoOff, Clock, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { formatTime } from '@/lib/utils';

interface Message {
  role: 'AI' | 'CANDIDATE';
  content: string;
  timestamp: Date;
}

export default function InterviewPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timeLimit] = useState(900); // 15분 (실전 모드)
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 타이머 시작
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeElapsed(prev => {
        if (prev >= timeLimit) {
          handleEndInterview();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLimit]);

  // 메시지 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 카메라 시작/중지
  const toggleCamera = async () => {
    if (isCameraOn) {
      // 카메라 끄기
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
      setIsCameraOn(false);
    } else {
      // 카메라 켜기
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsCameraOn(true);
      } catch (error) {
        console.error('카메라 접근 오류:', error);
        alert('카메라에 접근할 수 없습니다.');
      }
    }
  };

  // 메시지 전송
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'CANDIDATE',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // TODO: 실제 API 호출
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const aiMessage: Message = {
        role: 'AI',
        content: '답변 감사합니다. 이전 답변에서 말씀하신 내용에 대해 조금 더 구체적으로 설명해주시겠어요?',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('메시지 전송 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 인터뷰 종료
  const handleEndInterview = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    if (confirm('인터뷰를 종료하시겠습니까? 평가 생성에는 시간이 소요됩니다.')) {
      router.push('/interview/complete');
    }
  };

  // 초기 AI 인사
  useEffect(() => {
    const initialMessage: Message = {
      role: 'AI',
      content: '안녕하세요! 오늘 인터뷰에 참여해주셔서 감사합니다. 편안하게 시작하기 위해 간단히 자신을 소개해주시겠어요?',
      timestamp: new Date()
    };
    setMessages([initialMessage]);
  }, []);

  const remainingTime = timeLimit - timeElapsed;
  const isTimeRunningOut = remainingTime < 60;

  return (
    <div className="flex h-screen flex-col bg-gray-900">
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-gray-800 bg-gray-950 px-6 py-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-white">AI 인터뷰 (실전 모드)</h1>
          <Badge variant={isTimeRunningOut ? 'destructive' : 'secondary'}>
            <Clock className="mr-1 h-3 w-3" />
            {formatTime(remainingTime)}
          </Badge>
        </div>
        <Button variant="outline" onClick={handleEndInterview}>
          인터뷰 종료
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* 메인 채팅 영역 */}
        <div className="flex flex-1 flex-col">
          {/* 메시지 영역 */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="mx-auto max-w-4xl space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'CANDIDATE' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      message.role === 'AI'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-700 text-white'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className="mt-1 text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg bg-primary-600 px-4 py-3 text-white">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>AI가 생각 중입니다...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* 입력 영역 */}
          <div className="border-t border-gray-800 bg-gray-950 p-4">
            <div className="mx-auto max-w-4xl">
              {isTimeRunningOut && (
                <div className="mb-3 flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  <span>1분 미만 남았습니다. 곧 인터뷰가 종료됩니다.</span>
                </div>
              )}
              
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="답변을 입력하세요... (Shift+Enter로 줄바꿈)"
                  className="min-h-[60px] resize-none bg-gray-800 text-white placeholder:text-gray-400"
                  disabled={isLoading}
                />
                <div className="flex flex-col gap-2">
                  {isVoiceMode ? (
                    <Button
                      size="icon"
                      variant="outline"
                      className="bg-red-500 hover:bg-red-600"
                    >
                      <Mic className="h-5 w-5" />
                    </Button>
                  ) : (
                    <Button
                      size="icon"
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={toggleCamera}
                  >
                    {isCameraOn ? (
                      <Video className="h-5 w-5" />
                    ) : (
                      <VideoOff className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 우측 카메라 패널 */}
        {isCameraOn && (
          <div className="w-80 border-l border-gray-800 bg-gray-950 p-4">
            <Card className="overflow-hidden bg-gray-800">
              <CardContent className="p-0">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-60 w-full object-cover"
                />
                <div className="p-3 text-center">
                  <p className="text-sm text-gray-400">당신의 화면</p>
                </div>
              </CardContent>
            </Card>

            <div className="mt-4">
              <h3 className="mb-2 text-sm font-semibold text-white">인터뷰 팁</h3>
              <ul className="space-y-2 text-xs text-gray-400">
                <li>• 자신있게, 명확하게 답변하세요</li>
                <li>• STAR 기법을 활용하세요</li>
                <li>• 구체적인 예시를 들어주세요</li>
                <li>• 긍정적인 자세를 유지하세요</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
