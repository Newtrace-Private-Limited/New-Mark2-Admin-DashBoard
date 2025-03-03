import React, { useState, useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, Brush } from "recharts";
import {
  Container, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, InputLabel, Select, MenuItem, Typography, IconButton, Grid, TextField, RadioGroup, FormControlLabel, Radio
} from "@mui/material";
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { SketchPicker } from 'react-color';
import DeleteIcon from '@mui/icons-material/Delete';
import { w3cwebsocket as W3CWebSocket } from "websocket";
import axios from 'axios';
import { format, parseISO } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const HistoricalCharts = () => {
  const [charts, setCharts] = useState([]); // Stores custom chart configurations
  const [chartData, setChartData] = useState({}); // Stores data for each chart independently
  const [tempChartData, setTempChartData] = useState(null);
  const [chartDialogOpen, setChartDialogOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [selectedYAxisId, setSelectedYAxisId] = useState(null);
  const [dateDialogOpen, setDateDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [mode, setMode] = useState('A'); // A for real-time, B for historical range, C for real-time + historical
  const [currentChartId, setCurrentChartId] = useState(null); // The ID of the chart currently configuring date range
  const wsClientRefs = useRef({}); // Use a map of refs for WebSocket clients

  // Load saved charts from localStorage on component mount
  useEffect(() => {
    const savedCharts = localStorage.getItem('customCharts');
    if (savedCharts) {
      setCharts(JSON.parse(savedCharts));
    }
  }, []);

  // Save chart configurations (without data points) to localStorage whenever charts are updated
  const saveChartsToLocalStorage = (updatedCharts) => {
    const chartConfigurations = updatedCharts.map(chart => ({
      id: chart.id,
      type: chart.type,
      xAxisDataKey: chart.xAxisDataKey,
      yAxisDataKeys: chart.yAxisDataKeys,
    }));
    localStorage.setItem('customCharts', JSON.stringify(chartConfigurations));
  };

  // Fetch data using the handleSubmit logic for both historical and real-time data
  const fetchChartData = async (chartId) => {
    if (!startDate || !endDate) return;

    try {
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedStartTime = format(startDate, 'HH:mm');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      const formattedEndTime = format(endDate, 'HH:mm');

      // Use the new API URL with the handleSubmit logic
      const response = await axios.post('https://xdeuid6slkki7yxz4zhdbqbzfq0hirkk.lambda-url.us-east-1.on.aws/', {
        start_time: `${formattedStartDate}T${formattedStartTime}`,
        end_time: `${formattedEndDate}T${formattedEndTime}`,
      });

      // Parse and map the data to the chart structure
      const parsedBody = JSON.parse(response.data.body);
      const fetchedData = parsedBody.data.map(item => ({
        timestamp: item[0],  // Assuming the first element is the timestamp
        'AX-LT-011': item[1],  // Adjust based on the actual data structure
        'AX-LT-021': item[2],
        'CW-TT-011': item[3],
        'CW-TT-021': item[4],
        'CR-PT-001': item[10],
      }));

      setChartData(prevData => ({
        ...prevData,
        [chartId]: fetchedData,
      }));

      if (mode === 'C') {
        setupRealTimeWebSocket(chartId); // If mode C, fetch real-time data too
      }
    } catch (error) {
      console.error('Error fetching data from the API:', error);
    }
  };

  const setupRealTimeWebSocket = (chartId) => {
    if (wsClientRefs.current[chartId]) {
      wsClientRefs.current[chartId].close();
    }

    wsClientRefs.current[chartId] = new W3CWebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");

    wsClientRefs.current[chartId].onopen = () => {
      console.log(`WebSocket connection established for chart ${chartId}`);
    };

    wsClientRefs.current[chartId].onmessage = (message) => {
      try {
        const receivedData = JSON.parse(message.data);
        const newData = {
          timestamp: parseISO(receivedData['PLC-TIME-STAMP']) || new Date(),
          'AX-LT-011': receivedData['AX-LT-011'] || null,
          'AX-LT-021': receivedData['AX-LT-021'] || null,
          'CW-TT-011': receivedData['CW-TT-011'] || null,
          'CW-TT-021': receivedData['CW-TT-021'] || null,
          'CR-PT-001': receivedData['CR-PT-001'] || null,
        };

        setChartData((prevData) => ({
          ...prevData,
          [chartId]: [...(prevData[chartId] || []), newData],
        }));
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    };

    wsClientRefs.current[chartId].onclose = (event) => {
      console.error(`WebSocket disconnected for chart ${chartId} (code: ${event.code}, reason: ${event.reason}). Reconnecting...`);
      setTimeout(() => setupRealTimeWebSocket(chartId), 1000);
    };
  };

  const addCustomChart = (type) => {
    const newChartId = Date.now();
    const newChart = {
      id: newChartId,
      type,
      data: [],
      xAxisDataKey: '',
      yAxisDataKeys: [{ id: 'left-0', dataKeys: ['AX-LT-011'], range: '0-500', color: "#FF0000", lineStyle: 'solid' }],
    };
    const updatedCharts = [...charts, newChart];
    setCharts(updatedCharts);
    saveChartsToLocalStorage(updatedCharts); // Save the updated charts to localStorage
    setChartDialogOpen(false);
  };

  const deleteChart = (chartId) => {
    const updatedCharts = charts.filter(chart => chart.id !== chartId);
    setCharts(updatedCharts);
    saveChartsToLocalStorage(updatedCharts); // Save the updated charts to localStorage
    // Optionally remove chart data from chartData
    const updatedChartData = { ...chartData };
    delete updatedChartData[chartId];
    setChartData(updatedChartData);
  };

  const openDialog = (chart) => {
    setTempChartData(chart);
    setDialogOpen(true);
  };

  const closeDialog = () => setDialogOpen(false);

  const saveConfiguration = () => {
    const updatedCharts = charts.map((chart) =>
      chart.id === tempChartData.id ? tempChartData : chart
    );
    setCharts(updatedCharts);
    saveChartsToLocalStorage(updatedCharts); // Save the updated configuration to localStorage
    setDialogOpen(false);
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

  const deleteYAxis = (yAxisId) => {
    setTempChartData((prevChart) => ({
      ...prevChart,
      yAxisDataKeys: prevChart.yAxisDataKeys.filter((yAxis) => yAxis.id !== yAxisId),
    }));
  };

  const renderLineChart = (chart) => (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData[chart.id]}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="timestamp" tickFormatter={(tick) => new Date(tick).toLocaleString()} />
        {chart.yAxisDataKeys.map((yAxis) => (
          <YAxis
            key={yAxis.id}
            yAxisId={yAxis.id}
            domain={[0, 500]}
            stroke={yAxis.color}
          />
        ))}
        <Tooltip />
        <Legend />
        {chart.yAxisDataKeys.map((yAxis) =>
          yAxis.dataKeys.map((key) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={yAxis.color}
              yAxisId={yAxis.id}
            />
          ))
        )}
        <Brush height={30} dataKey="timestamp" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderXYChart = (chart) => (
    <ResponsiveContainer width="100%" height={400}>
      <ScatterChart data={chartData[chart.id]}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={chart.xAxisDataKey} />
        {chart.yAxisDataKeys.map((yAxis) => (
          <YAxis
            key={yAxis.id}
            yAxisId={yAxis.id}
            domain={['auto', 'auto']}
            stroke={yAxis.color}
          />
        ))}
        <Tooltip />
        <Legend />
        {chart.yAxisDataKeys.map((yAxis) =>
          yAxis.dataKeys.map((key) => (
            <Scatter
              key={key}
              dataKey={key}
              fill={yAxis.color}
              yAxisId={yAxis.id}
              line
            />
          ))
        )}
      </ScatterChart>
    </ResponsiveContainer>
  );

  const renderChart = (chart) => {
    switch (chart.type) {
      case "Line":
        return renderLineChart(chart);
      case "XY":
        return renderXYChart(chart);
      default:
        return null;
    }
  };

  const handleDateRangeApply = () => {
    setDateDialogOpen(false);
    if (mode === 'A') {
      setupRealTimeWebSocket(currentChartId);
    } else {
      fetchChartData(currentChartId);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container>
        <Box display="flex" justifyContent="flex-end" marginBottom={4}>
          <Button variant="contained" color="primary" onClick={() => setChartDialogOpen(true)}>
            Add Historical - Realtime Custom Chart
          </Button>
        </Box>

        {/* Render Custom Charts */}
        {charts.map((chart) => (
          <Box key={chart.id} marginY={4} position="relative">
            <IconButton
              aria-label="delete"
              onClick={() => deleteChart(chart.id)}
              style={{ position: "absolute", right: 0, top: 0, zIndex: 10 }}
            >
              <DeleteIcon />
            </IconButton>
            <Box border={1} padding={2}>
              {renderChart(chart)}
              <Box display="flex" justifyContent="flex-end" gap={2} marginTop={2}>
                <Button variant="outlined" color="primary" onClick={() => openDialog(chart)}>
                  Configure Chart
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => {
                    setCurrentChartId(chart.id);
                    setDateDialogOpen(true);
                  }}
                >
                  Select Date Range
                </Button>
              </Box>
            </Box>
          </Box>
        ))}

        {/* Add Chart Dialog */}
        <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
          <DialogTitle>Select Chart Type</DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2}>
              <Button variant="contained" onClick={() => addCustomChart('Line')}>Add Line Chart</Button>
              <Button variant="contained" onClick={() => addCustomChart('XY')}>Add XY Chart</Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setChartDialogOpen(false)} color="secondary">Cancel</Button>
          </DialogActions>
        </Dialog>
        <Dialog open={dateDialogOpen} onClose={() => setDateDialogOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Select Date Range</DialogTitle>
          <DialogContent>
            <FormControl component="fieldset">
              <RadioGroup
                row
                value={mode}
                onChange={(e) => setMode(e.target.value)}
              >
                <FormControlLabel value="A" control={<Radio />} label="Real-Time Data Only" />
                <FormControlLabel value="B" control={<Radio />} label="Select Date Range" />
                <FormControlLabel value="C" control={<Radio />} label="Start Date & Continue Real-Time" />
              </RadioGroup>
            </FormControl>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={6}>
                <DateTimePicker
                  label="Start Date and Time"
                  value={startDate}
                  onChange={setStartDate}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={6}>
                <DateTimePicker
                  label="End Date and Time"
                  value={endDate}
                  onChange={setEndDate}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  disabled={mode === 'A' || mode === 'C'}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDateDialogOpen(false)} color="secondary">Cancel</Button>
            <Button onClick={handleDateRangeApply} color="primary" disabled={!startDate || (mode === 'B' && !endDate)}>
              Apply
            </Button>
          </DialogActions>
        </Dialog>
        {tempChartData && (
          <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
            <DialogTitle>Configure Chart</DialogTitle>
            <DialogContent>
              <Box display="flex" flexDirection="column" maxHeight="400px" overflow="auto">
                {tempChartData.type === 'XY' && (
                  <Box marginBottom={2}>
                    <Typography variant="h6">X-Axis</Typography>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>X-Axis Data Key</InputLabel>
                      <Select
                        value={tempChartData.xAxisDataKey}
                        onChange={handleXAxisDataKeyChange}
                      >
                        <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
                        <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
                        <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
                        <MenuItem value="CR-PT-001">CR-PT-001</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                )}
                {tempChartData.yAxisDataKeys.map((yAxis, index) => (
                  <Box key={yAxis.id} display="flex" flexDirection="column" marginBottom={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
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
                        <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
                        <MenuItem value="CR-PT-001">CR-PT-001</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Range</InputLabel>
                      <Select
                        value={yAxis.range}
                        onChange={(event) => handleRangeChange(yAxis.id, event)}
                      >
                        <MenuItem value="0-500">0-500</MenuItem>
                        <MenuItem value="0-100">0-100</MenuItem>
                        <MenuItem value="0-10">0-10</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Line Style</InputLabel>
                      <Select
                        value={yAxis.lineStyle}
                        onChange={(event) => handleLineStyleChange(yAxis.id, event)}
                      >
                        <MenuItem value="solid">Solid</MenuItem>
                        <MenuItem value="dotted">Dotted</MenuItem>
                        <MenuItem value="dashed">Dashed</MenuItem>
                        <MenuItem value="dot-dash">Dot Dash</MenuItem>
                      </Select>
                    </FormControl>
                    <Button onClick={() => openColorPicker(yAxis.id)}>Select Color</Button>
                    {colorPickerOpen && selectedYAxisId === yAxis.id && (
                      <SketchPicker color={yAxis.color} onChangeComplete={handleColorChange} />
                    )}
                  </Box>
                ))}
                <Button variant="contained" color="secondary" onClick={() => setTempChartData((prevChart) => ({
                  ...prevChart,
                  yAxisDataKeys: [
                    ...prevChart.yAxisDataKeys,
                    { id: `left-${prevChart.yAxisDataKeys.length}`, dataKeys: [], range: '0-500', color: '#FF0000', lineStyle: 'solid' },
                  ],
                }))}>
                  Add Y-Axis
                </Button>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeDialog} color="secondary">Cancel</Button>
              <Button onClick={saveConfiguration} color="primary">Save</Button>
            </DialogActions>
          </Dialog>
        )}
      </Container>
    </LocalizationProvider>
  );
};

export default HistoricalCharts;




// import React, { useState, useEffect, useRef } from "react";
// import {
//   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
// } from "recharts";
// import {
//   Container, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
//   FormControl, InputLabel, Select, MenuItem, Typography, IconButton, Grid, TextField, Switch, FormControlLabel,
//   Radio
// } from "@mui/material";
// import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import axios from 'axios';
// import { format} from 'date-fns';
// import { w3cwebsocket as W3CWebSocket } from "websocket";
// import DeleteIcon from '@mui/icons-material/Delete';
// import { SketchPicker } from 'react-color';
// import { differenceInMinutes, differenceInHours } from 'date-fns';
// import { RadioGroup } from "@radix-ui/react-dropdown-menu";

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
//   const [mode, setMode] = useState('A'); // A: Real-Time, B: Start Date & Continue Real-Time, C: Select Date Range


//   const wsClientRefs = useRef({}); // WebSocket references for each chart

//   // Set up WebSocket for real-time data
//   const addCustomChart = (type) => {
//     const newChart = {
//       id: Date.now(),
//       type,
//       yAxisDataKeys: [
//         { id: 'left-0', dataKeys: ['AX-LT-011'], range: '0-500', color: "#FF0000", lineStyle: 'solid' }
//       ],
//     };
  
//     setCharts((prevCharts) => [...prevCharts, newChart]);
  
//     // Automatically set real-time mode (Option A) and start WebSocket for real-time data
//     setupRealTimeWebSocket(newChart.id); // Start real-time WebSocket data streaming for the new chart
//     setRealTimeData(true); // Set the mode to real-time by default
//   };
  
// // Close WebSocket for specific chart
// const closeWebSocket = (chartId) => {
//   if (wsClientRefs.current[chartId]) {
//     wsClientRefs.current[chartId].close(); // Close the WebSocket connection
//     delete wsClientRefs.current[chartId]; // Remove the reference to avoid reconnections
//     console.log(`WebSocket closed for chart ${chartId}`);
//   }
// };

// // Function to apply date range or handle mode change
// const handleDateRangeApply = () => {
//   setDateDialogOpen(false);

//   charts.forEach(chart => {
//     if (mode === 'A') {
//       // Real-Time Data Only: Start WebSocket streaming for each chart
//       setRealTimeData(true);
//       setupRealTimeWebSocket(chart.id); // Setup WebSocket for real-time data
//     } else if (mode === 'B') {
//       // Start Date & Continue Real-Time: Fetch historical data, then start WebSocket streaming
//       setRealTimeData(false);
//       fetchHistoricalData(chart.id); // Fetch historical data and then start WebSocket streaming
//     } else if (mode === 'C') {
//       // Select Date Range: Fetch historical data for the specified range (no real-time)
//       setRealTimeData(false);
//       closeWebSocket(chart.id); // Stop the WebSocket if it's running
//       fetchHistoricalData(chart.id, true); // Fetch historical data with end date
//     }
//   });
// };

// // WebSocket setup
// const setupRealTimeWebSocket = (chartId) => {
//   if (wsClientRefs.current[chartId]) {
//     wsClientRefs.current[chartId].close(); // Close any existing WebSocket connection
//   }

//   wsClientRefs.current[chartId] = new W3CWebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");

//   wsClientRefs.current[chartId].onopen = () => {
//     console.log(`WebSocket connection established for chart ${chartId}`);
//   };

//   wsClientRefs.current[chartId].onmessage = (message) => {
//     try {
//       const receivedData = JSON.parse(message.data);
//       const newData = {
//         timestamp: new Date(receivedData['PLC-TIME-STAMP']) || new Date(),
//         'AX-LT-011': receivedData['AX-LT-011'] || null,
//         'AX-LT-021': receivedData['AX-LT-021'] || null,
//         'CW-TT-011': receivedData['CW-TT-011'] || null,
//         'CW-TT-021': receivedData['CW-TT-021'] || null,
//         'CR-LT-011': receivedData['CR-LT-011'] || null,
//         'CR-PT-011': receivedData['CR-PT-011'] || null,
//         'CR-LT-021': receivedData['CR-LT-021'] || null,
//         'CR-PT-021': receivedData['CR-PT-021'] || null,
//         'CR-PT-001': receivedData['CR-PT-001'] || null,
//         'CR-TT-001': receivedData['CR-TT-001'] || null,
//         'CR-FT-001': receivedData['CR-FT-001'] || null,
//         'CR-TT-002': receivedData['CR-TT-002'] || null,
//         'GS-AT-011': receivedData['GS-AT-011'] || null,
//         'GS-AT-012': receivedData['GS-AT-012'] || null,
//         'GS-PT-011': receivedData['GS-PT-011'] || null,
//         'GS-TT-011': receivedData['GS-TT-011'] || null,
//         'GS-AT-022': receivedData['GS-AT-022'] || null,
//         'GS-PT-021': receivedData['GS-PT-021'] || null,
//         'GS-TT-021': receivedData['GS-TT-021'] || null,
//         'PR-TT-001': receivedData['PR-TT-001'] || null,
//         'PR-TT-061': receivedData['PR-TT-061'] || null,
//         'PR-TT-072': receivedData['PR-TT-072'] || null,
//         'PR-FT-001': receivedData['PR-FT-001'] || null,
//         'PR-AT-001': receivedData['PR-AT-001'] || null,
//         'PR-AT-003': receivedData['PR-AT-003'] || null,
//         'PR-AT-005': receivedData['PR-AT-005'] || null,
//         'DM-LSH-001': receivedData['DM-LSH-001'] || null,
//         'DM-LSL-001': receivedData['DM-LSL-001'] || null,
//         'GS-LSL-021': receivedData['GS-LSL-021'] || null,
//         'GS-LSL-011': receivedData['GS-LSL-011'] || null,
//         'PR-VA-301': receivedData['PR-VA-301'] || null,
//         'PR-VA-352': receivedData['PR-VA-352'] || null,
//         'PR-VA-312': receivedData['PR-VA-312'] || null,
//         'PR-VA-351': receivedData['PR-VA-351'] || null,
//         'PR-VA-361Ain': receivedData['PR-VA-361Ain'] || null,
//         'PR-VA-361Aout': receivedData['PR-VA-361Aout'] || null,
//         'PR-VA-361Bin': receivedData['PR-VA-361Bin'] || null,
//         'PR-VA-361Bout': receivedData['PR-VA-361Bout'] || null,
//         'PR-VA-362Ain': receivedData['PR-VA-362Ain'] || null,
//         'PR-VA-362Aout': receivedData['PR-VA-362Aout'] || null,
//         'PR-VA-362Bin': receivedData['PR-VA-362Bin'] || null,
//         'PR-VA-362Bout': receivedData['PR-VA-362Bout'] || null,
//         'N2-VA-311': receivedData['N2-VA-311'] || null,
//         'GS-VA-311': receivedData['GS-VA-311'] || null,
//         'GS-VA-312': receivedData['GS-VA-312'] || null,
//         'N2-VA-321': receivedData['N2-VA-321'] || null,
//         'GS-VA-321': receivedData['GS-VA-321'] || null,
//         'GS-VA-322': receivedData['GS-VA-322'] || null,
//         'GS-VA-022': receivedData['GS-VA-022'] || null,
//         'GS-VA-021': receivedData['GS-VA-021'] || null,
//         'AX-VA-351': receivedData['AX-VA-351'] || null,
//         'AX-VA-311': receivedData['AX-VA-311'] || null,
//         'AX-VA-312': receivedData['AX-VA-312'] || null,
//         'AX-VA-321': receivedData['AX-VA-321'] || null,
//         'AX-VA-322': receivedData['AX-VA-322'] || null,
//         'AX-VA-391': receivedData['AX-VA-391'] || null,
//         'DM-VA-301': receivedData['DM-VA-301'] || null,
//         'DCDB0-VT-001': receivedData['DCDB0-VT-001'] || null,
//         'DCDB0-CT-001': receivedData['DCDB0-CT-001'] || null,
//         'DCDB1-VT-001': receivedData['DCDB1-VT-001'] || null,
//         'DCDB1-CT-001': receivedData['DCDB1-CT-001'] || null,
//         'DCDB2-VT-001': receivedData['DCDB2-VT-001'] || null,
//         'DCDB2-CT-001': receivedData['DCDB2-CT-001'] || null,
//         'DCDB3-VT-001': receivedData['DCDB3-VT-001'] || null,
//         'DCDB3-CT-001': receivedData['DCDB3-CT-001'] || null,
//         'DCDB4-VT-001': receivedData['DCDB4-VT-001'] || null,
//         'DCDB4-CT-001': receivedData['DCDB4-CT-001'] || null,
//         'RECT-CT-001': receivedData['RECT-CT-001'] || null,
//         'RECT-VT-001': receivedData['RECT-VT-001'] || null,
      
//       };

//       // Append new real-time data to the existing chart data
//       setData((prevData) => ({
//         ...prevData,
//         [chartId]: [...(prevData[chartId] || []), newData], // Append new data for the chart
//       }));
//     } catch (error) {
//       console.error("Error processing WebSocket message:", error);
//     }
//   };

//   wsClientRefs.current[chartId].onclose = (event) => {
//     console.error(`WebSocket disconnected for chart ${chartId} (code: ${event.code}, reason: ${event.reason}).`);
//     // Optionally, remove auto-reconnect here if needed for non-real-time modes.
//   };
// };

  

// // Fetch historical data for Option B or C
// const fetchHistoricalData = async (chartId, fetchEndDate = false) => {
//   if (!startDate || (fetchEndDate && !endDate)) return;
//   setLoading(true);

//   try {
//     const historicalData = [];
//     let currentDate = startDate; // Start from the selected startDate
//     const endDateToUse = fetchEndDate ? endDate : new Date(); // Either use endDate or the current time if not provided

//     // Loop through the time range in hourly increments
//     while (currentDate <= endDateToUse) {
//       const formattedStartDate = format(currentDate, 'yyyy-MM-dd');
//       const formattedStartTime = format(currentDate, 'HH:mm');

//       // Calculate the next hour
//       const nextHour = new Date(currentDate.getTime() + 60 * 60 * 1000);
//       const formattedEndDate = format(Math.min(nextHour.getTime(), endDateToUse.getTime()), 'yyyy-MM-dd');
//       const formattedEndTime = format(Math.min(nextHour.getTime(), endDateToUse.getTime()), 'HH:mm');

//       // Fetch data for the current time range (1-hour increments)
//       const response = await axios.post('https://7ko9a0hlo2.execute-api.us-east-1.amazonaws.com/dev/data', {
//         start_date: formattedStartDate,
//         start_time: formattedStartTime,
//         end_date: formattedEndDate,
//         end_time: formattedEndTime,
//         plot_all: true
//       });

//       // Combine the fetched data into one array
//       const hourlyData = response.data.data.map(item => ({
//         timestamp: item.timestamp,
//         'AX-LT-011': item.payload['AX-LT-011'],
//   'AX-LT-021': item.payload['AX-LT-021'],
//   'CW-TT-011': item.payload['CW-TT-011'],
//   'CW-TT-021': item.payload['CW-TT-021'],
//   'CR-LT-011': item.payload['CR-LT-011'],
//   'CR-PT-011': item.payload['CR-PT-011'],
//   'CR-LT-021': item.payload['CR-LT-021'],
//   'CR-PT-021': item.payload['CR-PT-021'],
//   'CR-PT-001': item.payload['CR-PT-001'],
//   'CR-TT-001': item.payload['CR-TT-001'],
//   'CR-FT-001': item.payload['CR-FT-001'],
//   'CR-TT-002': item.payload['CR-TT-002'],
//   'GS-AT-011': item.payload['GS-AT-011'],
//   'GS-AT-012': item.payload['GS-AT-012'],
//   'GS-PT-011': item.payload['GS-PT-011'],
//   'GS-TT-011': item.payload['GS-TT-011'],
//   'GS-AT-022': item.payload['GS-AT-022'],
//   'GS-PT-021': item.payload['GS-PT-021'],
//   'GS-TT-021': item.payload['GS-TT-021'],
//   'PR-TT-001': item.payload['PR-TT-001'],
//   'PR-TT-061': item.payload['PR-TT-061'],
//   'PR-TT-072': item.payload['PR-TT-072'],
//   'PR-FT-001': item.payload['PR-FT-001'],
//   'PR-AT-001': item.payload['PR-AT-001'],
//   'PR-AT-003': item.payload['PR-AT-003'],
//   'PR-AT-005': item.payload['PR-AT-005'],
//   'DM-LSH-001': item.payload['DM-LSH-001'],
//   'DM-LSL-001': item.payload['DM-LSL-001'],
//   'GS-LSL-021': item.payload['GS-LSL-021'],
//   'GS-LSL-011': item.payload['GS-LSL-011'],
//   'PR-VA-301': item.payload['PR-VA-301'],
//   'PR-VA-352': item.payload['PR-VA-352'],
//   'PR-VA-312': item.payload['PR-VA-312'],
//   'PR-VA-351': item.payload['PR-VA-351'],
//   'PR-VA-361Ain': item.payload['PR-VA-361Ain'],
//   'PR-VA-361Aout': item.payload['PR-VA-361Aout'],
//   'PR-VA-361Bin': item.payload['PR-VA-361Bin'],
//   'PR-VA-361Bout': item.payload['PR-VA-361Bout'],
//   'PR-VA-362Ain': item.payload['PR-VA-362Ain'],
//   'PR-VA-362Aout': item.payload['PR-VA-362Aout'],
//   'PR-VA-362Bin': item.payload['PR-VA-362Bin'],
//   'PR-VA-362Bout': item.payload['PR-VA-362Bout'],
//   'N2-VA-311': item.payload['N2-VA-311'],
//   'GS-VA-311': item.payload['GS-VA-311'],
//   'GS-VA-312': item.payload['GS-VA-312'],
//   'N2-VA-321': item.payload['N2-VA-321'],
//   'GS-VA-321': item.payload['GS-VA-321'],
//   'GS-VA-322': item.payload['GS-VA-322'],
//   'GS-VA-022': item.payload['GS-VA-022'],
//   'GS-VA-021': item.payload['GS-VA-021'],
//   'AX-VA-351': item.payload['AX-VA-351'],
//   'AX-VA-311': item.payload['AX-VA-311'],
//   'AX-VA-312': item.payload['AX-VA-312'],
//   'AX-VA-321': item.payload['AX-VA-321'],
//   'AX-VA-322': item.payload['AX-VA-322'],
//   'AX-VA-391': item.payload['AX-VA-391'],
//   'DM-VA-301': item.payload['DM-VA-301'],
//   'DCDB0-VT-001': item.payload['DCDB0-VT-001'],
//   'DCDB0-CT-001': item.payload['DCDB0-CT-001'],
//   'DCDB1-VT-001': item.payload['DCDB1-VT-001'],
//   'DCDB1-CT-001': item.payload['DCDB1-CT-001'],
//   'DCDB2-VT-001': item.payload['DCDB2-VT-001'],
//   'DCDB2-CT-001': item.payload['DCDB2-CT-001'],
//   'DCDB3-VT-001': item.payload['DCDB3-VT-001'],
//   'DCDB3-CT-001': item.payload['DCDB3-CT-001'],
//   'DCDB4-VT-001': item.payload['DCDB4-VT-001'],
//   'DCDB4-CT-001': item.payload['DCDB4-CT-001'],
//   'RECT-CT-001': item.payload['RECT-CT-001'],
//   'RECT-VT-001': item.payload['RECT-VT-001'],
//       }));

//       historicalData.push(...hourlyData);

//       // Move currentDate forward by one hour
//       currentDate = nextHour;
//     }

//     // Set the accumulated data to plot on the graph
//     setData((prevData) => ({
//       ...prevData,
//       [chartId]: historicalData,
//     }));

//     // If in "Start Date & Continue Real-Time" mode, connect WebSocket after historical data is fetched
//     if (!fetchEndDate) {
//       setupRealTimeWebSocket(chartId);
//     }

//   } catch (error) {
//     console.error('Error fetching historical data:', error);
//   } finally {
//     setLoading(false);
//   }
// };

//   // Date range apply logic based on selected mode



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
//     const chartData = data[chart.id] || []; // Safely access data for the specific chart
//     const totalMinutes = startDate && endDate ? differenceInMinutes(endDate, startDate) : 0;
//     const totalHours = startDate && endDate ? differenceInHours(endDate, startDate) : 0;
  
//     // Ensure that the data is an array before proceeding
//     if (!Array.isArray(chartData)) {
//       console.error("Data is not an array, skipping rendering.");
//       return null;
//     }
  
//     // Safeguard: Ensure that chart.yAxisDataKeys exists and is an array
//     if (!Array.isArray(chart.yAxisDataKeys)) {
//       console.error("yAxisDataKeys is not defined or is not an array.");
//       return null;
//     }
  
//     // For ranges of 1 hour or less, display all data points without filtering
//     if (totalMinutes <= 60) {
//       return (
//         <ResponsiveContainer width="100%" height={400}>
//           <LineChart data={chartData} syncId="syncChart">
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="timestamp" />
//             {chart.yAxisDataKeys.map((yAxis) => (
//               // Ensure yAxis exists before rendering the YAxis component
//               <YAxis
//                 key={yAxis.id}
//                 yAxisId={yAxis.id}
//                 domain={getYAxisDomain(yAxis.range)}
//                 stroke={yAxis.color}
//               />
//             ))}
//             <Tooltip />
//             <Legend />
     
//             {chart.yAxisDataKeys.map((yAxis) =>
//               // Safeguard: Ensure that yAxis.dataKeys is defined and is an array
//               Array.isArray(yAxis.dataKeys) ? (
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
//                         : '5 5'
//                     }
//                     yAxisId={yAxis.id}
//                   />
//                 ))
//               ) : null
//             )}
//           </LineChart>
//         </ResponsiveContainer>
//       );
//     }
  
//     // Helper function to calculate the average of an array of values
//     const calculateAverage = (values) => {
//       if (values.length === 0) return null;
//       const sum = values.reduce((a, b) => a + b, 0);
//       return sum / values.length;
//     };
  
//     // Get granularity (minute or hour) based on the time range
//     const getGranularity = (timestamp, granularity) => {
//       const date = new Date(timestamp);
//       if (granularity === 'minute') {
//         return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
//       } else if (granularity === 'hour') {
//         return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}`;
//       }
//     };
  
//     // Determine the granularity: per minute or per hour
//     const granularity = totalHours <= 24 ? 'minute' : 'hour';
  
//     // Group data points by minute or hour and calculate the average for each group
//     const averagedData = Object.values(
//       chartData.reduce((acc, current) => {
//         const key = getGranularity(current.timestamp, granularity);
  
//         // Initialize entry for this time period if it doesn't exist
//         if (!acc[key]) {
//           acc[key] = {
//             timestamp: current.timestamp,
//             'AX-LT-011': [],
//             'AX-LT-021': [],
//             'CW-TT-011': [],
//             'CW-TT-021': [],
//             'CR-LT-011': [],
//             'CR-PT-011': [],
//             'CR-LT-021': [],
//             'CR-PT-021': [],
//             'CR-PT-001': [],
//             'CR-TT-001': [],
//             'CR-FT-001': [],
//             'CR-TT-002': [],
//             'GS-AT-011': [],
//             'GS-AT-012': [],
//             'GS-PT-011': [],
//             'GS-TT-011': [],
//             'GS-AT-022': [],
//             'GS-PT-021': [],
//             'GS-TT-021': [],
//             'PR-TT-001': [],
//             'PR-TT-061': [],
//             'PR-TT-072': [],
//             'PR-FT-001': [],
//             'PR-AT-001': [],
//             'PR-AT-003': [],
//             'PR-AT-005': [],
//             'DM-LSH-001': [],
//             'DM-LSL-001': [],
//             'GS-LSL-021': [],
//             'GS-LSL-011': [],
//             'PR-VA-301': [],
//             'PR-VA-352': [],
//             'PR-VA-312': [],
//             'PR-VA-351': [],
//             'PR-VA-361Ain': [],
//             'PR-VA-361Aout': [],
//             'PR-VA-361Bin': [],
//             'PR-VA-361Bout': [],
//             'PR-VA-362Ain': [],
//             'PR-VA-362Aout': [],
//             'PR-VA-362Bin': [],
//             'PR-VA-362Bout': [],
//             'N2-VA-311': [],
//             'GS-VA-311': [],
//             'GS-VA-312': [],
//             'N2-VA-321': [],
//             'GS-VA-321': [],
//             'GS-VA-322': [],
//             'GS-VA-022': [],
//             'GS-VA-021': [],
//             'AX-VA-351': [],
//             'AX-VA-311': [],
//             'AX-VA-312': [],
//             'AX-VA-321': [],
//             'AX-VA-322': [],
//             'AX-VA-391': [],
//             'DM-VA-301': [],
//             'DCDB0-VT-001': [],
//             'DCDB0-CT-001': [],
//             'DCDB1-VT-001': [],
//             'DCDB1-CT-001': [],
//             'DCDB2-VT-001': [],
//             'DCDB2-CT-001': [],
//             'DCDB3-VT-001': [],
//             'DCDB3-CT-001': [],
//             'DCDB4-VT-001': [],
//             'DCDB4-CT-001': [],
//             'RECT-CT-001': [],
//             'RECT-VT-001': [],
//             'PLC-TIME-STAMP': []
//           };
//         }
        
  
// // Collect data points for each key in this minute/hour
// const dataKeys = [
//   'AX-LT-011', 'AX-LT-021', 'CW-TT-011', 'CW-TT-021', 'CR-LT-011', 'CR-PT-011',
//   'CR-LT-021', 'CR-PT-021', 'CR-PT-001', 'CR-TT-001', 'CR-FT-001', 'CR-TT-002',
//   'GS-AT-011', 'GS-AT-012', 'GS-PT-011', 'GS-TT-011', 'GS-AT-022', 'GS-PT-021',
//   'GS-TT-021', 'PR-TT-001', 'PR-TT-061', 'PR-TT-072', 'PR-FT-001', 'PR-AT-001',
//   'PR-AT-003', 'PR-AT-005', 'DM-LSH-001', 'DM-LSL-001', 'GS-LSL-021', 'GS-LSL-011',
//   'PR-VA-301', 'PR-VA-352', 'PR-VA-312', 'PR-VA-351', 'PR-VA-361Ain', 'PR-VA-361Aout',
//   'PR-VA-361Bin', 'PR-VA-361Bout', 'PR-VA-362Ain', 'PR-VA-362Aout', 'PR-VA-362Bin',
//   'PR-VA-362Bout', 'N2-VA-311', 'GS-VA-311', 'GS-VA-312', 'N2-VA-321', 'GS-VA-321',
//   'GS-VA-322', 'GS-VA-022', 'GS-VA-021', 'AX-VA-351', 'AX-VA-311', 'AX-VA-312',
//   'AX-VA-321', 'AX-VA-322', 'AX-VA-391', 'DM-VA-301', 'DCDB0-VT-001', 'DCDB0-CT-001',
//   'DCDB1-VT-001', 'DCDB1-CT-001', 'DCDB2-VT-001', 'DCDB2-CT-001', 'DCDB3-VT-001',
//   'DCDB3-CT-001', 'DCDB4-VT-001', 'DCDB4-CT-001', 'RECT-CT-001', 'RECT-VT-001'
// ];

// dataKeys.forEach((dataKey) => {
//   if (current[dataKey] !== null && current[dataKey] !== undefined) {
//     acc[key][dataKey].push(current[dataKey]); // Add the value to the array for averaging later
//   }
// });

  
//         return acc;
//       }, {})
//     ).map(item => {
//       // Calculate the average for each key
//       ['AX-LT-011', 'AX-LT-021', 'CW-TT-011', 'CW-TT-021', 'CR-LT-011', 'CR-PT-011',
//   'CR-LT-021', 'CR-PT-021', 'CR-PT-001', 'CR-TT-001', 'CR-FT-001', 'CR-TT-002',
//   'GS-AT-011', 'GS-AT-012', 'GS-PT-011', 'GS-TT-011', 'GS-AT-022', 'GS-PT-021',
//   'GS-TT-021', 'PR-TT-001', 'PR-TT-061', 'PR-TT-072', 'PR-FT-001', 'PR-AT-001',
//   'PR-AT-003', 'PR-AT-005', 'DM-LSH-001', 'DM-LSL-001', 'GS-LSL-021', 'GS-LSL-011',
//   'PR-VA-301', 'PR-VA-352', 'PR-VA-312', 'PR-VA-351', 'PR-VA-361Ain', 'PR-VA-361Aout',
//   'PR-VA-361Bin', 'PR-VA-361Bout', 'PR-VA-362Ain', 'PR-VA-362Aout', 'PR-VA-362Bin',
//   'PR-VA-362Bout', 'N2-VA-311', 'GS-VA-311', 'GS-VA-312', 'N2-VA-321', 'GS-VA-321',
//   'GS-VA-322', 'GS-VA-022', 'GS-VA-021', 'AX-VA-351', 'AX-VA-311', 'AX-VA-312',
//   'AX-VA-321', 'AX-VA-322', 'AX-VA-391', 'DM-VA-301', 'DCDB0-VT-001', 'DCDB0-CT-001',
//   'DCDB1-VT-001', 'DCDB1-CT-001', 'DCDB2-VT-001', 'DCDB2-CT-001', 'DCDB3-VT-001',
//   'DCDB3-CT-001', 'DCDB4-VT-001', 'DCDB4-CT-001', 'RECT-CT-001', 'RECT-VT-001'].forEach((dataKey) => {
//         if (item[dataKey].length > 0) {
//           item[dataKey] = calculateAverage(item[dataKey]); // Replace the array with the average
//         } else {
//           item[dataKey] = null; // Handle cases where no data was available for this key in that time period
//         }
//       });
//       return item;
//     });
  
//     // Render the chart with averaged data
//     return (
//       <ResponsiveContainer width="100%" height={400}>
//         <LineChart data={averagedData} syncId="syncChart">
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
        
//           {chart.yAxisDataKeys.map((yAxis) =>
//             Array.isArray(yAxis.dataKeys) ? (
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
//             ) : null
//           )}
//         </LineChart>
//       </ResponsiveContainer>
//     );
//   };
  
  


//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//     <Container>
//       <Box display="flex" justifyContent="flex-end" marginBottom={4}>
//         <Button variant="contained" color="secondary" onClick={() => setChartDialogOpen(true)}>
//           Add Line Chart
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
//               <Button variant="outlined" color="secondary" onClick={() => openDialog(chart)}>
//                 Configure Chart
//               </Button>
//               <Button variant="outlined" color="secondary" onClick={() => setDateDialogOpen(true)}>
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
//                       onChange={(event) => handleLineStyleChange(yAxis.id, event)}
//                     >
//                       <MenuItem value="solid">Solid</MenuItem>
//                       <MenuItem value="dotted">Dotted</MenuItem>
//                       <MenuItem value="dashed">Dashed</MenuItem>
//                     </Select>
//                   </FormControl>
//                   <Button onClick={() => openColorPicker(yAxis.id)} color="secondary">Select Color</Button>
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
   
//               {/* Date Range Selection Dialog */}
//               <Dialog open={dateDialogOpen} onClose={() => setDateDialogOpen(false)} fullWidth maxWidth="sm">
//               <DialogTitle>Select Date Range</DialogTitle>
//               <DialogContent>
//                 <FormControl component="fieldset">
//                   <RadioGroup
//                     row
//                     value={mode}
//                     onChange={(e) => setMode(e.target.value)}
//                   >
//                     <FormControlLabel value="A" control={<Radio />} label="Real-Time Data Only" />
//                     <FormControlLabel value="B" control={<Radio />} label="Start Date & Continue Real-Time" />
//                     <FormControlLabel value="C" control={<Radio />} label="Select Date Range" />
//                   </RadioGroup>
//                 </FormControl>
//                 <Grid container spacing={2} alignItems="center">
//                   <Grid item xs={6}>
//                     <DateTimePicker
//                       label="Start Date and Time"
//                       value={startDate}
//                       onChange={setStartDate}
//                       renderInput={(params) => <TextField {...params} fullWidth />}
//                       disabled={mode === 'A'}
//                     />
//                   </Grid>
//                   <Grid item xs={6}>
//                     <DateTimePicker
//                       label="End Date and Time"
//                       value={endDate}
//                       onChange={setEndDate}
//                       renderInput={(params) => <TextField {...params} fullWidth />}
//                       disabled={mode !== 'C'}
//                     />
//                   </Grid>
//                 </Grid>
//               </DialogContent>
//               <DialogActions>
//                 <Button onClick={() => setDateDialogOpen(false)} color="secondary">Cancel</Button>
//                 <Button onClick={handleDateRangeApply} color="primary" disabled={!startDate || (mode === 'C' && !endDate)}>
//                   Apply
//                 </Button>
//               </DialogActions>
//             </Dialog>


//     {/* Render charts for each chart */}
//     {charts.map((chart) => (
//       <Box key={chart.id} marginY={4}>
//         {renderChart(chart.id)}
//       </Box>
//     ))}

//     </Container>
//   </LocalizationProvider>
  
//   );
// };

// export default CustomCharts;




// import React, { useState, useEffect, useRef } from "react";
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, Brush } from "recharts";
// import {
//   Container, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
//   FormControl, InputLabel, Select, MenuItem, Typography, IconButton, Grid, TextField, RadioGroup, FormControlLabel, Radio
// } from "@mui/material";
// import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import { SketchPicker } from 'react-color';
// import DeleteIcon from '@mui/icons-material/Delete';
// import { w3cwebsocket as W3CWebSocket } from "websocket";
// import axios from 'axios';
// import { format, parseISO } from 'date-fns';

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// const HistoricalCharts = () => {
//   const [charts, setCharts] = useState([]); // Stores custom chart configurations
//   const [chartData, setChartData] = useState({}); // Stores data for each chart independently
//   const [tempChartData, setTempChartData] = useState(null);
//   const [chartDialogOpen, setChartDialogOpen] = useState(false);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [colorPickerOpen, setColorPickerOpen] = useState(false);
//   const [selectedYAxisId, setSelectedYAxisId] = useState(null);
//   const [dateDialogOpen, setDateDialogOpen] = useState(false);
//   const [startDate, setStartDate] = useState(null);
//   const [endDate, setEndDate] = useState(null);
//   const [mode, setMode] = useState('A'); // A for real-time, B for historical range, C for real-time + historical
//   const [currentChartId, setCurrentChartId] = useState(null); // The ID of the chart currently configuring date range
//   const wsClientRefs = useRef({}); // Use a map of refs for WebSocket clients

