'use client';

import { useState } from 'react';
import { Download, FileText, TrendingUp, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { getScoreColor, getScoreGrade } from '@/lib/utils';

// 임시 데이터
const evaluationData = {
  scores: {
    informationAnalysis: 78,
    problemSolving: 82,
    flexibleThinking: 75,
    negotiation: 68,
    itSkills: 85,
    deliveryScore: 80,
    vocabularyScore: 76,
    comprehensionScore: 84,
    communicationAvg: 80,
    overallScore: 78.5
  },
  recommendedPositions: [
    { position: 'IT개발', score: 85, reason: 'IT능력과 문제해결능력이 뛰어납니다' },
    { position: '개발기획', score: 81, reason: 'IT능력과 정보분석능력이 우수합니다' },
    { position: '경영관리', score: 76, reason: '정보분석능력과 문제해결능력이 양호합니다' }
  ],
  feedback: {
    strengths: [
      'IT 기술에 대한 깊은 이해도를 보여주셨습니다',
      '문제를 체계적으로 분석하고 해결하는 능력이 뛰어납니다',
      '명확하고 논리적인 의사소통을 하셨습니다'
    ],
    weaknesses: [
      '협상 및 설득 과정에서 좀 더 구체적인 사례가 필요합니다',
      '유연한 사고를 요구하는 질문에서 다양한 관점 제시가 부족했습니다'
    ],
    recommendations: [
      '다양한 이해관계자와의 커뮤니케이션 경험을 쌓으시길 권장합니다',
      '창의적 문제 해결 사례를 더 준비하시면 좋을 것 같습니다',
      '실제 프로젝트 경험을 구체적으로 설명하는 연습을 해보세요'
    ],
    summary: '전반적으로 우수한 역량을 보여주셨습니다. 특히 IT 기술과 문제해결 능력이 뛰어나며, 이를 바탕으로 IT개발이나 개발기획 직무에 적합하다고 판단됩니다. 의사소통 능력도 양호하여 팀 협업에 잘 적응하실 것으로 예상됩니다.'
  },
  interviewDate: '2025-10-28',
  mode: 'ACTUAL'
};

export default function EvaluationPage() {
  const [showScript, setShowScript] = useState(false);

  // 레이더 차트 데이터 (5가지 직무역량)
  const radarData = [
    { skill: '정보분석', score: evaluationData.scores.informationAnalysis },
    { skill: '문제해결', score: evaluationData.scores.problemSolving },
    { skill: '유연한사고', score: evaluationData.scores.flexibleThinking },
    { skill: '협상설득', score: evaluationData.scores.negotiation },
    { skill: 'IT능력', score: evaluationData.scores.itSkills },
  ];

  // 의사소통능력 바 차트 데이터
  const communicationData = [
    { name: '전달력', score: evaluationData.scores.deliveryScore },
    { name: '어휘사용', score: evaluationData.scores.vocabularyScore },
    { name: '문제이해력', score: evaluationData.scores.comprehensionScore },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">인터뷰 평가 결과</h1>
              <p className="mt-2 text-gray-600">
                {evaluationData.interviewDate} · {evaluationData.mode === 'ACTUAL' ? '실전 모드' : '연습 모드'}
              </p>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              PDF 다운로드
            </Button>
          </div>
        </div>

        {/* 종합 점수 */}
        <Card className="mb-6 border-primary-200 bg-gradient-to-br from-primary-50 to-white">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="mb-2 text-lg font-semibold text-gray-900">종합 점수</h2>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-bold text-primary-600">
                    {evaluationData.scores.overallScore}
                  </span>
                  <span className="text-2xl text-gray-600">/100</span>
                  <Badge variant="default" className="ml-2 text-lg">
                    등급: {getScoreGrade(evaluationData.scores.overallScore)}
                  </Badge>
                </div>
              </div>
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary-600 text-white">
                <Award className="h-12 w-12" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* 의사소통능력 */}
          <Card>
            <CardHeader>
              <CardTitle>의사소통능력</CardTitle>
              <CardDescription>
                평균: {evaluationData.scores.communicationAvg}점
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={communicationData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#0891b2" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 직무역량 */}
          <Card>
            <CardHeader>
              <CardTitle>직무 특별 평가</CardTitle>
              <CardDescription>5가지 핵심 역량</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="skill" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar
                    name="점수"
                    dataKey="score"
                    stroke="#0891b2"
                    fill="#0891b2"
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* 추천 직무 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              추천 직무 랭킹
            </CardTitle>
            <CardDescription>
              당신의 역량에 가장 적합한 직무입니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {evaluationData.recommendedPositions.map((pos, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-600">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{pos.position}</h3>
                      <Badge>{pos.score}점</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{pos.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 상세 피드백 */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* 강점 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-700">💪 강점</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {evaluationData.feedback.strengths.map((strength, index) => (
                  <li key={index} className="text-sm text-gray-700">
                    • {strength}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* 약점 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-yellow-700">⚠️ 개선점</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {evaluationData.feedback.weaknesses.map((weakness, index) => (
                  <li key={index} className="text-sm text-gray-700">
                    • {weakness}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* 추천사항 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-700">📝 추천사항</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {evaluationData.feedback.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-gray-700">
                    • {rec}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* 종합 평가 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>종합 평가</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed text-gray-700">
              {evaluationData.feedback.summary}
            </p>
          </CardContent>
        </Card>

        {/* 스크립트 보기 */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>인터뷰 스크립트</CardTitle>
              <Button
                variant="outline"
                onClick={() => setShowScript(!showScript)}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                {showScript ? '닫기' : '스크립트 보기'}
              </Button>
            </div>
          </CardHeader>
          {showScript && (
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg bg-primary-50 p-4">
                  <p className="mb-1 text-sm font-semibold text-primary-900">AI 면접관</p>
                  <p className="text-gray-700">
                    안녕하세요! 오늘 인터뷰에 참여해주셔서 감사합니다. 간단히 자기소개를 부탁드립니다.
                  </p>
                </div>
                <div className="rounded-lg bg-gray-100 p-4">
                  <p className="mb-1 text-sm font-semibold text-gray-900">지원자</p>
                  <p className="text-gray-700">
                    안녕하세요. 저는 5년간 풀스택 개발자로 근무하며...
                  </p>
                </div>
                {/* 더 많은 대화 내용 */}
                <div className="text-center">
                  <Button variant="outline" size="sm">
                    전체 스크립트 다운로드
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* 액션 버튼 */}
        <div className="mt-8 flex justify-center gap-4">
          <Button variant="outline" onClick={() => window.history.back()}>
            돌아가기
          </Button>
          <Button className="gap-2">
            <TrendingUp className="h-4 w-4" />
            추천 채용 공고 보기
          </Button>
        </div>
      </div>
    </div>
  );
}
