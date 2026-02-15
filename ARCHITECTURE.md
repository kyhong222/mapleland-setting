# 메이플랜드 세팅 시뮬레이터 아키텍처

## 1. 프로젝트 개요

메이플랜드(메이플스토리 클래식 서버) 캐릭터의 장비·스탯·버프·패시브를 시뮬레이션하여 최종 데미지를 계산하는 클라이언트 전용 SPA.

## 2. 기술 스택

| 구분 | 기술 |
|------|------|
| **프레임워크** | React 19 + TypeScript 5.9 |
| **빌드 도구** | Vite 7 (`@vitejs/plugin-react`) |
| **UI 라이브러리** | MUI (Material UI) 7 + Emotion |
| **상태 관리** | React Context API (`CharacterContext`) |
| **영속성** | 브라우저 `localStorage` (서버/DB 없음) |
| **외부 API** | maplestory.io REST API (아이템 데이터·아이콘 조회) |
| **배포** | GitHub Actions → 루트 레포(`mapleland-st-root-page`)에 dispatch 트리거 |
| **린트** | ESLint 9 + typescript-eslint |
| **스크립트 실행** | tsx (TypeScript 스크립트 직접 실행) |

- 백엔드, DB, 인증/인가 시스템 없음 — 순수 클라이언트 사이드 애플리케이션
- 번들 최적화: `manualChunks`로 `vendor-react`, `vendor-mui` 분리

## 3. 디렉토리 구조