//   // Load saved charts from localStorage on component mount
//   useEffect(() => {
//     const savedCharts = localStorage.getItem('customCharts');
//     if (savedCharts) {
//       setCharts(JSON.parse(savedCharts));
//     }
//   }, []);

//   // Save chart configurations (without data points) to localStorage whenever charts are updated
//   const saveChartsToLocalStorage = (updatedCharts) => {
//     const chartConfigurations = updatedCharts.map(chart => ({
//       id: chart.id,
//       type: chart.type,
//       xAxisDataKey: chart.xAxisDataKey,
//       yAxisDataKeys: chart.yAxisDataKeys,
//     }));
//     localStorage.setItem('customCharts', JSON.stringify(chartConfigurations));
//   };

//   const fetchHistoricalData = async (chartId) => {
//     if (!startDate) return;
  
//     try {
//       // Format date and time as 'yyyy-MM-ddTHH:mm:ss'
//       const formattedStartDateTime = format(startDate, "yyyy-MM-dd'T'HH:mm:ss");
//       const requestData = {
//         start_date_time: formattedStartDateTime,
//       };
  
//       if (mode === 'B' && endDate) {
//         const formattedEndDateTime = format(endDate, "yyyy-MM-dd'T'HH:mm:ss");
//         requestData.end_date_time = formattedEndDateTime;
//       }
  
