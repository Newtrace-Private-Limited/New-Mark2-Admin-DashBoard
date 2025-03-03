import React from "react";
import {
  Grid,
  Typography,
  Switch,
  Box,
  useTheme,
} from "@mui/material";
import { useWebSocket } from "src/WebSocketProvider";

const RectifierControl = () => {
  const theme = useTheme();
  const backgroundColor = theme.palette.mode === "dark" ? "#1F2A40" : "#f2f0f0";

  const data = useWebSocket();

  const values = {
    "RECT-VT-001": data["RECT-VT-001"] ?? 0,
    "RECT-CT-001": data["RECT-CT-001"] ?? 0,
    actualPower: data.actualPower ?? 0,
  };

  // Calculate power
  const power = values["RECT-VT-001"] * values["RECT-CT-001"];

  // Determine if DC Output is on or off
  const dcOutputOn = values["RECT-CT-001"] > 1;

  return (
  <>
    <div className="flex flex-col  gap-x-52">
    <Grid item xs={12}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        padding="8px"
      >
      <Typography variant="body">DC Output</Typography>
      <Switch checked={dcOutputOn} color="success" />
      </Box>
    </Grid>


    <Box mt={5}>
    <Typography variant="h4" gutterBottom component="h2" className="text-[#09EAFC] p-3">Actual Voltage: {values["RECT-VT-001"].toFixed(2)} V</Typography>
    <Typography variant="h4" gutterBottom className="text-[#09EAFC]  p-3">Actual Current: {values["RECT-CT-001"].toFixed(2)} C</Typography>
    <Typography variant="h4" gutterBottom className="text-[#09EAFC]  p-3">Power: {power.toFixed(2)} W</Typography>
   
  </Box>
  </div>
</>
  );
};

export default RectifierControl;