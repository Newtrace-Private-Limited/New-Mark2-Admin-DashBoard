import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import GridLayout from "react-grid-layout";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from "recharts";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  IconButton,
  Grid,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { SketchPicker } from "react-color";
import DeleteIcon from "@mui/icons-material/Delete";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import axios from "axios";
import { debounce } from "lodash";
import {
  format,
  subMinutes,
  subHours,
  subDays,
  subWeeks,
  subMonths,
  parseISO,
} from "date-fns";
import { setLayout, addChart, removeChart, updateChart } from "../../redux/layoutActions";
import Header from "src/component/Header";

const HistoricalCharts = () => {
  const [chartData, setChartData] = useState({});
  const [tempChartData, setTempChartData] = useState(null);
  const [chartDialogOpen, setChartDialogOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedYAxisId, setSelectedYAxisId] = useState(null);
  const [dateDialogOpen, setDateDialogOpen] = useState(false);
  const [chartDateRanges, setChartDateRanges] = useState({});
  const [mode, setMode] = useState("B");
  const [currentChartId, setCurrentChartId] = useState(null);
  const wsClientRefs = useRef({});
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  const dispatch = useDispatch();
  const layout = useSelector((state) => state.layout.historicalLayout) || JSON.parse(localStorage.getItem("historicalChartsLayout")) || [];
  const charts = useSelector((state) => state.layout.historicalCharts) || JSON.parse(localStorage.getItem("historicalCharts")) || [];

  useEffect(() => {
    if (!layout.length) {
      const savedLayout = JSON.parse(localStorage.getItem("historicalChartsLayout")) || [];
      dispatch(setLayout(savedLayout, "historical"));
    }
  }, [dispatch, layout.length]);

  const saveLayout = debounce((newLayout) => {
    dispatch(setLayout(newLayout, "historical"));
    localStorage.setItem("historicalChartsLayout", JSON.stringify(newLayout));
  }, 500);

  const addCustomChart = () => {
    const newChartId = Date.now();
    const newChart = {
      id: newChartId,
      type: "Line",
      xAxisDataKey: "timestamp",
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
    dispatch(addChart(newChart, "historical"));
    const updatedLayout = [...layout, { i: newChartId.toString(), x: 0, y: Infinity, w: 6, h: 8 }];
    dispatch(setLayout(updatedLayout, "historical"));
    localStorage.setItem("historicalChartsLayout", JSON.stringify(updatedLayout));
  };

  const deleteChart = (chartId) => {
    dispatch(removeChart(chartId, "historical"));
    const updatedLayout = layout.filter((l) => l.i !== chartId.toString());
    dispatch(setLayout(updatedLayout, "historical"));
    localStorage.setItem("historicalChartsLayout", JSON.stringify(updatedLayout));
  };

  const saveConfiguration = () => {
    if (tempChartData) {
      dispatch(updateChart(tempChartData, "historical"));
      setDialogOpen(false);
    }
  };

  const handleTimeRangeChange = (chartId, value) => {
    let start;
    switch (value) {
      case "20_minute":
        start = subMinutes(new Date(), 20);
        break;
      case "30_minutes":
        start = subMinutes(new Date(), 30);
        break;
      case "1_hour":
        start = subHours(new Date(), 1);
        break;
      case "6_hours":
        start = subHours(new Date(), 6);
        break;
      case "12_hours":
        start = subHours(new Date(), 12);
        break;
      case "1_day":
        start = subDays(new Date(), 1);
        break;
      case "2_day":
        start = subDays(new Date(), 2);
        break;
      case "1_week":
        start = subWeeks(new Date(), 1);
        break;
      case "1_month":
        start = subMonths(new Date(), 1);
        break;
      default:
        start = subMinutes(new Date(), 1);
    }

    setChartDateRanges((prevRanges) => ({
      ...prevRanges,
      [chartId]: { startDate: start, endDate: new Date() },
    }));
  };

  const fetchChartData = async (chartId) => {
    const { startDate, endDate } = chartDateRanges[chartId] || {};
    if (!startDate) return;
  
    try {
      const formattedStartDate = format(startDate, "yyyy-MM-dd'T'HH:mm");
      const formattedEndDate =
        mode === "C"
          ? format(new Date(), "yyyy-MM-dd'T'HH:mm")
          : format(endDate, "yyyy-MM-dd'T'HH:mm");
  
      const response = await axios.post(
        "https://3di0yc14j3.execute-api.us-east-1.amazonaws.com/dev/iot-data",
        { start_time: formattedStartDate, end_time: formattedEndDate },
        { headers: { "Content-Type": "application/json" } }
      );
  
      if (response.status === 200) {
        const parsedBody = response.data; // Assume JSON is already parsed
        const fetchedData = (parsedBody.data || []).map((row) => {
          // Determine data format: detailed or aggregated
          if (row.device_data) {
            // Detailed data format (e.g., < 3 hours)
            const { device_data, ...rest } = row;
  
            return {
              timestamp: rest.ist_timestamp || rest.time_bucket, // Use appropriate timestamp
              ...(device_data || {}), // Flatten device_data keys
            };
          } else {
            // Aggregated data format (e.g., > 3 hours)
            return {
              timestamp: row.time_bucket, // Use aggregated timestamp
              "AX-LT-011": row.avg_ax_lt_011 || 0, // Use average values
              "AX-LT-021": row.avg_ax_lt_021 || 0,
              "CW-TT-011": row.cw_tt_011 || 0,
"CW-TT-021": row.cw_tt_021 || 0,
"CR-LT-011": row.cr_lt_011 || 0,
"CR-PT-011": row.cr_pt_011 || 0,
"CR-LT-021": row.cr_lt_021 || 0,
"CR-PT-021": row.cr_pt_021 || 0,
"CR-PT-001": row.cr_pt_001 || 0,
"CR-TT-001": row.cr_tt_001 || 0,
"CR-FT-001": row.cr_ft_001 || 0,
"CR-TT-002": row.cr_tt_002 || 0,
"GS-AT-011": row.gs_at_011 || 0,
"GS-AT-012": row.gs_at_012 || 0,
"GS-PT-011": row.gs_pt_011 || 0,
"GS-TT-011": row.gs_tt_011 || 0,
"GS-AT-022": row.gs_at_022 || 0,
"GS-PT-021": row.gs_pt_021 || 0,
"GS-TT-021": row.gs_tt_021 || 0,
"PR-TT-001": row.pr_tt_001 || 0,
"PR-TT-061": row.pr_tt_061 || 0,
"PR-TT-072": row.pr_tt_072 || 0,
"PR-FT-001": row.pr_ft_001 || 0,
"PR-AT-001": row.pr_at_001 || 0,
"PR-AT-003": row.pr_at_003 || 0,
"PR-AT-005": row.pr_at_005 || 0,
"DM-LSH-001": row.dm_lsh_001 || 0,
"DM-LSL-001": row.dm_lsl_001 || 0,
"GS-LSL-021": row.gs_lsl_021 || 0,
"GS-LSL-011": row.gs_lsl_011 || 0,
"PR-VA-301": row.pr_va_301 || 0,
"PR-VA-352": row.pr_va_352 || 0,
"PR-VA-312": row.pr_va_312 || 0,
"PR-VA-351": row.pr_va_351 || 0,
"PR-VA-361AIN": row.pr_va_361ain || 0,
"PR-VA-361AOUT": row.pr_va_361aout || 0,
"PR-VA-361BIN": row.pr_va_361bin || 0,
"PR-VA-361BOUT": row.pr_va_361bout || 0,
"PR-VA-362AIN": row.pr_va_362ain || 0,
"PR-VA-362AOUT": row.pr_va_362aout || 0,
"N2-VA-311": row.n2_va_311 || 0,
"GS-VA-311": row.gs_va_311 || 0,
"GS-VA-312": row.gs_va_312 || 0,
"N2-VA-321": row.n2_va_321 || 0,
"GS-VA-321": row.gs_va_321 || 0,
"GS-VA-322": row.gs_va_322 || 0,
"GS-VA-022": row.gs_va_022 || 0,
"GS-VA-021": row.gs_va_021 || 0,
"AX-VA-351": row.ax_va_351 || 0,
"AX-VA-311": row.ax_va_311 || 0,
"AX-VA-312": row.ax_va_312 || 0,
"AX-VA-321": row.ax_va_321 || 0,
"AX-VA-322": row.ax_va_322 || 0,
"AX-VA-391": row.ax_va_391 || 0,
"DM-VA-301": row.dm_va_301 || 0,
"DCD0-VT-001": row.dcdb0_vt_001 || 0,
"DCD0-CT-001": row.dcdb0_ct_001 || 0,
"DCD1-VT-001": row.dcdb1_vt_001 || 0,
"DCD1-CT-001": row.dcdb1_ct_001 || 0,
"DCD2-VT-001": row.dcdb2_vt_001 || 0,
"DCD2-CT-001": row.dcdb2_ct_001 || 0,
"DCD3-VT-001": row.dcdb3_vt_001 || 0,
"DCD3-CT-001": row.dcdb3_ct_001 || 0,
"DCD4-VT-001": row.dcdb4_vt_001 || 0,
"DCD4-CT-001": row.dcdb4_ct_001 || 0,
"RECT-CT-001": row.rect_ct_001 || 0,
"RECT-VT-001": row.rect_vt_001 || 0,
"PLC-TIME-STAMP": row.plc_time_stamp || 0,
"TEST-NAME": row.test_name || 0,
"TEST-REMARKS": row.test_remarks || 0,
"TEST-DESCRIPTION": row.test_description || 0


              
            };
          }
        });
  
        // console.log("Fetched Data for Chart:", fetchedData); // Debugging
  
        setChartData((prevData) => ({
          ...prevData,
          [chartId]: fetchedData,
        }));
  
        if (mode === "C") {
          setupRealTimeWebSocket(chartId);
        }
      } else {
        console.error("Failed to fetch data. Status:", response.status);
      }
    } catch (error) {
      console.error("Error fetching data from the API:", error);
    }
  };

  const setupRealTimeWebSocket = (chartId) => {
    if (wsClientRefs.current[chartId]) {
      wsClientRefs.current[chartId].close();
    }

    wsClientRefs.current[chartId] = new WebSocket(
      "wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/"
    );

    wsClientRefs.current[chartId].onopen = () => {
      // console.log(`WebSocket connection established for chart ${chartId}`);
    };

    wsClientRefs.current[chartId].onmessage = (message) => {
      try {
        const receivedData = JSON.parse(message.data);
        const newData = {
          timestamp: parseISO(receivedData["PLC-TIME-STAMP"]) || new Date(),
          "AX-LT-011": receivedData["AX-LT-011"] || null,
"AX-LT-021": receivedData["AX-LT-021"] || null,
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
      console.error(`WebSocket disconnected for chart ${chartId}. Reconnecting...`);
      setTimeout(() => setupRealTimeWebSocket(chartId), 1000);
    };
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
      yAxisDataKeys: prevChart.yAxisDataKeys.filter(
        (yAxis) => yAxis.id !== yAxisId
      ),
    }));
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
  const openColorPicker = (yAxisId) => {
    setSelectedYAxisId(yAxisId);
    setColorPickerOpen(true);
  };
  const openDialog = (chart) => {
    setTempChartData(chart);
    setDialogOpen(true);
  };
    const closeDialog = () => setDialogOpen(false);

  const handleLineStyleChange = (yAxisId, event) => {
    const { value } = event.target;
    setTempChartData((prevChart) => ({
      ...prevChart,
      yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
        yAxis.id === yAxisId ? { ...yAxis, lineStyle: value } : yAxis
      ),
    }));
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

  const handleDateRangeApply = () => {
    setDateDialogOpen(false);
    fetchChartData(currentChartId);
  };

  const renderLineChart = (chart) => {
    const data = chartData[chart.id] || [];
  
    // console.log(`Rendering Chart ID: ${chart.id}, Data:`, data); // Debugging
  
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
          />
          {chart.yAxisDataKeys.map((yAxis) => (
            <YAxis
              key={yAxis.id}
              yAxisId={yAxis.id}
              domain={getYAxisDomain(yAxis.range)}
              stroke={yAxis.color}
            />
          ))}
          <Tooltip /> 
          <Brush/>
          <Legend />
          {chart.yAxisDataKeys.map((yAxis) =>
            yAxis.dataKeys.map((key) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key} // Dynamically map data keys
                stroke={yAxis.color}
                strokeDasharray={getLineStyle(yAxis.lineStyle)}
                yAxisId={yAxis.id}
              />
            ))
          )}
        </LineChart>
      </ResponsiveContainer>
    );
  };
  const renderChart = (chart) => (
    <Box sx={{ height: "100%" }}>
      <Box sx={{ height: "calc(100% - 60px)", width: "100%" }}>
        {renderLineChart(chart)}
      </Box>
      <Box display="flex" justifyContent="space-around" mt={1}>
        <Button variant="contained" color="secondary" onClick={() => setTempChartData(chart) || setDialogOpen(true)}>Configure Chart</Button>
        <Button variant="contained" color="secondary" onClick={() => setCurrentChartId(chart.id) || setDateDialogOpen(true)}>Choose Date Range</Button>
      </Box>
    </Box>
  );
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
       <Box m="15px" mt="-60px">
    <Header
        title="Historical Line Analytics"
        subtitle="Welcome to your Historical Line Analytics"
      />
      <Box display="flex" justifyContent="flex-end" marginBottom={4}>
        <Button variant="contained" color="secondary" onClick={() => setChartDialogOpen(true)}>Add Historical Chart</Button>
      </Box>
      <GridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={45}
        width={1630}
        onLayoutChange={(newLayout) => dispatch(setLayout(newLayout, "historical"))}
        onResizeStop={(newLayout) => saveLayout(newLayout)}
        onDragStop={(newLayout) => saveLayout(newLayout)}
        draggableHandle=".drag-handle"
        isResizable
        isDraggable
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
            sx={{ position: "relative", border: "1px solid #ccc", borderRadius: "8px", overflow: "hidden" }}
          >
            <Box display="flex" justifyContent="space-between" p={2} sx={{ backgroundColor: "" }}>
              <IconButton className="drag-handle">
                <DragHandleIcon />
              </IconButton>
              <Typography variant="h6">{chart.type} Chart</Typography>
              <IconButton aria-label="delete" onClick={() => deleteChart(chart.id)}>
                <DeleteIcon />
              </IconButton>
            </Box>
            <Box sx={{ height: "calc(100% - 100px)" }}>
              {renderChart(chart)}
            </Box>
          </Box>
        ))}
      </GridLayout>

      <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
        <DialogTitle>Select Chart Type</DialogTitle>
        <DialogContent>
          <Button variant="contained" onClick={addCustomChart}>Add Line Chart</Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChartDialogOpen(false)} color="secondary">Cancel</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dateDialogOpen} onClose={() => setDateDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Select Date Range</DialogTitle>
        <DialogContent>
          <FormControl component="fieldset">
            <RadioGroup row value={mode} onChange={(e) => setMode(e.target.value)}>
              <FormControlLabel value="B" control={<Radio />} label="Select Date Range" />
              <FormControlLabel value="C" control={<Radio />} label="Start Date & Continue Real-Time" />
            </RadioGroup>
          </FormControl>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={6}>
              <DateTimePicker
                label="Start Date and Time"
                value={chartDateRanges[currentChartId]?.startDate || null}
                onChange={(date) =>
                  setChartDateRanges((prevRanges) => ({
                    ...prevRanges,
                    [currentChartId]: { ...prevRanges[currentChartId], startDate: date },
                  }))
                }
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={6}>
              <DateTimePicker
                label="End Date and Time"
                value={chartDateRanges[currentChartId]?.endDate || null}
                onChange={(date) =>
                  setChartDateRanges((prevRanges) => ({
                    ...prevRanges,
                    [currentChartId]: { ...prevRanges[currentChartId], endDate: date },
                  }))
                }
                renderInput={(params) => <TextField {...params} fullWidth />}
                disabled={mode === "C"}
              />
            </Grid>
          </Grid>
          <Box display="flex" justifyContent="flex-end" marginBottom={2}>
            <FormControl className="w-28 top-3">
              <InputLabel id="time-range-label" >Time Range</InputLabel>
              <Select
                labelId="time-range-label"
                value={chartDateRanges[currentChartId]?.range || ""}
                onChange={(e) => handleTimeRangeChange(currentChartId, e.target.value)}
              >
                <MenuItem value="20_minute">Last 20 minute</MenuItem>
                <MenuItem value="30_minutes">Last 30 minutes</MenuItem>
                <MenuItem value="1_hour">Last 1 hour</MenuItem>
                <MenuItem value="6_hours">Last 6 hours</MenuItem>
                <MenuItem value="12_hours">Last 12 hours</MenuItem>
                <MenuItem value="1_day">Last 1 day</MenuItem>
                <MenuItem value="2_day">Last 2 days</MenuItem>
                <MenuItem value="1_week">Last 1 week</MenuItem>
                <MenuItem value="1_month">Last 1 month</MenuItem>
              </Select>
            </FormControl>
          </Box>  
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDateDialogOpen(false)} color="secondary">Cancel</Button>
          <Button onClick={handleDateRangeApply} color="secondary" disabled={!chartDateRanges[currentChartId]?.startDate || (mode === "B" && !chartDateRanges[currentChartId]?.endDate)}>Apply</Button>
        </DialogActions>
      </Dialog>

      {tempChartData && (
        <Dialog open={dialogOpen}
         onClose={() => setDialogOpen(false)} 
         fullWidth
          maxWidth="md">
          <DialogTitle>Configure Chart</DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" maxHeight="400px" overflow="auto">
              {tempChartData.yAxisDataKeys.map((yAxis, index) => (
                <Box key={yAxis.id} display="flex" flexDirection="column" marginBottom={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">Y-Axis {index + 1}</Typography>
                    <IconButton onClick={() => deleteYAxis(yAxis.id)}><DeleteIcon /></IconButton>
                  </Box>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Data Keys</InputLabel>
                    <Select multiple value={yAxis.dataKeys} onChange={(event) => handleDataKeyChange(yAxis.id, event)}>
                 
                                     <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
                      <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
<MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
<MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
<MenuItem value="CR-LT-011">CR-LT-011</MenuItem>
<MenuItem value="CR-PT-011">CR-PT-011</MenuItem>
<MenuItem value="CR-LT-021">CR-LT-021</MenuItem>
<MenuItem value="CR-PT-021">CR-PT-021</MenuItem>
<MenuItem value="CR-PT-001">CR-PT-001</MenuItem>
<MenuItem value="CR-TT-001">CR-TT-001</MenuItem>
<MenuItem value="CR-FT-001">CR-FT-001</MenuItem>
<MenuItem value="CR-TT-002">CR-TT-002</MenuItem>
<MenuItem value="GS-AT-011">GS-AT-011</MenuItem>
<MenuItem value="GS-AT-012">GS-AT-012</MenuItem>
<MenuItem value="GS-PT-011">GS-PT-011</MenuItem>
<MenuItem value="GS-TT-011">GS-TT-011</MenuItem>
<MenuItem value="GS-AT-022">GS-AT-022</MenuItem>
<MenuItem value="GS-PT-021">GS-PT-021</MenuItem>
<MenuItem value="GS-TT-021">GS-TT-021</MenuItem>
<MenuItem value="PR-TT-001">PR-TT-001</MenuItem>
<MenuItem value="PR-TT-061">PR-TT-061</MenuItem>
<MenuItem value="PR-TT-072">PR-TT-072</MenuItem>
<MenuItem value="PR-FT-001">PR-FT-001</MenuItem>
<MenuItem value="PR-AT-001">PR-AT-001</MenuItem>
<MenuItem value="PR-AT-003">PR-AT-003</MenuItem>
<MenuItem value="PR-AT-005">PR-AT-005</MenuItem>
<MenuItem value="DM-LSH-001">DM-LSH-001</MenuItem>
<MenuItem value="DM-LSL-001">DM-LSL-001</MenuItem>
<MenuItem value="GS-LSL-021">GS-LSL-021</MenuItem>
<MenuItem value="GS-LSL-011">GS-LSL-011</MenuItem>
<MenuItem value="PR-VA-301">PR-VA-301</MenuItem>
<MenuItem value="PR-VA-352">PR-VA-352</MenuItem>
<MenuItem value="PR-VA-312">PR-VA-312</MenuItem>
<MenuItem value="PR-VA-351">PR-VA-351</MenuItem>
<MenuItem value="PR-VA-361Ain">PR-VA-361Ain</MenuItem>
<MenuItem value="PR-VA-361Aout">PR-VA-361Aout</MenuItem>
<MenuItem value="PR-VA-361Bin">PR-VA-361Bin</MenuItem>
<MenuItem value="PR-VA-361Bout">PR-VA-361Bout</MenuItem>
<MenuItem value="PR-VA-362Ain">PR-VA-362Ain</MenuItem>
<MenuItem value="PR-VA-362Aout">PR-VA-362Aout</MenuItem>
<MenuItem value="PR-VA-362Bin">PR-VA-362Bin</MenuItem>
<MenuItem value="PR-VA-362Bout">PR-VA-362Bout</MenuItem>
<MenuItem value="N2-VA-311">N2-VA-311</MenuItem>
<MenuItem value="GS-VA-311">GS-VA-311</MenuItem>
<MenuItem value="GS-VA-312">GS-VA-312</MenuItem>
<MenuItem value="N2-VA-321">N2-VA-321</MenuItem>
<MenuItem value="GS-VA-321">GS-VA-321</MenuItem>
<MenuItem value="GS-VA-322">GS-VA-322</MenuItem>
<MenuItem value="GS-VA-022">GS-VA-022</MenuItem>
<MenuItem value="GS-VA-021">GS-VA-021</MenuItem>
<MenuItem value="AX-VA-351">AX-VA-351</MenuItem>
<MenuItem value="AX-VA-311">AX-VA-311</MenuItem>
<MenuItem value="AX-VA-312">AX-VA-312</MenuItem>
<MenuItem value="AX-VA-321">AX-VA-321</MenuItem>
<MenuItem value="AX-VA-322">AX-VA-322</MenuItem>
<MenuItem value="AX-VA-391">AX-VA-391</MenuItem>
<MenuItem value="DM-VA-301">DM-VA-301</MenuItem>
<MenuItem value="DCDB0-VT-001">DCDB0-VT-001</MenuItem>
<MenuItem value="DCDB0-CT-001">DCDB0-CT-001</MenuItem>
<MenuItem value="DCDB1-VT-001">DCDB1-VT-001</MenuItem>
<MenuItem value="DCDB1-CT-001">DCDB1-CT-001</MenuItem>
<MenuItem value="DCDB2-VT-001">DCDB2-VT-001</MenuItem>
<MenuItem value="DCDB2-CT-001">DCDB2-CT-001</MenuItem>
<MenuItem value="DCDB3-VT-001">DCDB3-VT-001</MenuItem>
<MenuItem value="DCDB3-CT-001">DCDB3-CT-001</MenuItem>
<MenuItem value="DCDB4-VT-001">DCDB4-VT-001</MenuItem>
<MenuItem value="DCDB4-CT-001">DCDB4-CT-001</MenuItem>
<MenuItem value="RECT-CT-001">RECT-CT-001</MenuItem>
<MenuItem value="RECT-VT-001">RECT-VT-001</MenuItem>

                    </Select>
                  </FormControl>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Range</InputLabel>
                    <Select value={yAxis.range} onChange={(event) => handleRangeChange(yAxis.id, event)}>
                          <MenuItem value="0-100">0-100</MenuItem>
                          <MenuItem value="0-500">0-500</MenuItem>
                          <MenuItem value="0-1200">0-1200</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Line Style</InputLabel>
                    <Select value={yAxis.lineStyle} onChange={(event) => handleLineStyleChange(yAxis.id, event)}>
                      <MenuItem value="solid">Solid</MenuItem>
                      <MenuItem value="dotted">Dotted</MenuItem>
                      <MenuItem value="dashed">Dashed</MenuItem>
                      <MenuItem value="dot-dash">Dot Dash</MenuItem>
                    </Select>
                  </FormControl>
                  <Button color="secondary" onClick={() => openColorPicker(yAxis.id)}>Select Color</Button>
                  {colorPickerOpen && selectedYAxisId === yAxis.id && <SketchPicker color={yAxis.color} onChangeComplete={handleColorChange} />}
                </Box>
              ))}
              <Button variant="contained" color="secondary" onClick={() =>
                setTempChartData((prevChart) => ({
                  ...prevChart,
                  yAxisDataKeys: [
                    ...prevChart.yAxisDataKeys,
                    {
                      id: `left-${prevChart.yAxisDataKeys.length}`,
                      dataKeys: [],
                      range: "0-500",
                      color: "#FF0000",
                      lineStyle: "solid",
                    },
                  ],
                }))
              }>Add Y-Axis</Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)} color="secondary">Cancel</Button>
            <Button onClick={saveConfiguration} color="secondary">Save</Button>
          </DialogActions>
        </Dialog>
      )}
        </Box>
    </LocalizationProvider>
  );
};

