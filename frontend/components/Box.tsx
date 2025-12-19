import { Box as BoxMui, BoxProps } from "@mui/material";

interface MyBoxProps extends BoxProps {
  label?: string;
}

export function Box({ children, ...props }: MyBoxProps) {
  return (
    <BoxMui
      sx={{
        display: "inline-flex", // Allows boxes to sit next to each other
        alignItems: "flex-start",
        ...props.sx, // Allows you to override styles from the outside
      }}
    >
      <BoxMui
        sx={{
          p: 4,
          bgcolor: "custom.color6",
          border: "2px solid",
          borderColor: "custom.color2",
          borderRadius: 2,
          width: 'fit-content' // Ensures the box only takes the space it needs
        }}
      >
        {children}
      </BoxMui>
    </BoxMui>
  );
}