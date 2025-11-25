"use client";

import React, { useState, useEffect } from "react";
import { TextField, IconButton, Box, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import * as gebruikerService from '@/services/gebruikerService';
interface EditableFieldProps {
  label?: string;
  defaultValue?: string;
  value?: string;
  field: string; // veldnaam in user-object
  onValueChange?: (value: string) => void;
  onSave?: (field: string, value: string) => void;
}

const EditableField: React.FC<EditableFieldProps> = ({
  label = "Veld",
  defaultValue = "",
  value: propValue,
  onValueChange,
  onSave,
  field,
}) => {
  // initialize from `propValue` if provided, otherwise use `defaultValue`
  const [value, setValue] = useState<string>(propValue ?? defaultValue);

  // keep internal state in sync if parent updates the `value` prop
  useEffect(() => {
    setValue(propValue ?? defaultValue);
  }, [propValue, defaultValue]);
  const [isEditing, setIsEditing] = useState(false);

  

  const handleEdit = () => {
    setIsEditing(true);
    setTimeout(() => {
      const input = document.getElementById(`editable-${label}`) as HTMLInputElement | null;
      if (input) {
        input.focus();
        try {
          const len = input.value?.length ?? 0;
          input.setSelectionRange(len, len);
        } catch {
          // ignore if setSelectionRange not supported
        }
      }
    }, 0);
  };

  const handleBlur = () => {
    setIsEditing(false);
    
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    gebruikerService.updateGebruiker(field, value);
    onValueChange?.(newValue);
    if (onSave) {
      onSave(field, value);
      
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Typography
        variant="subtitle2"
        sx={{ mb: 0.5, fontWeight: 500 }}
      >
        {label}
      </Typography>

      <Box sx={{ display: "flex", alignItems: "stretch", width: "100%" }}>
        <TextField
          id={`editable-${label}`}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          fullWidth
          variant="outlined"
          InputProps={{
            readOnly: !isEditing,
          }}
          onFocus={(e) => {
            if (!isEditing) {
              (e.target as HTMLInputElement).blur(); // Verwijdert cursorfocus als niet in edit-modus
            }
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              height: 36,
              backgroundColor: "#fff",
              borderRadius: "10px 0 0 10px",
              "& fieldset": {
                borderColor: "#000",
                borderWidth: 1.2,
                borderRight: "none",
              },
              "&:hover fieldset": {
                borderColor: "#000",
              },
              "&.Mui-focused fieldset": {
                borderWidth: 1.5,
              },
            },
            "& input.Mui-disabled": {
              WebkitTextFillColor: "#000",
            },
          }}
        />

        <IconButton
          onClick={handleEdit}
          sx={{
            backgroundColor: "#e0e0e0",
            border: "1.2px solid #000",
            borderLeft: "none",
            borderRadius: "0 10px 10px 0",
            width: 38,
            height: 36,
            "&:hover": { backgroundColor: "#d0d0d0" },
          }}
        >
          <EditIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default EditableField;