export default HistoricalCharts;



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
// import Header from "src/component/Header";

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

//   const fetchChartData = async (chartId) => {
//     const { startDate, endDate } = chartDateRanges[chartId] || {};
//     if (!startDate) return;
//     try {
//       const formattedStartDate = format(startDate, "yyyy-MM-dd'T'HH:mm");
//       const formattedEndDate = mode === "C" ? format(new Date(), "yyyy-MM-dd'T'HH:mm") : format(endDate, "yyyy-MM-dd'T'HH:mm");

//       const response = await axios.post("https://3di0yc14j3.execute-api.us-east-1.amazonaws.com/dev/iot-data", { start_time: formattedStartDate, end_time: formattedEndDate });
//       const parsedBody = JSON.parse(response.data.body);
//       const fetchedData = parsedBody.data.map((item) => ({
//         timestamp: item[0],
//         "AX-LT-011": item[1],
//         "AX-LT-021": item[2],
//         "CW-TT-011": item[3],
//         "CW-TT-021": item[4],
//         "CR-LT-011": item[5],
//         "CR-PT-011": item[6],
//         "CR-LT-021": item[7],
//         "CR-PT-021": item[8],
//         "CR-PT-001": item[9],
//         "CR-TT-001": item[10],
//         "CR-FT-001": item[11],
//         "CR-TT-002": item[12],
//         "GS-AT-011": item[13],
//         "GS-AT-012": item[14],
//         "GS-PT-011": item[15],
//         "GS-TT-011": item[16],
//         "GS-AT-022": item[17],
//         "GS-PT-021": item[18],
//         "GS-TT-021": item[19],
//         "PR-TT-001": item[20],
//         "PR-TT-061": item[21],
//         "PR-TT-072": item[22],
//         "PR-FT-001": item[23],
//         "PR-AT-001": item[24],
//         "PR-AT-003": item[25],
//         "PR-AT-005": item[26],
//         "DM-LSH-001": item[27],
//         "DM-LSL-001": item[28],
//         "GS-LSL-021": item[29],
//         "GS-LSL-011": item[30],
//         "PR-VA-301": item[31],
//         "PR-VA-352": item[32],
//         "PR-VA-312": item[33],
//         "PR-VA-351": item[34],
//         "PR-VA-361Ain": item[35],
//         "PR-VA-361Aout": item[36],
//         "PR-VA-361Bin": item[37],
//         "PR-VA-361Bout": item[38],
//         "PR-VA-362Ain": item[39],
//         "PR-VA-362Aout": item[40],
//         "PR-VA-362Bin": item[41],
//         "PR-VA-362Bout": item[42],
//         "N2-VA-311": item[43],
//         "GS-VA-311": item[44],
//         "GS-VA-312": item[45],
//         "N2-VA-321": item[46],
//         "GS-VA-321": item[47],
//         "GS-VA-322": item[48],
//         "GS-VA-022": item[49],
//         "GS-VA-021": item[50],
//         "AX-VA-351": item[51],
//         "AX-VA-311": item[52],
//         "AX-VA-312": item[53],
//         "AX-VA-321": item[54],
//         "AX-VA-322": item[55],
//         "AX-VA-391": item[56],
//         "DM-VA-301": item[57],
//         "DCDB0-VT-001": item[58],
//         "DCDB0-CT-001": item[59],
//         "DCDB1-VT-001": item[60],
//         "DCDB1-CT-001": item[61],
//         "DCDB2-VT-001": item[62],
//         "DCDB2-CT-001": item[63],
//         "DCDB3-VT-001": item[64],
//         "DCDB3-CT-001": item[65],
//         "DCDB4-VT-001": item[66],
//         "DCDB4-CT-001": item[67],
//         "RECT-CT-001": item[68],
//         "RECT-VT-001": item[69],
        
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
// "AX-LT-021": receivedData["AX-LT-021"] || null,
// "CW-TT-011": receivedData["CW-TT-011"] || null,
// "CW-TT-021": receivedData["CW-TT-021"] || null,
// "CR-LT-011": receivedData["CR-LT-011"] || null,
// "CR-PT-011": receivedData["CR-PT-011"] || null,
// "CR-LT-021": receivedData["CR-LT-021"] || null,
// "CR-PT-021": receivedData["CR-PT-021"] || null,
// "CR-PT-001": receivedData["CR-PT-001"] || null,
// "CR-TT-001": receivedData["CR-TT-001"] || null,
// "CR-FT-001": receivedData["CR-FT-001"] || null,
// "CR-TT-002": receivedData["CR-TT-002"] || null,
// "GS-AT-011": receivedData["GS-AT-011"] || null,
// "GS-AT-012": receivedData["GS-AT-012"] || null,
// "GS-PT-011": receivedData["GS-PT-011"] || null,
// "GS-TT-011": receivedData["GS-TT-011"] || null,
// "GS-AT-022": receivedData["GS-AT-022"] || null,
// "GS-PT-021": receivedData["GS-PT-021"] || null,
// "GS-TT-021": receivedData["GS-TT-021"] || null,
// "PR-TT-001": receivedData["PR-TT-001"] || null,
// "PR-TT-061": receivedData["PR-TT-061"] || null,
// "PR-TT-072": receivedData["PR-TT-072"] || null,
// "PR-FT-001": receivedData["PR-FT-001"] || null,
// "PR-AT-001": receivedData["PR-AT-001"] || null,
// "PR-AT-003": receivedData["PR-AT-003"] || null,
// "PR-AT-005": receivedData["PR-AT-005"] || null,
// "DM-LSH-001": receivedData["DM-LSH-001"] || null,
// "DM-LSL-001": receivedData["DM-LSL-001"] || null,
// "GS-LSL-021": receivedData["GS-LSL-021"] || null,
// "GS-LSL-011": receivedData["GS-LSL-011"] || null,
// "PR-VA-301": receivedData["PR-VA-301"] || null,
// "PR-VA-352": receivedData["PR-VA-352"] || null,
// "PR-VA-312": receivedData["PR-VA-312"] || null,
// "PR-VA-351": receivedData["PR-VA-351"] || null,
// "PR-VA-361Ain": receivedData["PR-VA-361Ain"] || null,
// "PR-VA-361Aout": receivedData["PR-VA-361Aout"] || null,
// "PR-VA-361Bin": receivedData["PR-VA-361Bin"] || null,
// "PR-VA-361Bout": receivedData["PR-VA-361Bout"] || null,
// "PR-VA-362Ain": receivedData["PR-VA-362Ain"] || null,
// "PR-VA-362Aout": receivedData["PR-VA-362Aout"] || null,
// "PR-VA-362Bin": receivedData["PR-VA-362Bin"] || null,
// "PR-VA-362Bout": receivedData["PR-VA-362Bout"] || null,
// "N2-VA-311": receivedData["N2-VA-311"] || null,
// "GS-VA-311": receivedData["GS-VA-311"] || null,
// "GS-VA-312": receivedData["GS-VA-312"] || null,
// "N2-VA-321": receivedData["N2-VA-321"] || null,
// "GS-VA-321": receivedData["GS-VA-321"] || null,
// "GS-VA-322": receivedData["GS-VA-322"] || null,
// "GS-VA-022": receivedData["GS-VA-022"] || null,
// "GS-VA-021": receivedData["GS-VA-021"] || null,
// "AX-VA-351": receivedData["AX-VA-351"] || null,
// "AX-VA-311": receivedData["AX-VA-311"] || null,
// "AX-VA-312": receivedData["AX-VA-312"] || null,
// "AX-VA-321": receivedData["AX-VA-321"] || null,
// "AX-VA-322": receivedData["AX-VA-322"] || null,
// "AX-VA-391": receivedData["AX-VA-391"] || null,
// "DM-VA-301": receivedData["DM-VA-301"] || null,
// "DCDB0-VT-001": receivedData["DCDB0-VT-001"] || null,
// "DCDB0-CT-001": receivedData["DCDB0-CT-001"] || null,
// "DCDB1-VT-001": receivedData["DCDB1-VT-001"] || null,
// "DCDB1-CT-001": receivedData["DCDB1-CT-001"] || null,
// "DCDB2-VT-001": receivedData["DCDB2-VT-001"] || null,
// "DCDB2-CT-001": receivedData["DCDB2-CT-001"] || null,
// "DCDB3-VT-001": receivedData["DCDB3-VT-001"] || null,
// "DCDB3-CT-001": receivedData["DCDB3-CT-001"] || null,
// "DCDB4-VT-001": receivedData["DCDB4-VT-001"] || null,
// "DCDB4-CT-001": receivedData["DCDB4-CT-001"] || null,
// "RECT-CT-001": receivedData["RECT-CT-001"] || null,
// "RECT-VT-001": receivedData["RECT-VT-001"] || null,

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
//     <Box m="20px">
//     <Header
//         title="Historical Line Analytics"
//         subtitle="Welcome to your Historical Line Analytics"
//       />
//       <Box display="flex" justifyContent="flex-end" marginBottom={4}>
//         <Button variant="contained" color="secondary" onClick={() => setChartDialogOpen(true)}>Add Historical Chart</Button>
//       </Box>
//       <GridLayout
//         className="layout"
//         layout={layout}
//         cols={12}
//         rowHeight={45}
//         width={1600}
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
//             <Box display="flex" justifyContent="space-between" p={2} sx={{ backgroundColor: "" }}>
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
//                 <MenuItem value="10_minute">Last 10 minute</MenuItem>
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
//           <Button onClick={handleDateRangeApply} color="secondary" disabled={!chartDateRanges[currentChartId]?.startDate || (mode === "B" && !chartDateRanges[currentChartId]?.endDate)}>Apply</Button>
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
                 
//                    <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//                       <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
// <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
// <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
// <MenuItem value="CR-LT-011">CR-LT-011</MenuItem>
// <MenuItem value="CR-PT-011">CR-PT-011</MenuItem>
// <MenuItem value="CR-LT-021">CR-LT-021</MenuItem>
// <MenuItem value="CR-PT-021">CR-PT-021</MenuItem>
// <MenuItem value="CR-PT-001">CR-PT-001</MenuItem>
// <MenuItem value="CR-TT-001">CR-TT-001</MenuItem>
// <MenuItem value="CR-FT-001">CR-FT-001</MenuItem>
// <MenuItem value="CR-TT-002">CR-TT-002</MenuItem>
// <MenuItem value="GS-AT-011">GS-AT-011</MenuItem>
// <MenuItem value="GS-AT-012">GS-AT-012</MenuItem>
// <MenuItem value="GS-PT-011">GS-PT-011</MenuItem>
// <MenuItem value="GS-TT-011">GS-TT-011</MenuItem>
// <MenuItem value="GS-AT-022">GS-AT-022</MenuItem>
// <MenuItem value="GS-PT-021">GS-PT-021</MenuItem>
// <MenuItem value="GS-TT-021">GS-TT-021</MenuItem>
// <MenuItem value="PR-TT-001">PR-TT-001</MenuItem>
// <MenuItem value="PR-TT-061">PR-TT-061</MenuItem>
// <MenuItem value="PR-TT-072">PR-TT-072</MenuItem>
// <MenuItem value="PR-FT-001">PR-FT-001</MenuItem>
// <MenuItem value="PR-AT-001">PR-AT-001</MenuItem>
// <MenuItem value="PR-AT-003">PR-AT-003</MenuItem>
// <MenuItem value="PR-AT-005">PR-AT-005</MenuItem>
// <MenuItem value="DM-LSH-001">DM-LSH-001</MenuItem>
// <MenuItem value="DM-LSL-001">DM-LSL-001</MenuItem>
// <MenuItem value="GS-LSL-021">GS-LSL-021</MenuItem>
// <MenuItem value="GS-LSL-011">GS-LSL-011</MenuItem>
// <MenuItem value="PR-VA-301">PR-VA-301</MenuItem>
// <MenuItem value="PR-VA-352">PR-VA-352</MenuItem>
// <MenuItem value="PR-VA-312">PR-VA-312</MenuItem>
// <MenuItem value="PR-VA-351">PR-VA-351</MenuItem>
// <MenuItem value="PR-VA-361Ain">PR-VA-361Ain</MenuItem>
// <MenuItem value="PR-VA-361Aout">PR-VA-361Aout</MenuItem>
// <MenuItem value="PR-VA-361Bin">PR-VA-361Bin</MenuItem>
// <MenuItem value="PR-VA-361Bout">PR-VA-361Bout</MenuItem>
// <MenuItem value="PR-VA-362Ain">PR-VA-362Ain</MenuItem>
// <MenuItem value="PR-VA-362Aout">PR-VA-362Aout</MenuItem>
// <MenuItem value="PR-VA-362Bin">PR-VA-362Bin</MenuItem>
// <MenuItem value="PR-VA-362Bout">PR-VA-362Bout</MenuItem>
// <MenuItem value="N2-VA-311">N2-VA-311</MenuItem>
// <MenuItem value="GS-VA-311">GS-VA-311</MenuItem>
// <MenuItem value="GS-VA-312">GS-VA-312</MenuItem>
// <MenuItem value="N2-VA-321">N2-VA-321</MenuItem>
// <MenuItem value="GS-VA-321">GS-VA-321</MenuItem>
// <MenuItem value="GS-VA-322">GS-VA-322</MenuItem>
// <MenuItem value="GS-VA-022">GS-VA-022</MenuItem>
// <MenuItem value="GS-VA-021">GS-VA-021</MenuItem>
// <MenuItem value="AX-VA-351">AX-VA-351</MenuItem>
// <MenuItem value="AX-VA-311">AX-VA-311</MenuItem>
// <MenuItem value="AX-VA-312">AX-VA-312</MenuItem>
// <MenuItem value="AX-VA-321">AX-VA-321</MenuItem>
// <MenuItem value="AX-VA-322">AX-VA-322</MenuItem>
// <MenuItem value="AX-VA-391">AX-VA-391</MenuItem>
// <MenuItem value="DM-VA-301">DM-VA-301</MenuItem>
// <MenuItem value="DCDB0-VT-001">DCDB0-VT-001</MenuItem>
// <MenuItem value="DCDB0-CT-001">DCDB0-CT-001</MenuItem>
// <MenuItem value="DCDB1-VT-001">DCDB1-VT-001</MenuItem>
// <MenuItem value="DCDB1-CT-001">DCDB1-CT-001</MenuItem>
// <MenuItem value="DCDB2-VT-001">DCDB2-VT-001</MenuItem>
// <MenuItem value="DCDB2-CT-001">DCDB2-CT-001</MenuItem>
// <MenuItem value="DCDB3-VT-001">DCDB3-VT-001</MenuItem>
// <MenuItem value="DCDB3-CT-001">DCDB3-CT-001</MenuItem>
// <MenuItem value="DCDB4-VT-001">DCDB4-VT-001</MenuItem>
// <MenuItem value="DCDB4-CT-001">DCDB4-CT-001</MenuItem>
// <MenuItem value="RECT-CT-001">RECT-CT-001</MenuItem>
// <MenuItem value="RECT-VT-001">RECT-VT-001</MenuItem>
//                     </Select>
//                   </FormControl>
//                   <FormControl fullWidth margin="normal">
//                     <InputLabel>Range</InputLabel>
//                     <Select value={yAxis.range} onChange={(event) => handleRangeChange(yAxis.id, event)}>
//                       <MenuItem value="0-500">0-500</MenuItem>
//                       <MenuItem value="0-100">0-100</MenuItem>
//                       <MenuItem value="0-1200">0-1200</MenuItem>
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
//                   <Button color="secondary" onClick={() => openColorPicker(yAxis.id)}>Select Color</Button>
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
//             <Button onClick={saveConfiguration} color="secondary">Save</Button>
//           </DialogActions>
//         </Dialog>
//       )}
//         </Box>
//     </LocalizationProvider>
//   );
// };

// export default HistoricalCharts;


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
//     <Box sx={{ height: "calc(100% - 80px)" }}>
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
//         <Brush height={30} dataKey="timestamp" stroke="#8884d8" />
//       </LineChart>
//       </ResponsiveContainer>
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
//             <Box display="flex" justifyContent="space-between" p={2} sx={{ backgroundColor: "" }}>
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
//                   <Button color="secondary" onClick={() => openColorPicker(yAxis.id)}>Select Color</Button>
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
//             data-grid={layout.find((l) => l.i === chart.id.toString()) || { x: 0, y: 1, w: 6, h: 8 }}
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



// import {
//   format,
//   subMinutes,
//   subHours,
//   subDays,
//   subWeeks,
//   subMonths,
//   parseISO,
// } from "date-fns";
// import React, { useState, useEffect, useRef } from "react";
// import GridLayout from "react-grid-layout";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   Brush,
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
// import { w3cwebsocket as W3CWebSocket } from "websocket";
// import axios from "axios";
// import "react-grid-layout/css/styles.css";
// import "react-resizable/css/styles.css";

// const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

// const HistoricalCharts = () => {
//   const [charts, setCharts] = useState([]);
//   const [layout, setLayout] = useState(() => {
//     const savedLayout = localStorage.getItem("chartsLayout");
//     return savedLayout ? JSON.parse(savedLayout) : [];
//   });
//   const [chartData, setChartData] = useState({});
//   const [tempChartData, setTempChartData] = useState(null);
//   const [chartDialogOpen, setChartDialogOpen] = useState(false);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [colorPickerOpen, setColorPickerOpen] = useState(false);
//   const [selectedYAxisId, setSelectedYAxisId] = useState(null);
//   const [dateDialogOpen, setDateDialogOpen] = useState(false);
//   const [startDate, setStartDate] = useState(null);
//   const [endDate, setEndDate] = useState(null);
//   const [mode, setMode] = useState("B");
//   const [currentChartId, setCurrentChartId] = useState(null);
//   const wsClientRefs = useRef({});
//   const [selectedTimeRange, setSelectedTimeRange] = useState();

//   useEffect(() => {
//     const savedCharts = localStorage.getItem("historicalCharts");
//     if (savedCharts) {
//       setCharts(JSON.parse(savedCharts));
//     }
//   }, []);

//   const saveChartsToLocalStorage = (updatedCharts) => {
//     const chartConfigurations = updatedCharts.map((chart) => ({
//       id: chart.id,
//       type: chart.type,
//       xAxisDataKey: chart.xAxisDataKey,
//       yAxisDataKeys: chart.yAxisDataKeys,
//     }));
//     localStorage.setItem(
//       "historicalCharts",
//       JSON.stringify(chartConfigurations)
//     );
//   };

//   const saveLayoutToLocalStorage = (updatedLayout) => {
//     setLayout(updatedLayout);
//     localStorage.setItem("chartsLayout", JSON.stringify(updatedLayout));
//   };

//   const saveConfiguration = () => {
//     const updatedCharts = charts.map((chart) =>
//       chart.id === tempChartData.id ? tempChartData : chart
//     );
//     setCharts(updatedCharts);
//     saveChartsToLocalStorage(updatedCharts);
//     setDialogOpen(false);
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
//       const formattedEndDate =
//         mode === "C"
//           ? format(new Date(), "yyyy-MM-dd'T'HH:mm")
//           : format(endDate, "yyyy-MM-dd'T'HH:mm");

//       const response = await axios.post(
//         "https://xdeuid6slkki7yxz4zhdbqbzfq0hirkk.lambda-url.us-east-1.on.aws/",
//         {
//           start_time: formattedStartDate,
//           end_time: formattedEndDate,
//         }
//       );

//       const parsedBody = JSON.parse(response.data.body);
//       const fetchedData = parsedBody.data.map((item) => ({
//         timestamp: item[0],
//         "AX-LT-011": item[1],
//         "AX-LT-021": item[2],
//         "CW-TT-011": item[3],
//         "CW-TT-021": item[4],
//         "CR-LT-011": item[5],
//         "CR-PT-011": item[6],
//         "CR-LT-021": item[7],
//         "CR-PT-021": item[8],
//         "CR-PT-001": item[9],
//         "CR-TT-001": item[10],
//         "CR-FT-001": item[11],
//         "CR-TT-002": item[12],
//         "GS-AT-011": item[13],
//         "GS-AT-012": item[14],
//         "GS-PT-011": item[15],
//         "GS-TT-011": item[16],
//         "GS-AT-022": item[17],
//         "GS-PT-021": item[18],
//         "GS-TT-021": item[19],
//         "PR-TT-001": item[20],
//         "PR-TT-061": item[21],
//         "PR-TT-072": item[22],
//         "PR-FT-001": item[23],
//         "PR-AT-001": item[24],
//         "PR-AT-003": item[25],
//         "PR-AT-005": item[26],
//         "DM-LSH-001": item[27],
//         "DM-LSL-001": item[28],
//         "GS-LSL-021": item[29],
//         "GS-LSL-011": item[30],
//         "PR-VA-301": item[31],
//         "PR-VA-352": item[32],
//         "PR-VA-312": item[33],
//         "PR-VA-351": item[34],
//         "PR-VA-361Ain": item[35],
//         "PR-VA-361Aout": item[36],
//         "PR-VA-361Bin": item[37],
//         "PR-VA-361Bout": item[38],
//         "PR-VA-362Ain": item[39],
//         "PR-VA-362Aout": item[40],
//         "PR-VA-362Bin": item[41],
//         "PR-VA-362Bout": item[42],
//         "N2-VA-311": item[43],
//         "GS-VA-311": item[44],
//         "GS-VA-312": item[45],
//         "N2-VA-321": item[46],
//         "GS-VA-321": item[47],
//         "GS-VA-322": item[48],
//         "GS-VA-022": item[49],
//         "GS-VA-021": item[50],
//         "AX-VA-351": item[51],
//         "AX-VA-311": item[52],
//         "AX-VA-312": item[53],
//         "AX-VA-321": item[54],
//         "AX-VA-322": item[55],
//         "AX-VA-391": item[56],
//         "DM-VA-301": item[57],
//         "DCDB0-VT-001": item[58],
//         "DCDB0-CT-001": item[59],
//         "DCDB1-VT-001": item[60],
//         "DCDB1-CT-001": item[61],
//         "DCDB2-VT-001": item[62],
//         "DCDB2-CT-001": item[63],
//         "DCDB3-VT-001": item[64],
//         "DCDB3-CT-001": item[65],
//         "DCDB4-VT-001": item[66],
//         "DCDB4-CT-001": item[67],
//         "RECT-CT-001": item[68],
//         "RECT-VT-001": item[69],
//       }));

