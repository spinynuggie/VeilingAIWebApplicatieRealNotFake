import type { ComponentProps, ReactNode } from "react";
import { Box as BoxMui } from "@mui/material";
import { Box } from "@/components/Box";

type BoxProps = ComponentProps<typeof Box>;

type AuthSplitLayoutProps = {
  children: ReactNode;
  imageSrc?: string;
  cardProps?: BoxProps;
};

export default function AuthSplitLayout({
  children,
  imageSrc = "/loginAssets/FloraHollandGebouw.png",
  cardProps,
}: AuthSplitLayoutProps) {
  const { sx, ...rest } = cardProps ?? {};
  const mergedSx = sx
    ? [{ maxWidth: 440, width: "100%" }, ...(Array.isArray(sx) ? sx : [sx])]
    : { maxWidth: 440, width: "100%" };

  return (
    <BoxMui
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        bgcolor: "background.default",
      }}
    >
      <BoxMui
        sx={{
          flex: 1,
          minHeight: { xs: 240, md: "100vh" },
          backgroundImage: `url('${imageSrc}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <BoxMui
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 3, md: 6 },
        }}
      >
        <Box {...rest} sx={mergedSx}>
          {children}
        </Box>
      </BoxMui>
    </BoxMui>
  );
}
