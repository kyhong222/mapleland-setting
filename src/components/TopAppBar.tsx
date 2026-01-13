import { AppBar, Toolbar, FormControl, Select, MenuItem, Box, IconButton } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { Save as SaveIcon, FolderOpen as FolderOpenIcon } from "@mui/icons-material";
import { JOBS } from "../types/job";

interface TopAppBarProps {
  selectedJob: string;
  onJobChange: (event: SelectChangeEvent) => void;
}

export default function TopAppBar({ selectedJob, onJobChange }: TopAppBarProps) {
  return (
    <AppBar position="static">
      <Toolbar>
        <FormControl sx={{ minWidth: 200 }} size="small">
          <Select
            value={selectedJob}
            onChange={onJobChange}
            displayEmpty
            sx={{ color: "white", ".MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255, 255, 255, 0.23)" } }}
          >
            <MenuItem value="">
              <em>직업 선택</em>
            </MenuItem>
            {JOBS.map((job) => (
              <MenuItem key={job.engName} value={job.engName}>
                {job.koreanName}
              </MenuItem>
            ))}
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
  );
}