//       setChartData((prevData) => ({
//         ...prevData,
//         [chartId]: fetchedData,
//       }));

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
// "CW-TT-021": receivedData["CW-TT-021"] || null,
// "CR-LT-011": receivedData["CR-LT-011"] || null,
// "CR-PT-011": receivedData["CR-PT-011"] || null,
// "CR-LT-021": receivedData["CR-LT-021"] || null,
// "CR-PT-021": receivedData["CR-PT-021"] || null,
// "CR-PT-001": receivedData["CR-PT-001"] || null,
// "CR-TT-001": receivedData["CR-TT-001"] || null,
// "CR-FT-001": receivedData["CR-FT-001"] || null,
// "CR-TT-002": receivedData["CR-TT-002"] || null,
// "GS-AT-011": receivedData["GS-AT-011"] || null,
// "GS-AT-012": receivedData["GS-AT-012"] || null,
// "GS-PT-011": receivedData["GS-PT-011"] || null,
// "GS-TT-011": receivedData["GS-TT-011"] || null,
// "GS-AT-022": receivedData["GS-AT-022"] || null,
// "GS-PT-021": receivedData["GS-PT-021"] || null,
// "GS-TT-021": receivedData["GS-TT-021"] || null,
// "PR-TT-001": receivedData["PR-TT-001"] || null,
// "PR-TT-061": receivedData["PR-TT-061"] || null,
// "PR-TT-072": receivedData["PR-TT-072"] || null,
// "PR-FT-001": receivedData["PR-FT-001"] || null,
// "PR-AT-001": receivedData["PR-AT-001"] || null,
// "PR-AT-003": receivedData["PR-AT-003"] || null,
// "PR-AT-005": receivedData["PR-AT-005"] || null,
// "DM-LSH-001": receivedData["DM-LSH-001"] || null,
// "DM-LSL-001": receivedData["DM-LSL-001"] || null,
// "GS-LSL-021": receivedData["GS-LSL-021"] || null,
// "GS-LSL-011": receivedData["GS-LSL-011"] || null,
// "PR-VA-301": receivedData["PR-VA-301"] || null,
// "PR-VA-352": receivedData["PR-VA-352"] || null,
// "PR-VA-312": receivedData["PR-VA-312"] || null,
// "PR-VA-351": receivedData["PR-VA-351"] || null,
// "PR-VA-361Ain": receivedData["PR-VA-361Ain"] || null,
// "PR-VA-361Aout": receivedData["PR-VA-361Aout"] || null,
// "PR-VA-361Bin": receivedData["PR-VA-361Bin"] || null,
// "PR-VA-361Bout": receivedData["PR-VA-361Bout"] || null,
// "PR-VA-362Ain": receivedData["PR-VA-362Ain"] || null,
// "PR-VA-362Aout": receivedData["PR-VA-362Aout"] || null,
// "PR-VA-362Bin": receivedData["PR-VA-362Bin"] || null,
// "PR-VA-362Bout": receivedData["PR-VA-362Bout"] || null,
// "N2-VA-311": receivedData["N2-VA-311"] || null,
// "GS-VA-311": receivedData["GS-VA-311"] || null,
// "GS-VA-312": receivedData["GS-VA-312"] || null,
// "N2-VA-321": receivedData["N2-VA-321"] || null,
// "GS-VA-321": receivedData["GS-VA-321"] || null,
// "GS-VA-322": receivedData["GS-VA-322"] || null,
// "GS-VA-022": receivedData["GS-VA-022"] || null,
// "GS-VA-021": receivedData["GS-VA-021"] || null,
// "AX-VA-351": receivedData["AX-VA-351"] || null,
// "AX-VA-311": receivedData["AX-VA-311"] || null,
// "AX-VA-312": receivedData["AX-VA-312"] || null,
// "AX-VA-321": receivedData["AX-VA-321"] || null,
// "AX-VA-322": receivedData["AX-VA-322"] || null,
// "AX-VA-391": receivedData["AX-VA-391"] || null,
// "DM-VA-301": receivedData["DM-VA-301"] || null,
// "DCDB0-VT-001": receivedData["DCDB0-VT-001"] || null,
// "DCDB0-CT-001": receivedData["DCDB0-CT-001"] || null,
// "DCDB1-VT-001": receivedData["DCDB1-VT-001"] || null,
// "DCDB1-CT-001": receivedData["DCDB1-CT-001"] || null,
// "DCDB2-VT-001": receivedData["DCDB2-VT-001"] || null,
// "DCDB2-CT-001": receivedData["DCDB2-CT-001"] || null,
// "DCDB3-VT-001": receivedData["DCDB3-VT-001"] || null,
// "DCDB3-CT-001": receivedData["DCDB3-CT-001"] || null,
// "DCDB4-VT-001": receivedData["DCDB4-VT-001"] || null,
// "DCDB4-CT-001": receivedData["DCDB4-CT-001"] || null,
// "RECT-CT-001": receivedData["RECT-CT-001"] || null,
// "RECT-VT-001": receivedData["RECT-VT-001"] || null,

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
//     const updatedCharts = [...charts, newChart];
//     setCharts(updatedCharts);
//     saveChartsToLocalStorage(updatedCharts);
//     setLayout([
//       ...layout,
//       { i: newChartId.toString(), x: 0, y: Infinity, w: 6, h: 8 },
//     ]);
//     setChartDialogOpen(false);
//   };

//   const deleteChart = (chartId) => {
//     const updatedCharts = charts.filter((chart) => chart.id !== chartId);
//     setCharts(updatedCharts);
//     saveChartsToLocalStorage(updatedCharts);
//     const updatedLayout = layout.filter((l) => l.i !== chartId.toString());
//     setLayout(updatedLayout);
//     localStorage.setItem("chartsLayout", JSON.stringify(updatedLayout));
//     const updatedChartData = { ...chartData };
//     delete updatedChartData[chartId];
//     setChartData(updatedChartData);
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
//       yAxisDataKeys: prevChart.yAxisDataKeys.filter(
//         (yAxis) => yAxis.id !== yAxisId
//       ),
//     }));
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
//   const openColorPicker = (yAxisId) => {
//     setSelectedYAxisId(yAxisId);
//     setColorPickerOpen(true);
//   };
//   const openDialog = (chart) => {
//     setTempChartData(chart);
//     setDialogOpen(true);
//   };

//   const renderLineChart = (chart) => (
//     <ResponsiveContainer width="100%" height={300}>
//       <LineChart data={chartData[chart.id]}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis
//           dataKey="timestamp"
//           tickFormatter={(tick) => new Date(tick).toLocaleString()}
//         />
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
//             />
//           ))
//         )}
//         <Brush height={30} dataKey="timestamp" stroke="#8884d8" />
//       </LineChart>
//     </ResponsiveContainer>
//   );

//   const renderChart = (chart) => (
//     <Box>
//       {renderLineChart(chart)}
//       <Box display="flex" justifyContent="space-around" mt={2} gap={2}>
//         <Button
//           variant="contained"
//           color="secondary"
//           onClick={() => {
//             setTempChartData(chart);
//             setDialogOpen(true);
//           }}
//         >
//           Configure Chart
//         </Button>
//         <Button
//           variant="contained"
//           color="secondary"
//           onClick={() => {
//             setCurrentChartId(chart.id);
//             setDateDialogOpen(true);
//           }}
//         >
//           Choose Date Range
//         </Button>
//       </Box>
//     </Box>
//   );

//   const handleDateRangeApply = () => {
//     setDateDialogOpen(false);
//     if (mode === "C") {
//       fetchChartData(currentChartId);
//     } else if (mode === "B") {
//       fetchChartData(currentChartId);
//     }
//   };

//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       <>
//         <Box display="flex" justifyContent="flex-end" marginBottom={4}>
//           <Button
//             variant="contained"
//             color="secondary"
//             onClick={() => setChartDialogOpen(true)}
//           >
//             Add Realtime Historical Chart
//           </Button>
//         </Box>
//         <GridLayout
//           className="layout"
//           layout={layout}
//           cols={12}
//           rowHeight={45}
//           width={1910}
//           onLayoutChange={saveLayoutToLocalStorage}
//           draggableHandle=".drag-handle"
//           isResizable
//         >
//           {charts.map((chart) => (
//             <Box
//               key={chart.id}
//               data-grid={
//                 layout.find((l) => l.i === chart.id.toString()) || {
//                   x: 0,
//                   y: Infinity,
//                   w: 6,
//                   h: 8,
//                 }
//               }
//               sx={{
//                 position: "relative",
//                 border: "1px solid #ccc",
//                 borderRadius: "8px",
//                 overflow: "hidden",
//               }}
//             >
//               <Box
//                 display="flex"
//                 justifyContent="space-between"
//                 p={2}
//                 sx={{ backgroundColor: "#f5f5f5" }}
//               >
//                 <IconButton className="drag-handle">
//                   <DragHandleIcon />
//                 </IconButton>
//                 <Typography variant="h6">{chart.type} Chart</Typography>
//                 <IconButton
//                   aria-label="delete"
//                   onClick={() => deleteChart(chart.id)}
//                 >
//                   <DeleteIcon />
//                 </IconButton>
//               </Box>

//               <Box sx={{ height: "calc(100% - 100px)" }}>
//                 {renderChart(chart)}
//               </Box>
//             </Box>
//           ))}
//         </GridLayout>
//         <Dialog
//           open={chartDialogOpen}
//           onClose={() => setChartDialogOpen(false)}
//         >
//           <DialogTitle>Select Chart Type</DialogTitle>
//           <DialogContent>
//             <Box display="flex" flexDirection="column" gap={2}>
//               <Button
//                 variant="contained"
//                 onClick={() => addCustomChart("Line")}
//               >
//                 Add Line Chart
//               </Button>
//             </Box>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setChartDialogOpen(false)} color="secondary">
//               Cancel
//             </Button>
//           </DialogActions>
//         </Dialog>
//         <Dialog
//           open={dateDialogOpen}
//           onClose={() => setDateDialogOpen(false)}
//           fullWidth
//           maxWidth="sm"
//         >
//           <DialogTitle>Select Date Range</DialogTitle>
//           <DialogContent>
//             <FormControl component="fieldset">
//               <RadioGroup
//                 row
//                 value={mode}
//                 onChange={(e) => setMode(e.target.value)}
//               >
//                 <FormControlLabel
//                   value="B"
//                   control={<Radio />}
//                   label="Select Date Range"
//                 />
//                 <FormControlLabel
//                   value="C"
//                   control={<Radio />}
//                   label="Start Date & Continue Real-Time"
//                 />
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
//                   disabled={mode === "C"}
//                 />
//               </Grid>
//             </Grid>
//             <Box display="flex" justifyContent="flex-end" marginBottom={2}>
//               <FormControl>
//                 <InputLabel id="time-range-label">Time Range</InputLabel>
//                 <Select
//                   labelId="time-range-label"
//                   value={selectedTimeRange}
//                   onChange={handleTimeRangeChange}
//                 >
//                   <MenuItem value="1_minute">Last 1 minute</MenuItem>
//                   <MenuItem value="30_minutes">Last 30 minutes</MenuItem>
//                   <MenuItem value="1_hour">Last 1 hour</MenuItem>
//                   <MenuItem value="6_hours">Last 6 hour</MenuItem>
//                   <MenuItem value="12_hours">Last 12 hours</MenuItem>
//                   <MenuItem value="1_day">Last 1 day</MenuItem>
//                   <MenuItem value="2_day">Last 2 day</MenuItem>
//                   <MenuItem value="1_week">Last 1 week</MenuItem>
//                   <MenuItem value="1_month">Last 1 month</MenuItem>
//                 </Select>
//               </FormControl>
//             </Box>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setDateDialogOpen(false)} color="secondary">
//               Cancel
//             </Button>
//             <Button
//               onClick={handleDateRangeApply}
//               color="primary"
//               disabled={!startDate || (mode === "B" && !endDate)}
//             >
//               Apply
//             </Button>
//           </DialogActions>
//         </Dialog>

//         {tempChartData && (
//           <Dialog
//             open={dialogOpen}
//             onClose={() => setDialogOpen(false)}
//             fullWidth
//             maxWidth="md"
//           >
//             <DialogTitle>Configure Chart</DialogTitle>
//             <DialogContent>
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
//             <DialogActions>
//               <Button onClick={() => setDialogOpen(false)} color="secondary">
//                 Cancel
//               </Button>
//               <Button onClick={saveConfiguration} color="primary">
//                 Save
//               </Button>
//             </DialogActions>
//           </Dialog>
//         )}
//       </>
//     </LocalizationProvider>
//   );
// };

// export default HistoricalCharts;

// import { format, subMinutes, subHours, subDays, subWeeks, subMonths , parseISO } from 'date-fns';
// import React, { useState, useEffect, useRef } from "react";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   ScatterChart,
//   Scatter,
//   Brush,
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
// import { w3cwebsocket as W3CWebSocket } from "websocket";
// import axios from "axios";

// const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

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
//   const [mode, setMode] = useState("B"); // A for real-time, B for historical range, C for real-time + historical
//   const [currentChartId, setCurrentChartId] = useState(null); // The ID of the chart currently configuring date range
//   const wsClientRefs = useRef({}); // Use a map of refs for WebSocket clients

//    const [selectedTimeRange, setSelectedTimeRange] = useState();

//   // Load saved charts from localStorage on component mount
// useEffect(() => {
//   const savedCharts = localStorage.getItem("historicalCharts");
//   if (savedCharts) {
//     setCharts(JSON.parse(savedCharts));
//   }
// }, []);

//   // Save chart configurations (without data points) to localStorage whenever charts are updated
//   const saveChartsToLocalStorage = (updatedCharts) => {
//     const chartConfigurations = updatedCharts.map((chart) => ({
//       id: chart.id,
//       type: chart.type,
//       xAxisDataKey: chart.xAxisDataKey,
//       yAxisDataKeys: chart.yAxisDataKeys,
//     }));
//     localStorage.setItem("historicalCharts", JSON.stringify(chartConfigurations));
//   };

//     // Map selected time range to date range
//     useEffect(() => {
//       let start;
//       switch (selectedTimeRange) {
//         case '1_minute':
//           start = subMinutes(new Date(), 1);
//           break;
//         case '30_minutes':
//           start = subMinutes(new Date(), 30);
//           break;
//         case '1_hour':
//           start = subHours(new Date(), 1);
//           break;
//         case '6_hours':
//           start = subHours(new Date(), 6);
//           break;
//           case '12_hours':
//             start = subHours(new Date(), 12);
//             break;
//         case '1_day':
//           start = subDays(new Date(), 1);
//           break;
//           case '2_day':
//             start = subDays(new Date(), 2);
//             break;

//         case '1_week':
//           start = subWeeks(new Date(), 1);
//           break;
//         case '1_month':
//           start = subMonths(new Date(), 1);
//           break;
//         default:
//           start = subMinutes(new Date(), 1);// Default to 1 minute
//           break;
//       }
//       setStartDate(start);
//       setEndDate(new Date());
//     }, [selectedTimeRange]);

//     const handleTimeRangeChange = (event) => {
//       setSelectedTimeRange(event.target.value);
//       charts.forEach(chart => {
//         fetchChartData(chart.id); // Fetch new data for HistoricalCharts specifically
//       });
//     };

// // Updated fetchChartData to handle mode "C" for historical + real-time data
// const fetchChartData = async (chartId) => {
//   if (!startDate) return; // Ensure start date is set

//   try {
//     const formattedStartDate = format(startDate, "yyyy-MM-dd'T'HH:mm");
//     const formattedEndDate =
//       mode === "C" ? format(new Date(), "yyyy-MM-dd'T'HH:mm") : format(endDate, "yyyy-MM-dd'T'HH:mm");

//     const response = await axios.post(
//       "https://xdeuid6slkki7yxz4zhdbqbzfq0hirkk.lambda-url.us-east-1.on.aws/",
//       {
//         start_time: formattedStartDate,
//         end_time: formattedEndDate,
//       }
//     );

//     const parsedBody = JSON.parse(response.data.body);
//     const fetchedData = parsedBody.data.map((item) => ({
//       timestamp: item[0],
//       "AX-LT-011": item[1],
//       "AX-LT-021": item[2],
//       "CW-TT-011": item[3],
//       "CW-TT-021": item[4],
//       "CR-PT-001": item[10],
//     }));

//     setChartData((prevData) => ({
//       ...prevData,
//       [chartId]: fetchedData,
//     }));

//     if (mode === "C") {
//       setupRealTimeWebSocket(chartId); // Begin WebSocket data streaming in "C" mode
//     }
//   } catch (error) {
//     console.error("Error fetching data from the API:", error);
//   }
// };

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
//           "CW-TT-021": receivedData["CW-TT-021"] || null,
//           "CR-PT-001": receivedData["CR-PT-001"] || null,
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
//     const updatedCharts = [...charts, newChart];
//     setCharts(updatedCharts);
//     saveChartsToLocalStorage(updatedCharts); // Save the updated charts to localStorage
//     setChartDialogOpen(false);
//   };

//   const deleteChart = (chartId) => {
//     const updatedCharts = charts.filter((chart) => chart.id !== chartId);
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
//   const renderLineChart = (chart) => (
//     <ResponsiveContainer width="100%" height={400}>
//       <LineChart data={chartData[chart.id]}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis
//           dataKey="timestamp"
//           tickFormatter={(tick) => new Date(tick).toLocaleString()}
//         />
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
//             />
//           ))
//         )}
//         <Brush height={30} dataKey="timestamp" stroke="#8884d8" />
//       </LineChart>
//     </ResponsiveContainer>
//   );

//   const renderChart = (chart) => {
//     switch (chart.type) {
//       case "Line":
//         return renderLineChart(chart);
//       default:
//         return null;
//     }
//   };
//   const handleDateRangeApply = () => {
//     setDateDialogOpen(false);
//     if (mode === "C") {
//       fetchChartData(currentChartId); // Fetch historical data up to the current time
//     } else if (mode === "B") {
//       fetchChartData(currentChartId);
//     }
//   };
//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       <Container>
//         <Box display="flex" justifyContent="flex-end" marginBottom={4}>
//           <Button
//             variant="contained"
//             color="secondary"
//             onClick={() => setChartDialogOpen(true)}
//           >
//             Add Realtime Historical Chart
//           </Button>
//         </Box>
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
//               <Box
//                 display="flex"
//                 justifyContent="flex-end"
//                 gap={2}
//                 marginTop={2}
//               >
//                 <Button
//                   variant="outlined"
//                   color="secondary"
//                   onClick={() => openDialog(chart)}
//                 >
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
//         <Dialog
//           open={chartDialogOpen}
//           onClose={() => setChartDialogOpen(false)}
//         >
//           <DialogTitle>Select Chart Type</DialogTitle>
//           <DialogContent>
//             <Box display="flex" flexDirection="column" gap={2}>
//               <Button
//                 variant="contained"
//                 onClick={() => addCustomChart("Line")}
//               >
//                 Add Line Chart
//               </Button>
//             </Box>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setChartDialogOpen(false)} color="secondary">
//               Cancel
//             </Button>
//           </DialogActions>
//         </Dialog>

//         {/* Date Range Selection Dialog */}
//         <Dialog
//           open={dateDialogOpen}
//           onClose={() => setDateDialogOpen(false)}
//           fullWidth
//           maxWidth="sm"
//         >
//           <DialogTitle>Select Date Range</DialogTitle>
//           <DialogContent>
//           <FormControl component="fieldset">
//           <RadioGroup
//             row
//             value={mode}
//             onChange={(e) => setMode(e.target.value)}
//           >
//             {/* Removed value "A" */}
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
//               disabled={mode === "C"} // Disabled end date when mode is "C"
//             />
//           </Grid>
//         </Grid>

//         <Box display="flex" justifyContent="flex-end" marginBottom={2}>
//         <FormControl>
//           <InputLabel id="time-range-label">Time Range</InputLabel>
//           <Select
//             labelId="time-range-label"
//             value={selectedTimeRange}
//             onChange={handleTimeRangeChange}
//           >
//             <MenuItem value="1_minute">Last 1 minute</MenuItem>
//             <MenuItem value="30_minutes">Last 30 minutes</MenuItem>
//             <MenuItem value="1_hour">Last 1 hour</MenuItem>
//             <MenuItem value="6_hours">Last 6 hour</MenuItem>
//             <MenuItem value="12_hours">Last 12 hours</MenuItem>
//             <MenuItem value="1_day">Last 1 day</MenuItem>
//             <MenuItem value="2_day">Last 2 day</MenuItem>
//             <MenuItem value="1_week">Last 1 week</MenuItem>
//             <MenuItem value="1_month">Last 1 month</MenuItem>
//           </Select>
//         </FormControl>
//       </Box>

//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setDateDialogOpen(false)} color="secondary">
//               Cancel
//             </Button>
//             <Button
//               onClick={handleDateRangeApply}
//               color="primary"
//               disabled={!startDate || (mode === "B" && !endDate)}
//             >
//               Apply
//             </Button>
//           </DialogActions>
//         </Dialog>

//         {/* Chart Configuration Dialog */}
//         {tempChartData && (
//           <Dialog
//             open={dialogOpen}
//             onClose={closeDialog}
//             fullWidth
//             maxWidth="md"
//           >
//             <DialogTitle>Configure Chart</DialogTitle>
//             <DialogContent>
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
//             <DialogActions>
//               <Button onClick={closeDialog} color="secondary">
//                 Cancel
//               </Button>
//               <Button onClick={saveConfiguration} color="primary">
//                 Save
//               </Button>
//             </DialogActions>
//           </Dialog>
//         )}
//       </Container>
//     </LocalizationProvider>
//   );
// };

// export default HistoricalCharts;

