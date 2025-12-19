"use client";

import { useVeilingAanmaken } from "@/hooks/useVeilingAanmaken";
import { Button, CircularProgress, Icon, IconButton, } from "@mui/material";
import { Add as AddIcon} from "@mui/icons-material";

export function CreateVeilingButton() {
  const { navigateToCreate, isLoading } = useVeilingAanmaken();

  return (
    <IconButton onClick={navigateToCreate} disabled={isLoading}>
      <AddIcon/>
    </IconButton>
  );
}