//       const response = await axios.post(
//         'https://7ko9a0hlo2.execute-api.us-east-1.amazonaws.com/dev/data',
//         requestData
//       );
  
//       const historicalData = response.data.data.map(item => ({
//         timestamp: parseISO(item.payload['PLC-TIME-STAMP']),
//         'AX-LT-011': item.payload['AX-LT-011'],
//         'AX-LT-021': item.payload['AX-LT-021'],
//         'CW-TT-011': item.payload['CW-TT-011'],
//         'CW-TT-021': item.payload['CW-TT-021'],
//       }));
  
//       setChartData(prevData => ({
//         ...prevData,
//         [chartId]: historicalData,
//       }));
  
//       if (mode === 'C') {
//         setupRealTimeWebSocket(chartId);
//       }
//     } catch (error) {
//       console.error('Error fetching historical data:', error);
//     }
//   };
  


//   const setupRealTimeWebSocket = (chartId) => {
//     if (wsClientRefs.current[chartId]) {
//       wsClientRefs.current[chartId].close();
//     }

//     wsClientRefs.current[chartId] = new W3CWebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");

//     wsClientRefs.current[chartId].onopen = () => {
//       console.log(`WebSocket connection established for chart ${chartId}`);
//     };

//     wsClientRefs.current[chartId].onmessage = (message) => {
//       try {
//         const receivedData = JSON.parse(message.data);
//         const newData = {
//           timestamp: parseISO(receivedData['PLC-TIME-STAMP']) || new Date(),
//           'AX-LT-011': receivedData['AX-LT-011'] || null,
//           'AX-LT-021': receivedData['AX-LT-021'] || null,
//           'CW-TT-011': receivedData['CW-TT-011'] || null,
//           'CW-TT-021': receivedData['CW-TT-021'] || null,
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
//       console.error(`WebSocket disconnected for chart ${chartId} (code: ${event.code}, reason: ${event.reason}). Reconnecting...`);
//       setTimeout(() => setupRealTimeWebSocket(chartId), 1000);
//     };
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
//     const updatedCharts = [...charts, newChart];
//     setCharts(updatedCharts);
//     saveChartsToLocalStorage(updatedCharts); // Save the updated charts to localStorage
//     setChartDialogOpen(false);
//   };

