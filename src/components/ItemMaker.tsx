import { Box } from "@mui/material";

export default function ItemMaker() {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1136,
        height: 300,
        border: "1px solid #ccc",
        borderRadius: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f5f5f5",
        margin: "0 auto",
      }}
    >
      아이템 제작
    </Box>
  );
}
