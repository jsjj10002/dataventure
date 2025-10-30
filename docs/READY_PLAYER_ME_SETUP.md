# Ready Player Me 통합 가이드

## 📌 현재 상태

### ✅ 이미 구현된 기능
- Public demo 아바타 사용 (API Key 불필요)
- GLTF/GLB 모델 로드 (`useGLTF` 훅)
- Morph Targets 기반 립싱크
- 눈 깜빡임 애니메이션
- 마우스 추적 시선 처리
- 숨쉬기 애니메이션
- **에러 핸들링 및 Fallback 메커니즘** (404 에러 시 자동 전환)
- **환경변수 기반 아바타 URL 관리**

### 🔑 API Key 필요 여부

**결론: 현재 구현에는 API Key가 필요 없다!**

#### API Key 불필요 (현재 상황)
```typescript
// ✅ Public GLB 파일 직접 로드
const { scene } = useGLTF('https://models.readyplayer.me/AVATAR_ID.glb');
```

공식 문서 확인 결과:
> "To enable straightforward integration of Ready Player Me avatars, the GET avatar endpoints are publicly available and currently do not require authentication."

#### API Key 필요 (고급 기능 사용 시)
- 커스텀 asset 생성/업로드
- User account 관리
- Premium asset unlocking
- 브랜드 커스터마이징

---

## 🚀 Quick Start (API Key 없이)

### 1. 커스텀 아바타 생성

**방법 A: 웹 인터페이스** (가장 간단)

1. https://readyplayer.me/ 방문
2. "Create Avatar" 클릭
3. 사진 업로드 또는 직접 커스터마이징
4. 완료 후 URL 복사:
   ```
   https://models.readyplayer.me/[YOUR_AVATAR_ID].glb
   ```

**방법 B: iframe 통합** (앱 내 생성)

```typescript
<iframe
  src="https://demo.readyplayer.me/avatar?frameApi"
  allow="camera *; microphone *"
  className="w-full h-screen"
/>

// postMessage로 GLB URL 받기
window.addEventListener('message', (event) => {
  const json = JSON.parse(event.data);
  if (json.eventName === 'v1.avatar.exported') {
    const avatarUrl = json.data.url;
    console.log('Avatar URL:', avatarUrl);
  }
});
```

### 2. 코드에 적용

**권장: 환경변수 사용**

```bash
# app-web/.env.local 파일 생성 또는 수정
NEXT_PUBLIC_AVATAR_MODEL_URL=https://models.readyplayer.me/YOUR_AVATAR_ID.glb
```

프로젝트는 자동으로 환경변수를 읽어 사용합니다. 코드 수정 불필요!

**대안: 직접 코드 수정**

```typescript
// app-web/src/components/interview/AIAvatarGLTF.tsx

// 방법 1: 기본 URL 교체 (47-51번 줄)
const DEFAULT_MODEL_URL = modelUrl || 
  process.env.NEXT_PUBLIC_AVATAR_MODEL_URL || 
  'https://models.readyplayer.me/YOUR_AVATAR_ID.glb';

// 방법 2: Props로 전달
<AIAvatarGLTF 
  modelUrl="https://models.readyplayer.me/YOUR_AVATAR_ID.glb"
  isSpeaking={isAISpeaking}
  emotion="neutral"
/>
```

### 3. 프리로드 (성능 최적화)

프로젝트는 자동으로 환경변수의 아바타를 프리로드합니다.

```typescript
// AIAvatarGLTF.tsx 하단에 자동 포함됨
const PRELOAD_URL = process.env.NEXT_PUBLIC_AVATAR_MODEL_URL || 
  'https://models.readyplayer.me/65a8dba831b23abb4f401bae.glb';
useGLTF.preload(PRELOAD_URL);
```

---

## 🔧 고급 설정 (API Key 사용)

### 언제 API Key가 필요한가?

1. **커스텀 의상/액세서리 업로드**
2. **브랜드 커스터마이징** (로고, 색상 등)
3. **User Account Linking** (크로스 디바이스 동기화)
4. **Premium Assets** (유료 아이템 잠금/해제)

### API Key 발급 절차

#### Step 1: Studio 가입
```
https://studio.readyplayer.me/
```

#### Step 2: Application 생성
1. Dashboard → "Create Application"
2. Application Name 입력
3. **Application ID 복사** (예: `64bfa15f0e72c63d7c3934a0`)

#### Step 3: API Key 발급
1. Developer Tools → API Keys
2. "Create API Key" 클릭
3. **권한 설정**:
   - Read: Avatars, Users, Assets
   - Write: Avatars, Users, Assets (필요 시)
4. **API Key 복사** (예: `sk_live_abc123...`)

#### Step 4: 환경 변수 설정