//   const deleteChart = (chartId) => {
//     const updatedCharts = charts.filter(chart => chart.id !== chartId);
//     setCharts(updatedCharts);
//     saveChartsToLocalStorage(updatedCharts); // Save the updated charts to localStorage
//     // Optionally remove chart data from chartData
//     const updatedChartData = { ...chartData };
//     delete updatedChartData[chartId];
//     setChartData(updatedChartData);
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
//     saveChartsToLocalStorage(updatedCharts); // Save the updated configuration to localStorage
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

//   const deleteYAxis = (yAxisId) => {
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKeys: prevChart.yAxisDataKeys.filter((yAxis) => yAxis.id !== yAxisId),
//     }));
//   };

//   const renderLineChart = (chart) => (
//     <ResponsiveContainer width="100%" height={400}>
//       <LineChart data={chartData[chart.id]}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey="timestamp" tickFormatter={(tick) => new Date(tick).toLocaleString()} />
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
//         <Brush height={30} dataKey="timestamp" stroke="#8884d8" />
//       </LineChart>
//     </ResponsiveContainer>
//   );

//   const renderXYChart = (chart) => (
//     <ResponsiveContainer width="100%" height={400}>
//       <ScatterChart data={chartData[chart.id]}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey={chart.xAxisDataKey} />
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

//   const renderChart = (chart) => {
//     switch (chart.type) {
//       case "Line":
//         return renderLineChart(chart);
//       case "XY":
//         return renderXYChart(chart);
//       default:
//         return null;
//     }
//   };