```
mapleland-setting/
├── .github/workflows/
│   └── trigger-deploy.yml     # master push 시 루트 레포 배포 트리거
├── scripts/
│   └── fetchPostItems.mjs     # PreItem → PostItem 변환 (API 조회 → JSON 생성)
├── tools/
│   ├── api-checker.html       # API 동작 확인용 독립 HTML 도구
│   └── item-manager.html      # 아이템 데이터 관리용 독립 HTML 도구
├── src/
│   ├── api/
│   │   └── maplestory.ts      # maplestory.io API 호출 함수 (아이템·아이콘·이름 조회)
│   ├── components/
│   │   ├── TopAppBar.tsx       # 상단 네비게이션 (직업 선택, 슬롯 관리)
│   │   ├── StatTable.tsx       # 캐릭터 스탯 입력/표시
│   │   ├── EquipTable.tsx      # 장비 장착 슬롯 (5×3 그리드)
│   │   ├── EquipDetailTable.tsx# 장비 상세 스탯 표시
│   │   ├── BuffTable.tsx       # 버프 패널 (서브 컴포넌트 조합)
│   │   ├── MapleWarriorRow.tsx # 메이플 용사 행 (BuffTable에서 분리)
│   │   ├── MasteryRow.tsx      # 마스터리1+2 그리드 셀 (BuffTable에서 분리)
│   │   ├── PassiveSkillList.tsx# 패시브 스킬 목록 (BuffTable에서 분리)
│   │   ├── BuffSelectDialog.tsx# 버프 선택 다이얼로그
│   │   ├── MasteryDialog.tsx   # 마스터리 레벨 조정 다이얼로그
│   │   ├── PassiveDialog.tsx   # 패시브 스킬 레벨 조정 다이얼로그
│   │   ├── DefenseBuffSection.tsx  # 방어 버프 선택 (물방/마방/명중/회피, 아이템 버프 포함)
│   │   ├── SpecialSkillSection.tsx # 특수 스킬 아이콘 그리드 (파워가드, 아킬레스 등)
│   │   ├── SpecialSkillDialog.tsx  # 특수 스킬 레벨 조정 다이얼로그
│   │   ├── DamageTable.tsx     # 공격 데미지 계산 결과 (읽기 전용)
│   │   ├── DamageReceivedTable.tsx # 피격 데미지 계산 (몬스터 선택, 물리/마법/회피율)
│   │   ├── DetailStatTable.tsx # 상세 스탯 (명중/회피/방어/이속 등)
│   │   ├── Inventory.tsx       # 인벤토리 (장비 보관함, 4×6 그리드)
│   │   ├── ItemMakerModal.tsx  # 아이템 검색/생성/편집 다이얼로그
│   │   ├── StatEditForm.tsx    # 아이템 스탯 편집 폼 (ItemMakerModal에서 분리)
│   │   └── ItemTooltip.tsx     # 아이템 툴팁 (마우스 오버 시 스탯 표시)
│   ├── contexts/
│   │   └── CharacterContext.tsx # 전역 상태 관리 (캐릭터·장비·버프·인벤토리·저장/로드)
│   ├── data/
│   │   ├── items/              # PreItem 데이터 (아이템 ID·이름·필요레벨 목록)
│   │   │   ├── weapons/        #   무기 (bow, crossbow, dagger, spear 등 14종)
│   │   │   ├── projectiles/    #   투사체 (화살, 석궁화살, 표창)
│   │   │   └── *.json          #   방어구/악세사리 (hat, top, glove, shoes 등)
│   │   ├── postItems/          # PostItem 데이터 (API 조회 결과: 상세 스탯·아이콘)
│   │   │   ├── weapons/        #   무기 상세
│   │   │   ├── projectiles/    #   투사체 상세
│   │   │   └── *.json          #   방어구/악세사리 상세
│   │   ├── buff/               # 버프 스킬 데이터
│   │   │   ├── MapleWarrior/   #   메이플 용사 (레벨별 스탯% 증가)
│   │   │   ├── HerosEcho/      #   영웅의 메아리 (공격력/마력 4% 증가)
│   │   │   ├── buff/           #   직업별 공격력/마력 버프 (buff1, buff2)
│   │   │   ├── mastery/        #   마스터리 스킬 (mastery1: 기본, mastery2: 추가)
│   │   │   ├── common/         #   공용 버프 (블레스, 아이언 윌, 아이템 버프)
│   │   │   ├── warrior/        #   전사 버프 + 특수 스킬 (파워가드, 아킬레스, 원소저항)
│   │   │   ├── archer/         #   궁수 버프 (포커스)
│   │   │   ├── magician/       #   마법사 버프 + 특수 스킬 (무적, 부분저항 FP/IL)
│   │   │   ├── thief/          #   도적 버프 + 특수 스킬 (메소가드, 페이크)
│   │   │   ├── custom/         #   커스텀 버프
│   │   │   └── standardPDD.json#   직업별 표준 물방 테이블 (피격 계산용)
│   │   ├── mobs/               # 몬스터 데이터
│   │   │   └── mobList.json    #   몬스터 목록 (id, name, koreanName, level, isBoss, foundAt)
│   │   └── passive/            # 패시브 스킬 데이터
│   │       ├── warrior/        #   쉴드 마스터리 (방패 물방% 증가)
│   │       ├── archer/         #   쓰러스트 (이속), 아마존의 축복 (명중)
│   │       └── thief/          #   님블 바디 (명중+회피), 쉴드 마스터리
│   ├── hooks/
│   │   ├── useBuffCallbacks.ts  # 버프·마스터리·패시브 관련 useCallback 묶음
│   │   ├── useStorageCallbacks.ts # 저장/로드/슬롯 관련 useCallback 묶음
│   │   └── useInventoryCallbacks.ts # 인벤토리 관련 useCallback 묶음
│   ├── domain/
│   │   └── Character.ts        # Character 도메인 클래스 (상태·장비·버프·데미지 계산)
│   ├── types/
│   │   ├── character.ts        # Buff, StatsSummary, FinalStats 인터페이스
│   │   ├── equipment.ts        # Equipment, EquipmentSlot, SavedEquipment, 슬롯 레이아웃
│   │   ├── item.ts             # Item, ItemType, ItemStats, PreItem, PostItemData
│   │   ├── job.ts              # Job 인터페이스, JOBS 상수, JOB_COLORS
│   │   ├── mastery.ts          # MasteryProperty, MasterySkill
│   │   ├── specialSkill.ts     # SpecialSkillData 인터페이스, specialSkillsByJob 매핑
│   │   └── stats.ts            # Stats 인터페이스 (순수·장비·버프 스탯)
│   ├── utils/
│   │   ├── characterStorage.ts # localStorage 기반 캐릭터 저장/로드/슬롯 관리
│   │   ├── inventoryStorage.ts # localStorage 기반 인벤토리 저장/로드
│   │   ├── equipmentConverter.ts # Equipment ↔ SavedEquipment 변환
│   │   ├── postItemLoader.ts   # PostItem JSON 동적 로드 (import.meta.glob)
│   │   └── attackSpeedToKorean.ts # 공격속도 숫자 → 한글 변환
│   ├── scripts/
│   │   ├── generateItemData.ts # 아이템 데이터 생성 스크립트
│   │   └── updateReqLevels.ts  # 아이템 필요레벨 업데이트 스크립트
│   ├── App.tsx                 # 루트 컴포넌트 (레이아웃, 직업 선택, 패널 전환)
│   ├── main.tsx                # 엔트리포인트 (React DOM 렌더링)
│   ├── App.css                 # 앱 전역 스타일
│   └── index.css               # 기본 스타일
├── index.html                  # HTML 진입점
├── vite.config.ts              # Vite 설정 (base: "/item/", manualChunks)
├── tsconfig.json               # TypeScript 설정
└── package.json                # 의존성 및 스크립트
```

