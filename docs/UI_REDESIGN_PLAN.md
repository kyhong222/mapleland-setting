# UI 개편 플랜: vs 몬스터 중심 설계

## 🎯 목표

1. **몬스터 중심 UI** - 특정 몬스터와의 전투 상황을 직관적으로 표시
2. **정보 가시성 향상** - 상세스탯, 방어, 버프를 숨기지 않고 한눈에 표시
3. **전투 요약 강조** - "이 몬스터와 싸우면 어떻게 되는가"를 명확하게 전달

## 📐 UI 구조

### 상단: 캐릭터 vs 몬스터 헤더

```
┌─────────────────────────────────────────────────────────┐
│  [캐릭터 요약]        VS        [몬스터 아이콘]           │
│  Lv.120 히어로                  Lv.125 핑크빈            │
│  STR 450 / 물공 1200            물공 630 / 마공 480      │
│                                [파워업] [매직업]          │
└─────────────────────────────────────────────────────────┘
```

**레이아웃 의도:**
- 좌측: 내 캐릭터 요약 (직업, 레벨, 주요 스탯)
- 중앙: "VS" 비주얼
- 우측: 몬스터 선택 UI + 파워업/매직업 토글

### 하단: 3열 레이아웃

```
좌측 (내 캐릭터)         중앙 (전투 능력)         우측 (vs 몬스터)
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ ⚔️ 장비 슬롯      │  │ 📊 기본 스탯      │  │ 🎯 선택된 몬스터  │
│ - 무기/방어구     │  │ - STR/DEX/INT... │  │ - 레벨/스탯      │
│ - 장신구          │  │                  │  │ - 속성           │
│                  │  │ 📈 상세 스탯      │  │                  │
│ 🎒 인벤토리       │  │ - 명중률: 85%    │  │ 📛 피격/회피      │
│ - 소비 아이템     │  │ - 물방/마방      │  │ - 접촉: 120~135  │
│ - 장비 보관       │  │ - 크리티컬       │  │ - 스킬: 80~95    │
│                  │  │                  │  │ - 회피율: 45%    │
│                  │  │ ✨ 버프 & 스킬    │  │                  │
│                  │  │ - 액티브 버프    │  │ ⚔️ 내 데미지      │
│                  │  │ - 패시브/특수    │  │ - 최소: 2500     │
│                  │  │                  │  │ - 최대: 3200     │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

**정보 흐름 (좌 → 우):**
1. **좌측**: "나는 이런 장비를 입고 있다"
2. **중앙**: "이런 능력치와 버프를 가지고 있다"
3. **우측**: "이 몬스터와 싸우면 이렇게 된다"

## 🔧 구현 단계

### Phase 1: 상단 헤더 컴포넌트 생성

**새 파일: `src/components/MonsterVsCharacterHeader.tsx`**

**역할:**
- 좌측: 캐릭터 요약 정보 표시
  - 직업 아이콘/이름
  - 레벨
  - 주요 스탯 (STR, 물공 등)
- 중앙: "VS" 텍스트 또는 아이콘
- 우측: 몬스터 선택 UI
  - 몬스터 아이콘 (클릭 시 모달)
  - 몬스터 이름, 레벨, 물공/마공
  - 파워업/매직업 토글 버튼

**분리할 로직:**
- `DamageReceivedTable`의 몬스터 선택 부분
- 몬스터 모달 UI
- 파워업/매직업 상태 관리

### Phase 2: 컴포넌트 재구성

#### 좌측 컬럼: 내 캐릭터
- `EquipTable` (기존)
  - `onOpenInventory`, `onExpandedChange` prop 제거
  - 단순히 장비 슬롯만 표시
- `Inventory` (기존)
  - `onClose` prop optional로 변경 (이미 완료)

#### 중앙 컬럼: 전투 능력
- `StatTable` (기존)
  - `onOpenDetailStat` prop 제거
- `DetailStatTable` (기존)
  - `onClose` prop optional로 변경 (이미 완료)
  - 버프/스킬 섹션 제거됨 (이미 완료)
- `BuffTable` (확장 필요)
  - 기존: 액티브 버프만 표시
  - 추가: DefenseBuffSection, SpecialSkillSection, PassiveSkillList 통합

#### 우측 컬럼: vs 몬스터
- `DamageReceivedTable` (수정 필요)
  - 상단 몬스터 선택 UI 제거 → 헤더로 이동
  - 몬스터 정보는 props로 받아오기
  - 타이틀: "피격/회피 계산"
- `DamageTable` (기존)
  - 변경 없음

### Phase 3: BuffTable 확장

**현재 구조:**
```typescript
// src/components/BuffTable.tsx
// 액티브 버프만 표시
```

**확장 후:**
```typescript
// 세 섹션으로 나누기:
// 1. 액티브 버프 (기존)
// 2. 특수 스킬 (DetailStatTable에서 이동)
//    - 마법사 서브직업 선택 UI 포함
// 3. 패시브 스킬 (DetailStatTable에서 이동)
//    - 마스터리 + 패시브 스킬
```

**이동할 컴포넌트:**
- `DefenseBuffSection` (방어 버프)
- `SpecialSkillSection` (특수 스킬)
- `PassiveSkillList` (패시브 스킬)
- `MasteryRow` (마스터리)
- 관련 다이얼로그들

### Phase 4: App.tsx 수정

**제거할 상태:**
```typescript
const [middlePanel, setMiddlePanel] = useState<"buff" | "inventory" | "detailStat">("buff");
const [equipExpanded, setEquipExpanded] = useState(false);
```

**새 레이아웃:**
```typescript
<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
  {/* 상단 헤더 */}
  <MonsterVsCharacterHeader />

  {/* 3열 레이아웃 */}
  <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
    {/* 좌측: 내 캐릭터 */}
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <EquipTable onSlotClick={...} onOpenItemMaker={...} />
      <Inventory />
    </Box>

    {/* 중앙: 전투 능력 */}
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <StatTable />
      <DetailStatTable />
      <BuffTable />
    </Box>

    {/* 우측: vs 몬스터 */}
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <DamageReceivedTable />
      <DamageTable />
    </Box>
  </Box>