//   const handleDateRangeApply = () => {
//     setDateDialogOpen(false);
//     if (mode === 'A') {
//       setupRealTimeWebSocket(currentChartId);
//     } else {
//       fetchHistoricalData(currentChartId);
//     }
//   };

//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       <Container>
//         <Box display="flex" justifyContent="flex-end" marginBottom={4}>
//           <Button variant="contained" color="primary" onClick={() => setChartDialogOpen(true)}>
//             Add HIstorical - Realtime Custom Chart
//           </Button>
//         </Box>

//         {/* Render Custom Charts */}
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
//               <Box display="flex" justifyContent="flex-end" gap={2} marginTop={2}>
//                 <Button variant="outlined" color="primary" onClick={() => openDialog(chart)}>
//                   Configure Chart
//                 </Button>
//                 <Button
//                   variant="outlined"
//                   color="secondary"
//                   onClick={() => {
//                     setCurrentChartId(chart.id);
//                     setDateDialogOpen(true);
//                   }}
//                 >
//                   Select Date Range
//                 </Button>
//               </Box>
//             </Box>
//           </Box>
//         ))}

//         {/* Add Chart Dialog */}
//         <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
//           <DialogTitle>Select Chart Type</DialogTitle>
//           <DialogContent>
//             <Box display="flex" flexDirection="column" gap={2}>
//               <Button variant="contained" onClick={() => addCustomChart('Line')}>Add Line Chart</Button>
//               <Button variant="contained" onClick={() => addCustomChart('XY')}>Add XY Chart</Button>
//             </Box>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setChartDialogOpen(false)} color="secondary">Cancel</Button>
//           </DialogActions>
//         </Dialog>

//         {/* Date Range Selection Dialog */}
//         <Dialog open={dateDialogOpen} onClose={() => setDateDialogOpen(false)} fullWidth maxWidth="sm">
//           <DialogTitle>Select Date Range</DialogTitle>
//           <DialogContent>
//             <FormControl component="fieldset">
//               <RadioGroup
//                 row
//                 value={mode}
//                 onChange={(e) => setMode(e.target.value)}
//               >
//                 <FormControlLabel value="A" control={<Radio />} label="Real-Time Data Only" />
//                 <FormControlLabel value="B" control={<Radio />} label="Select Date Range" />
//                 <FormControlLabel value="C" control={<Radio />} label="Start Date & Continue Real-Time" />
//               </RadioGroup>
//             </FormControl>
//             <Grid container spacing={2} alignItems="center">
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
//                   disabled={mode === 'A' || mode === 'C'}
//                 />
//               </Grid>
//             </Grid>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setDateDialogOpen(false)} color="secondary">Cancel</Button>
//             <Button onClick={handleDateRangeApply} color="primary" disabled={!startDate || (mode === 'B' && !endDate)}>
//               Apply
//             </Button>
//           </DialogActions>
//         </Dialog>

//         {/* Chart Configuration Dialog */}
//         {tempChartData && (
//           <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
//             <DialogTitle>Configure Chart</DialogTitle>
//             <DialogContent>
//               <Box display="flex" flexDirection="column" maxHeight="400px" overflow="auto">
//                 {tempChartData.type === 'XY' && (
//                   <Box marginBottom={2}>
//                     <Typography variant="h6">X-Axis</Typography>
//                     <FormControl fullWidth margin="normal">
//                       <InputLabel>X-Axis Data Key</InputLabel>
//                       <Select
//                         value={tempChartData.xAxisDataKey}
//                         onChange={handleXAxisDataKeyChange}
//                       >
//                         <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//                         <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
//                         <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
//                         <MenuItem value="CR-PT-001">CR-PT-001</MenuItem>
//                       </Select>
//                     </FormControl>
//                   </Box>
//                 )}
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
//                         <MenuItem value="CR-PT-001">CR-PT-001</MenuItem>
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
//                       </Select>
//                     </FormControl>
//                     <Button onClick={() => openColorPicker(yAxis.id)}>Select Color</Button>
//                     {colorPickerOpen && selectedYAxisId === yAxis.id && (
//                       <SketchPicker color={yAxis.color} onChangeComplete={handleColorChange} />
//                     )}
//                   </Box>
//                 ))}
//                 <Button variant="contained" color="secondary" onClick={() => setTempChartData((prevChart) => ({
//                   ...prevChart,
//                   yAxisDataKeys: [
//                     ...prevChart.yAxisDataKeys,
//                     { id: `left-${prevChart.yAxisDataKeys.length}`, dataKeys: [], range: '0-500', color: '#FF0000', lineStyle: 'solid' },
//                   ],
//                 }))}>
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
//       </Container>
//     </LocalizationProvider>
//   );
// };

// export default HistoricalCharts;



// import React, { useState, useEffect } from "react";
// import { format } from "date-fns";
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
// import {
//   Container,
//   Box,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Typography,
//   Button,
//   IconButton,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
// } from "@mui/material";
// import DeleteIcon from '@mui/icons-material/Delete';
// import Header from "../Header";
// import { useWebSocket } from "src/WebSocketProvider";

// const Barcharts = () => {
//   const websocketData = useWebSocket();
//   const [data, setData] = useState([]);
//   const [yAxisDataKeys, setYAxisDataKeys] = useState([
//     { id: 'left-0', dataKeys: ['AX-LT-011'], range: '0-500', color: "#FF0000" }
//   ]);
//   const [sortData, setSortData] = useState(false);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [tempYAxisDataKeys, setTempYAxisDataKeys] = useState([...yAxisDataKeys]);

//   useEffect(() => {
//     const { date, time } = convertUTCToIST(websocketData["PLC-TIME-STAMP"]);
//     const updatedData = {
//       ...websocketData,
//       id: data.length + 1,
//       date,
//       time,
//     };

//     setData((prevData) => [...prevData, updatedData]);
//   }, [websocketData]);

//   // Function to convert UTC to IST and separate Date and Time
//   const convertUTCToIST = (utcTime) => {
//     if (!utcTime) return { date: null, time: null };

//     const istTimezone = "Asia/Kolkata"; // IST timezone
//     const formattedDate = format(new Date(utcTime), "yyyy-MM-dd", {
//       timeZone: istTimezone,
//     });
//     const formattedTime = format(new Date(utcTime), "HH:mm:ss", {
//       timeZone: istTimezone,
//     });

//     return { date: formattedDate, time: formattedTime };
//   };

//   const handleDataKeyChange = (yAxisId, event) => {
//     const { value } = event.target;
//     setTempYAxisDataKeys((prevYAxisDataKeys) =>
//       prevYAxisDataKeys.map((yAxis) =>
//         yAxis.id === yAxisId ? { ...yAxis, dataKeys: value } : yAxis
//       )
//     );
//   };

//   const handleRangeChange = (yAxisId, event) => {
//     const { value } = event.target;
//     setTempYAxisDataKeys((prevYAxisDataKeys) =>
//       prevYAxisDataKeys.map((yAxis) =>
//         yAxis.id === yAxisId ? { ...yAxis, range: value } : yAxis
//       )
//     );
//   };

//   const addYAxis = () => {
//     setTempYAxisDataKeys((prevYAxisDataKeys) => [
//       ...prevYAxisDataKeys,
//       {
//         id: `left-${prevYAxisDataKeys.length}`,
//         dataKeys: [],
//         range: '0-500',
//         color: yAxisColors[prevYAxisDataKeys.length % yAxisColors.length]
//       },
//     ]);
//   };

//   const deleteYAxis = (yAxisId) => {
//     setTempYAxisDataKeys((prevYAxisDataKeys) =>
//       prevYAxisDataKeys.filter((yAxis) => yAxis.id !== yAxisId)
//     );
//   };

//   const openDialog = () => {
//     setTempYAxisDataKeys([...yAxisDataKeys]);
//     setDialogOpen(true);
//   };

//   const closeDialog = () => {
//     setDialogOpen(false);
//   };

//   const saveConfiguration = () => {
//     setYAxisDataKeys([...tempYAxisDataKeys]);
//     setDialogOpen(false);
//   };

//   // Sort data if sortData is true
//   const sortedData = sortData
//     ? [...data].sort((a, b) => new Date(a.time) - new Date(b.time))
//     : data;

//     const dataKeys = [
//       "AX-LT-011",
//       "AX-LT-021",
//       "CW-TT-011",
//       "PR-AT-005",
//       "CR-TT-001",
//       "CR-FT-001",
//       "CR-TT-002",
//       "GS-AT-011",
//       "GS-AT-012",
//       "GS-PT-011",
//       "GS-TT-011",
//       "GS-AT-022",
//       "GS-PT-021",
//       "GS-TT-021",
//       "PR-TT-001",
//       "PR-TT-061",
//       "PR-TT-072",
//       "PR-FT-001",
//       "PR-AT-001",
//       "PR-AT-003",
//       "DM-LSH-001",
//       "DM-LSL-001",
//       "GS-LSL-021",
//       "GS-LSL-011",
//       "PR-VA-301",
//       "PR-VA-352",
//       "PR-VA-312",
//       "PR-VA-351",
//       "PR-VA-361Ain",
//       "PR-VA-361Aout",
//       "PR-VA-361Bin",
//       "PR-VA-361Bout",
//       "PR-VA-362Ain",
//       "PR-VA-362Aout",
//       "PR-VA-362Bin",
//       "PR-VA-362Bout",
//       "N2-VA-311",
//       "GS-VA-311",
//       "GS-VA-312",
//       "N2-VA-321",
//       "GS-VA-321",
//       "GS-VA-322",
//       "GS-VA-022",
//       "GS-VA-021",
//       "AX-VA-351",
//       "AX-VA-311",
//       "AX-VA-312",
//       "AX-VA-321",
//       "AX-VA-322",
//       "AX-VA-391",
//       "DM-VA-301",
//       "DCDB0-VT-001",
//       "DCDB0-CT-001",
//       "DCDB1-VT-001",
//       "DCDB1-CT-001",
//       "DCDB2-VT-001",
//       "DCDB2-CT-001",
//       "DCDB3-VT-001",
//       "DCDB3-CT-001",
//       "DCDB4-VT-001",
//       "DCDB4-CT-001",
//       "RECT-CT-001",
//       "RECT-VT-001",
//       // "PLC-TIME-STAMP",
//     ];

//   const yAxisColors = ["#FF0000", "#00FF00", "#0000FF", "#FF00FF", "#00FFFF", "#FFFF00"]; // Different colors for Y-axes

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

//   // MenuProps for scrollable dropdown
//   const MenuProps = {
//     PaperProps: {
//       style: {
//         maxHeight: 224,
//         width: 250,
//       },
//     },
//   };

//   return (
//     <Container>
//       <Box display="flex" justifyContent="flex-end" marginBottom={4}>
//         <Button variant="contained" color="primary" onClick={openDialog}>
//           Configure Y-Axes
//         </Button>
//       </Box>
//       <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
//         <DialogTitle>Configure Y-Axes</DialogTitle>
//         <DialogContent>
//           <Box display="flex" flexDirection="column" maxHeight="400px" overflow="auto">
//             {tempYAxisDataKeys.map((yAxis, index) => (
//               <Box key={yAxis.id} display="flex" flexDirection="column" marginBottom={2}>
//                 <Box display="flex" justifyContent="space-between" alignItems="center">
//                   <Typography variant="h6">Y-Axis {index + 1}</Typography>
//                   <IconButton onClick={() => deleteYAxis(yAxis.id)}>
//                     <DeleteIcon />
//                   </IconButton>
//                 </Box>
//                 <FormControl>
//                   <InputLabel>Data Keys</InputLabel>
//                   <Select
//                     multiple
//                     value={yAxis.dataKeys}
//                     onChange={(event) => handleDataKeyChange(yAxis.id, event)}
//                     MenuProps={MenuProps}
//                   >
//                     {dataKeys.map((key) => (
//                       <MenuItem key={key} value={key}>
//                         {key}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>
//                 <FormControl>
//                   <InputLabel>Range</InputLabel>
//                   <Select
//                     value={yAxis.range}
//                     onChange={(event) => handleRangeChange(yAxis.id, event)}
//                     MenuProps={MenuProps}
//                   >
//                     <MenuItem value="0-500">0-500</MenuItem>
//                     <MenuItem value="0-100">0-100</MenuItem>
//                     <MenuItem value="0-10">0-10</MenuItem>
//                   </Select>
//                 </FormControl>
//               </Box>
//             ))}
//           </Box>
//           <Box>
//             <Button variant="contained" color="primary" onClick={addYAxis}>
//               Add Y-Axis
//             </Button>
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={closeDialog} color="primary">
//             Cancel
//           </Button>
//           <Button onClick={saveConfiguration} color="primary">
//             OK
//           </Button>
//         </DialogActions>
//       </Dialog>
//       <ResponsiveContainer width="100%" height={500}>
//         <LineChart data={sortedData}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="time" />
//           {yAxisDataKeys.map((yAxis) => (
//             <YAxis
//               key={yAxis.id}
//               yAxisId={yAxis.id}
//               orientation="left"
//               domain={getYAxisDomain(yAxis.range)}
//               stroke={yAxis.color}
//             />
//           ))}
//           <Tooltip />
//           <Legend />
//           {yAxisDataKeys.map((yAxis) =>
//             yAxis.dataKeys.map((key) => (
//               <Line
//                 key={key}
//                 type="monotone"
//                 dataKey={key}
//                 stroke={yAxis.color}
//                 yAxisId={yAxis.id}
//               />
//             ))
//           )}
//         </LineChart>
//       </ResponsiveContainer>
//     </Container>
//   );
// };