## 4. 데이터 흐름

백엔드/DB가 없는 순수 클라이언트 앱이므로, 데이터 흐름은 다음과 같다:

### 4.1 아이템 데이터 흐름 (빌드 타임 + 런타임)

```
[빌드 타임]
maplestory.io API ──(scripts/fetchPostItems.mjs)──→ src/data/postItems/*.json

[런타임 - 아이템 검색/장착]
사용자 아이템 선택
  → ItemMakerModal.tsx (아이템 검색/생성/편집 UI)
  → maplestory.ts (API 호출: 아이템 목록·상세·아이콘)
  → postItemLoader.ts (로컬 PostItem JSON에서 스탯·아이콘 보충)
  → CharacterContext.equipItem()
  → Character.equip() (도메인 객체 상태 변경)
  → React 리렌더링 → UI 업데이트
```

### 4.2 사용자 조작 → 상태 변경 흐름

```
사용자 입력 (UI 컴포넌트)
  → CharacterContext의 setter 함수 호출
    (직접 정의 또는 커스텀 훅에서 제공)
  → Character 도메인 객체 상태 변경
  → version++ (강제 리렌더링 트리거)
  → 각 컴포넌트가 context에서 최신 상태 읽어 렌더링
  → useEffect(auto-save)가 localStorage에 자동 저장
```

### 4.3 저장/로드 흐름

```
[저장 - 자동]
version 변경 → useEffect → saveCurrentCharacter()
  → characterStorage.saveSlotData() → localStorage.setItem()

[로드 - 앱 시작 시]
main.tsx → App.tsx → useEffect
  → migrateFromLegacyStorage() (레거시 마이그레이션)
  → getLastActive() → getSlotData() → loadCharacter()
  → Character 상태 복원 → UI 렌더링
```

## 5. 상태 관리 전략

### 5.1 전역 상태: `CharacterContext` (React Context API)

모든 캐릭터 관련 상태를 단일 Context에서 관리한다. `CharacterProvider`는 3개의 직접 `useState`와 3개의 커스텀 훅으로 구성된다.

**직접 useState (CharacterContext.tsx)**

| 상태 | 타입 | 설명 |
|------|------|------|
| `character` | `Character` | 도메인 객체 (스탯, 장비, 버프) |
| `version` | `number` | 강제 리렌더링 카운터 |
| `currentSlotIdx` | `number` | 현재 저장 슬롯 인덱스 (0~4) |

