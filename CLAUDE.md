# CLAUDE.md — AI 코드 생성 규칙서

이 프로젝트는 코드를 직접 치지 않고 AI로만 개발한다. 이 파일이 코드 품질의 핵심이므로, 코드 생성 시 반드시 모든 항목을 준수할 것.

---

## 1. 프로젝트 컨텍스트

메이플랜드(메이플스토리 클래식 서버) 캐릭터의 장비·스탯·버프·패시브를 시뮬레이션하여 최종 데미지를 계산하는 **클라이언트 전용 SPA**.

> **코드 작성 전 [ARCHITECTURE.md](ARCHITECTURE.md)를 반드시 먼저 읽을 것.** 프로젝트 구조, 데이터 흐름, 상태 관리 전략이 모두 기술되어 있다.

---

## 2. 핵심 설계 원칙

### Character 클래스 = Mutable 객체 + version++ 패턴

```typescript
// CharacterContext.tsx 내부
const [character] = useState(() => new Character());  // 한 번만 생성
const [version, setVersion] = useState(0);
const refresh = useCallback(() => setVersion(v => v + 1), []);

// 커스텀 훅으로 콜백 분리
const buffCallbacks = useBuffCallbacks(character, refresh, version);
const storageCallbacks = useStorageCallbacks(character, refresh, currentSlotIdx, ...);
const inventoryCallbacks = useInventoryCallbacks(character, refresh);

// 직접 정의 콜백 (스탯, 장비)
const setLevel = useCallback((level: number) => {
  character.setLevel(level);   // 도메인 객체 직접 mutate
  refresh();                   // version++ → 전체 리렌더링
}, [character, refresh]);

// Context value에 스프레드로 병합
const value = useMemo(() => ({
  character, version, setLevel, ...buffCallbacks, ...storageCallbacks, ...inventoryCallbacks,
}), [...]);
```

- `Character`는 `src/domain/Character.ts`의 mutable 클래스
- 내부에 `stats`, `equipments(Map)`, `buffs(Map)`, `buffUI(BuffUIState)` 보유
- 중첩 구조(stats, equipment Map, buff Map)의 깊은 복사 비용을 피하고, 도메인 계산 로직을 클래스 메서드에 응집시키기 위한 의도적 설계이다.
- **절대 immutable로 바꾸거나, 새로운 상태관리 라이브러리를 도입하지 말 것**
- 모든 Context setter는 `useCallback`으로 감싸고, 의존성에 `[character, refresh]` 포함
- `CharacterContext.tsx`가 비대해지면 커스텀 훅(`src/hooks/use*.ts`)으로 콜백을 분리. Context 자체를 쪼개지는 않는다

### 데이터 우선순위: PostItem JSON(로컬) → maplestory.io API

```typescript
// src/api/maplestory.ts > fetchItemIcon()
// 1순위: postItem 로컬 아이콘
const postIcon = await getPostItemIcon(catKey, itemId);
if (postIcon) return postIcon;
// 2순위: API 아이콘
const response = await fetch(`${API_BASE_URL}/${itemId}/icon?resize=5`);
```

이 순서를 반드시 유지할 것. PostItem에 데이터가 있으면 API를 호출하지 않는다.

### 서버/DB 없는 순수 클라이언트 앱

- 백엔드 코드, API 서버 코드, DB 스키마 코드를 **절대 생성하지 말 것**
- 모든 영속 데이터는 브라우저 `localStorage`
- 게임 데이터는 `src/data/` 하위 JSON 파일 (빌드에 포함)

---

## 3. 코드 컨벤션

### 네이밍 규칙 (실제 코드에서 추출)