// export default Barcharts;








// import React, { useState, useRef } from "react";
// import {
//   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush
// } from "recharts";
// import {
//   Container, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
//   FormControl, InputLabel, Select, MenuItem, Typography, IconButton, Grid, TextField, FormControlLabel,
//   Radio
// } from "@mui/material";
// import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import axios from 'axios';
// import { format} from 'date-fns';
// import { w3cwebsocket as W3CWebSocket } from "websocket";
// import DeleteIcon from '@mui/icons-material/Delete';
// import { SketchPicker } from 'react-color';
// import { differenceInMinutes, differenceInHours } from 'date-fns';
// import { RadioGroup } from "@radix-ui/react-dropdown-menu";

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
//   const [mode, setMode] = useState('A'); // A: Real-Time, B: Start Date & Continue Real-Time, C: Select Date Range


//   const wsClientRefs = useRef({}); // WebSocket references for each chart

//   // Set up WebSocket for real-time data
//   const addCustomChart = (type) => {
//     const newChart = {
//       id: Date.now(),
//       type,
//       yAxisDataKeys: [
//         { id: 'left-0', dataKeys: ['AX-LT-011'], range: '0-500', color: "#FF0000", lineStyle: 'solid' }
//       ],
//     };
  
//     setCharts((prevCharts) => [...prevCharts, newChart]);
  
//     // Automatically set real-time mode (Option A) and start WebSocket for real-time data
//     setupRealTimeWebSocket(newChart.id); // Start real-time WebSocket data streaming for the new chart
//     setRealTimeData(true); // Set the mode to real-time by default
//   };
  
// // Close WebSocket for specific chart
// const closeWebSocket = (chartId) => {
//   if (wsClientRefs.current[chartId]) {
//     wsClientRefs.current[chartId].close(); // Close the WebSocket connection
//     delete wsClientRefs.current[chartId]; // Remove the reference to avoid reconnections
//     console.log(`WebSocket closed for chart ${chartId}`);
//   }
// };

// // Function to apply date range or handle mode change
// const handleDateRangeApply = () => {
//   setDateDialogOpen(false);

//   charts.forEach(chart => {
//     if (mode === 'A') {
//       // Real-Time Data Only: Start WebSocket streaming for each chart
//       setRealTimeData(true);
//       setupRealTimeWebSocket(chart.id); // Setup WebSocket for real-time data
//     } else if (mode === 'B') {
//       // Start Date & Continue Real-Time: Fetch historical data, then start WebSocket streaming
//       setRealTimeData(false);
//       fetchHistoricalData(chart.id); // Fetch historical data and then start WebSocket streaming
//     } else if (mode === 'C') {
//       // Select Date Range: Fetch historical data for the specified range (no real-time)
//       setRealTimeData(false);
//       closeWebSocket(chart.id); // Stop the WebSocket if it's running
//       fetchHistoricalData(chart.id, true); // Fetch historical data with end date
//     }
//   });
// };

// // WebSocket setup
// const setupRealTimeWebSocket = (chartId) => {
//   if (wsClientRefs.current[chartId]) {
//     wsClientRefs.current[chartId].close(); // Close any existing WebSocket connection
//   }

//   wsClientRefs.current[chartId] = new W3CWebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");

//   wsClientRefs.current[chartId].onopen = () => {
//     console.log(`WebSocket connection established for chart ${chartId}`);
//   };

//   wsClientRefs.current[chartId].onmessage = (message) => {
//     try {
//       const receivedData = JSON.parse(message.data);
//       const newData = {
//         timestamp: new Date(receivedData['PLC-TIME-STAMP']) || new Date(),
//         'AX-LT-011': receivedData['AX-LT-011'] || null,
//         'AX-LT-021': receivedData['AX-LT-021'] || null,
//         'CW-TT-011': receivedData['CW-TT-011'] || null,
//         'CW-TT-021': receivedData['CW-TT-021'] || null,
//         'RECT-CT-001': receivedData['RECT-CT-001'] || null,
//         'RECT-VT-001': receivedData['RECT-VT-001'] || null,
//       };

//       // Append new real-time data to the existing chart data
//       setData((prevData) => ({
//         ...prevData,
//         [chartId]: [...(prevData[chartId] || []), newData], // Append new data for the chart
//       }));
//     } catch (error) {
//       console.error("Error processing WebSocket message:", error);
//     }
//   };

//   wsClientRefs.current[chartId].onclose = (event) => {
//     console.error(`WebSocket disconnected for chart ${chartId} (code: ${event.code}, reason: ${event.reason}).`);
//     // Optionally, remove auto-reconnect here if needed for non-real-time modes.
//   };
// };

  

// // Fetch historical data for Option B or C
// const fetchHistoricalData = async (chartId, fetchEndDate = false) => {
//   if (!startDate || (fetchEndDate && !endDate)) return;
//   setLoading(true);

//   try {
//     const historicalData = [];
//     let currentDate = startDate; // Start from the selected startDate
//     const endDateToUse = fetchEndDate ? endDate : new Date(); // Either use endDate or the current time if not provided

//     // Loop through the time range in hourly increments
//     while (currentDate <= endDateToUse) {
//       const formattedStartDate = format(currentDate, 'yyyy-MM-dd');
//       const formattedStartTime = format(currentDate, 'HH:mm');

//       // Calculate the next hour
//       const nextHour = new Date(currentDate.getTime() + 60 * 60 * 1000);
//       const formattedEndDate = format(Math.min(nextHour.getTime(), endDateToUse.getTime()), 'yyyy-MM-dd');
//       const formattedEndTime = format(Math.min(nextHour.getTime(), endDateToUse.getTime()), 'HH:mm');

//       // Fetch data for the current time range (1-hour increments)
//       const response = await axios.post('https://7ko9a0hlo2.execute-api.us-east-1.amazonaws.com/dev/data', {
//         start_date: formattedStartDate,
//         start_time: formattedStartTime,
//         end_date: formattedEndDate,
//         end_time: formattedEndTime,
//         plot_all: true
//       });

//       // Combine the fetched data into one array
//       const hourlyData = response.data.data.map(item => ({
//         timestamp: item.timestamp,
//         'AX-LT-011': item.payload['AX-LT-011'],
//         'AX-LT-021': item.payload['AX-LT-021'],
//         'CW-TT-011': item.payload['CW-TT-011'],
//         'CR-LT-011': item.payload['CR-LT-011'],
//       }));

//       historicalData.push(...hourlyData);

//       // Move currentDate forward by one hour
//       currentDate = nextHour;
//     }

//     // Set the accumulated data to plot on the graph
//     setData((prevData) => ({
//       ...prevData,
//       [chartId]: historicalData,
//     }));

//     // If in "Start Date & Continue Real-Time" mode, connect WebSocket after historical data is fetched
//     if (!fetchEndDate) {
//       setupRealTimeWebSocket(chartId);
//     }

//   } catch (error) {
//     console.error('Error fetching historical data:', error);
//   } finally {
//     setLoading(false);
//   }
// };

//   // Date range apply logic based on selected mode



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
//     const chartData = data[chart.id] || []; // Safely access data for the specific chart
//     const totalMinutes = startDate && endDate ? differenceInMinutes(endDate, startDate) : 0;
//     const totalHours = startDate && endDate ? differenceInHours(endDate, startDate) : 0;
  
//     // Ensure that the data is an array before proceeding
//     if (!Array.isArray(chartData)) {
//       console.error("Data is not an array, skipping rendering.");
//       return null;
//     }
  
//     // Safeguard: Ensure that chart.yAxisDataKeys exists and is an array
//     if (!Array.isArray(chart.yAxisDataKeys)) {
//       console.error("yAxisDataKeys is not defined or is not an array.");
//       return null;
//     }
  
//     // For ranges of 1 hour or less, display all data points without filtering
//     if (totalMinutes <= 60) {
//       return (
//         <ResponsiveContainer width="100%" height={400}>
//           <LineChart data={chartData} syncId="syncChart">
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="timestamp" />
//             {chart.yAxisDataKeys.map((yAxis) => (
//               // Ensure yAxis exists before rendering the YAxis component
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
//               // Safeguard: Ensure that yAxis.dataKeys is defined and is an array
//               Array.isArray(yAxis.dataKeys) ? (
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
//                         : '5 5'
//                     }
//                     yAxisId={yAxis.id}
//                   />
//                 ))
//               ) : null
//             )}
//           </LineChart>
//         </ResponsiveContainer>
//       );
//     }
  
//     // Helper function to calculate the average of an array of values
//     const calculateAverage = (values) => {
//       if (values.length === 0) return null;
//       const sum = values.reduce((a, b) => a + b, 0);
//       return sum / values.length;
//     };
  
//     // Get granularity (minute or hour) based on the time range
//     const getGranularity = (timestamp, granularity) => {
//       const date = new Date(timestamp);
//       if (granularity === 'minute') {
//         return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
//       } else if (granularity === 'hour') {
//         return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}`;
//       }
//     };
  
//     // Determine the granularity: per minute or per hour
//     const granularity = totalHours <= 24 ? 'minute' : 'hour';
  
//     // Group data points by minute or hour and calculate the average for each group
//     const averagedData = Object.values(
//       chartData.reduce((acc, current) => {
//         const key = getGranularity(current.timestamp, granularity);
  
//         // Initialize entry for this time period if it doesn't exist
//         if (!acc[key]) {
//           acc[key] = { timestamp: current.timestamp, 'AX-LT-011': [], 'AX-LT-021': [], 'CW-TT-011': [], 'CR-LT-011': [] };
//         }
  
//         // Collect data points for each key in this minute/hour
//         ['AX-LT-011', 'AX-LT-021', 'CW-TT-011', 'CR-LT-011'].forEach((dataKey) => {
//           if (current[dataKey] !== null && current[dataKey] !== undefined) {
//             acc[key][dataKey].push(current[dataKey]); // Add the value to the array for averaging later
//           }
//         });
  
//         return acc;
//       }, {})
//     ).map(item => {
//       // Calculate the average for each key
//       ['AX-LT-011', 'AX-LT-021', 'CW-TT-011', 'CR-LT-011'].forEach((dataKey) => {
//         if (item[dataKey].length > 0) {
//           item[dataKey] = calculateAverage(item[dataKey]); // Replace the array with the average
//         } else {
//           item[dataKey] = null; // Handle cases where no data was available for this key in that time period
//         }
//       });
//       return item;
//     });
  
//     // Render the chart with averaged data
//     return (
//       <ResponsiveContainer width="100%" height={400}>
//         <LineChart data={averagedData} syncId="syncChart">
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
//             Array.isArray(yAxis.dataKeys) ? (
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
//             ) : null
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
//           Add Line Chart
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
   