**커스텀 훅으로 분리된 상태·콜백**

| 훅 | 파일 | 관리하는 상태/콜백 |
|----|------|-------------------|
| `useBuffCallbacks` | `src/hooks/useBuffCallbacks.ts` | buff1Attack, buff2Attack, mastery1/2, masteryAttack, passiveLevels, buffMAD, heroEchoEnabled, buff1/2 Label·Icon·IsManual 및 각각의 setter |
| `useStorageCallbacks` | `src/hooks/useStorageCallbacks.ts` | saveCurrentCharacter, loadCharacter, loadSlot, deleteSlot, getSlotSummaries, setCurrentSlotIdx |
| `useInventoryCallbacks` | `src/hooks/useInventoryCallbacks.ts` | inventory, addToInventory, removeFromInventory, setInventory |

각 훅은 `(character, refresh, ...)` 인자를 받아 `useMemo`로 감싼 객체를 반환하며, Context value에 스프레드(`...buffCallbacks`)로 병합된다.

### 5.2 도메인 상태: `Character` 클래스

`Character`는 Mutable 클래스 객체로, Context 내부에서 `useState`로 한 번 생성된 뒤 직접 mutate된다. 상태 변경 후 `version++`로 리렌더링을 트리거하는 패턴을 사용한다.

```
Character
├── stats: Stats              (레벨, 순수스탯, 장비스탯, 버프스탯)
├── job: Job | null           (직업 정보)
├── equipments: Map           (슬롯 → Equipment)
├── buffs: Map                (버프ID → Buff)
├── buffUI: BuffUIState       (버프 UI 메타데이터: label, icon, isManual)
├── buff1Attack / buff2Attack (버프 공격력 값)
├── mastery1 / mastery2       (마스터리 레벨)
├── masteryAttack             (마스터리 추가 공격력)
├── passiveLevels             (패시브 스킬 레벨 맵)
├── buffMAD                   (버프 마력 합산)
├── defenseBuffs: DefenseBuffState  (물방/마방/명중/회피 방어 버프)
└── specialSkillLevels        (특수 스킬 레벨 맵: 파워가드, 아킬레스 등)
```

`BuffUIState`는 버프 선택 UI 상태(label, icon, isManual × 2)를 하나의 구조체로 묶은 인터페이스로, `getBuffUIState()` / `updateBuffUI()` 메서드로 접근한다.

`DefenseBuffState`는 `{ pdef, mdef, acc, eva }` 각각 `{ value, label, icon, isManual }` 구조의 `DefenseBuffEntry`를 보유한다.

### 5.3 로컬 상태

각 UI 컴포넌트에서 다이얼로그 open/close, 메뉴 앵커, 임시 입력값 등은 `useState`로 관리.

### 5.4 영속 상태: `localStorage`

| 키 패턴 | 내용 |
|---------|------|
| `mapleland_slot_{job}_{0~4}` | 직업별 5개 슬롯의 캐릭터 데이터 |
| `mapleland_last_active` | 마지막 활성 직업+슬롯 |
| `mapleland_inventory_{job}` | 직업별 인벤토리 |
| `mapleland_mob_{job}` | 직업별 선택된 몬스터 ID |

서버 상태(Server State)는 존재하지 않음.

## 6. API 설계 패턴

자체 API 서버는 없으며, 외부 API만 사용한다.

### 6.1 외부 API: maplestory.io

