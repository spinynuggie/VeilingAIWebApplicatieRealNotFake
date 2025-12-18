import { Button as ButtonMaterial, ButtonProps } from "@mui/material";
import { Children } from "react";

interface MyButtonProps extends ButtonProps{
  label?: string;
}

export function Button ({children, ...props}: MyButtonProps) {
  return (
  <ButtonMaterial 
  {...props}>
    {children}
  </ButtonMaterial>
  )
} 