import { Box as BoxMui, BoxProps } from "@mui/material";

interface MyBoxProps extends BoxProps {
  label?: string;
}

export function Box({ children, ...props }: MyBoxProps) {
  const { sx, ...rest } = props;

  return (
    <BoxMui
      sx={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <BoxMui
        {...rest}
        sx={{
          bgcolor: "background.paper",
          borderRadius: 3,
          boxShadow: 3,
          p: { xs: 3, md: 4 },
          display: "flex",
          flexDirection: "column",
          gap: 2,
          minWidth: { xs: 0, sm: 360 },
          width: { xs: "100%", sm: "fit-content" },
          ...sx,
        }}
      >
        {children}
      </BoxMui>
    </BoxMui>
  );
}
