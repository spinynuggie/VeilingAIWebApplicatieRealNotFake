import Link from "next/link";
import PersonIcon from "@mui/icons-material/Person";
import { IconButton } from "@mui/material"; // Optioneel: voor betere klikbaarheid en hover-effect

export default function Profile() {
  return (
    <Link href="/klantProfile">
      <IconButton
        aria-label="Ga naar klantprofiel"
        sx={{
          color: "#757575",
          "&:hover": {
            color: "#9E9E9E",
          },
        }}
      >
        <PersonIcon fontSize="large" />
      </IconButton>
    </Link>
  );
}
