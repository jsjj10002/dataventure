'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Settings, Clock, MessageSquare, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export default function InterviewSetupPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'PRACTICE' | 'ACTUAL'>('PRACTICE');
  const [timeLimit, setTimeLimit] = useState(600); // 기본 10분
  const [inputMode, setInputMode] = useState<'TEXT' | 'VOICE'>('TEXT');

  const handleStart = () => {
    // TODO: 인터뷰 설정 저장
    router.push('/interview/start');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">AI 인터뷰 시작</h1>
          <p className="mt-2 text-gray-600">
            인터뷰 설정을 선택하고 시작하세요
          </p>
        </div>

        <div className="space-y-6">
          {/* 모드 선택 */}
          <Card>
            <CardHeader>
              <CardTitle>인터뷰 모드 선택</CardTitle>
              <CardDescription>
                연습 모드로 먼저 연습하거나, 실전 모드로 평가를 받으세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <button
                  onClick={() => setMode('PRACTICE')}
                  className={`rounded-lg border-2 p-6 text-left transition-all ${
                    mode === 'PRACTICE'
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">연습 모드</h3>
                    <Badge variant="secondary">추천</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    질문을 선택하거나 만들 수 있고, 시간 제한을 자유롭게 설정할 수 있습니다.
                    평가 결과는 프로필에 반영되지 않습니다.
                  </p>
                  <ul className="mt-3 space-y-1 text-xs text-gray-500">
                    <li>• 질문 커스터마이징 가능</li>
                    <li>• 채팅/음성 모드 선택</li>
                    <li>• 시간 제한 조정 (5/10/15/20분)</li>
                  </ul>
                </button>

                <button
                  onClick={() => setMode('ACTUAL')}
                  className={`rounded-lg border-2 p-6 text-left transition-all ${
                    mode === 'ACTUAL'
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">실전 모드</h3>
                    <Badge variant="default">본평가</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    실전과 동일한 조건에서 인터뷰를 진행합니다. 
                    평가 결과가 프로필에 반영되어 채용담당자가 확인할 수 있습니다.
                  </p>
                  <ul className="mt-3 space-y-1 text-xs text-gray-500">
                    <li>• AI 자동 질문 생성</li>
                    <li>• 음성 모드만 가능</li>
                    <li>• 고정 시간 15분</li>
                  </ul>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* 시간 설정 (연습 모드만) */}
          {mode === 'PRACTICE' && (
            <Card>
              <CardHeader>
                <CardTitle>시간 제한</CardTitle>
                <CardDescription>
                  인터뷰 시간을 설정하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {[
                    { value: 300, label: '5분' },
                    { value: 600, label: '10분' },
                    { value: 900, label: '15분' },
                    { value: 1200, label: '20분' }
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setTimeLimit(value)}
                      className={`rounded-lg border-2 p-4 text-center transition-all ${
                        timeLimit === value
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Clock className="mx-auto mb-2 h-6 w-6 text-gray-600" />
                      <span className="font-semibold text-gray-900">{label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 입력 방식 (연습 모드만) */}
          {mode === 'PRACTICE' && (
            <Card>
              <CardHeader>
                <CardTitle>입력 방식</CardTitle>
                <CardDescription>
                  채팅 또는 음성으로 답변하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <button
                    onClick={() => setInputMode('TEXT')}
                    className={`rounded-lg border-2 p-6 text-center transition-all ${
                      inputMode === 'TEXT'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <MessageSquare className="mx-auto mb-2 h-8 w-8 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">채팅 모드</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      텍스트로 답변을 입력합니다
                    </p>
                  </button>

                  <button
                    onClick={() => setInputMode('VOICE')}
                    className={`rounded-lg border-2 p-6 text-center transition-all ${
                      inputMode === 'VOICE'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Mic className="mx-auto mb-2 h-8 w-8 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">음성 모드</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      음성으로 답변합니다
                    </p>
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 주의사항 */}
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-900">시작하기 전 확인사항</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-yellow-900">
                <li>• 조용한 환경에서 인터뷰를 진행하세요</li>
                <li>• 카메라와 마이크 권한을 허용해주세요</li>
                <li>• 안정적인 인터넷 연결을 확인하세요</li>
                {mode === 'ACTUAL' && (
                  <li className="font-semibold">
                    • 실전 모드는 평가 결과가 프로필에 반영됩니다
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>

          {/* 시작 버튼 */}
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              취소
            </Button>
            <Button size="lg" onClick={handleStart} className="gap-2">
              <Play className="h-5 w-5" />
              인터뷰 시작하기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
