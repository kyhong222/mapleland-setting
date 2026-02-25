# UI 개편 플랜: vs 몬스터 중심 설계

> ⚠️ **Sonnet 개발자를 위한 가이드**  
> 이 문서는 Claude Sonnet 모델이 단계별로 구현할 수 있도록 작성되었습니다.  
> 각 Phase는 독립적으로 완료 가능하며, 코드 예시와 체크포인트를 포함합니다.

## 🎯 목표

1. **몬스터 중심 UI** - 특정 몬스터와의 전투 상황을 직관적으로 표시
2. **정보 가시성 향상** - 상세스탯, 방어, 버프를 숨기지 않고 한눈에 표시
3. **전투 요약 강조** - "이 몬스터와 싸우면 어떻게 되는가"를 명확하게 전달

## 📋 작업 순서 요약 (Sonnet이 따라갈 순서)

1. **Phase 0** - 현재 코드 분석 (몬스터 선택 로직 파악)
2. **Phase 1** - MonsterContext 생성 (상태 관리 중앙화)
3. **Phase 2** - MonsterVsCharacterHeader 컴포넌트 생성
4. **Phase 3** - BuffTable 확장 (특수/패시브 스킬 통합)
5. **Phase 4** - EquipTable, StatTable 버튼 제거
6. **Phase 5** - DamageReceivedTable 단순화
7. **Phase 6** - App.tsx 레이아웃 변경
8. **Phase 7** - 테스트 및 버그 수정

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

## 🔧 구현 단계 (Sonnet 실행 가이드)

### Phase 0: 현재 코드 분석 ⚠️ 필수

**목표:** 몬스터 선택 로직이 어디에 있는지 파악

**확인할 파일:**
- `src/components/DamageReceivedTable.tsx` (라인 250-350 근처)

**찾아야 할 것들:**
1. 몬스터 선택 상태:
   ```typescript
   const [selectedMob, setSelectedMob] = useState<MobListEntry | null>(null);
   const [mobIcon, setMobIcon] = useState<string | null>(null);
   const [monsterATT, setMonsterATT] = useState(630);
   const [monsterMATT, setMonsterMATT] = useState(480);
   const [monsterACC, setMonsterACC] = useState(250);
   const [monsterLevel, setMonsterLevel] = useState(125);
   const [powerUpEnabled, setPowerUpEnabled] = useState(false);
   const [magicUpEnabled, setMagicUpEnabled] = useState(false);
   ```

2. 몬스터 모달 관련:
   ```typescript
   const [mobModalOpen, setMobModalOpen] = useState(false);
   const [selectedSubRegion, setSelectedSubRegion] = useState<string | null>(null);
   const [mobSearchText, setMobSearchText] = useState("");
   ```

3. 몬스터 선택 핸들러:
   ```typescript
   const handleMobSelect = useCallback(async (mob: MobListEntry | null) => { ... });
   ```

**✅ 체크포인트:**
- [ ] DamageReceivedTable에서 위 상태들을 확인했는가?
- [ ] handleMobSelect 함수의 역할을 이해했는가?
- [ ] 몬스터 모달 UI가 어디서 렌더링되는지 찾았는가?

---

### Phase 1: MonsterContext 생성 (상태 중앙화)

**목표:** 몬스터 선택 상태를 전역으로 관리

**새 파일: `src/contexts/MonsterContext.tsx`**

