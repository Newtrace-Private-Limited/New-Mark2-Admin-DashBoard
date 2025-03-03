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

const H2RawGas = ({ width, height }) => {
  const data = useWebSocket();
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const newChartData = chartData.slice();
    newChartData.push({
      time: new Date().toLocaleTimeString(),
      "H2PerRawGas": data["H2PerRawGas"] ?? 0,
      "N2PerRawsGas": data["N2PerRawsGas"] ?? 0,
      "GS-AT-012": data["GS-AT-012"] ?? 0,
      "H20PerRawGas": data["H20PerRawGas"] ?? 0,
    });
    setChartData(newChartData.slice(-10));
  }, [data]);

  // Prevent rendering if dimensions are 0
  if (!width || !height) return null;

  return (
    <Box sx={{ padding: 1, borderRadius: 2, width, height }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography className="text-[#09EAFC]" variant="h4">
            {data.Value8} %
          </Typography>
          <Typography>H2 Purity</Typography>
        </Box>
        <Box>
          <Typography className="text-[#09EAFC]" variant="h4">
            {data.Value17.toFixed(2)} L/min
          </Typography>
          <Typography>Gas Flow-Rate</Typography>
        </Box>
        <Box>
          <Typography className="text-[#09EAFC]" variant="h4">
            {data.TotalizedFlowRawGas.toFixed(2)} L
          </Typography>
          <Typography>Totalized Flow</Typography>
        </Box>
      </Box>
      <Box display="flex" flexDirection="row" mt={2}>
        <Box mt={5} sx={{ width: "90px" }}>
          <Typography variant="h5" className="text-[#00bcd4] font-bold">
            {data["H2PerRawGas"].toFixed(2)} % H<sub>2</sub>
          </Typography>
          <Typography variant="h5" className="text-[#9c27b0] font-bold">
            {data["N2PerRawsGas"].toFixed(2)} % N<sub>2</sub>
          </Typography>
          <Typography variant="h5" className="text-[#ff5722]">
            {data["GS-AT-012"].toFixed(2)} % O<sub>2</sub>
          </Typography>
          <Typography variant="h5" className="text-[#4caf50]">
            {data["H20PerRawGas"].toFixed(2)} % H<sub>2</sub>O
          </Typography>
        </Box>
        <Box width="100%" height={height - 50} position="relative">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="H2PerRawGas" stroke="#00bcd4" />
              <Line type="monotone" dataKey="N2PerRawsGas" stroke="#9c27b0" />
              <Line type="monotone" dataKey="GS-AT-012" stroke="#ff5722" />
              <Line type="monotone" dataKey="H20PerRawGas" stroke="#4caf50" />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    </Box>
  );
};

export default H2RawGas;



// import React, { useEffect, useState } from "react";
// import { Box, Typography } from "@mui/material";
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

// const H2RawGas = () => {
//   const data = useWebSocket();

//   const [chartData, setChartData] = useState([]);

//   useEffect(() => {
//     const newChartData = chartData.slice();
//     newChartData.push({
//       time: new Date().toLocaleTimeString(),
//       "H2PerRawGas": data["H2PerRawGas"] ?? 0,
//       "N2PerRawsGas": data["N2PerRawsGas"] ?? 0,
//       "GS-AT-012": data["GS-AT-012"] ?? 0,
//       "H20PerRawGas": data["H20PerRawGas"] ?? 0,
//     });

//     setChartData(newChartData.slice(-10)); // Keep only the last 10 data points
//   }, [data]);

//   return (
//     <Box sx={{ padding: 1, borderRadius: 2 }}>
//       <Box display="flex" justifyContent="space-between" alignItems="center">
//         <Box>
//           <Typography className="text-[#09EAFC]" variant="h4">
//             {data.Value8} %
//           </Typography>
//           <Typography>H2 Purity</Typography>
//         </Box>
//         <Box>
//           <Typography className="text-[#09EAFC]" variant="h4">
//             {data.Value17.toFixed(2)} L/min
//           </Typography>
//           <Typography>Gas Flow-Rate</Typography>
//         </Box>
//         <Box>
//           <Typography className="text-[#09EAFC]" variant="h4">
//             {data.TotalizedFlowRawGas.toFixed(2)} L
//           </Typography>
//           <Typography>Totalized Flow</Typography>
//         </Box>
//       </Box>
//       <Box className="flex flex-row ">
//         <Box mt={5}  sx={{ width: '90px',  }}>
//           <Typography variant="h5" gutterBottom  className="text-[#00bcd4] font-bold ">
//             {data["H2PerRawGas"].toFixed(2)} %  H<sub>2</sub>
//           </Typography>
//           <Typography variant="h5" gutterBottom  className="text-[#9c27b0] font-bold">
//            {data["N2PerRawsGas"].toFixed(2)} %  N<sub>2</sub>
//           </Typography>
//           <Typography variant="h5" gutterBottom  className="text-[#ff5722]">
//            {data["GS-AT-012"].toFixed(2)} % O<sub>2</sub>
//           </Typography>
//           <Typography variant="h5" gutterBottom  className="text-[#4caf50]">
//              {data["H20PerRawGas"].toFixed(2)} % H<sub>2</sub>O
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
//               <Line type="monotone" dataKey="H2PerRawGas" stroke="#00bcd4" />
//               <Line type="monotone" dataKey="N2PerRawsGas" stroke="#9c27b0" />
//               <Line type="monotone" dataKey="GS-AT-012" stroke="#ff5722" />
//               <Line type="monotone" dataKey="H20PerRawGas" stroke="#4caf50" />
//             </LineChart>
//           </ResponsiveContainer>
//         </Box>
//       </Box>
//     </Box>
//   );
// };

// export default H2RawGas;

