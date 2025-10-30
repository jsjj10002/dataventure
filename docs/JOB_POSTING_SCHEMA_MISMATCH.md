# 채용 공고 스키마 불일치 문제

## 📋 문제 요약

채용 공고 등록 페이지(`app-web/src/app/job-posting/create/page.tsx`)에서 **프론트엔드가 요청하는 필드**와 **백엔드 Prisma 스키마**가 불일치하여 발생한 문제.

---

## 🔍 원인 분석

### 백엔드 Prisma 스키마 (`service-core/prisma/schema.prisma`)

```prisma
model JobPosting {
  id              String   @id @default(uuid())
  recruiterId     String
  
  title           String           // ✅ 지원
  description     String   @db.Text   // ✅ 지원
  requirements    String[]         // ✅ 지원 (배열)
  preferredSkills String[]         // ✅ 지원 (배열)
  
  position        String           // ✅ 지원 (필수)
  experienceMin   Int?             // ✅ 지원
  experienceMax   Int?             // ✅ 지원
  salaryMin       Int?             // ✅ 지원
  salaryMax       Int?             // ✅ 지원
  
  status          JobStatus @default(ACTIVE)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### 프론트엔드 원본 요청 필드 (수정 전)

| 필드명 | 백엔드 지원 | 상태 |
|---|---|---|
| `title` | ✅ | 정상 |
| `description` | ✅ | 정상 |
| `requirements` | ✅ | 정상 (배열로 변환 필요) |
| `salaryMin/Max` | ✅ | 정상 |
| `position` | ✅ | **누락됨** (필수 필드) |
| `experienceMin/Max` | ✅ | **형식 불일치** (`experienceRequired` 문자열 → 숫자 변환 필요) |
| `preferredSkills` | ✅ | **누락됨** |
| ❌ `location` | 지원 안 함 | 스키마에 없음 |
| ❌ `employmentType` | 지원 안 함 | 스키마에 없음 |
| ❌ `educationRequired` | 지원 안 함 | 스키마에 없음 |
| ❌ `deadline` | 지원 안 함 | 스키마에 없음 |
| ❌ `benefits` | 지원 안 함 | 스키마에 없음 |
| ❌ `tags` | 지원 안 함 | 스키마에 없음 |

---

## ✅ 해결 방안

### 1. `jobPostingAPI` 추가 (`app-web/src/lib/api.ts`)

```typescript
export const jobPostingAPI = {
  // 채용 공고 생성 (RECRUITER 전용)
  createJobPosting: (data: {
    title: string;
    description: string;
    position: string;
    requirements?: string[];
    preferredSkills?: string[];
    experienceMin?: number;
    experienceMax?: number;
    salaryMin?: number;
    salaryMax?: number;
  }) => apiClient.post('/api/v1/jobs', data),
  
  listJobPostings: (params?: { status?: string; position?: string; page?: number; limit?: number }) =>
    apiClient.get('/api/v1/jobs', { params }),
  
  getJobPosting: (id: string) =>
    apiClient.get(`/api/v1/jobs/${id}`),
  
  updateJobPosting: (id: string, data: Partial<{ /* ... */ }>) =>
    apiClient.put(`/api/v1/jobs/${id}`, data),
  
  deleteJobPosting: (id: string) =>
    apiClient.delete(`/api/v1/jobs/${id}`),
};
```

### 2. 프론트엔드 필드 수정

#### formData 수정
```typescript
const [formData, setFormData] = useState({
  title: '',
  position: '', // ✅ 추가 (필수)
  location: '', // ⚠️ 참고용 (저장 안 됨)
  employmentType: 'FULL_TIME', // ⚠️ 참고용
  salaryMin: '',
  salaryMax: '',
  experienceMin: '', // ✅ 변경 (문자열 → 숫자)
  experienceMax: '', // ✅ 변경
  educationRequired: '', // ⚠️ 참고용
  deadline: '', // ⚠️ 참고용
  description: '',
  requirements: '', // ✅ 쉼표로 구분 → 배열
  preferredSkills: '', // ✅ 추가 (쉼표로 구분 → 배열)
  benefits: '', // ⚠️ 참고용
});
```

#### 제출 로직 수정
```typescript
// requirements를 배열로 변환
const requirements = formData.requirements
  .split(',')
  .map(req => req.trim())
  .filter(req => req.length > 0);