| 용도 | 엔드포인트 | 파일 |
|------|-----------|------|
| 아이템 목록 조회 | `GET /api/gms/62/item?subCategoryFilter=...&jobFilter=...` | `maplestory.ts` |
| 아이템 상세 조회 | `GET /api/gms/62/item/{id}` | `maplestory.ts` |
| 아이템 아이콘 | `GET /api/gms/62/item/{id}/icon?resize=5` | `maplestory.ts` |
| 한글 이름 조회 | `GET /api/kms/284/item/{id}/name` | `maplestory.ts` |
| 몬스터 상세 조회 | `GET /api/gms/62/mob/{id}` | `maplestory.ts` |
| 몬스터 한글 이름 | `GET /api/kms/284/mob/{id}/name` | `maplestory.ts` |
| 몬스터 아이콘 | `GET /api/gms/62/mob/{id}/render/stand` (GMS→GMS200→KMS 순 시도) | `maplestory.ts` |

### 6.2 에러 핸들링

- 모든 API 호출은 `try/catch`로 감싸져 있음
- 실패 시 `console.error` 로깅 후 빈 배열 또는 `null` 반환 (앱 크래시 방지)
- PostItem 로컬 데이터를 1순위로 사용하고, API는 2순위 폴백

## 7. DB 스키마 개요

데이터베이스를 사용하지 않는다. 모든 데이터는 다음 두 곳에 저장된다:

### 7.1 정적 데이터 (JSON 파일, 빌드 포함)

- `src/data/items/` — PreItem: 아이템 ID, 이름, 필요레벨 목록 (가벼운 목록용)
- `src/data/postItems/` — PostItem: 상세 스탯, 아이콘 base64, 필요스탯 (스크립트로 API에서 생성)
- `src/data/buff/` — 버프/마스터리/특수스킬별 레벨 테이블 + 아이템 버프 + 표준 PDD
- `src/data/passive/` — 패시브 스킬별 레벨 테이블
- `src/data/mobs/` — 몬스터 목록 (ID, 이름, 레벨, 보스여부, 출현지역)

### 7.2 사용자 데이터 (`localStorage`)

`SavedCharacterData` 구조:

```typescript
{
  timestamp: number;
  level: number;
  pureStr / pureDex / pureInt / pureLuk: number;
  equipments: SavedEquipment[];     // 장착 장비 (id, slot, type, 스탯들)
  weaponId?: number;
  buffs?: {
    mapleWarriorLevel: number;
    buff1Attack / buff2Attack: number;
    heroEchoEnabled: boolean;
    mastery1 / mastery2: number;
    buffMAD?: number;
    buff1Label / buff1Icon / buff1IsManual: ...;
    buff2Label / buff2Icon / buff2IsManual: ...;
    passiveLevels?: Record<string, number>;
    defenseBuffs?: DefenseBuffState;           // 방어 버프 (물방/마방/명중/회피)
    specialSkillLevels?: Record<string, number>; // 특수 스킬 레벨
  };
}
```

## 8. 인증/인가 방식

인증/인가 시스템이 없다. 로그인 없이 누구나 접근 가능한 공개 도구이며, 사용자 데이터는 브라우저 localStorage에만 저장된다.

## 9. 배포 파이프라인

```
master branch push
  → GitHub Actions (trigger-deploy.yml)
  → curl로 mapleland-st-root-page 레포에 repository_dispatch 전송
  → 루트 레포에서 실제 빌드 및 배포 수행
```

- 이 레포 자체는 빌드/배포를 직접 수행하지 않음
- `DEPLOY_TOKEN` 시크릿을 사용하여 루트 레포의 dispatch API 호출
- Vite `base: "/item/"` 설정으로, 루트 사이트의 `/item/` 서브 경로에 배포됨
- `npm run deploy` 스크립트도 존재 (`gh-pages -d dist`), 로컬 수동 배포용

## 10. 외부 서비스 연동

| 서비스 | 용도 | 연동 방식 |
|--------|------|-----------|
| **maplestory.io API** | 아이템 데이터 및 아이콘 조회 | 런타임 fetch (GMS v62 / KMS v284) |
| **GitHub API** | 배포 트리거 | GitHub Actions → repository_dispatch |

결제, 이메일, 스토리지, 인증 등의 외부 서비스 연동은 없다.