// import React, { useState, useEffect, useRef } from "react";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   ScatterChart,
//   Scatter,
//   Brush,
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
// import { w3cwebsocket as W3CWebSocket } from "websocket";
// import axios from "axios";
// import { format, parseISO } from "date-fns";

// const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

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
//   const [mode, setMode] = useState("B"); // A for real-time, B for historical range, C for real-time + historical
//   const [currentChartId, setCurrentChartId] = useState(null); // The ID of the chart currently configuring date range
//   const wsClientRefs = useRef({}); // Use a map of refs for WebSocket clients

//   // Load saved charts from localStorage on component mount
//   useEffect(() => {
//     const savedCharts = localStorage.getItem("customCharts");
//     if (savedCharts) {
//       setCharts(JSON.parse(savedCharts));
//     }
//   }, []);

//   // Save chart configurations (without data points) to localStorage whenever charts are updated
//   const saveChartsToLocalStorage = (updatedCharts) => {
//     const chartConfigurations = updatedCharts.map((chart) => ({
//       id: chart.id,
//       type: chart.type,
//       xAxisDataKey: chart.xAxisDataKey,
//       yAxisDataKeys: chart.yAxisDataKeys,
//     }));
//     localStorage.setItem("customCharts", JSON.stringify(chartConfigurations));
//   };

// // Updated fetchChartData to handle mode "C" for historical + real-time data
// const fetchChartData = async (chartId) => {
//   if (!startDate) return; // Ensure start date is set

//   try {
//     const formattedStartDate = format(startDate, "yyyy-MM-dd'T'HH:mm");
//     const formattedEndDate =
//       mode === "C" ? format(new Date(), "yyyy-MM-dd'T'HH:mm") : format(endDate, "yyyy-MM-dd'T'HH:mm");

//     const response = await axios.post(
//       "https://xdeuid6slkki7yxz4zhdbqbzfq0hirkk.lambda-url.us-east-1.on.aws/",
//       {
//         start_time: formattedStartDate,
//         end_time: formattedEndDate,
//       }
//     );

//     const parsedBody = JSON.parse(response.data.body);
//     const fetchedData = parsedBody.data.map((item) => ({
//       timestamp: item[0],
//       "AX-LT-011": item[1],
//       "AX-LT-021": item[2],
//       "CW-TT-011": item[3],
//       "CW-TT-021": item[4],
//       "CR-PT-001": item[10],
//     }));

//     setChartData((prevData) => ({
//       ...prevData,
//       [chartId]: fetchedData,
//     }));

//     if (mode === "C") {
//       setupRealTimeWebSocket(chartId); // Begin WebSocket data streaming in "C" mode
//     }
//   } catch (error) {
//     console.error("Error fetching data from the API:", error);
//   }
// };
//   const setupRealTimeWebSocket = (chartId) => {
//     if (wsClientRefs.current[chartId]) {
//       wsClientRefs.current[chartId].close();
//     }

//     wsClientRefs.current[chartId] = new W3CWebSocket(
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
//           "CW-TT-021": receivedData["CW-TT-021"] || null,
//           "CR-PT-001": receivedData["CR-PT-001"] || null,
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
//     const updatedCharts = [...charts, newChart];
//     setCharts(updatedCharts);
//     saveChartsToLocalStorage(updatedCharts); // Save the updated charts to localStorage
//     setChartDialogOpen(false);
//   };

//   const deleteChart = (chartId) => {
//     const updatedCharts = charts.filter((chart) => chart.id !== chartId);
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
//   const renderLineChart = (chart) => (
//     <ResponsiveContainer width="100%" height={400}>
//       <LineChart data={chartData[chart.id]}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis
//           dataKey="timestamp"
//           tickFormatter={(tick) => new Date(tick).toLocaleString()}
//         />
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
//             />
//           ))
//         )}
//         <Brush height={30} dataKey="timestamp" stroke="#8884d8" />
//       </LineChart>
//     </ResponsiveContainer>
//   );

//   const renderChart = (chart) => {
//     switch (chart.type) {
//       case "Line":
//         return renderLineChart(chart);
//       default:
//         return null;
//     }
//   };
//   const handleDateRangeApply = () => {
//     setDateDialogOpen(false);
//     if (mode === "C") {
//       fetchChartData(currentChartId); // Fetch historical data up to the current time
//     } else if (mode === "B") {
//       fetchChartData(currentChartId);
//     }
//   };
//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       <Container>
//         <Box display="flex" justifyContent="flex-end" marginBottom={4}>
//           <Button
//             variant="contained"
//             color="secondary"
//             onClick={() => setChartDialogOpen(true)}
//           >
//             Add Realtime Historical Chart
//           </Button>
//         </Box>
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
//               <Box
//                 display="flex"
//                 justifyContent="flex-end"
//                 gap={2}
//                 marginTop={2}
//               >
//                 <Button
//                   variant="outlined"
//                   color="secondary"
//                   onClick={() => openDialog(chart)}
//                 >
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
//         <Dialog
//           open={chartDialogOpen}
//           onClose={() => setChartDialogOpen(false)}
//         >
//           <DialogTitle>Select Chart Type</DialogTitle>
//           <DialogContent>
//             <Box display="flex" flexDirection="column" gap={2}>
//               <Button
//                 variant="contained"
//                 onClick={() => addCustomChart("Line")}
//               >
//                 Add Line Chart
//               </Button>
//             </Box>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setChartDialogOpen(false)} color="secondary">
//               Cancel
//             </Button>
//           </DialogActions>
//         </Dialog>

//         {/* Date Range Selection Dialog */}
//         <Dialog
//           open={dateDialogOpen}
//           onClose={() => setDateDialogOpen(false)}
//           fullWidth
//           maxWidth="sm"
//         >
//           <DialogTitle>Select Date Range</DialogTitle>
//           <DialogContent>
//           <FormControl component="fieldset">
//           <RadioGroup
//             row
//             value={mode}
//             onChange={(e) => setMode(e.target.value)}
//           >
//             {/* Removed value "A" */}
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
//               disabled={mode === "C"} // Disabled end date when mode is "C"
//             />
//           </Grid>
//         </Grid>

//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setDateDialogOpen(false)} color="secondary">
//               Cancel
//             </Button>
//             <Button
//               onClick={handleDateRangeApply}
//               color="primary"
//               disabled={!startDate || (mode === "B" && !endDate)}
//             >
//               Apply
//             </Button>
//           </DialogActions>
//         </Dialog>

//         {/* Chart Configuration Dialog */}
//         {tempChartData && (
//           <Dialog
//             open={dialogOpen}
//             onClose={closeDialog}
//             fullWidth
//             maxWidth="md"
//           >
//             <DialogTitle>Configure Chart</DialogTitle>
//             <DialogContent>
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
//             <DialogActions>
//               <Button onClick={closeDialog} color="secondary">
//                 Cancel
//               </Button>
//               <Button onClick={saveConfiguration} color="primary">
//                 Save
//               </Button>
//             </DialogActions>
//           </Dialog>
//         )}
//       </Container>
//     </LocalizationProvider>
//   );
// };

// export default HistoricalCharts;

// import React, { useState, useEffect, useRef } from "react";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   ScatterChart,
//   Scatter,
//   Brush,
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
// import { w3cwebsocket as W3CWebSocket } from "websocket";
// import axios from "axios";
// import { format, parseISO } from "date-fns";

// const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

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
//   const [mode, setMode] = useState("A"); // A for real-time, B for historical range, C for real-time + historical
//   const [currentChartId, setCurrentChartId] = useState(null); // The ID of the chart currently configuring date range
//   const wsClientRefs = useRef({}); // Use a map of refs for WebSocket clients

//   // Load saved charts from localStorage on component mount
//   useEffect(() => {
//     const savedCharts = localStorage.getItem("customCharts");
//     if (savedCharts) {
//       setCharts(JSON.parse(savedCharts));
//     }
//   }, []);

//   // Save chart configurations (without data points) to localStorage whenever charts are updated
//   const saveChartsToLocalStorage = (updatedCharts) => {
//     const chartConfigurations = updatedCharts.map((chart) => ({
//       id: chart.id,
//       type: chart.type,
//       xAxisDataKey: chart.xAxisDataKey,
//       yAxisDataKeys: chart.yAxisDataKeys,
//     }));
//     localStorage.setItem("customCharts", JSON.stringify(chartConfigurations));
//   };

//   // Fetch data using the handleSubmit logic for both historical and real-time data
//   const fetchChartData = async (chartId) => {
//     if (!startDate || !endDate) return;

//     try {
//       const formattedStartDate = format(startDate, "yyyy-MM-dd");
//       const formattedStartTime = format(startDate, "HH:mm");
//       const formattedEndDate = format(endDate, "yyyy-MM-dd");
//       const formattedEndTime = format(endDate, "HH:mm");

//       // Use the new API URL with the handleSubmit logic
//       const response = await axios.post(
//         "https://xdeuid6slkki7yxz4zhdbqbzfq0hirkk.lambda-url.us-east-1.on.aws/",
//         {
//           start_time: `${formattedStartDate}T${formattedStartTime}`,
//           end_time: `${formattedEndDate}T${formattedEndTime}`,
//         }
//       );

//       // Parse and map the data to the chart structure
//       const parsedBody = JSON.parse(response.data.body);
//       const fetchedData = parsedBody.data.map((item) => ({
//         timestamp: item[0], // Assuming the first element is the timestamp
//         "AX-LT-011": item[1], // Adjust based on the actual data structure
//         "AX-LT-021": item[2],
//         "CW-TT-011": item[3],
//         "CW-TT-021": item[4],
//         "CR-PT-001": item[10],
//       }));

//       setChartData((prevData) => ({
//         ...prevData,
//         [chartId]: fetchedData,
//       }));

//       if (mode === "C") {
//         setupRealTimeWebSocket(chartId); // If mode C, fetch real-time data too
//       }
//     } catch (error) {
//       console.error("Error fetching data from the API:", error);
//     }
//   };

//   const setupRealTimeWebSocket = (chartId) => {
//     if (wsClientRefs.current[chartId]) {
//       wsClientRefs.current[chartId].close();
//     }

//     wsClientRefs.current[chartId] = new W3CWebSocket(
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
//           "CW-TT-021": receivedData["CW-TT-021"] || null,
//           "CR-PT-001": receivedData["CR-PT-001"] || null,
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
//     const updatedCharts = [...charts, newChart];
//     setCharts(updatedCharts);
//     saveChartsToLocalStorage(updatedCharts); // Save the updated charts to localStorage
//     setChartDialogOpen(false);
//   };

//   const deleteChart = (chartId) => {
//     const updatedCharts = charts.filter((chart) => chart.id !== chartId);
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
//   const renderLineChart = (chart) => (
//     <ResponsiveContainer width="100%" height={400}>
//       <LineChart data={chartData[chart.id]}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis
//           dataKey="timestamp"
//           tickFormatter={(tick) => new Date(tick).toLocaleString()}
//         />
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
//             />
//           ))
//         )}
//         <Brush height={30} dataKey="timestamp" stroke="#8884d8" />
//       </LineChart>
//     </ResponsiveContainer>
//   );

//   const renderChart = (chart) => {
//     switch (chart.type) {
//       case "Line":
//         return renderLineChart(chart);
//       default:
//         return null;
//     }
//   };
//   const handleDateRangeApply = () => {
//     setDateDialogOpen(false);
//     if (mode === "A") {
//       setupRealTimeWebSocket(currentChartId);
//     } else {
//       fetchChartData(currentChartId);
//     }
//   };
//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       <Container>
//         <Box display="flex" justifyContent="flex-end" marginBottom={4}>
//           <Button
//             variant="contained"
//             color="secondary"
//             onClick={() => setChartDialogOpen(true)}
//           >
//             Add Realtime Historical Chart
//           </Button>
//         </Box>
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
//               <Box
//                 display="flex"
//                 justifyContent="flex-end"
//                 gap={2}
//                 marginTop={2}
//               >
//                 <Button
//                   variant="outlined"
//                   color="secondary"
//                   onClick={() => openDialog(chart)}
//                 >
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
//         <Dialog
//           open={chartDialogOpen}
//           onClose={() => setChartDialogOpen(false)}
//         >
//           <DialogTitle>Select Chart Type</DialogTitle>
//           <DialogContent>
//             <Box display="flex" flexDirection="column" gap={2}>
//               <Button
//                 variant="contained"
//                 onClick={() => addCustomChart("Line")}
//               >
//                 Add Line Chart
//               </Button>
//             </Box>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setChartDialogOpen(false)} color="secondary">
//               Cancel
//             </Button>
//           </DialogActions>
//         </Dialog>

//         {/* Date Range Selection Dialog */}
//         <Dialog
//           open={dateDialogOpen}
//           onClose={() => setDateDialogOpen(false)}
//           fullWidth
//           maxWidth="sm"
//         >
//           <DialogTitle>Select Date Range</DialogTitle>
//           <DialogContent>
//             <FormControl component="fieldset">
//               <RadioGroup
//                 row
//                 value={mode}
//                 onChange={(e) => setMode(e.target.value)}
//               >
//                 <FormControlLabel
//                   value="A"
//                   control={<Radio />}
//                   label="Real-Time Data Only"
//                 />
//                 <FormControlLabel
//                   value="B"
//                   control={<Radio />}
//                   label="Select Date Range"
//                 />
//                 <FormControlLabel
//                   value="C"
//                   control={<Radio />}
//                   label="Start Date & Continue Real-Time"
//                 />
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
//                   disabled={mode === "A" || mode === "C"}
//                 />
//               </Grid>
//             </Grid>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setDateDialogOpen(false)} color="secondary">
//               Cancel
//             </Button>
//             <Button
//               onClick={handleDateRangeApply}
//               color="primary"
//               disabled={!startDate || (mode === "B" && !endDate)}
//             >
//               Apply
//             </Button>
//           </DialogActions>
//         </Dialog>

//         {/* Chart Configuration Dialog */}
//         {tempChartData && (
//           <Dialog
//             open={dialogOpen}
//             onClose={closeDialog}
//             fullWidth
//             maxWidth="md"
//           >
//             <DialogTitle>Configure Chart</DialogTitle>
//             <DialogContent>
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
//             <DialogActions>
//               <Button onClick={closeDialog} color="secondary">
//                 Cancel
//               </Button>
//               <Button onClick={saveConfiguration} color="primary">
//                 Save
//               </Button>
//             </DialogActions>
//           </Dialog>
//         )}
//       </Container>
//     </LocalizationProvider>
//   );
// };

// export default HistoricalCharts;

// import React, { useState, useEffect, useRef } from "react";
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
// import { format, subMinutes, subHours, subDays, subWeeks, subMonths } from 'date-fns';
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
//   const [selectedTimeRange, setSelectedTimeRange] = useState();
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
//     setChartDialogOpen(false);

//     // Automatically set real-time mode (Option A) and start WebSocket for real-time data
//     setupRealTimeWebSocket(newChart.id); // Start real-time WebSocket data streaming for the new chart
//     setRealTimeData(true); // Set the mode to real-time by default
//   };
//     // Handle mode change: Clean up previous WebSocket connections
//     useEffect(() => {
//       // When mode changes, stop any WebSocket connection if the mode is not "Real-Time"
//       if (mode === 'C' || mode === 'B') {
//         Object.keys(wsClientRefs.current).forEach(chartId => {
//           if (wsClientRefs.current[chartId]) {
//             wsClientRefs.current[chartId].close(); // Close the WebSocket connection
//             delete wsClientRefs.current[chartId]; // Remove reference
//           }
//         });
//       }
//     }, [mode]);

// // Close WebSocket for specific chart
// const closeWebSocket = (chartId) => {
//   if (wsClientRefs.current[chartId]) {
//     wsClientRefs.current[chartId].close(); // Close the WebSocket connection
//     delete wsClientRefs.current[chartId]; // Remove the reference to avoid reconnections
//     console.log(`WebSocket closed for chart ${chartId}`);
//   }
// };

// const handleDateRangeApply = () => {
//   setDateDialogOpen(false);
//   charts.forEach(chart => {
//     if (mode === 'A') {
//       // Real-Time Data Only: Start WebSocket streaming for each chart
//       setupRealTimeWebSocket(chart.id);
//     } else if (mode === 'B') {
//       // Start Date & Continue Real-Time: Fetch historical data, then start WebSocket streaming
//       fetchHistoricalData(chart.id); // Fetch historical data, then real-time will start automatically
//     } else if (mode === 'C') {
//       // Select Date Range: Fetch historical data for the specified range (no real-time)
//       fetchHistoricalData(chart.id);
//     }
//   });
// };

// // Set up WebSocket for real-time data
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
//           'CR-LT-011': receivedData['CR-LT-011'] || null,
//         };

//         // Append new real-time data to the existing chart data
//         setData((prevData) => ({
//           ...prevData,
//           [chartId]: [...(prevData[chartId] || []), newData], // Append new data for the chart
//         }));
//       } catch (error) {
//         console.error("Error processing WebSocket message:", error);
//       }
//     };

//     wsClientRefs.current[chartId].onclose = (event) => {
//       console.error(`WebSocket disconnected for chart ${chartId} (code: ${event.code}, reason: ${event.reason}).`);
//     };
//   };
// // Map selected time range to date range
// useEffect(() => {
//   let start;
//   switch (selectedTimeRange) {
//     case '1_minute':
//       start = subMinutes(new Date(), 1);
//       break;
//     case '30_minutes':
//       start = subMinutes(new Date(), 30);
//       break;
//     case '1_hour':
//       start = subHours(new Date(), 1);
//       break;
//     case '6_hours':
//       start = subHours(new Date(), 6);
//       break;
//       case '12_hours':
//         start = subHours(new Date(), 12);
//         break;
//     case '1_day':
//       start = subDays(new Date(), 1);
//       break;
//       case '2_day':
//         start = subDays(new Date(), 2);
//         break;

//     case '1_week':
//       start = subWeeks(new Date(), 1);
//       break;
//     case '1_month':
//       start = subMonths(new Date(), 1);
//       break;
//     default:
//       start = subMinutes(new Date(), 1);// Default to 1 minute
//       break;
//   }
//   setStartDate(start);
//   setEndDate(new Date());
// }, [selectedTimeRange]);

//     const fetchHistoricalData = async (chartId,fetchEndDate) => {
//       if (!startDate || !endDate) return;

//       setLoading(true);

//       const maxWindowSizeInHours = 5; // Max time window for fetching data in hours
//       const minWindowSizeInHours = 0.5; // Minimum time window in hours to ensure request size is manageable
//       let currentWindowSize = 1; // Start with a 1-hour window, adjust dynamically
//       let currentDate = startDate; // Start from the selected startDate
//       const endDateToUse = endDate || new Date(); // Use endDate or current time if not provided

//       const historicalData = [];

//       while (currentDate < endDateToUse) {
//         try {
//           // Calculate the next end date based on the current window size
//           let nextEndDate = new Date(currentDate.getTime() + currentWindowSize * 60 * 60 * 1000);
//           if (nextEndDate > endDateToUse) {
//             nextEndDate = endDateToUse; // Ensure we don't exceed the final end date
//           }

//           const formattedStartDate = format(currentDate, 'yyyy-MM-dd');
//           const formattedStartTime = format(currentDate, 'HH:mm');
//           const formattedEndDate = format(nextEndDate, 'yyyy-MM-dd');
//           const formattedEndTime = format(nextEndDate, 'HH:mm');

//           // Fetch data for the current time range (dynamic increments)
//           const response = await axios.post('https://7ko9a0hlo2.execute-api.us-east-1.amazonaws.com/dev/data', {
//             start_date: formattedStartDate,
//             start_time: formattedStartTime,
//             end_date: formattedEndDate,
//             end_time: formattedEndTime,
//             plot_all: true
//           });

//           // Combine the fetched data into one array
//           const fetchedData = response.data.data.map(item => ({
//             timestamp: new Date(item.timestamp),
//             'AX-LT-011': item.payload['AX-LT-011'],
//             'AX-LT-021': item.payload['AX-LT-021'],
//             'CW-TT-011': item.payload['CW-TT-011'],
//             'CR-LT-011': item.payload['CR-LT-011'],
//           }));

//           historicalData.push(...fetchedData);

//           // Move currentDate forward by the current window size
//           currentDate = nextEndDate;

//           // If successful and window size is smaller than max, increase the window size
//           if (currentWindowSize < maxWindowSizeInHours) {
//             currentWindowSize = Math.min(currentWindowSize * 2, maxWindowSizeInHours);
//           }
//                 // For Option B, start WebSocket streaming after fetching historical data
//       if (!fetchEndDate) {
//         setupRealTimeWebSocket(chartId);
//       }

//         } catch (error) {
//           console.error('Error fetching data, reducing window size:', error);

//           // If the request fails, reduce the window size and retry
//           currentWindowSize = Math.max(currentWindowSize / 2, minWindowSizeInHours);

//           // If we've reached the minimum window size and it's still failing, break the loop
//           if (currentWindowSize <= minWindowSizeInHours) {
//             console.error('Fetching data failed even with the smallest window size.');
//             break;
//           }
//         }
//       }

//       // Set the accumulated data to plot on the graph
//       setData((prevData) => ({
//         ...prevData,
//         [chartId]: historicalData,
//       }));

//       setLoading(false);
//     };

// const handleTimeRangeChange = (event) => {
//   setSelectedTimeRange(event.target.value);
//   charts.forEach(chart => {
//     fetchHistoricalData(chart.id); // Fetch new data when time range changes
//   });
// };

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
//                {/* Mode Selection */}
//         <Box display="flex" justifyContent="center" marginBottom={2}>
//         <FormControl>
//           <RadioGroup
//             row
//             value={mode}
//             onChange={(e) => setMode(e.target.value)}
//           >
//             <FormControlLabel value="A" control={<Radio />} label="Real-Time Data Only" />
//             <FormControlLabel value="B" control={<Radio />} label="Start Date & Continue Real-Time" />
//             <FormControlLabel value="C" control={<Radio />} label="Select Date Range" />
//           </RadioGroup>
//         </FormControl>
//       </Box>
//         <Grid container spacing={2} alignItems="center" justifyContent="center" marginBottom={2}>
//         <Grid item>
//           <DateTimePicker
//             label="Start Date and Time"
//             value={startDate}
//             onChange={setStartDate}
//             renderInput={(params) => <TextField {...params} />}
//             disabled={mode === 'A'}
//           />
//         </Grid>
//         <Grid item>
//           <DateTimePicker
//             label="End Date and Time"
//             value={endDate}
//             onChange={setEndDate}
//             renderInput={(params) => <TextField {...params} />}
//             disabled={mode !== 'C'}
//           />
//         </Grid>
//       </Grid>
//                 {/* Time Range Dropdown */}
//         <Box display="flex" justifyContent="flex-end" marginBottom={2}>
//         <FormControl>
//           <InputLabel id="time-range-label">Time Range</InputLabel>
//           <Select
//             labelId="time-range-label"
//             value={selectedTimeRange}
//             onChange={handleTimeRangeChange}
//           >
//             <MenuItem value="1_minute">Last 1 minute</MenuItem>
//             <MenuItem value="30_minutes">Last 30 minutes</MenuItem>
//             <MenuItem value="1_hour">Last 1 hour</MenuItem>
//             <MenuItem value="6_hours">Last 6 hour</MenuItem>
//             <MenuItem value="12_hours">Last 12 hours</MenuItem>
//             <MenuItem value="1_day">Last 1 day</MenuItem>
//             <MenuItem value="2_day">Last 2 day</MenuItem>
//             <MenuItem value="1_week">Last 1 week</MenuItem>
//             <MenuItem value="1_month">Last 1 month</MenuItem>
//           </Select>
//         </FormControl>
//       </Box>

