import type { ComponentProps, ReactNode } from "react";
import { Box as BoxMui } from "@mui/material";
import { Box } from "@/components/Box";
import { Background } from "@/components/Background";

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
    <Background>
      <BoxMui
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
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
    </Background>
  );
}