```typescript
import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { MobListEntry } from "../data/mobs/mobList.json";
import { fetchMobDetails, fetchMobIcon } from "../api/maplestory";
import { saveSelectedMobId, getSelectedMobId } from "../utils/characterStorage";

interface MonsterContextType {
  // 몬스터 정보
  selectedMob: MobListEntry | null;
  mobIcon: string | null;
  monsterATT: number;
  monsterMATT: number;
  monsterACC: number;
  monsterLevel: number;
  
  // 파워업/매직업
  powerUpEnabled: boolean;
  magicUpEnabled: boolean;
  
  // 모달 상태
  mobModalOpen: boolean;
  selectedSubRegion: string | null;
  mobSearchText: string;
  
  // 액션
  setSelectedMob: (mob: MobListEntry | null) => void;
  handleMobSelect: (mob: MobListEntry | null, jobEngName?: string) => Promise<void>;
  setPowerUpEnabled: (enabled: boolean) => void;
  setMagicUpEnabled: (enabled: boolean) => void;
  setMobModalOpen: (open: boolean) => void;
  setSelectedSubRegion: (region: string | null) => void;
  setMobSearchText: (text: string) => void;
}

const MonsterContext = createContext<MonsterContextType | undefined>(undefined);

export function MonsterProvider({ children }: { children: ReactNode }) {
  // DamageReceivedTable에서 복사한 상태들
  const [selectedMob, setSelectedMob] = useState<MobListEntry | null>(null);
  const [mobIcon, setMobIcon] = useState<string | null>(null);
  const [monsterATT, setMonsterATT] = useState(630);
  const [monsterMATT, setMonsterMATT] = useState(480);
  const [monsterACC, setMonsterACC] = useState(250);
  const [monsterLevel, setMonsterLevel] = useState(125);
  const [powerUpEnabled, setPowerUpEnabled] = useState(false);
  const [magicUpEnabled, setMagicUpEnabled] = useState(false);
  const [mobModalOpen, setMobModalOpen] = useState(false);
  const [selectedSubRegion, setSelectedSubRegion] = useState<string | null>(null);
  const [mobSearchText, setMobSearchText] = useState("");

  // DamageReceivedTable의 handleMobSelect 로직 복사
  const handleMobSelect = useCallback(async (mob: MobListEntry | null, jobEngName?: string) => {
    setSelectedMob(mob);
    setMobIcon(null);
    if (!mob) return;

    if (jobEngName) saveSelectedMobId(jobEngName, mob.id);

    // WZ 데이터 로드 및 API fallback 로직
    // (DamageReceivedTable의 handleMobSelect 내용 그대로 복사)
    // ...
  }, []);

  return (
    <MonsterContext.Provider value={{
      selectedMob, mobIcon, monsterATT, monsterMATT, monsterACC, monsterLevel,
      powerUpEnabled, magicUpEnabled,
      mobModalOpen, selectedSubRegion, mobSearchText,
      setSelectedMob, handleMobSelect,
      setPowerUpEnabled, setMagicUpEnabled,
      setMobModalOpen, setSelectedSubRegion, setMobSearchText,
    }}>
      {children}
    </MonsterContext.Provider>
  );
}

export function useMonster() {
  const context = useContext(MonsterContext);
  if (!context) throw new Error("useMonster must be used within MonsterProvider");
  return context;
}
```

**App.tsx 수정:**
```typescript
import { MonsterProvider } from "./contexts/MonsterContext";

function App() {
  return (
    <CharacterProvider>
      <MonsterProvider>  {/* 추가 */}
        <AppContent />
      </MonsterProvider>
    </CharacterProvider>
  );
}
```

**✅ 체크포인트:**
- [ ] MonsterContext.tsx 파일 생성됨
- [ ] App.tsx에 MonsterProvider 추가됨
- [ ] handleMobSelect 로직이 제대로 복사되었는가?
- [ ] TypeScript 에러 없음

---

### Phase 2: MonsterVsCharacterHeader 컴포넌트 생성

**목표:** 상단 헤더 UI 구현

**새 파일: `src/components/MonsterVsCharacterHeader.tsx`**

