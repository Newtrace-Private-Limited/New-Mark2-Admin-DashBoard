
import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import {
  Container,
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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { SketchPicker } from 'react-color';

Chart.register(...registerables, zoomPlugin);

const Barcharts = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [selectedYAxisId, setSelectedYAxisId] = useState(null);
  const [yAxisDataKeys, setYAxisDataKeys] = useState([
    { id: 'left-0', dataKeys: ['AX-LT-011'], range: '0-500', color: "#FF0000", lineStyle: 'solid' }
  ]);
  const [tempYAxisDataKeys, setTempYAxisDataKeys] = useState([...yAxisDataKeys]);

  const openDialog = () => {
    setTempYAxisDataKeys([...yAxisDataKeys]);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

  const saveConfiguration = () => {
    setYAxisDataKeys([...tempYAxisDataKeys]);
    setDialogOpen(false);
  };

  const handleDataKeyChange = (yAxisId, event) => {
    const { value } = event.target;
    setTempYAxisDataKeys((prevYAxisDataKeys) =>
      prevYAxisDataKeys.map((yAxis) =>
        yAxis.id === yAxisId ? { ...yAxis, dataKeys: value } : yAxis
      )
    );
  };

  const handleRangeChange = (yAxisId, event) => {
    const { value } = event.target;
    setTempYAxisDataKeys((prevYAxisDataKeys) =>
      prevYAxisDataKeys.map((yAxis) =>
        yAxis.id === yAxisId ? { ...yAxis, range: value } : yAxis
      )
    );
  };

  const handleColorChange = (color) => {
    setTempYAxisDataKeys((prevYAxisDataKeys) =>
      prevYAxisDataKeys.map((yAxis) =>
        yAxis.id === selectedYAxisId ? { ...yAxis, color: color.hex } : yAxis
      )
    );
    setColorPickerOpen(false);
  };

  const handleLineStyleChange = (yAxisId, event) => {
    const { value } = event.target;
    setTempYAxisDataKeys((prevYAxisDataKeys) =>
      prevYAxisDataKeys.map((yAxis) =>
        yAxis.id === yAxisId ? { ...yAxis, lineStyle: value } : yAxis
      )
    );
  };

  const addYAxis = () => {
    setTempYAxisDataKeys((prevYAxisDataKeys) => [
      ...prevYAxisDataKeys,
      {
        id: `left-${prevYAxisDataKeys.length}`,
        dataKeys: [],
        range: '0-500',
        color: yAxisColors[prevYAxisDataKeys.length % yAxisColors.length],
        lineStyle: 'solid'
      },
    ]);
  };

  const deleteYAxis = (yAxisId) => {
    setTempYAxisDataKeys((prevYAxisDataKeys) =>
      prevYAxisDataKeys.filter((yAxis) => yAxis.id !== yAxisId)
    );
  };

  const openColorPicker = (yAxisId) => {
    setSelectedYAxisId(yAxisId);
    setColorPickerOpen(true);
  };

  const data = {
    labels: Array.from({ length: 50 }, (_, i) => i),
    datasets: yAxisDataKeys.flatMap((yAxis) =>
      yAxis.dataKeys.map((key) => ({
        label: key,
        data: Array.from({ length: 50 }, () => Math.floor(Math.random() * 100)),
        borderColor: yAxis.color,
        borderWidth: 2,
        fill: false,
        yAxisID: yAxis.id,
        borderDash:
          yAxis.lineStyle === 'solid'
            ? []
            : yAxis.lineStyle === 'dotted'
            ? [1, 1]
            : yAxis.lineStyle === 'dashed'
            ? [5, 5]
            : yAxis.lineStyle === 'dot-dash'
            ? [3, 3, 1, 3]
            : [3, 3, 1, 1, 1, 3],
      }))
    ),
  };

  const options = {
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
      },
      ...yAxisDataKeys.reduce(
        (acc, yAxis) => ({
          ...acc,
          [yAxis.id]: {
            type: 'linear',
            position: 'left',
            min: 0,
            max: parseInt(yAxis.range.split('-')[1], 10),
          },
        }),
        {}
      ),
    },
    plugins: {
      zoom: {
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: 'xy',
        },
        pan: {
          enabled: true,
          mode: 'xy',
        },
      },
    },
  };

  const lineStyles = [
    { value: 'solid', label: 'Solid' },
    { value: 'dotted', label: 'Dotted' },
    { value: 'dashed', label: 'Dashed' },
    { value: 'dot-dash', label: 'Dot Dash' },
    { value: 'dash-dot-dot', label: 'Dash Dot Dot' },
  ];

  const yAxisColors = ["#FF0000", "#00FF00", "#0000FF", "#FF00FF", "#00FFFF", "#FFFF00"];

  return (
    <Container>
      <Box display="flex" justifyContent="flex-end" marginBottom={4}>
        <Button variant="contained" color="primary" onClick={openDialog}>
          Configure Y-Axes
        </Button>
      </Box>
      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
        <DialogTitle>Configure Y-Axes</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" maxHeight="400px" overflow="auto">
            {tempYAxisDataKeys.map((yAxis, index) => (
              <Box key={yAxis.id} display="flex" flexDirection="column" marginBottom={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Y-Axis {index + 1}</Typography>
                  <IconButton onClick={() => deleteYAxis(yAxis.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
                <FormControl>
                  <InputLabel>Data Keys</InputLabel>
                  <Select
                    multiple
                    value={yAxis.dataKeys}
                    onChange={(event) => handleDataKeyChange(yAxis.id, event)}
                  >
                    <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
                    <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
                    <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
                    <MenuItem value="AX-LT-012">AX-LT-012</MenuItem>
                    <MenuItem value="AX-LT-022">AX-LT-022</MenuItem>
                    <MenuItem value="CW-TT-012">CW-TT-012</MenuItem>
                  </Select>
                </FormControl>
                <FormControl>
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
                <FormControl>
                  <InputLabel>Line Style</InputLabel>
                  <Select
                    value={yAxis.lineStyle}
                    onChange={(event) => handleLineStyleChange(yAxis.id, event)}
                  >
                    {lineStyles.map((style) => (
                      <MenuItem key={style.value} value={style.value}>
                        {style.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button onClick={() => openColorPicker(yAxis.id)}>
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
          <Button onClick={closeDialog} color="secondary">Cancel</Button>
          <Button onClick={saveConfiguration} color="primary">OK</Button>
        </DialogActions>
      </Dialog>
      <Box>
        <Line data={data} options={options} />
      </Box>
    </Container>
  );
};

export default Barcharts;