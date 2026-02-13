import {
  Box,
  Typography,
  Divider,
  Switch,
} from "@mui/material";
import { useState } from "react";
import { useCharacter } from "../contexts/CharacterContext";
import type { PassiveSkillData } from "../types/passive";
import herosEchoData from "../data/buff/HerosEcho/herosecho.json";
import MasteryDialog from "./MasteryDialog";
import BuffSelectDialog from "./BuffSelectDialog";
import PassiveDialog from "./PassiveDialog";
import MapleWarriorRow from "./MapleWarriorRow";
import MasteryRow from "./MasteryRow";
import PassiveSkillList from "./PassiveSkillList";

export default function BuffTable() {
  const {
    character,
    setMapleWarriorLevel,
    setHeroEchoEnabled,
    mastery1,
    mastery2,
    passiveLevels,
  } = useCharacter();

  const [mastery1Dialog, setMastery1Dialog] = useState(false);
  const [mastery2Dialog, setMastery2Dialog] = useState(false);
  const [passiveDialogData, setPassiveDialogData] =
    useState<PassiveSkillData | null>(null);
  const [tempMastery1Level, setTempMastery1Level] = useState(0);
  const [tempMastery2Level, setTempMastery2Level] = useState(0);
  const [tempPassiveLevel, setTempPassiveLevel] = useState(0);

  const mapleWarrior = character.getBuff("mapleWarrior");
  const heroEcho = character.getBuff("heroEcho");
  const job = character.getJob();

  return (
    <Box
      sx={{
        width: 320,
        border: "1px solid #ccc",
        borderRadius: 1,
        bgcolor: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 타이틀 */}
      <Typography
        variant="body2"
        sx={{ fontWeight: "bold", p: 1.5, borderBottom: "1px solid #ccc" }}
      >
        버프
      </Typography>

      {/* 버프 섹션 */}
      <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 1.5 }}>
        {/* 메이플 용사 */}
        <MapleWarriorRow
          level={mapleWarrior?.level || 0}
          onLevelChange={setMapleWarriorLevel}
        />

        {/* 버프 선택 (버프1, 버프2) */}
        <BuffSelectDialog />

        {/* 영웅의 메아리 */}
        <Divider sx={{ my: 0 }} />
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            padding: 1.5,
            borderRadius: 1,
            bgcolor: "#f5f5f5",
          }}
        >
          {/* 아이콘 */}
          <Box
            sx={{
              minWidth: 50,
              height: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "#f0f0f0",
              borderRadius: 1,
              overflow: "hidden",
            }}
          >
            <img
              src={`data:image/webp;base64,${herosEchoData.icon}`}
              alt="영웅의 메아리"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                filter: !heroEcho?.enabled ? "grayscale(100%)" : "none",
              }}
            />
          </Box>

          {/* 정보 영역 */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            {/* 제목과 스위치 */}
            <Box
              sx={{
                display: "flex",
                gap: 1,
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: "bold", fontSize: "0.875rem" }}
              >
                영웅의 메아리
              </Typography>
              <Switch
                checked={heroEcho?.enabled || false}
                onChange={(e) => setHeroEchoEnabled(e.target.checked)}
                size="small"
                sx={{ m: 0 }}
              />
            </Box>

            <Divider sx={{ my: 0 }} />

            {/* 설명 */}
            <Typography
              variant="caption"
              sx={{ color: "#666", fontSize: "0.75rem" }}
            >
              총 공격력/마력 4% 증가
            </Typography>
          </Box>
        </Box>

        {/* 마스터리 스킬 */}
        <Divider sx={{ my: 0 }} />
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          패시브 스킬
          <Typography
            component="span"
            variant="caption"
            sx={{ ml: 0.5, color: "text.secondary" }}
          >
            (스킬 아이콘을 클릭하여 레벨 조정)
          </Typography>
        </Typography>
        <Box
          sx={{
            padding: 1.5,
            borderRadius: 1,
            bgcolor: "#f5f5f5",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 1,
            minHeight: 70,
          }}
        >
          <MasteryRow
            weaponType={character.getWeaponType()}
            mastery1={mastery1}
            mastery2={mastery2}
            onMastery1Click={() => {
              setTempMastery1Level(mastery1);
              setMastery1Dialog(true);
            }}
            onMastery2Click={() => {
              setTempMastery2Level(mastery2);
              setMastery2Dialog(true);
            }}
          />
          <PassiveSkillList
            jobEngName={job?.engName}
            passiveLevels={passiveLevels}
            secondaryItemType={character.getEquippedItem("보조무기")?.type}
            onPassiveClick={(passive, level) => {
              setTempPassiveLevel(level);
              setPassiveDialogData(passive);
            }}
          />
        </Box>
      </Box>

      {/* 마스터리 다이얼로그 */}
      <MasteryDialog
        mastery1Open={mastery1Dialog}
        onMastery1Close={() => setMastery1Dialog(false)}
        tempMastery1Level={tempMastery1Level}
        onTempMastery1Change={setTempMastery1Level}
        mastery2Open={mastery2Dialog}
        onMastery2Close={() => setMastery2Dialog(false)}
        tempMastery2Level={tempMastery2Level}
        onTempMastery2Change={setTempMastery2Level}
      />

      {/* 패시브 스킬 다이얼로그 */}
      <PassiveDialog
        passive={passiveDialogData}
        onClose={() => setPassiveDialogData(null)}
        tempLevel={tempPassiveLevel}
        onTempLevelChange={setTempPassiveLevel}
      />
    </Box>
  );
}
