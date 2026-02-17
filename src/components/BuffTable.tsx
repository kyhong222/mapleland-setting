import {
  Box,
  Typography,
  Divider,
  Button,
} from "@mui/material";
import { useState } from "react";
import { useCharacter } from "../contexts/CharacterContext";
import type { PassiveSkillData } from "../types/passive";
import type { SpecialSkillData } from "../types/specialSkill";
import { MAGICIAN_SUBCLASSES } from "../types/specialSkill";
import MasteryDialog from "./MasteryDialog";
import BuffSelectDialog from "./BuffSelectDialog";
import PassiveDialog from "./PassiveDialog";
import MapleWarriorRow from "./MapleWarriorRow";
import MapleWarriorDialog from "./MapleWarriorDialog";
import MasteryRow from "./MasteryRow";
import PassiveSkillList from "./PassiveSkillList";
import DefenseBuffSection from "./DefenseBuffSection";
import SpecialSkillSection from "./SpecialSkillSection";
import SpecialSkillDialog from "./SpecialSkillDialog";

export default function BuffTable() {
  const {
    character,
    setHeroEchoEnabled,
    mastery1,
    mastery2,
    passiveLevels,
    specialSkillLevels,
    magicianSubClass,
    setMagicianSubClass,
  } = useCharacter();

  const [mapleWarriorDialog, setMapleWarriorDialog] = useState(false);
  const [tempMapleWarriorLevel, setTempMapleWarriorLevel] = useState(0);
  const [mastery1Dialog, setMastery1Dialog] = useState(false);
  const [mastery2Dialog, setMastery2Dialog] = useState(false);
  const [passiveDialogData, setPassiveDialogData] =
    useState<PassiveSkillData | null>(null);
  const [tempMastery1Level, setTempMastery1Level] = useState(0);
  const [tempMastery2Level, setTempMastery2Level] = useState(0);
  const [tempPassiveLevel, setTempPassiveLevel] = useState(0);
  const [specialSkillDialogData, setSpecialSkillDialogData] =
    useState<SpecialSkillData | null>(null);
  const [tempSpecialSkillLevel, setTempSpecialSkillLevel] = useState(0);

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
        <Typography
          component="span"
          variant="caption"
          sx={{ ml: 0.5, color: "text.secondary" }}
        >
          (아이콘을 클릭하여 조정)
        </Typography>
      </Typography>

      {/* 버프 섹션 */}
      <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 1.5 }}>
        {/* 메이플 용사 & 영웅의 메아리 */}
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          메이플 용사 & 영웅의 메아리
        </Typography>
        <MapleWarriorRow
          level={mapleWarrior?.level || 0}
          onMapleWarriorClick={() => {
            setTempMapleWarriorLevel(mapleWarrior?.level || 0);
            setMapleWarriorDialog(true);
          }}
          heroEchoEnabled={heroEcho?.enabled || false}
          onHeroEchoToggle={() => setHeroEchoEnabled(!heroEcho?.enabled)}
        />

        {/* 버프 선택 (버프1, 버프2) */}
        <BuffSelectDialog />

        {/* 추가 버프 (물방, 마방, 명중, 회피) */}
        <Divider sx={{ my: 0 }} />
        <DefenseBuffSection />

        {/* 특수 스킬 */}
        <Divider sx={{ my: 0 }} />
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            특수 스킬
          </Typography>
          {job?.engName === "magician" && (
            <Box sx={{ display: "flex", gap: 0.5 }}>
              {MAGICIAN_SUBCLASSES.map((sub) => (
                <Button
                  key={sub}
                  size="small"
                  variant={magicianSubClass === sub ? "contained" : "outlined"}
                  onClick={() => setMagicianSubClass(sub)}
                  sx={{ minWidth: 0, px: 1, py: 0, fontSize: "0.65rem", textTransform: "none" }}
                >
                  {sub}
                </Button>
              ))}
            </Box>
          )}
        </Box>
        <Box
          sx={{
            padding: 1.5,
            borderRadius: 1,
            bgcolor: "#f5f5f5",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 1,
            minHeight: 40,
          }}
        >
          <SpecialSkillSection
            jobEngName={job?.engName}
            specialSkillLevels={specialSkillLevels}
            weaponType={character.getWeaponType() ?? undefined}
            magicianSubClass={magicianSubClass}
            onSkillClick={(skill, level) => {
              setTempSpecialSkillLevel(level);
              setSpecialSkillDialogData(skill);
            }}
          />
        </Box>

        {/* 패시브 스킬 */}
        <Divider sx={{ my: 0 }} />
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          패시브 스킬
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
            secondaryItemType={character.isSlotBlocked("보조무기") ? undefined : character.getEquippedItem("보조무기")?.type}
            weaponType={character.getWeaponType() ?? undefined}
            onPassiveClick={(passive, level) => {
              setTempPassiveLevel(level);
              setPassiveDialogData(passive);
            }}
          />
        </Box>
      </Box>

      {/* 메이플 용사 다이얼로그 */}
      <MapleWarriorDialog
        open={mapleWarriorDialog}
        onClose={() => setMapleWarriorDialog(false)}
        tempLevel={tempMapleWarriorLevel}
        onTempLevelChange={setTempMapleWarriorLevel}
      />

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

      {/* 특수 스킬 다이얼로그 */}
      <SpecialSkillDialog
        skill={specialSkillDialogData}
        onClose={() => setSpecialSkillDialogData(null)}
        tempLevel={tempSpecialSkillLevel}
        onTempLevelChange={setTempSpecialSkillLevel}
      />
    </Box>
  );
}