**Frontend (.env.local)**
```bash
# Public - 클라이언트에서 접근 가능
NEXT_PUBLIC_READYPLAYER_ME_APP_ID=your-app-id

# iframe URL 커스터마이징
NEXT_PUBLIC_RPM_SUBDOMAIN=demo  # 또는 커스텀 subdomain
```

**Backend (.env)** - API Key는 절대 클라이언트 노출 금지!
```bash
READYPLAYER_ME_API_KEY=sk_live_abc123...
READYPLAYER_ME_ORGANIZATION_ID=your-org-id
```

### API 사용 예제

#### 서버 사이드 - Avatar 생성
```typescript
// pages/api/avatar/create.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const response = await fetch('https://api.readyplayer.me/v1/avatars', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.READYPLAYER_ME_API_KEY!,
    },
    body: JSON.stringify({
      partner: 'default',
      bodyType: 'fullbody',
      gender: 'male',
      // ... other avatar data
    }),
  });

  const data = await response.json();
  res.status(200).json(data);
}
```

#### 커스텀 Asset 업로드
```typescript
// pages/api/asset/upload.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { name, type, modelUrl, iconUrl } = req.body;

  const response = await fetch('https://api.readyplayer.me/v1/assets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.READYPLAYER_ME_API_KEY!,
    },
    body: JSON.stringify({
      data: {
        name,
        type, // 'outfit', 'hair', 'glasses', etc.
        gender: 'male',
        modelUrl,
        iconUrl,
        organizationId: process.env.READYPLAYER_ME_ORGANIZATION_ID!,
        locked: false,
        listed: true,
      },
    }),
  });

  const data = await response.json();
  res.status(201).json(data);
}
```

---

## 🎨 Avatar Creator 통합 (선택사항)

앱 내에서 아바타를 생성하고 싶다면:

### 1. iframe 컴포넌트 생성

