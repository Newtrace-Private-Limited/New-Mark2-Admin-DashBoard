// import React, { useEffect, useState,useRef } from "react";
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
// import zoomPlugin from "chartjs-plugin-zoom";
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
//   const zoomedCharts = useRef(new Set()); // Track which charts are zoomed
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
//                                         </Select>
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



import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setLayout,
  addChart,
  removeChart,
  updateChart,
} from "../../redux/layoutActions";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import GridLayout from "react-grid-layout";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  IconButton,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  useTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import { debounce } from "lodash";
import { tokens } from "../../theme";
import { useWebSocket } from "src/WebSocketProvider";
import { SketchPicker } from "react-color";
// Colors for the chart
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
const Max_data_point = 20;

const CustomCharts = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const dispatch = useDispatch();
  const charts = useSelector((state) => state.layout.customCharts);
  const layout = useSelector((state) => state.layout.customChartsLayout);
  const [chartDialogOpen, setChartDialogOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tempChartData, setTempChartData] = useState(null);
  const websocketData = useWebSocket();
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [selectedYAxisId, setSelectedYAxisId] = useState(null);
  // Load saved charts and layout when the component mounts

  useEffect(() => {
    const savedLayout = JSON.parse(localStorage.getItem("customChartsLayout")) || [];
    dispatch(setLayout(savedLayout, "customCharts"));
  }, [dispatch]);
  
  // Save layout changes (debounced to avoid excessive dispatches)
  const saveLayout = debounce((newLayout) => {
    dispatch(setLayout(newLayout, "custom"));
    localStorage.setItem("customChartsLayout", JSON.stringify(newLayout));
  }, 500);

  // Add a new custom chart of the specified type
  const addCustomChart = (type) => {
    const newChartId = Date.now();
    const newChart = {
      id: newChartId,
      type,
      data: [], // Initially empty, will be populated via WebSocket
      xAxisDataKey: "",
      yAxisDataKeys: [
        {
          id: "left-0",
          dataKeys: ["AX-LT-011"],
          range: "0-500",
          color: "#ca33e8",
          lineStyle: "solid",
        },
      ],
    };
    dispatch(addChart(newChart, "custom"));
    saveLayout([
      ...layout,
      { i: newChartId.toString(), x: 0, y: Infinity, w: 6, h: 8 },
    ]);
    setChartDialogOpen(false);
  };

  // Remove a chart and update layout accordingly
  const deleteChart = (chartId) => {
    dispatch(removeChart(chartId, "custom"));
    saveLayout(layout.filter((l) => l.i !== chartId.toString()));
  };
 
  // Open the configuration dialog for a specific chart
  const openDialog = (chart) => {
    setTempChartData(chart);
    setDialogOpen(true);
  };

  // Save configuration changes to Redux and close the dialog
  const saveConfiguration = () => {
    if (tempChartData) {
      dispatch(updateChart(tempChartData, "custom"));
      setDialogOpen(false);
    }
  };

  // WebSocket connection and data handling
  useEffect(() => {
    const ws = new WebSocket(
      "wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/"
    );
  
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
  
      const updatedCharts = charts.map((chart) => {
        if (
          chart.yAxisDataKeys.some((yAxis) =>
            yAxis.dataKeys.includes("AX-LT-011")
          )
        ) {
          // Append new data point
          const newData = [...chart.data, message];
          
          // Ensure we only keep the latest Max_data_point data points
          const limitedData = newData.slice(-Max_data_point); // Keep only the last Max_data_point data points
          
          return {
            ...chart,
            data: limitedData, // Update the chart with the limited data
          };
        }
        return chart;
      });
  
      updatedCharts.forEach((chart) => dispatch(updateChart(chart, "custom")));
    };
  
    ws.onclose = () => console.log("WebSocket connection closed");
  
    return () => ws.close(); // Clean up on component unmount
  }, [charts, dispatch]);

  const closeDialog = () => setDialogOpen(false);

  const handleDataKeyChange = (yAxisId, event) => {
    const { value } = event.target;
    setTempChartData((prevChart) => ({
      ...prevChart,
      yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
        yAxis.id === yAxisId ? { ...yAxis, dataKeys: value } : yAxis
      ),
    }));
  };

  const handleXAxisDataKeyChange = (event) => {
    const { value } = event.target;
    setTempChartData((prevChart) => ({
      ...prevChart,
      xAxisDataKey: value,
    }));
  };

  const handleLineStyleChange = (yAxisId, event) => {
    const { value } = event.target;
    setTempChartData((prevChart) => ({
      ...prevChart,
      yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
        yAxis.id === yAxisId ? { ...yAxis, lineStyle: value } : yAxis
      ),
    }));
  };

  const handleRangeChange = (yAxisId, event) => {
    const { value } = event.target;
    setTempChartData((prevChart) => ({
      ...prevChart,
      yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
        yAxis.id === yAxisId ? { ...yAxis, range: value } : yAxis
      ),
    }));
  };

  const addYAxis = () => {
    setTempChartData((prevChart) => ({
      ...prevChart,
      yAxisDataKeys: [
        ...prevChart.yAxisDataKeys,
        {
          id: `left-${prevChart.yAxisDataKeys.length}`,
          dataKeys: [],
          range: "0-500",
          color: "#279096",
          lineStyle: "solid",
        },
      ],
    }));
  };

  const deleteYAxis = (yAxisId) => {
    setTempChartData((prevChart) => ({
      ...prevChart,
      yAxisDataKeys: prevChart.yAxisDataKeys.filter(
        (yAxis) => yAxis.id !== yAxisId
      ),
    }));
  };
  const openColorPicker = (yAxisId) => {
    setSelectedYAxisId(yAxisId);
    setColorPickerOpen(true);
  };
  const handleColorChange = (color) => {
    setTempChartData((prevChart) => ({
      ...prevChart,
      yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
        yAxis.id === selectedYAxisId ? { ...yAxis, color: color.hex } : yAxis
      ),
    }));
    setColorPickerOpen(false);
  };

  const getYAxisDomain = (range) => {
    switch (range) {
      case "0-500":
        return [0, 500];
      case "0-100":
        return [0, 100];
      case "0-1200":
        return [0, 1200];
      default:
        return [0, 500];
    }
  };

  const getLineStyle = (lineStyle) => {
    switch (lineStyle) {
      case "solid":
        return "";
      case "dotted":
        return "1 1";
      case "dashed":
        return "5 5";
      case "dot-dash":
        return "3 3 1 3";
      case "dash-dot-dot":
        return "3 3 1 1 1 3";
      default:
        return "";
    }
  };
  const renderChart = (chart) => {
    switch (chart.type) {
      case "Line":
        return renderLineChart(chart);
      case "Bar":
        return renderBarChart(chart);
      case "Scatter":
        return renderScatterChart(chart);
      case "XY":
        return renderXYChart(chart);
      case "Pie":
        return renderPieChart(chart);
      default:
        return null;
    }
  };

  const renderLineChart = (chart) => (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chart.data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
       
        />
        {chart.yAxisDataKeys.map((yAxis) => (
          <YAxis
            key={yAxis.id}
            yAxisId={yAxis.id}
            domain={getYAxisDomain(yAxis.range)}
            stroke={yAxis.color}
          />
        ))}
        <Tooltip
        cursor={{ strokeDasharray: '3 3' }}
        content={({ payload }) => {
          if (payload && payload.length) {
            const point = payload[0].payload;
            return (
              <div className="custom-tooltip">
                {chart.yAxisDataKeys.map((yAxis) => (
                  
                  <p key={yAxis.id}>
                    {`Y (${yAxis.dataKeys[0]}): ${point[yAxis.dataKeys[0]]}`}
                  </p>
                  
                ))}
                
                <p>
                {`Timestamp: ${new Date(new Date(websocketData.timestamp).getTime() + (5.5 * 60 * 60 * 1000)).toLocaleString('en-IN', {
                  hour12: true,  // Optional: If you want a 12-hour format with AM/PM
                  weekday: 'short', // Optional: To include the weekday name
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}`}
              </p>
              </div>
            );
          }
          return null;
        }}
         
      />
      <Legend />
        {chart.yAxisDataKeys.map((yAxis) =>
          yAxis.dataKeys.map((key) => (
            <Line
              key={key}
              dataKey={key}
              fill={yAxis.color}
              yAxisId={yAxis.id}
              stroke={yAxis.color}
              strokeDasharray={getLineStyle(yAxis.lineStyle)}
            />
          ))
        )}
      </LineChart>
    </ResponsiveContainer>
  );

  const renderScatterChart = (chart) => (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart data={chart.data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
       
        />
        {chart.yAxisDataKeys.map((yAxis) => (
          <YAxis
            key={yAxis.id}
            yAxisId={yAxis.id}
            domain={getYAxisDomain(yAxis.range)}
            stroke={yAxis.color}
          />
        ))}
        <Tooltip
        cursor={{ strokeDasharray: '3 3' }}
        content={({ payload }) => {
          if (payload && payload.length) {
            const point = payload[0].payload;
            return (
              <div className="custom-tooltip">
                
                {chart.yAxisDataKeys.map((yAxis) => (
                  <p key={yAxis.id}>
                    {`Y (${yAxis.dataKeys[0]}): ${point[yAxis.dataKeys[0]]}`}
                  </p>
                ))}
                <p>
  {`Timestamp: ${new Date(new Date(websocketData.timestamp).getTime() + (5.5 * 60 * 60 * 1000)).toLocaleString('en-IN', {
    hour12: true,  // Optional: If you want a 12-hour format with AM/PM
    weekday: 'short', // Optional: To include the weekday name
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })}`}
</p>

              </div>
            );
          }
          return null;
        }}
      />
        <Legend />
        {chart.yAxisDataKeys.map((yAxis) =>
          yAxis.dataKeys.map((key) => (
            <Scatter
              key={key}
              dataKey={key}
              fill={yAxis.color}
              yAxisId={yAxis.id}
            />
          ))
        )}
      </ScatterChart>
    </ResponsiveContainer>
  );


  const Max3_data_point = 50;

  const renderXYChart = (chart) => {
    // Limit the data to the latest 20 points
    const updatedData = chart.data.slice(-Max3_data_point);
  
    return (
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart data={updatedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={chart.xAxisDataKey}
            type="number"
            domain={["auto", "auto"]} // Automatically adjust the domain based on data
            tickFormatter={(value) => value.toFixed(4)}
          />
          {chart.yAxisDataKeys.map((yAxis, yAxisIndex) => (
            <YAxis
              key={yAxisIndex} // Unique key for each YAxis
              dataKey={chart.yAxisDataKey}
              yAxisId={yAxis.id}
              domain={["auto", "auto"]} // or use yAxis.range if defined
              stroke={yAxis.color}
              tickFormatter={(value) => value.toFixed(4)}
            />
          ))}
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            content={({ payload }) => {
              if (payload && payload.length) {
                const point = payload[0].payload;
                return (
                  <div className="custom-tooltip">
                    <p>{`X (${chart.xAxisDataKey}): ${point[chart.xAxisDataKey]}`}</p>
                    {chart.yAxisDataKeys.map((yAxis) => (
                      <p key={yAxis.id}>
                        {`Y (${yAxis.dataKeys[0]}): ${point[yAxis.dataKeys[0]]}`}
                      </p>
                    ))}
                    <p>
                      {`Timestamp: ${new Date(new Date(websocketData.timestamp).getTime() + (5.5 * 60 * 60 * 1000)).toLocaleString('en-IN', {
                        hour12: true, 
                        weekday: 'short', 
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}`}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          {chart.yAxisDataKeys.map((yAxis) =>
            yAxis.dataKeys.map((key, keyIndex) => (
              <Scatter
                key={keyIndex} // Unique key for each scatter
                dataKey={key}
                fill={yAxis.color}
                yAxisId={yAxis.id}
                name={`${chart.xAxisDataKey} vs ${yAxis.dataKeys}`} // Ensure naming is clear and non-conflicting
              />
            ))
          )}
        </ScatterChart>
      </ResponsiveContainer>
    );
  };
  

  
  const Max2_data_point = 2;
  const renderBarChart = (chart) => {
    const updatedData = chart.data.slice(-Max2_data_point);
    return (
      <ResponsiveContainer width="100%" height="100%">
      <BarChart data={updatedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis  
       />
        {chart.yAxisDataKeys.map((yAxis) => (
          <YAxis
            key={yAxis.id}
            yAxisId={yAxis.id}
            domain={getYAxisDomain(yAxis.range)}
            stroke={yAxis.color}
          />
        ))}
        <Tooltip
        cursor={{ strokeDasharray: '3 3' }}
        content={({ payload }) => {
          if (payload && payload.length) {
            const point = payload[0].payload;
            return (
              <div className="custom-tooltip">
                {chart.yAxisDataKeys.map((yAxis) => (
                  <p key={yAxis.id}>
                    {`Y (${yAxis.dataKeys[0]}): ${point[yAxis.dataKeys[0]]}`}
                  </p>
                ))}
                <p>
  {`Timestamp: ${new Date(new Date(websocketData.timestamp).getTime() + (5.5 * 60 * 60 * 1000)).toLocaleString('en-IN', {
    hour12: true,  // Optional: If you want a 12-hour format with AM/PM
    weekday: 'short', // Optional: To include the weekday name
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })}`}
</p>
              </div>
            );
          }
          return null;
        }}
      />

        <Legend />
        {chart.yAxisDataKeys.map((yAxis) =>
          yAxis.dataKeys.map((key) => (
            <Bar
              key={key}
              dataKey={key}
              fill={yAxis.color}
              yAxisId={yAxis.id}
            />
          ))
        )}
      </BarChart>
    </ResponsiveContainer>
    );
  };
  const renderPieChart = (chart) => {
    const latestData = chart.data.slice(-1)[0];
    const dataKeys = chart.yAxisDataKeys.flatMap((yAxis) => yAxis.dataKeys);
    const pieData = dataKeys.map((key) => ({
      name: key,
      value: latestData ? latestData[key] : 0,
    }));

    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            outerRadius={120}
            label
          >
            {pieData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };
  return (
    <>
      <Box display="flex" justifyContent="flex-end" >
        <Button color="secondary" variant="contained" onClick={() => setChartDialogOpen(true)}>
          Add Custom Chart
        </Button>
      </Box>
      <GridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={30}
        width={1630}
        onLayoutChange={saveLayout}
        draggableHandle=".drag-handle"
      >
        {charts.map((chart) => (
          <Box
            key={chart.id}
            data-grid={
              layout.find((l) => l.i === chart.id.toString()) || {
                x: 0,
                y: Infinity,
                w: 6,
                h: 8,
              }
            }
            sx={{
              position: "relative",
              border: "1px solid #ccc",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              p={2}
             
            >
              <IconButton className="drag-handle">
                <DragHandleIcon />
              </IconButton>
              <Typography variant="h6">{chart.type} Chart</Typography>
              <IconButton
                onClick={() => deleteChart(chart.id)}
                style={{ cursor: "pointer" }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
            <Box sx={{ height: "calc(100% - 80px)" }}>{renderChart(chart)}</Box>
            <Box
              display="flex"
              justifyContent="space-between"
              p={2}
              marginTop={-6}
            >
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => openDialog(chart)}
              >
                Configure Chart
              </Button>
            </Box>
          </Box>
        ))}
      </GridLayout>

      <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
        <DialogTitle>Select Chart Type</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2}>
            <Button variant="contained" onClick={() => addCustomChart("Line")}>
              Add Line Chart
            </Button>
            <Button variant="contained" onClick={() => addCustomChart("Bar")}>
              Add Bar Chart
            </Button>
            <Button
              variant="contained"
              onClick={() => addCustomChart("Scatter")}
            >
              Add Scatter Chart
            </Button>
            <Button variant="contained" onClick={() => addCustomChart("XY")}>
              Add XY Chart
            </Button>
            <Button variant="contained" onClick={() => addCustomChart("Pie")}>
              Add Pie Chart
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChartDialogOpen(false)} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {tempChartData && (
        <Dialog
          open={dialogOpen}
          onClose={closeDialog}
          fullWidth
          maxWidth="md"
          marginBottom="5px"
        >
          <DialogTitle>Configure Chart</DialogTitle>
          <DialogContent>
            <Box
              display="flex"
              flexDirection="column"
              maxHeight="400px"
              overflow="auto"
            >
              {tempChartData.type === "XY" && (
                <Box marginBottom={2}>
                  <Typography variant="h6">X-Axis</Typography>
                  <FormControl margin="normal">
                    <InputLabel>X-Axis Data Key</InputLabel>
                    <Select
                      value={tempChartData.xAxisDataKey}
                      onChange={handleXAxisDataKeyChange}
                    >
                      <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
                      <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
                                        </Select>
                  </FormControl>
                </Box>
              )}
              {tempChartData.yAxisDataKeys.map((yAxis, index) => (
                <Box
                  key={yAxis.id}
                  display="flex"
                  flexDirection="column"
                  marginBottom={2}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="h6">Y-Axis {index + 1}</Typography>
                    <IconButton onClick={() => deleteYAxis(yAxis.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Data Keys</InputLabel>
                    <Select
                      multiple  
                      value={yAxis.dataKeys}
                      onChange={(event) => handleDataKeyChange(yAxis.id, event)}
                    >
                      <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
                      <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
                                       </Select>
                  </FormControl>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Range</InputLabel>
                    <Select
                      value={yAxis.range}
                      onChange={(event) => handleRangeChange(yAxis.id, event)}
                    >
                      <MenuItem value="0-100">0-100</MenuItem>
                      <MenuItem value="0-500">0-500</MenuItem>
                      <MenuItem value="0-1200">0-1200</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Line Style</InputLabel>
                    <Select
                      value={yAxis.lineStyle}
                      onChange={(event) =>
                        handleLineStyleChange(yAxis.id, event)
                      }
                    >
                      <MenuItem value="solid">Solid</MenuItem>
                      <MenuItem value="dotted">Dotted</MenuItem>
                      <MenuItem value="dashed">Dashed</MenuItem>
                      <MenuItem value="dot-dash">Dot Dash</MenuItem>
                      <MenuItem value="dash-dot-dot">Dash Dot Dot</MenuItem>
                    </Select>
                  </FormControl>
                  <Button color="secondary" onClick={() => openColorPicker(yAxis.id)}>
                  Select Color
                </Button>
                {colorPickerOpen && selectedYAxisId === yAxis.id && (
                  <SketchPicker
                    color={yAxis.color}
                    onChangeComplete={handleColorChange}
                  />
                )}
                </Box>
              ))}
              <Button variant="contained" color="secondary" onClick={addYAxis}>
                Add Y-Axis
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialog} color="secondary">
              Cancel
            </Button>
            <Button onClick={saveConfiguration} color="secondary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default CustomCharts;


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
//                                         </Select>
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

//   const renderXYChart = (chart) => (
//     <ResponsiveContainer width="100%" height="100%">
//       <ScatterChart data={chart.data}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis
//           dataKey={chart.xAxisDataKey}
//           type="number"
//           domain={["auto", "auto"]} // Automatically adjust the domain based on data
//           tickFormatter={(value) => value.toFixed(4)}
//         />
//         {chart.yAxisDataKeys.map((yAxis, yAxisIndex) => (
//           <YAxis
//             key={yAxisIndex} // Unique key for each YAxis
//             dataKey={chart.yAxisDataKey}
//             yAxisId={yAxis.id}
//             domain={["auto", "auto"]} // or use yAxis.range if defined
//             stroke={yAxis.color}
//             tickFormatter={(value) => value.toFixed(4)}
//           />
//         ))}
//         <Tooltip
//           cursor={{ strokeDasharray: '3 3' }}
//           content={({ payload }) => {
//             if (payload && payload.length) {
//               const point = payload[0].payload;
//               return (
//                 <div className="custom-tooltip">
//                   <p>{`X (${chart.xAxisDataKey}): ${point[chart.xAxisDataKey]}`}</p>
//                   {chart.yAxisDataKeys.map((yAxis) => (
//                     <p key={yAxis.id}>
//                       {`Y (${yAxis.dataKeys[0]}): ${point[yAxis.dataKeys[0]]}`}
//                     </p>
//                   ))}
//                   <p>
//                     {`Timestamp: ${new Date(new Date(websocketData.timestamp).getTime() + (5.5 * 60 * 60 * 1000)).toLocaleString('en-IN', {
//                       hour12: true, 
//                       weekday: 'short', 
//                       year: 'numeric',
//                       month: 'short',
//                       day: 'numeric',
//                       hour: '2-digit',
//                       minute: '2-digit',
//                       second: '2-digit'
//                     })}`}
//                   </p>
//                 </div>
//               );
//             }
//             return null;
//           }}
//         />
//         <Legend />
//         {chart.yAxisDataKeys.map((yAxis) =>
//           yAxis.dataKeys.map((key, keyIndex) => (
//             <Scatter
//               key={keyIndex} // Unique key for each scatter
//               dataKey={key}
//               fill={yAxis.color}
//               yAxisId={yAxis.id}
//               name={`${chart.xAxisDataKey} vs ${yAxis.dataKeys}`} // Ensure naming is clear and non-conflicting
//             />
//           ))
//         )}
//       </ScatterChart>
//     </ResponsiveContainer>
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


// import React, { useState, useEffect } from "react";
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
//   useTheme,
// } from "@mui/material";
// import DeleteIcon from "@mui/icons-material/Delete";
// import { SketchPicker } from "react-color";
// import { useWebSocket } from "src/WebSocketProvider";
// import "react-grid-layout/css/styles.css";
// import "react-resizable/css/styles.css";
// import DragHandleIcon from "@mui/icons-material/DragHandle";
// import { tokens } from "../../theme";
// const MAX_DATA_POINTS = 10;
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
//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);
//   const websocketData = useWebSocket();
//   const [charts, setCharts] = useState([]);
//   const [layout, setLayout] = useState(() => {
//     const savedLayout = localStorage.getItem("chartsLayout");
//     return savedLayout ? JSON.parse(savedLayout) : [];
//   });
//   const [chartDialogOpen, setChartDialogOpen] = useState(false);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [tempChartData, setTempChartData] = useState(null);
//   const [colorPickerOpen, setColorPickerOpen] = useState(false);
//   const [selectedYAxisId, setSelectedYAxisId] = useState(null);
//   const [dateDialogOpen, setDateDialogOpen] = useState(false);

//   useEffect(() => {
//     const savedCharts = localStorage.getItem("customCharts");
//     if (savedCharts) {
//       setCharts(JSON.parse(savedCharts));
//     }
//   }, []);

//   useEffect(() => {
//     if (websocketData) {
//       setCharts((prevCharts) =>
//         prevCharts.map((chart) => {
//           const newData = { id: Date.now(), ...websocketData };
//           if (
//             chart.type === "Line" ||
//             chart.type === "Scatter" ||
//             chart.type === "XY"
//           ) {
//             const updatedData = [...(chart.data || []), newData].slice(
//               -MAX_DATA_POINTS
//             );
//             return { ...chart, data: updatedData };
//           } else {
//             return { ...chart, data: [newData] };
//           }
//         })
//       );
//     }
//   }, [websocketData]);

//   const saveLayout = (newLayout) => {
//     setLayout(newLayout);
//     localStorage.setItem("chartsLayout", JSON.stringify(newLayout));
//   };

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
//     setCharts((prevCharts) => [...prevCharts, newChart]);
//     setLayout([
//       ...layout,
//       { i: newChartId.toString(), x: 0, y: Infinity, w: 6, h: 8 },
//     ]);
//     setChartDialogOpen(false);
//   };
//   const openDialog = (chart) => {
//     setTempChartData(chart);
//     setDialogOpen(true);
//   };
//   const closeDialog = () => setDialogOpen(false);
//   const saveConfiguration = () => {
//     const updatedCharts = charts.map((chart) =>
//       chart.id === tempChartData.id ? tempChartData : chart
//     );
//     setCharts(updatedCharts);
//     setDialogOpen(false);

//     const chartConfigurations = updatedCharts.map((chart) => ({
//       id: chart.id,
//       type: chart.type,
//       xAxisDataKey: chart.xAxisDataKey,
//       yAxisDataKeys: chart.yAxisDataKeys,
//     }));
//     localStorage.setItem("customCharts", JSON.stringify(chartConfigurations));
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

//   const deleteChart = (chartId) => {
//     const updatedCharts = charts.filter((chart) => chart.id !== chartId);
//     setCharts(updatedCharts);
//     setLayout(layout.filter((l) => l.i !== chartId.toString()));

//     const chartConfigurations = updatedCharts.map((chart) => ({
//       id: chart.id,
//       type: chart.type,
//       xAxisDataKey: chart.xAxisDataKey,
//       yAxisDataKeys: chart.yAxisDataKeys,
//     }));
//     localStorage.setItem("customCharts", JSON.stringify(chartConfigurations));
//     localStorage.setItem(
//       "chartsLayout",
//       JSON.stringify(layout.filter((l) => l.i !== chartId.toString()))
//     );
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

//   const renderBarChart = (chart) => (
//     <ResponsiveContainer width="100%" height="100%">
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

  // const renderXYChart = (chart) => (
  //   <ResponsiveContainer width="100%" height={400}>
  //   <ScatterChart data={chart.data}>
  //     <CartesianGrid strokeDasharray="3 3" />
  //     <XAxis
  //       dataKey={chart.xAxisDataKey}
  //       type="number"
  //       domain={["auto", "auto"]} // Automatically adjust the domain based on data
  //       tickFormatter={(value) => value.toFixed(4)}
  //     />
  //     {chart.yAxisDataKeys.map((yAxis) => (
  //       <YAxis
  //         key={yAxis.id}
  //         dataKey={chart.yAxisDataKey}
  //         yAxisId={yAxis.id}
  //         domain={yAxis.range ? yAxis.range : ["auto", "auto"]} // Automatically adjust if no range is specified
  //         stroke={yAxis.color}
  //         tickFormatter={(value) => value.toFixed(4)}
  //       />
  //     ))}
  //     <Tooltip
  //     cursor={{ strokeDasharray: '3 3' }}
  //     content={({ payload }) => {
  //       if (payload && payload.length) {
  //         const point = payload[0].payload;
  //         return (
  //           <div className="custom-tooltip">
  //             <p>{`X (${chart.xAxisDataKey}): ${point[chart.xAxisDataKey]}`}</p>
  //             {chart.yAxisDataKeys.map((yAxis) => (
  //               <p key={yAxis.id}>
  //                 {`Y (${yAxis.dataKeys[0]}): ${point[yAxis.dataKeys[0]]}`}
  //               </p>
  //             ))}
  //             <p>
  //             {`Timestamp: ${new Date(new Date(point.timestamp).getTime() + (5.5 * 60 * 60 * 1000)).toLocaleString('en-IN', {
  //               hour12: true,  // Optional: If you want a 12-hour format with AM/PM
  //               weekday: 'short', // Optional: To include the weekday name
  //               year: 'numeric',
  //               month: 'short',
  //               day: 'numeric',
  //               hour: '2-digit',
  //               minute: '2-digit',
  //               second: '2-digit'
  //             })}`}
  //           </p>
            
  //           </div>
  //         );
  //       }
  //       return null;
  //     }}
  //   />
  //     <Legend />
  //     {chart.yAxisDataKeys.map((yAxis) =>
  //       yAxis.dataKeys.map((key) => (
  //         <Scatter
  //           key={key}
  //           dataKey={key}
  //           fill={yAxis.color}
  //           yAxisId={yAxis.id}
  //           name={`${chart.xAxisDataKey} vs ${yAxis.dataKeys}`}
  //         />
  //       ))
  //     )}
  //   </ScatterChart>
  // </ResponsiveContainer>
  
  // );
//   const renderPieChart = (chart) => {
//     const latestData = chart.data.slice(-1)[0];
//     const dataKeys = chart.yAxisDataKeys.flatMap((yAxis) => yAxis.dataKeys);
//     const pieData = dataKeys.map((key) => ({
//       name: key,
//       value: latestData ? latestData[key] : 0,
//     }));

//     return (
//       <ResponsiveContainer width="100%" height={400}>
//         <PieChart>
//           <Pie
//             data={pieData}
//             dataKey="value"
//             nameKey="name"
//             outerRadius={150}
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
//       <h1>Real-Time Data</h1>
//       <h1>Last timestamp Data: {websocketData["PLC-TIME-STAMP"]}</h1>
//       <Box display="flex" justifyContent="flex-end" marginBottom={4}>
//         <Button
//           variant="contained"
//           color="primary"
//           onClick={() => setChartDialogOpen(true)}
//         >
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
//                     <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//                     <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
//                     <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
//                     <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
//                     <MenuItem value="CR-LT-011">CR-LT-011</MenuItem>
//                     <MenuItem value="CR-PT-011">CR-PT-011</MenuItem>
//                     <MenuItem value="CR-LT-021">CR-LT-021</MenuItem>
//                     <MenuItem value="CR-PT-021">CR-PT-021</MenuItem>
//                     <MenuItem value="CR-PT-001">CR-PT-001</MenuItem>
//                     <MenuItem value="CR-TT-001">CR-TT-001</MenuItem>
//                     <MenuItem value="CR-FT-001">CR-FT-001</MenuItem>
//                     <MenuItem value="CR-TT-002">CR-TT-002</MenuItem>
//                     <MenuItem value="GS-AT-011">GS-AT-011</MenuItem>
//                     <MenuItem value="GS-AT-012">GS-AT-012</MenuItem>
//                     <MenuItem value="GS-PT-011">GS-PT-011</MenuItem>
//                     <MenuItem value="GS-TT-011">GS-TT-011</MenuItem>
//                     <MenuItem value="GS-AT-022">GS-AT-022</MenuItem>
//                     <MenuItem value="GS-PT-021">GS-PT-021</MenuItem>
//                     <MenuItem value="GS-TT-021">GS-TT-021</MenuItem>
//                     <MenuItem value="PR-TT-001">PR-TT-001</MenuItem>
//                     <MenuItem value="PR-TT-061">PR-TT-061</MenuItem>
//                     <MenuItem value="PR-TT-072">PR-TT-072</MenuItem>
//                     <MenuItem value="PR-FT-001">PR-FT-001</MenuItem>
//                     <MenuItem value="PR-AT-001">PR-AT-001</MenuItem>
//                     <MenuItem value="PR-AT-003">PR-AT-003</MenuItem>
//                     <MenuItem value="PR-AT-005">PR-AT-005</MenuItem>
//                     <MenuItem value="DM-LSH-001">DM-LSH-001</MenuItem>
//                     <MenuItem value="DM-LSL-001">DM-LSL-001</MenuItem>
//                     <MenuItem value="GS-LSL-021">GS-LSL-021</MenuItem>
//                     <MenuItem value="GS-LSL-011">GS-LSL-011</MenuItem>
//                     <MenuItem value="PR-VA-301">PR-VA-301</MenuItem>
//                     <MenuItem value="PR-VA-352">PR-VA-352</MenuItem>
//                     <MenuItem value="PR-VA-312">PR-VA-312</MenuItem>
//                     <MenuItem value="PR-VA-351">PR-VA-351</MenuItem>
//                     <MenuItem value="PR-VA-361Ain">PR-VA-361Ain</MenuItem>
//                     <MenuItem value="PR-VA-361Aout">PR-VA-361Aout</MenuItem>
//                     <MenuItem value="PR-VA-361Bin">PR-VA-361Bin</MenuItem>
//                     <MenuItem value="PR-VA-361Bout">PR-VA-361Bout</MenuItem>
//                     <MenuItem value="PR-VA-362Ain">PR-VA-362Ain</MenuItem>
//                     <MenuItem value="PR-VA-362Aout">PR-VA-362Aout</MenuItem>
//                     <MenuItem value="PR-VA-362Bin">PR-VA-362Bin</MenuItem>
//                     <MenuItem value="PR-VA-362Bout">PR-VA-362Bout</MenuItem>
//                     <MenuItem value="N2-VA-311">N2-VA-311</MenuItem>
//                     <MenuItem value="GS-VA-311">GS-VA-311</MenuItem>
//                     <MenuItem value="GS-VA-312">GS-VA-312</MenuItem>
//                     <MenuItem value="N2-VA-321">N2-VA-321</MenuItem>
//                     <MenuItem value="GS-VA-321">GS-VA-321</MenuItem>
//                     <MenuItem value="GS-VA-322">GS-VA-322</MenuItem>
//                     <MenuItem value="GS-VA-022">GS-VA-022</MenuItem>
//                     <MenuItem value="GS-VA-021">GS-VA-021</MenuItem>
//                     <MenuItem value="AX-VA-351">AX-VA-351</MenuItem>
//                     <MenuItem value="AX-VA-311">AX-VA-311</MenuItem>
//                     <MenuItem value="AX-VA-312">AX-VA-312</MenuItem>
//                     <MenuItem value="AX-VA-321">AX-VA-321</MenuItem>
//                     <MenuItem value="AX-VA-322">AX-VA-322</MenuItem>
//                     <MenuItem value="AX-VA-391">AX-VA-391</MenuItem>
//                     <MenuItem value="DM-VA-301">DM-VA-301</MenuItem>
//                     <MenuItem value="DCDB0-VT-001">DCDB0-VT-001</MenuItem>
//                     <MenuItem value="DCDB0-CT-001">DCDB0-CT-001</MenuItem>
//                     <MenuItem value="DCDB1-VT-001">DCDB1-VT-001</MenuItem>
//                     <MenuItem value="DCDB1-CT-001">DCDB1-CT-001</MenuItem>
//                     <MenuItem value="DCDB2-VT-001">DCDB2-VT-001</MenuItem>
//                     <MenuItem value="DCDB2-CT-001">DCDB2-CT-001</MenuItem>
//                     <MenuItem value="DCDB3-VT-001">DCDB3-VT-001</MenuItem>
//                     <MenuItem value="DCDB3-CT-001">DCDB3-CT-001</MenuItem>
//                     <MenuItem value="DCDB4-VT-001">DCDB4-VT-001</MenuItem>
//                     <MenuItem value="DCDB4-CT-001">DCDB4-CT-001</MenuItem>
//                     <MenuItem value="RECT-CT-001">RECT-CT-001</MenuItem>
//                     <MenuItem value="RECT-VT-001">RECT-VT-001</MenuItem>
                    
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
//                     <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
//                     <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
//                     <MenuItem value="CR-LT-011">CR-LT-011</MenuItem>
//                     <MenuItem value="CR-PT-011">CR-PT-011</MenuItem>
//                     <MenuItem value="CR-LT-021">CR-LT-021</MenuItem>
//                     <MenuItem value="CR-PT-021">CR-PT-021</MenuItem>
//                     <MenuItem value="CR-PT-001">CR-PT-001</MenuItem>
//                     <MenuItem value="CR-TT-001">CR-TT-001</MenuItem>
//                     <MenuItem value="CR-FT-001">CR-FT-001</MenuItem>
//                     <MenuItem value="CR-TT-002">CR-TT-002</MenuItem>
//                     <MenuItem value="GS-AT-011">GS-AT-011</MenuItem>
//                     <MenuItem value="GS-AT-012">GS-AT-012</MenuItem>
//                     <MenuItem value="GS-PT-011">GS-PT-011</MenuItem>
//                     <MenuItem value="GS-TT-011">GS-TT-011</MenuItem>
//                     <MenuItem value="GS-AT-022">GS-AT-022</MenuItem>
//                     <MenuItem value="GS-PT-021">GS-PT-021</MenuItem>
//                     <MenuItem value="GS-TT-021">GS-TT-021</MenuItem>
//                     <MenuItem value="PR-TT-001">PR-TT-001</MenuItem>
//                     <MenuItem value="PR-TT-061">PR-TT-061</MenuItem>
//                     <MenuItem value="PR-TT-072">PR-TT-072</MenuItem>
//                     <MenuItem value="PR-FT-001">PR-FT-001</MenuItem>
//                     <MenuItem value="PR-AT-001">PR-AT-001</MenuItem>
//                     <MenuItem value="PR-AT-003">PR-AT-003</MenuItem>
//                     <MenuItem value="PR-AT-005">PR-AT-005</MenuItem>
//                     <MenuItem value="DM-LSH-001">DM-LSH-001</MenuItem>
//                     <MenuItem value="DM-LSL-001">DM-LSL-001</MenuItem>
//                     <MenuItem value="GS-LSL-021">GS-LSL-021</MenuItem>
//                     <MenuItem value="GS-LSL-011">GS-LSL-011</MenuItem>
//                     <MenuItem value="PR-VA-301">PR-VA-301</MenuItem>
//                     <MenuItem value="PR-VA-352">PR-VA-352</MenuItem>
//                     <MenuItem value="PR-VA-312">PR-VA-312</MenuItem>
//                     <MenuItem value="PR-VA-351">PR-VA-351</MenuItem>
//                     <MenuItem value="PR-VA-361Ain">PR-VA-361Ain</MenuItem>
//                     <MenuItem value="PR-VA-361Aout">PR-VA-361Aout</MenuItem>
//                     <MenuItem value="PR-VA-361Bin">PR-VA-361Bin</MenuItem>
//                     <MenuItem value="PR-VA-361Bout">PR-VA-361Bout</MenuItem>
//                     <MenuItem value="PR-VA-362Ain">PR-VA-362Ain</MenuItem>
//                     <MenuItem value="PR-VA-362Aout">PR-VA-362Aout</MenuItem>
//                     <MenuItem value="PR-VA-362Bin">PR-VA-362Bin</MenuItem>
//                     <MenuItem value="PR-VA-362Bout">PR-VA-362Bout</MenuItem>
//                     <MenuItem value="N2-VA-311">N2-VA-311</MenuItem>
//                     <MenuItem value="GS-VA-311">GS-VA-311</MenuItem>
//                     <MenuItem value="GS-VA-312">GS-VA-312</MenuItem>
//                     <MenuItem value="N2-VA-321">N2-VA-321</MenuItem>
//                     <MenuItem value="GS-VA-321">GS-VA-321</MenuItem>
//                     <MenuItem value="GS-VA-322">GS-VA-322</MenuItem>
//                     <MenuItem value="GS-VA-022">GS-VA-022</MenuItem>
//                     <MenuItem value="GS-VA-021">GS-VA-021</MenuItem>
//                     <MenuItem value="AX-VA-351">AX-VA-351</MenuItem>
//                     <MenuItem value="AX-VA-311">AX-VA-311</MenuItem>
//                     <MenuItem value="AX-VA-312">AX-VA-312</MenuItem>
//                     <MenuItem value="AX-VA-321">AX-VA-321</MenuItem>
//                     <MenuItem value="AX-VA-322">AX-VA-322</MenuItem>
//                     <MenuItem value="AX-VA-391">AX-VA-391</MenuItem>
//                     <MenuItem value="DM-VA-301">DM-VA-301</MenuItem>
//                     <MenuItem value="DCDB0-VT-001">DCDB0-VT-001</MenuItem>
//                     <MenuItem value="DCDB0-CT-001">DCDB0-CT-001</MenuItem>
//                     <MenuItem value="DCDB1-VT-001">DCDB1-VT-001</MenuItem>
//                     <MenuItem value="DCDB1-CT-001">DCDB1-CT-001</MenuItem>
//                     <MenuItem value="DCDB2-VT-001">DCDB2-VT-001</MenuItem>
//                     <MenuItem value="DCDB2-CT-001">DCDB2-CT-001</MenuItem>
//                     <MenuItem value="DCDB3-VT-001">DCDB3-VT-001</MenuItem>
//                     <MenuItem value="DCDB3-CT-001">DCDB3-CT-001</MenuItem>
//                     <MenuItem value="DCDB4-VT-001">DCDB4-VT-001</MenuItem>
//                     <MenuItem value="DCDB4-CT-001">DCDB4-CT-001</MenuItem>
//                     <MenuItem value="RECT-CT-001">RECT-CT-001</MenuItem>
//                     <MenuItem value="RECT-VT-001">RECT-VT-001</MenuItem>
                    
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
//                     Select Color
//                   </Button>
//                   {colorPickerOpen && selectedYAxisId === yAxis.id && (
//                     <SketchPicker
//                       color={yAxis.color}
//                       onChangeComplete={handleColorChange}
//                     />
//                   )}
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

// import React, { useState, useEffect } from "react";
// import {
//   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
//   BarChart, Bar, ScatterChart, Scatter, PieChart, Pie, Cell
// } from "recharts";
// import {
//   Container, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
//   FormControl, InputLabel, Select, MenuItem, Typography, IconButton, TextField
// } from "@mui/material";
// import DeleteIcon from '@mui/icons-material/Delete';
// import { SketchPicker } from 'react-color';
// import { useWebSocket } from "src/WebSocketProvider";
// import GridLayout from "react-grid-layout";
// import 'react-grid-layout/css/styles.css';
// import 'react-resizable/css/styles.css';
// import DragHandleIcon from '@mui/icons-material/DragHandle';

// const MAX_DATA_POINTS = 50;
// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// const CustomCharts = () => {
//   const websocketData = useWebSocket();  // WebSocket connection for real-time data
//   const [charts, setCharts] = useState([]);
//   const [layout, setLayout] = useState([]);
//   const [chartDialogOpen, setChartDialogOpen] = useState(false);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [tempChartData, setTempChartData] = useState(null);
//   const [colorPickerOpen, setColorPickerOpen] = useState(false);
//   const [selectedYAxisId, setSelectedYAxisId] = useState(null);

//   useEffect(() => {
//     const savedCharts = localStorage.getItem('customCharts');
//     if (savedCharts) {
//       setCharts(JSON.parse(savedCharts));
//     }
//     const savedLayout = localStorage.getItem('chartsLayout');
//     if (savedLayout) {
//       setLayout(JSON.parse(savedLayout));
//     }
//   }, []);

//   useEffect(() => {
//     if (websocketData) {
//       setCharts((prevCharts) =>
//         prevCharts.map((chart) => {
//           const newData = { id: Date.now(), ...websocketData };
//           const updatedData = [...(chart.data || []), newData].slice(-MAX_DATA_POINTS);
//           return { ...chart, data: updatedData };
//         })
//       );
//     }
//   }, [websocketData]);

//   const saveLayout = (newLayout) => {
//     setLayout(newLayout);
//     localStorage.setItem('chartsLayout', JSON.stringify(newLayout));
//   };

//   const addCustomChart = (type) => {
//     const newChartId = Date.now();
//     const newChart = {
//       id: newChartId,
//       type,
//       data: [],
//       xAxisDataKey: '',
//       yAxisDataKeys: [{ id: 'left-0', dataKeys: [], range: '0-500', color: "#FF0000", lineStyle: 'solid' }],
//       xAxisRange: type === 'XY' ? ['auto', 'auto'] : null,  // Only XY charts have axis range
//       yAxisRange: type === 'XY' ? ['auto', 'auto'] : null,  // Only XY charts have axis range
//     };
//     setCharts((prevCharts) => [...prevCharts, newChart]);
//     setLayout([...layout, { i: newChartId.toString(), x: 0, y: Infinity, w: 6, h: 8 }]);
//     setChartDialogOpen(false);
//   };

//   const openDialog = (chart) => {
//     setTempChartData(chart);
//     setDialogOpen(true);
//   };

//   const closeDialog = () => setDialogOpen(false);

//   const saveConfiguration = () => {
//     const updatedCharts = charts.map((chart) =>
//       chart.id === tempChartData.id ? tempChartData : chart
//     );
//     setCharts(updatedCharts);
//     setDialogOpen(false);
//     localStorage.setItem('customCharts', JSON.stringify(updatedCharts));
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

//   const handleXAxisDataKeyChange = (event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       xAxisDataKey: value,
//     }));
//   };

//   const handleXAxisRangeChange = (event) => {
//     const { name, value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       xAxisRange: name === 'min' ? [parseFloat(value), prevChart.xAxisRange[1]] : [prevChart.xAxisRange[0], parseFloat(value)],
//     }));
//   };

//   const handleYAxisRangeChange = (yAxisId, event) => {
//     const { name, value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
//         yAxis.id === yAxisId
//           ? {
//               ...yAxis,
//               range: name === 'min' ? [parseFloat(value), yAxis.range[1]] : [yAxis.range[0], parseFloat(value)],
//             }
//           : yAxis
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
//     const updatedCharts = charts.filter((chart) => chart.id !== chartId);
//     setCharts(updatedCharts);
//     setLayout(layout.filter((l) => l.i !== chartId.toString()));
//     localStorage.setItem('customCharts', JSON.stringify(updatedCharts));
//     localStorage.setItem('chartsLayout', JSON.stringify(layout.filter((l) => l.i !== chartId.toString())));
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

//   const renderLineChart = (chart) => (
//     <ResponsiveContainer width="100%" height="100%">
//       <LineChart data={chart.data}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey={chart.xAxisDataKey} />
//         {chart.yAxisDataKeys.map((yAxis) => (
//           <YAxis
//             key={yAxis.id}
//             yAxisId={yAxis.id}
//             domain={yAxis.range ? yAxis.range : ['auto', 'auto']}
//             stroke={yAxis.color}
//           />
//         ))}
//         <Tooltip />
//         <Legend />
//         {chart.yAxisDataKeys.map((yAxis) =>
//           yAxis.dataKeys.map((key) => (
//             <Line
//               key={key}
//               type="monotone"
//               dataKey={key}
//               stroke={yAxis.color}
//               strokeDasharray={yAxis.lineStyle}
//               yAxisId={yAxis.id}
//             />
//           ))
//         )}
//       </LineChart>
//     </ResponsiveContainer>
//   );

//   const renderBarChart = (chart) => (
//     <ResponsiveContainer width="100%" height={400}>
//       <BarChart data={chart.data}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey="time" />
//         {chart.yAxisDataKeys.map((yAxis) => (
//           <YAxis
//             key={yAxis.id}
//             yAxisId={yAxis.id}
//             domain={[0, 500]}
//             stroke={yAxis.color}
//           />
//         ))}
//         <Tooltip />
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

//   );

//   const renderScatterChart = (chart) => (
//     <ResponsiveContainer width="100%" height="100%">
//       <ScatterChart data={chart.data}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey={chart.xAxisDataKey} />
//         {chart.yAxisDataKeys.map((yAxis) => (
//           <YAxis
//             key={yAxis.id}
//             yAxisId={yAxis.id}
//             domain={yAxis.range ? yAxis.range : ['auto', 'auto']}
//             stroke={yAxis.color}
//           />
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

// const renderXYChart = (chart) => (
//   <ResponsiveContainer width="100%" height="100%">
//     <ScatterChart data={chart.data}>
//       <CartesianGrid strokeDasharray="3 3" />
//       <XAxis dataKey={chart.xAxisDataKey} type="number" domain={chart.xAxisRange} />
//       {chart.yAxisDataKeys.map((yAxis) => (
//         <YAxis
//           key={yAxis.id}
//           yAxisId={yAxis.id}
//           domain={yAxis.range ? yAxis.range : ['auto', 'auto']}
//           stroke={yAxis.color}
//         />
//       ))}
//       <Tooltip />
//       <Legend />
//       {chart.yAxisDataKeys.map((yAxis) =>
//         yAxis.dataKeys.map((key) => (
//           <Scatter key={key} dataKey={key} fill={yAxis.color} yAxisId={yAxis.id} />
//         ))
//       )}
//     </ScatterChart>
//   </ResponsiveContainer>
// );

//   const renderPieChart = (chart) => {
//     const latestData = chart.data.slice(-1)[0];
//     const dataKeys = chart.yAxisDataKeys.flatMap((yAxis) => yAxis.dataKeys);
//     const pieData = dataKeys.map((key) => ({
//       name: key,
//       value: latestData ? latestData[key] : 0,
//     }));

//     return (
//       <ResponsiveContainer width="100%" height={400}>
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

//   return (
//     <Container>
//       <Box display="flex" justifyContent="flex-end" marginBottom={4}>
//         <Button variant="contained" color="secondary" onClick={() => setChartDialogOpen(true)}>
//           Add Custom Chart
//         </Button>
//       </Box>

//       <GridLayout
//         className="layout"
//         layout={layout}
//         cols={12}
//         rowHeight={30}
//         width={1200}
//         onLayoutChange={saveLayout}
//         draggableHandle=".drag-handle"
//       >
//         {charts.map((chart) => (
//           <Box key={chart.id} data-grid={layout.find((l) => l.i === chart.id.toString()) || { x: 0, y: Infinity, w: 6, h: 8 }} sx={{ position: 'relative', border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden' }}>
//             <Box display="flex" justifyContent="space-between" p={2}>
//               <IconButton className="drag-handle">
//                 <DragHandleIcon />
//               </IconButton>
//               <Typography variant="h6">{chart.type} Chart</Typography>
//               <IconButton onClick={() => deleteChart(chart.id)} style={{ cursor: 'pointer' }}>
//                 <DeleteIcon />
//               </IconButton>
//             </Box>
//             <Box sx={{ height: 'calc(100% - 80px)' }}>
//               {renderChart(chart)}
//             </Box>
            // <Box display="flex" justifyContent="space-between" p={2} marginTop={-6}>
            //   <Button variant="outlined" color="secondary" onClick={() => openDialog(chart)}>
            //     Configure Chart
            //   </Button>
            // </Box>
//           </Box>
//         ))}
//       </GridLayout>

//       <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
//         <DialogTitle>Select Chart Type</DialogTitle>
//         <DialogContent>
//           <Box display="flex" flexDirection="column" gap={2}>
//             <Button variant="contained" onClick={() => addCustomChart('Line')}>Add Line Chart</Button>
//             <Button variant="contained" onClick={() => addCustomChart('Bar')}>Add Bar Chart</Button>
//             <Button variant="contained" onClick={() => addCustomChart('Scatter')}>Add Scatter Chart</Button>
//             <Button variant="contained" onClick={() => addCustomChart('XY')}>Add XY Chart</Button>
//             <Button variant="contained" onClick={() => addCustomChart('Pie')}>Add Pie Chart</Button>
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setChartDialogOpen(false)} color="secondary">Cancel</Button>
//         </DialogActions>
//       </Dialog>

//       {tempChartData && (
//         <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
//           <DialogTitle>Configure Chart</DialogTitle>
//           <DialogContent>
//             <Box display="flex" flexDirection="column" maxHeight="400px" overflow="auto">
//               {tempChartData.type === 'XY' && (
//                 <Box marginBottom={2}>
//                   <Typography variant="h6">X-Axis</Typography>
//                   <FormControl fullWidth margin="normal">
//                     <InputLabel>X-Axis Data Key</InputLabel>
//                     <Select value={tempChartData.xAxisDataKey} onChange={handleXAxisDataKeyChange}>
//                     <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//                     <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
//                     <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
//                     <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
//                     <MenuItem value="CR-LT-011">CR-LT-011</MenuItem>
//                     <MenuItem value="CR-PT-011">CR-PT-011</MenuItem>
//                     <MenuItem value="CR-LT-021">CR-LT-021</MenuItem>
//                     <MenuItem value="CR-PT-021">CR-PT-021</MenuItem>
//                     <MenuItem value="CR-PT-001">CR-PT-001</MenuItem>
//                     <MenuItem value="CR-TT-001">CR-TT-001</MenuItem>
//                     <MenuItem value="CR-FT-001">CR-FT-001</MenuItem>
//                     <MenuItem value="CR-TT-002">CR-TT-002</MenuItem>
//                     <MenuItem value="GS-AT-011">GS-AT-011</MenuItem>
//                     <MenuItem value="GS-AT-012">GS-AT-012</MenuItem>
//                     <MenuItem value="GS-PT-011">GS-PT-011</MenuItem>
//                     <MenuItem value="GS-TT-011">GS-TT-011</MenuItem>
//                     <MenuItem value="GS-AT-022">GS-AT-022</MenuItem>
//                     <MenuItem value="GS-PT-021">GS-PT-021</MenuItem>
//                     <MenuItem value="GS-TT-021">GS-TT-021</MenuItem>
//                     <MenuItem value="PR-TT-001">PR-TT-001</MenuItem>
//                     <MenuItem value="PR-TT-061">PR-TT-061</MenuItem>
//                     <MenuItem value="PR-TT-072">PR-TT-072</MenuItem>
//                     <MenuItem value="PR-FT-001">PR-FT-001</MenuItem>
//                     <MenuItem value="PR-AT-001">PR-AT-001</MenuItem>
//                     <MenuItem value="PR-AT-003">PR-AT-003</MenuItem>
//                     <MenuItem value="PR-AT-005">PR-AT-005</MenuItem>
//                     <MenuItem value="DM-LSH-001">DM-LSH-001</MenuItem>
//                     <MenuItem value="DM-LSL-001">DM-LSL-001</MenuItem>
//                     <MenuItem value="GS-LSL-021">GS-LSL-021</MenuItem>
//                     <MenuItem value="GS-LSL-011">GS-LSL-011</MenuItem>
//                     <MenuItem value="PR-VA-301">PR-VA-301</MenuItem>
//                     <MenuItem value="PR-VA-352">PR-VA-352</MenuItem>
//                     <MenuItem value="PR-VA-312">PR-VA-312</MenuItem>
//                     <MenuItem value="PR-VA-351">PR-VA-351</MenuItem>
//                     <MenuItem value="PR-VA-361Ain">PR-VA-361Ain</MenuItem>
//                     <MenuItem value="PR-VA-361Aout">PR-VA-361Aout</MenuItem>
//                     <MenuItem value="PR-VA-361Bin">PR-VA-361Bin</MenuItem>
//                     <MenuItem value="PR-VA-361Bout">PR-VA-361Bout</MenuItem>
//                     <MenuItem value="PR-VA-362Ain">PR-VA-362Ain</MenuItem>
//                     <MenuItem value="PR-VA-362Aout">PR-VA-362Aout</MenuItem>
//                     <MenuItem value="PR-VA-362Bin">PR-VA-362Bin</MenuItem>
//                     <MenuItem value="PR-VA-362Bout">PR-VA-362Bout</MenuItem>
//                     <MenuItem value="N2-VA-311">N2-VA-311</MenuItem>
//                     <MenuItem value="GS-VA-311">GS-VA-311</MenuItem>
//                     <MenuItem value="GS-VA-312">GS-VA-312</MenuItem>
//                     <MenuItem value="N2-VA-321">N2-VA-321</MenuItem>
//                     <MenuItem value="GS-VA-321">GS-VA-321</MenuItem>
//                     <MenuItem value="GS-VA-322">GS-VA-322</MenuItem>
//                     <MenuItem value="GS-VA-022">GS-VA-022</MenuItem>
//                     <MenuItem value="GS-VA-021">GS-VA-021</MenuItem>
//                     <MenuItem value="AX-VA-351">AX-VA-351</MenuItem>
//                     <MenuItem value="AX-VA-311">AX-VA-311</MenuItem>
//                     <MenuItem value="AX-VA-312">AX-VA-312</MenuItem>
//                     <MenuItem value="AX-VA-321">AX-VA-321</MenuItem>
//                     <MenuItem value="AX-VA-322">AX-VA-322</MenuItem>
//                     <MenuItem value="AX-VA-391">AX-VA-391</MenuItem>
//                     <MenuItem value="DM-VA-301">DM-VA-301</MenuItem>
//                     <MenuItem value="DCDB0-VT-001">DCDB0-VT-001</MenuItem>
//                     <MenuItem value="DCDB0-CT-001">DCDB0-CT-001</MenuItem>
//                     <MenuItem value="DCDB1-VT-001">DCDB1-VT-001</MenuItem>
//                     <MenuItem value="DCDB1-CT-001">DCDB1-CT-001</MenuItem>
//                     <MenuItem value="DCDB2-VT-001">DCDB2-VT-001</MenuItem>
//                     <MenuItem value="DCDB2-CT-001">DCDB2-CT-001</MenuItem>
//                     <MenuItem value="DCDB3-VT-001">DCDB3-VT-001</MenuItem>
//                     <MenuItem value="DCDB3-CT-001">DCDB3-CT-001</MenuItem>
//                     <MenuItem value="DCDB4-VT-001">DCDB4-VT-001</MenuItem>
//                     <MenuItem value="DCDB4-CT-001">DCDB4-CT-001</MenuItem>
//                     <MenuItem value="RECT-CT-001">RECT-CT-001</MenuItem>
//                     <MenuItem value="RECT-VT-001">RECT-VT-001</MenuItem>
//                     <MenuItem value="PLC-TIME-STAMP">PLC-TIME-STAMP</MenuItem>

//                     </Select>
//                   </FormControl>
//                   <TextField
//                     label="X-Axis Min Range"
//                     type="number"
//                     name="min"
//                     value={tempChartData.xAxisRange[0]}
//                     onChange={handleXAxisRangeChange}
//                     fullWidth
//                     margin="normal"
//                     inputProps={{ step: 0.0001 }}
//                   />
//                   <TextField
//                     label="X-Axis Max Range"
//                     type="number"
//                     name="max"
//                     value={tempChartData.xAxisRange[1]}
//                     onChange={handleXAxisRangeChange}
//                     fullWidth
//                     margin="normal"
//                     inputProps={{ step: 0.0001 }}
//                   />
//                 </Box>
//               )}
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
//                     <Select multiple value={yAxis.dataKeys} onChange={(event) => handleDataKeyChange(yAxis.id, event)}>
//                     <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//                     <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
//                     <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
//                     <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
//                     <MenuItem value="CR-LT-011">CR-LT-011</MenuItem>
//                     <MenuItem value="CR-PT-011">CR-PT-011</MenuItem>
//                     <MenuItem value="CR-LT-021">CR-LT-021</MenuItem>
//                     <MenuItem value="CR-PT-021">CR-PT-021</MenuItem>
//                     <MenuItem value="CR-PT-001">CR-PT-001</MenuItem>
//                     <MenuItem value="CR-TT-001">CR-TT-001</MenuItem>
//                     <MenuItem value="CR-FT-001">CR-FT-001</MenuItem>
//                     <MenuItem value="CR-TT-002">CR-TT-002</MenuItem>
//                     <MenuItem value="GS-AT-011">GS-AT-011</MenuItem>
//                     <MenuItem value="GS-AT-012">GS-AT-012</MenuItem>
//                     <MenuItem value="GS-PT-011">GS-PT-011</MenuItem>
//                     <MenuItem value="GS-TT-011">GS-TT-011</MenuItem>
//                     <MenuItem value="GS-AT-022">GS-AT-022</MenuItem>
//                     <MenuItem value="GS-PT-021">GS-PT-021</MenuItem>
//                     <MenuItem value="GS-TT-021">GS-TT-021</MenuItem>
//                     <MenuItem value="PR-TT-001">PR-TT-001</MenuItem>
//                     <MenuItem value="PR-TT-061">PR-TT-061</MenuItem>
//                     <MenuItem value="PR-TT-072">PR-TT-072</MenuItem>
//                     <MenuItem value="PR-FT-001">PR-FT-001</MenuItem>
//                     <MenuItem value="PR-AT-001">PR-AT-001</MenuItem>
//                     <MenuItem value="PR-AT-003">PR-AT-003</MenuItem>
//                     <MenuItem value="PR-AT-005">PR-AT-005</MenuItem>
//                     <MenuItem value="DM-LSH-001">DM-LSH-001</MenuItem>
//                     <MenuItem value="DM-LSL-001">DM-LSL-001</MenuItem>
//                     <MenuItem value="GS-LSL-021">GS-LSL-021</MenuItem>
//                     <MenuItem value="GS-LSL-011">GS-LSL-011</MenuItem>
//                     <MenuItem value="PR-VA-301">PR-VA-301</MenuItem>
//                     <MenuItem value="PR-VA-352">PR-VA-352</MenuItem>
//                     <MenuItem value="PR-VA-312">PR-VA-312</MenuItem>
//                     <MenuItem value="PR-VA-351">PR-VA-351</MenuItem>
//                     <MenuItem value="PR-VA-361Ain">PR-VA-361Ain</MenuItem>
//                     <MenuItem value="PR-VA-361Aout">PR-VA-361Aout</MenuItem>
//                     <MenuItem value="PR-VA-361Bin">PR-VA-361Bin</MenuItem>
//                     <MenuItem value="PR-VA-361Bout">PR-VA-361Bout</MenuItem>
//                     <MenuItem value="PR-VA-362Ain">PR-VA-362Ain</MenuItem>
//                     <MenuItem value="PR-VA-362Aout">PR-VA-362Aout</MenuItem>
//                     <MenuItem value="PR-VA-362Bin">PR-VA-362Bin</MenuItem>
//                     <MenuItem value="PR-VA-362Bout">PR-VA-362Bout</MenuItem>
//                     <MenuItem value="N2-VA-311">N2-VA-311</MenuItem>
//                     <MenuItem value="GS-VA-311">GS-VA-311</MenuItem>
//                     <MenuItem value="GS-VA-312">GS-VA-312</MenuItem>
//                     <MenuItem value="N2-VA-321">N2-VA-321</MenuItem>
//                     <MenuItem value="GS-VA-321">GS-VA-321</MenuItem>
//                     <MenuItem value="GS-VA-322">GS-VA-322</MenuItem>
//                     <MenuItem value="GS-VA-022">GS-VA-022</MenuItem>
//                     <MenuItem value="GS-VA-021">GS-VA-021</MenuItem>
//                     <MenuItem value="AX-VA-351">AX-VA-351</MenuItem>
//                     <MenuItem value="AX-VA-311">AX-VA-311</MenuItem>
//                     <MenuItem value="AX-VA-312">AX-VA-312</MenuItem>
//                     <MenuItem value="AX-VA-321">AX-VA-321</MenuItem>
//                     <MenuItem value="AX-VA-322">AX-VA-322</MenuItem>
//                     <MenuItem value="AX-VA-391">AX-VA-391</MenuItem>
//                     <MenuItem value="DM-VA-301">DM-VA-301</MenuItem>
//                     <MenuItem value="DCDB0-VT-001">DCDB0-VT-001</MenuItem>
//                     <MenuItem value="DCDB0-CT-001">DCDB0-CT-001</MenuItem>
//                     <MenuItem value="DCDB1-VT-001">DCDB1-VT-001</MenuItem>
//                     <MenuItem value="DCDB1-CT-001">DCDB1-CT-001</MenuItem>
//                     <MenuItem value="DCDB2-VT-001">DCDB2-VT-001</MenuItem>
//                     <MenuItem value="DCDB2-CT-001">DCDB2-CT-001</MenuItem>
//                     <MenuItem value="DCDB3-VT-001">DCDB3-VT-001</MenuItem>
//                     <MenuItem value="DCDB3-CT-001">DCDB3-CT-001</MenuItem>
//                     <MenuItem value="DCDB4-VT-001">DCDB4-VT-001</MenuItem>
//                     <MenuItem value="DCDB4-CT-001">DCDB4-CT-001</MenuItem>
//                     <MenuItem value="RECT-CT-001">RECT-CT-001</MenuItem>
//                     <MenuItem value="RECT-VT-001">RECT-VT-001</MenuItem>
//                     <MenuItem value="PLC-TIME-STAMP">PLC-TIME-STAMP</MenuItem>

//                     </Select>
//                   </FormControl>
// {tempChartData.type === 'XY' && (
//   <>
//     <TextField
//       label="Y-Axis Min Range"
//       type="number"
//       name="min"
//       value={yAxis.range[0]}
//       onChange={(event) => handleYAxisRangeChange(yAxis.id, event)}
//       fullWidth
//       margin="normal"
//       inputProps={{ step: 0.0001 }}
//     />
//     <TextField
//       label="Y-Axis Max Range"
//       type="number"
//       name="max"
//       value={yAxis.range[1]}
//       onChange={(event) => handleYAxisRangeChange(yAxis.id, event)}
//       fullWidth
//       margin="normal"
//       inputProps={{ step: 0.0001 }}
//     />
//   </>
// )}
//                   <FormControl fullWidth margin="normal">
//                     <InputLabel>Line Style</InputLabel>
//                     <Select value={yAxis.lineStyle} onChange={(event) => handleLineStyleChange(yAxis.id, event)}>
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
//             <Button onClick={saveConfiguration} color="secondary">Save</Button>
//           </DialogActions>
//         </Dialog>
//       )}
//     </Container>
//   );
// };

// export default CustomCharts;

// import React, { useState, useEffect } from "react";
// import {
//   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
//   BarChart, Bar, ScatterChart, Scatter, PieChart, Pie, Cell
// } from "recharts";
// import GridLayout from "react-grid-layout";
// import {
//   Container, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
//   FormControl, InputLabel, Select, MenuItem, Typography, IconButton, useTheme,
// } from "@mui/material";
// import DeleteIcon from '@mui/icons-material/Delete';
// import { SketchPicker } from 'react-color';
// import { useWebSocket } from "src/WebSocketProvider";
// import 'react-grid-layout/css/styles.css';
// import 'react-resizable/css/styles.css';
// import DragHandleIcon from '@mui/icons-material/DragHandle';
// import { tokens } from "../../theme";
// const MAX_DATA_POINTS = 50;
// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// const CustomCharts = () => {
//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);
//   const websocketData = useWebSocket();
//   const [charts, setCharts] = useState([]);
//   const [layout, setLayout] = useState(() => {
//     const savedLayout = localStorage.getItem('chartsLayout');
//     return savedLayout ? JSON.parse(savedLayout) : [];
//   });
//   const [chartDialogOpen, setChartDialogOpen] = useState(false);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [tempChartData, setTempChartData] = useState(null);
//   const [colorPickerOpen, setColorPickerOpen] = useState(false);
//   const [selectedYAxisId, setSelectedYAxisId] = useState(null);
//   const [dateDialogOpen, setDateDialogOpen] = useState(false);

//   useEffect(() => {
//     const savedCharts = localStorage.getItem('customCharts');
//     if (savedCharts) {
//       setCharts(JSON.parse(savedCharts));
//     }
//   }, []);

//   useEffect(() => {
//     if (websocketData) {
//       setCharts((prevCharts) =>
//         prevCharts.map((chart) => {
//           const newData = { id: Date.now(), ...websocketData };
//           if (chart.type === "Line" || chart.type === "Scatter" || chart.type === "XY") {
//             const updatedData = [...(chart.data || []), newData].slice(-MAX_DATA_POINTS);
//             return { ...chart, data: updatedData };
//           } else {
//             return { ...chart, data: [newData] };
//           }
//         })
//       );
//     }
//   }, [websocketData]);

//   const saveLayout = (newLayout) => {
//     setLayout(newLayout);
//     localStorage.setItem('chartsLayout', JSON.stringify(newLayout));
//   };

//   const addCustomChart = (type) => {
//     const newChartId = Date.now();
//     const newChart = {
//       id: newChartId,
//       type,
//       data: [],
//       xAxisDataKey: '',
//       yAxisDataKeys: [{ id: 'left-0', dataKeys: ['AX-LT-011'], range: '0-500', color: "#FF0000", lineStyle: 'solid' }],
//     };
//     setCharts((prevCharts) => [...prevCharts, newChart]);
//     setLayout([...layout, { i: newChartId.toString(), x: 0, y: Infinity, w: 6, h: 8 }]);
//     setChartDialogOpen(false);
//   };

//   const openDialog = (chart) => {
//     setTempChartData(chart);
//     setDialogOpen(true);
//   };

//   const closeDialog = () => setDialogOpen(false);

//   const saveConfiguration = () => {
//     const updatedCharts = charts.map((chart) =>
//       chart.id === tempChartData.id ? tempChartData : chart
//     );
//     setCharts(updatedCharts);
//     setDialogOpen(false);

//     const chartConfigurations = updatedCharts.map(chart => ({
//       id: chart.id,
//       type: chart.type,
//       xAxisDataKey: chart.xAxisDataKey,
//       yAxisDataKeys: chart.yAxisDataKeys,
//     }));
//     localStorage.setItem('customCharts', JSON.stringify(chartConfigurations));
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

//   const deleteChart = (chartId) => {
//     const updatedCharts = charts.filter((chart) => chart.id !== chartId);
//     setCharts(updatedCharts);
//     setLayout(layout.filter((l) => l.i !== chartId.toString()));

//     const chartConfigurations = updatedCharts.map(chart => ({
//       id: chart.id,
//       type: chart.type,
//       xAxisDataKey: chart.xAxisDataKey,
//       yAxisDataKeys: chart.yAxisDataKeys,
//     }));
//     localStorage.setItem('customCharts', JSON.stringify(chartConfigurations));
//     localStorage.setItem('chartsLayout', JSON.stringify(layout.filter((l) => l.i !== chartId.toString())));
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
//       case 'solid':
//         return '';
//       case 'dotted':
//         return '1 1';
//       case 'dashed':
//         return '5 5';
//       case 'dot-dash':
//         return '3 3 1 3';
//       case 'dash-dot-dot':
//         return '3 3 1 1 1 3';
//       default:
//         return '';
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
//         <XAxis dataKey="timestamp" />
//         {chart.yAxisDataKeys.map((yAxis) => (
//           <YAxis
//             key={yAxis.id}
//             yAxisId={yAxis.id}
//             domain={getYAxisDomain(yAxis.range)}
//             stroke={yAxis.color}
//           />
//         ))}
//         <Tooltip />

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

//   const renderBarChart = (chart) => (
//     <ResponsiveContainer width="100%" height="100%">
//       <BarChart data={chart.data}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey="timestamp"  />
//         {chart.yAxisDataKeys.map((yAxis) => (
//           <YAxis
//             key={yAxis.id}
//             yAxisId={yAxis.id}
//             domain={getYAxisDomain(yAxis.range)}
//             stroke={yAxis.color}
//           />
//         ))}
//         <Tooltip />
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
//   );

//   const renderScatterChart = (chart) => (
//     <ResponsiveContainer width="100%" height="100%">
//       <ScatterChart data={chart.data}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey="timestamp" />
//         {chart.yAxisDataKeys.map((yAxis) => (
//           <YAxis
//             key={yAxis.id}
//             yAxisId={yAxis.id}
//             domain={getYAxisDomain(yAxis.range)}
//             stroke={yAxis.color}
//           />
//         ))}
//         <Tooltip />
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
//       <ScatterChart data={chart.data}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey={chart.xAxisDataKey} type="number" domain={chart.xAxisRange} />
//         {chart.yAxisDataKeys.map((yAxis) => (
//           <YAxis
//             key={yAxis.id}
//             yAxisId={yAxis.id}
//             domain={yAxis.range ? yAxis.range : ['auto', 'auto']}
//             stroke={yAxis.color}
//           />
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
//       <ResponsiveContainer width="100%" height={400}>
//         <PieChart>
//           <Pie
//             data={pieData}
//             dataKey="value"
//             nameKey="name"
//             outerRadius={150}
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

//   const handleDateRangeApply = () => {
//     // Add logic for applying date range for each chart
//     setDateDialogOpen(false);
//   };

//   return (
//     <>
//       <h1>Real-Time Data</h1>
//       <h1>Last timestamp Data: {websocketData["PLC-TIME-STAMP"]}</h1>
//       <Box display="flex" justifyContent="flex-end" marginBottom={4}>
//         <Button variant="contained" color="primary" onClick={() => setChartDialogOpen(true)}>
//           Add Custom Chart
//         </Button>
//       </Box>

//       <GridLayout
//         className="layout"
//         layout={layout}
//         cols={12}
//         rowHeight={30}
//         width={1600}
//         onLayoutChange={saveLayout}
//         draggableHandle=".drag-handle"
//       >
//         {charts.map((chart) => (
//           <Box  key={chart.id} data-grid={layout.find((l) => l.i === chart.id.toString()) || { x: 0, y: Infinity, w: 6, h: 8 }} sx={{ position: 'relative', border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden' }}>
//             <Box display="flex" justifyContent="space-between" p={2} sx={{backgroundColor: colors.primary[400] }}>
//               <IconButton className="drag-handle">
//                 <DragHandleIcon />
//               </IconButton>
//               <Typography variant="h6">{chart.type} Chart</Typography>
//               <IconButton onClick={() => deleteChart(chart.id)} style={{ cursor: 'pointer' }}>
//                 <DeleteIcon />
//               </IconButton>
//             </Box>
//             <Box sx={{ height: 'calc(100% - 80px)' }}>
//               {renderChart(chart)}
//             </Box>
//             <Box display="flex" justifyContent="space-between" p={2} marginTop={-6}>
//               <Button variant="outlined"  color="secondary" onClick={() => openDialog(chart)}>
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
//             <Button variant="contained" onClick={() => addCustomChart('Line')}>Add Line Chart</Button>
//             <Button variant="contained" onClick={() => addCustomChart('Bar')}>Add Bar Chart</Button>
//             <Button variant="contained" onClick={() => addCustomChart('Scatter')}>Add Scatter Chart</Button>
//             <Button variant="contained" onClick={() => addCustomChart('XY')}>Add XY Chart</Button>
//             <Button variant="contained" onClick={() => addCustomChart('Pie')}>Add Pie Chart</Button>
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setChartDialogOpen(false)} color="secondary">Cancel</Button>
//         </DialogActions>
//       </Dialog>

//       {tempChartData && (
//         <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md" marginBottom="5px">
//           <DialogTitle>Configure Chart</DialogTitle>
//           <DialogContent>
//             <Box display="flex" flexDirection="column" maxHeight="400px" overflow="auto">
//               {tempChartData.type === 'XY' && (
//                 <Box marginBottom={2}>
//                   <Typography variant="h6">X-Axis</Typography>
//                   <FormControl fullWidth margin="normal">
//                     <InputLabel>X-Axis Data Key</InputLabel>
//                     <Select
//                       value={tempChartData.xAxisDataKey}
//                       onChange={handleXAxisDataKeyChange}
//                     >
//                       <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//                       <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
//                       <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
//                       <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
//                       <MenuItem value="CR-PT-001">CR-PT-001</MenuItem>
//                       <MenuItem value="CR-PT-021">CR-PT-021</MenuItem>
//                       <MenuItem value="GS-PT-021">GS-PT-021</MenuItem>
//                     </Select>
//                   </FormControl>
//                 </Box>
//               )}
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
//                         <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
//                       <MenuItem value="CR-PT-001">CR-PT-001</MenuItem>
//                       <MenuItem value="CR-PT-021">CR-PT-021</MenuItem>
//                       <MenuItem value="GS-PT-021">GS-PT-021</MenuItem>
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
//                       <MenuItem value="dot-dash">Dot Dash</MenuItem>
//                       <MenuItem value="dash-dot-dot">Dash Dot Dot</MenuItem>
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
//     </>
//   );
// };

// export default CustomCharts;

// import React, { useState, useEffect } from "react";
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
// } from "@mui/material";
// import DeleteIcon from '@mui/icons-material/Delete';
// import { SketchPicker } from 'react-color';
// import { useWebSocket } from "src/WebSocketProvider";

// const MAX_DATA_POINTS = 50;

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// const CustomCharts = () => {
//   const websocketData = useWebSocket();
//   const [charts, setCharts] = useState([]);
//   const [chartDialogOpen, setChartDialogOpen] = useState(false);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [tempChartData, setTempChartData] = useState(null);
//   const [colorPickerOpen, setColorPickerOpen] = useState(false);
//   const [selectedYAxisId, setSelectedYAxisId] = useState(null);

//   useEffect(() => {
//     const savedCharts = localStorage.getItem('customCharts');
//     if (savedCharts) {
//       setCharts(JSON.parse(savedCharts));
//     }
//   }, []);

//   useEffect(() => {
//     if (websocketData) {
//       setCharts((prevCharts) =>
//         prevCharts.map((chart) => {
//           const newData = { id: Date.now(), ...websocketData };

//           if (chart.type === "Line" || chart.type === "Scatter" || chart.type === "XY") {
//             // For Line, Scatter, and XY charts, append the new data and keep previous data
//             const updatedData = [...(chart.data || []), newData].slice(-MAX_DATA_POINTS);
//             return { ...chart, data: updatedData };
//           } else {
//             // For other chart types, only keep the latest data point
//             return { ...chart, data: [newData] };
//           }
//         })
//       );
//     }
//   }, [websocketData]);

//   const addCustomChart = (type) => {
//     const newChartId = Date.now();
//     const newChart = {
//       id: newChartId,
//       type,
//       data: [],
//       xAxisDataKey: '',
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
//     const updatedCharts = charts.map((chart) =>
//       chart.id === tempChartData.id ? tempChartData : chart
//     );
//     setCharts(updatedCharts);
//     setDialogOpen(false);

//     const chartConfigurations = updatedCharts.map(chart => ({
//       id: chart.id,
//       type: chart.type,
//       xAxisDataKey: chart.xAxisDataKey,
//       yAxisDataKeys: chart.yAxisDataKeys,
//     }));

//     localStorage.setItem('customCharts', JSON.stringify(chartConfigurations));
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

//   const deleteChart = (chartId) => {
//     const updatedCharts = charts.filter((chart) => chart.id !== chartId);
//     setCharts(updatedCharts);

//     const chartConfigurations = updatedCharts.map(chart => ({
//       id: chart.id,
//       type: chart.type,
//       xAxisDataKey: chart.xAxisDataKey,
//       yAxisDataKeys: chart.yAxisDataKeys,
//     }));

//     localStorage.setItem('customCharts', JSON.stringify(chartConfigurations));
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
//       case 'solid':
//         return '';
//       case 'dotted':
//         return '1 1';
//       case 'dashed':
//         return '5 5';
//       case 'dot-dash':
//         return '3 3 1 3';
//       case 'dash-dot-dot':
//         return '3 3 1 1 1 3';
//       default:
//         return '';
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
//     <ResponsiveContainer width="100%" height={400}>
//       <LineChart data={chart.data}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey="time" />
//         {chart.yAxisDataKeys.map((yAxis) => (
//           <YAxis
//             key={yAxis.id}
//             yAxisId={yAxis.id}
//             domain={getYAxisDomain(yAxis.range)}
//             stroke={yAxis.color}
//           />
//         ))}
//         <Tooltip />
//         <Legend />
//         {chart.yAxisDataKeys.map((yAxis) =>
//           yAxis.dataKeys.map((key) => (
//             <Line
//               key={key}
//               type="monotone"
//               dataKey={key}
//               stroke={yAxis.color}
//               strokeDasharray={getLineStyle(yAxis.lineStyle)}
//               yAxisId={yAxis.id}
//               connectNulls={true}  // Ensures continuous plotting
//             />
//           ))
//         )}
//       </LineChart>
//     </ResponsiveContainer>
//   );

//   const renderBarChart = (chart) => (
//     <ResponsiveContainer width="100%" height={400}>
//       <BarChart data={chart.data}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey="time" />
//         {chart.yAxisDataKeys.map((yAxis) => (
//           <YAxis
//             key={yAxis.id}
//             yAxisId={yAxis.id}
//             domain={getYAxisDomain(yAxis.range)}
//             stroke={yAxis.color}
//           />
//         ))}
//         <Tooltip />
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
//   );

//   const renderScatterChart = (chart) => (
//     <ResponsiveContainer width="100%" height={400}>
//       <ScatterChart data={chart.data}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey="time" />
//         {chart.yAxisDataKeys.map((yAxis) => (
//           <YAxis
//             key={yAxis.id}
//             yAxisId={yAxis.id}
//             domain={getYAxisDomain(yAxis.range)}
//             stroke={yAxis.color}
//           />
//         ))}
//         <Tooltip />
//         <Legend />
//         {chart.yAxisDataKeys.map((yAxis) =>
//           yAxis.dataKeys.map((key) => (
//             <Scatter
//               key={key}
//               dataKey={key}
//               fill={yAxis.color}
//               yAxisId={yAxis.id}
//               line
//             />
//           ))
//         )}
//       </ScatterChart>
//     </ResponsiveContainer>
//   );

//   const renderXYChart = (chart) => (
//     <ResponsiveContainer width="100%" height={400}>
//       <ScatterChart data={chart.data}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey={chart.xAxisDataKey} type="number" />
//         {chart.yAxisDataKeys.map((yAxis) => (
//           <YAxis
//             key={yAxis.id}
//             yAxisId={yAxis.id}
//             domain={['auto', 'auto']}
//             stroke={yAxis.color}
//           />
//         ))}
//         <Tooltip />
//         <Legend />
//         {chart.yAxisDataKeys.map((yAxis) =>
//           yAxis.dataKeys.map((key) => (
//             <Scatter
//               key={key}
//               dataKey={key}
//               fill={yAxis.color}
//               yAxisId={yAxis.id}
//               line
//             />
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
//       <ResponsiveContainer width="100%" height={500}>
//         <PieChart>
//           <Pie
//             data={pieData}
//             dataKey="value"
//             nameKey="name"
//             outerRadius={150}
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
//     <Container>
//       <h1>Real-Time Data</h1>
//       <h1>Last timestamp Data: {websocketData["PLC-TIME-STAMP"]}</h1>
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
//             <Button variant="contained" onClick={() => addCustomChart('Bar')}>Add Bar Chart</Button>
//             <Button variant="contained" onClick={() => addCustomChart('Scatter')}>Add Scatter Chart</Button>
//             <Button variant="contained" onClick={() => addCustomChart('XY')}>Add XY Chart</Button>
//             <Button variant="contained" onClick={() => addCustomChart('Pie')}>Add Pie Chart</Button>
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
//             <Button variant="outlined" color="primary" onClick={() => openDialog(chart)}>
//               Configure Chart
//             </Button>
//           </Box>
//         </Box>
//       ))}

//       {tempChartData && (
//         <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
//           <DialogTitle>Configure Chart</DialogTitle>
//           <DialogContent>
//             <Box display="flex" flexDirection="column" maxHeight="400px" overflow="auto">
//               {tempChartData.type === 'XY' && (
//                 <Box marginBottom={2}>
//                   <Typography variant="h6">X-Axis</Typography>
//                   <FormControl fullWidth margin="normal">
//                     <InputLabel>X-Axis Data Key</InputLabel>
//                     <Select
//                       value={tempChartData.xAxisDataKey}
//                       onChange={handleXAxisDataKeyChange}
//                     >
//                       <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//                       <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
//                       <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
//                       <MenuItem value="CR-PT-001">CR-PT-001</MenuItem>
//                       <MenuItem value="CR-PT-021">CR-PT-021</MenuItem>
//                       <MenuItem value="GS-PT-021">GS-PT-021</MenuItem>
//                     </Select>
//                   </FormControl>
//                 </Box>
//               )}
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
//                       <MenuItem value="CR-PT-001">CR-PT-001</MenuItem>
//                       <MenuItem value="CR-PT-021">CR-PT-021</MenuItem>
//                       <MenuItem value="GS-PT-021">GS-PT-021</MenuItem>
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
//                       <MenuItem value="dot-dash">Dot Dash</MenuItem>
//                       <MenuItem value="dash-dot-dot">Dash Dot Dot</MenuItem>
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
//     </Container>
//   );
// };

// export default CustomCharts;

// import React, { useState, useEffect } from "react";
// import {
//   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, BarChart, Bar,
//   PieChart, Pie, Cell
// } from "recharts";
// import {
//   Container, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
//   FormControl, InputLabel, Select, MenuItem, Typography, IconButton
// } from "@mui/material";
// import DeleteIcon from '@mui/icons-material/Delete';
// import { SketchPicker } from 'react-color';
// import { useWebSocket } from "src/WebSocketProvider";

// const MAX_DATA_POINTS = 1;

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// const CustomCharts = () => {
//   const websocketData = useWebSocket();
//   const [charts, setCharts] = useState([]);
//   const [chartDialogOpen, setChartDialogOpen] = useState(false);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [tempChartData, setTempChartData] = useState(null);
//   const [colorPickerOpen, setColorPickerOpen] = useState(false);
//   const [selectedYAxisId, setSelectedYAxisId] = useState(null);

//   const data = useWebSocket();

//   useEffect(() => {
//     const savedCharts = localStorage.getItem('customCharts');
//     if (savedCharts) {
//       setCharts(JSON.parse(savedCharts));
//     }
//   }, []);

//   useEffect(() => {
//     if (websocketData) {
//       setCharts((prevCharts) =>
//         prevCharts.map((chart) => {
//           const newData = { id: Date.now(), ...websocketData };
//           let updatedData;

//           if (chart.type === "Bar") {
//             updatedData = [...(chart.data || []), newData].slice(-MAX_DATA_POINTS);
//           } else {
//             updatedData = [...(chart.data || []), newData];
//           }

//           return {
//             ...chart,
//             data: updatedData,
//           };
//         })
//       );
//     }
//   }, [websocketData]);

//   const addCustomChart = (type) => {
//     const newChartId = Date.now();
//     const newChart = {
//       id: newChartId,
//       type,
//       data: [],
//       xAxisDataKey: '',
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
//     const updatedCharts = charts.map((chart) =>
//       chart.id === tempChartData.id ? tempChartData : chart
//     );

//     setCharts(updatedCharts);
//     setDialogOpen(false);

//     // Save only chart configurations (excluding data points) to localStorage
//     const chartConfigurations = updatedCharts.map(chart => ({
//       id: chart.id,
//       type: chart.type,
//       xAxisDataKey: chart.xAxisDataKey,
//       yAxisDataKeys: chart.yAxisDataKeys,
//     }));

//     localStorage.setItem('customCharts', JSON.stringify(chartConfigurations));
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

//   const deleteChart = (chartId) => {
//     const updatedCharts = charts.filter((chart) => chart.id !== chartId);
//     setCharts(updatedCharts);

//     // Update localStorage after deleting a chart
//     const chartConfigurations = updatedCharts.map(chart => ({
//       id: chart.id,
//       type: chart.type,
//       xAxisDataKey: chart.xAxisDataKey,
//       yAxisDataKeys: chart.yAxisDataKeys,
//     }));

//     localStorage.setItem('customCharts', JSON.stringify(chartConfigurations));
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
//     <ResponsiveContainer width="100%" height={400}>
//       <LineChart data={chart.data}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey="time" />
//         {chart.yAxisDataKeys.map((yAxis) => (
//           <YAxis
//             key={yAxis.id}
//             yAxisId={yAxis.id}
//             domain={[0, 500]}
//             stroke={yAxis.color}
//           />
//         ))}
//         <Tooltip />
//         <Legend />
//         {chart.yAxisDataKeys.map((yAxis) =>
//           yAxis.dataKeys.map((key) => (
//             <Line
//               key={key}
//               type="monotone"
//               dataKey={key}
//               stroke={yAxis.color}
//               yAxisId={yAxis.id}
//             />
//           ))
//         )}
//       </LineChart>
//     </ResponsiveContainer>
//   );

//   const renderBarChart = (chart) => (
//     <ResponsiveContainer width="100%" height={400}>
//       <BarChart data={chart.data}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey="time" />
//         {chart.yAxisDataKeys.map((yAxis) => (
//           <YAxis
//             key={yAxis.id}
//             yAxisId={yAxis.id}
//             domain={[0, 500]}
//             stroke={yAxis.color}
//           />
//         ))}
//         <Tooltip />
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
//   );

//   const renderScatterChart = (chart) => (
//     <ResponsiveContainer width="100%" height={400}>
//       <ScatterChart data={chart.data}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey="time" />
//         {chart.yAxisDataKeys.map((yAxis) => (
//           <YAxis
//             key={yAxis.id}
//             yAxisId={yAxis.id}
//             domain={[0, 500]}
//             stroke={yAxis.color}
//           />
//         ))}
//         <Tooltip />
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
//     <ResponsiveContainer width="100%" height={400}>
//       <ScatterChart data={chart.data}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey={chart.xAxisDataKey} type="number" />
//         {chart.yAxisDataKeys.map((yAxis) => (
//           <YAxis
//             key={yAxis.id}
//             yAxisId={yAxis.id}
//             domain={['auto', 'auto']}
//             stroke={yAxis.color}
//           />
//         ))}
//         <Tooltip />
//         <Legend />
//         {chart.yAxisDataKeys.map((yAxis) =>
//           yAxis.dataKeys.map((key) => (
//             <Scatter
//               key={key}
//               dataKey={key}
//               fill={yAxis.color}
//               yAxisId={yAxis.id}
//               line
//             />
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
//       <ResponsiveContainer width="100%" height={500}>
//         <PieChart>
//           <Pie
//             data={pieData}
//             dataKey="value"
//             nameKey="name"
//             outerRadius={150}
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
//     <Container>
//     <h1>Real-Time Data</h1>
//     <h1>Last timestamp Data: {data["PLC-TIME-STAMP"]}</h1>
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
//             <Button variant="contained" onClick={() => addCustomChart('Bar')}>Add Bar Chart</Button>
//             <Button variant="contained" onClick={() => addCustomChart('Scatter')}>Add Scatter Chart</Button>
//             <Button variant="contained" onClick={() => addCustomChart('XY')}>Add XY Chart</Button>
//             <Button variant="contained" onClick={() => addCustomChart('Pie')}>Add Pie Chart</Button>
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
//             <Button variant="outlined" color="primary" onClick={() => openDialog(chart)}>
//               Configure Chart
//             </Button>
//           </Box>
//         </Box>
//       ))}

//       {tempChartData && (
//         <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
//           <DialogTitle>Configure Chart</DialogTitle>
//           <DialogContent>
//             <Box display="flex" flexDirection="column" maxHeight="400px" overflow="auto">
//               {tempChartData.type === 'XY' && (
//                 <Box marginBottom={2}>
//                   <Typography variant="h6">X-Axis</Typography>
//                   <FormControl fullWidth margin="normal">
//                     <InputLabel>X-Axis Data Key</InputLabel>
//                     <Select
//                       value={tempChartData.xAxisDataKey}
//                       onChange={handleXAxisDataKeyChange}
//                     >
//                       <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//                       <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
//                       <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
//                       <MenuItem value="CR-PT-001">CR-PT-001</MenuItem>
//                       <MenuItem value="CR-PT-021">CR-PT-021</MenuItem>
//                       <MenuItem value="GS-PT-021">GS-PT-021</MenuItem>
//                     </Select>
//                   </FormControl>
//                 </Box>
//               )}
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
//                       <MenuItem value="CR-PT-001">CR-PT-001</MenuItem>
//                       <MenuItem value="CR-PT-021">CR-PT-021</MenuItem>
//                       <MenuItem value="GS-PT-021">GS-PT-021</MenuItem>
//                     </Select>
//                   </FormControl>
//                   <FormControl fullWidth margin="normal">
//                   <InputLabel>Range</InputLabel>
//                   <Select
//                     value={yAxis.range}
//                     onChange={(event) => handleRangeChange(yAxis.id, event)}
//                   >
//                     <MenuItem value="0-500">0-500</MenuItem>
//                     <MenuItem value="0-100">0-100</MenuItem>
//                     <MenuItem value="0-10">0-10</MenuItem>
//                   </Select>
//                 </FormControl>
//                   <FormControl fullWidth margin="normal">
//                     <InputLabel>Line Style</InputLabel>
//                     <Select
//                       value={yAxis.lineStyle}
//                       onChange={(event) => handleLineStyleChange(yAxis.id, event)}
//                     >
//                       <MenuItem value="solid">Solid</MenuItem>
//                       <MenuItem value="dotted">Dotted</MenuItem>
//                       <MenuItem value="dashed">Dashed</MenuItem>
//                       <MenuItem value="dot-dash">Dot Dash</MenuItem>
//                       <MenuItem value="dash-dot-dot">Dash Dot Dot</MenuItem>
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
//     </Container>
//   );
// };

// export default CustomCharts;

// import React, { useState, useEffect } from "react";
// import {
//   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, BarChart, Bar,
//   PieChart, Pie, Cell
// } from "recharts";
// import {
//   Container, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
//   FormControl, InputLabel, Select, MenuItem, Typography, IconButton
// } from "@mui/material";
// import DeleteIcon from '@mui/icons-material/Delete';
// import { SketchPicker } from 'react-color';
// import { useWebSocket } from "src/WebSocketProvider";

// const MAX_DATA_POINTS = 1;

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// const CustomCharts = () => {
//   const websocketData = useWebSocket();
//   const [charts, setCharts] = useState([]);
//   const [chartDialogOpen, setChartDialogOpen] = useState(false);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [tempChartData, setTempChartData] = useState(null);
//   const [colorPickerOpen, setColorPickerOpen] = useState(false);
//   const [selectedYAxisId, setSelectedYAxisId] = useState(null);

//   const data = useWebSocket();

//   useEffect(() => {
//     if (websocketData) {
//       setCharts((prevCharts) =>
//         prevCharts.map((chart) => {
//           const newData = { id: Date.now(), ...websocketData };
//           let updatedData;

//           if (chart.type === "Bar") {
//             updatedData = [...(chart.data || []), newData].slice(-MAX_DATA_POINTS);
//           } else {
//             updatedData = [...(chart.data || []), newData];
//           }

//           return {
//             ...chart,
//             data: updatedData,
//           };
//         })
//       );
//     }
//   }, [websocketData]);

//   const addCustomChart = (type) => {
//     const newChartId = Date.now();
//     const newChart = {
//       id: newChartId,
//       type,
//       data: [],
//       xAxisDataKey: '',
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
//     <ResponsiveContainer width="100%" height={400}>
//       <LineChart data={chart.data}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey="time" />
//         {chart.yAxisDataKeys.map((yAxis) => (
//           <YAxis
//             key={yAxis.id}
//             yAxisId={yAxis.id}
//             domain={[0, 500]}
//             stroke={yAxis.color}
//           />
//         ))}
//         <Tooltip />
//         <Legend />
//         {chart.yAxisDataKeys.map((yAxis) =>
//           yAxis.dataKeys.map((key) => (
//             <Line
//               key={key}
//               type="monotone"
//               dataKey={key}
//               stroke={yAxis.color}
//               yAxisId={yAxis.id}
//             />
//           ))
//         )}
//       </LineChart>
//     </ResponsiveContainer>
//   );

//   const renderBarChart = (chart) => (
//     <ResponsiveContainer width="100%" height={400}>
//       <BarChart data={chart.data}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey="time" />
//         {chart.yAxisDataKeys.map((yAxis) => (
//           <YAxis
//             key={yAxis.id}
//             yAxisId={yAxis.id}
//             domain={[0, 500]}
//             stroke={yAxis.color}
//           />
//         ))}
//         <Tooltip />
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
//   );

//   const renderScatterChart = (chart) => (
//     <ResponsiveContainer width="100%" height={400}>
//       <ScatterChart data={chart.data}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey="time" />
//         {chart.yAxisDataKeys.map((yAxis) => (
//           <YAxis
//             key={yAxis.id}
//             yAxisId={yAxis.id}
//             domain={[0, 500]}
//             stroke={yAxis.color}
//           />
//         ))}
//         <Tooltip />
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
//     <ResponsiveContainer width="100%" height={400}>
//       <ScatterChart data={chart.data}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey={chart.xAxisDataKey} type="number" />
//         {chart.yAxisDataKeys.map((yAxis) => (
//           <YAxis
//             key={yAxis.id}
//             yAxisId={yAxis.id}
//             domain={['auto', 'auto']}
//             stroke={yAxis.color}
//           />
//         ))}
//         <Tooltip />
//         <Legend />
//         {chart.yAxisDataKeys.map((yAxis) =>
//           yAxis.dataKeys.map((key) => (
//             <Scatter
//               key={key}
//               dataKey={key}
//               fill={yAxis.color}
//               yAxisId={yAxis.id}
//               line
//             />
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
//       <ResponsiveContainer width="100%" height={500}>
//         <PieChart>
//           <Pie
//             data={pieData}
//             dataKey="value"
//             nameKey="name"
//             outerRadius={150}
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
//     <Container>
//     <h1>Real-Time Data</h1>
//     <h1>Last timestamp Data: {data["PLC-TIME-STAMP"]}</h1>
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
//             <Button variant="contained" onClick={() => addCustomChart('Bar')}>Add Bar Chart</Button>
//             <Button variant="contained" onClick={() => addCustomChart('Scatter')}>Add Scatter Chart</Button>
//             <Button variant="contained" onClick={() => addCustomChart('XY')}>Add XY Chart</Button>
//             <Button variant="contained" onClick={() => addCustomChart('Pie')}>Add Pie Chart</Button>
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
//             <Button variant="outlined" color="primary" onClick={() => openDialog(chart)}>
//               Configure Chart
//             </Button>
//           </Box>
//         </Box>
//       ))}

//       {tempChartData && (
//         <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
//           <DialogTitle>Configure Chart</DialogTitle>
//           <DialogContent>
//             <Box display="flex" flexDirection="column" maxHeight="400px" overflow="auto">
//               {tempChartData.type === 'XY' && (
//                 <Box marginBottom={2}>
//                   <Typography variant="h6">X-Axis</Typography>
//                   <FormControl fullWidth margin="normal">
//                     <InputLabel>X-Axis Data Key</InputLabel>
//                     <Select
//                       value={tempChartData.xAxisDataKey}
//                       onChange={handleXAxisDataKeyChange}
//                     >
//                       <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//                       <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
//                       <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
//                       <MenuItem value="CR-PT-001">CR-PT-001</MenuItem>
//                       <MenuItem value="CR-PT-021">CR-PT-021</MenuItem>
//                       <MenuItem value="GS-PT-021">GS-PT-021</MenuItem>
//                     </Select>
//                   </FormControl>
//                 </Box>
//               )}
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
//                       <MenuItem value="CR-PT-001">CR-PT-001</MenuItem>
//                       <MenuItem value="CR-PT-021">CR-PT-021</MenuItem>
//                       <MenuItem value="GS-PT-021">GS-PT-021</MenuItem>
//                     </Select>
//                   </FormControl>
//                   <FormControl fullWidth margin="normal">
//                   <InputLabel>Range</InputLabel>
//                   <Select
//                     value={yAxis.range}
//                     onChange={(event) => handleRangeChange(yAxis.id, event)}
//                   >
//                     <MenuItem value="0-500">0-500</MenuItem>
//                     <MenuItem value="0-100">0-100</MenuItem>
//                     <MenuItem value="0-10">0-10</MenuItem>
//                   </Select>
//                 </FormControl>
//                   <FormControl fullWidth margin="normal">
//                     <InputLabel>Line Style</InputLabel>
//                     <Select
//                       value={yAxis.lineStyle}
//                       onChange={(event) => handleLineStyleChange(yAxis.id, event)}
//                     >
//                       <MenuItem value="solid">Solid</MenuItem>
//                       <MenuItem value="dotted">Dotted</MenuItem>
//                       <MenuItem value="dashed">Dashed</MenuItem>
//                       <MenuItem value="dot-dash">Dot Dash</MenuItem>
//                       <MenuItem value="dash-dot-dot">Dash Dot Dot</MenuItem>
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
//     </Container>
//   );
// };

// export default CustomCharts;

// import React, { useState, useEffect } from "react";
// import {
//   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, BarChart, Bar,
//   PieChart,
//   Pie
// } from "recharts";
// import {
//   Container, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
//   FormControl, InputLabel, Select, MenuItem, Typography, IconButton
// } from "@mui/material";
// import DeleteIcon from '@mui/icons-material/Delete';
// import { SketchPicker } from 'react-color';
// import { useWebSocket } from "src/WebSocketProvider";

// const MAX_DATA_POINTS = 1;

// const CustomCharts = () => {
//   const websocketData = useWebSocket();
//   const [charts, setCharts] = useState([]);
//   const [chartData, setChartData] = useState({});
//   const [chartDialogOpen, setChartDialogOpen] = useState(false);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [tempChartData, setTempChartData] = useState(null);
//   const [colorPickerOpen, setColorPickerOpen] = useState(false);
//   const [selectedYAxisId, setSelectedYAxisId] = useState(null);

//   useEffect(() => {
//     if (websocketData) {
//       setCharts((prevCharts) =>
//         prevCharts.map((chart) => {
//           const newData = { id: Date.now(), ...websocketData };
//           let updatedData;

//           // Only limit data points for Bar charts
//           if (chart.type === "Bar") {
//             updatedData = [...(chart.data || []), newData].slice(-MAX_DATA_POINTS);
//           } else {
//             updatedData = [...(chart.data || []), newData];
//           }

//           return {
//             ...chart,
//             data: updatedData,
//           };
//         })
//       );
//     }
//   }, [websocketData]);

//   const addCustomChart = (type) => {
//     const newChartId = Date.now();
//     const newChart = {
//       id: newChartId,
//       type,
//       data: [],
//       xAxisDataKey: '', // For XY Chart to store selected X-Axis data key
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
//     switch (chart.type) {
//       case "Line":
//         return (
//           <ResponsiveContainer width="100%" height={400}>
//             <LineChart data={chart.data}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="time" />
//               {chart.yAxisDataKeys.map((yAxis) => (
//                 <YAxis
//                   key={yAxis.id}
//                   yAxisId={yAxis.id}
//                   domain={getYAxisDomain(yAxis.range)}
//                   stroke={yAxis.color}
//                 />
//               ))}
//               <Tooltip />
//               <Legend />
//               {chart.yAxisDataKeys.map((yAxis) =>
//                 yAxis.dataKeys.map((key) => (
//                   <Line
//                     key={key}
//                     type="monotone"
//                     dataKey={key}
//                     stroke={yAxis.color}
//                     strokeDasharray={
//                       yAxis.lineStyle === 'solid'
//                         ? ''
//                         : yAxis.lineStyle === 'dotted'
//                         ? '1 1'
//                         : yAxis.lineStyle === 'dashed'
//                         ? '5 5'
//                         : yAxis.lineStyle === 'dot-dash'
//                         ? '3 3 1 3'
//                         : '3 3 1 1 1 3'
//                     }
//                     yAxisId={yAxis.id}
//                   />
//                 ))
//               )}
//             </LineChart>
//           </ResponsiveContainer>
//         );
//       case "Bar":
//         return (
//           <ResponsiveContainer width="100%" height={400}>
//             <BarChart data={chart.data}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="time" />
//               {chart.yAxisDataKeys.map((yAxis) => (
//                 <YAxis
//                   key={yAxis.id}
//                   yAxisId={yAxis.id}
//                   domain={getYAxisDomain(yAxis.range)}
//                   stroke={yAxis.color}
//                 />
//               ))}
//               <Tooltip />
//               <Legend />
//               {chart.yAxisDataKeys.map((yAxis) =>
//                 yAxis.dataKeys.map((key) => (
//                   <Bar
//                     key={key}
//                     dataKey={key}
//                     fill={yAxis.color}
//                     yAxisId={yAxis.id}
//                   />
//                 ))
//               )}
//             </BarChart>
//           </ResponsiveContainer>
//         );
//       case "Scatter":
//         return (
//           <ResponsiveContainer width="100%" height={400}>
//             <ScatterChart data={chart.data}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="time" />
//               {chart.yAxisDataKeys.map((yAxis) => (
//                 <YAxis
//                   key={yAxis.id}
//                   yAxisId={yAxis.id}
//                   domain={getYAxisDomain(yAxis.range)}
//                   stroke={yAxis.color}
//                 />
//               ))}
//               <Tooltip />
//               <Legend />
//               {chart.yAxisDataKeys.map((yAxis) =>
//                 yAxis.dataKeys.map((key) => (
//                   <Scatter
//                     key={key}
//                     name={key}
//                     dataKey={key}
//                     stroke={yAxis.color}
//                     fill={yAxis.color}
//                     strokeDasharray={
//                       yAxis.lineStyle === 'solid'
//                         ? ''
//                         : yAxis.lineStyle === 'dotted'
//                         ? '1 1'
//                         : yAxis.lineStyle === 'dashed'
//                         ? '5 5'
//                         : yAxis.lineStyle === 'dot-dash'
//                         ? '3 3 1 3'
//                         : '3 3 1 1 1 3'
//                     }
//                     yAxisId={yAxis.id}
//                   />
//                 ))
//               )}
//             </ScatterChart>
//           </ResponsiveContainer>
//         );
//       case "XY":
//         return (
//            <ResponsiveContainer width="100%" height={400}>
//           <ScatterChart>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey={chart.xAxisDataKey} type="number" />
//             <YAxis dataKey={chart.yAxisDataKeys[0].dataKeys[0]} type="number" />
//             <Tooltip cursor={{ strokeDasharray: "3 3" }} />
//             <Legend />
//             <Scatter
//               name={`${chart.xAxisDataKey} vs ${chart.yAxisDataKeys[0].dataKeys[0]}`}
//               data={chart.data.slice(-10).map(item => ({
//                 [chart.xAxisDataKey]: item[chart.xAxisDataKey],
//                 [chart.yAxisDataKeys[0].dataKeys[0]]: item[chart.yAxisDataKeys[0].dataKeys[0]],
//               }))}
//               fill={chart.yAxisDataKeys[0].color}
//             />
//           </ScatterChart>
//         </ResponsiveContainer>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
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
//             <Button variant="contained" onClick={() => addCustomChart('Bar')}>Add Bar Chart</Button>
//             <Button variant="contained" onClick={() => addCustomChart('Scatter')}>Add Scatter Chart</Button>
//             <Button variant="contained" onClick={() => addCustomChart('XY')}>Add XY Chart</Button>
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
//             <Button variant="outlined" color="primary" onClick={() => openDialog(chart)}>
//               Configure Chart
//             </Button>
//           </Box>
//         </Box>
//       ))}

//       {tempChartData && (
//         <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
//           <DialogTitle>Configure Chart</DialogTitle>
//           <DialogContent>
//             <Box display="flex" flexDirection="column" maxHeight="400px" overflow="auto">
//               {tempChartData.type === 'XY' && (
//                 <Box marginBottom={2}>
//                   <Typography variant="h6">X-Axis</Typography>
//                   <FormControl fullWidth margin="normal">
//                     <InputLabel>X-Axis Data Key</InputLabel>
//                     <Select
//                       value={tempChartData.xAxisDataKey}
//                       onChange={handleXAxisDataKeyChange}
//                     >
//                       <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//                       <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
//                       <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
//                       <MenuItem value="CR-PT-021">CR-PT-021</MenuItem>
//                       <MenuItem value="GS-PT-021">GS-PT-021</MenuItem>
//                       <MenuItem value="GS-PT-021">GS-PT-021</MenuItem>
//                     </Select>
//                   </FormControl>
//                 </Box>
//               )}
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
//                       <MenuItem value="CR-PT-021">CR-PT-021</MenuItem>
//                       <MenuItem value="GS-PT-021">GS-PT-021</MenuItem>

//                     </Select>
//                   </FormControl>
//                   <FormControl fullWidth margin="normal">
//                   <InputLabel>Range</InputLabel>
//                   <Select
//                     value={yAxis.range}
//                     onChange={(event) => handleRangeChange(yAxis.id, event)}
//                   >
//                     <MenuItem value="0-500">0-500</MenuItem>
//                     <MenuItem value="0-100">0-100</MenuItem>
//                     <MenuItem value="0-10">0-10</MenuItem>
//                   </Select>
//                 </FormControl>

//                   <FormControl fullWidth margin="normal">
//                     <InputLabel>Line Style</InputLabel>
//                     <Select
//                       value={yAxis.lineStyle}
//                       onChange={(event) => handleLineStyleChange(yAxis.id, event)}
//                     >
//                       <MenuItem value="solid">Solid</MenuItem>
//                       <MenuItem value="dotted">Dotted</MenuItem>
//                       <MenuItem value="dashed">Dashed</MenuItem>
//                       <MenuItem value="dot-dash">Dot Dash</MenuItem>
//                       <MenuItem value="dash-dot-dot">Dash Dot Dot</MenuItem>
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
//     </Container>
//   );
// };

// export default CustomCharts;

// import React, { useState, useEffect } from "react";
// import {
//   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, BarChart, Bar
// } from "recharts";
// import {
//   Container, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
//   FormControl, InputLabel, Select, MenuItem, Typography, IconButton
// } from "@mui/material";
// import DeleteIcon from '@mui/icons-material/Delete';
// import { SketchPicker } from 'react-color';
// import { useWebSocket } from "src/WebSocketProvider";

// const MAX_DATA_POINTS = 1;

// const CustomCharts = () => {
//   const websocketData = useWebSocket();
//   const [charts, setCharts] = useState([]);
//   const [chartData, setChartData] = useState({});
//   const [chartDialogOpen, setChartDialogOpen] = useState(false);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [tempChartData, setTempChartData] = useState(null);
//   const [colorPickerOpen, setColorPickerOpen] = useState(false);
//   const [selectedYAxisId, setSelectedYAxisId] = useState(null);

//   useEffect(() => {
//     if (websocketData) {
//       setCharts((prevCharts) =>
//         prevCharts.map((chart) => {
//           const newData = { id: Date.now(), ...websocketData };
//           let updatedData;

//           // Only limit data points for Bar charts
//           if (chart.type === "Bar") {
//             updatedData = [...(chart.data || []), newData].slice(-MAX_DATA_POINTS);
//           } else {
//             updatedData = [...(chart.data || []), newData];
//           }

//           return {
//             ...chart,
//             data: updatedData,
//           };
//         })
//       );
//     }
//   }, [websocketData]);

//   const addCustomChart = (type) => {
//     const newChartId = Date.now();
//     const newChart = {
//       id: newChartId,
//       type,
//       data: [], // Start with an empty data array
//       xAxisDataKey: 'AX-LT-011',  // Ensure it starts with a valid default key
//       yAxisDataKey: 'AX-LT-011',  // Ensure it starts with a valid default key
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

//   const handleXAxisDataKeyChange = (event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       xAxisDataKey: value,
//     }));
//   };

//   const handleYAxisDataKeyChange = (event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKey: value,
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
//     switch (chart.type) {
//       case "Line":
//         return (
//           <ResponsiveContainer width="100%" height={400}>
//             <LineChart data={chart.data}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="time" />
//               {chart.yAxisDataKeys.map((yAxis) => (
//                 <YAxis
//                   key={yAxis.id}
//                   yAxisId={yAxis.id}
//                   domain={getYAxisDomain(yAxis.range)}
//                   stroke={yAxis.color}
//                 />
//               ))}
//               <Tooltip />
//               <Legend />
//               {chart.yAxisDataKeys.map((yAxis) =>
//                 yAxis.dataKeys.map((key) => (
//                   <Line
//                     key={key}
//                     type="monotone"
//                     dataKey={key}
//                     stroke={yAxis.color}
//                     strokeDasharray={
//                       yAxis.lineStyle === 'solid'
//                         ? ''
//                         : yAxis.lineStyle === 'dotted'
//                         ? '1 1'
//                         : yAxis.lineStyle === 'dashed'
//                         ? '5 5'
//                         : yAxis.lineStyle === 'dot-dash'
//                         ? '3 3 1 3'
//                         : '3 3 1 1 1 3'
//                     }
//                     yAxisId={yAxis.id}
//                   />
//                 ))
//               )}
//             </LineChart>
//           </ResponsiveContainer>
//         );
//       case "Bar":
//         return (
//           <ResponsiveContainer width="100%" height={400}>
//             <BarChart data={chart.data}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="time" />
//               {chart.yAxisDataKeys.map((yAxis) => (
//                 <YAxis
//                   key={yAxis.id}
//                   yAxisId={yAxis.id}
//                   domain={getYAxisDomain(yAxis.range)}
//                   stroke={yAxis.color}
//                 />
//               ))}
//               <Tooltip />
//               <Legend />
//               {chart.yAxisDataKeys.map((yAxis) =>
//                 yAxis.dataKeys.map((key) => (
//                   <Bar
//                     key={key}
//                     dataKey={key}
//                     fill={yAxis.color}
//                     yAxisId={yAxis.id}
//                   />
//                 ))
//               )}
//             </BarChart>
//           </ResponsiveContainer>
//         );
//       case "Scatter":
//         return (
//           <ResponsiveContainer width="100%" height={400}>
//             <ScatterChart data={chart.data}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="time" />
//               {chart.yAxisDataKeys.map((yAxis) => (
//                 <YAxis
//                   key={yAxis.id}
//                   yAxisId={yAxis.id}
//                   domain={getYAxisDomain(yAxis.range)}
//                   stroke={yAxis.color}
//                 />
//               ))}
//               <Tooltip />
//               <Legend />
//               {chart.yAxisDataKeys.map((yAxis) =>
//                 yAxis.dataKeys.map((key) => (
//                   <Scatter
//                     key={key}
//                     name={key}
//                     dataKey={key}
//                     stroke={yAxis.color}
//                     fill={yAxis.color}
//                     strokeDasharray={
//                       yAxis.lineStyle === 'solid'
//                         ? ''
//                         : yAxis.lineStyle === 'dotted'
//                         ? '1 1'
//                         : yAxis.lineStyle === 'dashed'
//                         ? '5 5'
//                         : yAxis.lineStyle === 'dot-dash'
//                         ? '3 3 1 3'
//                         : '3 3 1 1 1 3'
//                     }
//                     yAxisId={yAxis.id}
//                   />
//                 ))
//               )}
//             </ScatterChart>
//           </ResponsiveContainer>
//         );
//       case "ScatterXY":
//         return (
//           <ResponsiveContainer width="100%" height={400}>
//   <ScatterChart data={chart.data}>
//     <CartesianGrid strokeDasharray="3 3" />
//     <XAxis dataKey={chart.xAxisDataKey} />
//     {chart.yAxisDataKeys.map((yAxis) => (
//       <YAxis
//         key={yAxis.id}
//         yAxisId={yAxis.id}
//         domain={getYAxisDomain(yAxis.range)}
//         stroke={yAxis.color}
//       />
//     ))}
//     <Tooltip />
//     <Legend />
//     <Scatter
//       name="XY Plot"
//       data={chart.data}
//       fill={chart.yAxisDataKeys[0].color}
//       line={{ stroke: chart.yAxisDataKeys[0].color }}
//     />
//   </ScatterChart>
// </ResponsiveContainer>

//         );
//       default:
//         return null;
//     }
//   };

//   return (
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
//             <Button variant="contained" onClick={() => addCustomChart('Bar')}>Add Bar Chart</Button>
//             <Button variant="contained" onClick={() => addCustomChart('Scatter')}>Add Scatter Chart</Button>
//             <Button variant="contained" onClick={() => addCustomChart('ScatterXY')}>Add XY Scatter Plot</Button>
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
//             <Button variant="outlined" color="primary" onClick={() => openDialog(chart)}>
//               Configure Chart
//             </Button>
//           </Box>
//         </Box>
//       ))}

//       {tempChartData && (
//         <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
//           <DialogTitle>Configure Chart</DialogTitle>
//           <DialogContent>
//             <Box display="flex" flexDirection="column" maxHeight="400px" overflow="auto">
//               {tempChartData.type === 'ScatterXY' ? (
//                 <>
//                   <FormControl fullWidth margin="normal">
//                     <InputLabel>X-Axis Data Key</InputLabel>
//                     <Select
//                       value={tempChartData.xAxisDataKey}
//                       onChange={handleXAxisDataKeyChange}
//                     >
//                       <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//                       <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
//                       <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
//                       <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
//                     </Select>
//                   </FormControl>
//                   <FormControl fullWidth margin="normal">
//                     <InputLabel>Y-Axis Data Key</InputLabel>
//                     <Select
//                       value={tempChartData.yAxisDataKey}
//                       onChange={handleYAxisDataKeyChange}
//                     >
//                       <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//                       <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
//                       <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
//                       <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
//                     </Select>
//                   </FormControl>
//                 </>
//               ) : (
//                 tempChartData.yAxisDataKeys.map((yAxis, index) => (
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
//                         <MenuItem value="dot-dash">Dot Dash</MenuItem>
//                         <MenuItem value="dash-dot-dot">Dash Dot Dot</MenuItem>
//                       </Select>
//                     </FormControl>
//                     <Button onClick={() => openColorPicker(yAxis.id)}>Select Color</Button>
//                     {colorPickerOpen && selectedYAxisId === yAxis.id && (
//                       <SketchPicker color={yAxis.color} onChangeComplete={handleColorChange} />
//                     )}
//                   </Box>
//                 ))
//               )}
//               {tempChartData.type !== 'ScatterXY' && (
//                 <Button variant="contained" color="secondary" onClick={addYAxis}>
//                   Add Y-Axis
//                 </Button>
//               )}
//             </Box>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={closeDialog} color="secondary">Cancel</Button>
//             <Button onClick={saveConfiguration} color="primary">Save</Button>
//           </DialogActions>
//         </Dialog>
//       )}
//     </Container>
//   );
// };

// export default CustomCharts;

// import React, { useState, useEffect } from "react";
// import {
//   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, BarChart, Bar
// } from "recharts";
// import {
//   Container, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
//   FormControl, InputLabel, Select, MenuItem, Typography, IconButton
// } from "@mui/material";
// import DeleteIcon from '@mui/icons-material/Delete';
// import { SketchPicker } from 'react-color';
// import { useWebSocket } from "src/WebSocketProvider";

// const MAX_DATA_POINTS = 1;  // Set maximum number of data points to display for bar charts

// const CustomCharts = () => {
//   const websocketData = useWebSocket();
//   const [charts, setCharts] = useState([]);
//   const [chartData, setChartData] = useState({});
//   const [chartDialogOpen, setChartDialogOpen] = useState(false);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [tempChartData, setTempChartData] = useState(null);
//   const [colorPickerOpen, setColorPickerOpen] = useState(false);
//   const [selectedYAxisId, setSelectedYAxisId] = useState(null);

//   useEffect(() => {
//     if (websocketData) {
//       setCharts((prevCharts) =>
//         prevCharts.map((chart) => {
//           const newData = { id: Date.now(), ...websocketData };
//           let updatedData;

//           // Only limit data points for Bar charts
//           if (chart.type === "Bar") {
//             updatedData = [...(chart.data || []), newData].slice(-MAX_DATA_POINTS);
//           } else {
//             updatedData = [...(chart.data || []), newData];
//           }

//           return {
//             ...chart,
//             data: updatedData,
//           };
//         })
//       );
//     }
//   }, [websocketData]);

//   const addCustomChart = (type) => {
//     const newChartId = Date.now();
//     const newChart = {
//       id: newChartId,
//       type,
//       data: [], // Start with an empty data array
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
//     switch (chart.type) {
//       case "Line":
//         return (
//           <ResponsiveContainer width="100%" height={400}>
//             <LineChart data={chart.data}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="time" />
//               {chart.yAxisDataKeys.map((yAxis) => (
//                 <YAxis
//                   key={yAxis.id}
//                   yAxisId={yAxis.id}
//                   domain={getYAxisDomain(yAxis.range)}
//                   stroke={yAxis.color}
//                 />
//               ))}
//               <Tooltip />
//               <Legend />
//               {chart.yAxisDataKeys.map((yAxis) =>
//                 yAxis.dataKeys.map((key) => (
//                   <Line
//                     key={key}
//                     type="monotone"
//                     dataKey={key}
//                     stroke={yAxis.color}
//                     strokeDasharray={
//                       yAxis.lineStyle === 'solid'
//                         ? ''
//                         : yAxis.lineStyle === 'dotted'
//                         ? '1 1'
//                         : yAxis.lineStyle === 'dashed'
//                         ? '5 5'
//                         : yAxis.lineStyle === 'dot-dash'
//                         ? '3 3 1 3'
//                         : '3 3 1 1 1 3'
//                     }
//                     yAxisId={yAxis.id}
//                   />
//                 ))
//               )}
//             </LineChart>
//           </ResponsiveContainer>
//         );
//       case "Bar":
//         return (
//           <ResponsiveContainer width="100%" height={400}>
//             <BarChart data={chart.data}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="time" />
//               {chart.yAxisDataKeys.map((yAxis) => (
//                 <YAxis
//                   key={yAxis.id}
//                   yAxisId={yAxis.id}
//                   domain={getYAxisDomain(yAxis.range)}
//                   stroke={yAxis.color}
//                 />
//               ))}
//               <Tooltip />
//               <Legend />
//               {chart.yAxisDataKeys.map((yAxis) =>
//                 yAxis.dataKeys.map((key) => (
//                   <Bar
//                     key={key}
//                     dataKey={key}
//                     fill={yAxis.color}
//                     yAxisId={yAxis.id}
//                   />
//                 ))
//               )}
//             </BarChart>
//           </ResponsiveContainer>
//         );
//       case "Scatter":
//         return (
//           <ResponsiveContainer width="100%" height={400}>
//             <ScatterChart data={chart.data}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="time" />
//               {chart.yAxisDataKeys.map((yAxis) => (
//                 <YAxis
//                   key={yAxis.id}
//                   yAxisId={yAxis.id}
//                   domain={getYAxisDomain(yAxis.range)}
//                   stroke={yAxis.color}
//                 />
//               ))}
//               <Tooltip />
//               <Legend />
//               {chart.yAxisDataKeys.map((yAxis) =>
//                 yAxis.dataKeys.map((key) => (
//                   <Scatter
//                     key={key}
//                     name={key}
//                     dataKey={key}
//                     stroke={yAxis.color}
//                     fill={yAxis.color}
//                     strokeDasharray={
//                       yAxis.lineStyle === 'solid'
//                         ? ''
//                         : yAxis.lineStyle === 'dotted'
//                         ? '1 1'
//                         : yAxis.lineStyle === 'dashed'
//                         ? '5 5'
//                         : yAxis.lineStyle === 'dot-dash'
//                         ? '3 3 1 3'
//                         : '3 3 1 1 1 3'
//                     }
//                     yAxisId={yAxis.id}
//                   />
//                 ))
//               )}
//             </ScatterChart>
//           </ResponsiveContainer>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
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
//             <Button variant="contained" onClick={() => addCustomChart('Bar')}>Add Bar Chart</Button>
//             <Button variant="contained" onClick={() => addCustomChart('Scatter')}>Add Scatter Chart</Button>
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
//             <Button variant="outlined" color="primary" onClick={() => openDialog(chart)}>
//               Configure Chart
//             </Button>
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
//                       <MenuItem value="dot-dash">Dot Dash</MenuItem>
//                       <MenuItem value="dash-dot-dot">Dash Dot Dot</MenuItem>
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
//     </Container>
//   );
// };

// export default CustomCharts;

// import React, { useState, useEffect } from "react";
// import {
//   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, BarChart, Bar
// } from "recharts";
// import {
//   Container, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
//   FormControl, InputLabel, Select, MenuItem, Typography, IconButton
// } from "@mui/material";
// import DeleteIcon from '@mui/icons-material/Delete';
// import { SketchPicker } from 'react-color';
// import { useWebSocket } from "src/WebSocketProvider";

// const CustomCharts = () => {
//   const websocketData = useWebSocket();
//   const [charts, setCharts] = useState([]);
//   const [chartData, setChartData] = useState({});
//   const [chartDialogOpen, setChartDialogOpen] = useState(false);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [tempChartData, setTempChartData] = useState(null);
//   const [colorPickerOpen, setColorPickerOpen] = useState(false);
//   const [selectedYAxisId, setSelectedYAxisId] = useState(null);

//   useEffect(() => {
//     if (websocketData) {
//       setCharts((prevCharts) =>
//         prevCharts.map((chart) => {
//           const newData = { id: Date.now(), ...websocketData };
//           return {
//             ...chart,
//             data: [...(chart.data || []), newData],
//           };
//         })
//       );
//     }
//   }, [websocketData]);

//   const addCustomChart = (type) => {
//     const newChartId = Date.now();
//     const newChart = {
//       id: newChartId,
//       type,
//       data: [],
//       xAxisDataKey: '', // For XY Chart to store selected X-Axis data key
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

//   const handleXAxisDataKeyChange = (event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       xAxisDataKey: value,
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
//     switch (chart.type) {
//       case "Line":
//         return (
//           <ResponsiveContainer width="100%" height={400}>
//             <LineChart data={chart.data}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="time" />
//               {chart.yAxisDataKeys.map((yAxis) => (
//                 <YAxis
//                   key={yAxis.id}
//                   yAxisId={yAxis.id}
//                   domain={getYAxisDomain(yAxis.range)}
//                   stroke={yAxis.color}
//                 />
//               ))}
//               <Tooltip />
//               <Legend />
//               {chart.yAxisDataKeys.map((yAxis) =>
//                 yAxis.dataKeys.map((key) => (
//                   <Line
//                     key={key}
//                     type="monotone"
//                     dataKey={key}
//                     stroke={yAxis.color}
//                     strokeDasharray={
//                       yAxis.lineStyle === 'solid'
//                         ? ''
//                         : yAxis.lineStyle === 'dotted'
//                         ? '1 1'
//                         : yAxis.lineStyle === 'dashed'
//                         ? '5 5'
//                         : yAxis.lineStyle === 'dot-dash'
//                         ? '3 3 1 3'
//                         : '3 3 1 1 1 3'
//                     }
//                     yAxisId={yAxis.id}
//                   />
//                 ))
//               )}
//             </LineChart>
//           </ResponsiveContainer>
//         );
//       case "Bar":
//         return (
//           <ResponsiveContainer width="100%" height={400}>
//             <BarChart data={chart.data}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="time" />
//               {chart.yAxisDataKeys.map((yAxis) => (
//                 <YAxis
//                   key={yAxis.id}
//                   yAxisId={yAxis.id}
//                   domain={getYAxisDomain(yAxis.range)}
//                   stroke={yAxis.color}
//                 />
//               ))}
//               <Tooltip />
//               <Legend />
//               {chart.yAxisDataKeys.map((yAxis) =>
//                 yAxis.dataKeys.map((key) => (
//                   <Bar
//                     key={key}
//                     dataKey={key}
//                     fill={yAxis.color}
//                     yAxisId={yAxis.id}
//                   />
//                 ))
//               )}
//             </BarChart>
//           </ResponsiveContainer>
//         );
//       case "Scatter":
//         return (
//           <ResponsiveContainer width="100%" height={400}>
//             <ScatterChart data={chart.data}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="time" />
//               {chart.yAxisDataKeys.map((yAxis) => (
//                 <YAxis
//                   key={yAxis.id}
//                   yAxisId={yAxis.id}
//                   domain={getYAxisDomain(yAxis.range)}
//                   stroke={yAxis.color}
//                 />
//               ))}
//               <Tooltip />
//               <Legend />
//               {chart.yAxisDataKeys.map((yAxis) =>
//                 yAxis.dataKeys.map((key) => (
//                   <Scatter
//                     key={key}
//                     name={key}
//                     dataKey={key}
//                     stroke={yAxis.color}
//                     fill={yAxis.color}
//                     strokeDasharray={
//                       yAxis.lineStyle === 'solid'
//                         ? ''
//                         : yAxis.lineStyle === 'dotted'
//                         ? '1 1'
//                         : yAxis.lineStyle === 'dashed'
//                         ? '5 5'
//                         : yAxis.lineStyle === 'dot-dash'
//                         ? '3 3 1 3'
//                         : '3 3 1 1 1 3'
//                     }
//                     yAxisId={yAxis.id}
//                   />
//                 ))
//               )}
//             </ScatterChart>
//           </ResponsiveContainer>
//         );
//       case "XY":
//         return (
//           <ResponsiveContainer width="100%" height={400}>
//             <ScatterChart data={chart.data}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey={chart.xAxisDataKey} />
//               {chart.yAxisDataKeys.map((yAxis) => (
//                 <YAxis
//                   key={yAxis.id}
//                   yAxisId={yAxis.id}
//                   domain={getYAxisDomain(yAxis.range)}
//                   stroke={yAxis.color}
//                 />
//               ))}
//               <Tooltip />
//               <Legend />
//               {/* Plot X-Axis Line */}
//               {chart.xAxisDataKey && (
//                 <LineChart
//                   data={chart.data}
//                   margin={{
//                     top: 5, right: 30, left: 20, bottom: 5,
//                   }}
//                 >
//                   <Line
//                     type="monotone"
//                     dataKey={chart.xAxisDataKey}
//                     stroke="#8884d8"
//                   />
//                 </LineChart>
//               )}
//               {/* Plot Y-Axis Scatter */}
//               {chart.yAxisDataKeys.map((yAxis) =>
//                 yAxis.dataKeys.map((key) => (
//                   <Scatter
//                     key={key}
//                     name={key}
//                     dataKey={key}
//                     fill={yAxis.color}
//                     yAxisId={yAxis.id}
//                   />
//                 ))
//               )}
//             </ScatterChart>
//           </ResponsiveContainer>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
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
//             <Button variant="contained" onClick={() => addCustomChart('Bar')}>Add Bar Chart</Button>
//             <Button variant="contained" onClick={() => addCustomChart('Scatter')}>Add Scatter Chart</Button>
//             <Button variant="contained" onClick={() => addCustomChart('XY')}>Add XY Chart</Button>
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
//             <Button variant="outlined" color="primary" onClick={() => openDialog(chart)}>
//               Configure Chart
//             </Button>
//           </Box>
//         </Box>
//       ))}

//       {tempChartData && (
//         <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
//           <DialogTitle>Configure Chart</DialogTitle>
//           <DialogContent>
//             <Box display="flex" flexDirection="column" maxHeight="400px" overflow="auto">
//               {tempChartData.type === 'XY' && (
//                 <Box marginBottom={2}>
//                   <Typography variant="h6">X-Axis</Typography>
//                   <FormControl fullWidth margin="normal">
//                     <InputLabel>X-Axis Data Key</InputLabel>
//                     <Select
//                       value={tempChartData.xAxisDataKey}
//                       onChange={handleXAxisDataKeyChange}
//                     >
//                       <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//                       <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
//                       <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
//                     </Select>
//                   </FormControl>
//                 </Box>
//               )}
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
//                       <MenuItem value="dot-dash">Dot Dash</MenuItem>
//                       <MenuItem value="dash-dot-dot">Dash Dot Dot</MenuItem>
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
//     </Container>
//   );
// };

// export default CustomCharts;

// // import React, { useState, useEffect } from "react";
// // import {
// //   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, BarChart, Bar
// // } from "recharts";
// // import {
// //   Container, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
// //   FormControl, InputLabel, Select, MenuItem, Typography, IconButton
// // } from "@mui/material";
// // import DeleteIcon from '@mui/icons-material/Delete';
// // import { SketchPicker } from 'react-color';
// // import { useWebSocket } from "src/WebSocketProvider";

// // const CustomCharts = () => {
// //   const websocketData = useWebSocket();
// //   const [charts, setCharts] = useState([]);
// //   const [chartData, setChartData] = useState({});
// //   const [chartDialogOpen, setChartDialogOpen] = useState(false);
// //   const [dialogOpen, setDialogOpen] = useState(false);
// //   const [tempChartData, setTempChartData] = useState(null);
// //   const [colorPickerOpen, setColorPickerOpen] = useState(false);
// //   const [selectedYAxisId, setSelectedYAxisId] = useState(null);

// //   useEffect(() => {
// //     if (websocketData) {
// //       setCharts((prevCharts) =>
// //         prevCharts.map((chart) => {
// //           const newData = { id: Date.now(), ...websocketData };
// //           return {
// //             ...chart,
// //             data: [...(chart.data || []), newData],
// //           };
// //         })
// //       );
// //     }
// //   }, [websocketData]);

// //   const addCustomChart = (type) => {
// //     const newChartId = Date.now();
// //     const newChart = {
// //       id: newChartId,
// //       type,
// //       data: [], // Start with an empty data array
// //       yAxisDataKeys: [
// //         { id: 'left-0', dataKeys: ['AX-LT-011'], range: '0-500', color: "#FF0000", lineStyle: 'solid' }
// //       ],
// //     };
// //     setCharts((prevCharts) => [...prevCharts, newChart]);
// //     setChartDialogOpen(false);
// //   };

// //   const openDialog = (chart) => {
// //     setTempChartData(chart);
// //     setDialogOpen(true);
// //   };

// //   const closeDialog = () => setDialogOpen(false);

// //   const saveConfiguration = () => {
// //     setCharts((prevCharts) =>
// //       prevCharts.map((chart) =>
// //         chart.id === tempChartData.id ? tempChartData : chart
// //       )
// //     );
// //     setDialogOpen(false);
// //   };

// //   const openColorPicker = (yAxisId) => {
// //     setSelectedYAxisId(yAxisId);
// //     setColorPickerOpen(true);
// //   };

// //   const handleColorChange = (color) => {
// //     setTempChartData((prevChart) => ({
// //       ...prevChart,
// //       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
// //         yAxis.id === selectedYAxisId ? { ...yAxis, color: color.hex } : yAxis
// //       ),
// //     }));
// //     setColorPickerOpen(false);
// //   };

// //   const handleDataKeyChange = (yAxisId, event) => {
// //     const { value } = event.target;
// //     setTempChartData((prevChart) => ({
// //       ...prevChart,
// //       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
// //         yAxis.id === yAxisId ? { ...yAxis, dataKeys: value } : yAxis
// //       ),
// //     }));
// //   };

// //   const handleRangeChange = (yAxisId, event) => {
// //     const { value } = event.target;
// //     setTempChartData((prevChart) => ({
// //       ...prevChart,
// //       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
// //         yAxis.id === yAxisId ? { ...yAxis, range: value } : yAxis
// //       ),
// //     }));
// //   };

// //   const handleLineStyleChange = (yAxisId, event) => {
// //     const { value } = event.target;
// //     setTempChartData((prevChart) => ({
// //       ...prevChart,
// //       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
// //         yAxis.id === yAxisId ? { ...yAxis, lineStyle: value } : yAxis
// //       ),
// //     }));
// //   };

// //   const deleteChart = (chartId) => {
// //     setCharts((prevCharts) => prevCharts.filter((chart) => chart.id !== chartId));
// //   };

// //   const addYAxis = () => {
// //     setTempChartData((prevChart) => ({
// //       ...prevChart,
// //       yAxisDataKeys: [
// //         ...prevChart.yAxisDataKeys,
// //         { id: `left-${prevChart.yAxisDataKeys.length}`, dataKeys: [], range: '0-500', color: '#FF0000', lineStyle: 'solid' },
// //       ],
// //     }));
// //   };

// //   const deleteYAxis = (yAxisId) => {
// //     setTempChartData((prevChart) => ({
// //       ...prevChart,
// //       yAxisDataKeys: prevChart.yAxisDataKeys.filter((yAxis) => yAxis.id !== yAxisId),
// //     }));
// //   };

// //   const getYAxisDomain = (range) => {
// //     switch (range) {
// //       case "0-500": return [0, 500];
// //       case "0-100": return [0, 100];
// //       case "0-10": return [0, 10];
// //       default: return [0, 500];
// //     }
// //   };

// //   const renderChart = (chart) => {
// //     switch (chart.type) {
// //       case "Line":
// //         return (
// //           <ResponsiveContainer width="100%" height={400}>
// //             <LineChart data={chart.data}>
// //               <CartesianGrid strokeDasharray="3 3" />
// //               <XAxis dataKey="time" />
// //               {chart.yAxisDataKeys.map((yAxis) => (
// //                 <YAxis
// //                   key={yAxis.id}
// //                   yAxisId={yAxis.id}
// //                   domain={getYAxisDomain(yAxis.range)}
// //                   stroke={yAxis.color}
// //                 />
// //               ))}
// //               <Tooltip />
// //               <Legend />
// //               {chart.yAxisDataKeys.map((yAxis) =>
// //                 yAxis.dataKeys.map((key) => (
// //                   <Line
// //                     key={key}
// //                     type="monotone"
// //                     dataKey={key}
// //                     stroke={yAxis.color}
// //                     strokeDasharray={
// //                       yAxis.lineStyle === 'solid'
// //                         ? ''
// //                         : yAxis.lineStyle === 'dotted'
// //                         ? '1 1'
// //                         : yAxis.lineStyle === 'dashed'
// //                         ? '5 5'
// //                         : yAxis.lineStyle === 'dot-dash'
// //                         ? '3 3 1 3'
// //                         : '3 3 1 1 1 3'
// //                     }
// //                     yAxisId={yAxis.id}
// //                   />
// //                 ))
// //               )}
// //             </LineChart>
// //           </ResponsiveContainer>
// //         );
// //       case "Bar":
// //         return (
// //           <ResponsiveContainer width="100%" height={400}>
// //             <BarChart data={chart.data}>
// //               <CartesianGrid strokeDasharray="3 3" />
// //               <XAxis dataKey="time" />
// //               {chart.yAxisDataKeys.map((yAxis) => (
// //                 <YAxis
// //                   key={yAxis.id}
// //                   yAxisId={yAxis.id}
// //                   domain={getYAxisDomain(yAxis.range)}
// //                   stroke={yAxis.color}
// //                 />
// //               ))}
// //               <Tooltip />
// //               <Legend />
// //               {chart.yAxisDataKeys.map((yAxis) =>
// //                 yAxis.dataKeys.map((key) => (
// //                   <Bar
// //                     key={key}
// //                     dataKey={key}
// //                     fill={yAxis.color}
// //                     yAxisId={yAxis.id}
// //                   />
// //                 ))
// //               )}
// //             </BarChart>
// //           </ResponsiveContainer>
// //         );
// //       case "Scatter":
// //         return (
// //           <ResponsiveContainer width="100%" height={400}>
// //             <ScatterChart data={chart.data}>
// //               <CartesianGrid strokeDasharray="3 3" />
// //               <XAxis dataKey="time" />
// //               {chart.yAxisDataKeys.map((yAxis) => (
// //                 <YAxis
// //                   key={yAxis.id}
// //                   yAxisId={yAxis.id}
// //                   domain={getYAxisDomain(yAxis.range)}
// //                   stroke={yAxis.color}
// //                 />
// //               ))}
// //               <Tooltip />
// //               <Legend />
// //               {chart.yAxisDataKeys.map((yAxis) =>
// //                 yAxis.dataKeys.map((key) => (
// //                   <Scatter
// //                     key={key}
// //                     name={key}
// //                     dataKey={key}
// //                     stroke={yAxis.color}
// //                     fill={yAxis.color}
// //                     strokeDasharray={
// //                       yAxis.lineStyle === 'solid'
// //                         ? ''
// //                         : yAxis.lineStyle === 'dotted'
// //                         ? '1 1'
// //                         : yAxis.lineStyle === 'dashed'
// //                         ? '5 5'
// //                         : yAxis.lineStyle === 'dot-dash'
// //                         ? '3 3 1 3'
// //                         : '3 3 1 1 1 3'
// //                     }
// //                     yAxisId={yAxis.id}
// //                   />
// //                 ))
// //               )}
// //             </ScatterChart>
// //           </ResponsiveContainer>
// //         );
// //       default:
// //         return null;
// //     }
// //   };

// //   return (
// //     <Container>
// //       <Box display="flex" justifyContent="flex-end" marginBottom={4}>
// //         <Button variant="contained" color="primary" onClick={() => setChartDialogOpen(true)}>
// //           Add Custom Chart
// //         </Button>
// //       </Box>

// //       <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
// //         <DialogTitle>Select Chart Type</DialogTitle>
// //         <DialogContent>
// //           <Box display="flex" flexDirection="column" gap={2}>
// //             <Button variant="contained" onClick={() => addCustomChart('Line')}>Add Line Chart</Button>
// //             <Button variant="contained" onClick={() => addCustomChart('Bar')}>Add Bar Chart</Button>
// //             <Button variant="contained" onClick={() => addCustomChart('Scatter')}>Add Scatter Chart</Button>
// //           </Box>
// //         </DialogContent>
// //         <DialogActions>
// //           <Button onClick={() => setChartDialogOpen(false)} color="secondary">Cancel</Button>
// //         </DialogActions>
// //       </Dialog>

// //       {charts.map((chart) => (
// //         <Box key={chart.id} marginY={4} position="relative">
// //           <IconButton
// //             aria-label="delete"
// //             onClick={() => deleteChart(chart.id)}
// //             style={{ position: "absolute", right: 0, top: 0, zIndex: 10 }}
// //           >
// //             <DeleteIcon />
// //           </IconButton>
// //           <Box border={1} padding={2}>
// //             {renderChart(chart)}
// //             <Button variant="outlined" color="primary" onClick={() => openDialog(chart)}>
// //               Configure Chart
// //             </Button>
// //           </Box>
// //         </Box>
// //       ))}

// //       {tempChartData && (
// //         <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
// //           <DialogTitle>Configure Chart</DialogTitle>
// //           <DialogContent>
// //             <Box display="flex" flexDirection="column" maxHeight="400px" overflow="auto">
// //               {tempChartData.yAxisDataKeys.map((yAxis, index) => (
// //                 <Box key={yAxis.id} display="flex" flexDirection="column" marginBottom={2}>
// //                   <Box display="flex" justifyContent="space-between" alignItems="center">
// //                     <Typography variant="h6">Y-Axis {index + 1}</Typography>
// //                     <IconButton onClick={() => deleteYAxis(yAxis.id)}>
// //                       <DeleteIcon />
// //                     </IconButton>
// //                   </Box>
// //                   <FormControl fullWidth margin="normal">
// //                     <InputLabel>Data Keys</InputLabel>
// //                     <Select
// //                       multiple
// //                       value={yAxis.dataKeys}
// //                       onChange={(event) => handleDataKeyChange(yAxis.id, event)}
// //                     >
// //                       <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
// //                       <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
// //                       <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
// //                     </Select>
// //                   </FormControl>
// //                   <FormControl fullWidth margin="normal">
// //                     <InputLabel>Range</InputLabel>
// //                     <Select
// //                       value={yAxis.range}
// //                       onChange={(event) => handleRangeChange(yAxis.id, event)}
// //                     >
// //                       <MenuItem value="0-500">0-500</MenuItem>
// //                       <MenuItem value="0-100">0-100</MenuItem>
// //                       <MenuItem value="0-10">0-10</MenuItem>
// //                     </Select>
// //                   </FormControl>
// //                   <FormControl fullWidth margin="normal">
// //                     <InputLabel>Line Style</InputLabel>
// //                     <Select
// //                       value={yAxis.lineStyle}
// //                       onChange={(event) => handleLineStyleChange(yAxis.id, event)}
// //                     >
// //                       <MenuItem value="solid">Solid</MenuItem>
// //                       <MenuItem value="dotted">Dotted</MenuItem>
// //                       <MenuItem value="dashed">Dashed</MenuItem>
// //                       <MenuItem value="dot-dash">Dot Dash</MenuItem>
// //                       <MenuItem value="dash-dot-dot">Dash Dot Dot</MenuItem>
// //                     </Select>
// //                   </FormControl>
// //                   <Button onClick={() => openColorPicker(yAxis.id)}>Select Color</Button>
// //                   {colorPickerOpen && selectedYAxisId === yAxis.id && (
// //                     <SketchPicker color={yAxis.color} onChangeComplete={handleColorChange} />
// //                   )}
// //                 </Box>
// //               ))}
// //               <Button variant="contained" color="secondary" onClick={addYAxis}>
// //                 Add Y-Axis
// //               </Button>
// //             </Box>
// //           </DialogContent>
// //           <DialogActions>
// //             <Button onClick={closeDialog} color="secondary">Cancel</Button>
// //             <Button onClick={saveConfiguration} color="primary">Save</Button>
// //           </DialogActions>
// //         </Dialog>
// //       )}
// //     </Container>
// //   );
// // };

// // export default CustomCharts;

// // import React, { useState, useEffect } from "react";
// // import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from "recharts";
// // import { BarChart, Bar } from 'recharts';
// // import {
// //   Container, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
// //   FormControl, InputLabel, Select, MenuItem, Typography, IconButton
// // } from "@mui/material";
// // import DeleteIcon from '@mui/icons-material/Delete';
// // import { SketchPicker } from 'react-color';
// // import { useWebSocket } from "src/WebSocketProvider";

// // const CustomCharts = () => {
// //   const websocketData = useWebSocket();
// //   const [data, setData] = useState([]);
// //   const [charts, setCharts] = useState([]);  // Manage multiple charts
// //   const [chartDialogOpen, setChartDialogOpen] = useState(false);
// //   const [dialogOpen, setDialogOpen] = useState(false);
// //   const [tempChartData, setTempChartData] = useState(null);
// //   const [colorPickerOpen, setColorPickerOpen] = useState(false);
// //   const [selectedYAxisId, setSelectedYAxisId] = useState(null);

// //   useEffect(() => {
// //     if (websocketData) {
// //       const newEntry = { id: data.length + 1, ...websocketData };
// //       setData((prevData) => [...prevData, newEntry]);
// //     }
// //   }, [websocketData]);

// //   // Add Custom Chart
// //   const addCustomChart = (type) => {
// //     const newChart = {
// //       id: Date.now(),
// //       type,
// //       yAxisDataKeys: [
// //         { id: 'left-0', dataKeys: ['AX-LT-011'], range: '0-500', color: "#FF0000", lineStyle: 'solid' }
// //       ],
// //     };
// //     setCharts((prevCharts) => [...prevCharts, newChart]);
// //     setChartDialogOpen(false);
// //   };

// //   const openDialog = (chart) => {
// //     setTempChartData(chart);
// //     setDialogOpen(true);
// //   };

// //   const closeDialog = () => setDialogOpen(false);

// //   const saveConfiguration = () => {
// //     setCharts((prevCharts) =>
// //       prevCharts.map((chart) =>
// //         chart.id === tempChartData.id ? tempChartData : chart
// //       )
// //     );
// //     setDialogOpen(false);
// //   };

// //   const openColorPicker = (yAxisId) => {
// //     setSelectedYAxisId(yAxisId);
// //     setColorPickerOpen(true);
// //   };

// //   const handleColorChange = (color) => {
// //     setTempChartData((prevChart) => ({
// //       ...prevChart,
// //       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
// //         yAxis.id === selectedYAxisId ? { ...yAxis, color: color.hex } : yAxis
// //       ),
// //     }));
// //     setColorPickerOpen(false);
// //   };

// //   const handleDataKeyChange = (yAxisId, event) => {
// //     const { value } = event.target;
// //     setTempChartData((prevChart) => ({
// //       ...prevChart,
// //       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
// //         yAxis.id === yAxisId ? { ...yAxis, dataKeys: value } : yAxis
// //       ),
// //     }));
// //   };

// //   const handleRangeChange = (yAxisId, event) => {
// //     const { value } = event.target;
// //     setTempChartData((prevChart) => ({
// //       ...prevChart,
// //       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
// //         yAxis.id === yAxisId ? { ...yAxis, range: value } : yAxis
// //       ),
// //     }));
// //   };

// //   const handleLineStyleChange = (yAxisId, event) => {
// //     const { value } = event.target;
// //     setTempChartData((prevChart) => ({
// //       ...prevChart,
// //       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
// //         yAxis.id === yAxisId ? { ...yAxis, lineStyle: value } : yAxis
// //       ),
// //     }));
// //   };

// //   const deleteChart = (chartId) => {
// //     setCharts((prevCharts) => prevCharts.filter((chart) => chart.id !== chartId));
// //   };

// //   const addYAxis = () => {
// //     setTempChartData((prevChart) => ({
// //       ...prevChart,
// //       yAxisDataKeys: [
// //         ...prevChart.yAxisDataKeys,
// //         { id: `left-${prevChart.yAxisDataKeys.length}`, dataKeys: [], range: '0-500', color: '#FF0000', lineStyle: 'solid' },
// //       ],
// //     }));
// //   };

// //   const deleteYAxis = (yAxisId) => {
// //     setTempChartData((prevChart) => ({
// //       ...prevChart,
// //       yAxisDataKeys: prevChart.yAxisDataKeys.filter((yAxis) => yAxis.id !== yAxisId),
// //     }));
// //   };

// //   const getYAxisDomain = (range) => {
// //     switch (range) {
// //       case "0-500": return [0, 500];
// //       case "0-100": return [0, 100];
// //       case "0-10": return [0, 10];
// //       default: return [0, 500];
// //     }
// //   };

// //   const renderChart = (chart) => {
// //     switch (chart.type) {
// //       case "Line":
// //         return (
// //           <ResponsiveContainer width="100%" height={400}>
// //             <LineChart data={data}>
// //               <CartesianGrid strokeDasharray="3 3" />
// //               <XAxis dataKey="time" />
// //               {chart.yAxisDataKeys.map((yAxis) => (
// //                 <YAxis
// //                   key={yAxis.id}
// //                   yAxisId={yAxis.id}
// //                   domain={getYAxisDomain(yAxis.range)}
// //                   stroke={yAxis.color}
// //                 />
// //               ))}
// //               <Tooltip />
// //               <Legend />
// //               {chart.yAxisDataKeys.map((yAxis) =>
// //                 yAxis.dataKeys.map((key) => (
// //                   <Line
// //                     key={key}
// //                     type="monotone"
// //                     dataKey={key}
// //                     stroke={yAxis.color}
// //                     strokeDasharray={
// //                       yAxis.lineStyle === 'solid'
// //                         ? ''
// //                         : yAxis.lineStyle === 'dotted'
// //                         ? '1 1'
// //                         : yAxis.lineStyle === 'dashed'
// //                         ? '5 5'
// //                         : yAxis.lineStyle === 'dot-dash'
// //                         ? '3 3 1 3'
// //                         : '3 3 1 1 1 3'
// //                     }
// //                     yAxisId={yAxis.id}
// //                   />
// //                 ))
// //               )}
// //             </LineChart>
// //           </ResponsiveContainer>
// //         );
// //       case "Bar":
// //         return (
// //           <ResponsiveContainer width="100%" height={400}>
// //             <BarChart data={data}>
// //               <CartesianGrid strokeDasharray="3 3" />
// //               <XAxis dataKey="time" />
// //               {chart.yAxisDataKeys.map((yAxis) => (
// //                 <YAxis
// //                   key={yAxis.id}
// //                   yAxisId={yAxis.id}
// //                   domain={getYAxisDomain(yAxis.range)}
// //                   stroke={yAxis.color}
// //                 />
// //               ))}
// //               <Tooltip />
// //               <Legend />
// //               {chart.yAxisDataKeys.map((yAxis) =>
// //                 yAxis.dataKeys.map((key) => (
// //                   <Bar
// //                     key={key}
// //                     dataKey={key}
// //                     fill={yAxis.color}
// //                     yAxisId={yAxis.id}
// //                   />
// //                 ))
// //               )}
// //             </BarChart>
// //           </ResponsiveContainer>
// //         );
// //       case "Scatter":
// //         return (
// //           <ResponsiveContainer width="100%" height={400}>
// //           <ScatterChart  data={data}>
// //             <CartesianGrid strokeDasharray="3 3" />
// //             <XAxis dataKey="time" />
// //             {chart.yAxisDataKeys.map((yAxis) => (
// //               <YAxis
// //                 key={yAxis.id}
// //                 yAxisId={yAxis.id}
// //                 domain={getYAxisDomain(yAxis.range)}
// //                 stroke={yAxis.color}
// //               />
// //             ))}
// //             <Tooltip />
// //             <Legend />
// //             {chart.yAxisDataKeys.map((yAxis) =>
// //               yAxis.dataKeys.map((key) => (
// //                 <Scatter
// //                   key={key}
// //                   // type="monotone"
// //                   name={key}
// //                   dataKey={key}
// //                   stroke={yAxis.color}
// //                   fill={yAxis.color}
// //                   strokeDasharray={
// //                     yAxis.lineStyle === 'solid'
// //                       ? ''
// //                       : yAxis.lineStyle === 'dotted'
// //                       ? '1 1'
// //                       : yAxis.lineStyle === 'dashed'
// //                       ? '5 5'
// //                       : yAxis.lineStyle === 'dot-dash'
// //                       ? '3 3 1 3'
// //                       : '3 3 1 1 1 3'
// //                   }
// //                   yAxisId={yAxis.id}
// //            s
// //                 />
// //               ))
// //             )}
// //           </ScatterChart>
// //         </ResponsiveContainer>
// //         );

// //       default:
// //         return null;
// //     }
// //   };

// //   return (
// //     <Container>
// //       <Box display="flex" justifyContent="flex-end" marginBottom={4}>
// //         <Button variant="contained" color="primary" onClick={() => setChartDialogOpen(true)}>
// //           Add Custom Chart
// //         </Button>
// //       </Box>

// //       {/* Chart Selection Dialog */}
// //       <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
// //         <DialogTitle>Select Chart Type</DialogTitle>
// //         <DialogContent>
// //           <Box display="flex" flexDirection="column" gap={2}>
// //             <Button variant="contained" onClick={() => addCustomChart('Line')}>Add Line Chart</Button>
// //             <Button variant="contained" onClick={() => addCustomChart('Bar')}>Add Bar Chart</Button>
// //             <Button variant="contained" onClick={() => addCustomChart('Scatter')}>Add Scatter Chart</Button>
// //           </Box>
// //         </DialogContent>
// //         <DialogActions>
// //           <Button onClick={() => setChartDialogOpen(false)} color="secondary">Cancel</Button>
// //         </DialogActions>
// //       </Dialog>

// //       {/* Render Custom Charts */}
// //       {charts.map((chart) => (
// //         <Box key={chart.id} marginY={4} position="relative">
// //           <IconButton
// //             aria-label="delete"
// //             onClick={() => deleteChart(chart.id)}
// //             style={{ position: "absolute", right: 0, top: 0, zIndex: 10 }}
// //           >
// //             <DeleteIcon />
// //           </IconButton>
// //           <Box border={1} padding={2}>
// //             {renderChart(chart)}
// //             <Button variant="outlined" color="primary" onClick={() => openDialog(chart)}>
// //               Configure Chart
// //             </Button>
// //           </Box>
// //         </Box>
// //       ))}

// //       {/* Chart Configuration Dialog */}
// //       {tempChartData && (
// //         <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
// //           <DialogTitle>Configure Chart</DialogTitle>
// //           <DialogContent>
// //             <Box display="flex" flexDirection="column" maxHeight="400px" overflow="auto">
// //               {tempChartData.yAxisDataKeys.map((yAxis, index) => (
// //                 <Box key={yAxis.id} display="flex" flexDirection="column" marginBottom={2}>
// //                   <Box display="flex" justifyContent="space-between" alignItems="center">
// //                     <Typography variant="h6">Y-Axis {index + 1}</Typography>
// //                     <IconButton onClick={() => deleteYAxis(yAxis.id)}>
// //                       <DeleteIcon />
// //                     </IconButton>
// //                   </Box>
// //                   <FormControl fullWidth margin="normal">
// //                     <InputLabel>Data Keys</InputLabel>
// //                     <Select
// //                       multiple
// //                       value={yAxis.dataKeys}
// //                       onChange={(event) => handleDataKeyChange(yAxis.id, event)}
// //                     >
// //                       <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
// //                       <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
// //                       <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
// //                     </Select>
// //                   </FormControl>
// //                   <FormControl fullWidth margin="normal">
// //                     <InputLabel>Range</InputLabel>
// //                     <Select
// //                       value={yAxis.range}
// //                       onChange={(event) => handleRangeChange(yAxis.id, event)}
// //                     >
// //                       <MenuItem value="0-500">0-500</MenuItem>
// //                       <MenuItem value="0-100">0-100</MenuItem>
// //                       <MenuItem value="0-10">0-10</MenuItem>
// //                     </Select>
// //                   </FormControl>
// //                   <FormControl fullWidth margin="normal">
// //                     <InputLabel>Line Style</InputLabel>
// //                     <Select
// //                       value={yAxis.lineStyle}
// //                       onChange={(event) => handleLineStyleChange(yAxis.id, event)}
// //                     >
// //                       <MenuItem value="solid">Solid</MenuItem>
// //                       <MenuItem value="dotted">Dotted</MenuItem>
// //                       <MenuItem value="dashed">Dashed</MenuItem>
// //                       <MenuItem value="dot-dash">Dot Dash</MenuItem>
// //                       <MenuItem value="dash-dot-dot">Dash Dot Dot</MenuItem>
// //                     </Select>
// //                   </FormControl>
// //                   <Button onClick={() => openColorPicker(yAxis.id)}>Select Color</Button>
// //                   {colorPickerOpen && selectedYAxisId === yAxis.id && (
// //                     <SketchPicker color={yAxis.color} onChangeComplete={handleColorChange} />
// //                   )}
// //                 </Box>
// //               ))}
// //               <Button variant="contained" color="secondary" onClick={addYAxis}>
// //                 Add Y-Axis
// //               </Button>
// //             </Box>
// //           </DialogContent>
// //           <DialogActions>
// //             <Button onClick={closeDialog} color="secondary">Cancel</Button>
// //             <Button onClick={saveConfiguration} color="primary">Save</Button>
// //           </DialogActions>
// //         </Dialog>
// //       )}
// //     </Container>
// //   );
// // };

// // export default CustomCharts;

// // import React, { useState, useEffect } from "react";
// // import { format } from "date-fns";
// // import {
// //   LineChart,
// //   Line,
// //   XAxis,
// //   YAxis,
// //   CartesianGrid,
// //   Tooltip,
// //   Legend,
// //   ResponsiveContainer,
// // } from "recharts";
// // import {
// //   Container,
// //   Box,
// //   FormControl,
// //   InputLabel,
// //   Select,
// //   MenuItem,
// //   Typography,
// //   Button,
// //   IconButton,
// //   Dialog,
// //   DialogActions,
// //   DialogContent,
// //   DialogTitle,
// // } from "@mui/material";
// // import DeleteIcon from '@mui/icons-material/Delete';
// // import { SketchPicker } from 'react-color';
// // import { useWebSocket } from "src/WebSocketProvider";

// // const Barcharts = () => {
// //   const websocketData = useWebSocket();
// //   const [data, setData] = useState([]);
// //   const [yAxisDataKeys, setYAxisDataKeys] = useState([
// //     { id: 'left-0', dataKeys: ['AX-LT-011'], range: '0-500', color: "#FF0000", lineStyle: 'solid' }
// //   ]);
// //   const [sortData, setSortData] = useState(false);
// //   const [dialogOpen, setDialogOpen] = useState(false);
// //   const [tempYAxisDataKeys, setTempYAxisDataKeys] = useState([...yAxisDataKeys]);
// //   const [colorPickerOpen, setColorPickerOpen] = useState(false);
// //   const [selectedYAxisId, setSelectedYAxisId] = useState(null);

// //   useEffect(() => {
// //     const { date, time } = convertUTCToIST(websocketData["PLC-TIME-STAMP"]);
// //     const updatedData = {
// //       ...websocketData,
// //       id: data.length + 1,
// //       date,
// //       time,
// //     };

// //     setData((prevData) => [...prevData, updatedData]);
// //   }, [websocketData]);

// //   // Function to convert UTC to IST and separate Date and Time
// //   const convertUTCToIST = (utcTime) => {
// //     if (!utcTime) return { date: null, time: null };

// //     const istTimezone = "Asia/Kolkata"; // IST timezone
// //     const formattedDate = format(new Date(utcTime), "yyyy-MM-dd", {
// //       timeZone: istTimezone,
// //     });
// //     const formattedTime = format(new Date(utcTime), "HH:mm:ss", {
// //       timeZone: istTimezone,
// //     });

// //     return { date: formattedDate, time: formattedTime };
// //   };

// //   const handleDataKeyChange = (yAxisId, event) => {
// //     const { value } = event.target;
// //     setTempYAxisDataKeys((prevYAxisDataKeys) =>
// //       prevYAxisDataKeys.map((yAxis) =>
// //         yAxis.id === yAxisId ? { ...yAxis, dataKeys: value } : yAxis
// //       )
// //     );
// //   };

// //   const handleRangeChange = (yAxisId, event) => {
// //     const { value } = event.target;
// //     setTempYAxisDataKeys((prevYAxisDataKeys) =>
// //       prevYAxisDataKeys.map((yAxis) =>
// //         yAxis.id === yAxisId ? { ...yAxis, range: value } : yAxis
// //       )
// //     );
// //   };

// //   const handleColorChange = (color) => {
// //     setTempYAxisDataKeys((prevYAxisDataKeys) =>
// //       prevYAxisDataKeys.map((yAxis) =>
// //         yAxis.id === selectedYAxisId ? { ...yAxis, color: color.hex } : yAxis
// //       )
// //     );
// //     setColorPickerOpen(false);
// //   };

// //   const handleLineStyleChange = (yAxisId, event) => {
// //     const { value } = event.target;
// //     setTempYAxisDataKeys((prevYAxisDataKeys) =>
// //       prevYAxisDataKeys.map((yAxis) =>
// //         yAxis.id === yAxisId ? { ...yAxis, lineStyle: value } : yAxis
// //       )
// //     );
// //   };

// //   const addYAxis = () => {
// //     setTempYAxisDataKeys((prevYAxisDataKeys) => [
// //       ...prevYAxisDataKeys,
// //       {
// //         id: `left-${prevYAxisDataKeys.length}`,
// //         dataKeys: [],
// //         range: '0-500',
// //         color: yAxisColors[prevYAxisDataKeys.length % yAxisColors.length],
// //         lineStyle: 'solid'
// //       },
// //     ]);
// //   };

// //   const deleteYAxis = (yAxisId) => {
// //     setTempYAxisDataKeys((prevYAxisDataKeys) =>
// //       prevYAxisDataKeys.filter((yAxis) => yAxis.id !== yAxisId)
// //     );
// //   };

// //   const openDialog = () => {
// //     setTempYAxisDataKeys([...yAxisDataKeys]);
// //     setDialogOpen(true);
// //   };

// //   const closeDialog = () => {
// //     setDialogOpen(false);
// //   };

// //   const saveConfiguration = () => {
// //     setYAxisDataKeys([...tempYAxisDataKeys]);
// //     setDialogOpen(false);
// //   };

// //   const openColorPicker = (yAxisId) => {
// //     setSelectedYAxisId(yAxisId);
// //     setColorPickerOpen(true);
// //   };

// //   // Sort data if sortData is true
// //   const sortedData = sortData
// //     ? [...data].sort((a, b) => new Date(a.time) - new Date(b.time))
// //     : data;

// //   const dataKeys = [
// //    "AX-LT-011",
// //     "AX-LT-021",
// //     "CW-TT-011",
// //     "PR-AT-005",
// //   ];

// //   const yAxisColors = ["#FF0000", "#00FF00", "#0000FF", "#FF00FF", "#00FFFF", "#FFFF00"]; // Different colors for Y-axes

// //   const getYAxisDomain = (range) => {
// //     switch (range) {
// //       case "0-500":
// //         return [0, 500];
// //       case "0-100":
// //         return [0, 100];
// //       case "0-10":
// //         return [0, 10];
// //       default:
// //         return [0, 500];
// //     }
// //   };

// //   // MenuProps for scrollable dropdown
// //   const MenuProps = {
// //     PaperProps: {
// //       style: {
// //         maxHeight: 224,
// //         width: 250,
// //       },
// //     },
// //   };

// //   const lineStyles = [
// //     { value: 'solid', label: 'Solid' },
// //     { value: 'dotted', label: 'Dotted' },
// //     { value: 'dashed', label: 'Dashed' },
// //     { value: 'dot-dash', label: 'Dot Dash' },
// //     { value: 'dash-dot-dot', label: 'Dash Dot Dot' },
// //   ];

// //   return (
// //     <Container>

// //       <Box display="flex" justifyContent="flex-end" marginBottom={4}>
// //         <Button variant="contained" color="primary" onClick={openDialog}>
// //           Configure Y-Axes
// //         </Button>
// //       </Box>
// //       <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
// //         <DialogTitle>Configure Y-Axes</DialogTitle>
// //         <DialogContent>
// //           <Box display="flex" flexDirection="column" maxHeight="400px" overflow="auto">
// //             {tempYAxisDataKeys.map((yAxis, index) => (
// //               <Box key={yAxis.id} display="flex" flexDirection="column" marginBottom={2}>
// //                 <Box display="flex" justifyContent="space-between" alignItems="center">
// //                   <Typography variant="h6">Y-Axis {index + 1}</Typography>
// //                   <IconButton onClick={() => deleteYAxis(yAxis.id)}>
// //                     <DeleteIcon />
// //                   </IconButton>
// //                 </Box>
// //                 <FormControl>
// //                   <InputLabel>Data Keys</InputLabel>
// //                   <Select
// //                     multiple
// //                     value={yAxis.dataKeys}
// //                     onChange={(event) => handleDataKeyChange(yAxis.id, event)}
// //                     MenuProps={MenuProps}
// //                   >
// //                     {dataKeys.map((key) => (
// //                       <MenuItem key={key} value={key}>
// //                         {key}
// //                       </MenuItem>
// //                     ))}
// //                   </Select>
// //                 </FormControl>
// //                 <FormControl>
// //                   <InputLabel>Range</InputLabel>
// //                   <Select
// //                     value={yAxis.range}
// //                     onChange={(event) => handleRangeChange(yAxis.id, event)}
// //                     MenuProps={MenuProps}
// //                   >
// //                     <MenuItem value="0-500">0-500</MenuItem>
// //                     <MenuItem value="0-100">0-100</MenuItem>
// //                     <MenuItem value="0-10">0-10</MenuItem>
// //                   </Select>
// //                 </FormControl>
// //                 <FormControl>
// //                   <InputLabel>Line Style</InputLabel>
// //                   <Select
// //                     value={yAxis.lineStyle}
// //                     onChange={(event) => handleLineStyleChange(yAxis.id, event)}
// //                   >
// //                     {lineStyles.map((style) => (
// //                       <MenuItem key={style.value} value={style.value}>
// //                         {style.label}
// //                       </MenuItem>
// //                     ))}
// //                   </Select>
// //                 </FormControl>
// //                 <Button onClick={() => openColorPicker(yAxis.id)}>
// //                   Select Color
// //                 </Button>
// //                 {colorPickerOpen && selectedYAxisId === yAxis.id && (
// //                   <SketchPicker
// //                     color={yAxis.color}
// //                     onChangeComplete={handleColorChange}
// //                   />
// //                 )}
// //               </Box>
// //             ))}
// //             <Button variant="contained" color="secondary" onClick={addYAxis}>
// //               Add Y-Axis
// //             </Button>
// //           </Box>
// //         </DialogContent>
// //         <DialogActions>
// //           <Button onClick={closeDialog} color="secondary">Cancel</Button>
// //           <Button onClick={saveConfiguration} color="primary">OK</Button>
// //         </DialogActions>
// //       </Dialog>
// //       <ResponsiveContainer width="100%" height={500}>
// //         <LineChart data={sortedData}>
// //           <CartesianGrid strokeDasharray="3 3" />
// //           <XAxis dataKey="time" />
// //           {yAxisDataKeys.map((yAxis) => (
// //             <YAxis
// //               key={yAxis.id}
// //               yAxisId={yAxis.id}
// //               orientation="left"
// //               domain={getYAxisDomain(yAxis.range)}
// //               stroke={yAxis.color}
// //             />
// //           ))}
// //           <Tooltip />
// //           <Legend />
// //           {yAxisDataKeys.map((yAxis) =>
// //             yAxis.dataKeys.map((key) => (
// //               <Line
// //                 key={key}
// //                 type="monotone"
// //                 dataKey={key}
// //                 stroke={yAxis.color}
// //                 strokeDasharray={
// //                   yAxis.lineStyle === 'solid'
// //                     ? ''
// //                     : yAxis.lineStyle === 'dotted'
// //                     ? '1 1'
// //                     : yAxis.lineStyle === 'dashed'
// //                     ? '5 5'
// //                     : yAxis.lineStyle === 'dot-dash'
// //                     ? '3 3 1 3'
// //                     : '3 3 1 1 1 3'
// //                 }
// //                 yAxisId={yAxis.id}
// //               />
// //             ))
// //           )}
// //         </LineChart>
// //       </ResponsiveContainer>
// //     </Container>
// //   );
// // };

// // export default Barcharts;
