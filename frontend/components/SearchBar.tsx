import { TextField } from "@mui/material";

export default function SearchBar() {
  return (
    <TextField
      variant="outlined"
      size="small"
      placeholder="Search"
      sx={{
        backgroundColor: "#f5f5f5",
        borderRadius: "50px", //border rond maken
        width: "500px",
        "& fieldset": {
        borderRadius: "50px", // outline rond maken
        borderColor: "#aaa",
          },
      }}
    />
  );
}
