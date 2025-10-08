import React, { useState }from "react";
import { Grid, Button, Typography, TextField, IconButton } from "@mui/material";
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import floraHollandKantoor from "../assets/loginAssets/floraHollandKantoor.png";
import royalLogo from "../assets/loginAssets/royalLogo.png";
import { useNavigate } from "react-router-dom";


function Login() {
  const [showPassword, setShowPassword] = useState(false);

  let navigate = useNavigate();

  const handleTogglePassword = () => {
  setShowPassword((prev) => !prev);
};

  const handleClick = () => {

    console.log("Button clicked!");
    navigate("/Register");
  };

  return (
    
    <Grid container sx={{ minHeight: "100vh" }}>
      {/* Left half - Image */}
      <Grid
        item
        xs={12}
        md={6}
      >
        <img
          src={floraHollandKantoor}
          alt="floraholland hoofdkantoor"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </Grid>
    </Grid>
  );
}

export default Login;