</Box>
```

### Phase 5: 상태 관리 개선

**몬스터 선택 상태를 Context로 이동 (선택사항)**

현재: `DamageReceivedTable` 내부 상태
```typescript
const [selectedMob, setSelectedMob] = useState<MobListEntry | null>(null);
const [powerUpEnabled, setPowerUpEnabled] = useState(false);
const [magicUpEnabled, setMagicUpEnabled] = useState(false);
```

고려사항:
- 장점: 헤더와 계산기 간 상태 공유 용이
- 단점: Context 추가로 복잡도 증가

**결정:** 우선 props drilling으로 구현, 필요시 Context로 전환

### Phase 6: EquipTable 수정

**제거할 props:**
```typescript
onOpenInventory?: () => void;
onExpandedChange?: (expanded: boolean) => void;
```

**제거할 버튼:**
- 인벤토리 열기 버튼 (이제 항상 표시되므로)
- 확장/축소 버튼 (이제 항상 전체 표시되므로)

## 📝 파일별 작업 체크리스트

### 신규 파일
- [ ] `src/components/MonsterVsCharacterHeader.tsx`
  - [ ] 캐릭터 요약 섹션
  - [ ] VS 비주얼
  - [ ] 몬스터 선택 UI (DamageReceivedTable에서 분리)
  - [ ] 몬스터 모달 (DamageReceivedTable에서 분리)
  - [ ] 파워업/매직업 토글

### 수정 파일
- [ ] `src/App.tsx`
  - [ ] middlePanel, equipExpanded state 제거
  - [ ] 5열 → 3열 레이아웃 변경
  - [ ] MonsterVsCharacterHeader 추가

- [ ] `src/components/BuffTable.tsx`
  - [ ] DefenseBuffSection 통합
  - [ ] SpecialSkillSection 통합
  - [ ] PassiveSkillList + MasteryRow 통합
  - [ ] 관련 다이얼로그들 통합

- [ ] `src/components/DamageReceivedTable.tsx`
  - [ ] 상단 몬스터 선택 UI 제거
  - [ ] 몬스터 모달 제거
  - [ ] props로 몬스터 정보 받기
  - [ ] 타이틀 변경: "피격/회피 계산"

- [ ] `src/components/EquipTable.tsx`
  - [ ] onOpenInventory prop 제거
  - [ ] onExpandedChange prop 제거
  - [ ] 인벤토리/확장 버튼 제거

- [ ] `src/components/StatTable.tsx`
  - [ ] onOpenDetailStat prop 제거
  - [ ] 상세스탯 버튼 제거

### 이미 완료된 작업 (stash에서 복원)
- [x] `src/components/DetailStatTable.tsx`
  - [x] onClose prop optional로 변경
  - [x] 버프/스킬 섹션 제거
- [x] `src/components/Inventory.tsx`
  - [x] onClose prop optional로 변경

## 🎨 비주얼 개선 아이디어

### 1. 몬스터 vs 캐릭터 헤더
**디자인 요소:**
- 캐릭터 아이콘/직업 이미지
- 몬스터 아이콘 크게 (128x128)
- "VS" 텍스트 또는 검 아이콘
- 그라데이션 배경 (캐릭터 → 몬스터)

**정보 표시:**
- 캐릭터: 직업명, 레벨, 주요 스탯 2-3개
- 몬스터: 이름, 레벨, 물공/마공, 속성

### 2. 전투 요약 카드 (선택사항)
헤더 바로 아래에 한 줄 요약:
```
┌───────────────────────────────────────────┐
│ 피격: 120~135 | 회피: 45% | 데미지: 2500 │
└───────────────────────────────────────────┘
```

### 3. 색상 코딩
**위험도 표시:**
- 🔴 위험: 피격 데미지가 높을 때 (체력의 30% 이상)
- 🟡 주의: 피격 데미지가 보통일 때
- 🟢 안전: 피격 데미지가 낮거나 회피율이 높을 때

**스탯 강조:**
- 명중률 낮음 → 빨간색
- 회피율 높음 → 초록색
- 크리티컬 가능 → 노란색

### 4. 몬스터 속성 아이콘
- 불/얼음/번개/독 속성을 아이콘으로 표시
- 약점 속성 강조

## 📊 반응형 고려사항

### 최소 너비
- 전체 레이아웃: 1400px
- 각 컬럼: 400px
- 갭: 16px × 2

### 좁은 화면 (1200px 이하)
**Option 1: 2열로 자동 전환**
```
좌측 (내 캐릭터)         우측 (전투 정보)
┌──────────────────┐  ┌──────────────────┐
│ 장비 + 인벤토리   │  │ 스탯 + 버프       │
│                  │  │                  │
│                  │  │ 피격/회피         │
│                  │  │                  │
│                  │  │ 데미지            │
└──────────────────┘  └──────────────────┘
```

**Option 2: 스크롤**
- 최소 너비 유지
- 가로 스크롤 허용

**결정:** 우선 최소 너비 유지, 필요시 반응형 추가

## 🔄 마이그레이션 순서

1. **Phase 1**: 헤더 컴포넌트 생성 (독립적)
2. **Phase 2**: BuffTable 확장 (독립적)
3. **Phase 3**: EquipTable, StatTable 버튼 제거 (간단)
4. **Phase 4**: DamageReceivedTable 수정 (헤더 의존)
5. **Phase 5**: App.tsx 레이아웃 변경 (최종 통합)

## 📌 주의사항

### 상태 관리
- 몬스터 선택 상태는 헤더에서 관리하되, DamageReceivedTable과 DamageTable이 접근 가능해야 함
- Props drilling vs Context 선택 필요

### 기존 기능 유지
- 모든 기존 기능은 그대로 유지
- UI 재배치만, 기능 변경 없음

### 성능
- 컴포넌트 분리로 인한 불필요한 리렌더링 방지
- useMemo, useCallback 적절히 사용

## 🚀 배포 전 체크리스트

- [ ] 모든 직업에서 정상 동작 확인
- [ ] 몬스터 선택/변경 테스트
- [ ] 장비 변경 시 실시간 반영 확인
- [ ] 버프/스킬 설정 시 계산 정확도 확인
- [ ] 파워업/매직업 토글 동작 확인
- [ ] 반응형 레이아웃 (최소 너비) 확인
- [ ] TypeScript 에러 없음
- [ ] ESLint 경고 해결

## 📅 작업 일정 (예상)

- Phase 1-2: 2-3시간 (헤더 + BuffTable 확장)
- Phase 3-4: 1-2시간 (기존 컴포넌트 수정)
- Phase 5: 30분 (App.tsx 통합)
- 테스트/버그 수정: 1-2시간

**총 예상 시간: 4-7시간**

---

_작성일: 2026-02-23_
_브랜치: feat/ui-monster-oriented_
