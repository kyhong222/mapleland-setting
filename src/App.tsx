import { useState } from 'react'
import { AppBar, Toolbar, FormControl, Select, MenuItem, Box, IconButton } from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import { Save as SaveIcon, FolderOpen as FolderOpenIcon } from '@mui/icons-material'
import './App.css'

function App() {
  const [selectedJob, setSelectedJob] = useState('')

  const handleJobChange = (event: SelectChangeEvent) => {
    setSelectedJob(event.target.value)
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <FormControl sx={{ minWidth: 200 }} size="small">
            <Select
              value={selectedJob}
              onChange={handleJobChange}
              displayEmpty
              sx={{ color: 'white', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.23)' } }}
            >
              <MenuItem value="">
                <em>직업 선택</em>
              </MenuItem>
              <MenuItem value="warrior">전사</MenuItem>
              <MenuItem value="magician">마법사</MenuItem>
              <MenuItem value="bowman">궁수</MenuItem>
              <MenuItem value="thief">도적</MenuItem>
            </Select>
          </FormControl>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <IconButton color="inherit" aria-label="save">
            <SaveIcon />
          </IconButton>
          <IconButton color="inherit" aria-label="load">
            <FolderOpenIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
          {/* 왼쪽: 장비창 */}
          <Box 
            sx={{ 
              width: 300, 
              height: 500, 
              border: '1px solid #ccc', 
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#f5f5f5'
            }}
          >
            장비창
          </Box>
          
          {/* 가운데: 캐릭터 이미지 */}
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
          
          {/* 오른쪽: 스탯창 */}
          <Box 
            sx={{ 
              width: 300, 
              height: 500, 
              border: '1px solid #ccc', 
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#f5f5f5'
            }}
          >
            스탯창
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default App
