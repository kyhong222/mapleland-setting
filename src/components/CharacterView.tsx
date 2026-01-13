import { Box } from '@mui/material'

export default function CharacterView() {
  return (
    <Box 
      sx={{ 
        width: 400, 
        height: 500, 
        border: '1px solid #ccc', 
        borderRadius: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f5f5'
      }}
    >
      캐릭터 이미지
    </Box>
  )
}
