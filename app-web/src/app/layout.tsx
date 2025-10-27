import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'flex-AI-Recruiter',
  description: '대화형 AI 기반 채용 매칭 플랫폼',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <nav className="w-full border-b bg-white">
          <div className="max-w-6xl mx-auto px-4 py-3 flex gap-4 text-sm">
            <a href="/" className="hover:text-blue-600">홈</a>
            <a href="/auth/login" className="hover:text-blue-600">로그인</a>
            <a href="/auth/register" className="hover:text-blue-600">회원가입</a>
            <a href="/dashboard" className="hover:text-blue-600">대시보드</a>
            <a href="/interview" className="hover:text-blue-600">인터뷰</a>
            <a href="/recommendations" className="hover:text-blue-600">추천</a>
            <a href="/jobs" className="hover:text-blue-600">공고</a>
            <a href="/test" className="hover:text-blue-600">테스트</a>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}