//               {/* Date Range Selection Dialog */}
//               <Dialog open={dateDialogOpen} onClose={() => setDateDialogOpen(false)} fullWidth maxWidth="sm">
//               <DialogTitle>Select Date Range</DialogTitle>
//               <DialogContent>
//                 <FormControl component="fieldset">
//                   <RadioGroup
//                     row
//                     value={mode}
//                     onChange={(e) => setMode(e.target.value)}
//                   >
//                     <FormControlLabel value="A" control={<Radio />} label="Real-Time Data Only" />
//                     <FormControlLabel value="B" control={<Radio />} label="Start Date & Continue Real-Time" />
//                     <FormControlLabel value="C" control={<Radio />} label="Select Date Range" />
//                   </RadioGroup>
//                 </FormControl>
//                 <Grid container spacing={2} alignItems="center">
//                   <Grid item xs={6}>
//                     <DateTimePicker
//                       label="Start Date and Time"
//                       value={startDate}
//                       onChange={setStartDate}
//                       renderInput={(params) => <TextField {...params} fullWidth />}
//                       disabled={mode === 'A'}
//                     />
//                   </Grid>
//                   <Grid item xs={6}>
//                     <DateTimePicker
//                       label="End Date and Time"
//                       value={endDate}
//                       onChange={setEndDate}
//                       renderInput={(params) => <TextField {...params} fullWidth />}
//                       disabled={mode !== 'C'}
//                     />
//                   </Grid>
//                 </Grid>
//               </DialogContent>
//               <DialogActions>
//                 <Button onClick={() => setDateDialogOpen(false)} color="secondary">Cancel</Button>
//                 <Button onClick={handleDateRangeApply} color="primary" disabled={!startDate || (mode === 'C' && !endDate)}>
//                   Apply
//                 </Button>
//               </DialogActions>
//             </Dialog>


//     {/* Render charts for each chart */}
//     {charts.map((chart) => (
//       <Box key={chart.id} marginY={4}>
//         {renderChart(chart.id)}
//       </Box>
//     ))}

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
//   FormControl, InputLabel, Select, MenuItem, Typography, IconButton, Grid, TextField, Switch, FormControlLabel,
//   Radio
// } from "@mui/material";
// import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import axios from 'axios';
// import { format} from 'date-fns';
// import { w3cwebsocket as W3CWebSocket } from "websocket";
// import DeleteIcon from '@mui/icons-material/Delete';
// import { SketchPicker } from 'react-color';
// import { differenceInMinutes, differenceInHours } from 'date-fns';
// import { RadioGroup } from "@radix-ui/react-dropdown-menu";

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



//   const [mode, setMode] = useState('A'); // A: Real-Time, B: Start Date & Continue Real-Time, C: Select Date Range


//   const wsClientRefs = useRef({}); // WebSocket references for each chart

//   // Set up WebSocket for real-time data
//   const setupRealTimeWebSocket = (chartId) => {
//     if (wsClientRefs.current[chartId]) {
//       wsClientRefs.current[chartId].close(); // Close any existing WebSocket connection
//     }

//     wsClientRefs.current[chartId] = new W3CWebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");

//     wsClientRefs.current[chartId].onopen = () => {
//       console.log(`WebSocket connection established for chart ${chartId}`);
//     };

//     wsClientRefs.current[chartId].onmessage = (message) => {
//       try {
//         const receivedData = JSON.parse(message.data);
//         const newData = {
//           timestamp: new Date(receivedData['PLC-TIME-STAMP']) || new Date(),
//           'AX-LT-011': receivedData['AX-LT-011'] || null,
//           'AX-LT-021': receivedData['AX-LT-021'] || null,
//           'CW-TT-011': receivedData['CW-TT-011'] || null,
//           'CW-TT-021': receivedData['CW-TT-021'] || null,
//           'RECT-CT-001': receivedData['RECT-CT-001'] || null,
//           'RECT-VT-001': receivedData['RECT-VT-001'] || null,
//         };

//         // Append new data to the existing chart data
//         setData((prevData) => ({
//           ...prevData,
//           [chartId]: [...(prevData[chartId] || []), newData], // Accumulate data for each chart
//         }));
//       } catch (error) {
//         console.error("Error processing WebSocket message:", error);
//       }
//     };

//     wsClientRefs.current[chartId].onclose = (event) => {
//       console.error(`WebSocket disconnected for chart ${chartId} (code: ${event.code}, reason: ${event.reason}). Reconnecting...`);
//       setTimeout(() => setupRealTimeWebSocket(chartId), 1000); // Reconnect after 1 second
//     };
//   };

// // Fetch historical data for Option B or C
// const fetchHistoricalData = async (chartId, fetchEndDate = false) => {
//   if (!startDate || (fetchEndDate && !endDate)) return;
//   setLoading(true);

//   try {
//     const historicalData = [];
//     let currentDate = startDate; // Start from the selected startDate
//     const endDateToUse = fetchEndDate ? endDate : new Date(); // Either use endDate or the current time if not provided

//     // Loop through the time range in hourly increments
//     while (currentDate <= endDateToUse) {
//       const formattedStartDate = format(currentDate, 'yyyy-MM-dd');
//       const formattedStartTime = format(currentDate, 'HH:mm');

//       // Calculate the next hour
//       const nextHour = new Date(currentDate.getTime() + 60 * 60 * 1000);
//       const formattedEndDate = format(Math.min(nextHour.getTime(), endDateToUse.getTime()), 'yyyy-MM-dd');
//       const formattedEndTime = format(Math.min(nextHour.getTime(), endDateToUse.getTime()), 'HH:mm');

//       // Fetch data for the current time range (1-hour increments)
//       const response = await axios.post('https://7ko9a0hlo2.execute-api.us-east-1.amazonaws.com/dev/data', {
//         start_date: formattedStartDate,
//         start_time: formattedStartTime,
//         end_date: formattedEndDate,
//         end_time: formattedEndTime,
//         plot_all: true
//       });

//       // Combine the fetched data into one array
//       const hourlyData = response.data.data.map(item => ({
//         timestamp: item.timestamp,
//         'AX-LT-011': item.payload['AX-LT-011'],
//         'AX-LT-021': item.payload['AX-LT-021'],
//         'CW-TT-011': item.payload['CW-TT-011'],
//         'CR-LT-011': item.payload['CR-LT-011'],
//       }));

//       historicalData.push(...hourlyData);

//       // Move currentDate forward by one hour
//       currentDate = nextHour;
//     }

//     // Set the accumulated data to plot on the graph
//     setData((prevData) => ({
//       ...prevData,
//       [chartId]: historicalData,
//     }));

//     // If in "Start Date & Continue Real-Time" mode, connect WebSocket after historical data is fetched
//     if (!fetchEndDate) {
//       setupRealTimeWebSocket(chartId);
//     }

//   } catch (error) {
//     console.error('Error fetching historical data:', error);
//   } finally {
//     setLoading(false);
//   }
// };

//   // Date range apply logic based on selected mode
//   const handleDateRangeApply = () => {
//     setDateDialogOpen(false);

//     charts.forEach(chart => {
//       if (mode === 'A') {
//         // Real-Time Data Only: Clear data and start WebSocket streaming for each chart
//         setRealTimeData(true);
//         setData((prevData) => ({ ...prevData, [chart.id]: [] })); // Clear previous data for each chart
//         setupRealTimeWebSocket(chart.id); // Setup WebSocket for real-time data
//       } else if (mode === 'B') {
//         // Start Date & Continue Real-Time: Fetch historical data, then start WebSocket streaming
//         setRealTimeData(false);
//         fetchHistoricalData(chart.id); // Fetch historical data and then start WebSocket streaming
//       } else if (mode === 'C') {
//         // Select Date Range: Fetch historical data for the specified range (no real-time)
//         setRealTimeData(false);
//         fetchHistoricalData(chart.id, true); // Fetch historical data with end date
//       }
//     });
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
//     const chartData = data[chart.id] || []; // Safely access data for the specific chart
//     const totalMinutes = startDate && endDate ? differenceInMinutes(endDate, startDate) : 0;
//     const totalHours = startDate && endDate ? differenceInHours(endDate, startDate) : 0;
  
//     // Ensure that the data is an array before proceeding
//     if (!Array.isArray(chartData)) {
//       console.error("Data is not an array, skipping rendering.");
//       return null;
//     }
  
//     // Safeguard: Ensure that chart.yAxisDataKeys exists and is an array
//     if (!Array.isArray(chart.yAxisDataKeys)) {
//       console.error("yAxisDataKeys is not defined or is not an array.");
//       return null;
//     }
  
//     // For ranges of 1 hour or less, display all data points without filtering
//     if (totalMinutes <= 60) {
//       return (
//         <ResponsiveContainer width="100%" height={400}>
//           <LineChart data={chartData} syncId="syncChart">
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="timestamp" />
//             {chart.yAxisDataKeys.map((yAxis) => (
//               // Ensure yAxis exists before rendering the YAxis component
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
//               // Safeguard: Ensure that yAxis.dataKeys is defined and is an array
//               Array.isArray(yAxis.dataKeys) ? (
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
//                         : '5 5'
//                     }
//                     yAxisId={yAxis.id}
//                   />
//                 ))
//               ) : null
//             )}
//           </LineChart>
//         </ResponsiveContainer>
//       );
//     }
  
//     // Helper function to calculate the average of an array of values
//     const calculateAverage = (values) => {
//       if (values.length === 0) return null;
//       const sum = values.reduce((a, b) => a + b, 0);
//       return sum / values.length;
//     };
  
//     // Get granularity (minute or hour) based on the time range
//     const getGranularity = (timestamp, granularity) => {
//       const date = new Date(timestamp);
//       if (granularity === 'minute') {
//         return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
//       } else if (granularity === 'hour') {
//         return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}`;
//       }
//     };
  
//     // Determine the granularity: per minute or per hour
//     const granularity = totalHours <= 24 ? 'minute' : 'hour';
  
//     // Group data points by minute or hour and calculate the average for each group
//     const averagedData = Object.values(
//       chartData.reduce((acc, current) => {
//         const key = getGranularity(current.timestamp, granularity);
  
//         // Initialize entry for this time period if it doesn't exist
//         if (!acc[key]) {
//           acc[key] = { timestamp: current.timestamp, 'AX-LT-011': [], 'AX-LT-021': [], 'CW-TT-011': [], 'CR-LT-011': [] };
//         }
  
//         // Collect data points for each key in this minute/hour
//         ['AX-LT-011', 'AX-LT-021', 'CW-TT-011', 'CR-LT-011'].forEach((dataKey) => {
//           if (current[dataKey] !== null && current[dataKey] !== undefined) {
//             acc[key][dataKey].push(current[dataKey]); // Add the value to the array for averaging later
//           }
//         });
  
//         return acc;
//       }, {})
//     ).map(item => {
//       // Calculate the average for each key
//       ['AX-LT-011', 'AX-LT-021', 'CW-TT-011', 'CR-LT-011'].forEach((dataKey) => {
//         if (item[dataKey].length > 0) {
//           item[dataKey] = calculateAverage(item[dataKey]); // Replace the array with the average
//         } else {
//           item[dataKey] = null; // Handle cases where no data was available for this key in that time period
//         }
//       });
//       return item;
//     });
  
//     // Render the chart with averaged data
//     return (
//       <ResponsiveContainer width="100%" height={400}>
//         <LineChart data={averagedData} syncId="syncChart">
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
//             Array.isArray(yAxis.dataKeys) ? (
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
//             ) : null
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
   
//               {/* Date Range Selection Dialog */}
//               <Dialog open={dateDialogOpen} onClose={() => setDateDialogOpen(false)} fullWidth maxWidth="sm">
//               <DialogTitle>Select Date Range</DialogTitle>
//               <DialogContent>
//                 <FormControl component="fieldset">
//                   <RadioGroup
//                     row
//                     value={mode}
//                     onChange={(e) => setMode(e.target.value)}
//                   >
//                     <FormControlLabel value="A" control={<Radio />} label="Real-Time Data Only" />
//                     <FormControlLabel value="B" control={<Radio />} label="Start Date & Continue Real-Time" />
//                     <FormControlLabel value="C" control={<Radio />} label="Select Date Range" />
//                   </RadioGroup>
//                 </FormControl>
//                 <Grid container spacing={2} alignItems="center">
//                   <Grid item xs={6}>
//                     <DateTimePicker
//                       label="Start Date and Time"
//                       value={startDate}
//                       onChange={setStartDate}
//                       renderInput={(params) => <TextField {...params} fullWidth />}
//                       disabled={mode === 'A'}
//                     />
//                   </Grid>
//                   <Grid item xs={6}>
//                     <DateTimePicker
//                       label="End Date and Time"
//                       value={endDate}
//                       onChange={setEndDate}
//                       renderInput={(params) => <TextField {...params} fullWidth />}
//                       disabled={mode !== 'C'}
//                     />
//                   </Grid>
//                 </Grid>
//               </DialogContent>
//               <DialogActions>
//                 <Button onClick={() => setDateDialogOpen(false)} color="secondary">Cancel</Button>
//                 <Button onClick={handleDateRangeApply} color="primary" disabled={!startDate || (mode === 'C' && !endDate)}>
//                   Apply
//                 </Button>
//               </DialogActions>
//             </Dialog>