//               </DialogContent>
//               <DialogActions>
//               <Button onClick={() => setDateDialogOpen(false)} color="secondary">Cancel</Button>
//               <Button onClick={handleDateRangeApply} color="primary" disabled={!startDate || (mode === 'C' && !endDate)}>
//                 Apply
//               </Button>
//             </DialogActions>
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
//   ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
// } from "recharts";
// import {
//   Container, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
//   FormControl, InputLabel, Select, MenuItem, IconButton, Grid, TextField, FormControlLabel, RadioGroup, Radio
// } from "@mui/material";
// import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import axios from 'axios';
// import { format, parseISO } from 'date-fns';
// import { w3cwebsocket as W3CWebSocket } from "websocket";
// import DeleteIcon from '@mui/icons-material/Delete';
// import { SketchPicker } from 'react-color';
// import { differenceInMinutes, differenceInHours } from 'date-fns';
// const CustomScatterCharts = () => {
//   const [data, setData] = useState({});
//   const [charts, setCharts] = useState([]);
//   const [chartDialogOpen, setChartDialogOpen] = useState(false);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [tempChartData, setTempChartData] = useState(null);

//   const [startDate, setStartDate] = useState(null);
//   const [endDate, setEndDate] = useState(null);
//   const [realTimeData, setRealTimeData] = useState(false);
//   const [dateDialogOpen, setDateDialogOpen] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const [mode, setMode] = useState('A'); // A: Real-Time, B: Start Date & Continue Real-Time, C: Select Date Range

//   const wsClientRefs = useRef({}); // Store WebSocket connections for each chart

//   // Setup WebSocket connection for real-time data for a specific chart
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

// // Fetch historical data for Option B or C in dynamic time windows
// const fetchHistoricalData = async (chartId, fetchEndDate = false) => {
//   if (!startDate || (fetchEndDate && !endDate)) return;

//   setLoading(true);

//   const maxWindowSizeInHours = 5; // Max time window for fetching data in hours (start with 1 hour for large ranges)
//   const minWindowSizeInMinutes = 10; // Minimum window size of 10 minutes for small intervals
//   let currentWindowSize = 1; // Start with a 1-hour window, adjust dynamically
//   let currentDate = startDate; // Start from the selected startDate
//   const endDateToUse = fetchEndDate ? endDate : new Date(); // Use endDate or current time if not provided

//   const historicalData = [];

//   // Loop until we reach the end date
//   while (currentDate < endDateToUse) {
//     try {
//       // Calculate the next end date based on the current window size
//       let nextEndDate = new Date(currentDate.getTime() + currentWindowSize * 60 * 60 * 1000);
//       if (nextEndDate > endDateToUse) {
//         nextEndDate = endDateToUse; // Ensure we don't exceed the final end date
//       }

//       const formattedStartDate = format(currentDate, 'yyyy-MM-dd');
//       const formattedStartTime = format(currentDate, 'HH:mm');
//       const formattedEndDate = format(nextEndDate, 'yyyy-MM-dd');
//       const formattedEndTime = format(nextEndDate, 'HH:mm');

//       // Make the API request to fetch the data for the given time range
//       const response = await axios.post('https://7ko9a0hlo2.execute-api.us-east-1.amazonaws.com/dev/data', {
//         start_date: formattedStartDate,
//         start_time: formattedStartTime,
//         end_date: formattedEndDate,
//         end_time: formattedEndTime,
//         plot_all: true
//       });

//       // Combine the fetched data into one array
//       const fetchedData = response.data.data.map(item => ({
//         timestamp: new Date(item.timestamp),
//         'AX-LT-011': item.payload['AX-LT-011'],
//         'AX-LT-021': item.payload['AX-LT-021'],
//         'CW-TT-011': item.payload['CW-TT-011'],
//         'CW-TT-021': item.payload['CW-TT-021'],
//         'RECT-CT-001': item.payload['RECT-CT-001'],
//         'RECT-VT-001': item.payload['RECT-VT-001'],
//       }));

//       // Add the fetched data to the historical data array
//       historicalData.push(...fetchedData);

//       // Move currentDate forward by the current window size
//       currentDate = nextEndDate;

//       // If the request is successful, we can increase the window size, but keep it small (up to 1 hour)
//       if (currentWindowSize < maxWindowSizeInHours) {
//         currentWindowSize = Math.min(currentWindowSize + 0.5, maxWindowSizeInHours); // Increase the window size by 30 minutes
//       }
//     } catch (error) {
//       console.error('Error fetching data, reducing window size:', error);

//       // If the request fails, reduce the window size
//       currentWindowSize = Math.max(currentWindowSize / 2, minWindowSizeInMinutes / 60); // Halve the window size (minimum is 10 minutes)

//       // If the window size is too small and still failing, stop the loop
//       if (currentWindowSize * 60 < minWindowSizeInMinutes) {
//         console.error('Fetching data failed even with the smallest window size.');
//         break;
//       }
//     }
//   }

//   // Set the accumulated data to plot on the graph
//   setData((prevData) => ({
//     ...prevData,
//     [chartId]: historicalData,
//   }));

//   // For Option B, start WebSocket streaming after fetching historical data
//   if (!fetchEndDate) {
//     setupRealTimeWebSocket(chartId);
//   }

//   setLoading(false);
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

//   const addCustomChart = () => {
//     const newChart = {
//       id: Date.now(),
//       xAxisDataKey: 'CW-TT-011',
//       yAxisDataKey: 'CW-TT-021',
//       xAxisRange: ['auto', 'auto'],
//       yAxisRange: ['auto', 'auto'],
//       color: "#FF0000",
//       timestamp: new Date().toISOString(),  // Adding timestamp
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

//   const handleXAxisKeyChange = (event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       xAxisDataKey: value
//     }));
//   };

//   const handleYAxisKeyChange = (event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKey: value
//     }));
//   };

//   const handleXAxisRangeChange = (event) => {
//     const { name, value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       xAxisRange: name === 'min' ? [parseFloat(value), prevChart.xAxisRange[1]] : [prevChart.xAxisRange[0], parseFloat(value)]
//     }));
//   };

//   const handleYAxisRangeChange = (event) => {
//     const { name, value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisRange: name === 'min' ? [parseFloat(value), prevChart.yAxisRange[1]] : [prevChart.yAxisRange[0], parseFloat(value)]
//     }));
//   };

//   const handleColorChange = (color) => {
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       color: color.hex
//     }));
//   };

//   const deleteChart = (chartId) => {
//     setCharts((prevCharts) => prevCharts.filter((chart) => chart.id !== chartId));
//   };

//   const renderChart = (chart, startDate, endDate) => {
//     const chartData = data[chart.id] || []; // Safely access data for the specific chart
//     const totalMinutes = startDate && endDate ? differenceInMinutes(endDate, startDate) : 0;
//     const totalHours = startDate && endDate ? differenceInHours(endDate, startDate) : 0;

//     // Ensure that the data is an array before proceeding
//     if (!Array.isArray(chartData)) {
//       console.error("Data is not an array, skipping rendering.");
//       return null;
//     }

//     // For ranges of 1 hour or less, display all data points without filtering
//     if (totalMinutes <= 60) {
//       return (
//         <ResponsiveContainer width="100%" height={400}>
//           <ScatterChart>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis
//               type="number"
//               dataKey={chart.xAxisDataKey}
//               name={chart.xAxisDataKey}
//               domain={[chart.xAxisRange[0], chart.xAxisRange[1]]}
//               tickFormatter={(value) => value.toFixed(4)}
//             />
//             <YAxis
//               type="number"
//               dataKey={chart.yAxisDataKey}
//               name={chart.yAxisDataKey}
//               domain={[chart.yAxisRange[0], chart.yAxisRange[1]]}
//               tickFormatter={(value) => value.toFixed(4)}
//             />
//             <Tooltip
//               cursor={{ strokeDasharray: '3 3' }}
//               content={({ payload }) => {
//                 if (payload && payload.length) {
//                   const point = payload[0].payload;
//                   return (
//                     <div className="custom-tooltip">
//                       <p>{`X (${chart.xAxisDataKey}): ${point[chart.xAxisDataKey].toFixed(4)}`}</p>
//                       <p>{`Y (${chart.yAxisDataKey}): ${point[chart.yAxisDataKey].toFixed(4)}`}</p>
//                       <p>{`Timestamp: ${new Date(point.timestamp).toLocaleString()}`}</p>
//                     </div>
//                   );
//                 }
//                 return null;
//               }}
//             />
//             <Legend />
//             <Scatter
//               name={`${chart.xAxisDataKey} vs ${chart.yAxisDataKey}`}
//               data={chartData} // Use all data for short time range
//               fill={chart.color}
//             />
//           </ScatterChart>
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
//           acc[key] = { timestamp: current.timestamp, [chart.xAxisDataKey]: [], [chart.yAxisDataKey]: [] };
//         }

//         // Collect data points for each key in this minute/hour
//         [chart.xAxisDataKey, chart.yAxisDataKey].forEach((dataKey) => {
//           if (current[dataKey] !== null && current[dataKey] !== undefined) {
//             acc[key][dataKey].push(current[dataKey]); // Add the value to the array for averaging later
//           }
//         });

//         return acc;
//       }, {})
//     ).map(item => {
//       // Calculate the average for each key
//       [chart.xAxisDataKey, chart.yAxisDataKey].forEach((dataKey) => {
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
//         <ScatterChart>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis
//             type="number"
//             dataKey={chart.xAxisDataKey}
//             name={chart.xAxisDataKey}
//             domain={[chart.xAxisRange[0], chart.xAxisRange[1]]}
//             tickFormatter={(value) => value.toFixed(4)}
//           />
//           <YAxis
//             type="number"
//             dataKey={chart.yAxisDataKey}
//             name={chart.yAxisDataKey}
//             domain={[chart.yAxisRange[0], chart.yAxisRange[1]]}
//             tickFormatter={(value) => value.toFixed(4)}
//           />
//           <Tooltip
//             cursor={{ strokeDasharray: '3 3' }}
//             content={({ payload }) => {
//               if (payload && payload.length) {
//                 const point = payload[0].payload;
//                 return (
//                   <div className="custom-tooltip">
//                     <p>{`X (${chart.xAxisDataKey}): ${point[chart.xAxisDataKey].toFixed(4)}`}</p>
//                     <p>{`Y (${chart.yAxisDataKey}): ${point[chart.yAxisDataKey].toFixed(4)}`}</p>
//                     <p>{`Timestamp: ${new Date(point.timestamp).toLocaleString()}`}</p>
//                   </div>
//                 );
//               }
//               return null;
//             }}
//           />
//           <Legend />
//           <Scatter
//             name={`${chart.xAxisDataKey} vs ${chart.yAxisDataKey}`}
//             data={averagedData} // Use averaged data for medium/long time ranges
//             fill={chart.color}
//           />
//         </ScatterChart>
//       </ResponsiveContainer>
//     );
//   };

//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       <Container>
//         <Box display="flex" justifyContent="flex-end" marginBottom={4}>
//           <Button variant="contained" color="primary" onClick={() => setChartDialogOpen(true)}>
//             Add Scatter Chart
//           </Button>

//         </Box>

//         <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
//           <DialogTitle>Select Chart Type</DialogTitle>
//           <DialogContent>
//             <Box display="flex" flexDirection="column" gap={2}>
//               <Button variant="contained" onClick={addCustomChart}>Add XY Chart</Button>
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
//                 <Button variant="outlined"  color="secondary" onClick={() => openDialog(chart)}>
//                   Configure Chart
//                 </Button>
//               </Box>
//               {/* Button for selecting the date range */}
//           <Button
//           variant="contained"
//           color="secondary"
//           onClick={() => setDateDialogOpen(true)}
//           style={{ marginLeft: '170px' }}
//         >
//           Select Date Range
//         </Button>
//             </Box>
//           </Box>
//         ))}

//         {tempChartData && (
//           <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
//             <DialogTitle>Configure Chart</DialogTitle>
//             <DialogContent>
//               <Box display="flex" flexDirection="column" maxHeight="400px" overflow="auto">
//                 <FormControl fullWidth margin="normal">
//                   <InputLabel>X-Axis Data Key</InputLabel>
//                   <Select
//                     value={tempChartData.xAxisDataKey}
//                     onChange={handleXAxisKeyChange}
//                   >
//                     <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//                     <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
//                     <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
//                     <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
//                     <MenuItem value="RECT-CT-001">RECT-CT-001</MenuItem>
//                     <MenuItem value="RECT-VT-001">RECT-VT-001</MenuItem>
//                   </Select>
//                 </FormControl>
//                 <TextField
//                   label="X-Axis Min Range"
//                   type="number"
//                   name="min"
//                   value={tempChartData.xAxisRange[0]}
//                   onChange={handleXAxisRangeChange}
//                   fullWidth
//                   margin="normal"
//                   inputProps={{ step: 0.0001 }}
//                 />
//                 <TextField
//                   label="X-Axis Max Range"
//                   type="number"
//                   name="max"
//                   value={tempChartData.xAxisRange[1]}
//                   onChange={handleXAxisRangeChange}
//                   fullWidth
//                   margin="normal"
//                   inputProps={{ step: 0.0001 }}
//                 />
//                 <FormControl fullWidth margin="normal">
//                   <InputLabel>Y-Axis Data Key</InputLabel>
//                   <Select
//                     value={tempChartData.yAxisDataKey}
//                     onChange={handleYAxisKeyChange}
//                   >
//                     <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//                     <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
//                     <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
//                     <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
//                     <MenuItem value="RECT-CT-001">RECT-CT-001</MenuItem>
//                     <MenuItem value="RECT-VT-001">RECT-VT-001</MenuItem>
//                   </Select>
//                 </FormControl>
//                 <TextField
//                   label="Y-Axis Min Range"
//                   type="number"
//                   name="min"
//                   value={tempChartData.yAxisRange[0]}
//                   onChange={handleYAxisRangeChange}
//                   fullWidth
//                   margin="normal"
//                   inputProps={{ step: 0.0001 }}
//                 />
//                 <TextField
//                   label="Y-Axis Max Range"
//                   type="number"
//                   name="max"
//                   value={tempChartData.yAxisRange[1]}
//                   onChange={handleYAxisRangeChange}
//                   fullWidth
//                   margin="normal"
//                   inputProps={{ step: 0.0001 }}
//                 />
//                 <Button onClick={() => setDialogOpen(true)}>Select Color</Button>
//                 <SketchPicker color={tempChartData.color} onChangeComplete={handleColorChange} />
//               </Box>
//             </DialogContent>
//             <DialogActions>
//               <Button onClick={closeDialog} color="secondary">Cancel</Button>
//               <Button onClick={saveConfiguration} color="primary">Save</Button>
//             </DialogActions>
//           </Dialog>
//         )}

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
//                 <FormControlLabel value="B" control={<Radio />} label="Start Date & Continue Real-Time" />
//                 <FormControlLabel value="C" control={<Radio />} label="Select Date Range" />
//               </RadioGroup>
//             </FormControl>
//             <Grid container spacing={2} alignItems="center">
//               <Grid item xs={6}>
//                 <DateTimePicker
//                   label="Start Date and Time"
//                   value={startDate}
//                   onChange={setStartDate}
//                   renderInput={(params) => <TextField {...params} fullWidth />}
//                   disabled={mode === 'A'}
//                 />
//               </Grid>
//               <Grid item xs={6}>
//                 <DateTimePicker
//                   label="End Date and Time"
//                   value={endDate}
//                   onChange={setEndDate}
//                   renderInput={(params) => <TextField {...params} fullWidth />}
//                   disabled={mode !== 'C'}
//                 />
//               </Grid>
//             </Grid>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setDateDialogOpen(false)} color="secondary">Cancel</Button>
//             <Button onClick={handleDateRangeApply} color="primary" disabled={!startDate || (mode === 'C' && !endDate)}>
//               Apply
//             </Button>
//           </DialogActions>
//         </Dialog>
//       </Container>
//     </LocalizationProvider>
//   );
// };

// export default CustomScatterCharts;

// import React, { useState, useEffect, useRef } from "react";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   Brush,
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
//   FormControlLabel,
//   Radio,
// } from "@mui/material";
// import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
// import axios from "axios";
// import {
//   format,
//   subMinutes,
//   subHours,
//   subDays,
//   subWeeks,
//   subMonths,
// } from "date-fns";
// import { w3cwebsocket as W3CWebSocket } from "websocket";
// import DeleteIcon from "@mui/icons-material/Delete";
// import { SketchPicker } from "react-color";
// import { differenceInMinutes, differenceInHours } from "date-fns";
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
//   const [mode, setMode] = useState("A"); // A: Real-Time, B: Start Date & Continue Real-Time, C: Select Date Range
//   const [selectedTimeRange, setSelectedTimeRange] = useState();

//   const wsClientRefs = useRef({}); // WebSocket references for each chart

// // Set up WebSocket for real-time data
// const addCustomChart = (type) => {
//   const newChart = {
//     id: Date.now(),
//     type,
//     yAxisDataKeys: [
//       {
//         id: "left-0",
//         dataKeys: ["AX-LT-011"],
//         range: "0-500",
//         color: "#FF0000",
//         lineStyle: "solid",
//       },
//     ],
//   };

//   setCharts((prevCharts) => [...prevCharts, newChart]);
//   setChartDialogOpen(false);

//   // Automatically set real-time mode (Option A) and start WebSocket for real-time data
//   if (mode === 'A') {
//     setupRealTimeWebSocket(newChart.id); // Start real-time WebSocket data streaming for the new chart
//   }
// };

// // Handle mode change: Clean up previous WebSocket connections when switching to historical-only mode (C)
// useEffect(() => {
//   if (mode === "C") {
//     Object.keys(wsClientRefs.current).forEach((chartId) => {
//       if (wsClientRefs.current[chartId]) {
//         wsClientRefs.current[chartId].close(); // Close the WebSocket connection
//         delete wsClientRefs.current[chartId]; // Remove reference
//       }
//     });
//   }
// }, [mode]);

// // Close WebSocket for a specific chart
// const closeWebSocket = (chartId) => {
//   if (wsClientRefs.current[chartId]) {
//     wsClientRefs.current[chartId].close(); // Close the WebSocket connection
//     delete wsClientRefs.current[chartId]; // Remove the reference to avoid reconnections
//     console.log(`WebSocket closed for chart ${chartId}`);
//   }
// };

// // Apply the selected mode (A: real-time only, B: historical + real-time, C: historical only)
// const handleDateRangeApply = () => {
//   setDateDialogOpen(false);
//   charts.forEach((chart) => {
//     if (mode === "A") {
//       // Real-Time Data Only: Start WebSocket streaming for each chart (no historical data fetching)
//       setupRealTimeWebSocket(chart.id);
//     } else if (mode === "B") {
//       // Historical + Real-Time: Fetch historical data first, then start WebSocket for real-time data
//       fetchHistoricalData(chart.id).then(() => {
//         setupRealTimeWebSocket(chart.id); // Start WebSocket after historical data is fetched
//       });
//     } else if (mode === "C") {
//       // Historical Only: Fetch historical data for the specified range (no real-time)
//       fetchHistoricalData(chart.id);
//     }
//   });
// };

// // Set up WebSocket for real-time data
// const setupRealTimeWebSocket = (chartId) => {
//   if (wsClientRefs.current[chartId]) {
//     wsClientRefs.current[chartId].close(); // Close any existing WebSocket connection
//   }

//   wsClientRefs.current[chartId] = new W3CWebSocket(
//     "wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/"
//   );

//   wsClientRefs.current[chartId].onopen = () => {
//     console.log(`WebSocket connection established for chart ${chartId}`);
//   };

//   wsClientRefs.current[chartId].onmessage = (message) => {
//     try {
//       const receivedData = JSON.parse(message.data);
//       const newData = {
//         timestamp: new Date(receivedData["PLC-TIME-STAMP"]) || new Date(),
//         "AX-LT-011": receivedData["AX-LT-011"] || null,
//         "AX-LT-021": receivedData["AX-LT-021"] || null,
//         "CW-TT-011": receivedData["CW-TT-011"] || null,
//         "CR-LT-011": receivedData["CR-LT-011"] || null,
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
//     console.error(
//       `WebSocket disconnected for chart ${chartId} (code: ${event.code}, reason: ${event.reason}).`
//     );
//   };
// };

// // Map selected time range to date range
// useEffect(() => {
//   let start;
//   switch (selectedTimeRange) {
//     case "1_minute":
//       start = subMinutes(new Date(), 1);
//       break;
//     case "30_minutes":
//       start = subMinutes(new Date(), 30);
//       break;
//     case "1_hour":
//       start = subHours(new Date(), 1);
//       break;
//     case "6_hours":
//       start = subHours(new Date(), 6);
//       break;
//     case "12_hours":
//       start = subHours(new Date(), 12);
//       break;
//     case "18_hours":
//       start = subHours(new Date(), 18);
//       break;
//     case "1_day":
//       start = subDays(new Date(), 1);
//       break;
//     case "2_day":
//       start = subDays(new Date(), 2);
//       break;

//     case "1_week":
//       start = subWeeks(new Date(), 1);
//       break;
//     case "2_week":
//       start = subWeeks(new Date(), 2);
//       break;
//     case "1_month":
//       start = subMonths(new Date(), 1);
//       break;
//     case "2_month":
//       start = subMonths(new Date(), 2);
//       break;
//     default:
//       start = subMinutes(new Date(), 1); // Default to 1 minute
//       break;
//   }
//   setStartDate(start);
//   setEndDate(new Date());
// }, [selectedTimeRange]);

//   // Fetch historical data
//   const fetchHistoricalData = async (chartId) => {
//     if (!startDate || !endDate) return;

//     setLoading(true);
//     try {
//       const response = await axios.post(
//         "https://zm367epyxhqaeab52l2uatxgom0bskxf.lambda-url.us-east-1.on.aws/",
//         {
//           start_time: format(startDate, "yyyy-MM-dd'T'HH:mm:ss"),
//           end_time: format(endDate, "yyyy-MM-dd'T'HH:mm:ss"),
//           plot_all: false,
//           devices: ["AX-LT-011", "AX-LT-021", "CW-TT-011", "CR-LT-011"],
//         }
//       );

//       const fetchedData = response.data.data.map((item) => ({
//         timestamp: new Date(item.timestamp),
//         "AX-LT-011": item["AX-LT-011"],
//         "AX-LT-021": item["AX-LT-021"],
//         "CW-TT-011": item["CW-TT-011"],
//         "CR-LT-011": item["CR-LT-011"],
//       }));