```typescript
import { Box, Typography, Button, Dialog, DialogContent, TextField, IconButton, Tooltip } from "@mui/material";
import { Close as CloseIcon, Search as SearchIcon } from "@mui/icons-material";
import { useCharacter } from "../contexts/CharacterContext";
import { useMonster } from "../contexts/MonsterContext";
import mobListData from "../data/mobs/mobList.json";
// ... 기타 import

export default function MonsterVsCharacterHeader() {
  const { character } = useCharacter();
  const {
    selectedMob, mobIcon, powerUpEnabled, magicUpEnabled,
    mobModalOpen, selectedSubRegion, mobSearchText,
    setPowerUpEnabled, setMagicUpEnabled,
    setMobModalOpen, setSelectedSubRegion, setMobSearchText,
    handleMobSelect,
  } = useMonster();

  const job = character.getJob();
  const stats = character.getStats();
  const finalStats = character.getFinalStats();

  return (
    <Box sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: 4,
      p: 2,
      bgcolor: "#f9f9f9",
      borderRadius: 1,
      border: "1px solid #ddd",
    }}>
      {/* 좌측: 캐릭터 요약 */}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.5 }}>
        <Typography variant="h6">{job?.koreanName ?? "직업 없음"}</Typography>
        <Typography variant="body2" color="text.secondary">
          Lv.{stats.level}
        </Typography>
        <Typography variant="caption">
          STR {finalStats.totalStr} / 물공 {/* 무기 물공 계산 */}
        </Typography>
      </Box>

      {/* 중앙: VS */}
      <Typography variant="h4" sx={{ fontWeight: "bold", color: "#666" }}>
        VS
      </Typography>

      {/* 우측: 몬스터 선택 */}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 0.5 }}>
        <Box
          onClick={() => setMobModalOpen(true)}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            cursor: "pointer",
            p: 1,
            "&:hover": { bgcolor: "#eee" },
            borderRadius: 1,
          }}
        >
          {mobIcon ? (
            <img src={mobIcon} alt={selectedMob?.koreanName ?? ""} style={{ width: 96, height: 96 }} />
          ) : (
            <Box sx={{ width: 96, height: 96, bgcolor: "#ddd", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <SearchIcon />
            </Box>
          )}
          <Typography variant="caption">
            {selectedMob ? `Lv.${selectedMob.level} ${selectedMob.koreanName}` : "몬스터 선택"}
          </Typography>
        </Box>
        
        {/* 파워업/매직업 버튼 */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            size="small"
            variant={powerUpEnabled ? "contained" : "outlined"}
            onClick={() => setPowerUpEnabled(!powerUpEnabled)}
          >
            파워업
          </Button>
          <Button
            size="small"
            variant={magicUpEnabled ? "contained" : "outlined"}
            onClick={() => setMagicUpEnabled(!magicUpEnabled)}
          >
            매직업
          </Button>
        </Box>
      </Box>

      {/* 몬스터 선택 모달 (DamageReceivedTable에서 복사) */}
      <Dialog open={mobModalOpen} onClose={() => setMobModalOpen(false)} maxWidth="md" fullWidth>
        {/* DamageReceivedTable의 모달 UI 그대로 복사 */}
      </Dialog>
    </Box>
  );
}
```

**⚠️ 주의:**
- DamageReceivedTable의 몬스터 모달 UI를 **완전히 복사**해서 사용
- 지역 필터, 검색, 몬스터 그리드 모두 포함

**✅ 체크포인트:**
- [ ] MonsterVsCharacterHeader.tsx 생성됨
- [ ] 캐릭터 요약 정보 표시됨
- [ ] 몬스터 선택 UI 동작함
- [ ] 파워업/매직업 토글 동작함
- [ ] TypeScript 에러 없음

---

### Phase 3: BuffTable 확장 (특수/패시브 스킬 통합)

**목표:** BuffTable을 3개 섹션으로 확장

**현재 위치 확인:**
- DetailStatTable (이미 stash에서 제거됨): DefenseBuffSection, SpecialSkillSection, PassiveSkillList
- 이 컴포넌트들을 BuffTable로 이동

**수정 파일: `src/components/BuffTable.tsx`**

**기존 구조:**
```typescript
// 액티브 버프만 표시
export default function BuffTable() {
  return (
    <Box>
      <Typography>버프</Typography>
      {/* 버프 목록 */}
    </Box>
  );
}
```

