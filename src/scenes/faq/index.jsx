import React, { useRef, useState } from "react";
import { createChart } from "lightweight-charts";
import {
  Box,
  Button,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import axios from "axios";
import { format } from "date-fns";

const CustomCharts = () => {
  const chartsRef = useRef({});
  const [charts, setCharts] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentChartId, setCurrentChartId] = useState(null);
  const [yAxisConfig, setYAxisConfig] = useState([
    { id: "yAxis-0", dataKey: "CW-TT-011", color: "#0088FE" },
  ]);
  const dataKeys = [
    "AX-LT-011",
    "AX-LT-021",
    "CW-TT-011",
    "CW-TT-021",
    "CR-LT-011",
    "CR-PT-011",
  ];
  const fetchAndDisplayData = async (chartId, startDate, endDate) => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }
    const formattedStartDate = format(startDate, "yyyy-MM-dd'T'HH:mm");
    const formattedEndDate = format(endDate, "yyyy-MM-dd'T'HH:mm");

    try {
      const response = await axios.post(
        "",
        { start_time: formattedStartDate, end_time: formattedEndDate }
      );

      const fetchedData = response.data.data.map((item) => ({
        time: Math.floor(new Date(item.timestamp).getTime() / 1000),
        ...item.device_data,
      }));
      const chartInstance = chartsRef.current[chartId];
      if (chartInstance) {
        chartInstance.series.forEach((series, index) => {
          const yAxis = chartInstance.yAxisDataKeys[index];
          const seriesData = fetchedData.map((dataPoint) => ({
            time: dataPoint.time,
            value: dataPoint[yAxis.dataKey],
          }));
          series.setData(seriesData);
        });
      }
    } catch (error) {
      console.error("Error fetching data for chart:", chartId, error);
    }
  };
  const addChart = () => {
    const chartId = Date.now();
    const newChart = {
      id: chartId,
      type: "Line",
      yAxisDataKeys: [{ id: "yAxis-0", dataKey: "CW-TT-011", color: "#0088FE" }],
      timeRange: { start: "", end: "" },
    };

    setCharts([...charts, newChart]);

    setTimeout(() => {
      const container = document.getElementById(`chart-container-${chartId}`);
      if (container) {
        const chartInstance = createChart(container, {
          width: container.clientWidth,
          height: 300,
        });
        const seriesInstances = newChart.yAxisDataKeys.map((yAxis) =>
          chartInstance.addLineSeries({ color: yAxis.color, lineWidth: 2 })
        );

        chartsRef.current[chartId] = {
          instance: chartInstance,
          series: seriesInstances,
          yAxisDataKeys: newChart.yAxisDataKeys,
        };
      }
    }, 0);
  };

  const openConfigureDialog = (chartId) => {
    setCurrentChartId(chartId);
    const chart = charts.find((c) => c.id === chartId);
    setYAxisConfig(chart.yAxisDataKeys);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setCurrentChartId(null);
    setYAxisConfig([]);
  };

  const updateYAxisConfig = () => {
    const chartInstance = chartsRef.current[currentChartId];
  
    if (chartInstance) {
      // Clear the existing series from the chart
      chartInstance.series.forEach((series) => {
        chartInstance.instance.removeSeries(series);
      });
  
      // Add new series based on the updated yAxisConfig
      const newSeriesInstances = yAxisConfig.map((yAxis) =>
        chartInstance.instance.addLineSeries({
          color: yAxis.color,
          lineWidth: 2,
        })
      );
  
      // Update the chart instance
      chartInstance.series = newSeriesInstances;
      chartInstance.yAxisDataKeys = yAxisConfig;
    }
  
    // Update the charts state
    setCharts((prevCharts) =>
      prevCharts.map((chart) =>
        chart.id === currentChartId
          ? { ...chart, yAxisDataKeys: yAxisConfig }
          : chart
      )
    );
  
    closeDialog();
  };
  

  const addYAxis = () => {
    const newYAxis = {
      id: `yAxis-${yAxisConfig.length}`,
      dataKey: dataKeys[0],
      color: "#FF5733",
    };
    setYAxisConfig([...yAxisConfig, newYAxis]);
  };

  const updateYAxisKey = (index, newKey) => {
    const updatedYAxisConfig = [...yAxisConfig];
    updatedYAxisConfig[index].dataKey = newKey;
    setYAxisConfig(updatedYAxisConfig);
  };

  return (
    <div>
      <h1>New Custom Lightweight Charts</h1>

      <Box mb={2}>
        <Button variant="contained" color="primary" onClick={addChart}>
          Add Custom Chart
        </Button>
      </Box>

      {charts.map((chart) => (
        <Box key={chart.id} mb={4}>
          <Typography variant="h6">Chart {chart.id}</Typography>
          <div id={`chart-container-${chart.id}`} style={{ width: "100%", height: 300 }}></div>

          <Box display="flex" gap={2} mt={2}>
            <TextField
              type="datetime-local"
              label="Start Date"
              value={chart.timeRange.start}
              onChange={(e) =>
                setCharts((prevCharts) =>
                  prevCharts.map((c) =>
                    c.id === chart.id
                      ? { ...c, timeRange: { ...c.timeRange, start: e.target.value } }
                      : c
                  )
                )
              }
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              type="datetime-local"
              label="End Date"
              value={chart.timeRange.end}
              onChange={(e) =>
                setCharts((prevCharts) =>
                  prevCharts.map((c) =>
                    c.id === chart.id
                      ? { ...c, timeRange: { ...c.timeRange, end: e.target.value } }
                      : c
                  )
                )
              }
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>

          <Box display="flex" gap={2} mt={2}>
            <Button
              variant="contained"
              color="secondary"
              onClick={() =>
                fetchAndDisplayData(chart.id, new Date(chart.timeRange.start), new Date(chart.timeRange.end))
              }
            >
              Fetch Data
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => openConfigureDialog(chart.id)}
            >
              Configure Charts
            </Button>
          </Box>
        </Box>
      ))}

      <Dialog open={isDialogOpen} onClose={closeDialog}>
        <DialogTitle>Configure Y-Axis</DialogTitle>
        <DialogContent>
          {yAxisConfig.map((yAxis, index) => (
            <Box key={yAxis.id} display="flex" gap={2} mb={2} alignItems="center">
              <Typography>Y-Axis {index + 1}:</Typography>
              <FormControl>
                <InputLabel>Data Key</InputLabel>
                <Select
                  value={yAxis.dataKey}
                  onChange={(e) => updateYAxisKey(index, e.target.value)}
                >
                  {dataKeys.map((key) => (
                    <MenuItem key={key} value={key}>
                      {key}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          ))}
          <Button variant="outlined" onClick={addYAxis}>
            Add Y-Axis
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button onClick={updateYAxisConfig} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CustomCharts;


// import React, { useRef, useState } from "react";
// import { createChart } from "lightweight-charts";
// import {
//   Box,
//   Button,
//   Typography,
//   TextField,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Select,
//   MenuItem,
//   FormControl,
//   InputLabel,
// } from "@mui/material";
// import axios from "axios";
// import { format } from "date-fns";

// const CustomCharts = () => {
//   const chartsRef = useRef({});
//   const [charts, setCharts] = useState([]);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [currentChartId, setCurrentChartId] = useState(null);
//   const [yAxisConfig, setYAxisConfig] = useState([
//     { id: "yAxis-0", dataKey: "AX-LT-011", color: "#0088FE" },
//   ]);
//   const dataKeys = [
//     "AX-LT-011",
//     "AX-LT-021",
//     "CW-TT-011",
//     "CW-TT-021",
//     "CR-LT-011",
//     "CR-PT-011",
//   ];

//   const fetchAndDisplayData = async (chartId, startDate, endDate) => {
//     if (!startDate || !endDate) {
//       alert("Please select both start and end dates.");
//       return;
//     }
  
//     const formattedStartDate = format(startDate, "yyyy-MM-dd'T'HH:mm");
//     const formattedEndDate = format(endDate, "yyyy-MM-dd'T'HH:mm");
  
//     try {
//       const response = await axios.post(
//         "https://3di0yc14j3.execute-api.us-east-1.amazonaws.com/dev/iot-data",
//         { start_time: formattedStartDate, end_time: formattedEndDate }
//       );
  
//       const fetchedData = response.data.data.map((item) => ({
//         time: Math.floor(new Date(item.timestamp).getTime() / 1000), // Convert timestamp to UNIX seconds
//         ...item.device_data, // Spread device data for keys like AX-LT-011
//       }));
  
//       const chartInstance = chartsRef.current[chartId];
//       if (chartInstance) {
//         chartInstance.fetchedData = fetchedData; // Store the fetched data for reuse
  
//         chartInstance.series.forEach((series, index) => {
//           const yAxis = chartInstance.yAxisDataKeys[index];
//           if (yAxis.dataKeys.length > 0) {
//             const seriesData = fetchedData.map((dataPoint) => ({
//               time: dataPoint.time,
//               value: dataPoint[yAxis.dataKeys[0]], // Get value for specific key
//             }));
//             series.setData(seriesData);
//           }
//         });
//       }
//     } catch (error) {
//       console.error("Error fetching data for chart:", chartId, error);
//     }
//   };
  
  

//   const addChart = () => {
//     const chartId = Date.now();
//     const newChart = {
//       id: chartId,
//       type: "Line",
//       yAxisDataKeys: [{ id: "yAxis-0", dataKey: "AX-LT-011", color: "#0088FE" }],
//       timeRange: { start: "", end: "" },
//     };

//     setCharts([...charts, newChart]);

//     setTimeout(() => {
//       const container = document.getElementById(`chart-container-${chartId}`);
//       if (container) {
//         const chartInstance = createChart(container, {
//           width: container.clientWidth,
//           height: 300,
//         });
//         const seriesInstances = newChart.yAxisDataKeys.map((yAxis) =>
//           chartInstance.addLineSeries({ color: yAxis.color, lineWidth: 2 })
//         );

//         chartsRef.current[chartId] = {
//           instance: chartInstance,
//           series: seriesInstances,
//           yAxisDataKeys: newChart.yAxisDataKeys,
//         };
//       }
//     }, 0);
//   };

//   const openConfigureDialog = (chartId) => {
//     setCurrentChartId(chartId);
//     const chart = charts.find((c) => c.id === chartId);
//     setYAxisConfig(chart.yAxisDataKeys);
//     setIsDialogOpen(true);
//   };

//   const closeDialog = () => {
//     setIsDialogOpen(false);
//     setCurrentChartId(null);
//     setYAxisConfig([]);
//   };

//   const updateYAxisConfig = () => {
//     const chartInstance = chartsRef.current[currentChartId];
  
//     if (chartInstance) {
//       // Extract existing keys already added to the chart
//       const existingKeys = chartInstance.yAxisDataKeys.map((yAxis) => yAxis.id);
  
//       // Filter the new Y-axis configurations to add (from `yAxisConfig`)
//       const newYAxisConfig = yAxisConfig.filter((yAxis) => !existingKeys.includes(yAxis.id));
  
//       // Add new Y-axes to the chart
//       newYAxisConfig.forEach((yAxis) => {
//         const newSeries = chartInstance.instance.addLineSeries({
//           color: yAxis.color,
//           lineWidth: 2,
//         });
  
//         // Use existing fetched data to set series data
//         const seriesData = chartInstance.fetchedData.map((dataPoint) => ({
//           time: dataPoint.time,
//           value: dataPoint[yAxis.dataKeys[0]], // Get value for the new data key
//         }));
  
//         newSeries.setData(seriesData);
  
//         // Update the chart instance with the new series
//         chartInstance.series.push(newSeries);
//         chartInstance.yAxisDataKeys.push(yAxis);
//       });
//     }
  
//     // Update the state with the new Y-axis configuration
//     setCharts((prevCharts) =>
//       prevCharts.map((chart) =>
//         chart.id === currentChartId
//           ? { ...chart, yAxisDataKeys: [...chart.yAxisDataKeys, ...yAxisConfig] }
//           : chart
//       )
//     );
  
//     // Close the dialog after saving
//     closeDialog();
//   };
  
  
  
  
//   const addYAxis = () => {
//     const newYAxis = {
//       id: `yAxis-${yAxisConfig.length}`,
//       dataKey: dataKeys[0],
//       color: "#FF5733",
//     };
//     setYAxisConfig([...yAxisConfig, newYAxis]);
//   };

//   const updateYAxisKey = (index, newKey) => {
//     const updatedYAxisConfig = [...yAxisConfig];
//     updatedYAxisConfig[index].dataKey = newKey;
//     setYAxisConfig(updatedYAxisConfig);
//   };

//   return (
//     <div>
//       <h1>Custom Lightweight Charts</h1>

//       <Box mb={2}>
//         <Button variant="contained" color="primary" onClick={addChart}>
//           Add Custom Chart
//         </Button>
//       </Box>

//       {charts.map((chart) => (
//         <Box key={chart.id} mb={4}>
//           <Typography variant="h6">Chart {chart.id}</Typography>
//           <div id={`chart-container-${chart.id}`} style={{ width: "100%", height: 300 }}></div>

//           <Box display="flex" gap={2} mt={2}>
//             <TextField
//               type="datetime-local"
//               label="Start Date"
//               value={chart.timeRange.start}
//               onChange={(e) =>
//                 setCharts((prevCharts) =>
//                   prevCharts.map((c) =>
//                     c.id === chart.id
//                       ? { ...c, timeRange: { ...c.timeRange, start: e.target.value } }
//                       : c
//                   )
//                 )
//               }
//               InputLabelProps={{
//                 shrink: true,
//               }}
//             />
//             <TextField
//               type="datetime-local"
//               label="End Date"
//               value={chart.timeRange.end}
//               onChange={(e) =>
//                 setCharts((prevCharts) =>
//                   prevCharts.map((c) =>
//                     c.id === chart.id
//                       ? { ...c, timeRange: { ...c.timeRange, end: e.target.value } }
//                       : c
//                   )
//                 )
//               }
//               InputLabelProps={{
//                 shrink: true,
//               }}
//             />
//           </Box>

//           <Box display="flex" gap={2} mt={2}>
//             <Button
//               variant="contained"
//               color="secondary"
//               onClick={() =>
//                 fetchAndDisplayData(chart.id, new Date(chart.timeRange.start), new Date(chart.timeRange.end))
//               }
//             >
//               Fetch Data
//             </Button>
//             <Button
//               variant="contained"
//               color="primary"
//               onClick={() => openConfigureDialog(chart.id)}
//             >
//               Configure Charts
//             </Button>
//           </Box>
//         </Box>
//       ))}

//       <Dialog open={isDialogOpen} onClose={closeDialog}>
//         <DialogTitle>Configure Y-Axis</DialogTitle>
//         <DialogContent>
//           {yAxisConfig.map((yAxis, index) => (
//             <Box key={yAxis.id} display="flex" gap={2} mb={2} alignItems="center">
//               <Typography>Y-Axis {index + 1}:</Typography>
//               <FormControl>
//                 <InputLabel>Data Key</InputLabel>
//                 <Select
//                   value={yAxis.dataKey}
//                   onChange={(e) => updateYAxisKey(index, e.target.value)}
//                 >
//                   {dataKeys.map((key) => (
//                     <MenuItem key={key} value={key}>
//                       {key}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Box>
//           ))}
//           <Button variant="outlined" onClick={addYAxis}>
//             Add Y-Axis
//           </Button>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={closeDialog}>Cancel</Button>
//           <Button onClick={updateYAxisConfig} color="primary">
//             Save
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </div>
//   );
// };

// export default CustomCharts;


// import React, { useRef, useState } from "react";
// import { createChart } from "lightweight-charts";
// import {
//   Box,
//   Button,
//   Typography,
//   TextField,
// } from "@mui/material";
// import axios from "axios";
// import { format } from "date-fns";

// const CustomCharts = () => {
//   const chartsRef = useRef({});
//   const [charts, setCharts] = useState([]);

//   const fetchAndDisplayData = async (chartId, startDate, endDate) => {
//     if (!startDate || !endDate) {
//       alert("Please select both start and end dates.");
//       return;
//     }
  
//     const formattedStartDate = format(startDate, "yyyy-MM-dd'T'HH:mm");
//     const formattedEndDate = format(endDate, "yyyy-MM-dd'T'HH:mm");
  
//     try {
//       const response = await axios.post(
//         "https://3di0yc14j3.execute-api.us-east-1.amazonaws.com/dev/iot-data",
//         { start_time: formattedStartDate, end_time: formattedEndDate }
//       );
  
//       // No need for JSON.parse; directly access `response.data`
//       const fetchedData = response.data.data.map((item) => ({
//         time: Math.floor(new Date(item.timestamp).getTime() / 1000), // Convert timestamp to UNIX seconds
//         ...item.device_data, // Spread device data for keys like AX-LT-011
//       }));
  
//       // Update the chart's series with the fetched data
//       const chartInstance = chartsRef.current[chartId];
//       if (chartInstance) {
//         chartInstance.series.forEach((series, index) => {
//           const yAxis = chartInstance.yAxisDataKeys[index];
//           const seriesData = fetchedData.map((dataPoint) => ({
//             time: dataPoint.time, // UNIX timestamp
//             value: dataPoint[yAxis.dataKeys[0]], // Get value for specific key (e.g., AX-LT-011)
//           }));
//           series.setData(seriesData);
//         });
//       }
//     } catch (error) {
//       console.error("Error fetching data for chart:", chartId, error);
//     }
//   };
  

//   const addChart = () => {
//     const chartId = Date.now();
//     const newChart = {
//       id: chartId,
//       type: "Line",
//       yAxisDataKeys: [
//         {
//           id: `yAxis-0`,
//           dataKeys: ["AX-LT-011"], // Default data key
//           color: "#0088FE",
//         },
//       ],
//       timeRange: { start: "", end: "" }, // Initialize time range
//     };

//     setCharts([...charts, newChart]);

//     setTimeout(() => {
//       const container = document.getElementById(`chart-container-${chartId}`);
//       if (container) {
//         const chartInstance = createChart(container, {
//           width: container.clientWidth,
//           height: 300,
//         });
//         const seriesInstances = newChart.yAxisDataKeys.map((yAxis) =>
//           chartInstance.addLineSeries({
//             color: yAxis.color,
//             lineWidth: 2,
//           })
//         );

//         chartsRef.current[chartId] = {
//           instance: chartInstance,
//           series: seriesInstances,
//           yAxisDataKeys: newChart.yAxisDataKeys,
//         };
//       }
//     }, 0);
//   };

//   const updateTimeRange = (chartId, field, value) => {
//     setCharts((prevCharts) =>
//       prevCharts.map((chart) =>
//         chart.id === chartId
//           ? { ...chart, timeRange: { ...chart.timeRange, [field]: value } }
//           : chart
//       )
//     );
//   };

//   return (
//     <div>
//       <h1>Custom Lightweight Charts</h1>

//       <Box mb={2}>
//         <Button variant="contained" color="primary" onClick={addChart}>
//           Add Custom Chart
//         </Button>
//       </Box>

//       {charts.map((chart) => (
//         <Box key={chart.id} mb={4}>
//           <Typography variant="h6">Chart {chart.id}</Typography>
//           <div id={`chart-container-${chart.id}`} style={{ width: "100%", height: 300 }}></div>

//           <Box display="flex" gap={2} mt={2}>
//             <TextField
//               type="datetime-local"
//               label="Start Date"
//               value={chart.timeRange.start}
//               onChange={(e) =>
//                 updateTimeRange(chart.id, "start", e.target.value)
//               }
//               InputLabelProps={{
//                 shrink: true,
//               }}
//             />
//             <TextField
//               type="datetime-local"
//               label="End Date"
//               value={chart.timeRange.end}
//               onChange={(e) =>
//                 updateTimeRange(chart.id, "end", e.target.value)
//               }
//               InputLabelProps={{
//                 shrink: true,
//               }}
//             />
//           </Box>
//           <Button
//             variant="contained"
//             color="secondary"
//             onClick={() =>
//               fetchAndDisplayData(chart.id, new Date(chart.timeRange.start), new Date(chart.timeRange.end))
//             }
//             sx={{ mt: 2 }}
//           >
//             Fetch Data
//           </Button>
//         </Box>
//       ))}
//     </div>
//   );
// };
// export default CustomCharts;


// import React, { useEffect, useRef, useState } from "react";
// import { createChart } from "lightweight-charts";
// import {
//   Box,
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   Typography,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
// } from "@mui/material";
// import { SketchPicker } from "react-color";

// const CustomCharts = () => {
//   const chartsRef = useRef({});
//   const tooltipsRef = useRef({});
//   const [charts, setCharts] = useState([]);
//   const [tempChartConfig, setTempChartConfig] = useState(null);
//   const [chartDialogOpen, setChartDialogOpen] = useState(false);
//   const [colorPickerOpen, setColorPickerOpen] = useState(false);
//   const [selectedYAxisId, setSelectedYAxisId] = useState(null);

//   const wsUrl = "wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/";

//   // WebSocket for real-time updates
//   useEffect(() => {
//     const ws = new WebSocket(wsUrl);

//     ws.onmessage = (event) => {
//       try {
//         const message = JSON.parse(event.data);
//         const timestamp = message["PLC-TIME-STAMP"];
//         if (!timestamp) return;

//         const parsedTime = new Date(timestamp).getTime() / 1000;

//         charts.forEach((chart) => {
//           const chartInstance = chartsRef.current[chart.id];
//           if (!chartInstance) return;

//           chart.yAxisDataKeys.forEach((yAxis) => {
//             const series = chartInstance.series[yAxis.id];
//             if (series) {
//               const value = message[yAxis.dataKeys[0]];
//               if (value !== undefined) {
//                 series.update({ time: parsedTime, value });
//               }
//             }
//           });
//         });
//       } catch (error) {
//         console.error("WebSocket error:", error);
//       }
//     };

//     ws.onclose = () => console.log("WebSocket closed");

//     return () => ws.close();
//   }, [charts, wsUrl]);

//   const createTooltipForChart = (chartId, container) => {
//     if (!tooltipsRef.current[chartId]) {
//       const tooltip = document.createElement("div");
//       tooltip.style = `
//         width: auto; height: auto; position: absolute; display: none; padding: 8px;
//         box-sizing: border-box; font-size: 12px; text-align: left; z-index: 1000;
//         background: white; color: black; border: 1px solid #0088FE; border-radius: 4px;
//       `;
//       container.appendChild(tooltip);
//       tooltipsRef.current[chartId] = tooltip;
//     }
//   };
  
//   const addChart = () => {
//     const chartId = Date.now();
//     const newChart = {
//       id: chartId,
//       type: "Line",
//       yAxisDataKeys: [
//         {
//           id: `yAxis-0`,
//           dataKeys: ["CR-PT-021"],
//           color: "#0088FE",
//           priceScaleId: "right",
//         },
//       ],
//     };
  
//     setCharts([...charts, newChart]);
  
//     setTimeout(() => {
//       const container = document.getElementById(`chart-container-${chartId}`);
//       if (container) {
//         const chartInstance = createChart(container, {
//           width: container.clientWidth,
//           height: 300,
//         });
  
//         chartsRef.current[chartId] = {
//           instance: chartInstance,
//           series: {},
//         };
  
//         // Create tooltip
//         createTooltipForChart(chartId, container);
  
//         newChart.yAxisDataKeys.forEach((yAxis) => {
//           const series = chartInstance.addLineSeries({
//             color: yAxis.color,
//             lineWidth: 2,
//             priceScaleId: yAxis.priceScaleId,
//           });
//           chartsRef.current[chartId].series[yAxis.id] = series;
  
//           // Add dummy data
//           series.setData([
//             { time: "2023-12-01", value: 10 },
//             { time: "2023-12-02", value: 15 },
//             { time: "2023-12-03", value: 12 },
//           ]);
//         });
  
//         // Subscribe to crosshair move for tooltip
//         chartInstance.subscribeCrosshairMove((param) => {
//           const tooltip = tooltipsRef.current[chartId];
//           if (!tooltip) return;
  
//           if (!param.point || !param.time) {
//             tooltip.style.display = "none";
//             return;
//           }
  
//           const dataAtPoint = newChart.yAxisDataKeys.map((yAxis) => {
//             const series = chartsRef.current[chartId].series[yAxis.id];
//             const data = param.seriesData.get(series);
//             return data ? `${yAxis.dataKeys[0]}: ${data.value}` : null;
//           }).filter(Boolean);
  
//           if (!dataAtPoint.length) {
//             tooltip.style.display = "none";
//             return;
//           }
  
//           tooltip.style.display = "block";
//           tooltip.innerHTML = dataAtPoint.join("<br>");
//           tooltip.style.left = `${param.point.x + 10}px`;
//           tooltip.style.top = `${param.point.y + 10}px`;
//         });
//       }
//     }, 0);
  
//     setChartDialogOpen(false);
//   };
  

//   const addYAxis = () => {
//     if (!tempChartConfig) return;

//     const chartInstance = chartsRef.current[tempChartConfig.id];
//     if (!chartInstance) return;

//     const priceScaleId = `priceScale-${tempChartConfig.yAxisDataKeys.length}`;
//     const updatedYAxis = {
//       id: `yAxis-${tempChartConfig.yAxisDataKeys.length}`,
//       dataKeys: ["CR-LT-011"], // Example data key
//       color: "#00C49F",
//       priceScaleId,
//     };

//     chartInstance.instance.applyOptions({
//       priceScale: {
//         [priceScaleId]: { position: "left" },
//       },
//     });

//     const series = chartInstance.instance.addLineSeries({
//       color: updatedYAxis.color,
//       lineWidth: 2,
//       priceScaleId,
//     });

//     chartInstance.series[updatedYAxis.id] = series;
//     tempChartConfig.yAxisDataKeys.push(updatedYAxis);
//     setTempChartConfig({ ...tempChartConfig });
//   };

//   const saveConfig = () => {
//     if (tempChartConfig) {
//       const updatedCharts = charts.map((chart) =>
//         chart.id === tempChartConfig.id ? tempChartConfig : chart
//       );
//       setCharts(updatedCharts);
//       setTempChartConfig(null);
//     }
//   };

//   return (
//     <div>
//       <h1>Custom Charts with Tooltips</h1>
//       <Box mb={2}>
//         <Button variant="contained" color="primary" onClick={() => setChartDialogOpen(true)}>
//           Add Custom Chart
//         </Button>
//       </Box>

//       {charts.map((chart) => (
//         <Box key={chart.id} mb={4}>
//           <Typography variant="h6">Chart {chart.id}</Typography>
//           <div id={`chart-container-${chart.id}`} style={{ width: "100%", height: 300 }}></div>
//           <Box mt={1}>
//             <Button onClick={() => setTempChartConfig(chart)} color="secondary">
//               Configure Chart
//             </Button>
//           </Box>
//         </Box>
//       ))}

//       <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
//         <DialogTitle>Add Chart</DialogTitle>
//         <DialogContent>
//           <Button onClick={addChart} variant="contained">
//             Add Line Chart
//           </Button>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setChartDialogOpen(false)}>Cancel</Button>
//         </DialogActions>
//       </Dialog>

//       {tempChartConfig && (
//         <Dialog open={Boolean(tempChartConfig)} onClose={() => setTempChartConfig(null)}>
//           <DialogTitle>Configure Chart</DialogTitle>
//           <DialogContent>
//             {tempChartConfig.yAxisDataKeys.map((yAxis) => (
//               <Box key={yAxis.id} mb={2}>
//                 <FormControl fullWidth>
//                   <InputLabel>Data Key</InputLabel>
//                   <Select
//                     value={yAxis.dataKeys[0]}
//                     onChange={(e) =>
//                       setTempChartConfig((prev) => ({
//                         ...prev,
//                         yAxisDataKeys: prev.yAxisDataKeys.map((item) =>
//                           item.id === yAxis.id
//                             ? { ...item, dataKeys: [e.target.value] }
//                             : item
//                         ),
//                       }))
//                     }
//                   >
//                     <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//                     <MenuItem value="CR-LT-011">CR-LT-011</MenuItem>
//                     <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
//                   </Select>
//                 </FormControl>
//                 <Button onClick={() => setSelectedYAxisId(yAxis.id)}>Pick Color</Button>
//                 {colorPickerOpen && selectedYAxisId === yAxis.id && (
//                   <SketchPicker
//                     color={yAxis.color}
//                     onChangeComplete={(color) =>
//                       setTempChartConfig((prev) => ({
//                         ...prev,
//                         yAxisDataKeys: prev.yAxisDataKeys.map((item) =>
//                           item.id === yAxis.id ? { ...item, color: color.hex } : item
//                         ),
//                       }))
//                     }
//                   />
//                 )}
//               </Box>
//             ))}
//             <Button onClick={addYAxis} variant="contained">
//               Add Y-Axis
//             </Button>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setTempChartConfig(null)}>Cancel</Button>
//             <Button onClick={saveConfig}>Save</Button>
//           </DialogActions>
//         </Dialog>
//       )}
//     </div>
//   );
// };

// export default CustomCharts;



// import React, { useEffect, useRef, useState } from "react";
// import { createChart } from "lightweight-charts";
// import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, Typography } from "@mui/material";
// import { SketchPicker } from "react-color";

// const CustomCharts = () => {
//   const chartsRef = useRef({}); // Store chart and series instances
//   const tooltipRef = useRef(null); // Tooltip reference
//   const [charts, setCharts] = useState([]);
//   const [chartDialogOpen, setChartDialogOpen] = useState(false);
//   const [tempChartConfig, setTempChartConfig] = useState(null); // Chart being configured
//   const [selectedYAxisId, setSelectedYAxisId] = useState(null); // Selected Y-axis for configuration
//   const [colorPickerOpen, setColorPickerOpen] = useState(false); // Color picker visibility

//   useEffect(() => {
//     const ws = new WebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");
//     ws.onmessage = (event) => {
//       try {
//         const message = JSON.parse(event.data);
//         const timestamp = message["PLC-TIME-STAMP"];
//         if (!timestamp) return;

//         const parsedTime = new Date(timestamp).getTime() / 1000;

//         charts.forEach((chart) => {
//           const chartInstance = chartsRef.current[chart.id];
//           if (!chartInstance) return;

//           chart.yAxisDataKeys.forEach((yAxis) => {
//             const series = chartInstance.series[yAxis.id];
//             if (series) {
//               const value = message[yAxis.dataKeys[0]];
//               if (value !== undefined) {
//                 series.update({ time: parsedTime, value });
//               }
//             }
//           });
//         });
//       } catch (error) {
//         console.error("WebSocket error:", error);
//       }
//     };

//     return () => ws.close();
//   }, [charts]);

//   const addChart = () => {
//     const chartId = Date.now();
//     const newChart = {
//       id: chartId,
//       type: "Line",
//       yAxisDataKeys: [
//         {
//           id: `yAxis-0`,
//           dataKeys: ["CR-PT-021"],
//           color: "#0088FE",
//           priceScaleId: "right",
//         },
//       ],
//     };

//     setCharts([...charts, newChart]);

//     setTimeout(() => {
//       const container = document.getElementById(`chart-container-${chartId}`);
//       if (container) {
//         const chartInstance = createChart(container, {
//           width: container.clientWidth,
//           height: 300,
//         });

//         chartsRef.current[chartId] = {
//           instance: chartInstance,
//           series: {},
//         };

//         const tooltip = document.createElement("div");
//         tooltip.style = `
//           width: auto; height: auto; position: absolute; display: none; padding: 8px;
//           box-sizing: border-box; font-size: 12px; text-align: left; z-index: 1000;
//           background: white; color: black; border: 1px solid #0088FE; border-radius: 4px;
//         `;
//         container.appendChild(tooltip);
//         tooltipRef.current = tooltip;

//         newChart.yAxisDataKeys.forEach((yAxis) => {
//           const series = chartInstance.addLineSeries({
//             color: yAxis.color,
//             lineWidth: 2,
//             priceScaleId: yAxis.priceScaleId,
//           });
//           chartsRef.current[chartId].series[yAxis.id] = series;

//           series.setData([
//             { time: "2023-12-01", value: 10 },
//             { time: "2023-12-02", value: 15 },
//             { time: "2023-12-03", value: 12 },
//           ]);
//         });

//         chartInstance.subscribeCrosshairMove((param) => {
//           if (!param.point || !param.time) {
//             tooltip.style.display = "none";
//             return;
//           }

//           const dataAtPoint = newChart.yAxisDataKeys.map((yAxis) => {
//             const series = chartsRef.current[chartId].series[yAxis.id];
//             const data = param.seriesData.get(series);
//             return data ? `${yAxis.dataKeys[0]}: ${data.value}` : null;
//           }).filter(Boolean);

//           if (dataAtPoint.length === 0) {
//             tooltip.style.display = "none";
//             return;
//           }

//           tooltip.style.display = "block";
//           tooltip.innerHTML = dataAtPoint.join("<br>");
//           const { x, y } = param.point;
//           tooltip.style.left = `${x + 10}px`;
//           tooltip.style.top = `${y + 10}px`;
//         });
//       }
//     }, 0);

//     setChartDialogOpen(false);
//   };

//   const addYAxis = () => {
//     if (!tempChartConfig) return;
  
//     const chartInstance = chartsRef.current[tempChartConfig.id];
//     if (!chartInstance) return;
  
//     const priceScaleId = `priceScale-${tempChartConfig.yAxisDataKeys.length}`;
//     const updatedYAxis = {
//       id: `yAxis-${tempChartConfig.yAxisDataKeys.length}`,
//       dataKeys: ["NEW-DATA-KEY"],
//       color: "#00C49F",
//       priceScaleId,
//     };
  
//     chartInstance.instance.applyOptions({
//       priceScale: {
//         [priceScaleId]: {
//           position: "left",
//           scaleMargins: { top: 0.1, bottom: 0.1 },
//         },
//       },
//     });
  
//     const series = chartInstance.instance.addLineSeries({
//       color: updatedYAxis.color,
//       lineWidth: 2,
//       priceScaleId,
//     });
  
//     chartInstance.series[updatedYAxis.id] = series;
//     tempChartConfig.yAxisDataKeys.push(updatedYAxis);
//     setTempChartConfig({ ...tempChartConfig });
//   };
  
//   const updateTooltipForChart = (chartId) => {
//     const chartInstance = chartsRef.current[chartId];
//     const tooltip = tooltipRef.current[chartId];
  
//     chartInstance.instance.subscribeCrosshairMove((param) => {
//       if (!param.point || !param.time) {
//         tooltip.style.display = "none";
//         return;
//       }
  
//       const dataAtPoint = charts[chartId].yAxisDataKeys.map((yAxis) => {
//         const series = chartInstance.series[yAxis.id];
//         const data = param.seriesData.get(series);
//         return data ? `${yAxis.dataKeys[0]}: ${data.value}` : null;
//       }).filter(Boolean);
  
//       if (!dataAtPoint.length) {
//         tooltip.style.display = "none";
//         return;
//       }
  
//       tooltip.style.display = "block";
//       tooltip.innerHTML = dataAtPoint.join("<br>");
//       tooltip.style.left = `${param.point.x + 10}px`;
//       tooltip.style.top = `${param.point.y + 10}px`;
//     });
//   };
  
//   useEffect(() => {
//     charts.forEach((chart) => updateTooltipForChart(chart.id));
//   }, [charts]);
//     // Save chart configuration
//     const saveConfig = () => {
//       if (tempChartConfig) {
//         const updatedCharts = charts.map((chart) =>
//           chart.id === tempChartConfig.id ? tempChartConfig : chart
//         );
//         setCharts(updatedCharts);
//         setTempChartConfig(null);
//       }
//     };
//   return (
//     <div>
//       <h1>Custom Charts with Tooltips</h1>
//       <Box mb={2}>
//         <Button variant="contained" color="primary" onClick={() => setChartDialogOpen(true)}>
//           Add Custom Chart
//         </Button>
//       </Box>

//       {charts.map((chart) => (
//         <Box key={chart.id} mb={4}>
//           <Typography variant="h6">Chart {chart.id}</Typography>
//           <div id={`chart-container-${chart.id}`} style={{ width: "100%", height: 300 }}></div>
//           <Box mt={1}>
//           <Button onClick={() => setTempChartConfig(chart)} color="secondary">
//             Configure Chart
//           </Button>
//         </Box>
//         </Box>
//       ))}

//       <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
//         <DialogTitle>Add Chart</DialogTitle>
//         <DialogContent>
//           <Button onClick={addChart} variant="contained">
//             Add Line Chart
//           </Button>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setChartDialogOpen(false)}>Cancel</Button>
//         </DialogActions>
//       </Dialog>


//       {tempChartConfig && (
//         <Dialog open={Boolean(tempChartConfig)} onClose={() => setTempChartConfig(null)}>
//           <DialogTitle>Configure Chart</DialogTitle>
//           <DialogContent>


//             {tempChartConfig.yAxisDataKeys.map((yAxis) => (
//               <Box key={yAxis.id} mb={2}>
//                 <FormControl fullWidth>
//                   <InputLabel>Data Key</InputLabel>
//                   <Select
//                     value={yAxis.dataKeys[0]}
//                     onChange={(e) =>
//                       setTempChartConfig((prev) => ({
//                         ...prev,
//                         yAxisDataKeys: prev.yAxisDataKeys.map((item) =>
//                           item.id === yAxis.id
//                             ? { ...item, dataKeys: [e.target.value] }
//                             : item
//                         ),
//                       }))
//                     }
//                   >
//                     <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//                     <MenuItem value="CR-LT-011">CR-LT-011</MenuItem>
//                     <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
//                   </Select>
//                 </FormControl>
//                 <Button onClick={() => setSelectedYAxisId(yAxis.id)}>Pick Color</Button>
//                 {colorPickerOpen && selectedYAxisId === yAxis.id && (
//                   <SketchPicker
//                     color={yAxis.color}
//                     onChangeComplete={(color) =>
//                       setTempChartConfig((prev) => ({
//                         ...prev,
//                         yAxisDataKeys: prev.yAxisDataKeys.map((item) =>
//                           item.id === yAxis.id ? { ...item, color: color.hex } : item
//                         ),
//                       }))
//                     }
//                   />
//                 )}
//               </Box>
//             ))}
//             <Button onClick={addYAxis} variant="contained">
//               Add Y-Axis
//             </Button>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setTempChartConfig(null)}>Cancel</Button>
//             <Button onClick={saveConfig}>Save</Button>
//           </DialogActions>
//         </Dialog>
//       )}
//     </div>
//   );
// };

// export default CustomCharts;


// import React, { useEffect, useRef, useState } from "react";
// import { createChart } from "lightweight-charts";
// import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";

// const CustomCharts = () => {
//   const chartsRef = useRef({}); // Store chart and series instances
//   const tooltipRef = useRef(null); // Tooltip reference
//   const [charts, setCharts] = useState([]);
//   const [chartDialogOpen, setChartDialogOpen] = useState(false);

//   useEffect(() => {
//     const ws = new WebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");
//     ws.onmessage = (event) => {
//       try {
//         const message = JSON.parse(event.data);
//         const timestamp = message["PLC-TIME-STAMP"];
//         if (!timestamp) return;

//         const parsedTime = new Date(timestamp).getTime() / 1000;

//         charts.forEach((chart) => {
//           const chartInstance = chartsRef.current[chart.id];
//           if (!chartInstance) return;

//           chart.yAxisDataKeys.forEach((yAxis) => {
//             const series = chartInstance.series[yAxis.id];
//             if (series) {
//               const value = message[yAxis.dataKeys[0]];
//               if (value !== undefined) {
//                 series.update({ time: parsedTime, value });
//               }
//             }
//           });
//         });
//       } catch (error) {
//         console.error("WebSocket error:", error);
//       }
//     };

//     return () => ws.close();
//   }, [charts]);

//   const addChart = () => {
//     const chartId = Date.now();
//     const newChart = {
//       id: chartId,
//       type: "Line",
//       yAxisDataKeys: [
//         {
//           id: `yAxis-0`,
//           dataKeys: ["CR-PT-021"],
//           color: "#0088FE",
//           priceScaleId: "right",
//         },
//       ],
//     };

//     setCharts([...charts, newChart]);

//     setTimeout(() => {
//       const container = document.getElementById(`chart-container-${chartId}`);
//       if (container) {
//         const chartInstance = createChart(container, {
//           width: container.clientWidth,
//           height: 300,
//         });

//         chartsRef.current[chartId] = {
//           instance: chartInstance,
//           series: {},
//         };

//         const tooltip = document.createElement("div");
//         tooltip.style = `
//           width: auto; height: auto; position: absolute; display: none; padding: 8px;
//           box-sizing: border-box; font-size: 12px; text-align: left; z-index: 1000;
//           background: white; color: black; border: 1px solid #0088FE; border-radius: 4px;
//         `;
//         container.appendChild(tooltip);
//         tooltipRef.current = tooltip;

//         newChart.yAxisDataKeys.forEach((yAxis) => {
//           const series = chartInstance.addLineSeries({
//             color: yAxis.color,
//             lineWidth: 2,
//             priceScaleId: yAxis.priceScaleId,
//           });
//           chartsRef.current[chartId].series[yAxis.id] = series;

//           series.setData([
//             { time: "2023-12-01", value: 10 },
//             { time: "2023-12-02", value: 15 },
//             { time: "2023-12-03", value: 12 },
//           ]);
//         });

//         chartInstance.subscribeCrosshairMove((param) => {
//           if (!param.point || !param.time) {
//             tooltip.style.display = "none";
//             return;
//           }

//           const dataAtPoint = newChart.yAxisDataKeys.map((yAxis) => {
//             const series = chartsRef.current[chartId].series[yAxis.id];
//             const data = param.seriesData.get(series);
//             return data ? `${yAxis.dataKeys[0]}: ${data.value}` : null;
//           }).filter(Boolean);

//           if (dataAtPoint.length === 0) {
//             tooltip.style.display = "none";
//             return;
//           }

//           tooltip.style.display = "block";
//           tooltip.innerHTML = dataAtPoint.join("<br>");
//           const { x, y } = param.point;
//           tooltip.style.left = `${x + 10}px`;
//           tooltip.style.top = `${y + 10}px`;
//         });
//       }
//     }, 0);

//     setChartDialogOpen(false);
//   };

//   return (
//     <div>
//       <h1>Custom Charts with Tooltips</h1>
//       <Box mb={2}>
//         <Button variant="contained" color="primary" onClick={() => setChartDialogOpen(true)}>
//           Add Custom Chart
//         </Button>
//       </Box>

//       {charts.map((chart) => (
//         <Box key={chart.id} mb={4}>
//           <Typography variant="h6">Chart {chart.id}</Typography>
//           <div id={`chart-container-${chart.id}`} style={{ width: "100%", height: 300 }}></div>
//         </Box>
//       ))}

//       <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
//         <DialogTitle>Add Chart</DialogTitle>
//         <DialogContent>
//           <Button onClick={addChart} variant="contained">
//             Add Line Chart
//           </Button>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setChartDialogOpen(false)}>Cancel</Button>
//         </DialogActions>
//       </Dialog>
//     </div>
//   );
// };

// export default CustomCharts;


// import React, { useEffect, useRef, useState } from "react";
// import { createChart } from "lightweight-charts";
// import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";

// const CustomCharts = () => {
//   const chartsRef = useRef({}); // Store chart and series instances
//   const tooltipRef = useRef(null); // Tooltip reference
//   const [charts, setCharts] = useState([]);
//   const [chartDialogOpen, setChartDialogOpen] = useState(false);

//   useEffect(() => {
//     const ws = new WebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");
//     ws.onmessage = (event) => {
//       try {
//         const message = JSON.parse(event.data);
//         const timestamp = message["PLC-TIME-STAMP"];
//         if (!timestamp) return;

//         const parsedTime = new Date(timestamp).getTime() / 1000;

//         charts.forEach((chart) => {
//           const chartInstance = chartsRef.current[chart.id];
//           if (!chartInstance) return;

//           chart.yAxisDataKeys.forEach((yAxis) => {
//             const series = chartInstance.series[yAxis.id];
//             if (series) {
//               const value = message[yAxis.dataKeys[0]];
//               if (value !== undefined) {
//                 series.update({ time: parsedTime, value });
//               }
//             }
//           });
//         });
//       } catch (error) {
//         console.error("WebSocket error:", error);
//       }
//     };

//     return () => ws.close();
//   }, [charts]);

//   const addChart = () => {
//     const chartId = Date.now();
//     const newChart = {
//       id: chartId,
//       type: "Line",
//       yAxisDataKeys: [
//         {
//           id: `yAxis-0`,
//           dataKeys: ["CR-PT-021"],
//           color: "#0088FE",
//           priceScaleId: "right",
//         },
//       ],
//     };

//     setCharts([...charts, newChart]);

//     setTimeout(() => {
//       const container = document.getElementById(`chart-container-${chartId}`);
//       if (container) {
//         const chartInstance = createChart(container, {
//           width: container.clientWidth,
//           height: 300,
//         });

//         chartsRef.current[chartId] = {
//           instance: chartInstance,
//           series: {},
//         };

//         const tooltip = document.createElement("div");
//         tooltip.style = `
//           width: auto; height: auto; position: absolute; display: none; padding: 8px;
//           box-sizing: border-box; font-size: 12px; text-align: left; z-index: 1000;
//           background: white; color: black; border: 1px solid #0088FE; border-radius: 4px;
//         `;
//         container.appendChild(tooltip);
//         tooltipRef.current = tooltip;

//         newChart.yAxisDataKeys.forEach((yAxis) => {
//           const series = chartInstance.addLineSeries({
//             color: yAxis.color,
//             lineWidth: 2,
//             priceScaleId: yAxis.priceScaleId,
//           });
//           chartsRef.current[chartId].series[yAxis.id] = series;

//           series.setData([
//             { time: "2023-12-01", value: 10 },
//             { time: "2023-12-02", value: 15 },
//             { time: "2023-12-03", value: 12 },
//           ]);
//         });

//         chartInstance.subscribeCrosshairMove((param) => {
//           if (!param.point || !param.time) {
//             tooltip.style.display = "none";
//             return;
//           }

//           const dataAtPoint = newChart.yAxisDataKeys.map((yAxis) => {
//             const series = chartsRef.current[chartId].series[yAxis.id];
//             const data = param.seriesData.get(series);
//             return data ? `${yAxis.dataKeys[0]}: ${data.value}` : null;
//           }).filter(Boolean);

//           if (dataAtPoint.length === 0) {
//             tooltip.style.display = "none";
//             return;
//           }

//           tooltip.style.display = "block";
//           tooltip.innerHTML = dataAtPoint.join("<br>");
//           const { x, y } = param.point;
//           tooltip.style.left = `${x + 10}px`;
//           tooltip.style.top = `${y + 10}px`;
//         });
//       }
//     }, 0);

//     setChartDialogOpen(false);
//   };

//   return (
//     <div>
//       <h1>Custom Charts with Tooltips</h1>
//       <Box mb={2}>
//         <Button variant="contained" color="primary" onClick={() => setChartDialogOpen(true)}>
//           Add Custom Chart
//         </Button>
//       </Box>

//       {charts.map((chart) => (
//         <Box key={chart.id} mb={4}>
//           <Typography variant="h6">Chart {chart.id}</Typography>
//           <div id={`chart-container-${chart.id}`} style={{ width: "100%", height: 300 }}></div>
//         </Box>
//       ))}

//       <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
//         <DialogTitle>Add Chart</DialogTitle>
//         <DialogContent>
//           <Button onClick={addChart} variant="contained">
//             Add Line Chart
//           </Button>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setChartDialogOpen(false)}>Cancel</Button>
//         </DialogActions>
//       </Dialog>
//     </div>
//   );
// };

// export default CustomCharts;



// import React, { useEffect, useRef, useState } from "react";
// import { createChart } from "lightweight-charts";
// import {
//   Box,
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   Typography,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
// } from "@mui/material";
// import { SketchPicker } from "react-color";

// const CustomCharts = () => {
//   const chartsRef = useRef({}); // Store chart and series instances
//   const [charts, setCharts] = useState([]); // Store chart configurations
//   const [tempChartConfig, setTempChartConfig] = useState(null); // Chart being configured
//   const [chartDialogOpen, setChartDialogOpen] = useState(false); // Dialog visibility
//   const [selectedYAxisId, setSelectedYAxisId] = useState(null); // Selected Y-axis for configuration
//   const [colorPickerOpen, setColorPickerOpen] = useState(false); // Color picker visibility
//   const [wsUrl] = useState("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/"); // WebSocket URL

//   // WebSocket for real-time updates
//   useEffect(() => {
//     const ws = new WebSocket(wsUrl);

//     ws.onmessage = (event) => {
//       try {
//         const message = JSON.parse(event.data);
//         const timestamp = message["PLC-TIME-STAMP"];
//         if (!timestamp) return;

//         const parsedTime = new Date(timestamp).getTime() / 1000;

//         charts.forEach((chart) => {
//           const chartInstance = chartsRef.current[chart.id];
//           if (!chartInstance) return;

//           chart.yAxisDataKeys.forEach((yAxis) => {
//             const series = chartInstance.series[yAxis.id];
//             if (series) {
//               const value = message[yAxis.dataKeys[0]];
//               if (value !== undefined) {
//                 series.update({ time: parsedTime, value });
//               }
//             }
//           });
//         });
//       } catch (error) {
//         console.error("WebSocket error:", error);
//       }
//     };

//     ws.onclose = () => console.log("WebSocket closed");

//     return () => ws.close();
//   }, [charts, wsUrl]);

//   // Add a new chart
//   const addChart = () => {
//     const chartId = Date.now();
//     const newChart = {
//       id: chartId,
//       type: "Line",
//       yAxisDataKeys: [
//         {
//           id: `yAxis-0`,
//           dataKeys: ["CR-PT-021"],
//           color: "#0088FE",
//           priceScaleId: "right", // Default price scale
//         },
//       ],
//     };

//     setCharts([...charts, newChart]);

//     setTimeout(() => {
//       const container = document.getElementById(`chart-container-${chartId}`);
//       if (container) {
//         const chartInstance = createChart(container, {
//           width: container.clientWidth,
//           height: 300,
//         });
//         chartsRef.current[chartId] = {
//           instance: chartInstance,
//           series: {},
//         };

//         newChart.yAxisDataKeys.forEach((yAxis) => {
//           const series = chartInstance.addLineSeries({
//             color: yAxis.color,
//             lineWidth: 2,
//             priceScaleId: yAxis.priceScaleId,
//           });
//           chartsRef.current[chartId].series[yAxis.id] = series;
//         });
//       }
//     }, 0);

//     setChartDialogOpen(false);
//   };
//   // Add a new Y-axis with its own price scale
//   const addYAxis = () => {
//     if (!tempChartConfig) return;

//     const chartInstance = chartsRef.current[tempChartConfig.id];
//     if (!chartInstance) return;

//     const priceScaleId = `priceScale-${tempChartConfig.yAxisDataKeys.length}`;
//     const updatedYAxis = {
//       id: `yAxis-${tempChartConfig.yAxisDataKeys.length}`,
//       dataKeys: ["AX-LT-011"],
//       color: "#00C49F",
//       priceScaleId,
//     };

//     // Add new price scale with distinct options
//     chartInstance.instance.applyOptions({
//       priceScale: {
//         [priceScaleId]: {
//           position: "left", // Place the new Y-axis on the left
//           scaleMargins: {
//             top: 0.1, // Adjust margins to avoid overlap
//             bottom: 0.1,
//           },
//           mode: 1, // "Normal" price scale mode
//         },
//       },
//     });

//     // Add a new series tied to the new price scale
//     const series = chartInstance.instance.addLineSeries({
//       color: updatedYAxis.color,
//       lineWidth: 2,
//       priceScaleId,
//     });
//     chartInstance.series[updatedYAxis.id] = series;

//     const updatedConfig = {
//       ...tempChartConfig,
//       yAxisDataKeys: [...tempChartConfig.yAxisDataKeys, updatedYAxis],
//     };

//     setTempChartConfig(updatedConfig);
//   };

//   // Save chart configuration
//   const saveConfig = () => {
//     if (tempChartConfig) {
//       const updatedCharts = charts.map((chart) =>
//         chart.id === tempChartConfig.id ? tempChartConfig : chart
//       );
//       setCharts(updatedCharts);
//       setTempChartConfig(null);
//     }
//   };

//   return (
//     <div>
//       <h1>Custom Lightweight Charts with Independent Y-Axes</h1>

//       <Box mb={2}>
//         <Button variant="contained" color="primary" onClick={() => setChartDialogOpen(true)}>
//           Add Custom Chart
//         </Button>
//       </Box>

//       {/* Render all charts */}
//       {charts.map((chart) => (
//         <Box key={chart.id} mb={4}>
//           <Typography variant="h6">Chart {chart.id}</Typography>
//           <div id={`chart-container-${chart.id}`} style={{ width: "100%" , height: 300 }}></div>
//           <Box mt={1}>
//             <Button onClick={() => setTempChartConfig(chart)} color="secondary">
//               Configure Chart
//             </Button>
//           </Box>
//         </Box>
//       ))}

//       {/* Add Chart Dialog */}
//       <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
//         <DialogTitle>Add Chart</DialogTitle>
//         <DialogContent>
//           <Button onClick={addChart} variant="contained">
//             Add Line Chart
//           </Button>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setChartDialogOpen(false)}>Cancel</Button>
//         </DialogActions>
//       </Dialog>

//       {/* Configure Chart Dialog */}
//       {tempChartConfig && (
//         <Dialog open={Boolean(tempChartConfig)} onClose={() => setTempChartConfig(null)}>
//           <DialogTitle>Configure Chart</DialogTitle>
//           <DialogContent>


//             {tempChartConfig.yAxisDataKeys.map((yAxis) => (
//               <Box key={yAxis.id} mb={2}>
//                 <FormControl fullWidth>
//                   <InputLabel>Data Key</InputLabel>
//                   <Select
//                     value={yAxis.dataKeys[0]}
//                     onChange={(e) =>
//                       setTempChartConfig((prev) => ({
//                         ...prev,
//                         yAxisDataKeys: prev.yAxisDataKeys.map((item) =>
//                           item.id === yAxis.id
//                             ? { ...item, dataKeys: [e.target.value] }
//                             : item
//                         ),
//                       }))
//                     }
//                   >
//                     <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//                     <MenuItem value="CR-LT-011">CR-LT-011</MenuItem>
//                     <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
//                   </Select>
//                 </FormControl>
//                 <Button onClick={() => setSelectedYAxisId(yAxis.id)}>Pick Color</Button>
//                 {colorPickerOpen && selectedYAxisId === yAxis.id && (
//                   <SketchPicker
//                     color={yAxis.color}
//                     onChangeComplete={(color) =>
//                       setTempChartConfig((prev) => ({
//                         ...prev,
//                         yAxisDataKeys: prev.yAxisDataKeys.map((item) =>
//                           item.id === yAxis.id ? { ...item, color: color.hex } : item
//                         ),
//                       }))
//                     }
//                   />
//                 )}
//               </Box>
//             ))}
//             <Button onClick={addYAxis} variant="contained">
//               Add Y-Axis
//             </Button>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setTempChartConfig(null)}>Cancel</Button>
//             <Button onClick={saveConfig}>Save</Button>
//           </DialogActions>
//         </Dialog>
//       )}
//     </div>
//   );
// };

// export default CustomCharts;


// import React, { useEffect, useRef, useState } from "react";
// import { createChart } from "lightweight-charts";
// import {
//   Box,
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   Typography,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
// } from "@mui/material";
// import { SketchPicker } from "react-color";

// const CustomCharts = () => {
//   const chartsRef = useRef({}); // Store chart and series instances
//   const [charts, setCharts] = useState([]); // Store chart configurations
//   const [tempChartConfig, setTempChartConfig] = useState(null); // Chart being configured
//   const [chartDialogOpen, setChartDialogOpen] = useState(false); // Dialog visibility
//   const [selectedYAxisId, setSelectedYAxisId] = useState(null); // Selected Y-axis for configuration
//   const [colorPickerOpen, setColorPickerOpen] = useState(false); // Color picker visibility
//   const [wsUrl] = useState("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/"); // WebSocket URL

//   // WebSocket for real-time updates
//   useEffect(() => {
//     const ws = new WebSocket(wsUrl);

//     ws.onmessage = (event) => {
//       try {
//         const message = JSON.parse(event.data);
//         const timestamp = message["PLC-TIME-STAMP"];
//         if (!timestamp) return;

//         const parsedTime = new Date(timestamp).getTime() / 1000;

//         charts.forEach((chart) => {
//           const chartInstance = chartsRef.current[chart.id];
//           if (!chartInstance) return;

//           chart.yAxisDataKeys.forEach((yAxis) => {
//             const series = chartInstance.series[yAxis.id];
//             if (series) {
//               const value = message[yAxis.dataKeys[0]];
//               if (value !== undefined) {
//                 series.update({ time: parsedTime, value });
//               }
//             }
//           });
//         });
//       } catch (error) {
//         console.error("WebSocket error:", error);
//       }
//     };

//     ws.onclose = () => console.log("WebSocket closed");

//     return () => ws.close();
//   }, [charts, wsUrl]);

//   // Add a new chart
//   const addChart = () => {
//     const chartId = Date.now();
//     const newChart = {
//       id: chartId,
//       type: "Line",
//       yAxisDataKeys: [
//         {
//           id: `yAxis-0`,
//           dataKeys: ["AX-LT-011"],
//           color: "#0088FE",
//           priceScaleId: "right", // Default price scale
//         },
//       ],
//     };

//     setCharts([...charts, newChart]);

//     setTimeout(() => {
//       const container = document.getElementById(`chart-container-${chartId}`);
//       if (container) {
//         const chartInstance = createChart(container, {
//           width: container.clientWidth,
//           height: 300,
//         });
//         chartsRef.current[chartId] = {
//           instance: chartInstance,
//           series: {},
//         };

//         newChart.yAxisDataKeys.forEach((yAxis) => {
//           const series = chartInstance.addLineSeries({
//             color: yAxis.color,
//             lineWidth: 2,
//             priceScaleId: yAxis.priceScaleId,
//           });
//           chartsRef.current[chartId].series[yAxis.id] = series;
//         });
//       }
//     }, 0);

//     setChartDialogOpen(false);
//   };

//   // Add a new Y-axis with a new price scale
//   const addYAxis = () => {
//     if (!tempChartConfig) return;

//     const chartInstance = chartsRef.current[tempChartConfig.id];
//     if (!chartInstance) return;

//     const priceScaleId = `priceScale-${tempChartConfig.yAxisDataKeys.length}`;
//     const updatedYAxis = {
//       id: `yAxis-${tempChartConfig.yAxisDataKeys.length}`,
//       dataKeys: ["AX-LT-011"],
//       color: "#00C49F",
//       priceScaleId,
//     };

//     // Add new price scale
//     chartInstance.instance.applyOptions({
//       priceScale: {
//         [priceScaleId]: { position: "left" },
//       },
//     });

//     // Add series to the new price scale
//     const series = chartInstance.instance.addLineSeries({
//       color: updatedYAxis.color,
//       lineWidth: 2,
//       priceScaleId,
//     });
//     chartInstance.series[updatedYAxis.id] = series;

//     const updatedConfig = {
//       ...tempChartConfig,
//       yAxisDataKeys: [...tempChartConfig.yAxisDataKeys, updatedYAxis],
//     };

//     setTempChartConfig(updatedConfig);
//   };

//   // Save chart configuration
//   const saveConfig = () => {
//     if (tempChartConfig) {
//       const updatedCharts = charts.map((chart) =>
//         chart.id === tempChartConfig.id ? tempChartConfig : chart
//       );
//       setCharts(updatedCharts);
//       setTempChartConfig(null);
//     }
//   };

//   return (
//     <div>
//       <h1>Custom Lightweight Charts with Multiple Price Scales</h1>

//       <Box mb={2}>
//         <Button variant="contained" color="primary" onClick={() => setChartDialogOpen(true)}>
//           Add Custom Chart
//         </Button>
//       </Box>

//       {/* Render all charts */}
//       {charts.map((chart) => (
//         <Box key={chart.id} mb={4}>
//           <Typography variant="h6">Chart {chart.id}</Typography>
//           <div id={`chart-container-${chart.id}`} style={{ width: 500, height: 300 }}></div>
//           <Box mt={1}>
//             <Button onClick={() => setTempChartConfig(chart)} color="secondary">
//               Configure Chart
//             </Button>
//           </Box>
//         </Box>
//       ))}

//       {/* Add Chart Dialog */}
//       <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
//         <DialogTitle>Add Chart</DialogTitle>
//         <DialogContent>
//           <Button onClick={addChart} variant="contained">
//             Add Line Chart
//           </Button>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setChartDialogOpen(false)}>Cancel</Button>
//         </DialogActions>
//       </Dialog>

//       {/* Configure Chart Dialog */}
//       {tempChartConfig && (
//         <Dialog open={Boolean(tempChartConfig)} onClose={() => setTempChartConfig(null)}>
//           <DialogTitle>Configure Chart</DialogTitle>
//           <DialogContent>
//             {tempChartConfig.yAxisDataKeys.map((yAxis) => (
//               <Box key={yAxis.id} mb={2}>
//                 <FormControl fullWidth>
//                   <InputLabel>Data Key</InputLabel>
//                   <Select
//                     value={yAxis.dataKeys[0]}
//                     onChange={(e) =>
//                       setTempChartConfig((prev) => ({
//                         ...prev,
//                         yAxisDataKeys: prev.yAxisDataKeys.map((item) =>
//                           item.id === yAxis.id
//                             ? { ...item, dataKeys: [e.target.value] }
//                             : item
//                         ),
//                       }))
//                     }
//                   >
//                     <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//                     <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
//                     <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
//                   </Select>
//                 </FormControl>
//                 <Button onClick={() => setSelectedYAxisId(yAxis.id)}>Pick Color</Button>
//                 {colorPickerOpen && selectedYAxisId === yAxis.id && (
//                   <SketchPicker
//                     color={yAxis.color}
//                     onChangeComplete={(color) =>
//                       setTempChartConfig((prev) => ({
//                         ...prev,
//                         yAxisDataKeys: prev.yAxisDataKeys.map((item) =>
//                           item.id === yAxis.id ? { ...item, color: color.hex } : item
//                         ),
//                       }))
//                     }
//                   />
//                 )}
//               </Box>
//             ))}
//             <Button onClick={addYAxis} variant="contained">
//               Add Y-Axis
//             </Button>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setTempChartConfig(null)}>Cancel</Button>
//             <Button onClick={saveConfig}>Save</Button>
//           </DialogActions>
//         </Dialog>
//       )}
//     </div>
//   );
// };

// export default CustomCharts;



// import React, { useEffect, useRef, useState } from "react";
// import { createChart } from "lightweight-charts";
// import {
//   Box,
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   Typography,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
// } from "@mui/material";
// import { SketchPicker } from "react-color";

// const CustomCharts = () => {
//   const chartsRef = useRef({}); // Store chart and series instances
//   const [charts, setCharts] = useState([]); // Store chart configurations
//   const [tempChartConfig, setTempChartConfig] = useState(null); // Chart being configured
//   const [chartDialogOpen, setChartDialogOpen] = useState(false); // Dialog visibility
//   const [selectedYAxisId, setSelectedYAxisId] = useState(null); // Selected Y-axis for configuration
//   const [colorPickerOpen, setColorPickerOpen] = useState(false); // Color picker visibility
//   const [wsUrl] = useState("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/"); // WebSocket URL

//   // WebSocket for real-time updates
//   useEffect(() => {
//     const ws = new WebSocket(wsUrl);

//     ws.onmessage = (event) => {
//       try {
//         const message = JSON.parse(event.data);
//         const timestamp = message["PLC-TIME-STAMP"];
//         if (!timestamp) return;

//         const parsedTime = new Date(timestamp).getTime() / 1000;

//         charts.forEach((chart) => {
//           const chartInstance = chartsRef.current[chart.id];
//           if (!chartInstance) return;

//           chart.yAxisDataKeys.forEach((yAxis) => {
//             const series = chartInstance.series[yAxis.id];
//             if (series) {
//               const value = message[yAxis.dataKeys[0]];
//               if (value !== undefined) {
//                 series.update({ time: parsedTime, value });
//               }
//             }
//           });
//         });
//       } catch (error) {
//         console.error("WebSocket error:", error);
//       }
//     };

//     ws.onclose = () => console.log("WebSocket closed");

//     return () => ws.close();
//   }, [charts, wsUrl]);

//   // Add a new chart
//   const addChart = () => {
//     const chartId = Date.now();
//     const newChart = {
//       id: chartId,
//       type: "Line",
//       yAxisDataKeys: [
//         {
//           id: `yAxis-0`,
//           dataKeys: ["CW-TT-021"],
//           color: "#0088FE",
//         },
//       ],
//     };
//     setCharts([...charts, newChart]);

//     setTimeout(() => {
//       const container = document.getElementById(`chart-container-${chartId}`);
//       if (container) {
//         const chartInstance = createChart(container, {
//           width: container.clientWidth,
//           height: 300,
//         });
//         chartsRef.current[chartId] = {
//           instance: chartInstance,
//           series: {},
//         };

//         newChart.yAxisDataKeys.forEach((yAxis) => {
//           const series = chartInstance.addLineSeries({
//             color: yAxis.color,
//             lineWidth: 2,
//           });
//           chartsRef.current[chartId].series[yAxis.id] = series;
//         });
//       }
//     }, 0);

//     setChartDialogOpen(false);
//   };

//   // Add a Y-axis to a chart
//   const addYAxis = () => {
//     if (!tempChartConfig) return;

//     const updatedYAxis = {
//       id: `yAxis-${tempChartConfig.yAxisDataKeys.length}`,
//       dataKeys: ["AX-LT-011"],
//       color: "#00C49F",
//     };

//     const updatedConfig = {
//       ...tempChartConfig,
//       yAxisDataKeys: [...tempChartConfig.yAxisDataKeys, updatedYAxis],
//     };

//     setTempChartConfig(updatedConfig);

//     const chartInstance = chartsRef.current[tempChartConfig.id];
//     if (chartInstance) {
//       const series = chartInstance.instance.addLineSeries({
//         color: updatedYAxis.color,
//         lineWidth: 2,
//       });
//       chartInstance.series[updatedYAxis.id] = series;
//     }
//   };
//   // Save chart configuration
//   const saveConfig = () => {
//     if (tempChartConfig) {
//       const updatedCharts = charts.map((chart) =>
//         chart.id === tempChartConfig.id ? tempChartConfig : chart
//       );
//       setCharts(updatedCharts);
//       setTempChartConfig(null);
//     }
//   };
//   return (
//     <div>
//       <h1>Custom Lightweight Charts</h1>

//       <Box mb={2}>
//         <Button variant="contained" color="primary" onClick={() => setChartDialogOpen(true)}>
//           Add Custom Chart
//         </Button>
//       </Box>

//       {/* Render all charts */}
//       {charts.map((chart) => (
//         <Box key={chart.id} mb={4}>
//           <Typography variant="h6">Chart {chart.id}</Typography>
//           <div id={`chart-container-${chart.id}`} style={{ width: "100%", height: 300 }}></div>
//           <Box mt={1}>
//             <Button onClick={() => setTempChartConfig(chart)} color="secondary">
//               Configure Chart
//             </Button>
//           </Box>
//         </Box>
//       ))}
//       {/* Add Chart Dialog */}
//       <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
//         <DialogTitle>Add Chart</DialogTitle>
//         <DialogContent>
//           <Button onClick={addChart} variant="contained">
//             Add Line Chart
//           </Button>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setChartDialogOpen(false)}>Cancel</Button>
//         </DialogActions>
//       </Dialog>

//       {/* Configure Chart Dialog */}
//       {tempChartConfig && (
//         <Dialog open={Boolean(tempChartConfig)} onClose={() => setTempChartConfig(null)}>
//           <DialogTitle>Configure Chart</DialogTitle>
//           <DialogContent>
//             {tempChartConfig.yAxisDataKeys.map((yAxis) => (
//               <Box key={yAxis.id} mb={2}>
//                 <FormControl fullWidth>
//                   <InputLabel>Data Key</InputLabel>
//                   <Select
//                     value={yAxis.dataKeys[0]}
//                     onChange={(e) =>
//                       setTempChartConfig((prev) => ({
//                         ...prev,
//                         yAxisDataKeys: prev.yAxisDataKeys.map((item) =>
//                           item.id === yAxis.id
//                             ? { ...item, dataKeys: [e.target.value] }
//                             : item
//                         ),
//                       }))
//                     }
//                   >
//                     <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//                     <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
//                     <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
//                   </Select>
//                 </FormControl>
//                 <Button onClick={() => setSelectedYAxisId(yAxis.id)}>Pick Color</Button>
//                 {colorPickerOpen && selectedYAxisId === yAxis.id && (
//                   <SketchPicker
//                     color={yAxis.color}
//                     onChangeComplete={(color) =>
//                       setTempChartConfig((prev) => ({
//                         ...prev,
//                         yAxisDataKeys: prev.yAxisDataKeys.map((item) =>
//                           item.id === yAxis.id ? { ...item, color: color.hex } : item
//                         ),
//                       }))
//                     }
//                   />
//                 )}
//               </Box>
//             ))}
//             <Button onClick={addYAxis} variant="contained">
//               Add Y-Axis
//             </Button>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setTempChartConfig(null)}>Cancel</Button>
//             <Button onClick={saveConfig}>Save</Button>
//           </DialogActions>
//         </Dialog>
//       )}
//     </div>
//   );
// };

// export default CustomCharts;



// import React, { useEffect, useRef, useState } from "react";
// import { createChart } from "lightweight-charts";
// import {
//   Box,
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   Typography,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
// } from "@mui/material";
// import { SketchPicker } from "react-color";

// const CustomCharts = () => {
//   const [charts, setCharts] = useState([]); // Store chart configurations
//   const [tempChartConfig, setTempChartConfig] = useState(null); // Chart being configured
//   const [chartDialogOpen, setChartDialogOpen] = useState(false); // Dialog visibility
//   const [colorPickerOpen, setColorPickerOpen] = useState(false); // Color picker visibility
//   const [selectedYAxisId, setSelectedYAxisId] = useState(null); // Selected Y-axis for color picking
//   const [wsUrl] = useState("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/"); // WebSocket URL

//   // WebSocket handling for real-time updates
//   useEffect(() => {
//     const ws = new WebSocket(wsUrl);

//     ws.onmessage = (event) => {
//       try {
//         const message = JSON.parse(event.data);
//         const timestamp = message["PLC-TIME-STAMP"];
//         if (!timestamp) return;

//         const parsedTime = new Date(timestamp).getTime() / 1000;

//         charts.forEach((chart) => {
//           chart.series.forEach((seriesObj) => {
//             const newValue = message[seriesObj.key] || 0;
//             seriesObj.series.update({
//               time: parsedTime,
//               value: newValue,
//             });
//           });
//         });
//       } catch (error) {
//         console.error("WebSocket message error:", error);
//       }
//     };

//     ws.onclose = () => console.log("WebSocket closed");

//     return () => ws.close();
//   }, [charts, wsUrl]);

//   // Add a new chart
//   const addChart = () => {
//     const newChart = {
//       id: Date.now(),
//       type: "Line",
//       series: [],
//       yAxisDataKeys: [
//         {
//           id: "yAxis-0",
//           dataKeys: ["AX-LT-011"], // Default data key
//           color: "#0088FE", // Default color
//           lineStyle: "solid", // Default line style
//         },
//       ],
//     };

//     setCharts([...charts, newChart]);
//     setChartDialogOpen(false);
//   };

//   // Delete a chart
//   const deleteChart = (chartId) => {
//     setCharts((prevCharts) => prevCharts.filter((chart) => chart.id !== chartId));
//   };

//   // Open configuration dialog
//   const openConfigDialog = (chart) => {
//     setTempChartConfig({ ...chart });
//   };

//   // Save chart configuration
//   const saveConfig = () => {
//     if (tempChartConfig) {
//       setCharts((prevCharts) =>
//         prevCharts.map((chart) =>
//           chart.id === tempChartConfig.id ? tempChartConfig : chart
//         )
//       );
//       setTempChartConfig(null);
//     }
//   };

//   // Add a new Y-axis
//   const addYAxis = () => {
//     setTempChartConfig((prev) => ({
//       ...prev,
//       yAxisDataKeys: [
//         ...prev.yAxisDataKeys,
//         {
//           id: `yAxis-${prev.yAxisDataKeys.length}`,
//           dataKeys: ["AX-LT-011"],
//           color: "#00C49F",
//           lineStyle: "solid",
//         },
//       ],
//     }));
//   };

//   // Update Y-axis property
//   const updateYAxisProperty = (yAxisId, property, value) => {
//     setTempChartConfig((prev) => ({
//       ...prev,
//       yAxisDataKeys: prev.yAxisDataKeys.map((yAxis) =>
//         yAxis.id === yAxisId ? { ...yAxis, [property]: value } : yAxis
//       ),
//     }));
//   };

//   // Render individual chart using lightweight-charts
//   const LightweightChart = ({ chartConfig }) => {
//     const chartContainerRef = useRef(null);
//     const chartInstanceRef = useRef(null);

//     useEffect(() => {
//       if (!chartInstanceRef.current && chartContainerRef.current) {
//         const chartInstance = createChart(chartContainerRef.current, {
//           width: chartContainerRef.current.clientWidth,
//           height: 300,
//         });
//         chartInstanceRef.current = chartInstance;

//         chartConfig.yAxisDataKeys.forEach((yAxis) => {
//           const lineSeries = chartInstance.addLineSeries({
//             color: yAxis.color,
//             lineWidth: 2,
//             lineStyle: yAxis.lineStyle === "solid" ? 0 : 1,
//           });
//           chartConfig.series.push({ key: yAxis.dataKeys[0], series: lineSeries });
//         });
//       }

//       return () => {
//         chartInstanceRef.current?.remove();
//         chartInstanceRef.current = null;
//       };
//     }, [chartConfig]);

//     return <div ref={chartContainerRef} style={{ width: "100%", height: "100%" }} />;
//   };

//   return (
//     <div>
//       <h1>Custom Lightweight Charts</h1>

//       <Box mb={2}>
//         <Button variant="contained" color="primary" onClick={() => setChartDialogOpen(true)}>
//           Add Custom Chart
//         </Button>
//       </Box>

//       {/* Render all charts */}
//       {charts.map((chart) => (
//         <Box key={chart.id} mb={4}>
//           <Typography variant="h6">Chart {chart.id}</Typography>
//           <LightweightChart chartConfig={chart} />
//           <Box mt={1}>
//             <Button onClick={() => openConfigDialog(chart)} color="secondary">
//               Configure Chart
//             </Button>
//             <Button onClick={() => deleteChart(chart.id)} color="error">
//               Delete Chart
//             </Button>
//           </Box>
//         </Box>
//       ))}

//       {/* Add Chart Dialog */}
//       <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
//         <DialogTitle>Add Chart</DialogTitle>
//         <DialogContent>
//           <Button onClick={addChart} variant="contained">
//             Add Line Chart
//           </Button>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setChartDialogOpen(false)}>Cancel</Button>
//         </DialogActions>
//       </Dialog>

//       {/* Configure Chart Dialog */}
//       {tempChartConfig && (
//         <Dialog open={Boolean(tempChartConfig)} onClose={() => setTempChartConfig(null)}>
//           <DialogTitle>Configure Chart</DialogTitle>
//           <DialogContent>
//             {tempChartConfig.yAxisDataKeys.map((yAxis) => (
//               <Box key={yAxis.id} mb={2}>
//                 <FormControl fullWidth>
//                   <InputLabel>Data Key</InputLabel>
//                   <Select
//                     value={yAxis.dataKeys[0]}
//                     onChange={(e) =>
//                       updateYAxisProperty(yAxis.id, "dataKeys", [e.target.value])
//                     }
//                   >
//                     <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//                     <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
//                     <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
//                   </Select>
//                 </FormControl>
//                 <Button onClick={() => setSelectedYAxisId(yAxis.id)}>Pick Color</Button>
//                 {colorPickerOpen && selectedYAxisId === yAxis.id && (
//                   <SketchPicker
//                     color={yAxis.color}
//                     onChangeComplete={(color) =>
//                       updateYAxisProperty(yAxis.id, "color", color.hex)
//                     }
//                   />
//                 )}
//               </Box>
//             ))}
//             <Button onClick={addYAxis} variant="contained">
//               Add Y-Axis
//             </Button>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setTempChartConfig(null)}>Cancel</Button>
//             <Button onClick={saveConfig}>Save</Button>
//           </DialogActions>
//         </Dialog>
//       )}
//     </div>
//   );
// };

// export default CustomCharts



// import React, { useEffect, useRef, useState } from "react";
// import { createChart } from "lightweight-charts";

// const CustomCharts = () => {
//   const [charts, setCharts] = useState([]); // Store chart configurations
//   const [wsUrl] = useState("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/"); // WebSocket URL
//   const chartInstances = useRef([]); // Store chart instances and series references

//   // WebSocket setup
//   useEffect(() => {
//     const ws = new WebSocket(wsUrl);

//     ws.onmessage = (event) => {
//       try {
//         const message = JSON.parse(event.data);
//         const timestamp = message["PLC-TIME-STAMP"];
//         if (!timestamp) return;

//         const parsedTime = new Date(timestamp).getTime() / 1000;

//         // Update chart series directly without re-rendering
//         chartInstances.current.forEach((chartInstance) => {
//           chartInstance.series.forEach((series, index) => {
//             const key = chartInstance.config.yAxisDataKeys[index].dataKeys[0];
//             if (message[key] !== undefined) {
//               series.update({
//                 time: parsedTime,
//                 value: message[key] || 0,
//               });
//             }
//           });
//         });
//       } catch (error) {
//         console.error("WebSocket message error:", error);
//       }
//     };

//     ws.onclose = () => console.log("WebSocket closed");

//     return () => ws.close();
//   }, [wsUrl]);

//   // Add a new chart
//   const addChart = () => {
//     const newChart = {
//       id: Date.now(),
//       type: "Line",
//       data: [],
//       yAxisDataKeys: [
//         {
//           id: "yAxis-0",
//           dataKeys: ["CW-TT-021"], // Default data key
//           color: "#0088FE", // Default color
//           lineStyle: "solid", // Default line style
//         },
//       ],
//     };

//     setCharts((prevCharts) => [...prevCharts, newChart]);
//   };

//   // Lightweight chart component
//   const LightweightChart = ({ chartConfig }) => {
//     const chartContainerRef = useRef(null);

//     useEffect(() => {
//       if (chartContainerRef.current) {
//         const chartInstance = createChart(chartContainerRef.current, {
//           width: chartContainerRef.current.clientWidth,
//           height: 300,
//         });

//         // Add series to the chart
//         const series = chartConfig.yAxisDataKeys.map((yAxis) =>
//           chartInstance.addLineSeries({
//             color: yAxis.color,
//             lineWidth: 2,
//             lineStyle: yAxis.lineStyle === "solid" ? 0 : 1,
//           })
//         );

//         // Initialize with empty data
//         series.forEach((s) => s.setData(chartConfig.data));

//         // Store chart instance and series in ref
//         chartInstances.current.push({ chart: chartInstance, series, config: chartConfig });

//         return () => {
//           chartInstances.current = chartInstances.current.filter((ci) => ci.chart !== chartInstance);
//           chartInstance.remove();
//         };
//       }
//     }, [chartConfig]);

//     return <div ref={chartContainerRef} style={{ width: "100%", height: "100%" }} />;
//   };

//   return (
//     <div>
//       <h1>Custom Lightweight Charts</h1>
//       <button onClick={addChart}>Add Chart</button>

//       <div>
//         {charts.map((chartConfig) => (
//           <div key={chartConfig.id} style={{ marginBottom: "20px" }}>
//             <LightweightChart chartConfig={chartConfig} />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default CustomCharts;





// import React, { useEffect, useRef, useState } from "react";
// import { createChart } from "lightweight-charts";

// const CustomCharts = () => {
//   const [charts, setCharts] = useState([]); // Store chart configurations
//   const [wsUrl] = useState("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/"); // WebSocket URL
//   const chartInstances = useRef([]); // Store chart instances and series references

//   // WebSocket setup
//   useEffect(() => {
//     const ws = new WebSocket(wsUrl);

//     ws.onmessage = (event) => {
//       try {
//         const message = JSON.parse(event.data);
//         const timestamp = message["PLC-TIME-STAMP"];
//         if (!timestamp) return;

//         const parsedTime = new Date(timestamp).getTime() / 1000;

//         // Update chart series directly without re-rendering
//         chartInstances.current.forEach((chartInstance) => {
//           chartInstance.series.forEach((series, index) => {
//             const key = chartInstance.config.yAxisDataKeys[index].dataKeys[0];
//             if (message[key] !== undefined) {
//               series.update({
//                 time: parsedTime,
//                 value: message[key] || 0,
//               });
//             }
//           });
//         });
//       } catch (error) {
//         console.error("WebSocket message error:", error);
//       }
//     };

//     ws.onclose = () => console.log("WebSocket closed");

//     return () => ws.close();
//   }, [wsUrl]);

//   // Add a new chart
//   const addChart = () => {
//     const newChart = {
//       id: Date.now(),
//       type: "Line",
//       data: [],
//       yAxisDataKeys: [
//         {
//           id: "yAxis-0",
//           dataKeys: ["AX-LT-011"], // Default data key
//           color: "#0088FE", // Default color
//           lineStyle: "solid", // Default line style
//         },
//       ],
//     };

//     setCharts((prevCharts) => [...prevCharts, newChart]);
//   };

//   // Lightweight chart component
//   const LightweightChart = ({ chartConfig }) => {
//     const chartContainerRef = useRef(null);

//     useEffect(() => {
//       if (chartContainerRef.current) {
//         const chartInstance = createChart(chartContainerRef.current, {
//           width: chartContainerRef.current.clientWidth,
//           height: 300,
//         });

//         // Add series to the chart
//         const series = chartConfig.yAxisDataKeys.map((yAxis) =>
//           chartInstance.addLineSeries({
//             color: yAxis.color,
//             lineWidth: 2,
//             lineStyle: yAxis.lineStyle === "solid" ? 0 : 1,
//           })
//         );

//         // Initialize with empty data
//         series.forEach((s) => s.setData(chartConfig.data));

//         // Store chart instance and series in ref
//         chartInstances.current.push({ chart: chartInstance, series, config: chartConfig });

//         return () => {
//           chartInstances.current = chartInstances.current.filter((ci) => ci.chart !== chartInstance);
//           chartInstance.remove();
//         };
//       }
//     }, [chartConfig]);

//     return <div ref={chartContainerRef} style={{ width: "100%", height: "100%" }} />;
//   };

//   return (
//     <div>
//       <h1>Custom Lightweight Charts</h1>
//       <button onClick={addChart}>Add Chart</button>

//       <div>
//         {charts.map((chartConfig) => (
//           <div key={chartConfig.id} style={{ marginBottom: "20px" }}>
//             <LightweightChart chartConfig={chartConfig} />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default CustomCharts;



// import React, { useEffect, useRef, useState } from "react";
// import { createChart } from "lightweight-charts";
// import {
//   Box,
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   Typography,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
// } from "@mui/material";
// import { SketchPicker } from "react-color";

// const CustomCharts = () => {
//   const [charts, setCharts] = useState([]); // Store chart configurations
//   const [tempChartConfig, setTempChartConfig] = useState(null); // Chart being configured
//   const [chartDialogOpen, setChartDialogOpen] = useState(false); // Dialog visibility
//   const [colorPickerOpen, setColorPickerOpen] = useState(false); // Color picker visibility
//   const [selectedYAxisId, setSelectedYAxisId] = useState(null); // Selected Y-axis for color picking
//   const [wsUrl] = useState("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/"); // WebSocket URL

//   // WebSocket handling for real-time updates
//   useEffect(() => {
//     const ws = new WebSocket(wsUrl);

//     ws.onmessage = (event) => {
//       try {
//         const message = JSON.parse(event.data);
//         const timestamp = message["PLC-TIME-STAMP"];
//         if (!timestamp) return;

//         const parsedTime = new Date(timestamp).getTime() / 1000;

//         const updatedCharts = charts.map((chart) => {
//           const newPoints = chart.yAxisDataKeys
//             .flatMap((yAxis) =>
//               yAxis.dataKeys.map((key) => ({
//                 time: parsedTime,
//                 value: message[key] || 0,
//                 key,
//               }))
//             )
//             .filter((point) => point.value !== undefined);

//           return {
//             ...chart,
//             data: [...(chart.data || []), ...newPoints].slice(-500),
//           };
//         });

//         setCharts(updatedCharts);
//       } catch (error) {
//         console.error("WebSocket message error:", error);
//       }
//     };

//     ws.onclose = () => console.log("WebSocket closed");

//     return () => ws.close();
//   }, [charts, wsUrl]);

//   // Add a new chart
//   const addChart = () => {
//     const newChart = {
//       id: Date.now(),
//       type: "Line",
//       data: [],
//       yAxisDataKeys: [
//         {
//           id: "yAxis-0",
//           dataKeys: ["AX-LT-011"], // Default data key
//           color: "#0088FE", // Default color
//           lineStyle: "solid", // Default line style
//         },
//       ],
//     };

//     setCharts([...charts, newChart]);
//     setChartDialogOpen(false);
//   };

//   // Delete a chart
//   const deleteChart = (chartId) => {
//     setCharts(charts.filter((chart) => chart.id !== chartId));
//   };

//   // Open configuration dialog
//   const openConfigDialog = (chart) => {
//     setTempChartConfig(chart);
//   };

//   // Save chart configuration
//   const saveConfig = () => {
//     if (tempChartConfig) {
//       const updatedCharts = charts.map((chart) =>
//         chart.id === tempChartConfig.id ? tempChartConfig : chart
//       );
//       setCharts(updatedCharts);
//       setTempChartConfig(null);
//     }
//   };

//   // Add a new Y-axis
//   const addYAxis = () => {
//     setTempChartConfig((prev) => ({
//       ...prev,
//       yAxisDataKeys: [
//         ...prev.yAxisDataKeys,
//         {
//           id: `yAxis-${prev.yAxisDataKeys.length}`,
//           dataKeys: ["AX-LT-011"],
//           color: "#00C49F",
//           lineStyle: "solid",
//         },
//       ],
//     }));
//   };

//   // Update Y-axis property
//   const updateYAxisProperty = (yAxisId, property, value) => {
//     setTempChartConfig((prev) => ({
//       ...prev,
//       yAxisDataKeys: prev.yAxisDataKeys.map((yAxis) =>
//         yAxis.id === yAxisId ? { ...yAxis, [property]: value } : yAxis
//       ),
//     }));
//   };

//   // Render individual chart using lightweight-charts
//   const LightweightChart = ({ chartConfig }) => {
//     const chartContainerRef = useRef(null);
//     const [chartInstance, setChartInstance] = useState(null);
//     const [series, setSeries] = useState([]);

//     useEffect(() => {
//       if (!chartInstance && chartContainerRef.current) {
//         const newChart = createChart(chartContainerRef.current, {
//           width: chartContainerRef.current.clientWidth,
//           height: 300,
//         });
//         setChartInstance(newChart);
//       }
//     }, [chartInstance]);

//     useEffect(() => {
//       if (chartInstance) {
//         // Save current timeScale range to maintain zoom
//         const timeScale = chartInstance.timeScale();
//         const visibleRange = timeScale.getVisibleRange();

//         // Remove old series
//         series.forEach((s) => chartInstance.removeSeries(s));

//         // Add new series based on chart configuration
//         const newSeries = chartConfig.yAxisDataKeys.map((yAxis) => {
//           const lineSeries = chartInstance.addLineSeries({
//             color: yAxis.color,
//             lineWidth: 2,
//             lineStyle: yAxis.lineStyle === "solid" ? 0 : 1,
//           });

//           lineSeries.setData(chartConfig.data.filter((d) => d.key === yAxis.dataKeys[0]));
//           return lineSeries;
//         });

//         setSeries(newSeries);

//         // Restore timeScale range
//         if (visibleRange) {
//           timeScale.setVisibleRange(visibleRange);
//         }
//       }
//     }, [chartInstance, chartConfig]);

//     return <div ref={chartContainerRef} style={{ width: "100%", height: "100%" }} />;
//   };

//   return (
//     <div>
//       <h1>Custom Lightweight Charts</h1>

//       <Box mb={2}>
//         <Button variant="contained" color="primary" onClick={() => setChartDialogOpen(true)}>
//           Add Custom Chart
//         </Button>
//       </Box>

//       {/* Render all charts */}
//       {charts.map((chart) => (
//         <Box key={chart.id} mb={4}>
//           <Typography variant="h6">Chart {chart.id}</Typography>
//           <LightweightChart chartConfig={chart} />
//           <Box mt={1}>
//             <Button onClick={() => openConfigDialog(chart)} color="secondary">
//               Configure Chart
//             </Button>
//             <Button onClick={() => deleteChart(chart.id)} color="error">
//               Delete Chart
//             </Button>
//           </Box>
//         </Box>
//       ))}

//       {/* Add Chart Dialog */}
//       <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
//         <DialogTitle>Add Chart</DialogTitle>
//         <DialogContent>
//           <Button onClick={addChart} variant="contained">
//             Add Line Chart
//           </Button>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setChartDialogOpen(false)}>Cancel</Button>
//         </DialogActions>
//       </Dialog>

//       {/* Configure Chart Dialog */}
//       {tempChartConfig && (
//         <Dialog open={Boolean(tempChartConfig)} onClose={() => setTempChartConfig(null)}>
//           <DialogTitle>Configure Chart</DialogTitle>
//           <DialogContent>
//             {tempChartConfig.yAxisDataKeys.map((yAxis) => (
//               <Box key={yAxis.id} mb={2}>
//                 <FormControl fullWidth>
//                   <InputLabel>Data Key</InputLabel>
//                   <Select
//                     value={yAxis.dataKeys[0]}
//                     onChange={(e) => updateYAxisProperty(yAxis.id, "dataKeys", [e.target.value])}
//                   >
//                     <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//                     <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
//                     <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
//                   </Select>
//                 </FormControl>
//                 <Button onClick={() => setSelectedYAxisId(yAxis.id)}>Pick Color</Button>
//                 {colorPickerOpen && selectedYAxisId === yAxis.id && (
//                   <SketchPicker
//                     color={yAxis.color}
//                     onChangeComplete={(color) =>
//                       updateYAxisProperty(yAxis.id, "color", color.hex)
//                     }
//                   />
//                 )}
//               </Box>
//             ))}
//             <Button onClick={addYAxis} variant="contained">
//               Add Y-Axis
//             </Button>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setTempChartConfig(null)}>Cancel</Button>
//             <Button onClick={saveConfig}>Save</Button>
//           </DialogActions>
//         </Dialog>
//       )}
//     </div>
//   );
// };

// export default CustomCharts;



// import React, { useEffect, useRef, useState } from "react";
// import { createChart } from "lightweight-charts";
// import {
//   Box,
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   Typography,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
// } from "@mui/material";
// import { SketchPicker } from "react-color";

// const CustomCharts = () => {
//   const [charts, setCharts] = useState([]); // Store chart configurations
//   const [tempChartConfig, setTempChartConfig] = useState(null); // Chart being configured
//   const [chartDialogOpen, setChartDialogOpen] = useState(false); // Dialog visibility
//   const [colorPickerOpen, setColorPickerOpen] = useState(false); // Color picker visibility
//   const [selectedYAxisId, setSelectedYAxisId] = useState(null); // Selected Y-axis for color picking
//   const [wsUrl] = useState("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/"); // WebSocket URL
   
//   // WebSocket handling for real-time updates
//   useEffect(() => {
//     const ws = new WebSocket(wsUrl);

//     ws.onmessage = (event) => {
//       try {
//         const message = JSON.parse(event.data);
//         const timestamp = message["PLC-TIME-STAMP"];
//         if (!timestamp) return;

//         const parsedTime = new Date(timestamp).getTime() / 1000;

//         const updatedCharts = charts.map((chart) => {
//           const newPoints = chart.yAxisDataKeys
//             .flatMap((yAxis) =>
//               yAxis.dataKeys.map((key) => ({
//                 time: parsedTime,
//                 value: message[key] || 0,
//                 key,
//               }))
//             )
//             .filter((point) => point.value !== undefined);

//           return {
//             ...chart,
//             data: [...(chart.data || []), ...newPoints].slice(-500),
//           };
//         });

//         setCharts(updatedCharts);
//       } catch (error) {
//         console.error("WebSocket message error:", error);
//       }
//     };

//     ws.onclose = () => console.log("WebSocket closed");

//     return () => ws.close();
//   }, [charts, wsUrl]);

//   // Add a new chart
//   const addChart = () => {
//     const newChart = {
//       id: Date.now(),
//       type: "Line",
//       data: [],
//       yAxisDataKeys: [
//         {
//           id: "yAxis-0",
//           dataKeys: ["AX-LT-011"], // Default data key
//           color: "#0088FE", // Default color
//           lineStyle: "solid", // Default line style
//         },
//       ],
//     };

//     setCharts([...charts, newChart]);
//     setChartDialogOpen(false);
//   };

//   // Delete a chart
//   const deleteChart = (chartId) => {
//     setCharts(charts.filter((chart) => chart.id !== chartId));
//   };

//   // Open configuration dialog
//   const openConfigDialog = (chart) => {
//     setTempChartConfig(chart);
//   };

//   // Save chart configuration
//   const saveConfig = () => {
//     if (tempChartConfig) {
//       const updatedCharts = charts.map((chart) =>
//         chart.id === tempChartConfig.id ? tempChartConfig : chart
//       );
//       setCharts(updatedCharts);
//       setTempChartConfig(null);
//     }
//   };

//   // Add a new Y-axis
//   const addYAxis = () => {
//     setTempChartConfig((prev) => ({
//       ...prev,
//       yAxisDataKeys: [
//         ...prev.yAxisDataKeys,
//         {
//           id: `yAxis-${prev.yAxisDataKeys.length}`,
//           dataKeys: ["CW-TT-011"],
//           color: "#00C49F",
//           lineStyle: "solid",
//         },
//       ],
//     }));
//   };

//   // Update Y-axis property
//   const updateYAxisProperty = (yAxisId, property, value) => {
//     setTempChartConfig((prev) => ({
//       ...prev,
//       yAxisDataKeys: prev.yAxisDataKeys.map((yAxis) =>
//         yAxis.id === yAxisId ? { ...yAxis, [property]: value } : yAxis
//       ),
//     }));
//   };

//   // Render individual chart using lightweight-charts
//   const LightweightChart = ({ chartConfig }) => {
//     const chartContainerRef = useRef(null);
//     const [chartInstance, setChartInstance] = useState(null);
//     const [series, setSeries] = useState([]);

//     useEffect(() => {
//       if (!chartInstance && chartContainerRef.current) {
//         const newChart = createChart(chartContainerRef.current, {
//           width: chartContainerRef.current.clientWidth,
//           height: 300,
//         });
//         setChartInstance(newChart);
//       }
//     }, [chartInstance]);

//     useEffect(() => {
//       if (chartInstance) {
//         // Remove old series
//         series.forEach((s) => chartInstance.removeSeries(s));

//         // Add new series based on chart configuration
//         const newSeries = chartConfig.yAxisDataKeys.map((yAxis) => {
//           const lineSeries = chartInstance.addLineSeries({
//             color: yAxis.color,
//             lineWidth: 2,
//             lineStyle: yAxis.lineStyle === "solid" ? 0 : 1,
//           });

//           lineSeries.setData(chartConfig.data.filter((d) => d.key === yAxis.dataKeys[0]));
//           return lineSeries;
//         });

//         setSeries(newSeries);
//       }
//     }, [chartInstance, chartConfig]);

//     return <div ref={chartContainerRef} style={{ width: "100%", height: "400" }} />;
//   };

//   return (
//     <div>
//       <h1>Custom Lightweight Charts</h1>

//       <Box mb={2}>
//         <Button variant="contained" color="primary" onClick={() => setChartDialogOpen(true)}>
//           Add Custom Chart
//         </Button>
//       </Box>

//       {/* Render all charts */}
//       {charts.map((chart) => (
//         <Box key={chart.id} mb={4}>
//           <Typography variant="h6">Chart {chart.id}</Typography>
//           <LightweightChart chartConfig={chart} />
//           <Box mt={1}>
//             <Button onClick={() => openConfigDialog(chart)} color="secondary">
//               Configure Chart
//             </Button>
//             <Button onClick={() => deleteChart(chart.id)} color="error">
//               Delete Chart
//             </Button>
//           </Box>
//         </Box>
//       ))}

//       {/* Add Chart Dialog */}
//       <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
//         <DialogTitle>Add Chart</DialogTitle>
//         <DialogContent>
//           <Button onClick={addChart} variant="contained">
//             Add Line Chart
//           </Button>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setChartDialogOpen(false)}>Cancel</Button>
//         </DialogActions>
//       </Dialog>

//       {/* Configure Chart Dialog */}
//       {tempChartConfig && (
//         <Dialog open={Boolean(tempChartConfig)} onClose={() => setTempChartConfig(null)}>
//           <DialogTitle>Configure Chart</DialogTitle>
//           <DialogContent>
//             {tempChartConfig.yAxisDataKeys.map((yAxis) => (
//               <Box key={yAxis.id} mb={2}>
//                 <FormControl fullWidth>
//                   <InputLabel>Data Key</InputLabel>
//                   <Select
//                     value={yAxis.dataKeys[0]}
//                     onChange={(e) => updateYAxisProperty(yAxis.id, "dataKeys", [e.target.value])}
//                   >
//                     <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//                     <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
//                     <MenuItem value=" CW-TT-011">CW-TT-011</MenuItem>
//                   </Select>
//                 </FormControl>
//                 <Button onClick={() => setSelectedYAxisId(yAxis.id)}>Pick Color</Button>
//                 {colorPickerOpen && selectedYAxisId === yAxis.id && (
//                   <SketchPicker
//                     color={yAxis.color}
//                     onChangeComplete={(color) =>
//                       updateYAxisProperty(yAxis.id, "color", color.hex)
//                     }
//                   />
//                 )}
//               </Box>
//             ))}
//             <Button onClick={addYAxis} variant="contained">
//               Add Y-Axis
//             </Button>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setTempChartConfig(null)}>Cancel</Button>
//             <Button onClick={saveConfig}>Save</Button>
//           </DialogActions>
//         </Dialog>
//       )}
//     </div>
//   );
// };

// export default CustomCharts;

// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   setLayout,
//   addChart,
//   removeChart,
//   updateChart,
// } from "../../redux/layoutActions";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   ScatterChart,
//   Scatter,
//   PieChart,
//   Pie,
//   Cell,
// } from "recharts";
// import GridLayout from "react-grid-layout";
// import {
//   Box,
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   Typography,
//   IconButton,
//   InputLabel,
//   FormControl,
//   Select,
//   MenuItem,
//   useTheme,
// } from "@mui/material";
// import DeleteIcon from "@mui/icons-material/Delete";
// import DragHandleIcon from "@mui/icons-material/DragHandle";
// import { debounce } from "lodash";
// import { tokens } from "../../theme";
// import { useWebSocket } from "src/WebSocketProvider";
// import { SketchPicker } from "react-color";
// // Colors for the chart
// const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
// const Max_data_point = 20;

// const CustomCharts = () => {
//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);

//   const dispatch = useDispatch();
//   const charts = useSelector((state) => state.layout.customCharts);
//   const layout = useSelector((state) => state.layout.customChartsLayout);
//   const [chartDialogOpen, setChartDialogOpen] = useState(false);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [tempChartData, setTempChartData] = useState(null);
//   const websocketData = useWebSocket();
//   const [colorPickerOpen, setColorPickerOpen] = useState(false);
//   const [selectedYAxisId, setSelectedYAxisId] = useState(null);
//   // Load saved charts and layout when the component mounts

//   useEffect(() => {
//     const savedLayout = JSON.parse(localStorage.getItem("customChartsLayout")) || [];
//     dispatch(setLayout(savedLayout, "customCharts"));
//   }, [dispatch]);
  
//   // Save layout changes (debounced to avoid excessive dispatches)
//   const saveLayout = debounce((newLayout) => {
//     dispatch(setLayout(newLayout, "custom"));
//     localStorage.setItem("customChartsLayout", JSON.stringify(newLayout));
//   }, 500);

//   // Add a new custom chart of the specified type
//   const addCustomChart = (type) => {
//     const newChartId = Date.now();
//     const newChart = {
//       id: newChartId,
//       type,
//       data: [], // Initially empty, will be populated via WebSocket
//       xAxisDataKey: "",
//       yAxisDataKeys: [
//         {
//           id: "left-0",
//           dataKeys: ["AX-LT-011"],
//           range: "0-500",
//           color: "#ca33e8",
//           lineStyle: "solid",
//         },
//       ],
//     };
//     dispatch(addChart(newChart, "custom"));
//     saveLayout([
//       ...layout,
//       { i: newChartId.toString(), x: 0, y: Infinity, w: 6, h: 8 },
//     ]);
//     setChartDialogOpen(false);
//   };

//   // Remove a chart and update layout accordingly
//   const deleteChart = (chartId) => {
//     dispatch(removeChart(chartId, "custom"));
//     saveLayout(layout.filter((l) => l.i !== chartId.toString()));
//   };
 
//   // Open the configuration dialog for a specific chart
//   const openDialog = (chart) => {
//     setTempChartData(chart);
//     setDialogOpen(true);
//   };

//   // Save configuration changes to Redux and close the dialog
//   const saveConfiguration = () => {
//     if (tempChartData) {
//       dispatch(updateChart(tempChartData, "custom"));
//       setDialogOpen(false);
//     }
//   };

//   // WebSocket connection and data handling
//   useEffect(() => {
//     const ws = new WebSocket(
//       "wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/"
//     );
  
//     ws.onmessage = (event) => {
//       const message = JSON.parse(event.data);
  
//       const updatedCharts = charts.map((chart) => {
//         if (
//           chart.yAxisDataKeys.some((yAxis) =>
//             yAxis.dataKeys.includes("AX-LT-011")
//           )
//         ) {
//           // Append new data point
//           const newData = [...chart.data, message];
          
//           // Ensure we only keep the latest Max_data_point data points
//           const limitedData = newData.slice(-Max_data_point); // Keep only the last Max_data_point data points
          
//           return {
//             ...chart,
//             data: limitedData, // Update the chart with the limited data
//           };
//         }
//         return chart;
//       });
  
//       updatedCharts.forEach((chart) => dispatch(updateChart(chart, "custom")));
//     };
  
//     ws.onclose = () => console.log("WebSocket connection closed");
  
//     return () => ws.close(); // Clean up on component unmount
//   }, [charts, dispatch]);

//   const closeDialog = () => setDialogOpen(false);

//   const handleDataKeyChange = (yAxisId, event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
//         yAxis.id === yAxisId ? { ...yAxis, dataKeys: value } : yAxis
//       ),
//     }));
//   };

//   const handleXAxisDataKeyChange = (event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       xAxisDataKey: value,
//     }));
//   };

//   const handleLineStyleChange = (yAxisId, event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
//         yAxis.id === yAxisId ? { ...yAxis, lineStyle: value } : yAxis
//       ),
//     }));
//   };

//   const handleRangeChange = (yAxisId, event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
//         yAxis.id === yAxisId ? { ...yAxis, range: value } : yAxis
//       ),
//     }));
//   };

//   const addYAxis = () => {
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: [
//         ...prevChart.yAxisDataKeys,
//         {
//           id: `left-${prevChart.yAxisDataKeys.length}`,
//           dataKeys: [],
//           range: "0-500",
//           color: "#279096",
//           lineStyle: "solid",
//         },
//       ],
//     }));
//   };

//   const deleteYAxis = (yAxisId) => {
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.filter(
//         (yAxis) => yAxis.id !== yAxisId
//       ),
//     }));
//   };
//   const openColorPicker = (yAxisId) => {
//     setSelectedYAxisId(yAxisId);
//     setColorPickerOpen(true);
//   };
//   const handleColorChange = (color) => {
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
//         yAxis.id === selectedYAxisId ? { ...yAxis, color: color.hex } : yAxis
//       ),
//     }));
//     setColorPickerOpen(false);
//   };

//   const getYAxisDomain = (range) => {
//     switch (range) {
//       case "0-500":
//         return [0, 500];
//       case "0-100":
//         return [0, 100];
//       case "0-1200":
//         return [0, 1200];
//       default:
//         return [0, 500];
//     }
//   };

//   const getLineStyle = (lineStyle) => {
//     switch (lineStyle) {
//       case "solid":
//         return "";
//       case "dotted":
//         return "1 1";
//       case "dashed":
//         return "5 5";
//       case "dot-dash":
//         return "3 3 1 3";
//       case "dash-dot-dot":
//         return "3 3 1 1 1 3";
//       default:
//         return "";
//     }
//   };
//   const renderChart = (chart) => {
//     switch (chart.type) {
//       case "Line":
//         return renderLineChart(chart);
//           default:
//         return null;
//     }
//   };

//   const renderLineChart = (chart) => (
//     <ResponsiveContainer width="100%" height="100%">
//       <LineChart data={chart.data}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis
       
//         />
//         {chart.yAxisDataKeys.map((yAxis) => (
//           <YAxis
//             key={yAxis.id}
//             yAxisId={yAxis.id}
//             domain={getYAxisDomain(yAxis.range)}
//             stroke={yAxis.color}
//           />
//         ))}
//         <Tooltip
//         cursor={{ strokeDasharray: '3 3' }}
//         content={({ payload }) => {
//           if (payload && payload.length) {
//             const point = payload[0].payload;
//             return (
//               <div className="custom-tooltip">
//                 {chart.yAxisDataKeys.map((yAxis) => (
                  
//                   <p key={yAxis.id}>
//                     {`Y (${yAxis.dataKeys[0]}): ${point[yAxis.dataKeys[0]]}`}
//                   </p>
                  
//                 ))}
                
//                 <p>
//                 {`Timestamp: ${new Date(new Date(websocketData.timestamp).getTime() + (5.5 * 60 * 60 * 1000)).toLocaleString('en-IN', {
//                   hour12: true,  // Optional: If you want a 12-hour format with AM/PM
//                   weekday: 'short', // Optional: To include the weekday name
//                   year: 'numeric',
//                   month: 'short',
//                   day: 'numeric',
//                   hour: '2-digit',
//                   minute: '2-digit',
//                   second: '2-digit'
//                 })}`}
//               </p>
//               </div>
//             );
//           }
//           return null;
//         }}
         
//       />
//       <Legend />
//         {chart.yAxisDataKeys.map((yAxis) =>
//           yAxis.dataKeys.map((key) => (
//             <Line
//               key={key}
//               dataKey={key}
//               fill={yAxis.color}
//               yAxisId={yAxis.id}
//               stroke={yAxis.color}
//               strokeDasharray={getLineStyle(yAxis.lineStyle)}
//             />
//           ))
//         )}
//       </LineChart>
//     </ResponsiveContainer>
//   );
//   return (
//     <>
//       <Box display="flex" justifyContent="flex-end" >
//         <Button color="secondary" variant="contained" onClick={() => setChartDialogOpen(true)}>
//           Add Custom Chart
//         </Button>
//       </Box>
//       <GridLayout
//         className="layout"
//         layout={layout}
//         cols={12}
//         rowHeight={30}
//         width={1630}
//         onLayoutChange={saveLayout}
//         draggableHandle=".drag-handle"
//       >
//         {charts.map((chart) => (
//           <Box
//             key={chart.id}
//             data-grid={
//               layout.find((l) => l.i === chart.id.toString()) || {
//                 x: 0,
//                 y: Infinity,
//                 w: 6,
//                 h: 8,
//               }
//             }
//             sx={{
//               position: "relative",
//               border: "1px solid #ccc",
//               borderRadius: "8px",
//               overflow: "hidden",
//             }}
//           >
//             <Box
//               display="flex"
//               justifyContent="space-between"
//               p={2}
             
//             >
//               <IconButton className="drag-handle">
//                 <DragHandleIcon />
//               </IconButton>
//               <Typography variant="h6">{chart.type} Chart</Typography>
//               <IconButton
//                 onClick={() => deleteChart(chart.id)}
//                 style={{ cursor: "pointer" }}
//               >
//                 <DeleteIcon />
//               </IconButton>
//             </Box>
//             <Box sx={{ height: "calc(100% - 80px)" }}>{renderChart(chart)}</Box>
//             <Box
//               display="flex"
//               justifyContent="space-between"
//               p={2}
//               marginTop={-6}
//             >
//               <Button
//                 variant="outlined"
//                 color="secondary"
//                 onClick={() => openDialog(chart)}
//               >
//                 Configure Chart
//               </Button>
//             </Box>
//           </Box>
//         ))}
//       </GridLayout>
//       <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
//         <DialogTitle>Select Chart Type</DialogTitle>
//         <DialogContent>
//           <Box display="flex" flexDirection="column" gap={2}>
//             <Button variant="contained" onClick={() => addCustomChart("Line")}>
//               Add Line Chart
//             </Button>
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setChartDialogOpen(false)} color="secondary">
//             Cancel
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {tempChartData && (
//         <Dialog
//           open={dialogOpen}
//           onClose={closeDialog}
//           fullWidth
//           maxWidth="md"
//           marginBottom="5px"
//         >
//           <DialogTitle>Configure Chart</DialogTitle>
//           <DialogContent>
//             <Box
//               display="flex"
//               flexDirection="column"
//               maxHeight="400px"
//               overflow="auto"
//             >
//               {tempChartData.yAxisDataKeys.map((yAxis, index) => (
//                 <Box
//                   key={yAxis.id}
//                   display="flex"
//                   flexDirection="column"
//                   marginBottom={2}
//                 >
//                   <Box
//                     display="flex"
//                     justifyContent="space-between"
//                     alignItems="center"
//                   >
//                     <Typography variant="h6">Y-Axis {index + 1}</Typography>
//                     <IconButton onClick={() => deleteYAxis(yAxis.id)}>
//                       <DeleteIcon />
//                     </IconButton>
//                   </Box>
//                   <FormControl fullWidth margin="normal">
//                     <InputLabel>Data Keys</InputLabel>
//                     <Select
//                       multiple  
//                       value={yAxis.dataKeys}
//                       onChange={(event) => handleDataKeyChange(yAxis.id, event)}
//                     >
//                       <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//                       <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
//                                        </Select>
//                   </FormControl>
//                   <FormControl fullWidth margin="normal">
//                     <InputLabel>Range</InputLabel>
//                     <Select
//                       value={yAxis.range}
//                       onChange={(event) => handleRangeChange(yAxis.id, event)}
//                     >
//                       <MenuItem value="0-100">0-100</MenuItem>
//                       <MenuItem value="0-500">0-500</MenuItem>
//                       <MenuItem value="0-1200">0-1200</MenuItem>
//                     </Select>
//                   </FormControl>
//                   <FormControl fullWidth margin="normal">
//                     <InputLabel>Line Style</InputLabel>
//                     <Select
//                       value={yAxis.lineStyle}
//                       onChange={(event) =>
//                         handleLineStyleChange(yAxis.id, event)
//                       }
//                     >
//                       <MenuItem value="solid">Solid</MenuItem>
//                       <MenuItem value="dotted">Dotted</MenuItem>
//                       <MenuItem value="dashed">Dashed</MenuItem>
//                       <MenuItem value="dot-dash">Dot Dash</MenuItem>
//                       <MenuItem value="dash-dot-dot">Dash Dot Dot</MenuItem>
//                     </Select>
//                   </FormControl>
//                   <Button color="secondary" onClick={() => openColorPicker(yAxis.id)}>
//                   Select Color
//                 </Button>
//                 {colorPickerOpen && selectedYAxisId === yAxis.id && (
//                   <SketchPicker
//                     color={yAxis.color}
//                     onChangeComplete={handleColorChange}
//                   />
//                 )}
//                 </Box>
//               ))}
//               <Button variant="contained" color="secondary" onClick={addYAxis}>
//                 Add Y-Axis
//               </Button>
//             </Box>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={closeDialog} color="secondary">
//               Cancel
//             </Button>
//             <Button onClick={saveConfiguration} color="secondary">
//               Save
//             </Button>
//           </DialogActions>
//         </Dialog>
//       )}
//     </>
//   );
// };

// export default CustomCharts;


// import React, { useEffect, useRef, useState } from "react";
// import { createChart } from "lightweight-charts";
// import {
//   Box,
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   Typography,
//   IconButton,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
// } from "@mui/material";
// import { SketchPicker } from "react-color";
// import DeleteIcon from "@mui/icons-material/Delete";
// import DragHandleIcon from "@mui/icons-material/DragHandle";
// import GridLayout from "react-grid-layout";
// import { debounce } from "lodash";

// const App = () => {
//   const chartContainerRef = useRef(null);
//   const [chart, setChart] = useState(null);
//   const [lineSeries, setLineSeries] = useState([]);
//   const [data, setData] = useState([]);
//   const [wsUrl] = useState("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");

//   const [chartConfig, setChartConfig] = useState([]); // Dynamic chart configurations
//   const [layout, setLayout] = useState([]); // Layout for charts
//   const [chartDialogOpen, setChartDialogOpen] = useState(false);
//   const [tempConfig, setTempConfig] = useState(null);
//   const [colorPickerOpen, setColorPickerOpen] = useState(false);
//   const [selectedYAxisId, setSelectedYAxisId] = useState(null);

//   const MaxDataPoints = 500; // Limit the number of points per chart

//   // Initialize chart container
//   useEffect(() => {
//     if (!chart && chartContainerRef.current) {
//       const newChart = createChart(chartContainerRef.current, {
//         width: chartContainerRef.current.clientWidth,
//         height: 400,
//       });
//       setChart(newChart);
//     }
//   }, [chart]);

//   // Load layout from local storage
//   useEffect(() => {
//     const savedLayout = JSON.parse(localStorage.getItem("chartLayout")) || [];
//     setLayout(savedLayout);
//   }, []);

//   // Save layout to local storage (debounced)
//   const saveLayout = debounce((newLayout) => {
//     setLayout(newLayout);
//     localStorage.setItem("chartLayout", JSON.stringify(newLayout));
//   }, 500);

//   // WebSocket connection for real-time data
//   useEffect(() => {
//     const ws = new WebSocket(wsUrl);

//     ws.onmessage = (event) => {
//       const message = JSON.parse(event.data);
//       const timestamp = message["PLC-TIME-STAMP"];
//       if (!timestamp) return;

//       const parsedDate = new Date(timestamp).getTime() / 1000;

//       // Update chartConfig data
//       const updatedConfigs = chartConfig.map((config) => {
//         const newPoints = config.yAxisDataKeys
//           .flatMap((yAxis) =>
//             yAxis.dataKeys.map((key) => ({
//               time: parsedDate,
//               value: message[key] || 0,
//               key,
//             }))
//           )
//           .filter((point) => point.value !== undefined);

//         return {
//           ...config,
//           data: [...(config.data || []), ...newPoints].slice(-MaxDataPoints),
//         };
//       });

//       setChartConfig(updatedConfigs);
//     };

//     ws.onclose = () => console.log("WebSocket connection closed");

//     return () => ws.close();
//   }, [chartConfig, wsUrl]);

//   // Update chart when configurations change
//   useEffect(() => {
//     if (chart) {
//       lineSeries.forEach((series) => chart.removeSeries(series));
//       const newSeries = chartConfig.flatMap((config) =>
//         config.yAxisDataKeys.map((yAxis) =>
//           yAxis.dataKeys.map((key) => {
//             const series = chart.addLineSeries({
//               color: yAxis.color,
//               lineWidth: 2,
//               lineStyle: yAxis.lineStyle === "solid" ? 0 : 1,
//             });
//             series.setData(config.data.filter((d) => d.key === key));
//             return series;
//           })
//         )
//       );
//       setLineSeries(newSeries.flat());
//     }
//   }, [chartConfig, chart]);

//   // Add new chart
//   const addChart = () => {
//     const newConfig = {
//       id: Date.now(),
//       yAxisDataKeys: [
//         {
//           id: "yAxis-0",
//           dataKeys: ["AX-LT-011"],
//           range: "0-500",
//           color: "#0088FE",
//           lineStyle: "solid",
//         },
//       ],
//       data: [],
//     };
//     setChartConfig([...chartConfig, newConfig]);
//     setChartDialogOpen(false);

//     setLayout([
//       ...layout,
//       { i: newConfig.id.toString(), x: 0, y: Infinity, w: 6, h: 8 },
//     ]);
//     saveLayout(layout);
//   };

//   // Delete a chart
//   const deleteChart = (chartId) => {
//     setChartConfig(chartConfig.filter((config) => config.id !== chartId));
//     const updatedLayout = layout.filter((l) => l.i !== chartId.toString());
//     setLayout(updatedLayout);
//     saveLayout(updatedLayout);
//   };

//   // Open configuration dialog
//   const openConfigDialog = (config) => {
//     setTempConfig(config);
//   };

//   // Save configuration changes
//   const saveConfig = () => {
//     if (tempConfig) {
//       const updatedConfigs = chartConfig.map((config) =>
//         config.id === tempConfig.id ? tempConfig : config
//       );
//       setChartConfig(updatedConfigs);
//       setTempConfig(null);
//     }
//   };

//   // Update Y-axis property
//   const updateYAxisProperty = (yAxisId, property, value) => {
//     setTempConfig((prev) => ({
//       ...prev,
//       yAxisDataKeys: prev.yAxisDataKeys.map((yAxis) =>
//         yAxis.id === yAxisId ? { ...yAxis, [property]: value } : yAxis
//       ),
//     }));
//   };

//   return (
//     <div>
//       <h1>Dynamic Real-Time Charts</h1>
//       <Box>
//         <Button
//           variant="contained"
//           color="primary"
//           onClick={() => setChartDialogOpen(true)}
//         >
//           Add Chart
//         </Button>
//       </Box>
//       <GridLayout
//         className="layout"
//         layout={layout}
//         cols={12}
//         rowHeight={30}
//         width={1630}
//         onLayoutChange={saveLayout}
//         draggableHandle=".drag-handle"
//       >
//         {chartConfig.map((config) => (
//           <Box
//             key={config.id}
//             data-grid={layout.find((l) => l.i === config.id.toString()) || {}}
//             sx={{
//               border: "1px solid #ccc",
//               borderRadius: "8px",
//               overflow: "hidden",
//             }}
//           >
//             <Box display="flex" justifyContent="space-between" p={2}>
//               <IconButton className="drag-handle">
//                 <DragHandleIcon />
//               </IconButton>
//               <Typography variant="h6">Line Chart</Typography>
//               <IconButton
//                 onClick={() => deleteChart(config.id)}
//                 style={{ cursor: "pointer" }}
//               >
//                 <DeleteIcon />
//               </IconButton>
//             </Box>
//             <Box>{/* Chart Rendering */}</Box>
//             <Button
//               variant="outlined"
//               color="secondary"
//               onClick={() => openConfigDialog(config)}
//             >
//               Configure
//             </Button>
//           </Box>
//         ))}
//       </GridLayout>

//       {/* Add Chart Dialog */}
//       <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
//         <DialogTitle>Add Chart</DialogTitle>
//         <DialogContent>
//           <Button onClick={addChart}>Add Line Chart</Button>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setChartDialogOpen(false)}>Cancel</Button>
//         </DialogActions>
//       </Dialog>

//       {/* Configure Chart Dialog */}
//       {tempConfig && (
//         <Dialog open={Boolean(tempConfig)} onClose={() => setTempConfig(null)}>
//           <DialogTitle>Configure Chart</DialogTitle>
//           <DialogContent>
//             {tempConfig.yAxisDataKeys.map((yAxis) => (
//               <div key={yAxis.id}>
//                 <FormControl fullWidth>
//                   <InputLabel>Data Key</InputLabel>
//                   <Select
//                     value={yAxis.dataKeys[0]}
//                     onChange={(e) =>
//                       updateYAxisProperty(yAxis.id, "dataKeys", [e.target.value])
//                     }
//                   >
//                     <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//                     <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
//                   </Select>
//                 </FormControl>
//                 <Button onClick={() => setSelectedYAxisId(yAxis.id)}>
//                   Pick Color
//                 </Button>
//                 {colorPickerOpen && selectedYAxisId === yAxis.id && (
//                   <SketchPicker
//                     color={yAxis.color}
//                     onChangeComplete={(color) =>
//                       updateYAxisProperty(yAxis.id, "color", color.hex)
//                     }
//                   />
//                 )}
//               </div>
//             ))}
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setTempConfig(null)}>Cancel</Button>
//             <Button onClick={saveConfig}>Save</Button>
//           </DialogActions>
//         </Dialog>
//       )}
//     </div>
//   );
// };

// export default App;





// import React, { useEffect, useRef, useState } from 'react';
// import { createChart } from 'lightweight-charts';

// // WebSocket message handler
// const handleWebSocketMessage = (event, setChartData) => {
//   try {
//     const data = JSON.parse(event.data);
    
//     // Parse the timestamp
//     const timestamp = data["PLC-TIME-STAMP"];
//     if (!timestamp) {
//       console.error("Timestamp missing in data:", data);
//       return; // Skip processing if no timestamp
//     }
//     const parsedDate = new Date(timestamp);
//     if (isNaN(parsedDate)) {
//       console.error("Invalid date:", timestamp);
//       return; // Skip if timestamp is invalid
//     }

//     // Specify the keys you want to track
//     const selectedKeys = ["AX-LT-011"];
    
//     // Filter out unwanted keys and process only the selected ones
//     const dataPoints = selectedKeys
//       .filter(key => data[key] !== undefined)  // Only include keys that are present in the message
//       .map(key => ({
//         time: parsedDate.getTime() / 1000, // Convert to seconds
//         value: data[key],  // Real-time value for the selected tags
//         key: key           // The tag name (e.g., "AX-LT-011")
//       }));

//     // Update the chart with the new data
//     setChartData(prevData => {
//       const newData = [...prevData];
//       dataPoints.forEach((point) => {
//         const existingSeries = newData.find(series => series.key === point.key);
//         if (existingSeries) {
//           existingSeries.data.push({ time: point.time, value: point.value });
//         } else {
//           newData.push({ key: point.key, data: [{ time: point.time, value: point.value }] });
//         }
//       });
//       return newData;
//     });

//   } catch (error) {
//     console.error("Error handling WebSocket message:", error);
//   }
// };

// // WebSocket Provider Component
// const WebSocketProvider = ({ url, setChartData }) => {
//   useEffect(() => {
//     const ws = new WebSocket(url);
    
//     ws.onopen = () => {
//       console.log("WebSocket connection established");
//     };

//     ws.onmessage = (event) => handleWebSocketMessage(event, setChartData); // Handle incoming messages

//     ws.onerror = (error) => {
//       console.error("WebSocket error:", error);
//     };

//     ws.onclose = () => {
//       console.log("WebSocket connection closed");
//     };

//     return () => {
//       if (ws) {
//         ws.close();
//       }
//     };
//   }, [url, setChartData]);

//   return (
//     <div>
//       <div>WebSocket connection is open.</div>
//     </div>
//   );
// };

// // Chart Component with Lightweight Charts
// const ChartComponent = ({ data }) => {
//   const chartContainerRef = useRef(null);
//   const [chart, setChart] = useState(null);
//   const [lineSeries, setLineSeries] = useState([]);

//   // Handle state changes to update chart
//   useEffect(() => {
//     if (data && data.length > 0 && chartContainerRef.current && !chart) {
//       // Initialize the chart only once when data is available
//       const newChart = createChart(chartContainerRef.current, {
//         width: chartContainerRef.current.clientWidth,
//         height: 400,
//         crosshair: { mode: 0 },
//         zoomPan: {
//           panEnabled: true,
//           zoomEnabled: true,
//           pinchToZoom: true,
//           mouseWheel: { zoom: true },
//         },
//       });

//       // Set up line series for each tag
//       const series = data.map(item => {
//         const line = newChart.addLineSeries({
//           color: 'rgb(75,192,192)',
//           lineWidth: 2,
//         });
//         return { key: item.key, series: line };
//       });

//       setChart(newChart);
//       setLineSeries(series);  // Store the series for later updates
//     }
//   }, [data]);

//   // Update chart data dynamically when new data is added
//   useEffect(() => {
//     if (lineSeries && data && data.length > 0) {
//       // Ensure each series gets updated with its respective data
//       lineSeries.forEach(series => {
//         const chartData = data.find(d => d.key === series.key);
//         if (chartData) {
//           series.series.setData(chartData.data);  // Set the data for the line series
//         }
//       });
//     }
//   }, [data, lineSeries]);

//   // Tooltip for hovering over data points
//   useEffect(() => {
//     if (chart) {
//       // Subscribe to crosshair move event to display tooltips
//       chart.subscribeCrosshairMove(function (param) {
//         const hoveredPoint = param?.point;
//         if (hoveredPoint && param?.seriesData) {
//           const tooltipText = Object.keys(param.seriesData).map((key) => {
//             const value = param.seriesData[key]?.value;
//             return `${key}: ${value}`;
//           }).join('\n');

//           // Display tooltip manually using the hovered data
//           const tooltip = document.getElementById('tooltip');
//           if (tooltip) {
//             tooltip.innerHTML = tooltipText;
//             tooltip.style.left = `${hoveredPoint.x + 10}px`;
//             tooltip.style.top = `${hoveredPoint.y + 10}px`;
//             tooltip.style.display = 'block';
//           }
//         } else {
//           // Hide tooltip when no point is hovered
//           const tooltip = document.getElementById('tooltip');
//           if (tooltip) {
//             tooltip.style.display = 'none';
//           }
//         }
//       });
//     }
//   }, [chart]);

//   return (
//     <div>
//       <div ref={chartContainerRef} style={{ position: 'relative', width: '100%' }}>
//         {chart ? null : <div>Loading chart...</div>}
//       </div>

//       {/* Tooltip div */}
//       <div
//         id="tooltip"
//         style={{
//           position: 'absolute',
//           background: 'rgba(0, 0, 0, 0.7)',
//           color: 'white',
//           padding: '5px',
//           borderRadius: '3px',
//           display: 'none',
//           pointerEvents: 'none',
//           zIndex: 10,
//         }}
//       />
//     </div>
//   );
// };

// // Main App Component
// const App = () => {
//   const [data, setData] = useState([]);
//   const [wsUrl] = useState('wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/');  // Replace with your WebSocket URL

//   return (
//     <div>
//       <h1>Real-Time WebSocket Chart Example</h1>
      
//       {/* WebSocket Provider to handle data reception */}
//       <WebSocketProvider url={wsUrl} setChartData={setData} />
      
//       {/* ChartComponent to display data */}
//       <ChartComponent data={data} />
//     </div>
//   );
// };

// export default App;




// import React, { useEffect, useRef, useState } from 'react';
// import { createChart } from 'lightweight-charts';

// // WebSocket message handler
// const handleWebSocketMessage = (event, setChartData) => {
//   try {
//     const data = JSON.parse(event.data);
    
//     // Parse the timestamp
//     const timestamp = data["PLC-TIME-STAMP"];
//     if (!timestamp) {
//       console.error("Timestamp missing in data:", data);
//       return; // Skip processing if no timestamp
//     }
//     const parsedDate = new Date(timestamp);
//     if (isNaN(parsedDate)) {
//       console.error("Invalid date:", timestamp);
//       return; // Skip if timestamp is invalid
//     }

//     // Specify the keys you want to track
//     const selectedKeys = ["AX-LT-011", "AX-LT-021", "CW-TT-011", "CR-FT-001"];
    
//     // Filter out unwanted keys and process only the selected ones
//     const dataPoints = selectedKeys
//       .filter(key => data[key] !== undefined)  // Only include keys that are present in the message
//       .map(key => ({
//         time: parsedDate.getTime() / 1000, // Convert to seconds
//         value: data[key],  // Real-time value for the selected tags
//         key: key           // The tag name (e.g., "AX-LT-011")
//       }));

//     // Update the chart with the new data
//     setChartData(prevData => {
//       const newData = [...prevData];
//       dataPoints.forEach((point) => {
//         const existingSeries = newData.find(series => series.key === point.key);
//         if (existingSeries) {
//           existingSeries.data.push({ time: point.time, value: point.value });
//         } else {
//           newData.push({ key: point.key, data: [{ time: point.time, value: point.value }] });
//         }
//       });
//       return newData;
//     });

//   } catch (error) {
//     console.error("Error handling WebSocket message:", error);
//   }
// };

// // WebSocket Provider Component
// const WebSocketProvider = ({ url, setChartData }) => {
//   useEffect(() => {
//     const ws = new WebSocket(url);
    
//     ws.onopen = () => {
//       console.log("WebSocket connection established");
//     };

//     ws.onmessage = (event) => handleWebSocketMessage(event, setChartData); // Handle incoming messages

//     ws.onerror = (error) => {
//       console.error("WebSocket error:", error);
//     };

//     ws.onclose = () => {
//       console.log("WebSocket connection closed");
//     };

//     return () => {
//       if (ws) {
//         ws.close();
//       }
//     };
//   }, [url, setChartData]);

//   return (
//     <div>
//       <div>WebSocket connection is open.</div>
//     </div>
//   );
// };

// // Chart Component with Lightweight Charts
// const ChartComponent = ({ data }) => {
//   const chartContainerRef = useRef(null);
//   const [chart, setChart] = useState(null);
//   const [lineSeries, setLineSeries] = useState([]);

//   // Handle state changes to update chart
//   useEffect(() => {
//     if (data && data.length > 0 && chartContainerRef.current && !chart) {
//       // Initialize the chart only once when data is available
//       const newChart = createChart(chartContainerRef.current, {
//         width: chartContainerRef.current.clientWidth,
//         height: 400,
//         crosshair: { mode: 0 },
//         zoomPan: {
//           panEnabled: true,
//           zoomEnabled: true,
//           pinchToZoom: true,
//           mouseWheel: { zoom: true },
//         },
//       });

//       // Set up line series for each tag
//       const series = data.map(item => {
//         const line = newChart.addLineSeries({
//           color: 'rgb(75,192,192)',
//           lineWidth: 2,
//         });
//         return { key: item.key, series: line };
//       });

//       setChart(newChart);
//       setLineSeries(series);  // Store the series for later updates
//     }
//   }, [data]);

//   // Update chart data dynamically when new data is added
//   useEffect(() => {
//     if (lineSeries && data && data.length > 0) {
//       // Ensure each series gets updated with its respective data
//       lineSeries.forEach(series => {
//         const chartData = data.find(d => d.key === series.key);
//         if (chartData) {
//           series.series.setData(chartData.data);  // Set the data for the line series
//         }
//       });
//     }
//   }, [data, lineSeries]);

//   // Tooltip for hovering over data points
//   useEffect(() => {
//     if (chart) {
//       // Subscribe to crosshair move event to display tooltips
//       chart.subscribeCrosshairMove(function (param) {
//         const hoveredPoint = param?.point;
//         if (hoveredPoint && param?.seriesData) {
//           const tooltipText = Object.keys(param.seriesData).map((key) => {
//             const value = param.seriesData[key]?.value;
//             return `${key}: ${value}`;
//           }).join('\n');

//           // Display tooltip manually using the hovered data
//           const tooltip = document.getElementById('tooltip');
//           if (tooltip) {
//             tooltip.innerHTML = tooltipText;
//             tooltip.style.left = `${hoveredPoint.x + 10}px`;
//             tooltip.style.top = `${hoveredPoint.y + 10}px`;
//             tooltip.style.display = 'block';
//           }
//         } else {
//           // Hide tooltip when no point is hovered
//           const tooltip = document.getElementById('tooltip');
//           if (tooltip) {
//             tooltip.style.display = 'none';
//           }
//         }
//       });
//     }
//   }, [chart]);
//   return (
//     <div>
//       <div ref={chartContainerRef} style={{ position: 'relative', width: '100%' }}>
//         {chart ? null : <div>Loading chart...</div>}
//       </div>

//       {/* Tooltip div */}
//       <div
//         id="tooltip"
//         style={{
//           position: 'absolute',
//           background: 'rgba(0, 0, 0, 0.7)',
//           color: 'white',
//           padding: '5px',
//           borderRadius: '3px',
//           display: 'none',
//           pointerEvents: 'none',
//           zIndex: 10,
//         }}
//       />
//     </div>
//   );
// };

// // Main App Component
// const App = () => {
//   const [data, setData] = useState([]);
//   const [wsUrl] = useState('wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/');  // Replace with your WebSocket URL

//   return (
//     <div>
//       <h1>Real-Time WebSocket Chart Example</h1>
      
//       {/* WebSocket Provider to handle data reception */}
//       <WebSocketProvider url={wsUrl} setChartData={setData} />
      
//       {/* ChartComponent to display data */}
//       <ChartComponent data={data} />
//     </div>
//   );
// };

// export default App;



// import React, { useEffect, useRef, useState } from 'react';
// import { createChart } from 'lightweight-charts';

// // WebSocket message handler
// const handleWebSocketMessage = (event, setChartData) => {
//   try {
//     const data = JSON.parse(event.data);
    
//     // Extract the value for "AX-LT-011" and timestamp "PLC-TIME-STAMP"
//     const value = data["AX-LT-011"];
//     const timestamp = data["PLC-TIME-STAMP"];

//     if (value === undefined || !timestamp) {
//       console.error("Invalid data received:", data);
//       return; // Skip processing if data is invalid
//     }

//     // Parse the timestamp
//     const parsedDate = new Date(timestamp);
//     if (isNaN(parsedDate)) {
//       console.error("Invalid date:", timestamp);
//       return; // Skip processing if the date is invalid
//     }

//     // Prepare data in the format expected by the chart (Unix timestamp in seconds)
//     const formattedData = {
//       time: parsedDate.getTime() / 1000, // Convert to seconds
//       value: value  // Real-time value of "AX-LT-011"
//     };

//     // Add the new data to the chart
//     setChartData(prevData => [...prevData, formattedData]);

//   } catch (error) {
//     console.error("Error handling WebSocket message:", error);
//   }
// };

// // WebSocket Provider Component
// const WebSocketProvider = ({ url, setChartData }) => {
//   useEffect(() => {
//     const ws = new WebSocket(url);
    
//     ws.onopen = () => {
//       console.log("WebSocket connection established");
//     };

//     ws.onmessage = (event) => handleWebSocketMessage(event, setChartData); // Handle incoming messages

//     ws.onerror = (error) => {
//       console.error("WebSocket error:", error);
//     };

//     ws.onclose = () => {
//       console.log("WebSocket connection closed");
//     };

//     return () => {
//       if (ws) {
//         ws.close();
//       }
//     };
//   }, [url, setChartData]);

//   return (
//     <div>
//       <div>WebSocket connection is open.</div>
//     </div>
//   );
// };

// // Chart Component with Lightweight Charts
// const ChartComponent = ({ data }) => {
//   const chartContainerRef = useRef(null);
//   const [chart, setChart] = useState(null);
//   const [lineSeries, setLineSeries] = useState(null);

//   // Handle state changes to update chart
//   useEffect(() => {
//     if (data && data.length > 0 && chartContainerRef.current && !chart) {
//       // Initialize the chart only once when data is available
//       const newChart = createChart(chartContainerRef.current, {
//         width: chartContainerRef.current.clientWidth,
//         height: 400,
//         crosshair: { mode: 0 },
//         zoomPan: {
//           panEnabled: true,
//           zoomEnabled: true,
//           pinchToZoom: true,
//           mouseWheel: { zoom: true },
//         },
//       });

//       // Add a line series to the chart
//       const newLineSeries = newChart.addLineSeries({
//         color: 'rgb(75,192,192)',
//         lineWidth: 2,
//       });

//       setChart(newChart);
//       setLineSeries(newLineSeries);  // Store the series for later updates
//     }
//   }, [data]);

//   // Update chart data dynamically when new data is added
//   useEffect(() => {
//     if (lineSeries && data && data.length > 0) {
//       // Ensure lineSeries is properly initialized before updating
//       lineSeries.setData(data);  // Set the data for the line series
//     }
//   }, [data, lineSeries]);

//   return (
//     <div ref={chartContainerRef} style={{ position: 'relative', width: '100%' }}>
//       {chart ? null : <div>Loading chart...</div>}
//     </div>
//   );
// };

// // Main App Component
// const App = () => {
//   const [data, setData] = useState([]);
//   const [wsUrl] = useState('wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/');  // Replace with your WebSocket URL

//   return (
//     <div>
//       <h1>Real-Time WebSocket Chart Example</h1>
      
//       {/* WebSocket Provider to handle data reception */}
//       <WebSocketProvider url={wsUrl} setChartData={setData} />
      
//       {/* ChartComponent to display data */}
//       <ChartComponent data={data} />
//     </div>
//   );
// };

// export default App;




// import React, { useEffect, useRef, useState } from 'react';
// import { createChart } from 'lightweight-charts';

// // WebSocket message handler
// const handleWebSocketMessage = (event, setChartData) => {
//   try {
//     const data = JSON.parse(event.data);
    
//     // Check if the necessary fields are present in the data
    
//     if (!data || !data['AX-LT-011']) {
//       console.error("Invalid data received:", data);
//       return; // Skip processing if data is invalid
//     }

//     const timestamp = data['PLC-TIME-STAMP']; // Expected to be a string like "2024-12-09T09:10:50.819Z"
    
//     const parsedDate = new Date(timestamp);
//     if (isNaN(parsedDate)) {
//       console.error("Invalid date:", timestamp);
//       return; // Skip processing if the date is invalid
//     }

//     // Format the parsed date into year, month, day, hour, minute, second
//     const formattedDate = {
//       time: parsedDate.getTime() / 1000, // Convert to seconds for the chart
//       value: Math.random() * 100  // Random value for simulation (replace with actual data)
//     };

//     // Add the formatted data to the chart
//     setChartData(prevData => [...prevData, formattedDate]);

//   } catch (error) {
//     console.error("Error handling WebSocket message:", error);
//   }
// };

// // WebSocket Provider Component
// const WebSocketProvider = ({ url, setChartData }) => {
//   useEffect(() => {
//     const ws = new WebSocket(url);
    
//     ws.onopen = () => {
//       console.log("WebSocket connection established");
//     };

//     ws.onmessage = (event) => handleWebSocketMessage(event, setChartData); // Handle incoming messages

//     ws.onerror = (error) => {
//       console.error("WebSocket error:", error);
//     };

//     ws.onclose = () => {
//       console.log("WebSocket connection closed");
//     };

//     return () => {
//       if (ws) {
//         ws.close();
//       }
//     };
//   }, [url, setChartData]);

//   return (
//     <div>
//       <div>WebSocket connection is open.</div>
//     </div>
//   );
// };

// // Chart Component with Lightweight Charts
// const ChartComponent = ({ data }) => {
//   const chartContainerRef = useRef(null);
//   const [chart, setChart] = useState(null);
//   const [lineSeries, setLineSeries] = useState(null);

//   // Handle state changes to update chart
//   useEffect(() => {
//     if (data && data.length > 0 && chartContainerRef.current && !chart) {
//       // Initialize the chart only once when data is available
//       const newChart = createChart(chartContainerRef.current, {
//         width: chartContainerRef.current.clientWidth,
//         height: 400,
//         crosshair: { mode: 0 },
//         zoomPan: {
//           panEnabled: true,
//           zoomEnabled: true,
//           pinchToZoom: true,
//           mouseWheel: { zoom: true },
//         },
//       });

//       // Add a line series to the chart
//       const newLineSeries = newChart.addLineSeries({
//         color: 'rgb(75,192,192)',
//         lineWidth: 2,
//       });

//       setChart(newChart);
//       setLineSeries(newLineSeries);  // Store the series for later updates
//     }
//   }, [data]);

//   // Update chart data dynamically when new data is added
//   useEffect(() => {
//     if (lineSeries && data && data.length > 0) {
//       // Ensure lineSeries is properly initialized before updating
//       lineSeries.setData(data);  // Set the data for the line series
//     }
//   }, [data, lineSeries]);

//   return (
//     <div ref={chartContainerRef} style={{ position: 'relative', width: '100%' }}>
//       {chart ? null : <div>Loading chart...</div>}
//     </div>
//   );
// };

// // Main App Component
// const App = () => {
//   const [data, setData] = useState([]);
//   const [wsUrl] = useState('wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/');  // Replace with your WebSocket URL

//   return (
//     <div>
//       <h1>WebSocket Chart Example with Zoom and Pan</h1>
      
//       {/* WebSocket Provider to handle data reception */}
//       <WebSocketProvider url={wsUrl} setChartData={setData} />
      
//       {/* ChartComponent to display data */}
//       <ChartComponent data={data} />
//     </div>
//   );
// };

// export default App;



// import React, { useEffect, useState } from 'react';
// import { Line } from 'react-chartjs-2';  // Import Line chart from react-chartjs-2
// import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// // Register necessary components for Chart.js
// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// // Function to convert business day from the received date object
// function businessDayConverter(date) {
//   if (!date || !date.year || !date.month || !date.day) {
//     console.error("Invalid date object:", date);
//     return null;  // Return null if date is invalid
//   }

//   const { year, month, day } = date;
//   return new Date(year, month - 1, day); // Return Date object, months are 0-based in JavaScript
// }

// // WebSocket message handler
// const handleWebSocketMessage = (event, setChartData) => {
//   try {
//     const data = JSON.parse(event.data);
    
//     // Check if the necessary fields are present in the data
//     if (!data || !data['AX-LT-011']) {
//       console.error("Invalid data received:", data);
//       return; // Skip processing if data is invalid
//     }

//     const timestamp = data['PLC-TIME-STAMP']; // Expected to be a string like "2024-12-09T09:10:50.819Z"
    
//     const parsedDate = new Date(timestamp);
//     if (isNaN(parsedDate)) {
//       console.error("Invalid date:", timestamp);
//       return; // Skip processing if the date is invalid
//     }

//     // Format the parsed date into year, month, day, hour, minute, second
//     const formattedDate = {
//       year: parsedDate.getFullYear(),
//       month: parsedDate.getMonth() + 1,  // Months are 0-based in JS
//       day: parsedDate.getDate(),
//       hour: parsedDate.getHours(),
//       minute: parsedDate.getMinutes(),
//       second: parsedDate.getSeconds(),
//       timestamp: parsedDate.getTime()  // Add timestamp for chart plotting
//     };

//     // Add the formatted data to the chart
//     setChartData(prevData => [...prevData, formattedDate]);

//   } catch (error) {
//     console.error("Error handling WebSocket message:", error);
//   }
// };

// // WebSocket Provider Component
// const WebSocketProvider = ({ url, setChartData }) => {
//   useEffect(() => {
//     const ws = new WebSocket(url);
    
//     ws.onopen = () => {
//       console.log("WebSocket connection established");
//     };

//     ws.onmessage = (event) => handleWebSocketMessage(event, setChartData); // Handle incoming messages

//     ws.onerror = (error) => {
//       console.error("WebSocket error:", error);
//     };

//     ws.onclose = () => {
//       console.log("WebSocket connection closed");
//     };

//     return () => {
//       if (ws) {
//         ws.close();
//       }
//     };
//   }, [url, setChartData]);

//   return (
//     <div>
//       {/* WebSocket status */}
//       <div>WebSocket connection is open.</div>
//     </div>
//   );
// };

// // Chart Component
// const ChartComponent = ({ data }) => {
//   const [chartData, setChartData] = useState([]);
  
//   // Handle state changes to update chart
//   useEffect(() => {
//     if (data && data.length > 0) {
//       const validData = data.filter(item => item && item.timestamp);
//       if (validData.length > 0) {
//         setChartData(validData);
//       } else {
//         console.error("No valid data to display");
//       }
//     }
//   }, [data]);

//   // Chart.js data structure
//   const chartOptions = {
//     responsive: true,
//     plugins: {
//       title: {
//         display: true,
//         text: 'Real-Time Data Chart'
//       },
//       tooltip: {
//         callbacks: {
//           label: function(tooltipItem) {
//             const timestamp = new Date(tooltipItem.raw.timestamp);
//             return `Time: ${timestamp.toLocaleTimeString()}`;
//           }
//         }
//       }
//     }
//   };

//   // Data for Chart.js
//   const chartDataConfig = {
//     labels: chartData.map(item => new Date(item.timestamp).toLocaleTimeString()),  // Time labels
//     datasets: [
//       {
//         label: 'PLC-TIME-STAMP',
//         data: chartData.map(item => item.timestamp),  // Use timestamp for plotting
//         borderColor: 'rgba(75,192,192,1)',
//         backgroundColor: 'rgba(75,192,192,0.2)',
//         fill: false,
//         tension: 0.1
//       }
//     ]
//   };

//   return (
//     <div>
//       <h3>Chart Data</h3>
//       {/* Render the chart */}
//       {chartData.length > 0 ? (
//         <Line data={chartDataConfig} options={chartOptions} />
//       ) : (
//         <div>No valid data available</div>
//       )}
//     </div>
//   );
// };

// // Main App Component
// const App = () => {
//   const [data, setData] = useState([]);

//   return (
//     <div>
//       <h1>WebSocket Chart Example</h1>
      
//       {/* WebSocket Provider to handle data reception */}
//       <WebSocketProvider url="wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/" setChartData={setData} />
      
//       {/* ChartComponent to display data */}
//       <ChartComponent data={data} />
//     </div>
//   );
// };

// export default App;




// import React, { useEffect, useState } from 'react';

// // Function to convert business day from the received date object
// function businessDayConverter(date) {
//   if (!date || !date.year || !date.month || !date.day) {
//     console.error("Invalid date object:", date);
//     return null;  // Return null if date is invalid
//   }

//   const { year, month, day } = date;
//   return new Date(year, month - 1, day); // Return Date object, months are 0-based in JavaScript
// }

// // WebSocket message handler
// const handleWebSocketMessage = (event, setChartData) => {
//   try {
//     const data = JSON.parse(event.data);
    
//     // Check if the necessary fields are present in the data
//     if (!data || !data['PLC-TIME-STAMP']) {
//       console.error("Invalid data received:", data);
//       return; // Skip processing if data is invalid
//     }

//     const timestamp = data['PLC-TIME-STAMP']; // Expected to be a string like "2024-12-09T09:10:50.819Z"
    
//     const parsedDate = new Date(timestamp);
//     if (isNaN(parsedDate)) {
//       console.error("Invalid date:", timestamp);
//       return; // Skip processing if the date is invalid
//     }

//     // Format the parsed date into year, month, day, hour, minute, second
//     const formattedDate = {
//       year: parsedDate.getFullYear(),
//       month: parsedDate.getMonth() + 1,  // Months are 0-based in JS
//       day: parsedDate.getDate(),
//       hour: parsedDate.getHours(),
//       minute: parsedDate.getMinutes(),
//       second: parsedDate.getSeconds()
//     };

//     // Add the formatted data to the chart
//     setChartData(prevData => [...prevData, formattedDate]);

//   } catch (error) {
//     console.error("Error handling WebSocket message:", error);
//   }
// };

// // WebSocket Provider Component
// const WebSocketProvider = ({ url, setChartData }) => {
//   useEffect(() => {
//     const ws = new WebSocket(url);
    
//     ws.onopen = () => {
//       console.log("WebSocket connection established");
//     };

//     ws.onmessage = (event) => handleWebSocketMessage(event, setChartData); // Handle incoming messages

//     ws.onerror = (error) => {
//       console.error("WebSocket error:", error);
//     };

//     ws.onclose = () => {
//       console.log("WebSocket connection closed");
//     };

//     return () => {
//       if (ws) {
//         ws.close();
//       }
//     };
//   }, [url, setChartData]);

//   return (
//     <div>
//       {/* WebSocket status */}
//       <div>WebSocket connection is open.</div>
//     </div>
//   );
// };

// // Chart Component
// const ChartComponent = ({ data }) => {
//   const [chartData, setChartData] = useState([]);
  
//   // Handle state changes to update chart
//   useEffect(() => {
//     if (data && data.length > 0) {
//       const validData = data.filter(item => item && item.year && item.month && item.day);
//       if (validData.length > 0) {
//         setChartData(validData);
//       } else {
//         console.error("No valid data to display");
//       }
//     }
//   }, [data]);

//   return (
//     <div>
//       <h3>Chart Data</h3>
//       {/* Render the chart data */}
//       {chartData.length > 0 ? (
//         <div>Chart has {chartData.length} valid data points.</div>
//       ) : (
//         <div>No valid data available</div>
//       )}
//     </div>
//   );
// };

// // Main App Component
// const App = () => {
//   const [data, setData] = useState([]);

//   return (
//     <div>
//       <h1>WebSocket Chart Example</h1>
      
//       {/* WebSocket Provider to handle data reception */}
//       <WebSocketProvider url="wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/" setChartData={setData} />
      
//       {/* ChartComponent to display data */}
//       <ChartComponent data={data} />
//     </div>
//   );
// };

// export default App;






// import React, { useState, useEffect, useMemo } from 'react';
// import axios from 'axios';
// import { format } from 'date-fns';

// const DataTable = () => {
//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [startDate, setStartDate] = useState(null);
//   const [endDate, setEndDate] = useState(null);
//   const [filterText, setFilterText] = useState('');
//   const [error, setError] = useState('');
//   const [pageSize, setPageSize] = useState(5); // Default page size
//   const [page, setPage] = useState(1); // Current page
//   const [totalPages, setTotalPages] = useState(0); // Total pages for pagination

//   // Fetch data from API with pagination and filters
//   const fetchData = async (start, end, page, pageSize) => {
//     setLoading(true);
//     setError('');
//     try {
//       const formattedStartTime = format(start, 'yyyy-MM-dd HH:mm');
//       const formattedEndTime = format(end, 'yyyy-MM-dd HH:mm');

//       if (!start || !end) {
//         throw new Error('Start Date and End Date are required.');
//       }

//       const response = await axios.post(
//         'https://3di0yc14j3.execute-api.us-east-1.amazonaws.com/dev/iot-data',
//         {
//           start_time: formattedStartTime,
//           end_time: formattedEndTime,
//           page,
//           page_size: pageSize,
//         },
//         { headers: { 'Content-Type': 'application/json' } }
//       );

//       if (response.status === 200) {
//         const result = response.data;
//         const processedData = (result.data || []).map((row, index) => ({
//           id: index + (page - 1) * pageSize,
//           timestamp: row.timestamp || row.time_bucket,
//           ist_timestamp: row.ist_timestamp || row.time_bucket,
//           Test_Name: row.device_data?.['Test-Name'] || row['test_name'],
//           AX_LT_011: row.device_data?.['AX-LT-011'] !== undefined && row.device_data?.['AX-LT-011'] !== null
//             ? row.device_data?.['AX-LT-011']
//             : row['avg_ax_lt_011'] || 0,
//           AX_LT_021: row.device_data?.['AX-LT-021'] || row['avg_ax_lt_021'],
//         }));
//         setRows(processedData);
//         setTotalPages(Math.ceil(result.total_count / pageSize)); // Update total pages
//       } else {
//         throw new Error('Failed to fetch data');
//       }
//     } catch (error) {
//       console.error('Error fetching data:', error);
//       setRows([]);
//       setError(error.message || 'An unexpected error occurred.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleFetchData = () => {
//     if (startDate && endDate) {
//       fetchData(startDate, endDate, page, pageSize); // Fetch data based on selected dates and pagination
//     }
//   };

//   const columns = [
//     { field: 'ist_timestamp', headerName: 'IST Timestamp', width: 200 },
//     { field: 'Test_Name', headerName: 'Test Name', width: 170 },
//     { field: 'AX_LT_011', headerName: 'AX-LT-011', width: 100, valueFormatter: (params) => Number(params.value).toFixed(4) },
//     { field: 'AX_LT_021', headerName: 'AX-LT-021', width: 100, valueFormatter: (params) => Number(params.value).toFixed(4) },
//   ];

//   // Apply global filter on all columns
//   const filteredRows = useMemo(() => {
//     return rows.filter(row => {
//       return columns.some(col => 
//         row[col.field]?.toString().toLowerCase().includes(filterText.toLowerCase())
//       );
//     });
//   }, [filterText, rows]);

//   // Download functionality (CSV export)
//   const handleDownload = () => {
//     const csvRows = [];
//     // Add headers
//     const headers = columns.map((col) => col.headerName);
//     csvRows.push(headers.join(','));

//     // Add data
//     filteredRows.forEach((row) => {
//       const rowData = columns.map((col) => row[col.field]);
//       csvRows.push(rowData.join(','));
//     });

//     // Create a CSV blob and trigger download
//     const csvData = new Blob([csvRows.join('\n')], { type: 'text/csv' });
//     const csvUrl = URL.createObjectURL(csvData);
//     const link = document.createElement('a');
//     link.href = csvUrl;
//     link.download = 'export.csv';
//     link.click();
//   };

//   // Pagination Controls
//   const handleNextPage = () => {
//     if (page < totalPages) {
//       setPage(prevPage => prevPage + 1);
//       fetchData(startDate, endDate, page + 1, pageSize);
//     }
//   };

//   const handlePreviousPage = () => {
//     if (page > 1) {
//       setPage(prevPage => prevPage - 1);
//       fetchData(startDate, endDate, page - 1, pageSize);
//     }
//   };

//   const handlePageSizeChange = (e) => {
//     const newPageSize = parseInt(e.target.value, 10);
//     setPageSize(newPageSize);
//     setPage(1); // Reset to first page when page size changes
//     fetchData(startDate, endDate, 1, newPageSize); // Fetch data with new page size
//   };

//   return (
//     <div className="p-6">
//       {/* Date Picker and Filter Section */}
//       <div className="mb-4">
//         <div className="flex items-center space-x-4">
//           <input
//             type="datetime-local"
//             className="px-4 py-2 border border-gray-300 rounded"
//             value={startDate ? format(startDate, 'yyyy-MM-dd\'T\'HH:mm') : ''}
//             onChange={(e) => setStartDate(new Date(e.target.value))}
//           />
//           <input
//             type="datetime-local"
//             className="px-4 py-2 border border-gray-300 rounded"
//             value={endDate ? format(endDate, 'yyyy-MM-dd\'T\'HH:mm') : ''}
//             onChange={(e) => setEndDate(new Date(e.target.value))}
//           />
//           <button
//             onClick={handleFetchData}
//             disabled={!startDate || !endDate}
//             className="px-6 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
//           >
//             Fetch Data
//           </button>
//         </div>
//       </div>

//       {/* Filter and Download Toolbar */}
//       <div className="flex justify-between items-center mb-4">
//         {/* Global Filter Input */}
//         <input
//           type="text"
//           className="px-4 py-2 border border-gray-300 rounded w-1/3"
//           placeholder="Filter data across all columns"
//           value={filterText}
//           onChange={(e) => setFilterText(e.target.value)}
//         />
//         {/* Download Button */}
//         <button
//           onClick={handleDownload}
//           className="px-6 py-2 bg-green-500 text-white rounded"
//         >
//           Download CSV
//         </button>
//       </div>

//       {/* Error Message */}
//       {error && <p className="text-red-500 mb-4">{error}</p>}

//       {/* Table with Data */}
//       <div className="overflow-x-auto">
//         <table className="min-w-full table-auto text-sm text-left text-gray-500">
//           <thead className="bg-gray-100 text-xs text-gray-700">
//             <tr>
//               {columns.map((col) => (
//                 <th key={col.field} className="px-4 py-2 border-b">
//                   {col.headerName}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {loading ? (
//               <tr>
//                 <td colSpan={columns.length} className="px-4 py-2 text-center">
//                   Loading...
//                 </td>
//               </tr>
//             ) : (
//               filteredRows.slice((page - 1) * pageSize, page * pageSize).map((row) => (
//                 <tr key={row.id} className="border-b hover:bg-gray-50">
//                   {columns.map((col) => (
//                     <td key={col.field} className="px-4 py-2">
//                       {row[col.field]}
//                     </td>
//                   ))}
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination Controls */}
//       <div className="flex justify-between items-center mt-4">
//         <div>
//           <button
//             onClick={handlePreviousPage}
//             className="px-4 py-2 bg-gray-200 rounded"
//             disabled={page === 1}
//           >
//             Previous
//           </button>
//           <span className="mx-2">Page {page} of {totalPages}</span>
//           <button
//             onClick={handleNextPage}
//             className="px-4 py-2 bg-gray-200 rounded"
//             disabled={page === totalPages}
//           >
//             Next
//           </button>
//         </div>
//         <div>
//           <select
//             value={pageSize}
//             onChange={handlePageSizeChange}
//             className="px-4 py-2 border border-gray-300 rounded"
//           >
//             <option value={5}>5 Rows</option>
//             <option value={10}>10 Rows</option>
//             <option value={15}>15 Rows</option>
//           </select>
//         </div>
//       </div>

//       <div className="p-4 bg-gradient-to-r from-indigo-800 via-gray-800 to-gray-900 rounded-lg shadow-lg hover:shadow-xl">
//   <h2 className="text-lg text-indigo-400 font-semibold">H2 Purity</h2>
//   <div className="mt-2 flex items-center">
//     <span className="text-3xl font-bold text-white">59.65%</span>
//     <span className="ml-2 text-gray-400">High Purity</span>
//   </div>
// </div>
//     </div>    
//   );
// };

// export default DataTable;



// import React, { useState, useEffect, useMemo } from 'react';
// import axios from 'axios';
// import { format } from 'date-fns';

// const DataTable = () => {
//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [startDate, setStartDate] = useState(null);
//   const [endDate, setEndDate] = useState(null);
//   const [filterText, setFilterText] = useState('');
//   const [error, setError] = useState('');
//   const [pageSize, setPageSize] = useState(100);

//   const fetchData = async (start, end, page, pageSize) => {
//     setLoading(true);
//     setError('');
//     try {
//       const formattedStartTime = format(start, 'yyyy-MM-dd HH:mm');
//       const formattedEndTime = format(end, 'yyyy-MM-dd HH:mm');

//       if (!start || !end) {
//         throw new Error('Start Date and End Date are required.');
//       }

//       const response = await axios.post(
//         'https://3di0yc14j3.execute-api.us-east-1.amazonaws.com/dev/iot-data',
//         {
//           start_time: formattedStartTime,
//           end_time: formattedEndTime,
//           page,
//           page_size: pageSize,
//         },
//         { headers: { 'Content-Type': 'application/json' } }
//       );

//       if (response.status === 200) {
//         const result = response.data;
//         const processedData = (result.data || []).map((row, index) => ({
//           id: index + (page - 1) * pageSize,
//           timestamp: row.timestamp || row.time_bucket,
//           ist_timestamp: row.ist_timestamp || row.time_bucket,
//           Test_Name: row.device_data?.['Test-Name'] || row['test_name'],
//           AX_LT_011: row.device_data?.['AX-LT-011'] !== undefined && row.device_data?.['AX-LT-011'] !== null
//             ? row.device_data?.['AX-LT-011']
//             : row['avg_ax_lt_011'] || 0,
//           AX_LT_021: row.device_data?.['AX-LT-021'] || row['avg_ax_lt_021'],
//         }));
//         setRows(processedData);
//       } else {
//         throw new Error('Failed to fetch data');
//       }
//     } catch (error) {
//       console.error('Error fetching data:', error);
//       setRows([]);
//       setError(error.message || 'An unexpected error occurred.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleFetchData = () => {
//     if (startDate && endDate) {
//       fetchData(startDate, endDate, 1, pageSize); // Fetch data based on selected dates and pagination
//     }
//   };

//   const columns = [
//     { field: 'ist_timestamp', headerName: 'IST Timestamp', width: 200 },
//     { field: 'Test_Name', headerName: 'Test Name', width: 170 },
//     { field: 'AX_LT_011', headerName: 'AX-LT-011', width: 100, valueFormatter: (params) => Number(params.value).toFixed(4) },
//     { field: 'AX_LT_021', headerName: 'AX-LT-021', width: 100, valueFormatter: (params) => Number(params.value).toFixed(4) },
//   ];

//   const filteredRows = useMemo(() => {
//     return rows.filter(row => row.Test_Name.toLowerCase().includes(filterText.toLowerCase()));
//   }, [filterText, rows]);

//   // Download functionality (CSV export)
//   const handleDownload = () => {
//     const csvRows = [];
//     // Add headers
//     const headers = columns.map((col) => col.headerName);
//     csvRows.push(headers.join(','));

//     // Add data
//     filteredRows.forEach((row) => {
//       const rowData = columns.map((col) => row[col.field]);
//       csvRows.push(rowData.join(','));
//     });

//     // Create a CSV blob and trigger download
//     const csvData = new Blob([csvRows.join('\n')], { type: 'text/csv' });
//     const csvUrl = URL.createObjectURL(csvData);
//     const link = document.createElement('a');
//     link.href = csvUrl;
//     link.download = 'export.csv';
//     link.click();
//   };

//   return (
//     <div className="p-6">
//       {/* Date Picker and Filter Section */}
//       <div className="mb-4">
//         <div className="flex items-center space-x-4">
//           <input
//             type="datetime-local"
//             className="px-4 py-2 border border-gray-300 rounded"
//             value={startDate ? format(startDate, 'yyyy-MM-dd\'T\'HH:mm') : ''}
//             onChange={(e) => setStartDate(new Date(e.target.value))}
//           />
//           <input
//             type="datetime-local"
//             className="px-4 py-2 border border-gray-300 rounded"
//             value={endDate ? format(endDate, 'yyyy-MM-dd\'T\'HH:mm') : ''}
//             onChange={(e) => setEndDate(new Date(e.target.value))}
//           />
//           <button
//             onClick={handleFetchData}
//             disabled={!startDate || !endDate}
//             className="px-6 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
//           >
//             Fetch Data
//           </button>
//         </div>
//       </div>

//       {/* Filter and Download Toolbar */}
//       <div className="flex justify-between items-center mb-4">
//         {/* Filter Input */}
//         <input
//           type="text"
//           className="px-4 py-2 border border-gray-300 rounded w-1/3"
//           placeholder="Filter by Test Name"
//           value={filterText}
//           onChange={(e) => setFilterText(e.target.value)}
//         />
//         {/* Download Button */}
//         <button
//           onClick={handleDownload}
//           className="px-6 py-2 bg-green-500 text-white rounded"
//         >
//           Download CSV
//         </button>
//       </div>

//       {/* Error Message */}
//       {error && <p className="text-red-500 mb-4">{error}</p>}

//       {/* Table with Data */}
//       <div className="overflow-x-auto">
//         <table className="min-w-full table-auto text-sm text-left text-gray-500">
//           <thead className="bg-gray-100 text-xs text-gray-700">
//             <tr>
//               {columns.map((col) => (
//                 <th key={col.field} className="px-4 py-2 border-b">
//                   {col.headerName}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {loading ? (
//               <tr>
//                 <td colSpan={columns.length} className="px-4 py-2 text-center">
//                   Loading...
//                 </td>
//               </tr>
//             ) : (
//               filteredRows.map((row) => (
//                 <tr key={row.id} className="border-b hover:bg-gray-50">
//                   {columns.map((col) => (
//                     <td key={col.field} className="px-4 py-2">
//                       {row[col.field]}
//                     </td>
//                   ))}
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default DataTable;



// import React, { useState, useMemo } from "react";

// function CustomToolbar({ onDownload, onFilter }) {
//   const [filterText, setFilterText] = useState("");

//   // Handle the filter input change
//   const handleFilterChange = (e) => {
//     setFilterText(e.target.value);
//     onFilter(e.target.value); // Pass the filter value to the parent component
//   };

//   return (
//     <div className="flex justify-between items-center p-4 bg-gray-200">
//       {/* Filter Input */}
//       <div className="flex items-center space-x-2">
//         <label htmlFor="filter" className="text-sm font-medium text-gray-700">
//           Filter by Name:
//         </label>
//         <input
//           id="filter"
//           type="text"
//           value={filterText}
//           onChange={handleFilterChange}
//           className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
//           placeholder="Filter by name"
//         />
//       </div>

//       {/* Download Button */}
//       <button
//         onClick={onDownload} // Trigger download functionality
//         className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition"
//       >
//         Download
//       </button>
//     </div>
//   );
// }

// export default function MyTable() {
//   const [filterText, setFilterText] = useState("");

//   // Sample data rows
//   const rows = [
//     { id: 1, name: "John", category: "Developer", price: "$3000" },
//     { id: 2, name: "Alice", category: "Designer", price: "$3500" },
//     { id: 3, name: "Bob", category: "Manager", price: "$4000" },
//     { id: 4, name: "Charlie", category: "Developer", price: "$2800" },
//     { id: 5, name: "David", category: "Designer", price: "$3200" },
//     { id: 6, name: "Eva", category: "Developer", price: "$2900" },
//     { id: 7, name: "Frank", category: "Manager", price: "$4200" },
//   ];

//   // Define table columns
//   const columns = [
//     { field: "id", headerName: "ID" },
//     { field: "name", headerName: "Name" },
//     { field: "category", headerName: "Category" },
//     { field: "price", headerName: "Price" },
//   ];

//   // Filtered rows based on the filter text
//   const filteredRows = useMemo(
//     () => rows.filter((row) => row.name.toLowerCase().includes(filterText.toLowerCase())),
//     [filterText, rows]
//   );

//   // Download functionality (export filtered rows to CSV)
//   const handleDownload = () => {
//     const csvRows = [];

//     // Add headers (column names)
//     const headers = columns.map((col) => col.headerName);
//     csvRows.push(headers.join(","));

//     // Add data (rows)
//     filteredRows.forEach((row) => {
//       const rowData = columns.map((col) => row[col.field]);
//       csvRows.push(rowData.join(","));
//     });

//     // Create CSV blob and trigger download
//     const csvData = new Blob([csvRows.join("\n")], { type: "text/csv" });
//     const csvUrl = URL.createObjectURL(csvData);
//     const link = document.createElement("a");
//     link.href = csvUrl;
//     link.download = "export.csv";
//     link.click();
//   };

//   return (
//     <div className="p-6">
//       {/* Custom Toolbar with filter and download functionality */}
//       <CustomToolbar onDownload={handleDownload} onFilter={setFilterText} />

//       {/* Table with filtered rows */}
//       <div className="relative overflow-x-auto mt-4">
//         <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
//           <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
//             <tr>
//               {columns.map((col) => (
//                 <th key={col.field} scope="col" className="px-6 py-3">
//                   {col.headerName}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {filteredRows.map((row) => (
//               <tr
//                 key={row.id}
//                 className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
//               >
//                 {columns.map((col) => (
//                   <td key={col.field} className="px-6 py-4">
//                     {row[col.field]}
//                   </td>
//                 ))}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }





// import React, { useState, useMemo } from 'react';
// import { DataGrid } from '@mui/x-data-grid';

// // Custom Toolbar component with Tailwind CSS
// function CustomToolbar({ onDownload, onFilter }) {
//   const [filterText, setFilterText] = useState("");

//   // Handle filter text change
//   const handleFilterChange = (e) => {
//     setFilterText(e.target.value);
//     onFilter(e.target.value); // Pass filter text to the parent component
//   };

//   return (
//     <div className="flex justify-between items-center p-4 bg-gray-200">
//       {/* Filter Input */}
//       <div className="flex items-center space-x-2">
//         <label htmlFor="filter" className="text-sm font-medium text-gray-700">
//           Filter:
//         </label>
//         <input
//           id="filter"
//           type="text"
//           value={filterText}
//           onChange={handleFilterChange}
//           className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
//           placeholder="Filter by name"
//         />
//       </div>

//       {/* Download Button */}
//       <button
//         onClick={onDownload} // Trigger the download functionality
//         className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition"
//       >
//         Download
//       </button>
//     </div>
//   );
// }

// export default function MyDataGrid() {
//   const [filterText, setFilterText] = useState("");
//   const [pageSize, setPageSize] = useState(25);

//   // Sample data rows
//   const rows = [
//     { id: 1, name: "John", age: 25 },
//     { id: 2, name: "Alice", age: 30 },
//     { id: 3, name: "Bob", age: 22 },
//     { id: 4, name: "Charlie", age: 29 },
//     { id: 5, name: "David", age: 35 },
//     { id: 6, name: "Eva", age: 28 },
//     { id: 7, name: "Frank", age: 24 },
//   ];

//   // Define columns for DataGrid
//   const columns = [
//     { field: "id", headerName: "ID", width: 90 },
//     { field: "name", headerName: "Name", width: 150 },
//     { field: "age", headerName: "Age", width: 120 },
//   ];

//   // Filtered rows based on the filter text
//   const filteredRows = useMemo(
//     () => rows.filter((row) => row.name.toLowerCase().includes(filterText.toLowerCase())),
//     [filterText, rows]
//   );

//   // Download functionality (export filtered rows to CSV)
//   const handleDownload = () => {
//     const csvRows = [];
    
//     // Add headers (column names)
//     const headers = columns.map((col) => col.headerName);
//     csvRows.push(headers.join(","));
    
//     // Add data (rows)
//     filteredRows.forEach((row) => {
//       const rowData = columns.map((col) => row[col.field]);
//       csvRows.push(rowData.join(","));
//     });
    
//     // Create CSV blob and trigger download
//     const csvData = new Blob([csvRows.join("\n")], { type: "text/csv" });
//     const csvUrl = URL.createObjectURL(csvData);
//     const link = document.createElement("a");
//     link.href = csvUrl;
//     link.download = "export.csv";
//     link.click();
//   };

//   return (
//     <div className="p-4">
//       {/* Custom Toolbar with filter and download functionality */}
//       <CustomToolbar onDownload={handleDownload} onFilter={setFilterText} />
      
//       {/* DataGrid with filtered rows */}
//       <div style={{ height: 400, width: "100%" }}>
//         <DataGrid
//           rows={filteredRows}
//           columns={columns}
//           pageSize={pageSize}
//           onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
//           rowsPerPageOptions={[25, 50, 100]}
//         />
//       </div>
//     </div>
//   );
// }




// import React from 'react'

// const index = () => {
//   return (
//     <div>
//     <div class="relative flex flex-col w-full h-full text-gray-700 bg-white shadow-md rounded-xl bg-clip-border">
//     <div class="relative mx-4 mt-4 overflow-hidden text-gray-700 bg-white rounded-none bg-clip-border">
//       <div class="flex flex-col justify-between gap-8 mb-4 md:flex-row md:items-center">
//         <div>
//           <h5
//             class="block font-sans text-xl antialiased font-semibold leading-snug tracking-normal text-blue-gray-900">
//             Recent Transactions
//           </h5>
//           <p class="block mt-1 font-sans text-base antialiased font-normal leading-relaxed text-gray-700">
//             These are details about the last transactions
//           </p>
//         </div>
//         <div class="flex w-full gap-2 shrink-0 md:w-max">
//           <div class="w-full md:w-72">
//             <div class="relative h-10 w-full min-w-[200px]">
//               <div
//                 class="absolute grid w-5 h-5 top-2/4 right-3 -translate-y-2/4 place-items-center text-blue-gray-500">
//                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
//                   stroke="currentColor" aria-hidden="true" class="w-5 h-5">
//                   <path stroke-linecap="round" stroke-linejoin="round"
//                     d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"></path>
//                 </svg>
//               </div>
//               <input
//                 class="peer h-full w-full rounded-[7px] border border-blue-gray-200 border-t-transparent bg-transparent px-3 py-2.5 !pr-9 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 focus:border-2 focus:border-gray-900 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50"
//                 placeholder=" " />
//               <label
//                 class="before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none !overflow-visible truncate text-[11px] font-normal leading-tight text-gray-500 transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-blue-gray-200 before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-blue-gray-200 after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:text-blue-gray-500 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-gray-900 peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:!border-gray-900 peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:!border-gray-900 peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500">
//                 Search
//               </label>
//             </div>
//           </div>
//           <button
//             class="flex select-none items-center gap-3 rounded-lg bg-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-white shadow-md shadow-gray-900/10 transition-all hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
//             type="button">
//             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
//               aria-hidden="true" class="w-4 h-4">
//               <path stroke-linecap="round" stroke-linejoin="round"
//                 d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3">
//               </path>
//             </svg>
//             Download
//           </button>
//         </div>
//       </div>
//     </div>
//     <div class="p-6 px-0 overflow-scroll">
//       <table class="w-full text-left table-auto min-w-max">
//         <thead>
//           <tr>
//             <th class="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">
//               <p class="block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
//                 Transaction
//               </p>
//             </th>
//             <th class="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">
//               <p class="block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
//                 Amount
//               </p>
//             </th>
//             <th class="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">
//               <p class="block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
//                 Date
//               </p>
//             </th>
//             <th class="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">
//               <p class="block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
//                 Status
//               </p>
//             </th>
//             <th class="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">
//               <p class="block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
//                 Account
//               </p>
//             </th>
//             <th class="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">
//               <p class="block font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
//               </p>
//             </th>
//           </tr>
//         </thead>
//         <tbody>
//           <tr>
//             <td class="p-4 border-b border-blue-gray-50">
//               <div class="flex items-center gap-3">
//                 <img src="https://docs.material-tailwind.com/img/logos/logo-spotify.svg" alt="Spotify"
//                   class="relative inline-block h-12 w-12 !rounded-full border border-blue-gray-50 bg-blue-gray-50/50 object-contain object-center p-1" />
//                 <p class="block font-sans text-sm antialiased font-bold leading-normal text-blue-gray-900">
//                   Spotify
//                 </p>
//               </div>
//             </td>
//             <td class="p-4 border-b border-blue-gray-50">
//               <p class="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
//                 $2,500
//               </p>
//             </td>
//             <td class="p-4 border-b border-blue-gray-50">
//               <p class="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
//                 Wed 3:00pm
//               </p>
//             </td>
//             <td class="p-4 border-b border-blue-gray-50">
//               <div class="w-max">
//                 <div
//                   class="relative grid items-center px-2 py-1 font-sans text-xs font-bold text-green-900 uppercase rounded-md select-none whitespace-nowrap bg-green-500/20">
//                   <span class="">paid</span>
//                 </div>
//               </div>
//             </td>
//             <td class="p-4 border-b border-blue-gray-50">
//               <div class="flex items-center gap-3">
//                 <div class="w-12 p-1 border rounded-md h-9 border-blue-gray-50">
//                   <img src="https://demos.creative-tim.com/test/corporate-ui-dashboard/assets/img/logos/visa.png"
//                     alt="visa"
//                     class="relative inline-block h-full w-full !rounded-none  object-contain object-center p-1" />
//                 </div>
//                 <div class="flex flex-col">
//                   <p
//                     class="block font-sans text-sm antialiased font-normal leading-normal capitalize text-blue-gray-900">
//                     visa 1234
//                   </p>
//                   <p
//                     class="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900 opacity-70">
//                     06/2026
//                   </p>
//                 </div>
//               </div>
//             </td>
//             <td class="p-4 border-b border-blue-gray-50">
//               <button
//                 class="relative h-10 max-h-[40px] w-10 max-w-[40px] select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-gray-900 transition-all hover:bg-gray-900/10 active:bg-gray-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
//                 type="button">
//                 <span class="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
//                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
//                     class="w-4 h-4">
//                     <path
//                       d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z">
//                     </path>
//                   </svg>
//                 </span>
//               </button>
//             </td>
//           </tr>
//           <tr>
//             <td class="p-4 border-b border-blue-gray-50">
//               <div class="flex items-center gap-3">
//                 <img src="https://docs.material-tailwind.com/img/logos/logo-amazon.svg" alt="Amazon"
//                   class="relative inline-block h-12 w-12 !rounded-full  border border-blue-gray-50 bg-blue-gray-50/50 object-contain object-center p-1" />
//                 <p class="block font-sans text-sm antialiased font-bold leading-normal text-blue-gray-900">
//                   Amazon
//                 </p>
//               </div>
//             </td>
//             <td class="p-4 border-b border-blue-gray-50">
//               <p class="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
//                 $5,000
//               </p>
//             </td>
//             <td class="p-4 border-b border-blue-gray-50">
//               <p class="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
//                 Wed 1:00pm
//               </p>
//             </td>
//             <td class="p-4 border-b border-blue-gray-50">
//               <div class="w-max">
//                 <div
//                   class="relative grid items-center px-2 py-1 font-sans text-xs font-bold text-green-900 uppercase rounded-md select-none whitespace-nowrap bg-green-500/20">
//                   <span class="">paid</span>
//                 </div>
//               </div>
//             </td>
//             <td class="p-4 border-b border-blue-gray-50">
//               <div class="flex items-center gap-3">
//                 <div class="w-12 p-1 border rounded-md h-9 border-blue-gray-50">
//                   <img src="https://demos.creative-tim.com/test/corporate-ui-dashboard/assets/img/logos/mastercard.png"
//                     alt="master-card"
//                     class="relative inline-block h-full w-full !rounded-none  object-contain object-center p-1" />
//                 </div>
//                 <div class="flex flex-col">
//                   <p
//                     class="block font-sans text-sm antialiased font-normal leading-normal capitalize text-blue-gray-900">
//                     master card 1234
//                   </p>
//                   <p
//                     class="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900 opacity-70">
//                     06/2026
//                   </p>
//                 </div>
//               </div>
//             </td>
//             <td class="p-4 border-b border-blue-gray-50">
//               <button
//                 class="relative h-10 max-h-[40px] w-10 max-w-[40px] select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-gray-900 transition-all hover:bg-gray-900/10 active:bg-gray-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
//                 type="button">
//                 <span class="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
//                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
//                     class="w-4 h-4">
//                     <path
//                       d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z">
//                     </path>
//                   </svg>
//                 </span>
//               </button>
//             </td>
//           </tr>
//           <tr>
//             <td class="p-4 border-b border-blue-gray-50">
//               <div class="flex items-center gap-3">
//                 <img src="https://docs.material-tailwind.com/img/logos/logo-pinterest.svg" alt="Pinterest"
//                   class="relative inline-block h-12 w-12 !rounded-full  border border-blue-gray-50 bg-blue-gray-50/50 object-contain object-center p-1" />
//                 <p class="block font-sans text-sm antialiased font-bold leading-normal text-blue-gray-900">
//                   Pinterest
//                 </p>
//               </div>
//             </td>
//             <td class="p-4 border-b border-blue-gray-50">
//               <p class="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
//                 $3,400
//               </p>
//             </td>
//             <td class="p-4 border-b border-blue-gray-50">
//               <p class="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
//                 Mon 7:40pm
//               </p>
//             </td>
//             <td class="p-4 border-b border-blue-gray-50">
//               <div class="w-max">
//                 <div
//                   class="relative grid items-center px-2 py-1 font-sans text-xs font-bold uppercase rounded-md select-none whitespace-nowrap bg-amber-500/20 text-amber-900">
//                   <span class="">pending</span>
//                 </div>
//               </div>
//             </td>
//             <td class="p-4 border-b border-blue-gray-50">
//               <div class="flex items-center gap-3">
//                 <div class="w-12 p-1 border rounded-md h-9 border-blue-gray-50">
//                   <img src="https://demos.creative-tim.com/test/corporate-ui-dashboard/assets/img/logos/mastercard.png"
//                     alt="master-card"
//                     class="relative inline-block h-full w-full !rounded-none object-contain object-center p-1" />
//                 </div>
//                 <div class="flex flex-col">
//                   <p
//                     class="block font-sans text-sm antialiased font-normal leading-normal capitalize text-blue-gray-900">
//                     master card 1234
//                   </p>
//                   <p
//                     class="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900 opacity-70">
//                     06/2026
//                   </p>
//                 </div>
//               </div>
//             </td>
//             <td class="p-4 border-b border-blue-gray-50">
//               <button
//                 class="relative h-10 max-h-[40px] w-10 max-w-[40px] select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-gray-900 transition-all hover:bg-gray-900/10 active:bg-gray-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
//                 type="button">
//                 <span class="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
//                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
//                     class="w-4 h-4">
//                     <path
//                       d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z">
//                     </path>
//                   </svg>
//                 </span>
//               </button>
//             </td>
//           </tr>
//           <tr>
//             <td class="p-4 border-b border-blue-gray-50">
//               <div class="flex items-center gap-3">
//                 <img src="https://docs.material-tailwind.com/img/logos/logo-google.svg" alt="Google"
//                   class="relative inline-block h-12 w-12 !rounded-full  border border-blue-gray-50 bg-blue-gray-50/50 object-contain object-center p-1" />
//                 <p class="block font-sans text-sm antialiased font-bold leading-normal text-blue-gray-900">
//                   Google
//                 </p>
//               </div>
//             </td>
//             <td class="p-4 border-b border-blue-gray-50">
//               <p class="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
//                 $1,000
//               </p>
//             </td>
//             <td class="p-4 border-b border-blue-gray-50">
//               <p class="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
//                 Wed 5:00pm
//               </p>
//             </td>
//             <td class="p-4 border-b border-blue-gray-50">
//               <div class="w-max">
//                 <div
//                   class="relative grid items-center px-2 py-1 font-sans text-xs font-bold text-green-900 uppercase rounded-md select-none whitespace-nowrap bg-green-500/20">
//                   <span class="">paid</span>
//                 </div>
//               </div>
//             </td>
//             <td class="p-4 border-b border-blue-gray-50">
//               <div class="flex items-center gap-3">
//                 <div class="w-12 p-1 border rounded-md h-9 border-blue-gray-50">
//                   <img src="https://demos.creative-tim.com/test/corporate-ui-dashboard/assets/img/logos/visa.png"
//                     alt="visa"
//                     class="relative inline-block h-full w-full !rounded-none  object-contain object-center p-1" />
//                 </div>
//                 <div class="flex flex-col">
//                   <p
//                     class="block font-sans text-sm antialiased font-normal leading-normal capitalize text-blue-gray-900">
//                     visa 1234
//                   </p>
//                   <p
//                     class="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900 opacity-70">
//                     06/2026
//                   </p>
//                 </div>
//               </div>
//             </td>
//             <td class="p-4 border-b border-blue-gray-50">
//               <button
//                 class="relative h-10 max-h-[40px] w-10 max-w-[40px] select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-gray-900 transition-all hover:bg-gray-900/10 active:bg-gray-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
//                 type="button">
//                 <span class="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
//                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
//                     class="w-4 h-4">
//                     <path
//                       d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z">
//                     </path>
//                   </svg>
//                 </span>
//               </button>
//             </td>
//           </tr>
//           <tr>
//             <td class="p-4">
//               <div class="flex items-center gap-3">
//                 <img src="https://docs.material-tailwind.com/img/logos/logo-netflix.svg" alt="netflix"
//                   class="relative inline-block h-12 w-12 !rounded-full  border border-blue-gray-50 bg-blue-gray-50/50 object-contain object-center p-1" />
//                 <p class="block font-sans text-sm antialiased font-bold leading-normal text-blue-gray-900">
//                   netflix
//                 </p>
//               </div>
//             </td>
//             <td class="p-4">
//               <p class="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
//                 $14,000
//               </p>
//             </td>
//             <td class="p-4">
//               <p class="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
//                 Wed 3:30am
//               </p>
//             </td>
//             <td class="p-4">
//               <div class="w-max">
//                 <div
//                   class="relative grid items-center px-2 py-1 font-sans text-xs font-bold text-red-900 uppercase rounded-md select-none whitespace-nowrap bg-red-500/20">
//                   <span class="">cancelled</span>
//                 </div>
//               </div>
//             </td>
//             <td class="p-4">
//               <div class="flex items-center gap-3">
//                 <div class="w-12 p-1 border rounded-md h-9 border-blue-gray-50">
//                   <img src="https://demos.creative-tim.com/test/corporate-ui-dashboard/assets/img/logos/visa.png"
//                     alt="visa"
//                     class="relative inline-block h-full w-full !rounded-none  object-contain object-center p-1" />
//                 </div>
//                 <div class="flex flex-col">
//                   <p
//                     class="block font-sans text-sm antialiased font-normal leading-normal capitalize text-blue-gray-900">
//                     visa 1234
//                   </p>
//                   <p
//                     class="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900 opacity-70">
//                     06/2026
//                   </p>
//                 </div>
//               </div>
//             </td>
//             <td class="p-4">
//               <button
//                 class="relative h-10 max-h-[40px] w-10 max-w-[40px] select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-gray-900 transition-all hover:bg-gray-900/10 active:bg-gray-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
//                 type="button">
//                 <span class="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
//                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
//                     class="w-4 h-4">
//                     <path
//                       d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z">
//                     </path>
//                   </svg>
//                 </span>
//               </button>
//             </td>
//           </tr>
//         </tbody>
//       </table>
//     </div>
//     <div class="flex items-center justify-between p-4 border-t border-blue-gray-50">
//       <button
//         class="select-none rounded-lg border border-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-gray-900 transition-all hover:opacity-75 focus:ring focus:ring-gray-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
//         type="button">
//         Previous
//       </button>
//       <div class="flex items-center gap-2">
//         <button
//           class="relative h-8 max-h-[32px] w-8 max-w-[32px] select-none rounded-lg border border-gray-900 text-center align-middle font-sans text-xs font-medium uppercase text-gray-900 transition-all hover:opacity-75 focus:ring focus:ring-gray-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
//           type="button">
//           <span class="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
//             1
//           </span>
//         </button>
//         <button
//           class="relative h-8 max-h-[32px] w-8 max-w-[32px] select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-gray-900 transition-all hover:bg-gray-900/10 active:bg-gray-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
//           type="button">
//           <span class="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
//             2
//           </span>
//         </button>
//         <button
//           class="relative h-8 max-h-[32px] w-8 max-w-[32px] select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-gray-900 transition-all hover:bg-gray-900/10 active:bg-gray-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
//           type="button">
//           <span class="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
//             3
//           </span>
//         </button>
//         <button
//           class="relative h-8 max-h-[32px] w-8 max-w-[32px] select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-gray-900 transition-all hover:bg-gray-900/10 active:bg-gray-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
//           type="button">
//           <span class="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
//             ...
//           </span>
//         </button>
//         <button
//           class="relative h-8 max-h-[32px] w-8 max-w-[32px] select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-gray-900 transition-all hover:bg-gray-900/10 active:bg-gray-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
//           type="button">
//           <span class="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
//             8
//           </span>
//         </button>
//         <button
//           class="relative h-8 max-h-[32px] w-8 max-w-[32px] select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-gray-900 transition-all hover:bg-gray-900/10 active:bg-gray-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
//           type="button">
//           <span class="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
//             9
//           </span>
//         </button>
//         <button
//           class="relative h-8 max-h-[32px] w-8 max-w-[32px] select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-gray-900 transition-all hover:bg-gray-900/10 active:bg-gray-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
//           type="button">
//           <span class="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
//             10
//           </span>
//         </button>
//       </div>
//       <button
//         class="select-none rounded-lg border border-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-gray-900 transition-all hover:opacity-75 focus:ring focus:ring-gray-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
//         type="button">
//         Next
//       </button>
//     </div>
//   </div>
//     </div>
//   )
// }

// export default index




// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   setLayout,
//   addChart,
//   removeChart,
//   updateChart,
// } from "../../redux/layoutActions";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   ScatterChart,
//   Scatter,
//   PieChart,
//   Pie,
//   Cell,
// } from "recharts";
// import GridLayout from "react-grid-layout";
// import {
//   Box,
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   Typography,
//   IconButton,
//   InputLabel,
//   FormControl,
//   Select,
//   MenuItem,
//   useTheme,
// } from "@mui/material";
// import DeleteIcon from "@mui/icons-material/Delete";
// import DragHandleIcon from "@mui/icons-material/DragHandle";
// import { debounce } from "lodash";
// import { tokens } from "../../theme";
// import { useWebSocket } from "src/WebSocketProvider";
// import { SketchPicker } from "react-color";
// // Colors for the chart
// const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
// const Max_data_point = 20;

// const CustomCharts = () => {
//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);

//   const dispatch = useDispatch();
//   const charts = useSelector((state) => state.layout.customCharts);
//   const layout = useSelector((state) => state.layout.customChartsLayout);
//   const [chartDialogOpen, setChartDialogOpen] = useState(false);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [tempChartData, setTempChartData] = useState(null);
//   const websocketData = useWebSocket();
//   const [colorPickerOpen, setColorPickerOpen] = useState(false);
//   const [selectedYAxisId, setSelectedYAxisId] = useState(null);
//   // Load saved charts and layout when the component mounts

//   useEffect(() => {
//     const savedLayout = JSON.parse(localStorage.getItem("customChartsLayout")) || [];
//     dispatch(setLayout(savedLayout, "customCharts"));
//   }, [dispatch]);
  
//   // Save layout changes (debounced to avoid excessive dispatches)
//   const saveLayout = debounce((newLayout) => {
//     dispatch(setLayout(newLayout, "custom"));
//     localStorage.setItem("customChartsLayout", JSON.stringify(newLayout));
//   }, 500);

//   // Add a new custom chart of the specified type
//   const addCustomChart = (type) => {
//     const newChartId = Date.now();
//     const newChart = {
//       id: newChartId,
//       type,
//       data: [], // Initially empty, will be populated via WebSocket
//       xAxisDataKey: "",
//       yAxisDataKeys: [
//         {
//           id: "left-0",
//           dataKeys: ["AX-LT-011"],
//           range: "0-500",
//           color: "#ca33e8",
//           lineStyle: "solid",
//         },
//       ],
//     };
//     dispatch(addChart(newChart, "custom"));
//     saveLayout([
//       ...layout,
//       { i: newChartId.toString(), x: 0, y: Infinity, w: 6, h: 8 },
//     ]);
//     setChartDialogOpen(false);
//   };

//   // Remove a chart and update layout accordingly
//   const deleteChart = (chartId) => {
//     dispatch(removeChart(chartId, "custom"));
//     saveLayout(layout.filter((l) => l.i !== chartId.toString()));
//   };
 
//   // Open the configuration dialog for a specific chart
//   const openDialog = (chart) => {
//     setTempChartData(chart);
//     setDialogOpen(true);
//   };

//   // Save configuration changes to Redux and close the dialog
//   const saveConfiguration = () => {
//     if (tempChartData) {
//       dispatch(updateChart(tempChartData, "custom"));
//       setDialogOpen(false);
//     }
//   };

//   // WebSocket connection and data handling
//   useEffect(() => {
//     const ws = new WebSocket(
//       "wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/"
//     );
  
//     ws.onmessage = (event) => {
//       const message = JSON.parse(event.data);
  
//       const updatedCharts = charts.map((chart) => {
//         if (
//           chart.yAxisDataKeys.some((yAxis) =>
//             yAxis.dataKeys.includes("AX-LT-011")
//           )
//         ) {
//           // Append new data point
//           const newData = [...chart.data, message];
          
//           // Ensure we only keep the latest Max_data_point data points
//           const limitedData = newData.slice(-Max_data_point); // Keep only the last Max_data_point data points
          
//           return {
//             ...chart,
//             data: limitedData, // Update the chart with the limited data
//           };
//         }
//         return chart;
//       });
  
//       updatedCharts.forEach((chart) => dispatch(updateChart(chart, "custom")));
//     };
  
//     ws.onclose = () => console.log("WebSocket connection closed");
  
//     return () => ws.close(); // Clean up on component unmount
//   }, [charts, dispatch]);

//   const closeDialog = () => setDialogOpen(false);

//   const handleDataKeyChange = (yAxisId, event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
//         yAxis.id === yAxisId ? { ...yAxis, dataKeys: value } : yAxis
//       ),
//     }));
//   };

//   const handleXAxisDataKeyChange = (event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       xAxisDataKey: value,
//     }));
//   };

//   const handleLineStyleChange = (yAxisId, event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
//         yAxis.id === yAxisId ? { ...yAxis, lineStyle: value } : yAxis
//       ),
//     }));
//   };

//   const handleRangeChange = (yAxisId, event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
//         yAxis.id === yAxisId ? { ...yAxis, range: value } : yAxis
//       ),
//     }));
//   };

//   const addYAxis = () => {
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: [
//         ...prevChart.yAxisDataKeys,
//         {
//           id: `left-${prevChart.yAxisDataKeys.length}`,
//           dataKeys: [],
//           range: "0-500",
//           color: "#279096",
//           lineStyle: "solid",
//         },
//       ],
//     }));
//   };

//   const deleteYAxis = (yAxisId) => {
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.filter(
//         (yAxis) => yAxis.id !== yAxisId
//       ),
//     }));
//   };
//   const openColorPicker = (yAxisId) => {
//     setSelectedYAxisId(yAxisId);
//     setColorPickerOpen(true);
//   };
//   const handleColorChange = (color) => {
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
//         yAxis.id === selectedYAxisId ? { ...yAxis, color: color.hex } : yAxis
//       ),
//     }));
//     setColorPickerOpen(false);
//   };

//   const getYAxisDomain = (range) => {
//     switch (range) {
//       case "0-500":
//         return [0, 500];
//       case "0-100":
//         return [0, 100];
//       case "0-1200":
//         return [0, 1200];
//       default:
//         return [0, 500];
//     }
//   };

//   const getLineStyle = (lineStyle) => {
//     switch (lineStyle) {
//       case "solid":
//         return "";
//       case "dotted":
//         return "1 1";
//       case "dashed":
//         return "5 5";
//       case "dot-dash":
//         return "3 3 1 3";
//       case "dash-dot-dot":
//         return "3 3 1 1 1 3";
//       default:
//         return "";
//     }
//   };
//   const renderChart = (chart) => {
//     switch (chart.type) {
//       case "Line":
//         return renderLineChart(chart);
//       case "Bar":
//         return renderBarChart(chart);
//       case "Scatter":
//         return renderScatterChart(chart);
//       case "XY":
//         return renderXYChart(chart);
//       case "Pie":
//         return renderPieChart(chart);
//       default:
//         return null;
//     }
//   };

//   const renderLineChart = (chart) => (
//     <ResponsiveContainer width="100%" height="100%">
//       <LineChart data={chart.data}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis
       
//         />
//         {chart.yAxisDataKeys.map((yAxis) => (
//           <YAxis
//             key={yAxis.id}
//             yAxisId={yAxis.id}
//             domain={getYAxisDomain(yAxis.range)}
//             stroke={yAxis.color}
//           />
//         ))}
//         <Tooltip
//         cursor={{ strokeDasharray: '3 3' }}
//         content={({ payload }) => {
//           if (payload && payload.length) {
//             const point = payload[0].payload;
//             return (
//               <div className="custom-tooltip">
//                 {chart.yAxisDataKeys.map((yAxis) => (
                  
//                   <p key={yAxis.id}>
//                     {`Y (${yAxis.dataKeys[0]}): ${point[yAxis.dataKeys[0]]}`}
//                   </p>
                  
//                 ))}
                
//                 <p>
//                 {`Timestamp: ${new Date(new Date(websocketData.timestamp).getTime() + (5.5 * 60 * 60 * 1000)).toLocaleString('en-IN', {
//                   hour12: true,  // Optional: If you want a 12-hour format with AM/PM
//                   weekday: 'short', // Optional: To include the weekday name
//                   year: 'numeric',
//                   month: 'short',
//                   day: 'numeric',
//                   hour: '2-digit',
//                   minute: '2-digit',
//                   second: '2-digit'
//                 })}`}
//               </p>
//               </div>
//             );
//           }
//           return null;
//         }}
         
//       />
//       <Legend />
//         {chart.yAxisDataKeys.map((yAxis) =>
//           yAxis.dataKeys.map((key) => (
//             <Line
//               key={key}
//               dataKey={key}
//               fill={yAxis.color}
//               yAxisId={yAxis.id}
//               stroke={yAxis.color}
//               strokeDasharray={getLineStyle(yAxis.lineStyle)}
//             />
//           ))
//         )}
//       </LineChart>
//     </ResponsiveContainer>
//   );

//   const renderScatterChart = (chart) => (
//     <ResponsiveContainer width="100%" height="100%">
//       <ScatterChart data={chart.data}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis 
       
//         />
//         {chart.yAxisDataKeys.map((yAxis) => (
//           <YAxis
//             key={yAxis.id}
//             yAxisId={yAxis.id}
//             domain={getYAxisDomain(yAxis.range)}
//             stroke={yAxis.color}
//           />
//         ))}
//         <Tooltip
//         cursor={{ strokeDasharray: '3 3' }}
//         content={({ payload }) => {
//           if (payload && payload.length) {
//             const point = payload[0].payload;
//             return (
//               <div className="custom-tooltip">
                
//                 {chart.yAxisDataKeys.map((yAxis) => (
//                   <p key={yAxis.id}>
//                     {`Y (${yAxis.dataKeys[0]}): ${point[yAxis.dataKeys[0]]}`}
//                   </p>
//                 ))}
//                 <p>
//   {`Timestamp: ${new Date(new Date(websocketData.timestamp).getTime() + (5.5 * 60 * 60 * 1000)).toLocaleString('en-IN', {
//     hour12: true,  // Optional: If you want a 12-hour format with AM/PM
//     weekday: 'short', // Optional: To include the weekday name
//     year: 'numeric',
//     month: 'short',
//     day: 'numeric',
//     hour: '2-digit',
//     minute: '2-digit',
//     second: '2-digit'
//   })}`}
// </p>

//               </div>
//             );
//           }
//           return null;
//         }}
//       />
//         <Legend />
//         {chart.yAxisDataKeys.map((yAxis) =>
//           yAxis.dataKeys.map((key) => (
//             <Scatter
//               key={key}
//               dataKey={key}
//               fill={yAxis.color}
//               yAxisId={yAxis.id}
//             />
//           ))
//         )}
//       </ScatterChart>
//     </ResponsiveContainer>
//   );


//   const Max3_data_point = 50;

//   const renderXYChart = (chart) => {
//     // Limit the data to the latest 20 points
//     const updatedData = chart.data.slice(-Max3_data_point);
  
//     return (
//       <ResponsiveContainer width="100%" height="100%">
//         <ScatterChart data={updatedData}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis
//             dataKey={chart.xAxisDataKey}
//             type="number"
//             domain={["auto", "auto"]} // Automatically adjust the domain based on data
//             tickFormatter={(value) => value.toFixed(4)}
//           />
//           {chart.yAxisDataKeys.map((yAxis, yAxisIndex) => (
//             <YAxis
//               key={yAxisIndex} // Unique key for each YAxis
//               dataKey={chart.yAxisDataKey}
//               yAxisId={yAxis.id}
//               domain={["auto", "auto"]} // or use yAxis.range if defined
//               stroke={yAxis.color}
//               tickFormatter={(value) => value.toFixed(4)}
//             />
//           ))}
//           <Tooltip
//             cursor={{ strokeDasharray: '3 3' }}
//             content={({ payload }) => {
//               if (payload && payload.length) {
//                 const point = payload[0].payload;
//                 return (
//                   <div className="custom-tooltip">
//                     <p>{`X (${chart.xAxisDataKey}): ${point[chart.xAxisDataKey]}`}</p>
//                     {chart.yAxisDataKeys.map((yAxis) => (
//                       <p key={yAxis.id}>
//                         {`Y (${yAxis.dataKeys[0]}): ${point[yAxis.dataKeys[0]]}`}
//                       </p>
//                     ))}
//                     <p>
//                       {`Timestamp: ${new Date(new Date(websocketData.timestamp).getTime() + (5.5 * 60 * 60 * 1000)).toLocaleString('en-IN', {
//                         hour12: true, 
//                         weekday: 'short', 
//                         year: 'numeric',
//                         month: 'short',
//                         day: 'numeric',
//                         hour: '2-digit',
//                         minute: '2-digit',
//                         second: '2-digit'
//                       })}`}
//                     </p>
//                   </div>
//                 );
//               }
//               return null;
//             }}
//           />
//           <Legend />
//           {chart.yAxisDataKeys.map((yAxis) =>
//             yAxis.dataKeys.map((key, keyIndex) => (
//               <Scatter
//                 key={keyIndex} // Unique key for each scatter
//                 dataKey={key}
//                 fill={yAxis.color}
//                 yAxisId={yAxis.id}
//                 name={`${chart.xAxisDataKey} vs ${yAxis.dataKeys}`} // Ensure naming is clear and non-conflicting
//               />
//             ))
//           )}
//         </ScatterChart>
//       </ResponsiveContainer>
//     );
//   };
  

  
//   const Max2_data_point = 2;
//   const renderBarChart = (chart) => {
//     const updatedData = chart.data.slice(-Max2_data_point);
//     return (
//       <ResponsiveContainer width="100%" height="100%">
//       <BarChart data={updatedData}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis  
//        />
//         {chart.yAxisDataKeys.map((yAxis) => (
//           <YAxis
//             key={yAxis.id}
//             yAxisId={yAxis.id}
//             domain={getYAxisDomain(yAxis.range)}
//             stroke={yAxis.color}
//           />
//         ))}
//         <Tooltip
//         cursor={{ strokeDasharray: '3 3' }}
//         content={({ payload }) => {
//           if (payload && payload.length) {
//             const point = payload[0].payload;
//             return (
//               <div className="custom-tooltip">
//                 {chart.yAxisDataKeys.map((yAxis) => (
//                   <p key={yAxis.id}>
//                     {`Y (${yAxis.dataKeys[0]}): ${point[yAxis.dataKeys[0]]}`}
//                   </p>
//                 ))}
//                 <p>
//   {`Timestamp: ${new Date(new Date(websocketData.timestamp).getTime() + (5.5 * 60 * 60 * 1000)).toLocaleString('en-IN', {
//     hour12: true,  // Optional: If you want a 12-hour format with AM/PM
//     weekday: 'short', // Optional: To include the weekday name
//     year: 'numeric',
//     month: 'short',
//     day: 'numeric',
//     hour: '2-digit',
//     minute: '2-digit',
//     second: '2-digit'
//   })}`}
// </p>
//               </div>
//             );
//           }
//           return null;
//         }}
//       />

//         <Legend />
//         {chart.yAxisDataKeys.map((yAxis) =>
//           yAxis.dataKeys.map((key) => (
//             <Bar
//               key={key}
//               dataKey={key}
//               fill={yAxis.color}
//               yAxisId={yAxis.id}
//             />
//           ))
//         )}
//       </BarChart>
//     </ResponsiveContainer>
//     );
//   };
//   const renderPieChart = (chart) => {
//     const latestData = chart.data.slice(-1)[0];
//     const dataKeys = chart.yAxisDataKeys.flatMap((yAxis) => yAxis.dataKeys);
//     const pieData = dataKeys.map((key) => ({
//       name: key,
//       value: latestData ? latestData[key] : 0,
//     }));

//     return (
//       <ResponsiveContainer width="100%" height="100%">
//         <PieChart>
//           <Pie
//             data={pieData}
//             dataKey="value"
//             nameKey="name"
//             outerRadius={120}
//             label
//           >
//             {pieData.map((entry, index) => (
//               <Cell
//                 key={`cell-${index}`}
//                 fill={COLORS[index % COLORS.length]}
//               />
//             ))}
//           </Pie>
//           <Tooltip />
//           <Legend />
//         </PieChart>
//       </ResponsiveContainer>
//     );
//   };
//   return (
//     <>
//       <Box display="flex" justifyContent="flex-end" >
//         <Button color="secondary" variant="contained" onClick={() => setChartDialogOpen(true)}>
//           Add Custom Chart
//         </Button>
//       </Box>
//       <GridLayout
//         className="layout"
//         layout={layout}
//         cols={12}
//         rowHeight={30}
//         width={1630}
//         onLayoutChange={saveLayout}
//         draggableHandle=".drag-handle"
//       >
//         {charts.map((chart) => (
//           <Box
//             key={chart.id}
//             data-grid={
//               layout.find((l) => l.i === chart.id.toString()) || {
//                 x: 0,
//                 y: Infinity,
//                 w: 6,
//                 h: 8,
//               }
//             }
//             sx={{
//               position: "relative",
//               border: "1px solid #ccc",
//               borderRadius: "8px",
//               overflow: "hidden",
//             }}
//           >
//             <Box
//               display="flex"
//               justifyContent="space-between"
//               p={2}
             
//             >
//               <IconButton className="drag-handle">
//                 <DragHandleIcon />
//               </IconButton>
//               <Typography variant="h6">{chart.type} Chart</Typography>
//               <IconButton
//                 onClick={() => deleteChart(chart.id)}
//                 style={{ cursor: "pointer" }}
//               >
//                 <DeleteIcon />
//               </IconButton>
//             </Box>
//             <Box sx={{ height: "calc(100% - 80px)" }}>{renderChart(chart)}</Box>
//             <Box
//               display="flex"
//               justifyContent="space-between"
//               p={2}
//               marginTop={-6}
//             >
//               <Button
//                 variant="outlined"
//                 color="secondary"
//                 onClick={() => openDialog(chart)}
//               >
//                 Configure Chart
//               </Button>
//             </Box>
//           </Box>
//         ))}
//       </GridLayout>

//       <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
//         <DialogTitle>Select Chart Type</DialogTitle>
//         <DialogContent>
//           <Box display="flex" flexDirection="column" gap={2}>
//             <Button variant="contained" onClick={() => addCustomChart("Line")}>
//               Add Line Chart
//             </Button>
//             <Button variant="contained" onClick={() => addCustomChart("Bar")}>
//               Add Bar Chart
//             </Button>
//             <Button
//               variant="contained"
//               onClick={() => addCustomChart("Scatter")}
//             >
//               Add Scatter Chart
//             </Button>
//             <Button variant="contained" onClick={() => addCustomChart("XY")}>
//               Add XY Chart
//             </Button>
//             <Button variant="contained" onClick={() => addCustomChart("Pie")}>
//               Add Pie Chart
//             </Button>
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setChartDialogOpen(false)} color="secondary">
//             Cancel
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {tempChartData && (
//         <Dialog
//           open={dialogOpen}
//           onClose={closeDialog}
//           fullWidth
//           maxWidth="md"
//           marginBottom="5px"
//         >
//           <DialogTitle>Configure Chart</DialogTitle>
//           <DialogContent>
//             <Box
//               display="flex"
//               flexDirection="column"
//               maxHeight="400px"
//               overflow="auto"
//             >
//               {tempChartData.type === "XY" && (
//                 <Box marginBottom={2}>
//                   <Typography variant="h6">X-Axis</Typography>
//                   <FormControl margin="normal">
//                     <InputLabel>X-Axis Data Key</InputLabel>
//                     <Select
//                       value={tempChartData.xAxisDataKey}
//                       onChange={handleXAxisDataKeyChange}
//                     >
//                       <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//                       <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
//                       <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
//                       <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
//                       <MenuItem value="CR-LT-011">CR-LT-011</MenuItem>
//                       <MenuItem value="CR-PT-011">CR-PT-011</MenuItem>
//                       <MenuItem value="CR-LT-021">CR-LT-021</MenuItem>
//                       <MenuItem value="CR-PT-021">CR-PT-021</MenuItem>
//                       <MenuItem value="CR-PT-001">CR-PT-001</MenuItem>
//                       <MenuItem value="CR-TT-001">CR-TT-001</MenuItem>
//                       <MenuItem value="CR-FT-001">CR-FT-001</MenuItem>
//                       <MenuItem value="CR-TT-002">CR-TT-002</MenuItem>
//                       <MenuItem value="GS-AT-011">GS-AT-011</MenuItem>
//                       <MenuItem value="GS-AT-012">GS-AT-012</MenuItem>
//                       <MenuItem value="GS-PT-011">GS-PT-011</MenuItem>
//                       <MenuItem value="GS-TT-011">GS-TT-011</MenuItem>
//                       <MenuItem value="GS-AT-022">GS-AT-022</MenuItem>
//                       <MenuItem value="GS-PT-021">GS-PT-021</MenuItem>
//                       <MenuItem value="GS-TT-021">GS-TT-021</MenuItem>
//                       <MenuItem value="PR-TT-001">PR-TT-001</MenuItem>
//                       <MenuItem value="PR-TT-061">PR-TT-061</MenuItem>
//                       <MenuItem value="PR-TT-072">PR-TT-072</MenuItem>
//                       <MenuItem value="PR-FT-001">PR-FT-001</MenuItem>
//                       <MenuItem value="PR-AT-001">PR-AT-001</MenuItem>
//                       <MenuItem value="PR-AT-003">PR-AT-003</MenuItem>
//                       <MenuItem value="PR-AT-005">PR-AT-005</MenuItem>
//                       <MenuItem value="DM-LSH-001">DM-LSH-001</MenuItem>
//                       <MenuItem value="DM-LSL-001">DM-LSL-001</MenuItem>
//                       <MenuItem value="GS-LSL-021">GS-LSL-021</MenuItem>
//                       <MenuItem value="GS-LSL-011">GS-LSL-011</MenuItem>
//                       <MenuItem value="PR-VA-301">PR-VA-301</MenuItem>
//                       <MenuItem value="PR-VA-352">PR-VA-352</MenuItem>
//                       <MenuItem value="PR-VA-312">PR-VA-312</MenuItem>
//                       <MenuItem value="PR-VA-351">PR-VA-351</MenuItem>
//                       <MenuItem value="PR-VA-361Ain">PR-VA-361Ain</MenuItem>
//                       <MenuItem value="PR-VA-361Aout">PR-VA-361Aout</MenuItem>
//                       <MenuItem value="PR-VA-361Bin">PR-VA-361Bin</MenuItem>
//                       <MenuItem value="PR-VA-361Bout">PR-VA-361Bout</MenuItem>
//                       <MenuItem value="PR-VA-362Ain">PR-VA-362Ain</MenuItem>
//                       <MenuItem value="PR-VA-362Aout">PR-VA-362Aout</MenuItem>
//                       <MenuItem value="PR-VA-362Bin">PR-VA-362Bin</MenuItem>
//                       <MenuItem value="PR-VA-362Bout">PR-VA-362Bout</MenuItem>
//                       <MenuItem value="N2-VA-311">N2-VA-311</MenuItem>
//                       <MenuItem value="GS-VA-311">GS-VA-311</MenuItem>
//                       <MenuItem value="GS-VA-312">GS-VA-312</MenuItem>
//                       <MenuItem value="N2-VA-321">N2-VA-321</MenuItem>
//                       <MenuItem value="GS-VA-321">GS-VA-321</MenuItem>
//                       <MenuItem value="GS-VA-322">GS-VA-322</MenuItem>
//                       <MenuItem value="GS-VA-022">GS-VA-022</MenuItem>
//                       <MenuItem value="GS-VA-021">GS-VA-021</MenuItem>
//                       <MenuItem value="AX-VA-351">AX-VA-351</MenuItem>
//                       <MenuItem value="AX-VA-311">AX-VA-311</MenuItem>
//                       <MenuItem value="AX-VA-312">AX-VA-312</MenuItem>
//                       <MenuItem value="AX-VA-321">AX-VA-321</MenuItem>
//                       <MenuItem value="AX-VA-322">AX-VA-322</MenuItem>
//                       <MenuItem value="AX-VA-391">AX-VA-391</MenuItem>
//                       <MenuItem value="DM-VA-301">DM-VA-301</MenuItem>
//                       <MenuItem value="DCDB0-VT-001">DCDB0-VT-001</MenuItem>
//                       <MenuItem value="DCDB0-CT-001">DCDB0-CT-001</MenuItem>
//                       <MenuItem value="DCDB1-VT-001">DCDB1-VT-001</MenuItem>
//                       <MenuItem value="DCDB1-CT-001">DCDB1-CT-001</MenuItem>
//                       <MenuItem value="DCDB2-VT-001">DCDB2-VT-001</MenuItem>
//                       <MenuItem value="DCDB2-CT-001">DCDB2-CT-001</MenuItem>
//                       <MenuItem value="DCDB3-VT-001">DCDB3-VT-001</MenuItem>
//                       <MenuItem value="DCDB3-CT-001">DCDB3-CT-001</MenuItem>
//                       <MenuItem value="DCDB4-VT-001">DCDB4-VT-001</MenuItem>
//                       <MenuItem value="DCDB4-CT-001">DCDB4-CT-001</MenuItem>
//                       <MenuItem value="RECT-CT-001">RECT-CT-001</MenuItem>
//                       <MenuItem value="RECT-VT-001">RECT-VT-001</MenuItem>
//                     </Select>
//                   </FormControl>
//                 </Box>
//               )}
//               {tempChartData.yAxisDataKeys.map((yAxis, index) => (
//                 <Box
//                   key={yAxis.id}
//                   display="flex"
//                   flexDirection="column"
//                   marginBottom={2}
//                 >
//                   <Box
//                     display="flex"
//                     justifyContent="space-between"
//                     alignItems="center"
//                   >
//                     <Typography variant="h6">Y-Axis {index + 1}</Typography>
//                     <IconButton onClick={() => deleteYAxis(yAxis.id)}>
//                       <DeleteIcon />
//                     </IconButton>
//                   </Box>
//                   <FormControl fullWidth margin="normal">
//                     <InputLabel>Data Keys</InputLabel>
//                     <Select
//                       multiple  
//                       value={yAxis.dataKeys}
//                       onChange={(event) => handleDataKeyChange(yAxis.id, event)}
//                     >
//                       <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//                       <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
//                       <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
//                       <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
//                       <MenuItem value="CR-LT-011">CR-LT-011</MenuItem>
//                       <MenuItem value="CR-PT-011">CR-PT-011</MenuItem>
//                       <MenuItem value="CR-LT-021">CR-LT-021</MenuItem>
//                       <MenuItem value="CR-PT-021">CR-PT-021</MenuItem>
//                       <MenuItem value="CR-PT-001">CR-PT-001</MenuItem>
//                       <MenuItem value="CR-TT-001">CR-TT-001</MenuItem>
//                       <MenuItem value="CR-FT-001">CR-FT-001</MenuItem>
//                       <MenuItem value="CR-TT-002">CR-TT-002</MenuItem>
//                       <MenuItem value="GS-AT-011">GS-AT-011</MenuItem>
//                       <MenuItem value="GS-AT-012">GS-AT-012</MenuItem>
//                       <MenuItem value="GS-PT-011">GS-PT-011</MenuItem>
//                       <MenuItem value="GS-TT-011">GS-TT-011</MenuItem>
//                       <MenuItem value="GS-AT-022">GS-AT-022</MenuItem>
//                       <MenuItem value="GS-PT-021">GS-PT-021</MenuItem>
//                       <MenuItem value="GS-TT-021">GS-TT-021</MenuItem>
//                       <MenuItem value="PR-TT-001">PR-TT-001</MenuItem>
//                       <MenuItem value="PR-TT-061">PR-TT-061</MenuItem>
//                       <MenuItem value="PR-TT-072">PR-TT-072</MenuItem>
//                       <MenuItem value="PR-FT-001">PR-FT-001</MenuItem>
//                       <MenuItem value="PR-AT-001">PR-AT-001</MenuItem>
//                       <MenuItem value="PR-AT-003">PR-AT-003</MenuItem>
//                       <MenuItem value="PR-AT-005">PR-AT-005</MenuItem>
//                       <MenuItem value="DM-LSH-001">DM-LSH-001</MenuItem>
//                       <MenuItem value="DM-LSL-001">DM-LSL-001</MenuItem>
//                       <MenuItem value="GS-LSL-021">GS-LSL-021</MenuItem>
//                       <MenuItem value="GS-LSL-011">GS-LSL-011</MenuItem>
//                       <MenuItem value="PR-VA-301">PR-VA-301</MenuItem>
//                       <MenuItem value="PR-VA-352">PR-VA-352</MenuItem>
//                       <MenuItem value="PR-VA-312">PR-VA-312</MenuItem>
//                       <MenuItem value="PR-VA-351">PR-VA-351</MenuItem>
//                       <MenuItem value="PR-VA-361Ain">PR-VA-361Ain</MenuItem>
//                       <MenuItem value="PR-VA-361Aout">PR-VA-361Aout</MenuItem>
//                       <MenuItem value="PR-VA-361Bin">PR-VA-361Bin</MenuItem>
//                       <MenuItem value="PR-VA-361Bout">PR-VA-361Bout</MenuItem>
//                       <MenuItem value="PR-VA-362Ain">PR-VA-362Ain</MenuItem>
//                       <MenuItem value="PR-VA-362Aout">PR-VA-362Aout</MenuItem>
//                       <MenuItem value="PR-VA-362Bin">PR-VA-362Bin</MenuItem>
//                       <MenuItem value="PR-VA-362Bout">PR-VA-362Bout</MenuItem>
//                       <MenuItem value="N2-VA-311">N2-VA-311</MenuItem>
//                       <MenuItem value="GS-VA-311">GS-VA-311</MenuItem>
//                       <MenuItem value="GS-VA-312">GS-VA-312</MenuItem>
//                       <MenuItem value="N2-VA-321">N2-VA-321</MenuItem>
//                       <MenuItem value="GS-VA-321">GS-VA-321</MenuItem>
//                       <MenuItem value="GS-VA-322">GS-VA-322</MenuItem>
//                       <MenuItem value="GS-VA-022">GS-VA-022</MenuItem>
//                       <MenuItem value="GS-VA-021">GS-VA-021</MenuItem>
//                       <MenuItem value="AX-VA-351">AX-VA-351</MenuItem>
//                       <MenuItem value="AX-VA-311">AX-VA-311</MenuItem>
//                       <MenuItem value="AX-VA-312">AX-VA-312</MenuItem>
//                       <MenuItem value="AX-VA-321">AX-VA-321</MenuItem>
//                       <MenuItem value="AX-VA-322">AX-VA-322</MenuItem>
//                       <MenuItem value="AX-VA-391">AX-VA-391</MenuItem>
//                       <MenuItem value="DM-VA-301">DM-VA-301</MenuItem>
//                       <MenuItem value="DCDB0-VT-001">DCDB0-VT-001</MenuItem>
//                       <MenuItem value="DCDB0-CT-001">DCDB0-CT-001</MenuItem>
//                       <MenuItem value="DCDB1-VT-001">DCDB1-VT-001</MenuItem>
//                       <MenuItem value="DCDB1-CT-001">DCDB1-CT-001</MenuItem>
//                       <MenuItem value="DCDB2-VT-001">DCDB2-VT-001</MenuItem>
//                       <MenuItem value="DCDB2-CT-001">DCDB2-CT-001</MenuItem>
//                       <MenuItem value="DCDB3-VT-001">DCDB3-VT-001</MenuItem>
//                       <MenuItem value="DCDB3-CT-001">DCDB3-CT-001</MenuItem>
//                       <MenuItem value="DCDB4-VT-001">DCDB4-VT-001</MenuItem>
//                       <MenuItem value="DCDB4-CT-001">DCDB4-CT-001</MenuItem>
//                       <MenuItem value="RECT-CT-001">RECT-CT-001</MenuItem>
//                       <MenuItem value="RECT-VT-001">RECT-VT-001</MenuItem>
//                     </Select>
//                   </FormControl>
//                   <FormControl fullWidth margin="normal">
//                     <InputLabel>Range</InputLabel>
//                     <Select
//                       value={yAxis.range}
//                       onChange={(event) => handleRangeChange(yAxis.id, event)}
//                     >
//                       <MenuItem value="0-100">0-100</MenuItem>
//                       <MenuItem value="0-500">0-500</MenuItem>
//                       <MenuItem value="0-1200">0-1200</MenuItem>
//                     </Select>
//                   </FormControl>
//                   <FormControl fullWidth margin="normal">
//                     <InputLabel>Line Style</InputLabel>
//                     <Select
//                       value={yAxis.lineStyle}
//                       onChange={(event) =>
//                         handleLineStyleChange(yAxis.id, event)
//                       }
//                     >
//                       <MenuItem value="solid">Solid</MenuItem>
//                       <MenuItem value="dotted">Dotted</MenuItem>
//                       <MenuItem value="dashed">Dashed</MenuItem>
//                       <MenuItem value="dot-dash">Dot Dash</MenuItem>
//                       <MenuItem value="dash-dot-dot">Dash Dot Dot</MenuItem>
//                     </Select>
//                   </FormControl>
//                   <Button color="secondary" onClick={() => openColorPicker(yAxis.id)}>
//                   Select Color
//                 </Button>
//                 {colorPickerOpen && selectedYAxisId === yAxis.id && (
//                   <SketchPicker
//                     color={yAxis.color}
//                     onChangeComplete={handleColorChange}
//                   />
//                 )}
//                 </Box>
//               ))}
//               <Button variant="contained" color="secondary" onClick={addYAxis}>
//                 Add Y-Axis
//               </Button>
//             </Box>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={closeDialog} color="secondary">
//               Cancel
//             </Button>
//             <Button onClick={saveConfiguration} color="secondary">
//               Save
//             </Button>
//           </DialogActions>
//         </Dialog>
//       )}
//     </>
//   );
// };

// export default CustomCharts;


// import React, { useState } from 'react';

// function IoTDataViewer() {
//     const [startTime, setStartTime] = useState('');
//     const [endTime, setEndTime] = useState('');
//     const [allData, setAllData] = useState([]); // Store the complete dataset
//     const [data, setData] = useState([]); // Store the deduplicated data
//     const [error, setError] = useState('');
//     const [selectedTestName, setSelectedTestName] = useState(null); // State to store the selected Test-Name
//     const [totalizerFlow, setTotalizerFlow] = useState(null); // Store the totalizer flow value

//     const fetchData = async () => {
//         try {
//             const response = await fetch('https://zxj8fcr2a7.execute-api.us-east-1.amazonaws.com/dev/iot-data', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ start_time: startTime, end_time: endTime }),
//             });

//             const rawResult = await response.json();
//             console.log("Raw API Response:", rawResult);

//             const result = rawResult.body ? JSON.parse(rawResult.body) : rawResult;

//             console.log("Parsed Result:", result);

//             if (response.ok) {
//                 const processedData = (result.data || []).map((row) => ({
//                     timestamp: row.timestamp || row.time_bucket, // Handle `time_bucket` for aggregated data
//                     ist_timestamp: row.ist_timestamp || 'N/A', // Default for missing fields
//                     AX_LT_011: row.device_data?.["AX-LT-011"] || row["AX-LT-011"], // Adjust for different structures
//                     Test_Name: row.device_data?.["Test-Name"] || row["Test-Name"], // Adjust for different structures
//                     CR_FT_001: row.device_data?.["CR-FT-001"] || row["CR_FT_001"], // Handle CR_FT_001
//                 }));
//                 // Deduplicate data to show only the first occurrence of each Test-Name
//                 const uniqueTestNames = new Set();
//                 const deduplicatedData = processedData.filter((row) => {
//                     if (row.Test_Name && !uniqueTestNames.has(row.Test_Name)) {
//                         uniqueTestNames.add(row.Test_Name);
//                         return true; // Include the row
//                     }
//                     return false; // Skip the row
//                 });
//                 setAllData(processedData); // Store the complete dataset
//                 setData(deduplicatedData); // Store the deduplicated dataset
//                 setError('');
//             } else {
//                 setAllData([]);
//                 setData([]);
//                 setError(result.message || 'Failed to fetch data');
//             }
//         } catch (err) {
//             console.error("Error in Fetch:", err);
//             setAllData([]);
//             setData([]);
//             setError(err.message || 'An unexpected error occurred');
//         }
//     };

//     const handleTestNameClick = (testName) => {
//         setSelectedTestName(testName); // Set the selected Test-Name
//         calculateTotalizerFlow(testName); // Calculate the totalizer flow
//     };

//     const calculateTotalizerFlow = (testName) => {
//       const filteredRows = allData.filter((row) => row.Test_Name === testName);
  
//       if (filteredRows.length === 0) {
//           setTotalizerFlow(null);
//           return;
//       }
  
//       // Filter out invalid and negative values
//       const validRows = filteredRows.filter((row) => row.CR_FT_001 && row.CR_FT_001 > 0);
  
//       if (validRows.length < 2) {
//           // If less than 2 valid rows, we cannot calculate a meaningful totalizer flow
//           setTotalizerFlow(0);
//           return;
//       }
  
//       // Calculate the totalizer flow dynamically
//       let totalFlow = 0;
//       for (let i = 0; i < validRows.length - 1; i++) {
//           const currentRow = validRows[i];
//           const nextRow = validRows[i + 1];
  
//           const currentTimestamp = new Date(currentRow.timestamp).getTime();
//           const nextTimestamp = new Date(nextRow.timestamp).getTime();
  
//           const durationInSeconds = (nextTimestamp - currentTimestamp) / 1000;
  
//           // Add flow contribution for the time duration between two rows
//           if (durationInSeconds > 0) {
//               totalFlow += currentRow.CR_FT_001 * durationInSeconds;
//           }
//       }
  
//       // Calculate the total test duration in seconds
//       const startTimestamp = new Date(validRows[0].timestamp).getTime();
//       const endTimestamp = new Date(validRows[validRows.length - 1].timestamp).getTime();
//       const totalDurationInSeconds = (endTimestamp - startTimestamp) / 1000;
  
//       // Avoid division by zero
//       const totalizer = totalDurationInSeconds > 0 ? totalFlow / totalDurationInSeconds : 0;
  
//       setTotalizerFlow(totalizer); // Set the totalizer flow value
//   };
  

//     // Filter all rows with the selected Test-Name
//     const filteredRows = selectedTestName
//         ? allData.filter((row) => row.Test_Name === selectedTestName)
//         : [];

//     return (
//         <div>
//             <h1>IoT Data Viewer</h1>
//             <div>
//                 <label>
//                     Start Time:
//                     <input
//                         type="datetime-local"
//                         value={startTime}
//                         onChange={(e) => setStartTime(e.target.value)}
//                     />
//                 </label>
//                 <label>
//                     End Time:
//                     <input
//                         type="datetime-local"
//                         value={endTime}
//                         onChange={(e) => setEndTime(e.target.value)}
//                     />
//                 </label>
//                 <button onClick={fetchData}>Fetch Data</button>
//             </div>
//             {error && <p style={{ color: 'red' }}>{error}</p>}
//             {data.length > 0 ? (
//                 <>
//                     <table border="1">
//                         <thead>
//                             <tr>
//                                 <th>Timestamp</th>
//                                 <th>IST Timestamp</th>
//                                 <th>AX-LT-011</th>
//                                 <th>Test-Name</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {data.map((row, index) => (
//                                 <tr key={index}>
//                                     <td>{row.timestamp}</td>
//                                     <td>{row.ist_timestamp}</td>
//                                     <td>{row.AX_LT_011}</td>
//                                     <td>
//                                         <button
//                                             style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}
//                                             onClick={() => handleTestNameClick(row.Test_Name)}
//                                         >
//                                             {row.Test_Name}
//                                         </button>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>

//                     {selectedTestName && (
//                         <>
//                             <h2>Details for Test-Name: {selectedTestName}</h2>
//                             <table border="1">
//                                 <thead>
//                                     <tr>
                                   
//                                         <th>IST Timestamp</th>
//                                         <th>AX-LT-011</th>
//                                         <th>Test-Name</th>
//                                         <th>CR_FT_001</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {filteredRows.map((row, index) => (
//                                         <tr key={index}>
                                        
//                                             <td>{row.ist_timestamp}</td>
//                                             <td>{row.AX_LT_011}</td>
//                                             <td>{row.Test_Name}</td>
//                                             <td>{row.CR_FT_001}</td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                             <h3>Totalizer Flow for "{selectedTestName}": {totalizerFlow !== null ? totalizerFlow.toFixed(2) : 'N/A'} Liters/Second</h3>
//                         </>
//                     )}
//                 </>
//             ) : (
//                 <p>No data available for the selected date range.</p>
//             )}
//         </div>
//     );
// }

// export default IoTDataViewer;




// import React, { useState } from 'react';

// function IoTDataViewer() {
//     const [startTime, setStartTime] = useState('');
//     const [endTime, setEndTime] = useState('');
//     const [allData, setAllData] = useState([]); // Store the complete dataset
//     const [data, setData] = useState([]); // Store the deduplicated data
//     const [error, setError] = useState('');
//     const [selectedTestName, setSelectedTestName] = useState(null); // State to store the selected Test-Name
//     const [totalizerFlow, setTotalizerFlow] = useState(null); // Store the totalizer flow value

//     const fetchData = async () => {
//         try {
//             const response = await fetch('https://zxj8fcr2a7.execute-api.us-east-1.amazonaws.com/dev/iot-data', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ start_time: startTime, end_time: endTime }),
//             });

//             const rawResult = await response.json();
//             console.log("Raw API Response:", rawResult);

//             const result = rawResult.body ? JSON.parse(rawResult.body) : rawResult;

//             console.log("Parsed Result:", result);

//             if (response.ok) {
//                 const processedData = (result.data || []).map((row) => ({
//                     timestamp: row.timestamp || row.time_bucket, // Handle `time_bucket` for aggregated data
//                     ist_timestamp: row.ist_timestamp || 'N/A', // Default for missing fields
//                     AX_LT_011: row.device_data?.["AX-LT-011"] || row["AX-LT-011"], // Adjust for different structures
//                     Test_Name: row.device_data?.["Test-Name"] || row["Test-Name"], // Adjust for different structures
//                     CR_FT_001: row.device_data?.["CR-FT-001"] || row["CR_FT_001"], // Handle CR_FT_001
//                 }));

//                 // Deduplicate data to show only the first occurrence of each Test-Name
//                 const uniqueTestNames = new Set();
//                 const deduplicatedData = processedData.filter((row) => {
//                     if (row.Test_Name && !uniqueTestNames.has(row.Test_Name)) {
//                         uniqueTestNames.add(row.Test_Name);
//                         return true; // Include the row
//                     }
//                     return false; // Skip the row
//                 });

//                 setAllData(processedData); // Store the complete dataset
//                 setData(deduplicatedData); // Store the deduplicated dataset
//                 setError('');
//             } else {
//                 setAllData([]);
//                 setData([]);
//                 setError(result.message || 'Failed to fetch data');
//             }
//         } catch (err) {
//             console.error("Error in Fetch:", err);
//             setAllData([]);
//             setData([]);
//             setError(err.message || 'An unexpected error occurred');
//         }
//     };

//     const handleTestNameClick = (testName) => {
//         setSelectedTestName(testName); // Set the selected Test-Name
//         calculateTotalizerFlow(testName); // Calculate the totalizer flow
//     };

//     const calculateTotalizerFlow = (testName) => {
//         const filteredRows = allData.filter((row) => row.Test_Name === testName);

//         if (filteredRows.length === 0) {
//             setTotalizerFlow(null);
//             return;
//         }

//         // Calculate the totalizer flow
//         const totalFlow = filteredRows.reduce((sum, row) => sum + (row.CR_FT_001 || 0), 0);

//         // Calculate the time difference in seconds
//         const startTimestamp = new Date(filteredRows[0].timestamp).getTime();
//         const endTimestamp = new Date(filteredRows[filteredRows.length - 1].timestamp).getTime();
//         const durationInSeconds = (endTimestamp - startTimestamp) / 1000;

//         // Avoid division by zero
//         const totalizer = durationInSeconds > 0 ? totalFlow / durationInSeconds : 0;

//         setTotalizerFlow(totalizer); // Set the totalizer flow value
//     };

//     // Filter all rows with the selected Test-Name
//     const filteredRows = selectedTestName
//         ? allData.filter((row) => row.Test_Name === selectedTestName)
//         : [];

//     return (
//         <div>
//             <h1>IoT Data Viewer</h1>
//             <div>
//                 <label>
//                     Start Time:
//                     <input
//                         type="datetime-local"
//                         value={startTime}
//                         onChange={(e) => setStartTime(e.target.value)}
//                     />
//                 </label>
//                 <label>
//                     End Time:
//                     <input
//                         type="datetime-local"
//                         value={endTime}
//                         onChange={(e) => setEndTime(e.target.value)}
//                     />
//                 </label>
//                 <button onClick={fetchData}>Fetch Data</button>
//             </div>
//             {error && <p style={{ color: 'red' }}>{error}</p>}
//             {data.length > 0 ? (
//                 <>
//                     <table border="1">
//                         <thead>
//                             <tr>
//                                 <th>Timestamp</th>
//                                 <th>IST Timestamp</th>
//                                 <th>AX-LT-011</th>
//                                 <th>Test-Name</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {data.map((row, index) => (
//                                 <tr key={index}>
//                                     <td>{row.timestamp}</td>
//                                     <td>{row.ist_timestamp}</td>
//                                     <td>{row.AX_LT_011}</td>
//                                     <td>
//                                         <button
//                                             style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}
//                                             onClick={() => handleTestNameClick(row.Test_Name)}
//                                         >
//                                             {row.Test_Name}
//                                         </button>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>

//                     {selectedTestName && (
//                         <>
//                             <h2>Details for Test-Name: {selectedTestName}</h2>
//                             <table border="1">
//                                 <thead>
//                                     <tr>
//                                         <th>Timestamp</th>
//                                         <th>IST Timestamp</th>
//                                         <th>AX-LT-011</th>
//                                         <th>Test-Name</th>
//                                         <th>CR_FT_001</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {filteredRows.map((row, index) => (
//                                         <tr key={index}>
//                                             <td>{row.timestamp}</td>
//                                             <td>{row.ist_timestamp}</td>
//                                             <td>{row.AX_LT_011}</td>
//                                             <td>{row.Test_Name}</td>
//                                             <td>{row.CR_FT_001}</td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                             <h3>Totalizer Flow for "{selectedTestName}": {totalizerFlow !== null ? totalizerFlow.toFixed(2) : 'N/A'} Liters/Second</h3>
//                         </>
//                     )}
//                 </>
//             ) : (
//                 <p>No data available for the selected date range.</p>
//             )}
//         </div>
//     );
// }

// export default IoTDataViewer;



// import React, { useState } from 'react';

// function IoTDataViewer() {
//     const [startTime, setStartTime] = useState('');
//     const [endTime, setEndTime] = useState('');
//     const [allData, setAllData] = useState([]); // Store the complete dataset
//     const [data, setData] = useState([]); // Store the deduplicated data
//     const [error, setError] = useState('');
//     const [selectedTestName, setSelectedTestName] = useState(null); // State to store the selected Test-Name

//     const fetchData = async () => {
//         try {
//             const response = await fetch('https://zxj8fcr2a7.execute-api.us-east-1.amazonaws.com/dev/iot-data', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ start_time: startTime, end_time: endTime }),
//             });

//             const rawResult = await response.json();
//             console.log("Raw API Response:", rawResult);

//             const result = rawResult.body ? JSON.parse(rawResult.body) : rawResult;

//             console.log("Parsed Result:", result);

//             if (response.ok) {
//                 const processedData = (result.data || []).map((row) => ({
//                     timestamp: row.timestamp || row.time_bucket, // Handle `time_bucket` for aggregated data
//                     ist_timestamp: row.ist_timestamp || 'N/A', // Default for missing fields
//                     AX_LT_011: row.device_data?.["AX-LT-011"] || row["AX-LT-011"], // Adjust for different structures
//                     Test_Name: row.device_data?.["Test-Name"] || row["Test-Name"], // Adjust for different structures
//                     CR_FT_001: row.device_data?.["CR-FT-001"] || row["cr_ft_001"],
//                   }));

//                 // Deduplicate data to show only the first occurrence of each Test-Name
//                 const uniqueTestNames = new Set();
//                 const deduplicatedData = processedData.filter((row) => {
//                     if (row.Test_Name && !uniqueTestNames.has(row.Test_Name)) {
//                         uniqueTestNames.add(row.Test_Name);
//                         return true; // Include the row
//                     }
//                     return false; // Skip the row
//                 });

//                 setAllData(processedData); // Store the complete dataset
//                 setData(deduplicatedData); // Store the deduplicated dataset
//                 setError('');
//             } else {
//                 setAllData([]);
//                 setData([]);
//                 setError(result.message || 'Failed to fetch data');
//             }
//         } catch (err) {
//             console.error("Error in Fetch:", err);
//             setAllData([]);
//             setData([]);
//             setError(err.message || 'An unexpected error occurred');
//         }
//     };

//     const handleTestNameClick = (testName) => {
//         setSelectedTestName(testName); // Set the selected Test-Name
//     };

//     // Filter all rows with the selected Test-Name
//     const filteredRows = selectedTestName
//         ? allData.filter((row) => row.Test_Name === selectedTestName)
//         : [];

//     return (
//         <div>
//             <h1>IoT Data Viewer</h1>
//             <div>
//                 <label>
//                     Start Time:
//                     <input
//                         type="datetime-local"
//                         value={startTime}
//                         onChange={(e) => setStartTime(e.target.value)}
//                     />
//                 </label>
//                 <label>
//                     End Time:
//                     <input
//                         type="datetime-local"
//                         value={endTime}
//                         onChange={(e) => setEndTime(e.target.value)}
//                     />
//                 </label>
//                 <button onClick={fetchData}>Fetch Data</button>
//             </div>
//             {error && <p style={{ color: 'red' }}>{error}</p>}
//             {data.length > 0 ? (
//                 <>
//                     <table border="1">
//                         <thead>
//                             <tr>
//                                 <th>Timestamp</th>
//                                 <th>IST Timestamp</th>
//                                 <th>AX-LT-011</th>
//                                 <th>Test-Name</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {data.map((row, index) => (
//                                 <tr key={index}>
//                                     <td>{row.timestamp}</td>
//                                     <td>{row.ist_timestamp}</td>
//                                     <td>{row.AX_LT_011}</td>
//                                     <td>
//                                         <button
//                                             style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}
//                                             onClick={() => handleTestNameClick(row.Test_Name)}
//                                         >
//                                             {row.Test_Name}
//                                         </button>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>

//                     {selectedTestName && filteredRows.length > 0 && (
//                         <>
//                             <h2>Details for Test-Name: {selectedTestName}</h2>
//                             <table border="1">
//                                 <thead>
//                                     <tr>
//                                         <th>Timestamp</th>
//                                         <th>IST Timestamp</th>
//                                         <th>AX-LT-011</th>
//                                         <th>Test-Name</th>
//                                         <th>CR_FT_001</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {filteredRows.map((row, index) => (
//                                         <tr key={index}>
//                                             <td>{row.timestamp}</td>
//                                             <td>{row.ist_timestamp}</td>
//                                             <td>{row.AX_LT_011}</td>
//                                             <td>{row.Test_Name}</td>
//                                             <td>{row.CR_FT_001}</td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </>
//                     )}
//                 </>
//             ) : (
//                 <p>No data available for the selected date range.</p>
//             )}
//         </div>
//     );
// }

// export default IoTDataViewer;





// import React, { useState } from 'react';

// function IoTDataViewer() {
//     const [startTime, setStartTime] = useState('');
//     const [endTime, setEndTime] = useState('');
//     const [allData, setAllData] = useState([]); // Store the complete dataset
//     const [data, setData] = useState([]); // Store the deduplicated data
//     const [error, setError] = useState('');
//     const [selectedTestName, setSelectedTestName] = useState(null); // State to store the selected Test-Name

//     const fetchData = async () => {
//         try {
//             const response = await fetch('https://zxj8fcr2a7.execute-api.us-east-1.amazonaws.com/dev/iot-data', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ start_time: startTime, end_time: endTime }),
//             });

//             const rawResult = await response.json();
//             console.log("Raw API Response:", rawResult);

//             const result = rawResult.body ? JSON.parse(rawResult.body) : rawResult;

//             console.log("Parsed Result:", result);

//             if (response.ok) {
//                 const processedData = (result.data || []).map((row) => ({
//                     timestamp: row.timestamp || row.time_bucket, // Handle `time_bucket` for aggregated data
//                     ist_timestamp: row.ist_timestamp || 'N/A', // Default for missing fields
//                     Test_Name: row.device_data?.["Test-Name"] || row["test_name"], // Adjust for different structures
//                     AX_LT_021: row.device_data?.["AX-LT-021"] || row["avg_ax_lt_021"], // Adjust for different structures
//                     CR_FT_001: row.device_data?.["CR-FT-001"] || row["cr_ft_001"],
                   
//                 }));

//                 // Deduplicate data to show only the first occurrence of each Test-Name
//                 const uniqueTestNames = new Set();
//                 const deduplicatedData = processedData.filter((row) => {
//                     if (row.Test_Name && !uniqueTestNames.has(row.Test_Name)) {
//                         uniqueTestNames.add(row.Test_Name);
//                         return true; // Include the row
//                     }
//                     return false; // Skip the row
//                 });

//                 setAllData(processedData); // Store the complete dataset
//                 setData(deduplicatedData); // Store the deduplicated dataset
//                 setError('');
//             } else {
//                 setAllData([]);
//                 setData([]);
//                 setError(result.message || 'Failed to fetch data');
//             }
//         } catch (err) {
//             console.error("Error in Fetch:", err);
//             setAllData([]);
//             setData([]);
//             setError(err.message || 'An unexpected error occurred');
//         }
//     };

//     const handleTestNameClick = (testName) => {
//         setSelectedTestName(testName); // Set the selected Test-Name
//     };

//     // Filter all rows with the selected Test-Name
//     const filteredRows = selectedTestName
//         ? allData.filter((row) => row.Test_Name === selectedTestName)
//         : [];

//     return (
//         <div>
//             <h1>IoT Data Viewer</h1>
//             <div>
//                 <label>
//                     Start Time:
//                     <input
//                         type="datetime-local"
//                         value={startTime}
//                         onChange={(e) => setStartTime(e.target.value)}
//                     />
//                 </label>
//                 <label>
//                     End Time:
//                     <input
//                         type="datetime-local"
//                         value={endTime}
//                         onChange={(e) => setEndTime(e.target.value)}
//                     />
//                 </label>
//                 <button onClick={fetchData}>Fetch Data</button>
//             </div>
//             {error && <p style={{ color: 'red' }}>{error}</p>}
//             {data.length > 0 ? (
//                 <>
//                     <table border="1">
//                         <thead>
//                             <tr>
//                                 <th>Timestamp</th>
//                                 <th>IST Timestamp</th>
//                                 <th>Test-Name</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {data.map((row, index) => (
//                                 <tr key={index}>
//                                     <td>{row.timestamp}</td>
//                                     <td>{row.ist_timestamp}</td>
        
//                                     <td>
//                                         <button
//                                             style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}
//                                             onClick={() => handleTestNameClick(row.Test_Name)}
//                                         >
//                                             {row.Test_Name}
//                                         </button>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>

//                     {selectedTestName && filteredRows.length > 0 && (
//                         <>
//                             <h2>Details for Test-Name: {selectedTestName}</h2>
//                             <table border="1">
//                                 <thead>
//                                     <tr>
//                                         <th>Timestamp</th>
//                                         <th>IST Timestamp</th>
//                                         <th>Test-Name</th>
//                                         <th>CR-FT-001</th>
//                                         <th>AX_LT_021</th>
                                        
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {filteredRows.map((row, index) => (
//                                         <tr key={index}>
//                                             <td>{row.timestamp}</td>
//                                             <td>{row.ist_timestamp}</td>
//                                             <td>{row.Test_Name}</td>
//                                             <td>{row.CR_FT_001}</td>
//                                             <td>{row.AX_LT_021}</td>
                                       
                                           
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </>
//                     )}
//                 </>
//             ) : (
//                 <p>No data available for the selected date range.</p>
//             )}
//         </div>
//     );
// }

// export default IoTDataViewer;



// import React, { useState } from 'react';
// import { DataGrid, GridToolbar } from '@mui/x-data-grid';
// import axios from 'axios';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import { Box, Button, Grid, TextField, useTheme } from '@mui/material';
// import Header from 'src/component/Header';
// import { tokens } from "../../theme";

// const DataTable = () => {
//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);

//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [startDate, setStartDate] = useState(null);
//   const [endDate, setEndDate] = useState(null);
//   const [pageSize, setPageSize] = useState(25);
//   const [error, setError] = useState('');

//   const fetchData = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       // Convert date to ISO format and adjust for IST (UTC+5:30)
//       const convertToIST = (date) => {
//         const offsetInMilliseconds = 5.5 * 60 * 60 * 1000;
//         return new Date(date.getTime() + offsetInMilliseconds).toISOString().slice(0, 19);
//       };

//       const startTimeIST = startDate ? convertToIST(startDate) : null;
//       const endTimeIST = endDate ? convertToIST(endDate) : null;

//       if (!startTimeIST || !endTimeIST) {
//         throw new Error('Start Date and End Date are required.');
//       }

//       const response = await axios.post(
//         'https://3di0yc14j3.execute-api.us-east-1.amazonaws.com/dev/iot-data',
//         {
//           start_time: startTimeIST,
//           end_time: endTimeIST,
//         },
//         {
//           headers: { 'Content-Type': 'application/json' },
//         }
//       );

//       const rawResult = response.data;
//       const result = rawResult.body ? JSON.parse(rawResult.body) : rawResult;

//       if (response.status === 200) {
//         const processedData = (result.data || []).map((row, index) => ({
//           id: index,
//           timestamp: row.timestamp || row.time_bucket,
//           ist_timestamp: row.ist_timestamp || row.time_bucket,
//           Test_Name: row.device_data?.["Test-Name"] || row["test_name"],
//           AX_LT_011: row.device_data?.["AX-LT-011"] || row["avg_ax_lt_011"],
//           AX_LT_021: row.device_data?.["AX-LT-021"] || row["avg_ax_lt_021"],
//           AX_VA_311: row.device_data?.["AX-VA-311"] || row["ax_va_311"],
//           AX_VA_312: row.device_data?.["AX-VA-312"] || row["ax_va_312"],
//           AX_VA_321: row.device_data?.["AX-VA-321"] || row["ax_va_321"],
//           AX_VA_322: row.device_data?.["AX-VA-322"] || row["ax_va_322"],
// AX_VA_351: row.device_data?.["AX-VA-351"] || row["ax_va_351"],
// AX_VA_391: row.device_data?.["AX-VA-391"] || row["ax_va_391"],
// CR_FT_001: row.device_data?.["CR-FT-001"] || row["cr_ft_001"],
// CR_LT_011: row.device_data?.["CR-LT-011"] || row["cr_lt_011"],
// CR_LT_021: row.device_data?.["CR-LT-021"] || row["cr_lt_021"],
// CR_PT_001: row.device_data?.["CR-PT-001"] || row["cr_pt_001"],
// CR_PT_011: row.device_data?.["CR-PT-011"] || row["cr_pt_011"],
// CR_PT_021: row.device_data?.["CR-PT-021"] || row["cr_pt_021"],
// CR_TT_001: row.device_data?.["CR-TT-001"] || row["cr_tt_001"],
// CR_TT_002: row.device_data?.["CR-TT-002"] || row["cr_tt_002"],
// CW_TT_011: row.device_data?.["CW-TT-011"] || row["cw_tt_011"],
// CW_TT_021: row.device_data?.["CW-TT-021"] || row["cw_tt_021"],
// DM_VA_301: row.device_data?.["DM-VA-301"] || row["dm_va_301"],
// GS_AT_011: row.device_data?.["GS-AT-011"] || row["gs_at_011"],
// GS_AT_012: row.device_data?.["GS-AT-012"] || row["gs_at_012"],
// GS_AT_022: row.device_data?.["GS-AT-022"] || row["gs_at_022"],
// GS_PT_011: row.device_data?.["GS-PT-011"] || row["gs_pt_011"],
// GS_PT_021: row.device_data?.["GS-PT-021"] || row["gs_pt_021"],
// GS_TT_011: row.device_data?.["GS-TT-011"] || row["gs_tt_011"],
// GS_TT_021: row.device_data?.["GS-TT-021"] || row["gs_tt_021"],
// GS_VA_021: row.device_data?.["GS-VA-021"] || row["gs_va_021"],
// GS_VA_022: row.device_data?.["GS-VA-022"] || row["gs_va_022"],
// GS_VA_311: row.device_data?.["GS-VA-311"] || row["gs_va_311"],
// GS_VA_312: row.device_data?.["GS-VA-312"] || row["gs_va_312"],
// GS_VA_321: row.device_data?.["GS-VA-321"] || row["gs_va_321"],
// GS_VA_322: row.device_data?.["GS-VA-322"] || row["gs_va_322"],
// N2_VA_311: row.device_data?.["N2-VA-311"] || row["n2_va_311"],
// N2_VA_321: row.device_data?.["N2-VA-321"] || row["n2_va_321"],
// PR_AT_001: row.device_data?.["PR-AT-001"] || row["pr_at_001"],
// PR_AT_003: row.device_data?.["PR-AT-003"] || row["pr_at_003"],
// PR_AT_005: row.device_data?.["PR-AT-005"] || row["pr_at_005"],
// PR_FT_001: row.device_data?.["PR-FT-001"] || row["pr_ft_001"],
// PR_TT_001: row.device_data?.["PR-TT-001"] || row["pr_tt_001"],
// PR_TT_061: row.device_data?.["PR-TT-061"] || row["pr_tt_061"],
// PR_TT_072: row.device_data?.["PR-TT-072"] || row["pr_tt_072"],
// PR_VA_301: row.device_data?.["PR-VA-301"] || row["pr_va_301"],
// PR_VA_312: row.device_data?.["PR-VA-312"] || row["pr_va_312"],
// PR_VA_351: row.device_data?.["PR-VA-351"] || row["pr_va_351"],
// PR_VA_352: row.device_data?.["PR-VA-352"] || row["pr_va_352"],
// PR_VA_361Ain: row.device_data?.["PR-VA-361Ain"] || row["pr_va_361ain"],
// PR_VA_361Bin: row.device_data?.["PR-VA-361Bin"] || row["pr_va_361bin"],
// PR_VA_362Ain: row.device_data?.["PR-VA-362Ain"] || row["pr_va_362ain"],
// PR_VA_362Bin: row.device_data?.["PR-VA-362Bin"] || row["pr_va_362bin"],
// PR_VA_361Aout: row.device_data?.["PR-VA-361Aout"] || row["pr_va_361aout"],
// PR_VA_361Bout: row.device_data?.["PR-VA-361Bout"] || row["pr_va_361bout"],
// PR_VA_362Aout: row.device_data?.["PR-VA-362Aout"] || row["pr_va_362aout"],
// PR_VA_362Bout: row.device_data?.["PR-VA-362Bout"] || row["pr_va_362bout"],
// RECT_CT_001: row.device_data?.["RECT-CT-001"] || row["rect_ct_001"],
// RECT_VT_001: row.device_data?.["RECT-VT-001"] || row["rect_vt_001"],
// DCDB0_CT_001: row.device_data?.["DCDB0-CT-001"] || row["dcdb0_ct_001"],
// DCDB0_VT_001: row.device_data?.["DCDB0-VT-001"] || row["dcdb0_vt_001"],
// DCDB1_CT_001: row.device_data?.["DCDB1-CT-001"] || row["dcdb1_ct_001"],
// DCDB1_VT_001: row.device_data?.["DCDB1-VT-001"] || row["dcdb1_vt_001"],
// DCDB2_CT_001: row.device_data?.["DCDB2-CT-001"] || row["dcdb2_ct_001"],
// DCDB2_VT_001: row.device_data?.["DCDB2-VT-001"] || row["dcdb2_vt_001"],
// DCDB3_CT_001: row.device_data?.["DCDB3-CT-001"] || row["dcdb3_ct_001"],
// DCDB3_VT_001: row.device_data?.["DCDB3-VT-001"] || row["dcdb3_vt_001"],
// DCDB4_CT_001: row.device_data?.["DCDB4-CT-001"] || row["dcdb4_ct_001"],
// DCDB4_VT_001: row.device_data?.["DCDB4-VT-001"] || row["dcdb4_vt_001"],
// PLC_TIME_STAMP: row.device_data?.["PLC-TIME-STAMP"] || row["plc_time_stamp"],
// Test_Description: row.device_data?.["Test-description"] || row["test_description"],
// Test_Remarks: row.device_data?.["Test-Remarks"] || row["test_remarks"],
// DM_LSH_001: row.device_data?.["DM-LSH-001"] || row["dm_lsh_001"],
// DM_LSL_001: row.device_data?.["DM-LSL-001"] || row["dm_lsl_001"],
// GS_LSL_011: row.device_data?.["GS-LSL-011"] || row["gs_lsl_011"],
// GS_LSL_021: row.device_data?.["GS-LSL-021"] || row["gs_lsl_021"]
//         }));
//         setRows(processedData);
//       } else {
//         throw new Error(result.message || 'Failed to fetch data');
//       }
//     } catch (err) {
//       console.error('Error fetching data:', err);
//       setRows([]);
//       setError(err.message || 'An unexpected error occurred.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const columns = [  
//     { field: 'ist_timestamp', headerName: 'IST Timestamp' ,width: 170},
//     { field: 'timestamp', headerName: 'Timestamp' ,width: 170},
//     { field: 'Test_Name', headerName: 'Test Name', width: 170, },
//     { field: 'AX_LT_011', headerName: 'AX-LT-011',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0),},
//     { field: 'AX_LT_021', headerName: 'AX-LT-021',    width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'AX_VA_311', headerName: 'AX-VA-311', width:70 ,valueFormatter: (params) => Number(params.value).toFixed(0)},
//  { field: 'AX_VA_312', headerName: 'AX-VA-312',  width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0),  },
// { field: 'AX_VA_321', headerName: 'AX-VA-321',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'AX_VA_322', headerName: 'AX-VA-322',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'AX_VA_351', headerName: 'AX-VA-351',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'AX_VA_391', headerName: 'AX-VA-391',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'CR_FT_001', headerName: 'CR-FT-001',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'CR_LT_011', headerName: 'CR-LT-011',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'CR_LT_021', headerName: 'CR-LT-021',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'CR_PT_001', headerName: 'CR-PT-001',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'CR_PT_011', headerName: 'CR-PT-011',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'CR_PT_021', headerName: 'CR-PT-021',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'CR_TT_001', headerName: 'CR-TT-001',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'CR_TT_002', headerName: 'CR-TT-002',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'CW_TT_011', headerName: 'CW-TT-011',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'CW_TT_021', headerName: 'CW-TT-021',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'DM_VA_301', headerName: 'DM-VA-301',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'GS_AT_011', headerName: 'GS-AT-011',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'GS_AT_012', headerName: 'GS-AT-012',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'GS_AT_022', headerName: 'GS-AT-022',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'GS_PT_011', headerName: 'GS-PT-011',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'GS_PT_021', headerName: 'GS-PT-021',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'GS_TT_011', headerName: 'GS-TT-011',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'GS_TT_021', headerName: 'GS-TT-021',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'GS_VA_021', headerName: 'GS-VA-021',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'GS_VA_022', headerName: 'GS-VA-022',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'GS_VA_311', headerName: 'GS-VA-311',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'GS_VA_312', headerName: 'GS-VA-312',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'GS_VA_321', headerName: 'GS-VA-321',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'GS_VA_322', headerName: 'GS-VA-322',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'N2_VA_311', headerName: 'N2-VA-311',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'N2_VA_321', headerName: 'N2-VA-321',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'PR_AT_001', headerName: 'PR-AT-001',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'PR_AT_003', headerName: 'PR-AT-003',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'PR_AT_005', headerName: 'PR-AT-005',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'PR_FT_001', headerName: 'PR-FT-001',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'PR_TT_001', headerName: 'PR-TT-001',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'PR_TT_061', headerName: 'PR-TT-061',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'PR_TT_072', headerName: 'PR-TT-072',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'PR_VA_301', headerName: 'PR-VA-301',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'PR_VA_312', headerName: 'PR-VA-312',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'PR_VA_351', headerName: 'PR-VA-351',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'PR_VA_352', headerName: 'PR-VA-352',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'PR_VA_361Ain', headerName: 'PR-VA-361Ain',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'PR_VA_361Bin', headerName: 'PR-VA-361Bin',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'PR_VA_362Ain', headerName: 'PR-VA-362Ain',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'PR_VA_362Bin', headerName: 'PR-VA-362Bin',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'PR_VA_361Aout', headerName: 'PR-VA-361Aout',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'PR_VA_361Bout', headerName: 'PR-VA-361Bout',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'PR_VA_362Aout', headerName: 'PR-VA-362Aout',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'PR_VA_362Bout', headerName: 'PR-VA-362Bout',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'RECT_CT_001', headerName: 'RECT-CT-001',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'RECT_VT_001', headerName: 'RECT-VT-001',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'DCDB0_CT_001', headerName: 'DCDB0-CT-001',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'DCDB0_VT_001', headerName: 'DCDB0-VT-001',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'DCDB1_CT_001', headerName: 'DCDB1-CT-001',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'DCDB1_VT_001', headerName: 'DCDB1-VT-001',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'DCDB2_CT_001', headerName: 'DCDB2-CT-001',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'DCDB2_VT_001', headerName: 'DCDB2-VT-001',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'DCDB3_CT_001', headerName: 'DCDB3-CT-001',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'DCDB3_VT_001', headerName: 'DCDB3-VT-001',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'DCDB4_CT_001', headerName: 'DCDB4-CT-001',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'DCDB4_VT_001', headerName: 'DCDB4-VT-001',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'DM_LSH_001', headerName: 'DM-LSH-001',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'DM_LSL_001', headerName: 'DM-LSL-001',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'GS_LSL_011', headerName: 'GS-LSL-011',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'GS_LSL_021', headerName: 'GS-LSL-021',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), }
// ];


//   return (
//     <Box m="20px">
//       <LocalizationProvider dateAdapter={AdapterDateFns}>
//         <Header title="Historical Data Table" subtitle="Fetch data using start_time and end_time" />
//         <Grid container spacing={2} alignItems="center">
//           <Grid item xs={3}>
//             <DateTimePicker
//               label="Start Date and Time"
//               value={startDate}
//               onChange={setStartDate}
//               renderInput={(params) => <TextField {...params} />}
//             />
//           </Grid>
//           <Grid item xs={3}>
//             <DateTimePicker
//               label="End Date and Time"
//               value={endDate}
//               onChange={setEndDate}
//               renderInput={(params) => <TextField {...params} />}
//             />
//           </Grid>
//           <Grid item xs={3}>
//             <Button
//               variant="contained"
//               color="secondary"
//               onClick={fetchData}
//               disabled={!startDate || !endDate}
//             >
//               Fetch Data
//             </Button>
//           </Grid>
//         </Grid>
//         {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
//         <div style={{ height: 670, width: '100%', marginTop: 20 }}>
//           <DataGrid
//             rows={rows}
//             columns={columns}
//             pageSize={pageSize}
//             onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
//             rowsPerPageOptions={[25, 50, 100]}
//             loading={loading}
//             components={{
//               Toolbar: GridToolbar,
//             }}
//           />
//         </div>
//       </LocalizationProvider>
//     </Box>
//   );
// };

// export default DataTable;



// import React, { useState } from 'react';
// import { Select, MenuItem, FormControl, InputLabel, Button, Box } from '@mui/material';
// import { DataGrid } from '@mui/x-data-grid';

// function IoTDataViewer() {
//     const [startTime, setStartTime] = useState('');
//     const [endTime, setEndTime] = useState('');
//     const [allData, setAllData] = useState([]); // Store the complete dataset
//     const [data, setData] = useState([]); // Store the deduplicated data
//     const [error, setError] = useState('');
//     const [selectedTestName, setSelectedTestName] = useState(null); // State to store the selected Test-Name
//     const [fetching, setFetching] = useState(false); // State to track fetching status

//     const fetchData = async () => {
//         setFetching(true); // Set fetching to true when fetch begins
//         try {
//             const response = await fetch('https://7ko9a0hlo2.execute-api.us-east-1.amazonaws.com/dev/data', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ start_time: startTime, end_time: endTime }),
//             });

//             const rawResult = await response.json();
//             const result = rawResult.body ? JSON.parse(rawResult.body) : rawResult;

//             if (response.ok) {
//                 const processedData = (result.data || []).map((row, index) => ({
//                     id: index, // Assign a unique ID based on the index
//                     timestamp: row.timestamp || row.time_bucket,
//                     ist_timestamp: row.ist_timestamp || row.time_bucket,
//                     Test_Name: row.device_data?.["Test-Name"] || row["test_name"],
//                     AX_LT_011: row.device_data?.["AX-LT-011"] || row["avg_ax_lt_011"],
//                     AX_LT_021: row.device_data?.["AX-LT-021"] || row["avg_ax_lt_021"],
//                     AX_VA_311: row.device_data?.["AX-VA-311"] || row["ax_va_311"],
//                     AX_VA_312: row.device_data?.["AX-VA-312"] || row["ax_va_312"],
//                     CW_TT_011: row.device_data?.["CW-TT-011"] || row["cw_tt_011"],
//                 }));

//                 const uniqueTestNames = new Set();
//                 const deduplicatedData = processedData.filter((row) => {
//                     if (row.Test_Name && !uniqueTestNames.has(row.Test_Name)) {
//                         uniqueTestNames.add(row.Test_Name);
//                         return true;
//                     }
//                     return false;
//                 });

//                 setAllData(processedData);
//                 setData(deduplicatedData);
//                 setError('');
//             } else {
//                 setAllData([]);
//                 setData([]);
//                 setError(result.message || 'Failed to fetch data');
//             }
//         } catch (err) {
//             console.error("Error in Fetch:", err);
//             setAllData([]);
//             setData([]);
//             setError(err.message || 'An unexpected error occurred');
//         } finally {
//             setFetching(false); // Reset fetching status
//         }
//     };

//     const handleTestNameChange = (event) => {
//         setSelectedTestName(event.target.value);
//     };

//     const filteredRows = selectedTestName
//         ? allData.filter((row) => row.Test_Name === selectedTestName)
//         : [];

//     const columns = [
//         { field: 'timestamp', headerName: 'Timestamp', width: 150 },
//         { field: 'ist_timestamp', headerName: 'IST Timestamp', width: 150 },
//         { field: 'Test_Name', headerName: 'Test Name', width: 150 },
//         { field: 'AX_LT_011', headerName: 'AX-LT-011', width: 120 },
//         { field: 'AX_LT_021', headerName: 'AX-LT-021', width: 120 },
//         { field: 'AX_VA_311', headerName: 'AX-VA-311', width: 120 },
//         { field: 'AX_VA_312', headerName: 'AX-VA-312', width: 120 },
//         { field: 'CW_TT_011', headerName: 'CW_TT_011', width: 120 },
//     ];

//     return (
//         <div>
//             <h1>IoT Data Viewer</h1>
//             <div>
//                 <label>
//                     Start Time:
//                     <input
//                         type="datetime-local"
//                         value={startTime}
//                         onChange={(e) => setStartTime(e.target.value)}
//                     />
//                 </label>
//                 <label>
//                     End Time:
//                     <input
//                         type="datetime-local"
//                         value={endTime}
//                         onChange={(e) => setEndTime(e.target.value)}
//                     />
//                 </label>
//                 <Button variant="contained" onClick={fetchData}>
//                     Fetch Data
//                 </Button>
//             </div>
//             {fetching ? (
//                 <p color='secondary'>Data fetching...</p>
//             ) : (
//                 <p>Please select the Start Date-Time and End Date-Time</p>
//             )}
//             {error && <p style={{ color: 'red' }}>{error}</p>}

//             {data.length > 0 && (
//                 <Box sx={{ mt: 4, mb: 4, width: '300px' }}>
//                     <FormControl fullWidth>
//                         <InputLabel id="test-name-select-label">Select Test-Name</InputLabel>
//                         <Select
//                             labelId="test-name-select-label"
//                             value={selectedTestName || ''}
//                             onChange={handleTestNameChange}
//                         >
//                             {data.map((row) => (
//                                 <MenuItem key={row.id} value={row.Test_Name}>
//                                     {row.Test_Name}
//                                 </MenuItem>
//                             ))}
//                         </Select>
//                     </FormControl>
//                 </Box>
//             )}

//             {selectedTestName && filteredRows.length > 0 ? (
//                 <Box sx={{ height: 400, width: '100%' }}>
//                     <h2>Details for Test-Name: {selectedTestName}</h2>
//                     <DataGrid
//                         rows={filteredRows}
//                         columns={columns}
//                         pageSize={5}
//                         rowsPerPageOptions={[5]}
//                         getRowId={(row) => row.id} // Use the `id` field as the unique identifier
//                     />
//                 </Box>
//             ) : (
//                 <p>No data available for the selected Test-Name.</p>
//             )}
//         </div>
//     );
// }

// export default IoTDataViewer;




// import React, { useState } from 'react';
// import { Select, MenuItem, FormControl, InputLabel, Button, Box } from '@mui/material';
// import { DataGrid } from '@mui/x-data-grid';

// function IoTDataViewer() {
//     const [startTime, setStartTime] = useState('');
//     const [endTime, setEndTime] = useState('');
//     const [allData, setAllData] = useState([]); // Store the complete dataset
//     const [data, setData] = useState([]); // Store the deduplicated data
//     const [error, setError] = useState('');
//     const [selectedTestName, setSelectedTestName] = useState(null); // State to store the selected Test-Name

//     const fetchData = async () => {
//         try {
//             const response = await fetch('https://zxj8fcr2a7.execute-api.us-east-1.amazonaws.com/dev/iot-data', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ start_time: startTime, end_time: endTime }),
//             });

//             const rawResult = await response.json();
//             const result = rawResult.body ? JSON.parse(rawResult.body) : rawResult;

//             if (response.ok) {
//                 const processedData = (result.data || []).map((row, index) => ({
//                     id: index, // Assign a unique ID based on the index
//                     timestamp: row.timestamp || row.time_bucket,
//                     ist_timestamp: row.ist_timestamp || row.time_bucket,
//                     Test_Name: row.device_data?.["Test-Name"] || row["test_name"],
//                     AX_LT_011: row.device_data?.["AX-LT-011"] || row["avg_ax_lt_011"],
//                     AX_LT_021: row.device_data?.["AX-LT-021"] || row["avg_ax_lt_021"],
//                     AX_VA_311: row.device_data?.["AX-VA-311"] || row["ax_va_311"],
//                     AX_VA_312: row.device_data?.["AX-VA-312"] || row["ax_va_312"],
//                     CW_TT_011: row.device_data?.["CW-TT-011"] || row["cw_tt_011"],
//                 }));

//                 const uniqueTestNames = new Set();
//                 const deduplicatedData = processedData.filter((row) => {
//                     if (row.Test_Name && !uniqueTestNames.has(row.Test_Name)) {
//                         uniqueTestNames.add(row.Test_Name);
//                         return true;
//                     }
//                     return false;
//                 });

//                 setAllData(processedData);
//                 setData(deduplicatedData);
//                 setError('');
//             } else {
//                 setAllData([]);
//                 setData([]);
//                 setError(result.message || 'Failed to fetch data');
//             }
//         } catch (err) {
//             console.error("Error in Fetch:", err);
//             setAllData([]);
//             setData([]);
//             setError(err.message || 'An unexpected error occurred');
//         }
//     };

//     const handleTestNameChange = (event) => {
//         setSelectedTestName(event.target.value);
//     };

//     const filteredRows = selectedTestName
//         ? allData.filter((row) => row.Test_Name === selectedTestName)
//         : [];

//     const columns = [
//         { field: 'timestamp', headerName: 'Timestamp', width: 150 },
//         { field: 'ist_timestamp', headerName: 'IST Timestamp', width: 150 },
//         { field: 'Test_Name', headerName: 'Test Name', width: 150 },
//         { field: 'AX_LT_011', headerName: 'AX-LT-011', width: 120 },
//         { field: 'AX_LT_021', headerName: 'AX-LT-021', width: 120 },
//         { field: 'AX_VA_311', headerName: 'AX-VA-311', width: 120 },
//         { field: 'AX_VA_312', headerName: 'AX-VA-312', width: 120 },
//         { field: 'CW_TT_011', headerName: 'CW_TT_011', width: 120 },
//     ];

//     return (
//         <div>
//             <h1>IoT Data Viewer</h1>
//             <div>
//                 <label>
//                     Start Time:
//                     <input
//                         type="datetime-local"
//                         value={startTime}
//                         onChange={(e) => setStartTime(e.target.value)}
//                     />
//                 </label>
//                 <label>
//                     End Time:
//                     <input
//                         type="datetime-local"
//                         value={endTime}
//                         onChange={(e) => setEndTime(e.target.value)}
//                     />
//                 </label>
//                 <Button variant="contained" onClick={fetchData}>
//                     Fetch Data
//                 </Button>
//             </div>
//             {error && <p style={{ color: 'red' }}>{error}</p>}

//             {data.length > 0 && (
//                 <Box sx={{ mt: 4, mb: 4, width: '300px' }}>
//                     <FormControl fullWidth>
//                         <InputLabel id="test-name-select-label">Select Test-Name</InputLabel>
//                         <Select
//                             labelId="test-name-select-label"
//                             value={selectedTestName || ''}
//                             onChange={handleTestNameChange}
//                         >
//                             {data.map((row) => (
//                                 <MenuItem key={row.id} value={row.Test_Name}>
//                                     {row.Test_Name}
//                                 </MenuItem>
//                             ))}
//                         </Select>
//                     </FormControl>
//                 </Box>
//             )}

//             {selectedTestName && filteredRows.length > 0 ? (
//                 <Box sx={{ height: 400, width: '100%' }}>
//                     <h2>Details for Test-Name: {selectedTestName}</h2>
//                     <DataGrid
//                         rows={filteredRows}
//                         columns={columns}
//                         pageSize={5}
//                         rowsPerPageOptions={[5]}
//                         getRowId={(row) => row.id} // Use the `id` field as the unique identifier
//                     />
//                 </Box>
//             ) : (
//                 <p>No data available for the selected Test-Name.</p>
//             )}
//         </div>
//     );
// }

// export default IoTDataViewer;



// import React, { useState } from 'react';
// import { Select, MenuItem, FormControl, InputLabel, Button, Box } from '@mui/material';
// import { DataGrid } from '@mui/x-data-grid';

// function IoTDataViewer() {
//     const [startTime, setStartTime] = useState('');
//     const [endTime, setEndTime] = useState('');
//     const [allData, setAllData] = useState([]); // Store the complete dataset
//     const [data, setData] = useState([]); // Store the deduplicated data
//     const [error, setError] = useState('');
//     const [selectedTestName, setSelectedTestName] = useState(null); // State to store the selected Test-Name

//     const fetchData = async () => {
//         try {
//             const response = await fetch('https://zxj8fcr2a7.execute-api.us-east-1.amazonaws.com/dev/iot-data', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ start_time: startTime, end_time: endTime }),
//             });

//             const rawResult = await response.json();
//             const result = rawResult.body ? JSON.parse(rawResult.body) : rawResult;

//             if (response.ok) {
//                 const processedData = (result.data || []).map((row, index) => ({
//                     id: index, // Assign a unique ID based on the index
//                     timestamp: row.timestamp || row.time_bucket,
//                     ist_timestamp: row.ist_timestamp || row.time_bucket,
//                     Test_Name: row.device_data?.["Test-Name"] || row["test_name"] ,
//                     AX_LT_011: row.device_data?.["AX-LT-011"] || row["avg_ax_lt_011"],
//                     AX_LT_021: row.device_data?.["AX-LT-021"] || row["avg_ax_lt_021"],
//                     AX_VA_311: row.device_data?.["AX-VA-311"] || row["ax_va_311"],
//                     AX_VA_312: row.device_data?.["AX-VA-312"] || row["ax_va_312"],
//                     CW_TT_011: row.device_data?.["CW-TT-011"] || row["cw_tt_011"],
//                 }));

//                 const uniqueTestNames = new Set();
//                 const deduplicatedData = processedData.filter((row) => {
//                     if (row.Test_Name && !uniqueTestNames.has(row.Test_Name)) {
//                         uniqueTestNames.add(row.Test_Name);
//                         return true;
//                     }
//                     return false;
//                 });

//                 setAllData(processedData);
//                 setData(deduplicatedData);
//                 setError('');
//             } else {
//                 setAllData([]);
//                 setData([]);
//                 setError(result.message || 'Failed to fetch data');
//             }
//         } catch (err) {
//             console.error("Error in Fetch:", err);
//             setAllData([]);
//             setData([]);
//             setError(err.message || 'An unexpected error occurred');
//         }
//     };

//     const handleTestNameChange = (event) => {
//         setSelectedTestName(event.target.value);
//     };

//     const filteredRows = selectedTestName
//         ? allData.filter((row) => row.Test_Name === selectedTestName)
//         : [];

//     const columns = [
//         { field: 'timestamp', headerName: 'Timestamp', width: 150 },
//         { field: 'ist_timestamp', headerName: 'IST Timestamp', width: 150 },
//         { field: 'Test_Name', headerName: 'Test Name', width: 150 },
//         { field: 'AX_LT_011', headerName: 'AX-LT-011', width: 120 },
//         { field: 'AX_LT_021', headerName: 'AX-LT-021', width: 120 },
//         { field: 'AX_VA_311', headerName: 'AX-VA-311', width: 120 },
//         { field: 'AX_VA_312', headerName: 'AX-VA-312', width: 120 },
//         { field: 'CW_TT_011', headerName: 'CW_TT_011', width: 120 },
//     ];

//     return (
//         <div>
//             <h1>IoT Data Viewer</h1>
//             <div>
//                 <label>
//                     Start Time:
//                     <input
//                         type="datetime-local"
//                         value={startTime}
//                         onChange={(e) => setStartTime(e.target.value)}
//                     />
//                 </label>
//                 <label>
//                     End Time:
//                     <input
//                         type="datetime-local"
//                         value={endTime}
//                         onChange={(e) => setEndTime(e.target.value)}
//                     />
//                 </label>
//                 <Button variant="contained" onClick={fetchData}>
//                     Fetch Data
//                 </Button>
//             </div>
//             {error && <p style={{ color: 'red' }}>{error}</p>}

//             {data.length > 0 && (
//                 <Box sx={{ mt: 4, mb: 4, width: '300px' }}>
//                     <FormControl fullWidth>
//                         <InputLabel id="test-name-select-label">Select Test-Name</InputLabel>
//                         <Select
//                             labelId="test-name-select-label"
//                             value={selectedTestName || ''}
//                             onChange={handleTestNameChange}
//                         >
//                             {data.map((row) => (
//                                 <MenuItem key={row.id} value={row.Test_Name}>
//                                     {row.Test_Name}
//                                 </MenuItem>
//                             ))}
//                         </Select>
//                     </FormControl>
//                 </Box>
//             )}

//             {selectedTestName && filteredRows.length > 0 ? (
//                 <Box sx={{ height: 400, width: '100%' }}>
//                     <h2>Details for Test-Name: {selectedTestName}</h2>
//                     <DataGrid
//                         rows={filteredRows}
//                         columns={columns}
//                         pageSize={5}
//                         rowsPerPageOptions={[5]}
//                         getRowId={(row) => row.id} // Use the `id` field as the unique identifier
//                     />
//                 </Box>
//             ) : (
//                 <p>No data available for the selected Test-Name.</p>
//             )}
//         </div>
//     );
// }

// export default IoTDataViewer;


// import React, { useState } from 'react';
// import { Select, MenuItem, FormControl, InputLabel, Button, Box, TextField } from '@mui/material';
// import { DataGrid, GridToolbar } from '@mui/x-data-grid';
// import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// function IoTDataViewer() {
//     const [startTime, setStartTime] = useState(null);
//     const [endTime, setEndTime] = useState(null);
//     const [allData, setAllData] = useState([]); // Store the complete dataset
//     const [data, setData] = useState([]); // Store the deduplicated data
//     const [error, setError] = useState('');
//     const [selectedTestName, setSelectedTestName] = useState(null); // State to store the selected Test-Name

//     const fetchData = async () => {
//         try {
//             // Convert UTC timestamps to IST (+5:30)
//             const convertToIST = (date) => {
//                 const offsetInMilliseconds = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds
//                 return new Date(date.getTime() + offsetInMilliseconds).toISOString().slice(0, 19); // ISO string without "Z"
//             };
    
//             const startTimeIST = startTime ? convertToIST(startTime) : null;
//             const endTimeIST = endTime ? convertToIST(endTime) : null;
    
//             const response = await fetch('https://zxj8fcr2a7.execute-api.us-east-1.amazonaws.com/dev/iot-data', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
    
//                 body: JSON.stringify({
//                     start_time: startTimeIST,
//                     end_time: endTimeIST,
//                 })
//                 .then(response => response.json())  // Now you can safely parse the response
// .then(data => console.log(data))    // Handle your data here
// .catch(error => console.error('Error:', error))
//             });
    
//             const rawResult = await response.json();
//             const result = rawResult.body ? JSON.parse(rawResult.body) : rawResult;
    
//             if (response.ok) {
//                 const processedData = (result.data || []).map((row, index) => ({
//                     id: index, // Assign a unique ID based on the index
//                     timestamp: row.timestamp || row.time_bucket,
//                     ist_timestamp: row.ist_timestamp || row.time_bucket,
//                     Test_Name: row.device_data?.["Test-Name"] || row["test_name"],
//                     AX_LT_011: row.device_data?.["AX-LT-011"] || row["avg_ax_lt_011"],
//                     AX_LT_021: row.device_data?.["AX-LT-021"] || row["avg_ax_lt_021"],
//                     AX_VA_311: row.device_data?.["AX-VA-311"] || row["ax_va_311"],
//                     AX_VA_312: row.device_data?.["AX-VA-312"] || row["ax_va_312"],
//                     AX_VA_321: row.device_data?.["AX-VA-321"] || row["ax_va_321"],
//                     AX_VA_322: row.device_data?.["AX-VA-322"] || row["ax_va_322"],
// AX_VA_351: row.device_data?.["AX-VA-351"] || row["ax_va_351"],
// AX_VA_391: row.device_data?.["AX-VA-391"] || row["ax_va_391"],
// CR_FT_001: row.device_data?.["CR-FT-001"] || row["cr_ft_001"],
// CR_LT_011: row.device_data?.["CR-LT-011"] || row["cr_lt_011"],
// CR_LT_021: row.device_data?.["CR-LT-021"] || row["cr_lt_021"],
// CR_PT_001: row.device_data?.["CR-PT-001"] || row["cr_pt_001"],
// CR_PT_011: row.device_data?.["CR-PT-011"] || row["cr_pt_011"],
// CR_PT_021: row.device_data?.["CR-PT-021"] || row["cr_pt_021"],
// CR_TT_001: row.device_data?.["CR-TT-001"] || row["cr_tt_001"],
// CR_TT_002: row.device_data?.["CR-TT-002"] || row["cr_tt_002"],
// CW_TT_011: row.device_data?.["CW-TT-011"] || row["cw_tt_011"],
// CW_TT_021: row.device_data?.["CW-TT-021"] || row["cw_tt_021"],
// DM_VA_301: row.device_data?.["DM-VA-301"] || row["dm_va_301"],
// GS_AT_011: row.device_data?.["GS-AT-011"] || row["gs_at_011"],
// GS_AT_012: row.device_data?.["GS-AT-012"] || row["gs_at_012"],
// GS_AT_022: row.device_data?.["GS-AT-022"] || row["gs_at_022"],
// GS_PT_011: row.device_data?.["GS-PT-011"] || row["gs_pt_011"],
// GS_PT_021: row.device_data?.["GS-PT-021"] || row["gs_pt_021"],
// GS_TT_011: row.device_data?.["GS-TT-011"] || row["gs_tt_011"],
// GS_TT_021: row.device_data?.["GS-TT-021"] || row["gs_tt_021"],
// GS_VA_021: row.device_data?.["GS-VA-021"] || row["gs_va_021"],
// GS_VA_022: row.device_data?.["GS-VA-022"] || row["gs_va_022"],
// GS_VA_311: row.device_data?.["GS-VA-311"] || row["gs_va_311"],
// GS_VA_312: row.device_data?.["GS-VA-312"] || row["gs_va_312"],
// GS_VA_321: row.device_data?.["GS-VA-321"] || row["gs_va_321"],
// GS_VA_322: row.device_data?.["GS-VA-322"] || row["gs_va_322"],
// N2_VA_311: row.device_data?.["N2-VA-311"] || row["n2_va_311"],
// N2_VA_321: row.device_data?.["N2-VA-321"] || row["n2_va_321"],
// PR_AT_001: row.device_data?.["PR-AT-001"] || row["pr_at_001"],
// PR_AT_003: row.device_data?.["PR-AT-003"] || row["pr_at_003"],
// PR_AT_005: row.device_data?.["PR-AT-005"] || row["pr_at_005"],
// PR_FT_001: row.device_data?.["PR-FT-001"] || row["pr_ft_001"],
// PR_TT_001: row.device_data?.["PR-TT-001"] || row["pr_tt_001"],
// PR_TT_061: row.device_data?.["PR-TT-061"] || row["pr_tt_061"],
// PR_TT_072: row.device_data?.["PR-TT-072"] || row["pr_tt_072"],
// PR_VA_301: row.device_data?.["PR-VA-301"] || row["pr_va_301"],
// PR_VA_312: row.device_data?.["PR-VA-312"] || row["pr_va_312"],
// PR_VA_351: row.device_data?.["PR-VA-351"] || row["pr_va_351"],
// PR_VA_352: row.device_data?.["PR-VA-352"] || row["pr_va_352"],
// PR_VA_361Ain: row.device_data?.["PR-VA-361Ain"] || row["pr_va_361ain"],
// PR_VA_361Bin: row.device_data?.["PR-VA-361Bin"] || row["pr_va_361bin"],
// PR_VA_362Ain: row.device_data?.["PR-VA-362Ain"] || row["pr_va_362ain"],
// PR_VA_362Bin: row.device_data?.["PR-VA-362Bin"] || row["pr_va_362bin"],
// PR_VA_361Aout: row.device_data?.["PR-VA-361Aout"] || row["pr_va_361aout"],
// PR_VA_361Bout: row.device_data?.["PR-VA-361Bout"] || row["pr_va_361bout"],
// PR_VA_362Aout: row.device_data?.["PR-VA-362Aout"] || row["pr_va_362aout"],
// PR_VA_362Bout: row.device_data?.["PR-VA-362Bout"] || row["pr_va_362bout"],
// RECT_CT_001: row.device_data?.["RECT-CT-001"] || row["rect_ct_001"],
// RECT_VT_001: row.device_data?.["RECT-VT-001"] || row["rect_vt_001"],
// DCDB0_CT_001: row.device_data?.["DCDB0-CT-001"] || row["dcdb0_ct_001"],
// DCDB0_VT_001: row.device_data?.["DCDB0-VT-001"] || row["dcdb0_vt_001"],
// DCDB1_CT_001: row.device_data?.["DCDB1-CT-001"] || row["dcdb1_ct_001"],
// DCDB1_VT_001: row.device_data?.["DCDB1-VT-001"] || row["dcdb1_vt_001"],
// DCDB2_CT_001: row.device_data?.["DCDB2-CT-001"] || row["dcdb2_ct_001"],
// DCDB2_VT_001: row.device_data?.["DCDB2-VT-001"] || row["dcdb2_vt_001"],
// DCDB3_CT_001: row.device_data?.["DCDB3-CT-001"] || row["dcdb3_ct_001"],
// DCDB3_VT_001: row.device_data?.["DCDB3-VT-001"] || row["dcdb3_vt_001"],
// DCDB4_CT_001: row.device_data?.["DCDB4-CT-001"] || row["dcdb4_ct_001"],
// DCDB4_VT_001: row.device_data?.["DCDB4-VT-001"] || row["dcdb4_vt_001"],
// PLC_TIME_STAMP: row.device_data?.["PLC-TIME-STAMP"] || row["plc_time_stamp"],
// Test_Description: row.device_data?.["Test-description"] || row["test_description"],
// Test_Remarks: row.device_data?.["Test-Remarks"] || row["test_remarks"],
// DM_LSH_001: row.device_data?.["DM-LSH-001"] || row["dm_lsh_001"],
// DM_LSL_001: row.device_data?.["DM-LSL-001"] || row["dm_lsl_001"],
// GS_LSL_011: row.device_data?.["GS-LSL-011"] || row["gs_lsl_011"],
// GS_LSL_021: row.device_data?.["GS-LSL-021"] || row["gs_lsl_021"]
//                 }));
    
//                 const uniqueTestNames = new Set();
//                 const deduplicatedData = processedData.filter((row) => {
//                     if (row.Test_Name && !uniqueTestNames.has(row.Test_Name)) {
//                         uniqueTestNames.add(row.Test_Name);
//                         return true;
//                     }
//                     return false;
//                 });
    
//                 setAllData(processedData);
//                 setData(deduplicatedData);
//                 setError('');
//             } else {
//                 setAllData([]);
//                 setData([]);
//                 setError(result.message || 'Failed to fetch data');
//             }
//         } catch (err) {
//             console.error("Error in Fetch:", err);
//             setAllData([]);
//             setData([]);
//             setError(err.message || 'An unexpected error occurred');
//         }
//     };
    

//     const handleTestNameChange = (event) => {
//         setSelectedTestName(event.target.value);
//     };

//     const filteredRows = selectedTestName
//         ? allData.filter((row) => row.Test_Name === selectedTestName)
//         : [];

//         const columns = [  
//             { field: 'ist_timestamp', headerName: 'IST Timestamp' ,width: 195},
//             { field: 'Test_Name', headerName: 'Test Name', width: 155, },
//             { field: 'AX_LT_011', headerName: 'AX-LT-011', width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0)},
//             { field: 'AX_LT_021', headerName: 'AX-LT-021',  width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'CR_FT_001', headerName: 'CR-FT-001',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'CR_LT_011', headerName: 'CR-LT-011',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'CR_LT_021', headerName: 'CR-LT-021',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'CR_PT_001', headerName: 'CR-PT-001',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'CR_PT_011', headerName: 'CR-PT-011',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'CR_PT_021', headerName: 'CR-PT-021',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'CR_TT_001', headerName: 'CR-TT-001',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'CR_TT_002', headerName: 'CR-TT-002',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'CW_TT_011', headerName: 'CW-TT-011',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'CW_TT_021', headerName: 'CW-TT-021',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'GS_AT_011', headerName: 'GS-AT-011',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'GS_AT_012', headerName: 'GS-AT-012',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'GS_AT_022', headerName: 'GS-AT-022',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'GS_PT_011', headerName: 'GS-PT-011',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'GS_PT_021', headerName: 'GS-PT-021',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'GS_TT_011', headerName: 'GS-TT-011',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'GS_TT_021', headerName: 'GS-TT-021',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'GS_VA_021', headerName: 'GS-VA-021',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'GS_VA_022', headerName: 'GS-VA-022',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'GS_VA_311', headerName: 'GS-VA-311',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'GS_VA_312', headerName: 'GS-VA-312',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'GS_VA_321', headerName: 'GS-VA-321',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'GS_VA_322', headerName: 'GS-VA-322',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },

//     { field: 'PR_AT_001', headerName: 'PR-AT-001',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'PR_AT_003', headerName: 'PR-AT-003',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'PR_AT_005', headerName: 'PR-AT-005',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'PR_FT_001', headerName: 'PR-FT-001',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'PR_TT_001', headerName: 'PR-TT-001',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'PR_TT_061', headerName: 'PR-TT-061',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'PR_TT_072', headerName: 'PR-TT-072',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'PR_VA_352', headerName: 'PR-VA-352',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'PR_VA_361Ain', headerName: 'PR-VA-361Ain',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'PR_VA_361Bin', headerName: 'PR-VA-361Bin',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'PR_VA_362Ain', headerName: 'PR-VA-362Ain',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'PR_VA_362Bin', headerName: 'PR-VA-362Bin',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'PR_VA_361Aout', headerName: 'PR-VA-361Aout',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'PR_VA_361Bout', headerName: 'PR-VA-361Bout',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'PR_VA_362Aout', headerName: 'PR-VA-362Aout',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'PR_VA_362Bout', headerName: 'PR-VA-362Bout',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'RECT_CT_001', headerName: 'RECT-CT-001',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'RECT_VT_001', headerName: 'RECT-VT-001',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'DCDB0_CT_001', headerName: 'DCDB0-CT-001',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'DCDB0_VT_001', headerName: 'DCDB0-VT-001',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'DCDB1_CT_001', headerName: 'DCDB1-CT-001',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'DCDB1_VT_001', headerName: 'DCDB1-VT-001',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'DCDB2_CT_001', headerName: 'DCDB2-CT-001',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'DCDB2_VT_001', headerName: 'DCDB2-VT-001',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'DCDB3_CT_001', headerName: 'DCDB3-CT-001',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'DCDB3_VT_001', headerName: 'DCDB3-VT-001',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'DCDB4_CT_001', headerName: 'DCDB4-CT-001',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'DCDB4_VT_001', headerName: 'DCDB4-VT-001',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'DM_LSH_001', headerName: 'DM-LSH-001',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'DM_LSL_001', headerName: 'DM-LSL-001',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'GS_LSL_011', headerName: 'GS-LSL-011',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'GS_LSL_021', headerName: 'GS-LSL-021',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'AX_VA_311', headerName: 'AX-VA-311', width:70, },
//     { field: 'AX_VA_312', headerName: 'AX-VA-312',width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0)  },
// { field: 'AX_VA_321', headerName: 'AX-VA-321',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: 'AX_VA_322', headerName: 'AX-VA-322',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: 'AX_VA_351', headerName: 'AX-VA-351',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: 'AX_VA_391', headerName: 'AX-VA-391',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: 'DM_VA_301', headerName: 'DM-VA-301',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//  { field: 'AX_VA_311', headerName: 'AX-VA-311', width:70, },
//  { field: 'AX_VA_312', headerName: 'AX-VA-312',width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0)  },
//     { field: 'AX_VA_321', headerName: 'AX-VA-321',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'AX_VA_322', headerName: 'AX-VA-322',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'AX_VA_351', headerName: 'AX-VA-351',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'AX_VA_391', headerName: 'AX-VA-391',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'N2_VA_311', headerName: 'N2-VA-311',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'N2_VA_321', headerName: 'N2-VA-321',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'PR_VA_301', headerName: 'PR-VA-301',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'PR_VA_312', headerName: 'PR-VA-312',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'PR_VA_351', headerName: 'PR-VA-351',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//         ];

//     return (
//         <div>
//             <h1>IoT Data Viewer</h1>
//             <LocalizationProvider dateAdapter={AdapterDateFns}>
//                 <Box sx={{ display: 'flex', gap: 2, mt: 2, mb: 2 }}>
//                     <DateTimePicker
//                         label="Start Time"
//                         value={startTime}
//                         onChange={(newValue) => setStartTime(newValue)}
//                         renderInput={(params) => <TextField {...params} fullWidth />}
//                     />
//                     <DateTimePicker
//                         label="End Time"
//                         value={endTime}
//                         onChange={(newValue) => setEndTime(newValue)}
//                         renderInput={(params) => <TextField {...params} fullWidth />}
//                     />
//                     <Button variant="contained" onClick={fetchData}>
//                         Fetch Data
//                     </Button>
//                 </Box>
//             </LocalizationProvider>
//             {error && <p style={{ color: 'red' }}>{error}</p>}

//             {data.length > 0 && (
//                 <Box sx={{ mt: 4, mb: 4, width: '300px' }}>
//                     <FormControl fullWidth>
//                         <InputLabel id="test-name-select-label">Select Test-Name</InputLabel>
//                         <Select
//                             labelId="test-name-select-label"
//                             value={selectedTestName || ''}
//                             onChange={handleTestNameChange}
//                         >
//                             {data.map((row) => (
//                                 <MenuItem key={row.id} value={row.Test_Name}>
//                                     {row.Test_Name}
//                                 </MenuItem>
//                             ))}
//                         </Select>
//                     </FormControl>
//                 </Box>
//             )}

//             {selectedTestName && filteredRows.length > 0 ? (
//                 <Box sx={{ height: 600, width: '100%' }}>
//                     <h2>Details for Test-Name: {selectedTestName}</h2>
//                     <DataGrid
//                         rows={filteredRows}
//                         columns={columns}
//                         components={{ Toolbar: GridToolbar }}
//                         getRowId={(row) => row.id} // Use the `id` field as the unique identifier
//                     />
//                 </Box>
//             ) : (
//                 <p>No data available for the selected Test-Name.</p>
//             )}
//         </div>
//     );
// }

// export default IoTDataViewer;





// import React, { useState } from 'react';
// import { Select, MenuItem, FormControl, InputLabel, Button, Box } from '@mui/material';
// import { DataGrid } from '@mui/x-data-grid';

// function IoTDataViewer() {
//     const [startTime, setStartTime] = useState('');
//     const [endTime, setEndTime] = useState('');
//     const [allData, setAllData] = useState([]); // Store the complete dataset
//     const [data, setData] = useState([]); // Store the deduplicated data
//     const [error, setError] = useState('');
//     const [selectedTestName, setSelectedTestName] = useState(null); // State to store the selected Test-Name

//     const fetchData = async () => {
//         try {
//             const response = await fetch('https://phhm5ulen4skthqhefp7r5gp2u0yzxzd.lambda-url.us-east-1.on.aws/', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ start_time: startTime, end_time: endTime }),
//             });

//             const rawResult = await response.json();
//             const result = rawResult.body ? JSON.parse(rawResult.body) : rawResult;

//             if (response.ok) {
//                 const processedData = (result.data || []).map((row, index) => ({
//                     id: index, // Assign a unique ID based on the index
//                     timestamp: row.timestamp || row.time_bucket,
//                     ist_timestamp: row.ist_timestamp || row.time_bucket,
//                     Test_Name: row.device_data?.["Test-Name"] || row["test_name"] ,
//                     AX_LT_011: row.device_data?.["AX-LT-011"] || row["avg_ax_lt_011"],
//                     AX_LT_021: row.device_data?.["AX-LT-021"] || row["avg_ax_lt_021"],
//                     AX_VA_311: row.device_data?.["AX-VA-311"] || row["ax_va_311"],
//                     AX_VA_312: row.device_data?.["AX-VA-312"] || row["ax_va_312"],
//                     CW_TT_011: row.device_data?.["CW-TT-011"] || row["cw_tt_011"],
//                 }));

//                 const uniqueTestNames = new Set();
//                 const deduplicatedData = processedData.filter((row) => {
//                     if (row.Test_Name && !uniqueTestNames.has(row.Test_Name)) {
//                         uniqueTestNames.add(row.Test_Name);
//                         return true;
//                     }
//                     return false;
//                 });

//                 setAllData(processedData);
//                 setData(deduplicatedData);
//                 setError('');
//             } else {
//                 setAllData([]);
//                 setData([]);
//                 setError(result.message || 'Failed to fetch data');
//             }
//         } catch (err) {
//             console.error("Error in Fetch:", err);
//             setAllData([]);
//             setData([]);
//             setError(err.message || 'An unexpected error occurred');
//         }
//     };

//     const handleTestNameChange = (event) => {
//         setSelectedTestName(event.target.value);
//     };

//     const filteredRows = selectedTestName
//         ? allData.filter((row) => row.Test_Name === selectedTestName)
//         : [];

//     const columns = [
//         { field: 'timestamp', headerName: 'Timestamp', width: 150 },
//         { field: 'ist_timestamp', headerName: 'IST Timestamp', width: 150 },
//         { field: 'Test_Name', headerName: 'Test Name', width: 150 },
//         { field: 'AX_LT_011', headerName: 'AX-LT-011', width: 120 },
//         { field: 'AX_LT_021', headerName: 'AX-LT-021', width: 120 },
//         { field: 'AX_VA_311', headerName: 'AX-VA-311', width: 120 },
//         { field: 'AX_VA_312', headerName: 'AX-VA-312', width: 120 },
//         { field: 'CW_TT_011', headerName: 'CW_TT_011', width: 120 },
//     ];

//     return (
//         <div>
//             <h1>IoT Data Viewer</h1>
//             <div>
//                 <label>
//                     Start Time:
//                     <input
//                         type="datetime-local"
//                         value={startTime}
//                         onChange={(e) => setStartTime(e.target.value)}
//                     />
//                 </label>
//                 <label>
//                     End Time:
//                     <input
//                         type="datetime-local"
//                         value={endTime}
//                         onChange={(e) => setEndTime(e.target.value)}
//                     />
//                 </label>
//                 <Button variant="contained" onClick={fetchData}>
//                     Fetch Data
//                 </Button>
//             </div>
//             {error && <p style={{ color: 'red' }}>{error}</p>}

//             {data.length > 0 && (
//                 <Box sx={{ mt: 4, mb: 4, width: '300px' }}>
//                     <FormControl fullWidth>
//                         <InputLabel id="test-name-select-label">Select Test-Name</InputLabel>
//                         <Select
//                             labelId="test-name-select-label"
//                             value={selectedTestName || ''}
//                             onChange={handleTestNameChange}
//                         >
//                             {data.map((row) => (
//                                 <MenuItem key={row.id} value={row.Test_Name}>
//                                     {row.Test_Name}
//                                 </MenuItem>
//                             ))}
//                         </Select>
//                     </FormControl>
//                 </Box>
//             )}

//             {selectedTestName && filteredRows.length > 0 ? (
//                 <Box sx={{ height: 400, width: '100%' }}>
//                     <h2>Details for Test-Name: {selectedTestName}</h2>
//                     <DataGrid
//                         rows={filteredRows}
//                         columns={columns}
//                         pageSize={5}
//                         rowsPerPageOptions={[5]}
//                         getRowId={(row) => row.id} // Use the `id` field as the unique identifier
//                     />
//                 </Box>
//             ) : (
//                 <p>No data available for the selected Test-Name.</p>
//             )}
//         </div>
//     );
// }

// export default IoTDataViewer;




// import React, { useState } from 'react';

// function IoTDataViewer() {
//     const [startTime, setStartTime] = useState('');
//     const [endTime, setEndTime] = useState('');
//     const [allData, setAllData] = useState([]); // Store the complete dataset
//     const [data, setData] = useState([]); // Store the deduplicated data
//     const [error, setError] = useState('');
//     const [selectedTestName, setSelectedTestName] = useState(null); // State to store the selected Test-Name

//     const fetchData = async () => {
//         try {
//             const response = await fetch('https://phhm5ulen4skthqhefp7r5gp2u0yzxzd.lambda-url.us-east-1.on.aws/', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ start_time: startTime, end_time: endTime }),
//             });

//             const rawResult = await response.json();
//             console.log("Raw API Response:", rawResult);

//             const result = rawResult.body ? JSON.parse(rawResult.body) : rawResult;

//             console.log("Parsed Result:", result);

//             if (response.ok) {
//                 const processedData = (result.data || []).map((row) => ({
//                     timestamp: row.timestamp || row.time_bucket, // Handle `time_bucket` for aggregated data
//                     ist_timestamp: row.ist_timestamp || row.time_bucket, // Default for missing fields
//                     Test_Name: row.device_data?.["Test-Name"]  || row["test_name"] || "N/A" , // Adjust for different structures
//                     AX_LT_011: row.device_data?.["AX-LT-011"] || row["avg_ax_lt_011"], // Adjust for different structures
//                     AX_LT_021: row.device_data?.["AX-LT-021"] || row["avg_ax_lt_021"], // Adjust for different structures
//                     AX_VA_311: row.device_data?.["AX-VA-311"] || row["ax_va_311"],
//                     AX_VA_312: row.device_data?.["AX-VA-312"] || row["ax_va_312"],
//                     CW_TT_011: row.device_data?.["CW-TT-011"] || row["cw_tt_011"],
//                 }));

//                 // Deduplicate data to show only the first occurrence of each Test-Name
//                 const uniqueTestNames = new Set();
//                 const deduplicatedData = processedData.filter((row) => {
//                     if (row.Test_Name && !uniqueTestNames.has(row.Test_Name)) {
//                         uniqueTestNames.add(row.Test_Name);
//                         return true; // Include the row
//                     }
//                     return false; // Skip the row
//                 });

//                 setAllData(processedData); // Store the complete dataset
//                 setData(deduplicatedData); // Store the deduplicated dataset
//                 setError('');
//             } else {
//                 setAllData([]);
//                 setData([]);
//                 setError(result.message || 'Failed to fetch data');
//             }
//         } catch (err) {
//             console.error("Error in Fetch:", err);
//             setAllData([]);
//             setData([]);
//             setError(err.message || 'An unexpected error occurred');
//         }
//     };

//     const handleTestNameClick = (testName) => {
//         setSelectedTestName(testName); // Set the selected Test-Name
//     };

//     // Filter all rows with the selected Test-Name
//     const filteredRows = selectedTestName
//         ? allData.filter((row) => row.Test_Name === selectedTestName)
//         : [];

//     return (
//         <div>
//             <h1>IoT Data Viewer</h1>
//             <div>
//                 <label>
//                     Start Time:
//                     <input
//                         type="datetime-local"
//                         value={startTime}
//                         onChange={(e) => setStartTime(e.target.value)}
//                     />
//                 </label>
//                 <label>
//                     End Time:
//                     <input
//                         type="datetime-local"
//                         value={endTime}
//                         onChange={(e) => setEndTime(e.target.value)}
//                     />
//                 </label>
//                 <button onClick={fetchData}>Fetch Data</button>
//             </div>
//             {error && <p style={{ color: 'red' }}>{error}</p>}
//             {data.length > 0 ? (
//                 <>
//                     <table border="1">
//                         <thead>
//                             <tr>
//                                 <th>Timestamp</th>
//                                 <th>IST Timestamp</th>
//                                 <th>Test-Name</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {data.map((row, index) => (
//                                 <tr key={index}>
//                                     <td>{row.timestamp}</td>
//                                     <td>{row.ist_timestamp}</td>
        
//                                     <td>
//                                         <button
//                                             style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}
//                                             onClick={() => handleTestNameClick(row.Test_Name)}
//                                         >
//                                             {row.Test_Name}
//                                         </button>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>

//                     {selectedTestName && filteredRows.length > 0 && (
//                         <>
//                             <h2>Details for Test-Name: {selectedTestName}</h2>
//                             <table border="1">
//                                 <thead>
//                                     <tr>
//                                         <th>Timestamp</th>
//                                         <th>IST Timestamp</th>
//                                         <th>Test-Name</th>
//                                         <th>AX-LT-011</th>
//                                         <th>AX-LT-021</th>
//                                         <th>AX-VA-311</th>
//                                         <th>AX-VA-312</th>
//                                         <th>CW_TT_011</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {filteredRows.map((row, index) => (
//                                         <tr key={index}>
//                                             <td>{row.timestamp}</td>
//                                             <td>{row.ist_timestamp}</td>
//                                             <td>{row.Test_Name}</td>
//                                             <td>{row.AX_LT_011}</td>
//                                             <td>{row.AX_LT_021}</td>
//                                             <td>{row.AX_VA_311}</td>
//                                             <td>{row.AX_VA_312}</td>
//                                             <td>{row.CW_TT_011}</td>
                                           
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </>
//                     )}
//                 </>
//             ) : (
//                 <p>No data available for the selected date range.</p>
//             )}
//         </div>
//     );
// }

// export default IoTDataViewer;

// import React, { useState } from 'react';
// import { MenuItem, Select, FormControl, InputLabel, Button } from '@mui/material';
// import { DataGrid, GridToolbar } from '@mui/x-data-grid';

// function IoTDataViewer() {
//     const [startTime, setStartTime] = useState(''); 
//     const [endTime, setEndTime] = useState('');
//     const [allData, setAllData] = useState([]); // Store the complete dataset
//     const [data, setData] = useState([]); // Store the deduplicated data
//     const [error, setError] = useState('');
//     const [selectedTestName, setSelectedTestName] = useState(''); // State to store the selected Test-Name

//     const fetchData = async () => {
//         try {
//             const response = await fetch('https://phhm5ulen4skthqhefp7r5gp2u0yzxzd.lambda-url.us-east-1.on.aws/', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ start_time: startTime, end_time: endTime }),
//             });

//             const rawResult = await response.json();
//             const result = rawResult.body ? JSON.parse(rawResult.body) : rawResult;

//             if (response.ok) {
//                 const processedData = (result.data || []).map((row) => ({
//                     id: `${row.timestamp}-${row.Test_Name}`, // Unique ID for DataGrid rows
//                     ist_timestamp: row.ist_timestamp || row.time_bucket,
//                     Test_Name: row.device_data?.["Test-Name"] || row["test_name"],
//                     AX_LT_011: row.device_data?.["AX-LT-011"] || row["avg_ax_lt_011"],
//                     AX_VA_311: row.device_data?.["AX-VA-311"] || row["ax_va_311"],
//                 }));

//                 // Deduplicate data to show only the first occurrence of each Test-Name
//                 const uniqueTestNames = new Set();
//                 const deduplicatedData = processedData.filter((row) => {
//                     if (row.Test_Name && !uniqueTestNames.has(row.Test_Name)) {
//                         uniqueTestNames.add(row.Test_Name);
//                         return true;
//                     }
//                     return false;
//                 });

//                 setAllData(processedData);
//                 setData(deduplicatedData);
//                 setError('');
//             } else {
//                 setAllData([]);
//                 setData([]);
//                 setError(result.message || 'Failed to fetch data');
//             }
//         } catch (err) {
//             console.error("Error in Fetch:", err);
//             setAllData([]);
//             setData([]);
//             setError(err.message || 'An unexpected error occurred');
//         }
//     };

//     // Filter all rows with the selected Test-Name
//     const filteredRows = selectedTestName
//         ? allData.filter((row) => row.Test_Name === selectedTestName)
//         : [];

//     // Columns configuration for the DataGrid
//     const columns = [
//         { field: 'ist_timestamp', headerName: 'IST Timestamp' ,width: 270},
//         { field: 'Test_Name', headerName: 'Test Name',  width: 70, },
//         { field: 'AX_LT_011', headerName: 'AX-LT-011',},
//         { field: 'AX_VA_311', headerName: 'AX-VA-311',width: 70,},
//     ];
//     return (
//         <div style={{ padding: '20px' }}>
//             <h1>IoT Data Viewer</h1>
//             <div style={{ marginBottom: '20px' }}>
//                 <label>
//                     Start Time:
//                     <input
//                         type="datetime-local"
//                         value={startTime}
//                         onChange={(e) => setStartTime(e.target.value)}
//                         style={{ marginLeft: '10px', marginRight: '20px' }}
//                     />
//                 </label>
//                 <label>
//                     End Time:
//                     <input
//                         type="datetime-local"
//                         value={endTime}
//                         onChange={(e) => setEndTime(e.target.value)}
//                         style={{ marginLeft: '10px', marginRight: '20px' }}
//                     />
//                 </label>
//                 <Button variant="contained" color="primary" onClick={fetchData}>
//                     Fetch Data
//                 </Button>
//             </div>
//             {error && <p style={{ color: 'red' }}>{error}</p>}

//             {data.length > 0 ? (
//                 <div style={{ marginBottom: '20px' }}>
//                     <FormControl fullWidth>
//                         <InputLabel id="test-name-select-label">Select Test Name</InputLabel>
//                         <Select
//                             labelId="test-name-select-label"
//                             value={selectedTestName}
//                             onChange={(e) => setSelectedTestName(e.target.value)}
//                         >
//                             {data.map((row) => (
//                                 <MenuItem key={row.Test_Name} value={row.Test_Name}>
//                                     {row.Test_Name}
//                                 </MenuItem>
//                             ))}
//                         </Select>
//                     </FormControl>
//                 </div>
//             ) : (
//                 <p>No data available for the selected date range.</p>
//             )}

//             {selectedTestName && filteredRows.length > 0 && (
//                 <>
//                     <h2>Details for Test Name: {selectedTestName}</h2>
//                     <div style={{ height: 600, width: '100%' }}>
//                         <DataGrid
//                             rows={filteredRows}
//                             columns={columns}
//                             disableSelectionOnClick
//                             components={{ Toolbar: GridToolbar }}
//                         />
//                     </div>
//                 </>
//             )}
//         </div>
//     );
// }

// export default IoTDataViewer;


// import React, { useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import GridLayout from 'react-grid-layout';
// import { Box, Typography, useTheme, IconButton, Button } from "@mui/material";
// import { tokens } from "../../theme";
// import Header from "src/component/Header";
// import Separator from "src/component/separator/Separator";
// import Electrolyte from "src/component/Electrolyte/Electrolyte";
// import RawGasImpurities from "src/component/separator/RawGasImpurities";
// import H2RawGas from "src/component/AuxSystem/H2RawGas";
// import H2ProcessGas from "src/component/AuxSystem/H2ProcessGas";
// import RectifierControl from "src/component/separator/RectifierControl";
// import DragHandleIcon from '@mui/icons-material/DragHandle';
// import 'react-grid-layout/css/styles.css';
// import 'react-resizable/css/styles.css';
// import { debounce } from 'lodash';

// import { setLayout } from '../../redux/layoutActions'; // Import Redux actions

// const Overview = () => {

//   const initialLayout = [ 
//     { i: 'Seperator', x: 0, y: 1, w: 2.5, h: 10, minW: 2.5, maxW: 4, minH: 9, maxH: 13 },
//     { i: 'Electrolyte', x: 2.5, y: 0, w: 2.5, h: 10, minW: 2.5, maxW: 4, minH: 9, maxH: 13 },
//     { i: 'RawGas', x: 0, y: 3, w: 5, h: 10, minW: 4.5, maxW: 7, minH: 9, maxH: 13 },
//     { i: 'H2RAW', x: 0, y: 2, w: 3, h: 10.5, minW: 4, maxW: 8, minH: 10, maxH: 13 },
//     { i: 'RECTIFIER', x: 5, y: 0, w: 2, h: 10, minW: 2, maxW: 12, minH: 2, maxH: 15 },
//     { i: 'H2PROCESS', x: 3, y: 1, w: 4, h: 10.5, minW: 4, maxW: 8, minH: 10, maxH: 13 },
//   ];

//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);
//   const dispatch = useDispatch();

//   // Load layout and custom charts from Redux
//   const layout = useSelector((state) => state.layout.customChartsLayout) || JSON.parse(localStorage.getItem("customChartsLayout")) || [];
//   const charts = useSelector((state) => state.layout.customCharts) || JSON.parse(localStorage.getItem("customCharts")) || [];

//   useEffect(() => {
//     // Sync layout from localStorage to Redux state on initial load if layout is empty
//     if (!layout.length) {
//       const savedLayout = JSON.parse(localStorage.getItem("customChartsLayout")) || [];
//       dispatch(setLayout(savedLayout, "custom"));
//     }
//   }, [dispatch, layout.length]);

//   const saveLayout = debounce((newLayout) => {
//     dispatch(setLayout(newLayout, "custom"));
//     localStorage.setItem("customChartsLayout", JSON.stringify(newLayout));
//   }, 500);

//   const resetLayout = () => {
//     localStorage.removeItem("customChartsLayout");
//     dispatch(setLayout(initialLayout, "custom"));
//   };

//   return (
//     <Box m="20px">
//       <Box display="flex" justifyContent="space-between" alignItems="center">
//         <Header title="Overview" subtitle="Welcome to your overview" />
//         <Button variant="contained" color="primary" onClick={resetLayout}>
//           Reset Layout
//         </Button>
//       </Box>

//       <GridLayout
//         className="layout"
//         layout={layout}
//         cols={12}
//         rowHeight={30}
//         width={1600}
//         draggableHandle=".drag-handle"
//         onLayoutChange={(newLayout) => dispatch(setLayout(newLayout, "custom"))}
//         onResizeStop={(newLayout) => saveLayout(newLayout)}
//         onDragStop={(newLayout) => saveLayout(newLayout)}
//         isResizable
//         isDraggable
//       >
//         <Box key="Seperator" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="8px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">SEPARATOR</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <Separator />
//           </Box>
//         </Box>

//         <Box key="Electrolyte" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">ELECTROLYTE</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <Electrolyte />
//           </Box>
//         </Box>

//         <Box key="RawGas" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">RAW GAS IMPURITIES</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <RawGasImpurities />
//           </Box>
//         </Box>

//         <Box key="H2RAW" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">H2 RAW GAS</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <H2RawGas />
//           </Box>
//         </Box>

//         <Box key="H2PROCESS" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">H2 PROCESS GAS</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <H2ProcessGas />
//           </Box>
//         </Box>

//         <Box key="RECTIFIER" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">RECTIFIER CONTROL</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <RectifierControl />
//           </Box>
//         </Box>
//       </GridLayout>
//     </Box>
//   );
// };

// export default Overview;



// import React, { useState, useEffect, useRef } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import GridLayout from "react-grid-layout";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   Brush,
//   ResponsiveContainer,
// } from "recharts";
// import {
//   Box,
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Typography,
//   IconButton,
//   Grid,
//   TextField,
//   RadioGroup,
//   FormControlLabel,
//   Radio,
// } from "@mui/material";
// import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
// import { SketchPicker } from "react-color";
// import DeleteIcon from "@mui/icons-material/Delete";
// import DragHandleIcon from "@mui/icons-material/DragHandle";
// import axios from "axios";
// import { debounce } from "lodash";
// import {
//   format,
//   subMinutes,
//   subHours,
//   subDays,
//   subWeeks,
//   subMonths,
//   parseISO,
// } from "date-fns";
// import { setLayout, addChart, removeChart, updateChart } from "../../redux/layoutActions";

// const HistoricalCharts = () => {
//   const [chartData, setChartData] = useState({});
//   const [tempChartData, setTempChartData] = useState(null);
//   const [chartDialogOpen, setChartDialogOpen] = useState(false);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [selectedYAxisId, setSelectedYAxisId] = useState(null);
//   const [dateDialogOpen, setDateDialogOpen] = useState(false);
//   const [chartDateRanges, setChartDateRanges] = useState({});
//   const [mode, setMode] = useState("B");
//   const [currentChartId, setCurrentChartId] = useState(null);
//   const wsClientRefs = useRef({});
//   const [colorPickerOpen, setColorPickerOpen] = useState(false);

//   const dispatch = useDispatch();
//   const layout = useSelector((state) => state.layout.historicalLayout) || JSON.parse(localStorage.getItem("historicalChartsLayout")) || [];
//   const charts = useSelector((state) => state.layout.historicalCharts) || JSON.parse(localStorage.getItem("historicalCharts")) || [];

//   useEffect(() => {
//     if (!layout.length) {
//       const savedLayout = JSON.parse(localStorage.getItem("historicalChartsLayout")) || [];
//       dispatch(setLayout(savedLayout, "historical"));
//     }
//   }, [dispatch, layout.length]);

//   const saveLayout = debounce((newLayout) => {
//     dispatch(setLayout(newLayout, "historical"));
//     localStorage.setItem("historicalChartsLayout", JSON.stringify(newLayout));
//   }, 500);

//   const addCustomChart = () => {
//     const newChartId = Date.now();
//     const newChart = {
//       id: newChartId,
//       type: "Line",
//       xAxisDataKey: "timestamp",
//       yAxisDataKeys: [
//         {
//           id: "left-0",
//           dataKeys: ["AX-LT-011"],
//           range: "0-500",
//           color: "#FF0000",
//           lineStyle: "solid",
//         },
//       ],
//     };
//     dispatch(addChart(newChart, "historical"));
//     const updatedLayout = [...layout, { i: newChartId.toString(), x: 0, y: 0, w: 6, h: 8 }];
//     dispatch(setLayout(updatedLayout, "historical"));
//     localStorage.setItem("historicalChartsLayout", JSON.stringify(updatedLayout));
//   };

//   const deleteChart = (chartId) => {
//     dispatch(removeChart(chartId, "historical"));
//     const updatedLayout = layout.filter((l) => l.i !== chartId.toString());
//     dispatch(setLayout(updatedLayout, "historical"));
//     localStorage.setItem("historicalChartsLayout", JSON.stringify(updatedLayout));
//   };

//   const saveConfiguration = () => {
//     if (tempChartData) {
//       dispatch(updateChart(tempChartData, "historical"));
//       setDialogOpen(false);
//     }
//   };

//   const handleTimeRangeChange = (chartId, value) => {
//     let start;
//     switch (value) {
//       case "1_minute":
//         start = subMinutes(new Date(), 1);
//         break;
//       case "30_minutes":
//         start = subMinutes(new Date(), 30);
//         break;
//       case "1_hour":
//         start = subHours(new Date(), 1);
//         break;
//       case "6_hours":
//         start = subHours(new Date(), 6);
//         break;
//       case "12_hours":
//         start = subHours(new Date(), 12);
//         break;
//       case "1_day":
//         start = subDays(new Date(), 1);
//         break;
//       case "2_day":
//         start = subDays(new Date(), 2);
//         break;
//       case "1_week":
//         start = subWeeks(new Date(), 1);
//         break;
//       case "1_month":
//         start = subMonths(new Date(), 1);
//         break;
//       default:
//         start = subMinutes(new Date(), 1);
//     }

//     setChartDateRanges((prevRanges) => ({
//       ...prevRanges,
//       [chartId]: { startDate: start, endDate: new Date() },
//     }));
//   };

//   const fetchChartData = async (chartId) => {
//     const { startDate, endDate } = chartDateRanges[chartId] || {};
//     if (!startDate) return;
//     try {
//       const formattedStartDate = format(startDate, "yyyy-MM-dd'T'HH:mm");
//       const formattedEndDate = mode === "C" ? format(new Date(), "yyyy-MM-dd'T'HH:mm") : format(endDate, "yyyy-MM-dd'T'HH:mm");

//       const response = await axios.post("https://xdeuid6slkki7yxz4zhdbqbzfq0hirkk.lambda-url.us-east-1.on.aws/", { start_time: formattedStartDate, end_time: formattedEndDate });
//       const parsedBody = JSON.parse(response.data.body);
//       const fetchedData = parsedBody.data.map((item) => ({
//         timestamp: item[0],
//         "AX-LT-011": item[1],
//         "AX-LT-021": item[2],
//       }));

//       setChartData((prevData) => ({ ...prevData, [chartId]: fetchedData }));

//       if (mode === "C") {
//         setupRealTimeWebSocket(chartId);
//       }
//     } catch (error) {
//       console.error("Error fetching data from the API:", error);
//     }
//   };

//   const setupRealTimeWebSocket = (chartId) => {
//     if (wsClientRefs.current[chartId]) {
//       wsClientRefs.current[chartId].close();
//     }

//     wsClientRefs.current[chartId] = new WebSocket(
//       "wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/"
//     );

//     wsClientRefs.current[chartId].onopen = () => {
//       console.log(`WebSocket connection established for chart ${chartId}`);
//     };

//     wsClientRefs.current[chartId].onmessage = (message) => {
//       try {
//         const receivedData = JSON.parse(message.data);
//         const newData = {
//           timestamp: parseISO(receivedData["PLC-TIME-STAMP"]) || new Date(),
//           "AX-LT-011": receivedData["AX-LT-011"] || null,
//           "AX-LT-021": receivedData["AX-LT-021"] || null,
//           "CW-TT-011": receivedData["CW-TT-011"] || null,
//         };

//         setChartData((prevData) => ({
//           ...prevData,
//           [chartId]: [...(prevData[chartId] || []), newData],
//         }));
//       } catch (error) {
//         console.error("Error processing WebSocket message:", error);
//       }
//     };

//     wsClientRefs.current[chartId].onclose = (event) => {
//       console.error(`WebSocket disconnected for chart ${chartId}. Reconnecting...`);
//       setTimeout(() => setupRealTimeWebSocket(chartId), 1000);
//     };
//   };
//   const handleRangeChange = (yAxisId, event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
//         yAxis.id === yAxisId ? { ...yAxis, range: value } : yAxis
//       ),
//     }));
//   };
//   const deleteYAxis = (yAxisId) => {
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.filter(
//         (yAxis) => yAxis.id !== yAxisId
//       ),
//     }));
//   };
  
//   const handleDataKeyChange = (yAxisId, event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
//         yAxis.id === yAxisId ? { ...yAxis, dataKeys: value } : yAxis
//       ),
//     }));
//   };
//   const openColorPicker = (yAxisId) => {
//     setSelectedYAxisId(yAxisId);
//     setColorPickerOpen(true);
//   };
//   const openDialog = (chart) => {
//     setTempChartData(chart);
//     setDialogOpen(true);
//   };
//     const closeDialog = () => setDialogOpen(false);

//   const handleLineStyleChange = (yAxisId, event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
//         yAxis.id === yAxisId ? { ...yAxis, lineStyle: value } : yAxis
//       ),
//     }));
//   };
//   const handleColorChange = (color) => {
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
//         yAxis.id === selectedYAxisId ? { ...yAxis, color: color.hex } : yAxis
//       ),
//     }));
//     setColorPickerOpen(false);
//   };

//   const renderLineChart = (chart) => (
//     <ResponsiveContainer width="100%" height="100%">
//       <LineChart data={chartData[chart.id] || []}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey="timestamp" tickFormatter={(tick) => new Date(tick).toLocaleString()} />
//         {chart.yAxisDataKeys.map((yAxis) => (
//           <YAxis key={yAxis.id} yAxisId={yAxis.id} domain={getYAxisDomain(yAxis.range)} stroke={yAxis.color} />
//         ))}
//         <Tooltip />
//         <Legend />
//         {chart.yAxisDataKeys.map((yAxis) =>
//           yAxis.dataKeys.map((key) => (
//             <Line key={key} type="monotone" dataKey={key} stroke={yAxis.color} strokeDasharray={getLineStyle(yAxis.lineStyle)} yAxisId={yAxis.id} />
//           ))
//         )}
     
//       </LineChart>
//     </ResponsiveContainer>
//   );

//   const getYAxisDomain = (range) => {
//     switch (range) {
//       case "0-500":
//         return [0, 500];
//       case "0-100":
//         return [0, 100];
//       case "0-10":
//         return [0, 10];
//       default:
//         return [0, 500];
//     }
//   };

//   const getLineStyle = (lineStyle) => {
//     switch (lineStyle) {
//       case "solid":
//         return "";
//       case "dotted":
//         return "1 1";
//       case "dashed":
//         return "5 5";
//       case "dot-dash":
//         return "3 3 1 3";
//       case "dash-dot-dot":
//         return "3 3 1 1 1 3";
//       default:
//         return "";
//     }
//   };

//   const handleDateRangeApply = () => {
//     setDateDialogOpen(false);
//     fetchChartData(currentChartId);
//   };

//   const renderChart = (chart) => (
//     <Box sx={{ height: "100%" }}>
//       <Box sx={{ height: "calc(100% - 60px)", width: "100%" }}>
//         {renderLineChart(chart)}
//       </Box>
//       <Box display="flex" justifyContent="space-around" mt={1}>
//         <Button variant="contained" color="secondary" onClick={() => setTempChartData(chart) || setDialogOpen(true)}>Configure Chart</Button>
//         <Button variant="contained" color="secondary" onClick={() => setCurrentChartId(chart.id) || setDateDialogOpen(true)}>Choose Date Range</Button>
//       </Box>
//     </Box>
//   );

//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       <Box display="flex" justifyContent="flex-end" marginBottom={4}>
//         <Button variant="contained" color="secondary" onClick={() => setChartDialogOpen(true)}>Add Realtime Historical Chart</Button>
//       </Box>
//       <GridLayout
//         className="layout"
//         layout={layout}
//         cols={12}
//         rowHeight={45}
//         width={1200}
//         onLayoutChange={(newLayout) => dispatch(setLayout(newLayout, "historical"))}
//         onResizeStop={(newLayout) => saveLayout(newLayout)}
//         onDragStop={(newLayout) => saveLayout(newLayout)}
//         draggableHandle=".drag-handle"
//         isResizable
//         isDraggable
//       >
//         {charts.map((chart) => (
//           <Box
//             key={chart.id}
//             data-grid={
//               layout.find((l) => l.i === chart.id.toString()) || {
//                 x: 0,
//                 y: Infinity,
//                 w: 6,
//                 h: 8,
//               }
//             }
//             sx={{ position: "relative", border: "1px solid #ccc", borderRadius: "8px", overflow: "hidden" }}
//           >
//             <Box display="flex" justifyContent="space-between" p={2} sx={{ backgroundColor: "#f5f5f5" }}>
//               <IconButton className="drag-handle">
//                 <DragHandleIcon />
//               </IconButton>
//               <Typography variant="h6">{chart.type} Chart</Typography>
//               <IconButton aria-label="delete" onClick={() => deleteChart(chart.id)}>
//                 <DeleteIcon />
//               </IconButton>
//             </Box>
//             <Box sx={{ height: "calc(100% - 100px)" }}>
//               {renderChart(chart)}
//             </Box>
//           </Box>
//         ))}
//       </GridLayout>

//       <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
//         <DialogTitle>Select Chart Type</DialogTitle>
//         <DialogContent>
//           <Button variant="contained" onClick={addCustomChart}>Add Line Chart</Button>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setChartDialogOpen(false)} color="secondary">Cancel</Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog open={dateDialogOpen} onClose={() => setDateDialogOpen(false)} fullWidth maxWidth="sm">
//         <DialogTitle>Select Date Range</DialogTitle>
//         <DialogContent>
//           <FormControl component="fieldset">
//             <RadioGroup row value={mode} onChange={(e) => setMode(e.target.value)}>
//               <FormControlLabel value="B" control={<Radio />} label="Select Date Range" />
//               <FormControlLabel value="C" control={<Radio />} label="Start Date & Continue Real-Time" />
//             </RadioGroup>
//           </FormControl>
//           <Grid container spacing={2} alignItems="center">
//             <Grid item xs={6}>
//               <DateTimePicker
//                 label="Start Date and Time"
//                 value={chartDateRanges[currentChartId]?.startDate || null}
//                 onChange={(date) =>
//                   setChartDateRanges((prevRanges) => ({
//                     ...prevRanges,
//                     [currentChartId]: { ...prevRanges[currentChartId], startDate: date },
//                   }))
//                 }
//                 renderInput={(params) => <TextField {...params} fullWidth />}
//               />
//             </Grid>
//             <Grid item xs={6}>
//               <DateTimePicker
//                 label="End Date and Time"
//                 value={chartDateRanges[currentChartId]?.endDate || null}
//                 onChange={(date) =>
//                   setChartDateRanges((prevRanges) => ({
//                     ...prevRanges,
//                     [currentChartId]: { ...prevRanges[currentChartId], endDate: date },
//                   }))
//                 }
//                 renderInput={(params) => <TextField {...params} fullWidth />}
//                 disabled={mode === "C"}
//               />
//             </Grid>
//           </Grid>
//           <Box display="flex" justifyContent="flex-end" marginBottom={2}>
//             <FormControl>
//               <InputLabel id="time-range-label">Time Range</InputLabel>
//               <Select
//                 labelId="time-range-label"
//                 value={chartDateRanges[currentChartId]?.range || ""}
//                 onChange={(e) => handleTimeRangeChange(currentChartId, e.target.value)}
//               >
//                 <MenuItem value="1_minute">Last 1 minute</MenuItem>
//                 <MenuItem value="30_minutes">Last 30 minutes</MenuItem>
//                 <MenuItem value="1_hour">Last 1 hour</MenuItem>
//                 <MenuItem value="6_hours">Last 6 hours</MenuItem>
//                 <MenuItem value="12_hours">Last 12 hours</MenuItem>
//                 <MenuItem value="1_day">Last 1 day</MenuItem>
//                 <MenuItem value="2_day">Last 2 days</MenuItem>
//                 <MenuItem value="1_week">Last 1 week</MenuItem>
//                 <MenuItem value="1_month">Last 1 month</MenuItem>
//               </Select>
//             </FormControl>
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setDateDialogOpen(false)} color="secondary">Cancel</Button>
//           <Button onClick={handleDateRangeApply} color="primary" disabled={!chartDateRanges[currentChartId]?.startDate || (mode === "B" && !chartDateRanges[currentChartId]?.endDate)}>Apply</Button>
//         </DialogActions>
//       </Dialog>

//       {tempChartData && (
//         <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="md">
//           <DialogTitle>Configure Chart</DialogTitle>
//           <DialogContent>
//             <Box display="flex" flexDirection="column" maxHeight="400px" overflow="auto">
//               {tempChartData.yAxisDataKeys.map((yAxis, index) => (
//                 <Box key={yAxis.id} display="flex" flexDirection="column" marginBottom={2}>
//                   <Box display="flex" justifyContent="space-between" alignItems="center">
//                     <Typography variant="h6">Y-Axis {index + 1}</Typography>
//                     <IconButton onClick={() => deleteYAxis(yAxis.id)}><DeleteIcon /></IconButton>
//                   </Box>
//                   <FormControl fullWidth margin="normal">
//                     <InputLabel>Data Keys</InputLabel>
//                     <Select multiple value={yAxis.dataKeys} onChange={(event) => handleDataKeyChange(yAxis.id, event)}>
//                       <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//                       <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
//                     </Select>
//                   </FormControl>
//                   <FormControl fullWidth margin="normal">
//                     <InputLabel>Range</InputLabel>
//                     <Select value={yAxis.range} onChange={(event) => handleRangeChange(yAxis.id, event)}>
//                       <MenuItem value="0-500">0-500</MenuItem>
//                       <MenuItem value="0-100">0-100</MenuItem>
//                       <MenuItem value="0-10">0-10</MenuItem>
//                     </Select>
//                   </FormControl>
//                   <FormControl fullWidth margin="normal">
//                     <InputLabel>Line Style</InputLabel>
//                     <Select value={yAxis.lineStyle} onChange={(event) => handleLineStyleChange(yAxis.id, event)}>
//                       <MenuItem value="solid">Solid</MenuItem>
//                       <MenuItem value="dotted">Dotted</MenuItem>
//                       <MenuItem value="dashed">Dashed</MenuItem>
//                       <MenuItem value="dot-dash">Dot Dash</MenuItem>
//                     </Select>
//                   </FormControl>
//                   <Button onClick={() => openColorPicker(yAxis.id)}>Select Color</Button>
//                   {colorPickerOpen && selectedYAxisId === yAxis.id && <SketchPicker color={yAxis.color} onChangeComplete={handleColorChange} />}
//                 </Box>
//               ))}
//               <Button variant="contained" color="secondary" onClick={() =>
//                 setTempChartData((prevChart) => ({
//                   ...prevChart,
//                   yAxisDataKeys: [
//                     ...prevChart.yAxisDataKeys,
//                     {
//                       id: `left-${prevChart.yAxisDataKeys.length}`,
//                       dataKeys: [],
//                       range: "0-500",
//                       color: "#FF0000",
//                       lineStyle: "solid",
//                     },
//                   ],
//                 }))
//               }>Add Y-Axis</Button>
//             </Box>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setDialogOpen(false)} color="secondary">Cancel</Button>
//             <Button onClick={saveConfiguration} color="primary">Save</Button>
//           </DialogActions>
//         </Dialog>
//       )}
//     </LocalizationProvider>
//   );
// };

// export default HistoricalCharts;




// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   setLayout,
//   addChart,
//   removeChart,
//   updateChart,
// } from "../../redux/layoutActions";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   ScatterChart,
//   Scatter,
//   PieChart,
//   Pie,
//   Cell,
// } from "recharts";
// import GridLayout from "react-grid-layout";
// import {
//   Box,
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   Typography,
//   IconButton,
//   InputLabel,
//   FormControl,
//   Select,
//   MenuItem,
//   useTheme,
// } from "@mui/material";
// import DeleteIcon from "@mui/icons-material/Delete";
// import DragHandleIcon from "@mui/icons-material/DragHandle";
// import { debounce } from "lodash";
// import { tokens } from "../../theme";
// import { useWebSocket } from "src/WebSocketProvider";
// import { SketchPicker } from "react-color";
// // Colors for the chart
// const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
// const Max_data_point = 20;

// const CustomCharts = () => {
//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);


//   const dispatch = useDispatch();
//   const charts = useSelector((state) => state.layout.customCharts);
//   const layout = useSelector((state) => state.layout.customChartsLayout);
//   const [chartDialogOpen, setChartDialogOpen] = useState(false);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [tempChartData, setTempChartData] = useState(null);

//   const websocketData = useWebSocket();
//   const [colorPickerOpen, setColorPickerOpen] = useState(false);
//   const [selectedYAxisId, setSelectedYAxisId] = useState(null);
//   // Load saved charts and layout when the component mounts
//   useEffect(() => {
//     const savedCharts = JSON.parse(localStorage.getItem("customCharts")) || [];
//     const savedLayout =
//       JSON.parse(localStorage.getItem("customChartsLayout")) || [];
//     if (!charts.length) {
//       dispatch(setLayout(savedLayout, "custom"));
//       savedCharts.forEach((chart) => dispatch(addChart(chart, "custom")));
//     }
//   }, [dispatch, charts.length]);

//   // Save layout changes (debounced to avoid excessive dispatches)
//   const saveLayout = debounce((newLayout) => {
//     dispatch(setLayout(newLayout, "custom"));
//     localStorage.setItem("customChartsLayout", JSON.stringify(newLayout));
//   }, 500);

//   // Add a new custom chart of the specified type
//   const addCustomChart = (type) => {
//     const newChartId = Date.now();
//     const newChart = {
//       id: newChartId,
//       type,
//       data: [], // Initially empty, will be populated via WebSocket
//       xAxisDataKey: "",
//       yAxisDataKeys: [
//         {
//           id: "left-0",
//           dataKeys: ["AX-LT-011"],
//           range: "0-500",
//           color: "#FF0000",
//           lineStyle: "solid",
//         },
//       ],
//     };
//     dispatch(addChart(newChart, "custom"));
//     saveLayout([
//       ...layout,
//       { i: newChartId.toString(), x: 0, y: Infinity, w: 6, h: 8 },
//     ]);
//     setChartDialogOpen(false);
//   };

//   // Remove a chart and update layout accordingly
//   const deleteChart = (chartId) => {
//     dispatch(removeChart(chartId, "custom"));
//     saveLayout(layout.filter((l) => l.i !== chartId.toString()));
//   };

//   // Open the configuration dialog for a specific chart
//   const openDialog = (chart) => {
//     setTempChartData(chart);
//     setDialogOpen(true);
//   };

//   // Save configuration changes to Redux and close the dialog
//   const saveConfiguration = () => {
//     if (tempChartData) {
//       dispatch(updateChart(tempChartData, "custom"));
//       setDialogOpen(false);
//     }
//   };

//   // WebSocket connection and data handling
//   useEffect(() => {
//     const ws = new WebSocket(
//       "wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/"
//     );
  
//     ws.onmessage = (event) => {
//       const message = JSON.parse(event.data);
  
//       const updatedCharts = charts.map((chart) => {
//         if (
//           chart.yAxisDataKeys.some((yAxis) =>
//             yAxis.dataKeys.includes("AX-LT-011")
//           )
//         ) {
//           // Append new data point
//           const newData = [...chart.data, message];
          
//           // Ensure we only keep the latest Max_data_point data points
//           const limitedData = newData.slice(-Max_data_point); // Keep only the last Max_data_point data points
          
//           return {
//             ...chart,
//             data: limitedData, // Update the chart with the limited data
//           };
//         }
//         return chart;
//       });
  
//       updatedCharts.forEach((chart) => dispatch(updateChart(chart, "custom")));
//     };
  
//     ws.onclose = () => console.log("WebSocket connection closed");
  
//     return () => ws.close(); // Clean up on component unmount
//   }, [charts, dispatch]);

  // const closeDialog = () => setDialogOpen(false);

//   const handleDataKeyChange = (yAxisId, event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
//         yAxis.id === yAxisId ? { ...yAxis, dataKeys: value } : yAxis
//       ),
//     }));
//   };

//   const handleXAxisDataKeyChange = (event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       xAxisDataKey: value,
//     }));
//   };

//   const handleLineStyleChange = (yAxisId, event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
//         yAxis.id === yAxisId ? { ...yAxis, lineStyle: value } : yAxis
//       ),
//     }));
//   };

//   const handleRangeChange = (yAxisId, event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
//         yAxis.id === yAxisId ? { ...yAxis, range: value } : yAxis
//       ),
//     }));
//   };

//   const addYAxis = () => {
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: [
//         ...prevChart.yAxisDataKeys,
//         {
//           id: `left-${prevChart.yAxisDataKeys.length}`,
//           dataKeys: [],
//           range: "0-500",
//           color: "#FF0000",
//           lineStyle: "solid",
//         },
//       ],
//     }));
//   };

//   const deleteYAxis = (yAxisId) => {
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.filter(
//         (yAxis) => yAxis.id !== yAxisId
//       ),
//     }));
//   };
//   const openColorPicker = (yAxisId) => {
//     setSelectedYAxisId(yAxisId);
//     setColorPickerOpen(true);
//   };
//   const handleColorChange = (color) => {
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
//         yAxis.id === selectedYAxisId ? { ...yAxis, color: color.hex } : yAxis
//       ),
//     }));
//     setColorPickerOpen(false);
//   };

//   const getYAxisDomain = (range) => {
//     switch (range) {
//       case "0-500":
//         return [0, 500];
//       case "0-100":
//         return [0, 100];
//       case "0-10":
//         return [0, 10];
//       default:
//         return [0, 500];
//     }
//   };

//   const getLineStyle = (lineStyle) => {
//     switch (lineStyle) {
//       case "solid":
//         return "";
//       case "dotted":
//         return "1 1";
//       case "dashed":
//         return "5 5";
//       case "dot-dash":
//         return "3 3 1 3";
//       case "dash-dot-dot":
//         return "3 3 1 1 1 3";
//       default:
//         return "";
//     }
//   };
//   const renderChart = (chart) => {
//     switch (chart.type) {
//       case "Line":
//         return renderLineChart(chart);
//       case "Bar":
//         return renderBarChart(chart);
//       case "Scatter":
//         return renderScatterChart(chart);
//       case "XY":
//         return renderXYChart(chart);
//       case "Pie":
//         return renderPieChart(chart);
//       default:
//         return null;
//     }
//   };

//   const renderLineChart = (chart) => (
//     <ResponsiveContainer width="100%" height="100%">
//       <LineChart data={chart.data}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis
//         dataKey="timestamp"
//         tickFormatter={(tick) => new Date(tick).toLocaleString()}
//         />
//         {chart.yAxisDataKeys.map((yAxis) => (
//           <YAxis
//             key={yAxis.id}
//             yAxisId={yAxis.id}
//             domain={getYAxisDomain(yAxis.range)}
//             stroke={yAxis.color}
//           />
//         ))}
//         <Tooltip
//         cursor={{ strokeDasharray: '3 3' }}
//         content={({ payload }) => {
//           if (payload && payload.length) {
//             const point = payload[0].payload;
//             return (
//               <div className="custom-tooltip">
//                 {chart.yAxisDataKeys.map((yAxis) => (
                  
//                   <p key={yAxis.id}>
//                     {`Y (${yAxis.dataKeys[0]}): ${point[yAxis.dataKeys[0]]}`}
//                   </p>
//                 ))}
//                 <p>
//                 {`Timestamp: ${new Date(new Date(point.timestamp).getTime() + (5.5 * 60 * 60 * 1000)).toLocaleString('en-IN', {
//                   hour12: true,  // Optional: If you want a 12-hour format with AM/PM
//                   weekday: 'short', // Optional: To include the weekday name
//                   year: 'numeric',
//                   month: 'short',
//                   day: 'numeric',
//                   hour: '2-digit',
//                   minute: '2-digit',
//                   second: '2-digit'
//                 })}`}
//               </p>
              
              

//               </div>
//             );
//           }
//           return null;
//         }}
//       />
//         {chart.yAxisDataKeys.map((yAxis) =>
//           yAxis.dataKeys.map((key) => (
//             <Line
//               key={key}
//               type="monotone"
//               dataKey={key}
//               stroke={yAxis.color}
//               strokeDasharray={getLineStyle(yAxis.lineStyle)}
//               yAxisId={yAxis.id}
//             />
//           ))
//         )}
//       </LineChart>
//     </ResponsiveContainer>
//   );



//   const renderScatterChart = (chart) => (
//     <ResponsiveContainer width="100%" height="100%">
//       <ScatterChart data={chart.data}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis 
//         dataKey="timestamp"
//         tickFormatter={(tick) => new Date(tick).toLocaleString()}
//         />
//         {chart.yAxisDataKeys.map((yAxis) => (
//           <YAxis
//             key={yAxis.id}
//             yAxisId={yAxis.id}
//             domain={getYAxisDomain(yAxis.range)}
//             stroke={yAxis.color}
//           />
//         ))}
//         <Tooltip
//         cursor={{ strokeDasharray: '3 3' }}
//         content={({ payload }) => {
//           if (payload && payload.length) {
//             const point = payload[0].payload;
//             return (
//               <div className="custom-tooltip">
                
//                 {chart.yAxisDataKeys.map((yAxis) => (
//                   <p key={yAxis.id}>
//                     {`Y (${yAxis.dataKeys[0]}): ${point[yAxis.dataKeys[0]]}`}
//                   </p>
//                 ))}
//                 <p>
//   {`Timestamp: ${new Date(new Date(point.timestamp).getTime() + (5.5 * 60 * 60 * 1000)).toLocaleString('en-IN', {
//     hour12: true,  // Optional: If you want a 12-hour format with AM/PM
//     weekday: 'short', // Optional: To include the weekday name
//     year: 'numeric',
//     month: 'short',
//     day: 'numeric',
//     hour: '2-digit',
//     minute: '2-digit',
//     second: '2-digit'
//   })}`}
// </p>

//               </div>
//             );
//           }
//           return null;
//         }}
//       />
//         <Legend />
//         {chart.yAxisDataKeys.map((yAxis) =>
//           yAxis.dataKeys.map((key) => (
//             <Scatter
//               key={key}
//               dataKey={key}
//               fill={yAxis.color}
//               yAxisId={yAxis.id}
//             />
//           ))
//         )}
//       </ScatterChart>
//     </ResponsiveContainer>
//   );

//   const renderXYChart = (chart) => (
//     <ResponsiveContainer width="100%" height="100%">
//     <ScatterChart data={chart.data}>
//       <CartesianGrid strokeDasharray="3 3" />
//       <XAxis
//         dataKey={chart.xAxisDataKey}
//         type="number"
//         domain={["auto", "auto"]} // Automatically adjust the domain based on data
//         tickFormatter={(value) => value.toFixed(4)}
//       />
//       {chart.yAxisDataKeys.map((yAxis) => (
//         <YAxis
//           key={yAxis.id}
//           dataKey={chart.yAxisDataKey}
//           yAxisId={yAxis.id}
//           domain={yAxis.range ? yAxis.range : ["auto", "auto"]} // Automatically adjust if no range is specified
//           stroke={yAxis.color}
//           tickFormatter={(value) => value.toFixed(4)}
//         />
//       ))}
//       <Tooltip
//       cursor={{ strokeDasharray: '3 3' }}
//       content={({ payload }) => {
//         if (payload && payload.length) {
//           const point = payload[0].payload;
//           return (
//             <div className="custom-tooltip">
//               <p>{`X (${chart.xAxisDataKey}): ${point[chart.xAxisDataKey]}`}</p>
//               {chart.yAxisDataKeys.map((yAxis) => (
//                 <p key={yAxis.id}>
//                   {`Y (${yAxis.dataKeys[0]}): ${point[yAxis.dataKeys[0]]}`}
//                 </p>
//               ))}
//               <p>
//               {`Timestamp: ${new Date(new Date(point.timestamp).getTime() + (5.5 * 60 * 60 * 1000)).toLocaleString('en-IN', {
//                 hour12: true,  // Optional: If you want a 12-hour format with AM/PM
//                 weekday: 'short', // Optional: To include the weekday name
//                 year: 'numeric',
//                 month: 'short',
//                 day: 'numeric',
//                 hour: '2-digit',
//                 minute: '2-digit',
//                 second: '2-digit'
//               })}`}
//             </p>
            
//             </div>
//           );
//         }
//         return null;
//       }}
//     />
//       <Legend />
//       {chart.yAxisDataKeys.map((yAxis) =>
//         yAxis.dataKeys.map((key) => (
//           <Scatter
//             key={key}
//             dataKey={key}
//             fill={yAxis.color}
//             yAxisId={yAxis.id}
//             name={`${chart.xAxisDataKey} vs ${yAxis.dataKeys}`}
//           />
//         ))
//       )}
//     </ScatterChart>
//   </ResponsiveContainer>
  
//   );
//   const renderBarChart = (chart) => {
//     const latestData = chart.data.slice(-1)[0];
//     const dataKeys = chart.yAxisDataKeys.flatMap((yAxis) => yAxis.dataKeys);
//     const pieData = dataKeys.map((key) => ({
//       name: key,
//       value: latestData ? latestData[key] : 0,
//     }));

//     return (
//       <ResponsiveContainer width="100%" height="100%">
//       <BarChart data={chart.data}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis  
//         dataKey="timestamp"
//         tickFormatter={(tick) => new Date(tick).toLocaleString()} />
//         {chart.yAxisDataKeys.map((yAxis) => (
//           <YAxis
//             key={yAxis.id}
//             yAxisId={yAxis.id}
//             domain={getYAxisDomain(yAxis.range)}
//             stroke={yAxis.color}
//           />
//         ))}
//         <Tooltip
//         cursor={{ strokeDasharray: '3 3' }}
//         content={({ payload }) => {
//           if (payload && payload.length) {
//             const point = payload[0].payload;
//             return (
//               <div className="custom-tooltip">
//                 {chart.yAxisDataKeys.map((yAxis) => (
//                   <p key={yAxis.id}>
//                     {`Y (${yAxis.dataKeys[0]}): ${point[yAxis.dataKeys[0]]}`}
//                   </p>
//                 ))}
//                 <p>
//   {`Timestamp: ${new Date(new Date(point.timestamp).getTime() + (5.5 * 60 * 60 * 1000)).toLocaleString('en-IN', {
//     hour12: true,  // Optional: If you want a 12-hour format with AM/PM
//     weekday: 'short', // Optional: To include the weekday name
//     year: 'numeric',
//     month: 'short',
//     day: 'numeric',
//     hour: '2-digit',
//     minute: '2-digit',
//     second: '2-digit'
//   })}`}
// </p>
//               </div>
//             );
//           }
//           return null;
//         }}
//       />

//         <Legend />
//         {chart.yAxisDataKeys.map((yAxis) =>
//           yAxis.dataKeys.map((key) => (
//             <Bar
//               key={key}
//               dataKey={key}
//               fill={yAxis.color}
//               yAxisId={yAxis.id}
//             />
//           ))
//         )}
//       </BarChart>
//     </ResponsiveContainer>
//     );
//   };
//   const renderPieChart = (chart) => {
//     const latestData = chart.data.slice(-1)[0];
//     const dataKeys = chart.yAxisDataKeys.flatMap((yAxis) => yAxis.dataKeys);
//     const pieData = dataKeys.map((key) => ({
//       name: key,
//       value: latestData ? latestData[key] : 0,
//     }));

//     return (
//       <ResponsiveContainer width="100%" height="100%">
//         <PieChart>
//           <Pie
//             data={pieData}
//             dataKey="value"
//             nameKey="name"
//             outerRadius={120}
//             label
//           >
//             {pieData.map((entry, index) => (
//               <Cell
//                 key={`cell-${index}`}
//                 fill={COLORS[index % COLORS.length]}
//               />
//             ))}
//           </Pie>
//           <Tooltip />
//           <Legend />
//         </PieChart>
//       </ResponsiveContainer>
//     );
//   };
//   return (
//     <>
//       <Box display="flex" justifyContent="flex-end" marginBottom={4}>
//       <h1>Last timestamp Data: {websocketData.timestamp}</h1>
//         <Button variant="contained" onClick={() => setChartDialogOpen(true)}>
//           Add Custom Chart
//         </Button>
//       </Box>

//       <GridLayout
//         className="layout"
//         layout={layout}
//         cols={12}
//         rowHeight={30}
//         width={1910}
//         onLayoutChange={saveLayout}
//         draggableHandle=".drag-handle"
//       >
//         {charts.map((chart) => (
//           <Box
//             key={chart.id}
//             data-grid={
//               layout.find((l) => l.i === chart.id.toString()) || {
//                 x: 0,
//                 y: Infinity,
//                 w: 6,
//                 h: 8,
//               }
//             }
//             sx={{
//               position: "relative",
//               border: "1px solid #ccc",
//               borderRadius: "8px",
//               overflow: "hidden",
//             }}
//           >
//             <Box
//               display="flex"
//               justifyContent="space-between"
//               p={2}
//               sx={{ backgroundColor: colors.primary[400] }}
//             >
//               <IconButton className="drag-handle">
//                 <DragHandleIcon />
//               </IconButton>
//               <Typography variant="h6">{chart.type} Chart</Typography>
//               <IconButton
//                 onClick={() => deleteChart(chart.id)}
//                 style={{ cursor: "pointer" }}
//               >
//                 <DeleteIcon />
//               </IconButton>
//             </Box>
//             <Box sx={{ height: "calc(100% - 80px)" }}>{renderChart(chart)}</Box>
//             <Box
//               display="flex"
//               justifyContent="space-between"
//               p={2}
//               marginTop={-6}
//             >
//               <Button
//                 variant="outlined"
//                 color="secondary"
//                 onClick={() => openDialog(chart)}
//               >
//                 Configure Chart
//               </Button>
//             </Box>
//           </Box>
//         ))}
//       </GridLayout>

//       <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
//         <DialogTitle>Select Chart Type</DialogTitle>
//         <DialogContent>
//           <Box display="flex" flexDirection="column" gap={2}>
//             <Button variant="contained" onClick={() => addCustomChart("Line")}>
//               Add Line Chart
//             </Button>
//             <Button variant="contained" onClick={() => addCustomChart("Bar")}>
//               Add Bar Chart
//             </Button>
//             <Button
//               variant="contained"
//               onClick={() => addCustomChart("Scatter")}
//             >
//               Add Scatter Chart
//             </Button>
//             <Button variant="contained" onClick={() => addCustomChart("XY")}>
//               Add XY Chart
//             </Button>
//             <Button variant="contained" onClick={() => addCustomChart("Pie")}>
//               Add Pie Chart
//             </Button>
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setChartDialogOpen(false)} color="secondary">
//             Cancel
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {tempChartData && (
//         <Dialog
//           open={dialogOpen}
//           onClose={closeDialog}
//           fullWidth
//           maxWidth="md"
//           marginBottom="5px"
//         >
//           <DialogTitle>Configure Chart</DialogTitle>
//           <DialogContent>
//             <Box
//               display="flex"
//               flexDirection="column"
//               maxHeight="400px"
//               overflow="auto"
//             >
//               {tempChartData.type === "XY" && (
//                 <Box marginBottom={2}>
//                   <Typography variant="h6">X-Axis</Typography>
//                   <FormControl margin="normal">
//                     <InputLabel>X-Axis Data Key</InputLabel>
//                     <Select
//                       value={tempChartData.xAxisDataKey}
//                       onChange={handleXAxisDataKeyChange}
//                     >
//                       <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//                       <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
//                       <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
//                       <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
//                       <MenuItem value="CR-LT-011">CR-LT-011</MenuItem>
//                       <MenuItem value="CR-PT-011">CR-PT-011</MenuItem>
//                       <MenuItem value="CR-LT-021">CR-LT-021</MenuItem>
//                       <MenuItem value="CR-PT-021">CR-PT-021</MenuItem>
//                       <MenuItem value="CR-PT-001">CR-PT-001</MenuItem>
//                       <MenuItem value="CR-TT-001">CR-TT-001</MenuItem>
//                       <MenuItem value="CR-FT-001">CR-FT-001</MenuItem>
//                       <MenuItem value="CR-TT-002">CR-TT-002</MenuItem>
//                       <MenuItem value="GS-AT-011">GS-AT-011</MenuItem>
//                       <MenuItem value="GS-AT-012">GS-AT-012</MenuItem>
//                       <MenuItem value="GS-PT-011">GS-PT-011</MenuItem>
//                       <MenuItem value="GS-TT-011">GS-TT-011</MenuItem>
//                       <MenuItem value="GS-AT-022">GS-AT-022</MenuItem>
//                       <MenuItem value="GS-PT-021">GS-PT-021</MenuItem>
//                       <MenuItem value="GS-TT-021">GS-TT-021</MenuItem>
//                       <MenuItem value="PR-TT-001">PR-TT-001</MenuItem>
//                       <MenuItem value="PR-TT-061">PR-TT-061</MenuItem>
//                       <MenuItem value="PR-TT-072">PR-TT-072</MenuItem>
//                       <MenuItem value="PR-FT-001">PR-FT-001</MenuItem>
//                       <MenuItem value="PR-AT-001">PR-AT-001</MenuItem>
//                       <MenuItem value="PR-AT-003">PR-AT-003</MenuItem>
//                       <MenuItem value="PR-AT-005">PR-AT-005</MenuItem>
//                       <MenuItem value="DM-LSH-001">DM-LSH-001</MenuItem>
//                       <MenuItem value="DM-LSL-001">DM-LSL-001</MenuItem>
//                       <MenuItem value="GS-LSL-021">GS-LSL-021</MenuItem>
//                       <MenuItem value="GS-LSL-011">GS-LSL-011</MenuItem>
//                       <MenuItem value="PR-VA-301">PR-VA-301</MenuItem>
//                       <MenuItem value="PR-VA-352">PR-VA-352</MenuItem>
//                       <MenuItem value="PR-VA-312">PR-VA-312</MenuItem>
//                       <MenuItem value="PR-VA-351">PR-VA-351</MenuItem>
//                       <MenuItem value="PR-VA-361Ain">PR-VA-361Ain</MenuItem>
//                       <MenuItem value="PR-VA-361Aout">PR-VA-361Aout</MenuItem>
//                       <MenuItem value="PR-VA-361Bin">PR-VA-361Bin</MenuItem>
//                       <MenuItem value="PR-VA-361Bout">PR-VA-361Bout</MenuItem>
//                       <MenuItem value="PR-VA-362Ain">PR-VA-362Ain</MenuItem>
//                       <MenuItem value="PR-VA-362Aout">PR-VA-362Aout</MenuItem>
//                       <MenuItem value="PR-VA-362Bin">PR-VA-362Bin</MenuItem>
//                       <MenuItem value="PR-VA-362Bout">PR-VA-362Bout</MenuItem>
//                       <MenuItem value="N2-VA-311">N2-VA-311</MenuItem>
//                       <MenuItem value="GS-VA-311">GS-VA-311</MenuItem>
//                       <MenuItem value="GS-VA-312">GS-VA-312</MenuItem>
//                       <MenuItem value="N2-VA-321">N2-VA-321</MenuItem>
//                       <MenuItem value="GS-VA-321">GS-VA-321</MenuItem>
//                       <MenuItem value="GS-VA-322">GS-VA-322</MenuItem>
//                       <MenuItem value="GS-VA-022">GS-VA-022</MenuItem>
//                       <MenuItem value="GS-VA-021">GS-VA-021</MenuItem>
//                       <MenuItem value="AX-VA-351">AX-VA-351</MenuItem>
//                       <MenuItem value="AX-VA-311">AX-VA-311</MenuItem>
//                       <MenuItem value="AX-VA-312">AX-VA-312</MenuItem>
//                       <MenuItem value="AX-VA-321">AX-VA-321</MenuItem>
//                       <MenuItem value="AX-VA-322">AX-VA-322</MenuItem>
//                       <MenuItem value="AX-VA-391">AX-VA-391</MenuItem>
//                       <MenuItem value="DM-VA-301">DM-VA-301</MenuItem>
//                       <MenuItem value="DCDB0-VT-001">DCDB0-VT-001</MenuItem>
//                       <MenuItem value="DCDB0-CT-001">DCDB0-CT-001</MenuItem>
//                       <MenuItem value="DCDB1-VT-001">DCDB1-VT-001</MenuItem>
//                       <MenuItem value="DCDB1-CT-001">DCDB1-CT-001</MenuItem>
//                       <MenuItem value="DCDB2-VT-001">DCDB2-VT-001</MenuItem>
//                       <MenuItem value="DCDB2-CT-001">DCDB2-CT-001</MenuItem>
//                       <MenuItem value="DCDB3-VT-001">DCDB3-VT-001</MenuItem>
//                       <MenuItem value="DCDB3-CT-001">DCDB3-CT-001</MenuItem>
//                       <MenuItem value="DCDB4-VT-001">DCDB4-VT-001</MenuItem>
//                       <MenuItem value="DCDB4-CT-001">DCDB4-CT-001</MenuItem>
//                       <MenuItem value="RECT-CT-001">RECT-CT-001</MenuItem>
//                       <MenuItem value="RECT-VT-001">RECT-VT-001</MenuItem>
//                     </Select>
//                   </FormControl>
//                 </Box>
//               )}
//               {tempChartData.yAxisDataKeys.map((yAxis, index) => (
//                 <Box
//                   key={yAxis.id}
//                   display="flex"
//                   flexDirection="column"
//                   marginBottom={2}
//                 >
//                   <Box
//                     display="flex"
//                     justifyContent="space-between"
//                     alignItems="center"
//                   >
//                     <Typography variant="h6">Y-Axis {index + 1}</Typography>
//                     <IconButton onClick={() => deleteYAxis(yAxis.id)}>
//                       <DeleteIcon />
//                     </IconButton>
//                   </Box>
//                   <FormControl fullWidth margin="normal">
//                     <InputLabel>Data Keys</InputLabel>
//                     <Select
//                       multiple
//                       value={yAxis.dataKeys}
//                       onChange={(event) => handleDataKeyChange(yAxis.id, event)}
//                     >
//                       <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//                       <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
//                       <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
//                       <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
//                       <MenuItem value="CR-LT-011">CR-LT-011</MenuItem>
//                       <MenuItem value="CR-PT-011">CR-PT-011</MenuItem>
//                       <MenuItem value="CR-LT-021">CR-LT-021</MenuItem>
//                       <MenuItem value="CR-PT-021">CR-PT-021</MenuItem>
//                       <MenuItem value="CR-PT-001">CR-PT-001</MenuItem>
//                       <MenuItem value="CR-TT-001">CR-TT-001</MenuItem>
//                       <MenuItem value="CR-FT-001">CR-FT-001</MenuItem>
//                       <MenuItem value="CR-TT-002">CR-TT-002</MenuItem>
//                       <MenuItem value="GS-AT-011">GS-AT-011</MenuItem>
//                       <MenuItem value="GS-AT-012">GS-AT-012</MenuItem>
//                       <MenuItem value="GS-PT-011">GS-PT-011</MenuItem>
//                       <MenuItem value="GS-TT-011">GS-TT-011</MenuItem>
//                       <MenuItem value="GS-AT-022">GS-AT-022</MenuItem>
//                       <MenuItem value="GS-PT-021">GS-PT-021</MenuItem>
//                       <MenuItem value="GS-TT-021">GS-TT-021</MenuItem>
//                       <MenuItem value="PR-TT-001">PR-TT-001</MenuItem>
//                       <MenuItem value="PR-TT-061">PR-TT-061</MenuItem>
//                       <MenuItem value="PR-TT-072">PR-TT-072</MenuItem>
//                       <MenuItem value="PR-FT-001">PR-FT-001</MenuItem>
//                       <MenuItem value="PR-AT-001">PR-AT-001</MenuItem>
//                       <MenuItem value="PR-AT-003">PR-AT-003</MenuItem>
//                       <MenuItem value="PR-AT-005">PR-AT-005</MenuItem>
//                       <MenuItem value="DM-LSH-001">DM-LSH-001</MenuItem>
//                       <MenuItem value="DM-LSL-001">DM-LSL-001</MenuItem>
//                       <MenuItem value="GS-LSL-021">GS-LSL-021</MenuItem>
//                       <MenuItem value="GS-LSL-011">GS-LSL-011</MenuItem>
//                       <MenuItem value="PR-VA-301">PR-VA-301</MenuItem>
//                       <MenuItem value="PR-VA-352">PR-VA-352</MenuItem>
//                       <MenuItem value="PR-VA-312">PR-VA-312</MenuItem>
//                       <MenuItem value="PR-VA-351">PR-VA-351</MenuItem>
//                       <MenuItem value="PR-VA-361Ain">PR-VA-361Ain</MenuItem>
//                       <MenuItem value="PR-VA-361Aout">PR-VA-361Aout</MenuItem>
//                       <MenuItem value="PR-VA-361Bin">PR-VA-361Bin</MenuItem>
//                       <MenuItem value="PR-VA-361Bout">PR-VA-361Bout</MenuItem>
//                       <MenuItem value="PR-VA-362Ain">PR-VA-362Ain</MenuItem>
//                       <MenuItem value="PR-VA-362Aout">PR-VA-362Aout</MenuItem>
//                       <MenuItem value="PR-VA-362Bin">PR-VA-362Bin</MenuItem>
//                       <MenuItem value="PR-VA-362Bout">PR-VA-362Bout</MenuItem>
//                       <MenuItem value="N2-VA-311">N2-VA-311</MenuItem>
//                       <MenuItem value="GS-VA-311">GS-VA-311</MenuItem>
//                       <MenuItem value="GS-VA-312">GS-VA-312</MenuItem>
//                       <MenuItem value="N2-VA-321">N2-VA-321</MenuItem>
//                       <MenuItem value="GS-VA-321">GS-VA-321</MenuItem>
//                       <MenuItem value="GS-VA-322">GS-VA-322</MenuItem>
//                       <MenuItem value="GS-VA-022">GS-VA-022</MenuItem>
//                       <MenuItem value="GS-VA-021">GS-VA-021</MenuItem>
//                       <MenuItem value="AX-VA-351">AX-VA-351</MenuItem>
//                       <MenuItem value="AX-VA-311">AX-VA-311</MenuItem>
//                       <MenuItem value="AX-VA-312">AX-VA-312</MenuItem>
//                       <MenuItem value="AX-VA-321">AX-VA-321</MenuItem>
//                       <MenuItem value="AX-VA-322">AX-VA-322</MenuItem>
//                       <MenuItem value="AX-VA-391">AX-VA-391</MenuItem>
//                       <MenuItem value="DM-VA-301">DM-VA-301</MenuItem>
//                       <MenuItem value="DCDB0-VT-001">DCDB0-VT-001</MenuItem>
//                       <MenuItem value="DCDB0-CT-001">DCDB0-CT-001</MenuItem>
//                       <MenuItem value="DCDB1-VT-001">DCDB1-VT-001</MenuItem>
//                       <MenuItem value="DCDB1-CT-001">DCDB1-CT-001</MenuItem>
//                       <MenuItem value="DCDB2-VT-001">DCDB2-VT-001</MenuItem>
//                       <MenuItem value="DCDB2-CT-001">DCDB2-CT-001</MenuItem>
//                       <MenuItem value="DCDB3-VT-001">DCDB3-VT-001</MenuItem>
//                       <MenuItem value="DCDB3-CT-001">DCDB3-CT-001</MenuItem>
//                       <MenuItem value="DCDB4-VT-001">DCDB4-VT-001</MenuItem>
//                       <MenuItem value="DCDB4-CT-001">DCDB4-CT-001</MenuItem>
//                       <MenuItem value="RECT-CT-001">RECT-CT-001</MenuItem>
//                       <MenuItem value="RECT-VT-001">RECT-VT-001</MenuItem>
//                     </Select>
//                   </FormControl>
//                   <FormControl fullWidth margin="normal">
//                     <InputLabel>Range</InputLabel>
//                     <Select
//                       value={yAxis.range}
//                       onChange={(event) => handleRangeChange(yAxis.id, event)}
//                     >
//                       <MenuItem value="0-500">0-500</MenuItem>
//                       <MenuItem value="0-100">0-100</MenuItem>
//                       <MenuItem value="0-10">0-10</MenuItem>
//                     </Select>
//                   </FormControl>
//                   <FormControl fullWidth margin="normal">
//                     <InputLabel>Line Style</InputLabel>
//                     <Select
//                       value={yAxis.lineStyle}
//                       onChange={(event) =>
//                         handleLineStyleChange(yAxis.id, event)
//                       }
//                     >
//                       <MenuItem value="solid">Solid</MenuItem>
//                       <MenuItem value="dotted">Dotted</MenuItem>
//                       <MenuItem value="dashed">Dashed</MenuItem>
//                       <MenuItem value="dot-dash">Dot Dash</MenuItem>
//                       <MenuItem value="dash-dot-dot">Dash Dot Dot</MenuItem>
//                     </Select>
//                   </FormControl>
//                   <Button onClick={() => openColorPicker(yAxis.id)}>
//                   Select Color
//                 </Button>
//                 {colorPickerOpen && selectedYAxisId === yAxis.id && (
//                   <SketchPicker
//                     color={yAxis.color}
//                     onChangeComplete={handleColorChange}
//                   />
//                 )}
//                 </Box>
//               ))}
//               <Button variant="contained" color="secondary" onClick={addYAxis}>
//                 Add Y-Axis
//               </Button>
//             </Box>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={closeDialog} color="secondary">
//               Cancel
//             </Button>
//             <Button onClick={saveConfiguration} color="primary">
//               Save
//             </Button>
//           </DialogActions>
//         </Dialog>
//       )}
//     </>
//   );
// };

// export default CustomCharts;




// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   setLayout,
//   addChart,
//   removeChart,
//   updateChart,
// } from "../../redux/layoutActions";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   ScatterChart,
//   Scatter,
//   PieChart,
//   Pie,
//   Cell,
// } from "recharts";
// import GridLayout from "react-grid-layout";
// import {
//   Box,
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   Typography,
//   IconButton,
//   InputLabel,
//   FormControl,
//   Select,
//   MenuItem,
//   useTheme,
// } from "@mui/material";
// import DeleteIcon from "@mui/icons-material/Delete";
// import DragHandleIcon from "@mui/icons-material/DragHandle";
// import { debounce } from "lodash";
// import { tokens } from "../../theme";
// import { useWebSocket } from "src/WebSocketProvider";
// // Colors for the chart
// const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
// const Max_data_point = 20;

// const CustomCharts = () => {
//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);


//   const dispatch = useDispatch();
//   const charts = useSelector((state) => state.layout.customCharts);
//   const layout = useSelector((state) => state.layout.customChartsLayout);
//   const [chartDialogOpen, setChartDialogOpen] = useState(false);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [tempChartData, setTempChartData] = useState(null);

//   const websocketData = useWebSocket();
//   // Load saved charts and layout when the component mounts
//   useEffect(() => {
//     const savedCharts = JSON.parse(localStorage.getItem("customCharts")) || [];
//     const savedLayout =
//       JSON.parse(localStorage.getItem("customChartsLayout")) || [];
//     if (!charts.length) {
//       dispatch(setLayout(savedLayout, "custom"));
//       savedCharts.forEach((chart) => dispatch(addChart(chart, "custom")));
//     }
//   }, [dispatch, charts.length]);

//   // Save layout changes (debounced to avoid excessive dispatches)
//   const saveLayout = debounce((newLayout) => {
//     dispatch(setLayout(newLayout, "custom"));
//     localStorage.setItem("customChartsLayout", JSON.stringify(newLayout));
//   }, 500);

//   // Add a new custom chart of the specified type
//   const addCustomChart = (type) => {
//     const newChartId = Date.now();
//     const newChart = {
//       id: newChartId,
//       type,
//       data: [], // Initially empty, will be populated via WebSocket
//       xAxisDataKey: "timestamp",
//       yAxisDataKeys: [
//         {
//           id: "left-0",
//           dataKeys: ["AX-LT-011"],
//           range: "0-500",
//           color: "#FF0000",
//           lineStyle: "solid",
//         },
//       ],
//     };
//     dispatch(addChart(newChart, "custom"));
//     saveLayout([
//       ...layout,
//       { i: newChartId.toString(), x: 0, y: Infinity, w: 6, h: 8 },
//     ]);
//     setChartDialogOpen(false);
//   };

//   // Remove a chart and update layout accordingly
//   const deleteChart = (chartId) => {
//     dispatch(removeChart(chartId, "custom"));
//     saveLayout(layout.filter((l) => l.i !== chartId.toString()));
//   };

//   // Open the configuration dialog for a specific chart
//   const openDialog = (chart) => {
//     setTempChartData(chart);
//     setDialogOpen(true);
//   };

//   // Save configuration changes to Redux and close the dialog
//   const saveConfiguration = () => {
//     if (tempChartData) {
//       dispatch(updateChart(tempChartData, "custom"));
//       setDialogOpen(false);
//     }
//   };

//   // WebSocket connection and data handling
//   useEffect(() => {
//     const ws = new WebSocket(
//       "wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/"
//     );
  
//     ws.onmessage = (event) => {
//       const message = JSON.parse(event.data);
  
//       const updatedCharts = charts.map((chart) => {
//         if (
//           chart.yAxisDataKeys.some((yAxis) =>
//             yAxis.dataKeys.includes("AX-LT-011")
//           )
//         ) {
//           // Append new data point
//           const newData = [...chart.data, message];
          
//           // Ensure we only keep the latest Max_data_point data points
//           const limitedData = newData.slice(-Max_data_point); // Keep only the last Max_data_point data points
          
//           return {
//             ...chart,
//             data: limitedData, // Update the chart with the limited data
//           };
//         }
//         return chart;
//       });
  
//       updatedCharts.forEach((chart) => dispatch(updateChart(chart, "custom")));
//     };
  
//     ws.onclose = () => console.log("WebSocket connection closed");
  
//     return () => ws.close(); // Clean up on component unmount
//   }, [charts, dispatch]);

//   const closeDialog = () => setDialogOpen(false);

//   const handleDataKeyChange = (yAxisId, event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
//         yAxis.id === yAxisId ? { ...yAxis, dataKeys: value } : yAxis
//       ),
//     }));
//   };

//   const handleXAxisDataKeyChange = (event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       xAxisDataKey: value,
//     }));
//   };

//   const handleLineStyleChange = (yAxisId, event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
//         yAxis.id === yAxisId ? { ...yAxis, lineStyle: value } : yAxis
//       ),
//     }));
//   };

//   const handleRangeChange = (yAxisId, event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
//         yAxis.id === yAxisId ? { ...yAxis, range: value } : yAxis
//       ),
//     }));
//   };

//   const addYAxis = () => {
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: [
//         ...prevChart.yAxisDataKeys,
//         {
//           id: `left-${prevChart.yAxisDataKeys.length}`,
//           dataKeys: [],
//           range: "0-500",
//           color: "#FF0000",
//           lineStyle: "solid",
//         },
//       ],
//     }));
//   };

//   const deleteYAxis = (yAxisId) => {
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.filter(
//         (yAxis) => yAxis.id !== yAxisId
//       ),
//     }));
//   };

//   const getYAxisDomain = (range) => {
//     switch (range) {
//       case "0-500":
//         return [0, 500];
//       case "0-100":
//         return [0, 100];
//       case "0-10":
//         return [0, 10];
//       default:
//         return [0, 500];
//     }
//   };

//   const getLineStyle = (lineStyle) => {
//     switch (lineStyle) {
//       case "solid":
//         return "";
//       case "dotted":
//         return "1 1";
//       case "dashed":
//         return "5 5";
//       case "dot-dash":
//         return "3 3 1 3";
//       case "dash-dot-dot":
//         return "3 3 1 1 1 3";
//       default:
//         return "";
//     }
//   };
//   const renderChart = (chart) => {
//     switch (chart.type) {
//       case "Line":
//         return renderLineChart(chart);
//       case "Bar":
//         return renderBarChart(chart);
//       case "Scatter":
//         return renderScatterChart(chart);
//       case "XY":
//         return renderXYChart(chart);
//       case "Pie":
//         return renderPieChart(chart);
//       default:
//         return null;
//     }
//   };

//   const renderLineChart = (chart) => (
//     <ResponsiveContainer width="100%" height="100%">
//       <LineChart data={chart.data}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis
//         dataKey="timestamp"
//         tickFormatter={(tick) => new Date(tick).toLocaleString()}
//         />
//         {chart.yAxisDataKeys.map((yAxis) => (
//           <YAxis
//             key={yAxis.id}
//             yAxisId={yAxis.id}
//             domain={getYAxisDomain(yAxis.range)}
//             stroke={yAxis.color}
//           />
//         ))}
//         <Tooltip
//         cursor={{ strokeDasharray: '3 3' }}
//         content={({ payload }) => {
//           if (payload && payload.length) {
//             const point = payload[0].payload;
//             return (
//               <div className="custom-tooltip">
//                 {chart.yAxisDataKeys.map((yAxis) => (
                  
//                   <p key={yAxis.id}>
//                     {`Y (${yAxis.dataKeys[0]}): ${point[yAxis.dataKeys[0]]}`}
//                   </p>
//                 ))}
//                 <p>
//                 {`Timestamp: ${new Date(new Date(point.timestamp).getTime() + (5.5 * 60 * 60 * 1000)).toLocaleString('en-IN', {
//                   hour12: true,  // Optional: If you want a 12-hour format with AM/PM
//                   weekday: 'short', // Optional: To include the weekday name
//                   year: 'numeric',
//                   month: 'short',
//                   day: 'numeric',
//                   hour: '2-digit',
//                   minute: '2-digit',
//                   second: '2-digit'
//                 })}`}
//               </p>
              
              

//               </div>
//             );
//           }
//           return null;
//         }}
//       />
//         {chart.yAxisDataKeys.map((yAxis) =>
//           yAxis.dataKeys.map((key) => (
//             <Line
//               key={key}
//               type="monotone"
//               dataKey={key}
//               stroke={yAxis.color}
//               strokeDasharray={getLineStyle(yAxis.lineStyle)}
//               yAxisId={yAxis.id}
//             />
//           ))
//         )}
//       </LineChart>
//     </ResponsiveContainer>
//   );



//   const renderScatterChart = (chart) => (
//     <ResponsiveContainer width="100%" height="100%">
//       <ScatterChart data={chart.data}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis 
//         dataKey="timestamp"
//         tickFormatter={(tick) => new Date(tick).toLocaleString()}
//         />
//         {chart.yAxisDataKeys.map((yAxis) => (
//           <YAxis
//             key={yAxis.id}
//             yAxisId={yAxis.id}
//             domain={getYAxisDomain(yAxis.range)}
//             stroke={yAxis.color}
//           />
//         ))}
//         <Tooltip
//         cursor={{ strokeDasharray: '3 3' }}
//         content={({ payload }) => {
//           if (payload && payload.length) {
//             const point = payload[0].payload;
//             return (
//               <div className="custom-tooltip">
                
//                 {chart.yAxisDataKeys.map((yAxis) => (
//                   <p key={yAxis.id}>
//                     {`Y (${yAxis.dataKeys[0]}): ${point[yAxis.dataKeys[0]]}`}
//                   </p>
//                 ))}
//                 <p>
//   {`Timestamp: ${new Date(new Date(point.timestamp).getTime() + (5.5 * 60 * 60 * 1000)).toLocaleString('en-IN', {
//     hour12: true,  // Optional: If you want a 12-hour format with AM/PM
//     weekday: 'short', // Optional: To include the weekday name
//     year: 'numeric',
//     month: 'short',
//     day: 'numeric',
//     hour: '2-digit',
//     minute: '2-digit',
//     second: '2-digit'
//   })}`}
// </p>

//               </div>
//             );
//           }
//           return null;
//         }}
//       />
//         <Legend />
//         {chart.yAxisDataKeys.map((yAxis) =>
//           yAxis.dataKeys.map((key) => (
//             <Scatter
//               key={key}
//               dataKey={key}
//               fill={yAxis.color}
//               yAxisId={yAxis.id}
//             />
//           ))
//         )}
//       </ScatterChart>
//     </ResponsiveContainer>
//   );

//   const renderXYChart = (chart) => (
//     <ResponsiveContainer width="100%" height="100%">
//     <ScatterChart data={chart.data}>
//       <CartesianGrid strokeDasharray="3 3" />
//       <XAxis
//         dataKey={chart.xAxisDataKey}
//         type="number"
//         domain={["auto", "auto"]} // Automatically adjust the domain based on data
//         tickFormatter={(value) => value.toFixed(4)}
//       />
//       {chart.yAxisDataKeys.map((yAxis) => (
//         <YAxis
//           key={yAxis.id}
//           dataKey={chart.yAxisDataKey}
//           yAxisId={yAxis.id}
//           domain={yAxis.range ? yAxis.range : ["auto", "auto"]} // Automatically adjust if no range is specified
//           stroke={yAxis.color}
//           tickFormatter={(value) => value.toFixed(4)}
//         />
//       ))}
//       <Tooltip
//       cursor={{ strokeDasharray: '3 3' }}
//       content={({ payload }) => {
//         if (payload && payload.length) {
//           const point = payload[0].payload;
//           return (
//             <div className="custom-tooltip">
//               <p>{`X (${chart.xAxisDataKey}): ${point[chart.xAxisDataKey]}`}</p>
//               {chart.yAxisDataKeys.map((yAxis) => (
//                 <p key={yAxis.id}>
//                   {`Y (${yAxis.dataKeys[0]}): ${point[yAxis.dataKeys[0]]}`}
//                 </p>
//               ))}
//               <p>
//               {`Timestamp: ${new Date(new Date(point.timestamp).getTime() + (5.5 * 60 * 60 * 1000)).toLocaleString('en-IN', {
//                 hour12: true,  // Optional: If you want a 12-hour format with AM/PM
//                 weekday: 'short', // Optional: To include the weekday name
//                 year: 'numeric',
//                 month: 'short',
//                 day: 'numeric',
//                 hour: '2-digit',
//                 minute: '2-digit',
//                 second: '2-digit'
//               })}`}
//             </p>
            
//             </div>
//           );
//         }
//         return null;
//       }}
//     />
//       <Legend />
//       {chart.yAxisDataKeys.map((yAxis) =>
//         yAxis.dataKeys.map((key) => (
//           <Scatter
//             key={key}
//             dataKey={key}
//             fill={yAxis.color}
//             yAxisId={yAxis.id}
//             name={`${chart.xAxisDataKey} vs ${yAxis.dataKeys}`}
//           />
//         ))
//       )}
//     </ScatterChart>
//   </ResponsiveContainer>
  
//   );
//   const renderBarChart = (chart) => {
//     const latestData = chart.data.slice(-1)[0];
//     const dataKeys = chart.yAxisDataKeys.flatMap((yAxis) => yAxis.dataKeys);
//     const pieData = dataKeys.map((key) => ({
//       name: key,
//       value: latestData ? latestData[key] : 0,
//     }));

//     return (
//       <ResponsiveContainer width="100%" height="100%">
//       <BarChart data={chart.data}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis  
//         dataKey="timestamp"
//         tickFormatter={(tick) => new Date(tick).toLocaleString()} />
//         {chart.yAxisDataKeys.map((yAxis) => (
//           <YAxis
//             key={yAxis.id}
//             yAxisId={yAxis.id}
//             domain={getYAxisDomain(yAxis.range)}
//             stroke={yAxis.color}
//           />
//         ))}
//         <Tooltip
//         cursor={{ strokeDasharray: '3 3' }}
//         content={({ payload }) => {
//           if (payload && payload.length) {
//             const point = payload[0].payload;
//             return (
//               <div className="custom-tooltip">
//                 {chart.yAxisDataKeys.map((yAxis) => (
//                   <p key={yAxis.id}>
//                     {`Y (${yAxis.dataKeys[0]}): ${point[yAxis.dataKeys[0]]}`}
//                   </p>
//                 ))}
//                 <p>
//   {`Timestamp: ${new Date(new Date(point.timestamp).getTime() + (5.5 * 60 * 60 * 1000)).toLocaleString('en-IN', {
//     hour12: true,  // Optional: If you want a 12-hour format with AM/PM
//     weekday: 'short', // Optional: To include the weekday name
//     year: 'numeric',
//     month: 'short',
//     day: 'numeric',
//     hour: '2-digit',
//     minute: '2-digit',
//     second: '2-digit'
//   })}`}
// </p>
//               </div>
//             );
//           }
//           return null;
//         }}
//       />

//         <Legend />
//         {chart.yAxisDataKeys.map((yAxis) =>
//           yAxis.dataKeys.map((key) => (
//             <Bar
//               key={key}
//               dataKey={key}
//               fill={yAxis.color}
//               yAxisId={yAxis.id}
//             />
//           ))
//         )}
//       </BarChart>
//     </ResponsiveContainer>
//     );
//   };
//   const renderPieChart = (chart) => {
//     const latestData = chart.data.slice(-1)[0];
//     const dataKeys = chart.yAxisDataKeys.flatMap((yAxis) => yAxis.dataKeys);
//     const pieData = dataKeys.map((key) => ({
//       name: key,
//       value: latestData ? latestData[key] : 0,
//     }));

//     return (
//       <ResponsiveContainer width="100%" height="100%">
//         <PieChart>
//           <Pie
//             data={pieData}
//             dataKey="value"
//             nameKey="name"
//             outerRadius={120}
//             label
//           >
//             {pieData.map((entry, index) => (
//               <Cell
//                 key={`cell-${index}`}
//                 fill={COLORS[index % COLORS.length]}
//               />
//             ))}
//           </Pie>
//           <Tooltip />
//           <Legend />
//         </PieChart>
//       </ResponsiveContainer>
//     );
//   };
//   return (
//     <>
//       <Box display="flex" justifyContent="flex-end" marginBottom={4}>
//       <h1>Last timestamp Data: {websocketData["PLC-TIME-STAMP"]}</h1>
//         <Button variant="contained" onClick={() => setChartDialogOpen(true)}>
//           Add Custom Chart
//         </Button>
//       </Box>

//       <GridLayout
//         className="layout"
//         layout={layout}
//         cols={12}
//         rowHeight={30}
//         width={1910}
//         onLayoutChange={saveLayout}
//         draggableHandle=".drag-handle"
//       >
//         {charts.map((chart) => (
//           <Box
//             key={chart.id}
//             data-grid={
//               layout.find((l) => l.i === chart.id.toString()) || {
//                 x: 0,
//                 y: Infinity,
//                 w: 6,
//                 h: 8,
//               }
//             }
//             sx={{
//               position: "relative",
//               border: "1px solid #ccc",
//               borderRadius: "8px",
//               overflow: "hidden",
//             }}
//           >
//             <Box
//               display="flex"
//               justifyContent="space-between"
//               p={2}
//               sx={{ backgroundColor: colors.primary[400] }}
//             >
//               <IconButton className="drag-handle">
//                 <DragHandleIcon />
//               </IconButton>
//               <Typography variant="h6">{chart.type} Chart</Typography>
//               <IconButton
//                 onClick={() => deleteChart(chart.id)}
//                 style={{ cursor: "pointer" }}
//               >
//                 <DeleteIcon />
//               </IconButton>
//             </Box>
//             <Box sx={{ height: "calc(100% - 80px)" }}>{renderChart(chart)}</Box>
//             <Box
//               display="flex"
//               justifyContent="space-between"
//               p={2}
//               marginTop={-6}
//             >
//               <Button
//                 variant="outlined"
//                 color="secondary"
//                 onClick={() => openDialog(chart)}
//               >
//                 Configure Chart
//               </Button>
//             </Box>
//           </Box>
//         ))}
//       </GridLayout>

//       <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
//         <DialogTitle>Select Chart Type</DialogTitle>
//         <DialogContent>
//           <Box display="flex" flexDirection="column" gap={2}>
//             <Button variant="contained" onClick={() => addCustomChart("Line")}>
//               Add Line Chart
//             </Button>
//             <Button variant="contained" onClick={() => addCustomChart("Bar")}>
//               Add Bar Chart
//             </Button>
//             <Button
//               variant="contained"
//               onClick={() => addCustomChart("Scatter")}
//             >
//               Add Scatter Chart
//             </Button>
//             <Button variant="contained" onClick={() => addCustomChart("XY")}>
//               Add XY Chart
//             </Button>
//             <Button variant="contained" onClick={() => addCustomChart("Pie")}>
//               Add Pie Chart
//             </Button>
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setChartDialogOpen(false)} color="secondary">
//             Cancel
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {tempChartData && (
//         <Dialog
//           open={dialogOpen}
//           onClose={closeDialog}
//           fullWidth
//           maxWidth="md"
//           marginBottom="5px"
//         >
//           <DialogTitle>Configure Chart</DialogTitle>
//           <DialogContent>
//             <Box
//               display="flex"
//               flexDirection="column"
//               maxHeight="400px"
//               overflow="auto"
//             >
//               {tempChartData.type === "XY" && (
//                 <Box marginBottom={2}>
//                   <Typography variant="h6">X-Axis</Typography>
//                   <FormControl margin="normal">
//                     <InputLabel>X-Axis Data Key</InputLabel>
//                     <Select
//                       value={tempChartData.xAxisDataKey}
//                       onChange={handleXAxisDataKeyChange}
//                     >
//                       <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//                       <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
//                       <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
//                       <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
//                       <MenuItem value="CR-LT-011">CR-LT-011</MenuItem>
//                       <MenuItem value="CR-PT-011">CR-PT-011</MenuItem>
//                       <MenuItem value="CR-LT-021">CR-LT-021</MenuItem>
//                       <MenuItem value="CR-PT-021">CR-PT-021</MenuItem>
//                       <MenuItem value="CR-PT-001">CR-PT-001</MenuItem>
//                       <MenuItem value="CR-TT-001">CR-TT-001</MenuItem>
//                       <MenuItem value="CR-FT-001">CR-FT-001</MenuItem>
//                       <MenuItem value="CR-TT-002">CR-TT-002</MenuItem>
//                       <MenuItem value="GS-AT-011">GS-AT-011</MenuItem>
//                       <MenuItem value="GS-AT-012">GS-AT-012</MenuItem>
//                       <MenuItem value="GS-PT-011">GS-PT-011</MenuItem>
//                       <MenuItem value="GS-TT-011">GS-TT-011</MenuItem>
//                       <MenuItem value="GS-AT-022">GS-AT-022</MenuItem>
//                       <MenuItem value="GS-PT-021">GS-PT-021</MenuItem>
//                       <MenuItem value="GS-TT-021">GS-TT-021</MenuItem>
//                       <MenuItem value="PR-TT-001">PR-TT-001</MenuItem>
//                       <MenuItem value="PR-TT-061">PR-TT-061</MenuItem>
//                       <MenuItem value="PR-TT-072">PR-TT-072</MenuItem>
//                       <MenuItem value="PR-FT-001">PR-FT-001</MenuItem>
//                       <MenuItem value="PR-AT-001">PR-AT-001</MenuItem>
//                       <MenuItem value="PR-AT-003">PR-AT-003</MenuItem>
//                       <MenuItem value="PR-AT-005">PR-AT-005</MenuItem>
//                       <MenuItem value="DM-LSH-001">DM-LSH-001</MenuItem>
//                       <MenuItem value="DM-LSL-001">DM-LSL-001</MenuItem>
//                       <MenuItem value="GS-LSL-021">GS-LSL-021</MenuItem>
//                       <MenuItem value="GS-LSL-011">GS-LSL-011</MenuItem>
//                       <MenuItem value="PR-VA-301">PR-VA-301</MenuItem>
//                       <MenuItem value="PR-VA-352">PR-VA-352</MenuItem>
//                       <MenuItem value="PR-VA-312">PR-VA-312</MenuItem>
//                       <MenuItem value="PR-VA-351">PR-VA-351</MenuItem>
//                       <MenuItem value="PR-VA-361Ain">PR-VA-361Ain</MenuItem>
//                       <MenuItem value="PR-VA-361Aout">PR-VA-361Aout</MenuItem>
//                       <MenuItem value="PR-VA-361Bin">PR-VA-361Bin</MenuItem>
//                       <MenuItem value="PR-VA-361Bout">PR-VA-361Bout</MenuItem>
//                       <MenuItem value="PR-VA-362Ain">PR-VA-362Ain</MenuItem>
//                       <MenuItem value="PR-VA-362Aout">PR-VA-362Aout</MenuItem>
//                       <MenuItem value="PR-VA-362Bin">PR-VA-362Bin</MenuItem>
//                       <MenuItem value="PR-VA-362Bout">PR-VA-362Bout</MenuItem>
//                       <MenuItem value="N2-VA-311">N2-VA-311</MenuItem>
//                       <MenuItem value="GS-VA-311">GS-VA-311</MenuItem>
//                       <MenuItem value="GS-VA-312">GS-VA-312</MenuItem>
//                       <MenuItem value="N2-VA-321">N2-VA-321</MenuItem>
//                       <MenuItem value="GS-VA-321">GS-VA-321</MenuItem>
//                       <MenuItem value="GS-VA-322">GS-VA-322</MenuItem>
//                       <MenuItem value="GS-VA-022">GS-VA-022</MenuItem>
//                       <MenuItem value="GS-VA-021">GS-VA-021</MenuItem>
//                       <MenuItem value="AX-VA-351">AX-VA-351</MenuItem>
//                       <MenuItem value="AX-VA-311">AX-VA-311</MenuItem>
//                       <MenuItem value="AX-VA-312">AX-VA-312</MenuItem>
//                       <MenuItem value="AX-VA-321">AX-VA-321</MenuItem>
//                       <MenuItem value="AX-VA-322">AX-VA-322</MenuItem>
//                       <MenuItem value="AX-VA-391">AX-VA-391</MenuItem>
//                       <MenuItem value="DM-VA-301">DM-VA-301</MenuItem>
//                       <MenuItem value="DCDB0-VT-001">DCDB0-VT-001</MenuItem>
//                       <MenuItem value="DCDB0-CT-001">DCDB0-CT-001</MenuItem>
//                       <MenuItem value="DCDB1-VT-001">DCDB1-VT-001</MenuItem>
//                       <MenuItem value="DCDB1-CT-001">DCDB1-CT-001</MenuItem>
//                       <MenuItem value="DCDB2-VT-001">DCDB2-VT-001</MenuItem>
//                       <MenuItem value="DCDB2-CT-001">DCDB2-CT-001</MenuItem>
//                       <MenuItem value="DCDB3-VT-001">DCDB3-VT-001</MenuItem>
//                       <MenuItem value="DCDB3-CT-001">DCDB3-CT-001</MenuItem>
//                       <MenuItem value="DCDB4-VT-001">DCDB4-VT-001</MenuItem>
//                       <MenuItem value="DCDB4-CT-001">DCDB4-CT-001</MenuItem>
//                       <MenuItem value="RECT-CT-001">RECT-CT-001</MenuItem>
//                       <MenuItem value="RECT-VT-001">RECT-VT-001</MenuItem>
//                     </Select>
//                   </FormControl>
//                 </Box>
//               )}
//               {tempChartData.yAxisDataKeys.map((yAxis, index) => (
//                 <Box
//                   key={yAxis.id}
//                   display="flex"
//                   flexDirection="column"
//                   marginBottom={2}
//                 >
//                   <Box
//                     display="flex"
//                     justifyContent="space-between"
//                     alignItems="center"
//                   >
//                     <Typography variant="h6">Y-Axis {index + 1}</Typography>
//                     <IconButton onClick={() => deleteYAxis(yAxis.id)}>
//                       <DeleteIcon />
//                     </IconButton>
//                   </Box>
//                   <FormControl fullWidth margin="normal">
//                     <InputLabel>Data Keys</InputLabel>
//                     <Select
//                       multiple
//                       value={yAxis.dataKeys}
//                       onChange={(event) => handleDataKeyChange(yAxis.id, event)}
//                     >
//                       <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//                       <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
//                       <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
//                       <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
//                       <MenuItem value="CR-LT-011">CR-LT-011</MenuItem>
//                       <MenuItem value="CR-PT-011">CR-PT-011</MenuItem>
//                       <MenuItem value="CR-LT-021">CR-LT-021</MenuItem>
//                       <MenuItem value="CR-PT-021">CR-PT-021</MenuItem>
//                       <MenuItem value="CR-PT-001">CR-PT-001</MenuItem>
//                       <MenuItem value="CR-TT-001">CR-TT-001</MenuItem>
//                       <MenuItem value="CR-FT-001">CR-FT-001</MenuItem>
//                       <MenuItem value="CR-TT-002">CR-TT-002</MenuItem>
//                       <MenuItem value="GS-AT-011">GS-AT-011</MenuItem>
//                       <MenuItem value="GS-AT-012">GS-AT-012</MenuItem>
//                       <MenuItem value="GS-PT-011">GS-PT-011</MenuItem>
//                       <MenuItem value="GS-TT-011">GS-TT-011</MenuItem>
//                       <MenuItem value="GS-AT-022">GS-AT-022</MenuItem>
//                       <MenuItem value="GS-PT-021">GS-PT-021</MenuItem>
//                       <MenuItem value="GS-TT-021">GS-TT-021</MenuItem>
//                       <MenuItem value="PR-TT-001">PR-TT-001</MenuItem>
//                       <MenuItem value="PR-TT-061">PR-TT-061</MenuItem>
//                       <MenuItem value="PR-TT-072">PR-TT-072</MenuItem>
//                       <MenuItem value="PR-FT-001">PR-FT-001</MenuItem>
//                       <MenuItem value="PR-AT-001">PR-AT-001</MenuItem>
//                       <MenuItem value="PR-AT-003">PR-AT-003</MenuItem>
//                       <MenuItem value="PR-AT-005">PR-AT-005</MenuItem>
//                       <MenuItem value="DM-LSH-001">DM-LSH-001</MenuItem>
//                       <MenuItem value="DM-LSL-001">DM-LSL-001</MenuItem>
//                       <MenuItem value="GS-LSL-021">GS-LSL-021</MenuItem>
//                       <MenuItem value="GS-LSL-011">GS-LSL-011</MenuItem>
//                       <MenuItem value="PR-VA-301">PR-VA-301</MenuItem>
//                       <MenuItem value="PR-VA-352">PR-VA-352</MenuItem>
//                       <MenuItem value="PR-VA-312">PR-VA-312</MenuItem>
//                       <MenuItem value="PR-VA-351">PR-VA-351</MenuItem>
//                       <MenuItem value="PR-VA-361Ain">PR-VA-361Ain</MenuItem>
//                       <MenuItem value="PR-VA-361Aout">PR-VA-361Aout</MenuItem>
//                       <MenuItem value="PR-VA-361Bin">PR-VA-361Bin</MenuItem>
//                       <MenuItem value="PR-VA-361Bout">PR-VA-361Bout</MenuItem>
//                       <MenuItem value="PR-VA-362Ain">PR-VA-362Ain</MenuItem>
//                       <MenuItem value="PR-VA-362Aout">PR-VA-362Aout</MenuItem>
//                       <MenuItem value="PR-VA-362Bin">PR-VA-362Bin</MenuItem>
//                       <MenuItem value="PR-VA-362Bout">PR-VA-362Bout</MenuItem>
//                       <MenuItem value="N2-VA-311">N2-VA-311</MenuItem>
//                       <MenuItem value="GS-VA-311">GS-VA-311</MenuItem>
//                       <MenuItem value="GS-VA-312">GS-VA-312</MenuItem>
//                       <MenuItem value="N2-VA-321">N2-VA-321</MenuItem>
//                       <MenuItem value="GS-VA-321">GS-VA-321</MenuItem>
//                       <MenuItem value="GS-VA-322">GS-VA-322</MenuItem>
//                       <MenuItem value="GS-VA-022">GS-VA-022</MenuItem>
//                       <MenuItem value="GS-VA-021">GS-VA-021</MenuItem>
//                       <MenuItem value="AX-VA-351">AX-VA-351</MenuItem>
//                       <MenuItem value="AX-VA-311">AX-VA-311</MenuItem>
//                       <MenuItem value="AX-VA-312">AX-VA-312</MenuItem>
//                       <MenuItem value="AX-VA-321">AX-VA-321</MenuItem>
//                       <MenuItem value="AX-VA-322">AX-VA-322</MenuItem>
//                       <MenuItem value="AX-VA-391">AX-VA-391</MenuItem>
//                       <MenuItem value="DM-VA-301">DM-VA-301</MenuItem>
//                       <MenuItem value="DCDB0-VT-001">DCDB0-VT-001</MenuItem>
//                       <MenuItem value="DCDB0-CT-001">DCDB0-CT-001</MenuItem>
//                       <MenuItem value="DCDB1-VT-001">DCDB1-VT-001</MenuItem>
//                       <MenuItem value="DCDB1-CT-001">DCDB1-CT-001</MenuItem>
//                       <MenuItem value="DCDB2-VT-001">DCDB2-VT-001</MenuItem>
//                       <MenuItem value="DCDB2-CT-001">DCDB2-CT-001</MenuItem>
//                       <MenuItem value="DCDB3-VT-001">DCDB3-VT-001</MenuItem>
//                       <MenuItem value="DCDB3-CT-001">DCDB3-CT-001</MenuItem>
//                       <MenuItem value="DCDB4-VT-001">DCDB4-VT-001</MenuItem>
//                       <MenuItem value="DCDB4-CT-001">DCDB4-CT-001</MenuItem>
//                       <MenuItem value="RECT-CT-001">RECT-CT-001</MenuItem>
//                       <MenuItem value="RECT-VT-001">RECT-VT-001</MenuItem>
//                     </Select>
//                   </FormControl>
//                   <FormControl fullWidth margin="normal">
//                     <InputLabel>Range</InputLabel>
//                     <Select
//                       value={yAxis.range}
//                       onChange={(event) => handleRangeChange(yAxis.id, event)}
//                     >
//                       <MenuItem value="0-500">0-500</MenuItem>
//                       <MenuItem value="0-100">0-100</MenuItem>
//                       <MenuItem value="0-10">0-10</MenuItem>
//                     </Select>
//                   </FormControl>
//                   <FormControl fullWidth margin="normal">
//                     <InputLabel>Line Style</InputLabel>
//                     <Select
//                       value={yAxis.lineStyle}
//                       onChange={(event) =>
//                         handleLineStyleChange(yAxis.id, event)
//                       }
//                     >
//                       <MenuItem value="solid">Solid</MenuItem>
//                       <MenuItem value="dotted">Dotted</MenuItem>
//                       <MenuItem value="dashed">Dashed</MenuItem>
//                       <MenuItem value="dot-dash">Dot Dash</MenuItem>
//                       <MenuItem value="dash-dot-dot">Dash Dot Dot</MenuItem>
//                     </Select>
//                   </FormControl>
//                 </Box>
//               ))}
//               <Button variant="contained" color="secondary" onClick={addYAxis}>
//                 Add Y-Axis
//               </Button>
//             </Box>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={closeDialog} color="secondary">
//               Cancel
//             </Button>
//             <Button onClick={saveConfiguration} color="primary">
//               Save
//             </Button>
//           </DialogActions>
//         </Dialog>
//       )}
//     </>
//   );
// };

// export default CustomCharts;

// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   setLayout,
//   addChart,
//   removeChart,
//   updateChart,
// } from "../../redux/layoutActions";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   ScatterChart,
//   Scatter,
//   PieChart,
//   Pie,
//   Cell,
// } from "recharts";
// import GridLayout from "react-grid-layout";
// import {
//   Box,
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Typography,
//   IconButton,
// } from "@mui/material";
// import DeleteIcon from "@mui/icons-material/Delete";
// import DragHandleIcon from "@mui/icons-material/DragHandle";
// import { SketchPicker } from "react-color";
// import "react-grid-layout/css/styles.css";
// import "react-resizable/css/styles.css";
// import { debounce } from "lodash";
// import { useWebSocket } from "src/WebSocketProvider";
// const MAX_DATA_POINTS = 10; // Maximum data points to display per chart
// const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

// const CustomCharts = () => {
//   const dispatch = useDispatch();
//   const charts = useSelector((state) => state.layout.customCharts);
//   const layout = useSelector((state) => state.layout.customChartsLayout);
//   const [chartDialogOpen, setChartDialogOpen] = useState(false);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [tempChartData, setTempChartData] = useState(null);
//   const websocketData = useWebSocket(); // Real-time data from WebSocket
//   // Update chart data in Redux as new WebSocket data arrives
//   useEffect(() => {
//     if (websocketData) {
//       charts.forEach((chart) => {
//         const newDataPoint = { timestamp: Date.now(), ...websocketData };
//         let updatedData;

//         if (["Line", "Scatter", "XY"].includes(chart.type)) {
//           updatedData = [...(chart.data || []), newDataPoint].slice(-MAX_DATA_POINTS);
//         } else {
//           updatedData = [newDataPoint];
//         }

//         dispatch(
//           updateChart(
//             { ...chart, data: updatedData },
//             "custom"
//           )
//         );
//       });
//     }
//   }, [websocketData, charts, dispatch]);

//   // Load saved charts and layout when the component mounts
//   useEffect(() => {
//     const savedCharts = JSON.parse(localStorage.getItem("customCharts")) || [];
//     const savedLayout = JSON.parse(localStorage.getItem("customChartsLayout")) || [];
//     if (!charts.length) {
//       dispatch(setLayout(savedLayout, "custom"));
//       savedCharts.forEach((chart) => dispatch(addChart(chart, "custom")));
//     }
//   }, [dispatch, charts.length]);

//   // Save layout changes (debounced to avoid excessive dispatches)
//   const saveLayout = debounce((newLayout) => {
//     dispatch(setLayout(newLayout, "custom"));
//     localStorage.setItem("customChartsLayout", JSON.stringify(newLayout));
//   }, 500);

//   // Add a new custom chart of the specified type
//   const addCustomChart = (type) => {
//     const newChartId = Date.now();
//     const newChart = {
//       id: newChartId,
//       type,
//       data: [],
//       xAxisDataKey: "",
//       yAxisDataKeys: [
//         {
//           id: "left-0",
//           dataKeys: ["AX-LT-011"],
//           range: "0-500",
//           color: "#FF0000",
//           lineStyle: "solid",
//         },
//       ],
//     };
//     dispatch(addChart(newChart, "custom"));
//     saveLayout([...layout, { i: newChartId.toString(), x: 0, y: Infinity, w: 6, h: 8 }]);
//     setChartDialogOpen(false);
//   };

//   // Remove a chart and update layout accordingly
//   const deleteChart = (chartId) => {
//     dispatch(removeChart(chartId, "custom"));
//     saveLayout(layout.filter((l) => l.i !== chartId.toString()));
//   };

//   // Open the configuration dialog for a specific chart
//   const openDialog = (chart) => {
//     setTempChartData(chart);
//     setDialogOpen(true);
//   };

//   // Save configuration changes to Redux and close the dialog
//   const saveConfiguration = () => {
//     if (tempChartData) {
//       dispatch(updateChart(tempChartData, "custom"));
//       setDialogOpen(false);
//     }
//   };

//   const closeDialog = () => setDialogOpen(false);

//   const handleDataKeyChange = (yAxisId, event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
//         yAxis.id === yAxisId ? { ...yAxis, dataKeys: value } : yAxis
//       ),
//     }));
//   };

//   const handleXAxisDataKeyChange = (event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       xAxisDataKey: value,
//     }));
//   };

//   const handleLineStyleChange = (yAxisId, event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
//         yAxis.id === yAxisId ? { ...yAxis, lineStyle: value } : yAxis
//       ),
//     }));
//   };

//   const handleRangeChange = (yAxisId, event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
//         yAxis.id === yAxisId ? { ...yAxis, range: value } : yAxis
//       ),
//     }));
//   };

//   const addYAxis = () => {
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: [
//         ...prevChart.yAxisDataKeys,
//         {
//           id: `left-${prevChart.yAxisDataKeys.length}`,
//           dataKeys: [],
//           range: "0-500",
//           color: "#FF0000",
//           lineStyle: "solid",
//         },
//       ],
//     }));
//   };

//   const deleteYAxis = (yAxisId) => {
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.filter(
//         (yAxis) => yAxis.id !== yAxisId
//       ),
//     }));
//   };

//   const getYAxisDomain = (range) => {
//     switch (range) {
//       case "0-500":
//         return [0, 500];
//       case "0-100":
//         return [0, 100];
//       case "0-10":
//         return [0, 10];
//       default:
//         return [0, 500];
//     }
//   };

//   const getLineStyle = (lineStyle) => {
//     switch (lineStyle) {
//       case "solid":
//         return "";
//       case "dotted":
//         return "1 1";
//       case "dashed":
//         return "5 5";
//       case "dot-dash":
//         return "3 3 1 3";
//       case "dash-dot-dot":
//         return "3 3 1 1 1 3";
//       default:
//         return "";
//     }
//   };

//   // Render chart based on type (Line, Bar, Scatter, etc.)
//   const renderChart = (chart) => {
//     switch (chart.type) {
//       case "Line":
//         return renderLineChart(chart);
//       case "Bar":
//         return renderBarChart(chart);
//       case "Scatter":
//         return renderScatterChart(chart);
//       case "Pie":
//         return renderPieChart(chart);
//       default:
//         return null;
//     }
//   };

//   const renderLineChart = (chart) => (
//     <ResponsiveContainer width="100%" height="100%">
//       <LineChart data={chart.data}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey="timestamp" />
//         {chart.yAxisDataKeys.map((yAxis) => (
//           <YAxis key={yAxis.id} yAxisId={yAxis.id} domain={[0, 500]} stroke={yAxis.color} />
//         ))}
//         <Tooltip />
//         <Legend />
//         {chart.yAxisDataKeys.map((yAxis) =>
//           yAxis.dataKeys.map((key) => (
//             <Line key={key} type="monotone" dataKey={key} stroke={yAxis.color} yAxisId={yAxis.id} />
//           ))
//         )}
//       </LineChart>
//     </ResponsiveContainer>
//   );

//   const renderBarChart = (chart) => (
//     <ResponsiveContainer width="100%" height="100%">
//       <BarChart data={chart.data}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey="timestamp" />
//         {chart.yAxisDataKeys.map((yAxis) => (
//           <YAxis key={yAxis.id} yAxisId={yAxis.id} domain={[0, 500]} stroke={yAxis.color} />
//         ))}
//         <Tooltip />
//         <Legend />
//         {chart.yAxisDataKeys.map((yAxis) =>
//           yAxis.dataKeys.map((key) => (
//             <Bar key={key} dataKey={key} fill={yAxis.color} yAxisId={yAxis.id} />
//           ))
//         )}
//       </BarChart>
//     </ResponsiveContainer>
//   );

//   const renderScatterChart = (chart) => (
//     <ResponsiveContainer width="100%" height="100%">
//       <ScatterChart>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey="timestamp" />
//         {chart.yAxisDataKeys.map((yAxis) => (
//           <YAxis key={yAxis.id} yAxisId={yAxis.id} domain={[0, 500]} stroke={yAxis.color} />
//         ))}
//         <Tooltip />
//         <Legend />
//         {chart.yAxisDataKeys.map((yAxis) =>
//           yAxis.dataKeys.map((key) => (
//             <Scatter key={key} dataKey={key} fill={yAxis.color} yAxisId={yAxis.id} />
//           ))
//         )}
//       </ScatterChart>
//     </ResponsiveContainer>
//   );

//   const renderPieChart = (chart) => {
//     const latestData = chart.data.slice(-1)[0];
//     const dataKeys = chart.yAxisDataKeys.flatMap((yAxis) => yAxis.dataKeys);
//     const pieData = dataKeys.map((key) => ({
//       name: key,
//       value: latestData ? latestData[key] : 0,
//     }));

//     return (
//       <ResponsiveContainer width="100%" height="100%">
//         <PieChart>
//           <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={150} label>
//             {pieData.map((entry, index) => (
//               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//             ))}
//           </Pie>
//           <Tooltip />
//           <Legend />
//         </PieChart>
//       </ResponsiveContainer>
//     );
//   };

//   return (
//     <>
//       <Box display="flex" justifyContent="flex-end" marginBottom={4}>
//         <Button variant="contained" onClick={() => setChartDialogOpen(true)}>
//           Add Custom Chart
//         </Button>
//       </Box>

//       <GridLayout
//         className="layout"
//         layout={layout}
//         cols={12}
//         rowHeight={30}
//         width={1200}
//         onLayoutChange={(newLayout) => saveLayout(newLayout)}
//         draggableHandle=".drag-handle"
//         isResizable
//       >
//         {charts.map((chart) => (
//           <Box key={chart.id} data-grid={layout.find((l) => l.i === chart.id.toString()) || { x: 0, y: Infinity, w: 6, h: 8 }}>
//             <Box display="flex" justifyContent="space-between" p={2}>
//               <IconButton className="drag-handle">
//                 <DragHandleIcon />
//               </IconButton>
//               <Typography variant="h6">{chart.type} Chart</Typography>
//               <IconButton onClick={() => deleteChart(chart.id)}>
//                 <DeleteIcon />
//               </IconButton>
//             </Box>
//             {renderChart(chart)}
//             <Button variant="outlined" onClick={() => openDialog(chart)}>
//               Configure
//             </Button>
//           </Box>
//         ))}
//       </GridLayout>

//       <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
//         <DialogTitle>Select Chart Type</DialogTitle>
//         <DialogContent>
//           <Button onClick={() => addCustomChart("Line")}>Line Chart</Button>
//           <Button onClick={() => addCustomChart("Bar")}>Bar Chart</Button>
//           <Button onClick={() => addCustomChart("Scatter")}>Scatter Chart</Button>
//           <Button onClick={() => addCustomChart("Pie")}>Pie Chart</Button>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setChartDialogOpen(false)}>Cancel</Button>
//         </DialogActions>
//       </Dialog>

//       {tempChartData && (
//         <Dialog
//           open={dialogOpen}
//           onClose={closeDialog}
//           fullWidth
//           maxWidth="md"
//           marginBottom="5px"
//         >
//           <DialogTitle>Configure Chart</DialogTitle>
//           <DialogContent>
//             <Box
//               display="flex"
//               flexDirection="column"
//               maxHeight="400px"
//               overflow="auto"
//             >
//               {tempChartData.type === "XY" && (
//                 <Box marginBottom={2}>
//                   <Typography variant="h6">X-Axis</Typography>
//                   <FormControl margin="normal">
//                     <InputLabel>X-Axis Data Key</InputLabel>
//                     <Select
//                       value={tempChartData.xAxisDataKey}
//                       onChange={handleXAxisDataKeyChange}
//                     >
//                     <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//                     <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
//                     </Select>
//                   </FormControl>
//                 </Box>
//               )}
//               {tempChartData.yAxisDataKeys.map((yAxis, index) => (
//                 <Box
//                   key={yAxis.id}
//                   display="flex"
//                   flexDirection="column"
//                   marginBottom={2}
//                 >
//                   <Box
//                     display="flex"
//                     justifyContent="space-between"
//                     alignItems="center"
//                   >
//                     <Typography variant="h6">Y-Axis {index + 1}</Typography>
//                     <IconButton onClick={() => deleteYAxis(yAxis.id)}>
//                       <DeleteIcon />
//                     </IconButton>
//                   </Box>
//                   <FormControl fullWidth margin="normal">
//                     <InputLabel>Data Keys</InputLabel>
//                     <Select
//                       multiple
//                       value={yAxis.dataKeys}
//                       onChange={(event) => handleDataKeyChange(yAxis.id, event)}
//                     >
//                     <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//                     <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
//                     </Select>
//                   </FormControl>
//                   <FormControl fullWidth margin="normal">
//                     <InputLabel>Range</InputLabel>
//                     <Select
//                       value={yAxis.range}
//                       onChange={(event) => handleRangeChange(yAxis.id, event)}
//                     >
//                       <MenuItem value="0-500">0-500</MenuItem>
//                       <MenuItem value="0-100">0-100</MenuItem>
//                       <MenuItem value="0-10">0-10</MenuItem>
//                     </Select>
//                   </FormControl>
//                   <FormControl fullWidth margin="normal">
//                     <InputLabel>Line Style</InputLabel>
//                     <Select
//                       value={yAxis.lineStyle}
//                       onChange={(event) =>
//                         handleLineStyleChange(yAxis.id, event)
//                       }
//                     >
//                       <MenuItem value="solid">Solid</MenuItem>
//                       <MenuItem value="dotted">Dotted</MenuItem>
//                       <MenuItem value="dashed">Dashed</MenuItem>
//                       <MenuItem value="dot-dash">Dot Dash</MenuItem>
//                       <MenuItem value="dash-dot-dot">Dash Dot Dot</MenuItem>
//                     </Select>
//                   </FormControl>

//                 </Box>
//               ))}
//               <Button variant="contained" color="secondary" onClick={addYAxis}>
//                 Add Y-Axis
//               </Button>
//             </Box>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={closeDialog} color="secondary">
//               Cancel
//             </Button>
//             <Button onClick={saveConfiguration} color="primary">
//               Save
//             </Button>
//           </DialogActions>
//         </Dialog>
//       )}

//     </>
//   );
// };

// export default CustomCharts;

// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   setLayout,
//   addChart,
//   removeChart,
//   updateChart,
// } from "../../redux/layoutActions";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   ScatterChart,
//   Scatter,
//   PieChart,
//   Pie,
//   Cell,
// } from "recharts";
// import GridLayout from "react-grid-layout";
// import {
//   Box,
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Typography,
//   IconButton,
// } from "@mui/material";
// import DeleteIcon from "@mui/icons-material/Delete";
// import DragHandleIcon from "@mui/icons-material/DragHandle";
// import { SketchPicker } from "react-color";
// import "react-grid-layout/css/styles.css";
// import "react-resizable/css/styles.css";
// import { debounce } from "lodash";
// const COLORS = [
//   "#0088FE",
//   "#00C49F",
//   "#FFBB28",
//   "#FF8042",
//   "#FF8045",
//   "#FF8142",
//   "#FF8242",
// ];
// const CustomCharts = () => {
//   const dispatch = useDispatch();
//   const charts = useSelector((state) => state.layout.customCharts);
//   const layout = useSelector((state) => state.layout.customChartsLayout);
//   const [chartDialogOpen, setChartDialogOpen] = useState(false);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [tempChartData, setTempChartData] = useState(null);
//   const [colorPickerOpen, setColorPickerOpen] = useState(false);
//   const [selectedYAxisId, setSelectedYAxisId] = useState(null);

//   // Load saved charts and layout when the component mounts
//   useEffect(() => {
//     const savedCharts = JSON.parse(localStorage.getItem("customCharts")) || [];
//     const savedLayout = JSON.parse(localStorage.getItem("customChartsLayout")) || [];
//     if (!charts.length) {
//       dispatch(setLayout(savedLayout, "custom"));
//       savedCharts.forEach((chart) => dispatch(addChart(chart, "custom")));
//     }
//   }, [dispatch, charts.length]);

//   // Save layout changes (debounced to avoid excessive dispatches)
//   const saveLayout = debounce((newLayout) => {
//     dispatch(setLayout(newLayout, "custom"));
//     localStorage.setItem("customChartsLayout", JSON.stringify(newLayout));
//   }, 500);

//   // Add a new custom chart of the specified type
//   const addCustomChart = (type) => {
//     const newChartId = Date.now();
//     const newChart = {
//       id: newChartId,
//       type,
//       data: [],
//       xAxisDataKey: "",
//       yAxisDataKeys: [
//         {
//           id: "left-0",
//           dataKeys: ["AX-LT-011"],
//           range: "0-500",
//           color: "#FF0000",
//           lineStyle: "solid",
//         },
//       ],
//     };
//     dispatch(addChart(newChart, "custom"));
//     saveLayout([...layout, { i: newChartId.toString(), x: 0, y: Infinity, w: 6, h: 8 }]);
//     setChartDialogOpen(false);
//   };

//   // Remove a chart and update layout accordingly
//   const deleteChart = (chartId) => {
//     dispatch(removeChart(chartId, "custom"));
//     saveLayout(layout.filter((l) => l.i !== chartId.toString()));
//   };

//   // Open the configuration dialog for a specific chart
//   const openDialog = (chart) => {
//     setTempChartData(chart);
//     setDialogOpen(true);
//   };

//   // Save configuration changes to Redux and close the dialog
//   const saveConfiguration = () => {
//     if (tempChartData) {
//       dispatch(updateChart(tempChartData, "custom"));
//       setDialogOpen(false);
//     }
//   };

//   // Render chart based on type (Line, Bar, Scatter, etc.)
//   const renderChart = (chart) => {
//     switch (chart.type) {
//       case "Line":
//         return renderLineChart(chart);
//       case "Bar":
//         return renderBarChart(chart);
//       case "Scatter":
//         return renderScatterChart(chart);
//       case "Pie":
//         return renderPieChart(chart);
//       default:
//         return null;
//     }
//   };

//   const renderLineChart = (chart) => (
//     <ResponsiveContainer width="100%" height="100%">
//       <LineChart data={chart.data}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey="timestamp" />
//         {chart.yAxisDataKeys.map((yAxis) => (
//           <YAxis key={yAxis.id} yAxisId={yAxis.id} domain={[0, 500]} stroke={yAxis.color} />
//         ))}
//         <Tooltip />
//         <Legend />
//         {chart.yAxisDataKeys.map((yAxis) =>
//           yAxis.dataKeys.map((key) => (
//             <Line key={key} type="monotone" dataKey={key} stroke={yAxis.color} yAxisId={yAxis.id} />
//           ))
//         )}
//       </LineChart>
//     </ResponsiveContainer>
//   );

//   const renderBarChart = (chart) => (
//     <ResponsiveContainer width="100%" height="100%">
//       <BarChart data={chart.data}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey="timestamp" />
//         {chart.yAxisDataKeys.map((yAxis) => (
//           <YAxis key={yAxis.id} yAxisId={yAxis.id} domain={[0, 500]} stroke={yAxis.color} />
//         ))}
//         <Tooltip />
//         <Legend />
//         {chart.yAxisDataKeys.map((yAxis) =>
//           yAxis.dataKeys.map((key) => (
//             <Bar key={key} dataKey={key} fill={yAxis.color} yAxisId={yAxis.id} />
//           ))
//         )}
//       </BarChart>
//     </ResponsiveContainer>
//   );

//   const renderScatterChart = (chart) => (
//     <ResponsiveContainer width="100%" height="100%">
//       <ScatterChart>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey="timestamp" />
//         {chart.yAxisDataKeys.map((yAxis) => (
//           <YAxis key={yAxis.id} yAxisId={yAxis.id} domain={[0, 500]} stroke={yAxis.color} />
//         ))}
//         <Tooltip />
//         <Legend />
//         {chart.yAxisDataKeys.map((yAxis) =>
//           yAxis.dataKeys.map((key) => (
//             <Scatter key={key} dataKey={key} fill={yAxis.color} yAxisId={yAxis.id} />
//           ))
//         )}
//       </ScatterChart>
//     </ResponsiveContainer>
//   );

//   const renderPieChart = (chart) => {
//     const latestData = chart.data.slice(-1)[0];
//     const dataKeys = chart.yAxisDataKeys.flatMap((yAxis) => yAxis.dataKeys);
//     const pieData = dataKeys.map((key) => ({
//       name: key,
//       value: latestData ? latestData[key] : 0,
//     }));

//     return (
//       <ResponsiveContainer width="100%" height="100%">
//         <PieChart>
//           <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={150} label>
//             {pieData.map((entry, index) => (
//               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//             ))}
//           </Pie>
//           <Tooltip />
//           <Legend />
//         </PieChart>
//       </ResponsiveContainer>
//     );
//   };

//   return (
//     <>
//       <Box display="flex" justifyContent="flex-end" marginBottom={4}>
//         <Button variant="contained" onClick={() => setChartDialogOpen(true)}>
//           Add Custom Chart
//         </Button>
//       </Box>

//       <GridLayout
//         className="layout"
//         layout={layout}
//         cols={12}
//         rowHeight={30}
//         width={1200}
//         onLayoutChange={(newLayout) => saveLayout(newLayout)}
//         draggableHandle=".drag-handle"
//         isResizable
//       >
//         {charts.map((chart) => (
//           <Box key={chart.id} data-grid={layout.find((l) => l.i === chart.id.toString()) || { x: 0, y: Infinity, w: 6, h: 8 }}>
//             <Box display="flex" justifyContent="space-between" p={2}>
//               <IconButton className="drag-handle">
//                 <DragHandleIcon />
//               </IconButton>
//               <Typography variant="h6">{chart.type} Chart</Typography>
//               <IconButton onClick={() => deleteChart(chart.id)}>
//                 <DeleteIcon />
//               </IconButton>
//             </Box>
//             {renderChart(chart)}
//             <Button variant="outlined" onClick={() => openDialog(chart)}>Configure Chart</Button>
//           </Box>
//         ))}
//       </GridLayout>

//       <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
//         <DialogTitle>Select Chart Type</DialogTitle>
//         <DialogContent>
//           <Button variant="contained" onClick={() => addCustomChart("Line")}>Line Chart</Button>
//           <Button variant="contained" onClick={() => addCustomChart("Bar")}>Bar Chart</Button>
//           <Button variant="contained" onClick={() => addCustomChart("Scatter")}>Scatter Chart</Button>
//           <Button variant="contained" onClick={() => addCustomChart("Pie")}>Pie Chart</Button>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setChartDialogOpen(false)}>Cancel</Button>
//         </DialogActions>
//       </Dialog>

//       {tempChartData && (
//         <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="md">
//           <DialogTitle>Configure Chart</DialogTitle>
//           <DialogContent>
//             {/* Configuration fields for tempChartData, including Y-Axis settings */}
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
//             <Button onClick={saveConfiguration}>Save</Button>
//           </DialogActions>
//         </Dialog>
//       )}
//     </>
//   );
// };

// export default CustomCharts;

// import React, { useState, useEffect, useRef } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import GridLayout from "react-grid-layout";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   Brush,
// } from "recharts";
// import {
//   Box,
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Typography,
//   IconButton,
//   Grid,
//   TextField,
//   RadioGroup,
//   FormControlLabel,
//   Radio,
// } from "@mui/material";
// import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
// import { SketchPicker } from "react-color";
// import DeleteIcon from "@mui/icons-material/Delete";
// import DragHandleIcon from "@mui/icons-material/DragHandle";
// import axios from "axios";
// import { debounce } from "lodash";
// import {parseISO,
//   format,
//   subMinutes,
//   subHours,
//   subDays,
//   subWeeks,
//   subMonths,
// } from "date-fns";
// import { setLayout, addChart, removeChart, updateChart } from "../../redux/layoutActions";

// const HistoricalCharts = () => {
//   const [chartData, setChartData] = useState({});
//   const [tempChartData, setTempChartData] = useState(null);
//   const [chartDialogOpen, setChartDialogOpen] = useState(false);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [selectedYAxisId, setSelectedYAxisId] = useState(null);
//   const [dateDialogOpen, setDateDialogOpen] = useState(false);
//   const [chartDateRanges, setChartDateRanges] = useState({});
//   const [mode, setMode] = useState("B");
//   const [currentChartId, setCurrentChartId] = useState(null);
//   const wsClientRefs = useRef({});
//   const [colorPickerOpen, setColorPickerOpen] = useState(false);

//   const dispatch = useDispatch();
//   const layout = useSelector((state) => state.layout.historicalLayout) || JSON.parse(localStorage.getItem("historicalChartsLayout")) || [];
//   const charts = useSelector((state) => state.layout.historicalCharts) || JSON.parse(localStorage.getItem("historicalCharts")) || [];

//   useEffect(() => {
//     if (!layout.length) {
//       const savedLayout = JSON.parse(localStorage.getItem("historicalChartsLayout")) || [];
//       dispatch(setLayout(savedLayout, "historical"));
//     }
//   }, [dispatch, layout.length]);

//   const saveLayout = debounce((newLayout) => {
//     dispatch(setLayout(newLayout, "historical"));
//     localStorage.setItem("historicalChartsLayout", JSON.stringify(newLayout));
//   }, 500);

//   const addCustomChart = () => {
//     const newChartId = Date.now();
//     const newChart = {
//       id: newChartId,
//       type: "Line",
//       xAxisDataKey: "timestamp",
//       yAxisDataKeys: [
//         {
//           id: "left-0",
//           dataKeys: ["AX-LT-011"],
//           range: "0-500",
//           color: "#FF0000",
//           lineStyle: "solid",
//         },
//       ],
//     };
//     dispatch(addChart(newChart, "historical"));
//     const updatedLayout = [...layout, { i: newChartId.toString(), x: 0, y: Infinity, w: 6, h: 8 }];
//     dispatch(setLayout(updatedLayout, "historical"));
//     localStorage.setItem("historicalChartsLayout", JSON.stringify(updatedLayout));
//   };

//   const deleteChart = (chartId) => {
//     dispatch(removeChart(chartId, "historical"));
//     const updatedLayout = layout.filter((l) => l.i !== chartId.toString());
//     dispatch(setLayout(updatedLayout, "historical"));
//     localStorage.setItem("historicalChartsLayout", JSON.stringify(updatedLayout));
//   };

//   const saveConfiguration = () => {
//     if (tempChartData) {
//       dispatch(updateChart(tempChartData, "historical"));
//       setDialogOpen(false);
//     }
//   };

//   const handleTimeRangeChange = (chartId, value) => {
//     let start;
//     switch (value) {
//       case "1_minute":
//         start = subMinutes(new Date(), 1);
//         break;
//       case "30_minutes":
//         start = subMinutes(new Date(), 30);
//         break;
//       case "1_hour":
//         start = subHours(new Date(), 1);
//         break;
//       case "6_hours":
//         start = subHours(new Date(), 6);
//         break;
//       case "12_hours":
//         start = subHours(new Date(), 12);
//         break;
//       case "1_day":
//         start = subDays(new Date(), 1);
//         break;
//       case "2_day":
//         start = subDays(new Date(), 2);
//         break;
//       case "1_week":
//         start = subWeeks(new Date(), 1);
//         break;
//       case "1_month":
//         start = subMonths(new Date(), 1);
//         break;
//       default:
//         start = subMinutes(new Date(), 1);
//     }

//     setChartDateRanges((prevRanges) => ({
//       ...prevRanges,
//       [chartId]: { startDate: start, endDate: new Date() },
//     }));
//   };

//   const fetchChartData = async (chartId) => {
//     const { startDate, endDate } = chartDateRanges[chartId] || {};
//     if (!startDate) return;
//     try {
//       const formattedStartDate = format(startDate, "yyyy-MM-dd'T'HH:mm");
//       const formattedEndDate = mode === "C" ? format(new Date(), "yyyy-MM-dd'T'HH:mm") : format(endDate, "yyyy-MM-dd'T'HH:mm");

//       const response = await axios.post("https://xdeuid6slkki7yxz4zhdbqbzfq0hirkk.lambda-url.us-east-1.on.aws/", { start_time: formattedStartDate, end_time: formattedEndDate });
//       const parsedBody = JSON.parse(response.data.body);
//       const fetchedData = parsedBody.data.map((item) => ({
//         timestamp: item[0],
//         "AX-LT-011": item[1],
//         "AX-LT-021": item[2],
//       }));

//       setChartData((prevData) => ({ ...prevData, [chartId]: fetchedData }));

//       if (mode === "C") {
//         setupRealTimeWebSocket(chartId);
//       }
//     } catch (error) {
//       console.error("Error fetching data from the API:", error);
//     }
//   };

//   const setupRealTimeWebSocket = (chartId) => {
//     if (wsClientRefs.current[chartId]) {
//       wsClientRefs.current[chartId].close();
//     }

//     wsClientRefs.current[chartId] = new WebSocket(
//       "wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/"
//     );

//     wsClientRefs.current[chartId].onopen = () => {
//       console.log(`WebSocket connection established for chart ${chartId}`);
//     };

//     wsClientRefs.current[chartId].onmessage = (message) => {
//       try {
//         const receivedData = JSON.parse(message.data);
//         const newData = {
//           timestamp: parseISO(receivedData["PLC-TIME-STAMP"]) || new Date(),
//           "AX-LT-011": receivedData["AX-LT-011"] || null,
//           "AX-LT-021": receivedData["AX-LT-021"] || null,
//           "CW-TT-011": receivedData["CW-TT-011"] || null,
//         };

//         setChartData((prevData) => ({
//           ...prevData,
//           [chartId]: [...(prevData[chartId] || []), newData],
//         }));
//       } catch (error) {
//         console.error("Error processing WebSocket message:", error);
//       }
//     };

//     wsClientRefs.current[chartId].onclose = (event) => {
//       console.error(`WebSocket disconnected for chart ${chartId}. Reconnecting...`);
//       setTimeout(() => setupRealTimeWebSocket(chartId), 1000);
//     };
//   };

//   const handleRangeChange = (yAxisId, event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
//         yAxis.id === yAxisId ? { ...yAxis, range: value } : yAxis
//       ),
//     }));
//   };
//   const deleteYAxis = (yAxisId) => {
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.filter(
//         (yAxis) => yAxis.id !== yAxisId
//       ),
//     }));
//   };

//   const handleDataKeyChange = (yAxisId, event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
//         yAxis.id === yAxisId ? { ...yAxis, dataKeys: value } : yAxis
//       ),
//     }));
//   };
//   const openColorPicker = (yAxisId) => {
//     setSelectedYAxisId(yAxisId);
//     setColorPickerOpen(true);
//   };
//   const openDialog = (chart) => {
//     setTempChartData(chart);
//     setDialogOpen(true);
//   };

//   const handleLineStyleChange = (yAxisId, event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
//         yAxis.id === yAxisId ? { ...yAxis, lineStyle: value } : yAxis
//       ),
//     }));
//   };
//   const handleColorChange = (color) => {
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
//         yAxis.id === selectedYAxisId ? { ...yAxis, color: color.hex } : yAxis
//       ),
//     }));
//     setColorPickerOpen(false);
//   };

//   const renderLineChart = (chart) => (
//     <Box sx={{ width: "100%", height: "100%" }}>
//       <LineChart width={600} height={300} data={chartData[chart.id] || []}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey="timestamp" tickFormatter={(tick) => new Date(tick).toLocaleString()} />
//         {chart.yAxisDataKeys.map((yAxis) => (
//           <YAxis key={yAxis.id} yAxisId={yAxis.id} domain={getYAxisDomain(yAxis.range)} stroke={yAxis.color} />
//         ))}
//         <Tooltip />
//         <Legend />
//         {chart.yAxisDataKeys.map((yAxis) =>
//           yAxis.dataKeys.map((key) => (
//             <Line key={key} type="monotone" dataKey={key} stroke={yAxis.color} strokeDasharray={getLineStyle(yAxis.lineStyle)} yAxisId={yAxis.id} />
//           ))
//         )}
//         <Brush height={30} dataKey="timestamp" stroke="#8884d8" />
//       </LineChart>
//     </Box>
//   );

//   const getYAxisDomain = (range) => {
//     switch (range) {
//       case "0-500":
//         return [0, 500];
//       case "0-100":
//         return [0, 100];
//       case "0-10":
//         return [0, 10];
//       default:
//         return [0, 500];
//     }
//   };

//   const getLineStyle = (lineStyle) => {
//     switch (lineStyle) {
//       case "solid":
//         return "";
//       case "dotted":
//         return "1 1";
//       case "dashed":
//         return "5 5";
//       case "dot-dash":
//         return "3 3 1 3";
//       case "dash-dot-dot":
//         return "3 3 1 1 1 3";
//       default:
//         return "";
//     }
//   };

//   const handleDateRangeApply = () => {
//     setDateDialogOpen(false);
//     fetchChartData(currentChartId);
//   };

//   const renderChart = (chart) => (
//     <Box>
//       {renderLineChart(chart)}
//       <Box display="flex" justifyContent="space-around" mt={2} gap={2}>
//         <Button variant="contained" color="secondary" onClick={() => setTempChartData(chart) || setDialogOpen(true)}>Configure Chart</Button>
//         <Button variant="contained" color="secondary" onClick={() => setCurrentChartId(chart.id) || setDateDialogOpen(true)}>Choose Date Range</Button>
//       </Box>
//     </Box>
//   );

//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       <Box display="flex" justifyContent="flex-end" marginBottom={4}>
//         <Button variant="contained" color="secondary" onClick={() => setChartDialogOpen(true)}>Add Realtime Historical Chart</Button>
//       </Box>
//       <GridLayout
//         className="layout"
//         layout={layout}
//         cols={12}
//         rowHeight={45}
//         width={1200}
//         onLayoutChange={(newLayout) => dispatch(setLayout(newLayout, "historical"))}
//         onResizeStop={(newLayout) => saveLayout(newLayout)}
//         onDragStop={(newLayout) => saveLayout(newLayout)}
//         draggableHandle=".drag-handle"
//         isResizable
//         isDraggable
//       >
//         {charts.map((chart) => (
//           <Box
//             key={chart.id}
//             data-grid={layout.find((l) => l.i === chart.id.toString()) || { x: 0, y: 0, w: 6, h: 8 }}
//             sx={{ position: "relative", border: "1px solid #ccc", borderRadius: "8px", overflow: "hidden" }}
//           >
//             <Box display="flex" justifyContent="space-between" p={2} sx={{ backgroundColor: "#f5f5f5" }}>
//               <IconButton className="drag-handle">
//                 <DragHandleIcon />
//               </IconButton>
//               <Typography variant="h6">{chart.type} Chart</Typography>
//               <IconButton aria-label="delete" onClick={() => deleteChart(chart.id)}>
//                 <DeleteIcon />
//               </IconButton>
//             </Box>
//             <Box sx={{ height: "calc(100% - 100px)" }}>
//               {renderChart(chart)}
//             </Box>
//           </Box>
//         ))}
//       </GridLayout>

//       <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
//         <DialogTitle>Select Chart Type</DialogTitle>
//         <DialogContent>
//           <Button variant="contained" onClick={addCustomChart}>Add Line Chart</Button>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setChartDialogOpen(false)} color="secondary">Cancel</Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog open={dateDialogOpen} onClose={() => setDateDialogOpen(false)} fullWidth maxWidth="sm">
//         <DialogTitle>Select Date Range</DialogTitle>
//         <DialogContent>
//           <FormControl component="fieldset">
//             <RadioGroup row value={mode} onChange={(e) => setMode(e.target.value)}>
//               <FormControlLabel value="B" control={<Radio />} label="Select Date Range" />
//               <FormControlLabel value="C" control={<Radio />} label="Start Date & Continue Real-Time" />
//             </RadioGroup>
//           </FormControl>
//           <Grid container spacing={2} alignItems="center">
//             <Grid item xs={6}>
//               <DateTimePicker
//                 label="Start Date and Time"
//                 value={chartDateRanges[currentChartId]?.startDate || null}
//                 onChange={(date) =>
//                   setChartDateRanges((prevRanges) => ({
//                     ...prevRanges,
//                     [currentChartId]: { ...prevRanges[currentChartId], startDate: date },
//                   }))
//                 }
//                 renderInput={(params) => <TextField {...params} fullWidth />}
//               />
//             </Grid>
//             <Grid item xs={6}>
//               <DateTimePicker
//                 label="End Date and Time"
//                 value={chartDateRanges[currentChartId]?.endDate || null}
//                 onChange={(date) =>
//                   setChartDateRanges((prevRanges) => ({
//                     ...prevRanges,
//                     [currentChartId]: { ...prevRanges[currentChartId], endDate: date },
//                   }))
//                 }
//                 renderInput={(params) => <TextField {...params} fullWidth />}
//                 disabled={mode === "C"}
//               />
//             </Grid>
//           </Grid>
//           <Box display="flex" justifyContent="flex-end" marginBottom={2}>
//             <FormControl>
//               <InputLabel id="time-range-label">Time Range</InputLabel>
//               <Select
//                 labelId="time-range-label"
//                 value={chartDateRanges[currentChartId]?.range || ""}
//                 onChange={(e) => handleTimeRangeChange(currentChartId, e.target.value)}
//               >
//                 <MenuItem value="1_minute">Last 1 minute</MenuItem>
//                 <MenuItem value="30_minutes">Last 30 minutes</MenuItem>
//                 <MenuItem value="1_hour">Last 1 hour</MenuItem>
//                 <MenuItem value="6_hours">Last 6 hours</MenuItem>
//                 <MenuItem value="12_hours">Last 12 hours</MenuItem>
//                 <MenuItem value="1_day">Last 1 day</MenuItem>
//                 <MenuItem value="2_day">Last 2 days</MenuItem>
//                 <MenuItem value="1_week">Last 1 week</MenuItem>
//                 <MenuItem value="1_month">Last 1 month</MenuItem>
//               </Select>
//             </FormControl>
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setDateDialogOpen(false)} color="secondary">Cancel</Button>
//           <Button onClick={handleDateRangeApply} color="primary" disabled={!chartDateRanges[currentChartId]?.startDate || (mode === "B" && !chartDateRanges[currentChartId]?.endDate)}>Apply</Button>
//         </DialogActions>
//       </Dialog>

//       {tempChartData && (
//         <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="md">
//           <DialogTitle>Configure Chart</DialogTitle>
//           <DialogContent>
//             <Box display="flex" flexDirection="column" maxHeight="400px" overflow="auto">
//               {tempChartData.yAxisDataKeys.map((yAxis, index) => (
//                 <Box key={yAxis.id} display="flex" flexDirection="column" marginBottom={2}>
//                   <Box display="flex" justifyContent="space-between" alignItems="center">
//                     <Typography variant="h6">Y-Axis {index + 1}</Typography>
//                     <IconButton onClick={() => deleteYAxis(yAxis.id)}><DeleteIcon /></IconButton>
//                   </Box>
//                   <FormControl fullWidth margin="normal">
//                     <InputLabel>Data Keys</InputLabel>
//                     <Select multiple value={yAxis.dataKeys} onChange={(event) => handleDataKeyChange(yAxis.id, event)}>
//                       <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//                       <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
//                     </Select>
//                   </FormControl>
//                   <FormControl fullWidth margin="normal">
//                     <InputLabel>Range</InputLabel>
//                     <Select value={yAxis.range} onChange={(event) => handleRangeChange(yAxis.id, event)}>
//                       <MenuItem value="0-500">0-500</MenuItem>
//                       <MenuItem value="0-100">0-100</MenuItem>
//                       <MenuItem value="0-10">0-10</MenuItem>
//                     </Select>
//                   </FormControl>
//                   <FormControl fullWidth margin="normal">
//                     <InputLabel>Line Style</InputLabel>
//                     <Select value={yAxis.lineStyle} onChange={(event) => handleLineStyleChange(yAxis.id, event)}>
//                       <MenuItem value="solid">Solid</MenuItem>
//                       <MenuItem value="dotted">Dotted</MenuItem>
//                       <MenuItem value="dashed">Dashed</MenuItem>
//                       <MenuItem value="dot-dash">Dot Dash</MenuItem>
//                     </Select>
//                   </FormControl>
//                   <Button onClick={() => openColorPicker(yAxis.id)}>Select Color</Button>
//                   {colorPickerOpen && selectedYAxisId === yAxis.id && <SketchPicker color={yAxis.color} onChangeComplete={handleColorChange} />}
//                 </Box>
//               ))}
//               <Button variant="contained" color="secondary" onClick={() =>
//                 setTempChartData((prevChart) => ({
//                   ...prevChart,
//                   yAxisDataKeys: [
//                     ...prevChart.yAxisDataKeys,
//                     {
//                       id: `left-${prevChart.yAxisDataKeys.length}`,
//                       dataKeys: [],
//                       range: "0-500",
//                       color: "#FF0000",
//                       lineStyle: "solid",
//                     },
//                   ],
//                 }))
//               }>Add Y-Axis</Button>
//             </Box>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setDialogOpen(false)} color="secondary">Cancel</Button>
//             <Button onClick={saveConfiguration} color="primary">Save</Button>
//           </DialogActions>
//         </Dialog>
//       )}
//     </LocalizationProvider>
//   );
// };

// export default HistoricalCharts;

// import React, { useState, useEffect, useRef } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import GridLayout from "react-grid-layout";
// import {
//   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Brush,
// } from "recharts";
// import {
//   Container,
//   Box,
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Typography,
//   IconButton,
//   Grid,
//   TextField,
//   RadioGroup,
//   FormControlLabel,
//   Radio,
// } from "@mui/material";
// import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
// import { SketchPicker } from "react-color";
// import DeleteIcon from "@mui/icons-material/Delete";
// import DragHandleIcon from "@mui/icons-material/DragHandle";
// import axios from "axios";
// import { debounce } from "lodash";
// import {
//   format,
//   subMinutes,
//   subHours,
//   subDays,
//   subWeeks,
//   subMonths,
//   parseISO,
// } from "date-fns";
// import { setLayout, addChart, removeChart, updateChart  } from "../../redux/layoutActions";

// const HistoricalCharts = () => {

//   const [chartData, setChartData] = useState({});
//   const [tempChartData, setTempChartData] = useState(null);
//   const [chartDialogOpen, setChartDialogOpen] = useState(false);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [selectedYAxisId, setSelectedYAxisId] = useState(null);
//   const [dateDialogOpen, setDateDialogOpen] = useState(true);
//   const [chartDateRanges, setChartDateRanges] = useState({});
//   const [mode, setMode] = useState("B");
//   const [currentChartId, setCurrentChartId] = useState(null);
//   const wsClientRefs = useRef({});
//   const [colorPickerOpen, setColorPickerOpen] = useState(false);

//   const dispatch = useDispatch();
//   const layout = useSelector((state) => state.layout.historicalLayout) || JSON.parse(localStorage.getItem("historicalChartsLayout")) || [];
//   const charts = useSelector((state) => state.layout.historicalCharts) || JSON.parse(localStorage.getItem("historicalCharts")) || [];

//   useEffect(() => {
//     if (!layout.length) {
//       const savedLayout = JSON.parse(localStorage.getItem("historicalChartsLayout")) || [];
//       dispatch(setLayout(savedLayout, "historical"));
//     }
//   }, [dispatch, layout.length]);

//   const saveLayout = debounce((newLayout) => {
//     dispatch(setLayout(newLayout, "historical"));
//     localStorage.setItem("historicalChartsLayout", JSON.stringify(newLayout));
//   }, 500);

//   const addCustomChart = () => {
//     const newChartId = Date.now();
//     const newChart = {
//       id: newChartId,
//       type: "Line",
//       xAxisDataKey: "",
//       yAxisDataKeys: [{ id: "left-0", dataKeys: ["AX-LT-011"], range: "0-500", color: "#FF0000", lineStyle: "solid" }],
//     };
//     dispatch(addChart(newChart, "historical"));
//     const updatedLayout = [...layout, { i: newChartId.toString(), x: 0, y: , w: 6, h: 8 }];
//     dispatch(setLayout(updatedLayout, "historical"));
//     localStorage.setItem("historicalChartsLayout", JSON.stringify(updatedLayout));
//   };

//   const deleteChart = (chartId) => {
//     dispatch(removeChart(chartId, "historical"));
//     const updatedLayout = layout.filter((l) => l.i !== chartId.toString());
//     dispatch(setLayout(updatedLayout, "historical"));
//     localStorage.setItem("historicalChartsLayout", JSON.stringify(updatedLayout));
//   };

//   const saveConfiguration = () => {
//     if (tempChartData) {
//       dispatch(updateChart(tempChartData, "historical"));
//       setDialogOpen(false);
//     }
//   };

//   const handleTimeRangeChange = (chartId, value) => {
//     let start;
//     switch (value) {
//       case "1_minute":
//         start = subMinutes(new Date(), 1);
//         break;
//       case "30_minutes":
//         start = subMinutes(new Date(), 30);
//         break;
//       case "1_hour":
//         start = subHours(new Date(), 1);
//         break;
//       case "6_hours":
//         start = subHours(new Date(), 6);
//         break;
//       case "12_hours":
//         start = subHours(new Date(), 12);
//         break;
//       case "1_day":
//         start = subDays(new Date(), 1);
//         break;
//       case "2_day":
//         start = subDays(new Date(), 2);
//         break;
//       case "1_week":
//         start = subWeeks(new Date(), 1);
//         break;
//       case "1_month":
//         start = subMonths(new Date(), 1);
//         break;
//       default:
//         start = subMinutes(new Date(), 1);
//     }

//     setChartDateRanges((prevRanges) => ({
//       ...prevRanges,
//       [chartId]: { startDate: start, endDate: new Date() },
//     }));
//   };

//   const fetchChartData = async (chartId) => {
//     const { startDate, endDate } = chartDateRanges[chartId] || {};
//     if (!startDate) return;
//     try {
//       const formattedStartDate = format(startDate, "yyyy-MM-dd'T'HH:mm");
//       const formattedEndDate = mode === "C" ? format(new Date(), "yyyy-MM-dd'T'HH:mm") : format(endDate, "yyyy-MM-dd'T'HH:mm");

//       const response = await axios.post("https://xdeuid6slkki7yxz4zhdbqbzfq0hirkk.lambda-url.us-east-1.on.aws/", { start_time: formattedStartDate, end_time: formattedEndDate });
//       const parsedBody = JSON.parse(response.data.body);
//       const fetchedData = parsedBody.data.map((item) => ({
//         timestamp: item[0],
//         "AX-LT-011": item[1],
//         "AX-LT-021": item[2],
//       }));

//       setChartData((prevData) => ({ ...prevData, [chartId]: fetchedData }));

//       if (mode === "C") {
//         setupRealTimeWebSocket(chartId);
//       }
//     } catch (error) {
//       console.error("Error fetching data from the API:", error);
//     }
//   };

//   const setupRealTimeWebSocket = (chartId) => {
//     if (wsClientRefs.current[chartId]) {
//       wsClientRefs.current[chartId].close();
//     }

//     wsClientRefs.current[chartId] = new WebSocket(
//       "wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/"
//     );

//     wsClientRefs.current[chartId].onopen = () => {
//       console.log(`WebSocket connection established for HistoricalCharts chart ${chartId}`);
//     };

//     wsClientRefs.current[chartId].onmessage = (message) => {
//       try {
//         const receivedData = JSON.parse(message.data);
//         const newData = {
//           timestamp: parseISO(receivedData["PLC-TIME-STAMP"]) || new Date(),
//           "AX-LT-011": receivedData["AX-LT-011"] || null,
//           "AX-LT-021": receivedData["AX-LT-021"] || null,
//           "CW-TT-011": receivedData["CW-TT-011"] || null,
//         };

//         setChartData((prevData) => ({
//           ...prevData,
//           [chartId]: [...(prevData[chartId] || []), newData],
//         }));
//       } catch (error) {
//         console.error("Error processing WebSocket message:", error);
//       }
//     };

//     wsClientRefs.current[chartId].onclose = (event) => {
//       console.error(
//         `WebSocket disconnected for chart ${chartId} (code: ${event.code}, reason: ${event.reason}). Reconnecting...`
//       );
//       setTimeout(() => setupRealTimeWebSocket(chartId), 1000);
//     };
//   };

//   const renderLineChart = (chart) => (
//     <Box sx={{ height: "calc(100% - 80px)" }}>
//       <LineChart width="100%" height="100%" data={chartData[chart.id]}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey="timestamp" tickFormatter={(tick) => new Date(tick).toLocaleString()} />
//         {chart.yAxisDataKeys.map((yAxis) => (
//           <YAxis key={yAxis.id} yAxisId={yAxis.id} domain={getYAxisDomain(yAxis.range)} stroke={yAxis.color} />
//         ))}
//         <Tooltip />
//         <Legend />
//         {chart.yAxisDataKeys.map((yAxis) =>
//           yAxis.dataKeys.map((key) => (
//             <Line key={key} type="monotone" dataKey={key} stroke={yAxis.color} strokeDasharray={getLineStyle(yAxis.lineStyle)} yAxisId={yAxis.id} />
//           ))
//         )}
//         <Brush height={30} dataKey="timestamp" stroke="#8884d8" />
//       </LineChart>
//     </Box>
//   );

//   const getYAxisDomain = (range) => {
//     switch (range) {
//       case "0-500":
//         return [0, 500];
//       case "0-100":
//         return [0, 100];
//       case "0-10":
//         return [0, 10];
//       default:
//         return [0, 500];
//     }
//   };

//   const getLineStyle = (lineStyle) => {
//     switch (lineStyle) {
//       case "solid":
//         return "";
//       case "dotted":
//         return "1 1";
//       case "dashed":
//         return "5 5";
//       case "dot-dash":
//         return "3 3 1 3";
//       case "dash-dot-dot":
//         return "3 3 1 1 1 3";
//       default:
//         return "";
//     }
//   };

//   const handleDateRangeApply = () => {
//     setDateDialogOpen(false);
//     fetchChartData(currentChartId);
//   };

//   const renderChart = (chart) => (
//     <Box>
//       {renderLineChart(chart)}
//       <Box display="flex" justifyContent="space-around" mt={2} gap={2}>
//         <Button variant="contained" color="secondary" onClick={() => setTempChartData(chart) || setDialogOpen(true)}>Configure Chart</Button>
//         <Button variant="contained" color="secondary" onClick={() => setCurrentChartId(chart.id) || setDateDialogOpen(true)}>Choose Date Range</Button>
//       </Box>
//     </Box>
//   );

//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       <Box display="flex" justifyContent="flex-end" marginBottom={4}>
//         <Button variant="contained" color="secondary" onClick={() => setChartDialogOpen(true)}>Add Realtime Historical Chart</Button>
//       </Box>
//       <GridLayout
//         className="layout"
//         layout={layout}
//         cols={12}
//         rowHeight={45}
//         width={1200}
//         onLayoutChange={(newLayout) => dispatch(setLayout(newLayout, "historical"))}
//         onResizeStop={(newLayout) => saveLayout(newLayout)}
//         onDragStop={(newLayout) => saveLayout(newLayout)}
//         draggableHandle=".drag-handle"
//         isResizable
//         isDraggable
//       >
//         {charts.map((chart) => (
//           <Box
//             key={chart.id}
//             data-grid={layout.find((l) => l.i === chart.id.toString()) || { x: 0, y: 0, w: 6, h: 8 }}
//             sx={{ position: "relative", border: "1px solid #ccc", borderRadius: "8px", overflow: "hidden" }}
//           >
//             <Box display="flex" justifyContent="space-between" p={2} sx={{ backgroundColor: "#f5f5f5" }}>
//               <IconButton className="drag-handle">
//                 <DragHandleIcon />
//               </IconButton>
//               <Typography variant="h6">{chart.type} Chart</Typography>
//               <IconButton aria-label="delete" onClick={() => deleteChart(chart.id)}>
//                 <DeleteIcon />
//               </IconButton>
//             </Box>
//             <Box sx={{ height: "calc(100% - 100px)" }}>
//               {renderChart(chart)}
//             </Box>
//           </Box>
//         ))}
//       </GridLayout>

//       <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
//         <DialogTitle>Select Chart Type</DialogTitle>
//         <DialogContent>
//           <Button variant="contained" onClick={addCustomChart}>Add Line Chart</Button>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setChartDialogOpen(false)} color="secondary">Cancel</Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog open={dateDialogOpen} onClose={() => setDateDialogOpen(false)} fullWidth maxWidth="sm">
//         <DialogTitle>Select Date Range</DialogTitle>
//         <DialogContent>
//           <FormControl component="fieldset">
//             <RadioGroup row value={mode} onChange={(e) => setMode(e.target.value)}>
//               <FormControlLabel value="B" control={<Radio />} label="Select Date Range" />
//               <FormControlLabel value="C" control={<Radio />} label="Start Date & Continue Real-Time" />
//             </RadioGroup>
//           </FormControl>
//           <Grid container spacing={2} alignItems="center">
//             <Grid item xs={6}>
//               <DateTimePicker
//                 label="Start Date and Time"
//                 value={chartDateRanges[currentChartId]?.startDate || null}
//                 onChange={(date) =>
//                   setChartDateRanges((prevRanges) => ({
//                     ...prevRanges,
//                     [currentChartId]: { ...prevRanges[currentChartId], startDate: date },
//                   }))
//                 }
//                 renderInput={(params) => <TextField {...params} fullWidth />}
//               />
//             </Grid>
//             <Grid item xs={6}>
//               <DateTimePicker
//                 label="End Date and Time"
//                 value={chartDateRanges[currentChartId]?.endDate || null}
//                 onChange={(date) =>
//                   setChartDateRanges((prevRanges) => ({
//                     ...prevRanges,
//                     [currentChartId]: { ...prevRanges[currentChartId], endDate: date },
//                   }))
//                 }
//                 renderInput={(params) => <TextField {...params} fullWidth />}
//                 disabled={mode === "C"}
//               />
//             </Grid>
//           </Grid>
//           <Box display="flex" justifyContent="flex-end" marginBottom={2}>
//             <FormControl>
//               <InputLabel id="time-range-label">Time Range</InputLabel>
//               <Select
//                 labelId="time-range-label"
//                 value={chartDateRanges[currentChartId]?.range || ""}
//                 onChange={(e) => handleTimeRangeChange(currentChartId, e.target.value)}
//               >
//                 <MenuItem value="1_minute">Last 1 minute</MenuItem>
//                 <MenuItem value="30_minutes">Last 30 minutes</MenuItem>
//                 <MenuItem value="1_hour">Last 1 hour</MenuItem>
//                 <MenuItem value="6_hours">Last 6 hours</MenuItem>
//                 <MenuItem value="12_hours">Last 12 hours</MenuItem>
//                 <MenuItem value="1_day">Last 1 day</MenuItem>
//                 <MenuItem value="2_day">Last 2 days</MenuItem>
//                 <MenuItem value="1_week">Last 1 week</MenuItem>
//                 <MenuItem value="1_month">Last 1 month</MenuItem>
//               </Select>
//             </FormControl>
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setDateDialogOpen(false)} color="secondary">Cancel</Button>
//           <Button onClick={handleDateRangeApply} color="primary" disabled={!chartDateRanges[currentChartId]?.startDate || (mode === "B" && !chartDateRanges[currentChartId]?.endDate)}>Apply</Button>
//         </DialogActions>
//       </Dialog>

//       {tempChartData && (
//         <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="md">
//           <DialogTitle>Configure Chart</DialogTitle>
//           <DialogContent>
//             <Box display="flex" flexDirection="column" maxHeight="400px" overflow="auto">
//               {tempChartData.yAxisDataKeys.map((yAxis, index) => (
//                 <Box key={yAxis.id} display="flex" flexDirection="column" marginBottom={2}>
//                   <Box display="flex" justifyContent="space-between" alignItems="center">
//                     <Typography variant="h6">Y-Axis {index + 1}</Typography>
//                     <IconButton onClick={() => deleteYAxis(yAxis.id)}><DeleteIcon /></IconButton>
//                   </Box>
//                   <FormControl fullWidth margin="normal">
//                     <InputLabel>Data Keys</InputLabel>
//                     <Select multiple value={yAxis.dataKeys} onChange={(event) => handleDataKeyChange(yAxis.id, event)}>
//                       <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//                       <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
//                     </Select>
//                   </FormControl>
//                   <FormControl fullWidth margin="normal">
//                     <InputLabel>Range</InputLabel>
//                     <Select value={yAxis.range} onChange={(event) => handleRangeChange(yAxis.id, event)}>
//                       <MenuItem value="0-500">0-500</MenuItem>
//                       <MenuItem value="0-100">0-100</MenuItem>
//                       <MenuItem value="0-10">0-10</MenuItem>
//                     </Select>
//                   </FormControl>
//                   <FormControl fullWidth margin="normal">
//                     <InputLabel>Line Style</InputLabel>
//                     <Select value={yAxis.lineStyle} onChange={(event) => handleLineStyleChange(yAxis.id, event)}>
//                       <MenuItem value="solid">Solid</MenuItem>
//                       <MenuItem value="dotted">Dotted</MenuItem>
//                       <MenuItem value="dashed">Dashed</MenuItem>
//                       <MenuItem value="dot-dash">Dot Dash</MenuItem>
//                     </Select>
//                   </FormControl>
//                   <Button onClick={() => openColorPicker(yAxis.id)}>Select Color</Button>
//                   {colorPickerOpen && selectedYAxisId === yAxis.id && <SketchPicker color={yAxis.color} onChangeComplete={handleColorChange} />}
//                 </Box>
//               ))}
//               <Button variant="contained" color="secondary" onClick={() =>
//                 setTempChartData((prevChart) => ({
//                   ...prevChart,
//                   yAxisDataKeys: [
//                     ...prevChart.yAxisDataKeys,
//                     {
//                       id: `left-${prevChart.yAxisDataKeys.length}`,
//                       dataKeys: [],
//                       range: "0-500",
//                       color: "#FF0000",
//                       lineStyle: "solid",
//                     },
//                   ],
//                 }))
//               }>Add Y-Axis</Button>
//             </Box>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setDialogOpen(false)} color="secondary">Cancel</Button>
//             <Button onClick={saveConfiguration} color="primary">Save</Button>
//           </DialogActions>
//         </Dialog>
//       )}
//     </LocalizationProvider>
//   );
// };

// export default HistoricalCharts;

// import React, { useState, useEffect, useRef } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import GridLayout from "react-grid-layout";
// import {
//   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush,
// } from "recharts";
// import {
//   Container,
//   Box,
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Typography,
//   IconButton,
//   Grid,
//   TextField,
//   RadioGroup,
//   FormControlLabel,
//   Radio,
// } from "@mui/material";
// import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
// import { SketchPicker } from "react-color";
// import DeleteIcon from "@mui/icons-material/Delete";
// import DragHandleIcon from "@mui/icons-material/DragHandle";
// import axios from "axios";
// import { debounce } from "lodash";
// import {
//   format,
//   subMinutes,
//   subHours,
//   subDays,
//   subWeeks,
//   subMonths,
//   parseISO,
// } from "date-fns";
// import { setLayout, addChart, removeChart, updateChart  } from "../../redux/layoutActions";

// const HistoricalCharts = () => {

//   const [chartData, setChartData] = useState({});
//   const [tempChartData, setTempChartData] = useState(null);
//   const [chartDialogOpen, setChartDialogOpen] = useState(false);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [selectedYAxisId, setSelectedYAxisId] = useState(null);
//   const [dateDialogOpen, setDateDialogOpen] = useState(false);
//   const [startDate, setStartDate] = useState(null);
//   const [endDate, setEndDate] = useState(null);
//   const [mode, setMode] = useState("B");
//   const [currentChartId, setCurrentChartId] = useState(null);
//   const wsClientRefs = useRef({});
//   const [selectedTimeRange, setSelectedTimeRange] = useState();
//   const [colorPickerOpen, setColorPickerOpen] = useState(false);

//   const dispatch = useDispatch();
//   const layout = useSelector((state) => state.layout.historicalLayout) || JSON.parse(localStorage.getItem("historicalChartsLayout")) || [];
//   const charts = useSelector((state) => state.layout.historicalCharts) || JSON.parse(localStorage.getItem("historicalCharts")) || [];

//   // Load layout from localStorage if Redux state is empty
//   useEffect(() => {
//     if (!layout.length) {
//       const savedLayout = JSON.parse(localStorage.getItem("historicalChartsLayout")) || [];
//       dispatch(setLayout(savedLayout, "historical"));
//     }
//   }, [dispatch, layout.length]);

//   // Debounced function to save layout to Redux and localStorage
//   const saveLayout = debounce((newLayout) => {
//     dispatch(setLayout(newLayout, "historical"));
//     localStorage.setItem("historicalChartsLayout", JSON.stringify(newLayout));
//   }, 500);

//   const addCustomChart = () => {
//     const newChartId = Date.now();
//     const newChart = {
//       id: newChartId,
//       type: "Line",
//       xAxisDataKey: "",
//       yAxisDataKeys: [{ id: "left-0", dataKeys: ["AX-LT-011"], range: "0-500", color: "#FF0000", lineStyle: "solid" }],
//     };
//     dispatch(addChart(newChart, "historical"));
//     const updatedLayout = [...layout, { i: newChartId.toString(), x: 0, y: Infinity, w: 6, h: 8 }];
//     dispatch(setLayout(updatedLayout, "historical"));
//     localStorage.setItem("historicalChartsLayout", JSON.stringify(updatedLayout));
//   };

//   const deleteChart = (chartId) => {
//     dispatch(removeChart(chartId, "historical"));
//     const updatedLayout = layout.filter((l) => l.i !== chartId.toString());
//     dispatch(setLayout(updatedLayout, "historical"));
//     localStorage.setItem("historicalChartsLayout", JSON.stringify(updatedLayout));
//   };

//   const saveConfiguration = () => {
//     if (tempChartData) {
//       dispatch(updateChart(tempChartData, "historical"));
//       setDialogOpen(false);
//     }
//   };

//   useEffect(() => {
//     let start;
//     switch (selectedTimeRange) {
//       case "1_minute":
//         start = subMinutes(new Date(), 1);
//         break;
//       case "30_minutes":
//         start = subMinutes(new Date(), 30);
//         break;
//       case "1_hour":
//         start = subHours(new Date(), 1);
//         break;
//       case "6_hours":
//         start = subHours(new Date(), 6);
//         break;
//       case "12_hours":
//         start = subHours(new Date(), 12);
//         break;
//       case "1_day":
//         start = subDays(new Date(), 1);
//         break;
//       case "2_day":
//         start = subDays(new Date(), 2);
//         break;
//       case "1_week":
//         start = subWeeks(new Date(), 1);
//         break;
//       case "1_month":
//         start = subMonths(new Date(), 1);
//         break;
//       default:
//         start = subMinutes(new Date(), 1);
//     }
//     setStartDate(start);
//     setEndDate(new Date());
//   }, [selectedTimeRange]);

//   const handleTimeRangeChange = (event) => {
//     setSelectedTimeRange(event.target.value);
//     charts.forEach((chart) => {
//       fetchChartData(chart.id);
//     });
//   };

//   const fetchChartData = async (chartId) => {
//     if (!startDate) return;
//     try {
//       const formattedStartDate = format(startDate, "yyyy-MM-dd'T'HH:mm");
//       const formattedEndDate = mode === "C" ? format(new Date(), "yyyy-MM-dd'T'HH:mm") : format(endDate, "yyyy-MM-dd'T'HH:mm");

//       const response = await axios.post("https://xdeuid6slkki7yxz4zhdbqbzfq0hirkk.lambda-url.us-east-1.on.aws/", { start_time: formattedStartDate, end_time: formattedEndDate });
//       const parsedBody = JSON.parse(response.data.body);
//       const fetchedData = parsedBody.data.map((item) => ({
//         timestamp: item[0],
//         "AX-LT-011": item[1],
//         "AX-LT-021": item[2],
//       }));

//       setChartData((prevData) => ({ ...prevData, [chartId]: fetchedData }));

//       if (mode === "C") {
//         setupRealTimeWebSocket(chartId);
//       }
//     } catch (error) {
//       console.error("Error fetching data from the API:", error);
//     }
//   };
//   const setupRealTimeWebSocket = (chartId) => {
//     if (wsClientRefs.current[chartId]) {
//       wsClientRefs.current[chartId].close();
//     }

//     wsClientRefs.current[chartId] = new WebSocket(
//       "wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/"
//     );

//     wsClientRefs.current[chartId].onopen = () => {
//       console.log(
//         `WebSocket connection established for HistoricalCharts chart ${chartId}`
//       );
//     };

//     wsClientRefs.current[chartId].onmessage = (message) => {
//       try {
//         const receivedData = JSON.parse(message.data);
//         const newData = {
//           timestamp: parseISO(receivedData["PLC-TIME-STAMP"]) || new Date(),
//           "AX-LT-011": receivedData["AX-LT-011"] || null,
// "AX-LT-021": receivedData["AX-LT-021"] || null,
// "CW-TT-011": receivedData["CW-TT-011"] || null,
//         };

//         setChartData((prevData) => ({
//           ...prevData,
//           [chartId]: [...(prevData[chartId] || []), newData],
//         }));
//       } catch (error) {
//         console.error("Error processing WebSocket message:", error);
//       }
//     };

//     wsClientRefs.current[chartId].onclose = (event) => {
//       console.error(
//         `WebSocket disconnected for chart ${chartId} (code: ${event.code}, reason: ${event.reason}). Reconnecting...`
//       );
//       setTimeout(() => setupRealTimeWebSocket(chartId), 1000);
//     };
//   };

//   const renderLineChart = (chart) => (
//     <ResponsiveContainer width="100%" height={300}>
//       <LineChart data={chartData[chart.id]}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey="timestamp" tickFormatter={(tick) => new Date(tick).toLocaleString()} />
//         {chart.yAxisDataKeys.map((yAxis) => (
//           <YAxis key={yAxis.id} yAxisId={yAxis.id} domain={getYAxisDomain(yAxis.range)} stroke={yAxis.color} />
//         ))}
//         <Tooltip />
//         <Legend />
//         {chart.yAxisDataKeys.map((yAxis) =>
//           yAxis.dataKeys.map((key) => (
//             <Line key={key} type="monotone" dataKey={key} stroke={yAxis.color} strokeDasharray={getLineStyle(yAxis.lineStyle)} yAxisId={yAxis.id} />
//           ))
//         )}
//         <Brush height={30} dataKey="timestamp" stroke="#8884d8" />
//       </LineChart>
//     </ResponsiveContainer>
//   );
//   const getYAxisDomain = (range) => {
//     switch (range) {
//       case "0-500":
//         return [0, 500];
//       case "0-100":
//         return [0, 100];
//       case "0-10":
//         return [0, 10];
//       default:
//         return [0, 500];
//     }
//   };
//   const getLineStyle = (lineStyle) => {
//     switch (lineStyle) {
//       case "solid":
//         return "";
//       case "dotted":
//         return "1 1";
//       case "dashed":
//         return "5 5";
//       case "dot-dash":
//         return "3 3 1 3";
//       case "dash-dot-dot":
//         return "3 3 1 1 1 3";
//       default:
//         return "";
//     }
//   };
//   const handleRangeChange = (yAxisId, event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
//         yAxis.id === yAxisId ? { ...yAxis, range: value } : yAxis
//       ),
//     }));
//   };
//   const deleteYAxis = (yAxisId) => {
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.filter(
//         (yAxis) => yAxis.id !== yAxisId
//       ),
//     }));
//   };

//   const handleDataKeyChange = (yAxisId, event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
//         yAxis.id === yAxisId ? { ...yAxis, dataKeys: value } : yAxis
//       ),
//     }));
//   };
//   const openColorPicker = (yAxisId) => {
//     setSelectedYAxisId(yAxisId);
//     setColorPickerOpen(true);
//   };
//   const openDialog = (chart) => {
//     setTempChartData(chart);
//     setDialogOpen(true);
//   };

//   const handleLineStyleChange = (yAxisId, event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
//         yAxis.id === yAxisId ? { ...yAxis, lineStyle: value } : yAxis
//       ),
//     }));
//   };
//   const handleColorChange = (color) => {
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
//         yAxis.id === selectedYAxisId ? { ...yAxis, color: color.hex } : yAxis
//       ),
//     }));
//     setColorPickerOpen(false);
//   };
//   const handleDateRangeApply = () => {
//     setDateDialogOpen(false);
//     if (mode === "C") {
//       fetchChartData(currentChartId);
//     } else if (mode === "B") {
//       fetchChartData(currentChartId);
//     }
//   };

//   const renderChart = (chart) => (
//     <Box>
//       {renderLineChart(chart)}
//       <Box display="flex" justifyContent="space-around" mt={2} gap={2}>
//         <Button variant="contained" color="secondary" onClick={() => setTempChartData(chart) || setDialogOpen(true)}>Configure Chart</Button>
//         <Button variant="contained" color="secondary" onClick={() => setCurrentChartId(chart.id) || setDateDialogOpen(true)}>Choose Date Range</Button>
//       </Box>
//     </Box>
//   );

//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       <Box display="flex" justifyContent="flex-end" marginBottom={4}>
//         <Button variant="contained" color="secondary" onClick={() => setChartDialogOpen(true)}>Add Realtime Historical Chart</Button>
//       </Box>
//       <GridLayout
//         className="layout"
//         layout={layout}
//         cols={12}
//         rowHeight={45}
//         width={1200}
//         onLayoutChange={(newLayout) => dispatch(setLayout(newLayout, "historical"))}
//         onResizeStop={(newLayout) => saveLayout(newLayout)}
//         onDragStop={(newLayout) => saveLayout(newLayout)}
//         draggableHandle=".drag-handle"
//         isResizable
//         isDraggable
//       >
//         {charts.map((chart) => (
//           <Box
//             key={chart.id}
//             data-grid={layout.find((l) => l.i === chart.id.toString()) || { x: 0, y: 0, w: 6, h: 8 }}
//             sx={{ position: "relative", border: "1px solid #ccc", borderRadius: "8px", overflow: "hidden" }}
//           >
//             <Box display="flex" justifyContent="space-between" p={2} sx={{ backgroundColor: "#f5f5f5" }}>
//               <IconButton className="drag-handle">
//                 <DragHandleIcon />
//               </IconButton>
//               <Typography variant="h6">{chart.type} Chart</Typography>
//               <IconButton aria-label="delete" onClick={() => deleteChart(chart.id)}>
//                 <DeleteIcon />
//               </IconButton>
//             </Box>
//             <Box sx={{ height: "calc(100% - 100px)" }}>
//               {renderChart(chart)}
//             </Box>
//           </Box>
//         ))}
//       </GridLayout>

//       <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
//         <DialogTitle>Select Chart Type</DialogTitle>
//         <DialogContent>
//           <Button variant="contained" onClick={addCustomChart}>Add Line Chart</Button>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setChartDialogOpen(false)} color="secondary">Cancel</Button>
//         </DialogActions>
//       </Dialog>
//       <Dialog
//       open={dateDialogOpen}
//       onClose={() => setDateDialogOpen(false)}
//       fullWidth
//       maxWidth="sm"
//     >
//       <DialogTitle>Select Date Range</DialogTitle>
//       <DialogContent>
//         <FormControl component="fieldset">
//           <RadioGroup
//             row
//             value={mode}
//             onChange={(e) => setMode(e.target.value)}
//           >
//             <FormControlLabel
//               value="B"
//               control={<Radio />}
//               label="Select Date Range"
//             />
//             <FormControlLabel
//               value="C"
//               control={<Radio />}
//               label="Start Date & Continue Real-Time"
//             />
//           </RadioGroup>
//         </FormControl>
//         <Grid container spacing={2} alignItems="center">
//           <Grid item xs={6}>
//             <DateTimePicker
//               label="Start Date and Time"
//               value={startDate}
//               onChange={setStartDate}
//               renderInput={(params) => <TextField {...params} fullWidth />}
//             />
//           </Grid>
//           <Grid item xs={6}>
//             <DateTimePicker
//               label="End Date and Time"
//               value={endDate}
//               onChange={setEndDate}
//               renderInput={(params) => <TextField {...params} fullWidth />}
//               disabled={mode === "C"}
//             />
//           </Grid>
//         </Grid>
//         <Box display="flex" justifyContent="flex-end" marginBottom={2}>
//           <FormControl>
//             <InputLabel id="time-range-label">Time Range</InputLabel>
//             <Select
//               labelId="time-range-label"
//               value={selectedTimeRange}
//               onChange={handleTimeRangeChange}
//             >
//               <MenuItem value="1_minute">Last 1 minute</MenuItem>
//               <MenuItem value="30_minutes">Last 30 minutes</MenuItem>
//               <MenuItem value="1_hour">Last 1 hour</MenuItem>
//               <MenuItem value="6_hours">Last 6 hour</MenuItem>
//               <MenuItem value="12_hours">Last 12 hours</MenuItem>
//               <MenuItem value="1_day">Last 1 day</MenuItem>
//               <MenuItem value="2_day">Last 2 day</MenuItem>
//               <MenuItem value="1_week">Last 1 week</MenuItem>
//               <MenuItem value="1_month">Last 1 month</MenuItem>
//             </Select>
//           </FormControl>
//         </Box>
//       </DialogContent>
//       <DialogActions>
//         <Button onClick={() => setDateDialogOpen(false)} color="secondary">
//           Cancel
//         </Button>
//         <Button
//           onClick={handleDateRangeApply}
//           color="primary"
//           disabled={!startDate || (mode === "B" && !endDate)}
//         >
//           Apply
//         </Button>
//       </DialogActions>
//     </Dialog>
//       {tempChartData && (
//         <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="md">
//           <DialogTitle>Configure Chart</DialogTitle>
//           <DialogContent>
//               <Box
//                 display="flex"
//                 flexDirection="column"
//                 maxHeight="400px"
//                 overflow="auto"
//               >
//                 {tempChartData.yAxisDataKeys.map((yAxis, index) => (
//                   <Box
//                     key={yAxis.id}
//                     display="flex"
//                     flexDirection="column"
//                     marginBottom={2}
//                   >
//                     <Box
//                       display="flex"
//                       justifyContent="space-between"
//                       alignItems="center"
//                     >
//                       <Typography variant="h6">Y-Axis {index + 1}</Typography>
//                       <IconButton onClick={() => deleteYAxis(yAxis.id)}>
//                         <DeleteIcon />
//                       </IconButton>
//                     </Box>
//                     <FormControl fullWidth margin="normal">
//                       <InputLabel>Data Keys</InputLabel>
//                       <Select
//                         multiple
//                         value={yAxis.dataKeys}
//                         onChange={(event) =>
//                           handleDataKeyChange(yAxis.id, event)
//                         }
//                       >
//                       <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//                       <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
//                       </Select>
//                     </FormControl>
//                     <FormControl fullWidth margin="normal">
//                       <InputLabel>Range</InputLabel>
//                       <Select
//                         value={yAxis.range}
//                         onChange={(event) => handleRangeChange(yAxis.id, event)}
//                       >
//                         <MenuItem value="0-500">0-500</MenuItem>
//                         <MenuItem value="0-100">0-100</MenuItem>
//                         <MenuItem value="0-10">0-10</MenuItem>
//                       </Select>
//                     </FormControl>
//                     <FormControl fullWidth margin="normal">
//                       <InputLabel>Line Style</InputLabel>
//                       <Select
//                         value={yAxis.lineStyle}
//                         onChange={(event) =>
//                           handleLineStyleChange(yAxis.id, event)
//                         }
//                       >
//                         <MenuItem value="solid">Solid</MenuItem>
//                         <MenuItem value="dotted">Dotted</MenuItem>
//                         <MenuItem value="dashed">Dashed</MenuItem>
//                         <MenuItem value="dot-dash">Dot Dash</MenuItem>
//                       </Select>
//                     </FormControl>
//                     <Button onClick={() => openColorPicker(yAxis.id)}>
//                       Select Color
//                     </Button>
//                     {colorPickerOpen && selectedYAxisId === yAxis.id && (
//                       <SketchPicker
//                         color={yAxis.color}
//                         onChangeComplete={handleColorChange}
//                       />
//                     )}
//                   </Box>
//                 ))}
//                 <Button
//                   variant="contained"
//                   color="secondary"
//                   onClick={() =>
//                     setTempChartData((prevChart) => ({
//                       ...prevChart,
//                       yAxisDataKeys: [
//                         ...prevChart.yAxisDataKeys,
//                         {
//                           id: `left-${prevChart.yAxisDataKeys.length}`,
//                           dataKeys: [],
//                           range: "0-500",
//                           color: "#FF0000",
//                           lineStyle: "solid",
//                         },
//                       ],
//                     }))
//                   }
//                 >
//                   Add Y-Axis
//                 </Button>
//               </Box>
//             </DialogContent>

//           <DialogActions>
//             <Button onClick={() => setDialogOpen(false)} color="secondary">Cancel</Button>
//             <Button onClick={saveConfiguration} color="primary">Save</Button>
//           </DialogActions>
//         </Dialog>
//       )}
//     </LocalizationProvider>
//   );
// };

// export default HistoricalCharts;

// import React, { useState, useEffect, useRef } from "react";
// import GridLayout from "react-grid-layout";
// import { w3cwebsocket as WebSocketClient } from "websocket";
// import {
//   ScatterChart,
//   Scatter,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";
// import {
//   DateTimePicker,
// } from "@mui/x-date-pickers/DateTimePicker";
// import DragHandleIcon from "@mui/icons-material/DragHandle";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import {
//   Container,
//   Box,
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   TextField,
//   Grid,
//   RadioGroup,
//   FormControlLabel,
//   Radio,
// } from "@mui/material";
// import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
// import { SketchPicker } from "react-color";
// import DeleteIcon from "@mui/icons-material/Delete";
// import IconButton from "@mui/material/IconButton";
// import axios from "axios";
// import {
//   format,
//   subMinutes,
//   subHours,
//   subDays,
//   subWeeks,
//   subMonths,
// } from "date-fns";
// import { useSelector, useDispatch } from "react-redux";
// import { addChart, removeChart, setLayout, updateChart } from "../../redux/layoutActions";
// import { debounce } from "lodash";

// const CustomScatterCharts = () => {
//   const [data, setData] = useState({});
//   const [chartDialogOpen, setChartDialogOpen] = useState(false);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [tempChartData, setTempChartData] = useState(null);
//   const [chartDateRanges, setChartDateRanges] = useState({});
//   const [mode, setMode] = useState("C");
//   const [dateDialogOpen, setDateDialogOpen] = useState(false);
//   const [selectedChartId, setSelectedChartId] = useState(null);
//   const wsClientRefs = useRef({});
//   const [loading, setLoading] = useState(false);

//   const dispatch = useDispatch();
//   const layout = useSelector((state) => state.layout.layout);
//   const charts = useSelector((state) => state.layout.charts);

//   const saveLayout = debounce((newLayout) => {
//     dispatch(setLayout(newLayout));
//   }, 500);

//   useEffect(() => {
//     if (selectedChartId && chartDateRanges[selectedChartId]) {
//       fetchHistoricalData(selectedChartId);
//     }
//   }, [chartDateRanges, selectedChartId]);

//   const handleTimeRangeChange = (chartId, value) => {
//     let start;
//     switch (value) {
//       case "10_minute":
//         start = subMinutes(new Date(), 10);
//         break;
//       case "30_minutes":
//         start = subMinutes(new Date(), 30);
//         break;
//       case "1_hour":
//         start = subHours(new Date(), 1);
//         break;
//       case "6_hours":
//         start = subHours(new Date(), 6);
//         break;
//       case "12_hours":
//         start = subHours(new Date(), 12);
//         break;
//       case "1_day":
//         start = subDays(new Date(), 1);
//         break;
//       case "2_day":
//         start = subDays(new Date(), 2);
//         break;
//       case "1_week":
//         start = subWeeks(new Date(), 1);
//         break;
//       case "1_month":
//         start = subMonths(new Date(), 1);
//         break;
//       default:
//         start = subMinutes(new Date(), 1);
//     }

//     setChartDateRanges((prevRanges) => ({
//       ...prevRanges,
//       [chartId]: { startDate: start, endDate: new Date() },
//     }));
//   };

//   const fetchHistoricalData = async (chartId) => {
//     const { startDate, endDate } = chartDateRanges[chartId] || {};
//     if (!startDate) return;
//     setLoading(true);

//     try {
//       const formattedStartDate = format(startDate, "yyyy-MM-dd");
//       const formattedStartTime = format(startDate, "HH:mm");
//       const formattedEndDate = mode === "C" ? format(endDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
//       const formattedEndTime = mode === "C" ? format(endDate, "HH:mm") : format(new Date(), "HH:mm");

//       const response = await axios.post(
//         "https://xdeuid6slkki7yxz4zhdbqbzfq0hirkk.lambda-url.us-east-1.on.aws/",
//         {
//           start_time: `${formattedStartDate}T${formattedStartTime}`,
//           end_time: `${formattedEndDate}T${formattedEndTime}`,
//         }
//       );

//       const parsedBody = JSON.parse(response.data.body);
//       const historicalData = parsedBody.data.map((item) => ({
//         time_bucket: item[0],
//         "AX-LT-011": item[1],
//         "AX-LT-021": item[2],
//         "CW-TT-011": item[3],
//         "CW-TT-021": item[4],
//       }));

//       setData((prevData) => ({
//         ...prevData,
//         [chartId]: historicalData,
//       }));

//       if (mode === "B") {
//         setupRealTimeWebSocket(chartId);
//       }
//     } catch (error) {
//       console.error("Error fetching historical data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const setupRealTimeWebSocket = (chartId) => {
//     if (wsClientRefs.current[chartId]) {
//       wsClientRefs.current[chartId].close();
//     }

//     wsClientRefs.current[chartId] = new WebSocketClient(
//       "wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/"
//     );

//     wsClientRefs.current[chartId].onopen = () => {
//       console.log(`WebSocket connection established for chart ${chartId}`);
//     };

//     wsClientRefs.current[chartId].onmessage = (message) => {
//       try {
//         const receivedData = JSON.parse(message.data);
//         const newData = {
//           timestamp: receivedData.timestamp || Date.now(),
//           "AX-LT-011": receivedData["AX-LT-011"] || null,
//           "AX-LT-021": receivedData["AX-LT-021"] || null,
//           "CW-TT-011": receivedData["CW-TT-011"] || null,
//           "CW-TT-021": receivedData["CW-TT-021"] || null,
//         };

//         setData((prevData) => ({
//           ...prevData,
//           [chartId]: [...(prevData[chartId] || []), newData],
//         }));
//       } catch (error) {
//         console.error("Error processing WebSocket message:", error);
//       }
//     };

//     wsClientRefs.current[chartId].onclose = () => {
//       console.warn(`WebSocket connection closed for chart ${chartId}. Reconnecting...`);
//       setTimeout(() => setupRealTimeWebSocket(chartId), 1000);
//     };
//   };

//   const addCustomChart = () => {
//     const newChartId = `chart${Date.now()}`;
//     const newChart = {
//       id: newChartId,
//       xAxisDataKey: "CW-TT-011",
//       yAxisDataKey: "CW-TT-021",
//       xAxisRange: ["auto", "auto"],
//       yAxisRange: ["auto", "auto"],
//       color: "#FF0000",
//     };
//     dispatch(addChart(newChart));
//     setChartDialogOpen(false);
//   };

//   const deleteChart = (chartId) => {
//     dispatch(removeChart(chartId));
//   };

//   const saveConfiguration = () => {
//     if (tempChartData) {
//       dispatch(updateChart(tempChartData));
//       setDialogOpen(false);
//     }
//   };

//   const handleDateRangeApply = () => {
//     setDateDialogOpen(false);
//     if (mode === "B" || mode === "C") {
//       fetchHistoricalData(selectedChartId);
//     }
//   };
//   const renderChart = (chart) => (
//     <Box sx={{ height: "calc(100% - 80px)" }}>
//       <ResponsiveContainer width="100%" height="100%">
//         <ScatterChart>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis
//             type="number"
//             dataKey={chart.xAxisDataKey}
//             name={chart.xAxisDataKey}
//             domain={chart.xAxisRange}
//           />
//           <YAxis
//             type="number"
//             dataKey={chart.yAxisDataKey}
//             name={chart.yAxisDataKey}
//             domain={chart.yAxisRange}
//           />
//           <Tooltip
//             cursor={{ strokeDasharray: "3 3" }}
//             content={({ payload }) => {
//               if (payload && payload.length) {
//                 const point = payload[0].payload;
//                 const timestamp = point.time_bucket ? point.time_bucket : new Date().toLocaleString();
//                 return (
//                   <div className="custom-tooltip">
//                     <p>{`X (${chart.xAxisDataKey}): ${point[chart.xAxisDataKey]}`}</p>
//                     <p>{`Y (${chart.yAxisDataKey}): ${point[chart.yAxisDataKey]}`}</p>
//                     <p>{`Timestamp: ${timestamp}`}</p>
//                   </div>
//                 );
//               }
//               return null;
//             }}
//           />
//           <Legend />
//           <Scatter
//             name={`${chart.xAxisDataKey} vs ${chart.yAxisDataKey}`}
//             data={data[chart.id] || []}
//             fill={chart.color}
//           />
//         </ScatterChart>
//       </ResponsiveContainer>
//     </Box>
//   );

//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       <Box display="flex" justifyContent="flex-end" marginBottom={4}>
//         <Button variant="contained" color="secondary" onClick={() => setChartDialogOpen(true)}>
//           Add Scatter Chart
//         </Button>
//       </Box>
//       <GridLayout
//         className="layout"
//         layout={layout}
//         cols={12}
//         rowHeight={45}
//         width={1600}
//         onLayoutChange={(newLayout) => dispatch(setLayout(newLayout))}
//         onResizeStop={(newLayout) => saveLayout(newLayout)}
//         onDragStop={(newLayout) => saveLayout(newLayout)}
//         draggableHandle=".drag-handle"
//         isResizable
//         isDraggable
//       >
//         {charts.map((chart) => (
//           <Box
//             key={chart.id}
//             data-grid={layout.find((l) => l.i === chart.id) || { x: 0, y: Infinity, w: 6, h: 8 }}
//             sx={{
//               position: "relative",
//               border: "1px solid #ccc",
//               borderRadius: "8px",
//               overflow: "hidden",
//               padding: 2,
//               height: "100%"
//             }}
//           >
//             <Box display="flex" justifyContent="space-between" p={1}>
//               <IconButton className="drag-handle" aria-label="drag" size="small">
//                 <DragHandleIcon />
//               </IconButton>
//               <IconButton aria-label="delete" onClick={() => deleteChart(chart.id)} size="small" color="error">
//                 <DeleteIcon />
//               </IconButton>
//             </Box>

//             {renderChart(chart)}

//             <Box mt={2} display="flex" justifyContent="space-between">
//               <Button variant="contained" onClick={() => {
//                 setTempChartData(chart);
//                 setDialogOpen(true);
//               }}>
//                 Configure Chart
//               </Button>
//               <Button
//                 variant="contained"
//                 color="secondary"
//                 onClick={() => {
//                   setSelectedChartId(chart.id);
//                   setDateDialogOpen(true);
//                 }}
//               >
//                 Select Date Range
//               </Button>
//             </Box>
//           </Box>
//         ))}
//       </GridLayout>

//       <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
//         <DialogTitle>Select Chart Type</DialogTitle>
//         <DialogContent>
//           <Button variant="contained" onClick={addCustomChart}>Add XY Chart</Button>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setChartDialogOpen(false)} color="secondary">Cancel</Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="md">
//         <DialogTitle>Configure Chart</DialogTitle>
//         <DialogContent>
//           <FormControl fullWidth margin="normal">
//             <InputLabel>X-Axis Data Key</InputLabel>
//             <Select
//               value={tempChartData?.xAxisDataKey || ""}
//               onChange={(e) => setTempChartData((prevChart) => ({ ...prevChart, xAxisDataKey: e.target.value }))}
//             >
//               <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//               <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
//               <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
//             </Select>
//           </FormControl>

//           <FormControl fullWidth margin="normal">
//             <InputLabel>Y-Axis Data Key</InputLabel>
//             <Select
//               value={tempChartData?.yAxisDataKey || ""}
//               onChange={(e) => setTempChartData((prevChart) => ({ ...prevChart, yAxisDataKey: e.target.value }))}
//             >
//               <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//               <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
//               <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
//             </Select>
//           </FormControl>

//           <SketchPicker color={tempChartData?.color || "#000"} onChangeComplete={(color) => {
//             setTempChartData((prevChart) => ({ ...prevChart, color: color.hex }));
//           }} />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setDialogOpen(false)} color="secondary">Cancel</Button>
//           <Button onClick={saveConfiguration} color="primary">Save</Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog open={dateDialogOpen} onClose={() => setDateDialogOpen(false)} fullWidth maxWidth="sm">
//         <DialogTitle>Select Date Range</DialogTitle>
//         <DialogContent>
//           <FormControl component="fieldset">
//             <RadioGroup row value={mode} onChange={(e) => setMode(e.target.value)}>
//               <FormControlLabel value="C" control={<Radio />} label="Select Date Range" />
//               <FormControlLabel value="B" control={<Radio />} label="Start Date & Continue Real-Time" />
//             </RadioGroup>
//           </FormControl>
//           <Grid container spacing={2} alignItems="center">
//             <Grid item xs={6}>
//               <DateTimePicker
//                 label="Start Date and Time"
//                 value={chartDateRanges[selectedChartId]?.startDate || null}
//                 onChange={(date) =>
//                   setChartDateRanges((prevRanges) => ({
//                     ...prevRanges,
//                     [selectedChartId]: { ...prevRanges[selectedChartId], startDate: date },
//                   }))
//                 }
//                 renderInput={(params) => <TextField {...params} fullWidth />}
//               />
//             </Grid>
//             <Grid item xs={6}>
//               <DateTimePicker
//                 label="End Date and Time"
//                 value={chartDateRanges[selectedChartId]?.endDate || null}
//                 onChange={(date) =>
//                   setChartDateRanges((prevRanges) => ({
//                     ...prevRanges,
//                     [selectedChartId]: { ...prevRanges[selectedChartId], endDate: date },
//                   }))
//                 }
//                 renderInput={(params) => <TextField {...params} fullWidth />}
//                 disabled={mode === "B"}
//               />
//             </Grid>
//           </Grid>
//           <Box display="flex" justifyContent="flex-end" marginBottom={2}>
//             <FormControl>
//               <InputLabel id="time-range-label">Time Range</InputLabel>
//               <Select
//                 labelId="time-range-label"
//                 value={chartDateRanges[selectedChartId]?.range || ""}
//                 onChange={(e) => handleTimeRangeChange(selectedChartId, e.target.value)}
//               >
//                 <MenuItem value="10_minute">Last 10 minute</MenuItem>
//                 <MenuItem value="30_minutes">Last 30 minutes</MenuItem>
//                 <MenuItem value="1_hour">Last 1 hour</MenuItem>
//                 <MenuItem value="6_hours">Last 6 hour</MenuItem>
//                 <MenuItem value="12_hours">Last 12 hours</MenuItem>
//                 <MenuItem value="1_day">Last 1 day</MenuItem>
//                 <MenuItem value="2_day">Last 2 day</MenuItem>
//                 <MenuItem value="1_week">Last 1 week</MenuItem>
//                 <MenuItem value="1_month">Last 1 month</MenuItem>
//               </Select>
//             </FormControl>
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setDateDialogOpen(false)} color="secondary">
//             Cancel
//           </Button>
//           <Button onClick={handleDateRangeApply} color="primary">
//             Apply
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </LocalizationProvider>
//   );
// };

// export default CustomScatterCharts;

// // import React, { useState, useEffect, useRef } from "react";
// // import { useSelector, useDispatch } from "react-redux";
// // import GridLayout from "react-grid-layout";
// // import {
// //   ScatterChart,
// //   Scatter,
// //   XAxis,
// //   YAxis,
// //   CartesianGrid,
// //   Tooltip,
// //   Legend,
// //   ResponsiveContainer,
// // } from "recharts";
// // import { w3cwebsocket as WebSocketClient } from "websocket";
// // import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
// // import {
// //   Box, Button, IconButton, Dialog, DialogActions, DialogContent,
// //   DialogTitle, FormControl, InputLabel, Select, MenuItem, TextField,
// // } from "@mui/material";
// // import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
// // import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// // import DragHandleIcon from "@mui/icons-material/DragHandle";
// // import DeleteIcon from "@mui/icons-material/Delete";
// // import { SketchPicker } from "react-color";
// // import axios from "axios";
// // import { debounce } from "lodash";
// // import { format, subMinutes, subHours, subDays, subWeeks, subMonths } from "date-fns";
// // import { addChart, removeChart, setLayout, updateChart} from "../../redux/layoutActions";

// // const CustomScatterCharts = () => {
// //   const dispatch = useDispatch();
// //   const layout = useSelector((state) => state.layout.layout);
// //   const charts = useSelector((state) => state.layout.charts);

// //   const [data, setData] = useState({});
// //   const [chartDialogOpen, setChartDialogOpen] = useState(false);
// //   const [tempChartData, setTempChartData] = useState(null);
// //   const [dialogOpen, setDialogOpen] = useState(false);
// //   const [startDate, setStartDate] = useState(null);
// //   const [endDate, setEndDate] = useState(null);
// //   const [selectedTimeRange, setSelectedTimeRange] = useState();
// //   const wsClientRefs = useRef({});

// //   const saveLayout = debounce((newLayout) => {
// //     dispatch(setLayout(newLayout));
// //   }, 500);

// //   const addCustomChart = () => {
// //     const newChartId = `chart${Date.now()}`;
// //     const newChart = {
// //       id: newChartId,
// //       xAxisDataKey: "CW-TT-011",
// //       yAxisDataKey: "CW-TT-021",
// //       xAxisRange: ["auto", "auto"],
// //       yAxisRange: ["auto", "auto"],
// //       color: "#FF0000",
// //     };
// //     dispatch(addChart(newChart));
// //     setChartDialogOpen(false);
// //   };

// //   const deleteChart = (chartId) => {
// //     dispatch(removeChart(chartId));
// //   };

// //   const saveConfiguration = () => {
// //     if (tempChartData) {
// //       dispatch(updateChart(tempChartData)); // Update chart in Redux and localStorage
// //       setDialogOpen(false);
// //     }
// //   };

// //   const renderChart = (chart) => (
// //     <ResponsiveContainer width="100%" height={300}>
// //       <ScatterChart>
// //         <CartesianGrid strokeDasharray="3 3" />
// //         <XAxis
// //           type="number"
// //           dataKey={chart.xAxisDataKey}
// //           name={chart.xAxisDataKey}
// //           domain={chart.xAxisRange}
// //         />
// //         <YAxis
// //           type="number"
// //           dataKey={chart.yAxisDataKey}
// //           name={chart.yAxisDataKey}
// //           domain={chart.yAxisRange}
// //         />
// //         <Tooltip
// //           cursor={{ strokeDasharray: "3 3" }}
// //           content={({ payload }) => {
// //             if (payload && payload.length) {
// //               const point = payload[0].payload;

// //               // Check if `time_bucket` exists, otherwise use the current date/time as timestamp
// //               const timestamp = point.time_bucket
// //                 ? point.time_bucket
// //                 : new Date().toLocaleString();

// //               return (
// //                 <div className="custom-tooltip">
// //                   <p>{`X (${chart.xAxisDataKey}): ${point[chart.xAxisDataKey]}`}</p>
// //                   <p>{`Y (${chart.yAxisDataKey}): ${point[chart.yAxisDataKey]}`}</p>
// //                   <p>{`Timestamp: ${timestamp}`}</p>
// //                 </div>
// //               );
// //             }
// //             return null;
// //           }}
// //         />
// //         <Legend />
// //         <Scatter
// //           name={`${chart.xAxisDataKey} vs ${chart.yAxisDataKey}`}
// //           data={data[chart.id] || []}
// //           fill={chart.color}
// //         />
// //       </ScatterChart>
// //     </ResponsiveContainer>
// //   );

// //   return (
// //     <LocalizationProvider dateAdapter={AdapterDateFns}>
// //       <Box display="flex" justifyContent="flex-end" marginBottom={4}>
// //         <Button variant="contained" color="secondary" onClick={() => setChartDialogOpen(true)}>
// //           Add Scatter Chart
// //         </Button>
// //       </Box>

// //       <GridLayout
// //         className="layout"
// //         layout={layout}
// //         cols={12}
// //         rowHeight={45}
// //         width={1200}
// //         onLayoutChange={(newLayout) => dispatch(setLayout(newLayout))}
// //         onResizeStop={(newLayout) => saveLayout(newLayout)}
// //         onDragStop={(newLayout) => saveLayout(newLayout)}
// //         draggableHandle=".drag-handle"
// //         isResizable
// //         isDraggable
// //       >
// //         {charts.map((chart) => (
// //           <Box
// //             key={chart.id}
// //             data-grid={layout.find((l) => l.i === chart.id) || { x: 0, y: Infinity, w: 6, h: 8 }}
// //             sx={{ position: "relative", border: "1px solid #ccc", borderRadius: "8px", overflow: "hidden", padding: 2 }}
// //           >
// //             <Box display="flex" justifyContent="space-between" p={1}>
// //               <IconButton className="drag-handle" aria-label="drag" size="small">
// //                 <DragHandleIcon />
// //               </IconButton>
// //               <IconButton aria-label="delete" onClick={() => deleteChart(chart.id)} size="small" color="error">
// //                 <DeleteIcon />
// //               </IconButton>
// //             </Box>
// //             {renderChart(chart)}
// //             <Button variant="contained" onClick={() => {
// //               setTempChartData(chart);
// //               setDialogOpen(true);
// //             }}>
// //               Configure Chart
// //             </Button>
// //           </Box>
// //         ))}
// //       </GridLayout>

// //       <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
// //         <DialogTitle>Select Chart Type</DialogTitle>
// //         <DialogContent>
// //           <Button variant="contained" onClick={addCustomChart}>Add XY Chart</Button>
// //         </DialogContent>
// //         <DialogActions>
// //           <Button onClick={() => setChartDialogOpen(false)} color="secondary">Cancel</Button>
// //         </DialogActions>
// //       </Dialog>

// //       <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="md">
// //         <DialogTitle>Configure Chart</DialogTitle>
// //         <DialogContent>
// //           <FormControl fullWidth margin="normal">
// //             <InputLabel>X-Axis Data Key</InputLabel>
// //             <Select
// //               value={tempChartData?.xAxisDataKey || ""}
// //               onChange={(e) => setTempChartData((prevChart) => ({ ...prevChart, xAxisDataKey: e.target.value }))}
// //             >
// //               <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
// //               <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
// //               <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
// //             </Select>
// //           </FormControl>

// //           <FormControl fullWidth margin="normal">
// //             <InputLabel>Y-Axis Data Key</InputLabel>
// //             <Select
// //               value={tempChartData?.yAxisDataKey || ""}
// //               onChange={(e) => setTempChartData((prevChart) => ({ ...prevChart, yAxisDataKey: e.target.value }))}
// //             >
// //               <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
// //               <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
// //               <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
// //             </Select>
// //           </FormControl>

// //           <SketchPicker color={tempChartData?.color || "#000"} onChangeComplete={(color) => {
// //             setTempChartData((prevChart) => ({ ...prevChart, color: color.hex }));
// //           }} />
// //         </DialogContent>
// //         <DialogActions>
// //           <Button onClick={() => setDialogOpen(false)} color="secondary">Cancel</Button>
// //           <Button onClick={saveConfiguration} color="primary">Save</Button>
// //         </DialogActions>
// //       </Dialog>
// //     </LocalizationProvider>
// //   );
// // };

// // export default CustomScatterCharts;

// // import React, { useState, useEffect, useRef } from "react";
// // import GridLayout from "react-grid-layout";
// // import { w3cwebsocket as WebSocketClient } from "websocket"; // Correct import for WebSocketClient
// // import {
// //   ScatterChart,
// //   Scatter,
// //   XAxis,
// //   YAxis,
// //   CartesianGrid,
// //   Tooltip,
// //   Legend,
// //   ResponsiveContainer,
// // } from "recharts";
// // import {
// //   DateTimePicker,
// // } from "@mui/x-date-pickers/DateTimePicker";
// // import DragHandleIcon from "@mui/icons-material/DragHandle";
// // import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// // import {
// //   Container,
// //   Box,
// //   Button,
// //   Dialog,
// //   DialogActions,
// //   DialogContent,
// //   DialogTitle,
// //   FormControl,
// //   InputLabel,
// //   Select,
// //   MenuItem,
// //   TextField,
// //   Grid,
// //   RadioGroup,
// //   FormControlLabel,
// //   Radio,
// // } from "@mui/material";
// // import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
// // import { SketchPicker } from "react-color";
// // import DeleteIcon from "@mui/icons-material/Delete";
// // import IconButton from "@mui/material/IconButton";
// // import axios from "axios";
// // import {
// //   format,
// //   subMinutes,
// //   subHours,
// //   subDays,
// //   subWeeks,
// //   subMonths,
// //   parseISO,
// // } from "date-fns";
// // import { useSelector, useDispatch } from "react-redux";
// // import { addChart, removeChart, setLayout, updateChart} from "../../redux/layoutActions";
// // import { debounce } from "lodash";

// // const CustomScatterCharts = () => {

// //   const dispatch = useDispatch();
// //   const layout = useSelector((state) => state.layout.layout);
// //   const charts = useSelector((state) => state.layout.charts);

// //   const [data, setData] = useState({});

// //   const [chartDialogOpen, setChartDialogOpen] = useState(false);
// //   const [dialogOpen, setDialogOpen] = useState(false);
// //   const [tempChartData, setTempChartData] = useState(null);
// //   const [startDate, setStartDate] = useState(null);
// //   const [endDate, setEndDate] = useState(null);
// //   const [mode, setMode] = useState("A");
// //   const [dateDialogOpen, setDateDialogOpen] = useState(false);
// //   const [selectedChartId, setSelectedChartId] = useState(null);
// //   const wsClientRefs = useRef({});
// //   const [loading, setLoading] = useState(false);
// //   const [selectedTimeRange, setSelectedTimeRange] = useState();

// //   const saveLayout = debounce((newLayout) => {
// //     dispatch(setLayout(newLayout));
// //   }, 500);

// //   const addCustomChart = () => {
// //     const newChartId = `chart${Date.now()}`;
// //     const newChart = {
// //       id: newChartId,
// //       xAxisDataKey: "CW-TT-011",
// //       yAxisDataKey: "CW-TT-021",
// //       xAxisRange: ["auto", "auto"],
// //       yAxisRange: ["auto", "auto"],
// //       color: "#FF0000",
// //     };
// //     dispatch(addChart(newChart));
// //     setChartDialogOpen(false);
// //   };

// //   const deleteChart = (chartId) => {
// //     dispatch(removeChart(chartId));
// //   };

// //   const saveConfiguration = () => {
// //     if (tempChartData) {
// //       dispatch(updateChart(tempChartData)); // Update chart in Redux and localStorage
// //       setDialogOpen(false);
// //     }
// //   };

// //   useEffect(() => {
// //     let start;
// //     switch (selectedTimeRange) {
// //       case "10_minute":
// //         start = subMinutes(new Date(), 10);
// //         break;
// //       case "30_minutes":
// //         start = subMinutes(new Date(), 30);
// //         break;
// //       case "1_hour":
// //         start = subHours(new Date(), 1);
// //         break;
// //       case "6_hours":
// //         start = subHours(new Date(), 6);
// //         break;
// //       case "12_hours":
// //         start = subHours(new Date(), 12);
// //         break;
// //       case "1_day":
// //         start = subDays(new Date(), 1);
// //         break;
// //       case "2_day":
// //         start = subDays(new Date(), 2);
// //         break;
// //       case "1_week":
// //         start = subWeeks(new Date(), 1);
// //         break;
// //       case "1_month":
// //         start = subMonths(new Date(), 1);
// //         break;
// //       default:
// //         start = subMinutes(new Date(), 1);
// //     }
// //     setStartDate(start);
// //     setEndDate(new Date());
// //   }, [selectedTimeRange]);

// //   const handleTimeRangeChange = (event) => {
// //     setSelectedTimeRange(event.target.value);
// //     charts.forEach((chart) => {
// //       fetchHistoricalData(chart.id);
// //     });
// //   };

// //   const saveChartsToLocalStorage = (updatedCharts) => {
// //     const chartConfigurations = updatedCharts.map((chart) => ({
// //       id: chart.id,
// //       xAxisDataKey: chart.xAxisDataKey,
// //       yAxisDataKey: chart.yAxisDataKey,
// //       xAxisRange: chart.xAxisRange,
// //       yAxisRange: chart.yAxisRange,
// //       color: chart.color,
// //     }));
// //     localStorage.setItem("scatterCharts", JSON.stringify(chartConfigurations));
// //   };

// //   const saveLayoutToLocalStorage = (updatedLayout) => {
// //     setLayout(updatedLayout);
// //     localStorage.setItem("scatterChartsLayout", JSON.stringify(updatedLayout));
// //   };
// //   const fetchHistoricalData = async (chartId) => {
// //     if (!startDate) return;
// //     setLoading(true);

// //     try {
// //       const formattedStartDate = format(startDate, "yyyy-MM-dd");
// //       const formattedStartTime = format(startDate, "HH:mm");
// //       const formattedEndDate = mode === "C" ? format(endDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
// //       const formattedEndTime = mode === "C" ? format(endDate, "HH:mm") : format(new Date(), "HH:mm");

// //       const response = await axios.post(
// //         "https://xdeuid6slkki7yxz4zhdbqbzfq0hirkk.lambda-url.us-east-1.on.aws/",
// //         {
// //           start_time: `${formattedStartDate}T${formattedStartTime}`,
// //           end_time: `${formattedEndDate}T${formattedEndTime}`,
// //         }
// //       );

// //       const parsedBody = JSON.parse(response.data.body);
// //       const historicalData = parsedBody.data.map((item) => ({
// //         time_bucket: item[0],
// //         "AX-LT-011": item[1],
// // "AX-LT-021": item[2],
// // "CW-TT-011": item[3],
// // "CW-TT-021": item[4],
// // "CR-LT-011": item[5],
// // "CR-PT-011": item[6],
// // "CR-LT-021": item[7],
// // "CR-PT-021": item[8],
// // "CR-PT-001": item[9],
// // "CR-TT-001": item[10],
// // "CR-FT-001": item[11],
// // "CR-TT-002": item[12],
// // "GS-AT-011": item[13],
// // "GS-AT-012": item[14],
// // "GS-PT-011": item[15],
// // "GS-TT-011": item[16],
// // "GS-AT-022": item[17],
// // "GS-PT-021": item[18],
// // "GS-TT-021": item[19],
// // "PR-TT-001": item[20],
// // "PR-TT-061": item[21],
// // "PR-TT-072": item[22],
// // "PR-FT-001": item[23],
// // "PR-AT-001": item[24],
// // "PR-AT-003": item[25],
// // "PR-AT-005": item[26],
// // "DM-LSH-001": item[27],
// // "DM-LSL-001": item[28],
// // "GS-LSL-021": item[29],
// // "GS-LSL-011": item[30],
// // "PR-VA-301": item[31],
// // "PR-VA-352": item[32],
// // "PR-VA-312": item[33],
// // "PR-VA-351": item[34],
// // "PR-VA-361Ain": item[35],
// // "PR-VA-361Aout": item[36],
// // "PR-VA-361Bin": item[37],
// // "PR-VA-361Bout": item[38],
// // "PR-VA-362Ain": item[39],
// // "PR-VA-362Aout": item[40],
// // "PR-VA-362Bin": item[41],
// // "PR-VA-362Bout": item[42],
// // "N2-VA-311": item[43],
// // "GS-VA-311": item[44],
// // "GS-VA-312": item[45],
// // "N2-VA-321": item[46],
// // "GS-VA-321": item[47],
// // "GS-VA-322": item[48],
// // "GS-VA-022": item[49],
// // "GS-VA-021": item[50],
// // "AX-VA-351": item[51],
// // "AX-VA-311": item[52],
// // "AX-VA-312": item[53],
// // "AX-VA-321": item[54],
// // "AX-VA-322": item[55],
// // "AX-VA-391": item[56],
// // "DM-VA-301": item[57],
// // "DCDB0-VT-001": item[58],
// // "DCDB0-CT-001": item[59],
// // "DCDB1-VT-001": item[60],
// // "DCDB1-CT-001": item[61],
// // "DCDB2-VT-001": item[62],
// // "DCDB2-CT-001": item[63],
// // "DCDB3-VT-001": item[64],
// // "DCDB3-CT-001": item[65],
// // "DCDB4-VT-001": item[66],
// // "DCDB4-CT-001": item[67],
// // "RECT-CT-001": item[68],
// // "RECT-VT-001": item[69],

// //       }));

// //       // Set historical data and start real-time data only after setting completes
// //       setData((prevData) => {
// //         const newData = {
// //           ...prevData,
// //           [chartId]: historicalData,
// //         };

// //         // Start real-time WebSocket only after setting historical data
// //         if (mode === "B") {
// //           setupRealTimeWebSocket(chartId);
// //         }

// //         return newData;
// //       });
// //     } catch (error) {
// //       console.error("Error fetching historical data:", error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };
// // // WebSocket setup for real-time data updates
// // const setupRealTimeWebSocket = (chartId) => {
// //   if (wsClientRefs.current[chartId]) {
// //     wsClientRefs.current[chartId].close(); // Close any existing WebSocket connection
// //   }

// //   // Establish a new WebSocket connection
// //   wsClientRefs.current[chartId] = new WebSocketClient(
// //     "wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/"
// //   );

// //   wsClientRefs.current[chartId].onopen = () => {
// //     console.log(`WebSocket connection established for chart ${chartId}`);
// //   };

// //   wsClientRefs.current[chartId].onmessage = (message) => {
// //     try {
// //       const receivedData = JSON.parse(message.data);
// //       const newData = {
// //         timestamp: receivedData.timestamp || Date.now(),
// //      "AX-LT-011": receivedData["AX-LT-011"] || null,
// // "AX-LT-021": receivedData["AX-LT-021"] || null,
// // "CW-TT-011": receivedData["CW-TT-011"] || null,
// // "CW-TT-021": receivedData["CW-TT-021"] || null,
// // "CR-LT-011": receivedData["CR-LT-011"] || null,
// // "CR-PT-011": receivedData["CR-PT-011"] || null,
// // "CR-LT-021": receivedData["CR-LT-021"] || null,
// // "CR-PT-021": receivedData["CR-PT-021"] || null,
// // "CR-PT-001": receivedData["CR-PT-001"] || null,
// // "CR-TT-001": receivedData["CR-TT-001"] || null,
// // "CR-FT-001": receivedData["CR-FT-001"] || null,
// // "CR-TT-002": receivedData["CR-TT-002"] || null,
// // "GS-AT-011": receivedData["GS-AT-011"] || null,
// // "GS-AT-012": receivedData["GS-AT-012"] || null,
// // "GS-PT-011": receivedData["GS-PT-011"] || null,
// // "GS-TT-011": receivedData["GS-TT-011"] || null,
// // "GS-AT-022": receivedData["GS-AT-022"] || null,
// // "GS-PT-021": receivedData["GS-PT-021"] || null,
// // "GS-TT-021": receivedData["GS-TT-021"] || null,
// // "PR-TT-001": receivedData["PR-TT-001"] || null,
// // "PR-TT-061": receivedData["PR-TT-061"] || null,
// // "PR-TT-072": receivedData["PR-TT-072"] || null,
// // "PR-FT-001": receivedData["PR-FT-001"] || null,
// // "PR-AT-001": receivedData["PR-AT-001"] || null,
// // "PR-AT-003": receivedData["PR-AT-003"] || null,
// // "PR-AT-005": receivedData["PR-AT-005"] || null,
// // "DM-LSH-001": receivedData["DM-LSH-001"] || null,
// // "DM-LSL-001": receivedData["DM-LSL-001"] || null,
// // "GS-LSL-021": receivedData["GS-LSL-021"] || null,
// // "GS-LSL-011": receivedData["GS-LSL-011"] || null,
// // "PR-VA-301": receivedData["PR-VA-301"] || null,
// // "PR-VA-352": receivedData["PR-VA-352"] || null,
// // "PR-VA-312": receivedData["PR-VA-312"] || null,
// // "PR-VA-351": receivedData["PR-VA-351"] || null,
// // "PR-VA-361Ain": receivedData["PR-VA-361Ain"] || null,
// // "PR-VA-361Aout": receivedData["PR-VA-361Aout"] || null,
// // "PR-VA-361Bin": receivedData["PR-VA-361Bin"] || null,
// // "PR-VA-361Bout": receivedData["PR-VA-361Bout"] || null,
// // "PR-VA-362Ain": receivedData["PR-VA-362Ain"] || null,
// // "PR-VA-362Aout": receivedData["PR-VA-362Aout"] || null,
// // "PR-VA-362Bin": receivedData["PR-VA-362Bin"] || null,
// // "PR-VA-362Bout": receivedData["PR-VA-362Bout"] || null,
// // "N2-VA-311": receivedData["N2-VA-311"] || null,
// // "GS-VA-311": receivedData["GS-VA-311"] || null,
// // "GS-VA-312": receivedData["GS-VA-312"] || null,
// // "N2-VA-321": receivedData["N2-VA-321"] || null,
// // "GS-VA-321": receivedData["GS-VA-321"] || null,
// // "GS-VA-322": receivedData["GS-VA-322"] || null,
// // "GS-VA-022": receivedData["GS-VA-022"] || null,
// // "GS-VA-021": receivedData["GS-VA-021"] || null,
// // "AX-VA-351": receivedData["AX-VA-351"] || null,
// // "AX-VA-311": receivedData["AX-VA-311"] || null,
// // "AX-VA-312": receivedData["AX-VA-312"] || null,
// // "AX-VA-321": receivedData["AX-VA-321"] || null,
// // "AX-VA-322": receivedData["AX-VA-322"] || null,
// // "AX-VA-391": receivedData["AX-VA-391"] || null,
// // "DM-VA-301": receivedData["DM-VA-301"] || null,
// // "DCDB0-VT-001": receivedData["DCDB0-VT-001"] || null,
// // "DCDB0-CT-001": receivedData["DCDB0-CT-001"] || null,
// // "DCDB1-VT-001": receivedData["DCDB1-VT-001"] || null,
// // "DCDB1-CT-001": receivedData["DCDB1-CT-001"] || null,
// // "DCDB2-VT-001": receivedData["DCDB2-VT-001"] || null,
// // "DCDB2-CT-001": receivedData["DCDB2-CT-001"] || null,
// // "DCDB3-VT-001": receivedData["DCDB3-VT-001"] || null,
// // "DCDB3-CT-001": receivedData["DCDB3-CT-001"] || null,
// // "DCDB4-VT-001": receivedData["DCDB4-VT-001"] || null,
// // "DCDB4-CT-001": receivedData["DCDB4-CT-001"] || null,
// // "RECT-CT-001": receivedData["RECT-CT-001"] || null,
// // "RECT-VT-001": receivedData["RECT-VT-001"] || null,

// //       };

// //       // Append new real-time data to the existing chart data
// //       setData((prevData) => ({
// //         ...prevData,
// //         [chartId]: [...(prevData[chartId] || []), newData],
// //       }));
// //     } catch (error) {
// //       console.error("Error processing WebSocket message:", error);
// //     }
// //   };

// //   wsClientRefs.current[chartId].onclose = () => {
// //     console.warn(`WebSocket connection closed for chart ${chartId}. Reconnecting...`);
// //     setTimeout(() => setupRealTimeWebSocket(chartId), 1000); // Attempt to reconnect after a delay
// //   };
// // };
// //   // Function to apply the date range and initiate data fetch and real-time plotting
// //   const handleDateRangeApply = () => {
// //     setDateDialogOpen(false);

// //     // Fetch data and start real-time plotting based on mode
// //     if (mode === "B" || mode === "C") {
// //       charts.forEach((chart) => fetchHistoricalData(chart.id));
// //     }
// //   };

// //   const renderChart = (chart) => (
// //     <ResponsiveContainer width="100%" height={300}>
// //   <ScatterChart>
// //     <CartesianGrid strokeDasharray="3 3" />
// //     <XAxis
// //       type="number"
// //       dataKey={chart.xAxisDataKey}
// //       name={chart.xAxisDataKey}
// //       domain={[chart.xAxisRange[0], chart.xAxisRange[1]]}
// //     />
// //     <YAxis
// //       type="number"
// //       dataKey={chart.yAxisDataKey}
// //       name={chart.yAxisDataKey}
// //       domain={[chart.yAxisRange[0], chart.yAxisRange[1]]}
// //     />
// //     <Tooltip
// //       cursor={{ strokeDasharray: '3 3' }}
// //       content={({ payload }) => {
// //         if (payload && payload.length) {
// //           const point = payload[0].payload;

// //           // Check if `time_bucket` exists. If not, show the real-time current date/time
// //           const timestamp = point.time_bucket
// //             ? point.time_bucket
// //             : new Date().toLocaleString(); // Get current real-time date and time

// //           return (
// //             <div className="custom-tooltip">
// //               <p>{`X (${chart.xAxisDataKey}): ${point[chart.xAxisDataKey]}`}</p>
// //               <p>{`Y (${chart.yAxisDataKey}): ${point[chart.yAxisDataKey]}`}</p>
// //               <p>{`Timestamp: ${timestamp}`}</p>
// //             </div>
// //           );
// //         }
// //         return null;
// //       }}
// //     />
// //     <Legend />
// //     <Scatter
// //       name={`${chart.xAxisDataKey} vs ${chart.yAxisDataKey}`}
// //       data={data[chart.id] || []}
// //       fill={chart.color}
// //     />
// //   </ScatterChart>
// // </ResponsiveContainer>
// //   );
// //   return (
// //     <LocalizationProvider dateAdapter={AdapterDateFns}>

// //         <Box display="flex" justifyContent="flex-end" marginBottom={4}>
// //           <Button
// //             variant="contained"
// //             color="secondary"
// //             onClick={() => setChartDialogOpen(true)}
// //           >
// //             Add Scatter Chart
// //           </Button>
// //         </Box>
// //         <GridLayout
// //           className="layout"
// //           layout={layout}
// //           cols={12}
// //           rowHeight={45}
// //           width={1910}
// //           onLayoutChange={saveLayoutToLocalStorage}
// //           draggableHandle=".drag-handle"
// //           isResizable
// //         >
// //           {charts.map((chart) => (
// //             <Box
// //               key={chart.id}
// //               data-grid={layout.find((l) => l.i === chart.id.toString()) || { x: 0, y: Infinity, w: 6, h: 8 }}
// //               sx={{
// //                 position: "relative",
// //                 border: "1px solid #ccc",
// //                 borderRadius: "8px",
// //                 overflow: "hidden",
// //                 padding: 2,
// //               }}
// //             >
// //               <Box display="flex" justifyContent="space-between" p={1}>
// //                 <IconButton className="drag-handle">
// //                   <DragHandleIcon />
// //                 </IconButton>
// //                 <IconButton
// //                   aria-label="delete"
// //                   onClick={() => deleteChart(chart.id)}
// //                 >
// //                   <DeleteIcon />
// //                 </IconButton>
// //               </Box>
// //               {renderChart(chart)}
// //               <Box display="flex" justifyContent="space-around" mt={2} gap={2}>
// //                 <Button
// //                   variant="contained"
// //                   color="secondary"
// //                   onClick={() => {
// //                     setTempChartData(chart);
// //                     setDialogOpen(true);
// //                   }}
// //                 >
// //                   Configure Chart
// //                 </Button>
// //                 <Button
// //                   variant="contained"
// //                 color="secondary"
// //                   onClick={() => {
// //                     setSelectedChartId(chart.id);
// //                     setDateDialogOpen(true);
// //                   }}
// //                 >
// //                   Select Date Range
// //                 </Button>
// //               </Box>
// //             </Box>
// //           ))}
// //         </GridLayout>

// //         <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
// //           <DialogTitle>Select Chart Type</DialogTitle>
// //           <DialogContent>
// //             <Box display="flex" flexDirection="column" gap={2}>
// //               <Button variant="contained" onClick={addCustomChart}>
// //                 Add XY Chart
// //               </Button>
// //             </Box>
// //           </DialogContent>
// //           <DialogActions>
// //             <Button onClick={() => setChartDialogOpen(false)} color="secondary">
// //               Cancel
// //             </Button>
// //           </DialogActions>
// //         </Dialog>

// //         <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="md">
// //           <DialogTitle>Configure Chart</DialogTitle>
// //           <DialogContent>
// //             <FormControl fullWidth margin="normal">
// //               <InputLabel>X-Axis Data Key</InputLabel>
// //               <Select
// //                 value={tempChartData?.xAxisDataKey}
// //                 onChange={(e) =>
// //                   setTempChartData((prevChart) => ({
// //                     ...prevChart,
// //                     xAxisDataKey: e.target.value,
// //                   }))
// //                 }
// //               >
// //               <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
// // <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
// // <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
// // <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
// // <MenuItem value="CR-LT-011">CR-LT-011</MenuItem>
// // <MenuItem value="CR-PT-011">CR-PT-011</MenuItem>
// // <MenuItem value="CR-LT-021">CR-LT-021</MenuItem>
// // <MenuItem value="CR-PT-021">CR-PT-021</MenuItem>
// // <MenuItem value="CR-PT-001">CR-PT-001</MenuItem>
// // <MenuItem value="CR-TT-001">CR-TT-001</MenuItem>
// // <MenuItem value="CR-FT-001">CR-FT-001</MenuItem>
// // <MenuItem value="CR-TT-002">CR-TT-002</MenuItem>
// // <MenuItem value="GS-AT-011">GS-AT-011</MenuItem>
// // <MenuItem value="GS-AT-012">GS-AT-012</MenuItem>
// // <MenuItem value="GS-PT-011">GS-PT-011</MenuItem>
// // <MenuItem value="GS-TT-011">GS-TT-011</MenuItem>
// // <MenuItem value="GS-AT-022">GS-AT-022</MenuItem>
// // <MenuItem value="GS-PT-021">GS-PT-021</MenuItem>
// // <MenuItem value="GS-TT-021">GS-TT-021</MenuItem>
// // <MenuItem value="PR-TT-001">PR-TT-001</MenuItem>
// // <MenuItem value="PR-TT-061">PR-TT-061</MenuItem>
// // <MenuItem value="PR-TT-072">PR-TT-072</MenuItem>
// // <MenuItem value="PR-FT-001">PR-FT-001</MenuItem>
// // <MenuItem value="PR-AT-001">PR-AT-001</MenuItem>
// // <MenuItem value="PR-AT-003">PR-AT-003</MenuItem>
// // <MenuItem value="PR-AT-005">PR-AT-005</MenuItem>
// // <MenuItem value="DM-LSH-001">DM-LSH-001</MenuItem>
// // <MenuItem value="DM-LSL-001">DM-LSL-001</MenuItem>
// // <MenuItem value="GS-LSL-021">GS-LSL-021</MenuItem>
// // <MenuItem value="GS-LSL-011">GS-LSL-011</MenuItem>
// // <MenuItem value="PR-VA-301">PR-VA-301</MenuItem>
// // <MenuItem value="PR-VA-352">PR-VA-352</MenuItem>
// // <MenuItem value="PR-VA-312">PR-VA-312</MenuItem>
// // <MenuItem value="PR-VA-351">PR-VA-351</MenuItem>
// // <MenuItem value="PR-VA-361Ain">PR-VA-361Ain</MenuItem>
// // <MenuItem value="PR-VA-361Aout">PR-VA-361Aout</MenuItem>
// // <MenuItem value="PR-VA-361Bin">PR-VA-361Bin</MenuItem>
// // <MenuItem value="PR-VA-361Bout">PR-VA-361Bout</MenuItem>
// // <MenuItem value="PR-VA-362Ain">PR-VA-362Ain</MenuItem>
// // <MenuItem value="PR-VA-362Aout">PR-VA-362Aout</MenuItem>
// // <MenuItem value="PR-VA-362Bin">PR-VA-362Bin</MenuItem>
// // <MenuItem value="PR-VA-362Bout">PR-VA-362Bout</MenuItem>
// // <MenuItem value="N2-VA-311">N2-VA-311</MenuItem>
// // <MenuItem value="GS-VA-311">GS-VA-311</MenuItem>
// // <MenuItem value="GS-VA-312">GS-VA-312</MenuItem>
// // <MenuItem value="N2-VA-321">N2-VA-321</MenuItem>
// // <MenuItem value="GS-VA-321">GS-VA-321</MenuItem>
// // <MenuItem value="GS-VA-322">GS-VA-322</MenuItem>
// // <MenuItem value="GS-VA-022">GS-VA-022</MenuItem>
// // <MenuItem value="GS-VA-021">GS-VA-021</MenuItem>
// // <MenuItem value="AX-VA-351">AX-VA-351</MenuItem>
// // <MenuItem value="AX-VA-311">AX-VA-311</MenuItem>
// // <MenuItem value="AX-VA-312">AX-VA-312</MenuItem>
// // <MenuItem value="AX-VA-321">AX-VA-321</MenuItem>
// // <MenuItem value="AX-VA-322">AX-VA-322</MenuItem>
// // <MenuItem value="AX-VA-391">AX-VA-391</MenuItem>
// // <MenuItem value="DM-VA-301">DM-VA-301</MenuItem>
// // <MenuItem value="DCDB0-VT-001">DCDB0-VT-001</MenuItem>
// // <MenuItem value="DCDB0-CT-001">DCDB0-CT-001</MenuItem>
// // <MenuItem value="DCDB1-VT-001">DCDB1-VT-001</MenuItem>
// // <MenuItem value="DCDB1-CT-001">DCDB1-CT-001</MenuItem>
// // <MenuItem value="DCDB2-VT-001">DCDB2-VT-001</MenuItem>
// // <MenuItem value="DCDB2-CT-001">DCDB2-CT-001</MenuItem>
// // <MenuItem value="DCDB3-VT-001">DCDB3-VT-001</MenuItem>
// // <MenuItem value="DCDB3-CT-001">DCDB3-CT-001</MenuItem>
// // <MenuItem value="DCDB4-VT-001">DCDB4-VT-001</MenuItem>
// // <MenuItem value="DCDB4-CT-001">DCDB4-CT-001</MenuItem>
// // <MenuItem value="RECT-CT-001">RECT-CT-001</MenuItem>
// // <MenuItem value="RECT-VT-001">RECT-VT-001</MenuItem>

// //               </Select>
// //             </FormControl>

// //             <FormControl fullWidth margin="normal">
// //               <InputLabel>Y-Axis Data Key</InputLabel>
// //               <Select
// //                 value={tempChartData?.yAxisDataKey}
// //                 onChange={(e) =>
// //                   setTempChartData((prevChart) => ({
// //                     ...prevChart,
// //                     yAxisDataKey: e.target.value,
// //                   }))
// //                 }
// //               >
// //                <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
// // <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
// // <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
// // <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
// // <MenuItem value="CR-LT-011">CR-LT-011</MenuItem>
// // <MenuItem value="CR-PT-011">CR-PT-011</MenuItem>
// // <MenuItem value="CR-LT-021">CR-LT-021</MenuItem>
// // <MenuItem value="CR-PT-021">CR-PT-021</MenuItem>
// // <MenuItem value="CR-PT-001">CR-PT-001</MenuItem>
// // <MenuItem value="CR-TT-001">CR-TT-001</MenuItem>
// // <MenuItem value="CR-FT-001">CR-FT-001</MenuItem>
// // <MenuItem value="CR-TT-002">CR-TT-002</MenuItem>
// // <MenuItem value="GS-AT-011">GS-AT-011</MenuItem>
// // <MenuItem value="GS-AT-012">GS-AT-012</MenuItem>
// // <MenuItem value="GS-PT-011">GS-PT-011</MenuItem>
// // <MenuItem value="GS-TT-011">GS-TT-011</MenuItem>
// // <MenuItem value="GS-AT-022">GS-AT-022</MenuItem>
// // <MenuItem value="GS-PT-021">GS-PT-021</MenuItem>
// // <MenuItem value="GS-TT-021">GS-TT-021</MenuItem>
// // <MenuItem value="PR-TT-001">PR-TT-001</MenuItem>
// // <MenuItem value="PR-TT-061">PR-TT-061</MenuItem>
// // <MenuItem value="PR-TT-072">PR-TT-072</MenuItem>
// // <MenuItem value="PR-FT-001">PR-FT-001</MenuItem>
// // <MenuItem value="PR-AT-001">PR-AT-001</MenuItem>
// // <MenuItem value="PR-AT-003">PR-AT-003</MenuItem>
// // <MenuItem value="PR-AT-005">PR-AT-005</MenuItem>
// // <MenuItem value="DM-LSH-001">DM-LSH-001</MenuItem>
// // <MenuItem value="DM-LSL-001">DM-LSL-001</MenuItem>
// // <MenuItem value="GS-LSL-021">GS-LSL-021</MenuItem>
// // <MenuItem value="GS-LSL-011">GS-LSL-011</MenuItem>
// // <MenuItem value="PR-VA-301">PR-VA-301</MenuItem>
// // <MenuItem value="PR-VA-352">PR-VA-352</MenuItem>
// // <MenuItem value="PR-VA-312">PR-VA-312</MenuItem>
// // <MenuItem value="PR-VA-351">PR-VA-351</MenuItem>
// // <MenuItem value="PR-VA-361Ain">PR-VA-361Ain</MenuItem>
// // <MenuItem value="PR-VA-361Aout">PR-VA-361Aout</MenuItem>
// // <MenuItem value="PR-VA-361Bin">PR-VA-361Bin</MenuItem>
// // <MenuItem value="PR-VA-361Bout">PR-VA-361Bout</MenuItem>
// // <MenuItem value="PR-VA-362Ain">PR-VA-362Ain</MenuItem>
// // <MenuItem value="PR-VA-362Aout">PR-VA-362Aout</MenuItem>
// // <MenuItem value="PR-VA-362Bin">PR-VA-362Bin</MenuItem>
// // <MenuItem value="PR-VA-362Bout">PR-VA-362Bout</MenuItem>
// // <MenuItem value="N2-VA-311">N2-VA-311</MenuItem>
// // <MenuItem value="GS-VA-311">GS-VA-311</MenuItem>
// // <MenuItem value="GS-VA-312">GS-VA-312</MenuItem>
// // <MenuItem value="N2-VA-321">N2-VA-321</MenuItem>
// // <MenuItem value="GS-VA-321">GS-VA-321</MenuItem>
// // <MenuItem value="GS-VA-322">GS-VA-322</MenuItem>
// // <MenuItem value="GS-VA-022">GS-VA-022</MenuItem>
// // <MenuItem value="GS-VA-021">GS-VA-021</MenuItem>
// // <MenuItem value="AX-VA-351">AX-VA-351</MenuItem>
// // <MenuItem value="AX-VA-311">AX-VA-311</MenuItem>
// // <MenuItem value="AX-VA-312">AX-VA-312</MenuItem>
// // <MenuItem value="AX-VA-321">AX-VA-321</MenuItem>
// // <MenuItem value="AX-VA-322">AX-VA-322</MenuItem>
// // <MenuItem value="AX-VA-391">AX-VA-391</MenuItem>
// // <MenuItem value="DM-VA-301">DM-VA-301</MenuItem>
// // <MenuItem value="DCDB0-VT-001">DCDB0-VT-001</MenuItem>
// // <MenuItem value="DCDB0-CT-001">DCDB0-CT-001</MenuItem>
// // <MenuItem value="DCDB1-VT-001">DCDB1-VT-001</MenuItem>
// // <MenuItem value="DCDB1-CT-001">DCDB1-CT-001</MenuItem>
// // <MenuItem value="DCDB2-VT-001">DCDB2-VT-001</MenuItem>
// // <MenuItem value="DCDB2-CT-001">DCDB2-CT-001</MenuItem>
// // <MenuItem value="DCDB3-VT-001">DCDB3-VT-001</MenuItem>
// // <MenuItem value="DCDB3-CT-001">DCDB3-CT-001</MenuItem>
// // <MenuItem value="DCDB4-VT-001">DCDB4-VT-001</MenuItem>
// // <MenuItem value="DCDB4-CT-001">DCDB4-CT-001</MenuItem>
// // <MenuItem value="RECT-CT-001">RECT-CT-001</MenuItem>
// // <MenuItem value="RECT-VT-001">RECT-VT-001</MenuItem>

// //               </Select>
// //             </FormControl>

// //             <Button onClick={() => setDialogOpen(true)}>Select Color</Button>
// //             <SketchPicker color={tempChartData?.color} onChangeComplete={(color) => {
// //               setTempChartData((prevChart) => ({
// //                 ...prevChart,
// //                 color: color.hex
// //               }));
// //             }} />
// //           </DialogContent>
// //           <DialogActions>
// //             <Button onClick={() => setDialogOpen(false)} color="secondary">
// //               Cancel
// //             </Button>
// //             <Button onClick={saveConfiguration} color="primary">
// //               Save
// //             </Button>
// //           </DialogActions>
// //         </Dialog>

// //         <Dialog open={dateDialogOpen} onClose={() => setDateDialogOpen(false)} fullWidth maxWidth="sm">
// //           <DialogTitle>Select Date Range</DialogTitle>
// //           <DialogContent>
// //             <FormControl component="fieldset">
// //               <RadioGroup row value={mode} onChange={(e) => setMode(e.target.value)}>
// //               <FormControlLabel value="C" control={<Radio />} label="Select Date Range" />
// //                 <FormControlLabel value="B" control={<Radio />} label="Start Date & Continue Real-Time" />
// //               </RadioGroup>
// //             </FormControl>
// //             <Grid container spacing={2} alignItems="center">
// //               <Grid item xs={6}>
// //                 <DateTimePicker
// //                   label="Start Date and Time"
// //                   value={startDate}
// //                   onChange={setStartDate}
// //                   renderInput={(params) => <TextField {...params} fullWidth />}
// //                 />
// //               </Grid>
// //               <Grid item xs={6}>
// //                 <DateTimePicker
// //                   label="End Date and Time"
// //                   value={endDate}
// //                   onChange={setEndDate}
// //                   renderInput={(params) => <TextField {...params} fullWidth />}
// //                   disabled={mode === "B"}
// //                 />
// //               </Grid>
// //             </Grid>
// //             <Box display="flex" justifyContent="flex-end" marginBottom={2}>
// //             <FormControl>
// //               <InputLabel id="time-range-label">Time Range</InputLabel>
// //               <Select
// //                 labelId="time-range-label"
// //                 value={selectedTimeRange}
// //                 onChange={handleTimeRangeChange}
// //               >
// //                 <MenuItem value="10_minute">Last 10 minute</MenuItem>
// //                 <MenuItem value="30_minutes">Last 30 minutes</MenuItem>
// //                 <MenuItem value="1_hour">Last 1 hour</MenuItem>
// //                 <MenuItem value="6_hours">Last 6 hour</MenuItem>
// //                 <MenuItem value="12_hours">Last 12 hours</MenuItem>
// //                 <MenuItem value="1_day">Last 1 day</MenuItem>
// //                 <MenuItem value="2_day">Last 2 day</MenuItem>
// //                 <MenuItem value="1_week">Last 1 week</MenuItem>
// //                 <MenuItem value="1_month">Last 1 month</MenuItem>
// //               </Select>
// //             </FormControl>
// //           </Box>
// //           </DialogContent>
// //           <DialogActions>
// //             <Button onClick={() => setDateDialogOpen(false)} color="secondary">
// //               Cancel
// //             </Button>
// //             <Button onClick={handleDateRangeApply} color="primary">
// //               Apply
// //             </Button>
// //           </DialogActions>
// //         </Dialog>
// //     </LocalizationProvider>
// //   );
// // };

// // export default CustomScatterCharts;

// // import React, { useState, useEffect, useRef } from "react";
// // import GridLayout from "react-grid-layout";
// // import { w3cwebsocket as WebSocketClient } from "websocket"; // Correct import for WebSocketClient
// // import {
// //   ScatterChart,
// //   Scatter,
// //   XAxis,
// //   YAxis,
// //   CartesianGrid,
// //   Tooltip,
// //   Legend,
// //   ResponsiveContainer,
// // } from "recharts";
// // import {
// //   DateTimePicker,
// // } from "@mui/x-date-pickers/DateTimePicker";
// // import DragHandleIcon from "@mui/icons-material/DragHandle";
// // import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// // import {
// //   Container,
// //   Box,
// //   Button,
// //   Dialog,
// //   DialogActions,
// //   DialogContent,
// //   DialogTitle,
// //   FormControl,
// //   InputLabel,
// //   Select,
// //   MenuItem,
// //   TextField,
// //   Grid,
// //   RadioGroup,
// //   FormControlLabel,
// //   Radio,
// // } from "@mui/material";
// // import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
// // import { SketchPicker } from "react-color";
// // import DeleteIcon from "@mui/icons-material/Delete";
// // import IconButton from "@mui/material/IconButton";
// // import axios from "axios";
// // import {
// //   format,
// //   subMinutes,
// //   subHours,
// //   subDays,
// //   subWeeks,
// //   subMonths,
// //   parseISO,
// // } from "date-fns";
// // const CustomScatterCharts = () => {
// //   const [data, setData] = useState({});
// //   const [charts, setCharts] = useState([]);
// //   const [layout, setLayout] = useState(() => {
// //     const savedLayout = localStorage.getItem("scatterChartsLayout");
// //     return savedLayout ? JSON.parse(savedLayout) : [];
// //   });
// //   const [chartDialogOpen, setChartDialogOpen] = useState(false);
// //   const [dialogOpen, setDialogOpen] = useState(false);
// //   const [tempChartData, setTempChartData] = useState(null);
// //   const [startDate, setStartDate] = useState(null);
// //   const [endDate, setEndDate] = useState(null);
// //   const [mode, setMode] = useState("A");
// //   const [dateDialogOpen, setDateDialogOpen] = useState(false);
// //   const [selectedChartId, setSelectedChartId] = useState(null);
// //   const wsClientRefs = useRef({});
// //   const [loading, setLoading] = useState(false);
// //   const [selectedTimeRange, setSelectedTimeRange] = useState();

// //   // Load saved charts from localStorage on component mount
// //   useEffect(() => {
// //     const savedCharts = localStorage.getItem("scatterCharts");
// //     if (savedCharts) {
// //       setCharts(JSON.parse(savedCharts));
// //     }
// //   }, []);

// //   useEffect(() => {
// //     let start;
// //     switch (selectedTimeRange) {
// //       case "10_minute":
// //         start = subMinutes(new Date(), 10);
// //         break;
// //       case "30_minutes":
// //         start = subMinutes(new Date(), 30);
// //         break;
// //       case "1_hour":
// //         start = subHours(new Date(), 1);
// //         break;
// //       case "6_hours":
// //         start = subHours(new Date(), 6);
// //         break;
// //       case "12_hours":
// //         start = subHours(new Date(), 12);
// //         break;
// //       case "1_day":
// //         start = subDays(new Date(), 1);
// //         break;
// //       case "2_day":
// //         start = subDays(new Date(), 2);
// //         break;
// //       case "1_week":
// //         start = subWeeks(new Date(), 1);
// //         break;
// //       case "1_month":
// //         start = subMonths(new Date(), 1);
// //         break;
// //       default:
// //         start = subMinutes(new Date(), 1);
// //     }
// //     setStartDate(start);
// //     setEndDate(new Date());
// //   }, [selectedTimeRange]);

// //   const handleTimeRangeChange = (event) => {
// //     setSelectedTimeRange(event.target.value);
// //     charts.forEach((chart) => {
// //       fetchHistoricalData(chart.id);
// //     });
// //   };

// //   const saveChartsToLocalStorage = (updatedCharts) => {
// //     const chartConfigurations = updatedCharts.map((chart) => ({
// //       id: chart.id,
// //       xAxisDataKey: chart.xAxisDataKey,
// //       yAxisDataKey: chart.yAxisDataKey,
// //       xAxisRange: chart.xAxisRange,
// //       yAxisRange: chart.yAxisRange,
// //       color: chart.color,
// //     }));
// //     localStorage.setItem("scatterCharts", JSON.stringify(chartConfigurations));
// //   };

// //   const saveLayoutToLocalStorage = (updatedLayout) => {
// //     setLayout(updatedLayout);
// //     localStorage.setItem("scatterChartsLayout", JSON.stringify(updatedLayout));
// //   };

// //   const saveConfiguration = () => {
// //     const updatedCharts = charts.map((chart) =>
// //       chart.id === tempChartData.id ? tempChartData : chart
// //     );
// //     setCharts(updatedCharts);
// //     saveChartsToLocalStorage(updatedCharts);
// //     setDialogOpen(false);
// //   };

// //   const fetchHistoricalData = async (chartId) => {
// //     if (!startDate) return;
// //     setLoading(true);

// //     try {
// //       const formattedStartDate = format(startDate, "yyyy-MM-dd");
// //       const formattedStartTime = format(startDate, "HH:mm");
// //       const formattedEndDate = mode === "C" ? format(endDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
// //       const formattedEndTime = mode === "C" ? format(endDate, "HH:mm") : format(new Date(), "HH:mm");

// //       const response = await axios.post(
// //         "https://xdeuid6slkki7yxz4zhdbqbzfq0hirkk.lambda-url.us-east-1.on.aws/",
// //         {
// //           start_time: `${formattedStartDate}T${formattedStartTime}`,
// //           end_time: `${formattedEndDate}T${formattedEndTime}`,
// //         }
// //       );

// //       const parsedBody = JSON.parse(response.data.body);
// //       const historicalData = parsedBody.data.map((item) => ({
// //         time_bucket: item[0],
// //         "AX-LT-011": item[1],
// // "AX-LT-021": item[2],
// // "CW-TT-011": item[3],
// // "CW-TT-021": item[4],
// // "CR-LT-011": item[5],
// // "CR-PT-011": item[6],
// // "CR-LT-021": item[7],
// // "CR-PT-021": item[8],
// // "CR-PT-001": item[9],
// // "CR-TT-001": item[10],
// // "CR-FT-001": item[11],
// // "CR-TT-002": item[12],
// // "GS-AT-011": item[13],
// // "GS-AT-012": item[14],
// // "GS-PT-011": item[15],
// // "GS-TT-011": item[16],
// // "GS-AT-022": item[17],
// // "GS-PT-021": item[18],
// // "GS-TT-021": item[19],
// // "PR-TT-001": item[20],
// // "PR-TT-061": item[21],
// // "PR-TT-072": item[22],
// // "PR-FT-001": item[23],
// // "PR-AT-001": item[24],
// // "PR-AT-003": item[25],
// // "PR-AT-005": item[26],
// // "DM-LSH-001": item[27],
// // "DM-LSL-001": item[28],
// // "GS-LSL-021": item[29],
// // "GS-LSL-011": item[30],
// // "PR-VA-301": item[31],
// // "PR-VA-352": item[32],
// // "PR-VA-312": item[33],
// // "PR-VA-351": item[34],
// // "PR-VA-361Ain": item[35],
// // "PR-VA-361Aout": item[36],
// // "PR-VA-361Bin": item[37],
// // "PR-VA-361Bout": item[38],
// // "PR-VA-362Ain": item[39],
// // "PR-VA-362Aout": item[40],
// // "PR-VA-362Bin": item[41],
// // "PR-VA-362Bout": item[42],
// // "N2-VA-311": item[43],
// // "GS-VA-311": item[44],
// // "GS-VA-312": item[45],
// // "N2-VA-321": item[46],
// // "GS-VA-321": item[47],
// // "GS-VA-322": item[48],
// // "GS-VA-022": item[49],
// // "GS-VA-021": item[50],
// // "AX-VA-351": item[51],
// // "AX-VA-311": item[52],
// // "AX-VA-312": item[53],
// // "AX-VA-321": item[54],
// // "AX-VA-322": item[55],
// // "AX-VA-391": item[56],
// // "DM-VA-301": item[57],
// // "DCDB0-VT-001": item[58],
// // "DCDB0-CT-001": item[59],
// // "DCDB1-VT-001": item[60],
// // "DCDB1-CT-001": item[61],
// // "DCDB2-VT-001": item[62],
// // "DCDB2-CT-001": item[63],
// // "DCDB3-VT-001": item[64],
// // "DCDB3-CT-001": item[65],
// // "DCDB4-VT-001": item[66],
// // "DCDB4-CT-001": item[67],
// // "RECT-CT-001": item[68],
// // "RECT-VT-001": item[69],

// //       }));

// //       // Set historical data and start real-time data only after setting completes
// //       setData((prevData) => {
// //         const newData = {
// //           ...prevData,
// //           [chartId]: historicalData,
// //         };

// //         // Start real-time WebSocket only after setting historical data
// //         if (mode === "B") {
// //           setupRealTimeWebSocket(chartId);
// //         }

// //         return newData;
// //       });
// //     } catch (error) {
// //       console.error("Error fetching historical data:", error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };
// // // WebSocket setup for real-time data updates
// // const setupRealTimeWebSocket = (chartId) => {
// //   if (wsClientRefs.current[chartId]) {
// //     wsClientRefs.current[chartId].close(); // Close any existing WebSocket connection
// //   }

// //   // Establish a new WebSocket connection
// //   wsClientRefs.current[chartId] = new WebSocketClient(
// //     "wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/"
// //   );

// //   wsClientRefs.current[chartId].onopen = () => {
// //     console.log(`WebSocket connection established for chart ${chartId}`);
// //   };

// //   wsClientRefs.current[chartId].onmessage = (message) => {
// //     try {
// //       const receivedData = JSON.parse(message.data);
// //       const newData = {
// //         timestamp: receivedData.timestamp || Date.now(),
// //      "AX-LT-011": receivedData["AX-LT-011"] || null,
// // "AX-LT-021": receivedData["AX-LT-021"] || null,
// // "CW-TT-011": receivedData["CW-TT-011"] || null,
// // "CW-TT-021": receivedData["CW-TT-021"] || null,
// // "CR-LT-011": receivedData["CR-LT-011"] || null,
// // "CR-PT-011": receivedData["CR-PT-011"] || null,
// // "CR-LT-021": receivedData["CR-LT-021"] || null,
// // "CR-PT-021": receivedData["CR-PT-021"] || null,
// // "CR-PT-001": receivedData["CR-PT-001"] || null,
// // "CR-TT-001": receivedData["CR-TT-001"] || null,
// // "CR-FT-001": receivedData["CR-FT-001"] || null,
// // "CR-TT-002": receivedData["CR-TT-002"] || null,
// // "GS-AT-011": receivedData["GS-AT-011"] || null,
// // "GS-AT-012": receivedData["GS-AT-012"] || null,
// // "GS-PT-011": receivedData["GS-PT-011"] || null,
// // "GS-TT-011": receivedData["GS-TT-011"] || null,
// // "GS-AT-022": receivedData["GS-AT-022"] || null,
// // "GS-PT-021": receivedData["GS-PT-021"] || null,
// // "GS-TT-021": receivedData["GS-TT-021"] || null,
// // "PR-TT-001": receivedData["PR-TT-001"] || null,
// // "PR-TT-061": receivedData["PR-TT-061"] || null,
// // "PR-TT-072": receivedData["PR-TT-072"] || null,
// // "PR-FT-001": receivedData["PR-FT-001"] || null,
// // "PR-AT-001": receivedData["PR-AT-001"] || null,
// // "PR-AT-003": receivedData["PR-AT-003"] || null,
// // "PR-AT-005": receivedData["PR-AT-005"] || null,
// // "DM-LSH-001": receivedData["DM-LSH-001"] || null,
// // "DM-LSL-001": receivedData["DM-LSL-001"] || null,
// // "GS-LSL-021": receivedData["GS-LSL-021"] || null,
// // "GS-LSL-011": receivedData["GS-LSL-011"] || null,
// // "PR-VA-301": receivedData["PR-VA-301"] || null,
// // "PR-VA-352": receivedData["PR-VA-352"] || null,
// // "PR-VA-312": receivedData["PR-VA-312"] || null,
// // "PR-VA-351": receivedData["PR-VA-351"] || null,
// // "PR-VA-361Ain": receivedData["PR-VA-361Ain"] || null,
// // "PR-VA-361Aout": receivedData["PR-VA-361Aout"] || null,
// // "PR-VA-361Bin": receivedData["PR-VA-361Bin"] || null,
// // "PR-VA-361Bout": receivedData["PR-VA-361Bout"] || null,
// // "PR-VA-362Ain": receivedData["PR-VA-362Ain"] || null,
// // "PR-VA-362Aout": receivedData["PR-VA-362Aout"] || null,
// // "PR-VA-362Bin": receivedData["PR-VA-362Bin"] || null,
// // "PR-VA-362Bout": receivedData["PR-VA-362Bout"] || null,
// // "N2-VA-311": receivedData["N2-VA-311"] || null,
// // "GS-VA-311": receivedData["GS-VA-311"] || null,
// // "GS-VA-312": receivedData["GS-VA-312"] || null,
// // "N2-VA-321": receivedData["N2-VA-321"] || null,
// // "GS-VA-321": receivedData["GS-VA-321"] || null,
// // "GS-VA-322": receivedData["GS-VA-322"] || null,
// // "GS-VA-022": receivedData["GS-VA-022"] || null,
// // "GS-VA-021": receivedData["GS-VA-021"] || null,
// // "AX-VA-351": receivedData["AX-VA-351"] || null,
// // "AX-VA-311": receivedData["AX-VA-311"] || null,
// // "AX-VA-312": receivedData["AX-VA-312"] || null,
// // "AX-VA-321": receivedData["AX-VA-321"] || null,
// // "AX-VA-322": receivedData["AX-VA-322"] || null,
// // "AX-VA-391": receivedData["AX-VA-391"] || null,
// // "DM-VA-301": receivedData["DM-VA-301"] || null,
// // "DCDB0-VT-001": receivedData["DCDB0-VT-001"] || null,
// // "DCDB0-CT-001": receivedData["DCDB0-CT-001"] || null,
// // "DCDB1-VT-001": receivedData["DCDB1-VT-001"] || null,
// // "DCDB1-CT-001": receivedData["DCDB1-CT-001"] || null,
// // "DCDB2-VT-001": receivedData["DCDB2-VT-001"] || null,
// // "DCDB2-CT-001": receivedData["DCDB2-CT-001"] || null,
// // "DCDB3-VT-001": receivedData["DCDB3-VT-001"] || null,
// // "DCDB3-CT-001": receivedData["DCDB3-CT-001"] || null,
// // "DCDB4-VT-001": receivedData["DCDB4-VT-001"] || null,
// // "DCDB4-CT-001": receivedData["DCDB4-CT-001"] || null,
// // "RECT-CT-001": receivedData["RECT-CT-001"] || null,
// // "RECT-VT-001": receivedData["RECT-VT-001"] || null,

// //       };

// //       // Append new real-time data to the existing chart data
// //       setData((prevData) => ({
// //         ...prevData,
// //         [chartId]: [...(prevData[chartId] || []), newData],
// //       }));
// //     } catch (error) {
// //       console.error("Error processing WebSocket message:", error);
// //     }
// //   };

// //   wsClientRefs.current[chartId].onclose = () => {
// //     console.warn(`WebSocket connection closed for chart ${chartId}. Reconnecting...`);
// //     setTimeout(() => setupRealTimeWebSocket(chartId), 1000); // Attempt to reconnect after a delay
// //   };
// // };
// //   // Function to apply the date range and initiate data fetch and real-time plotting
// //   const handleDateRangeApply = () => {
// //     setDateDialogOpen(false);

// //     // Fetch data and start real-time plotting based on mode
// //     if (mode === "B" || mode === "C") {
// //       charts.forEach((chart) => fetchHistoricalData(chart.id));
// //     }
// //   };
// //   const addCustomChart = () => {
// //     const newChartId = Date.now();
// //     const newChart = {
// //       id: newChartId,
// //       xAxisDataKey: "CW-TT-011",
// //       yAxisDataKey: "CW-TT-021",
// //       xAxisRange: ["auto", "auto"],
// //       yAxisRange: ["auto", "auto"],
// //       color: "#FF0000",
// //     };
// //     const updatedCharts = [...charts, newChart];
// //     setCharts(updatedCharts);
// //     saveChartsToLocalStorage(updatedCharts);
// //     saveLayoutToLocalStorage([
// //       ...layout,
// //       { i: newChartId.toString(), x: 0, y: Infinity, w: 6, h: 8 },
// //     ]);
// //     setChartDialogOpen(false);
// //   };
// //   const deleteChart = (chartId) => {
// //     const updatedCharts = charts.filter((chart) => chart.id !== chartId);
// //     setCharts(updatedCharts);
// //     saveChartsToLocalStorage(updatedCharts);
// //     const updatedLayout = layout.filter((l) => l.i !== chartId.toString());
// //     setLayout(updatedLayout);
// //     saveLayoutToLocalStorage(updatedLayout);
// //   };
// //   const renderChart = (chart) => (
// //     <ResponsiveContainer width="100%" height={300}>
// //   <ScatterChart>
// //     <CartesianGrid strokeDasharray="3 3" />
// //     <XAxis
// //       type="number"
// //       dataKey={chart.xAxisDataKey}
// //       name={chart.xAxisDataKey}
// //       domain={[chart.xAxisRange[0], chart.xAxisRange[1]]}
// //     />
// //     <YAxis
// //       type="number"
// //       dataKey={chart.yAxisDataKey}
// //       name={chart.yAxisDataKey}
// //       domain={[chart.yAxisRange[0], chart.yAxisRange[1]]}
// //     />
// //     <Tooltip
// //       cursor={{ strokeDasharray: '3 3' }}
// //       content={({ payload }) => {
// //         if (payload && payload.length) {
// //           const point = payload[0].payload;

// //           // Check if `time_bucket` exists. If not, show the real-time current date/time
// //           const timestamp = point.time_bucket
// //             ? point.time_bucket
// //             : new Date().toLocaleString(); // Get current real-time date and time

// //           return (
// //             <div className="custom-tooltip">
// //               <p>{`X (${chart.xAxisDataKey}): ${point[chart.xAxisDataKey]}`}</p>
// //               <p>{`Y (${chart.yAxisDataKey}): ${point[chart.yAxisDataKey]}`}</p>
// //               <p>{`Timestamp: ${timestamp}`}</p>
// //             </div>
// //           );
// //         }
// //         return null;
// //       }}
// //     />
// //     <Legend />
// //     <Scatter
// //       name={`${chart.xAxisDataKey} vs ${chart.yAxisDataKey}`}
// //       data={data[chart.id] || []}
// //       fill={chart.color}
// //     />
// //   </ScatterChart>
// // </ResponsiveContainer>
// //   );
// //   return (
// //     <LocalizationProvider dateAdapter={AdapterDateFns}>

// //         <Box display="flex" justifyContent="flex-end" marginBottom={4}>
// //           <Button
// //             variant="contained"
// //             color="secondary"
// //             onClick={() => setChartDialogOpen(true)}
// //           >
// //             Add Scatter Chart
// //           </Button>
// //         </Box>
// //         <GridLayout
// //           className="layout"
// //           layout={layout}
// //           cols={12}
// //           rowHeight={45}
// //           width={1910}
// //           onLayoutChange={saveLayoutToLocalStorage}
// //           draggableHandle=".drag-handle"
// //           isResizable
// //         >
// //           {charts.map((chart) => (
// //             <Box
// //               key={chart.id}
// //               data-grid={layout.find((l) => l.i === chart.id.toString()) || { x: 0, y: Infinity, w: 6, h: 8 }}
// //               sx={{
// //                 position: "relative",
// //                 border: "1px solid #ccc",
// //                 borderRadius: "8px",
// //                 overflow: "hidden",
// //                 padding: 2,
// //               }}
// //             >
// //               <Box display="flex" justifyContent="space-between" p={1}>
// //                 <IconButton className="drag-handle">
// //                   <DragHandleIcon />
// //                 </IconButton>
// //                 <IconButton
// //                   aria-label="delete"
// //                   onClick={() => deleteChart(chart.id)}
// //                 >
// //                   <DeleteIcon />
// //                 </IconButton>
// //               </Box>
// //               {renderChart(chart)}
// //               <Box display="flex" justifyContent="space-around" mt={2} gap={2}>
// //                 <Button
// //                   variant="contained"
// //                   color="secondary"
// //                   onClick={() => {
// //                     setTempChartData(chart);
// //                     setDialogOpen(true);
// //                   }}
// //                 >
// //                   Configure Chart
// //                 </Button>
// //                 <Button
// //                   variant="contained"
// //                 color="secondary"
// //                   onClick={() => {
// //                     setSelectedChartId(chart.id);
// //                     setDateDialogOpen(true);
// //                   }}
// //                 >
// //                   Select Date Range
// //                 </Button>
// //               </Box>
// //             </Box>
// //           ))}
// //         </GridLayout>

// //         <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
// //           <DialogTitle>Select Chart Type</DialogTitle>
// //           <DialogContent>
// //             <Box display="flex" flexDirection="column" gap={2}>
// //               <Button variant="contained" onClick={addCustomChart}>
// //                 Add XY Chart
// //               </Button>
// //             </Box>
// //           </DialogContent>
// //           <DialogActions>
// //             <Button onClick={() => setChartDialogOpen(false)} color="secondary">
// //               Cancel
// //             </Button>
// //           </DialogActions>
// //         </Dialog>

// //         <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="md">
// //           <DialogTitle>Configure Chart</DialogTitle>
// //           <DialogContent>
// //             <FormControl fullWidth margin="normal">
// //               <InputLabel>X-Axis Data Key</InputLabel>
// //               <Select
// //                 value={tempChartData?.xAxisDataKey}
// //                 onChange={(e) =>
// //                   setTempChartData((prevChart) => ({
// //                     ...prevChart,
// //                     xAxisDataKey: e.target.value,
// //                   }))
// //                 }
// //               >
// //               <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
// // <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
// // <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
// // <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
// // <MenuItem value="CR-LT-011">CR-LT-011</MenuItem>
// // <MenuItem value="CR-PT-011">CR-PT-011</MenuItem>
// // <MenuItem value="CR-LT-021">CR-LT-021</MenuItem>
// // <MenuItem value="CR-PT-021">CR-PT-021</MenuItem>
// // <MenuItem value="CR-PT-001">CR-PT-001</MenuItem>
// // <MenuItem value="CR-TT-001">CR-TT-001</MenuItem>
// // <MenuItem value="CR-FT-001">CR-FT-001</MenuItem>
// // <MenuItem value="CR-TT-002">CR-TT-002</MenuItem>
// // <MenuItem value="GS-AT-011">GS-AT-011</MenuItem>
// // <MenuItem value="GS-AT-012">GS-AT-012</MenuItem>
// // <MenuItem value="GS-PT-011">GS-PT-011</MenuItem>
// // <MenuItem value="GS-TT-011">GS-TT-011</MenuItem>
// // <MenuItem value="GS-AT-022">GS-AT-022</MenuItem>
// // <MenuItem value="GS-PT-021">GS-PT-021</MenuItem>
// // <MenuItem value="GS-TT-021">GS-TT-021</MenuItem>
// // <MenuItem value="PR-TT-001">PR-TT-001</MenuItem>
// // <MenuItem value="PR-TT-061">PR-TT-061</MenuItem>
// // <MenuItem value="PR-TT-072">PR-TT-072</MenuItem>
// // <MenuItem value="PR-FT-001">PR-FT-001</MenuItem>
// // <MenuItem value="PR-AT-001">PR-AT-001</MenuItem>
// // <MenuItem value="PR-AT-003">PR-AT-003</MenuItem>
// // <MenuItem value="PR-AT-005">PR-AT-005</MenuItem>
// // <MenuItem value="DM-LSH-001">DM-LSH-001</MenuItem>
// // <MenuItem value="DM-LSL-001">DM-LSL-001</MenuItem>
// // <MenuItem value="GS-LSL-021">GS-LSL-021</MenuItem>
// // <MenuItem value="GS-LSL-011">GS-LSL-011</MenuItem>
// // <MenuItem value="PR-VA-301">PR-VA-301</MenuItem>
// // <MenuItem value="PR-VA-352">PR-VA-352</MenuItem>
// // <MenuItem value="PR-VA-312">PR-VA-312</MenuItem>
// // <MenuItem value="PR-VA-351">PR-VA-351</MenuItem>
// // <MenuItem value="PR-VA-361Ain">PR-VA-361Ain</MenuItem>
// // <MenuItem value="PR-VA-361Aout">PR-VA-361Aout</MenuItem>
// // <MenuItem value="PR-VA-361Bin">PR-VA-361Bin</MenuItem>
// // <MenuItem value="PR-VA-361Bout">PR-VA-361Bout</MenuItem>
// // <MenuItem value="PR-VA-362Ain">PR-VA-362Ain</MenuItem>
// // <MenuItem value="PR-VA-362Aout">PR-VA-362Aout</MenuItem>
// // <MenuItem value="PR-VA-362Bin">PR-VA-362Bin</MenuItem>
// // <MenuItem value="PR-VA-362Bout">PR-VA-362Bout</MenuItem>
// // <MenuItem value="N2-VA-311">N2-VA-311</MenuItem>
// // <MenuItem value="GS-VA-311">GS-VA-311</MenuItem>
// // <MenuItem value="GS-VA-312">GS-VA-312</MenuItem>
// // <MenuItem value="N2-VA-321">N2-VA-321</MenuItem>
// // <MenuItem value="GS-VA-321">GS-VA-321</MenuItem>
// // <MenuItem value="GS-VA-322">GS-VA-322</MenuItem>
// // <MenuItem value="GS-VA-022">GS-VA-022</MenuItem>
// // <MenuItem value="GS-VA-021">GS-VA-021</MenuItem>
// // <MenuItem value="AX-VA-351">AX-VA-351</MenuItem>
// // <MenuItem value="AX-VA-311">AX-VA-311</MenuItem>
// // <MenuItem value="AX-VA-312">AX-VA-312</MenuItem>
// // <MenuItem value="AX-VA-321">AX-VA-321</MenuItem>
// // <MenuItem value="AX-VA-322">AX-VA-322</MenuItem>
// // <MenuItem value="AX-VA-391">AX-VA-391</MenuItem>
// // <MenuItem value="DM-VA-301">DM-VA-301</MenuItem>
// // <MenuItem value="DCDB0-VT-001">DCDB0-VT-001</MenuItem>
// // <MenuItem value="DCDB0-CT-001">DCDB0-CT-001</MenuItem>
// // <MenuItem value="DCDB1-VT-001">DCDB1-VT-001</MenuItem>
// // <MenuItem value="DCDB1-CT-001">DCDB1-CT-001</MenuItem>
// // <MenuItem value="DCDB2-VT-001">DCDB2-VT-001</MenuItem>
// // <MenuItem value="DCDB2-CT-001">DCDB2-CT-001</MenuItem>
// // <MenuItem value="DCDB3-VT-001">DCDB3-VT-001</MenuItem>
// // <MenuItem value="DCDB3-CT-001">DCDB3-CT-001</MenuItem>
// // <MenuItem value="DCDB4-VT-001">DCDB4-VT-001</MenuItem>
// // <MenuItem value="DCDB4-CT-001">DCDB4-CT-001</MenuItem>
// // <MenuItem value="RECT-CT-001">RECT-CT-001</MenuItem>
// // <MenuItem value="RECT-VT-001">RECT-VT-001</MenuItem>

// //               </Select>
// //             </FormControl>

// //             <FormControl fullWidth margin="normal">
// //               <InputLabel>Y-Axis Data Key</InputLabel>
// //               <Select
// //                 value={tempChartData?.yAxisDataKey}
// //                 onChange={(e) =>
// //                   setTempChartData((prevChart) => ({
// //                     ...prevChart,
// //                     yAxisDataKey: e.target.value,
// //                   }))
// //                 }
// //               >
// //                <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
// // <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
// // <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
// // <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
// // <MenuItem value="CR-LT-011">CR-LT-011</MenuItem>
// // <MenuItem value="CR-PT-011">CR-PT-011</MenuItem>
// // <MenuItem value="CR-LT-021">CR-LT-021</MenuItem>
// // <MenuItem value="CR-PT-021">CR-PT-021</MenuItem>
// // <MenuItem value="CR-PT-001">CR-PT-001</MenuItem>
// // <MenuItem value="CR-TT-001">CR-TT-001</MenuItem>
// // <MenuItem value="CR-FT-001">CR-FT-001</MenuItem>
// // <MenuItem value="CR-TT-002">CR-TT-002</MenuItem>
// // <MenuItem value="GS-AT-011">GS-AT-011</MenuItem>
// // <MenuItem value="GS-AT-012">GS-AT-012</MenuItem>
// // <MenuItem value="GS-PT-011">GS-PT-011</MenuItem>
// // <MenuItem value="GS-TT-011">GS-TT-011</MenuItem>
// // <MenuItem value="GS-AT-022">GS-AT-022</MenuItem>
// // <MenuItem value="GS-PT-021">GS-PT-021</MenuItem>
// // <MenuItem value="GS-TT-021">GS-TT-021</MenuItem>
// // <MenuItem value="PR-TT-001">PR-TT-001</MenuItem>
// // <MenuItem value="PR-TT-061">PR-TT-061</MenuItem>
// // <MenuItem value="PR-TT-072">PR-TT-072</MenuItem>
// // <MenuItem value="PR-FT-001">PR-FT-001</MenuItem>
// // <MenuItem value="PR-AT-001">PR-AT-001</MenuItem>
// // <MenuItem value="PR-AT-003">PR-AT-003</MenuItem>
// // <MenuItem value="PR-AT-005">PR-AT-005</MenuItem>
// // <MenuItem value="DM-LSH-001">DM-LSH-001</MenuItem>
// // <MenuItem value="DM-LSL-001">DM-LSL-001</MenuItem>
// // <MenuItem value="GS-LSL-021">GS-LSL-021</MenuItem>
// // <MenuItem value="GS-LSL-011">GS-LSL-011</MenuItem>
// // <MenuItem value="PR-VA-301">PR-VA-301</MenuItem>
// // <MenuItem value="PR-VA-352">PR-VA-352</MenuItem>
// // <MenuItem value="PR-VA-312">PR-VA-312</MenuItem>
// // <MenuItem value="PR-VA-351">PR-VA-351</MenuItem>
// // <MenuItem value="PR-VA-361Ain">PR-VA-361Ain</MenuItem>
// // <MenuItem value="PR-VA-361Aout">PR-VA-361Aout</MenuItem>
// // <MenuItem value="PR-VA-361Bin">PR-VA-361Bin</MenuItem>
// // <MenuItem value="PR-VA-361Bout">PR-VA-361Bout</MenuItem>
// // <MenuItem value="PR-VA-362Ain">PR-VA-362Ain</MenuItem>
// // <MenuItem value="PR-VA-362Aout">PR-VA-362Aout</MenuItem>
// // <MenuItem value="PR-VA-362Bin">PR-VA-362Bin</MenuItem>
// // <MenuItem value="PR-VA-362Bout">PR-VA-362Bout</MenuItem>
// // <MenuItem value="N2-VA-311">N2-VA-311</MenuItem>
// // <MenuItem value="GS-VA-311">GS-VA-311</MenuItem>
// // <MenuItem value="GS-VA-312">GS-VA-312</MenuItem>
// // <MenuItem value="N2-VA-321">N2-VA-321</MenuItem>
// // <MenuItem value="GS-VA-321">GS-VA-321</MenuItem>
// // <MenuItem value="GS-VA-322">GS-VA-322</MenuItem>
// // <MenuItem value="GS-VA-022">GS-VA-022</MenuItem>
// // <MenuItem value="GS-VA-021">GS-VA-021</MenuItem>
// // <MenuItem value="AX-VA-351">AX-VA-351</MenuItem>
// // <MenuItem value="AX-VA-311">AX-VA-311</MenuItem>
// // <MenuItem value="AX-VA-312">AX-VA-312</MenuItem>
// // <MenuItem value="AX-VA-321">AX-VA-321</MenuItem>
// // <MenuItem value="AX-VA-322">AX-VA-322</MenuItem>
// // <MenuItem value="AX-VA-391">AX-VA-391</MenuItem>
// // <MenuItem value="DM-VA-301">DM-VA-301</MenuItem>
// // <MenuItem value="DCDB0-VT-001">DCDB0-VT-001</MenuItem>
// // <MenuItem value="DCDB0-CT-001">DCDB0-CT-001</MenuItem>
// // <MenuItem value="DCDB1-VT-001">DCDB1-VT-001</MenuItem>
// // <MenuItem value="DCDB1-CT-001">DCDB1-CT-001</MenuItem>
// // <MenuItem value="DCDB2-VT-001">DCDB2-VT-001</MenuItem>
// // <MenuItem value="DCDB2-CT-001">DCDB2-CT-001</MenuItem>
// // <MenuItem value="DCDB3-VT-001">DCDB3-VT-001</MenuItem>
// // <MenuItem value="DCDB3-CT-001">DCDB3-CT-001</MenuItem>
// // <MenuItem value="DCDB4-VT-001">DCDB4-VT-001</MenuItem>
// // <MenuItem value="DCDB4-CT-001">DCDB4-CT-001</MenuItem>
// // <MenuItem value="RECT-CT-001">RECT-CT-001</MenuItem>
// // <MenuItem value="RECT-VT-001">RECT-VT-001</MenuItem>

// //               </Select>
// //             </FormControl>

// //             <Button onClick={() => setDialogOpen(true)}>Select Color</Button>
// //             <SketchPicker color={tempChartData?.color} onChangeComplete={(color) => {
// //               setTempChartData((prevChart) => ({
// //                 ...prevChart,
// //                 color: color.hex
// //               }));
// //             }} />
// //           </DialogContent>
// //           <DialogActions>
// //             <Button onClick={() => setDialogOpen(false)} color="secondary">
// //               Cancel
// //             </Button>
// //             <Button onClick={saveConfiguration} color="primary">
// //               Save
// //             </Button>
// //           </DialogActions>
// //         </Dialog>

// //         <Dialog open={dateDialogOpen} onClose={() => setDateDialogOpen(false)} fullWidth maxWidth="sm">
// //           <DialogTitle>Select Date Range</DialogTitle>
// //           <DialogContent>
// //             <FormControl component="fieldset">
// //               <RadioGroup row value={mode} onChange={(e) => setMode(e.target.value)}>
// //               <FormControlLabel value="C" control={<Radio />} label="Select Date Range" />
// //                 <FormControlLabel value="B" control={<Radio />} label="Start Date & Continue Real-Time" />
// //               </RadioGroup>
// //             </FormControl>
// //             <Grid container spacing={2} alignItems="center">
// //               <Grid item xs={6}>
// //                 <DateTimePicker
// //                   label="Start Date and Time"
// //                   value={startDate}
// //                   onChange={setStartDate}
// //                   renderInput={(params) => <TextField {...params} fullWidth />}
// //                 />
// //               </Grid>
// //               <Grid item xs={6}>
// //                 <DateTimePicker
// //                   label="End Date and Time"
// //                   value={endDate}
// //                   onChange={setEndDate}
// //                   renderInput={(params) => <TextField {...params} fullWidth />}
// //                   disabled={mode === "B"}
// //                 />
// //               </Grid>
// //             </Grid>
// //             <Box display="flex" justifyContent="flex-end" marginBottom={2}>
// //             <FormControl>
// //               <InputLabel id="time-range-label">Time Range</InputLabel>
// //               <Select
// //                 labelId="time-range-label"
// //                 value={selectedTimeRange}
// //                 onChange={handleTimeRangeChange}
// //               >
// //                 <MenuItem value="10_minute">Last 10 minute</MenuItem>
// //                 <MenuItem value="30_minutes">Last 30 minutes</MenuItem>
// //                 <MenuItem value="1_hour">Last 1 hour</MenuItem>
// //                 <MenuItem value="6_hours">Last 6 hour</MenuItem>
// //                 <MenuItem value="12_hours">Last 12 hours</MenuItem>
// //                 <MenuItem value="1_day">Last 1 day</MenuItem>
// //                 <MenuItem value="2_day">Last 2 day</MenuItem>
// //                 <MenuItem value="1_week">Last 1 week</MenuItem>
// //                 <MenuItem value="1_month">Last 1 month</MenuItem>
// //               </Select>
// //             </FormControl>
// //           </Box>
// //           </DialogContent>
// //           <DialogActions>
// //             <Button onClick={() => setDateDialogOpen(false)} color="secondary">
// //               Cancel
// //             </Button>
// //             <Button onClick={handleDateRangeApply} color="primary">
// //               Apply
// //             </Button>
// //           </DialogActions>
// //         </Dialog>
// //     </LocalizationProvider>
// //   );
// // };

// // export default CustomScatterCharts;

// // // import React, { useState, useEffect, useRef } from "react";
// // // import {
// // //   ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
// // // } from "recharts";
// // // import {
// // //   Container, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
// // //   FormControl, InputLabel, Select, MenuItem, IconButton, Grid, TextField, FormControlLabel, RadioGroup, Radio
// // // } from "@mui/material";
// // // import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// // // import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// // // import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// // // import axios from 'axios';
// // // import { format, parseISO } from 'date-fns';
// // // import { w3cwebsocket as W3CWebSocket } from "websocket";
// // // import DeleteIcon from '@mui/icons-material/Delete';
// // // import { SketchPicker } from 'react-color';

// // // const CustomScatterCharts = () => {
// // //   const [data, setData] = useState({});
// // //   const [charts, setCharts] = useState([]);
// // //   const [chartDialogOpen, setChartDialogOpen] = useState(false);
// // //   const [dialogOpen, setDialogOpen] = useState(false);
// // //   const [tempChartData, setTempChartData] = useState(null);

// // //   const [startDate, setStartDate] = useState(null);
// // //   const [endDate, setEndDate] = useState(null);
// // //   const [realTimeData, setRealTimeData] = useState(false);
// // //   const [dateDialogOpen, setDateDialogOpen] = useState(false);
// // //   const [loading, setLoading] = useState(false);

// // //   const [mode, setMode] = useState('A'); // A: Real-Time, B: Start Date & Continue Real-Time, C: Select Date Range

// // //   const wsClientRefs = useRef({}); // Store WebSocket connections for each chart

// // //   // Setup WebSocket connection for real-time data for a specific chart
// // //   const setupRealTimeWebSocket = (chartId) => {
// // //     if (wsClientRefs.current[chartId]) {
// // //       wsClientRefs.current[chartId].close();
// // //     }

// // //     wsClientRefs.current[chartId] = new W3CWebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");

// // //     wsClientRefs.current[chartId].onopen = () => {
// // //       console.log(`WebSocket connection established for chart ${chartId}`);
// // //     };

// // //     wsClientRefs.current[chartId].onmessage = (message) => {
// // //       try {
// // //         const receivedData = JSON.parse(message.data);
// // //         const newData = {
// // //           timestamp: parseISO(receivedData['PLC-TIME-STAMP']) || new Date(),
// // //           'AX-LT-011': receivedData['AX-LT-011'] || null,
// // //           'AX-LT-021': receivedData['AX-LT-021'] || null,
// // //           'CW-TT-011': receivedData['CW-TT-011'] || null,
// // //           'CW-TT-021': receivedData['CW-TT-021'] || null,
// // //         };

// // //         // Append new data to the existing chart data
// // //         setData((prevData) => ({
// // //           ...prevData,
// // //           [chartId]: [...(prevData[chartId] || []), newData], // Accumulate data for each chart
// // //         }));
// // //       } catch (error) {
// // //         console.error("Error processing WebSocket message:", error);
// // //       }
// // //     };

// // //     wsClientRefs.current[chartId].onclose = (event) => {
// // //       console.error(`WebSocket disconnected for chart ${chartId} (code: ${event.code}, reason: ${event.reason}). Reconnecting...`);
// // //       setTimeout(() => setupRealTimeWebSocket(chartId), 1000); // Reconnect after 1 second
// // //     };
// // //   };

// // //   // Fetch historical data for Option B or C
// // //   const fetchHistoricalData = async (chartId, fetchEndDate = false) => {
// // //     if (!startDate || (fetchEndDate && !endDate)) return;
// // //     setLoading(true);

// // //     try {
// // //       const formattedStartDate = format(startDate, 'yyyy-MM-dd');
// // //       const formattedStartTime = format(startDate, 'HH:mm');
// // //       const formattedEndDate = fetchEndDate ? format(endDate, 'yyyy-MM-dd') : null;
// // //       const formattedEndTime = fetchEndDate ? format(endDate, 'HH:mm') : null;

// // //       const response = await axios.post('https://7ko9a0hlo2.execute-api.us-east-1.amazonaws.com/dev/data', {
// // //         start_date: formattedStartDate,
// // //         start_time: formattedStartTime,
// // //         end_date: formattedEndDate,
// // //         end_time: formattedEndTime,
// // //         plot_all: true
// // //       });

// // //       const historicalData = response.data.data.map(item => ({
// // //         timestamp: item.timestamp,
// // //         'AX-LT-011': item.payload['AX-LT-011'],
// // //         'AX-LT-021': item.payload['AX-LT-021'],
// // //         'CW-TT-011': item.payload['CW-TT-011'],
// // //         'CW-TT-021': item.payload['CW-TT-021'],
// // //       }));

// // //       // Set historical data for the specific chart
// // //       setData((prevData) => ({
// // //         ...prevData,
// // //         [chartId]: historicalData,
// // //       }));

// // //       // For Option B, start WebSocket streaming after fetching historical data
// // //       if (!fetchEndDate) {
// // //         setupRealTimeWebSocket(chartId);
// // //       }
// // //     } catch (error) {
// // //       console.error('Error fetching historical data:', error);
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   // Date range apply logic based on selected mode
// // //   const handleDateRangeApply = () => {
// // //     setDateDialogOpen(false);

// // //     charts.forEach(chart => {
// // //       if (mode === 'A') {
// // //         // Real-Time Data Only: Clear data and start WebSocket streaming for each chart
// // //         setRealTimeData(true);
// // //         setData((prevData) => ({ ...prevData, [chart.id]: [] })); // Clear previous data for each chart
// // //         setupRealTimeWebSocket(chart.id); // Setup WebSocket for real-time data
// // //       } else if (mode === 'B') {
// // //         // Start Date & Continue Real-Time: Fetch historical data, then start WebSocket streaming
// // //         setRealTimeData(false);
// // //         fetchHistoricalData(chart.id); // Fetch historical data and then start WebSocket streaming
// // //       } else if (mode === 'C') {
// // //         // Select Date Range: Fetch historical data for the specified range (no real-time)
// // //         setRealTimeData(false);
// // //         fetchHistoricalData(chart.id, true); // Fetch historical data with end date
// // //       }
// // //     });
// // //   };

// // //   const addCustomChart = () => {
// // //     const newChart = {
// // //       id: Date.now(),
// // //       xAxisDataKey: 'AX-LT-011',
// // //       yAxisDataKey: 'AX-LT-021',
// // //       xAxisRange: ['auto', 'auto'],
// // //       yAxisRange: ['auto', 'auto'],
// // //       color: "#FF0000",
// // //     };
// // //     setCharts((prevCharts) => [...prevCharts, newChart]);
// // //     setChartDialogOpen(false);
// // //   };

// // //   const openDialog = (chart) => {
// // //     setTempChartData(chart);
// // //     setDialogOpen(true);
// // //   };

// // //   const closeDialog = () => setDialogOpen(false);

// // //   const saveConfiguration = () => {
// // //     setCharts((prevCharts) =>
// // //       prevCharts.map((chart) =>
// // //         chart.id === tempChartData.id ? tempChartData : chart
// // //       )
// // //     );
// // //     setDialogOpen(false);
// // //   };

// // //   const handleXAxisKeyChange = (event) => {
// // //     const { value } = event.target;
// // //     setTempChartData((prevChart) => ({
// // //       ...prevChart,
// // //       xAxisDataKey: value
// // //     }));
// // //   };

// // //   const handleYAxisKeyChange = (event) => {
// // //     const { value } = event.target;
// // //     setTempChartData((prevChart) => ({
// // //       ...prevChart,
// // //       yAxisDataKey: value
// // //     }));
// // //   };

// // //   const handleXAxisRangeChange = (event) => {
// // //     const { name, value } = event.target;
// // //     setTempChartData((prevChart) => ({
// // //       ...prevChart,
// // //       xAxisRange: name === 'min' ? [parseFloat(value), prevChart.xAxisRange[1]] : [prevChart.xAxisRange[0], parseFloat(value)]
// // //     }));
// // //   };

// // //   const handleYAxisRangeChange = (event) => {
// // //     const { name, value } = event.target;
// // //     setTempChartData((prevChart) => ({
// // //       ...prevChart,
// // //       yAxisRange: name === 'min' ? [parseFloat(value), prevChart.yAxisRange[1]] : [prevChart.yAxisRange[0], parseFloat(value)]
// // //     }));
// // //   };

// // //   const handleColorChange = (color) => {
// // //     setTempChartData((prevChart) => ({
// // //       ...prevChart,
// // //       color: color.hex
// // //     }));
// // //   };

// // //   const deleteChart = (chartId) => {
// // //     setCharts((prevCharts) => prevCharts.filter((chart) => chart.id !== chartId));
// // //   };

// // //   const renderChart = (chart) => (
// // //     <ResponsiveContainer width="100%" height={400}>
// // //       <ScatterChart>
// // //         <CartesianGrid strokeDasharray="3 3" />
// // //         <XAxis
// // //           type="number"
// // //           dataKey={chart.xAxisDataKey}
// // //           name={chart.xAxisDataKey}
// // //           domain={[chart.xAxisRange[0], chart.xAxisRange[1]]}
// // //           tickFormatter={(value) => value.toFixed(4)}
// // //         />
// // //         <YAxis
// // //           type="number"
// // //           dataKey={chart.yAxisDataKey}
// // //           name={chart.yAxisDataKey}
// // //           domain={[chart.yAxisRange[0], chart.yAxisRange[1]]}
// // //           tickFormatter={(value) => value.toFixed(4)}
// // //         />
// // //         <Tooltip cursor={{ strokeDasharray: '3 3' }} />
// // //         <Legend />
// // //         <Scatter
// // //           name={`${chart.xAxisDataKey} vs ${chart.yAxisDataKey}`}
// // //           data={data[chart.id] || []}  // Use accumulated data for the chart
// // //           fill={chart.color}
// // //         />
// // //       </ScatterChart>
// // //     </ResponsiveContainer>
// // //   );

// // //   return (
// // //     <LocalizationProvider dateAdapter={AdapterDateFns}>
// // //       <Container>
// // //         <Box display="flex" justifyContent="flex-end" marginBottom={4}>
// // //           <Button variant="contained" color="primary" onClick={() => setChartDialogOpen(true)}>
// // //             Add Custome Chart
// // //           </Button>

// // //         </Box>

// // //         <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
// // //           <DialogTitle>Select Chart Type</DialogTitle>
// // //           <DialogContent>
// // //             <Box display="flex" flexDirection="column" gap={2}>
// // //               <Button variant="contained" onClick={addCustomChart}>Add XY Chart</Button>
// // //             </Box>
// // //           </DialogContent>
// // //           <DialogActions>
// // //             <Button onClick={() => setChartDialogOpen(false)} color="secondary">Cancel</Button>
// // //           </DialogActions>
// // //         </Dialog>

// // //         {charts.map((chart) => (
// // //           <Box key={chart.id} marginY={4} position="relative">
// // //             <IconButton
// // //               aria-label="delete"
// // //               onClick={() => deleteChart(chart.id)}
// // //               style={{ position: "absolute", right: 0, top: 0, zIndex: 10 }}
// // //             >
// // //               <DeleteIcon />
// // //             </IconButton>
// // //             <Box border={1} padding={2}>
// // //               {renderChart(chart)}
// // //               <Box display="flex" justifyContent="space-between">
// // //                 <Button variant="outlined" color="primary" onClick={() => openDialog(chart)}>
// // //                   Configure Chart
// // //                 </Button>
// // //               </Box>
// // //               {/* Button for selecting the date range */}
// // //           <Button
// // //           variant="contained"
// // //           color="secondary"
// // //           onClick={() => setDateDialogOpen(true)}
// // //           style={{ marginLeft: '170px' }}
// // //         >
// // //           Select Date Range
// // //         </Button>
// // //             </Box>
// // //           </Box>
// // //         ))}

// // //         {tempChartData && (
// // //           <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
// // //             <DialogTitle>Configure Chart</DialogTitle>
// // //             <DialogContent>
// // //               <Box display="flex" flexDirection="column" maxHeight="400px" overflow="auto">
// // //                 <FormControl fullWidth margin="normal">
// // //                   <InputLabel>X-Axis Data Key</InputLabel>
// // //                   <Select
// // //                     value={tempChartData.xAxisDataKey}
// // //                     onChange={handleXAxisKeyChange}
// // //                   >
// // //                     <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
// // //                     <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
// // //                     <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
// // //                     <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
// // //                   </Select>
// // //                 </FormControl>
// // //                 <TextField
// // //                   label="X-Axis Min Range"
// // //                   type="number"
// // //                   name="min"
// // //                   value={tempChartData.xAxisRange[0]}
// // //                   onChange={handleXAxisRangeChange}
// // //                   fullWidth
// // //                   margin="normal"
// // //                   inputProps={{ step: 0.0001 }}
// // //                 />
// // //                 <TextField
// // //                   label="X-Axis Max Range"
// // //                   type="number"
// // //                   name="max"
// // //                   value={tempChartData.xAxisRange[1]}
// // //                   onChange={handleXAxisRangeChange}
// // //                   fullWidth
// // //                   margin="normal"
// // //                   inputProps={{ step: 0.0001 }}
// // //                 />
// // //                 <FormControl fullWidth margin="normal">
// // //                   <InputLabel>Y-Axis Data Key</InputLabel>
// // //                   <Select
// // //                     value={tempChartData.yAxisDataKey}
// // //                     onChange={handleYAxisKeyChange}
// // //                   >
// // //                     <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
// // //                     <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
// // //                     <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
// // //                     <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
// // //                   </Select>
// // //                 </FormControl>
// // //                 <TextField
// // //                   label="Y-Axis Min Range"
// // //                   type="number"
// // //                   name="min"
// // //                   value={tempChartData.yAxisRange[0]}
// // //                   onChange={handleYAxisRangeChange}
// // //                   fullWidth
// // //                   margin="normal"
// // //                   inputProps={{ step: 0.0001 }}
// // //                 />
// // //                 <TextField
// // //                   label="Y-Axis Max Range"
// // //                   type="number"
// // //                   name="max"
// // //                   value={tempChartData.yAxisRange[1]}
// // //                   onChange={handleYAxisRangeChange}
// // //                   fullWidth
// // //                   margin="normal"
// // //                   inputProps={{ step: 0.0001 }}
// // //                 />
// // //                 <Button onClick={() => setDialogOpen(true)}>Select Color</Button>
// // //                 <SketchPicker color={tempChartData.color} onChangeComplete={handleColorChange} />
// // //               </Box>
// // //             </DialogContent>
// // //             <DialogActions>
// // //               <Button onClick={closeDialog} color="secondary">Cancel</Button>
// // //               <Button onClick={saveConfiguration} color="primary">Save</Button>
// // //             </DialogActions>
// // //           </Dialog>
// // //         )}

// // //         {/* Date Range Selection Dialog */}
// // //         <Dialog open={dateDialogOpen} onClose={() => setDateDialogOpen(false)} fullWidth maxWidth="sm">
// // //           <DialogTitle>Select Date Range</DialogTitle>
// // //           <DialogContent>
// // //             <FormControl component="fieldset">
// // //               <RadioGroup
// // //                 row
// // //                 value={mode}
// // //                 onChange={(e) => setMode(e.target.value)}
// // //               >
// // //                 <FormControlLabel value="A" control={<Radio />} label="Real-Time Data Only" />
// // //                 <FormControlLabel value="B" control={<Radio />} label="Start Date & Continue Real-Time" />
// // //                 <FormControlLabel value="C" control={<Radio />} label="Select Date Range" />
// // //               </RadioGroup>
// // //             </FormControl>
// // //             <Grid container spacing={2} alignItems="center">
// // //               <Grid item xs={6}>
// // //                 <DateTimePicker
// // //                   label="Start Date and Time"
// // //                   value={startDate}
// // //                   onChange={setStartDate}
// // //                   renderInput={(params) => <TextField {...params} fullWidth />}
// // //                   disabled={mode === 'A'}
// // //                 />
// // //               </Grid>
// // //               <Grid item xs={6}>
// // //                 <DateTimePicker
// // //                   label="End Date and Time"
// // //                   value={endDate}
// // //                   onChange={setEndDate}
// // //                   renderInput={(params) => <TextField {...params} fullWidth />}
// // //                   disabled={mode !== 'C'}
// // //                 />
// // //               </Grid>
// // //             </Grid>
// // //           </DialogContent>
// // //           <DialogActions>
// // //             <Button onClick={() => setDateDialogOpen(false)} color="secondary">Cancel</Button>
// // //             <Button onClick={handleDateRangeApply} color="primary" disabled={!startDate || (mode === 'C' && !endDate)}>
// // //               Apply
// // //             </Button>
// // //           </DialogActions>
// // //         </Dialog>
// // //       </Container>
// // //     </LocalizationProvider>
// // //   );
// // // };

// // // export default CustomScatterCharts;

// // // // import React, { useState, useEffect, useRef } from "react";
// // // // import {
// // // //   ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
// // // // } from "recharts";
// // // // import {
// // // //   Container, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
// // // //   FormControl, InputLabel, Select, MenuItem, IconButton, Grid, TextField, FormControlLabel, RadioGroup, Radio
// // // // } from "@mui/material";
// // // // import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// // // // import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// // // // import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// // // // import axios from 'axios';
// // // // import { format, parseISO } from 'date-fns';
// // // // import { w3cwebsocket as W3CWebSocket } from "websocket";
// // // // import DeleteIcon from '@mui/icons-material/Delete';
// // // // import { SketchPicker } from 'react-color';

// // // // const CustomScatterCharts = () => {
// // // //   const [data, setData] = useState({});
// // // //   const [charts, setCharts] = useState([]);
// // // //   const [chartDialogOpen, setChartDialogOpen] = useState(false);
// // // //   const [dialogOpen, setDialogOpen] = useState(false);
// // // //   const [tempChartData, setTempChartData] = useState(null);

// // // //   const [startDate, setStartDate] = useState(null);
// // // //   const [endDate, setEndDate] = useState(null);
// // // //   const [realTimeData, setRealTimeData] = useState(false);
// // // //   const [dateDialogOpen, setDateDialogOpen] = useState(false);
// // // //   const [loading, setLoading] = useState(false);

// // // //   const [mode, setMode] = useState('A'); // A: Real-Time, B: Start Date & Continue Real-Time, C: Select Date Range

// // // //   const wsClientRefs = useRef({}); // Store WebSocket connections for each chart

// // // //   // Setup WebSocket connection for real-time data for a specific chart
// // // //   const setupRealTimeWebSocket = (chartId) => {
// // // //     if (wsClientRefs.current[chartId]) {
// // // //       wsClientRefs.current[chartId].close();
// // // //     }

// // // //     wsClientRefs.current[chartId] = new W3CWebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");

// // // //     wsClientRefs.current[chartId].onopen = () => {
// // // //       console.log(`WebSocket connection established for chart ${chartId}`);
// // // //     };

// // // //     wsClientRefs.current[chartId].onmessage = (message) => {
// // // //       try {
// // // //         const receivedData = JSON.parse(message.data);
// // // //         const newData = {
// // // //           timestamp: parseISO(receivedData['PLC-TIME-STAMP']) || new Date(),
// // // //           'AX-LT-011': receivedData['AX-LT-011'] || null,
// // // //           'AX-LT-021': receivedData['AX-LT-021'] || null,
// // // //           'CW-TT-011': receivedData['CW-TT-011'] || null,
// // // //           'CW-TT-021': receivedData['CW-TT-021'] || null,
// // // //         };

// // // //         // Append new data to the existing chart data
// // // //         setData((prevData) => ({
// // // //           ...prevData,
// // // //           [chartId]: [...(prevData[chartId] || []), newData], // Accumulate data for each chart
// // // //         }));
// // // //       } catch (error) {
// // // //         console.error("Error processing WebSocket message:", error);
// // // //       }
// // // //     };

// // // //     wsClientRefs.current[chartId].onclose = (event) => {
// // // //       console.error(`WebSocket disconnected for chart ${chartId} (code: ${event.code}, reason: ${event.reason}). Reconnecting...`);
// // // //       setTimeout(() => setupRealTimeWebSocket(chartId), 1000); // Reconnect after 1 second
// // // //     };
// // // //   };

// // // //   // Fetch historical data for Option B or C
// // // //   const fetchHistoricalData = async (chartId, fetchEndDate = false) => {
// // // //     if (!startDate || (fetchEndDate && !endDate)) return;
// // // //     setLoading(true);

// // // //     try {
// // // //       const formattedStartDate = format(startDate, 'yyyy-MM-dd');
// // // //       const formattedStartTime = format(startDate, 'HH:mm');
// // // //       const formattedEndDate = fetchEndDate ? format(endDate, 'yyyy-MM-dd') : null;
// // // //       const formattedEndTime = fetchEndDate ? format(endDate, 'HH:mm') : null;

// // // //       const response = await axios.post('https://7ko9a0hlo2.execute-api.us-east-1.amazonaws.com/dev/data', {
// // // //         start_date: formattedStartDate,
// // // //         start_time: formattedStartTime,
// // // //         end_date: formattedEndDate,
// // // //         end_time: formattedEndTime,
// // // //         plot_all: true
// // // //       });

// // // //       const historicalData = response.data.data.map(item => ({
// // // //         timestamp: item.timestamp,
// // // //         'AX-LT-011': item.payload['AX-LT-011'],
// // // //         'AX-LT-021': item.payload['AX-LT-021'],
// // // //         'CW-TT-011': item.payload['CW-TT-011'],
// // // //         'CW-TT-021': item.payload['CW-TT-021'],
// // // //       }));

// // // //       // Set historical data for the specific chart
// // // //       setData((prevData) => ({
// // // //         ...prevData,
// // // //         [chartId]: historicalData,
// // // //       }));

// // // //       // For Option B, start WebSocket streaming after fetching historical data
// // // //       if (!fetchEndDate) {
// // // //         setupRealTimeWebSocket(chartId);
// // // //       }
// // // //     } catch (error) {
// // // //       console.error('Error fetching historical data:', error);
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   };

// // // //   // Date range apply logic based on selected mode
// // // //   const handleDateRangeApply = () => {
// // // //     setDateDialogOpen(false);

// // // //     charts.forEach(chart => {
// // // //       if (mode === 'A') {
// // // //         // Real-Time Data Only: Clear data and start WebSocket streaming for each chart
// // // //         setRealTimeData(true);
// // // //         setData((prevData) => ({ ...prevData, [chart.id]: [] })); // Clear previous data for each chart
// // // //         setupRealTimeWebSocket(chart.id); // Setup WebSocket for real-time data
// // // //       } else if (mode === 'B') {
// // // //         // Start Date & Continue Real-Time: Fetch historical data, then start WebSocket streaming
// // // //         setRealTimeData(false);
// // // //         fetchHistoricalData(chart.id); // Fetch historical data and then start WebSocket streaming
// // // //       } else if (mode === 'C') {
// // // //         // Select Date Range: Fetch historical data for the specified range (no real-time)
// // // //         setRealTimeData(false);
// // // //         fetchHistoricalData(chart.id, true); // Fetch historical data with end date
// // // //       }
// // // //     });
// // // //   };

// // // //   const addCustomChart = () => {
// // // //     const newChart = {
// // // //       id: Date.now(),
// // // //       xAxisDataKey: 'AX-LT-011',
// // // //       yAxisDataKey: 'AX-LT-021',
// // // //       xAxisRange: ['auto', 'auto'],
// // // //       yAxisRange: ['auto', 'auto'],
// // // //       color: "#FF0000",
// // // //     };
// // // //     setCharts((prevCharts) => [...prevCharts, newChart]);
// // // //     setChartDialogOpen(false);
// // // //   };

// // // //   const openDialog = (chart) => {
// // // //     setTempChartData(chart);
// // // //     setDialogOpen(true);
// // // //   };

// // // //   const closeDialog = () => setDialogOpen(false);

// // // //   const saveConfiguration = () => {
// // // //     setCharts((prevCharts) =>
// // // //       prevCharts.map((chart) =>
// // // //         chart.id === tempChartData.id ? tempChartData : chart
// // // //       )
// // // //     );
// // // //     setDialogOpen(false);
// // // //   };

// // // //   const handleXAxisKeyChange = (event) => {
// // // //     const { value } = event.target;
// // // //     setTempChartData((prevChart) => ({
// // // //       ...prevChart,
// // // //       xAxisDataKey: value
// // // //     }));
// // // //   };

// // // //   const handleYAxisKeyChange = (event) => {
// // // //     const { value } = event.target;
// // // //     setTempChartData((prevChart) => ({
// // // //       ...prevChart,
// // // //       yAxisDataKey: value
// // // //     }));
// // // //   };

// // // //   const handleXAxisRangeChange = (event) => {
// // // //     const { name, value } = event.target;
// // // //     setTempChartData((prevChart) => ({
// // // //       ...prevChart,
// // // //       xAxisRange: name === 'min' ? [parseFloat(value), prevChart.xAxisRange[1]] : [prevChart.xAxisRange[0], parseFloat(value)]
// // // //     }));
// // // //   };

// // // //   const handleYAxisRangeChange = (event) => {
// // // //     const { name, value } = event.target;
// // // //     setTempChartData((prevChart) => ({
// // // //       ...prevChart,
// // // //       yAxisRange: name === 'min' ? [parseFloat(value), prevChart.yAxisRange[1]] : [prevChart.yAxisRange[0], parseFloat(value)]
// // // //     }));
// // // //   };

// // // //   const handleColorChange = (color) => {
// // // //     setTempChartData((prevChart) => ({
// // // //       ...prevChart,
// // // //       color: color.hex
// // // //     }));
// // // //   };

// // // //   const deleteChart = (chartId) => {
// // // //     setCharts((prevCharts) => prevCharts.filter((chart) => chart.id !== chartId));
// // // //   };

// // // //   const renderChart = (chart) => (
// // // //     <ResponsiveContainer width="100%" height={400}>
// // // //       <ScatterChart>
// // // //         <CartesianGrid strokeDasharray="3 3" />
// // // //         <XAxis
// // // //           type="number"
// // // //           dataKey={chart.xAxisDataKey}
// // // //           name={chart.xAxisDataKey}
// // // //           domain={[chart.xAxisRange[0], chart.xAxisRange[1]]}
// // // //           tickFormatter={(value) => value.toFixed(4)}
// // // //         />
// // // //         <YAxis
// // // //           type="number"
// // // //           dataKey={chart.yAxisDataKey}
// // // //           name={chart.yAxisDataKey}
// // // //           domain={[chart.yAxisRange[0], chart.yAxisRange[1]]}
// // // //           tickFormatter={(value) => value.toFixed(4)}
// // // //         />
// // // //         <Tooltip cursor={{ strokeDasharray: '3 3' }} />
// // // //         <Legend />
// // // //         <Scatter
// // // //           name={`${chart.xAxisDataKey} vs ${chart.yAxisDataKey}`}
// // // //           data={data[chart.id] || []}  // Use accumulated data for the chart
// // // //           fill={chart.color}
// // // //         />
// // // //       </ScatterChart>
// // // //     </ResponsiveContainer>
// // // //   );

// // // //   return (
// // // //     <LocalizationProvider dateAdapter={AdapterDateFns}>
// // // //       <Container>
// // // //         <Box display="flex" justifyContent="flex-end" marginBottom={4}>
// // // //           <Button variant="contained" color="primary" onClick={() => setChartDialogOpen(true)}>
// // // //             Add Custome Chart
// // // //           </Button>

// // // //         </Box>

// // // //         <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
// // // //           <DialogTitle>Select Chart Type</DialogTitle>
// // // //           <DialogContent>
// // // //             <Box display="flex" flexDirection="column" gap={2}>
// // // //               <Button variant="contained" onClick={addCustomChart}>Add XY Chart</Button>
// // // //             </Box>
// // // //           </DialogContent>
// // // //           <DialogActions>
// // // //             <Button onClick={() => setChartDialogOpen(false)} color="secondary">Cancel</Button>
// // // //           </DialogActions>
// // // //         </Dialog>

// // // //         {charts.map((chart) => (
// // // //           <Box key={chart.id} marginY={4} position="relative">
// // // //             <IconButton
// // // //               aria-label="delete"
// // // //               onClick={() => deleteChart(chart.id)}
// // // //               style={{ position: "absolute", right: 0, top: 0, zIndex: 10 }}
// // // //             >
// // // //               <DeleteIcon />
// // // //             </IconButton>
// // // //             <Box border={1} padding={2}>
// // // //               {renderChart(chart)}
// // // //               <Box display="flex" justifyContent="space-between">
// // // //                 <Button variant="outlined" color="primary" onClick={() => openDialog(chart)}>
// // // //                   Configure Chart
// // // //                 </Button>
// // // //               </Box>
// // // //               {/* Button for selecting the date range */}
// // // //           <Button
// // // //           variant="contained"
// // // //           color="secondary"
// // // //           onClick={() => setDateDialogOpen(true)}
// // // //           style={{ marginLeft: '170px' }}
// // // //         >
// // // //           Select Date Range
// // // //         </Button>
// // // //             </Box>
// // // //           </Box>
// // // //         ))}

// // // //         {tempChartData && (
// // // //           <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
// // // //             <DialogTitle>Configure Chart</DialogTitle>
// // // //             <DialogContent>
// // // //               <Box display="flex" flexDirection="column" maxHeight="400px" overflow="auto">
// // // //                 <FormControl fullWidth margin="normal">
// // // //                   <InputLabel>X-Axis Data Key</InputLabel>
// // // //                   <Select
// // // //                     value={tempChartData.xAxisDataKey}
// // // //                     onChange={handleXAxisKeyChange}
// // // //                   >
// // // //                     <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
// // // //                     <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
// // // //                     <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
// // // //                     <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
// // // //                   </Select>
// // // //                 </FormControl>
// // // //                 <TextField
// // // //                   label="X-Axis Min Range"
// // // //                   type="number"
// // // //                   name="min"
// // // //                   value={tempChartData.xAxisRange[0]}
// // // //                   onChange={handleXAxisRangeChange}
// // // //                   fullWidth
// // // //                   margin="normal"
// // // //                   inputProps={{ step: 0.0001 }}
// // // //                 />
// // // //                 <TextField
// // // //                   label="X-Axis Max Range"
// // // //                   type="number"
// // // //                   name="max"
// // // //                   value={tempChartData.xAxisRange[1]}
// // // //                   onChange={handleXAxisRangeChange}
// // // //                   fullWidth
// // // //                   margin="normal"
// // // //                   inputProps={{ step: 0.0001 }}
// // // //                 />
// // // //                 <FormControl fullWidth margin="normal">
// // // //                   <InputLabel>Y-Axis Data Key</InputLabel>
// // // //                   <Select
// // // //                     value={tempChartData.yAxisDataKey}
// // // //                     onChange={handleYAxisKeyChange}
// // // //                   >
// // // //                     <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
// // // //                     <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
// // // //                     <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
// // // //                     <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
// // // //                   </Select>
// // // //                 </FormControl>
// // // //                 <TextField
// // // //                   label="Y-Axis Min Range"
// // // //                   type="number"
// // // //                   name="min"
// // // //                   value={tempChartData.yAxisRange[0]}
// // // //                   onChange={handleYAxisRangeChange}
// // // //                   fullWidth
// // // //                   margin="normal"
// // // //                   inputProps={{ step: 0.0001 }}
// // // //                 />
// // // //                 <TextField
// // // //                   label="Y-Axis Max Range"
// // // //                   type="number"
// // // //                   name="max"
// // // //                   value={tempChartData.yAxisRange[1]}
// // // //                   onChange={handleYAxisRangeChange}
// // // //                   fullWidth
// // // //                   margin="normal"
// // // //                   inputProps={{ step: 0.0001 }}
// // // //                 />
// // // //                 <Button onClick={() => setDialogOpen(true)}>Select Color</Button>
// // // //                 <SketchPicker color={tempChartData.color} onChangeComplete={handleColorChange} />
// // // //               </Box>
// // // //             </DialogContent>
// // // //             <DialogActions>
// // // //               <Button onClick={closeDialog} color="secondary">Cancel</Button>
// // // //               <Button onClick={saveConfiguration} color="primary">Save</Button>
// // // //             </DialogActions>
// // // //           </Dialog>
// // // //         )}

// // // //         {/* Date Range Selection Dialog */}
// // // //         <Dialog open={dateDialogOpen} onClose={() => setDateDialogOpen(false)} fullWidth maxWidth="sm">
// // // //           <DialogTitle>Select Date Range</DialogTitle>
// // // //           <DialogContent>
// // // //             <FormControl component="fieldset">
// // // //               <RadioGroup
// // // //                 row
// // // //                 value={mode}
// // // //                 onChange={(e) => setMode(e.target.value)}
// // // //               >
// // // //                 <FormControlLabel value="A" control={<Radio />} label="Real-Time Data Only" />
// // // //                 <FormControlLabel value="B" control={<Radio />} label="Start Date & Continue Real-Time" />
// // // //                 <FormControlLabel value="C" control={<Radio />} label="Select Date Range" />
// // // //               </RadioGroup>
// // // //             </FormControl>
// // // //             <Grid container spacing={2} alignItems="center">
// // // //               <Grid item xs={6}>
// // // //                 <DateTimePicker
// // // //                   label="Start Date and Time"
// // // //                   value={startDate}
// // // //                   onChange={setStartDate}
// // // //                   renderInput={(params) => <TextField {...params} fullWidth />}
// // // //                   disabled={mode === 'A'}
// // // //                 />
// // // //               </Grid>
// // // //               <Grid item xs={6}>
// // // //                 <DateTimePicker
// // // //                   label="End Date and Time"
// // // //                   value={endDate}
// // // //                   onChange={setEndDate}
// // // //                   renderInput={(params) => <TextField {...params} fullWidth />}
// // // //                   disabled={mode !== 'C'}
// // // //                 />
// // // //               </Grid>
// // // //             </Grid>
// // // //           </DialogContent>
// // // //           <DialogActions>
// // // //             <Button onClick={() => setDateDialogOpen(false)} color="secondary">Cancel</Button>
// // // //             <Button onClick={handleDateRangeApply} color="primary" disabled={!startDate || (mode === 'C' && !endDate)}>
// // // //               Apply
// // // //             </Button>
// // // //           </DialogActions>
// // // //         </Dialog>
// // // //       </Container>
// // // //     </LocalizationProvider>
// // // //   );
// // // // };

// // // // export default CustomScatterCharts;

// // // // import React, { useState, useEffect, useRef } from "react";
// // // // import {
// // // //   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush
// // // // } from "recharts";
// // // // import {
// // // //   Container, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
// // // //   FormControl, InputLabel, Select, MenuItem, Typography, IconButton, Grid, TextField, Switch, FormControlLabel
// // // // } from "@mui/material";
// // // // import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// // // // import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// // // // import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// // // // import axios from 'axios';
// // // // import { format } from 'date-fns';
// // // // import { w3cwebsocket as W3CWebSocket } from "websocket";
// // // // import DeleteIcon from '@mui/icons-material/Delete';
// // // // import { SketchPicker } from 'react-color';
// // // // import { differenceInMinutes, differenceInHours } from 'date-fns';

// // // // const CustomCharts = () => {
// // // //   const [data, setData] = useState([]);
// // // //   const [charts, setCharts] = useState([]);
// // // //   const [chartDialogOpen, setChartDialogOpen] = useState(false);
// // // //   const [dialogOpen, setDialogOpen] = useState(false);
// // // //   const [tempChartData, setTempChartData] = useState(null);
// // // //   const [colorPickerOpen, setColorPickerOpen] = useState(false);
// // // //   const [selectedYAxisId, setSelectedYAxisId] = useState(null);

// // // //   const [dateDialogOpen, setDateDialogOpen] = useState(false);
// // // //   const [startDate, setStartDate] = useState(null);
// // // //   const [endDate, setEndDate] = useState(null);
// // // //   const [realTimeData, setRealTimeData] = useState(false);
// // // //   const [loading, setLoading] = useState(false);

// // // //   const wsClientRef = useRef(null);
// // // //     // State for the start and end datetime, but without default values
// // // //     const [startDateTime, setStartDateTime] = useState(null);
// // // //     const [endDateTime, setEndDateTime] = useState(null);

// // // //     const handleApply = () => {
// // // //       if (startDateTime && endDateTime) {
// // // //         // Format dates for display or API usage
// // // //         const formattedStartDateTime = format(startDateTime, "yyyy-MM-dd'T'HH:mm:ss");
// // // //         const formattedEndDateTime = format(endDateTime, "yyyy-MM-dd'T'HH:mm:ss");
// // // //         console.log("Start:", formattedStartDateTime);
// // // //         console.log("End:", formattedEndDateTime);
// // // //         // Add logic to fetch data here based on the selected date range
// // // //       }
// // // //     };
// // // //   // Real-time data handling
// // // //   useEffect(() => {
// // // //     if (realTimeData) {
// // // //       if (wsClientRef.current) wsClientRef.current.close();

// // // //       wsClientRef.current = new W3CWebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");

// // // //       wsClientRef.current.onmessage = (message) => {
// // // //         try {
// // // //           const receivedData = JSON.parse(message.data);
// // // //           const payload = receivedData.payload || {};
// // // //           const newData = {
// // // //             timestamp: receivedData.timestamp || Date.now(),
// // // //             'AX-LT-011': payload['AX-LT-011'] || null,
// // // //             'AX-LT-021': payload['AX-LT-021'] || null,
// // // //             'CW-TT-011': payload['CW-TT-011'] || null,
// // // //             'CR-LT-011': payload['CR-LT-011'] || null,
// // // //           };

// // // //           if (newData['AX-LT-011'] !== null || newData['AX-LT-021'] !== null || newData['CW-TT-011'] !== null) {
// // // //             setData((prevData) => [...prevData, newData]);
// // // //           }
// // // //         } catch (error) {
// // // //           console.error("Error processing WebSocket message:", error);
// // // //         }
// // // //       };

// // // //       wsClientRef.current.onclose = () => {
// // // //         console.log("WebSocket disconnected. Reconnecting...");
// // // //         setTimeout(() => {
// // // //           wsClientRef.current = new W3CWebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");
// // // //         }, 1000);
// // // //       };

// // // //       return () => {
// // // //         if (wsClientRef.current) wsClientRef.current.close();
// // // //       };
// // // //     }
// // // //   }, [realTimeData]);

// // // //   const fetchHistoricalData = async () => {
// // // //     if (!startDate || !endDate) return;
// // // //     setLoading(true);

// // // //     try {
// // // //       const historicalData = [];
// // // //       let currentDate = startDate;

// // // //       // Loop through the time range until we reach or surpass the end date
// // // //       while (currentDate <= endDate) {
// // // //         const formattedStartDate = format(currentDate, 'yyyy-MM-dd');
// // // //         const formattedStartTime = format(currentDate, 'HH:mm');

// // // //         // Calculate the next hour or the end date, whichever comes first
// // // //         const nextHour = new Date(currentDate.getTime() + 60 * 60 * 1000);
// // // //         const formattedEndDate = format(Math.min(nextHour.getTime(), endDate.getTime()), 'yyyy-MM-dd');
// // // //         const formattedEndTime = format(Math.min(nextHour.getTime(), endDate.getTime()), 'HH:mm');

// // // //         // Fetch data for the current time range
// // // //         const response = await axios.post('https://7ko9a0hlo2.execute-api.us-east-1.amazonaws.com/dev/data', {
// // // //           start_date: formattedStartDate,
// // // //           start_time: formattedStartTime,
// // // //           end_date: formattedEndDate,
// // // //           end_time: formattedEndTime,
// // // //           plot_all: true
// // // //         });

// // // //         // Combine the fetched data into one array
// // // //         const hourlyData = response.data.data.map(item => ({
// // // //           timestamp: item.timestamp,
// // // //           'AX-LT-011': item.payload['AX-LT-011'],
// // // //           'AX-LT-021': item.payload['AX-LT-021'],
// // // //           'CW-TT-011': item.payload['CW-TT-011'],
// // // //           'CR-LT-011': item.payload['CR-LT-011'],
// // // //         }));

// // // //         historicalData.push(...hourlyData);

// // // //         // Move currentDate forward by one hour
// // // //         currentDate = nextHour;
// // // //       }

// // // //       // Set data to plot on the graph
// // // //       setData(historicalData);

// // // //     } catch (error) {
// // // //       console.error('Error fetching historical data:', error);
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   };

// // // //   const addCustomChart = (type) => {
// // // //     const newChart = {
// // // //       id: Date.now(),
// // // //       type,
// // // //       yAxisDataKeys: [
// // // //         { id: 'left-0', dataKeys: ['AX-LT-011'], range: '0-500', color: "#FF0000", lineStyle: 'solid' }
// // // //       ],
// // // //     };
// // // //     setCharts((prevCharts) => [...prevCharts, newChart]);
// // // //     setChartDialogOpen(false);
// // // //   };

// // // //   const openDialog = (chart) => {
// // // //     setTempChartData(chart);
// // // //     setDialogOpen(true);
// // // //   };

// // // //   const closeDialog = () => setDialogOpen(false);

// // // //   const saveConfiguration = () => {
// // // //     setCharts((prevCharts) =>
// // // //       prevCharts.map((chart) =>
// // // //         chart.id === tempChartData.id ? tempChartData : chart
// // // //       )
// // // //     );
// // // //     setDialogOpen(false);
// // // //   };

// // // //   const openColorPicker = (yAxisId) => {
// // // //     setSelectedYAxisId(yAxisId);
// // // //     setColorPickerOpen(true);
// // // //   };

// // // //   const handleColorChange = (color) => {
// // // //     setTempChartData((prevChart) => ({
// // // //       ...prevChart,
// // // //       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
// // // //         yAxis.id === selectedYAxisId ? { ...yAxis, color: color.hex } : yAxis
// // // //       ),
// // // //     }));
// // // //     setColorPickerOpen(false);
// // // //   };

// // // //   const handleDataKeyChange = (yAxisId, event) => {
// // // //     const { value } = event.target;
// // // //     setTempChartData((prevChart) => ({
// // // //       ...prevChart,
// // // //       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
// // // //         yAxis.id === yAxisId ? { ...yAxis, dataKeys: value } : yAxis
// // // //       ),
// // // //     }));
// // // //   };

// // // //   const handleRangeChange = (yAxisId, event) => {
// // // //     const { value } = event.target;
// // // //     setTempChartData((prevChart) => ({
// // // //       ...prevChart,
// // // //       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
// // // //         yAxis.id === yAxisId ? { ...yAxis, range: value } : yAxis
// // // //       ),
// // // //     }));
// // // //   };

// // // //   const handleLineStyleChange = (yAxisId, event) => {
// // // //     const { value } = event.target;
// // // //     setTempChartData((prevChart) => ({
// // // //       ...prevChart,
// // // //       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
// // // //         yAxis.id === yAxisId ? { ...yAxis, lineStyle: value } : yAxis
// // // //       ),
// // // //     }));
// // // //   };

// // // //   const deleteChart = (chartId) => {
// // // //     setCharts((prevCharts) => prevCharts.filter((chart) => chart.id !== chartId));
// // // //   };

// // // //   const addYAxis = () => {
// // // //     setTempChartData((prevChart) => ({
// // // //       ...prevChart,
// // // //       yAxisDataKeys: [
// // // //         ...prevChart.yAxisDataKeys,
// // // //         { id: `left-${prevChart.yAxisDataKeys.length}`, dataKeys: [], range: '0-500', color: '#FF0000', lineStyle: 'solid' },
// // // //       ],
// // // //     }));
// // // //   };

// // // //   const deleteYAxis = (yAxisId) => {
// // // //     setTempChartData((prevChart) => ({
// // // //       ...prevChart,
// // // //       yAxisDataKeys: prevChart.yAxisDataKeys.filter((yAxis) => yAxis.id !== yAxisId),
// // // //     }));
// // // //   };

// // // //   const getYAxisDomain = (range) => {
// // // //     switch (range) {
// // // //       case "0-500": return [0, 500];
// // // //       case "0-100": return [0, 100];
// // // //       case "0-10": return [0, 10];
// // // //       default: return [0, 500];
// // // //     }
// // // //   };

// // // //   const renderChart = (chart) => {
// // // //     const totalMinutes = differenceInMinutes(endDate, startDate);
// // // //     const totalHours = differenceInHours(endDate, startDate);

// // // //     // For ranges of 1 hour or less, display all data points without filtering
// // // //     if (totalMinutes <= 60) {
// // // //       return (
// // // //         <ResponsiveContainer width="100%" height={400}>
// // // //           <LineChart data={data} syncId="syncChart">
// // // //             <CartesianGrid strokeDasharray="3 3" />
// // // //             <XAxis dataKey="timestamp" />
// // // //             {chart.yAxisDataKeys.map((yAxis) => (
// // // //               <YAxis
// // // //                 key={yAxis.id}
// // // //                 yAxisId={yAxis.id}
// // // //                 domain={getYAxisDomain(yAxis.range)}
// // // //                 stroke={yAxis.color}
// // // //               />
// // // //             ))}
// // // //             <Tooltip />
// // // //             <Legend />
// // // //             <Brush />
// // // //             {chart.yAxisDataKeys.map((yAxis) =>
// // // //               yAxis.dataKeys.map((key) => (
// // // //                 <Line
// // // //                   key={key}
// // // //                   type="monotone"
// // // //                   dataKey={key}
// // // //                   stroke={yAxis.color}
// // // //                   strokeDasharray={
// // // //                     yAxis.lineStyle === 'solid'
// // // //                       ? ''
// // // //                       : yAxis.lineStyle === 'dotted'
// // // //                       ? '1 1'
// // // //                       : '5 5'
// // // //                   }
// // // //                   yAxisId={yAxis.id}
// // // //                 />
// // // //               ))
// // // //             )}
// // // //           </LineChart>
// // // //         </ResponsiveContainer>
// // // //       );
// // // //     }

// // // //     // Helper function to calculate the average of an array of values
// // // //     const calculateAverage = (values) => {
// // // //       if (values.length === 0) return null;
// // // //       const sum = values.reduce((a, b) => a + b, 0);
// // // //       return sum / values.length;
// // // //     };

// // // //     // Get minute or hour based on the range
// // // //     const getGranularity = (timestamp, granularity) => {
// // // //       const date = new Date(timestamp);
// // // //       if (granularity === 'minute') {
// // // //         return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
// // // //       } else if (granularity === 'hour') {
// // // //         return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}`;
// // // //       }
// // // //     };

// // // //     // Determine the granularity: per minute or per hour
// // // //     const granularity = totalHours <= 24 ? 'minute' : 'hour';

// // // //     // Group data points by minute or hour and calculate the average for each group
// // // //     const averagedData = Object.values(
// // // //       data.reduce((acc, current) => {
// // // //         const key = getGranularity(current.timestamp, granularity);

// // // //         // Initialize entry for this time period if it doesn't exist
// // // //         if (!acc[key]) {
// // // //           acc[key] = { timestamp: current.timestamp, 'AX-LT-011': [], 'AX-LT-021': [], 'CW-TT-011': [], 'CR-LT-011': [] };
// // // //         }

// // // //         // Collect data points for each key in this minute/hour
// // // //         ['AX-LT-011', 'AX-LT-021', 'CW-TT-011', 'CR-LT-011'].forEach((dataKey) => {
// // // //           if (current[dataKey] !== null && current[dataKey] !== undefined) {
// // // //             acc[key][dataKey].push(current[dataKey]); // Add the value to the array for averaging later
// // // //           }
// // // //         });

// // // //         return acc;
// // // //       }, {})
// // // //     ).map(item => {
// // // //       // Calculate the average for each key
// // // //       ['AX-LT-011', 'AX-LT-021', 'CW-TT-011', 'CR-LT-011'].forEach((dataKey) => {
// // // //         if (item[dataKey].length > 0) {
// // // //           item[dataKey] = calculateAverage(item[dataKey]); // Replace the array with the average
// // // //         } else {
// // // //           item[dataKey] = null; // Handle cases where no data was available for this key in that time period
// // // //         }
// // // //       });
// // // //       return item;
// // // //     });

// // // //     // Render the chart with averaged data
// // // //     return (
// // // //       <ResponsiveContainer width="100%" height={400}>
// // // //         <LineChart data={averagedData} syncId="syncChart">
// // // //           <CartesianGrid strokeDasharray="3 3" />
// // // //           <XAxis dataKey="timestamp" />
// // // //           {chart.yAxisDataKeys.map((yAxis) => (
// // // //             <YAxis
// // // //               key={yAxis.id}
// // // //               yAxisId={yAxis.id}
// // // //               domain={getYAxisDomain(yAxis.range)}
// // // //               stroke={yAxis.color}
// // // //             />
// // // //           ))}
// // // //           <Tooltip />
// // // //           <Legend />
// // // //           <Brush />
// // // //           {chart.yAxisDataKeys.map((yAxis) =>
// // // //             yAxis.dataKeys.map((key) => (
// // // //               <Line
// // // //                 key={key}
// // // //                 type="monotone"
// // // //                 dataKey={key}
// // // //                 stroke={yAxis.color}
// // // //                 strokeDasharray={
// // // //                   yAxis.lineStyle === 'solid'
// // // //                     ? ''
// // // //                     : yAxis.lineStyle === 'dotted'
// // // //                     ? '1 1'
// // // //                     : '5 5'
// // // //                 }
// // // //                 yAxisId={yAxis.id}
// // // //               />
// // // //             ))
// // // //           )}
// // // //         </LineChart>
// // // //       </ResponsiveContainer>
// // // //     );
// // // //   };

// // // //   return (
// // // //     <LocalizationProvider dateAdapter={AdapterDateFns}>
// // // //     <Container>
// // // //       <Box display="flex" justifyContent="flex-end" marginBottom={4}>
// // // //         <Button variant="contained" color="primary" onClick={() => setChartDialogOpen(true)}>
// // // //           Add Custom Chart
// // // //         </Button>
// // // //       </Box>

// // // //       <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
// // // //         <DialogTitle>Select Chart Type</DialogTitle>
// // // //         <DialogContent>
// // // //           <Box display="flex" flexDirection="column" gap={2}>
// // // //             <Button variant="contained" onClick={() => addCustomChart('Line')}>Add Line Chart</Button>
// // // //           </Box>
// // // //         </DialogContent>
// // // //         <DialogActions>
// // // //           <Button onClick={() => setChartDialogOpen(false)} color="secondary">Cancel</Button>
// // // //         </DialogActions>
// // // //       </Dialog>

// // // //       {charts.map((chart) => (
// // // //         <Box key={chart.id} marginY={4} position="relative">
// // // //           <IconButton
// // // //             aria-label="delete"
// // // //             onClick={() => deleteChart(chart.id)}
// // // //             style={{ position: "absolute", right: 0, top: 0, zIndex: 10 }}
// // // //           >
// // // //             <DeleteIcon />
// // // //           </IconButton>
// // // //           <Box border={1} padding={2}>
// // // //             {renderChart(chart)}
// // // //             <Box display="flex" justifyContent="space-between">
// // // //               <Button variant="outlined" color="primary" onClick={() => openDialog(chart)}>
// // // //                 Configure Chart
// // // //               </Button>
// // // //               <Button variant="outlined" color="primary" onClick={() => setDateDialogOpen(true)}>
// // // //                 Date Range Select
// // // //               </Button>
// // // //             </Box>
// // // //           </Box>
// // // //         </Box>
// // // //       ))}

// // // //       {tempChartData && (
// // // //         <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
// // // //           <DialogTitle>Configure Chart</DialogTitle>
// // // //           <DialogContent>
// // // //             <Box display="flex" flexDirection="column" maxHeight="400px" overflow="auto">
// // // //               {tempChartData.yAxisDataKeys.map((yAxis, index) => (
// // // //                 <Box key={yAxis.id} display="flex" flexDirection="column" marginBottom={2}>
// // // //                   <Box display="flex" justifyContent="space-between" alignItems="center">
// // // //                     <Typography variant="h6">Y-Axis {index + 1}</Typography>
// // // //                     <IconButton onClick={() => deleteYAxis(yAxis.id)}>
// // // //                       <DeleteIcon />
// // // //                     </IconButton>
// // // //                   </Box>
// // // //                   <FormControl fullWidth margin="normal">
// // // //                     <InputLabel>Data Keys</InputLabel>
// // // //                     <Select
// // // //                       multiple
// // // //                       value={yAxis.dataKeys}
// // // //                       onChange={(event) => handleDataKeyChange(yAxis.id, event)}
// // // //                     >
// // // //                       <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
// // // //                       <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
// // // //                       <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
// // // //                       <MenuItem value="CR-LT-011">CR-LT-011</MenuItem>

// // // //                     </Select>
// // // //                   </FormControl>
// // // //                   <FormControl fullWidth margin="normal">
// // // //                     <InputLabel>Range</InputLabel>
// // // //                     <Select
// // // //                       value={yAxis.range}
// // // //                       onChange={(event) => handleRangeChange(yAxis.id, event)}
// // // //                     >
// // // //                       <MenuItem value="0-500">0-500</MenuItem>
// // // //                       <MenuItem value="0-100">0-100</MenuItem>
// // // //                       <MenuItem value="0-10">0-10</MenuItem>
// // // //                     </Select>
// // // //                   </FormControl>
// // // //                   <FormControl fullWidth margin="normal">
// // // //                     <InputLabel>Line Style</InputLabel>
// // // //                     <Select
// // // //                       value={yAxis.lineStyle}
// // // //                       onChange={(event) => handleLineStyleChange(yAxis.id, event)}
// // // //                     >
// // // //                       <MenuItem value="solid">Solid</MenuItem>
// // // //                       <MenuItem value="dotted">Dotted</MenuItem>
// // // //                       <MenuItem value="dashed">Dashed</MenuItem>
// // // //                     </Select>
// // // //                   </FormControl>
// // // //                   <Button onClick={() => openColorPicker(yAxis.id)}>Select Color</Button>
// // // //                   {colorPickerOpen && selectedYAxisId === yAxis.id && (
// // // //                     <SketchPicker color={yAxis.color} onChangeComplete={handleColorChange} />
// // // //                   )}
// // // //                 </Box>
// // // //               ))}
// // // //               <Button variant="contained" color="secondary" onClick={addYAxis}>
// // // //                 Add Y-Axis
// // // //               </Button>
// // // //             </Box>
// // // //           </DialogContent>
// // // //           <DialogActions>
// // // //             <Button onClick={closeDialog} color="secondary">Cancel</Button>
// // // //             <Button onClick={saveConfiguration} color="primary">Save</Button>
// // // //           </DialogActions>
// // // //         </Dialog>
// // // //       )}

// // // //       <Dialog open={dateDialogOpen} onClose={() => setDateDialogOpen(false)} fullWidth maxWidth="sm">
// // // //         <DialogTitle>Select Date Range</DialogTitle>
// // // //         <DialogContent>
// // // //           <Grid container spacing={2} alignItems="center">
// // // //             <Grid item xs={12}>
// // // //               <FormControlLabel
// // // //                 control={<Switch checked={realTimeData} onChange={(e) => setRealTimeData(e.target.checked)} />}
// // // //                 label="Switch to Real-Time Data"
// // // //               />
// // // //             </Grid>
// // // //             <Grid item xs={6}>
// // // //               {/* Start DateTime Picker in 24-Hour Format */}
// // // //               <DateTimePicker
// // // //                 label="Start Date and Time"
// // // //                 value={startDate}
// // // //                 onChange={setStartDate}
// // // //                 renderInput={(params) => <TextField {...params} fullWidth />}
// // // //                 ampm={false}  // Disable AM/PM for 24-hour format
// // // //                 inputFormat="yyyy/MM/dd HH:mm"  // Use 24-hour format
// // // //               />
// // // //             </Grid>
// // // //             <Grid item xs={6}>
// // // //               {/* End DateTime Picker in 24-Hour Format */}
// // // //               <DateTimePicker
// // // //                 label="End Date and Time"
// // // //                 value={endDate}
// // // //                 onChange={setEndDate}
// // // //                 renderInput={(params) => <TextField {...params} fullWidth />}
// // // //                 disabled={realTimeData}
// // // //                 ampm={false}  // Disable AM/PM for 24-hour format
// // // //                 inputFormat="yyyy/MM/dd HH:mm"  // Use 24-hour format
// // // //               />
// // // //             </Grid>
// // // //           </Grid>
// // // //         </DialogContent>
// // // //         <DialogActions>
// // // //           <Button onClick={() => setDateDialogOpen(false)} color="secondary">Cancel</Button>
// // // //           <Button
// // // //             onClick={() => {
// // // //               setDateDialogOpen(false);
// // // //               if (!realTimeData) fetchHistoricalData();
// // // //             }}
// // // //             color="primary"
// // // //             disabled={!startDate || (!realTimeData && !endDate)}
// // // //           >
// // // //             Apply
// // // //           </Button>
// // // //         </DialogActions>
// // // //       </Dialog>
// // // //     </Container>
// // // //   </LocalizationProvider>

// // // //   );
// // // // };

// // // // export default CustomCharts;

// // // // import React, { useState, useEffect, useRef } from "react";
// // // // import {
// // // //   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush
// // // // } from "recharts";
// // // // import {
// // // //   Container, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
// // // //   FormControl, InputLabel, Select, MenuItem, Typography, IconButton, Grid, TextField, Switch, FormControlLabel
// // // // } from "@mui/material";
// // // // import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// // // // import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// // // // import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// // // // import axios from 'axios';
// // // // import { format } from 'date-fns';
// // // // import { w3cwebsocket as W3CWebSocket } from "websocket";
// // // // import DeleteIcon from '@mui/icons-material/Delete';
// // // // import { SketchPicker } from 'react-color';

// // // // const CustomCharts = () => {
// // // //   const [data, setData] = useState([]);
// // // //   const [charts, setCharts] = useState([]);
// // // //   const [chartDialogOpen, setChartDialogOpen] = useState(false);
// // // //   const [dialogOpen, setDialogOpen] = useState(false);
// // // //   const [tempChartData, setTempChartData] = useState(null);
// // // //   const [colorPickerOpen, setColorPickerOpen] = useState(false);
// // // //   const [selectedYAxisId, setSelectedYAxisId] = useState(null);

// // // //   const [dateDialogOpen, setDateDialogOpen] = useState(false);
// // // //   const [startDate, setStartDate] = useState(null);
// // // //   const [endDate, setEndDate] = useState(null);
// // // //   const [realTimeData, setRealTimeData] = useState(false);
// // // //   const [loading, setLoading] = useState(false);

// // // //   const wsClientRef = useRef(null);
// // // //     // State for the start and end datetime, but without default values
// // // //     const [startDateTime, setStartDateTime] = useState(null);
// // // //     const [endDateTime, setEndDateTime] = useState(null);

// // // //     const handleApply = () => {
// // // //       if (startDateTime && endDateTime) {
// // // //         // Format dates for display or API usage
// // // //         const formattedStartDateTime = format(startDateTime, "yyyy-MM-dd'T'HH:mm:ss");
// // // //         const formattedEndDateTime = format(endDateTime, "yyyy-MM-dd'T'HH:mm:ss");
// // // //         console.log("Start:", formattedStartDateTime);
// // // //         console.log("End:", formattedEndDateTime);
// // // //         // Add logic to fetch data here based on the selected date range
// // // //       }
// // // //     };
// // // //   // Real-time data handling
// // // //   useEffect(() => {
// // // //     if (realTimeData) {
// // // //       if (wsClientRef.current) wsClientRef.current.close();

// // // //       wsClientRef.current = new W3CWebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");

// // // //       wsClientRef.current.onmessage = (message) => {
// // // //         try {
// // // //           const receivedData = JSON.parse(message.data);
// // // //           const payload = receivedData.payload || {};
// // // //           const newData = {
// // // //             timestamp: receivedData.timestamp || Date.now(),
// // // //             'AX-LT-011': payload['AX-LT-011'] || null,
// // // //             'AX-LT-021': payload['AX-LT-021'] || null,
// // // //             'CW-TT-011': payload['CW-TT-011'] || null,
// // // //             'CR-LT-011': payload['CR-LT-011'] || null,
// // // //           };

// // // //           if (newData['AX-LT-011'] !== null || newData['AX-LT-021'] !== null || newData['CW-TT-011'] !== null) {
// // // //             setData((prevData) => [...prevData, newData]);
// // // //           }
// // // //         } catch (error) {
// // // //           console.error("Error processing WebSocket message:", error);
// // // //         }
// // // //       };

// // // //       wsClientRef.current.onclose = () => {
// // // //         console.log("WebSocket disconnected. Reconnecting...");
// // // //         setTimeout(() => {
// // // //           wsClientRef.current = new W3CWebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");
// // // //         }, 1000);
// // // //       };

// // // //       return () => {
// // // //         if (wsClientRef.current) wsClientRef.current.close();
// // // //       };
// // // //     }
// // // //   }, [realTimeData]);

// // // //   const fetchHistoricalData = async () => {
// // // //     if (!startDate || !endDate) return;
// // // //     setLoading(true);

// // // //     try {
// // // //       const historicalData = [];
// // // //       let currentDate = startDate;

// // // //       // Loop through the time range until we reach or surpass the end date
// // // //       while (currentDate <= endDate) {
// // // //         const formattedStartDate = format(currentDate, 'yyyy-MM-dd');
// // // //         const formattedStartTime = format(currentDate, 'HH:mm');

// // // //         // Calculate the next hour or the end date, whichever comes first
// // // //         const nextHour = new Date(currentDate.getTime() + 60 * 60 * 1000);
// // // //         const formattedEndDate = format(Math.min(nextHour.getTime(), endDate.getTime()), 'yyyy-MM-dd');
// // // //         const formattedEndTime = format(Math.min(nextHour.getTime(), endDate.getTime()), 'HH:mm');

// // // //         // Fetch data for the current time range
// // // //         const response = await axios.post('https://7ko9a0hlo2.execute-api.us-east-1.amazonaws.com/dev/data', {
// // // //           start_date: formattedStartDate,
// // // //           start_time: formattedStartTime,
// // // //           end_date: formattedEndDate,
// // // //           end_time: formattedEndTime,
// // // //           plot_all: true
// // // //         });

// // // //         // Combine the fetched data into one array
// // // //         const hourlyData = response.data.data.map(item => ({
// // // //           timestamp: item.timestamp,
// // // //           'AX-LT-011': item.payload['AX-LT-011'],
// // // //           'AX-LT-021': item.payload['AX-LT-021'],
// // // //           'CW-TT-011': item.payload['CW-TT-011'],
// // // //         }));

// // // //         historicalData.push(...hourlyData);

// // // //         // Move currentDate forward by one hour
// // // //         currentDate = nextHour;
// // // //       }

// // // //       // Set data to plot on the graph
// // // //       setData(historicalData);

// // // //     } catch (error) {
// // // //       console.error('Error fetching historical data:', error);
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   };

// // // //   const addCustomChart = (type) => {
// // // //     const newChart = {
// // // //       id: Date.now(),
// // // //       type,
// // // //       yAxisDataKeys: [
// // // //         { id: 'left-0', dataKeys: ['AX-LT-011'], range: '0-500', color: "#FF0000", lineStyle: 'solid' }
// // // //       ],
// // // //     };
// // // //     setCharts((prevCharts) => [...prevCharts, newChart]);
// // // //     setChartDialogOpen(false);
// // // //   };

// // // //   const openDialog = (chart) => {
// // // //     setTempChartData(chart);
// // // //     setDialogOpen(true);
// // // //   };

// // // //   const closeDialog = () => setDialogOpen(false);

// // // //   const saveConfiguration = () => {
// // // //     setCharts((prevCharts) =>
// // // //       prevCharts.map((chart) =>
// // // //         chart.id === tempChartData.id ? tempChartData : chart
// // // //       )
// // // //     );
// // // //     setDialogOpen(false);
// // // //   };

// // // //   const openColorPicker = (yAxisId) => {
// // // //     setSelectedYAxisId(yAxisId);
// // // //     setColorPickerOpen(true);
// // // //   };

// // // //   const handleColorChange = (color) => {
// // // //     setTempChartData((prevChart) => ({
// // // //       ...prevChart,
// // // //       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
// // // //         yAxis.id === selectedYAxisId ? { ...yAxis, color: color.hex } : yAxis
// // // //       ),
// // // //     }));
// // // //     setColorPickerOpen(false);
// // // //   };

// // // //   const handleDataKeyChange = (yAxisId, event) => {
// // // //     const { value } = event.target;
// // // //     setTempChartData((prevChart) => ({
// // // //       ...prevChart,
// // // //       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
// // // //         yAxis.id === yAxisId ? { ...yAxis, dataKeys: value } : yAxis
// // // //       ),
// // // //     }));
// // // //   };

// // // //   const handleRangeChange = (yAxisId, event) => {
// // // //     const { value } = event.target;
// // // //     setTempChartData((prevChart) => ({
// // // //       ...prevChart,
// // // //       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
// // // //         yAxis.id === yAxisId ? { ...yAxis, range: value } : yAxis
// // // //       ),
// // // //     }));
// // // //   };

// // // //   const handleLineStyleChange = (yAxisId, event) => {
// // // //     const { value } = event.target;
// // // //     setTempChartData((prevChart) => ({
// // // //       ...prevChart,
// // // //       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
// // // //         yAxis.id === yAxisId ? { ...yAxis, lineStyle: value } : yAxis
// // // //       ),
// // // //     }));
// // // //   };

// // // //   const deleteChart = (chartId) => {
// // // //     setCharts((prevCharts) => prevCharts.filter((chart) => chart.id !== chartId));
// // // //   };

// // // //   const addYAxis = () => {
// // // //     setTempChartData((prevChart) => ({
// // // //       ...prevChart,
// // // //       yAxisDataKeys: [
// // // //         ...prevChart.yAxisDataKeys,
// // // //         { id: `left-${prevChart.yAxisDataKeys.length}`, dataKeys: [], range: '0-500', color: '#FF0000', lineStyle: 'solid' },
// // // //       ],
// // // //     }));
// // // //   };

// // // //   const deleteYAxis = (yAxisId) => {
// // // //     setTempChartData((prevChart) => ({
// // // //       ...prevChart,
// // // //       yAxisDataKeys: prevChart.yAxisDataKeys.filter((yAxis) => yAxis.id !== yAxisId),
// // // //     }));
// // // //   };

// // // //   const getYAxisDomain = (range) => {
// // // //     switch (range) {
// // // //       case "0-500": return [0, 500];
// // // //       case "0-100": return [0, 100];
// // // //       case "0-10": return [0, 10];
// // // //       default: return [0, 500];
// // // //     }
// // // //   };

// // // //   const renderChart = (chart) => {
// // // //     // Function to extract the minute from the timestamp
// // // //     const getMinute = (timestamp) => {
// // // //       const date = new Date(timestamp);
// // // //       return date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate() + ' ' +
// // // //              date.getHours() + ':' + date.getMinutes();
// // // //     };

// // // //     // Function to calculate the average of an array of numbers
// // // //     const calculateAverage = (values) => {
// // // //       if (values.length === 0) return null;
// // // //       const sum = values.reduce((a, b) => a + b, 0);
// // // //       return sum / values.length;
// // // //     };

// // // //     // Group data points by minute and calculate the average for each minute
// // // //     const averagedData = Object.values(
// // // //       data.reduce((acc, current) => {
// // // //         const minute = getMinute(current.timestamp);

// // // //         // Initialize entry for this minute if it doesn't exist
// // // //         if (!acc[minute]) {
// // // //           acc[minute] = { timestamp: current.timestamp, 'AX-LT-011': [], 'AX-LT-021': [], 'CW-TT-011': [] };
// // // //         }

// // // //         // Collect data points for each key in this minute
// // // //         ['AX-LT-011', 'AX-LT-021', 'CW-TT-011'].forEach((key) => {
// // // //           if (current[key] !== null && current[key] !== undefined) {
// // // //             acc[minute][key].push(current[key]); // Add the value to the array for averaging later
// // // //           }
// // // //         });

// // // //         return acc;
// // // //       }, {})
// // // //     ).map(item => {
// // // //       // Calculate the average for each key
// // // //       ['AX-LT-011', 'AX-LT-021', 'CW-TT-011'].forEach((key) => {
// // // //         if (item[key].length > 0) {
// // // //           item[key] = calculateAverage(item[key]); // Replace the array with the average
// // // //         } else {
// // // //           item[key] = null; // Handle cases where no data was available for this key in that minute
// // // //         }
// // // //       });
// // // //       return item;
// // // //     });

// // // //     return (
// // // //       <ResponsiveContainer width="100%" height={400}>
// // // //         <LineChart data={averagedData} syncId="syncChart">
// // // //           <CartesianGrid strokeDasharray="3 3" />
// // // //           <XAxis dataKey="timestamp" />
// // // //           {chart.yAxisDataKeys.map((yAxis) => (
// // // //             <YAxis
// // // //               key={yAxis.id}
// // // //               yAxisId={yAxis.id}
// // // //               domain={getYAxisDomain(yAxis.range)}
// // // //               stroke={yAxis.color}
// // // //             />
// // // //           ))}
// // // //           <Tooltip />
// // // //           <Legend />
// // // //           <Brush />
// // // //           {chart.yAxisDataKeys.map((yAxis) =>
// // // //             yAxis.dataKeys.map((key) => (
// // // //               <Line
// // // //                 key={key}
// // // //                 type="monotone"
// // // //                 dataKey={key}
// // // //                 stroke={yAxis.color}
// // // //                 strokeDasharray={
// // // //                   yAxis.lineStyle === 'solid'
// // // //                     ? ''
// // // //                     : yAxis.lineStyle === 'dotted'
// // // //                     ? '1 1'
// // // //                     : '5 5'
// // // //                 }
// // // //                 yAxisId={yAxis.id}
// // // //               />
// // // //             ))
// // // //           )}
// // // //         </LineChart>
// // // //       </ResponsiveContainer>
// // // //     );
// // // //   };

// // // //   return (
// // // //     <LocalizationProvider dateAdapter={AdapterDateFns}>
// // // //     <Container>
// // // //       <Box display="flex" justifyContent="flex-end" marginBottom={4}>
// // // //         <Button variant="contained" color="primary" onClick={() => setChartDialogOpen(true)}>
// // // //           Add Custom Chart
// // // //         </Button>
// // // //       </Box>

// // // //       <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
// // // //         <DialogTitle>Select Chart Type</DialogTitle>
// // // //         <DialogContent>
// // // //           <Box display="flex" flexDirection="column" gap={2}>
// // // //             <Button variant="contained" onClick={() => addCustomChart('Line')}>Add Line Chart</Button>
// // // //           </Box>
// // // //         </DialogContent>
// // // //         <DialogActions>
// // // //           <Button onClick={() => setChartDialogOpen(false)} color="secondary">Cancel</Button>
// // // //         </DialogActions>
// // // //       </Dialog>

// // // //       {charts.map((chart) => (
// // // //         <Box key={chart.id} marginY={4} position="relative">
// // // //           <IconButton
// // // //             aria-label="delete"
// // // //             onClick={() => deleteChart(chart.id)}
// // // //             style={{ position: "absolute", right: 0, top: 0, zIndex: 10 }}
// // // //           >
// // // //             <DeleteIcon />
// // // //           </IconButton>
// // // //           <Box border={1} padding={2}>
// // // //             {renderChart(chart)}
// // // //             <Box display="flex" justifyContent="space-between">
// // // //               <Button variant="outlined" color="primary" onClick={() => openDialog(chart)}>
// // // //                 Configure Chart
// // // //               </Button>
// // // //               <Button variant="outlined" color="primary" onClick={() => setDateDialogOpen(true)}>
// // // //                 Date Range Select
// // // //               </Button>
// // // //             </Box>
// // // //           </Box>
// // // //         </Box>
// // // //       ))}

// // // //       {tempChartData && (
// // // //         <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
// // // //           <DialogTitle>Configure Chart</DialogTitle>
// // // //           <DialogContent>
// // // //             <Box display="flex" flexDirection="column" maxHeight="400px" overflow="auto">
// // // //               {tempChartData.yAxisDataKeys.map((yAxis, index) => (
// // // //                 <Box key={yAxis.id} display="flex" flexDirection="column" marginBottom={2}>
// // // //                   <Box display="flex" justifyContent="space-between" alignItems="center">
// // // //                     <Typography variant="h6">Y-Axis {index + 1}</Typography>
// // // //                     <IconButton onClick={() => deleteYAxis(yAxis.id)}>
// // // //                       <DeleteIcon />
// // // //                     </IconButton>
// // // //                   </Box>
// // // //                   <FormControl fullWidth margin="normal">
// // // //                     <InputLabel>Data Keys</InputLabel>
// // // //                     <Select
// // // //                       multiple
// // // //                       value={yAxis.dataKeys}
// // // //                       onChange={(event) => handleDataKeyChange(yAxis.id, event)}
// // // //                     >
// // // //                       <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
// // // //                       <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
// // // //                       <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
// // // //                       <MenuItem value="CR-LT-011">CR-LT-011</MenuItem>

// // // //                     </Select>
// // // //                   </FormControl>
// // // //                   <FormControl fullWidth margin="normal">
// // // //                     <InputLabel>Range</InputLabel>
// // // //                     <Select
// // // //                       value={yAxis.range}
// // // //                       onChange={(event) => handleRangeChange(yAxis.id, event)}
// // // //                     >
// // // //                       <MenuItem value="0-500">0-500</MenuItem>
// // // //                       <MenuItem value="0-100">0-100</MenuItem>
// // // //                       <MenuItem value="0-10">0-10</MenuItem>
// // // //                     </Select>
// // // //                   </FormControl>
// // // //                   <FormControl fullWidth margin="normal">
// // // //                     <InputLabel>Line Style</InputLabel>
// // // //                     <Select
// // // //                       value={yAxis.lineStyle}
// // // //                       onChange={(event) => handleLineStyleChange(yAxis.id, event)}
// // // //                     >
// // // //                       <MenuItem value="solid">Solid</MenuItem>
// // // //                       <MenuItem value="dotted">Dotted</MenuItem>
// // // //                       <MenuItem value="dashed">Dashed</MenuItem>
// // // //                     </Select>
// // // //                   </FormControl>
// // // //                   <Button onClick={() => openColorPicker(yAxis.id)}>Select Color</Button>
// // // //                   {colorPickerOpen && selectedYAxisId === yAxis.id && (
// // // //                     <SketchPicker color={yAxis.color} onChangeComplete={handleColorChange} />
// // // //                   )}
// // // //                 </Box>
// // // //               ))}
// // // //               <Button variant="contained" color="secondary" onClick={addYAxis}>
// // // //                 Add Y-Axis
// // // //               </Button>
// // // //             </Box>
// // // //           </DialogContent>
// // // //           <DialogActions>
// // // //             <Button onClick={closeDialog} color="secondary">Cancel</Button>
// // // //             <Button onClick={saveConfiguration} color="primary">Save</Button>
// // // //           </DialogActions>
// // // //         </Dialog>
// // // //       )}

// // // //       <Dialog open={dateDialogOpen} onClose={() => setDateDialogOpen(false)} fullWidth maxWidth="sm">
// // // //         <DialogTitle>Select Date Range</DialogTitle>
// // // //         <DialogContent>
// // // //           <Grid container spacing={2} alignItems="center">
// // // //             <Grid item xs={12}>
// // // //               <FormControlLabel
// // // //                 control={<Switch checked={realTimeData} onChange={(e) => setRealTimeData(e.target.checked)} />}
// // // //                 label="Switch to Real-Time Data"
// // // //               />
// // // //             </Grid>
// // // //             <Grid item xs={6}>
// // // //               {/* Start DateTime Picker in 24-Hour Format */}
// // // //               <DateTimePicker
// // // //                 label="Start Date and Time"
// // // //                 value={startDate}
// // // //                 onChange={setStartDate}
// // // //                 renderInput={(params) => <TextField {...params} fullWidth />}
// // // //                 ampm={false}  // Disable AM/PM for 24-hour format
// // // //                 inputFormat="yyyy/MM/dd HH:mm"  // Use 24-hour format
// // // //               />
// // // //             </Grid>
// // // //             <Grid item xs={6}>
// // // //               {/* End DateTime Picker in 24-Hour Format */}
// // // //               <DateTimePicker
// // // //                 label="End Date and Time"
// // // //                 value={endDate}
// // // //                 onChange={setEndDate}
// // // //                 renderInput={(params) => <TextField {...params} fullWidth />}
// // // //                 disabled={realTimeData}
// // // //                 ampm={false}  // Disable AM/PM for 24-hour format
// // // //                 inputFormat="yyyy/MM/dd HH:mm"  // Use 24-hour format
// // // //               />
// // // //             </Grid>
// // // //           </Grid>
// // // //         </DialogContent>
// // // //         <DialogActions>
// // // //           <Button onClick={() => setDateDialogOpen(false)} color="secondary">Cancel</Button>
// // // //           <Button
// // // //             onClick={() => {
// // // //               setDateDialogOpen(false);
// // // //               if (!realTimeData) fetchHistoricalData();
// // // //             }}
// // // //             color="primary"
// // // //             disabled={!startDate || (!realTimeData && !endDate)}
// // // //           >
// // // //             Apply
// // // //           </Button>
// // // //         </DialogActions>
// // // //       </Dialog>
// // // //     </Container>
// // // //   </LocalizationProvider>

// // // //   );
// // // // };

// // // // export default CustomCharts;

// // // // import React, { useState, useEffect, useRef } from "react";
// // // // import {
// // // //   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush
// // // // } from "recharts";
// // // // import {
// // // //   Container, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
// // // //   FormControl, InputLabel, Select, MenuItem, Typography, IconButton, Grid, TextField, Switch, FormControlLabel
// // // // } from "@mui/material";
// // // // import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// // // // import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// // // // import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// // // // import axios from 'axios';
// // // // import { format } from 'date-fns';
// // // // import { w3cwebsocket as W3CWebSocket } from "websocket";
// // // // import DeleteIcon from '@mui/icons-material/Delete';
// // // // import { SketchPicker } from 'react-color';
// // // // import { differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';

// // // // const CustomCharts = () => {
// // // //   const [data, setData] = useState([]);
// // // //   const [charts, setCharts] = useState([]);
// // // //   const [chartDialogOpen, setChartDialogOpen] = useState(false);
// // // //   const [dialogOpen, setDialogOpen] = useState(false);
// // // //   const [tempChartData, setTempChartData] = useState(null);
// // // //   const [colorPickerOpen, setColorPickerOpen] = useState(false);
// // // //   const [selectedYAxisId, setSelectedYAxisId] = useState(null);

// // // //   const [dateDialogOpen, setDateDialogOpen] = useState(false);
// // // //   const [startDate, setStartDate] = useState(null);
// // // //   const [endDate, setEndDate] = useState(null);
// // // //   const [realTimeData, setRealTimeData] = useState(false);
// // // //   const [loading, setLoading] = useState(false);

// // // //   const wsClientRef = useRef(null);
// // // //     // State for the start and end datetime, but without default values
// // // //     const [startDateTime, setStartDateTime] = useState(null);
// // // //     const [endDateTime, setEndDateTime] = useState(null);

// // // //     const handleApply = () => {
// // // //       if (startDateTime && endDateTime) {
// // // //         // Format dates for display or API usage
// // // //         const formattedStartDateTime = format(startDateTime, "yyyy-MM-dd'T'HH:mm:ss");
// // // //         const formattedEndDateTime = format(endDateTime, "yyyy-MM-dd'T'HH:mm:ss");
// // // //         console.log("Start:", formattedStartDateTime);
// // // //         console.log("End:", formattedEndDateTime);
// // // //         // Add logic to fetch data here based on the selected date range
// // // //       }
// // // //     };
// // // //   // Real-time data handling
// // // //   useEffect(() => {
// // // //     if (realTimeData) {
// // // //       if (wsClientRef.current) wsClientRef.current.close();

// // // //       wsClientRef.current = new W3CWebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");

// // // //       wsClientRef.current.onmessage = (message) => {
// // // //         try {
// // // //           const receivedData = JSON.parse(message.data);
// // // //           const payload = receivedData.payload || {};
// // // //           const newData = {
// // // //             timestamp: receivedData.timestamp || Date.now(),
// // // //             'AX-LT-011': payload['AX-LT-011'] || null,
// // // //             'AX-LT-021': payload['AX-LT-021'] || null,
// // // //             'CW-TT-011': payload['CW-TT-011'] || null,
// // // //             'CR-LT-011': payload['CR-LT-011'] || null,
// // // //           };

// // // //           if (newData['AX-LT-011'] !== null || newData['AX-LT-021'] !== null || newData['CW-TT-011'] !== null) {
// // // //             setData((prevData) => [...prevData, newData]);
// // // //           }
// // // //         } catch (error) {
// // // //           console.error("Error processing WebSocket message:", error);
// // // //         }
// // // //       };

// // // //       wsClientRef.current.onclose = () => {
// // // //         console.log("WebSocket disconnected. Reconnecting...");
// // // //         setTimeout(() => {
// // // //           wsClientRef.current = new W3CWebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");
// // // //         }, 1000);
// // // //       };

// // // //       return () => {
// // // //         if (wsClientRef.current) wsClientRef.current.close();
// // // //       };
// // // //     }
// // // //   }, [realTimeData]);

// // // //   const fetchHistoricalData = async () => {
// // // //     if (!startDate || !endDate) return;
// // // //     setLoading(true);

// // // //     try {
// // // //       const historicalData = [];
// // // //       let currentDate = startDate;

// // // //       // Loop through the time range until we reach or surpass the end date
// // // //       while (currentDate <= endDate) {
// // // //         const formattedStartDate = format(currentDate, 'yyyy-MM-dd');
// // // //         const formattedStartTime = format(currentDate, 'HH:mm');

// // // //         // Calculate the next hour or the end date, whichever comes first
// // // //         const nextHour = new Date(currentDate.getTime() + 60 * 60 * 1000);
// // // //         const formattedEndDate = format(Math.min(nextHour.getTime(), endDate.getTime()), 'yyyy-MM-dd');
// // // //         const formattedEndTime = format(Math.min(nextHour.getTime(), endDate.getTime()), 'HH:mm');

// // // //         // Fetch data for the current time range
// // // //         const response = await axios.post('https://7ko9a0hlo2.execute-api.us-east-1.amazonaws.com/dev/data', {
// // // //           start_date: formattedStartDate,
// // // //           start_time: formattedStartTime,
// // // //           end_date: formattedEndDate,
// // // //           end_time: formattedEndTime,
// // // //           plot_all: true
// // // //         });

// // // //         // Combine the fetched data into one array
// // // //         const hourlyData = response.data.data.map(item => ({
// // // //           timestamp: item.timestamp,
// // // //           'AX-LT-011': item.payload['AX-LT-011'],
// // // //           'AX-LT-021': item.payload['AX-LT-021'],
// // // //           'CW-TT-011': item.payload['CW-TT-011'],
// // // //         }));

// // // //         historicalData.push(...hourlyData);

// // // //         // Move currentDate forward by one hour
// // // //         currentDate = nextHour;
// // // //       }

// // // //       // Set data to plot on the graph
// // // //       setData(historicalData);

// // // //     } catch (error) {
// // // //       console.error('Error fetching historical data:', error);
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   };

// // // //   const addCustomChart = (type) => {
// // // //     const newChart = {
// // // //       id: Date.now(),
// // // //       type,
// // // //       yAxisDataKeys: [
// // // //         { id: 'left-0', dataKeys: ['AX-LT-011'], range: '0-500', color: "#FF0000", lineStyle: 'solid' }
// // // //       ],
// // // //     };
// // // //     setCharts((prevCharts) => [...prevCharts, newChart]);
// // // //     setChartDialogOpen(false);
// // // //   };

// // // //   const openDialog = (chart) => {
// // // //     setTempChartData(chart);
// // // //     setDialogOpen(true);
// // // //   };

// // // //   const closeDialog = () => setDialogOpen(false);

// // // //   const saveConfiguration = () => {
// // // //     setCharts((prevCharts) =>
// // // //       prevCharts.map((chart) =>
// // // //         chart.id === tempChartData.id ? tempChartData : chart
// // // //       )
// // // //     );
// // // //     setDialogOpen(false);
// // // //   };

// // // //   const openColorPicker = (yAxisId) => {
// // // //     setSelectedYAxisId(yAxisId);
// // // //     setColorPickerOpen(true);
// // // //   };

// // // //   const handleColorChange = (color) => {
// // // //     setTempChartData((prevChart) => ({
// // // //       ...prevChart,
// // // //       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
// // // //         yAxis.id === selectedYAxisId ? { ...yAxis, color: color.hex } : yAxis
// // // //       ),
// // // //     }));
// // // //     setColorPickerOpen(false);
// // // //   };

// // // //   const handleDataKeyChange = (yAxisId, event) => {
// // // //     const { value } = event.target;
// // // //     setTempChartData((prevChart) => ({
// // // //       ...prevChart,
// // // //       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
// // // //         yAxis.id === yAxisId ? { ...yAxis, dataKeys: value } : yAxis
// // // //       ),
// // // //     }));
// // // //   };

// // // //   const handleRangeChange = (yAxisId, event) => {
// // // //     const { value } = event.target;
// // // //     setTempChartData((prevChart) => ({
// // // //       ...prevChart,
// // // //       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
// // // //         yAxis.id === yAxisId ? { ...yAxis, range: value } : yAxis
// // // //       ),
// // // //     }));
// // // //   };

// // // //   const handleLineStyleChange = (yAxisId, event) => {
// // // //     const { value } = event.target;
// // // //     setTempChartData((prevChart) => ({
// // // //       ...prevChart,
// // // //       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
// // // //         yAxis.id === yAxisId ? { ...yAxis, lineStyle: value } : yAxis
// // // //       ),
// // // //     }));
// // // //   };

// // // //   const deleteChart = (chartId) => {
// // // //     setCharts((prevCharts) => prevCharts.filter((chart) => chart.id !== chartId));
// // // //   };

// // // //   const addYAxis = () => {
// // // //     setTempChartData((prevChart) => ({
// // // //       ...prevChart,
// // // //       yAxisDataKeys: [
// // // //         ...prevChart.yAxisDataKeys,
// // // //         { id: `left-${prevChart.yAxisDataKeys.length}`, dataKeys: [], range: '0-500', color: '#FF0000', lineStyle: 'solid' },
// // // //       ],
// // // //     }));
// // // //   };

// // // //   const deleteYAxis = (yAxisId) => {
// // // //     setTempChartData((prevChart) => ({
// // // //       ...prevChart,
// // // //       yAxisDataKeys: prevChart.yAxisDataKeys.filter((yAxis) => yAxis.id !== yAxisId),
// // // //     }));
// // // //   };

// // // //   const getYAxisDomain = (range) => {
// // // //     switch (range) {
// // // //       case "0-500": return [0, 500];
// // // //       case "0-100": return [0, 100];
// // // //       case "0-10": return [0, 10];
// // // //       default: return [0, 500];
// // // //     }
// // // //   };

// // // //   const renderChart = (chart) => {
// // // //     const totalMinutes = differenceInMinutes(endDate, startDate);
// // // //     const totalHours = differenceInHours(endDate, startDate);

// // // //     // If total time range is 1 hour or less, display all data points
// // // //     if (totalMinutes <= 60) {
// // // //       // Display all data points without filtering
// // // //       return (
// // // //         <ResponsiveContainer width="100%" height={400}>
// // // //           <LineChart data={data} syncId="syncChart">
// // // //             <CartesianGrid strokeDasharray="3 3" />
// // // //             <XAxis dataKey="timestamp" />
// // // //             {chart.yAxisDataKeys.map((yAxis) => (
// // // //               <YAxis
// // // //                 key={yAxis.id}
// // // //                 yAxisId={yAxis.id}
// // // //                 domain={getYAxisDomain(yAxis.range)}
// // // //                 stroke={yAxis.color}
// // // //               />
// // // //             ))}
// // // //             <Tooltip />
// // // //             <Legend />
// // // //             <Brush />
// // // //             {chart.yAxisDataKeys.map((yAxis) =>
// // // //               yAxis.dataKeys.map((key) => (
// // // //                 <Line
// // // //                   key={key}
// // // //                   type="monotone"
// // // //                   dataKey={key}
// // // //                   stroke={yAxis.color}
// // // //                   strokeDasharray={
// // // //                     yAxis.lineStyle === 'solid'
// // // //                       ? ''
// // // //                       : yAxis.lineStyle === 'dotted'
// // // //                       ? '1 1'
// // // //                       : '5 5'
// // // //                   }
// // // //                   yAxisId={yAxis.id}
// // // //                 />
// // // //               ))
// // // //             )}
// // // //           </LineChart>
// // // //         </ResponsiveContainer>
// // // //       );
// // // //     }

// // // //     // For ranges between 1 hour and 1 day, display 1 point per minute
// // // //     const getMinute = (timestamp) => {
// // // //       const date = new Date(timestamp);
// // // //       return date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate() + ' ' +
// // // //              date.getHours() + ':' + date.getMinutes();
// // // //     };

// // // //     // For ranges greater than 1 day, display 1 point per hour
// // // //     const getHour = (timestamp) => {
// // // //       const date = new Date(timestamp);
// // // //       return date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate() + ' ' +
// // // //              date.getHours();
// // // //     };

// // // //     // Determine the granularity (per minute or per hour)
// // // //     const granularity = totalHours <= 24 ? 'minute' : 'hour';

// // // //     // Filter data based on the granularity (minute or hour)
// // // //     const filteredData = data.reduce((acc, current) => {
// // // //       const key = granularity === 'minute' ? getMinute(current.timestamp) : getHour(current.timestamp);
// // // //       if (!acc.some(item => (granularity === 'minute' ? getMinute(item.timestamp) === key : getHour(item.timestamp) === key))) {
// // // //         acc.push(current);  // Add data based on granularity
// // // //       }
// // // //       return acc;
// // // //     }, []);

// // // //     // Render the filtered data based on the granularity
// // // //     return (
// // // //       <ResponsiveContainer width="100%" height={400}>
// // // //         <LineChart data={filteredData} syncId="syncChart">
// // // //           <CartesianGrid strokeDasharray="3 3" />
// // // //           <XAxis dataKey="timestamp" />
// // // //           {chart.yAxisDataKeys.map((yAxis) => (
// // // //             <YAxis
// // // //               key={yAxis.id}
// // // //               yAxisId={yAxis.id}
// // // //               domain={getYAxisDomain(yAxis.range)}
// // // //               stroke={yAxis.color}
// // // //             />
// // // //           ))}
// // // //           <Tooltip />
// // // //           <Legend />
// // // //           <Brush />
// // // //           {chart.yAxisDataKeys.map((yAxis) =>
// // // //             yAxis.dataKeys.map((key) => (
// // // //               <Line
// // // //                 key={key}
// // // //                 type="monotone"
// // // //                 dataKey={key}
// // // //                 stroke={yAxis.color}
// // // //                 strokeDasharray={
// // // //                   yAxis.lineStyle === 'solid'
// // // //                     ? ''
// // // //                     : yAxis.lineStyle === 'dotted'
// // // //                     ? '1 1'
// // // //                     : '5 5'
// // // //                 }
// // // //                 yAxisId={yAxis.id}
// // // //               />
// // // //             ))
// // // //           )}
// // // //         </LineChart>
// // // //       </ResponsiveContainer>
// // // //     );
// // // //   };

// // // //   return (
// // // //     <LocalizationProvider dateAdapter={AdapterDateFns}>
// // // //     <Container>
// // // //       <Box display="flex" justifyContent="flex-end" marginBottom={4}>
// // // //         <Button variant="contained" color="primary" onClick={() => setChartDialogOpen(true)}>
// // // //           Add Custom Chart
// // // //         </Button>
// // // //       </Box>

// // // //       <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
// // // //         <DialogTitle>Select Chart Type</DialogTitle>
// // // //         <DialogContent>
// // // //           <Box display="flex" flexDirection="column" gap={2}>
// // // //             <Button variant="contained" onClick={() => addCustomChart('Line')}>Add Line Chart</Button>
// // // //           </Box>
// // // //         </DialogContent>
// // // //         <DialogActions>
// // // //           <Button onClick={() => setChartDialogOpen(false)} color="secondary">Cancel</Button>
// // // //         </DialogActions>
// // // //       </Dialog>

// // // //       {charts.map((chart) => (
// // // //         <Box key={chart.id} marginY={4} position="relative">
// // // //           <IconButton
// // // //             aria-label="delete"
// // // //             onClick={() => deleteChart(chart.id)}
// // // //             style={{ position: "absolute", right: 0, top: 0, zIndex: 10 }}
// // // //           >
// // // //             <DeleteIcon />
// // // //           </IconButton>
// // // //           <Box border={1} padding={2}>
// // // //             {renderChart(chart)}
// // // //             <Box display="flex" justifyContent="space-between">
// // // //               <Button variant="outlined" color="primary" onClick={() => openDialog(chart)}>
// // // //                 Configure Chart
// // // //               </Button>
// // // //               <Button variant="outlined" color="primary" onClick={() => setDateDialogOpen(true)}>
// // // //                 Date Range Select
// // // //               </Button>
// // // //             </Box>
// // // //           </Box>
// // // //         </Box>
// // // //       ))}

// // // //       {tempChartData && (
// // // //         <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
// // // //           <DialogTitle>Configure Chart</DialogTitle>
// // // //           <DialogContent>
// // // //             <Box display="flex" flexDirection="column" maxHeight="400px" overflow="auto">
// // // //               {tempChartData.yAxisDataKeys.map((yAxis, index) => (
// // // //                 <Box key={yAxis.id} display="flex" flexDirection="column" marginBottom={2}>
// // // //                   <Box display="flex" justifyContent="space-between" alignItems="center">
// // // //                     <Typography variant="h6">Y-Axis {index + 1}</Typography>
// // // //                     <IconButton onClick={() => deleteYAxis(yAxis.id)}>
// // // //                       <DeleteIcon />
// // // //                     </IconButton>
// // // //                   </Box>
// // // //                   <FormControl fullWidth margin="normal">
// // // //                     <InputLabel>Data Keys</InputLabel>
// // // //                     <Select
// // // //                       multiple
// // // //                       value={yAxis.dataKeys}
// // // //                       onChange={(event) => handleDataKeyChange(yAxis.id, event)}
// // // //                     >
// // // //                       <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
// // // //                       <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
// // // //                       <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
// // // //                       <MenuItem value="CR-LT-011">CR-LT-011</MenuItem>

// // // //                     </Select>
// // // //                   </FormControl>
// // // //                   <FormControl fullWidth margin="normal">
// // // //                     <InputLabel>Range</InputLabel>
// // // //                     <Select
// // // //                       value={yAxis.range}
// // // //                       onChange={(event) => handleRangeChange(yAxis.id, event)}
// // // //                     >
// // // //                       <MenuItem value="0-500">0-500</MenuItem>
// // // //                       <MenuItem value="0-100">0-100</MenuItem>
// // // //                       <MenuItem value="0-10">0-10</MenuItem>
// // // //                     </Select>
// // // //                   </FormControl>
// // // //                   <FormControl fullWidth margin="normal">
// // // //                     <InputLabel>Line Style</InputLabel>
// // // //                     <Select
// // // //                       value={yAxis.lineStyle}
// // // //                       onChange={(event) => handleLineStyleChange(yAxis.id, event)}
// // // //                     >
// // // //                       <MenuItem value="solid">Solid</MenuItem>
// // // //                       <MenuItem value="dotted">Dotted</MenuItem>
// // // //                       <MenuItem value="dashed">Dashed</MenuItem>
// // // //                     </Select>
// // // //                   </FormControl>
// // // //                   <Button onClick={() => openColorPicker(yAxis.id)}>Select Color</Button>
// // // //                   {colorPickerOpen && selectedYAxisId === yAxis.id && (
// // // //                     <SketchPicker color={yAxis.color} onChangeComplete={handleColorChange} />
// // // //                   )}
// // // //                 </Box>
// // // //               ))}
// // // //               <Button variant="contained" color="secondary" onClick={addYAxis}>
// // // //                 Add Y-Axis
// // // //               </Button>
// // // //             </Box>
// // // //           </DialogContent>
// // // //           <DialogActions>
// // // //             <Button onClick={closeDialog} color="secondary">Cancel</Button>
// // // //             <Button onClick={saveConfiguration} color="primary">Save</Button>
// // // //           </DialogActions>
// // // //         </Dialog>
// // // //       )}

// // // //       <Dialog open={dateDialogOpen} onClose={() => setDateDialogOpen(false)} fullWidth maxWidth="sm">
// // // //         <DialogTitle>Select Date Range</DialogTitle>
// // // //         <DialogContent>
// // // //           <Grid container spacing={2} alignItems="center">
// // // //             <Grid item xs={12}>
// // // //               <FormControlLabel
// // // //                 control={<Switch checked={realTimeData} onChange={(e) => setRealTimeData(e.target.checked)} />}
// // // //                 label="Switch to Real-Time Data"
// // // //               />
// // // //             </Grid>
// // // //             <Grid item xs={6}>
// // // //               {/* Start DateTime Picker in 24-Hour Format */}
// // // //               <DateTimePicker
// // // //                 label="Start Date and Time"
// // // //                 value={startDate}
// // // //                 onChange={setStartDate}
// // // //                 renderInput={(params) => <TextField {...params} fullWidth />}
// // // //                 ampm={false}  // Disable AM/PM for 24-hour format
// // // //                 inputFormat="yyyy/MM/dd HH:mm"  // Use 24-hour format
// // // //               />
// // // //             </Grid>
// // // //             <Grid item xs={6}>
// // // //               {/* End DateTime Picker in 24-Hour Format */}
// // // //               <DateTimePicker
// // // //                 label="End Date and Time"
// // // //                 value={endDate}
// // // //                 onChange={setEndDate}
// // // //                 renderInput={(params) => <TextField {...params} fullWidth />}
// // // //                 disabled={realTimeData}
// // // //                 ampm={false}  // Disable AM/PM for 24-hour format
// // // //                 inputFormat="yyyy/MM/dd HH:mm"  // Use 24-hour format
// // // //               />
// // // //             </Grid>
// // // //           </Grid>
// // // //         </DialogContent>
// // // //         <DialogActions>
// // // //           <Button onClick={() => setDateDialogOpen(false)} color="secondary">Cancel</Button>
// // // //           <Button
// // // //             onClick={() => {
// // // //               setDateDialogOpen(false);
// // // //               if (!realTimeData) fetchHistoricalData();
// // // //             }}
// // // //             color="primary"
// // // //             disabled={!startDate || (!realTimeData && !endDate)}
// // // //           >
// // // //             Apply
// // // //           </Button>
// // // //         </DialogActions>
// // // //       </Dialog>
// // // //     </Container>
// // // //   </LocalizationProvider>

// // // //   );
// // // // };

// // // // export default CustomCharts;

// // // // import React, { useState, useEffect, useRef } from "react";
// // // // import {
// // // //   ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush
// // // // } from "recharts";
// // // // import {
// // // //   Container, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
// // // //   FormControl, InputLabel, Select, MenuItem, Typography, IconButton, Grid, TextField, Switch, FormControlLabel
// // // // } from "@mui/material";
// // // // import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// // // // import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// // // // import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// // // // import axios from 'axios';
// // // // import { format } from 'date-fns';
// // // // import { w3cwebsocket as W3CWebSocket } from "websocket";
// // // // import DeleteIcon from '@mui/icons-material/Delete';
// // // // import { SketchPicker } from 'react-color';

// // // // const CustomScatterCharts = () => {
// // // //   const [data, setData] = useState([]);
// // // //   const [charts, setCharts] = useState([]);
// // // //   const [chartDialogOpen, setChartDialogOpen] = useState(false);
// // // //   const [dialogOpen, setDialogOpen] = useState(false);
// // // //   const [tempChartData, setTempChartData] = useState(null);

// // // //   const [dateDialogOpen, setDateDialogOpen] = useState(false);
// // // //   const [startDate, setStartDate] = useState(null);
// // // //   const [endDate, setEndDate] = useState(null);
// // // //   const [realTimeData, setRealTimeData] = useState(false);
// // // //   const [loading, setLoading] = useState(false);

// // // //   const wsClientRef = useRef(null);

// // // //   useEffect(() => {
// // // //     if (realTimeData) {
// // // //       if (wsClientRef.current) wsClientRef.current.close();

// // // //       wsClientRef.current = new W3CWebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");

// // // //       wsClientRef.current.onmessage = (message) => {
// // // //         try {
// // // //           const receivedData = JSON.parse(message.data);
// // // //           const payload = receivedData.payload || {};
// // // //           const newData = {
// // // //             timestamp: receivedData.timestamp || Date.now(),
// // // //             'AX-LT-011': payload['AX-LT-011'] || null,
// // // //             'AX-LT-021': payload['AX-LT-021'] || null,
// // // //             'CW-TT-011': payload['CW-TT-011'] || null,
// // // //           };

// // // //           if (newData['AX-LT-011'] !== null || newData['AX-LT-021'] !== null || newData['CW-TT-011'] !== null) {
// // // //             setData((prevData) => [...prevData, newData]);
// // // //           }
// // // //         } catch (error) {
// // // //           console.error("Error processing WebSocket message:", error);
// // // //         }
// // // //       };

// // // //       wsClientRef.current.onclose = () => {
// // // //         console.log("WebSocket disconnected. Reconnecting...");
// // // //         setTimeout(() => {
// // // //           wsClientRef.current = new W3CWebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");
// // // //         }, 1000);
// // // //       };

// // // //       return () => {
// // // //         if (wsClientRef.current) wsClientRef.current.close();
// // // //       };
// // // //     }
// // // //   }, [realTimeData]);

// // // //   const downsampleData = (data, factor) => {
// // // //     return data.filter((_, index) => index % factor === 0);
// // // //   };

// // // //   const fetchHistoricalData = async () => {
// // // //     if (!startDate || !endDate) return;
// // // //     setLoading(true);

// // // //     try {
// // // //       const formattedStartDate = format(startDate, 'yyyy-MM-dd');
// // // //       const formattedStartTime = format(startDate, 'HH:mm');
// // // //       const formattedEndDate = format(endDate, 'yyyy-MM-dd');
// // // //       const formattedEndTime = format(endDate, 'HH:mm');

// // // //       const response = await axios.post('https://7ko9a0hlo2.execute-api.us-east-1.amazonaws.com/dev/data', {
// // // //         start_date: formattedStartDate,
// // // //         start_time: formattedStartTime,
// // // //         end_date: formattedEndDate,
// // // //         end_time: formattedEndTime,
// // // //         plot_all: true
// // // //       });

// // // //       let historicalData = response.data.data.map(item => ({
// // // //         timestamp: item.timestamp,
// // // //         'AX-LT-011': item.payload['AX-LT-011'],
// // // //         'AX-LT-021': item.payload['AX-LT-021'],
// // // //         'CW-TT-011': item.payload['CW-TT-011'],
// // // //       }));

// // // //       if (historicalData.length > 86400) {
// // // //         historicalData = downsampleData(historicalData, 10);
// // // //       }

// // // //       setData(historicalData);

// // // //     } catch (error) {
// // // //       console.error('Error fetching historical data:', error);
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   };

// // // //   const addCustomChart = (type) => {
// // // //     const newChart = {
// // // //       id: Date.now(),
// // // //       type,
// // // //       xAxisDataKey: 'timestamp',
// // // //       yAxisDataKey: 'AX-LT-011',
// // // //       color: "#FF0000",
// // // //     };
// // // //     setCharts((prevCharts) => [...prevCharts, newChart]);
// // // //     setChartDialogOpen(false);
// // // //   };

// // // //   const openDialog = (chart) => {
// // // //     setTempChartData(chart);
// // // //     setDialogOpen(true);
// // // //   };

// // // //   const closeDialog = () => setDialogOpen(false);

// // // //   const saveConfiguration = () => {
// // // //     setCharts((prevCharts) =>
// // // //       prevCharts.map((chart) =>
// // // //         chart.id === tempChartData.id ? tempChartData : chart
// // // //       )
// // // //     );
// // // //     setDialogOpen(false);
// // // //   };

// // // //   const handleXAxisKeyChange = (event) => {
// // // //     const { value } = event.target;
// // // //     setTempChartData((prevChart) => ({
// // // //       ...prevChart,
// // // //       xAxisDataKey: value
// // // //     }));
// // // //   };

// // // //   const handleYAxisKeyChange = (event) => {
// // // //     const { value } = event.target;
// // // //     setTempChartData((prevChart) => ({
// // // //       ...prevChart,
// // // //       yAxisDataKey: value
// // // //     }));
// // // //   };

// // // //   const handleColorChange = (color) => {
// // // //     setTempChartData((prevChart) => ({
// // // //       ...prevChart,
// // // //       color: color.hex
// // // //     }));
// // // //   };

// // // //   const deleteChart = (chartId) => {
// // // //     setCharts((prevCharts) => prevCharts.filter((chart) => chart.id !== chartId));
// // // //   };

// // // //   const renderChart = (chart) => (
// // // //     <ResponsiveContainer width="100%" height={400}>
// // // //       <ScatterChart>
// // // //         <CartesianGrid strokeDasharray="3 3" />
// // // //         <XAxis dataKey={chart.xAxisDataKey} name={chart.xAxisDataKey} />
// // // //         <YAxis dataKey={chart.yAxisDataKey} name={chart.yAxisDataKey} />
// // // //         <Tooltip cursor={{ strokeDasharray: '3 3' }} />
// // // //         <Legend />
// // // //         <Brush dataKey={chart.xAxisDataKey} height={30} stroke="#8884d8" />
// // // //         <Scatter
// // // //           name={`${chart.xAxisDataKey} vs ${chart.yAxisDataKey}`}
// // // //           data={data}
// // // //           fill={chart.color}
// // // //         />
// // // //         <Brush height={30} dataKey="timestamp" stroke="#8884d8" />
// // // //       </ScatterChart>
// // // //     </ResponsiveContainer>
// // // //   );

// // // //   return (
// // // //     <LocalizationProvider dateAdapter={AdapterDateFns}>
// // // //       <Container>
// // // //         <Box display="flex" justifyContent="flex-end" marginBottom={4}>
// // // //           <Button variant="contained" color="primary" onClick={() => setChartDialogOpen(true)}>
// // // //             Add Custom Scatter Chart
// // // //           </Button>
// // // //         </Box>

// // // //         <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
// // // //           <DialogTitle>Select Chart Type</DialogTitle>
// // // //           <DialogContent>
// // // //             <Box display="flex" flexDirection="column" gap={2}>
// // // //               <Button variant="contained" onClick={() => addCustomChart('Scatter')}>Add Scatter Chart</Button>
// // // //             </Box>
// // // //           </DialogContent>
// // // //           <DialogActions>
// // // //             <Button onClick={() => setChartDialogOpen(false)} color="secondary">Cancel</Button>
// // // //           </DialogActions>
// // // //         </Dialog>

// // // //         {charts.map((chart) => (
// // // //           <Box key={chart.id} marginY={4} position="relative">
// // // //             <IconButton
// // // //               aria-label="delete"
// // // //               onClick={() => deleteChart(chart.id)}
// // // //               style={{ position: "absolute", right: 0, top: 0, zIndex: 10 }}
// // // //             >
// // // //               <DeleteIcon />
// // // //             </IconButton>
// // // //             <Box border={1} padding={2}>
// // // //               {renderChart(chart)}
// // // //               <Box display="flex" justifyContent="space-between">
// // // //                 <Button variant="outlined" color="primary" onClick={() => openDialog(chart)}>
// // // //                   Configure Chart
// // // //                 </Button>
// // // //                 <Button variant="outlined" color="primary" onClick={() => setDateDialogOpen(true)}>
// // // //                   Date Range Select
// // // //                 </Button>
// // // //               </Box>
// // // //             </Box>
// // // //           </Box>
// // // //         ))}

// // // //         {tempChartData && (
// // // //           <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
// // // //             <DialogTitle>Configure Chart</DialogTitle>
// // // //             <DialogContent>
// // // //               <Box display="flex" flexDirection="column" maxHeight="400px" overflow="auto">
// // // //                 <FormControl fullWidth margin="normal">
// // // //                   <InputLabel>X-Axis Data Key</InputLabel>
// // // //                   <Select
// // // //                     value={tempChartData.xAxisDataKey}
// // // //                     onChange={handleXAxisKeyChange}
// // // //                   >
// // // //                     <MenuItem value="timestamp">Timestamp</MenuItem>
// // // //                     <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
// // // //                     <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
// // // //                     <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
// // // //                   </Select>
// // // //                 </FormControl>
// // // //                 <FormControl fullWidth margin="normal">
// // // //                   <InputLabel>Y-Axis Data Key</InputLabel>
// // // //                   <Select
// // // //                     value={tempChartData.yAxisDataKey}
// // // //                     onChange={handleYAxisKeyChange}
// // // //                   >
// // // //                     <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
// // // //                     <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
// // // //                     <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
// // // //                   </Select>
// // // //                 </FormControl>
// // // //                 <Button onClick={() => setDialogOpen(true)}>Select Color</Button>
// // // //                 <SketchPicker color={tempChartData.color} onChangeComplete={handleColorChange} />
// // // //               </Box>
// // // //             </DialogContent>
// // // //             <DialogActions>
// // // //               <Button onClick={closeDialog} color="secondary">Cancel</Button>
// // // //               <Button onClick={saveConfiguration} color="primary">Save</Button>
// // // //             </DialogActions>
// // // //           </Dialog>
// // // //         )}

// // // //         <Dialog open={dateDialogOpen} onClose={() => setDateDialogOpen(false)} fullWidth maxWidth="sm">
// // // //           <DialogTitle>Select Date Range</DialogTitle>
// // // //           <DialogContent>
// // // //             <Grid container spacing={2} alignItems="center">
// // // //               <Grid item xs={12}>
// // // //                 <FormControlLabel
// // // //                   control={<Switch checked={realTimeData} onChange={(e) => setRealTimeData(e.target.checked)} />}
// // // //                   label="Switch to Real-Time Data"
// // // //                 />
// // // //               </Grid>
// // // //               <Grid item xs={6}>
// // // //                 <DateTimePicker
// // // //                   label="Start Date and Time"
// // // //                   value={startDate}
// // // //                   onChange={setStartDate}
// // // //                   renderInput={(params) => <TextField {...params} fullWidth />}
// // // //                 />
// // // //               </Grid>
// // // //               <Grid item xs={6}>
// // // //                 <DateTimePicker
// // // //                   label="End Date and Time"
// // // //                   value={endDate}
// // // //                   onChange={setEndDate}
// // // //                   renderInput={(params) => <TextField {...params} fullWidth />}
// // // //                   disabled={realTimeData}
// // // //                 />
// // // //               </Grid>
// // // //             </Grid>
// // // //           </DialogContent>
// // // //           <DialogActions>
// // // //             <Button onClick={() => setDateDialogOpen(false)} color="secondary">Cancel</Button>
// // // //             <Button
// // // //               onClick={() => {
// // // //                 setDateDialogOpen(false);
// // // //                 if (!realTimeData) fetchHistoricalData();
// // // //               }}
// // // //               color="primary"
// // // //               disabled={!startDate || (!realTimeData && !endDate)}
// // // //             >
// // // //               Apply
// // // //             </Button>
// // // //           </DialogActions>
// // // //         </Dialog>
// // // //       </Container>
// // // //     </LocalizationProvider>
// // // //   );
// // // // };

// // // // export default CustomScatterCharts;

// // // // import React, { useState, useEffect, useRef } from "react";
// // // // import {
// // // //   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush
// // // // } from "recharts";
// // // // import {
// // // //   Container, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
// // // //   FormControl, InputLabel, Select, MenuItem, Typography, IconButton, Grid, TextField, Switch, FormControlLabel
// // // // } from "@mui/material";
// // // // import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// // // // import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// // // // import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// // // // import axios from 'axios';
// // // // import { format } from 'date-fns';
// // // // import { w3cwebsocket as W3CWebSocket } from "websocket";
// // // // import DeleteIcon from '@mui/icons-material/Delete';
// // // // import { SketchPicker } from 'react-color';

// // // // const CustomCharts = () => {
// // // //   const [data, setData] = useState([]);
// // // //   const [charts, setCharts] = useState([]);
// // // //   const [chartDialogOpen, setChartDialogOpen] = useState(false);
// // // //   const [dialogOpen, setDialogOpen] = useState(false);
// // // //   const [tempChartData, setTempChartData] = useState(null);
// // // //   const [colorPickerOpen, setColorPickerOpen] = useState(false);
// // // //   const [selectedYAxisId, setSelectedYAxisId] = useState(null);

// // // //   const [dateDialogOpen, setDateDialogOpen] = useState(false);
// // // //   const [startDate, setStartDate] = useState(null);
// // // //   const [endDate, setEndDate] = useState(null);
// // // //   const [realTimeData, setRealTimeData] = useState(false);
// // // //   const [loading, setLoading] = useState(false);

// // // //   const wsClientRef = useRef(null);

// // // //   // only real-time data handling is their
// // // //   useEffect(() => {
// // // //     if (realTimeData) {
// // // //       if (wsClientRef.current) wsClientRef.current.close();

// // // //       wsClientRef.current = new W3CWebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");

// // // //       wsClientRef.current.onmessage = (message) => {
// // // //         try {
// // // //           const receivedData = JSON.parse(message.data);
// // // //           const payload = receivedData.payload || {};
// // // //           const newData = {
// // // //             timestamp: receivedData.timestamp || Date.now(),
// // // //             'AX-LT-011': payload['AX-LT-011'] || null,
// // // //             'AX-LT-021': payload['AX-LT-021'] || null,
// // // //             'CW-TT-011': payload['CW-TT-011'] || null,
// // // //           };

// // // //           if (newData['AX-LT-011'] !== null || newData['AX-LT-021'] !== null || newData['CW-TT-011'] !== null) {
// // // //             setData((prevData) => [...prevData, newData]);
// // // //           }
// // // //         } catch (error) {
// // // //           console.error("Error processing WebSocket message:", error);
// // // //         }
// // // //       };

// // // //       wsClientRef.current.onclose = () => {
// // // //         console.log("WebSocket disconnected. Reconnecting...");
// // // //         setTimeout(() => {
// // // //           wsClientRef.current = new W3CWebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");
// // // //         }, 1000);
// // // //       };

// // // //       return () => {
// // // //         if (wsClientRef.current) wsClientRef.current.close();
// // // //       };
// // // //     }
// // // //   }, [realTimeData]);

// // // //   const downsampleData = (data, factor) => {
// // // //     return data.filter((_, index) => index % factor === 0);
// // // //   };

// // // //   const fetchHistoricalData = async () => {
// // // //     if (!startDate || !endDate) return;
// // // //     setLoading(true);

// // // //     try {
// // // //       const formattedStartDate = format(startDate, 'yyyy-MM-dd');
// // // //       const formattedStartTime = format(startDate, 'HH:mm');
// // // //       const formattedEndDate = format(endDate, 'yyyy-MM-dd');
// // // //       const formattedEndTime = format(endDate, 'HH:mm');

// // // //       // Fetch data from Lambda
// // // //       const response = await axios.post('https://7ko9a0hlo2.execute-api.us-east-1.amazonaws.com/dev/data', {
// // // //         start_date: formattedStartDate,
// // // //         start_time: formattedStartTime,
// // // //         end_date: formattedEndDate,
// // // //         end_time: formattedEndTime,
// // // //         plot_all: true  // Ensures all data is returned for plotting
// // // //       });

// // // //       let historicalData = response.data.data.map(item => ({
// // // //         timestamp: item.timestamp,
// // // //         'AX-LT-011': item.payload['AX-LT-011'],
// // // //         'AX-LT-021': item.payload['AX-LT-021'],
// // // //         'CW-TT-011': item.payload['CW-TT-011'],
// // // //       }));

// // // //       // If the dataset is larger than 86400 points (e.g., one day of seconds), downsample
// // // //       if (historicalData.length > 86400) {
// // // //         historicalData = downsampleData(historicalData, 10);  // Downsample by a factor of 10
// // // //       }

// // // //       setData(historicalData);  // Set data to plot on the graph

// // // //     } catch (error) {
// // // //       console.error('Error fetching historical data:', error);
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   };

// // // //   const addCustomChart = (type) => {
// // // //     const newChart = {
// // // //       id: Date.now(),
// // // //       type,
// // // //       yAxisDataKeys: [
// // // //         { id: 'left-0', dataKeys: ['AX-LT-011'], range: '0-500', color: "#FF0000", lineStyle: 'solid' }
// // // //       ],
// // // //     };
// // // //     setCharts((prevCharts) => [...prevCharts, newChart]);
// // // //     setChartDialogOpen(false);
// // // //   };

// // // //   const openDialog = (chart) => {
// // // //     setTempChartData(chart);
// // // //     setDialogOpen(true);
// // // //   };

// // // //   const closeDialog = () => setDialogOpen(false);

// // // //   const saveConfiguration = () => {
// // // //     setCharts((prevCharts) =>
// // // //       prevCharts.map((chart) =>
// // // //         chart.id === tempChartData.id ? tempChartData : chart
// // // //       )
// // // //     );
// // // //     setDialogOpen(false);
// // // //   };

// // // //   const openColorPicker = (yAxisId) => {
// // // //     setSelectedYAxisId(yAxisId);
// // // //     setColorPickerOpen(true);
// // // //   };

// // // //   const handleColorChange = (color) => {
// // // //     setTempChartData((prevChart) => ({
// // // //       ...prevChart,
// // // //       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
// // // //         yAxis.id === selectedYAxisId ? { ...yAxis, color: color.hex } : yAxis
// // // //       ),
// // // //     }));
// // // //     setColorPickerOpen(false);
// // // //   };

// // // //   const handleDataKeyChange = (yAxisId, event) => {
// // // //     const { value } = event.target;
// // // //     setTempChartData((prevChart) => ({
// // // //       ...prevChart,
// // // //       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
// // // //         yAxis.id === yAxisId ? { ...yAxis, dataKeys: value } : yAxis
// // // //       ),
// // // //     }));
// // // //   };

// // // //   const handleRangeChange = (yAxisId, event) => {
// // // //     const { value } = event.target;
// // // //     setTempChartData((prevChart) => ({
// // // //       ...prevChart,
// // // //       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
// // // //         yAxis.id === yAxisId ? { ...yAxis, range: value } : yAxis
// // // //       ),
// // // //     }));
// // // //   };

// // // //   const handleLineStyleChange = (yAxisId, event) => {
// // // //     const { value } = event.target;
// // // //     setTempChartData((prevChart) => ({
// // // //       ...prevChart,
// // // //       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
// // // //         yAxis.id === yAxisId ? { ...yAxis, lineStyle: value } : yAxis
// // // //       ),
// // // //     }));
// // // //   };

// // // //   const deleteChart = (chartId) => {
// // // //     setCharts((prevCharts) => prevCharts.filter((chart) => chart.id !== chartId));
// // // //   };

// // // //   const addYAxis = () => {
// // // //     setTempChartData((prevChart) => ({
// // // //       ...prevChart,
// // // //       yAxisDataKeys: [
// // // //         ...prevChart.yAxisDataKeys,
// // // //         { id: `left-${prevChart.yAxisDataKeys.length}`, dataKeys: [], range: '0-500', color: '#FF0000', lineStyle: 'solid' },
// // // //       ],
// // // //     }));
// // // //   };

// // // //   const deleteYAxis = (yAxisId) => {
// // // //     setTempChartData((prevChart) => ({
// // // //       ...prevChart,
// // // //       yAxisDataKeys: prevChart.yAxisDataKeys.filter((yAxis) => yAxis.id !== yAxisId),
// // // //     }));
// // // //   };

// // // //   const getYAxisDomain = (range) => {
// // // //     switch (range) {
// // // //       case "0-500": return [0, 500];
// // // //       case "0-100": return [0, 100];
// // // //       case "0-200": return [0, 200];
// // // //       case "0-10": return [0, 10];
// // // //       default: return [0, 500];
// // // //     }
// // // //   };

// // // //   const renderChart = (chart) => (
// // // //     <ResponsiveContainer width="100%" height={400}>
// // // //       <LineChart data={data} syncId="syncChart">
// // // //         <CartesianGrid strokeDasharray="3 3" />
// // // //         <XAxis dataKey="timestamp" />
// // // //         {chart.yAxisDataKeys.map((yAxis) => (
// // // //           <YAxis
// // // //             key={yAxis.id}
// // // //             yAxisId={yAxis.id}
// // // //             domain={getYAxisDomain(yAxis.range)}
// // // //             stroke={yAxis.color}
// // // //           />
// // // //         ))}
// // // //         <Tooltip />
// // // //         <Legend />
// // // //         <Brush dataKey="timestamp" height={30} stroke="#8884d8" />  {/* Allows zooming */}
// // // //         {chart.yAxisDataKeys.map((yAxis) =>
// // // //           yAxis.dataKeys.map((key) => (
// // // //             <Line
// // // //               key={key}
// // // //               type="monotone"
// // // //               dataKey={key}
// // // //               stroke={yAxis.color}
// // // //               strokeDasharray={
// // // //                 yAxis.lineStyle === 'solid'
// // // //                   ? ''
// // // //                   : yAxis.lineStyle === 'dotted'
// // // //                   ? '1 1'
// // // //                   : '5 5'
// // // //               }
// // // //               yAxisId={yAxis.id}
// // // //             />
// // // //           ))
// // // //         )}
// // // //       </LineChart>
// // // //     </ResponsiveContainer>
// // // //   );

// // // //   return (
// // // //     <LocalizationProvider dateAdapter={AdapterDateFns}>
// // // //       <Container>
// // // //         <Box display="flex" justifyContent="flex-end" marginBottom={4}>
// // // //           <Button variant="contained" color="primary" onClick={() => setChartDialogOpen(true)}>
// // // //             Add Custom Chart
// // // //           </Button>
// // // //         </Box>

// // // //         <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
// // // //           <DialogTitle>Select Chart Type</DialogTitle>
// // // //           <DialogContent>
// // // //             <Box display="flex" flexDirection="column" gap={2}>
// // // //               <Button variant="contained" onClick={() => addCustomChart('Line')}>Add Line Chart</Button>
// // // //             </Box>
// // // //           </DialogContent>
// // // //           <DialogActions>
// // // //             <Button onClick={() => setChartDialogOpen(false)} color="secondary">Cancel</Button>
// // // //           </DialogActions>
// // // //         </Dialog>

// // // //         {charts.map((chart) => (
// // // //           <Box key={chart.id} marginY={4} position="relative">
// // // //             <IconButton
// // // //               aria-label="delete"
// // // //               onClick={() => deleteChart(chart.id)}
// // // //               style={{ position: "absolute", right: 0, top: 0, zIndex: 10 }}
// // // //             >
// // // //               <DeleteIcon />
// // // //             </IconButton>
// // // //             <Box border={1} padding={2}>
// // // //               {renderChart(chart)}
// // // //               <Box display="flex" justifyContent="space-between">
// // // //                 <Button variant="outlined" color="primary" onClick={() => openDialog(chart)}>
// // // //                   Configure Chart
// // // //                 </Button>
// // // //                 <Button variant="outlined" color="primary" onClick={() => setDateDialogOpen(true)}>
// // // //                   Date Range Select
// // // //                 </Button>
// // // //               </Box>
// // // //             </Box>
// // // //           </Box>
// // // //         ))}

// // // //         {tempChartData && (
// // // //           <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
// // // //             <DialogTitle>Configure Chart</DialogTitle>
// // // //             <DialogContent>
// // // //               <Box display="flex" flexDirection="column" maxHeight="400px" overflow="auto">
// // // //                 {tempChartData.yAxisDataKeys.map((yAxis, index) => (
// // // //                   <Box key={yAxis.id} display="flex" flexDirection="column" marginBottom={2}>
// // // //                     <Box display="flex" justifyContent="space-between" alignItems="center">
// // // //                       <Typography variant="h6">Y-Axis {index + 1}</Typography>
// // // //                       <IconButton onClick={() => deleteYAxis(yAxis.id)}>
// // // //                         <DeleteIcon />
// // // //                       </IconButton>
// // // //                     </Box>
// // // //                     <FormControl fullWidth margin="normal">
// // // //                       <InputLabel>Data Keys</InputLabel>
// // // //                       <Select
// // // //                         multiple
// // // //                         value={yAxis.dataKeys}
// // // //                         onChange={(event) => handleDataKeyChange(yAxis.id, event)}
// // // //                       >
// // // //                         <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
// // // //                         <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
// // // //                         <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
// // // //                       </Select>
// // // //                     </FormControl>
// // // //                     <FormControl fullWidth margin="normal">
// // // //                       <InputLabel>Range</InputLabel>
// // // //                       <Select
// // // //                         value={yAxis.range}
// // // //                         onChange={(event) => handleRangeChange(yAxis.id, event)}
// // // //                       >
// // // //                         <MenuItem value="0-500">0-500</MenuItem>
// // // //                         <MenuItem value="0-100">0-100</MenuItem>
// // // //                         <MenuItem value="0-200">0-200</MenuItem>
// // // //                         <MenuItem value="0-10">0-10</MenuItem>
// // // //                       </Select>
// // // //                     </FormControl>
// // // //                     <FormControl fullWidth margin="normal">
// // // //                       <InputLabel>Line Style</InputLabel>
// // // //                       <Select
// // // //                         value={yAxis.lineStyle}
// // // //                         onChange={(event) => handleLineStyleChange(yAxis.id, event)}
// // // //                       >
// // // //                         <MenuItem value="solid">Solid</MenuItem>
// // // //                         <MenuItem value="dotted">Dotted</MenuItem>
// // // //                         <MenuItem value="dashed">Dashed</MenuItem>
// // // //                       </Select>
// // // //                     </FormControl>
// // // //                     <Button onClick={() => openColorPicker(yAxis.id)}>Select Color</Button>
// // // //                     {colorPickerOpen && selectedYAxisId === yAxis.id && (
// // // //                       <SketchPicker color={yAxis.color} onChangeComplete={handleColorChange} />
// // // //                     )}
// // // //                   </Box>
// // // //                 ))}
// // // //                 <Button variant="contained" color="secondary" onClick={addYAxis}>
// // // //                   Add Y-Axis
// // // //                 </Button>
// // // //               </Box>
// // // //             </DialogContent>
// // // //             <DialogActions>
// // // //               <Button onClick={closeDialog} color="secondary">Cancel</Button>
// // // //               <Button onClick={saveConfiguration} color="primary">Save</Button>
// // // //             </DialogActions>
// // // //           </Dialog>
// // // //         )}

// // // //         <Dialog open={dateDialogOpen} onClose={() => setDateDialogOpen(false)} fullWidth maxWidth="sm">
// // // //           <DialogTitle>Select Date Range</DialogTitle>
// // // //           <DialogContent>
// // // //             <Grid container spacing={2} alignItems="center">
// // // //               <Grid item xs={12}>
// // // //                 <FormControlLabel
// // // //                   control={<Switch checked={realTimeData} onChange={(e) => setRealTimeData(e.target.checked)} />}
// // // //                   label="Switch to Real-Time Data"
// // // //                 />
// // // //               </Grid>
// // // //               <Grid item xs={6}>
// // // //                 <DateTimePicker
// // // //                   label="Start Date and Time"
// // // //                   value={startDate}
// // // //                   onChange={setStartDate}
// // // //                   renderInput={(params) => <TextField {...params} fullWidth />}
// // // //                 />
// // // //               </Grid>
// // // //               <Grid item xs={6}>
// // // //                 <DateTimePicker
// // // //                   label="End Date and Time"
// // // //                   value={endDate}
// // // //                   onChange={setEndDate}
// // // //                   renderInput={(params) => <TextField {...params} fullWidth />}
// // // //                   disabled={realTimeData}
// // // //                 />
// // // //               </Grid>
// // // //             </Grid>
// // // //           </DialogContent>
// // // //           <DialogActions>
// // // //             <Button onClick={() => setDateDialogOpen(false)} color="secondary">Cancel</Button>
// // // //             <Button
// // // //               onClick={() => {
// // // //                 setDateDialogOpen(false);
// // // //                 if (!realTimeData) fetchHistoricalData();
// // // //               }}
// // // //               color="primary"
// // // //               disabled={!startDate || (!realTimeData && !endDate)}
// // // //             >
// // // //               Apply
// // // //             </Button>
// // // //           </DialogActions>
// // // //         </Dialog>
// // // //       </Container>
// // // //     </LocalizationProvider>
// // // //   );
// // // // };

// // // // export default CustomCharts;