//     {/* Render charts for each chart */}
//     {charts.map((chart) => (
//       <Box key={chart.id} marginY={4}>
//         {renderChart(chart.id)}
//       </Box>
//     ))}

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
//   FormControl, InputLabel, Select, MenuItem, Typography, IconButton, Grid, TextField, Switch, FormControlLabel,
//   Radio
// } from "@mui/material";
// import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import axios from 'axios';
// import { format,parseISO } from 'date-fns';
// import { w3cwebsocket as W3CWebSocket } from "websocket";
// import DeleteIcon from '@mui/icons-material/Delete';
// import { SketchPicker } from 'react-color';
// import { differenceInMinutes, differenceInHours } from 'date-fns';
// import { RadioGroup } from "@radix-ui/react-dropdown-menu";

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



//   const [mode, setMode] = useState('A'); // A: Real-Time, B: Start Date & Continue Real-Time, C: Select Date Range


//   const wsClientRefs = useRef({}); // WebSocket references for each chart

//   // Set up WebSocket for real-time data
//   const setupRealTimeWebSocket = (chartId) => {
//     if (wsClientRefs.current[chartId]) {
//       wsClientRefs.current[chartId].close(); // Close any existing WebSocket connection
//     }

//     wsClientRefs.current[chartId] = new W3CWebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");

//     wsClientRefs.current[chartId].onopen = () => {
//       console.log(`WebSocket connection established for chart ${chartId}`);
//     };

//     wsClientRefs.current[chartId].onmessage = (message) => {
//       try {
//         const receivedData = JSON.parse(message.data);
//         const newData = {
//           timestamp: new Date(receivedData['PLC-TIME-STAMP']) || new Date(),
//           'AX-LT-011': receivedData['AX-LT-011'] || null,
//           'AX-LT-021': receivedData['AX-LT-021'] || null,
//           'CW-TT-011': receivedData['CW-TT-011'] || null,
//           'CW-TT-021': receivedData['CW-TT-021'] || null,
//           'RECT-CT-001': receivedData['RECT-CT-001'] || null,
//           'RECT-VT-001': receivedData['RECT-VT-001'] || null,
//         };

//         // Append new data to the existing chart data
//         setData((prevData) => ({
//           ...prevData,
//           [chartId]: [...(prevData[chartId] || []), newData], // Accumulate data for each chart
//         }));
//       } catch (error) {
//         console.error("Error processing WebSocket message:", error);
//       }
//     };

//     wsClientRefs.current[chartId].onclose = (event) => {
//       console.error(`WebSocket disconnected for chart ${chartId} (code: ${event.code}, reason: ${event.reason}). Reconnecting...`);
//       setTimeout(() => setupRealTimeWebSocket(chartId), 1000); // Reconnect after 1 second
//     };
//   };

// // Fetch historical data for Option B or C
// const fetchHistoricalData = async (chartId, fetchEndDate = false) => {
//   if (!startDate || (fetchEndDate && !endDate)) return;
//   setLoading(true);

//   try {
//     let historicalData = [];
//     let currentDate = new Date(startDate); // Start from the selected start date
//     const endDateToUse = fetchEndDate ? new Date(endDate) : new Date(); // End at the selected end date or now for Option B

//     // Loop until we reach the end date
//     while (currentDate <= endDateToUse) {
//       const formattedStartDate = format(currentDate, 'yyyy-MM-dd');
//       const formattedStartTime = format(currentDate, 'HH:mm');

//       // Calculate the next hour or the end date, whichever comes first
//       const nextHour = new Date(currentDate.getTime() + 60 * 60 * 1000); // Move forward by one hour
//       const formattedEndDate = format(Math.min(nextHour.getTime(), endDateToUse.getTime()), 'yyyy-MM-dd');
//       const formattedEndTime = format(Math.min(nextHour.getTime(), endDateToUse.getTime()), 'HH:mm');

//       // Fetch data for the current time range (1 hour at a time)
//       const response = await axios.post('https://7ko9a0hlo2.execute-api.us-east-1.amazonaws.com/dev/data', {
//         start_date: formattedStartDate,
//         start_time: formattedStartTime,
//         end_date: formattedEndDate,
//         end_time: formattedEndTime,
//         plot_all: true,
//       });

//       // Combine the fetched data into one array
//       const hourlyData = response.data.data.map(item => ({
//         timestamp: item.timestamp,
//         'AX-LT-011': item.payload['AX-LT-011'],
//         'AX-LT-021': item.payload['AX-LT-021'],
//         'CW-TT-011': item.payload['CW-TT-011'],
//         'CR-LT-011': item.payload['CR-LT-011'],
//       }));

//       historicalData.push(...hourlyData); // Append the fetched hourly data

//       // Move currentDate forward by one hour
//       currentDate = nextHour;
//     }

//     // Once the loop is done, set the data to plot on the graph
//     setData(prevData => ({
//       ...prevData,
//       [chartId]: historicalData, // Set the fetched historical data for the specific chart
//     }));

//     // For Option B, start WebSocket streaming after fetching historical data
//     if (!fetchEndDate) {
//       setupRealTimeWebSocket(chartId);
//     }
//   } catch (error) {
//     console.error('Error fetching historical data:', error);
//   } finally {
//     setLoading(false);
//   }
// };


//   // Date range apply logic based on selected mode
//   const handleDateRangeApply = () => {
//     setDateDialogOpen(false);

//     charts.forEach(chart => {
//       if (mode === 'A') {
//         // Real-Time Data Only: Clear data and start WebSocket streaming for each chart
//         setRealTimeData(true);
//         setData((prevData) => ({ ...prevData, [chart.id]: [] })); // Clear previous data for each chart
//         setupRealTimeWebSocket(chart.id); // Setup WebSocket for real-time data
//       } else if (mode === 'B') {
//         // Start Date & Continue Real-Time: Fetch historical data, then start WebSocket streaming
//         setRealTimeData(false);
//         fetchHistoricalData(chart.id); // Fetch historical data and then start WebSocket streaming
//       } else if (mode === 'C') {
//         // Select Date Range: Fetch historical data for the specified range (no real-time)
//         setRealTimeData(false);
//         fetchHistoricalData(chart.id, true); // Fetch historical data with end date
//       }
//     });
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
//     const chartData = data[chart.id] || []; // Safely access data for the specific chart
//     const totalMinutes = startDate && endDate ? differenceInMinutes(endDate, startDate) : 0;
//     const totalHours = startDate && endDate ? differenceInHours(endDate, startDate) : 0;
  
//     // Ensure that the data is an array before proceeding
//     if (!Array.isArray(chartData)) {
//       console.error("Data is not an array, skipping rendering.");
//       return null;
//     }
  
//     // Safeguard: Ensure that chart.yAxisDataKeys exists and is an array
//     if (!Array.isArray(chart.yAxisDataKeys)) {
//       console.error("yAxisDataKeys is not defined or is not an array.");
//       return null;
//     }
  
//     // For ranges of 1 hour or less, display all data points without filtering
//     if (totalMinutes <= 60) {
//       return (
//         <ResponsiveContainer width="100%" height={400}>
//           <LineChart data={chartData} syncId="syncChart">
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="timestamp" />
//             {chart.yAxisDataKeys.map((yAxis) => (
//               // Ensure yAxis exists before rendering the YAxis component
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
//               // Safeguard: Ensure that yAxis.dataKeys is defined and is an array
//               Array.isArray(yAxis.dataKeys) ? (
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
//                         : '5 5'
//                     }
//                     yAxisId={yAxis.id}
//                   />
//                 ))
//               ) : null
//             )}
//           </LineChart>
//         </ResponsiveContainer>
//       );
//     }
  
//     // Helper function to calculate the average of an array of values
//     const calculateAverage = (values) => {
//       if (values.length === 0) return null;
//       const sum = values.reduce((a, b) => a + b, 0);
//       return sum / values.length;
//     };
  
//     // Get granularity (minute or hour) based on the time range
//     const getGranularity = (timestamp, granularity) => {
//       const date = new Date(timestamp);
//       if (granularity === 'minute') {
//         return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
//       } else if (granularity === 'hour') {
//         return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}`;
//       }
//     };
  
//     // Determine the granularity: per minute or per hour
//     const granularity = totalHours <= 24 ? 'minute' : 'hour';
  
//     // Group data points by minute or hour and calculate the average for each group
//     const averagedData = Object.values(
//       chartData.reduce((acc, current) => {
//         const key = getGranularity(current.timestamp, granularity);
  
//         // Initialize entry for this time period if it doesn't exist
//         if (!acc[key]) {
//           acc[key] = { timestamp: current.timestamp, 'AX-LT-011': [], 'AX-LT-021': [], 'CW-TT-011': [], 'CR-LT-011': [] };
//         }
  
//         // Collect data points for each key in this minute/hour
//         ['AX-LT-011', 'AX-LT-021', 'CW-TT-011', 'CR-LT-011'].forEach((dataKey) => {
//           if (current[dataKey] !== null && current[dataKey] !== undefined) {
//             acc[key][dataKey].push(current[dataKey]); // Add the value to the array for averaging later
//           }
//         });
  
//         return acc;
//       }, {})
//     ).map(item => {
//       // Calculate the average for each key
//       ['AX-LT-011', 'AX-LT-021', 'CW-TT-011', 'CR-LT-011'].forEach((dataKey) => {
//         if (item[dataKey].length > 0) {
//           item[dataKey] = calculateAverage(item[dataKey]); // Replace the array with the average
//         } else {
//           item[dataKey] = null; // Handle cases where no data was available for this key in that time period
//         }
//       });
//       return item;
//     });
  
//     // Render the chart with averaged data
//     return (
//       <ResponsiveContainer width="100%" height={400}>
//         <LineChart data={averagedData} syncId="syncChart">
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
//             Array.isArray(yAxis.dataKeys) ? (
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
//             ) : null
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
   
//               {/* Date Range Selection Dialog */}
//               <Dialog open={dateDialogOpen} onClose={() => setDateDialogOpen(false)} fullWidth maxWidth="sm">
//               <DialogTitle>Select Date Range</DialogTitle>
//               <DialogContent>
//                 <FormControl component="fieldset">
//                   <RadioGroup
//                     row
//                     value={mode}
//                     onChange={(e) => setMode(e.target.value)}
//                   >
//                     <FormControlLabel value="A" control={<Radio />} label="Real-Time Data Only" />
//                     <FormControlLabel value="B" control={<Radio />} label="Start Date & Continue Real-Time" />
//                     <FormControlLabel value="C" control={<Radio />} label="Select Date Range" />
//                   </RadioGroup>
//                 </FormControl>
//                 <Grid container spacing={2} alignItems="center">
//                   <Grid item xs={6}>
//                     <DateTimePicker
//                       label="Start Date and Time"
//                       value={startDate}
//                       onChange={setStartDate}
//                       renderInput={(params) => <TextField {...params} fullWidth />}
//                       disabled={mode === 'A'}
//                     />
//                   </Grid>
//                   <Grid item xs={6}>
//                     <DateTimePicker
//                       label="End Date and Time"
//                       value={endDate}
//                       onChange={setEndDate}
//                       renderInput={(params) => <TextField {...params} fullWidth />}
//                       disabled={mode !== 'C'}
//                     />
//                   </Grid>
//                 </Grid>
//               </DialogContent>
//               <DialogActions>
//                 <Button onClick={() => setDateDialogOpen(false)} color="secondary">Cancel</Button>
//                 <Button onClick={handleDateRangeApply} color="primary" disabled={!startDate || (mode === 'C' && !endDate)}>
//                   Apply
//                 </Button>
//               </DialogActions>
//             </Dialog>


//     {/* Render charts for each chart */}
//     {charts.map((chart) => (
//       <Box key={chart.id} marginY={4}>
//         {renderChart(chart.id)}
//       </Box>
//     ))}

//     </Container>
//   </LocalizationProvider>
  
//   );
// };

// export default CustomCharts;