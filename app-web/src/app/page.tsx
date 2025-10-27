export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          flex-AI-Recruiter
        </h1>
        <p className="text-center text-lg mb-4">
          대화형 AI 기반 채용 매칭 플랫폼
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <div className="p-6 border rounded-lg hover:bg-gray-50 transition">
            <h2 className="text-xl font-semibold mb-2">구직자</h2>
            <p className="text-gray-600">
              AI 인터뷰를 통해 역량을 객관적으로 평가받고,
              최적의 채용 공고를 추천받으세요.
            </p>
          </div>
          <div className="p-6 border rounded-lg hover:bg-gray-50 transition">
            <h2 className="text-xl font-semibold mb-2">채용 담당자</h2>
            <p className="text-gray-600">
              AI가 분석한 구직자 평가 결과를 바탕으로
              최적의 후보자를 찾으세요.
            </p>
          </div>
        </div>
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Sprint 0: 프로젝트 초기화 완료</p>
          <p className="mt-2">Next.js 14 + FastAPI + PostgreSQL</p>
        </div>
      </div>
    </main>
  );
}