| 대상 | 규칙 | 실제 예시 |
|------|------|----------|
| 컴포넌트 | PascalCase, `export default function` | `StatTable`, `BuffTable`, `ItemMakerModal` |
| 컴포넌트 파일 | PascalCase.tsx | `StatTable.tsx`, `ItemTooltip.tsx` |
| 타입/인터페이스 | PascalCase | `Equipment`, `PassiveSkillData`, `FinalStats` |
| 타입 파일 | camelCase.ts | `character.ts`, `equipment.ts`, `stats.ts` |
| 커스텀 훅 파일 | use + PascalCase.ts | `useBuffCallbacks.ts`, `useStorageCallbacks.ts` |
| 유틸 파일 | camelCase.ts | `characterStorage.ts`, `postItemLoader.ts` |
| 함수 | camelCase | `getDefaultPassiveLevels`, `fetchItemIcon` |
| 상수 객체 | UPPER_SNAKE_CASE | `WEAPON_CONSTANTS`, `ARMOR_FILTERS`, `EQUIPMENT_LAYOUT` |
| 일반 매핑 | camelCase | `passivesByJob`, `propLabels` |
| JSON 파일 | camelCase.json | `shieldMastery.json`, `buff1.json` |
| JSON 스킬명 | `koreanName` + `englishName` | `"쓰러스트"` / `"Thrust"` |
| JSON 스탯 키 | 약어 소문자, %는 P 접미사 | `acc`, `eva`, `pdef`, `pdefP`, `speed` |
| Context setter | set + 대상 | `setMastery1`, `setPassiveLevel` |
| boolean | is/has/enabled | `isJobMagician`, `hasShield`, `heroEchoEnabled` |
| 이벤트 핸들러 | handle + 동작 | `handleJobChange` |
| Props 콜백 | on + 동작 | `onSlotClick`, `onClose` |
| 직업 식별 | `job.engName` 문자열 | `"warrior"`, `"archer"`, `"magician"`, `"thief"` |

### import 순서

```typescript
// 1. MUI 컴포넌트
import { Box, Typography, TextField, Button, Dialog } from "@mui/material";
// 2. MUI 아이콘, 스타일, 타입
import { Close as CloseIcon } from "@mui/icons-material";
import type { SelectChangeEvent } from "@mui/material";
// 3. React
import { useState, useEffect, useCallback, useMemo } from "react";
// 4. Context
import { useCharacter } from "../contexts/CharacterContext";
// 5. 타입 (type import 사용)
import type { Item } from "../types/item";
import type { EquipmentSlot } from "../types/equipment";
// 6. JSON 데이터
import mastery1Data from "../data/buff/mastery/mastery1.json";
import shieldMasteryData from "../data/passive/warrior/shieldMastery.json";
// 7. 유틸/API
import { fetchItemIcon } from "../api/maplestory";
import { equipmentToSaved } from "../utils/equipmentConverter";
// 8. 로컬 컴포넌트
import ItemTooltip from "./ItemTooltip";
```

### 에러 핸들링 패턴

```typescript
// API 에러 핸들링 표준 패턴
try {
  const res = await fetch(url);
  if (!res.ok) return null;
  return await res.json();
} catch (e) {
  console.error("설명", e);
  return null; // 또는 빈 배열 []
}
```

- API 실패 시 throw 금지. null 또는 빈 배열로 graceful 처리
- console.error로 원인 로깅 필수

### 스타일링

- **MUI `sx` prop만 사용**. styled-components, makeStyles, CSS Modules 사용 금지
- 컬러는 hex 직접 사용: `#f5f5f5`, `#666`, `#aaa`, `#ffffff`
- MUI theme은 직업별 primary 색상 동적 변경에만 사용 (`DynamicThemeProvider`)
- App.css, index.css는 레거시. 새 CSS 파일 생성 금지

```typescript
<Box sx={{ display: "flex", gap: 1.5, p: 1.5, bgcolor: "#f5f5f5", borderRadius: 1 }}>
```

---

## 4. 파일 배치 규칙

```
새 UI 컴포넌트      → src/components/{ComponentName}.tsx
새 커스텀 훅        → src/hooks/use{기능}.ts  (CharacterContext 콜백 분리용)
새 타입 정의         → src/types/ (기존 파일에 추가 우선. 새 파일은 최소화)
새 유틸 함수         → src/utils/{기능}.ts
새 API 호출 함수     → src/api/maplestory.ts에 추가
도메인 로직          → src/domain/Character.ts
전역 상태 추가       → src/contexts/CharacterContext.tsx
```

### 데이터 파일 배치

```
새 버프 데이터       → src/data/buff/{직업 or 카테고리}/{skillName}.json
새 패시브 데이터     → src/data/passive/{직업}/{skillName}.json
새 아이템 목록       → src/data/items/{카테고리}.json         (PreItem)
새 아이템 상세       → src/data/postItems/{카테고리}.json     (PostItem)
```

직업 폴더명: `warrior`, `archer`, `magician`, `thief`, `common`

### 주의사항

- 컴포넌트는 **파일당 하나의 `export default function`**
- API 호출은 `src/api/maplestory.ts`만 사용
- 타입과 관련 상수는 같은 파일에 함께 둠 (예: `job.ts`에 `Job` 인터페이스 + `JOBS` 배열 + `JOB_COLORS`)

---

## 5. 안티패턴 (하지 말 것)

### 절대 금지

