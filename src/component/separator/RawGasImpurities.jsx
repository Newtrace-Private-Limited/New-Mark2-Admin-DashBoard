import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Box, Typography } from '@mui/material';
import { useWebSocket } from 'src/WebSocketProvider';

const RawGasImpurities = ({ width, height }) => {
  const data = useWebSocket();
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const newChartData = chartData.slice();
    newChartData.push({
      time: new Date().toLocaleTimeString(),
      'GS-AT-012': data['GS-AT-012'] ?? 0,
      'GS-AT-022': data['GS-AT-022'] ?? 0,
    });
    setChartData(newChartData.slice(-10)); // Keep only the last 10 data points
  }, [data]);

  const { 'GS-AT-012': GSAT012 = 0, 'GS-AT-022': GSAT022 = 0 } = data;

  // Prevent rendering if dimensions are missing
  if (!width || !height) return null;

  return (
    <Box sx={{ borderRadius: 2, width, height }}>
      <Box display="flex" alignItems="center" className="pl-16 relative bottom-8">
        <Box sx={{ width: '100%', height: '12px', backgroundColor: '#555', overflow: 'hidden' }}>
          <Box sx={{ width: `${GSAT012.toFixed(0)}%`, height: '100%', backgroundColor: '#00b0ff' }}></Box>
        </Box>
        <Box minWidth={35} ml={1} color="#09EAFC" className="flex gap-10">
          <Typography variant="body2">{`${GSAT012.toFixed(1)} %O2 in H2`}</Typography>
        </Box>
      </Box>

      <Box display="flex" alignItems="center" mt={2} className="pl-16 relative bottom-8">
        <Box sx={{ width: '100%', height: '12px', backgroundColor: '#555', overflow: 'hidden' }}>
          <Box sx={{ width: `${GSAT022.toFixed(0)}%`, height: '100%', backgroundColor: '#3333FF' }}></Box>
        </Box>
        <Box minWidth={35} ml={1} color="#3333FF" className="flex gap-10">
          <Typography variant="body2">{`${GSAT022.toFixed(1)} %H2 in O2`}</Typography>
        </Box>
      </Box>

      <ResponsiveContainer width="100%" height={height - 50}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" stroke="#ccc" />
          <YAxis stroke="#ccc" />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="GS-AT-012" stroke="#00bcd4" />
          <Line type="monotone" dataKey="GS-AT-022" stroke="#3333FF" />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default RawGasImpurities;



// import React, { useState, useEffect } from 'react';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import { Box, Typography } from '@mui/material';
// import { useWebSocket } from 'src/WebSocketProvider';

// const RawGasImpurities = ({ width, height }) => {
//   const data = useWebSocket();
//   const [chartData, setChartData] = useState([]);

//   useEffect(() => {
//     const newChartData = chartData.slice();
//     newChartData.push({
//       time: new Date().toLocaleTimeString(),
//       'GS-AT-012': data['GS-AT-012'] ?? 0,
//       'GS-AT-022': data['GS-AT-022'] ?? 0,
//     });
//     setChartData(newChartData.slice(-10));
//   }, [data]);

//   const { 'GS-AT-012': GSAT012 = 0, 'GS-AT-022': GSAT022 = 0 } = data;

//   return (
//     <Box sx={{ borderRadius: 2, width, height }}>
//       <Box display="flex" alignItems="center" className="pl-16 relative bottom-8">
//         <Box sx={{ width: '100%', height: '12px', backgroundColor: '#555', overflow: 'hidden' }}>
//           <Box sx={{ width: `${GSAT012.toFixed(0)}%`, height: '100%', backgroundColor: '#00b0ff' }}></Box>
//         </Box>
//         <Box minWidth={35} ml={1} color="#09EAFC">
//           <Typography variant="body2">{`${GSAT012.toFixed(1)} %O2 in H2`}</Typography>
//         </Box>
//       </Box>

//       <Box display="flex" alignItems="center" mt={2} className="pl-16 relative bottom-8">
//         <Box sx={{ width: '100%', height: '12px', backgroundColor: '#555', overflow: 'hidden' }}>
//           <Box sx={{ width: `${GSAT022.toFixed(0)}%`, height: '100%', backgroundColor: '#3333FF' }}></Box>
//         </Box>
//         <Box minWidth={35} ml={1} color="#3333FF">
//           <Typography variant="body2">{`${GSAT022.toFixed(1)} %H2 in O2`}</Typography>
//         </Box>
//       </Box>

//       <ResponsiveContainer width="100%" height={height - 50}>
//         <LineChart data={chartData}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="time" stroke="#ccc" />
//           <YAxis stroke="#ccc" />
//           <Tooltip />
//           <Legend />
//           <Line type="monotone" dataKey="GS-AT-012" stroke="#00bcd4" />
//           <Line type="monotone" dataKey="GS-AT-022" stroke="#3333FF" />
//         </LineChart>
//       </ResponsiveContainer>
//     </Box>
//   );
// };

// export default RawGasImpurities;



// import React, { useState, useEffect } from 'react';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import { Box, Typography } from '@mui/material';
// import { useWebSocket } from 'src/WebSocketProvider';
  
// const  RawGasImpurities = () => {
//   const data = useWebSocket();

//   const [chartData, setChartData] = useState([
//   ]);

//   useEffect(() => {
//     const newChartData = chartData.slice();
//     newChartData.push({
//       time: new Date().toLocaleTimeString(),
//       'GS-AT-012': data['GS-AT-012'] ?? 0,
//       'GS-AT-022': data['GS-AT-022'] ?? 0,
//     });

//     setChartData(newChartData.slice(-10)); // Keep only the last 10 data points
//   }, [data]);

//   const { 'GS-AT-012': GSAT012 = 0, 'GS-AT-022': GSAT022 = 0 } = data;

//   return (
//     <Box sx={{ borderRadius: 2 }}>
//       <Box display="flex" alignItems="center" className="pl-16 relative bottom-8">
//         <Box sx={{ width: '350px', height: '12px', backgroundColor: '#555', overflow: 'hidden' }}>
//           <Box sx={{ width: `${GSAT012.toFixed(0)}%`, height: '100%', backgroundColor: '#00b0ff' }}></Box>
//         </Box>
//         <Box minWidth={35} ml={1} color="#09EAFC" className="flex gap-10">
//           <Typography variant="body2">{`${GSAT012.toFixed(1)} %O2 in H2`}</Typography>
 
//         </Box>
//       </Box>

//       <Box display="flex" alignItems="center" mt={2} className="pl-16 relative bottom-8">
//         <Box sx={{ width: '350px', height: '12px', backgroundColor: '#555', overflow: 'hidden' }}>
//           <Box sx={{ width: `${GSAT022.toFixed(0)}%`, height: '100%', backgroundColor: '#3333FF' }}></Box>
//         </Box>
//         <Box minWidth={35} ml={1} color="#3333FF" className="flex gap-10">
//           <Typography variant="body2">{`${GSAT022.toFixed(1)} %H2 in O2`}</Typography>
       
//         </Box>
//       </Box>

//       <ResponsiveContainer width="100%" height={200} className="mt-2">
//         <LineChart data={chartData}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="time" stroke="#ccc" />
//           <YAxis stroke="#ccc" />
//           <Tooltip />
//           <Legend />
//           <Line type="monotone" dataKey="GS-AT-012" stroke="#00bcd4" />
//           <Line type="monotone" dataKey="GS-AT-022" stroke="#3333FF" />
//         </LineChart>
//       </ResponsiveContainer>
//     </Box>
//   );
// };

// export default RawGasImpurities;