//       setData((prevData) => ({
//         ...prevData,
//         [chartId]: fetchedData,
//       }));
//     } catch (error) {
//       console.error("Error fetching historical data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleTimeRangeChange = (event) => {
//     setSelectedTimeRange(event.target.value);
//     charts.forEach((chart) => {
//       fetchHistoricalData(chart.id); // Fetch new data when time range changes
//     });
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
//     setCharts((prevCharts) =>
//       prevCharts.filter((chart) => chart.id !== chartId)
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

//     // Convert timestamps to Date objects if needed
//     const formattedChartData = chartData.map((entry) => ({
//       ...entry,
//       timestamp: new Date(entry.timestamp), // Convert to Date if not already
//     }));

//     // Flag to indicate if we are plotting real-time data or historical data
//     const isRealTimeMode = mode === "A" || mode === "B"; // Option A and B involve real-time data

//     if (isRealTimeMode) {
//       return (
//         <ResponsiveContainer width="100%" height={400}>
//           <LineChart data={formattedChartData} syncId="syncChart">
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
//               Array.isArray(yAxis.dataKeys)
//                 ? yAxis.dataKeys.map((key) => (
//                     <Line
//                       key={key}
//                       type="monotone"
//                       dataKey={key}
//                       stroke={yAxis.color}
//                       strokeDasharray={
//                         yAxis.lineStyle === "solid"
//                           ? ""
//                           : yAxis.lineStyle === "dotted"
//                           ? "1 1"
//                           : "5 5"
//                       }
//                       yAxisId={yAxis.id}
//                     />
//                   ))
//                 : null
//             )}
//           </LineChart>
//         </ResponsiveContainer>
//       );
//     }

//     // **For historical data (in Option B and Option C) calculate average where needed**
//     let averagedData = formattedChartData;

//     if (totalMinutes <= 60) {
//       averagedData = formattedChartData; // No averaging needed
//     } else if (totalHours <= 24) {
//       averagedData = calculateAveragedData(formattedChartData, "minute");
//     } else {
//       averagedData = calculateAveragedData(formattedChartData, "hour");
//     }

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
//             Array.isArray(yAxis.dataKeys)
//               ? yAxis.dataKeys.map((key) => (
//                   <Line
//                     key={key}
//                     type="monotone"
//                     dataKey={key}
//                     stroke={yAxis.color}
//                     strokeDasharray={
//                       yAxis.lineStyle === "solid"
//                         ? ""
//                         : yAxis.lineStyle === "dotted"
//                         ? "1 1"
//                         : "5 5"
//                     }
//                     yAxisId={yAxis.id}
//                   />
//                 ))
//               : null
//           )}
//         </LineChart>
//       </ResponsiveContainer>
//     );
//   };

//   // Helper function to calculate averaged data based on granularity (minute or hour)
//   const calculateAveragedData = (chartData, granularity) => {
//     // Helper function to calculate the average of an array of values
//     const calculateAverage = (values) => {
//       if (values.length === 0) return null;
//       const sum = values.reduce((a, b) => a + b, 0);
//       return sum / values.length;
//     };

//     // Get granularity (minute or hour) based on the time range
//     const getGranularity = (timestamp, granularity) => {
//       const date = new Date(timestamp);
//       if (granularity === "minute") {
//         return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
//       } else if (granularity === "hour") {
//         return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}`;
//       }
//     };

//     // Group data points by minute or hour and calculate the average for each group
//     return Object.values(
//       chartData.reduce((acc, current) => {
//         const key = getGranularity(current.timestamp, granularity);

//         // Initialize entry for this time period if it doesn't exist
//         if (!acc[key]) {
//           acc[key] = {
//             timestamp: current.timestamp,
//             "AX-LT-011": [],
//             "AX-LT-021": [],
//             "CW-TT-011": [],
//             "CR-LT-011": [],
//           };
//         }

//         // Collect data points for each key in this minute/hour
//         ["AX-LT-011", "AX-LT-021", "CW-TT-011", "CR-LT-011"].forEach(
//           (dataKey) => {
//             if (current[dataKey] !== null && current[dataKey] !== undefined) {
//               acc[key][dataKey].push(current[dataKey]); // Add the value to the array for averaging later
//             }
//           }
//         );

//         return acc;
//       }, {})
//     ).map((item) => {
//       // Calculate the average for each key
//       ["AX-LT-011", "AX-LT-021", "CW-TT-011", "CR-LT-011"].forEach(
//         (dataKey) => {
//           if (item[dataKey].length > 0) {
//             item[dataKey] = calculateAverage(item[dataKey]); // Replace the array with the average
//           } else {
//             item[dataKey] = null; // Handle cases where no data was available for this key in that time period
//           }
//         }
//       );
//       return item;
//     });
//   };

//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       <Container>
//         <Box display="flex" justifyContent="flex-end" marginBottom={4}>
//           <Button
//             variant="contained"
//             color="primary"
//             onClick={() => setChartDialogOpen(true)}
//           >
//             Add Line Chart
//           </Button>
//         </Box>

//         <Dialog
//           open={chartDialogOpen}
//           onClose={() => setChartDialogOpen(false)}
//         >
//           <DialogTitle>Select Chart Type</DialogTitle>
//           <DialogContent>
//             <Box display="flex" flexDirection="column" gap={2}>
//               <Button
//                 variant="contained"
//                 onClick={() => addCustomChart("Line")}
//               >
//                 Add Line Chart
//               </Button>
//             </Box>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setChartDialogOpen(false)} color="secondary">
//               Cancel
//             </Button>
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
//                 <Button
//                   variant="outlined"
//                   color="primary"
//                   onClick={() => openDialog(chart)}
//                 >
//                   Configure Chart
//                 </Button>
//                 <Button
//                   variant="outlined"
//                   color="primary"
//                   onClick={() => setDateDialogOpen(true)}
//                 >
//                   Date Range Select
//                 </Button>
//               </Box>
//             </Box>
//           </Box>
//         ))}

//         {tempChartData && (
//           <Dialog
//             open={dialogOpen}
//             onClose={closeDialog}
//             fullWidth
//             maxWidth="md"
//           >
//             <DialogTitle>Configure Chart</DialogTitle>
//             <DialogContent>
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
//                         <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//                         <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
//                         <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
//                         <MenuItem value="CR-LT-011">CR-LT-011</MenuItem>
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
//                   onClick={addYAxis}
//                 >
//                   Add Y-Axis
//                 </Button>
//               </Box>
//             </DialogContent>
//             <DialogActions>
//               <Button onClick={closeDialog} color="secondary">
//                 Cancel
//               </Button>
//               <Button onClick={saveConfiguration} color="primary">
//                 Save
//               </Button>
//             </DialogActions>
//           </Dialog>
//         )}

//         {/* Date Range Selection Dialog */}
//         <Dialog
//           open={dateDialogOpen}
//           onClose={() => setDateDialogOpen(false)}
//           fullWidth
//           maxWidth="sm"
//         >
//           <DialogTitle>Select Date Range</DialogTitle>
//           <DialogContent>
//             {/* Mode Selection */}
//             <Box display="flex" justifyContent="center" marginBottom={2}>
//               <FormControl>
//                 <RadioGroup
//                   row
//                   value={mode}
//                   onChange={(e) => setMode(e.target.value)}
//                 >
//                 <FormControlLabel value="A" control={<Radio />} label="Real-Time Data Only"/>
//                 <FormControlLabel value="B" control={<Radio />} label="Start Date & Continue Real-Time"/>
//                 <FormControlLabel value="C" control={<Radio />} label="Select Date Range"/>
//                 </RadioGroup>
//               </FormControl>
//             </Box>
//             {/* Date Range Pickers */}
//             <Grid
//               container
//               spacing={2}
//               alignItems="center"
//               justifyContent="center"
//               marginBottom={2}
//             >
//               <Grid item>
//                 <DateTimePicker
//                   label="Start Date and Time"
//                   value={startDate}
//                   onChange={setStartDate}
//                   renderInput={(params) => <TextField {...params} />}
//                   disabled={mode === "A"}
//                 />
//               </Grid>
//               <Grid item>
//                 <DateTimePicker
//                   label="End Date and Time"
//                   value={endDate}
//                   onChange={setEndDate}
//                   renderInput={(params) => <TextField {...params} />}
//                   disabled={mode !== "C"}
//                 />
//               </Grid>
//             </Grid>
//             {/* Time Range Dropdown */}
//             <Box display="flex" justifyContent="flex-end" marginBottom={2}>
//               <FormControl>
//                 <InputLabel id="time-range-label">Time Range</InputLabel>
//                 <Select
//                   labelId="time-range-label"
//                   value={selectedTimeRange}
//                   onChange={handleTimeRangeChange}
//                 >
//                   <MenuItem value="1_minute">Last 1 minute</MenuItem>
//                   <MenuItem value="30_minutes">Last 30 minutes</MenuItem>
//                   <MenuItem value="1_hour">Last 1 hour</MenuItem>
//                   <MenuItem value="6_hours">Last 6 hour</MenuItem>
//                   <MenuItem value="12_hours">Last 12 hours</MenuItem>
//                   <MenuItem value="18_hours">Last 18 hours</MenuItem>
//                   <MenuItem value="1_day">Last 1 day</MenuItem>
//                   <MenuItem value="2_day">Last 2 day</MenuItem>
//                   <MenuItem value="1_week">Last 1 week</MenuItem>
//                   <MenuItem value="2_week">Last 2 week</MenuItem>
//                   <MenuItem value="1_month">Last 1 month</MenuItem>
//                   <MenuItem value="2_month">Last 2 month</MenuItem>
//                 </Select>
//               </FormControl>
//             </Box>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setDateDialogOpen(false)} color="secondary">
//               Cancel
//             </Button>
//             <Button
//               onClick={handleDateRangeApply}
//               color="primary"
//               disabled={!startDate || (mode === "C" && !endDate)}
//             >
//               Apply
//             </Button>
//           </DialogActions>
//         </Dialog>

//         {/* Render charts for each chart */}
//         {charts.map((chart) => (
//           <Box key={chart.id} marginY={4}>
//             {renderChart(chart.id)}
//           </Box>
//         ))}
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
//   FormControl, InputLabel, Select, MenuItem, Typography, IconButton, Grid, TextField, FormControlLabel,
//   Radio
// } from "@mui/material";
// import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import axios from 'axios';
// import { format, subMinutes, subHours, subDays, subWeeks, subMonths } from 'date-fns';
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
//   const [selectedTimeRange, setSelectedTimeRange] = useState();

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
//     setChartDialogOpen(false);

//     // Automatically set real-time mode (Option A) and start WebSocket for real-time data
//     setupRealTimeWebSocket(newChart.id); // Start real-time WebSocket data streaming for the new chart
//     setRealTimeData(true); // Set the mode to real-time by default
//   };

//     // Handle mode change: Clean up previous WebSocket connections
//     useEffect(() => {
//       // When mode changes, stop any WebSocket connection if the mode is not "Real-Time"
//       if (mode === 'C' || mode === 'B') {
//         Object.keys(wsClientRefs.current).forEach(chartId => {
//           if (wsClientRefs.current[chartId]) {
//             wsClientRefs.current[chartId].close(); // Close the WebSocket connection
//             delete wsClientRefs.current[chartId]; // Remove reference
//           }
//         });
//       }
//     }, [mode]);

// // Close WebSocket for specific chart
// const closeWebSocket = (chartId) => {
//   if (wsClientRefs.current[chartId]) {
//     wsClientRefs.current[chartId].close(); // Close the WebSocket connection
//     delete wsClientRefs.current[chartId]; // Remove the reference to avoid reconnections
//     console.log(`WebSocket closed for chart ${chartId}`);
//   }
// };

// const handleDateRangeApply = () => {
//   setDateDialogOpen(false);
//   charts.forEach(chart => {
//     if (mode === 'A') {
//       // Real-Time Data Only: Start WebSocket streaming for each chart
//       setupRealTimeWebSocket(chart.id);
//     } else if (mode === 'B') {
//       // Start Date & Continue Real-Time: Fetch historical data, then start WebSocket streaming
//       fetchHistoricalData(chart.id); // Fetch historical data, then real-time will start automatically
//     } else if (mode === 'C') {
//       // Select Date Range: Fetch historical data for the specified range (no real-time)
//       fetchHistoricalData(chart.id);
//     }
//   });
// };

// // Set up WebSocket for real-time data
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
//           'CR-LT-011': receivedData['CR-LT-011'] || null,
//         };

//         // Append new real-time data to the existing chart data
//         setData((prevData) => ({
//           ...prevData,
//           [chartId]: [...(prevData[chartId] || []), newData], // Append new data for the chart
//         }));
//       } catch (error) {
//         console.error("Error processing WebSocket message:", error);
//       }
//     };

//     wsClientRefs.current[chartId].onclose = (event) => {
//       console.error(`WebSocket disconnected for chart ${chartId} (code: ${event.code}, reason: ${event.reason}).`);
//     };
//   };
//     // Map selected time range to date range
//     useEffect(() => {
//       let start;
//       switch (selectedTimeRange) {
//         case '1_minute':
//           start = subMinutes(new Date(), 1);
//           break;
//         case '30_minutes':
//           start = subMinutes(new Date(), 30);
//           break;
//         case '1_hour':
//           start = subHours(new Date(), 1);
//           break;
//         case '6_hours':
//           start = subHours(new Date(), 6);
//           break;
//           case '12_hours':
//             start = subHours(new Date(), 12);
//             break;
//         case '1_day':
//           start = subDays(new Date(), 1);
//           break;
//           case '2_day':
//             start = subDays(new Date(), 2);
//             break;

//         case '1_week':
//           start = subWeeks(new Date(), 1);
//           break;
//         case '1_month':
//           start = subMonths(new Date(), 1);
//           break;
//         default:
//           start = subMinutes(new Date(), 1);// Default to 1 minute
//           break;
//       }
//       setStartDate(start);
//       setEndDate(new Date());
//     }, [selectedTimeRange]);

//     // Fetch historical data for Mode B or C in hourly increments
// const fetchHistoricalData = async (chartId) => {
//   if (!startDate || !endDate) return;

//   setLoading(true);

//   try {
//     const historicalData = [];
//     let currentDate = startDate; // Start from the selected startDate
//     const endDateToUse = endDate || new Date(); // Use endDate or current time if not provided

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
//         timestamp: new Date(item.timestamp),
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

//   } catch (error) {
//     console.error('Error fetching historical data:', error);
//   } finally {
//     setLoading(false);
//   }
// };

// const handleTimeRangeChange = (event) => {
//   setSelectedTimeRange(event.target.value);
//   charts.forEach(chart => {
//     fetchHistoricalData(chart.id); // Fetch new data when time range changes
//   });
// };

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
//                {/* Mode Selection */}
//         <Box display="flex" justifyContent="center" marginBottom={2}>
//         <FormControl>
//           <RadioGroup
//             row
//             value={mode}
//             onChange={(e) => setMode(e.target.value)}
//           >
//             <FormControlLabel value="A" control={<Radio />} label="Real-Time Data Only" />
//             <FormControlLabel value="B" control={<Radio />} label="Start Date & Continue Real-Time" />
//             <FormControlLabel value="C" control={<Radio />} label="Select Date Range" />
//           </RadioGroup>
//         </FormControl>
//       </Box>
//                 {/* Date Range Pickers */}
//         <Grid container spacing={2} alignItems="center" justifyContent="center" marginBottom={2}>
//         <Grid item>
//           <DateTimePicker
//             label="Start Date and Time"
//             value={startDate}
//             onChange={setStartDate}
//             renderInput={(params) => <TextField {...params} />}
//             disabled={mode === 'A'}
//           />
//         </Grid>
//         <Grid item>
//           <DateTimePicker
//             label="End Date and Time"
//             value={endDate}
//             onChange={setEndDate}
//             renderInput={(params) => <TextField {...params} />}
//             disabled={mode !== 'C'}
//           />
//         </Grid>
//       </Grid>
//                 {/* Time Range Dropdown */}
//         <Box display="flex" justifyContent="flex-end" marginBottom={2}>
//         <FormControl>
//           <InputLabel id="time-range-label">Time Range</InputLabel>
//           <Select
//             labelId="time-range-label"
//             value={selectedTimeRange}
//             onChange={handleTimeRangeChange}
//           >
//             <MenuItem value="1_minute">Last 1 minute</MenuItem>
//             <MenuItem value="30_minutes">Last 30 minutes</MenuItem>
//             <MenuItem value="1_hour">Last 1 hour</MenuItem>
//             <MenuItem value="6_hours">Last 6 hour</MenuItem>
//             <MenuItem value="12_hours">Last 12 hours</MenuItem>
//             <MenuItem value="1_day">Last 1 day</MenuItem>
//             <MenuItem value="2_day">Last 2 day</MenuItem>
//             <MenuItem value="1_week">Last 1 week</MenuItem>
//             <MenuItem value="1_month">Last 1 month</MenuItem>
//           </Select>
//         </FormControl>
//       </Box>

//               </DialogContent>
//               <DialogActions>
//               <Button onClick={() => setDateDialogOpen(false)} color="secondary">Cancel</Button>
//               <Button onClick={handleDateRangeApply} color="primary" disabled={!startDate || (mode === 'C' && !endDate)}>
//                 Apply
//               </Button>
//             </DialogActions>
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
//   ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
// } from "recharts";
// import {
//   Container, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
//   FormControl, InputLabel, Select, MenuItem, IconButton, Grid, TextField, FormControlLabel, RadioGroup, Radio
// } from "@mui/material";
// import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import axios from 'axios';
// import { format, parseISO } from 'date-fns';
// import { w3cwebsocket as W3CWebSocket } from "websocket";
// import DeleteIcon from '@mui/icons-material/Delete';
// import { SketchPicker } from 'react-color';

// const CustomScatterCharts = () => {
//   const [data, setData] = useState({});
//   const [charts, setCharts] = useState([]);
//   const [chartDialogOpen, setChartDialogOpen] = useState(false);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [tempChartData, setTempChartData] = useState(null);

//   const [startDate, setStartDate] = useState(null);
//   const [endDate, setEndDate] = useState(null);
//   const [realTimeData, setRealTimeData] = useState(false);
//   const [dateDialogOpen, setDateDialogOpen] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const [mode, setMode] = useState('A'); // A: Real-Time, B: Start Date & Continue Real-Time, C: Select Date Range

//   const wsClientRefs = useRef({}); // Store WebSocket connections for each chart

//   // Setup WebSocket connection for real-time data for a specific chart
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

//   // Fetch historical data for Option B or C
//   const fetchHistoricalData = async (chartId, fetchEndDate = false) => {
//     if (!startDate || (fetchEndDate && !endDate)) return;
//     setLoading(true);

//     try {
//       const formattedStartDate = format(startDate, 'yyyy-MM-dd');
//       const formattedStartTime = format(startDate, 'HH:mm');
//       const formattedEndDate = fetchEndDate ? format(endDate, 'yyyy-MM-dd') : null;
//       const formattedEndTime = fetchEndDate ? format(endDate, 'HH:mm') : null;

//       const response = await axios.post('https://7ko9a0hlo2.execute-api.us-east-1.amazonaws.com/dev/data', {
//         start_date: formattedStartDate,
//         start_time: formattedStartTime,
//         end_date: formattedEndDate,
//         end_time: formattedEndTime,
//         plot_all: true
//       });

//       const historicalData = response.data.data.map(item => ({
//         timestamp: item.timestamp,
//         'AX-LT-011': item.payload['AX-LT-011'],
//         'AX-LT-021': item.payload['AX-LT-021'],
//         'CW-TT-011': item.payload['CW-TT-011'],
//         'CW-TT-021': item.payload['CW-TT-021'],
//         'RECT-CT-001': item.payload['RECT-CT-001'],
//         'RECT-VT-001': item.payload['RECT-VT-001'],
//       }));

//       // Set historical data for the specific chart
//       setData((prevData) => ({
//         ...prevData,
//         [chartId]: historicalData,
//       }));

//       // For Option B, start WebSocket streaming after fetching historical data
//       if (!fetchEndDate) {
//         setupRealTimeWebSocket(chartId);
//       }
//     } catch (error) {
//       console.error('Error fetching historical data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

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

//   const addCustomChart = () => {
//     const newChart = {
//       id: Date.now(),
//       xAxisDataKey: 'CW-TT-011',
//       yAxisDataKey: 'CW-TT-021',
//       xAxisRange: ['auto', 'auto'],
//       yAxisRange: ['auto', 'auto'],
//       color: "#FF0000",
//       timestamp: new Date().toISOString(),  // Adding timestamp
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

//   const handleXAxisKeyChange = (event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       xAxisDataKey: value
//     }));
//   };

//   const handleYAxisKeyChange = (event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKey: value
//     }));
//   };

//   const handleXAxisRangeChange = (event) => {
//     const { name, value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       xAxisRange: name === 'min' ? [parseFloat(value), prevChart.xAxisRange[1]] : [prevChart.xAxisRange[0], parseFloat(value)]
//     }));
//   };

//   const handleYAxisRangeChange = (event) => {
//     const { name, value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisRange: name === 'min' ? [parseFloat(value), prevChart.yAxisRange[1]] : [prevChart.yAxisRange[0], parseFloat(value)]
//     }));
//   };

//   const handleColorChange = (color) => {
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       color: color.hex
//     }));
//   };

//   const deleteChart = (chartId) => {
//     setCharts((prevCharts) => prevCharts.filter((chart) => chart.id !== chartId));
//   };

//   const renderChart = (chart) => (
//     <ResponsiveContainer width="100%" height={400}>
//       <ScatterChart>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis
//           type="number"
//           dataKey={chart.xAxisDataKey}
//           name={chart.xAxisDataKey}
//           domain={[chart.xAxisRange[0], chart.xAxisRange[1]]}
//           tickFormatter={(value) => value.toFixed(4)}
//         />
//         <YAxis
//           type="number"
//           dataKey={chart.yAxisDataKey}
//           name={chart.yAxisDataKey}
//           domain={[chart.yAxisRange[0], chart.yAxisRange[1]]}
//           tickFormatter={(value) => value.toFixed(4)}
//         />
//         {/* Custom Tooltip */}
//         <Tooltip
//           cursor={{ strokeDasharray: '3 3' }}
//           content={({ payload }) => {
//             if (payload && payload.length) {
//               const point = payload[0].payload;
//               return (
//                 <div className="custom-tooltip">
//                   <p>{`X (${chart.xAxisDataKey}): ${point[chart.xAxisDataKey].toFixed(4)}`}</p>
//                   <p>{`Y (${chart.yAxisDataKey}): ${point[chart.yAxisDataKey].toFixed(4)}`}</p>
//                   <p>{`Timestamp: ${new Date(point.timestamp).toLocaleString()}`}</p>
//                 </div>
//               );
//             }
//             return null;
//           }}
//         />
//         <Legend />
//         <Scatter
//           name={`${chart.xAxisDataKey} vs ${chart.yAxisDataKey}`}
//           data={data[chart.id] || []}  // Use accumulated data for the chart
//           fill={chart.color}
//         />
//       </ScatterChart>
//     </ResponsiveContainer>
//   );

