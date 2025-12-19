import { TextField as TextFieldMui, BaseTextFieldProps } from "@mui/material";

interface MyTextFieldProps extends BaseTextFieldProps {}

export function TextField({ 
  variant = "outlined",  // Default value here
  fullWidth = true,      // Default value here
  ...otherProps          // Everything else (onChange, label, etc.)
}: MyTextFieldProps) {
  return (
    <TextFieldMui 
      variant={variant}
      fullWidth={fullWidth}
      {...otherProps} 
      sx={{ 
        mb: 2, // Adds a default bottom margin of 16px
        ...otherProps.sx // Ensures you can still override it later if needed
      }}
    />
  );
}