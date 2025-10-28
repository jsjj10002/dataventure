/**
 * 인증 상태 관리 Store (Zustand)
 * - 사용자 정보
 * - 로그인/로그아웃
 * - 토큰 관리
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI, User, LoginRequest, RegisterRequest } from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (data: LoginRequest) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authAPI.login(data);
          const { token, user } = response.data;
          
          // localStorage에 저장
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.response?.data?.error || '로그인에 실패했습니다.';
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },
      
      register: async (data: RegisterRequest) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authAPI.register(data);
          const { token, user } = response.data;
          
          // localStorage에 저장
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.response?.data?.error || '회원가입에 실패했습니다.';
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },
      
      logout: () => {
        authAPI.logout();
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },
      
      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },
      
      setToken: (token: string | null) => {
        set({ token });
        
        if (token) {
          localStorage.setItem('token', token);
        } else {
          localStorage.removeItem('token');
        }
      },
      
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

