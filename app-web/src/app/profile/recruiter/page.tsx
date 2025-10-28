'use client';

import { useState } from 'react';
import { Upload, Save, Loader2, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RecruiterProfilePage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // TODO: API 호출
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    alert('회사 정보가 저장되었습니다!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">회사 정보 작성</h1>
          <p className="mt-2 text-gray-600">
            회사 소개와 인재상을 작성하여 최적의 인재를 찾으세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 회사 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>회사 기본 정보</CardTitle>
              <CardDescription>회사 로고와 기본 정보를 입력하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="companyLogo">회사 로고</Label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                    <Building2 className="h-8 w-8 text-gray-400" />
                  </div>
                  <Button type="button" variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    로고 업로드
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="companyName">회사명 *</Label>
                  <Input id="companyName" placeholder="예: 플렉스 AI" required />
                </div>
                <div>
                  <Label htmlFor="companyUrl">회사 웹사이트</Label>
                  <Input
                    id="companyUrl"
                    type="url"
                    placeholder="https://company.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="position">담당자 직책 *</Label>
                <Input id="position" placeholder="예: 인사팀 팀장" required />
              </div>
            </CardContent>
          </Card>

          {/* 회사 소개 */}
          <Card>
            <CardHeader>
              <CardTitle>회사 소개</CardTitle>
              <CardDescription>
                회사에 대해 구직자들에게 소개할 내용을 작성하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="companyDescription">회사 소개 *</Label>
                <Textarea
                  id="companyDescription"
                  placeholder="회사의 비전, 주요 사업, 조직 문화 등을 소개해주세요..."
                  rows={6}
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  구직자들이 회사를 이해하는 데 도움이 되는 정보를 작성하세요
                </p>
              </div>

              <div>
                <Label htmlFor="companyVision">인재상 / 비전</Label>
                <Textarea
                  id="companyVision"
                  placeholder="우리 회사가 추구하는 인재상, 핵심 가치, 기업 문화 등을 설명해주세요..."
                  rows={6}
                />
                <p className="mt-1 text-sm text-gray-500">
                  어떤 인재를 찾고 있는지, 회사의 핵심 가치는 무엇인지 설명하세요
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 회사 정보 세부사항 */}
          <Card>
            <CardHeader>
              <CardTitle>추가 정보</CardTitle>
              <CardDescription>
                구직자들에게 도움이 될 추가 정보를 입력하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="industry">업종</Label>
                  <Input
                    id="industry"
                    placeholder="예: IT 서비스, 제조, 금융"
                  />
                </div>
                <div>
                  <Label htmlFor="employeeCount">직원 수</Label>
                  <Input
                    id="employeeCount"
                    placeholder="예: 50-100명"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="location">본사 위치</Label>
                  <Input
                    id="location"
                    placeholder="예: 서울특별시 강남구"
                  />
                </div>
                <div>
                  <Label htmlFor="foundedYear">설립연도</Label>
                  <Input
                    id="foundedYear"
                    type="number"
                    placeholder="2020"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 복리후생 */}
          <Card>
            <CardHeader>
              <CardTitle>복리후생</CardTitle>
              <CardDescription>
                회사가 제공하는 복리후생을 소개하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="benefits"
                placeholder="예: 유연근무제, 재택근무 가능, 4대보험, 연차, 경조사 지원, 교육비 지원 등"
                rows={5}
              />
            </CardContent>
          </Card>

          {/* 공유 설정 */}
          <Card>
            <CardHeader>
              <CardTitle>회사 페이지 공유</CardTitle>
              <CardDescription>
                회사 소개 페이지를 외부에 공유할 수 있습니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-600">
                  저장 후 고유 URL이 생성됩니다:
                </p>
                <p className="mt-2 font-mono text-sm text-primary-600">
                  https://flex-ai-recruiter.com/company/your-unique-id
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 저장 버튼 */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline">
              취소
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  저장하기
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
