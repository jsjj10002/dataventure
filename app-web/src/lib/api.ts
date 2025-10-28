/**
 * API 클라이언트 설정
 * - axios 기반
 * - JWT 토큰 자동 포함
 * - 에러 핸들링
 */

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API 기본 URL
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Axios 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: JWT 토큰 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    // localStorage에서 토큰 가져오기
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: 에러 핸들링
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // 401 Unauthorized: 토큰 만료 또는 인증 실패
    if (error.response?.status === 401) {
      // 토큰 삭제
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // 로그인 페이지로 리다이렉트
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    // 403 Forbidden: 권한 없음
    if (error.response?.status === 403) {
      console.error('권한이 없습니다.');
    }
    
    return Promise.reject(error);
  }
);

// ===== 타입 정의 =====

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'CANDIDATE' | 'RECRUITER' | 'ADMIN';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: 'CANDIDATE' | 'RECRUITER';
}

export interface CandidateProfile {
  id: string;
  userId: string;
  photoUrl?: string;
  bio?: string;
  educationJson?: string;
  experienceJson?: string;
  projectsJson?: string;
  skillsJson?: string;
  portfolioUrl?: string;
  blogUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  resumeUrl?: string;
  portfolioFileUrl?: string;
  desiredPosition?: string;
  desiredSalary?: number;
  uniqueUrl?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    email: string;
    name: string;
  };
}

export interface RecruiterProfile {
  id: string;
  userId: string;
  companyName?: string;
  companyLogoUrl?: string;
  companyDescription?: string;
  companyWebsite?: string;
  position?: string;
  department?: string;
  idealCandidate?: string;
  hiringPositionsJson?: string;
  uniqueUrl?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    email: string;
    name: string;
  };
}

export interface Interview {
  id: string;
  candidateId: string;
  mode: 'PRACTICE' | 'REAL';
  timeLimitSeconds: number;
  isVoiceMode: boolean;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startedAt: string;
  completedAt?: string;
  elapsedSeconds?: number;
}

export interface Evaluation {
  id: string;
  interviewId: string;
  deliveryScore: number;
  vocabularyScore: number;
  comprehensionScore: number;
  communicationAvg: number;
  informationAnalysis: number;
  problemSolving: number;
  flexibleThinking: number;
  negotiation: number;
  itSkills: number;
  overallScore: number;
  strengthsJson: string;
  weaknessesJson: string;
  detailedFeedback: string;
  recommendedPositions: string;
  createdAt: string;
  updatedAt: string;
  interview?: {
    id: string;
    mode: string;
    startedAt: string;
    completedAt?: string;
  };
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  relatedId?: string;
  createdAt: string;
}

export interface SearchResult {
  query: string;
  candidates: any[];
  recruiters: any[];
  totalCount: number;
}

// ===== API 함수들 =====

// 인증 API
export const authAPI = {
  login: (data: LoginRequest) => 
    apiClient.post<LoginResponse>('/api/v1/auth/login', data),
  
  register: (data: RegisterRequest) => 
    apiClient.post<LoginResponse>('/api/v1/auth/register', data),
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// 프로필 API
export const profileAPI = {
  // 구직자 프로필
  getCandidateProfile: (id: string) => 
    apiClient.get<CandidateProfile>(`/api/v1/profile/candidate/${id}`),
  
  updateCandidateProfile: (id: string, data: Partial<CandidateProfile>) => 
    apiClient.put<CandidateProfile>(`/api/v1/profile/candidate/${id}`, data),
  
  // 채용담당자 프로필
  getRecruiterProfile: (id: string) => 
    apiClient.get<RecruiterProfile>(`/api/v1/profile/recruiter/${id}`),
  
  updateRecruiterProfile: (id: string, data: Partial<RecruiterProfile>) => 
    apiClient.put<RecruiterProfile>(`/api/v1/profile/recruiter/${id}`, data),
};

// 인터뷰 API
export const interviewAPI = {
  start: (data: { mode: string; duration: number; selectedQuestions?: string[]; customQuestions?: string[] }) => 
    apiClient.post<{ interviewId: string; questions: any[]; interviewPlan: any; duration: number }>('/api/v1/interview/start', data),
  
  get: (id: string) => 
    apiClient.get<Interview>(`/api/v1/interview/${id}`),
  
  complete: (id: string, data: { elapsedSeconds?: number }) => 
    apiClient.put(`/api/v1/interview/${id}/complete`, data),
  
  addMessage: (id: string, data: { role: string; content: string; contentType?: string; audioUrl?: string }) => 
    apiClient.post(`/api/v1/interview/${id}/message`, data),
};

// 평가 API
export const evaluationAPI = {
  get: (id: string) => 
    apiClient.get<Evaluation>(`/api/v1/evaluation/${id}`),
  
  getByInterview: (interviewId: string) => 
    apiClient.get<Evaluation>(`/api/v1/evaluation/interview/${interviewId}`),
};

// 알림 API
export const notificationAPI = {
  getAll: (params?: { limit?: number; offset?: number; unreadOnly?: boolean }) => 
    apiClient.get<{ notifications: Notification[]; totalCount: number; unreadCount: number; hasMore: boolean }>('/api/v1/notifications', { params }),
  
  markAsRead: (id: string) => 
    apiClient.put(`/api/v1/notifications/${id}/read`),
  
  markAllAsRead: () => 
    apiClient.put('/api/v1/notifications/read-all'),
  
  delete: (id: string) => 
    apiClient.delete(`/api/v1/notifications/${id}`),
};

// 검색 API
export const searchAPI = {
  search: (params: { q: string; type?: string; limit?: number; offset?: number }) => 
    apiClient.get<SearchResult>('/api/v1/search', { params }),
  
  suggestions: (params: { q: string; limit?: number }) => 
    apiClient.get<{ suggestions: string[] }>('/api/v1/search/suggestions', { params }),
};

// 파일 업로드 API
export const uploadAPI = {
  uploadFile: (file: File, type?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (type) formData.append('type', type);
    
    return apiClient.post<{ url: string; filename: string; size: number; type: string }>('/api/v1/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  uploadMultiple: (files: File[], type?: string) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    if (type) formData.append('type', type);
    
    return apiClient.post<{ files: Array<{ url: string; filename: string; size: number; type: string }> }>('/api/v1/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  deleteFile: (url: string) => 
    apiClient.delete('/api/v1/upload', { data: { url } }),
};

export default apiClient;

