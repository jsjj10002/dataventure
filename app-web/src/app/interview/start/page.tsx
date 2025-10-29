'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mic, MicOff, Volume2, VolumeX, Clock, X, MessageSquare, Subtitles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { interviewAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { getSocket, connectSocket, onSocketEvent, offSocketEvent, emitSocketEvent, disconnectSocket } from '@/lib/socket-client';

// 3D 아바타를 동적으로 로드 (SSR 비활성화)
// GLTF 기반 Ready Player Me 아바타 사용
const AIAvatar3D = dynamic(() => import('@/components/interview/AIAvatarGLTF'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  ),
});

interface Message {
  role: 'AI' | 'USER';
  content: string;
  timestamp: Date;
}

function InterviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const interviewId = searchParams.get('id');
  const voiceModeParam = searchParams.get('voiceMode'); // URL 파라미터에서 모드 읽기
  
  const { user, isAuthenticated } = useAuthStore();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [isInterviewActive, setIsInterviewActive] = useState(true);
  const [interviewMode, setInterviewMode] = useState<'PRACTICE' | 'REAL'>('PRACTICE');
  
  // 웹캠 & 음성
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  
  // UI 모드 - URL 파라미터에서 초기화 (기본값: true)
  const [isVoiceMode, setIsVoiceMode] = useState(voiceModeParam === 'true' || voiceModeParam === null); // 음성/채팅 모드
  const [showSubtitles, setShowSubtitles] = useState(false); // 자막 표시
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null); // 현재 재생 중인 오디오 추적

  // 인증 확인
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다.');
      router.push('/auth/login');
      return;
    }
    
    if (!interviewId) {
      toast.error('인터뷰 ID를 찾을 수 없습니다.');
      router.push('/interview/setup');
      return;
    }
    
    loadInterview();
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopCamera();
      disconnectSocket();
    };
  }, []);

  // 마우스 움직임 추적
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const loadInterview = async () => {
    if (!interviewId) return;
    
    try {
      const response = await interviewAPI.get(interviewId);
      const interview = response.data;
      
      setInterviewMode(interview.mode);
      setTimeLeft(interview.timeLimitSeconds);
      
      // 실전 모드는 음성 모드 고정
      if (interview.mode === 'ACTUAL') {
        setIsVoiceMode(true);
      }
      
      // AI 인사 메시지
      const greeting = '안녕하세요! AI 면접관입니다. 편안하게 대화하듯이 답변해주시면 됩니다. 준비되셨나요?';
      setMessages([{
        role: 'AI',
        content: greeting,
        timestamp: new Date(),
      }]);
      
      // 자막 표시
      if (showSubtitles) {
        setCurrentSubtitle(greeting);
      }
      
      // AI 인사말 음성 재생 (모든 모드에서 재생)
      await speakText(greeting);
      
    // 타이머 시작
    startTimer();
    
    // 웹캠 자동 시작 시도 (실패해도 인터뷰 진행)
    setTimeout(() => {
      startCamera().catch((err) => {
        console.warn('카메라 시작 실패, 계속 진행:', err);
      });
    }, 500);
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

  // 메시지 전송
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSending || !interviewId) return;
    
    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsSending(true);
    
    // 사용자 메시지 추가
    setMessages((prev) => [...prev, {
      role: 'USER',
      content: userMessage,
      timestamp: new Date(),
    }]);
    
    try {
      // Socket.IO를 통해 메시지 전송
      const socket = getSocket();
      if (!socket.connected) {
        connectSocket();
        await new Promise((resolve) => {
          socket.once('connect', resolve);
        });
      }
      
      // 기존 리스너 제거 (중복 방지)
      offSocketEvent('interview:question');
      
      // AI 응답 수신 리스너 등록
      const questionListener = async (data: any) => {
        const aiMessage: Message = {
          role: 'AI',
          content: data.content,
          timestamp: new Date(data.createdAt),
        };
        setMessages((prev) => [...prev, aiMessage]);
        
        // 자막 표시
        if (showSubtitles) {
          setCurrentSubtitle(data.content);
        }
        
        // AI 응답을 항상 음성으로 재생 (채팅/음성 모드 모두)
        await speakText(data.content);
        
        setIsSending(false);
      };
      
      onSocketEvent('interview:question', questionListener);
      
      // 메시지 전송
      emitSocketEvent('interview:message', {
        interviewId,
        content: userMessage,
        contentType: 'TEXT',
      });
    } catch (error: any) {
      console.error('메시지 전송 실패:', error);
      toast.error('메시지 전송에 실패했습니다.');
      setIsSending(false);
    }
  };

  // 웹캠 시작 (선택사항 - 기기 없어도 진행 가능)
  const startCamera = async () => {
    try {
      // 미디어 기기 존재 여부 확인
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn('미디어 기기가 지원되지 않습니다. 카메라 없이 진행합니다.');
        toast('카메라 없이 진행합니다.', { icon: 'ℹ️' });
        return;
      }

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
    } catch (error: any) {
      console.error('카메라 접근 실패:', error);
      
      // 기기가 없거나 권한 거부 시에도 진행 가능
      if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        toast('카메라/마이크가 없습니다. 카메라 없이 진행합니다.', { icon: 'ℹ️' });
      } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        toast('카메라 권한이 거부되었습니다. 카메라 없이 진행합니다.', { icon: 'ℹ️' });
      } else {
        toast('카메라를 사용할 수 없습니다. 카메라 없이 진행합니다.', { icon: 'ℹ️' });
      }
      
      // 에러 발생해도 인터뷰는 계속 진행
      setIsCameraOn(false);
      setStream(null);
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
    }
  };

  // 음성 녹음 시작
  const startRecording = async () => {
    // 스트림이 없으면 마이크만 요청
    if (!stream) {
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setStream(audioStream);
      } catch (error: any) {
        console.error('마이크 접근 실패:', error);
        
        if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          toast.error('마이크가 연결되어 있지 않습니다. 텍스트로 답변해주세요.');
        } else if (error.name === 'NotAllowedError') {
          toast.error('마이크 권한이 거부되었습니다. 텍스트로 답변해주세요.');
        } else {
          toast.error('마이크를 사용할 수 없습니다. 텍스트로 답변해주세요.');
        }
        return;
      }
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
        await sendAudioToSTT(audioBlob);
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setAudioChunks(chunks);
    } catch (error) {
      console.error('녹음 시작 실패:', error);
      toast.error('녹음을 시작할 수 없습니다.');
    }
  };

  // 음성 녹음 중지
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  // STT: 음성 → 텍스트
  const sendAudioToSTT = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/ai/stt/transcribe', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('STT 실패');
      
      const data = await response.json();
      setInputMessage(data.text);
      toast.success('음성이 텍스트로 변환되었습니다!');
    } catch (error) {
      console.error('STT 실패:', error);
      toast.error('음성 인식에 실패했습니다.');
    }
  };

  // TTS: 텍스트 → 음성
  const speakText = async (text: string) => {
    if (!text) return;
    
    // 이전 오디오가 재생 중이면 중단 (중복 방지)
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    
    setIsAISpeaking(true);
    
    // 자막 표시
    if (showSubtitles) {
      setCurrentSubtitle(text);
    }
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/ai/tts/speak-korean', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: 'nova', model: 'tts-1', speed: 1.0 }), // nova: 더 자연스러운 목소리
      });
      
      if (!response.ok) throw new Error('TTS 실패');
      
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio; // 현재 오디오 추적
      
      audio.onended = () => {
        setIsAISpeaking(false);
        currentAudioRef.current = null;
        // 자막 유지 (3초 후 지우기)
        setTimeout(() => {
          setCurrentSubtitle('');
        }, 3000);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = () => {
        setIsAISpeaking(false);
        currentAudioRef.current = null;
        setCurrentSubtitle('');
      };
      
      await audio.play();
    } catch (error) {
      console.error('TTS 실패:', error);
      setIsAISpeaking(false);
      currentAudioRef.current = null;
      setCurrentSubtitle('');
    }
  };

  // 인터뷰 종료
  const handleEndInterview = async () => {
    if (!interviewId) return;
    
    setIsInterviewActive(false);
    
    try {
      await interviewAPI.complete(interviewId);
      toast.success('인터뷰가 종료되었습니다. 평가 결과를 확인해주세요.');
      router.push(`/evaluation/${interviewId}`);
    } catch (error: any) {
      console.error('인터뷰 종료 실패:', error);
      toast.error('인터뷰 종료에 실패했습니다.');
    }
  };

  // 시간 포맷
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* 배경 그라데이션 (중앙이 더 어둡게) */}
      <div className="absolute inset-0 bg-gradient-radial from-gray-900 via-gray-950 to-black" />
      
      {/* 웹캠 (오른쪽 상단 고정) */}
      {isCameraOn && (
        <div className="absolute top-6 right-6 z-30">
          <div className="relative rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl backdrop-blur-sm">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-64 h-48 object-cover bg-gray-900"
            />
          </div>
        </div>
      )}
      
      {/* 헤더 */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-3 bg-gradient-to-b from-black/40 to-transparent backdrop-blur-sm pointer-events-none">
        {/* 버튼들만 pointer-events-auto 적용 */}
        {/* 좌측: 타이머 + 모드 */}
        <div className="flex items-center gap-6 pointer-events-auto">
          {/* 타이머 */}
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-black/40 backdrop-blur-md border border-white/20 shadow-lg">
            <Clock className="h-6 w-6 text-blue-400 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-xs text-white/60 uppercase tracking-wider">남은 시간</span>
              <span className="text-3xl font-mono font-bold text-white tracking-wider">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
          
          {/* 구분선 */}
          <div className="h-10 w-px bg-white/20" />
          
          {/* 모드 표시 */}
          <span className="text-sm text-white/80 font-medium px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm">
            {interviewMode === 'PRACTICE' ? '🎯 연습 모드' : '🔥 실전 모드'}
          </span>
        </div>
        
        {/* 우측: 자막 + 종료 버튼 */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {/* 자막 토글 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSubtitles(!showSubtitles)}
            className="text-white hover:bg-white/20 backdrop-blur-sm"
          >
            <Subtitles className="h-4 w-4 mr-2" />
            {showSubtitles ? '자막 끄기' : '자막 켜기'}
          </Button>
          
          {/* 종료 버튼 */}
          <Button
            variant="destructive"
            size="sm"
            onClick={handleEndInterview}
            disabled={!isInterviewActive}
            className="shadow-lg"
          >
            <X className="h-4 w-4 mr-2" />
            인터뷰 종료
          </Button>
        </div>
      </div>
      
      {/* 중앙 3D 캐릭터 */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <AIAvatar3D 
          isSpeaking={isAISpeaking}
          emotion={isAISpeaking ? 'happy' : 'neutral'}
          className="w-full h-full"
          mousePosition={mousePosition}
        />
      </div>
      
      {/* 자막 (하단 중앙) */}
      {showSubtitles && currentSubtitle && (
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-20 max-w-4xl px-8">
          <div className="bg-black/90 text-white text-center px-8 py-4 rounded-lg text-lg font-medium shadow-2xl">
            {currentSubtitle}
          </div>
        </div>
      )}
      
      {/* 하단 컨트롤 영역 */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pb-8 pt-16 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
        <div className="max-w-3xl mx-auto px-4">
          {isVoiceMode ? (
            /* 음성 모드: 세련된 마이크 버튼 */
            <div className="flex flex-col items-center justify-center gap-6">
              <div className="relative">
                {/* 펄스 애니메이션 (녹음 중) */}
                {isRecording && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-red-500 opacity-20 animate-ping" />
                    <div className="absolute inset-0 rounded-full bg-red-500 opacity-30 animate-pulse" />
                  </>
                )}
                
                {/* 마이크 버튼 */}
                <Button
                  size="lg"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={!isInterviewActive || isSending}
                  className={`relative h-32 w-32 rounded-full shadow-2xl transition-all duration-300 ${
                    isRecording
                      ? 'bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 scale-110'
                      : 'bg-gradient-to-br from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 hover:scale-110'
                  }`}
                >
                  {isRecording ? (
                    <MicOff className="h-16 w-16" />
                  ) : (
                    <Mic className="h-16 w-16" />
                  )}
                </Button>
              </div>
              
              {/* 상태 텍스트 */}
              <div className="text-center">
                {isRecording ? (
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                    <p className="text-white font-medium text-lg">녹음 중...</p>
                  </div>
                ) : (
                  <p className="text-white/80 font-medium">
                    마이크 버튼을 눌러 답변하세요
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* 채팅 모드: Glass UI 입력바 */
            <div className="relative">
              <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="메시지를 입력하세요..."
                    disabled={!isInterviewActive || isSending}
                    className="flex-1 bg-transparent text-white placeholder-white/50 px-6 py-4 outline-none text-lg"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isSending || !isInterviewActive}
                    size="lg"
                    className="rounded-2xl px-8 shadow-lg"
                  >
                    <MessageSquare className="h-5 w-5 mr-2" />
                    전송
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function InterviewStartPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">로딩 중...</div>
      </div>
    }>
      <InterviewContent />
    </Suspense>
  );
}
