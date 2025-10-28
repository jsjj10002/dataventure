'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Users,
  ArrowLeft,
  Save,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { jobPostingAPI } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

export default function CreateJobPostingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    employmentType: 'FULL_TIME',
    salaryMin: '',
    salaryMax: '',
    experienceRequired: '',
    educationRequired: '',
    deadline: '',
    description: '',
    requirements: '',
    benefits: '',
    tags: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || user.role !== 'RECRUITER') {
      toast.error('채용담당자만 공고를 작성할 수 있습니다.');
      return;
    }

    // 필수 필드 검증
    if (!formData.title || !formData.location || !formData.description) {
      toast.error('필수 항목을 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Tags를 배열로 변환
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // 급여를 숫자로 변환
      const salaryMin = formData.salaryMin ? parseInt(formData.salaryMin) : undefined;
      const salaryMax = formData.salaryMax ? parseInt(formData.salaryMax) : undefined;

      await jobPostingAPI.createJobPosting({
        title: formData.title,
        location: formData.location,
        employmentType: formData.employmentType as 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP',
        salaryMin,
        salaryMax,
        experienceRequired: formData.experienceRequired || undefined,
        educationRequired: formData.educationRequired || undefined,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
        description: formData.description,
        requirements: formData.requirements || undefined,
        benefits: formData.benefits || undefined,
        tags,
      });

      toast.success('채용 공고가 성공적으로 등록되었습니다!');
      router.push('/dashboard/recruiter');
    } catch (error: any) {
      console.error('채용 공고 등록 실패:', error);
      toast.error(error.response?.data?.message || '채용 공고 등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom max-w-4xl">
        {/* 헤더 */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            돌아가기
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">새 채용 공고 작성</h1>
          <p className="mt-2 text-gray-600">
            최고의 인재를 찾기 위해 상세한 정보를 입력해주세요.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* 기본 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>기본 정보</CardTitle>
                <CardDescription>채용 공고의 핵심 정보를 입력하세요.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 공고 제목 */}
                <div className="space-y-2">
                  <Label htmlFor="title">
                    공고 제목 <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="title"
                      name="title"
                      placeholder="예: 시니어 프론트엔드 개발자"
                      value={formData.title}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* 근무 지역 */}
                <div className="space-y-2">
                  <Label htmlFor="location">
                    근무 지역 <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="location"
                      name="location"
                      placeholder="예: 서울 강남구"
                      value={formData.location}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* 고용 형태 */}
                <div className="space-y-2">
                  <Label htmlFor="employmentType">고용 형태</Label>
                  <select
                    id="employmentType"
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={(e) => handleChange(e as any)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="FULL_TIME">정규직</option>
                    <option value="PART_TIME">계약직</option>
                    <option value="CONTRACT">파트타임</option>
                    <option value="INTERNSHIP">인턴</option>
                  </select>
                </div>

                {/* 급여 범위 */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="salaryMin">최소 연봉 (만원)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="salaryMin"
                        name="salaryMin"
                        type="number"
                        placeholder="3000"
                        value={formData.salaryMin}
                        onChange={handleChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaryMax">최대 연봉 (만원)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="salaryMax"
                        name="salaryMax"
                        type="number"
                        placeholder="5000"
                        value={formData.salaryMax}
                        onChange={handleChange}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* 경력 & 학력 */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="experienceRequired">필요 경력</Label>
                    <Input
                      id="experienceRequired"
                      name="experienceRequired"
                      placeholder="예: 3년 이상"
                      value={formData.experienceRequired}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="educationRequired">필요 학력</Label>
                    <Input
                      id="educationRequired"
                      name="educationRequired"
                      placeholder="예: 대졸 이상"
                      value={formData.educationRequired}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* 마감일 */}
                <div className="space-y-2">
                  <Label htmlFor="deadline">지원 마감일</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="deadline"
                      name="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={handleChange}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 상세 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>상세 정보</CardTitle>
                <CardDescription>지원자에게 제공할 자세한 정보를 작성하세요.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 직무 설명 */}
                <div className="space-y-2">
                  <Label htmlFor="description">
                    직무 설명 <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="어떤 일을 하게 될까요? 상세히 작성해주세요."
                    value={formData.description}
                    onChange={handleChange}
                    rows={6}
                    required
                  />
                </div>

                {/* 자격 요건 */}
                <div className="space-y-2">
                  <Label htmlFor="requirements">자격 요건</Label>
                  <Textarea
                    id="requirements"
                    name="requirements"
                    placeholder="필수 기술, 경험 등을 입력하세요."
                    value={formData.requirements}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>

                {/* 복리후생 */}
                <div className="space-y-2">
                  <Label htmlFor="benefits">복리후생</Label>
                  <Textarea
                    id="benefits"
                    name="benefits"
                    placeholder="제공하는 복리후생을 입력하세요."
                    value={formData.benefits}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>

                {/* 태그 */}
                <div className="space-y-2">
                  <Label htmlFor="tags">태그</Label>
                  <Input
                    id="tags"
                    name="tags"
                    placeholder="React, TypeScript, Node.js (쉼표로 구분)"
                    value={formData.tags}
                    onChange={handleChange}
                  />
                  <p className="text-sm text-gray-500">
                    쉼표(,)로 구분하여 입력하세요.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 안내 메시지 */}
            <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">작성 팁</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>명확하고 구체적인 직무 설명을 작성하세요.</li>
                  <li>필요한 기술과 경험을 상세히 나열하세요.</li>
                  <li>회사 문화와 복리후생을 강조하세요.</li>
                </ul>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Users className="mr-2 h-4 w-4 animate-spin" />
                    등록 중...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    공고 등록
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