**확장 후:**
```typescript
import DefenseBuffSection from "./DefenseBuffSection";
import SpecialSkillSection from "./SpecialSkillSection";
import PassiveSkillList from "./PassiveSkillList";
import MasteryRow from "./MasteryRow";
import { useState } from "react";
// ... 다이얼로그 import

export default function BuffTable() {
  // DetailStatTable에서 가져온 상태들
  const [mastery1Dialog, setMastery1Dialog] = useState(false);
  const [mastery2Dialog, setMastery2Dialog] = useState(false);
  const [tempMastery1Level, setTempMastery1Level] = useState(0);
  const [tempMastery2Level, setTempMastery2Level] = useState(0);
  // ... 기타 다이얼로그 상태

  return (
    <Box sx={{ width: 400, border: "1px solid #ccc", borderRadius: 1, bgcolor: "#f5f5f5" }}>
      {/* 타이틀 */}
      <Box sx={{ p: 1.5, borderBottom: "1px solid #ccc" }}>
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          버프 & 스킬
        </Typography>
      </Box>

      <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 1.5 }}>
        {/* 1. 액티브 버프 (기존) */}
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>액티브 버프</Typography>
        {/* 기존 버프 UI */}

        <Divider />

        {/* 2. 방어 버프 */}
        <DefenseBuffSection />

        <Divider />

        {/* 3. 특수 스킬 */}
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>특수 스킬</Typography>
        <SpecialSkillSection
          jobEngName={job?.engName}
          specialSkillLevels={specialSkillLevels}
          weaponType={character.getWeaponType() ?? undefined}
          magicianSubClass={magicianSubClass}
          onSkillClick={(skill, level) => { /* ... */ }}
        />

        <Divider />

        {/* 4. 패시브 스킬 */}
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>패시브 스킬</Typography>
        <MasteryRow /* ... */ />
        <PassiveSkillList /* ... */ />
      </Box>

      {/* 다이얼로그들 (DetailStatTable에서 복사) */}
      <MasteryDialog /* ... */ />
      <PassiveDialog /* ... */ />
      <SpecialSkillDialog /* ... */ />
    </Box>
  );
}
```

**✅ 체크포인트:**
- [ ] DefenseBuffSection이 BuffTable에 추가됨
- [ ] SpecialSkillSection이 BuffTable에 추가됨
- [ ] PassiveSkillList + MasteryRow가 BuffTable에 추가됨
- [ ] 다이얼로그 상태 관리가 제대로 동작함
- [ ] TypeScript 에러 없음

---

### Phase 4: EquipTable, StatTable 버튼 제거

**목표:** 전환 버튼 제거 (항상 모든 정보 표시)

**수정 파일 1: `src/components/EquipTable.tsx`**

```typescript
// 제거할 props
interface EquipTableProps {
  onSlotClick: (slotName: string) => void;
  onOpenItemMaker: () => void;
  // ❌ 제거: onOpenInventory?: () => void;
  // ❌ 제거: onExpandedChange?: (expanded: boolean) => void;
}

// 제거할 버튼
// ❌ 제거: "인벤토리 열기" 버튼
// ❌ 제거: "확장/축소" 버튼
```

**수정 파일 2: `src/components/StatTable.tsx`**

```typescript
// 제거할 props
interface StatTableProps {
  // ❌ 제거: onOpenDetailStat?: () => void;
}

// 제거할 버튼
// ❌ 제거: "상세 스탯" 버튼
```

**✅ 체크포인트:**
- [ ] EquipTable에서 onOpenInventory, onExpandedChange 제거됨
- [ ] StatTable에서 onOpenDetailStat 제거됨
- [ ] 관련 버튼들이 UI에서 사라짐
- [ ] TypeScript 에러 없음

---

### Phase 5: DamageReceivedTable 단순화

**목표:** 몬스터 선택 UI 제거, useMonster 사용

**수정 파일: `src/components/DamageReceivedTable.tsx`**

