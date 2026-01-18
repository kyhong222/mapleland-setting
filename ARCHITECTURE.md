# 메이플랜드 설정 애플리케이션 아키텍처

## 1. 전체 구조

```
App
 ├─ Character (도메인 중심 객체)
 │   ├─ Stats        // 캐릭터의 기본 능력치
 │   ├─ Equips       // 장착 중인 장비
 │   ├─ Buffs        // 적용 중인 버프
 │   └─ Inventory    // 보유 아이템 목록
 │
 ├─ StatTable (UI)
 ├─ EquipTable (UI)
 ├─ BuffTable (UI)
 ├─ InventoryTable (UI)
 │
 └─ DamageTable (파생 데이터, read-only)
```

## 2. Character 도메인

### 2.1 책임

- 캐릭터의 모든 상태를 관리하는 단일 진실 공급원(Single Source of Truth)
- 상태 변경 로직을 캡슐화
- 파생 데이터 계산의 기준점

### 2.2 하위 구조

#### Stats

```typescript
interface Stats {
  level: number;
  job: string;

  // 순수 스탯
  pureStr: number;
  pureDex: number;
  pureInt: number;
  pureLuk: number;

  // 계산된 스탯 (순수 + 장비 + 버프)
  totalStr: number;
  totalDex: number;
  totalInt: number;
  totalLuk: number;

  // 공격력
  totalAttack: number;
}
```

#### Equips

```typescript
interface Equips {
  items: Map<EquipSlot, Equipment>;

  // 메서드
  equip(slot: EquipSlot, item: Equipment): boolean;
  unequip(slot: EquipSlot): void;
  getEquippedItem(slot: EquipSlot): Equipment | null;
  getTotalStats(): EquipStats;
}
```

#### Buffs

```typescript
interface Buffs {
  activeBuffs: Map<BuffId, Buff>;

  // 메서드
  activateBuff(buff: Buff): void;
  deactivateBuff(buffId: BuffId): void;
  getTotalStats(): BuffStats;
}
```

#### Inventory

```typescript
interface Inventory {
  items: Item[];
  savedItems: Item[];

  // 메서드
  addItem(item: Item): void;
  removeItem(itemId: string): void;
  saveItem(item: Item): void;
}
```

## 3. Table 컴포넌트 (UI 계층)

### 3.1 공통 원칙

- ✅ Character 상태를 시각적으로 표현
- ✅ 사용자 입력을 받아 의도(intent)를 Character로 전달
- ❌ Character 상태를 직접 변경하지 않음
- ❌ 도메인 로직을 포함하지 않음

### 3.2 StatTable

```typescript
interface StatTableProps {
  stats: Stats;
  onStatChange: (stat: StatKey, value: number) => void;
  onLevelChange: (level: number) => void;
}
```

### 3.3 EquipTable

```typescript
interface EquipTableProps {
  equips: Map<EquipSlot, Equipment>;
  onUnequip: (slot: EquipSlot) => void;
  onSlotClick: (slot: EquipSlot) => void;
}
```

### 3.4 BuffTable

```typescript
interface BuffTableProps {
  buffs: Map<BuffId, Buff>;
  onBuffToggle: (buffId: BuffId, enabled: boolean) => void;
  onBuffLevelChange: (buffId: BuffId, level: number) => void;
}
```

### 3.5 InventoryTable

```typescript
interface InventoryTableProps {
  items: Item[];
  onEquipItem: (item: Item) => void;
  onDeleteItem: (itemId: string) => void;
  onSaveItem: (item: Item) => void;
}
```

## 4. DamageTable (파생 데이터)

### 4.1 특성

- 읽기 전용(Read-only) 컴포넌트
- Character의 상태로부터 계산되는 순수 파생 데이터
- 자체 상태를 가지지 않음 (mastery 슬라이더 제외)

### 4.2 계산식

```
Damage = f(Stats, Equips, Buffs, Mastery)

최소 데미지 = (주스탯 × 최소무기상수 × 0.9 × 숙련도 + 부스탯) × 총공격력 / 100
최대 데미지 = (주스탯 × 최대무기상수 + 부스탯) × 총공격력 / 100
```

### 4.3 Props

```typescript
interface DamageTableProps {
  stats: Stats;
  weaponType: WeaponType | null;
  totalAttack: number;
}
```

## 5. App 컴포넌트

### 5.1 책임

- Character 도메인 객체 생성 및 관리
- 각 Table 컴포넌트 조합
- 이벤트 핸들러를 통한 Character 상태 업데이트

### 5.2 상태 관리 플로우

```
User Input (Table)
  → Event Handler (App)
  → Character State Update
  → Re-render Tables with new props
```

## 6. 구현 순서

1. ✅ 아키텍처 문서 작성
2. Character 도메인 모델 구현
   - Stats 클래스/타입
   - Equips 클래스
   - Buffs 클래스
   - Inventory 클래스
   - Character 통합 클래스
3. Table 컴포넌트 리팩토링
   - StatTable 순수 UI로 전환
   - EquipTable 순수 UI로 전환
   - BuffTable 순수 UI로 전환
   - InventoryTable 생성 (기존 ItemMaker 통합)
4. App 컴포넌트 리팩토링
   - Character 인스턴스 생성 및 관리
   - 이벤트 핸들러 구현
   - Table 컴포넌트 연결
5. DamageTable 최적화
   - 순수 계산 로직으로 전환
   - useMemo 최적화

## 7. 기대 효과

- ✅ 도메인 로직과 UI 완전 분리
- ✅ 단일 진실 공급원으로 상태 일관성 보장
- ✅ 테스트 용이성 향상
- ✅ 유지보수성 향상
- ✅ 확장성 확보