```typescript
// app-web/src/components/avatar/AvatarCreator.tsx
'use client';

import { useState, useEffect } from 'react';

interface AvatarCreatorProps {
  onAvatarExported: (url: string) => void;
  subdomain?: string;
}

export default function AvatarCreator({ 
  onAvatarExported,
  subdomain = 'demo' 
}: AvatarCreatorProps) {
  const [frameUrl, setFrameUrl] = useState('');

  useEffect(() => {
    setFrameUrl(`https://${subdomain}.readyplayer.me/avatar?frameApi`);

    const handleMessage = (event: MessageEvent) => {
      try {
        const json = JSON.parse(event.data);
        
        if (json.source !== 'readyplayerme') return;

        // iframe ready - 이벤트 구독
        if (json.eventName === 'v1.frame.ready') {
          event.source?.postMessage(
            JSON.stringify({
              target: 'readyplayerme',
              type: 'subscribe',
              eventName: 'v1.**',
            }),
            { targetOrigin: '*' }
          );
        }

        // 아바타 생성 완료
        if (json.eventName === 'v1.avatar.exported') {
          const avatarUrl = json.data.url;
          console.log('Avatar exported:', avatarUrl);
          onAvatarExported(avatarUrl);
        }

        // User ID 받기
        if (json.eventName === 'v1.user.set') {
          console.log('User ID:', json.data.id);
        }
      } catch (error) {
        console.error('postMessage parse error:', error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [subdomain, onAvatarExported]);

  return (
    <iframe
      src={frameUrl}
      allow="camera *; microphone *; clipboard-write"
      className="w-full h-screen border-0"
    />
  );
}
```

### 2. 사용 예제

```typescript
// app-web/src/app/profile/avatar/page.tsx
'use client';

import { useState } from 'react';
import AvatarCreator from '@/components/avatar/AvatarCreator';
import AIAvatarGLTF from '@/components/interview/AIAvatarGLTF';

export default function AvatarPage() {
  const [avatarUrl, setAvatarUrl] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const handleAvatarExported = (url: string) => {
    setAvatarUrl(url);
    setShowPreview(true);
    
    // 서버에 저장
    fetch('/api/user/avatar', {
      method: 'POST',
      body: JSON.stringify({ avatarUrl: url }),
    });
  };

  return (
    <div>
      {!showPreview ? (
        <AvatarCreator onAvatarExported={handleAvatarExported} />
      ) : (
        <div className="w-full h-screen">
          <AIAvatarGLTF modelUrl={avatarUrl} />
        </div>
      )}
    </div>
  );
}
```

---

## 🔐 보안 Best Practices

### ❌ 절대 하지 말 것
```typescript
// 🚨 API Key를 클라이언트에 노출하지 마세요!
const apiKey = 'sk_live_abc123...'; // ❌ 위험!
fetch('https://api.readyplayer.me/v1/avatars', {
  headers: { 'x-api-key': apiKey },
});
```

### ✅ 올바른 방법
```typescript
// ✅ 서버 사이드에서만 API Key 사용
// pages/api/avatar/[id].ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const apiKey = process.env.READYPLAYER_ME_API_KEY; // ✅ 안전
  
  const response = await fetch(`https://api.readyplayer.me/v1/avatars/${req.query.id}`, {
    headers: { 'x-api-key': apiKey! },
  });
  
  res.json(await response.json());
}
```

### API Key 권한 최소화
```
Studio → API Keys → Permissions:
✅ Read: Avatars (GET만)
❌ Write: Avatars (불필요하면 비활성화)
✅ Read: Users
❌ Write: Assets (관리자만)
```

---

## 📊 현재 구현 상태 체크리스트

- [x] Three.js / React Three Fiber 설치
- [x] GLTF 모델 로드 (`useGLTF`)
- [x] Morph Targets 립싱크
- [x] 눈 깜빡임 애니메이션
- [x] 마우스 추적
- [x] 숨쉬기 애니메이션
- [x] Public demo 아바타 사용
- [ ] 커스텀 아바타 URL 설정 (선택)
- [ ] Avatar Creator iframe 통합 (선택)
- [ ] API Key 발급 및 설정 (필요 시)
- [ ] User Account Linking (필요 시)

---

## 🆘 문제 해결

### Q: 404 에러 - 모델을 로드할 수 없어요
**A: 가장 흔한 문제! 다음을 확인하세요:**

1. **아바타 ID 유효성 확인**
   - Ready Player Me의 draft 아바타는 24시간 후 만료됩니다
   - 만료된 아바타는 404 에러를 반환합니다
   - 해결: https://readyplayer.me/ 에서 새로운 아바타를 생성하세요

2. **URL 형식 확인**
   ```
   ✅ 올바른 형식: https://models.readyplayer.me/65a8dba831b23abb4f401bae.glb
   ❌ 잘못된 형식: https://api.readyplayer.me/... (API 엔드포인트)
   ```

3. **환경변수 설정** (프로젝트에서 권장)
   ```bash
   # app-web/.env.local
   NEXT_PUBLIC_AVATAR_MODEL_URL=https://models.readyplayer.me/YOUR_AVATAR_ID.glb
   ```

4. **에러 핸들링 확인**
   - 프로젝트에는 자동 fallback 메커니즘이 구현되어 있습니다
   - GLTF 로딩 실패 시 기본 3D 아바타로 자동 전환됩니다
   - 콘솔에서 `[AIAvatarGLTF]` 또는 `[AvatarErrorBoundary]` 로그를 확인하세요

### Q: 모델이 로드되지 않아요 (기타 원인)
**A:** 
1. URL 형식 확인: `https://models.readyplayer.me/[ID].glb`
2. Network 탭에서 404/403 확인
3. CORS 문제는 Ready Player Me가 자동 허용
4. 브라우저 콘솔에서 에러 메시지 확인

### Q: 립싱크가 작동하지 않아요
**A:**
```typescript
// Wolf3D_Head 메쉬 이름 확인
const headMesh = nodes.Wolf3D_Head as THREE.SkinnedMesh;
console.log('Morph Targets:', headMesh?.morphTargetDictionary);
```

### Q: API Key가 정말 필요 없나요?
**A:** 
- ✅ GLB 파일만 로드: **불필요**
- ✅ Public 아바타 사용: **불필요**
- ❌ 커스텀 asset 업로드: **필요**
- ❌ User account 관리: **필요**

### Q: 성능이 느려요
**A:**
```typescript
// 모델 프리로드
useGLTF.preload(modelUrl);

// LOD (Level of Detail) 사용
// 또는 halfbody 아바타 사용 (< 3MB)
```

---

## 📚 참고 자료

- **공식 문서**: https://docs.readyplayer.me/
- **Avatar Creator**: https://readyplayer.me/
- **Studio**: https://studio.readyplayer.me/
- **REST API**: https://docs.readyplayer.me/ready-player-me/api-reference/rest-api
- **Authentication**: https://docs.readyplayer.me/ready-player-me/api-reference/rest-api/authentication
- **React Three Fiber**: https://r3f.docs.pmnd.rs/
- **Three.js**: https://threejs.org/docs/

---

## 🎯 다음 단계 (선택사항)

1. **커스텀 아바타 생성**: https://readyplayer.me/
2. **GLB URL 교체**: `AIAvatarGLTF.tsx`의 `DEFAULT_MODEL_URL` 수정
3. **성능 최적화**: 모델 프리로드 및 압축
4. **(고급) API 통합**: Studio 가입 → API Key 발급 → 서버 구현

**현재는 API Key 없이도 완벽하게 작동합니다!** 🎉

