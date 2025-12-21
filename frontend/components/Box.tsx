import { Box as BoxMui, BoxProps } from "@mui/material";

interface MyBoxProps extends BoxProps {
  label?: string;
}

export function Box({ children, ...props }: MyBoxProps) {
  return (
    <BoxMui
      {...props}
      sx={{
        display: "flex", // Veranderd van inline-flex naar flex
        justifyContent: "center",
        ...props.sx, 
      }}
    >
      <BoxMui
        sx={{
          p: 4,
          bgcolor: "custom.color6",
          border: "2px solid",
          borderColor: "custom.color2",
          borderRadius: 2,
          minWidth: '400px', // Geef het een basisbreedte voor formulieren
          width: 'fit-content',
          boxShadow: 3 // Optioneel: geeft wat diepte
        }}
      >
        {children}
      </BoxMui>
    </BoxMui>
  );
}