| 금지 사항 | 이유 |
|-----------|------|
| Zustand, Recoil, Redux 등 상태관리 라이브러리 도입 | `CharacterContext` 단일 Context로 확립됨 |
| Character 객체를 immutable 패턴으로 변경 | mutable + version++ 패턴이 전체 앱의 기반 |
| `utils/` 디렉토리에서 API 직접 호출 | `api/maplestory.ts`만 사용 |
| localStorage 키 패턴 변경 | 기존 사용자 데이터 호환성 깨짐 |
| 서버 사이드 코드 / API 서버 코드 생성 | 순수 클라이언트 앱 |
| MUI 외 UI 라이브러리 추가 | Chakra, Ant Design 등 도입 금지 |
| 새 React Context 생성 | 상태 소스는 `CharacterContext` 하나를 유지. 콜백은 이미 `useBuffCallbacks`, `useStorageCallbacks`, `useInventoryCallbacks` 훅으로 분리되어 있으므로 추가 분리 시 같은 패턴을 따를 것 |
| 라우터(react-router 등) 도입 | 단일 페이지. 패널 전환은 `middlePanel` state |
| i18n 라이브러리 도입 | 한국어 전용 서비스 |
| styled-components, CSS Modules | MUI `sx` prop으로 통일 |
| Vite `base: "/item/"` 변경 | 루트 사이트 서브 경로 배포 구조 깨짐 |

### 코드 수준 금지

- 컴포넌트에서 `localStorage` 직접 접근 금지 → `characterStorage.ts`, `inventoryStorage.ts` 유틸 사용
- 컴포넌트에서 `fetch()` 직접 호출 금지 → `src/api/maplestory.ts` 함수 사용
- API 호출 실패 시 `throw` 금지 → 빈 배열 `[]` 또는 `null` 반환으로 graceful 처리
- 스킬/버프 수치를 코드에 하드코딩 금지 → 반드시 JSON 파일로 분리
- JSON `properties` 배열의 인덱스=레벨 규칙 변경 금지
- 아이템 스탯 키 이름 변경 금지 (`acc`, `eva`, `pdef`, `mdef`, `mad` 등 기존 약어 유지)

---

## 6. 데이터 관련 규칙

### PreItem vs PostItem

| | PreItem (`src/data/items/`) | PostItem (`src/data/postItems/`) |
|---|---|---|
| **용도** | 아이템 검색 목록 (가벼운 인덱스) | 장비 장착 시 실제 스탯·아이콘 |
| **구조** | 배열: `[{ id, name, koreanName, reqJob, reqLevel }]` | 맵: `{ "아이템ID": { koreanName, icon, stats, requireStats } }` |
| **생성** | 수동 작성 | `scripts/fetchPostItems.mjs`로 API에서 자동 생성 |
| **크기** | 경량 (ID, 이름, 레벨만) | 중량 (전체 스탯, base64 아이콘 포함) |
| **로드** | 정적 import | `import.meta.glob` 동적 import + 모듈 레벨 캐시 |

### 버프/패시브 데이터 구조

```
src/data/buff/                   src/data/passive/
├── MapleWarrior/                ├── warrior/
│   └── MapleWarrior.json        │   └── shieldMastery.json
├── HerosEcho/                   ├── archer/
│   └── herosecho.json           │   ├── thrust.json
├── buff/                        │   └── amazonBlessing.json
│   ├── buff1.json               └── thief/
│   └── buff2.json                   └── nimbleBody.json
├── mastery/
│   ├── mastery1.json
│   └── mastery2.json
├── common/                      ← 직업 공용
├── warrior/ archer/ magician/ thief/  ← 직업별
└── custom/                      ← 커스텀
```

**스킬 JSON 공통 구조:**

```json
{
  "icon": "base64...",
  "koreanName": "스킬한글명",
  "englishName": "SkillEnglishName",
  "description": "",
  "maxLevel": 20,
  "properties": [
    { "level": 0, "statKey": 0 },
    { "level": 1, "statKey": 값 },
    ...
    { "level": 20, "statKey": 최대값 }
  ]
}
```

- `properties[i]` = 레벨 i의 효과. **인덱스 = 레벨** 규칙 필수
- 스탯 키: `acc`(명중), `eva`(회피), `speed`(이속), `pdefP`(물방%), `mastery`(숙련도), `att`(공격력)

### localStorage 키 네이밍 규칙

