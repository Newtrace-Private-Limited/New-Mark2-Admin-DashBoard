import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useWebSocket } from "src/WebSocketProvider";

const H2ProcessGas = ({ width, height }) => {
  const data = useWebSocket();
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const newChartData = chartData.slice();
    newChartData.push({
      time: new Date().toLocaleTimeString(),
      "PR-AT-001": data["PR-AT-001"] ?? 0,
      N2PercProcessGas: data["N2PercProcessGas"] ?? 0,
      "PR-AT-003": data["PR-AT-003"] ?? 0,
      H2OPPM: data["H2OPPM"] ?? 0,
    });
    setChartData(newChartData.slice(-10));
  }, [data]);

  // Prevent rendering if dimensions are missing
  if (!width || !height) return null;

  return (
    <Box sx={{ padding: 1, borderRadius: 2, width, height }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography className="text-[#09EAFC]" variant="h4">
            {data["H2PurityProcessGas"].toFixed(2)} %
          </Typography>
          <Typography>H2 Purity</Typography>
        </Box>
        <Box>
          <Typography className="text-[#09EAFC]" variant="h4">
            {data["PR-FT-001"].toFixed(2)} L/min
          </Typography>
          <Typography>Gas Flow-Rate</Typography>
        </Box>
        <Box>
          <Typography className="text-[#09EAFC]" variant="h4">
            {data.TotalizedFlowProcessGas.toFixed(2)} L
          </Typography>
          <Typography>Totalized Flow</Typography>
        </Box>
      </Box>
      <Box display="flex" flexDirection="row">
        <Box mt={5} sx={{ width: "150px" }}>
          <Typography variant="h5" gutterBottom className="text-[#00bcd4]">
            {data["PR-AT-001"].toFixed(2)} % H<sub>2</sub>
          </Typography>
          <Typography variant="h5" gutterBottom className="text-[#9c27b0]">
            {data["N2PercProcessGas"].toFixed(2)} % N<sub>2</sub>
          </Typography>
          <Typography variant="h5" gutterBottom className="text-[#ff5722]">
            {data["PR-AT-003"].toFixed(2)} ppm O<sub>2</sub>
          </Typography>
          <Typography variant="h5" gutterBottom className="text-[#4caf50]">
            {data["H2OPPM"].toFixed(2)} ppm H<sub>2</sub>O
          </Typography>
        </Box>
        <Box mt={2} width="100%" height={height - 50} position="relative">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="PR-AT-001" stroke="#00bcd4" />
              <Line type="monotone" dataKey="N2PercProcessGas" stroke="#9c27b0" />
              <Line type="monotone" dataKey="PR-AT-003" stroke="#ff5722" />
              <Line type="monotone" dataKey="H2OPPM" stroke="#4caf50" />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Box>
  );
};

export default H2ProcessGas;



// import React, { useEffect, useState } from "react";
// import { Box, Button, Typography } from "@mui/material";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";
// import { useWebSocket } from "src/WebSocketProvider";

// const H2ProcessGas = () => {
//   const data = useWebSocket();

//   const [chartData, setChartData] = useState([]);

//   useEffect(() => {
//     const newChartData = chartData.slice();
//     newChartData.push({
//       time: new Date().toLocaleTimeString(),
//       "PR-AT-001": data["PR-AT-001"] ?? 0,
//       N2PercProcessGas: data["N2PercProcessGas"] ?? 0,
//       "PR-AT-003": data["PR-AT-003"] ?? 0,
//       H2OPPM: data["H2OPPM"] ?? 0,
//     });

//     setChartData(newChartData.slice(-10)); // Keep only the last 10 data points
//   }, [data]);

//   return (
//     <Box sx={{ padding: 1, borderRadius: 2 }}>
//       <Box display="flex" justifyContent="space-between" alignItems="center">
//         <Box>
//           <Typography className="text-[#09EAFC]" variant="h4">
//             {" "}
//             {data["H2PurityProcessGas"].toFixed(2)} %
//           </Typography>
//           <Typography>H2 Purity</Typography>
//         </Box>
//         <Box>
//           <Typography className="text-[#09EAFC]" variant="h4">
//             {data["PR-FT-001"].toFixed(2)} L/min
//           </Typography>
//           <Typography>Gas Flow-Rate</Typography>
//         </Box>
//         <Box>
//           <Typography className="text-[#09EAFC]" variant="h4">
//             {data.TotalizedFlowProcessGas.toFixed(2)} L
//           </Typography>
//           <Typography>Totalized Flow</Typography>
//         </Box>
//       </Box>
//       <Box className="flex flex-row">
//         <Box mt={5} sx={{ width: "150px" }}>
//           <Typography variant="h5" gutterBottom className="text-[#00bcd4] ">
//             {data["PR-AT-001"].toFixed(2)} % H<sub>2</sub>{" "}
//           </Typography>
//           <Typography variant="h5" gutterBottom className="text-[#9c27b0]">
//             {data["N2PercProcessGas"].toFixed(2)} % N<sub>2</sub>
//           </Typography>
//           <Typography variant="h5" gutterBottom className="text-[#ff5722]">
//             {data["PR-AT-003"].toFixed(2)} % ppm O<sub>2</sub>
//           </Typography>
//           <Typography variant="h5" gutterBottom className="text-[#4caf50]">
//             {data["H2OPPM"].toFixed(2)} ppm H<sub>2</sub>O
//           </Typography>
//         </Box>
//         <Box mt={2} width="100%" height={250} position={"relative"}>
//           <ResponsiveContainer width="100%" height={250} className="mt-2">
//             <LineChart data={chartData}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="time" stroke="#ccc" />
//               <YAxis stroke="#ccc" />
//               <Tooltip />
//               <Legend />
//               <Line type="monotone" dataKey="PR-AT-001" stroke="#00bcd4" />
//               <Line
//                 type="monotone"
//                 dataKey="N2PercProcessGas"
//                 stroke="#9c27b0"
//               />
//               <Line type="monotone" dataKey="PR-AT-003" stroke="#ff5722" />
//               <Line type="monotone" dataKey="H2OPPM" stroke="#4caf50" />
//             </LineChart>
//           </ResponsiveContainer>
//         </Box>
//       </Box>
//     </Box>
//   );
// };

// export default H2ProcessGas;
