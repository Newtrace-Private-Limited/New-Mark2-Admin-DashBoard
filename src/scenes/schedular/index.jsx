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
//           dataKeys: ["CW-TT-011"], // Default data key
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


import React, { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { SketchPicker } from "react-color";

const CustomCharts = () => {
  const chartsRef = useRef({}); // Store chart and series instances
  const [charts, setCharts] = useState([]); // Store chart configurations
  const [tempChartConfig, setTempChartConfig] = useState(null); // Chart being configured
  const [chartDialogOpen, setChartDialogOpen] = useState(false); // Dialog visibility
  const [selectedYAxisId, setSelectedYAxisId] = useState(null); // Selected Y-axis for configuration
  const [colorPickerOpen, setColorPickerOpen] = useState(false); // Color picker visibility
  const [wsUrl] = useState("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/"); // WebSocket URL

  // WebSocket for real-time updates
  useEffect(() => {
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const timestamp = message["PLC-TIME-STAMP"];
        if (!timestamp) return;

        const parsedTime = new Date(timestamp).getTime() / 1000;

        charts.forEach((chart) => {
          const chartInstance = chartsRef.current[chart.id];
          if (!chartInstance) return;

          chart.yAxisDataKeys.forEach((yAxis) => {
            const series = chartInstance.series[yAxis.id];
            if (series) {
              const value = message[yAxis.dataKeys[0]];
              if (value !== undefined) {
                series.update({ time: parsedTime, value });
              }
            }
          });
        });
      } catch (error) {
        console.error("WebSocket error:", error);
      }
    };

    ws.onclose = () => console.log("WebSocket closed");

    return () => ws.close();
  }, [charts, wsUrl]);

  // Add a new chart
  const addChart = () => {
    const chartId = Date.now();
    const newChart = {
      id: chartId,
      type: "Line",
      yAxisDataKeys: [
        {
          id: `yAxis-0`,
          dataKeys: ["CW-TT-011"],
          color: "#0088FE",
        },
      ],
    };
    setCharts([...charts, newChart]);
    setTimeout(() => {
      const container = document.getElementById(`chart-container-${chartId}`);
      if (container) {
        const chartInstance = createChart(container, {
          width: container.clientWidth,
          height: 300,
        });
        chartsRef.current[chartId] = {
          instance: chartInstance,
          series: {},
        };
        newChart.yAxisDataKeys.forEach((yAxis) => {
          const series = chartInstance.addLineSeries({
            color: yAxis.color,
            lineWidth: 2,
          });
          chartsRef.current[chartId].series[yAxis.id] = series;
        });
      }
    }, 0);

    setChartDialogOpen(false);
  };
  // Add a Y-axis to a chart
  const addYAxis = () => {
    if (!tempChartConfig) return;

    const updatedYAxis = {
      id: `yAxis-${tempChartConfig.yAxisDataKeys.length}`,
      dataKeys: ["AX-LT-011"],
      color: "#00C49F",
    };

    const updatedConfig = {
      ...tempChartConfig,
      yAxisDataKeys: [...tempChartConfig.yAxisDataKeys, updatedYAxis],
    };

    setTempChartConfig(updatedConfig);

    const chartInstance = chartsRef.current[tempChartConfig.id];
    if (chartInstance) {
      const series = chartInstance.instance.addLineSeries({
        color: updatedYAxis.color,
        lineWidth: 2,
      });
      chartInstance.series[updatedYAxis.id] = series;
    }
  };

  // Save chart configuration
  const saveConfig = () => {
    if (tempChartConfig) {
      const updatedCharts = charts.map((chart) =>
        chart.id === tempChartConfig.id ? tempChartConfig : chart
      );
      setCharts(updatedCharts);
      setTempChartConfig(null);
    }
  };

  return (
    <div>
      <h1>Custom Lightweight Charts</h1>

      <Box mb={2}>
        <Button variant="contained" color="primary" onClick={() => setChartDialogOpen(true)}>
          Add Custom Chart
        </Button>
      </Box>

      {/* Render all charts */}
      {charts.map((chart) => (
        <Box key={chart.id} mb={4}>
          <Typography variant="h6">Chart {chart.id}</Typography>
          <div id={`chart-container-${chart.id}`} style={{ width: "100%", height: 300 }}></div>
          <Box mt={1}>
            <Button onClick={() => setTempChartConfig(chart)} color="secondary">
              Configure Chart
            </Button>
          </Box>
        </Box>
      ))}

      {/* Add Chart Dialog */}
      <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
        <DialogTitle>Add Chart</DialogTitle>
        <DialogContent>
          <Button onClick={addChart} variant="contained">
            Add Line Chart
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChartDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Configure Chart Dialog */}
      {tempChartConfig && (
        <Dialog open={Boolean(tempChartConfig)} onClose={() => setTempChartConfig(null)}>
          <DialogTitle>Configure Chart</DialogTitle>
          <DialogContent>
            {tempChartConfig.yAxisDataKeys.map((yAxis) => (
              <Box key={yAxis.id} mb={2}>
                <FormControl fullWidth>
                  <InputLabel>Data Key</InputLabel>
                  <Select
                    value={yAxis.dataKeys[0]}
                    onChange={(e) =>
                      setTempChartConfig((prev) => ({
                        ...prev,
                        yAxisDataKeys: prev.yAxisDataKeys.map((item) =>
                          item.id === yAxis.id
                            ? { ...item, dataKeys: [e.target.value] }
                            : item
                        ),
                      }))
                    }
                  >
                    <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
                    <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
                    <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
                  </Select>
                </FormControl>
                <Button onClick={() => setSelectedYAxisId(yAxis.id)}>Pick Color</Button>
                {colorPickerOpen && selectedYAxisId === yAxis.id && (
                  <SketchPicker
                    color={yAxis.color}
                    onChangeComplete={(color) =>
                      setTempChartConfig((prev) => ({
                        ...prev,
                        yAxisDataKeys: prev.yAxisDataKeys.map((item) =>
                          item.id === yAxis.id ? { ...item, color: color.hex } : item
                        ),
                      }))
                    }
                  />
                )}
              </Box>
            ))}
            <Button onClick={addYAxis} variant="contained">
              Add Y-Axis
            </Button>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTempChartConfig(null)}>Cancel</Button>
            <Button onClick={saveConfig}>Save</Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default CustomCharts;



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
//     const tooltip = document.createElement("div");
//     tooltip.style = `
//       width: auto; height: auto; position: absolute; display: none; padding: 8px;
//       box-sizing: border-box; font-size: 12px; text-align: left; z-index: 1000;
//       background: white; color: black; border: 1px solid #0088FE; border-radius: 4px;
//     `;
//     container.appendChild(tooltip);
//     tooltipsRef.current[chartId] = tooltip;
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
//       dataKeys: ["AX-LT-011"], // Example data key
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
//   const tooltipRef = useRef({});
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
//         const tooltip = document.createElement("div");
//         tooltip.style = `
//           width: auto; height: auto; position: absolute; display: none; padding: 8px;
//           box-sizing: border-box; font-size: 12px; text-align: left; z-index: 1000;
//           background: white; color: black; border: 1px solid #0088FE; border-radius: 4px;
//         `;
//         container.appendChild(tooltip);
//         tooltipRef.current[chartId] = tooltip;

//         // Add initial series
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

//         // Handle tooltips
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

//   // Add a new Y-axis to the chart
//   const addYAxis = () => {
//     if (!tempChartConfig) return;

//     const chartInstance = chartsRef.current[tempChartConfig.id];
//     if (!chartInstance) return;

//     const priceScaleId = `priceScale-${tempChartConfig.yAxisDataKeys.length}`;
//     const updatedYAxis = {
//       id: `yAxis-${tempChartConfig.yAxisDataKeys.length}`,
//       dataKeys: ["AX-LT-011"], // Example data key
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

//   // Save configuration
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



// import React, { useEffect, useRef } from "react";
// import { createChart } from "lightweight-charts";

// const MultiYAxisChart = () => {
//   const chartContainerRef = useRef();
//   const chartRef = useRef();

//   useEffect(() => {
//     // Create the chart
//     const chart = createChart(chartContainerRef.current, {
//       width: 800,
//       height: 400,
//       layout: {
//         backgroundColor: "#FFFFFF",
//         textColor: "#000",
//       },
//       grid: {
//         vertLines: {
//           color: "#e1e1e1",
//         },
//         horzLines: {
//           color: "#e1e1e1",
//         },
//       },
//     });

//     chartRef.current = chart;

//     // First series with its own price scale (left axis)
//     const firstSeries = chart.addLineSeries({
//       color: "#FF00FF",
//       priceScaleId: "left-scale",
//     });

//     chart.applyOptions({
//       leftPriceScale: {
//         visible: true,
//         position: "left",
//         borderVisible: true,
//         scaleMargins: {
//           top: 0.1,
//           bottom: 0.2,
//         },
//       },
//     });

//     firstSeries.setData([
//       { time: "2022-01-01", value: 100 },
//       { time: "2022-01-02", value: 200 },
//       { time: "2022-01-03", value: 300 },
//     ]);

//     // Second series with its own price scale (right axis)
//     const secondSeries = chart.addLineSeries({
//       color: "#00FFFF",
//       priceScaleId: "right-scale",
//     });

//     chart.applyOptions({
//       rightPriceScale: {
//         visible: true,
//         position: "right",
//         borderVisible: true,
//         borderColor: "#e1e1e1", // Ensure borders are visible to separate scales
//         scaleMargins: {
//           top: 0.1,
//           bottom: 0.2,
//         },
//       },
//     });

//     secondSeries.setData([
//       { time: "2022-01-01", value: 50 },
//       { time: "2022-01-02", value: 75 },
//       { time: "2022-01-03", value: 150 },
//     ]);

//     // Third series with a custom price scale (spaced on the left)
//     const thirdSeries = chart.addLineSeries({
//       color: "#FF9900",
//       priceScaleId: "custom-scale",
//     });

//     chart.applyOptions({
//       priceScale: {
//         "custom-scale": {
//           position: "left",
//           visible: true,
//           borderVisible: true,
//           borderColor: "#e1e1e1",
//           scaleMargins: {
//             top: 0.1,
//             bottom: 0.2,
//           },
//         },
//       },
//     });

//     thirdSeries.setData([
//       { time: "2022-01-01", value: 10 },
//       { time: "2022-01-02", value: 20 },
//       { time: "2022-01-03", value: 30 },
//     ]);

//     // Adjust label alignment to avoid overlapping
//     chart.applyOptions({
//       layout: {
//         alignLabels: false, // Prevent overlapping labels
//       },
//     });

//     return () => {
//       chart.remove();
//     };
//   }, []);

//   return <div ref={chartContainerRef} />;
// };

// export default MultiYAxisChart;




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
//   IconButton,
// } from "@mui/material";
// import { SketchPicker } from "react-color";
// import DeleteIcon from "@mui/icons-material/Delete";

// const App = () => {
//   const chartContainerRef = useRef(null);
//   const [chart, setChart] = useState(null); // Lightweight chart instance
//   const [lineSeries, setLineSeries] = useState([]); // All line series on the chart
//   const [chartConfig, setChartConfig] = useState([]); // Chart configurations
//   const [wsUrl] = useState("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/"); // Replace with your WebSocket URL
//   const [tempConfig, setTempConfig] = useState(null); // Temporary chart being edited
//   const [chartDialogOpen, setChartDialogOpen] = useState(false); // Dialog to add a chart
//   const [colorPickerOpen, setColorPickerOpen] = useState(false); // Color picker visibility
//   const [selectedYAxisId, setSelectedYAxisId] = useState(null); // Current Y-axis ID for color picking

//   // WebSocket data handling
//   useEffect(() => {
//     const ws = new WebSocket(wsUrl);

//     ws.onmessage = (event) => {
//       try {
//         const message = JSON.parse(event.data);
//         const timestamp = message["PLC-TIME-STAMP"];
//         if (!timestamp) return;

//         const parsedTime = new Date(timestamp).getTime() / 1000; // Convert to seconds

//         // Update each chart with the new data
//         const updatedConfigs = chartConfig.map((config) => {
//           const newPoints = config.yAxisDataKeys
//             .flatMap((yAxis) =>
//               yAxis.dataKeys.map((key) => ({
//                 time: parsedTime,
//                 value: message[key] || 0,
//                 key,
//               }))
//             )
//             .filter((point) => point.value !== undefined);

//           // Limit data to 500 points
//           return {
//             ...config,
//             data: [...(config.data || []), ...newPoints].slice(-500),
//           };
//         });

//         setChartConfig(updatedConfigs);
//       } catch (error) {
//         console.error("Error parsing WebSocket message:", error);
//       }
//     };

//     ws.onclose = () => console.log("WebSocket connection closed");

//     return () => ws.close();
//   }, [chartConfig, wsUrl]);

//   // Initialize lightweight-charts
//   useEffect(() => {
//     if (!chart && chartContainerRef.current) {
//       const newChart = createChart(chartContainerRef.current, {
//         width: chartContainerRef.current.clientWidth,
//         height: 400,
//       });
//       setChart(newChart);
//     }
//   }, [chart]);

//   // Update lightweight-charts series whenever chartConfig changes
//   useEffect(() => {
//     if (chart) {
//       // Remove all existing series
//       lineSeries.forEach((series) => chart.removeSeries(series));

//       // Add new series based on the current config
//       const newSeries = chartConfig.flatMap((config) =>
//         config.yAxisDataKeys.map((yAxis) =>
//           yAxis.dataKeys.map((key) => {
//             const series = chart.addLineSeries({
//               color: yAxis.color,
//               lineWidth: 2,
//               lineStyle: yAxis.lineStyle === "solid" ? 0 : 1,
//             });

//             const seriesData = config.data.filter((d) => d.key === key);
//             series.setData(seriesData);

//             return series;
//           })
//         )
//       );

//       setLineSeries(newSeries.flat());
//     }
//   }, [chartConfig, chart]);

//   // Add a new chart
//   const addChart = () => {
//     const newConfig = {
//       id: Date.now(),
//       yAxisDataKeys: [
//         {
//           id: "yAxis-0",
//           dataKeys: ["AX-LT-011"], // Default key
//           color: "#0088FE", // Default color
//           lineStyle: "solid", // Default line style
//         },
//       ],
//       data: [], // Initialize with empty data
//     };

//     setChartConfig([...chartConfig, newConfig]);
//     setChartDialogOpen(false);
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

//   return (
//     <div>
//       <h1>Real-Time Lightweight Chart with Dynamic Configuration</h1>

//       {/* Add Chart Button */}
//       <Box>
//         <Button
//           variant="contained"
//           color="primary"
//           onClick={() => setChartDialogOpen(true)}
//         >
//           Add Chart
//         </Button>
//       </Box>

//       {/* Chart Container */}
//       <div ref={chartContainerRef} style={{ width: "100%", height: "400px" }} />

//       {/* Chart Configuration */}
//       {chartConfig.map((config) => (
//         <Box key={config.id} p={2}>
//           <Typography variant="h6">Chart ID: {config.id}</Typography>
//           <Button
//             variant="outlined"
//             onClick={() => setTempConfig(config)}
//             color="secondary"
//           >
//             Configure Chart
//           </Button>
//         </Box>
//       ))}

//       {/* Add Chart Dialog */}
//       <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
//         <DialogTitle>Add New Chart</DialogTitle>
//         <DialogContent>
//           <Button onClick={addChart} variant="contained" color="primary">
//             Add Line Chart
//           </Button>
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
                  
//                     <MenuItem value="AX-LT-021">CW-TT-011</MenuItem>
//                   </Select>
//                 </FormControl>
//                 <Button
//                   onClick={() => {
//                     setSelectedYAxisId(yAxis.id);
//                     setColorPickerOpen(true);
//                   }}
//                 >
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
//               </Box>
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



// import React, { useEffect, useState, useRef } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { Line } from "react-chartjs-2";
// import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
// import zoomPlugin from "chartjs-plugin-zoom";
// import GridLayout from "react-grid-layout";
// import { debounce } from "lodash";
// import { setLayout, addChart, removeChart, updateChart } from "../../redux/layoutActions";
// import { Box, Button, Typography, IconButton } from "@mui/material";
// import DragHandleIcon from "@mui/icons-material/DragHandle";
// import DeleteIcon from "@mui/icons-material/Delete";
// import { useWebSocket } from "src/WebSocketProvider";

// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, zoomPlugin);

// const Max_data_point = 20;

// const CustomCharts = () => {
//   const dispatch = useDispatch();
//   const charts = useSelector((state) => state.layout.customCharts);
//   const layout = useSelector((state) => state.layout.customChartsLayout);

//   const [chartDialogOpen, setChartDialogOpen] = useState(false);
//   const websocketData = useWebSocket();
//   const zoomedCharts = useRef(new Set()); // Track which charts are zoomed

//   useEffect(() => {
//     const savedLayout = JSON.parse(localStorage.getItem("customChartsLayout")) || [];
//     dispatch(setLayout(savedLayout, "customCharts"));
//   }, [dispatch]);

//   const saveLayout = debounce((newLayout) => {
//     dispatch(setLayout(newLayout, "custom"));
//     localStorage.setItem("customChartsLayout", JSON.stringify(newLayout));
//   }, 500);

//   const deleteChart = (chartId) => {
//     dispatch(removeChart(chartId, "custom"));
//     saveLayout(layout.filter((l) => l.i !== chartId.toString()));
//   };

//   // WebSocket connection and data handling
//   useEffect(() => {
//     const ws = new WebSocket(
//       "wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/"
//     );
  
//     ws.onmessage = (event) => {
//       const message = JSON.parse(event.data);
  
//       const updatedCharts = charts.map((chart) => {
//         const updatedData = chart.yAxisDataKeys.reduce((acc, yAxis) => {
//           const key = yAxis.dataKeys[0];
//           if (message[key] !== undefined && message["PLC-TIME-STAMP"]) {
//             acc.push({
//               x: new Date(message["PLC-TIME-STAMP"]).toLocaleTimeString(),
//               y: message[key],
//             });
//           }
//           return acc;
//         }, [...chart.data]); // Retain existing data
  
//         // If the chart is zoomed, don't truncate data points
//         const limitedData = zoomedCharts.current.has(chart.id)
//           ? updatedData
//           : updatedData.slice(-Max_data_point);
  
//         return { ...chart, data: limitedData };
//       });
  
//       updatedCharts.forEach((chart) => dispatch(updateChart(chart, "custom")));
//     };
  
//     ws.onclose = () => console.log("WebSocket connection closed");
  
//     return () => ws.close();
//   }, [charts, dispatch]);
  

//   const renderLineChart = (chart) => {
//     const data = {
//       labels: chart.data.map((d) => d.x), // X-axis labels from timestamps
//       datasets: chart.yAxisDataKeys.map((yAxis) => ({
//         label: yAxis.dataKeys[0], // Label for each dataset
//         data: chart.data.map((d) => d.y), // Y-axis values
//         borderColor: yAxis.color,
//         backgroundColor: yAxis.color,
//         tension: 0.3,
//         pointRadius: 4, // Size of the data points
//       })),
//     };

//     const options = {
//       responsive: true,
//       plugins: {
//         legend: {
//           display: true,
//           position: "top",
//         },
//         zoom: {
//           pan: {
//             enabled: true,
//             mode: "x",
//           },
//           zoom: {
//             wheel: {
//               enabled: true,
//             },
//             pinch: {
//               enabled: true,
//             },
//             mode: "x",
//             onZoom: ({ chart: zoomedChart }) => {
//               // Mark this chart as zoomed
//               zoomedCharts.current.add(chart.id);
//             },
//           },
//           onResetZoom: () => {
//             // Remove the chart from the zoomedCharts set
//             zoomedCharts.current.delete(chart.id);
//           },
//         },
//       },
//       scales: {
//         x: {
//           type: "category",
//           title: {
//             display: true,
//             text: "Time",
//           },
//         },
//         y: {
//           title: {
//             display: true,
//             text: "Value",
//           },
//         },
//       },
//     };
    

//     return (
//       <Line
//         data={data}
//         options={{
//           ...options,
//           plugins: {
//             ...options.plugins,
//             zoom: {
//               ...options.plugins.zoom,
//               onResetZoom: () => {
//                 // Remove the chart from the zoomedCharts set
//                 zoomedCharts.current.delete(chart.id);
//               },
//             },
//           },
//         }}
//       />
//     );
//   };

//   const renderChart = (chart) => {
//     switch (chart.type) {
//       case "Line":
//         return renderLineChart(chart);
//       default:
//         return null;
//     }
//   };

//   return (
//     <>
//       <Button color="secondary" variant="contained" onClick={() => setChartDialogOpen(true)}>
//         Add Custom Chart
//       </Button>
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
//               border: "1px solid #ccc",
//               borderRadius: "8px",
//               overflow: "hidden",
//             }}
//           >
//             <Box display="flex" justifyContent="space-between" p={2}>
//               <IconButton className="drag-handle">
//                 <DragHandleIcon />
//               </IconButton>
//               <Typography variant="h6">{chart.type} Chart</Typography>
//               <IconButton onClick={() => deleteChart(chart.id)}>
//                 <DeleteIcon />
//               </IconButton>
//             </Box>
//             <Box sx={{ height: "calc(100% - 80px)" }}>{renderChart(chart)}</Box>
//           </Box>
//         ))}
//       </GridLayout>
//     </>
//   );
// };

// export default CustomCharts;



// import React, { useEffect, useState, useRef } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { Line } from "react-chartjs-2";
// import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
// import zoomPlugin from "chartjs-plugin-zoom";
// import GridLayout from "react-grid-layout";
// import { debounce } from "lodash";
// import { setLayout, addChart, removeChart, updateChart } from "../../redux/layoutActions";
// import { Box, Button, Typography, IconButton } from "@mui/material";
// import DragHandleIcon from "@mui/icons-material/DragHandle";
// import DeleteIcon from "@mui/icons-material/Delete";
// import { useWebSocket } from "src/WebSocketProvider";

// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, zoomPlugin);

// const Max_data_point = 20;

// const CustomCharts = () => {
//   const dispatch = useDispatch();
//   const charts = useSelector((state) => state.layout.customCharts);
//   const layout = useSelector((state) => state.layout.customChartsLayout);

//   const [chartDialogOpen, setChartDialogOpen] = useState(false);
//   const websocketData = useWebSocket();
//   const zoomedCharts = useRef(new Set()); // Track which charts are zoomed

//   useEffect(() => {
//     const savedLayout = JSON.parse(localStorage.getItem("customChartsLayout")) || [];
//     dispatch(setLayout(savedLayout, "customCharts"));
//   }, [dispatch]);

//   const saveLayout = debounce((newLayout) => {
//     dispatch(setLayout(newLayout, "custom"));
//     localStorage.setItem("customChartsLayout", JSON.stringify(newLayout));
//   }, 500);

//   const deleteChart = (chartId) => {
//     dispatch(removeChart(chartId, "custom"));
//     saveLayout(layout.filter((l) => l.i !== chartId.toString()));
//   };

//   // WebSocket connection and data handling
//   useEffect(() => {
//     const ws = new WebSocket(
//       "wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/"
//     );

//     ws.onmessage = (event) => {
//       const message = JSON.parse(event.data);

//       const updatedCharts = charts.map((chart) => {
//         const updatedData = chart.yAxisDataKeys.reduce((acc, yAxis) => {
//           const key = yAxis.dataKeys[0];
//           if (message[key] !== undefined && message["PLC-TIME-STAMP"]) {
//             acc.push({
//               x: new Date(message["PLC-TIME-STAMP"]).toLocaleTimeString(),
//               y: message[key],
//             });
//           }
//           return acc;
//         }, [...chart.data]); // Retain existing data

//         // Keep only the last Max_data_point data points if the chart is not zoomed
//         const limitedData = zoomedCharts.current.has(chart.id) ? updatedData : updatedData.slice(-Max_data_point);

//         return { ...chart, data: limitedData };
//       });

//       updatedCharts.forEach((chart) => dispatch(updateChart(chart, "custom")));
//     };

//     ws.onclose = () => console.log("WebSocket connection closed");

//     return () => ws.close();
//   }, [charts, dispatch]);

//   const renderLineChart = (chart) => {
//     const data = {
//       labels: chart.data.map((d) => d.x), // X-axis labels from timestamps
//       datasets: chart.yAxisDataKeys.map((yAxis) => ({
//         label: yAxis.dataKeys[0], // Label for each dataset
//         data: chart.data.map((d) => d.y), // Y-axis values
//         borderColor: yAxis.color,
//         backgroundColor: yAxis.color,
//         tension: 0.3,
//         pointRadius: 4, // Size of the data points
//       })),
//     };

//     const options = {
//       responsive: true,
//       plugins: {
//         legend: {
//           display: true,
//           position: "top",
//         },
//         zoom: {
//           pan: {
//             enabled: true,
//             mode: "x",
//           },
//           zoom: {
//             wheel: {
//               enabled: true,
//             },
//             pinch: {
//               enabled: true,
//             },
//             mode: "x",
//             onZoom: ({ chart: zoomedChart }) => {
//               // Mark this chart as zoomed
//               zoomedCharts.current.add(chart.id);
//             },
//             onZoomComplete: () => {
//               // Optional: Log zoom actions or perform other side effects
//             },
//           },
//         },
//       },
//       scales: {
//         x: {
//           type: "category",
//           title: {
//             display: true,
//             text: "Time",
//           },
//         },
//         y: {
//           title: {
//             display: true,
//             text: "Value",
//           },
//         },
//       },
//     };

//     return (
//       <Line
//         data={data}
//         options={{
//           ...options,
//           plugins: {
//             ...options.plugins,
//             zoom: {
//               ...options.plugins.zoom,
//               onResetZoom: () => {
//                 // Remove the chart from the zoomedCharts set
//                 zoomedCharts.current.delete(chart.id);
//               },
//             },
//           },
//         }}
//       />
//     );
//   };

//   const renderChart = (chart) => {
//     switch (chart.type) {
//       case "Line":
//         return renderLineChart(chart);
//       default:
//         return null;
//     }
//   };

//   return (
//     <>
//       <Button color="secondary" variant="contained" onClick={() => setChartDialogOpen(true)}>
//         Add Custom Chart
//       </Button>
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
//               border: "1px solid #ccc",
//               borderRadius: "8px",
//               overflow: "hidden",
//             }}
//           >
//             <Box display="flex" justifyContent="space-between" p={2}>
//               <IconButton className="drag-handle">
//                 <DragHandleIcon />
//               </IconButton>
//               <Typography variant="h6">{chart.type} Chart</Typography>
//               <IconButton onClick={() => deleteChart(chart.id)}>
//                 <DeleteIcon />
//               </IconButton>
//             </Box>
//             <Box sx={{ height: "calc(100% - 80px)" }}>{renderChart(chart)}</Box>
//           </Box>
//         ))}
//       </GridLayout>
//     </>
//   );
// };

// export default CustomCharts;



// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { Line } from "react-chartjs-2";
// import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
// import zoomPlugin from "chartjs-plugin-zoom";
// import { debounce } from "lodash";
// import { setLayout, addChart, removeChart, updateChart } from "../../redux/layoutActions";
// import GridLayout from "react-grid-layout";
// import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, IconButton } from "@mui/material";
// import DragHandleIcon from "@mui/icons-material/DragHandle";
// import DeleteIcon from "@mui/icons-material/Delete";
// import { useWebSocket } from "src/WebSocketProvider";

// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, zoomPlugin);

// const Max_data_point = 20;

// const CustomCharts = () => {
//   const dispatch = useDispatch();
//   const charts = useSelector((state) => state.layout.customCharts);
//   const layout = useSelector((state) => state.layout.customChartsLayout);

//   const [chartDialogOpen, setChartDialogOpen] = useState(false);
//   const websocketData = useWebSocket();

//   useEffect(() => {
//     const savedLayout = JSON.parse(localStorage.getItem("customChartsLayout")) || [];
//     dispatch(setLayout(savedLayout, "customCharts"));
//   }, [dispatch]);

//   const saveLayout = debounce((newLayout) => {
//     dispatch(setLayout(newLayout, "custom"));
//     localStorage.setItem("customChartsLayout", JSON.stringify(newLayout));
//   }, 500);

//   const deleteChart = (chartId) => {
//     dispatch(removeChart(chartId, "custom"));
//     saveLayout(layout.filter((l) => l.i !== chartId.toString()));
//   };

//   // WebSocket connection and data handling
//   useEffect(() => {
//     const ws = new WebSocket(
//       "wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/"
//     );

//     ws.onmessage = (event) => {
//       const message = JSON.parse(event.data);

//       const updatedCharts = charts.map((chart) => {
//         if (chart.yAxisDataKeys.some((yAxis) => yAxis.dataKeys.includes("AX-LT-011"))) {
//           const newData = [...chart.data, { x: new Date().toLocaleTimeString(), y: message.value }];
//           const limitedData = newData.slice(-Max_data_point);
//           return { ...chart, data: limitedData };
//         }
//         return chart;
//       });

//       updatedCharts.forEach((chart) => dispatch(updateChart(chart, "custom")));
//     };

//     ws.onclose = () => console.log("WebSocket connection closed");

//     return () => ws.close();
//   }, [charts, dispatch]);

//   const renderLineChart = (chart) => {
//     const data = {
//       labels: chart.data.map((d) => d.x),
//       datasets: chart.yAxisDataKeys.map((yAxis) => ({
//         label: yAxis.dataKeys[0],
//         data: chart.data.map((d) => d.y),
//         borderColor: yAxis.color,
//         backgroundColor: yAxis.color,
//         tension: 0.3,
//       })),
//     };

//     const options = {
//       responsive: true,
//       plugins: {
//         legend: {
//           display: true,
//           position: "top",
//         },
//         zoom: {
//           pan: {
//             enabled: true,
//             mode: "x",
//           },
//           zoom: {
//             wheel: {
//               enabled: true,
//             },
//             pinch: {
//               enabled: true,
//             },
//             mode: "x",
//           },
//         },
//       },
//       scales: {
//         x: {
//           type: "category",
//           title: {
//             display: true,
//             text: "Time",
//           },
//         },
//         y: {
//           title: {
//             display: true,
//             text: "Value",
//           },
//         },
//       },
//     };

//     return <Line data={data} options={options} />;
//   };

//   const renderChart = (chart) => {
//     switch (chart.type) {
//       case "Line":
//         return renderLineChart(chart);
//       default:
//         return null;
//     }
//   };

//   return (
//     <>
//       <Button color="secondary" variant="contained" onClick={() => setChartDialogOpen(true)}>
//         Add Custom Chart
//       </Button>
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
//               border: "1px solid #ccc",
//               borderRadius: "8px",
//               overflow: "hidden",
//             }}
//           >
//             <Box display="flex" justifyContent="space-between" p={2}>
//               <IconButton className="drag-handle">
//                 <DragHandleIcon />
//               </IconButton>
//               <Typography variant="h6">{chart.type} Chart</Typography>
//               <IconButton onClick={() => deleteChart(chart.id)}>
//                 <DeleteIcon />
//               </IconButton>
//             </Box>
//             <Box sx={{ height: "calc(100% - 80px)" }}>{renderChart(chart)}</Box>
//           </Box>
//         ))}
//       </GridLayout>
//     </>
//   );
// };

// export default CustomCharts;



// import React, { useEffect, useRef, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   setLayout,
//   addChart,
//   removeChart,
//   updateChart,
// } from "../../redux/layoutActions";
// import GridLayout from "react-grid-layout";
// import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, IconButton } from "@mui/material";
// import DeleteIcon from "@mui/icons-material/Delete";
// import DragHandleIcon from "@mui/icons-material/DragHandle";
// import { debounce } from "lodash";
// import { createChart } from "lightweight-charts";
// import { useWebSocket } from "src/WebSocketProvider";

// const Max_data_point = 20;

// const CustomCharts = () => {
//   const dispatch = useDispatch();
//   const charts = useSelector((state) => state.layout.customCharts);
//   const layout = useSelector((state) => state.layout.customChartsLayout);
//   const [chartDialogOpen, setChartDialogOpen] = useState(false);

//   const saveLayout = debounce((newLayout) => {
//     dispatch(setLayout(newLayout, "custom"));
//     localStorage.setItem("customChartsLayout", JSON.stringify(newLayout));
//   }, 500);

//   useEffect(() => {
//     const savedLayout = JSON.parse(localStorage.getItem("customChartsLayout")) || [];
//     dispatch(setLayout(savedLayout, "customCharts"));
//   }, [dispatch]);

//   const deleteChart = (chartId) => {
//     dispatch(removeChart(chartId, "custom"));
//     saveLayout(layout.filter((l) => l.i !== chartId.toString()));
//   };

//   const addCustomChart = () => {
//     const newChartId = Date.now();
//     const newChart = {
//       id: newChartId,
//       type: "Line",
//       data: [],
//     };
//     dispatch(addChart(newChart, "custom"));
//     saveLayout([
//       ...layout,
//       { i: newChartId.toString(), x: 0, y: Infinity, w: 6, h: 8 },
//     ]);
//     setChartDialogOpen(false);
//   };

//   const renderLineChart = (chart) => {
//     const chartContainerRef = useRef();
//     const chartInstanceRef = useRef();

//     useEffect(() => {
//       if (!chartContainerRef.current) return;

//       // Create chart instance
//       const chartInstance = createChart(chartContainerRef.current, {
//         width: chartContainerRef.current.offsetWidth,
//         height: chartContainerRef.current.offsetHeight,
//         layout: {
//           backgroundColor: "#FFFFFF",
//           textColor: "#000",
//         },
//         grid: {
//           vertLines: { color: "#e1e1e1" },
//           horzLines: { color: "#e1e1e1" },
//         },
//         rightPriceScale: { visible: true },
//         timeScale: { borderColor: "#D1D4DC" },
//       });

//       // Add series
//       const lineSeries = chartInstance.addLineSeries({
//         color: "#2196F3",
//         lineWidth: 2,
//       });

//       // Initialize data
//       lineSeries.setData(chart.data);

//       // Store instance for later use
//       chartInstanceRef.current = { chartInstance, lineSeries };

//       // Handle resizing
//       const resizeObserver = new ResizeObserver(() => {
//         chartInstance.applyOptions({
//           width: chartContainerRef.current.offsetWidth,
//           height: chartContainerRef.current.offsetHeight,
//         });
//       });
//       resizeObserver.observe(chartContainerRef.current);

//       return () => {
//         resizeObserver.disconnect();
//         chartInstance.remove();
//       };
//     }, [chart]);

//     // Update data points on WebSocket message
//     useEffect(() => {
//       const ws = new WebSocket(
//         "wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/"
//       );

//       ws.onmessage = (event) => {
//         const message = JSON.parse(event.data);

//         // Check if this chart listens for a specific key (for example, "AX-LT-011")
//         if (chart.id) {
//           const newData = [...chart.data, message];
//           const limitedData = newData.slice(-Max_data_point); // Limit to max data points

//           // Update chart state in Redux
//           dispatch(
//             updateChart(
//               { ...chart, data: limitedData },
//               "custom"
//             )
//           );

//           // Update the series
//           if (chartInstanceRef.current?.lineSeries) {
//             chartInstanceRef.current.lineSeries.setData(limitedData);
//           }
//         }
//       };

//       ws.onclose = () => console.log("WebSocket connection closed");

//       return () => ws.close();
//     }, [chart, dispatch]);

//     return <div ref={chartContainerRef} style={{ width: "100%", height: "100%" }} />;
//   };

//   const renderChart = (chart) => {
//     switch (chart.type) {
//       case "Line":
//         return renderLineChart(chart);
//       default:
//         return null;
//     }
//   };

//   return (
//     <>
//       <Box display="flex" justifyContent="flex-end">
//         <Button color="secondary" variant="contained" onClick={addCustomChart}>
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
//             <Box display="flex" justifyContent="space-between" p={2}>
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
//           </Box>
//         ))}
//       </GridLayout>

//       <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
//         <DialogTitle>Select Chart Type</DialogTitle>
//         <DialogContent>
//           <Button variant="contained" onClick={addCustomChart}>
//             Add Line Chart
//           </Button>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setChartDialogOpen(false)} color="secondary">
//             Cancel
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </>
//   );
// };

// export default CustomCharts;



// import React, { useState } from 'react';
// import {
//   ResponsiveContainer,
//   LineChart,
//   Line,
//   CartesianGrid,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Legend,
// } from 'recharts';

// const ZoomableLineChart = ({ chart, websocketData }) => {
//   const [viewRange, setViewRange] = useState([0, chart.data.length - 1]); // Initially show the entire data range

//   const handleWheel = (event) => {
//     event.preventDefault();
//     const zoomStep = 5; // Number of data points to zoom in/out
//     const [start, end] = viewRange;

//     if (event.deltaY < 0) {
//       // Zoom in
//       const newStart = Math.min(start + zoomStep, end - 1); // Prevent range overlap
//       const newEnd = Math.max(end - zoomStep, start + 1);
//       setViewRange([newStart, newEnd]);
//     } else {
//       // Zoom out
//       const newStart = Math.max(start - zoomStep, 0); // Prevent underflow
//       const newEnd = Math.min(end + zoomStep, chart.data.length - 1); // Prevent overflow
//       setViewRange([newStart, newEnd]);
//     }
//   };

//   const visibleData = chart.data.slice(viewRange[0], viewRange[1] + 1);

//   return (
//     <div onWheel={handleWheel} style={{ width: '100%', height: '400px' }}>
//       <ResponsiveContainer width="100%" height="100%">
//         <LineChart data={visibleData}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis />
//           {chart.yAxisDataKeys.map((yAxis) => (
//             <YAxis
//               key={yAxis.id}
//               yAxisId={yAxis.id}
             
//               stroke={yAxis.color}
//             />
//           ))}
//           <Tooltip
//             cursor={{ strokeDasharray: '3 3' }}
//             content={({ payload }) => {
//               if (payload && payload.length) {
//                 const point = payload[0].payload;
//                 return (
//                   <div className="custom-tooltip">
//                     {chart.yAxisDataKeys.map((yAxis) => (
//                       <p key={yAxis.id}>
//                         {`Y (${yAxis.dataKeys[0]}): ${point[yAxis.dataKeys[0]]}`}
//                       </p>
//                     ))}
//                     <p>
//                       {`Timestamp: ${new Date(
//                         new Date(websocketData.timestamp).getTime() + 5.5 * 60 * 60 * 1000
//                       ).toLocaleString('en-IN', {
//                         hour12: true,
//                         weekday: 'short',
//                         year: 'numeric',
//                         month: 'short',
//                         day: 'numeric',
//                         hour: '2-digit',
//                         minute: '2-digit',
//                         second: '2-digit',
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
//             yAxis.dataKeys.map((key) => (
//               <Line
//                 key={key}
//                 dataKey={key}
//                 fill={yAxis.color}
//                 yAxisId={yAxis.id}
//                 stroke={yAxis.color}
               
//               />
//             ))
//           )}
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default ZoomableLineChart;



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

//         // Filter out negative values of CR_FT_001 and calculate the totalizer flow
//         const positiveFlows = filteredRows
//             .filter((row) => row.CR_FT_001 && row.CR_FT_001 > 0) // Only include positive values
//             .map((row) => row.CR_FT_001);

//         const totalFlow = positiveFlows.reduce((sum, value) => sum + value, 0);

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


// import React from 'react';
// import Latex from 'react-latex';

// import { useWebSocket } from 'src/WebSocketProvider';

// const App = () => {
//   const data = useWebSocket();

//   if (!data) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div>
//     <h3>
//     <Latex>What is $(3\times 4) \div (5-3)$ )</Latex>
// </h3>
//       <h1>Real-Time Data</h1>
//       <p>timestamp: {data.timestamp}</p>

//       <p>H2 Puritay: {data.Value8}</p>  
//       <p>Totalized Flow: {data.Value9}</p>
//       <p>H2OPPM: {data.H2OPPM}</p>    
//       <p>H2PurityProcessGas: {data.H2PurityProcessGas}</p>
//       <p>TotalizedFlowRawGas: {data.TotalizedFlowRawGas}</p>
//       <p>TotalizedFlowProcessGas: {data.TotalizedFlowProcessGas}</p>
//       <p>N2PercProcessGas: {data.N2PercProcessGas}</p>

//       <p>H20PerRawGas: {data.H20PerRawGas}</p>
//       <p>N2PerRawsGas: {data.N2PerRawsGas}</p>
//       <p>H2PerRawGas: {data.H2PerRawGas}</p>
//       <p>Raw gas flow rate: {data.Value17}</p>
//       <p>rate of chnages degc/h: {data["CR-TT-002-degC-per-hour"]}</p>
//       <p>Actual Current: {data["RECT-CT-001"]}</p>
//       <p>Actual Voltage: {data["RECT-VT-001"]}</p>
//       <p>Actual Power: {data["RECT-PFT-001"]}</p>

//     </div>
//   );
// };

// export default App;



// import React, { useState, useEffect, useRef } from "react";
// import {
//   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush
// } from "recharts";
// import {
//   Container, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
//   FormControl, InputLabel, Select, MenuItem, Typography, IconButton, Grid, TextField, Switch, FormControlLabel
// } from "@mui/material";
// import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import axios from 'axios';
// import { format } from 'date-fns';
// import { w3cwebsocket as W3CWebSocket } from "websocket";
// import DeleteIcon from '@mui/icons-material/Delete';
// import { SketchPicker } from 'react-color';
// import { differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';

// const CustomCharts = () => {
//   const [data, setData] = useState([]);
//   const [charts, setCharts] = useState([]);
//   const [chartDialogOpen, setChartDialogOpen] = useState(false);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [tempChartData, setTempChartData] = useState(null);
//   const [colorPickerOpen, setColorPickerOpen] = useState(false);
//   const [selectedYAxisId, setSelectedYAxisId] = useState(null);

//   const [dateDialogOpen, setDateDialogOpen] = useState(false);
//   const [startDate, setStartDate] = useState(null);
//   const [endDate, setEndDate] = useState(null);
//   const [realTimeData, setRealTimeData] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const wsClientRef = useRef(null);
//     // State for the start and end datetime, but without default values
//     const [startDateTime, setStartDateTime] = useState(null);
//     const [endDateTime, setEndDateTime] = useState(null);
  
//     const handleApply = () => {
//       if (startDateTime && endDateTime) {
//         // Format dates for display or API usage
//         const formattedStartDateTime = format(startDateTime, "yyyy-MM-dd'T'HH:mm:ss");
//         const formattedEndDateTime = format(endDateTime, "yyyy-MM-dd'T'HH:mm:ss");
//         console.log("Start:", formattedStartDateTime);
//         console.log("End:", formattedEndDateTime);
//         // Add logic to fetch data here based on the selected date range
//       }
//     };
//   // Real-time data handling
//   useEffect(() => {
//     if (realTimeData) {
//       if (wsClientRef.current) wsClientRef.current.close();

//       wsClientRef.current = new W3CWebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");

//       wsClientRef.current.onmessage = (message) => {
//         try {
//           const receivedData = JSON.parse(message.data);
//           const payload = receivedData.payload || {};
//           const newData = {
//             timestamp: receivedData.timestamp || Date.now(),
//             'AX-LT-011': payload['AX-LT-011'] || null,
//             'AX-LT-021': payload['AX-LT-021'] || null,
//             'CW-TT-011': payload['CW-TT-011'] || null,
//             'CR-LT-011': payload['CR-LT-011'] || null,
//           };

//           if (newData['AX-LT-011'] !== null || newData['AX-LT-021'] !== null || newData['CW-TT-011'] !== null) {
//             setData((prevData) => [...prevData, newData]);
//           }
//         } catch (error) {
//           console.error("Error processing WebSocket message:", error);
//         }
//       };

//       wsClientRef.current.onclose = () => {
//         console.log("WebSocket disconnected. Reconnecting...");
//         setTimeout(() => {
//           wsClientRef.current = new W3CWebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");
//         }, 1000);
//       };

//       return () => {
//         if (wsClientRef.current) wsClientRef.current.close();
//       };
//     }
//   }, [realTimeData]);



//   const fetchHistoricalData = async () => {
//     if (!startDate || !endDate) return;
//     setLoading(true);
  
//     try {
//       const historicalData = [];
//       let currentDate = startDate;
  
//       // Loop through the time range until we reach or surpass the end date
//       while (currentDate <= endDate) {
//         const formattedStartDate = format(currentDate, 'yyyy-MM-dd');
//         const formattedStartTime = format(currentDate, 'HH:mm');
  
//         // Calculate the next hour or the end date, whichever comes first
//         const nextHour = new Date(currentDate.getTime() + 60 * 60 * 1000);
//         const formattedEndDate = format(Math.min(nextHour.getTime(), endDate.getTime()), 'yyyy-MM-dd');
//         const formattedEndTime = format(Math.min(nextHour.getTime(), endDate.getTime()), 'HH:mm');
  
//         // Fetch data for the current time range
//         const response = await axios.post('https://7ko9a0hlo2.execute-api.us-east-1.amazonaws.com/dev/data', {
//           start_date: formattedStartDate,
//           start_time: formattedStartTime,
//           end_date: formattedEndDate,
//           end_time: formattedEndTime,
//           plot_all: true
//         });
  
//         // Combine the fetched data into one array
//         const hourlyData = response.data.data.map(item => ({
//           timestamp: item.timestamp,
//           'AX-LT-011': item.payload['AX-LT-011'],
//           'AX-LT-021': item.payload['AX-LT-021'],
//           'CW-TT-011': item.payload['CW-TT-011'],
//         }));
  
//         historicalData.push(...hourlyData);
  
//         // Move currentDate forward by one hour
//         currentDate = nextHour;
//       }
  
//       // Set data to plot on the graph
//       setData(historicalData);
  
//     } catch (error) {
//       console.error('Error fetching historical data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };
  
  
  
  

//   const addCustomChart = (type) => {
//     const newChart = {
//       id: Date.now(),
//       type,
//       yAxisDataKeys: [
//         { id: 'left-0', dataKeys: ['AX-LT-011'], range: '0-500', color: "#FF0000", lineStyle: 'solid' }
//       ],
//     };
//     setCharts((prevCharts) => [...prevCharts, newChart]);
//     setChartDialogOpen(false);
//   };

//   const openDialog = (chart) => {
//     setTempChartData(chart);
//     setDialogOpen(true);
//   };

//   const closeDialog = () => setDialogOpen(false);

//   const saveConfiguration = () => {
//     setCharts((prevCharts) =>
//       prevCharts.map((chart) =>
//         chart.id === tempChartData.id ? tempChartData : chart
//       )
//     );
//     setDialogOpen(false);
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

//   const handleDataKeyChange = (yAxisId, event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
//         yAxis.id === yAxisId ? { ...yAxis, dataKeys: value } : yAxis
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

//   const handleLineStyleChange = (yAxisId, event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
//         yAxis.id === yAxisId ? { ...yAxis, lineStyle: value } : yAxis
//       ),
//     }));
//   };

//   const deleteChart = (chartId) => {
//     setCharts((prevCharts) => prevCharts.filter((chart) => chart.id !== chartId));
//   };

//   const addYAxis = () => {
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: [
//         ...prevChart.yAxisDataKeys,
//         { id: `left-${prevChart.yAxisDataKeys.length}`, dataKeys: [], range: '0-500', color: '#FF0000', lineStyle: 'solid' },
//       ],
//     }));
//   };

//   const deleteYAxis = (yAxisId) => {
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.filter((yAxis) => yAxis.id !== yAxisId),
//     }));
//   };

//   const getYAxisDomain = (range) => {
//     switch (range) {
//       case "0-500": return [0, 500];
//       case "0-100": return [0, 100];
//       case "0-10": return [0, 10];
//       default: return [0, 500];
//     }
//   };

//   const renderChart = (chart) => {
//     const totalMinutes = differenceInMinutes(endDate, startDate);
//     const totalHours = differenceInHours(endDate, startDate);
  
//     // If total time range is 1 hour or less, display all data points
//     if (totalMinutes <= 60) {
//       // Display all data points without filtering
//       return (
//         <ResponsiveContainer width="100%" height={400}>
//           <LineChart data={data} syncId="syncChart">
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="timestamp" />
//             {chart.yAxisDataKeys.map((yAxis) => (
//               <YAxis
//                 key={yAxis.id}
//                 yAxisId={yAxis.id}
//                 domain={getYAxisDomain(yAxis.range)}
//                 stroke={yAxis.color}
//               />
//             ))}
//             <Tooltip />
//             <Legend />
//             <Brush />
//             {chart.yAxisDataKeys.map((yAxis) =>
//               yAxis.dataKeys.map((key) => (
//                 <Line
//                   key={key}
//                   type="monotone"
//                   dataKey={key}
//                   stroke={yAxis.color}
//                   strokeDasharray={
//                     yAxis.lineStyle === 'solid'
//                       ? ''
//                       : yAxis.lineStyle === 'dotted'
//                       ? '1 1'
//                       : '5 5'
//                   }
//                   yAxisId={yAxis.id}
//                 />
//               ))
//             )}
//           </LineChart>
//         </ResponsiveContainer>
//       );
//     }
  
//     // For ranges between 1 hour and 1 day, display 1 point per minute
//     const getMinute = (timestamp) => {
//       const date = new Date(timestamp);
//       return date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate() + ' ' +
//              date.getHours() + ':' + date.getMinutes();
//     };
  
//     // For ranges greater than 1 day, display 1 point per hour
//     const getHour = (timestamp) => {
//       const date = new Date(timestamp);
//       return date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate() + ' ' +
//              date.getHours();
//     };
  
//     // Determine the granularity (per minute or per hour)
//     const granularity = totalHours <= 24 ? 'minute' : 'hour';
  
//     // Filter data based on the granularity (minute or hour)
//     const filteredData = data.reduce((acc, current) => {
//       const key = granularity === 'minute' ? getMinute(current.timestamp) : getHour(current.timestamp);
//       if (!acc.some(item => (granularity === 'minute' ? getMinute(item.timestamp) === key : getHour(item.timestamp) === key))) {
//         acc.push(current);  // Add data based on granularity
//       }
//       return acc;
//     }, []);
  
//     // Render the filtered data based on the granularity
//     return (
//       <ResponsiveContainer width="100%" height={400}>
//         <LineChart data={filteredData} syncId="syncChart">
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="timestamp" />
//           {chart.yAxisDataKeys.map((yAxis) => (
//             <YAxis
//               key={yAxis.id}
//               yAxisId={yAxis.id}
//               domain={getYAxisDomain(yAxis.range)}
//               stroke={yAxis.color}
//             />
//           ))}
//           <Tooltip />
//           <Legend />
//           <Brush />
//           {chart.yAxisDataKeys.map((yAxis) =>
//             yAxis.dataKeys.map((key) => (
//               <Line
//                 key={key}
//                 type="monotone"
//                 dataKey={key}
//                 stroke={yAxis.color}
//                 strokeDasharray={
//                   yAxis.lineStyle === 'solid'
//                     ? ''
//                     : yAxis.lineStyle === 'dotted'
//                     ? '1 1'
//                     : '5 5'
//                 }
//                 yAxisId={yAxis.id}
//               />
//             ))
//           )}
//         </LineChart>
//       </ResponsiveContainer>
//     );
//   };
  
  
  

//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//     <Container>
//       <Box display="flex" justifyContent="flex-end" marginBottom={4}>
//         <Button variant="contained" color="primary" onClick={() => setChartDialogOpen(true)}>
//           Add Custom Chart
//         </Button>
//       </Box>
  
//       <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
//         <DialogTitle>Select Chart Type</DialogTitle>
//         <DialogContent>
//           <Box display="flex" flexDirection="column" gap={2}>
//             <Button variant="contained" onClick={() => addCustomChart('Line')}>Add Line Chart</Button>
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setChartDialogOpen(false)} color="secondary">Cancel</Button>
//         </DialogActions>
//       </Dialog>
  
//       {charts.map((chart) => (
//         <Box key={chart.id} marginY={4} position="relative">
//           <IconButton
//             aria-label="delete"
//             onClick={() => deleteChart(chart.id)}
//             style={{ position: "absolute", right: 0, top: 0, zIndex: 10 }}
//           >
//             <DeleteIcon />
//           </IconButton>
//           <Box border={1} padding={2}>
//             {renderChart(chart)}
//             <Box display="flex" justifyContent="space-between">
//               <Button variant="outlined" color="primary" onClick={() => openDialog(chart)}>
//                 Configure Chart
//               </Button>
//               <Button variant="outlined" color="primary" onClick={() => setDateDialogOpen(true)}>
//                 Date Range Select
//               </Button>
//             </Box>
//           </Box>
//         </Box>
//       ))}
  
//       {tempChartData && (
//         <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
//           <DialogTitle>Configure Chart</DialogTitle>
//           <DialogContent>
//             <Box display="flex" flexDirection="column" maxHeight="400px" overflow="auto">
//               {tempChartData.yAxisDataKeys.map((yAxis, index) => (
//                 <Box key={yAxis.id} display="flex" flexDirection="column" marginBottom={2}>
//                   <Box display="flex" justifyContent="space-between" alignItems="center">
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
//                       <MenuItem value="CR-LT-011">CR-LT-011</MenuItem>
                   
                      
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
//                       onChange={(event) => handleLineStyleChange(yAxis.id, event)}
//                     >
//                       <MenuItem value="solid">Solid</MenuItem>
//                       <MenuItem value="dotted">Dotted</MenuItem>
//                       <MenuItem value="dashed">Dashed</MenuItem>
//                     </Select>
//                   </FormControl>
//                   <Button onClick={() => openColorPicker(yAxis.id)}>Select Color</Button>
//                   {colorPickerOpen && selectedYAxisId === yAxis.id && (
//                     <SketchPicker color={yAxis.color} onChangeComplete={handleColorChange} />
//                   )}
//                 </Box>
//               ))}
//               <Button variant="contained" color="secondary" onClick={addYAxis}>
//                 Add Y-Axis
//               </Button>
//             </Box>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={closeDialog} color="secondary">Cancel</Button>
//             <Button onClick={saveConfiguration} color="primary">Save</Button>
//           </DialogActions>
//         </Dialog>
//       )}
  
//       <Dialog open={dateDialogOpen} onClose={() => setDateDialogOpen(false)} fullWidth maxWidth="sm">
//         <DialogTitle>Select Date Range</DialogTitle>
//         <DialogContent>
//           <Grid container spacing={2} alignItems="center">
//             <Grid item xs={12}>
//               <FormControlLabel
//                 control={<Switch checked={realTimeData} onChange={(e) => setRealTimeData(e.target.checked)} />}
//                 label="Switch to Real-Time Data"
//               />
//             </Grid>
//             <Grid item xs={6}>
//               {/* Start DateTime Picker in 24-Hour Format */}
//               <DateTimePicker
//                 label="Start Date and Time"
//                 value={startDate}
//                 onChange={setStartDate}
//                 renderInput={(params) => <TextField {...params} fullWidth />}
//                 ampm={false}  // Disable AM/PM for 24-hour format
//                 inputFormat="yyyy/MM/dd HH:mm"  // Use 24-hour format
//               />
//             </Grid>
//             <Grid item xs={6}>
//               {/* End DateTime Picker in 24-Hour Format */}
//               <DateTimePicker
//                 label="End Date and Time"
//                 value={endDate}
//                 onChange={setEndDate}
//                 renderInput={(params) => <TextField {...params} fullWidth />}
//                 disabled={realTimeData}
//                 ampm={false}  // Disable AM/PM for 24-hour format
//                 inputFormat="yyyy/MM/dd HH:mm"  // Use 24-hour format
//               />
//             </Grid>
//           </Grid>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setDateDialogOpen(false)} color="secondary">Cancel</Button>
//           <Button
//             onClick={() => {
//               setDateDialogOpen(false);
//               if (!realTimeData) fetchHistoricalData();
//             }}
//             color="primary"
//             disabled={!startDate || (!realTimeData && !endDate)}
//           >
//             Apply
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Container>
//   </LocalizationProvider>
  
//   );
// };

// export default CustomCharts;



// import React, { useState, useEffect, useRef } from "react";
// import {
//   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush
// } from "recharts";
// import {
//   Container, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
//   FormControl, InputLabel, Select, MenuItem, Typography, IconButton, Grid, TextField, Switch, FormControlLabel
// } from "@mui/material";
// import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import axios from 'axios';
// import { format } from 'date-fns';
// import { w3cwebsocket as W3CWebSocket } from "websocket";
// import DeleteIcon from '@mui/icons-material/Delete';
// import { SketchPicker } from 'react-color';
// import { differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';

// const CustomCharts = () => {
//   const [data, setData] = useState([]);
//   const [charts, setCharts] = useState([]);
//   const [chartDialogOpen, setChartDialogOpen] = useState(false);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [tempChartData, setTempChartData] = useState(null);
//   const [colorPickerOpen, setColorPickerOpen] = useState(false);
//   const [selectedYAxisId, setSelectedYAxisId] = useState(null);

//   const [dateDialogOpen, setDateDialogOpen] = useState(false);
//   const [startDate, setStartDate] = useState(null);
//   const [endDate, setEndDate] = useState(null);
//   const [realTimeData, setRealTimeData] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const wsClientRef = useRef(null);
//     // State for the start and end datetime, but without default values
//     const [startDateTime, setStartDateTime] = useState(null);
//     const [endDateTime, setEndDateTime] = useState(null);
  
//     const handleApply = () => {
//       if (startDateTime && endDateTime) {
//         // Format dates for display or API usage
//         const formattedStartDateTime = format(startDateTime, "yyyy-MM-dd'T'HH:mm:ss");
//         const formattedEndDateTime = format(endDateTime, "yyyy-MM-dd'T'HH:mm:ss");
//         console.log("Start:", formattedStartDateTime);
//         console.log("End:", formattedEndDateTime);
//         // Add logic to fetch data here based on the selected date range
//       }
//     };
//   // Real-time data handling
//   useEffect(() => {
//     if (realTimeData) {
//       if (wsClientRef.current) wsClientRef.current.close();

//       wsClientRef.current = new W3CWebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");

//       wsClientRef.current.onmessage = (message) => {
//         try {
//           const receivedData = JSON.parse(message.data);
//           const payload = receivedData.payload || {};
//           const newData = {
//             timestamp: receivedData.timestamp || Date.now(),
//             'AX-LT-011': payload['AX-LT-011'] || null,
//             'AX-LT-021': payload['AX-LT-021'] || null,
//             'CW-TT-011': payload['CW-TT-011'] || null,
//             'CR-LT-011': payload['CR-LT-011'] || null,
//           };

//           if (newData['AX-LT-011'] !== null || newData['AX-LT-021'] !== null || newData['CW-TT-011'] !== null) {
//             setData((prevData) => [...prevData, newData]);
//           }
//         } catch (error) {
//           console.error("Error processing WebSocket message:", error);
//         }
//       };

//       wsClientRef.current.onclose = () => {
//         console.log("WebSocket disconnected. Reconnecting...");
//         setTimeout(() => {
//           wsClientRef.current = new W3CWebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");
//         }, 1000);
//       };

//       return () => {
//         if (wsClientRef.current) wsClientRef.current.close();
//       };
//     }
//   }, [realTimeData]);


//   const fetchHistoricalData = async () => {
//     if (!startDate || !endDate) return;
//     setLoading(true);
  
//     try {
//       const historicalData = [];
//       let currentDate = startDate;
  
//       // Calculate the total time difference in minutes, hours, and days
//       const totalMinutes = differenceInMinutes(endDate, startDate);
//       const totalHours = differenceInHours(endDate, startDate);
//       const totalDays = differenceInDays(endDate, startDate);
  
//       // Decide the granularity based on the total time range
//       let dataInterval = 1; // Default interval in minutes
//       if (totalMinutes <= 60) {
//         // If the user selects a range of 1 hour or less, show all data points (no filtering needed)
//         dataInterval = 1; 
//       } else if (totalHours <= 24) {
//         // If the user selects 1 day, show 1 point per minute
//         dataInterval = 1; 
//       } else if (totalDays >= 1) {
//         // If the user selects more than 1 day, show 1 point per hour
//         dataInterval = 60; // 1 data point per hour
//       }
  
//       while (currentDate <= endDate) {
//         const formattedStartDate = format(currentDate, 'yyyy-MM-dd');
//         const formattedStartTime = format(currentDate, 'HH:mm');
  
//         // Calculate the next interval (by minute or hour)
//         const nextTime = new Date(currentDate.getTime() + dataInterval * 60 * 1000); // Increment by dataInterval (in minutes)
//         const formattedEndDate = format(Math.min(nextTime.getTime(), endDate.getTime()), 'yyyy-MM-dd');
//         const formattedEndTime = format(Math.min(nextTime.getTime(), endDate.getTime()), 'HH:mm');
  
//         const response = await axios.post('https://7ko9a0hlo2.execute-api.us-east-1.amazonaws.com/dev/data', {
//           start_date: formattedStartDate,
//           start_time: formattedStartTime,
//           end_date: formattedEndDate,
//           end_time: formattedEndTime,
//           plot_all: true
//         });
  
//         // Combine the fetched data into one array
//         const hourlyData = response.data.data.map(item => ({
//           timestamp: item.timestamp,
//           'AX-LT-011': item.payload['AX-LT-011'],
//           'AX-LT-021': item.payload['AX-LT-021'],
//           'CW-TT-011': item.payload['CW-TT-011'],
//           'CR-LT-011': item.payload['CR-LT-011'],
//         }));
  
//         historicalData.push(...hourlyData);
  
//         // Move currentDate forward by dataInterval minutes
//         currentDate = nextTime;
//       }
  
//       setData(historicalData);
  
//     } catch (error) {
//       console.error('Error fetching historical data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };
  
  
  

//   const addCustomChart = (type) => {
//     const newChart = {
//       id: Date.now(),
//       type,
//       yAxisDataKeys: [
//         { id: 'left-0', dataKeys: ['AX-LT-011'], range: '0-500', color: "#FF0000", lineStyle: 'solid' }
//       ],
//     };
//     setCharts((prevCharts) => [...prevCharts, newChart]);
//     setChartDialogOpen(false);
//   };

//   const openDialog = (chart) => {
//     setTempChartData(chart);
//     setDialogOpen(true);
//   };

//   const closeDialog = () => setDialogOpen(false);

//   const saveConfiguration = () => {
//     setCharts((prevCharts) =>
//       prevCharts.map((chart) =>
//         chart.id === tempChartData.id ? tempChartData : chart
//       )
//     );
//     setDialogOpen(false);
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

//   const handleDataKeyChange = (yAxisId, event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
//         yAxis.id === yAxisId ? { ...yAxis, dataKeys: value } : yAxis
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

//   const handleLineStyleChange = (yAxisId, event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
//         yAxis.id === yAxisId ? { ...yAxis, lineStyle: value } : yAxis
//       ),
//     }));
//   };

//   const deleteChart = (chartId) => {
//     setCharts((prevCharts) => prevCharts.filter((chart) => chart.id !== chartId));
//   };

//   const addYAxis = () => {
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: [
//         ...prevChart.yAxisDataKeys,
//         { id: `left-${prevChart.yAxisDataKeys.length}`, dataKeys: [], range: '0-500', color: '#FF0000', lineStyle: 'solid' },
//       ],
//     }));
//   };

//   const deleteYAxis = (yAxisId) => {
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.filter((yAxis) => yAxis.id !== yAxisId),
//     }));
//   };

//   const getYAxisDomain = (range) => {
//     switch (range) {
//       case "0-500": return [0, 500];
//       case "0-100": return [0, 100];
//       case "0-10": return [0, 10];
//       default: return [0, 500];
//     }
//   };
//   const renderChart = (chart) => {
//     const totalMinutes = differenceInMinutes(endDate, startDate);
//     const totalHours = differenceInHours(endDate, startDate);
  
//     // If total time range is 1 hour or less, display all data points
//     if (totalMinutes <= 60) {
//       // Display all data points without filtering 
//       return (
//         <ResponsiveContainer width="100%" height={400}>
//           <LineChart data={data} syncId="syncChart">
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="timestamp" />
//             {chart.yAxisDataKeys.map((yAxis) => (
//               <YAxis
//                 key={yAxis.id}
//                 yAxisId={yAxis.id}
//                 domain={getYAxisDomain(yAxis.range)}
//                 stroke={yAxis.color}
//               />
//             ))}
//             <Tooltip />
//             <Legend />
//             <Brush />
//             {chart.yAxisDataKeys.map((yAxis) =>
//               yAxis.dataKeys.map((key) => (
//                 <Line
//                   key={key}
//                   type="monotone"
//                   dataKey={key}
//                   stroke={yAxis.color}
//                   strokeDasharray={
//                     yAxis.lineStyle === 'solid'
//                       ? ''
//                       : yAxis.lineStyle === 'dotted'
//                       ? '1 1'
//                       : '5 5'
//                   }
//                   yAxisId={yAxis.id}
//                 />
//               ))
//             )}
//           </LineChart>
//         </ResponsiveContainer>
//       );
//     }
  
//     // For ranges between 1 hour and 1 day, display 1 point per minute
//     const getMinute = (timestamp) => {
//       const date = new Date(timestamp);
//       return date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate() + ' ' +
//              date.getHours() + ':' + date.getMinutes();
//     };
  
//     // For ranges greater than 1 day, display 1 point per hour
//     const getHour = (timestamp) => {
//       const date = new Date(timestamp);
//       return date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate() + ' ' +
//              date.getHours();
//     };
  
//     // Determine the granularity (per minute or per hour)
//     const granularity = totalHours <= 24 ? 'minute' : 'hour';
  
//     // Filter data based on the granularity (minute or hour)
//     const filteredData = data.reduce((acc, current) => {
//       const key = granularity === 'minute' ? getMinute(current.timestamp) : getHour(current.timestamp);
//       if (!acc.some(item => (granularity === 'minute' ? getMinute(item.timestamp) === key : getHour(item.timestamp) === key))) {
//         acc.push(current);  // Add data based on granularity
//       }
//       return acc;
//     }, []);
  
//     // Render the filtered data based on the granularity
//     return (
//       <ResponsiveContainer width="100%" height={400}>
//         <LineChart data={filteredData} syncId="syncChart">
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="timestamp" />
//           {chart.yAxisDataKeys.map((yAxis) => (
//             <YAxis
//               key={yAxis.id}
//               yAxisId={yAxis.id}
//               domain={getYAxisDomain(yAxis.range)}
//               stroke={yAxis.color}
//             />
//           ))}
//           <Tooltip />
//           <Legend />
//           <Brush />
//           {chart.yAxisDataKeys.map((yAxis) =>
//             yAxis.dataKeys.map((key) => (
//               <Line
//                 key={key}
//                 type="monotone"
//                 dataKey={key}
//                 stroke={yAxis.color}
//                 strokeDasharray={
//                   yAxis.lineStyle === 'solid'
//                     ? ''
//                     : yAxis.lineStyle === 'dotted'
//                     ? '1 1'
//                     : '5 5'
//                 }
//                 yAxisId={yAxis.id}
//               />
//             ))
//           )}
//         </LineChart>
//       </ResponsiveContainer>
//     );
//   };
  
  

//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//     <Container>
//       <Box display="flex" justifyContent="flex-end" marginBottom={4}>
//         <Button variant="contained" color="primary" onClick={() => setChartDialogOpen(true)}>
//           Add Custom Chart
//         </Button>
//       </Box>
  
//       <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
//         <DialogTitle>Select Chart Type</DialogTitle>
//         <DialogContent>
//           <Box display="flex" flexDirection="column" gap={2}>
//             <Button variant="contained" onClick={() => addCustomChart('Line')}>Add Line Chart</Button>
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setChartDialogOpen(false)} color="secondary">Cancel</Button>
//         </DialogActions>
//       </Dialog>
  
//       {charts.map((chart) => (
//         <Box key={chart.id} marginY={4} position="relative">
//           <IconButton
//             aria-label="delete"
//             onClick={() => deleteChart(chart.id)}
//             style={{ position: "absolute", right: 0, top: 0, zIndex: 10 }}
//           >
//             <DeleteIcon />
//           </IconButton>
//           <Box border={1} padding={2}>
//             {renderChart(chart)}
//             <Box display="flex" justifyContent="space-between">
//               <Button variant="outlined" color="primary" onClick={() => openDialog(chart)}>
//                 Configure Chart
//               </Button>
//               <Button variant="outlined" color="primary" onClick={() => setDateDialogOpen(true)}>
//                 Date Range Select
//               </Button>
//             </Box>
//           </Box>
//         </Box>
//       ))}
  
//       {tempChartData && (
//         <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
//           <DialogTitle>Configure Chart</DialogTitle>
//           <DialogContent>
//             <Box display="flex" flexDirection="column" maxHeight="400px" overflow="auto">
//               {tempChartData.yAxisDataKeys.map((yAxis, index) => (
//                 <Box key={yAxis.id} display="flex" flexDirection="column" marginBottom={2}>
//                   <Box display="flex" justifyContent="space-between" alignItems="center">
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
//                       <MenuItem value="CR-LT-011">CR-LT-011</MenuItem>
                   
                      
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
//                       onChange={(event) => handleLineStyleChange(yAxis.id, event)}
//                     >
//                       <MenuItem value="solid">Solid</MenuItem>
//                       <MenuItem value="dotted">Dotted</MenuItem>
//                       <MenuItem value="dashed">Dashed</MenuItem>
//                     </Select>
//                   </FormControl>
//                   <Button onClick={() => openColorPicker(yAxis.id)}>Select Color</Button>
//                   {colorPickerOpen && selectedYAxisId === yAxis.id && (
//                     <SketchPicker color={yAxis.color} onChangeComplete={handleColorChange} />
//                   )}
//                 </Box>
//               ))}
//               <Button variant="contained" color="secondary" onClick={addYAxis}>
//                 Add Y-Axis
//               </Button>
//             </Box>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={closeDialog} color="secondary">Cancel</Button>
//             <Button onClick={saveConfiguration} color="primary">Save</Button>
//           </DialogActions>
//         </Dialog>
//       )}
  
//       <Dialog open={dateDialogOpen} onClose={() => setDateDialogOpen(false)} fullWidth maxWidth="sm">
//         <DialogTitle>Select Date Range</DialogTitle>
//         <DialogContent>
//           <Grid container spacing={2} alignItems="center">
//             <Grid item xs={12}>
//               <FormControlLabel
//                 control={<Switch checked={realTimeData} onChange={(e) => setRealTimeData(e.target.checked)} />}
//                 label="Switch to Real-Time Data"
//               />
//             </Grid>
//             <Grid item xs={6}>
//               {/* Start DateTime Picker in 24-Hour Format */}
//               <DateTimePicker
//                 label="Start Date and Time"
//                 value={startDate}
//                 onChange={setStartDate}
//                 renderInput={(params) => <TextField {...params} fullWidth />}
//                 ampm={false}  // Disable AM/PM for 24-hour format
//                 inputFormat="yyyy/MM/dd HH:mm"  // Use 24-hour format
//               />
//             </Grid>
//             <Grid item xs={6}>
//               {/* End DateTime Picker in 24-Hour Format */}
//               <DateTimePicker
//                 label="End Date and Time"
//                 value={endDate}
//                 onChange={setEndDate}
//                 renderInput={(params) => <TextField {...params} fullWidth />}
//                 disabled={realTimeData}
//                 ampm={false}  // Disable AM/PM for 24-hour format
//                 inputFormat="yyyy/MM/dd HH:mm"  // Use 24-hour format
//               />
//             </Grid>
//           </Grid>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setDateDialogOpen(false)} color="secondary">Cancel</Button>
//           <Button
//             onClick={() => {
//               setDateDialogOpen(false);
//               if (!realTimeData) fetchHistoricalData();
//             }}
//             color="primary"
//             disabled={!startDate || (!realTimeData && !endDate)}
//           >
//             Apply
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Container>
//   </LocalizationProvider>
  
//   );
// };

// export default CustomCharts;




// import React, { useState, useEffect, useRef } from "react";
// import {
//   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush
// } from "recharts";
// import {
//   Container, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
//   FormControl, InputLabel, Select, MenuItem, Typography, IconButton, Grid, TextField, Switch, FormControlLabel
// } from "@mui/material";
// import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import axios from 'axios';
// import { format } from 'date-fns';
// import { w3cwebsocket as W3CWebSocket } from "websocket";
// import DeleteIcon from '@mui/icons-material/Delete';
// import { SketchPicker } from 'react-color';

// const CustomCharts = () => {
//   const [data, setData] = useState([]);
//   const [charts, setCharts] = useState([]);
//   const [chartDialogOpen, setChartDialogOpen] = useState(false);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [tempChartData, setTempChartData] = useState(null);
//   const [colorPickerOpen, setColorPickerOpen] = useState(false);
//   const [selectedYAxisId, setSelectedYAxisId] = useState(null);

//   const [dateDialogOpen, setDateDialogOpen] = useState(false);
//   const [startDate, setStartDate] = useState(null);
//   const [endDate, setEndDate] = useState(null);
//   const [realTimeData, setRealTimeData] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const wsClientRef = useRef(null);
//     // State for the start and end datetime, but without default values
//     const [startDateTime, setStartDateTime] = useState(null);
//     const [endDateTime, setEndDateTime] = useState(null);
  
//     const handleApply = () => {
//       if (startDateTime && endDateTime) {
//         // Format dates for display or API usage
//         const formattedStartDateTime = format(startDateTime, "yyyy-MM-dd'T'HH:mm:ss");
//         const formattedEndDateTime = format(endDateTime, "yyyy-MM-dd'T'HH:mm:ss");
//         console.log("Start:", formattedStartDateTime);
//         console.log("End:", formattedEndDateTime);
//         // Add logic to fetch data here based on the selected date range
//       }
//     };
//   // Real-time data handling
//   useEffect(() => {
//     if (realTimeData) {
//       if (wsClientRef.current) wsClientRef.current.close();

//       wsClientRef.current = new W3CWebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");

//       wsClientRef.current.onmessage = (message) => {
//         try {
//           const receivedData = JSON.parse(message.data);
//           const payload = receivedData.payload || {};
//           const newData = {
//             timestamp: receivedData.timestamp || Date.now(),
//             'AX-LT-011': payload['AX-LT-011'] || null,
//             'AX-LT-021': payload['AX-LT-021'] || null,
//             'CW-TT-011': payload['CW-TT-011'] || null,
//           };

//           if (newData['AX-LT-011'] !== null || newData['AX-LT-021'] !== null || newData['CW-TT-011'] !== null) {
//             setData((prevData) => [...prevData, newData]);
//           }
//         } catch (error) {
//           console.error("Error processing WebSocket message:", error);
//         }
//       };

//       wsClientRef.current.onclose = () => {
//         console.log("WebSocket disconnected. Reconnecting...");
//         setTimeout(() => {
//           wsClientRef.current = new W3CWebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");
//         }, 1000);
//       };

//       return () => {
//         if (wsClientRef.current) wsClientRef.current.close();
//       };
//     }
//   }, [realTimeData]);

//   const fetchHistoricalData = async () => {
//     if (!startDate || !endDate) return;
//     setLoading(true);
  
//     try {
//       const historicalData = [];
//       let currentDate = startDate;
  
//       // Loop through the time range until we reach or surpass the end date
//       while (currentDate <= endDate) {
//         const formattedStartDate = format(currentDate, 'yyyy-MM-dd');
//         const formattedStartTime = format(currentDate, 'HH:mm');
  
//         // Calculate the next hour or the end date, whichever comes first
//         const nextHour = new Date(currentDate.getTime() + 60 * 60 * 1000);
//         const formattedEndDate = format(Math.min(nextHour.getTime(), endDate.getTime()), 'yyyy-MM-dd');
//         const formattedEndTime = format(Math.min(nextHour.getTime(), endDate.getTime()), 'HH:mm');
  
//         // Fetch data for the current time range
//         const response = await axios.post('https://7ko9a0hlo2.execute-api.us-east-1.amazonaws.com/dev/data', {
//           start_date: formattedStartDate,
//           start_time: formattedStartTime,
//           end_date: formattedEndDate,
//           end_time: formattedEndTime,
//           plot_all: true
//         });
  
//         // Combine the fetched data into one array
//         const hourlyData = response.data.data.map(item => ({
//           timestamp: item.timestamp,
//           'AX-LT-011': item.payload['AX-LT-011'],
//           'AX-LT-021': item.payload['AX-LT-021'],
//           'CW-TT-011': item.payload['CW-TT-011'],
//         }));
  
//         historicalData.push(...hourlyData);
  
//         // Move currentDate forward by one hour
//         currentDate = nextHour;
//       }
  
//       // Set data to plot on the graph
//       setData(historicalData);
  
//     } catch (error) {
//       console.error('Error fetching historical data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };
  

//   const addCustomChart = (type) => {
//     const newChart = {
//       id: Date.now(),
//       type,
//       yAxisDataKeys: [
//         { id: 'left-0', dataKeys: ['AX-LT-011'], range: '0-500', color: "#FF0000", lineStyle: 'solid' }
//       ],
//     };
//     setCharts((prevCharts) => [...prevCharts, newChart]);
//     setChartDialogOpen(false);
//   };

//   const openDialog = (chart) => {
//     setTempChartData(chart);
//     setDialogOpen(true);
//   };

//   const closeDialog = () => setDialogOpen(false);

//   const saveConfiguration = () => {
//     setCharts((prevCharts) =>
//       prevCharts.map((chart) =>
//         chart.id === tempChartData.id ? tempChartData : chart
//       )
//     );
//     setDialogOpen(false);
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

//   const handleDataKeyChange = (yAxisId, event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
//         yAxis.id === yAxisId ? { ...yAxis, dataKeys: value } : yAxis
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

//   const handleLineStyleChange = (yAxisId, event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
//         yAxis.id === yAxisId ? { ...yAxis, lineStyle: value } : yAxis
//       ),
//     }));
//   };

//   const deleteChart = (chartId) => {
//     setCharts((prevCharts) => prevCharts.filter((chart) => chart.id !== chartId));
//   };

//   const addYAxis = () => {
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: [
//         ...prevChart.yAxisDataKeys,
//         { id: `left-${prevChart.yAxisDataKeys.length}`, dataKeys: [], range: '0-500', color: '#FF0000', lineStyle: 'solid' },
//       ],
//     }));
//   };

//   const deleteYAxis = (yAxisId) => {
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.filter((yAxis) => yAxis.id !== yAxisId),
//     }));
//   };

//   const getYAxisDomain = (range) => {
//     switch (range) {
//       case "0-500": return [0, 500];
//       case "0-100": return [0, 100];
//       case "0-10": return [0, 10];
//       default: return [0, 500];
//     }
//   };

//   const renderChart = (chart) => {
//     // Convert timestamp to Date and get the minute
//     const getMinute = (timestamp) => {
//       const date = new Date(timestamp);
//       return date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate() + ' ' +
//              date.getHours() + ':' + date.getMinutes();
//     };
  
//     // Filter data to include only the first data point of each minute
//     const filteredData = data.reduce((acc, current) => {
//       const minute = getMinute(current.timestamp);
//       if (!acc.some(item => getMinute(item.timestamp) === minute)) {
//         acc.push(current);  // If minute is not yet added, add the current data point
//       }
//       return acc;
//     }, []);
  
//     return (
//       <ResponsiveContainer width="100%" height={400}>
//         <LineChart data={filteredData} syncId="syncChart">
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="timestamp" />
//           {chart.yAxisDataKeys.map((yAxis) => (
//             <YAxis
//               key={yAxis.id}
//               yAxisId={yAxis.id}
//               domain={getYAxisDomain(yAxis.range)}
//               stroke={yAxis.color}
//             />
//           ))}
//           <Tooltip />
//           <Legend />
//           <Brush />
//           {chart.yAxisDataKeys.map((yAxis) =>
//             yAxis.dataKeys.map((key) => (
//               <Line
//                 key={key}
//                 type="monotone"
//                 dataKey={key}
//                 stroke={yAxis.color}
//                 strokeDasharray={
//                   yAxis.lineStyle === 'solid'
//                     ? ''
//                     : yAxis.lineStyle === 'dotted'
//                     ? '1 1'
//                     : '5 5'
//                 }
//                 yAxisId={yAxis.id}
//               />
//             ))
//           )}
//         </LineChart>
//       </ResponsiveContainer>
//     );
//   };
  
  
  

//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//     <Container>
//       <Box display="flex" justifyContent="flex-end" marginBottom={4}>
//         <Button variant="contained" color="primary" onClick={() => setChartDialogOpen(true)}>
//           Add Custom Chart
//         </Button>
//       </Box>
  
//       <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
//         <DialogTitle>Select Chart Type</DialogTitle>
//         <DialogContent>
//           <Box display="flex" flexDirection="column" gap={2}>
//             <Button variant="contained" onClick={() => addCustomChart('Line')}>Add Line Chart</Button>
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setChartDialogOpen(false)} color="secondary">Cancel</Button>
//         </DialogActions>
//       </Dialog>
  
//       {charts.map((chart) => (
//         <Box key={chart.id} marginY={4} position="relative">
//           <IconButton
//             aria-label="delete"
//             onClick={() => deleteChart(chart.id)}
//             style={{ position: "absolute", right: 0, top: 0, zIndex: 10 }}
//           >
//             <DeleteIcon />
//           </IconButton>
//           <Box border={1} padding={2}>
//             {renderChart(chart)}
//             <Box display="flex" justifyContent="space-between">
//               <Button variant="outlined" color="primary" onClick={() => openDialog(chart)}>
//                 Configure Chart
//               </Button>
//               <Button variant="outlined" color="primary" onClick={() => setDateDialogOpen(true)}>
//                 Date Range Select
//               </Button>
//             </Box>
//           </Box>
//         </Box>
//       ))}
  
//       {tempChartData && (
//         <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
//           <DialogTitle>Configure Chart</DialogTitle>
//           <DialogContent>
//             <Box display="flex" flexDirection="column" maxHeight="400px" overflow="auto">
//               {tempChartData.yAxisDataKeys.map((yAxis, index) => (
//                 <Box key={yAxis.id} display="flex" flexDirection="column" marginBottom={2}>
//                   <Box display="flex" justifyContent="space-between" alignItems="center">
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
//                       onChange={(event) => handleLineStyleChange(yAxis.id, event)}
//                     >
//                       <MenuItem value="solid">Solid</MenuItem>
//                       <MenuItem value="dotted">Dotted</MenuItem>
//                       <MenuItem value="dashed">Dashed</MenuItem>
//                     </Select>
//                   </FormControl>
//                   <Button onClick={() => openColorPicker(yAxis.id)}>Select Color</Button>
//                   {colorPickerOpen && selectedYAxisId === yAxis.id && (
//                     <SketchPicker color={yAxis.color} onChangeComplete={handleColorChange} />
//                   )}
//                 </Box>
//               ))}
//               <Button variant="contained" color="secondary" onClick={addYAxis}>
//                 Add Y-Axis
//               </Button>
//             </Box>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={closeDialog} color="secondary">Cancel</Button>
//             <Button onClick={saveConfiguration} color="primary">Save</Button>
//           </DialogActions>
//         </Dialog>
//       )}
  
//       <Dialog open={dateDialogOpen} onClose={() => setDateDialogOpen(false)} fullWidth maxWidth="sm">
//         <DialogTitle>Select Date Range</DialogTitle>
//         <DialogContent>
//           <Grid container spacing={2} alignItems="center">
//             <Grid item xs={12}>
//               <FormControlLabel
//                 control={<Switch checked={realTimeData} onChange={(e) => setRealTimeData(e.target.checked)} />}
//                 label="Switch to Real-Time Data"
//               />
//             </Grid>
//             <Grid item xs={6}>
//               {/* Start DateTime Picker in 24-Hour Format */}
//               <DateTimePicker
//                 label="Start Date and Time"
//                 value={startDate}
//                 onChange={setStartDate}
//                 renderInput={(params) => <TextField {...params} fullWidth />}
//                 ampm={false}  // Disable AM/PM for 24-hour format
//                 inputFormat="yyyy/MM/dd HH:mm"  // Use 24-hour format
//               />
//             </Grid>
//             <Grid item xs={6}>
//               {/* End DateTime Picker in 24-Hour Format */}
//               <DateTimePicker
//                 label="End Date and Time"
//                 value={endDate}
//                 onChange={setEndDate}
//                 renderInput={(params) => <TextField {...params} fullWidth />}
//                 disabled={realTimeData}
//                 ampm={false}  // Disable AM/PM for 24-hour format
//                 inputFormat="yyyy/MM/dd HH:mm"  // Use 24-hour format
//               />
//             </Grid>
//           </Grid>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setDateDialogOpen(false)} color="secondary">Cancel</Button>
//           <Button
//             onClick={() => {
//               setDateDialogOpen(false);
//               if (!realTimeData) fetchHistoricalData();
//             }}
//             color="primary"
//             disabled={!startDate || (!realTimeData && !endDate)}
//           >
//             Apply
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Container>
//   </LocalizationProvider>
  
//   );
// };

// export default CustomCharts;





// import React, { useState, useEffect, useRef } from "react";
// import {
//   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush
// } from "recharts";
// import {
//   Container, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
//   FormControl, InputLabel, Select, MenuItem, Typography, IconButton, Grid, TextField, Switch, FormControlLabel
// } from "@mui/material";
// import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import axios from 'axios';
// import { format } from 'date-fns';
// import { w3cwebsocket as W3CWebSocket } from "websocket";
// import DeleteIcon from '@mui/icons-material/Delete';
// import { SketchPicker } from 'react-color';

// const CustomCharts = () => {
//   const [data, setData] = useState([]);
//   const [charts, setCharts] = useState([]);
//   const [chartDialogOpen, setChartDialogOpen] = useState(false);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [tempChartData, setTempChartData] = useState(null);
//   const [colorPickerOpen, setColorPickerOpen] = useState(false);
//   const [selectedYAxisId, setSelectedYAxisId] = useState(null);

//   const [dateDialogOpen, setDateDialogOpen] = useState(false);
//   const [startDate, setStartDate] = useState(null);
//   const [endDate, setEndDate] = useState(null);
//   const [realTimeData, setRealTimeData] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const wsClientRef = useRef(null);

//   // Real-time data handling
//   useEffect(() => {
//     if (realTimeData) {
//       if (wsClientRef.current) wsClientRef.current.close();

//       wsClientRef.current = new W3CWebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");

//       wsClientRef.current.onmessage = (message) => {
//         try {
//           const receivedData = JSON.parse(message.data);
//           const payload = receivedData.payload || {};
//           const newData = {
//             timestamp: receivedData.timestamp || Date.now(),
//             'AX-LT-011': payload['AX-LT-011'] || null,
//             'AX-LT-021': payload['AX-LT-021'] || null,
//             'CW-TT-011': payload['CW-TT-011'] || null,
//           };

//           if (newData['AX-LT-011'] !== null || newData['AX-LT-021'] !== null || newData['CW-TT-011'] !== null) {
//             setData((prevData) => [...prevData, newData]);
//           }
//         } catch (error) {
//           console.error("Error processing WebSocket message:", error);
//         }
//       };

//       wsClientRef.current.onclose = () => {
//         console.log("WebSocket disconnected. Reconnecting...");
//         setTimeout(() => {
//           wsClientRef.current = new W3CWebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");
//         }, 1000);
//       };

//       return () => {
//         if (wsClientRef.current) wsClientRef.current.close();
//       };
//     }
//   }, [realTimeData]);

//   const fetchHistoricalDataInChunks = async (startDate, endDate) => {
//     if (!startDate || !endDate) return;
  
//     const results = [];
//     let currentStartDate = startDate;
  
//     // Fetch data in chunks (e.g., 1-hour intervals)
//     const chunkSizeInHours = 1; // Adjust chunk size if necessary
//     while (currentStartDate < endDate) {
//       const nextEndDate = new Date(currentStartDate.getTime() + chunkSizeInHours * 60 * 60 * 1000);
//       const formattedStartDate = format(currentStartDate, 'yyyy-MM-dd');
//       const formattedStartTime = format(currentStartDate, 'HH:mm');
//       const formattedEndDate = format(nextEndDate, 'yyyy-MM-dd');
//       const formattedEndTime = format(nextEndDate, 'HH:mm');
  
//       try {
//         const response = await axios.post('https://7ko9a0hlo2.execute-api.us-east-1.amazonaws.com/dev/data', {
//           start_date: formattedStartDate,
//           start_time: formattedStartTime,
//           end_date: formattedEndDate,
//           end_time: formattedEndTime,
//           plot_all: true
//         });
  
//         if (response.data && response.data.data) {
//           results.push(...response.data.data); // Accumulate the data points
//           setData(results); // Dynamically update the graph as data arrives
//         }
//       } catch (error) {
//         console.error('Error fetching historical data:', error);
//         break; // Stop fetching if there's an error
//       }
  
//       currentStartDate = nextEndDate; // Move to the next chunk
//     }
  
//     setLoading(false); // Indicate loading is done
//   };
  

//   const addCustomChart = (type) => {
//     const newChart = {
//       id: Date.now(),
//       type,
//       yAxisDataKeys: [
//         { id: 'left-0', dataKeys: ['AX-LT-011'], range: '0-500', color: "#FF0000", lineStyle: 'solid' }
//       ],
//     };
//     setCharts((prevCharts) => [...prevCharts, newChart]);
//     setChartDialogOpen(false);
//   };

//   const openDialog = (chart) => {
//     setTempChartData(chart);
//     setDialogOpen(true);
//   };

//   const closeDialog = () => setDialogOpen(false);

//   const saveConfiguration = () => {
//     setCharts((prevCharts) =>
//       prevCharts.map((chart) =>
//         chart.id === tempChartData.id ? tempChartData : chart
//       )
//     );
//     setDialogOpen(false);
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

//   const handleDataKeyChange = (yAxisId, event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
//         yAxis.id === yAxisId ? { ...yAxis, dataKeys: value } : yAxis
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

//   const handleLineStyleChange = (yAxisId, event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
//         yAxis.id === yAxisId ? { ...yAxis, lineStyle: value } : yAxis
//       ),
//     }));
//   };

//   const deleteChart = (chartId) => {
//     setCharts((prevCharts) => prevCharts.filter((chart) => chart.id !== chartId));
//   };

//   const addYAxis = () => {
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: [
//         ...prevChart.yAxisDataKeys,
//         { id: `left-${prevChart.yAxisDataKeys.length}`, dataKeys: [], range: '0-500', color: '#FF0000', lineStyle: 'solid' },
//       ],
//     }));
//   };

//   const deleteYAxis = (yAxisId) => {
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.filter((yAxis) => yAxis.id !== yAxisId),
//     }));
//   };

//   const getYAxisDomain = (range) => {
//     switch (range) {
//       case "0-500": return [0, 500];
//       case "0-100": return [0, 100];
//       case "0-10": return [0, 10];
//       default: return [0, 500];
//     }
//   };

//   const renderChart = (chart) => {
//     return (
//       <ResponsiveContainer width="100%" height={400}>
//         <LineChart data={data} syncId="syncChart">
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="timestamp" />
//           {chart.yAxisDataKeys.map((yAxis) => (
//             <YAxis
//               key={yAxis.id}
//               yAxisId={yAxis.id}
//               domain={getYAxisDomain(yAxis.range)}
//               stroke={yAxis.color}
//             />
//           ))}
//           <Tooltip />
//           <Legend />
//           <Brush />
//           {chart.yAxisDataKeys.map((yAxis) =>
//             yAxis.dataKeys.map((key) => (
//               <Line
//                 key={key}
//                 type="monotone"
//                 dataKey={key}
//                 stroke={yAxis.color}
//                 strokeDasharray={
//                   yAxis.lineStyle === 'solid'
//                     ? ''
//                     : yAxis.lineStyle === 'dotted'
//                     ? '1 1'
//                     : '5 5'
//                 }
//                 yAxisId={yAxis.id}
//               />
//             ))
//           )}
//         </LineChart>
//       </ResponsiveContainer>
//     );
//   };
  

//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       <Container>
//         <Box display="flex" justifyContent="flex-end" marginBottom={4}>
//           <Button variant="contained" color="primary" onClick={() => setChartDialogOpen(true)}>
//             Add Custom Chart
//           </Button>
//         </Box>

//         <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
//           <DialogTitle>Select Chart Type</DialogTitle>
//           <DialogContent>
//             <Box display="flex" flexDirection="column" gap={2}>
//               <Button variant="contained" onClick={() => addCustomChart('Line')}>Add Line Chart</Button>
//             </Box>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setChartDialogOpen(false)} color="secondary">Cancel</Button>
//           </DialogActions>
//         </Dialog>

//         {charts.map((chart) => (
//           <Box key={chart.id} marginY={4} position="relative">
//             <IconButton
//               aria-label="delete"
//               onClick={() => deleteChart(chart.id)}
//               style={{ position: "absolute", right: 0, top: 0, zIndex: 10 }}
//             >
//               <DeleteIcon />
//             </IconButton>
//             <Box border={1} padding={2}>
//               {renderChart(chart)}
//               <Box display="flex" justifyContent="space-between">
//                 <Button variant="outlined" color="primary" onClick={() => openDialog(chart)}>
//                   Configure Chart
//                 </Button>
//                 <Button variant="outlined" color="primary" onClick={() => setDateDialogOpen(true)}>
//                   Date Range Select
//                 </Button>
//               </Box>
//             </Box>
//           </Box>
//         ))}

//         {tempChartData && (
//           <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
//             <DialogTitle>Configure Chart</DialogTitle>
//             <DialogContent>
//               <Box display="flex" flexDirection="column" maxHeight="400px" overflow="auto">
//                 {tempChartData.yAxisDataKeys.map((yAxis, index) => (
//                   <Box key={yAxis.id} display="flex" flexDirection="column" marginBottom={2}>
//                     <Box display="flex" justifyContent="space-between" alignItems="center">
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
//                         onChange={(event) => handleDataKeyChange(yAxis.id, event)}
//                       >
//                         <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//                         <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
//                         <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
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
//                         onChange={(event) => handleLineStyleChange(yAxis.id, event)}
//                       >
//                         <MenuItem value="solid">Solid</MenuItem>
//                         <MenuItem value="dotted">Dotted</MenuItem>
//                         <MenuItem value="dashed">Dashed</MenuItem>
//                       </Select>
//                     </FormControl>
//                     <Button onClick={() => openColorPicker(yAxis.id)}>Select Color</Button>
//                     {colorPickerOpen && selectedYAxisId === yAxis.id && (
//                       <SketchPicker color={yAxis.color} onChangeComplete={handleColorChange} />
//                     )}
//                   </Box>
//                 ))}
//                 <Button variant="contained" color="secondary" onClick={addYAxis}>
//                   Add Y-Axis
//                 </Button>
//               </Box>
//             </DialogContent>
//             <DialogActions>
//               <Button onClick={closeDialog} color="secondary">Cancel</Button>
//               <Button onClick={saveConfiguration} color="primary">Save</Button>
//             </DialogActions>
//           </Dialog>
//         )}

//         <Dialog open={dateDialogOpen} onClose={() => setDateDialogOpen(false)} fullWidth maxWidth="sm">
//           <DialogTitle>Select Date Range</DialogTitle>
//           <DialogContent>
//             <Grid container spacing={2} alignItems="center">
//               <Grid item xs={12}>
//                 <FormControlLabel
//                   control={<Switch checked={realTimeData} onChange={(e) => setRealTimeData(e.target.checked)} />}
//                   label="Switch to Real-Time Data"
//                 />
//               </Grid>
//               <Grid item xs={6}>
//                 <DateTimePicker
//                   label="Start Date and Time"
//                   value={startDate}
//                   onChange={setStartDate}
//                   renderInput={(params) => <TextField {...params} fullWidth />}
//                 />
//               </Grid>
//               <Grid item xs={6}>
//                 <DateTimePicker
//                   label="End Date and Time"
//                   value={endDate}
//                   onChange={setEndDate}
//                   renderInput={(params) => <TextField {...params} fullWidth />}
//                   disabled={realTimeData}
//                 />
//               </Grid>
//             </Grid>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setDateDialogOpen(false)} color="secondary">Cancel</Button>
//             <Button
//               onClick={() => {
//                 setDateDialogOpen(false);
//                 if (!realTimeData) fetchHistoricalDataInChunks();
//               }}
//               color="primary"
//               disabled={!startDate || (!realTimeData && !endDate)}
//             >
//               Apply
//             </Button>
//           </DialogActions>
//         </Dialog>
//       </Container>
//     </LocalizationProvider>
//   );
// };

// export default CustomCharts;




// import React, { useState, useEffect, useRef } from "react";
// import {
//   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush
// } from "recharts";
// import {
//   Container, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
//   FormControl, InputLabel, Select, MenuItem, Typography, IconButton, Grid, TextField, Switch, FormControlLabel
// } from "@mui/material";
// import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import axios from 'axios';
// import { format } from 'date-fns';
// import { w3cwebsocket as W3CWebSocket } from "websocket";
// import DeleteIcon from '@mui/icons-material/Delete';
// import { SketchPicker } from 'react-color';

// const CustomCharts = () => {
//   const [data, setData] = useState([]);
//   const [charts, setCharts] = useState([]);
//   const [chartDialogOpen, setChartDialogOpen] = useState(false);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [tempChartData, setTempChartData] = useState(null);
//   const [colorPickerOpen, setColorPickerOpen] = useState(false);
//   const [selectedYAxisId, setSelectedYAxisId] = useState(null);

//   const [dateDialogOpen, setDateDialogOpen] = useState(false);
//   const [startDate, setStartDate] = useState(null);
//   const [endDate, setEndDate] = useState(null);
//   const [realTimeData, setRealTimeData] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const wsClientRef = useRef(null);

//   // Real-time data handling
//   useEffect(() => {
//     if (realTimeData) {
//       if (wsClientRef.current) wsClientRef.current.close();

//       wsClientRef.current = new W3CWebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");

//       wsClientRef.current.onmessage = (message) => {
//         try {
//           const receivedData = JSON.parse(message.data);
//           const payload = receivedData.payload || {};
//           const newData = {
//             timestamp: receivedData.timestamp || Date.now(),
//             'AX-LT-011': payload['AX-LT-011'] || null,
//             'AX-LT-021': payload['AX-LT-021'] || null,
//             'CW-TT-011': payload['CW-TT-011'] || null,
//           };

//           if (newData['AX-LT-011'] !== null || newData['AX-LT-021'] !== null || newData['CW-TT-011'] !== null) {
//             setData((prevData) => [...prevData, newData]);
//           }
//         } catch (error) {
//           console.error("Error processing WebSocket message:", error);
//         }
//       };

//       wsClientRef.current.onclose = () => {
//         console.log("WebSocket disconnected. Reconnecting...");
//         setTimeout(() => {
//           wsClientRef.current = new W3CWebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");
//         }, 1000);
//       };

//       return () => {
//         if (wsClientRef.current) wsClientRef.current.close();
//       };
//     }
//   }, [realTimeData]);

//   const fetchHistoricalData = async () => {
//     if (!startDate || !endDate) return;
//     setLoading(true);
  
//     try {
//       const historicalData = [];
//       let currentDate = startDate;
  
//       // Loop through each hour and fetch data
//       while (currentDate <= endDate) {
//         const formattedStartDate = format(currentDate, 'yyyy-MM-dd');
//         const formattedStartTime = format(currentDate, 'HH:mm');
  
//         // Set end time to 1 hour later or endDate, whichever is smaller
//         const nextHour = new Date(currentDate.getTime() + 60 * 60 * 1000); // 1 hour later
//         const formattedEndDate = format(nextHour, 'yyyy-MM-dd');
//         const formattedEndTime = format(nextHour, 'HH:mm');
  
//         const response = await axios.post('https://7ko9a0hlo2.execute-api.us-east-1.amazonaws.com/dev/data', {
//           start_date: formattedStartDate,
//           start_time: formattedStartTime,
//           end_date: formattedEndDate,
//           end_time: formattedEndTime,
//           plot_all: true
//         });
  
//         // Combine the fetched data into one array
//         const hourlyData = response.data.data.map(item => ({
//           timestamp: item.timestamp,
//           'AX-LT-011': item.payload['AX-LT-011'],
//           'AX-LT-021': item.payload['AX-LT-021'],
//           'CW-TT-011': item.payload['CW-TT-011'],
//         }));
//         historicalData.push(...hourlyData);
  
//         // Move currentDate forward by one hour
//         currentDate = nextHour;
//       }
  
//       setData(historicalData);  // Set data to plot on the graph
  
//     } catch (error) {
//       console.error('Error fetching historical data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };
  
  

//   const addCustomChart = (type) => {
//     const newChart = {
//       id: Date.now(),
//       type,
//       yAxisDataKeys: [
//         { id: 'left-0', dataKeys: ['AX-LT-011'], range: '0-500', color: "#FF0000", lineStyle: 'solid' }
//       ],
//     };
//     setCharts((prevCharts) => [...prevCharts, newChart]);
//     setChartDialogOpen(false);
//   };

//   const openDialog = (chart) => {
//     setTempChartData(chart);
//     setDialogOpen(true);
//   };

//   const closeDialog = () => setDialogOpen(false);

//   const saveConfiguration = () => {
//     setCharts((prevCharts) =>
//       prevCharts.map((chart) =>
//         chart.id === tempChartData.id ? tempChartData : chart
//       )
//     );
//     setDialogOpen(false);
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

//   const handleDataKeyChange = (yAxisId, event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
//         yAxis.id === yAxisId ? { ...yAxis, dataKeys: value } : yAxis
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

//   const handleLineStyleChange = (yAxisId, event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
//         yAxis.id === yAxisId ? { ...yAxis, lineStyle: value } : yAxis
//       ),
//     }));
//   };

//   const deleteChart = (chartId) => {
//     setCharts((prevCharts) => prevCharts.filter((chart) => chart.id !== chartId));
//   };

//   const addYAxis = () => {
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: [
//         ...prevChart.yAxisDataKeys,
//         { id: `left-${prevChart.yAxisDataKeys.length}`, dataKeys: [], range: '0-500', color: '#FF0000', lineStyle: 'solid' },
//       ],
//     }));
//   };

//   const deleteYAxis = (yAxisId) => {
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.filter((yAxis) => yAxis.id !== yAxisId),
//     }));
//   };

//   const getYAxisDomain = (range) => {
//     switch (range) {
//       case "0-500": return [0, 500];
//       case "0-100": return [0, 100];
//       case "0-10": return [0, 10];
//       default: return [0, 500];
//     }
//   };

//   const renderChart = (chart) => {
//     // Extract the hour from the timestamp
//     const getHour = (timestamp) => {
//       const date = new Date(timestamp);
//       return date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate() + ' ' + date.getHours();
//     };
  
//     // Filter data to include only the first data point of each hour
//     const filteredData = data.reduce((acc, current) => {
//       const hour = getHour(current.timestamp);
//       if (!acc.some(item => getHour(item.timestamp) === hour)) {
//         acc.push(current);  // If hour is not yet added, add the current data point
//       }
//       return acc;
//     }, []);
  
//     return (
//       <ResponsiveContainer width="100%" height={400}>
//         <LineChart data={filteredData} syncId="syncChart">
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="timestamp" />
//           {chart.yAxisDataKeys.map((yAxis) => (
//             <YAxis
//               key={yAxis.id}
//               yAxisId={yAxis.id}
//               domain={getYAxisDomain(yAxis.range)}
//               stroke={yAxis.color}
//             />
//           ))}
//           <Tooltip />
//           <Legend />
//           <Brush />
//           {chart.yAxisDataKeys.map((yAxis) =>
//             yAxis.dataKeys.map((key) => (
//               <Line
//                 key={key}
//                 type="monotone"
//                 dataKey={key}
//                 stroke={yAxis.color}
//                 strokeDasharray={
//                   yAxis.lineStyle === 'solid'
//                     ? ''
//                     : yAxis.lineStyle === 'dotted'
//                     ? '1 1'
//                     : '5 5'
//                 }
//                 yAxisId={yAxis.id}
//               />
//             ))
//           )}
//         </LineChart>
//       </ResponsiveContainer>
//     );
//   };
  
  
  

//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       <Container>
//         <Box display="flex" justifyContent="flex-end" marginBottom={4}>
//           <Button variant="contained" color="primary" onClick={() => setChartDialogOpen(true)}>
//             Add Custom Chart
//           </Button>
//         </Box>

//         <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
//           <DialogTitle>Select Chart Type</DialogTitle>
//           <DialogContent>
//             <Box display="flex" flexDirection="column" gap={2}>
//               <Button variant="contained" onClick={() => addCustomChart('Line')}>Add Line Chart</Button>
//             </Box>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setChartDialogOpen(false)} color="secondary">Cancel</Button>
//           </DialogActions>
//         </Dialog>

//         {charts.map((chart) => (
//           <Box key={chart.id} marginY={4} position="relative">
//             <IconButton
//               aria-label="delete"
//               onClick={() => deleteChart(chart.id)}
//               style={{ position: "absolute", right: 0, top: 0, zIndex: 10 }}
//             >
//               <DeleteIcon />
//             </IconButton>
//             <Box border={1} padding={2}>
//               {renderChart(chart)}
//               <Box display="flex" justifyContent="space-between">
//                 <Button variant="outlined" color="primary" onClick={() => openDialog(chart)}>
//                   Configure Chart
//                 </Button>
//                 <Button variant="outlined" color="primary" onClick={() => setDateDialogOpen(true)}>
//                   Date Range Select
//                 </Button>
//               </Box>
//             </Box>
//           </Box>
//         ))}

//         {tempChartData && (
//           <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
//             <DialogTitle>Configure Chart</DialogTitle>
//             <DialogContent>
//               <Box display="flex" flexDirection="column" maxHeight="400px" overflow="auto">
//                 {tempChartData.yAxisDataKeys.map((yAxis, index) => (
//                   <Box key={yAxis.id} display="flex" flexDirection="column" marginBottom={2}>
//                     <Box display="flex" justifyContent="space-between" alignItems="center">
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
//                         onChange={(event) => handleDataKeyChange(yAxis.id, event)}
//                       >
//                         <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//                         <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
//                         <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
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
//                         onChange={(event) => handleLineStyleChange(yAxis.id, event)}
//                       >
//                         <MenuItem value="solid">Solid</MenuItem>
//                         <MenuItem value="dotted">Dotted</MenuItem>
//                         <MenuItem value="dashed">Dashed</MenuItem>
//                       </Select>
//                     </FormControl>
//                     <Button onClick={() => openColorPicker(yAxis.id)}>Select Color</Button>
//                     {colorPickerOpen && selectedYAxisId === yAxis.id && (
//                       <SketchPicker color={yAxis.color} onChangeComplete={handleColorChange} />
//                     )}
//                   </Box>
//                 ))}
//                 <Button variant="contained" color="secondary" onClick={addYAxis}>
//                   Add Y-Axis
//                 </Button>
//               </Box>
//             </DialogContent>
//             <DialogActions>
//               <Button onClick={closeDialog} color="secondary">Cancel</Button>
//               <Button onClick={saveConfiguration} color="primary">Save</Button>
//             </DialogActions>
//           </Dialog>
//         )}

//         <Dialog open={dateDialogOpen} onClose={() => setDateDialogOpen(false)} fullWidth maxWidth="sm">
//           <DialogTitle>Select Date Range</DialogTitle>
//           <DialogContent>
//             <Grid container spacing={2} alignItems="center">
//               <Grid item xs={12}>
//                 <FormControlLabel
//                   control={<Switch checked={realTimeData} onChange={(e) => setRealTimeData(e.target.checked)} />}
//                   label="Switch to Real-Time Data"
//                 />
//               </Grid>
//               <Grid item xs={6}>
//                 <DateTimePicker
//                   label="Start Date and Time"
//                   value={startDate}
//                   onChange={setStartDate}
//                   renderInput={(params) => <TextField {...params} fullWidth />}
//                 />
//               </Grid>
//               <Grid item xs={6}>
//                 <DateTimePicker
//                   label="End Date and Time"
//                   value={endDate}
//                   onChange={setEndDate}
//                   renderInput={(params) => <TextField {...params} fullWidth />}
//                   disabled={realTimeData}
//                 />
//               </Grid>
//             </Grid>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setDateDialogOpen(false)} color="secondary">Cancel</Button>
//             <Button
//               onClick={() => {
//                 setDateDialogOpen(false);
//                 if (!realTimeData) fetchHistoricalData();
//               }}
//               color="primary"
//               disabled={!startDate || (!realTimeData && !endDate)}
//             >
//               Apply
//             </Button>
//           </DialogActions>
//         </Dialog>
//       </Container>
//     </LocalizationProvider>
//   );
// };

// export default CustomCharts;
