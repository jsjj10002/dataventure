'use client';

import { useState } from 'react';
import { Upload, Plus, X, Save, Loader2, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function CandidateProfilePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [skills, setSkills] = useState<string[]>(['Python', 'React']);
  const [newSkill, setNewSkill] = useState('');
  const [careers, setCareers] = useState([
    { company: '', position: '', startDate: '', endDate: '', description: '' }
  ]);
  const [projects, setProjects] = useState([
    { title: '', description: '', skills: [], startDate: '', endDate: '', url: '' }
  ]);

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleAddCareer = () => {
    setCareers([...careers, { company: '', position: '', startDate: '', endDate: '', description: '' }]);
  };

  const handleRemoveCareer = (index: number) => {
    setCareers(careers.filter((_, i) => i !== index));
  };

  const handleAddProject = () => {
    setProjects([...projects, { title: '', description: '', skills: [], startDate: '', endDate: '', url: '' }]);
  };

  const handleRemoveProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // TODO: API 호출
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    alert('프로필이 저장되었습니다!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">구직자 프로필 작성</h1>
          <p className="mt-2 text-gray-600">
            상세한 정보를 입력하여 AI 인터뷰와 매칭 정확도를 높이세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
              <CardDescription>프로필 사진과 기본 정보를 입력하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="profileImage">프로필 사진</Label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-200">
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                  <Button type="button" variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    사진 업로드
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="name">이름 *</Label>
                  <Input id="name" placeholder="홍길동" required />
                </div>
                <div>
                  <Label htmlFor="education">학력 *</Label>
                  <Input id="education" placeholder="예: 서울대학교 컴퓨터공학과 (학사)" required />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="experience">경력 (년)</Label>
                  <Input id="experience" type="number" placeholder="0" min="0" />
                </div>
                <div>
                  <Label htmlFor="desiredPosition">희망 직무 *</Label>
                  <Input id="desiredPosition" placeholder="예: IT개발, 경영관리" required />
                </div>
              </div>

              <div>
                <Label htmlFor="desiredSalary">희망 연봉 (만원)</Label>
                <Input id="desiredSalary" type="number" placeholder="4000" />
              </div>

              <div>
                <Label htmlFor="bio">자기소개</Label>
                <Textarea
                  id="bio"
                  placeholder="간단한 자기소개를 작성해주세요..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* 보유 기술 */}
          <Card>
            <CardHeader>
              <CardTitle>보유 기술</CardTitle>
              <CardDescription>보유하고 있는 기술 스택을 추가하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="기술명 입력 (예: Python, React)"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                />
                <Button type="button" onClick={handleAddSkill}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="gap-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 경력 사항 */}
          <Card>
            <CardHeader>
              <CardTitle>경력 사항</CardTitle>
              <CardDescription>경력이 있다면 상세히 작성해주세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {careers.map((career, index) => (
                <div key={index} className="space-y-4 rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">경력 {index + 1}</h4>
                    {careers.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCareer(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input placeholder="회사명" />
                    <Input placeholder="직책" />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input type="month" placeholder="시작일" />
                    <Input type="month" placeholder="종료일 (현재 재직중이면 비워두기)" />
                  </div>
                  <Textarea placeholder="주요 업무 및 성과" rows={3} />
                </div>
              ))}
              <Button type="button" variant="outline" onClick={handleAddCareer} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                경력 추가
              </Button>
            </CardContent>
          </Card>

          {/* 프로젝트 경험 */}
          <Card>
            <CardHeader>
              <CardTitle>프로젝트 경험</CardTitle>
              <CardDescription>주요 프로젝트를 추가하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {projects.map((project, index) => (
                <div key={index} className="space-y-4 rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">프로젝트 {index + 1}</h4>
                    {projects.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveProject(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <Input placeholder="프로젝트명" />
                  <Textarea placeholder="프로젝트 설명" rows={3} />
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input type="month" placeholder="시작일" />
                    <Input type="month" placeholder="종료일" />
                  </div>
                  <Input placeholder="프로젝트 URL (GitHub, 웹사이트 등)" />
                </div>
              ))}
              <Button type="button" variant="outline" onClick={handleAddProject} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                프로젝트 추가
              </Button>
            </CardContent>
          </Card>

          {/* 파일 업로드 */}
          <Card>
            <CardHeader>
              <CardTitle>파일 및 링크</CardTitle>
              <CardDescription>이력서, 포트폴리오, 외부 링크를 추가하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="resume">이력서 (PDF, DOCX)</Label>
                <div className="mt-2">
                  <Button type="button" variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    이력서 업로드
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="portfolio">포트폴리오 파일</Label>
                <div className="mt-2">
                  <Button type="button" variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    포트폴리오 업로드
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="githubUrl">GitHub URL</Label>
                  <Input
                    id="githubUrl"
                    type="url"
                    placeholder="https://github.com/username"
                  />
                </div>
                <div>
                  <Label htmlFor="blogUrl">블로그 URL</Label>
                  <Input
                    id="blogUrl"
                    type="url"
                    placeholder="https://blog.example.com"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                  <Input
                    id="linkedinUrl"
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div>
                  <Label htmlFor="portfolioWebUrl">포트폴리오 웹사이트</Label>
                  <Input
                    id="portfolioWebUrl"
                    type="url"
                    placeholder="https://portfolio.example.com"
                  />
                </div>
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
