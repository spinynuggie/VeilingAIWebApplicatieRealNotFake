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
        sx={{ width: { md: "50vw" } }}
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

      {/* Right half - Logo, Text, Button */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          width: { md: "50vw" },
          background: "linear-gradient(to top, #E2FFE9 0%, #E2FFE9 70%, #FFFFFF 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pt: { xs: 2, md: 4 },
        }}
      >
        {/* Logo */}
        <Grid container justifyContent="center">
          <Grid item xs={4} md={6} sx={{ml: "12.5%"}}>
            <img
              src={royalLogo}
              alt="Royal FloraHolland Logo"
              style={{ display: "block", width: "auto", maxWidth: "75%" }}
            />
          </Grid>
        </Grid>

        {/* Text + Button spanning columns 2–5 */}
        <Grid container justifyContent="center">
          <Grid item md={4} xs={12} sx={{
              pt: { xs: 3, md: 6},
              display: "flex",
              flexDirection: "column",
          }}>
          <Typography variant="h4" sx={{ fontWeight: '700' }}> {/*Probeer dit nog bold te maken */}
            Registreer</Typography>
          <Typography variant="body1" sx={{
            pt: { xs: 2, md: 4}
          }}>
          E-mail adres
          </Typography>
          <TextField 
          fullWidth
           id="outlined-basic" 
            label={<EmailIcon /> }
            variant="standard"
             InputProps={{
              sx:{
                height: '23px', // Set explicit height
              }
            }}
          sx ={{
            '& .MuiInputLabel-root': {
            transform: 'translateY(10px)',
            transition: 'transform 0.2s ease',
            },
           '& .MuiInputLabel-root.Mui-focused': {
            transform: 'translate(-30px, 10px)',
           },
          }}
           >
          </TextField>
          <Grid container alignItems="center" spacing={1} sx={{ mt: 3, width: '100%' }}>
              <Grid item xs sx={{ flexGrow: 1 }}>
                <Grid container direction="column">
                  <Typography variant="body1">Wachtwoord</Typography>
                  <TextField
                  fullWidth
                    label={<LockIcon />}
                    variant="standard"
                    type={showPassword ? "text" : "password"}
                    InputProps={{
                      sx:{
                        height: '23px', // Set explicit height
                      }
                    }}
                    sx={{
                        mb: 1,
                       '& .MuiInputLabel-root': {
                       transform: 'translateY(10px)',
                       transition: 'transform 0.2s ease',
                    },
                        '& .MuiInputLabel-root.Mui-focused': {
                        transform: 'translate(-30px, 10px)',
                      },
                    }}
                  />
                    <Typography variant="body1">Conformatie Wachtwoord</Typography>
                  <TextField
                  fullWidth
                    label={<LockIcon />}
                    variant="standard"
                    type={showPassword ? "text" : "password"}
                    InputProps={{
                      sx:{
                        height: '23px', // Set explicit height
                      }
                    }}
                    sx={{
                       '& .MuiInputLabel-root': {
                       transform: 'translateY(10px)',
                       transition: 'transform 0.2s ease',
                    },
                        '& .MuiInputLabel-root.Mui-focused': {
                        transform: 'translate(-30px, 10px)',
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
                <IconButton onClick={handleTogglePassword}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
            </Grid>
          <Button
              variant="contained"
              
            //</radioGroupcolor="primary"
              onClick={handleClick}
              sx={{ 
                mt: 4
              }}
            >
                Aanmelden
          </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default Login;