// preferredSkills를 배열로 변환
const preferredSkills = formData.preferredSkills
  .split(',')
  .map(skill => skill.trim())
  .filter(skill => skill.length > 0);

// 경력을 숫자로 변환
const experienceMin = formData.experienceMin ? parseInt(formData.experienceMin) : undefined;
const experienceMax = formData.experienceMax ? parseInt(formData.experienceMax) : undefined;

await jobPostingAPI.createJobPosting({
  title: formData.title,
  position: formData.position, // ✅ 필수
  description: formData.description,
  requirements: requirements.length > 0 ? requirements : undefined,
  preferredSkills: preferredSkills.length > 0 ? preferredSkills : undefined,
  experienceMin,
  experienceMax,
  salaryMin,
  salaryMax,
});
```

### 3. UI 수정 요약

- ✅ **직무명(position)** 필드 추가 (필수)
- ✅ **최소/최대 경력(experienceMin/Max)** 숫자 입력으로 변경
- ✅ **우대 사항(preferredSkills)** 필드 추가
- ⚠️ **근무 지역(location)**, **학력(educationRequired)**, **마감일(deadline)**, **복리후생(benefits)** → "참고용" 표시 추가 (저장 안 됨)
- ❌ **태그(tags)** → 삭제

---

## 🔮 향후 개선 방안

### Option 1: 백엔드 스키마 확장 (권장)

Prisma 스키마에 누락된 필드 추가:

```prisma
model JobPosting {
  // ... 기존 필드 ...
  
  location        String?  // 근무 지역
  employmentType  String?  // 고용 형태 (FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP)
  educationLevel  String?  // 필요 학력
  deadline        DateTime? // 지원 마감일
  benefits        String[] // 복리후생
  tags            String[] // 태그
}
```

마이그레이션 실행:
```bash
cd service-core
npx prisma migrate dev --name add_job_posting_fields
```

### Option 2: 프론트엔드 필드 제거

사용자에게 혼란을 줄이기 위해 저장되지 않는 필드를 완전히 제거.

---

## 📝 작업 완료 체크리스트

- [x] `app-web/src/lib/api.ts`에 `jobPostingAPI` 추가
- [x] `app-web/src/app/job-posting/create/page.tsx` formData 수정
- [x] 제출 로직에서 필드 매핑 수정
- [x] UI에 `position` 필드 추가
- [x] UI에 `experienceMin/Max` 숫자 입력 추가
- [x] UI에 `preferredSkills` 필드 추가
- [x] 저장되지 않는 필드에 경고 메시지 추가
- [x] `tags` 필드 제거
- [ ] (선택) 백엔드 스키마 확장

---

## 🚨 주의사항

1. **필수 필드**: `title`, `position`, `description`는 반드시 입력해야 한다.
2. **배열 필드**: `requirements`, `preferredSkills`는 쉼표(,)로 구분하여 입력.
3. **숫자 필드**: `salaryMin/Max`, `experienceMin/Max`는 숫자로 입력.
4. **참고용 필드**: `location`, `educationRequired`, `deadline`, `benefits`는 현재 저장되지 않는다.

---

## 📚 관련 파일

- `service-core/prisma/schema.prisma` - 백엔드 스키마
- `service-core/src/controllers/jobPosting.controller.ts` - 채용 공고 컨트롤러
- `service-core/src/routes/jobPosting.routes.ts` - 채용 공고 라우트
- `app-web/src/lib/api.ts` - 프론트엔드 API 클라이언트
- `app-web/src/app/job-posting/create/page.tsx` - 채용 공고 등록 페이지

