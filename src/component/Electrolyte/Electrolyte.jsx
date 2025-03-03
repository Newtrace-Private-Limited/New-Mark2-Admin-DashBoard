

import React from "react";
import { Box, Typography } from "@mui/material";
import { useWebSocket } from "src/WebSocketProvider";

const Electrolyte = () => {
  const data = useWebSocket();

  const electroyteData = {
    "CR-FT-001": { value: data["CR-FT-001"], width: "40px" },
  };

  return (
    <Box>
      <Box display="flex" justifyContent="center" alignItems="center">
        <Typography variant="h3" sx={{ fontWeight: "bold", color: "#00b0ff" }}>
          {data["CR-FT-001"].toFixed(2)} L/min
        </Typography>
      </Box>

      <div
        style={{
          width: electroyteData["CR-FT-001"].width,
          height: "220px",
          position: "relative",
          backgroundColor: "#121E34",
          transform: "translate(110%, -5%) rotate(  90deg)",
        }}
      >
        <div
          style={{
            backgroundColor: "#09EAFC",
            width: "100%",
            height: `${(electroyteData["CR-FT-001"].value / 3500) * 1000}px`,
            position: "absolute",
            bottom: "0px",
          }}
        ></div>
      </div>
      <Box display="flex" justifyContent="center" alignItems="center" mb={10}>
        <Typography variant="h4" sx={{ color: "#00b0ff" }}>
          {data["CR-TT-002"]?.toFixed(1)} degC
        </Typography>
      </Box>
    </Box>
  );
};
export default Electrolyte;




// import React, { useEffect, useState } from 'react';
// import { Box, Typography, Button } from '@mui/material';
// import { green } from '@mui/material/colors';
// import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
// import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

// const ElectrolyteDashboard = () => {
//   const [data, setData] = useState({
//     "CR-FT-001": 0,  //CR-fT-001
//     flowPercentage: 0,
//     suctionOpen: true,
//     dischargeOpen: false,
//     "CR-TT-002": 0,
//     "CR-TT-002": 0,
//     "RECT-VT-001": 0,
//   });

//   useEffect(() => {
//     const ws = new WebSocket('wss://j3ffd3pw0l.execute-api.us-east-1.amazonaws.com/dev/');

//     ws.onopen = () => {
//       console.log('WebSocket connection established');
//     };

//     ws.onmessage = (event) => {
//       const message = JSON.parse(event.data);
//       console.log('Message received:', message);

//       setData(prevData => ({
//         ...prevData,
//         "CR-FT-001": message["CR-FT-001"] !== undefined ? message["CR-FT-001"] : prevData["CR-FT-001"],
//         flowPercentage: message.flowPercentage !== undefined ? message.flowPercentage : prevData.flowPercentage,
//         suctionOpen: message.suctionOpen !== undefined ? message.suctionOpen : prevData.suctionOpen,
//         dischargeOpen: message.dischargeOpen !== undefined ? message.dischargeOpen : prevData.dischargeOpen,
//         "CR-TT-002": message["CR-TT-002"] !== undefined ? message["CR-TT-002"] : prevData["CR-TT-002"],
//         "CR-TT-002": message["CR-TT-002"] !== undefined ? message["CR-TT-002"] : prevData["CR-TT-002"],
//         "RECT-VT-001": message["RECT-VT-001"] !== undefined ? message["RECT-VT-001"] : prevData["RECT-VT-001"],
//       }));
//     };

//     ws.onerror = (error) => {
//       console.error('WebSocket error:', error);
//     };

//     ws.onclose = () => {
//       console.log('WebSocket connection closed');
//     };

//     return () => {
//       ws.close();
//     };
//   }, []);

//   return (
//     <Box sx={{ borderRadius: 2, width: '300px' }}>
   
//       <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
//         <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#00b0ff' }}>
//           {data["CR-FT-001"].toFixed(2)} L/min
//         </Typography>
//       </Box>
//       <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
//         <Box sx={{ width: '100%', height: '25px', backgroundColor: '#555', overflow: 'hidden' }}>
//           <Box sx={{ width: `${data.flowPercentage}%`, height: '100%', backgroundColor: '#00b0ff' }}></Box>
//         </Box>
//       </Box>
//       <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
//         <Box display="flex" alignItems="center">
//           <Box sx={{ width: '30px', height: '30px', backgroundColor: green[500], borderRadius: '50%' }}></Box>
//           <Typography variant="body1" ml={1}>SUCTION OPEN</Typography>
//         </Box>
//         <Box display="flex" alignItems="center">
//           <Box sx={{ width: '30px', height: '30px', backgroundColor: green[500], borderRadius: '50%' }}></Box>
//           <Typography variant="body1" ml={1}>DISCHARGE OPEN</Typography>
//         </Box>
//       </Box>
//       <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
//         <Typography variant="h4" sx={{ color: '#00b0ff' }}>
//           {data["CR-TT-002"]?.toFixed(2)} degC
//         </Typography>
//       </Box>
//       <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
//         <Typography variant="body1" sx={{ color: data.temperatureChange >= 0 ? 'green' : 'red' }}>
//           {data.temperatureChange >= 0 ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
//           {data["CR-TT-002"]?.toFixed(2)} degC/h
//         </Typography>
//       </Box>
//       <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
//         <Typography variant="body1" sx={{ color: data.voltageChange >= 0 ? 'green' : 'red' }}>
//           {data.voltageChange >= 0 ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
//           {data["RECT-VT-001"]?.toFixed(2)} V/h
//         </Typography>
//       </Box>
//       <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
//         <Button variant="outlined" sx={{ color: '#00b0ff', borderColor: '#00b0ff' }}>Flow Control</Button>
//       </Box>
//     </Box>
//   );
// };

// export default ElectrolyteDashboard;