//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       <Container>
//         <Box display="flex" justifyContent="flex-end" marginBottom={4}>
//           <Button variant="contained" color="primary" onClick={() => setChartDialogOpen(true)}>
//             Add Scatter Chart
//           </Button>

//         </Box>

//         <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
//           <DialogTitle>Select Chart Type</DialogTitle>
//           <DialogContent>
//             <Box display="flex" flexDirection="column" gap={2}>
//               <Button variant="contained" onClick={addCustomChart}>Add XY Chart</Button>
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
//               </Box>
//               {/* Button for selecting the date range */}
//           <Button
//           variant="contained"
//           color="secondary"
//           onClick={() => setDateDialogOpen(true)}
//           style={{ marginLeft: '170px' }}
//         >
//           Select Date Range
//         </Button>
//             </Box>
//           </Box>
//         ))}

//         {tempChartData && (
//           <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
//             <DialogTitle>Configure Chart</DialogTitle>
//             <DialogContent>
//               <Box display="flex" flexDirection="column" maxHeight="400px" overflow="auto">
//                 <FormControl fullWidth margin="normal">
//                   <InputLabel>X-Axis Data Key</InputLabel>
//                   <Select
//                     value={tempChartData.xAxisDataKey}
//                     onChange={handleXAxisKeyChange}
//                   >
//                     <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//                     <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
//                     <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
//                     <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
//                     <MenuItem value="RECT-CT-001">RECT-CT-001</MenuItem>
//                     <MenuItem value="RECT-VT-001">RECT-VT-001</MenuItem>
//                   </Select>
//                 </FormControl>
//                 <TextField
//                   label="X-Axis Min Range"
//                   type="number"
//                   name="min"
//                   value={tempChartData.xAxisRange[0]}
//                   onChange={handleXAxisRangeChange}
//                   fullWidth
//                   margin="normal"
//                   inputProps={{ step: 0.0001 }}
//                 />
//                 <TextField
//                   label="X-Axis Max Range"
//                   type="number"
//                   name="max"
//                   value={tempChartData.xAxisRange[1]}
//                   onChange={handleXAxisRangeChange}
//                   fullWidth
//                   margin="normal"
//                   inputProps={{ step: 0.0001 }}
//                 />
//                 <FormControl fullWidth margin="normal">
//                   <InputLabel>Y-Axis Data Key</InputLabel>
//                   <Select
//                     value={tempChartData.yAxisDataKey}
//                     onChange={handleYAxisKeyChange}
//                   >
//                     <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//                     <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
//                     <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
//                     <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
//                     <MenuItem value="RECT-CT-001">RECT-CT-001</MenuItem>
//                     <MenuItem value="RECT-VT-001">RECT-VT-001</MenuItem>
//                   </Select>
//                 </FormControl>
//                 <TextField
//                   label="Y-Axis Min Range"
//                   type="number"
//                   name="min"
//                   value={tempChartData.yAxisRange[0]}
//                   onChange={handleYAxisRangeChange}
//                   fullWidth
//                   margin="normal"
//                   inputProps={{ step: 0.0001 }}
//                 />
//                 <TextField
//                   label="Y-Axis Max Range"
//                   type="number"
//                   name="max"
//                   value={tempChartData.yAxisRange[1]}
//                   onChange={handleYAxisRangeChange}
//                   fullWidth
//                   margin="normal"
//                   inputProps={{ step: 0.0001 }}
//                 />
//                 <Button onClick={() => setDialogOpen(true)}>Select Color</Button>
//                 <SketchPicker color={tempChartData.color} onChangeComplete={handleColorChange} />
//               </Box>
//             </DialogContent>
//             <DialogActions>
//               <Button onClick={closeDialog} color="secondary">Cancel</Button>
//               <Button onClick={saveConfiguration} color="primary">Save</Button>
//             </DialogActions>
//           </Dialog>
//         )}

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
//                 <FormControlLabel value="B" control={<Radio />} label="Start Date & Continue Real-Time" />
//                 <FormControlLabel value="C" control={<Radio />} label="Select Date Range" />
//               </RadioGroup>
//             </FormControl>
//             <Grid container spacing={2} alignItems="center">
//               <Grid item xs={6}>
//                 <DateTimePicker
//                   label="Start Date and Time"
//                   value={startDate}
//                   onChange={setStartDate}
//                   renderInput={(params) => <TextField {...params} fullWidth />}
//                   disabled={mode === 'A'}
//                 />
//               </Grid>
//               <Grid item xs={6}>
//                 <DateTimePicker
//                   label="End Date and Time"
//                   value={endDate}
//                   onChange={setEndDate}
//                   renderInput={(params) => <TextField {...params} fullWidth />}
//                   disabled={mode !== 'C'}
//                 />
//               </Grid>
//             </Grid>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setDateDialogOpen(false)} color="secondary">Cancel</Button>
//             <Button onClick={handleDateRangeApply} color="primary" disabled={!startDate || (mode === 'C' && !endDate)}>
//               Apply
//             </Button>
//           </DialogActions>
//         </Dialog>
//       </Container>
//     </LocalizationProvider>
//   );
// };

// export default CustomScatterCharts;

// import React, { useState, useEffect, useRef } from "react";
// import {
//   ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
// } from "recharts";
// import {
//   Container, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
//   FormControl, InputLabel, Select, MenuItem, IconButton, Grid, TextField, FormControlLabel, RadioGroup, Radio
// } from "@mui/material";
// import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import axios from 'axios';
// import { format, parseISO } from 'date-fns';
// import { w3cwebsocket as W3CWebSocket } from "websocket";
// import DeleteIcon from '@mui/icons-material/Delete';
// import { SketchPicker } from 'react-color';

// const CustomScatterCharts = () => {
//   const [data, setData] = useState({});
//   const [charts, setCharts] = useState([]);
//   const [chartDialogOpen, setChartDialogOpen] = useState(false);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [tempChartData, setTempChartData] = useState(null);

//   const [startDate, setStartDate] = useState(null);
//   const [realTimeData, setRealTimeData] = useState(false);
//   const [dateDialogOpen, setDateDialogOpen] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const [mode, setMode] = useState('A'); // A: Real-Time, B: Start Date & Continue Real-Time

//   const wsClientRefs = useRef({}); // Store WebSocket connections for each chart

//   // Setup WebSocket connection for real-time data for a specific chart
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

//   // Fetch historical data for Option B
//   const fetchHistoricalData = async (chartId) => {
//     if (!startDate) return;
//     setLoading(true);

//     try {
//       const formattedStartDate = format(startDate, 'yyyy-MM-dd');
//       const formattedStartTime = format(startDate, 'HH:mm');

//       const response = await axios.post('https://7ko9a0hlo2.execute-api.us-east-1.amazonaws.com/dev/data', {
//         start_date: formattedStartDate,
//         start_time: formattedStartTime,
//         end_date: null, // No end date for continuous real-time
//         plot_all: true
//       });

//       const historicalData = response.data.data.map(item => ({
//         timestamp: item.timestamp,
//         'AX-LT-011': item.payload['AX-LT-011'],
//         'AX-LT-021': item.payload['AX-LT-021'],
//         'CW-TT-011': item.payload['CW-TT-011'],
//         'CW-TT-021': item.payload['CW-TT-021'],
//       }));

//       // Set historical data for the specific chart
//       setData((prevData) => ({
//         ...prevData,
//         [chartId]: historicalData,
//       }));

//       // After fetching historical data, start WebSocket streaming
//       setupRealTimeWebSocket(chartId);
//     } catch (error) {
//       console.error('Error fetching historical data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

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
//       }
//     });
//   };

//   const addCustomChart = () => {
//     const newChart = {
//       id: Date.now(),
//       xAxisDataKey: 'AX-LT-011',
//       yAxisDataKey: 'AX-LT-021',
//       xAxisRange: ['auto', 'auto'],
//       yAxisRange: ['auto', 'auto'],
//       color: "#FF0000",
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

//   const handleXAxisKeyChange = (event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       xAxisDataKey: value
//     }));
//   };

//   const handleYAxisKeyChange = (event) => {
//     const { value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisDataKey: value
//     }));
//   };

//   const handleXAxisRangeChange = (event) => {
//     const { name, value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       xAxisRange: name === 'min' ? [parseFloat(value), prevChart.xAxisRange[1]] : [prevChart.xAxisRange[0], parseFloat(value)]
//     }));
//   };

//   const handleYAxisRangeChange = (event) => {
//     const { name, value } = event.target;
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       yAxisRange: name === 'min' ? [parseFloat(value), prevChart.yAxisRange[1]] : [prevChart.yAxisRange[0], parseFloat(value)]
//     }));
//   };

//   const handleColorChange = (color) => {
//     setTempChartData((prevChart) => ({
//       ...prevChart,
//       color: color.hex
//     }));
//   };

//   const deleteChart = (chartId) => {
//     setCharts((prevCharts) => prevCharts.filter((chart) => chart.id !== chartId));
//   };

//   const renderChart = (chart) => (
//     <ResponsiveContainer width="100%" height={400}>
//       <ScatterChart>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis
//           type="number"
//           dataKey={chart.xAxisDataKey}
//           name={chart.xAxisDataKey}
//           domain={[chart.xAxisRange[0], chart.xAxisRange[1]]}
//           tickFormatter={(value) => value.toFixed(4)}
//         />
//         <YAxis
//           type="number"
//           dataKey={chart.yAxisDataKey}
//           name={chart.yAxisDataKey}
//           domain={[chart.yAxisRange[0], chart.yAxisRange[1]]}
//           tickFormatter={(value) => value.toFixed(4)}
//         />
//         <Tooltip cursor={{ strokeDasharray: '3 3' }} />
//         <Legend />
//         <Scatter
//           name={`${chart.xAxisDataKey} vs ${chart.yAxisDataKey}`}
//           data={data[chart.id] || []}  // Use accumulated data for the chart
//           fill={chart.color}
//         />
//       </ScatterChart>
//     </ResponsiveContainer>
//   );

//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       <Container>
//         <Box display="flex" justifyContent="flex-end" marginBottom={4}>
//           <Button variant="contained" color="secondary" onClick={() => setChartDialogOpen(true)}>
//             Add Custom Scatter Chart
//           </Button>

//         </Box>

//         <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
//           <DialogTitle>Select Chart Type</DialogTitle>
//           <DialogContent>
//             <Box display="flex" flexDirection="column" gap={2}>
//               <Button variant="contained" onClick={addCustomChart}>Add Scatter Chart</Button>
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
//                 <Button variant="outlined" color="secondary" onClick={() => openDialog(chart)}>
//                   Configure Chart
//                 </Button>
//               </Box>
//               {/* Button for selecting the date range */}
//           <Button
//           variant="contained"
//           color="secondary"
//           onClick={() => setDateDialogOpen(true)}
//           style={{ marginLeft: '182px' }}
//         >
//           Select Date Range
//         </Button>
//             </Box>
//           </Box>
//         ))}

//         {tempChartData && (
//           <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
//             <DialogTitle>Configure Chart</DialogTitle>
//             <DialogContent>
//               <Box display="flex" flexDirection="column" maxHeight="400px" overflow="auto">
//                 <FormControl fullWidth margin="normal">
//                   <InputLabel>X-Axis Data Key</InputLabel>
//                   <Select
//                     value={tempChartData.xAxisDataKey}
//                     onChange={handleXAxisKeyChange}
//                   >
//                     <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//                     <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
//                     <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
//                     <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
//                   </Select>
//                 </FormControl>
//                 <TextField
//                   label="X-Axis Min Range"
//                   type="number"
//                   name="min"
//                   value={tempChartData.xAxisRange[0]}
//                   onChange={handleXAxisRangeChange}
//                   fullWidth
//                   margin="normal"
//                   inputProps={{ step: 0.0001 }}
//                 />
//                 <TextField
//                   label="X-Axis Max Range"
//                   type="number"
//                   name="max"
//                   value={tempChartData.xAxisRange[1]}
//                   onChange={handleXAxisRangeChange}
//                   fullWidth
//                   margin="normal"
//                   inputProps={{ step: 0.0001 }}
//                 />
//                 <FormControl fullWidth margin="normal">
//                   <InputLabel>Y-Axis Data Key</InputLabel>
//                   <Select
//                     value={tempChartData.yAxisDataKey}
//                     onChange={handleYAxisKeyChange}
//                   >
//                     <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//                     <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
//                     <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
//                     <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
//                   </Select>
//                 </FormControl>
//                 <TextField
//                   label="Y-Axis Min Range"
//                   type="number"
//                   name="min"
//                   value={tempChartData.yAxisRange[0]}
//                   onChange={handleYAxisRangeChange}
//                   fullWidth
//                   margin="normal"
//                   inputProps={{ step: 0.0001 }}
//                 />
//                 <TextField
//                   label="Y-Axis Max Range"
//                   type="number"
//                   name="max"
//                   value={tempChartData.yAxisRange[1]}
//                   onChange={handleYAxisRangeChange}
//                   fullWidth
//                   margin="normal"
//                   inputProps={{ step: 0.0001 }}
//                 />
//                 <Button onClick={() => setDialogOpen(true)}>Select Color</Button>
//                 <SketchPicker color={tempChartData.color} onChangeComplete={handleColorChange} />
//               </Box>
//             </DialogContent>
//             <DialogActions>
//               <Button onClick={closeDialog} color="secondary">Cancel</Button>
//               <Button onClick={saveConfiguration} color="secondary">Save</Button>
//             </DialogActions>
//           </Dialog>
//         )}

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
//                 <FormControlLabel value="B" control={<Radio />} label="Start Date & Continue Real-Time" />
//               </RadioGroup>
//             </FormControl>
//             <Grid container spacing={2} alignItems="center">
//               <Grid item xs={6}>
//                 <DateTimePicker
//                   label="Start Date and Time"
//                   value={startDate}
//                   onChange={setStartDate}
//                   renderInput={(params) => <TextField {...params} fullWidth />}
//                   disabled={mode === 'A'}
//                 />
//               </Grid>
//             </Grid>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setDateDialogOpen(false)} color="secondary">Cancel</Button>
//             <Button onClick={handleDateRangeApply} color="secondary" disabled={!startDate && mode === 'B'}>
//               Apply
//             </Button>
//           </DialogActions>
//         </Dialog>
//       </Container>
//     </LocalizationProvider>
//   );
// };

// export default CustomScatterCharts;

// import React, { useState, useEffect, useRef } from "react";
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, Brush } from "recharts";
// import {
//   Container, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
//   FormControl, InputLabel, Select, MenuItem, Typography, IconButton, Grid, TextField,
//   FormControlLabel,
//   Radio,
//   RadioGroup
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

// const lineStyles = [
//   { value: 'solid', label: 'Solid' },
//   { value: 'dotted', label: 'Dotted' },
//   { value: 'dashed', label: 'Dashed' },
//   { value: 'dot-dash', label: 'Dot Dash' },
//   { value: 'dash-dot-dot', label: 'Dash Dot Dot' },
// ];

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
//       const formattedStartDate = format(startDate, 'yyyy-MM-dd');
//       const formattedStartTime = format(startDate, 'HH:mm');

//       const requestData = {
//         start_date: formattedStartDate,
//         start_time: formattedStartTime,
//       };

//       if (mode === 'B' && endDate) {
//         requestData.end_date = format(endDate, 'yyyy-MM-dd');
//         requestData.end_time = format(endDate, 'HH:mm');
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

//         // Append new data to existing chart data to ensure continuity
//         setChartData((prevData) => ({
//           ...prevData,
//           [chartId]: [...(prevData[chartId] || []), newData],  // Accumulate data
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

//   const renderLineChart = (chart) => (
//     <ResponsiveContainer width="100%" height={400}>
//       <LineChart data={chartData[chart.id]}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey="timestamp" tickFormatter={(tick) => new Date(tick).toLocaleString()} />
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
//               strokeDasharray={
//                 yAxis.lineStyle === 'solid'
//                   ? ''
//                   : yAxis.lineStyle === 'dotted'
//                   ? '1 1'
//                   : yAxis.lineStyle === 'dashed'
//                   ? '5 5'
//                   : yAxis.lineStyle === 'dot-dash'
//                   ? '3 3 1 3'
//                   : '3 3 1 1 1 3'
//               }
//               yAxisId={yAxis.id}
//             />
//           ))
//         )}
//         <Brush height={30} dataKey="timestamp" stroke="#8884d8" />
//       </LineChart>
//     </ResponsiveContainer>
//   );

//   const renderXYChart = (chart) => {
//     const xDomain = [0, 50];
//     const yDomain = [0, 50];

//     return (
//       <ResponsiveContainer width="100%" height={400}>
//         <ScatterChart data={chartData[chart.id]}>
//           <CartesianGrid strokeDasharray="3 3" />

//           <XAxis
//             dataKey={chart.xAxisDataKey}
//             type="number"
//             domain={xDomain}
//             allowDataOverflow
//           />

//           {chart.yAxisDataKeys.map((yAxis) => (
//             <YAxis
//               key={yAxis.id}
//               yAxisId={yAxis.id}
//               type="number"
//               domain={yDomain}
//               allowDataOverflow
//               stroke={yAxis.color}
//             />
//           ))}

//           <Tooltip />
//           <Legend />

//           {chart.yAxisDataKeys.map((yAxis) =>
//             yAxis.dataKeys.map((key) => (
//               <Scatter
//                 key={key}
//                 dataKey={key}
//                 fill={yAxis.color}
//                 yAxisId={yAxis.id}
//               />
//             ))
//           )}
//         </ScatterChart>
//       </ResponsiveContainer>
//     );
//   };

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
//             Add Custom Chart
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
//                         <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
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
//                         <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
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
//                         {lineStyles.map((style) => (
//                           <MenuItem key={style.value} value={style.value}>
//                             {style.label}
//                           </MenuItem>
//                         ))}
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

// import React, { useState, useEffect, useRef } from "react";
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, Brush } from "recharts";
// import {
//   Container, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
//   FormControl, InputLabel, Select, MenuItem, Typography, IconButton, Grid, TextField,
//   RadioGroup,
//   FormControlLabel,
//   Radio
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

// const lineStyles = [
//   { value: 'solid', label: 'Solid' },
//   { value: 'dotted', label: 'Dotted' },
//   { value: 'dashed', label: 'Dashed' },
//   { value: 'dot-dash', label: 'Dot Dash' },
//   { value: 'dash-dot-dot', label: 'Dash Dot Dot' },
// ];

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
//       const formattedStartDate = format(startDate, 'yyyy-MM-dd');
//       const formattedStartTime = format(startDate, 'HH:mm');

//       const requestData = {
//         start_date: formattedStartDate,
//         start_time: formattedStartTime,
//       };

//       if (mode === 'B' && endDate) {
//         requestData.end_date = format(endDate, 'yyyy-MM-dd');
//         requestData.end_time = format(endDate, 'HH:mm');
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

//   const renderLineChart = (chart) => (
//     <ResponsiveContainer width="100%" height={400}>
//       <LineChart data={chartData[chart.id]}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey="timestamp" tickFormatter={(tick) => new Date(tick).toLocaleString()} />
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
//               strokeDasharray={
//                 yAxis.lineStyle === 'solid'
//                   ? ''
//                   : yAxis.lineStyle === 'dotted'
//                   ? '1 1'
//                   : yAxis.lineStyle === 'dashed'
//                   ? '5 5'
//                   : yAxis.lineStyle === 'dot-dash'
//                   ? '3 3 1 3'
//                   : '3 3 1 1 1 3'
//               }
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
//             Add Custom Chart
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
//                         {lineStyles.map((style) => (
//                           <MenuItem key={style.value} value={style.value}>
//                             {style.label}
//                           </MenuItem>
//                         ))}
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
//       const formattedStartDate = format(startDate, 'yyyy-MM-dd');
//       const formattedStartTime = format(startDate, 'HH:mm');

//       const requestData = {
//         start_date: formattedStartDate,
//         start_time: formattedStartTime,
//       };

//       if (mode === 'B' && endDate) {
//         requestData.end_date = format(endDate, 'yyyy-MM-dd');
//         requestData.end_time = format(endDate, 'HH:mm');
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

// import React, { useState, useRef } from "react";
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
// import {
//   Container, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
//   FormControlLabel, Grid, TextField,  RadioGroup, FormControl, FormLabel, Radio
// } from "@mui/material";
// import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import axios from 'axios';
// import { format } from 'date-fns';
// import { w3cwebsocket as W3CWebSocket } from "websocket";
// const CustomCharts = () => {
//   const [data, setData] = useState([]); // Historical + Real-time data
//   const [charts, setCharts] = useState([{ id: 1, type: "Line" }]);
//   const [dateDialogOpen, setDateDialogOpen] = useState(false);
//   const [startDate, setStartDate] = useState(null);
//   const [endDate, setEndDate] = useState(null);
//   const [realTimeData, setRealTimeData] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [mode, setMode] = useState('A'); // A for real-time, B for historical range, C for historical + real-time

//   const wsClientRef = useRef(null);

//   // Fetch Historical Data (Option B and C)
//   const fetchHistoricalData = async () => {
//     if (!startDate) return;  // Ensure startDate is selected or not
//     setLoading(true);

//     try {
//       const formattedStartDate = format(startDate, 'yyyy-MM-dd');
//       const formattedStartTime = format(startDate, 'HH:mm');

//       const requestData = {
//         start_date: formattedStartDate,
//         start_time: formattedStartTime,
//       };

//       // Only add end_date and end_time if the mode is B (Select Start Date & End Date)
//       if (mode === 'B' && endDate) {
//         requestData.end_date = format(endDate, 'yyyy-MM-dd');
//         requestData.end_time = format(endDate, 'HH:mm');
//       }

//       const response = await axios.post(
//         'https://7ko9a0hlo2.execute-api.us-east-1.amazonaws.com/dev/data',
//         requestData
//       );

//       const historicalData = response.data.data.map(item => ({
//         timestamp: item.payload['PLC-TIME-STAMP'],
//         'AX-LT-011': item.payload['AX-LT-011'],
//         'AX-LT-021': item.payload['AX-LT-021'],
//         'CW-TT-011': item.payload['CW-TT-011'],
//         'CW-TT-021': item.payload['CW-TT-021'],
//       }));

//       setData(historicalData);

//       // For Option C: Switch to real-time WebSocket after historical data
//       if (mode === 'C') {
//         setupRealTimeWebSocket();
//       }
//     } catch (error) {
//       console.error('Error fetching historical data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Setup WebSocket for Real-Time Data (Option A and C)
//   const setupRealTimeWebSocket = () => {
//     if (wsClientRef.current) {
//       wsClientRef.current.close(); // Close any previous WebSocket connection then ytou need to put it their
//     }

//     console.log("Setting up WebSocket connection...");

//     wsClientRef.current = new W3CWebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");

//     wsClientRef.current.onopen = () => {
//       console.log("WebSocket connection established.");
//     };