**Before:**
```typescript
export default function DamageReceivedTable() {
  const [selectedMob, setSelectedMob] = useState<MobListEntry | null>(null);
  const [monsterATT, setMonsterATT] = useState(630);
  // ... 기타 몬스터 관련 상태

  return (
    <Box>
      {/* 몬스터 선택 UI */}
      <Box onClick={() => setMobModalOpen(true)}>
        {/* ... */}
      </Box>
      
      {/* 피격/회피 계산 */}
      {/* ... */}
    </Box>
  );
}
```

**After:**
```typescript
import { useMonster } from "../contexts/MonsterContext";

export default function DamageReceivedTable() {
  // ✅ Context에서 가져오기
  const {
    selectedMob,
    monsterATT,
    monsterMATT,
    monsterACC,
    monsterLevel,
    powerUpEnabled,
    magicUpEnabled,
  } = useMonster();

  // ❌ 제거: 모든 몬스터 관련 상태
  // ❌ 제거: handleMobSelect
  // ❌ 제거: 모달 관련 상태
  // ❌ 제거: 몬스터 선택 UI

  return (
    <Box sx={{ width: 400, border: "1px solid #ccc", borderRadius: 1, bgcolor: "#f5f5f5" }}>
      {/* 타이틀 변경 */}
      <Box sx={{ p: 1.5, borderBottom: "1px solid #ccc" }}>
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          피격/회피 계산
        </Typography>
      </Box>

      {/* ❌ 제거: 파워업/매직업 버튼 (헤더로 이동됨) */}
      {/* ❌ 제거: 몬스터 아이콘 클릭 UI (헤더로 이동됨) */}
      {/* ❌ 제거: Dialog (헤더로 이동됨) */}

      {/* ✅ 유지: 피격 데미지 섹션 */}
      <DamageResultSection /* ... */ />
      
      {/* ✅ 유지: 회피확률 섹션 */}
      <Box sx={{ p: 2 }}>
        {/* ... */}
      </Box>
    </Box>
  );
}
```

**⚠️ 주의:**
- 약 200줄의 몬스터 선택 UI 코드가 삭제됨
- useMonster()로 필요한 값만 가져오기
- 계산 로직은 그대로 유지

**✅ 체크포인트:**
- [ ] useMonster 사용하여 몬스터 정보 가져옴
- [ ] 몬스터 선택 UI 완전히 제거됨
- [ ] 파워업/매직업 버튼 제거됨
- [ ] Dialog 제거됨
- [ ] 피격/회피 계산은 정상 동작함
- [ ] TypeScript 에러 없음

---

### Phase 6: App.tsx 레이아웃 변경

**목표:** 5열 → 3열 레이아웃, 헤더 추가

**수정 파일: `src/App.tsx`**

**Before (현재 stash 버전):**
```typescript
<Box sx={{ display: "flex", gap: 2, justifyContent: "center", mb: 3 }}>
  {/* 1열: 장비 + 인벤토리 */}
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <EquipTable onSlotClick={...} onOpenItemMaker={...} />
    <Inventory />
  </Box>

  {/* 2열: 스탯 + 상세스탯 */}
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <StatTable />
    <DetailStatTable />
  </Box>

  {/* 3열: 버프 */}
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <BuffTable />
  </Box>

  {/* 4열: 피격/회피 */}
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <DamageReceivedTable />
  </Box>

  {/* 5열: 데미지 */}
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <DamageTable />
  </Box>
</Box>
```