| 키 패턴 | 용도 | 정의 위치 |
|---------|------|----------|
| `mapleland_slot_{job}_{0-4}` | 직업별 캐릭터 슬롯 (5개) | `characterStorage.ts` |
| `mapleland_last_active` | 마지막 활성 직업+슬롯 | `characterStorage.ts` |
| `mapleland_inventory_{job}` | 직업별 인벤토리 | `inventoryStorage.ts` |
| `mapleland_storage_migrated` | 레거시 마이그레이션 완료 플래그 | `characterStorage.ts` |

**이 키 패턴을 절대 변경하지 말 것.** 기존 사용자의 저장 데이터가 유실된다.

---

## 7. 기술 스택 제약

### 핵심 의존성 (메이저 버전 변경 금지)

```
react: ^19.2.0
react-dom: ^19.2.0
@mui/material: ^7.3.7
@mui/icons-material: ^7.3.7
@emotion/react: ^11.14.0
@emotion/styled: ^11.14.1
vite: ^7.2.4
typescript: ~5.9.3
```

### 새 패키지 설치 전 확인

1. MUI에 이미 해당 컴포넌트/기능이 있는가?
2. React 내장 API(Context, useCallback, useMemo, useRef)로 충분한가?
3. 번들 크기 영향 — `vite.config.ts`의 `manualChunks` 설정 확인
4. **사용자 확인 없이 `npm install` 실행 금지**

---

## 8. 빌드 & 배포

### npm 스크립트

| 스크립트 | 용도 |
|---------|------|
| `npm run dev` | 로컬 개발 서버 (Vite) |
| `npm run build` | TypeScript 컴파일(`tsc -b`) + Vite 프로덕션 빌드 |
| `npm run lint` | ESLint 실행 |
| `npm run preview` | 빌드 결과물 로컬 프리뷰 |
| `npm run deploy` | 빌드 + gh-pages 배포 (로컬 수동) |
| `npm run generate-items` | `tsx src/scripts/generateItemData.ts` 실행 |
| `npm run update-reqlevels` | `tsx src/scripts/updateReqLevels.ts` 실행 |

### 빌드 검증

코드 변경 후 반드시 순서대로 실행:

1. `npm run lint` — 린트 에러 0개 확인
2. `npm run build` — 타입 에러·빌드 에러 0개 확인
3. 에러가 있으면 커밋 전에 모두 해결

특히 자주 나오는 에러:
- `TS6133: declared but its value is never read` → 사용하지 않는 변수 즉시 제거
- `TS2305: has no exported member` → import 경로와 export 이름 확인

### Vite 설정 (변경 금지)

```typescript
// vite.config.ts
export default defineConfig({
  base: "/item/",                    // ← 절대 변경 금지 (루트 사이트 서브 경로)
  build: {
    rollupOptions: {
      output: {
        manualChunks: {              // ← 구조 유지
          "vendor-react": ["react", "react-dom"],
          "vendor-mui": ["@mui/material", "@mui/icons-material", "@emotion/react", "@emotion/styled"],
        },
      },
    },
  },
});
```

### 배포 구조

```
master push → GitHub Actions (trigger-deploy.yml)
  → curl로 mapleland-st-root-page 레포에 repository_dispatch
  → 루트 레포에서 빌드·배포 수행
```

이 레포는 빌드/배포를 직접 수행하지 않음. `trigger-deploy.yml` 수정 시 주의.

---

## 커밋 메시지 컨벤션

```
{type}: {한글 설명}
```

| type | 용도 | 예시 |
|------|------|------|
| `feat` | 새 기능 | `feat: 패시브 스킬 UI 개선 및 상세 스탯 연동` |
| `fix` | 버그 수정 | `fix: 마법사 특수 무기(그 외) 표시 및 펫장비 툴팁 개선` |
| `chore` | 정리/설정 | `chore: 사용하지 않는 변수 제거` |

### 변경 범위 체크리스트

새 기능 추가 시 빠뜨리기 쉬운 파일들:

- **새 스킬/버프**: JSON 데이터 → `useBuffCallbacks.ts`(상태/콜백) → `BuffTable.tsx`(UI) → `DetailStatTable.tsx`(스탯 반영) → `useStorageCallbacks.ts`(저장 필드)
- **새 장비 슬롯**: `equipment.ts`(EQUIPMENT_LAYOUT) → `EquipTable.tsx` → `Character.ts`
- **새 스탯 종류**: `stats.ts` → `character.ts`(FinalStats) → `Character.ts`(계산) → `DetailStatTable.tsx`(표시)
- **새 상태 필드**: `useStorageCallbacks.ts`의 `saveCurrentCharacter()`와 `loadCharacter()` 양쪽에 반드시 반영
