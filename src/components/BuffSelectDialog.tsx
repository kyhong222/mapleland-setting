import {
  Box,
  Typography,
  TextField,
  Divider,
  Button,
  MenuItem,
  Menu,
} from "@mui/material";
import { useState } from "react";
import { useCharacter } from "../contexts/CharacterContext";
import buff1Data from "../data/buff/buff/buff1.json";
import buff2Data from "../data/buff/buff/buff2.json";

interface BuffData {
  empty: {
    icon: string;
    name: string;
    x: number;
  };
}

export default function BuffSelectDialog() {
  const {
    character,
    setBuff1Attack,
    setBuff2Attack,
    buff1Attack,
    buff2Attack,
    buff1Label,
    setBuff1Label,
    buff1Icon,
    setBuff1Icon,
    buff1IsManual,
    setBuff1IsManual,
    buff2Label,
    setBuff2Label,
    buff2Icon,
    setBuff2Icon,
    buff2IsManual,
    setBuff2IsManual,
    setBuffMAD,
  } = useCharacter();

  const [buff1Menu, setBuff1Menu] = useState<null | HTMLElement>(null);
  const [buff2Menu, setBuff2Menu] = useState<null | HTMLElement>(null);
  const [buff1MADValue, setBuff1MADValue] = useState(0);
  const [buff2MADValue, setBuff2MADValue] = useState(0);

  const job = character.getJob();
  const isJobMagician = job?.engName === "magician";

  const buff1Skills = isJobMagician
    ? buff1Data.magic_buffs || []
    : buff1Data.attack_buffs || [];
  const buff2Skills = isJobMagician
    ? buff2Data.magic_buffs || []
    : buff2Data.attack_buffs || [];

  return (
    <>
      {/* 버프 1 */}
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
            bgcolor: "#ffffff",
            borderRadius: 1,
            overflow: "hidden",
            fontSize: 30,
          }}
        >
          {buff1Icon && !buff1IsManual ? (
            <img
              src={`data:image/webp;base64,${buff1Icon}`}
              alt={buff1Label}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ) : (
            <img
              src={`data:image/png;base64,${(buff1Data as BuffData).empty.icon}`}
              alt="버프 선택"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          )}
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
          {/* 드롭다운 버튼 */}
          <Button
            onClick={(e) => setBuff1Menu(e.currentTarget)}
            size="small"
            sx={{
              width: "100%",
              height: 32,
              fontSize: "0.875rem",
              justifyContent: "flex-start",
              textTransform: "none",
              color: "#333",
              border: "1px solid #ccc",
              backgroundColor: "#fff",
            }}
          >
            {buff1Label}
          </Button>
          <Menu
            anchorEl={buff1Menu}
            open={Boolean(buff1Menu)}
            onClose={() => setBuff1Menu(null)}
          >
            <MenuItem
              onClick={() => {
                setBuff1Menu(null);
                setBuff1Label("직접입력");
                setBuff1Icon(null);
                setBuff1IsManual(true);
                setBuff1Attack(0);
              }}
            >
              직접입력
            </MenuItem>
            {buff1Skills?.map((skill) => (
              <MenuItem
                key={skill.name}
                onClick={() => {
                  setBuff1Menu(null);
                  setBuff1Label(skill.name);

                  const value = skill.x || 0;
                  setBuff1Attack(value);

                  if (isJobMagician) {
                    setBuff1MADValue(value);
                    setBuffMAD(value + buff2MADValue);
                  }

                  setBuff1Icon(skill.icon);
                  setBuff1IsManual(false);
                }}
              >
                {skill.name}
              </MenuItem>
            ))}
          </Menu>

          {/* 설명 */}
          <Box
            sx={{
              display: "flex",
              gap: 0.5,
              alignItems: "center",
              height: 20,
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: "#666", fontSize: "0.75rem", lineHeight: 1 }}
            >
              {isJobMagician ? "마력" : "공격력"}
            </Typography>
            <TextField
              type="number"
              size="small"
              value={buff1Attack}
              onChange={(e) => {
                if (buff1IsManual) {
                  const value = parseInt(e.target.value) || 0;
                  setBuff1Attack(value);
                  if (isJobMagician) {
                    setBuff1MADValue(value);
                    setBuffMAD(value + buff2MADValue);
                  }
                }
              }}
              disabled={!buff1IsManual}
              sx={{
                width: 50,
                height: 20,
                "& .MuiOutlinedInput-root": {
                  height: 20,
                  minHeight: 20,
                },
                "& .MuiInputBase-input": {
                  bgcolor: buff1IsManual ? "white" : "#f0f0f0",
                  p: "0px 4px",
                  fontSize: "0.75rem",
                  textAlign: "center",
                  lineHeight: 1.4,
                },
              }}
            />
            <Typography
              variant="caption"
              sx={{ color: "#666", fontSize: "0.75rem", lineHeight: 1 }}
            >
              증가
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* 버프 2 */}
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
            bgcolor: "#ffffff",
            borderRadius: 1,
            overflow: "hidden",
            fontSize: 30,
          }}
        >
          {buff2Icon && !buff2IsManual ? (
            <img
              src={`data:image/webp;base64,${buff2Icon}`}
              alt={buff2Label}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ) : (
            <img
              src={`data:image/png;base64,${(buff2Data as BuffData).empty.icon}`}
              alt="버프 선택"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          )}
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
          {/* 드롭다운 버튼 */}
          <Button
            onClick={(e) => setBuff2Menu(e.currentTarget)}
            size="small"
            sx={{
              width: "100%",
              height: 32,
              fontSize: "0.875rem",
              justifyContent: "flex-start",
              textTransform: "none",
              color: "#333",
              border: "1px solid #ccc",
              backgroundColor: "#fff",
            }}
          >
            {buff2Label}
          </Button>
          <Menu
            anchorEl={buff2Menu}
            open={Boolean(buff2Menu)}
            onClose={() => setBuff2Menu(null)}
          >
            <MenuItem
              onClick={() => {
                setBuff2Menu(null);
                setBuff2Label("직접입력");
                setBuff2Icon(null);
                setBuff2IsManual(true);
                setBuff2Attack(0);
              }}
            >
              직접입력
            </MenuItem>
            {buff2Skills?.map((skill) => (
              <MenuItem
                key={skill.name}
                onClick={() => {
                  setBuff2Menu(null);
                  setBuff2Label(skill.name);

                  const value = skill.x || 0;
                  setBuff2Attack(value);

                  if (isJobMagician) {
                    setBuff2MADValue(value);
                    setBuffMAD(buff1MADValue + value);
                  }

                  setBuff2Icon(skill.icon);
                  setBuff2IsManual(false);
                }}
              >
                {skill.name}
              </MenuItem>
            ))}
          </Menu>

          {/* 설명 */}
          <Box
            sx={{
              display: "flex",
              gap: 0.5,
              alignItems: "center",
              height: 20,
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: "#666", fontSize: "0.75rem", lineHeight: 1 }}
            >
              {isJobMagician ? "마력" : "공격력"}
            </Typography>
            <TextField
              type="number"
              size="small"
              value={buff2Attack}
              onChange={(e) => {
                if (buff2IsManual) {
                  const value = parseInt(e.target.value) || 0;
                  setBuff2Attack(value);
                  if (isJobMagician) {
                    setBuff2MADValue(value);
                    setBuffMAD(buff1MADValue + value);
                  }
                }
              }}
              disabled={!buff2IsManual}
              sx={{
                width: 50,
                height: 20,
                "& .MuiOutlinedInput-root": {
                  height: 20,
                  minHeight: 20,
                },
                "& .MuiInputBase-input": {
                  bgcolor: buff2IsManual ? "white" : "#f0f0f0",
                  p: "0px 4px",
                  fontSize: "0.75rem",
                  textAlign: "center",
                  lineHeight: 1.4,
                },
              }}
            />
            <Typography
              variant="caption"
              sx={{ color: "#666", fontSize: "0.75rem", lineHeight: 1 }}
            >
              증가
            </Typography>
          </Box>
        </Box>
      </Box>
    </>
  );
}