**After:**
```typescript
import MonsterVsCharacterHeader from "./components/MonsterVsCharacterHeader";

// ❌ 제거: middlePanel, equipExpanded state

<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
  {/* 상단: 캐릭터 vs 몬스터 헤더 */}
  <Box sx={{ display: "flex", justifyContent: "center" }}>
    <MonsterVsCharacterHeader />
  </Box>

  {/* 하단: 3열 레이아웃 */}
  <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
    {/* 좌측: 내 캐릭터 */}
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <EquipTable
        onSlotClick={handleOpenItemMakerForSlot}
        onOpenItemMaker={handleOpenItemMakerForInventory}
      />
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

**✅ 체크포인트:**
- [ ] MonsterVsCharacterHeader import됨
- [ ] 헤더가 상단에 표시됨
- [ ] 5열 → 3열로 변경됨
- [ ] middlePanel, equipExpanded 제거됨
- [ ] 모든 컴포넌트가 정상 렌더링됨
- [ ] TypeScript 에러 없음

---

### Phase 7: 테스트 및 버그 수정

**체크리스트:**
1. **몬스터 선택 테스트**
   - [ ] 헤더에서 몬스터 클릭 시 모달 열림
   - [ ] 몬스터 선택 시 DamageReceivedTable 업데이트됨
   - [ ] 파워업/매직업 토글 동작함

2. **직업 변경 테스트**
   - [ ] 전사/마법사/궁수/도적 모두 정상 동작
   - [ ] 마법사 서브직업 선택 정상 동작

3. **장비 변경 테스트**
   - [ ] 장비 변경 시 스탯 실시간 반영
   - [ ] 피격/데미지 계산 실시간 업데이트

4. **버프/스킬 테스트**
   - [ ] BuffTable의 모든 섹션 정상 표시
   - [ ] 특수 스킬 설정 시 피격 계산 반영
   - [ ] 패시브 스킬 설정 시 스탯 반영

5. **UI 테스트**
   - [ ] 3열 레이아웃이 화면에 잘 맞음
   - [ ] 스크롤 필요 시 정상 동작
   - [ ] 모든 텍스트 가독성 확인

**발견된 버그는 즉시 수정:**
- TypeScript 에러
- 런타임 에러
- 계산 오류
- UI 깨짐

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

---

## 📝 전체 작업 요약

### 신규 파일 (2개)
1. **`src/contexts/MonsterContext.tsx`**
   - 몬스터 선택 상태 중앙 관리
   - handleMobSelect 로직
   - 파워업/매직업 상태

2. **`src/components/MonsterVsCharacterHeader.tsx`**
   - 캐릭터 vs 몬스터 헤더 UI
   - 몬스터 선택 모달
   - 파워업/매직업 토글

### 수정 파일 (6개)
1. **`src/App.tsx`**
   - MonsterProvider 추가
   - 5열 → 3열 레이아웃
   - MonsterVsCharacterHeader 추가
   - middlePanel, equipExpanded state 제거

2. **`src/components/BuffTable.tsx`**
   - DefenseBuffSection 통합
   - SpecialSkillSection 통합
   - PassiveSkillList + MasteryRow 통합
   - 다이얼로그 통합

3. **`src/components/DamageReceivedTable.tsx`**
   - useMonster() 사용
   - 몬스터 선택 UI 제거 (~200줄)
   - 계산 로직만 유지

4. **`src/components/EquipTable.tsx`**
   - onOpenInventory prop 제거
   - onExpandedChange prop 제거

5. **`src/components/StatTable.tsx`**
   - onOpenDetailStat prop 제거

6. **`src/components/DetailStatTable.tsx`**
   - (이미 stash에서 완료됨)

### 삭제될 코드
- DamageReceivedTable: 몬스터 선택 UI (~200줄)
- App.tsx: 전환 버튼 로직 (~50줄)
- EquipTable/StatTable: 버튼들 (~30줄)

### 추가될 코드
- MonsterContext: ~150줄
- MonsterVsCharacterHeader: ~250줄
- BuffTable 확장: ~100줄

**순 변화: 약 +70줄 (기능은 그대로, 구조만 개선)**

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

---

## 💡 Sonnet을 위한 팁

### 막힐 때 참고할 것들

1. **DamageReceivedTable 분석 필수**
   - Phase 1 시작 전 반드시 파일을 읽고 이해
   - handleMobSelect 로직을 완전히 복사 (수정 금지)
   - 몬스터 모달 UI도 완전히 복사 (레이아웃만 조정)

2. **Context 생성 순서**
   ```
   1. 인터페이스 정의
   2. Context 생성
   3. Provider 컴포넌트
   4. useMonster hook
   5. App.tsx에 Provider 추가
   ```

3. **컴포넌트 통합 시 주의**
   - import 경로 확인
   - props 타입 일치 확인
   - 상태 관리 로직 이중화 방지

4. **각 Phase 완료 후**
   - `npm run dev` 실행
   - 브라우저에서 동작 확인
   - TypeScript 에러 해결
   - 다음 Phase로 진행

5. **에러 발생 시**
   - 에러 메시지 전체 읽기
   - import 누락 확인
   - 타입 불일치 확인
   - Context Provider 누락 확인

### 흔한 실수 방지

❌ **하지 말 것:**
- handleMobSelect 로직을 "개선"하려고 수정
- 몬스터 모달 UI를 처음부터 다시 작성
- Phase 순서 건너뛰기
- Context 없이 props drilling 시도

✅ **해야 할 것:**
- 기존 코드를 복사한 후 필요한 부분만 제거
- 각 Phase의 체크포인트 확인
- TypeScript 에러를 즉시 해결
- 작은 단위로 커밋

---

## 🚀 최종 체크리스트

### Phase별 완료 확인
- [ ] Phase 0: DamageReceivedTable 분석 완료
- [ ] Phase 1: MonsterContext 생성 및 테스트
- [ ] Phase 2: MonsterVsCharacterHeader 동작 확인
- [ ] Phase 3: BuffTable 확장 완료
- [ ] Phase 4: EquipTable, StatTable 버튼 제거
- [ ] Phase 5: DamageReceivedTable 단순화
- [ ] Phase 6: App.tsx 레이아웃 변경
- [ ] Phase 7: 전체 테스트 통과

### 기능 테스트
- [ ] 몬스터 선택 시 피격/데미지 계산 업데이트
- [ ] 파워업/매직업 토글 동작
- [ ] 모든 직업에서 정상 동작 (전사/마법사/궁수/도적)
- [ ] 장비 변경 시 실시간 반영
- [ ] 버프/스킬 변경 시 계산 반영
- [ ] 마법사 서브직업 선택 동작

### 코드 품질
- [ ] TypeScript 에러 없음
- [ ] ESLint 경고 최소화
- [ ] Console 에러 없음
- [ ] 불필요한 주석 제거
- [ ] import 정리

### UI/UX
- [ ] 3열 레이아웃이 화면에 잘 맞음
- [ ] 모든 텍스트 가독성 확인
- [ ] 버튼 클릭 반응 확인
- [ ] 모달 동작 확인

---

## 📅 작업 소요 시간 (Sonnet 기준)

- **Phase 0**: 15분 (코드 분석)
- **Phase 1**: 45분 (Context 생성)
- **Phase 2**: 60분 (Header 컴포넌트)
- **Phase 3**: 45분 (BuffTable 확장)
- **Phase 4**: 20분 (버튼 제거)
- **Phase 5**: 30분 (DamageReceivedTable 단순화)
- **Phase 6**: 20분 (App.tsx 수정)
- **Phase 7**: 45분 (테스트 및 버그 수정)

**총 예상 시간: 약 4시간**

---

## 🎯 성공 기준

다음 조건을 모두 만족하면 성공:

1. ✅ 모든 Phase의 체크포인트 통과
2. ✅ TypeScript/ESLint 에러 없음
3. ✅ `npm run dev` 정상 실행
4. ✅ 몬스터 선택 → 피격 계산 업데이트 확인
5. ✅ 모든 기존 기능 정상 동작
6. ✅ UI가 플랜의 ASCII 다이어그램과 일치

**완료 후:** `feat/ui-monster-oriented` 브랜치에 커밋하고 테스트 대기

---

_작성일: 2026-02-23_
_브랜치: feat/ui-monster-oriented_
