"use client";

import React, { useState } from "react";
import { TextField, IconButton, Box, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

interface EditableFieldProps {
  label?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

const EditableField: React.FC<EditableFieldProps> = ({
  label = "Veld",
  defaultValue = "",
  onValueChange,
}) => {
  const [value, setValue] = useState(defaultValue);
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    setTimeout(() => {
      const input = document.getElementById(`editable-${label}`);
      input?.focus();
    }, 0);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onValueChange?.(newValue);
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
              e.target.blur(); // Verwijdert cursorfocus als niet in edit-modus
            }
          }}
          tabIndex={-1} // voorkomt focus bij Tabben door de pagina
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