//     wsClientRef.current.onmessage = (message) => {
//       try {
//         const receivedData = JSON.parse(message.data);
//         const newData = {
//           timestamp: receivedData['PLC-TIME-STAMP'] || new Date().toISOString(),
//           'AX-LT-011': receivedData['AX-LT-011'] !== undefined ? receivedData['AX-LT-011'] : null,
//           'AX-LT-021': receivedData['AX-LT-021'] !== undefined ? receivedData['AX-LT-021'] : null,
//           'CW-TT-011': receivedData['CW-TT-011'] !== undefined ? receivedData['CW-TT-011'] : null,
//           'CW-TT-021': receivedData['CW-TT-021'] !== undefined ? receivedData['CW-TT-021'] : null,
//         };

//         if (newData['AX-LT-011'] !== null || newData['AX-LT-021'] !== null || newData['CW-TT-011'] !== null) {
//           setData((prevData) => [...prevData, newData]);
//         }
//       } catch (error) {
//         console.error("Error processing WebSocket message:", error);
//       }
//     };

//     wsClientRef.current.onclose = (event) => {
//       console.error(`WebSocket disconnected (code: ${event.code}, reason: ${event.reason}). Reconnecting...`);
//       setTimeout(() => {
//         setupRealTimeWebSocket();
//       }, 1000); // Retry connection after 1 second
//     };

//     wsClientRef.current.onerror = (error) => {
//       console.error("WebSocket encountered error:", error.message, "Closing socket...");
//       wsClientRef.current.close();
//     };
//   };

//   // Handle Apply Date Range Button Click
//   const handleDateRangeApply = () => {
//     setDateDialogOpen(false);
//     if (mode === 'A') {
//       setupRealTimeWebSocket(); // Only real-time data
//     } else {
//       fetchHistoricalData(); // Historical data and optionally real-time data in Option C
//     }
//   };

//   const renderChart = (chart) => {
//     switch (chart.type) {
//       case "Line":
//         return (
//           <ResponsiveContainer width="100%" height={400}>
//             <LineChart data={data}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="timestamp" />
//               <YAxis />
//               <Tooltip />
//               <Legend />
//               <Line type="monotone" dataKey="AX-LT-011" stroke="#8884d8" />
//               <Line type="monotone" dataKey="AX-LT-021" stroke="#82ca9d" />
//               <Line type="monotone" dataKey="CW-TT-011" stroke="#ffc658" />
//             </LineChart>
//           </ResponsiveContainer>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       <Container>
//         <Box display="flex" justifyContent="flex-end" marginBottom={4}>
//           <Button variant="contained" color="primary" onClick={() => setDateDialogOpen(true)}>
//             Date Range Select
//           </Button>
//         </Box>

//         {/* Render Custom Charts */}
//         {charts.map((chart) => (
//           <Box key={chart.id} marginY={4} position="relative">
//             <Box border={1} padding={2}>
//               {renderChart(chart)}
//             </Box>
//           </Box>
//         ))}

//         {/* Date Range Selection Dialog */}
//         <Dialog open={dateDialogOpen} onClose={() => setDateDialogOpen(false)} fullWidth maxWidth="sm">
//           <DialogTitle>Select Date Range</DialogTitle>
//           <DialogContent>
//             <FormControl component="fieldset">
//               <FormLabel component="legend">Mode</FormLabel>
//               <RadioGroup
//                 row
//                 value={mode}
//                 onChange={(e) => setMode(e.target.value)}
//               >
//                 <FormControlLabel value="A" control={<Radio />} label="Real-Time Only" />
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
//                   disabled={mode === 'A' || mode === 'C'} // Disable End Date for Real-Time and Start-to-Real-Time mode
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
//       </Container>
//     </LocalizationProvider>
//   );
// };

// export default CustomCharts;

// import React, { useState, useEffect, useRef } from "react";
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
// import {
//   Container, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
//   FormControlLabel, Grid, TextField, Switch
// } from "@mui/material";
// import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import axios from 'axios';
// import { format, parseISO } from 'date-fns';
// import { w3cwebsocket as W3CWebSocket } from "websocket";

// const CustomCharts = () => {
//   const [data, setData] = useState([]);
//   const [charts, setCharts] = useState([{ id: 1, type: "Line" }]);
//   const [dateDialogOpen, setDateDialogOpen] = useState(false);
//   const [startDate, setStartDate] = useState(null);
//   const [endDate, setEndDate] = useState(null);
//   const [realTimeData, setRealTimeData] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const wsClientRef = useRef(null);

//   // Fetch Historical Data
//   const fetchHistoricalData = async () => {
//     if (!startDate || (!realTimeData && !endDate)) return;
//     setLoading(true);
//     try {
//       const formattedStartDate = format(startDate, 'yyyy-MM-dd');
//       const formattedStartTime = format(startDate, 'HH:mm');
//       let formattedEndDate = null;
//       let formattedEndTime = null;

//       if (!realTimeData && endDate) {
//         formattedEndDate = format(endDate, 'yyyy-MM-dd');
//         formattedEndTime = format(endDate, 'HH:mm');
//       }

//       const requestData = {
//         start_date: formattedStartDate,
//         start_time: formattedStartTime,
//         ...(formattedEndDate && formattedEndTime ? { end_date: formattedEndDate, end_time: formattedEndTime } : {})
//       };

//       const response = await axios.post(
//         'https://7ko9a0hlo2.execute-api.us-east-1.amazonaws.com/dev/data',
//         requestData
//       );

//       const historicalData = response.data.data.map(item => ({
//         timestamp: item['PLC-TIME-STAMP'],
//         'AX-LT-011': item['AX-LT-011'],
//         'AX-LT-021': item['AX-LT-021'],
//         'CW-TT-011': item['CW-TT-011'],
//         'CW-TT-021': item['CW-TT-021'],
//       }));

//       setData(historicalData);

//       if (realTimeData) {
//         setupRealTimeWebSocket();
//       }
//     } catch (error) {
//       console.error('Error fetching historical data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Improved WebSocket Real-Time Data Setup with Error Handling
//   const setupRealTimeWebSocket = () => {
//     if (wsClientRef.current) {
//       wsClientRef.current.close();  // Close any previous connection
//     }

//     console.log("Setting up WebSocket connection...");

//     wsClientRef.current = new W3CWebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");

//     wsClientRef.current.onopen = () => {
//       console.log("WebSocket connection established.");
//     };

//     wsClientRef.current.onmessage = (message) => {
//       try {
//         const receivedData = JSON.parse(message.data);
//         const newData = {
//           timestamp: receivedData['PLC-TIME-STAMP'] || Date.now(),
//           'AX-LT-011': receivedData['AX-LT-011'] !== undefined ? receivedData['AX-LT-011'] : null,
//           'AX-LT-021': receivedData['AX-LT-021'] !== undefined ? receivedData['AX-LT-021'] : null,
//           'CW-TT-011': receivedData['CW-TT-011'] !== undefined ? receivedData['CW-TT-011'] : null,
//           'CW-TT-021': receivedData['CW-TT-021'] !== undefined ? receivedData['CW-TT-021'] : null,
//         };

//         if (newData['AX-LT-011'] !== null || newData['AX-LT-021'] !== null || newData['CW-TT-011'] !== null) {
//           setData((prevData) => [...prevData, newData]);
//         }
//       } catch (error) {
//         console.error("Error processing WebSocket message:", error);
//       }
//     };

//     wsClientRef.current.onclose = (event) => {
//       console.error(`WebSocket disconnected (code: ${event.code}, reason: ${event.reason}). Reconnecting...`);
//       setTimeout(() => {
//         setupRealTimeWebSocket();
//       }, 1000);  // Retry connection after 1 second
//     };

//     wsClientRef.current.onerror = (error) => {
//       console.error("WebSocket encountered error:", error.message, "Closing socket...");
//       wsClientRef.current.close();
//     };
//   };

//   useEffect(() => {
//     if (realTimeData && !loading) {
//       setupRealTimeWebSocket();
//     }

//     return () => {
//       if (wsClientRef.current) wsClientRef.current.close();
//     };
//   }, [realTimeData]);

//   // Handle Date Range Dialog Apply
//   const handleDateRangeApply = () => {
//     setDateDialogOpen(false);
//     if (realTimeData) {
//       setupRealTimeWebSocket();
//     } else {
//       fetchHistoricalData();
//     }
//   };

//   const renderChart = (chart) => {
//     switch (chart.type) {
//       case "Line":
//         return (
//           <ResponsiveContainer width="100%" height={400}>
//             <LineChart data={data}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="timestamp" />
//               <YAxis />
//               <Tooltip />
//               <Legend />
//               <Line type="monotone" dataKey="AX-LT-011" stroke="#8884d8" />
//               <Line type="monotone" dataKey="AX-LT-021" stroke="#82ca9d" />
//               <Line type="monotone" dataKey="CW-TT-011" stroke="#ffc658" />
//               <Line type="monotone" dataKey="CW-TT-021" stroke="#ff7300" />
//             </LineChart>
//           </ResponsiveContainer>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       <Container>
//         <Box display="flex" justifyContent="flex-end" marginBottom={4}>
//           <Button variant="contained" color="primary" onClick={() => setDateDialogOpen(true)}>
//             Select Date Range
//           </Button>
//         </Box>

//         {charts.map((chart) => (
//           <Box key={chart.id} marginY={4}>
//             {renderChart(chart)}
//           </Box>
//         ))}

//         <Dialog open={dateDialogOpen} onClose={() => setDateDialogOpen(false)} fullWidth maxWidth="sm">
//           <DialogTitle>Select Date Range</DialogTitle>
//           <DialogContent>
//             <Grid container spacing={2}>
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
//               <Grid item xs={12}>
//                 <FormControlLabel
//                   control={<Switch checked={realTimeData} onChange={(e) => setRealTimeData(e.target.checked)} />}
//                   label="Switch to Real-Time Data"
//                 />
//               </Grid>
//             </Grid>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setDateDialogOpen(false)} color="secondary">Cancel</Button>
//             <Button onClick={handleDateRangeApply} color="primary" disabled={!startDate || (!realTimeData && !endDate)}>
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
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
// import {
//   Container, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
//   FormControl, InputLabel, Select, MenuItem, Typography, IconButton, Grid, TextField, Switch, FormControlLabel
// } from "@mui/material";
// import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import DeleteIcon from '@mui/icons-material/Delete';
// import { SketchPicker } from 'react-color';
// import axios from 'axios';
// import { format } from 'date-fns';
// import { w3cwebsocket as W3CWebSocket } from "websocket";

// const CustomCharts = () => {
//   const [data, setData] = useState([]);
//   const [charts, setCharts] = useState([]);
//   const [chartDialogOpen, setChartDialogOpen] = useState(false);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [tempChartData, setTempChartData] = useState(null);
//   const [colorPickerOpen, setColorPickerOpen] = useState(false);
//   const [selectedYAxisId, setSelectedYAxisId] = useState(null);

//   // Date and Time Selection States
//   const [dateDialogOpen, setDateDialogOpen] = useState(false);
//   const [startDate, setStartDate] = useState(null);
//   const [endDate, setEndDate] = useState(null);
//   const [realTimeData, setRealTimeData] = useState(false);
//   const [mode, setMode] = useState('realtime'); // Mode: 'realtime', 'daterange', or 'start-to-realtime'
//   const [loading, setLoading] = useState(false);

//   // WebSocket Client
//   const wsClientRef = useRef(null);

//   // Fetch Historical Data
//   const fetchHistoricalData = async () => {
//     if (!startDate || (mode === 'daterange' && !endDate)) return;
//     setLoading(true);

//     try {
//       const formattedStartDate = format(startDate, 'yyyy-MM-dd');
//       const formattedStartTime = format(startDate, 'HH:mm');
//       let formattedEndDate = null;
//       let formattedEndTime = null;

//       if (mode === 'daterange') {
//         formattedEndDate = format(endDate, 'yyyy-MM-dd');
//         formattedEndTime = format(endDate, 'HH:mm');
//       }

//       const response = await axios.post('https://7ko9a0hlo2.execute-api.us-east-1.amazonaws.com/dev/data', {
//         start_date: formattedStartDate,
//         start_time: formattedStartTime,
//         end_date: formattedEndDate,
//         end_time: formattedEndTime,
//       });

//       const historicalData = response.data.data.map(item => ({
//         timestamp: item.timestamp,
//         'AX-LT-011': item.payload['AX-LT-011'],
//         'AX-LT-021': item.payload['AX-LT-021'],
//         'CW-TT-011': item.payload['CW-TT-011'],
//       }));

//       setData(historicalData);

//       if (mode === 'start-to-realtime') {
//         // If mode is start-to-realtime, transition to real-time WebSocket after plotting historical data
//         setupRealTimeWebSocket();
//       }
//     } catch (error) {
//       console.error('Error fetching historical data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // WebSocket Real-Time Data Handling
//   const setupRealTimeWebSocket = () => {
//     if (wsClientRef.current) wsClientRef.current.close();

//     wsClientRef.current = new W3CWebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");
//     wsClientRef.current.onmessage = (message) => {
//       try {
//         const receivedData = JSON.parse(message.data);
//         const payload = receivedData.payload || {};

//         const newData = {
//           timestamp: receivedData.timestamp || Date.now(),
//           'AX-LT-011': payload['AX-LT-011'] !== undefined ? payload['AX-LT-011'] : null,
//           'AX-LT-021': payload['AX-LT-021'] !== undefined ? payload['AX-LT-021'] : null,
//           'CW-TT-011': payload['CW-TT-011'] !== undefined ? payload['CW-TT-011'] : null,
//         };

//         if (newData['AX-LT-011'] !== null || newData['AX-LT-021'] !== null || newData['CW-TT-011'] !== null) {
//           setData((prevData) => [...prevData, newData]);
//         }
//       } catch (error) {
//         console.error("Error processing WebSocket message:", error);
//       }
//     };

//     wsClientRef.current.onclose = () => {
//       console.log("WebSocket disconnected. Reconnecting...");
//       setTimeout(() => {
//         setupRealTimeWebSocket();
//       }, 1000); // Retry connection
//     };
//   };

//   // Toggle Real-Time Data
//   useEffect(() => {
//     if (mode === 'realtime') {
//       setupRealTimeWebSocket();
//     } else if (wsClientRef.current) {
//       wsClientRef.current.close();
//     }

//     return () => {
//       if (wsClientRef.current) wsClientRef.current.close();
//     };
//   }, [mode]);

//   // Add Custom Chart
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
//     switch (chart.type) {
//       case "Line":
//         return (
//           <ResponsiveContainer width="100%" height={400}>
//             <LineChart data={data}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="timestamp" />
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
//       default:
//         return null;
//     }
//   };

//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       <Container>
//         <Box display="flex" justifyContent="flex-end" marginBottom={4}>
//           <Button variant="contained" color="primary" onClick={() => setChartDialogOpen(true)}>
//             Add a custom chart
//           </Button>
//         </Box>

//         {/* Chart Selection Dialog */}
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

//         {/* Chart Configuration Dialog */}
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
//                         <MenuItem value="dot-dash">Dot Dash</MenuItem>
//                         <MenuItem value="dash-dot-dot">Dash Dot Dot</MenuItem>
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

//         {/* Date Range Selection Dialog */}
//         <Dialog open={dateDialogOpen} onClose={() => setDateDialogOpen(false)} fullWidth maxWidth="sm">
//           <DialogTitle>Select Date Range</DialogTitle>
//           <DialogContent>
//             <Grid container spacing={2} alignItems="center">
//               <Grid item xs={12}>
//                 <FormControlLabel
//                   control={<Switch checked={mode === 'realtime'} onChange={(e) => setMode(e.target.checked ? 'realtime' : mode)} />}
//                   label="Real-Time Data Only"
//                 />
//                 <FormControlLabel
//                   control={<Switch checked={mode === 'start-to-realtime'} onChange={(e) => setMode(e.target.checked ? 'start-to-realtime' : mode)} />}
//                   label="Start-to-Real-Time Data"
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
//                   disabled={mode === 'realtime' || mode === 'start-to-realtime'}
//                 />
//               </Grid>
//             </Grid>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setDateDialogOpen(false)} color="secondary">Cancel</Button>
//             <Button
//               onClick={() => {
//                 setDateDialogOpen(false);
//                 if (mode === 'daterange') fetchHistoricalData();
//                 else if (mode === 'start-to-realtime') fetchHistoricalData(); // then switch to real-time
//               }}
//               color="primary"
//               disabled={!startDate || (mode === 'daterange' && !endDate)}
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
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
// import {
//   Container, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
//   FormControl, InputLabel, Select, MenuItem, Typography, IconButton, Grid, TextField, Switch, FormControlLabel
// } from "@mui/material";
// import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import DeleteIcon from '@mui/icons-material/Delete';
// import { SketchPicker } from 'react-color';
// import axios from 'axios';
// import { format } from 'date-fns';
// import { w3cwebsocket as W3CWebSocket } from "websocket";

// const CustomCharts = () => {
//   const [data, setData] = useState([]);
//   const [charts, setCharts] = useState([]);
//   const [chartDialogOpen, setChartDialogOpen] = useState(false);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [tempChartData, setTempChartData] = useState(null);
//   const [colorPickerOpen, setColorPickerOpen] = useState(false);
//   const [selectedYAxisId, setSelectedYAxisId] = useState(null);

//   // Date and Time Selection States
//   const [dateDialogOpen, setDateDialogOpen] = useState(false);
//   const [startDate, setStartDate] = useState(null);
//   const [endDate, setEndDate] = useState(null);
//   const [realTimeData, setRealTimeData] = useState(false);
//   const [loading, setLoading] = useState(false);

//   // WebSocket Client
//   const wsClientRef = useRef(null);

//   // Fetch Historical Data
//   const fetchHistoricalData = async () => {
//     if (!startDate || !endDate) return;
//     setLoading(true);

//     try {
//       const formattedStartDate = format(startDate, 'yyyy-MM-dd');
//       const formattedStartTime = format(startDate, 'HH:mm');
//       const formattedEndDate = format(endDate, 'yyyy-MM-dd');
//       const formattedEndTime = format(endDate, 'HH:mm');

//       const response = await axios.post('https://7ko9a0hlo2.execute-api.us-east-1.amazonaws.com/dev/data', {
//         start_date: formattedStartDate,
//         start_time: formattedStartTime,
//         end_date: formattedEndDate,
//         end_time: formattedEndTime,
//       });

//       const historicalData = response.data.data.map(item => ({
//         timestamp: item.timestamp,
//         'AX-LT-011': item.payload['AX-LT-011'],
//         'AX-LT-021': item.payload['AX-LT-021'],
//         'CW-TT-011': item.payload['CW-TT-011'],
//       }));

//       setData(historicalData);

//       // If real-time data is enabled after plotting historical data, switch to real-time WebSocket
//       if (realTimeData) {
//         setupRealTimeWebSocket();
//       }
//     } catch (error) {
//       console.error('Error fetching historical data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // WebSocket Real-Time Data Handling
//   const setupRealTimeWebSocket = () => {
//     if (wsClientRef.current) wsClientRef.current.close();

//     wsClientRef.current = new W3CWebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");
//     wsClientRef.current.onmessage = (message) => {
//       try {
//         const receivedData = JSON.parse(message.data);
//         const payload = receivedData.payload || {};

//         const newData = {
//           timestamp: receivedData.timestamp || Date.now(),
//           'AX-LT-011': payload['AX-LT-011'] !== undefined ? payload['AX-LT-011'] : null,
//           'AX-LT-021': payload['AX-LT-021'] !== undefined ? payload['AX-LT-021'] : null,
//           'CW-TT-011': payload['CW-TT-011'] !== undefined ? payload['CW-TT-011'] : null,
//         };

//         if (newData['AX-LT-011'] !== null || newData['AX-LT-021'] !== null || newData['CW-TT-011'] !== null) {
//           setData((prevData) => [...prevData, newData]);
//         }
//       } catch (error) {
//         console.error("Error processing WebSocket message:", error);
//       }
//     };

//     wsClientRef.current.onclose = () => {
//       console.log("WebSocket disconnected. Reconnecting...");
//       setTimeout(() => {
//         setupRealTimeWebSocket();
//       }, 1000); // Retry connection
//     };
//   };

//   // Toggle Real-Time Data
//   useEffect(() => {
//     if (realTimeData) {
//       setupRealTimeWebSocket();
//     } else if (wsClientRef.current) {
//       wsClientRef.current.close();
//     }
//     return () => {
//       if (wsClientRef.current) wsClientRef.current.close();
//     };
//   }, [realTimeData]);

//   // Add Custom Chart
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
//     switch (chart.type) {
//       case "Line":
//         return (
//           <ResponsiveContainer width="100%" height={400}>
//             <LineChart data={data}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="timestamp" />
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
//       default:
//         return null;
//     }
//   };

//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       <Container>
//         <Box display="flex" justifyContent="flex-end" marginBottom={4}>
//           <Button variant="contained" color="primary" onClick={() => setChartDialogOpen(true)}>
//             Add Custom Chart
//           </Button>
//         </Box>

//         {/* Chart Selection Dialog */}
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

//         {/* Chart Configuration Dialog */}
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
//                         <MenuItem value="dot-dash">Dot Dash</MenuItem>
//                         <MenuItem value="dash-dot-dot">Dash Dot Dot</MenuItem>
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

//         {/* Date Range Selection Dialog */}
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
//       const formattedStartDate = format(startDate, 'yyyy-MM-dd');
//       const formattedStartTime = format(startDate, 'HH:mm');
//       const formattedEndDate = format(endDate, 'yyyy-MM-dd');
//       const formattedEndTime = format(endDate, 'HH:mm');

//       // Fetch data from Lambda
//       const response = await axios.post('https://7ko9a0hlo2.execute-api.us-east-1.amazonaws.com/dev/data', {
//         start_date: formattedStartDate,
//         start_time: formattedStartTime,
//         end_date: formattedEndDate,
//         end_time: formattedEndTime,
//         plot_all: true  // Ensures all data is returned for plotting
//       });

//       const historicalData = response.data.data.map(item => ({
//         timestamp: item.timestamp,
//         'AX-LT-011': item.payload['AX-LT-011'],
//         'AX-LT-021': item.payload['AX-LT-021'],
//         'CW-TT-011': item.payload['CW-TT-011'],
//       }));

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

//   const renderChart = (chart) => (
//     <ResponsiveContainer width="100%" height={400}>
//       <LineChart data={data} syncId="syncChart">
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
//         <Brush />
//         {chart.yAxisDataKeys.map((yAxis) =>
//           yAxis.dataKeys.map((key) => (
//             <Line
//               key={key}
//               type="monotone"
//               dataKey={key}
//               stroke={yAxis.color}
//               strokeDasharray={
//                 yAxis.lineStyle === 'solid'
//                   ? ''
//                   : yAxis.lineStyle === 'dotted'
//                   ? '1 1'
//                   : '5 5'
//               }
//               yAxisId={yAxis.id}
//             />
//           ))
//         )}
//       </LineChart>
//     </ResponsiveContainer>
//   );

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
