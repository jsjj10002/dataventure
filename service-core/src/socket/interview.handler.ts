/**
 * Socket.IO 인터뷰 이벤트 핸들러
 */

import { Socket } from 'socket.io';
import { MessageRole, ContentType } from '@prisma/client';
import {
  createInterview,
  saveMessage,
  generateNextQuestion,
  completeInterview,
  getInterview,
  getInterviewMessages,
} from '../services/interview.service';

/**
 * 인터뷰 관련 Socket.IO 이벤트 핸들러 등록
 * @param socket Socket.IO 소켓 인스턴스
 */
export const registerInterviewHandlers = (socket: Socket) => {
  console.log(`[Socket.IO] 인터뷰 핸들러 등록: ${socket.id}`);

  /**
   * 인터뷰 시작
   * 클라이언트가 새로운 인터뷰 세션을 시작할 때
   */
  socket.on('interview:start', async (data: {
    candidateId: string;
    jobPostingId?: string;
  }) => {
    try {
      console.log('[Socket.IO] 인터뷰 시작 요청:', data);

      // 인터뷰 세션 생성 (첫 질문 포함)
      const interview = await createInterview(data.candidateId, data.jobPostingId);

      // 첫 질문 가져오기
      const messages = await getInterviewMessages(interview.id);
      const firstQuestion = messages[0];

      // 소켓을 인터뷰 룸에 추가
      socket.join(`interview:${interview.id}`);

      // 클라이언트에 인터뷰 정보 전송
      socket.emit('interview:started', {
        interviewId: interview.id,
        interview,
        firstQuestion: {
          id: firstQuestion.id,
          role: firstQuestion.role,
          content: firstQuestion.content,
          contentType: firstQuestion.contentType,
          createdAt: firstQuestion.createdAt,
        },
      });

      console.log(`[Socket.IO] 인터뷰 시작됨: ${interview.id}`);
    } catch (error: any) {
      console.error('[Socket.IO] 인터뷰 시작 오류:', error);
      socket.emit('interview:error', {
        message: error.message || '인터뷰 시작에 실패했습니다.',
      });
    }
  });

  /**
   * 사용자 메시지 수신
   * 구직자가 답변을 보낼 때
   */
  socket.on('interview:message', async (data: {
    interviewId: string;
    content: string;
    contentType?: 'TEXT' | 'AUDIO';
    audioUrl?: string;
  }) => {
    try {
      console.log('[Socket.IO] 사용자 메시지:', {
        interviewId: data.interviewId,
        contentLength: data.content.length,
      });

      // AI 처리 중 상태 전송
      socket.emit('interview:processing', {
        message: 'AI가 답변을 분석하고 다음 질문을 준비하고 있습니다...',
      });

      // 사용자 답변 저장
      const userMessage = await saveMessage(
        data.interviewId,
        MessageRole.CANDIDATE,
        data.content,
        data.contentType === 'AUDIO' ? ContentType.AUDIO : ContentType.TEXT,
        data.audioUrl
      );

      // AI에게 다음 질문 요청
      let nextQuestion: string;
      try {
        nextQuestion = await generateNextQuestion(data.interviewId, data.content);
      } catch (error) {
        console.error('[Socket.IO] AI 질문 생성 실패, 기본 질문 사용:', error);
        // 기본 질문 사용
        nextQuestion = '말씀해주신 내용에 대해 더 자세히 설명해주시겠어요?';
      }

      // AI 질문 저장
      const aiMessage = await saveMessage(
        data.interviewId,
        MessageRole.AI,
        nextQuestion,
        ContentType.TEXT
      );

      // 클라이언트에 AI 질문 전송
      socket.emit('interview:question', {
        id: aiMessage.id,
        role: aiMessage.role,
        content: aiMessage.content,
        contentType: aiMessage.contentType,
        createdAt: aiMessage.createdAt,
      });

      console.log(`[Socket.IO] AI 질문 전송됨: ${data.interviewId}`);
    } catch (error: any) {
      console.error('[Socket.IO] 메시지 처리 오류:', error);
      socket.emit('interview:error', {
        message: error.message || '메시지 처리에 실패했습니다.',
      });
    }
  });

  /**
   * 인터뷰 종료
   * 사용자가 인터뷰를 종료할 때
   */
  socket.on('interview:end', async (data: {
    interviewId: string;
  }) => {
    try {
      console.log('[Socket.IO] 인터뷰 종료 요청:', data);

      // 인터뷰 완료 처리
      const interview = await completeInterview(data.interviewId);

      // 소켓을 인터뷰 룸에서 제거
      socket.leave(`interview:${interview.id}`);

      // 클라이언트에 종료 확인 전송
      socket.emit('interview:ended', {
        interviewId: interview.id,
        message: '인터뷰가 종료되었습니다. 평가 결과를 생성하고 있습니다.',
        evaluationUrl: `/evaluation/${interview.id}`,
      });

      console.log(`[Socket.IO] 인터뷰 종료됨: ${interview.id}`);
    } catch (error: any) {
      console.error('[Socket.IO] 인터뷰 종료 오류:', error);
      socket.emit('interview:error', {
        message: error.message || '인터뷰 종료에 실패했습니다.',
      });
    }
  });

  /**
   * 인터뷰 재연결
   * 페이지 새로고침 등으로 재연결할 때
   */
  socket.on('interview:reconnect', async (data: {
    interviewId: string;
  }) => {
    try {
      console.log('[Socket.IO] 인터뷰 재연결:', data);

      // 인터뷰 정보 조회
      const interview = await getInterview(data.interviewId);

      if (interview.status !== 'IN_PROGRESS') {
        socket.emit('interview:error', {
          message: '진행 중인 인터뷰가 아닙니다.',
        });
        return;
      }

      // 소켓을 인터뷰 룸에 추가
      socket.join(`interview:${interview.id}`);

      // 클라이언트에 인터뷰 정보 및 메시지 히스토리 전송
      socket.emit('interview:reconnected', {
        interviewId: interview.id,
        interview,
        messages: interview.messages.map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          contentType: msg.contentType,
          createdAt: msg.createdAt,
        })),
      });

      console.log(`[Socket.IO] 인터뷰 재연결됨: ${interview.id}`);
    } catch (error: any) {
      console.error('[Socket.IO] 인터뷰 재연결 오류:', error);
      socket.emit('interview:error', {
        message: error.message || '인터뷰 재연결에 실패했습니다.',
      });
    }
  });

  /**
   * 소켓 연결 해제
   */
  socket.on('disconnect', () => {
    console.log(`[Socket.IO] 인터뷰 핸들러 해제: ${socket.id}`);
  });
};

