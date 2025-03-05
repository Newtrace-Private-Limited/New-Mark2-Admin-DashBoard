import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { v4 as uuidv4 } from 'uuid';

const API_CREATE_TEST = 'https://ewgjvadscl4otubtck4kp6vap40rjivf.lambda-url.us-east-1.on.aws/';
const API_GET_TESTS = 'https://ewgjvadscl4otubtck4kp6vap40rjivf.lambda-url.us-east-1.on.aws/';
const API_ADD_SAMPLE = 'https://pox6tnrgvttowvpdposwtyn2ly0ziuso.lambda-url.us-east-1.on.aws/';
const API_GET_SAMPLES = 'https://pox6tnrgvttowvpdposwtyn2ly0ziuso.lambda-url.us-east-1.on.aws';
const API_UPDATE_SAMPLE = 'https://pox6tnrgvttowvpdposwtyn2ly0ziuso.lambda-url.us-east-1.on.aws';

const testingMachineOptions = [
  "Mark 1", "Mark 2", "Mark 3",
  "Prabha 1", "Prabha 2", "Prabha 3",
  "Pluto 1", "Pluto 2", "Pluto 3", 
  "Helios 1", "Helios 2", "Helios 3",
];

function TestManager() {
  // ----- Global: Selected Testing Machine -----
  const [selectedMachine, setSelectedMachine] = useState("");

  // ----- Test Header State -----
  const [testHeaders, setTestHeaders] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  // For inline creation of new test header (if no test is selected)
  const [newTestHeader, setNewTestHeader] = useState(null);

  // ----- Sample Data State (for selected test) -----
  const [samples, setSamples] = useState([]);
  // For inline creation of a new sample row
  const [newSample, setNewSample] = useState(null);
  // For inline editing of a sample: track sample key (using sampleTime) and data
  const [editingSampleId, setEditingSampleId] = useState(null);
  const [editSampleData, setEditSampleData] = useState({});

  // When a machine is selected, reset test selection and load headers for that machine.
  useEffect(() => {
    setSelectedTest(null);
    setTestHeaders([]);
    setSamples([]);
    // Create a new inline test header form with a new random ID.
    if (selectedMachine) {
      setNewTestHeader({
        testId: uuidv4(),
        testTitle: "",
        testDate: new Date(),
        machine: selectedMachine,
      });
      fetchTestHeaders(selectedMachine);
    }
  }, [selectedMachine]);

  // Fetch test headers filtered by machine.
  const fetchTestHeaders = async (machine) => {
    try {
      const res = await axios.get(API_GET_TESTS, {
        headers: { 'Content-Type': 'application/json' },
        params: { machine },
      });
      // Sort headers by testDate ascending
      const sorted = res.data.sort((a, b) => new Date(a.testDate) - new Date(b.testDate));
      setTestHeaders(sorted);
    } catch (error) {
      console.error("Error fetching test headers", error);
    }
  };

  // Submit the new test header inline form.
  const handleTestHeaderSubmit = async () => {
    if (!newTestHeader.testTitle) {
      alert("Please enter a Test Title.");
      return;
    }
    try {
      const payload = {
        ...newTestHeader,
        testDate: newTestHeader.testDate.toISOString(),
      };
      await axios.post(API_CREATE_TEST, payload, {
        headers: { "Content-Type": "application/json" },
      });
      // Clear inline form and refresh header list.
      setNewTestHeader(null);
      fetchTestHeaders(selectedMachine);
    } catch (error) {
      console.error("Error creating test header", error);
    }
  };

  // When clicking a test header row, load that test’s samples.
  const handleTestHeaderClick = (test) => {
    setSelectedTest(test);
    fetchSamplesForTest(test.testId);
  };

  // Fetch samples for the given test header (by testId).
  const fetchSamplesForTest = async (testId) => {
    try {
      const res = await axios.get(API_GET_SAMPLES, {
        headers: { "Content-Type": "application/json" },
        params: { testId },
      });
      // Sort samples by sampleTime ascending
      const sorted = res.data.sort((a, b) => new Date(a.sampleTime) - new Date(b.sampleTime));
      setSamples(sorted);
    } catch (error) {
      console.error("Error fetching samples", error);
    }
  };

  // ----- SAMPLE INLINE FORM HANDLERS -----
  const handleAddSampleSubmit = async () => {
    if (!newSample) return;
    try {
      const payload = {
        testId: selectedTest.testId,
        sampleTime: newSample.sampleTime.toISOString(),
        current: newSample.current,
        voltage: newSample.voltage,
        temperature: newSample.temperature,
        pressure: newSample.pressure,
        flowRate: newSample.flowRate,
      };
      await axios.post(API_ADD_SAMPLE, payload, {
        headers: { "Content-Type": "application/json" },
      });
      setNewSample(null);
      fetchSamplesForTest(selectedTest.testId);
    } catch (error) {
      console.error("Error adding sample", error);
    }
  };

  const handleEditSampleSubmit = async () => {
    try {
      const payload = {
        ...editSampleData,
        sampleTime: editSampleData.sampleTime.toISOString(),
      };
      await axios.put(API_UPDATE_SAMPLE, payload, {
        headers: { "Content-Type": "application/json" },
      });
      setEditingSampleId(null);
      setEditSampleData({});
      fetchSamplesForTest(selectedTest.testId);
    } catch (error) {
      console.error("Error updating sample", error);
    }
  };

  // ----- Render Helpers -----
  // Render a test header row.
  const renderTestHeaderRow = (test) => (
    <TableRow key={test.testId} className="cursor-pointer hover:bg-gray-100" onClick={() => handleTestHeaderClick(test)}>
      <TableCell>{test.testId}</TableCell>
      <TableCell>{test.testTitle}</TableCell>
      <TableCell>{new Date(test.testDate).toLocaleString()}</TableCell>
      <TableCell>{test.machine}</TableCell>
    </TableRow>
  );

  // Render a sample row. If a sample is being edited (its sampleTime matches editingSampleId), show inline inputs.
  const renderSampleRow = (sample) => {
    if (editingSampleId === sample.sampleTime) {
      return (
        <TableRow key={`${sample.testId}-${sample.sampleTime}`} className="hover:bg-gray-100">
          <TableCell>
            <DateTimePicker
              value={editSampleData.sampleTime}
              onChange={(date) => setEditSampleData({ ...editSampleData, sampleTime: date })}
              renderInput={(params) => <TextField {...params} size="small" />}
            />
          </TableCell>
          <TableCell>
            <TextField
              value={editSampleData.current}
              onChange={(e) => setEditSampleData({ ...editSampleData, current: e.target.value })}
              size="small"
            />
          </TableCell>
          <TableCell>
            <TextField
              value={editSampleData.voltage}
              onChange={(e) => setEditSampleData({ ...editSampleData, voltage: e.target.value })}
              size="small"
            />
          </TableCell>
          <TableCell>
            <TextField
              value={editSampleData.temperature}
              onChange={(e) => setEditSampleData({ ...editSampleData, temperature: e.target.value })}
              size="small"
            />
          </TableCell>
          <TableCell>
            <TextField
              value={editSampleData.pressure}
              onChange={(e) => setEditSampleData({ ...editSampleData, pressure: e.target.value })}
              size="small"
            />
          </TableCell>
          <TableCell>
            <TextField
              value={editSampleData.flowRate}
              onChange={(e) => setEditSampleData({ ...editSampleData, flowRate: e.target.value })}
              size="small"
            />
          </TableCell>
          <TableCell>
            <Button variant="contained" color="primary" onClick={handleEditSampleSubmit} size="small">
              Save
            </Button>
          </TableCell>
        </TableRow>
      );
    } else {
      return (
        <TableRow key={`${sample.testId}-${sample.sampleTime}`} className="hover:bg-gray-100">
          <TableCell>{new Date(sample.sampleTime).toLocaleString()}</TableCell>
          <TableCell>{sample.current}</TableCell>
          <TableCell>{sample.voltage}</TableCell>
          <TableCell>{sample.temperature}</TableCell>
          <TableCell>{sample.pressure}</TableCell>
          <TableCell>{sample.flowRate}</TableCell>
          <TableCell>
            <Button variant="outlined" onClick={() => {
              setEditingSampleId(sample.sampleTime);
              setEditSampleData({ ...sample, sampleTime: new Date(sample.sampleTime) });
            }} size="small">
              Edit
            </Button>
          </TableCell>
        </TableRow>
      );
    }
  };
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="max-w-4xl mx-auto p-4">
        {/* Testing Machine Dropdown */}
        <div className="mb-4">
          <FormControl fullWidth>
            <InputLabel id="machine-select-label">Select Testing Machine</InputLabel>
            <Select
              labelId="machine-select-label"
              value={selectedMachine}
              label="Select Testing Machine"
              onChange={(e) => setSelectedMachine(e.target.value)}
            >
              {testingMachineOptions.map((machine) => (
                <MenuItem key={machine} value={machine}>
                  {machine}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        {/* If machine is selected and no test is chosen, show Test Headers with inline creation */}
        {selectedMachine && !selectedTest && (
          <div>
            <Typography variant="h5" className="mb-4">
              Test Headers for {selectedMachine}
            </Typography>
            {/* If newTestHeader exists, show inline form row */}
            {newTestHeader ? (
              <div className="border p-4 mb-4 rounded shadow">
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      label="Test ID"
                      value={newTestHeader.testId}
                      InputProps={{ readOnly: true }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      label="Test Title"
                      value={newTestHeader.testTitle}
                      onChange={(e) => setNewTestHeader({ ...newTestHeader, testTitle: e.target.value })}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <DateTimePicker
                      label="Test Date"
                      value={newTestHeader.testDate}
                      onChange={(date) => setNewTestHeader({ ...newTestHeader, testDate: date })}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3} className="flex items-center">
                    <Button variant="contained" color="primary" onClick={handleTestHeaderSubmit} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Submit
                    </Button>
                  </Grid>
                </Grid>
              </div>
            ) : (
              // Otherwise, show button to create a new test header inline (which resets newTestHeader)
              <div className="mb-4">
                <Button variant="contained" color="primary" onClick={() => setNewTestHeader({
                  testId: uuidv4(),
                  testTitle: "",
                  testDate: new Date(),
                  machine: selectedMachine,
                })} className="bg-blue-600 hover:bg-blue-700 text-white">
                  New Test Sample
                </Button>
              </div>
            )}

            {/* Display existing test headers */}
            <TableContainer component={Paper} className="shadow rounded">
              <Table>
                <TableHead className="bg-gray-200">
                  <TableRow>
                    <TableCell className="font-bold">Test ID</TableCell>
                    <TableCell className="font-bold">Test Title</TableCell>
                    <TableCell className="font-bold">Test Date</TableCell>
                    <TableCell className="font-bold">Machine</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {testHeaders
                    .sort((a, b) => new Date(a.testDate) - new Date(b.testDate))
                    .map(renderTestHeaderRow)}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}

        {/* If a test header is selected, show its samples */}
        {selectedTest && (
          <div>
            <Button variant="outlined" onClick={() => { setSelectedTest(null); setSamples([]); }} className="mb-4">
              Back to Tests
            </Button>
            <div className="p-4 border rounded shadow mb-4">
              <Typography variant="h6">
                Test: {selectedTest.testTitle} (ID: {selectedTest.testId})
              </Typography>
              <Typography variant="body2">
                Test Date: {new Date(selectedTest.testDate).toLocaleString()}
              </Typography>
              <Typography variant="body2">Machine: {selectedTest.machine}</Typography>
            </div>
            {/* Inline New Sample Form */}
            {newSample ? (
              <div className="border p-4 mb-4 rounded shadow">
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={3}>
                    <DateTimePicker
                      label="Sample Time"
                      value={newSample.sampleTime}
                      onChange={(date) => setNewSample({ ...newSample, sampleTime: date })}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      label="Current"
                      value={newSample.current}
                      onChange={(e) => setNewSample({ ...newSample, current: e.target.value })}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      label="Voltage"
                      value={newSample.voltage}
                      onChange={(e) => setNewSample({ ...newSample, voltage: e.target.value })}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      label="Temperature"
                      value={newSample.temperature}
                      onChange={(e) => setNewSample({ ...newSample, temperature: e.target.value })}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      label="Pressure"
                      value={newSample.pressure}
                      onChange={(e) => setNewSample({ ...newSample, pressure: e.target.value })}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={1}>
                    <TextField
                      label="Flow Rate"
                      value={newSample.flowRate}
                      onChange={(e) => setNewSample({ ...newSample, flowRate: e.target.value })}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={12} className="flex justify-end">
                    <Button variant="contained" color="primary" onClick={handleAddSampleSubmit} className="bg-green-600 hover:bg-green-700 text-white">
                      Save
                    </Button>
                  </Grid>
                </Grid>
              </div>
            ) : (
              <div className="mb-4">
                <Button variant="contained" color="primary" onClick={() => setNewSample({
                  sampleTime: new Date(),
                  current: "",
                  voltage: "",
                  temperature: "",
                  pressure: "",
                  flowRate: "",
                })} className="bg-green-600 hover:bg-green-700 text-white">
                  New Testing Sample
                </Button>
              </div>
            )}

            {/* Samples Table */}
            <Typography variant="h5" className="mt-6 mb-4">
              Samples for Test: {selectedTest.testTitle}
            </Typography>
            
            <TableContainer component={Paper} className="shadow rounded">
              <Table>
                <TableHead className="bg-gray-200">
                  <TableRow>
                    <TableCell className="font-bold">Sample Time</TableCell>
                    <TableCell className="font-bold">Current</TableCell>
                    <TableCell className="font-bold">Voltage</TableCell>
                    <TableCell className="font-bold">Temperature</TableCell>
                    <TableCell className="font-bold">Pressure</TableCell>
                    <TableCell className="font-bold">Flow Rate</TableCell>
                    <TableCell className="font-bold">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {samples
                    .sort((a, b) => new Date(a.sampleTime) - new Date(b.sampleTime))
                    .map(renderSampleRow)}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}
      </div>
    </LocalizationProvider>
  );
}

export default TestManager;



// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import {
//   Button,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   TextField,
//   DialogActions,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   Typography,
//   Grid,
//   MenuItem,
//   Select,
//   FormControl,
//   InputLabel,
// } from '@mui/material';
// import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// import { v4 as uuidv4 } from 'uuid';

// // Replace these URLs with your actual endpoints
// const API_CREATE_TEST = 'https://ewgjvadscl4otubtck4kp6vap40rjivf.lambda-url.us-east-1.on.aws/';
// const API_GET_TESTS = 'https://ewgjvadscl4otubtck4kp6vap40rjivf.lambda-url.us-east-1.on.aws/';
// const API_ADD_SAMPLE = 'https://pox6tnrgvttowvpdposwtyn2ly0ziuso.lambda-url.us-east-1.on.aws/';
// const API_GET_SAMPLES = 'https://pox6tnrgvttowvpdposwtyn2ly0ziuso.lambda-url.us-east-1.on.aws';
// const API_UPDATE_SAMPLE = 'https://pox6tnrgvttowvpdposwtyn2ly0ziuso.lambda-url.us-east-1.on.aws';

// // List of testing machine options
// const testingMachineOptions = [
//   "Mark 1", "Mark 2", "Mark 3",
//   "Prabha 1", "Prabha 2", "Prabha 3",
//   "Pluto 1", "Pluto 2", "Pluto 3", 
//   "Helios 1", "Helios 2", "Helios 3",
// ];

// function TestManager() {
//   // ----- Global State for Testing Machine -----
//   const [selectedMachine, setSelectedMachine] = useState("");

//   // ----- Test Header State -----
//   const [testHeaders, setTestHeaders] = useState([]);
//   const [selectedTest, setSelectedTest] = useState(null);
//   const [openCreateTest, setOpenCreateTest] = useState(false);
//   const [createTestForm, setCreateTestForm] = useState({
//     testId: '',
//     testTitle: '',
//     testDate: new Date(),
//     machine: '', // Will be filled from selectedMachine
//   });

//   // ----- Sample Data State (for selected test) -----
//   const [samples, setSamples] = useState([]);
//   const [openAddSample, setOpenAddSample] = useState(false);
//   const [sampleForm, setSampleForm] = useState({
//     // pressureLevel: '',
//     // flowRateLevel: '',
//     sampleTime: new Date(),
//     current: '',
//     voltage: '',
//     temperature: '',
//     pressure: '',
//     flowRate: '',
//   });

//   // ----- Edit Sample State -----
//   const [openEditSample, setOpenEditSample] = useState(false);
//   const [editSampleForm, setEditSampleForm] = useState(null);

// // When a machine is selected, generate a new Test ID automatically:
// useEffect(() => {
//   if (selectedMachine) {
//     setCreateTestForm(prev => ({ 
//       ...prev, 
//       machine: selectedMachine, 
//       testId: uuidv4()  // generate a new unique id automatically
//     }));
//     fetchTestHeaders(selectedMachine);
//   }
// }, [selectedMachine]);

//   // ----- When testing machine changes, reset tests and selected test -----
//   useEffect(() => {
//     setTestHeaders([]);
//     setSelectedTest(null);
//     if (selectedMachine) {
//       // Optionally, update the test header form's machine field
//       setCreateTestForm(prev => ({ ...prev, machine: selectedMachine }));
//       fetchTestHeaders(selectedMachine);
//     }
//   }, [selectedMachine]);

//   // ----- Fetch Test Headers for selected machine -----
//   const fetchTestHeaders = async (machine) => {
//     try {
//       const res = await axios.get(API_GET_TESTS, {

//         headers: { 'Content-Type': 'application/json' },
//         params: { machine },
//       });
       
//       // Sort the test headers by `testDate` in descending order
//       const sortedTests = res.data.sort((a, b) => new Date(b.testDate) - new Date(a.testDate));
//       setTestHeaders(sortedTests);
//     } catch (error) {
//       console.error('Error fetching test headers', error);
//     }
//   };
  
//   // const fetchTestHeaders = async (machine) => {
//   //   try {
//   //     const res = await axios.get(API_GET_TESTS, {
//   //       headers: { 'Content-Type': 'application/json' },
//   //       params: { machine }, // backend must filter by machine
//   //     });
//   //     setTestHeaders(res.data);
//   //   } catch (error) {
//   //     console.error('Error fetching test headers', error);
//   //   }
//   // };

//   // ----- Create New Test Header -----
//   const handleCreateTestSubmit = async () => {
//     if (!createTestForm.testId || !createTestForm.testTitle) {
//       alert('Please enter both Test ID and Test Title.');
//       return;
//     }
//     try {
//       const payload = {
//         ...createTestForm,
//         testDate: createTestForm.testDate.toISOString(),
//       };
//       await axios.post(API_CREATE_TEST, payload, {
//         headers: { 'Content-Type': 'application/json' },
//       });
//       setOpenCreateTest(false);
//       setCreateTestForm({ testId: '', testTitle: '', testDate: new Date(), machine: selectedMachine });
//       fetchTestHeaders(selectedMachine);
//     } catch (error) {
//       console.error('Error creating test header', error);
//     }
//   };

//   // ----- When a Test Header Row is Clicked -----
//   const handleTestHeaderClick = (test) => {
//     setSelectedTest(test);
//     fetchSamplesForTest(test.testId);
//   };

//   // ----- Fetch Samples for Selected Test -----
//   const fetchSamplesForTest = async (testId) => {
//     try {
//       const res = await axios.get(API_GET_SAMPLES, {
//         headers: { 'Content-Type': 'application/json' },
//         params: { testId },
//       });
  
//       // Sort the samples by `sampleTime` in descending order
//       const sortedSamples = res.data.sort((a, b) => new Date(b.sampleTime) - new Date(a.sampleTime));
//       setSamples(sortedSamples);
//     } catch (error) {
//       console.error('Error fetching samples', error);
//     }
//   };
  
//   // const fetchSamplesForTest = async (testId) => {
//   //   try {
//   //     const res = await axios.get(API_GET_SAMPLES, {
//   //       headers: { 'Content-Type': 'application/json' },
//   //       params: { testId },
//   //     });
//   //     setSamples(res.data);
//   //   } catch (error) {
//   //     console.error('Error fetching samples', error);
//   //   }
//   // };

//   // ----- Add New Sample for Selected Test -----
//   const handleAddSampleSubmit = async () => {
//     if (!selectedTest) return;
//     try {
//       const payload = {
//         testId: selectedTest.testId,
//         sampleTime: sampleForm.sampleTime.toISOString(),
//         // pressureLevel: sampleForm.pressureLevel,
//         // flowRateLevel: sampleForm.flowRateLevel,
//         current: sampleForm.current,
//         voltage: sampleForm.voltage,
//         temperature: sampleForm.temperature,
//         pressure: sampleForm.pressure,
//         flowRate: sampleForm.flowRate,
//       };
//       await axios.post(API_ADD_SAMPLE, payload, {
//         headers: { 'Content-Type': 'application/json' },
//       });
//       setOpenAddSample(false);
//       setSampleForm({
//         // pressureLevel: '',
//         // flowRateLevel: '',
//         sampleTime: new Date(),
//         current: '',
//         voltage: '',
//         temperature: '',
//         pressure: '',
//         flowRate: '',
//       });
//       fetchSamplesForTest(selectedTest.testId);
//     } catch (error) {
//       console.error('Error adding sample', error);
//     }
//   };
//   // ----- Edit Sample Handlers -----
//   const handleEditClick = (sample) => {
//     setEditSampleForm({ ...sample, sampleTime: new Date(sample.sampleTime) });
//     setOpenEditSample(true);
//   };

//   const handleEditSampleSubmit = async () => {
//     try {
//       const payload = {
//         ...editSampleForm,
//         sampleTime: editSampleForm.sampleTime.toISOString(),
//       };
//       await axios.put(API_UPDATE_SAMPLE, payload, {
//         headers: { 'Content-Type': 'application/json' },
//       });
//       setOpenEditSample(false);
//       setEditSampleForm(null);
//       fetchSamplesForTest(selectedTest.testId);
//     } catch (error) {
//       console.error('Error updating sample', error);
//     }
//   };

//   // ----- Render Helpers -----
//   const renderTestHeaderRow = (test) => (
//     <TableRow key={test.testId} className="cursor-pointer hover:bg-gray-100" onClick={() => handleTestHeaderClick(test)}>
//       <TableCell>{test.testId}</TableCell>
//       <TableCell>{test.testTitle}</TableCell>
//       <TableCell>{new Date(test.testDate).toLocaleString()}</TableCell>
//       <TableCell>{test.machine}</TableCell>
//     </TableRow>
//   );

//   const renderSampleRow = (sample) => (
//     <TableRow key={`${sample.testId}-${sample.sampleTime}`} className="hover:bg-gray-100">
// {/*
//       <TableCell>{sample.pressureLevel}</TableCell>
//       <TableCell>{sample.flowRateLevel}</TableCell>
// */}
//       <TableCell>{new Date(sample.sampleTime).toLocaleString()}</TableCell>
//       <TableCell>{sample.current}</TableCell>
//       <TableCell>{sample.voltage}</TableCell>
//       <TableCell>{sample.temperature}</TableCell>
//       <TableCell>{sample.pressure}</TableCell>
//       <TableCell>{sample.flowRate}</TableCell>
//       <TableCell>
//         <Button variant="outlined" size="small" onClick={() => handleEditClick(sample)}>
//           Edit
//         </Button>
//       </TableCell>
//     </TableRow>
//   );
//   // ----- Main Render -----
//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       <div className="max-w-4xl mx-auto p-4">
//         {/* --- Testing Machine Dropdown --- */}
//         <div className="mb-4">
//           <FormControl fullWidth>
//             <InputLabel id="machine-select-label">Select BOP</InputLabel>
//             <Select
//               labelId="machine-select-label"
//               value={selectedMachine}
//               label="Select Testing Machine"
//               onChange={(e) => setSelectedMachine(e.target.value)}
//             >
//               {testingMachineOptions.map((machine) => (
//                 <MenuItem key={machine} value={machine}>
//                   {machine}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>
//         </div>

//         {/* Only show header creation if a machine is selected */}
//         {selectedMachine && !selectedTest && (
//           <div>
//             <div className="mb-4">
//               <Button
//                 variant="contained"
//                 color="primary"
//                 onClick={() => setOpenCreateTest(true)}
//                 className="bg-blue-600 hover:bg-blue-700 text-white"
//               >
//                 New Test Sample
//               </Button>
//             </div>
//             <Dialog open={openCreateTest} onClose={() => setOpenCreateTest(false)}>
//               <DialogTitle className="bg-blue-100">Create New Test</DialogTitle>
//               <DialogContent className="bg-white">
//               <TextField
//               margin="dense"
//               label="Test ID"
//               name="testId"
//               fullWidth
//               value={createTestForm.testId}
//               InputProps={{
//                 readOnly: true,
//               }}
//               className="mb-3"
//             />
//                 <TextField
//                   margin="dense"
//                   label="Test Title"
//                   name="testTitle"
//                   fullWidth
//                   value={createTestForm.testTitle}
//                   onChange={(e) => setCreateTestForm({ ...createTestForm, testTitle: e.target.value })}
//                   className="mb-3"
//                 />
//                 <DateTimePicker
//                   label="Test Date"
//                   value={createTestForm.testDate}
//                   onChange={(date) => setCreateTestForm({ ...createTestForm, testDate: date })}
//                   fullWidth
//                   margin="dense"
//                 />
//               </DialogContent>
//               <DialogActions className="bg-blue-100">
//                 <Button onClick={() => setOpenCreateTest(false)} color="secondary" className="text-red-600">
//                   Cancel
//                 </Button>
//                 <Button onClick={handleCreateTestSubmit} color="primary" className="bg-blue-600 hover:bg-blue-700 text-white">
//                   Submit
//                 </Button>
//               </DialogActions>
//             </Dialog>
//             <Typography variant="h5" className="mt-6 mb-4">
//               Test Headers for {selectedMachine}
//             </Typography>
//             <TableContainer component={Paper} className="shadow rounded">
//               <Table>
//                 <TableHead className="bg-gray-200">
//                   <TableRow>

//                     <TableCell className="font-bold">Test ID</TableCell>
//                     <TableCell className="font-bold">Test Title</TableCell>
//                     <TableCell className="font-bold">Test Date</TableCell>
//                     <TableCell className="font-bold">Machine</TableCell>
                    
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>{testHeaders.map(renderTestHeaderRow)}</TableBody>
//               </Table>
//             </TableContainer>
//           </div>
//         )}

//         {selectedTest && (
//           // --- Test Details & Sample Management View ---
//           <div>
//             <Button variant="outlined" onClick={() => { setSelectedTest(null); setSamples([]); }} className="mb-4">
//               Back to Tests
//             </Button>
//             <div className="p-4 border rounded shadow mb-4">
//               <Typography variant="h6">
//                 Test: {selectedTest.testTitle} (ID: {selectedTest.testId})
//               </Typography>
//               <Typography variant="body2">
//                 Test Date: {new Date(selectedTest.testDate).toLocaleString()}
//               </Typography>
//               <Typography variant="body2">Machine: {selectedTest.machine}</Typography>
//             </div>
//             <div className="mb-4 mt-4">
//               <Button
//                 variant="contained"
//                 color="primary"
//                 className="bg-green-600 hover:bg-green-700 text-white"
//                 onClick={() => setOpenAddSample(true)}
//               >
//                 Add Testing Sample
//               </Button>
//             </div>
//             <Dialog open={openAddSample} onClose={() => setOpenAddSample(false)}>
//               <DialogTitle className="bg-green-100">Add Testing Sample</DialogTitle>
//               <DialogContent className="bg-white">
//               {/*
//                 <TextField
//                   margin="dense"
//                   label="Pressure Level"
//                   name="pressureLevel"
//                   fullWidth
//                   value={sampleForm.pressureLevel}
//                   onChange={(e) => setSampleForm({ ...sampleForm, pressureLevel: e.target.value })}
//                   className="mb-3"
//                 />
//                 <TextField
//                   margin="dense"
//                   label="Flow Rate Level"
//                   name="flowRateLevel"
//                   fullWidth
//                   value={sampleForm.flowRateLevel}
//                   onChange={(e) => setSampleForm({ ...sampleForm, flowRateLevel: e.target.value })}
//                   className="mb-3"
//                 />
//                 */}

//                 <DateTimePicker
//                   label="Select Sample Time"
//                   value={sampleForm.sampleTime}
//                   onChange={(date) => setSampleForm({ ...sampleForm, sampleTime: date })}
//                   fullWidth
//                   margin="dense"
//                 />
//                 <TextField
//                   margin="dense"
//                   label="Current"
//                   name="current"
//                   fullWidth
//                   value={sampleForm.current}
//                   onChange={(e) => setSampleForm({ ...sampleForm, current: e.target.value })}
//                   className="mb-3"
//                 />
//                 <TextField
//                   margin="dense"
//                   label="Voltage"
//                   name="voltage"
//                   fullWidth
//                   value={sampleForm.voltage}
//                   onChange={(e) => setSampleForm({ ...sampleForm, voltage: e.target.value })}
//                   className="mb-3"
//                 />
//                 <TextField
//                   margin="dense"
//                   label="Temperature"
//                   name="temperature"
//                   fullWidth
//                   value={sampleForm.temperature}
//                   onChange={(e) => setSampleForm({ ...sampleForm, temperature: e.target.value })}
//                   className="mb-3"
//                 />
//                 <TextField
//                   margin="dense"
//                   label="Pressure"
//                   name="pressure"
//                   fullWidth
//                   value={sampleForm.pressure}
//                   onChange={(e) => setSampleForm({ ...sampleForm, pressure: e.target.value })}
//                   className="mb-3"
//                 />
//                 <TextField
//                   margin="dense"
//                   label="Flow Rate"
//                   name="flowRate"
//                   fullWidth
//                   value={sampleForm.flowRate}
//                   onChange={(e) => setSampleForm({ ...sampleForm, flowRate: e.target.value })}
//                   className="mb-3"
//                 />
//               </DialogContent>
//               <DialogActions className="bg-green-100">
//                 <Button onClick={() => setOpenAddSample(false)} color="secondary" className="text-red-600">
//                   Cancel
//                 </Button>
//                 <Button onClick={handleAddSampleSubmit} color="primary" className="bg-green-600 hover:bg-green-700 text-white">
//                   Submit
//                 </Button>
//               </DialogActions>
//             </Dialog>
//             <Typography variant="h5" className="mt-6 mb-4">
//               Samples for Test: {selectedTest.testTitle}
//             </Typography>
//             <TableContainer component={Paper} className="shadow rounded">
//               <Table>
//                 <TableHead className="bg-gray-200">
//                   <TableRow>
//                     {/*
//                     // <TableCell className="font-bold">Pressure Level</TableCell>
//                     // <TableCell className="font-bold">Flow Rate Level</TableCell>
//                     */}
//                     <TableCell className="font-bold">Sample Time</TableCell>
//                     <TableCell className="font-bold">Current</TableCell>
//                     <TableCell className="font-bold">Voltage</TableCell>
//                     <TableCell className="font-bold">Temperature</TableCell>
//                     <TableCell className="font-bold">Pressure</TableCell>
//                     <TableCell className="font-bold">Flow Rate</TableCell>
//                     <TableCell className="font-bold">Actions</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>{samples.map(renderSampleRow)}</TableBody>
//               </Table>
//             </TableContainer>
//           </div>
//         )}

//         {openEditSample && editSampleForm && (
//           <Dialog open={openEditSample} onClose={() => setOpenEditSample(false)}>
//             <DialogTitle className="bg-blue-100">Edit Sample</DialogTitle>
//             <DialogContent className="bg-white">
//             {/*
//               <TextField
//                 margin="dense"
//                 label="Pressure Level"
//                 name="pressureLevel"
//                 fullWidth
//                 value={editSampleForm.pressureLevel}
//                 onChange={(e) => setEditSampleForm({ ...editSampleForm, pressureLevel: e.target.value })}
//                 className="mb-3"
//               />
//               <TextField
//                 margin="dense"
//                 label="Flow Rate Level"
//                 name="flowRateLevel"
//                 fullWidth
//                 value={editSampleForm.flowRateLevel}
//                 onChange={(e) => setEditSampleForm({ ...editSampleForm, flowRateLevel: e.target.value })}
//                 className="mb-3"
//               />
//               */}
//               <DateTimePicker
//                 label="Sample Time"
//                 value={editSampleForm.sampleTime}
//                 onChange={(date) => setEditSampleForm({ ...editSampleForm, sampleTime: date })}
//                 fullWidth
//                 margin="dense"
//               />
//               <TextField
//                 margin="dense"
//                 label="Current"
//                 name="current"
//                 fullWidth
//                 value={editSampleForm.current}
//                 onChange={(e) => setEditSampleForm({ ...editSampleForm, current: e.target.value })}
//                 className="mb-3"
//               />
//               <TextField
//                 margin="dense"
//                 label="Voltage"
//                 name="voltage"
//                 fullWidth
//                 value={editSampleForm.voltage}
//                 onChange={(e) => setEditSampleForm({ ...editSampleForm, voltage: e.target.value })}
//                 className="mb-3"
//               />
//               <TextField
//                 margin="dense"
//                 label="Temperature"
//                 name="temperature"
//                 fullWidth
//                 value={editSampleForm.temperature}
//                 onChange={(e) => setEditSampleForm({ ...editSampleForm, temperature: e.target.value })}
//                 className="mb-3"
//               />
//               <TextField
//                 margin="dense"
//                 label="Pressure"
//                 name="pressure"
//                 fullWidth
//                 value={editSampleForm.pressure}
//                 onChange={(e) => setEditSampleForm({ ...editSampleForm, pressure: e.target.value })}
//                 className="mb-3"
//               />
//               <TextField
//                 margin="dense"
//                 label="Flow Rate"
//                 name="flowRate"
//                 fullWidth
//                 value={editSampleForm.flowRate}
//                 onChange={(e) => setEditSampleForm({ ...editSampleForm, flowRate: e.target.value })}
//                 className="mb-3"
//               />
//             </DialogContent>
//             <DialogActions className="bg-blue-100">
//               <Button onClick={() => setOpenEditSample(false)} color="secondary" className="text-red-600">
//                 Cancel
//               </Button>
//               <Button onClick={handleEditSampleSubmit} color="primary" className="bg-blue-600 hover:bg-blue-700 text-white">
//                 Update Sample
//               </Button>
//             </DialogActions>
//           </Dialog>
//         )}
//       </div>
//     </LocalizationProvider>
//   );
// }

// export default TestManager;