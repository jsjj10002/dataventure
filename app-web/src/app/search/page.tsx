'use client';

import { useState } from 'react';
import { Search, Filter, Users, Briefcase, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { ProfileCardSkeleton, JobCardSkeleton } from '@/components/ui/loading-skeleton';

interface SearchResult {
  type: 'candidate' | 'job' | 'company';
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  score?: number;
}

// 임시 데이터
const mockResults: SearchResult[] = [
  {
    type: 'candidate',
    id: '1',
    title: '김철수',
    subtitle: 'IT개발 · 5년 경력',
    description: '풀스택 개발자로 React, Node.js, Python 전문',
    tags: ['React', 'Node.js', 'Python', 'AWS'],
    score: 85
  },
  {
    type: 'job',
    id: '2',
    title: '시니어 백엔드 개발자',
    subtitle: '플렉스 AI',
    description: '빠르게 성장하는 AI 스타트업에서 백엔드 개발자를 찾습니다',
    tags: ['Python', 'FastAPI', 'PostgreSQL', '연봉 6000~8000']
  },
  {
    type: 'company',
    id: '3',
    title: '플렉스 AI',
    subtitle: 'AI 기술 기업',
    description: 'AI 기반 채용 솔루션을 개발하는 혁신적인 스타트업',
    tags: ['AI/ML', 'SaaS', '50-100명']
  }
];

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    // TODO: 실제 API 호출
    await new Promise(resolve => setTimeout(resolve, 1000));
    setResults(mockResults);
    setIsLoading(false);
  };

  const filteredResults = results.filter(result => {
    if (activeTab === 'all') return true;
    return result.type === activeTab;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'candidate':
        return <Users className="h-5 w-5" />;
      case 'job':
        return <Briefcase className="h-5 w-5" />;
      case 'company':
        return <Building2 className="h-5 w-5" />;
      default:
        return <Search className="h-5 w-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'candidate':
        return '구직자';
      case 'job':
        return '채용 공고';
      case 'company':
        return '회사';
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom max-w-5xl">
        {/* 검색 헤더 */}
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold text-gray-900">통합 검색</h1>
          
          {/* 검색창 */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="구직자, 채용 공고, 회사명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
                size={50}
              />
            </div>
            <Button onClick={handleSearch} disabled={!searchTerm.trim()}>
              <Search className="mr-2 h-4 w-4" />
              검색
            </Button>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              필터
            </Button>
          </div>
        </div>

        {/* 탭 */}
        {results.length > 0 && (
          <div className="mb-6">
            <div className="flex gap-2 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'border-b-2 border-primary-600 text-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                전체 ({results.length})
              </button>
              <button
                onClick={() => setActiveTab('candidate')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'candidate'
                    ? 'border-b-2 border-primary-600 text-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                구직자 ({results.filter(r => r.type === 'candidate').length})
              </button>
              <button
                onClick={() => setActiveTab('job')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'job'
                    ? 'border-b-2 border-primary-600 text-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                채용 공고 ({results.filter(r => r.type === 'job').length})
              </button>
              <button
                onClick={() => setActiveTab('company')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'company'
                    ? 'border-b-2 border-primary-600 text-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                회사 ({results.filter(r => r.type === 'company').length})
              </button>
            </div>
          </div>
        )}

        {/* 검색 결과 */}
        <div className="space-y-4">
          {isLoading ? (
            <>
              <ProfileCardSkeleton />
              <JobCardSkeleton />
              <ProfileCardSkeleton />
            </>
          ) : results.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Search className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  검색 결과가 없습니다
                </h3>
                <p className="text-sm text-gray-600">
                  {searchTerm
                    ? '다른 키워드로 검색해보세요'
                    : '검색어를 입력하여 구직자, 채용 공고, 회사를 찾아보세요'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredResults.map((result) => (
              <Card key={result.id} className="transition-all hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* 아이콘 */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                      {getIcon(result.type)}
                    </div>

                    {/* 내용 */}
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <Badge variant="outline">{getTypeLabel(result.type)}</Badge>
                        {result.score && (
                          <Badge variant="secondary">매칭 {result.score}점</Badge>
                        )}
                      </div>
                      <h3 className="mb-1 text-lg font-semibold text-gray-900">
                        {result.title}
                      </h3>
                      <p className="mb-2 text-sm text-gray-600">{result.subtitle}</p>
                      <p className="mb-3 text-sm text-gray-700">{result.description}</p>
                      
                      {/* 태그 */}
                      <div className="flex flex-wrap gap-2">
                        {result.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* 액션 */}
                    <Button variant="outline">
                      자세히 보기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* 추천 키워드 */}
        {results.length === 0 && !isLoading && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">인기 검색어</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {['React 개발자', 'Python', '경영관리', 'IT개발', '마케팅', 'AI 스타트업'].map((keyword) => (
                  <Button
                    key={keyword}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm(keyword);
                      handleSearch();
                    }}
                  >
                    {keyword}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
