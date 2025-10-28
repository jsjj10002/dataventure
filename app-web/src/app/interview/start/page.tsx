'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mic, MicOff, Send, Loader2, Clock, User, Bot, Video, VideoOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/stores/authStore';
import { interviewAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import axios from 'axios';
import AIAvatar from '@/components/interview/AIAvatar';

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
  
  // 웹캠 & 음성
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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
      
      // AI 응답을 음성으로 재생
      await speakText(aiMessage);
      
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

  // 웹캠 시작
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      
      setStream(mediaStream);
      setIsCameraOn(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      toast.success('카메라가 활성화되었습니다.');
    } catch (error) {
      console.error('카메라 접근 실패:', error);
      toast.error('카메라 접근 권한을 허용해주세요.');
    }
  };

  // 웹캠 중지
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraOn(false);
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      
      toast.success('카메라가 비활성화되었습니다.');
    }
  };

  // 웹캠 토글
  const handleToggleCamera = () => {
    if (isCameraOn) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  // 음성 녹음 시작
  const startRecording = () => {
    if (!stream) {
      toast.error('먼저 카메라를 활성화해주세요.');
      return;
    }
    
    try {
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        setAudioChunks([...audioChunks, audioBlob]);
        
        // STT로 음성을 텍스트로 변환
        await transcribeAudio(audioBlob);
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      toast.success('녹음이 시작되었습니다.');
    } catch (error) {
      console.error('녹음 시작 실패:', error);
      toast.error('녹음을 시작할 수 없습니다.');
    }
  };

  // 음성 녹음 중지
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  // 음성 녹음 토글
  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // STT: 음성을 텍스트로 변환
  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      toast.loading('음성을 텍스트로 변환 중...', { id: 'stt' });
      
      // FormData로 오디오 파일 전송
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      
      const response = await axios.post(
        'http://localhost:8000/api/v1/ai/stt/transcribe',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      const transcribedText = response.data.text;
      
      if (transcribedText && transcribedText.trim()) {
        // 변환된 텍스트를 입력창에 넣기
        setInputMessage(transcribedText);
        toast.success('음성이 텍스트로 변환되었습니다!', { id: 'stt' });
        
        // 자동으로 전송 (선택사항)
        // await handleSendMessage();
      } else {
        toast.error('음성을 인식하지 못했습니다.', { id: 'stt' });
      }
    } catch (error: any) {
      console.error('STT 실패:', error);
      toast.error('음성 변환에 실패했습니다.', { id: 'stt' });
    }
  };

  // TTS: AI 응답을 음성으로 재생
  const speakText = async (text: string) => {
    try {
      setIsAISpeaking(true);
      
      const response = await axios.post(
        'http://localhost:8000/api/v1/ai/tts/speak-korean',
        {
          text,
          voice: 'nova',  // AI 인터뷰에 적합한 밝은 여성 음성
          model: 'tts-1',  // 빠른 응답
          speed: 1.0
        },
        {
          responseType: 'blob'
        }
      );
      
      // Blob을 오디오로 재생
      const audioUrl = URL.createObjectURL(response.data);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);  // 메모리 정리
        setIsAISpeaking(false);
      };
      
      audio.onerror = () => {
        setIsAISpeaking(false);
      };
      
      await audio.play();
    } catch (error: any) {
      console.error('TTS 실패:', error);
      setIsAISpeaking(false);
      // 음성 재생 실패는 치명적이지 않으므로 조용히 처리
    }
  };

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      stopCamera();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

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
        {/* AI 아바타 (좌측) */}
        <div className="hidden lg:flex w-80 items-center justify-center bg-gray-800/50 p-8">
          <AIAvatar 
            isSpeaking={isAISpeaking}
            emotion={isAISpeaking ? 'happy' : 'neutral'}
            className="h-64 w-64"
          />
        </div>
        
        {/* 웹캠 영역 (우측 상단) */}
        {isCameraOn && (
          <div className="absolute top-20 right-6 z-10">
            <div className="relative rounded-lg overflow-hidden border-2 border-primary shadow-lg">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-64 h-48 object-cover bg-gray-800"
              />
              <div className="absolute top-2 right-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleToggleCamera}
                  className="h-8 w-8 p-0"
                >
                  <VideoOff className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
        
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
          {/* 카메라 토글 버튼 */}
          <Button
            type="button"
            size="lg"
            variant={isCameraOn ? 'default' : 'outline'}
            onClick={handleToggleCamera}
            disabled={!isInterviewActive}
            className="shrink-0"
            title={isCameraOn ? '카메라 끄기' : '카메라 켜기'}
          >
            {isCameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>
          
          {/* 음성 녹음 버튼 */}
          <Button
            type="button"
            size="lg"
            variant={isRecording ? 'destructive' : 'outline'}
            onClick={handleToggleRecording}
            disabled={!isInterviewActive}
            className="shrink-0"
            title={isRecording ? '녹음 중지' : '녹음 시작'}
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
