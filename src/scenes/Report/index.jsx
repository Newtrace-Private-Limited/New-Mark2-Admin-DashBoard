import React from 'react'

const index = () => {
  return (
    <div>
      report
    </div>
  )
}

export default index


// import React, { useState } from 'react';
// import {
//     Select,
//     MenuItem,
//     FormControl,
//     InputLabel,
//     Button,
//     Box,
//     TextField,
//     Grid,
//     Typography,
// } from '@mui/material';
// import { DataGrid, GridToolbar } from '@mui/x-data-grid';
// import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import Header from 'src/component/Header';

// function IoTDataViewer() {
//     const [startTime, setStartTime] = useState(null);
//     const [endTime, setEndTime] = useState(null);
//     const [allData, setAllData] = useState([]);
//     const [data, setData] = useState([]);
//     const [error, setError] = useState('');
//     const [selectedTestName, setSelectedTestName] = useState(null);
//     const [isFetching, setIsFetching] = useState(false);
//     const [totalizerFlow, setTotalizerFlow] = useState(null);

//     const fetchData = async () => {
//         setIsFetching(true);
//         try {
//             const convertToIST = (date) => {
//                 const offsetInMilliseconds = 5.5 * 60 * 60 * 1000;
//                 return new Date(date.getTime() + offsetInMilliseconds).toISOString().slice(0, 19);
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
//                 }),
//             });

//             const rawResult = await response.json();
//             const result = rawResult.body ? JSON.parse(rawResult.body) : rawResult;

//             if (response.ok) {
//                 const processedData = (result.data || []).map((row, index) => ({
//                     id: index,
//                     timestamp: row.timestamp || row.time_bucket,
//                     ist_timestamp: row.ist_timestamp || row.time_bucket,
//                     Test_Name: row.device_data?.["Test-Name"] || row["test_name"],
                    
//                     AX_LT_011: row.device_data?.["AX-LT-011"] !== undefined && row.device_data?.["AX-LT-011"] !== null
//                     ? row.device_data?.["AX-LT-011"]
//                     : row["avg_ax_lt_011"] || 0,

//                     AX_LT_021: row.device_data?.["AX-LT-021"] || row["avg_ax_lt_021"],
//                     AX_VA_311: row.device_data?.["AX-VA-311"] !== undefined && row.device_data?.["AX-VA-311"] !== null
//   ? row.device_data?.["AX-VA-311"]
//   : row["ax_va_311"] || 0,
//   AX_VA_312: row.device_data?.["AX-VA-312"] !== undefined && row.device_data?.["AX-VA-312"] !== null
//   ? row.device_data?.["AX-VA-312"]
//   : row["ax_va_312"] || 0,
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
// GS_AT_011: row.device_data?.["GS-AT-011"] || row["gs_at_011"],
// GS_AT_012: row.device_data?.["GS-AT-012"] || row["gs_at_012"],
// GS_AT_022: row.device_data?.["GS-AT-022"] || row["gs_at_022"],
// GS_PT_011: row.device_data?.["GS-PT-011"] || row["gs_pt_011"],
// GS_PT_021: row.device_data?.["GS-PT-021"] || row["gs_pt_021"],
// GS_TT_011: row.device_data?.["GS-TT-011"] || row["gs_tt_011"],
// GS_TT_021: row.device_data?.["GS-TT-021"] || row["gs_tt_021"],
// GS_VA_311: row.device_data?.["GS-VA-311"] || row["gs_va_311"],
// GS_VA_312: row.device_data?.["GS-VA-312"] || row["gs_va_312"],
// GS_VA_321: row.device_data?.["GS-VA-321"] || row["gs_va_321"],
// GS_VA_322: row.device_data?.["GS-VA-322"] || row["gs_va_322"],
// PR_AT_001: row.device_data?.["PR-AT-001"] || row["pr_at_001"],
// PR_AT_003: row.device_data?.["PR-AT-003"] || row["pr_at_003"],
// PR_AT_005: row.device_data?.["PR-AT-005"] || row["pr_at_005"],
// PR_FT_001: row.device_data?.["PR-FT-001"] || row["pr_ft_001"],
// PR_TT_001: row.device_data?.["PR-TT-001"] || row["pr_tt_001"],
// PR_TT_061: row.device_data?.["PR-TT-061"] || row["pr_tt_061"],
// PR_TT_072: row.device_data?.["PR-TT-072"] || row["pr_tt_072"],
// PR_VA_352: row.device_data?.["PR-VA-352"] || row["pr_va_352"],
// AX_VA_321: row.device_data?.["AX-VA-321"] !== undefined && row.device_data?.["AX-VA-321"] !== null
// ? row.device_data?.["AX-VA-321"]
// : row["ax_va_321"] || 0,
// AX_VA_322: row.device_data?.["AX-VA-322"] !== undefined && row.device_data?.["AX-VA-322"] !== null
// ? row.device_data?.["AX-VA-322"]
// : row["ax_va_322"] || 0,
// AX_VA_351: row.device_data?.["AX-VA-351"] !== undefined && row.device_data?.["AX-VA-351"] !== null
// ? row.device_data?.["AX-VA-351"]
// : row["ax_va_351"] || 0,
// AX_VA_391: row.device_data?.["AX-VA-391"] !== undefined && row.device_data?.["AX-VA-391"] !== null
// ? row.device_data?.["AX-VA-391"]
// : row["ax_va_391"] || 0,
// DM_VA_301: row.device_data?.["DM-VA-301"] !== undefined && row.device_data?.["DM-VA-301"] !== null
// ? row.device_data?.["DM-VA-301"]
// : row["dm_va_301"] || 0,
// GS_VA_021: row.device_data?.["GS-VA-021"] !== undefined && row.device_data?.["GS-VA-021"] !== null
// ? row.device_data?.["GS-VA-021"]
// : row["gs_va_021"] || 0,
// GS_VA_022: row.device_data?.["GS-VA-022"] !== undefined && row.device_data?.["GS-VA-022"] !== null
// ? row.device_data?.["GS-VA-022"]
// : row["gs_va_022"] || 0,
// N2_VA_311: row.device_data?.["N2-VA-311"] !== undefined && row.device_data?.["N2-VA-311"] !== null
// ? row.device_data?.["N2-VA-311"]
// : row["n2_va_311"] || 0,
// N2_VA_321: row.device_data?.["N2-VA-321"] !== undefined && row.device_data?.["N2-VA-321"] !== null
// ? row.device_data?.["N2-VA-321"]
// : row["n2_va_321"] || 0,
// PR_VA_301: row.device_data?.["PR-VA-301"] !== undefined && row.device_data?.["PR-VA-301"] !== null
// ? row.device_data?.["PR-VA-301"]
// : row["pr_va_301"] || 0,
// PR_VA_312: row.device_data?.["PR-VA-312"] !== undefined && row.device_data?.["PR-VA-312"] !== null
// ? row.device_data?.["PR-VA-312"]
// : row["pr_va_312"] || 0,
// PR_VA_351: row.device_data?.["PR-VA-351"] !== undefined && row.device_data?.["PR-VA-351"] !== null
// ? row.device_data?.["PR-VA-351"]
// : row["pr_va_351"] || 0,
// PR_VA_361Ain: row.device_data?.["PR-VA-361Ain"] !== undefined && row.device_data?.["PR-VA-361Ain"] !== null
// ? row.device_data?.["PR-VA-361Ain"]
// : row["pr_va_361ain"] || 0,
// PR_VA_361Bin: row.device_data?.["PR-VA-361Bin"] !== undefined && row.device_data?.["PR-VA-361Bin"] !== null
// ? row.device_data?.["PR-VA-361Bin"]
// : row["pr_va_361bin"] || 0,
// PR_VA_362Ain: row.device_data?.["PR-VA-362Ain"] !== undefined && row.device_data?.["PR-VA-362Ain"] !== null
// ? row.device_data?.["PR-VA-362Ain"]
// : row["pr_va_362ain"] || 0,
// PR_VA_362Bin: row.device_data?.["PR-VA-362Bin"] !== undefined && row.device_data?.["PR-VA-362Bin"] !== null
// ? row.device_data?.["PR-VA-362Bin"]
// : row["pr_va_362bin"] || 0,
// PR_VA_361Aout: row.device_data?.["PR-VA-361Aout"] !== undefined && row.device_data?.["PR-VA-361Aout"] !== null
// ? row.device_data?.["PR-VA-361Aout"]
// : row["pr_va_361aout"] || 0,
// PR_VA_361Bout: row.device_data?.["PR-VA-361Bout"] !== undefined && row.device_data?.["PR-VA-361Bout"] !== null
// ? row.device_data?.["PR-VA-361Bout"]
// : row["pr_va_361bout"] || 0,
// PR_VA_362Aout: row.device_data?.["PR-VA-362Aout"] !== undefined && row.device_data?.["PR-VA-362Aout"] !== null
// ? row.device_data?.["PR-VA-362Aout"]
// : row["pr_va_362aout"] || 0,
// PR_VA_362Bout: row.device_data?.["PR-VA-362Bout"] !== undefined && row.device_data?.["PR-VA-362Bout"] !== null
// ? row.device_data?.["PR-VA-362Bout"]
// : row["pr_va_362bout"] || 0,
// RECT_CT_001: row.device_data?.["RECT-CT-001"] !== undefined && row.device_data?.["RECT-CT-001"] !== null
// ? row.device_data?.["RECT-CT-001"]
// : row["rect_ct_001"] || 0,
// RECT_VT_001: row.device_data?.["RECT-VT-001"] !== undefined && row.device_data?.["RECT-VT-001"] !== null
// ? row.device_data?.["RECT-VT-001"]
// : row["rect_vt_001"] || 0,
// DCDB0_CT_001: row.device_data?.["DCDB0-CT-001"] !== undefined && row.device_data?.["DCDB0-CT-001"] !== null
// ? row.device_data?.["DCDB0-CT-001"]
// : row["dcdb0_ct_001"] || 0,
// DCDB0_VT_001: row.device_data?.["DCDB0-VT-001"] !== undefined && row.device_data?.["DCDB0-VT-001"] !== null
// ? row.device_data?.["DCDB0-VT-001"]
// : row["dcdb0_vt_001"] || 0,
// DCDB1_CT_001: row.device_data?.["DCDB1-CT-001"] !== undefined && row.device_data?.["DCDB1-CT-001"] !== null
// ? row.device_data?.["DCDB1-CT-001"]
// : row["dcdb1_ct_001"] || 0,
// DCDB1_VT_001: row.device_data?.["DCDB1-VT-001"] !== undefined && row.device_data?.["DCDB1-VT-001"] !== null
// ? row.device_data?.["DCDB1-VT-001"]
// : row["dcdb1_vt_001"] || 0,
// DCDB2_CT_001: row.device_data?.["DCDB2-CT-001"] !== undefined && row.device_data?.["DCDB2-CT-001"] !== null
// ? row.device_data?.["DCDB2-CT-001"]
// : row["dcdb2_ct_001"] || 0,
// DCDB2_VT_001: row.device_data?.["DCDB2-VT-001"] !== undefined && row.device_data?.["DCDB2-VT-001"] !== null
// ? row.device_data?.["DCDB2-VT-001"]
// : row["dcdb2_vt_001"] || 0,
// DCDB3_CT_001: row.device_data?.["DCDB3-CT-001"] !== undefined && row.device_data?.["DCDB3-CT-001"] !== null
// ? row.device_data?.["DCDB3-CT-001"]
// : row["dcdb3_ct_001"] || 0,
// DCDB3_VT_001: row.device_data?.["DCDB3-VT-001"] !== undefined && row.device_data?.["DCDB3-VT-001"] !== null
// ? row.device_data?.["DCDB3-VT-001"]
// : row["dcdb3_vt_001"] || 0,
// DCDB4_CT_001: row.device_data?.["DCDB4-CT-001"] !== undefined && row.device_data?.["DCDB4-CT-001"] !== null
// ? row.device_data?.["DCDB4-CT-001"]
// : row["dcdb4_ct_001"] || 0,
// DCDB4_VT_001: row.device_data?.["DCDB4-VT-001"] !== undefined && row.device_data?.["DCDB4-VT-001"] !== null
// ? row.device_data?.["DCDB4-VT-001"]
// : row["dcdb4_vt_001"] || 0,
// PLC_TIME_STAMP: row.device_data?.["PLC-TIME-STAMP"] !== undefined && row.device_data?.["PLC-TIME-STAMP"] !== null
// ? row.device_data?.["PLC-TIME-STAMP"]
// : row["plc_time_stamp"] || 0,
// Test_Description: row.device_data?.["Test-description"] !== undefined && row.device_data?.["Test-description"] !== null
// ? row.device_data?.["Test-description"]
// : row["test_description"] || 0,
// Test_Remarks: row.device_data?.["Test-Remarks"] !== undefined && row.device_data?.["Test-Remarks"] !== null
// ? row.device_data?.["Test-Remarks"]
// : row["test_remarks"] || 0,
// DM_LSH_001: row.device_data?.["DM-LSH-001"] !== undefined && row.device_data?.["DM-LSH-001"] !== null
//   ? row.device_data?.["DM-LSH-001"]
//   : row["dm_lsh_001"] !== undefined && row["dm_lsh_001"] !== null
//   ? row["dm_lsh_001"]
//   : false,

// DM_LSL_001: row.device_data?.["DM-LSL-001"] !== undefined && row.device_data?.["DM-LSL-001"] !== null
// ? row.device_data?.["DM-LSL-001"]
// : row["dm_lsl_001"] || 0,
// GS_LSL_011: row.device_data?.["GS-LSL-011"] !== undefined && row.device_data?.["GS-LSL-011"] !== null
// ? row.device_data?.["GS-LSL-011"]
// : row["gs_lsl_011"] || 0,
// GS_LSL_021: row.device_data?.["GS-LSL-021"] !== undefined && row.device_data?.["GS-LSL-021"] !== null
// ? row.device_data?.["GS-LSL-021"]
// : row["gs_lsl_021"] || 0 ,
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
//             setIsFetching(false);
//         }
//     };
//     const filteredRows = selectedTestName
//     ? allData.filter((row) => row.Test_Name === selectedTestName)
//     : [];

//     const handleTestNameChange = (event) => {
//         setSelectedTestName(event.target.value);
//         setTotalizerFlow(null); // Reset totalizer flow when test changes
//     };

//     const calculateTotalizerFlow = () => {
//         const filteredRows = allData.filter((row) => row.Test_Name === selectedTestName);

//         if (filteredRows.length === 0) {
//             setTotalizerFlow(null);
//             return;
//         }

//         // Filter out invalid and negative values
//         const validRows = filteredRows.filter((row) => row.CR_FT_001 && row.CR_FT_001 > 0);

//         if (validRows.length < 2) {
//             // If less than 2 valid rows, we cannot calculate a meaningful totalizer flow
//             setTotalizerFlow(0);
//             return;
//         }

//         // Calculate the totalizer flow dynamically
//         let totalFlow = 0;
//         for (let i = 0; i < validRows.length - 1; i++) {
//             const currentRow = validRows[i];
//             const nextRow = validRows[i + 1];

//             const currentTimestamp = new Date(currentRow.timestamp).getTime();
//             const nextTimestamp = new Date(nextRow.timestamp).getTime();

//             const durationInSeconds = (nextTimestamp - currentTimestamp) / 1000;

//             // Add flow contribution for the time duration between two rows
//             if (durationInSeconds > 0) {
//                 totalFlow += currentRow.CR_FT_001 * durationInSeconds;
//             }
//         }
//         // Calculate the total test duration in seconds
//         const startTimestamp = new Date(validRows[0].timestamp).getTime();
//         const endTimestamp = new Date(validRows[validRows.length - 1].timestamp).getTime();
//         const totalDurationInSeconds = (endTimestamp - startTimestamp) / 1000;

//         // Avoid division by zero
//         const totalizer = totalDurationInSeconds > 0 ? totalFlow / totalDurationInSeconds : 0;

//         setTotalizerFlow(totalizer); // Set the totalizer flow value
//     };

//     const columns = [
//         { field: 'ist_timestamp', headerName: 'IST Timestamp', width: 205 },
//         { field: 'Test_Name', headerName: 'Test Name', width: 170 },
//         {
//             field: "AX_LT_011", headerName: "AX-LT-011", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "AX_LT_021", headerName: "AX-LT-021", width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(4) },
          
//           {
//             field: "CW_TT_011", headerName: "CW-TT-011", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "CW_TT_021", headerName: "CW-TT-021", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "CR_LT_011", headerName: "CR-LT-011", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "CR_PT_011", headerName: "CR-PT-011", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "CR_LT_021", headerName: "CR-LT-021", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "CR_PT_021", headerName: "CR-PT-021", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "CR_PT_001", headerName: "CR-PT-001", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "CR_TT_001", headerName: "CR-TT-001", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "CR_FT_001", headerName: "CR-FT-001", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "CR_TT_002", headerName: "CR-TT-002", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "GS_AT_011", headerName: "GS-AT-011", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "GS_AT_012", headerName: "GS-AT-012", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "GS_PT_011", headerName: "GS-PT-011", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "GS_TT_011", headerName: "GS-TT-011", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "GS_AT_022", headerName: "GS-AT-022", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "GS_PT_021", headerName: "GS-PT-021", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "GS_TT_021", headerName: "GS-TT-021", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "PR_TT_001", headerName: "PR-TT-001", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "PR_TT_061", headerName: "PR-TT-061", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "PR_TT_072", headerName: "PR-TT-072", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "PR_FT_001", headerName: "PR-FT-001", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "PR_AT_001", headerName: "PR-AT-001", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "PR_AT_003", headerName: "PR-AT-003", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "PR_AT_005", headerName: "PR-AT-005", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "DM_LSH_001", headerName: "DM-LSH-001", width: 70, valueFormatter: (params) => String(params.value) },
//           {
//             field: "DM_LSL_001", headerName: "DM-LSL-001", width: 70, valueFormatter: (params) => String(params.value) },
//           {
//             field: "GS_LSL_021", headerName: "GS-LSL-021", width: 70, valueFormatter: (params) => String(params.value) },
//           {
//             field: "GS_LSL_011", headerName: "GS-LSL-011", width: 70, valueFormatter: (params) => String(params.value) },
//           {
//             field: "PR_VA_301", headerName: "PR-VA-301", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "PR_VA_352", headerName: "PR-VA-352", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "PR_VA_312", headerName: "PR-VA-312", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "PR_VA_351", headerName: "PR-VA-351", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "PR_VA_361Ain", headerName: "PR-VA-361Ain", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "PR_VA_361Aout", headerName: "PR-VA-361Aout", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "PR_VA_361Bin", headerName: "PR-VA-361Bin", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "PR_VA_361Bout", headerName: "PR-VA-361Bout", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "PR_VA_362Ain", headerName: "PR-VA-362Ain", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "PR_VA_362Aout", headerName: "PR-VA-362Aout", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "PR_VA_362Bin", headerName: "PR-VA-362Bin", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "PR_VA_362Bout", headerName: "PR-VA-362Bout", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "N2_VA_311", headerName: "N2-VA-311", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "GS_VA_311", headerName: "GS-VA-311", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "GS_VA_312", headerName: "GS-VA-312", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "N2_VA_321", headerName: "N2-VA-321", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "GS_VA_321", headerName: "GS-VA-321", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "GS_VA_322", headerName: "GS-VA-322", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "GS_VA_022", headerName: "GS-VA-022", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "GS_VA_021", headerName: "GS-VA-021", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "AX_VA_351", headerName: "AX-VA-351", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "AX_VA_311", headerName: "AX-VA-311", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "AX_VA_312", headerName: "AX-VA-312", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "AX_VA_321", headerName: "AX-VA-321", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "AX_VA_322", headerName: "AX-VA-322", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "AX_VA_391", headerName: "AX-VA-391", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "DM_VA_301", headerName: "DM-VA-301", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "DCDB0_VT_001", headerName: "DCDB0-VT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "DCDB0_CT_001", headerName: "DCDB0-CT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "DCDB1_VT_001", headerName: "DCDB1-VT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "DCDB1_CT_001", headerName: "DCDB1-CT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "DCDB2_VT_001", headerName: "DCDB2-VT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "DCDB2_CT_001", headerName: "DCDB2-CT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "DCDB3_VT_001", headerName: "DCDB3-VT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "DCDB3_CT_001", headerName: "DCDB3-CT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "DCDB4_VT_001", headerName: "DCDB4-VT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "DCDB4_CT_001", headerName: "DCDB4-CT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "RECT_CT_001", headerName: "RECT-CT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "RECT_VT_001", headerName: "RECT-VT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           { 
//             field: "PLC_TIME_STAMP", headerName: "PLC-TIME-STAMP", width: 180, valueFormatter: (params) => params.value },
//           {
//             field: "Test_Remarks", headerName: "Test-Remarks", width: 150, valueFormatter: (params) => params.value },
//           {
//             field: "Test_Description", headerName: "Test-description", width: 150, valueFormatter: (params) => params.value }
//               ];

//     return (
//       <Box m="15px" mt="-60px">
//             <Header
//                 title="Report Analytics"
//                 subtitle="Fetch Report using Start Date-time and End Date-time"
//             />
//             <div>
//                 <LocalizationProvider dateAdapter={AdapterDateFns}>
//                     <Grid container spacing={2} alignItems="center">
//                         <Grid item xs={3}>
//                             <DateTimePicker
//                                 label="Start Date Time"
//                                 value={startTime}
//                                 onChange={(newValue) => setStartTime(newValue)}
//                                 renderInput={(params) => <TextField {...params} fullWidth />}
//                             />
//                         </Grid>
//                         <Grid item xs={3}>
//                             <DateTimePicker
//                                 label="End Date Time"
//                                 value={endTime}
//                                 onChange={(newValue) => setEndTime(newValue)}
//                                 renderInput={(params) => <TextField {...params} fullWidth />}
//                             />
//                         </Grid>
//                         <Grid item xs={2}>
//                             <Button
//                                 variant="contained"
//                                 color="secondary"
//                                 onClick={fetchData}
//                                 disabled={!startTime || !endTime || isFetching}
//                             >
//                                 {isFetching ? "Fetching..." : "Fetch Data"}
//                             </Button>
//                         </Grid>
//                     </Grid>
//                 </LocalizationProvider>
//                 {error && <p style={{ color: 'red' }}>{error}</p>}
//                 {!isFetching && data.length > 0 && (
//                     <Box sx={{ mt: 4, mb: 4, width: '300px' }}>
//                         <FormControl fullWidth>
//                             <InputLabel id="test-name-select-label">Select Test-Name</InputLabel>
//                             <Select
//                                 labelId="test-name-select-label"
//                                 value={selectedTestName || ''}
//                                 onChange={handleTestNameChange}
//                             >
//                                 {data.map((row) => (
//                                     <MenuItem key={row.id} value={row.Test_Name}>
//                                         {row.Test_Name}
//                                     </MenuItem>
//                                 ))}
//                             </Select>
//                         </FormControl>
//                         <Button
//                             variant="contained"
//                             color="primary"
//                             onClick={calculateTotalizerFlow}
//                             sx={{ mt: 2 }}
//                             disabled={!selectedTestName}
//                         >
//                             Calculate Totalizer Flow
//                         </Button>
//                     </Box>
//                 )}
//                 {isFetching ? (
//                     <Typography variant="h5" color="secondary">Data fetching....</Typography>
//                 ) : selectedTestName && filteredRows.length > 0 ? (
//                     <Box sx={{ height: 600, width: '100%' }}>
//                     {totalizerFlow !== null && (
//                         <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
//                             Totalizer Flow for "{selectedTestName}": {totalizerFlow.toFixed(2)} Liters/Second
//                         </Typography>
//                     )}
//                         <h2>Details for Test-Name: {selectedTestName}</h2>
                        
//                         <DataGrid
//                             rows={filteredRows}
//                             columns={columns}
//                             components={{ Toolbar: GridToolbar }}
//                             getRowId={(row) => row.id}
//                             componentsProps={{
//                               toolbar:{
//                                 sx: {
//                                   "& .MuiButton-root": {
//                                     color: "rgb(34 197 94)",
//                                   },
//                                 },
//                               },
//                             }}
//                         />
                       
//                     </Box>
//                 ) : (
//                     <Typography variant="h6" color="textSecondary"></Typography>
//                 )}
//             </div>
//         </Box>
//     );
// }

// export default IoTDataViewer;


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




// import React, { useState, useEffect } from 'react';
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
//   Grid
// } from '@mui/material';
// import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import axios from 'axios';
// import { v4 as uuidv4 } from 'uuid';

// const API_URL_POST = 'https://ewgjvadscl4otubtck4kp6vap40rjivf.lambda-url.us-east-1.on.aws/';
// const API_URL_GET = 'https://pox6tnrgvttowvpdposwtyn2ly0ziuso.lambda-url.us-east-1.on.aws/';
// const API_URL_FILTER = 'https://vijvcoa2nctmdiuh6tgohbpmc40glxoh.lambda-url.us-east-1.on.aws/';

// function TestingDataPage() {
 
//   const [open, setOpen] = useState(false);
//   const [testingData, setTestingData] = useState({
//     id: uuidv4(),
//     title: '',
//     dateTime: new Date(),
//     current: '',
//     voltage: '',
//     temperature: '',
//     pressure: '',
//     flowRate: '',
//   });

//   const [latestData, setLatestData] = useState([]);

//   const [startFilter, setStartFilter] = useState(new Date());
//   const [endFilter, setEndFilter] = useState(new Date());
//   const [filteredData, setFilteredData] = useState([]);

//   const handleChange = (e) => {
//     setTestingData({ ...testingData, [e.target.name]: e.target.value });
//   };

//   const handleDateChange = (date) => {
//     setTestingData({ ...testingData, dateTime: date });
//   };

//   const fetchLatestData = async () => {
//     try {
//       const response = await axios.get(API_URL_GET, {
//         headers: { 'Content-Type': 'application/json' }
//       });
//       setLatestData(response.data);
//     } catch (error) {
//       console.error('Error fetching latest data', error);
//     }
//   };

//   const fetchFilteredData = async () => {
//     try {
//       const start = startFilter.toISOString();
//       const end = endFilter.toISOString();
//       const response = await axios.get(API_URL_FILTER, {
//         headers: { 'Content-Type': 'application/json' },
//         params: { start, end }
//       });
//       setFilteredData(response.data);
//     } catch (error) {
//       console.error('Error fetching filtered data', error);
//     }
//   };

//   useEffect(() => {
//     fetchLatestData();
//   }, []);

//   const handleSubmit = async () => {
//     try {
//       await axios.post(API_URL_POST, testingData, {
//         headers: { 'Content-Type': 'application/json' }
//       });
//       setOpen(false);
   
//       setTestingData({
//         id: uuidv4(),
//         title: '',
//         dateTime: new Date(),
//         current: '',
//         voltage: '',
//         temperature: '',
//         pressure: '',
//         flowRate: '',
//       });

//       fetchLatestData();
//     } catch (error) {
//       console.error('Error adding data', error);
//     }
//   };


//   const renderRow = (item) => (
//     <TableRow key={item.id} className="hover:bg-gray-100">
//       <TableCell>{item.id}</TableCell>
//       <TableCell>{item.title}</TableCell>
//       <TableCell>{new Date(item.dateTime).toLocaleString()}</TableCell>
//       <TableCell>{item.current}</TableCell>
//       <TableCell>{item.voltage}</TableCell>
//       <TableCell>{item.temperature}</TableCell>
//       <TableCell>{item.pressure}</TableCell>
//       <TableCell>{item.flowRate}</TableCell>
//     </TableRow>
//   );

//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       <div className="max-w-4xl mx-auto">
   
//         <div className="mb-4">
//           <Button
//             variant="contained"
//             color="primary"
//             onClick={() => setOpen(true)}
//             className="bg-blue-600 hover:bg-blue-700 text-white"
//           >
//             Add Testing Data
//           </Button>
//         </div>
      
//         <Dialog open={open} onClose={() => setOpen(false)}>
//           <DialogTitle className="bg-blue-100">Add Testing Data</DialogTitle>
//           <DialogContent className="bg-white">
//             <TextField
//               margin="dense"
//               label="Testing Title"
//               name="title"
//               fullWidth
//               value={testingData.title}
//               onChange={handleChange}
//               className="mb-3"
//             />
//             <DateTimePicker
//               label="Select Date & Time"
//               value={testingData.dateTime}
//               onChange={handleDateChange}
//               fullWidth
//               margin="dense"
//             />
//             <TextField
//               margin="dense"
//               label="Current"
//               name="current"
//               fullWidth
//               value={testingData.current}
//               onChange={handleChange}
//               className="mb-3"
//             />
//             <TextField
//               margin="dense"
//               label="Voltage"
//               name="voltage"
//               fullWidth
//               value={testingData.voltage}
//               onChange={handleChange}
//               className="mb-3"
//             />
//             <TextField
//               margin="dense"
//               label="Temperature"
//               name="temperature"
//               fullWidth
//               value={testingData.temperature}
//               onChange={handleChange}
//               className="mb-3"
//             />
//             <TextField
//               margin="dense"
//               label="Pressure"
//               name="pressure"
//               fullWidth
//               value={testingData.pressure}
//               onChange={handleChange}
//               className="mb-3"
//             />
//             <TextField
//               margin="dense"
//               label="Flow Rate"
//               name="flowRate"
//               fullWidth
//               value={testingData.flowRate}
//               onChange={handleChange}
//               className="mb-3"
//             />
//           </DialogContent>
//           <DialogActions className="bg-blue-100">
//             <Button onClick={() => setOpen(false)} color="secondary" className="text-red-600">
//               Cancel
//             </Button>
//             <Button onClick={handleSubmit} color="primary" className="bg-blue-600 hover:bg-blue-700 text-white">
//               Submit
//             </Button>
//           </DialogActions>
//         </Dialog>

//         <Typography variant="h5" gutterBottom className="mt-6">
//           Latest  Testing Data Records
//         </Typography>
//         <TableContainer component={Paper} className="shadow rounded mt-4">
//           <Table>
//             <TableHead className="bg-gray-200">
//               <TableRow>
//                 <TableCell className="font-bold">ID</TableCell>
//                 <TableCell className="font-bold">Title</TableCell>
//                 <TableCell className="font-bold">Date & Time</TableCell>
//                 <TableCell className="font-bold">Current</TableCell>
//                 <TableCell className="font-bold">Voltage</TableCell>
//                 <TableCell className="font-bold">Temperature</TableCell>
//                 <TableCell className="font-bold">Pressure</TableCell>
//                 <TableCell className="font-bold">Flow Rate</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {latestData.map((item) => renderRow(item))}
//             </TableBody>
//           </Table>
//         </TableContainer>    
//       </div>
//     </LocalizationProvider>
//   );
// }

// export default TestingDataPage;




// import React, { useState } from 'react';
// import {
//     Select,
//     MenuItem,
//     FormControl,
//     InputLabel,
//     Button,
//     Box,
//     TextField,
//     Grid,
//     Typography,
// } from '@mui/material';
// import { DataGrid, GridToolbar } from '@mui/x-data-grid';
// import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import Header from 'src/component/Header';

// function IoTDataViewer() {
//     const [startTime, setStartTime] = useState(null);
//     const [endTime, setEndTime] = useState(null);
//     const [allData, setAllData] = useState([]);
//     const [data, setData] = useState([]);
//     const [error, setError] = useState('');
//     const [selectedTestName, setSelectedTestName] = useState(null);
//     const [isFetching, setIsFetching] = useState(false);
//     const [totalizerFlow, setTotalizerFlow] = useState(null);

//     const fetchData = async () => {
//         setIsFetching(true);
//         try {
//             const convertToIST = (date) => {
//                 const offsetInMilliseconds = 5.5 * 60 * 60 * 1000;
//                 return new Date(date.getTime() + offsetInMilliseconds).toISOString().slice(0, 19);
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
//                 }),
//             });

//             const rawResult = await response.json();
//             const result = rawResult.body ? JSON.parse(rawResult.body) : rawResult;

//             if (response.ok) {
//                 const processedData = (result.data || []).map((row, index) => ({
//                     id: index,
//                     timestamp: row.timestamp || row.time_bucket,
//                     ist_timestamp: row.ist_timestamp || row.time_bucket,
//                     Test_Name: row.device_data?.["Test-Name"] || row["test_name"],
                    
//                     AX_LT_011: row.device_data?.["AX-LT-011"] !== undefined && row.device_data?.["AX-LT-011"] !== null
//                     ? row.device_data?.["AX-LT-011"]
//                     : row["avg_ax_lt_011"] || 0,

//                     AX_LT_021: row.device_data?.["AX-LT-021"] || row["avg_ax_lt_021"],
//                     AX_VA_311: row.device_data?.["AX-VA-311"] !== undefined && row.device_data?.["AX-VA-311"] !== null
//   ? row.device_data?.["AX-VA-311"]
//   : row["ax_va_311"] || 0,
//   AX_VA_312: row.device_data?.["AX-VA-312"] !== undefined && row.device_data?.["AX-VA-312"] !== null
//   ? row.device_data?.["AX-VA-312"]
//   : row["ax_va_312"] || 0,
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
// GS_AT_011: row.device_data?.["GS-AT-011"] || row["gs_at_011"],
// GS_AT_012: row.device_data?.["GS-AT-012"] || row["gs_at_012"],
// GS_AT_022: row.device_data?.["GS-AT-022"] || row["gs_at_022"],
// GS_PT_011: row.device_data?.["GS-PT-011"] || row["gs_pt_011"],
// GS_PT_021: row.device_data?.["GS-PT-021"] || row["gs_pt_021"],
// GS_TT_011: row.device_data?.["GS-TT-011"] || row["gs_tt_011"],
// GS_TT_021: row.device_data?.["GS-TT-021"] || row["gs_tt_021"],
// GS_VA_311: row.device_data?.["GS-VA-311"] || row["gs_va_311"],
// GS_VA_312: row.device_data?.["GS-VA-312"] || row["gs_va_312"],
// GS_VA_321: row.device_data?.["GS-VA-321"] || row["gs_va_321"],
// GS_VA_322: row.device_data?.["GS-VA-322"] || row["gs_va_322"],
// PR_AT_001: row.device_data?.["PR-AT-001"] || row["pr_at_001"],
// PR_AT_003: row.device_data?.["PR-AT-003"] || row["pr_at_003"],
// PR_AT_005: row.device_data?.["PR-AT-005"] || row["pr_at_005"],
// PR_FT_001: row.device_data?.["PR-FT-001"] || row["pr_ft_001"],
// PR_TT_001: row.device_data?.["PR-TT-001"] || row["pr_tt_001"],
// PR_TT_061: row.device_data?.["PR-TT-061"] || row["pr_tt_061"],
// PR_TT_072: row.device_data?.["PR-TT-072"] || row["pr_tt_072"],
// PR_VA_352: row.device_data?.["PR-VA-352"] || row["pr_va_352"],
// AX_VA_321: row.device_data?.["AX-VA-321"] !== undefined && row.device_data?.["AX-VA-321"] !== null
// ? row.device_data?.["AX-VA-321"]
// : row["ax_va_321"] || 0,
// AX_VA_322: row.device_data?.["AX-VA-322"] !== undefined && row.device_data?.["AX-VA-322"] !== null
// ? row.device_data?.["AX-VA-322"]
// : row["ax_va_322"] || 0,
// AX_VA_351: row.device_data?.["AX-VA-351"] !== undefined && row.device_data?.["AX-VA-351"] !== null
// ? row.device_data?.["AX-VA-351"]
// : row["ax_va_351"] || 0,
// AX_VA_391: row.device_data?.["AX-VA-391"] !== undefined && row.device_data?.["AX-VA-391"] !== null
// ? row.device_data?.["AX-VA-391"]
// : row["ax_va_391"] || 0,
// DM_VA_301: row.device_data?.["DM-VA-301"] !== undefined && row.device_data?.["DM-VA-301"] !== null
// ? row.device_data?.["DM-VA-301"]
// : row["dm_va_301"] || 0,
// GS_VA_021: row.device_data?.["GS-VA-021"] !== undefined && row.device_data?.["GS-VA-021"] !== null
// ? row.device_data?.["GS-VA-021"]
// : row["gs_va_021"] || 0,
// GS_VA_022: row.device_data?.["GS-VA-022"] !== undefined && row.device_data?.["GS-VA-022"] !== null
// ? row.device_data?.["GS-VA-022"]
// : row["gs_va_022"] || 0,
// N2_VA_311: row.device_data?.["N2-VA-311"] !== undefined && row.device_data?.["N2-VA-311"] !== null
// ? row.device_data?.["N2-VA-311"]
// : row["n2_va_311"] || 0,
// N2_VA_321: row.device_data?.["N2-VA-321"] !== undefined && row.device_data?.["N2-VA-321"] !== null
// ? row.device_data?.["N2-VA-321"]
// : row["n2_va_321"] || 0,
// PR_VA_301: row.device_data?.["PR-VA-301"] !== undefined && row.device_data?.["PR-VA-301"] !== null
// ? row.device_data?.["PR-VA-301"]
// : row["pr_va_301"] || 0,
// PR_VA_312: row.device_data?.["PR-VA-312"] !== undefined && row.device_data?.["PR-VA-312"] !== null
// ? row.device_data?.["PR-VA-312"]
// : row["pr_va_312"] || 0,
// PR_VA_351: row.device_data?.["PR-VA-351"] !== undefined && row.device_data?.["PR-VA-351"] !== null
// ? row.device_data?.["PR-VA-351"]
// : row["pr_va_351"] || 0,
// PR_VA_361Ain: row.device_data?.["PR-VA-361Ain"] !== undefined && row.device_data?.["PR-VA-361Ain"] !== null
// ? row.device_data?.["PR-VA-361Ain"]
// : row["pr_va_361ain"] || 0,
// PR_VA_361Bin: row.device_data?.["PR-VA-361Bin"] !== undefined && row.device_data?.["PR-VA-361Bin"] !== null
// ? row.device_data?.["PR-VA-361Bin"]
// : row["pr_va_361bin"] || 0,
// PR_VA_362Ain: row.device_data?.["PR-VA-362Ain"] !== undefined && row.device_data?.["PR-VA-362Ain"] !== null
// ? row.device_data?.["PR-VA-362Ain"]
// : row["pr_va_362ain"] || 0,
// PR_VA_362Bin: row.device_data?.["PR-VA-362Bin"] !== undefined && row.device_data?.["PR-VA-362Bin"] !== null
// ? row.device_data?.["PR-VA-362Bin"]
// : row["pr_va_362bin"] || 0,
// PR_VA_361Aout: row.device_data?.["PR-VA-361Aout"] !== undefined && row.device_data?.["PR-VA-361Aout"] !== null
// ? row.device_data?.["PR-VA-361Aout"]
// : row["pr_va_361aout"] || 0,
// PR_VA_361Bout: row.device_data?.["PR-VA-361Bout"] !== undefined && row.device_data?.["PR-VA-361Bout"] !== null
// ? row.device_data?.["PR-VA-361Bout"]
// : row["pr_va_361bout"] || 0,
// PR_VA_362Aout: row.device_data?.["PR-VA-362Aout"] !== undefined && row.device_data?.["PR-VA-362Aout"] !== null
// ? row.device_data?.["PR-VA-362Aout"]
// : row["pr_va_362aout"] || 0,
// PR_VA_362Bout: row.device_data?.["PR-VA-362Bout"] !== undefined && row.device_data?.["PR-VA-362Bout"] !== null
// ? row.device_data?.["PR-VA-362Bout"]
// : row["pr_va_362bout"] || 0,
// RECT_CT_001: row.device_data?.["RECT-CT-001"] !== undefined && row.device_data?.["RECT-CT-001"] !== null
// ? row.device_data?.["RECT-CT-001"]
// : row["rect_ct_001"] || 0,
// RECT_VT_001: row.device_data?.["RECT-VT-001"] !== undefined && row.device_data?.["RECT-VT-001"] !== null
// ? row.device_data?.["RECT-VT-001"]
// : row["rect_vt_001"] || 0,
// DCDB0_CT_001: row.device_data?.["DCDB0-CT-001"] !== undefined && row.device_data?.["DCDB0-CT-001"] !== null
// ? row.device_data?.["DCDB0-CT-001"]
// : row["dcdb0_ct_001"] || 0,
// DCDB0_VT_001: row.device_data?.["DCDB0-VT-001"] !== undefined && row.device_data?.["DCDB0-VT-001"] !== null
// ? row.device_data?.["DCDB0-VT-001"]
// : row["dcdb0_vt_001"] || 0,
// DCDB1_CT_001: row.device_data?.["DCDB1-CT-001"] !== undefined && row.device_data?.["DCDB1-CT-001"] !== null
// ? row.device_data?.["DCDB1-CT-001"]
// : row["dcdb1_ct_001"] || 0,
// DCDB1_VT_001: row.device_data?.["DCDB1-VT-001"] !== undefined && row.device_data?.["DCDB1-VT-001"] !== null
// ? row.device_data?.["DCDB1-VT-001"]
// : row["dcdb1_vt_001"] || 0,
// DCDB2_CT_001: row.device_data?.["DCDB2-CT-001"] !== undefined && row.device_data?.["DCDB2-CT-001"] !== null
// ? row.device_data?.["DCDB2-CT-001"]
// : row["dcdb2_ct_001"] || 0,
// DCDB2_VT_001: row.device_data?.["DCDB2-VT-001"] !== undefined && row.device_data?.["DCDB2-VT-001"] !== null
// ? row.device_data?.["DCDB2-VT-001"]
// : row["dcdb2_vt_001"] || 0,
// DCDB3_CT_001: row.device_data?.["DCDB3-CT-001"] !== undefined && row.device_data?.["DCDB3-CT-001"] !== null
// ? row.device_data?.["DCDB3-CT-001"]
// : row["dcdb3_ct_001"] || 0,
// DCDB3_VT_001: row.device_data?.["DCDB3-VT-001"] !== undefined && row.device_data?.["DCDB3-VT-001"] !== null
// ? row.device_data?.["DCDB3-VT-001"]
// : row["dcdb3_vt_001"] || 0,
// DCDB4_CT_001: row.device_data?.["DCDB4-CT-001"] !== undefined && row.device_data?.["DCDB4-CT-001"] !== null
// ? row.device_data?.["DCDB4-CT-001"]
// : row["dcdb4_ct_001"] || 0,
// DCDB4_VT_001: row.device_data?.["DCDB4-VT-001"] !== undefined && row.device_data?.["DCDB4-VT-001"] !== null
// ? row.device_data?.["DCDB4-VT-001"]
// : row["dcdb4_vt_001"] || 0,
// PLC_TIME_STAMP: row.device_data?.["PLC-TIME-STAMP"] !== undefined && row.device_data?.["PLC-TIME-STAMP"] !== null
// ? row.device_data?.["PLC-TIME-STAMP"]
// : row["plc_time_stamp"] || 0,
// Test_Description: row.device_data?.["Test-description"] !== undefined && row.device_data?.["Test-description"] !== null
// ? row.device_data?.["Test-description"]
// : row["test_description"] || 0,
// Test_Remarks: row.device_data?.["Test-Remarks"] !== undefined && row.device_data?.["Test-Remarks"] !== null
// ? row.device_data?.["Test-Remarks"]
// : row["test_remarks"] || 0,
// DM_LSH_001: row.device_data?.["DM-LSH-001"] !== undefined && row.device_data?.["DM-LSH-001"] !== null
//   ? row.device_data?.["DM-LSH-001"]
//   : row["dm_lsh_001"] !== undefined && row["dm_lsh_001"] !== null
//   ? row["dm_lsh_001"]
//   : false,

// DM_LSL_001: row.device_data?.["DM-LSL-001"] !== undefined && row.device_data?.["DM-LSL-001"] !== null
// ? row.device_data?.["DM-LSL-001"]
// : row["dm_lsl_001"] || 0,
// GS_LSL_011: row.device_data?.["GS-LSL-011"] !== undefined && row.device_data?.["GS-LSL-011"] !== null
// ? row.device_data?.["GS-LSL-011"]
// : row["gs_lsl_011"] || 0,
// GS_LSL_021: row.device_data?.["GS-LSL-021"] !== undefined && row.device_data?.["GS-LSL-021"] !== null
// ? row.device_data?.["GS-LSL-021"]
// : row["gs_lsl_021"] || 0 ,
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
//             setIsFetching(false);
//         }
//     };
//     const filteredRows = selectedTestName
//     ? allData.filter((row) => row.Test_Name === selectedTestName)
//     : [];

//     const handleTestNameChange = (event) => {
//         setSelectedTestName(event.target.value);
//         setTotalizerFlow(null); // Reset totalizer flow when test changes
//     };

//     const calculateTotalizerFlow = () => {
//         const filteredRows = allData.filter((row) => row.Test_Name === selectedTestName);

//         if (filteredRows.length === 0) {
//             setTotalizerFlow(null);
//             return;
//         }

//         // Filter out invalid and negative values
//         const validRows = filteredRows.filter((row) => row.CR_FT_001 && row.CR_FT_001 > 0);

//         if (validRows.length < 2) {
//             // If less than 2 valid rows, we cannot calculate a meaningful totalizer flow
//             setTotalizerFlow(0);
//             return;
//         }

//         // Calculate the totalizer flow dynamically
//         let totalFlow = 0;
//         for (let i = 0; i < validRows.length - 1; i++) {
//             const currentRow = validRows[i];
//             const nextRow = validRows[i + 1];

//             const currentTimestamp = new Date(currentRow.timestamp).getTime();
//             const nextTimestamp = new Date(nextRow.timestamp).getTime();

//             const durationInSeconds = (nextTimestamp - currentTimestamp) / 1000;

//             // Add flow contribution for the time duration between two rows
//             if (durationInSeconds > 0) {
//                 totalFlow += currentRow.CR_FT_001 * durationInSeconds;
//             }
//         }
//         // Calculate the total test duration in seconds
//         const startTimestamp = new Date(validRows[0].timestamp).getTime();
//         const endTimestamp = new Date(validRows[validRows.length - 1].timestamp).getTime();
//         const totalDurationInSeconds = (endTimestamp - startTimestamp) / 1000;

//         // Avoid division by zero
//         const totalizer = totalDurationInSeconds > 0 ? totalFlow / totalDurationInSeconds : 0;

//         setTotalizerFlow(totalizer); // Set the totalizer flow value
//     };

//     const columns = [
//         { field: 'ist_timestamp', headerName: 'IST Timestamp', width: 205 },
//         { field: 'Test_Name', headerName: 'Test Name', width: 170 },
//         {
//             field: "AX_LT_011", headerName: "AX-LT-011", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "AX_LT_021", headerName: "AX-LT-021", width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(4) },
          
//           {
//             field: "CW_TT_011", headerName: "CW-TT-011", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "CW_TT_021", headerName: "CW-TT-021", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "CR_LT_011", headerName: "CR-LT-011", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "CR_PT_011", headerName: "CR-PT-011", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "CR_LT_021", headerName: "CR-LT-021", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "CR_PT_021", headerName: "CR-PT-021", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "CR_PT_001", headerName: "CR-PT-001", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "CR_TT_001", headerName: "CR-TT-001", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "CR_FT_001", headerName: "CR-FT-001", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "CR_TT_002", headerName: "CR-TT-002", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "GS_AT_011", headerName: "GS-AT-011", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "GS_AT_012", headerName: "GS-AT-012", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "GS_PT_011", headerName: "GS-PT-011", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "GS_TT_011", headerName: "GS-TT-011", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "GS_AT_022", headerName: "GS-AT-022", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "GS_PT_021", headerName: "GS-PT-021", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "GS_TT_021", headerName: "GS-TT-021", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "PR_TT_001", headerName: "PR-TT-001", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "PR_TT_061", headerName: "PR-TT-061", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "PR_TT_072", headerName: "PR-TT-072", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "PR_FT_001", headerName: "PR-FT-001", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "PR_AT_001", headerName: "PR-AT-001", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "PR_AT_003", headerName: "PR-AT-003", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "PR_AT_005", headerName: "PR-AT-005", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "DM_LSH_001", headerName: "DM-LSH-001", width: 70, valueFormatter: (params) => String(params.value) },
//           {
//             field: "DM_LSL_001", headerName: "DM-LSL-001", width: 70, valueFormatter: (params) => String(params.value) },
//           {
//             field: "GS_LSL_021", headerName: "GS-LSL-021", width: 70, valueFormatter: (params) => String(params.value) },
//           {
//             field: "GS_LSL_011", headerName: "GS-LSL-011", width: 70, valueFormatter: (params) => String(params.value) },
//           {
//             field: "PR_VA_301", headerName: "PR-VA-301", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "PR_VA_352", headerName: "PR-VA-352", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "PR_VA_312", headerName: "PR-VA-312", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "PR_VA_351", headerName: "PR-VA-351", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "PR_VA_361Ain", headerName: "PR-VA-361Ain", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "PR_VA_361Aout", headerName: "PR-VA-361Aout", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "PR_VA_361Bin", headerName: "PR-VA-361Bin", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "PR_VA_361Bout", headerName: "PR-VA-361Bout", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "PR_VA_362Ain", headerName: "PR-VA-362Ain", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "PR_VA_362Aout", headerName: "PR-VA-362Aout", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "PR_VA_362Bin", headerName: "PR-VA-362Bin", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "PR_VA_362Bout", headerName: "PR-VA-362Bout", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "N2_VA_311", headerName: "N2-VA-311", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "GS_VA_311", headerName: "GS-VA-311", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "GS_VA_312", headerName: "GS-VA-312", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "N2_VA_321", headerName: "N2-VA-321", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "GS_VA_321", headerName: "GS-VA-321", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "GS_VA_322", headerName: "GS-VA-322", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "GS_VA_022", headerName: "GS-VA-022", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "GS_VA_021", headerName: "GS-VA-021", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "AX_VA_351", headerName: "AX-VA-351", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "AX_VA_311", headerName: "AX-VA-311", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "AX_VA_312", headerName: "AX-VA-312", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "AX_VA_321", headerName: "AX-VA-321", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "AX_VA_322", headerName: "AX-VA-322", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "AX_VA_391", headerName: "AX-VA-391", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "DM_VA_301", headerName: "DM-VA-301", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "DCDB0_VT_001", headerName: "DCDB0-VT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "DCDB0_CT_001", headerName: "DCDB0-CT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "DCDB1_VT_001", headerName: "DCDB1-VT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "DCDB1_CT_001", headerName: "DCDB1-CT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "DCDB2_VT_001", headerName: "DCDB2-VT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "DCDB2_CT_001", headerName: "DCDB2-CT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "DCDB3_VT_001", headerName: "DCDB3-VT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "DCDB3_CT_001", headerName: "DCDB3-CT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "DCDB4_VT_001", headerName: "DCDB4-VT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "DCDB4_CT_001", headerName: "DCDB4-CT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "RECT_CT_001", headerName: "RECT-CT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           {
//             field: "RECT_VT_001", headerName: "RECT-VT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(4) },
//           { 
//             field: "PLC_TIME_STAMP", headerName: "PLC-TIME-STAMP", width: 180, valueFormatter: (params) => params.value },
//           {
//             field: "Test_Remarks", headerName: "Test-Remarks", width: 150, valueFormatter: (params) => params.value },
//           {
//             field: "Test_Description", headerName: "Test-description", width: 150, valueFormatter: (params) => params.value }
//               ];

//     return (
//       <Box m="15px" mt="-60px">
//             <Header
//                 title="Report Analytics"
//                 subtitle="Fetch Report using Start Date-time and End Date-time"
//             />
//             <div>
//                 <LocalizationProvider dateAdapter={AdapterDateFns}>
//                     <Grid container spacing={2} alignItems="center">
//                         <Grid item xs={3}>
//                             <DateTimePicker
//                                 label="Start Date Time"
//                                 value={startTime}
//                                 onChange={(newValue) => setStartTime(newValue)}
//                                 renderInput={(params) => <TextField {...params} fullWidth />}
//                             />
//                         </Grid>
//                         <Grid item xs={3}>
//                             <DateTimePicker
//                                 label="End Date Time"
//                                 value={endTime}
//                                 onChange={(newValue) => setEndTime(newValue)}
//                                 renderInput={(params) => <TextField {...params} fullWidth />}
//                             />
//                         </Grid>
//                         <Grid item xs={2}>
//                             <Button
//                                 variant="contained"
//                                 color="secondary"
//                                 onClick={fetchData}
//                                 disabled={!startTime || !endTime || isFetching}
//                             >
//                                 {isFetching ? "Fetching..." : "Fetch Data"}
//                             </Button>
//                         </Grid>
//                     </Grid>
//                 </LocalizationProvider>
//                 {error && <p style={{ color: 'red' }}>{error}</p>}
//                 {!isFetching && data.length > 0 && (
//                     <Box sx={{ mt: 4, mb: 4, width: '300px' }}>
//                         <FormControl fullWidth>
//                             <InputLabel id="test-name-select-label">Select Test-Name</InputLabel>
//                             <Select
//                                 labelId="test-name-select-label"
//                                 value={selectedTestName || ''}
//                                 onChange={handleTestNameChange}
//                             >
//                                 {data.map((row) => (
//                                     <MenuItem key={row.id} value={row.Test_Name}>
//                                         {row.Test_Name}
//                                     </MenuItem>
//                                 ))}
//                             </Select>
//                         </FormControl>
//                         <Button
//                             variant="contained"
//                             color="primary"
//                             onClick={calculateTotalizerFlow}
//                             sx={{ mt: 2 }}
//                             disabled={!selectedTestName}
//                         >
//                             Calculate Totalizer Flow
//                         </Button>
//                     </Box>
//                 )}
//                 {isFetching ? (
//                     <Typography variant="h5" color="secondary">Data fetching....</Typography>
//                 ) : selectedTestName && filteredRows.length > 0 ? (
//                     <Box sx={{ height: 600, width: '100%' }}>
//                     {totalizerFlow !== null && (
//                         <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
//                             Totalizer Flow for "{selectedTestName}": {totalizerFlow.toFixed(2)} Liters/Second
//                         </Typography>
//                     )}
//                         <h2>Details for Test-Name: {selectedTestName}</h2>
                        
//                         <DataGrid
//                             rows={filteredRows}
//                             columns={columns}
//                             components={{ Toolbar: GridToolbar }}
//                             getRowId={(row) => row.id}
//                             componentsProps={{
//                               toolbar:{
//                                 sx: {
//                                   "& .MuiButton-root": {
//                                     color: "rgb(34 197 94)",
//                                   },
//                                 },
//                               },
//                             }}
//                         />
                       
//                     </Box>
//                 ) : (
//                     <Typography variant="h6" color="textSecondary"></Typography>
//                 )}
//             </div>
//         </Box>
//     );
// }

// export default IoTDataViewer;






// import React, { useState } from 'react';
// import { Select, MenuItem, FormControl, InputLabel, Button, Box, TextField, Grid, Typography } from '@mui/material';
// import { DataGrid, GridToolbar } from '@mui/x-data-grid';
// import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import Header from 'src/component/Header';

// function IoTDataViewer() {
//     const [startTime, setStartTime] = useState(null);
//     const [endTime, setEndTime] = useState(null);
//     const [allData, setAllData] = useState([]);
//     const [data, setData] = useState([]);
//     const [error, setError] = useState('');
//     const [selectedTestName, setSelectedTestName] = useState(null);
//     const [isFetching, setIsFetching] = useState(false); // New state for fetch status

//     const fetchData = async () => {
//         setIsFetching(true); // Start fetching
//         try {
//             const convertToIST = (date) => {
//                 const offsetInMilliseconds = 5.5 * 60 * 60 * 1000;
//                 return new Date(date.getTime() + offsetInMilliseconds).toISOString().slice(0, 19);
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
//                 }),
//             });

//             const rawResult = await response.json();
//             const result = rawResult.body ? JSON.parse(rawResult.body) : rawResult;

//             if (response.ok) {
//                 const processedData = (result.data || []).map((row, index) => ({
//                     id: index,
                    
//                     timestamp: row.timestamp || row.time_bucket,
//                     ist_timestamp: row.ist_timestamp || row.time_bucket,
//                     Test_Name: row.device_data?.["Test-Name"] || row["test_name"],
//                     AX_LT_011: row.device_data?.["AX-LT-011"] !== undefined && row.device_data?.["AX-LT-011"] !== null
//                     ? row.device_data?.["AX-LT-011"]
//                     : row["avg_ax_lt_011"] || 0,

//                     AX_LT_021: row.device_data?.["AX-LT-021"] || row["avg_ax_lt_021"],
//                     AX_VA_311: row.device_data?.["AX-VA-311"] !== undefined && row.device_data?.["AX-VA-311"] !== null
//   ? row.device_data?.["AX-VA-311"]
//   : row["ax_va_311"] || 0,
//   AX_VA_312: row.device_data?.["AX-VA-312"] !== undefined && row.device_data?.["AX-VA-312"] !== null
//   ? row.device_data?.["AX-VA-312"]
//   : row["ax_va_312"] || 0,
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
// GS_AT_011: row.device_data?.["GS-AT-011"] || row["gs_at_011"],
// GS_AT_012: row.device_data?.["GS-AT-012"] || row["gs_at_012"],
// GS_AT_022: row.device_data?.["GS-AT-022"] || row["gs_at_022"],
// GS_PT_011: row.device_data?.["GS-PT-011"] || row["gs_pt_011"],
// GS_PT_021: row.device_data?.["GS-PT-021"] || row["gs_pt_021"],
// GS_TT_011: row.device_data?.["GS-TT-011"] || row["gs_tt_011"],
// GS_TT_021: row.device_data?.["GS-TT-021"] || row["gs_tt_021"],
// GS_VA_311: row.device_data?.["GS-VA-311"] || row["gs_va_311"],
// GS_VA_312: row.device_data?.["GS-VA-312"] || row["gs_va_312"],
// GS_VA_321: row.device_data?.["GS-VA-321"] || row["gs_va_321"],
// GS_VA_322: row.device_data?.["GS-VA-322"] || row["gs_va_322"],
// PR_AT_001: row.device_data?.["PR-AT-001"] || row["pr_at_001"],
// PR_AT_003: row.device_data?.["PR-AT-003"] || row["pr_at_003"],
// PR_AT_005: row.device_data?.["PR-AT-005"] || row["pr_at_005"],
// PR_FT_001: row.device_data?.["PR-FT-001"] || row["pr_ft_001"],
// PR_TT_001: row.device_data?.["PR-TT-001"] || row["pr_tt_001"],
// PR_TT_061: row.device_data?.["PR-TT-061"] || row["pr_tt_061"],
// PR_TT_072: row.device_data?.["PR-TT-072"] || row["pr_tt_072"],
// PR_VA_352: row.device_data?.["PR-VA-352"] || row["pr_va_352"],
// AX_VA_321: row.device_data?.["AX-VA-321"] !== undefined && row.device_data?.["AX-VA-321"] !== null
// ? row.device_data?.["AX-VA-321"]
// : row["ax_va_321"] || 0,
// AX_VA_322: row.device_data?.["AX-VA-322"] !== undefined && row.device_data?.["AX-VA-322"] !== null
// ? row.device_data?.["AX-VA-322"]
// : row["ax_va_322"] || 0,
// AX_VA_351: row.device_data?.["AX-VA-351"] !== undefined && row.device_data?.["AX-VA-351"] !== null
// ? row.device_data?.["AX-VA-351"]
// : row["ax_va_351"] || 0,
// AX_VA_391: row.device_data?.["AX-VA-391"] !== undefined && row.device_data?.["AX-VA-391"] !== null
// ? row.device_data?.["AX-VA-391"]
// : row["ax_va_391"] || 0,
// DM_VA_301: row.device_data?.["DM-VA-301"] !== undefined && row.device_data?.["DM-VA-301"] !== null
// ? row.device_data?.["DM-VA-301"]
// : row["dm_va_301"] || 0,
// GS_VA_021: row.device_data?.["GS-VA-021"] !== undefined && row.device_data?.["GS-VA-021"] !== null
// ? row.device_data?.["GS-VA-021"]
// : row["gs_va_021"] || 0,
// GS_VA_022: row.device_data?.["GS-VA-022"] !== undefined && row.device_data?.["GS-VA-022"] !== null
// ? row.device_data?.["GS-VA-022"]
// : row["gs_va_022"] || 0,
// N2_VA_311: row.device_data?.["N2-VA-311"] !== undefined && row.device_data?.["N2-VA-311"] !== null
// ? row.device_data?.["N2-VA-311"]
// : row["n2_va_311"] || 0,
// N2_VA_321: row.device_data?.["N2-VA-321"] !== undefined && row.device_data?.["N2-VA-321"] !== null
// ? row.device_data?.["N2-VA-321"]
// : row["n2_va_321"] || 0,
// PR_VA_301: row.device_data?.["PR-VA-301"] !== undefined && row.device_data?.["PR-VA-301"] !== null
// ? row.device_data?.["PR-VA-301"]
// : row["pr_va_301"] || 0,
// PR_VA_312: row.device_data?.["PR-VA-312"] !== undefined && row.device_data?.["PR-VA-312"] !== null
// ? row.device_data?.["PR-VA-312"]
// : row["pr_va_312"] || 0,
// PR_VA_351: row.device_data?.["PR-VA-351"] !== undefined && row.device_data?.["PR-VA-351"] !== null
// ? row.device_data?.["PR-VA-351"]
// : row["pr_va_351"] || 0,
// PR_VA_361Ain: row.device_data?.["PR-VA-361Ain"] !== undefined && row.device_data?.["PR-VA-361Ain"] !== null
// ? row.device_data?.["PR-VA-361Ain"]
// : row["pr_va_361ain"] || 0,
// PR_VA_361Bin: row.device_data?.["PR-VA-361Bin"] !== undefined && row.device_data?.["PR-VA-361Bin"] !== null
// ? row.device_data?.["PR-VA-361Bin"]
// : row["pr_va_361bin"] || 0,
// PR_VA_362Ain: row.device_data?.["PR-VA-362Ain"] !== undefined && row.device_data?.["PR-VA-362Ain"] !== null
// ? row.device_data?.["PR-VA-362Ain"]
// : row["pr_va_362ain"] || 0,
// PR_VA_362Bin: row.device_data?.["PR-VA-362Bin"] !== undefined && row.device_data?.["PR-VA-362Bin"] !== null
// ? row.device_data?.["PR-VA-362Bin"]
// : row["pr_va_362bin"] || 0,
// PR_VA_361Aout: row.device_data?.["PR-VA-361Aout"] !== undefined && row.device_data?.["PR-VA-361Aout"] !== null
// ? row.device_data?.["PR-VA-361Aout"]
// : row["pr_va_361aout"] || 0,
// PR_VA_361Bout: row.device_data?.["PR-VA-361Bout"] !== undefined && row.device_data?.["PR-VA-361Bout"] !== null
// ? row.device_data?.["PR-VA-361Bout"]
// : row["pr_va_361bout"] || 0,
// PR_VA_362Aout: row.device_data?.["PR-VA-362Aout"] !== undefined && row.device_data?.["PR-VA-362Aout"] !== null
// ? row.device_data?.["PR-VA-362Aout"]
// : row["pr_va_362aout"] || 0,
// PR_VA_362Bout: row.device_data?.["PR-VA-362Bout"] !== undefined && row.device_data?.["PR-VA-362Bout"] !== null
// ? row.device_data?.["PR-VA-362Bout"]
// : row["pr_va_362bout"] || 0,
// RECT_CT_001: row.device_data?.["RECT-CT-001"] !== undefined && row.device_data?.["RECT-CT-001"] !== null
// ? row.device_data?.["RECT-CT-001"]
// : row["rect_ct_001"] || 0,
// RECT_VT_001: row.device_data?.["RECT-VT-001"] !== undefined && row.device_data?.["RECT-VT-001"] !== null
// ? row.device_data?.["RECT-VT-001"]
// : row["rect_vt_001"] || 0,
// DCDB0_CT_001: row.device_data?.["DCDB0-CT-001"] !== undefined && row.device_data?.["DCDB0-CT-001"] !== null
// ? row.device_data?.["DCDB0-CT-001"]
// : row["dcdb0_ct_001"] || 0,
// DCDB0_VT_001: row.device_data?.["DCDB0-VT-001"] !== undefined && row.device_data?.["DCDB0-VT-001"] !== null
// ? row.device_data?.["DCDB0-VT-001"]
// : row["dcdb0_vt_001"] || 0,
// DCDB1_CT_001: row.device_data?.["DCDB1-CT-001"] !== undefined && row.device_data?.["DCDB1-CT-001"] !== null
// ? row.device_data?.["DCDB1-CT-001"]
// : row["dcdb1_ct_001"] || 0,
// DCDB1_VT_001: row.device_data?.["DCDB1-VT-001"] !== undefined && row.device_data?.["DCDB1-VT-001"] !== null
// ? row.device_data?.["DCDB1-VT-001"]
// : row["dcdb1_vt_001"] || 0,
// DCDB2_CT_001: row.device_data?.["DCDB2-CT-001"] !== undefined && row.device_data?.["DCDB2-CT-001"] !== null
// ? row.device_data?.["DCDB2-CT-001"]
// : row["dcdb2_ct_001"] || 0,
// DCDB2_VT_001: row.device_data?.["DCDB2-VT-001"] !== undefined && row.device_data?.["DCDB2-VT-001"] !== null
// ? row.device_data?.["DCDB2-VT-001"]
// : row["dcdb2_vt_001"] || 0,
// DCDB3_CT_001: row.device_data?.["DCDB3-CT-001"] !== undefined && row.device_data?.["DCDB3-CT-001"] !== null
// ? row.device_data?.["DCDB3-CT-001"]
// : row["dcdb3_ct_001"] || 0,
// DCDB3_VT_001: row.device_data?.["DCDB3-VT-001"] !== undefined && row.device_data?.["DCDB3-VT-001"] !== null
// ? row.device_data?.["DCDB3-VT-001"]
// : row["dcdb3_vt_001"] || 0,
// DCDB4_CT_001: row.device_data?.["DCDB4-CT-001"] !== undefined && row.device_data?.["DCDB4-CT-001"] !== null
// ? row.device_data?.["DCDB4-CT-001"]
// : row["dcdb4_ct_001"] || 0,
// DCDB4_VT_001: row.device_data?.["DCDB4-VT-001"] !== undefined && row.device_data?.["DCDB4-VT-001"] !== null
// ? row.device_data?.["DCDB4-VT-001"]
// : row["dcdb4_vt_001"] || 0,
// PLC_TIME_STAMP: row.device_data?.["PLC-TIME-STAMP"] !== undefined && row.device_data?.["PLC-TIME-STAMP"] !== null
// ? row.device_data?.["PLC-TIME-STAMP"]
// : row["plc_time_stamp"] || 0,
// Test_Description: row.device_data?.["Test-description"] !== undefined && row.device_data?.["Test-description"] !== null
// ? row.device_data?.["Test-description"]
// : row["test_description"] || 0,
// Test_Remarks: row.device_data?.["Test-Remarks"] !== undefined && row.device_data?.["Test-Remarks"] !== null
// ? row.device_data?.["Test-Remarks"]
// : row["test_remarks"] || 0,
// DM_LSH_001: row.device_data?.["DM-LSH-001"] !== undefined && row.device_data?.["DM-LSH-001"] !== null
//   ? row.device_data?.["DM-LSH-001"]
//   : row["dm_lsh_001"] !== undefined && row["dm_lsh_001"] !== null
//   ? row["dm_lsh_001"]
//   : false,

// DM_LSL_001: row.device_data?.["DM-LSL-001"] !== undefined && row.device_data?.["DM-LSL-001"] !== null
// ? row.device_data?.["DM-LSL-001"]
// : row["dm_lsl_001"] || 0,
// GS_LSL_011: row.device_data?.["GS-LSL-011"] !== undefined && row.device_data?.["GS-LSL-011"] !== null
// ? row.device_data?.["GS-LSL-011"]
// : row["gs_lsl_011"] || 0,
// GS_LSL_021: row.device_data?.["GS-LSL-021"] !== undefined && row.device_data?.["GS-LSL-021"] !== null
// ? row.device_data?.["GS-LSL-021"]
// : row["gs_lsl_021"] || 0 ,
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
//             setIsFetching(false); // Stop fetching
//         }
//     };

//     const handleTestNameChange = (event) => {
//         setSelectedTestName(event.target.value);
//     };

    // const filteredRows = selectedTestName
    //     ? allData.filter((row) => row.Test_Name === selectedTestName)
    //     : [];

//         const columns = [  
//             { field: 'ist_timestamp', headerName: 'IST Timestamp' ,width: 170},
//             { field: 'timestamp', headerName: 'Timestamp' ,width: 170},
//             { field: 'Test_Name', headerName: 'Test Name', width: 170, },
//             { field: 'AX_LT_011', headerName: 'AX-LT-011',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0),},
//             { field: 'AX_LT_021', headerName: 'AX-LT-021',    width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//  { field: 'CR_FT_001', headerName: 'CR-FT-001',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'CR_LT_011', headerName: 'CR-LT-011',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'CR_LT_021', headerName: 'CR-LT-021',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'CR_PT_001', headerName: 'CR-PT-001',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'CR_PT_011', headerName: 'CR-PT-011',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'CR_PT_021', headerName: 'CR-PT-021',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'CR_TT_001', headerName: 'CR-TT-001',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'CR_TT_002', headerName: 'CR-TT-002',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'CW_TT_011', headerName: 'CW-TT-011',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'CW_TT_021', headerName: 'CW-TT-021',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'DM_VA_301', headerName: 'DM-VA-301',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'GS_AT_011', headerName: 'GS-AT-011',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'GS_AT_012', headerName: 'GS-AT-012',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'GS_AT_022', headerName: 'GS-AT-022',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'GS_PT_011', headerName: 'GS-PT-011',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'GS_PT_021', headerName: 'GS-PT-021',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'GS_TT_011', headerName: 'GS-TT-011',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'GS_TT_021', headerName: 'GS-TT-021',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'GS_VA_021', headerName: 'GS-VA-021',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'GS_VA_022', headerName: 'GS-VA-022',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'GS_VA_311', headerName: 'GS-VA-311',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'GS_VA_312', headerName: 'GS-VA-312',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'GS_VA_321', headerName: 'GS-VA-321',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'GS_VA_322', headerName: 'GS-VA-322',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'N2_VA_311', headerName: 'N2-VA-311',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'N2_VA_321', headerName: 'N2-VA-321',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'PR_AT_001', headerName: 'PR-AT-001',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'PR_AT_003', headerName: 'PR-AT-003',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'PR_AT_005', headerName: 'PR-AT-005',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'PR_FT_001', headerName: 'PR-FT-001',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'PR_TT_001', headerName: 'PR-TT-001',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'PR_TT_061', headerName: 'PR-TT-061',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'PR_TT_072', headerName: 'PR-TT-072',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'PR_VA_301', headerName: 'PR-VA-301',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'PR_VA_312', headerName: 'PR-VA-312',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'PR_VA_351', headerName: 'PR-VA-351',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'PR_VA_352', headerName: 'PR-VA-352',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'PR_VA_361Ain', headerName: 'PR-VA-361Ain',     width: 85 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'PR_VA_361Bin', headerName: 'PR-VA-361Bin',     width: 85 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'PR_VA_362Ain', headerName: 'PR-VA-362Ain',     width: 85 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'PR_VA_362Bin', headerName: 'PR-VA-362Bin',     width: 85 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'PR_VA_361Aout', headerName: 'PR-VA-361Aout',     width: 90 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'PR_VA_361Bout', headerName: 'PR-VA-361Bout',     width: 90 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'PR_VA_362Aout', headerName: 'PR-VA-362Aout',     width: 90 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'PR_VA_362Bout', headerName: 'PR-VA-362Bout',     width: 90 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'RECT_CT_001', headerName: 'RECT-CT-001',     width: 85 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'RECT_VT_001', headerName: 'RECT-VT-001',     width: 85 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'DCDB0_CT_001', headerName: 'DCDB0-CT-001',     width: 85 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'DCDB0_VT_001', headerName: 'DCDB0-VT-001',     width: 85 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'DCDB1_CT_001', headerName: 'DCDB1-CT-001',     width: 85 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'DCDB1_VT_001', headerName: 'DCDB1-VT-001',     width: 85 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'DCDB2_CT_001', headerName: 'DCDB2-CT-001',     width: 85 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'DCDB2_VT_001', headerName: 'DCDB2-VT-001',     width: 85 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'DCDB3_CT_001', headerName: 'DCDB3-CT-001',     width: 85 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'DCDB3_VT_001', headerName: 'DCDB3-VT-001',     width: 85 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'DCDB4_CT_001', headerName: 'DCDB4-CT-001',     width: 85 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'DCDB4_VT_001', headerName: 'DCDB4-VT-001',     width: 85 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'DM_LSH_001', headerName: 'DM-LSH-001',     width: 85 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'DM_LSL_001', headerName: 'DM-LSL-001',     width: 85 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'GS_LSL_011', headerName: 'GS-LSL-011',     width: 85 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'GS_LSL_021', headerName: 'GS-LSL-021',     width: 85 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'AX_VA_311', headerName: 'AX-VA-311', width:70 ,valueFormatter: (params) => Number(params.value).toFixed(0)},
//     { field: 'AX_VA_312', headerName: 'AX-VA-312',  width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0),  },
// { field: 'AX_VA_321', headerName: 'AX-VA-321',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'AX_VA_322', headerName: 'AX-VA-322',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'AX_VA_351', headerName: 'AX-VA-351',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
// { field: 'AX_VA_391', headerName: 'AX-VA-391',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
    
// ];

//     return (
//         <Box m="20px">
//             <Header
//                 title="Report Analytics"
//                 subtitle="Fetch Report using Start Date-time and End Date-time"
//             />
//             <div>
//                 <LocalizationProvider dateAdapter={AdapterDateFns}>
//                     <Grid container spacing={2} alignItems="center">
//                         <Grid item xs={3}>
//                             <DateTimePicker
//                                 label="Start Date Time"
//                                 value={startTime}
//                                 onChange={(newValue) => setStartTime(newValue)}
//                                 renderInput={(params) => <TextField {...params} fullWidth />}
//                             />
//                         </Grid>
//                         <Grid item xs={3}>
//                             <DateTimePicker
//                                 label="End Date Time"
//                                 value={endTime}
//                                 onChange={(newValue) => setEndTime(newValue)}
//                                 renderInput={(params) => <TextField {...params} fullWidth />}
//                             />
//                         </Grid>
//                         <Grid item xs={2}>
//                             <Button
//                                 variant="contained"
//                                 color="secondary"
//                                 onClick={fetchData}
//                                 disabled={!startTime || !endTime || isFetching}
//                             >
//                                 {isFetching ? "Fetching..." : "Fetch Data"}
//                             </Button>
//                         </Grid>
//                     </Grid>
//                 </LocalizationProvider>

//                 {error && <p style={{ color: 'red' }}>{error}</p>}

//                 {!isFetching && data.length > 0 && (
//                     <Box sx={{ mt: 4, mb: 4, width: '300px' }}>
//                         <FormControl fullWidth>
//                             <InputLabel id="test-name-select-label">Select Test-Name</InputLabel>
//                             <Select
//                                 labelId="test-name-select-label"
//                                 value={selectedTestName || ''}
//                                 onChange={handleTestNameChange}
//                             >
//                                 {data.map((row) => (
//                                     <MenuItem key={row.id} value={row.Test_Name}>
//                                         {row.Test_Name}
//                                     </MenuItem>
//                                 ))}
//                             </Select>
//                         </FormControl>
//                     </Box>
//                 )}
                
//                 {isFetching ? (
//                     <Typography variant="h5" color="secondary">Data fetching....</Typography>
//                 ) : selectedTestName && filteredRows.length > 0 ? (
//                     <Box sx={{ height: 600, width: '100%' }}>
//                         <h2>Details for Test-Name: {selectedTestName}</h2>
//                         <DataGrid
//                             rows={filteredRows}
//                             columns={columns}
//                             components={{ Toolbar: GridToolbar }}
//                             componentsProps={{
//                                 toolbar: {
//                                     sx: {
//                                         '& .MuiButton-root': {
//                                             color: 'rgb(34 197 94)',
//                                         },
//                                     },
//                                 },
//                             }}
//                             getRowId={(row) => row.id}
//                         />
//                     </Box>
//                 ) : (
//                     <p></p>
//                 )}
//             </div>
//         </Box>
//     );
// }

// export default IoTDataViewer;



// import React, { useState } from 'react';
// import { Select, MenuItem, FormControl, InputLabel, Button, Box, TextField, Grid, Typography } from '@mui/material';
// import { DataGrid, GridToolbar } from '@mui/x-data-grid';
// import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import Header from 'src/component/Header';

// function IoTDataViewer() {
//     const [startTime, setStartTime] = useState(null);
//     const [endTime, setEndTime] = useState(null);
//     const [allData, setAllData] = useState([]);
//     const [data, setData] = useState([]);
//     const [error, setError] = useState('');
//     const [selectedTestName, setSelectedTestName] = useState(null);
//     const [isFetching, setIsFetching] = useState(false); // New state for fetch status

//     const fetchData = async () => {
//         setIsFetching(true); // Start fetching
//         try {
//             const convertToIST = (date) => {
//                 const offsetInMilliseconds = 5.5 * 60 * 60 * 1000;
//                 return new Date(date.getTime() + offsetInMilliseconds).toISOString().slice(0, 19);
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
//                 }),
//             });

//             const rawResult = await response.json();
//             const result = rawResult.body ? JSON.parse(rawResult.body) : rawResult;

//             if (response.ok) {
//                 const processedData = (result.data || []).map((row, index) => ({
//                     id: index,
                    
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
//         } finally {
//             setIsFetching(false); // Stop fetching
//         }
//     };

//     const handleTestNameChange = (event) => {
//         setSelectedTestName(event.target.value);
//     };

//     const filteredRows = selectedTestName
//         ? allData.filter((row) => row.Test_Name === selectedTestName)
//         : [];

//         const columns = [  
//             { field: 'ist_timestamp', headerName: 'IST Timestamp' ,width: 170},
//             { field: 'timestamp', headerName: 'Timestamp' ,width: 170},
//             { field: 'Test_Name', headerName: 'Test Name', width: 170, },
//             { field: 'AX_LT_011', headerName: 'AX-LT-011',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0),},
//             { field: 'AX_LT_021', headerName: 'AX-LT-021',    width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//             { field: 'AX_VA_311', headerName: 'AX-VA-311', width:70 ,valueFormatter: (params) => Number(params.value).toFixed(0)},
//          { field: 'AX_VA_312', headerName: 'AX-VA-312',  width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0),  },
//     { field: 'AX_VA_321', headerName: 'AX-VA-321',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'AX_VA_322', headerName: 'AX-VA-322',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'AX_VA_351', headerName: 'AX-VA-351',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'AX_VA_391', headerName: 'AX-VA-391',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'CR_FT_001', headerName: 'CR-FT-001',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'CR_LT_011', headerName: 'CR-LT-011',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'CR_LT_021', headerName: 'CR-LT-021',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'CR_PT_001', headerName: 'CR-PT-001',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'CR_PT_011', headerName: 'CR-PT-011',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'CR_PT_021', headerName: 'CR-PT-021',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'CR_TT_001', headerName: 'CR-TT-001',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'CR_TT_002', headerName: 'CR-TT-002',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'CW_TT_011', headerName: 'CW-TT-011',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'CW_TT_021', headerName: 'CW-TT-021',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'DM_VA_301', headerName: 'DM-VA-301',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'GS_AT_011', headerName: 'GS-AT-011',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'GS_AT_012', headerName: 'GS-AT-012',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'GS_AT_022', headerName: 'GS-AT-022',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'GS_PT_011', headerName: 'GS-PT-011',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'GS_PT_021', headerName: 'GS-PT-021',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'GS_TT_011', headerName: 'GS-TT-011',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'GS_TT_021', headerName: 'GS-TT-021',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'GS_VA_021', headerName: 'GS-VA-021',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'GS_VA_022', headerName: 'GS-VA-022',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'GS_VA_311', headerName: 'GS-VA-311',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'GS_VA_312', headerName: 'GS-VA-312',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'GS_VA_321', headerName: 'GS-VA-321',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'GS_VA_322', headerName: 'GS-VA-322',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'N2_VA_311', headerName: 'N2-VA-311',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'N2_VA_321', headerName: 'N2-VA-321',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'PR_AT_001', headerName: 'PR-AT-001',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'PR_AT_003', headerName: 'PR-AT-003',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'PR_AT_005', headerName: 'PR-AT-005',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'PR_FT_001', headerName: 'PR-FT-001',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'PR_TT_001', headerName: 'PR-TT-001',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'PR_TT_061', headerName: 'PR-TT-061',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'PR_TT_072', headerName: 'PR-TT-072',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'PR_VA_301', headerName: 'PR-VA-301',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'PR_VA_312', headerName: 'PR-VA-312',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'PR_VA_351', headerName: 'PR-VA-351',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'PR_VA_352', headerName: 'PR-VA-352',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'PR_VA_361Ain', headerName: 'PR-VA-361Ain',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'PR_VA_361Bin', headerName: 'PR-VA-361Bin',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'PR_VA_362Ain', headerName: 'PR-VA-362Ain',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'PR_VA_362Bin', headerName: 'PR-VA-362Bin',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'PR_VA_361Aout', headerName: 'PR-VA-361Aout',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'PR_VA_361Bout', headerName: 'PR-VA-361Bout',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'PR_VA_362Aout', headerName: 'PR-VA-362Aout',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'PR_VA_362Bout', headerName: 'PR-VA-362Bout',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'RECT_CT_001', headerName: 'RECT-CT-001',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'RECT_VT_001', headerName: 'RECT-VT-001',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'DCDB0_CT_001', headerName: 'DCDB0-CT-001',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'DCDB0_VT_001', headerName: 'DCDB0-VT-001',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'DCDB1_CT_001', headerName: 'DCDB1-CT-001',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'DCDB1_VT_001', headerName: 'DCDB1-VT-001',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'DCDB2_CT_001', headerName: 'DCDB2-CT-001',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'DCDB2_VT_001', headerName: 'DCDB2-VT-001',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'DCDB3_CT_001', headerName: 'DCDB3-CT-001',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'DCDB3_VT_001', headerName: 'DCDB3-VT-001',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'DCDB4_CT_001', headerName: 'DCDB4-CT-001',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'DCDB4_VT_001', headerName: 'DCDB4-VT-001',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'DM_LSH_001', headerName: 'DM-LSH-001',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'DM_LSL_001', headerName: 'DM-LSL-001',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'GS_LSL_011', headerName: 'GS-LSL-011',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), },
//     { field: 'GS_LSL_021', headerName: 'GS-LSL-021',     width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0), }
//         ];

//     return (
//         <Box m="20px">
//             <Header
//                 title="Report Analytics"
//                 subtitle="Fetch Report using Start Date-time and End Date-time"
//             />
//             <div>
//                 <LocalizationProvider dateAdapter={AdapterDateFns}>
//                     <Grid container spacing={2} alignItems="center">
//                         <Grid item xs={3}>
//                             <DateTimePicker
//                                 label="Start Date Time"
//                                 value={startTime}
//                                 onChange={(newValue) => setStartTime(newValue)}
//                                 renderInput={(params) => <TextField {...params} fullWidth />}
//                             />
//                         </Grid>
//                         <Grid item xs={3}>
//                             <DateTimePicker
//                                 label="End Date Time"
//                                 value={endTime}
//                                 onChange={(newValue) => setEndTime(newValue)}
//                                 renderInput={(params) => <TextField {...params} fullWidth />}
//                             />
//                         </Grid>
//                         <Grid item xs={2}>
//                             <Button
//                                 variant="contained"
//                                 color="secondary"
//                                 onClick={fetchData}
//                                 disabled={!startTime || !endTime || isFetching}
//                             >
//                                 {isFetching ? "Fetching..." : "Fetch Data"}
//                             </Button>
//                         </Grid>
//                     </Grid>
//                 </LocalizationProvider>

//                 {error && <p style={{ color: 'red' }}>{error}</p>}

//                 {!isFetching && data.length > 0 && (
//                     <Box sx={{ mt: 4, mb: 4, width: '300px' }}>
//                         <FormControl fullWidth>
//                             <InputLabel id="test-name-select-label">Select Test-Name</InputLabel>
//                             <Select
//                                 labelId="test-name-select-label"
//                                 value={selectedTestName || ''}
//                                 onChange={handleTestNameChange}
//                             >
//                                 {data.map((row) => (
//                                     <MenuItem key={row.id} value={row.Test_Name}>
//                                         {row.Test_Name}
//                                     </MenuItem>
//                                 ))}
//                             </Select>
//                         </FormControl>
//                     </Box>
//                 )}

//                 {isFetching ? (
//                     <Typography variant="h5" color="secondary">Data fetching</Typography>
//                 ) : selectedTestName && filteredRows.length > 0 ? (
//                     <Box sx={{ height: 600, width: '100%' }}>
//                         <h2>Details for Test-Name: {selectedTestName}</h2>
//                         <DataGrid
//                             rows={filteredRows}
//                             columns={columns}
//                             components={{ Toolbar: GridToolbar }}
//                             componentsProps={{
//                                 toolbar: {
//                                     sx: {
//                                         '& .MuiButton-root': {
//                                             color: 'rgb(34 197 94)',
//                                         },
//                                     },
//                                 },
//                             }}
//                             getRowId={(row) => row.id}
//                         />
//                     </Box>
//                 ) : (
//                     <p></p>
//                 )}
//             </div>
//         </Box>
//     );
// }

// export default IoTDataViewer;



// import React, { useState } from 'react';
// import { Select, MenuItem, FormControl, InputLabel, Button, Box, TextField, Grid } from '@mui/material';
// import { DataGrid, GridToolbar } from '@mui/x-data-grid';
// import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import Header from 'src/component/Header';

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
    
//             const response = await fetch('https://phhm5ulen4skthqhefp7r5gp2u0yzxzd.lambda-url.us-east-1.on.aws/', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     start_time: startTimeIST,
//                     end_time: endTimeIST,
//                 }),
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
//     { field: 'AX_VA_311', headerName: 'AX-VA-311', width:70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: 'AX_VA_312', headerName: 'AX-VA-312',width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0)  },
// { field: 'AX_VA_321', headerName: 'AX-VA-321',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: 'AX_VA_322', headerName: 'AX-VA-322',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: 'AX_VA_351', headerName: 'AX-VA-351',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: 'AX_VA_391', headerName: 'AX-VA-391',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: 'DM_VA_301', headerName: 'DM-VA-301',   width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0) },
//  { field: 'AX_VA_311', headerName: 'AX-VA-311', width:70, valueFormatter: (params) => Number(params.value).toFixed(0)  },
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
//         <Box m="20px">
//         <Header
//         title="Report Analytics"
//         subtitle="Fetch Report using Start Date-time and End Date-time"
//       />
//         <div>
        
//             <LocalizationProvider dateAdapter={AdapterDateFns}>
//             <Grid container spacing={2} alignItems="center">
//             <Grid item xs={3}>
//                     <DateTimePicker
//                         label="Start Date Time"
//                         value={startTime}
//                         onChange={(newValue) => setStartTime(newValue)}
//                         renderInput={(params) => <TextField {...params} fullWidth />}
//                     />
//                     </Grid>
//                     <Grid item xs={3}>
//                     <DateTimePicker
//                         label="End Date Time"
//                         value={endTime}
//                         onChange={(newValue) => setEndTime(newValue)}
//                         renderInput={(params) => <TextField {...params} fullWidth />}
//                     />
//                     </Grid>
//                     <Grid item xs={2}>
//                     <Button
//                       variant="contained"
//                       color="secondary"
//                       onClick={fetchData}
//                       disabled={!startTime || !endTime}
//                     >
//                       Fetch Data
//                     </Button>
//                   </Grid>
//                     </Grid>
               
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
//                           componentsProps={{
//                             toolbar: {
//                               sx: {
//                                 '& .MuiButton-root': {
//                                   color: 'rgb(34 197 94)',
//                                 },
//                               },
//                             },
//                           }}
//                         getRowId={(row) => row.id} // Use the `id` field as the unique identifier
//                     />
//                 </Box>
//             ) : (
//                 <p>Please select the Start Date-Time and End Date-Time</p>
//             )}
//         </div>
//         </Box>
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

//                     timestamp: row.timestamp || row.time_bucket, // Handle `time_bucket` for aggregated data
//                     ist_timestamp: row.ist_timestamp || row.time_bucket, // Default for missing fields

//                     // ist_timestamp: row.ist_timestamp || row.time_bucket,
                    // Test_Name: row.device_data?.["Test-Name"] || row["test_name"],
                    // AX_LT_011: row.device_data?.["AX-LT-011"] || row["avg_ax_lt_011"],
                    // AX_LT_021: row.device_data?.["AX-LT-021"] || row["avg_ax_lt_021"],
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
//         { field: 'ist_timestamp', headerName: 'IST Timestamp' ,width: 170},
//         { field: 'timestamp', headerName: 'Timestamp' ,width: 170},
//         { field: 'Test_Name', headerName: 'Test Name', width: 170, },
//         { field: 'AX_LT_011', headerName: 'AX-LT-011',  width: 70,},
//         { field: 'AX_LT_021', headerName: 'AX-LT-021',   width: 70, },
//         { field: 'AX_VA_311', headerName: 'AX-VA-311', width:70, },
//      { field: 'AX_VA_312', headerName: 'AX-VA-312', width: 70,  },
// { field: 'AX_VA_321', headerName: 'AX-VA-321',    width: 70, },
// { field: 'AX_VA_322', headerName: 'AX-VA-322',    width: 70, },
// { field: 'AX_VA_351', headerName: 'AX-VA-351',    width: 70, },
// { field: 'AX_VA_391', headerName: 'AX-VA-391',    width: 70, },
// { field: 'CR_FT_001', headerName: 'CR-FT-001',    width: 70, },
// { field: 'CR_LT_011', headerName: 'CR-LT-011',    width: 70, },
// { field: 'CR_LT_021', headerName: 'CR-LT-021',    width: 70, },
// { field: 'CR_PT_001', headerName: 'CR-PT-001',    width: 70, },
// { field: 'CR_PT_011', headerName: 'CR-PT-011',    width: 70, },
// { field: 'CR_PT_021', headerName: 'CR-PT-021',    width: 70, },
// { field: 'CR_TT_001', headerName: 'CR-TT-001',    width: 70, },
// { field: 'CR_TT_002', headerName: 'CR-TT-002',    width: 70, },
// { field: 'CW_TT_011', headerName: 'CW-TT-011',    width: 70, },
// { field: 'CW_TT_021', headerName: 'CW-TT-021',    width: 70, },
// { field: 'DM_VA_301', headerName: 'DM-VA-301',    width: 70, },
// { field: 'GS_AT_011', headerName: 'GS-AT-011',    width: 70, },
// { field: 'GS_AT_012', headerName: 'GS-AT-012',    width: 70, },
// { field: 'GS_AT_022', headerName: 'GS-AT-022',    width: 70, },
// { field: 'GS_PT_011', headerName: 'GS-PT-011',    width: 70, },
// { field: 'GS_PT_021', headerName: 'GS-PT-021',    width: 70, },
// { field: 'GS_TT_011', headerName: 'GS-TT-011',    width: 70, },
// { field: 'GS_TT_021', headerName: 'GS-TT-021',    width: 70, },
// { field: 'GS_VA_021', headerName: 'GS-VA-021',    width: 70, },
// { field: 'GS_VA_022', headerName: 'GS-VA-022',    width: 70, },
// { field: 'GS_VA_311', headerName: 'GS-VA-311',    width: 70, },
// { field: 'GS_VA_312', headerName: 'GS-VA-312',    width: 70, },
// { field: 'GS_VA_321', headerName: 'GS-VA-321',    width: 70, },
// { field: 'GS_VA_322', headerName: 'GS-VA-322',    width: 70, },
// { field: 'N2_VA_311', headerName: 'N2-VA-311',    width: 70, },
// { field: 'N2_VA_321', headerName: 'N2-VA-321',    width: 70, },
// { field: 'PR_AT_001', headerName: 'PR-AT-001',    width: 70, },
// { field: 'PR_AT_003', headerName: 'PR-AT-003',    width: 70, },
// { field: 'PR_AT_005', headerName: 'PR-AT-005',    width: 70, },
// { field: 'PR_FT_001', headerName: 'PR-FT-001',    width: 70, },
// { field: 'PR_TT_001', headerName: 'PR-TT-001',    width: 70, },
// { field: 'PR_TT_061', headerName: 'PR-TT-061',    width: 70, },
// { field: 'PR_TT_072', headerName: 'PR-TT-072',    width: 70, },
// { field: 'PR_VA_301', headerName: 'PR-VA-301',    width: 70, },
// { field: 'PR_VA_312', headerName: 'PR-VA-312',    width: 70, },
// { field: 'PR_VA_351', headerName: 'PR-VA-351',    width: 70, },
// { field: 'PR_VA_352', headerName: 'PR-VA-352',    width: 70, },
// { field: 'PR_VA_361Ain', headerName: 'PR-VA-361Ain',    width: 70, },
// { field: 'PR_VA_361Bin', headerName: 'PR-VA-361Bin',    width: 70, },
// { field: 'PR_VA_362Ain', headerName: 'PR-VA-362Ain',    width: 70, },
// { field: 'PR_VA_362Bin', headerName: 'PR-VA-362Bin',    width: 70, },
// { field: 'PR_VA_361Aout', headerName: 'PR-VA-361Aout',    width: 70, },
// { field: 'PR_VA_361Bout', headerName: 'PR-VA-361Bout',    width: 70, },
// { field: 'PR_VA_362Aout', headerName: 'PR-VA-362Aout',    width: 70, },
// { field: 'PR_VA_362Bout', headerName: 'PR-VA-362Bout',    width: 70, },
// { field: 'RECT_CT_001', headerName: 'RECT-CT-001',    width: 70, },
// { field: 'RECT_VT_001', headerName: 'RECT-VT-001',    width: 70, },
// { field: 'DCDB0_CT_001', headerName: 'DCDB0-CT-001',    width: 70, },
// { field: 'DCDB0_VT_001', headerName: 'DCDB0-VT-001',    width: 70, },
// { field: 'DCDB1_CT_001', headerName: 'DCDB1-CT-001',    width: 70, },
// { field: 'DCDB1_VT_001', headerName: 'DCDB1-VT-001',    width: 70, },
// { field: 'DCDB2_CT_001', headerName: 'DCDB2-CT-001',    width: 70, },
// { field: 'DCDB2_VT_001', headerName: 'DCDB2-VT-001',    width: 70, },
// { field: 'DCDB3_CT_001', headerName: 'DCDB3-CT-001',    width: 70, },
// { field: 'DCDB3_VT_001', headerName: 'DCDB3-VT-001',    width: 70, },
// { field: 'DCDB4_CT_001', headerName: 'DCDB4-CT-001',    width: 70, },
// { field: 'DCDB4_VT_001', headerName: 'DCDB4-VT-001',    width: 70, },
// { field: 'DM_LSH_001', headerName: 'DM-LSH-001',    width: 70, },
// { field: 'DM_LSL_001', headerName: 'DM-LSL-001',    width: 70, },
// { field: 'GS_LSL_011', headerName: 'GS-LSL-011',    width: 70, },
// { field: 'GS_LSL_021', headerName: 'GS-LSL-021',    width: 70, }
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
//                     ist_timestamp: row.ist_timestamp || 'N/A', // Default for missing fields
//                     Test_Name: row.device_data?.["Test-Name"] || row["test_name"], // Adjust for different structures
//                     AX_LT_011: row.device_data?.["AX-LT-011"] || row["avg_ax_lt_011"], // Adjust for different structures
//                     AX_LT_021: row.device_data?.["AX-LT-021"] || row["avg_ax_lt_021"], // Adjust for different structures
                   
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



// import React, { useState } from "react";
// import { Select, MenuItem, FormControl, InputLabel, Button } from "@mui/material";
// import { DataGrid, GridToolbar } from "@mui/x-data-grid";

// function IoTDataViewer() {
//   const [startTime, setStartTime] = useState("");
//   const [endTime, setEndTime] = useState("");
//   const [allData, setAllData] = useState([]); // Complete dataset
//   const [uniqueTestNames, setUniqueTestNames] = useState([]); // Unique Test-Names
//   const [selectedTestName, setSelectedTestName] = useState(""); // Selected Test-Name
//   const [filteredRows, setFilteredRows] = useState([]); // Filtered data for selected Test-Name
//   const [error, setError] = useState("");

//   const fetchData = async () => {
//     try {
//       const response = await fetch(
//         "https://phhm5ulen4skthqhefp7r5gp2u0yzxzd.lambda-url.us-east-1.on.aws/",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ start_time: startTime, end_time: endTime }),
//         }
//       );

//       const rawResult = await response.json();
//       console.log("Raw API Response:", rawResult);

//       const result = rawResult.body ? JSON.parse(rawResult.body) : rawResult;

//       if (response.ok) {
//         const processedData = (result.data || []).map((row) => ({
//           id: row.ist_timestamp, // Unique ID for DataGrid
//           timestamp: row.timestamp,
//           ist_timestamp: row.ist_timestamp,
//           Test_Name: row.device_data["Test-Name"],
//           AX_LT_011: row.device_data["AX-LT-011"],
//           AX_LT_021: row.device_data["AX-LT-021"],
//           AX_VA_311: row.device_data["AX-VA-311"],
//           AX_VA_312: row.device_data["AX-VA-312"],
//           AX_VA_321: row.device_data["AX-VA-321"],
//           AX_VA_322: row.device_data["AX-VA-322"],
//           AX_VA_351: row.device_data["AX-VA-351"],
//           AX_VA_391: row.device_data["AX-VA-391"],
//           CR_FT_001: row.device_data["CR-FT-001"],
//           CR_LT_011: row.device_data["CR-LT-011"],
//           CR_LT_021: row.device_data["CR-LT-021"],
//           CR_PT_001: row.device_data["CR-PT-001"],
//           CR_PT_011: row.device_data["CR-PT-011"],
//           CR_PT_021: row.device_data["CR-PT-021"],
//           CR_TT_001: row.device_data["CR-TT-001"],
//           CR_TT_002: row.device_data["CR-TT-002"],
//           CW_TT_011: row.device_data["CW-TT-011"],
//           CW_TT_021: row.device_data["CW-TT-021"],
//           DM_VA_301: row.device_data["DM-VA-301"],
//           GS_AT_011: row.device_data["GS-AT-011"],
//           GS_AT_012: row.device_data["GS-AT-012"],
//           GS_AT_022: row.device_data["GS-AT-022"],
//           GS_PT_011: row.device_data["GS-PT-011"],
//           GS_PT_021: row.device_data["GS-PT-021"],
//           GS_TT_011: row.device_data["GS-TT-011"],
//           GS_TT_021: row.device_data["GS-TT-021"],
//           GS_VA_021: row.device_data["GS-VA-021"],
//           GS_VA_022: row.device_data["GS-VA-022"],
//           GS_VA_311: row.device_data["GS-VA-311"],
//           GS_VA_312: row.device_data["GS-VA-312"],
//           GS_VA_321: row.device_data["GS-VA-321"],
//           GS_VA_322: row.device_data["GS-VA-322"],
//           N2_VA_311: row.device_data["N2-VA-311"],
//           N2_VA_321: row.device_data["N2-VA-321"],
//           PR_AT_001: row.device_data["PR-AT-001"],
//           PR_AT_003: row.device_data["PR-AT-003"],
//           PR_AT_005: row.device_data["PR-AT-005"],
//           PR_FT_001: row.device_data["PR-FT-001"],
//           PR_TT_001: row.device_data["PR-TT-001"],
//           PR_TT_061: row.device_data["PR-TT-061"],
//           PR_TT_072: row.device_data["PR-TT-072"],
//           PR_VA_301: row.device_data["PR-VA-301"],
//           PR_VA_312: row.device_data["PR-VA-312"],
//           PR_VA_351: row.device_data["PR-VA-351"],
//           PR_VA_352: row.device_data["PR-VA-352"],
//           DM_LSH_001: row.device_data["DM-LSH-001"],
//           DM_LSL_001: row.device_data["DM-LSL-001"],
//           GS_LSL_011: row.device_data["GS-LSL-011"],
//           GS_LSL_021: row.device_data["GS-LSL-021"],
//           RECT_CT_001: row.device_data["RECT-CT-001"],
//           RECT_VT_001: row.device_data["RECT-VT-001"],
//           DCDB0_CT_001: row.device_data["DCDB0-CT-001"],
//           DCDB0_VT_001: row.device_data["DCDB0-VT-001"],
//           DCDB1_CT_001: row.device_data["DCDB1-CT-001"],
//           DCDB1_VT_001: row.device_data["DCDB1-VT-001"],
//           DCDB2_CT_001: row.device_data["DCDB2-CT-001"],
//           DCDB2_VT_001: row.device_data["DCDB2-VT-001"],
//           DCDB3_CT_001: row.device_data["DCDB3-CT-001"],
//           DCDB3_VT_001: row.device_data["DCDB3-VT-001"],
//           DCDB4_CT_001: row.device_data["DCDB4-CT-001"],
//           DCDB4_VT_001: row.device_data["DCDB4-VT-001"],
//           PR_VA_361Ain: row.device_data["PR-VA-361Ain"],
//           PR_VA_361Bin: row.device_data["PR-VA-361Bin"]
          
//         }));

//         const uniqueNames = Array.from(new Set(processedData.map((row) => row.Test_Name)));

//         setAllData(processedData);
//         setUniqueTestNames(uniqueNames);
//         setError("");
//       } else {
//         setAllData([]);
//         setUniqueTestNames([]);
//         setError(result.message || "Failed to fetch data");
//       }
//     } catch (err) {
//       console.error("Error in Fetch:", err);
//       setAllData([]);
//       setUniqueTestNames([]);
//       setError(err.message || "An unexpected error occurred");
//     }
//   };

//   const handleDropdownChange = (testName) => {
//     setSelectedTestName(testName);
//     const rows = allData.filter((row) => row.Test_Name === testName);
//     setFilteredRows(rows);
//   };

//   const columns = [
//     { field: "Test_Name", headerName: "Test-Name", valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "timestamp", headerName: "Timestamp", valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "ist_timestamp", headerName: "IST Timestamp", valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "AX_LT_011", headerName: "AX-LT-011", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "AX_LT_021", headerName: "AX-LT-021", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "AX_VA_311", headerName: "AX-VA-311", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "AX_VA_312", headerName: "AX-VA-312", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "AX_VA_321", headerName: "AX-VA-321", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "AX_VA_322", headerName: "AX-VA-322", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "AX_VA_351", headerName: "AX-VA-351", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "AX_VA_391", headerName: "AX-VA-391", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "CR_FT_001", headerName: "CR-FT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "CR_LT_011", headerName: "CR-LT-011", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "CR_LT_021", headerName: "CR-LT-021", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "CR_PT_001", headerName: "CR-PT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "CR_PT_011", headerName: "CR-PT-011", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "CR_PT_021", headerName: "CR-PT-021", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "CR_TT_001", headerName: "CR-TT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "CR_TT_002", headerName: "CR-TT-002", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "CW_TT_011", headerName: "CW-TT-011", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "CW_TT_021", headerName: "CW-TT-021", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "DM_VA_301", headerName: "DM-VA-301", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "GS_AT_011", headerName: "GS-AT-011", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "GS_AT_012", headerName: "GS-AT-012", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "GS_AT_022", headerName: "GS-AT-022", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "GS_PT_011", headerName: "GS-PT-011", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "GS_PT_021", headerName: "GS-PT-021", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "GS_TT_011", headerName: "GS-TT-011", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "GS_TT_021", headerName: "GS-TT-021", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "GS_VA_021", headerName: "GS-VA-021", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "GS_VA_022", headerName: "GS-VA-022", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "GS_VA_311", headerName: "GS-VA-311", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "GS_VA_312", headerName: "GS-VA-312", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "GS_VA_321", headerName: "GS-VA-321", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "GS_VA_322", headerName: "GS-VA-322", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "N2_VA_311", headerName: "N2-VA-311", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "N2_VA_321", headerName: "N2-VA-321", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "PR_AT_001", headerName: "PR-AT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "PR_AT_003", headerName: "PR-AT-003", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "PR_AT_005", headerName: "PR-AT-005", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "PR_FT_001", headerName: "PR-FT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "PR_TT_001", headerName: "PR-TT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "PR_TT_061", headerName: "PR-TT-061", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "PR_TT_072", headerName: "PR-TT-072", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "PR_VA_301", headerName: "PR-VA-301", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "PR_VA_312", headerName: "PR-VA-312", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "PR_VA_351", headerName: "PR-VA-351", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "PR_VA_352", headerName: "PR-VA-352", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "DM_LSH_001", headerName: "DM-LSH-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "DM_LSL_001", headerName: "DM-LSL-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "GS_LSL_011", headerName: "GS-LSL-011", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "GS_LSL_021", headerName: "GS-LSL-021", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "RECT_CT_001", headerName: "RECT-CT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "RECT_VT_001", headerName: "RECT-VT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "DCDB0_CT_001", headerName: "DCDB0-CT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "DCDB0_VT_001", headerName: "DCDB0-VT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "DCDB1_CT_001", headerName: "DCDB1-CT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "DCDB1_VT_001", headerName: "DCDB1-VT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "DCDB2_CT_001", headerName: "DCDB2-CT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "DCDB2_VT_001", headerName: "DCDB2-VT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "DCDB3_CT_001", headerName: "DCDB3-CT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "DCDB3_VT_001", headerName: "DCDB3-VT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "DCDB4_CT_001", headerName: "DCDB4-CT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "DCDB4_VT_001", headerName: "DCDB4-VT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "PR_VA_361Ain", headerName: "PR-VA-361Ain", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "PR_VA_361Bin", headerName: "PR-VA-361Bin", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "PR_VA_362Ain", headerName: "PR-VA-362Ain", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "PR_VA_362Bin", headerName: "PR-VA-362Bin", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "Test_Name", headerName: "Test-Name", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "Test_Remarks", headerName: "Test-Remarks", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "PR_VA_361Aout", headerName: "PR-VA-361Aout", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "PR_VA_361Bout", headerName: "PR-VA-361Bout", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "PR_VA_362Aout", headerName: "PR-VA-362Aout", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "PR_VA_362Bout", headerName: "PR-VA-362Bout", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "PLC_TIME_STAMP", headerName: "PLC-TIME-STAMP", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "Test_description", headerName: "Test-description", valueFormatter: (params) => Number(params.value).toFixed(0) }

    
//   ];

//   return (
//     <div style={{ padding: "20px" }}>
//       <h1>IoT Data Viewer</h1>
//       <div style={{ marginBottom: "20px" }}>
//         <label style={{ marginRight: "10px" }}>
//           Start Time:
//           <input
//             type="datetime-local"
//             value={startTime}
//             onChange={(e) => setStartTime(e.target.value)}
//             style={{ marginLeft: "10px" }}
//           />
//         </label>
//         <label style={{ marginRight: "10px" }}>
//           End Time:
//           <input
//             type="datetime-local"
//             value={endTime}
//             onChange={(e) => setEndTime(e.target.value)}
//             style={{ marginLeft: "10px" }}
//           />
//         </label>
//         <Button variant="contained" onClick={fetchData}>
//           Fetch Data
//         </Button>
//       </div>

//       {error && <p style={{ color: "red" }}>{error}</p>}

//       {uniqueTestNames.length > 0 && (
//         <FormControl fullWidth style={{ marginBottom: "20px" }}>
//           <InputLabel id="test-name-dropdown-label">Select Test-Name</InputLabel>
//           <Select
//             labelId="test-name-dropdown-label"
//             value={selectedTestName}
//             onChange={(e) => handleDropdownChange(e.target.value)}
//           >
//             {uniqueTestNames.map((name, index) => (
//               <MenuItem key={index} value={name}>
//                 {name}
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>
//       )}
//       {selectedTestName && filteredRows.length > 0 && (
//         <div style={{ height: 600, width: "100%" }}>
//           <h2>Details for Test-Name: {selectedTestName}</h2>
//           <DataGrid rows={filteredRows} columns={columns} 
//           components={{
//             Toolbar: GridToolbar,
//           }}
//           componentsProps={{
//             toolbar: {
//               sx: {
//                 '& .MuiButton-root': {
//                   color: 'rgb(34 197 94)',
//                 },
//               },
//             },
//           }}
//           />
//         </div>
//       )}
//     </div>
//   );
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
//                     timestamp: row.timestamp,
//                     ist_timestamp: row.ist_timestamp,
//                     AX_LT_011: row.device_data["AX-LT-011"],
//                     Test_Name: row.device_data["Test-Name"],
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
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {filteredRows.map((row, index) => (
//                                         <tr key={index}>
//                                             <td>{row.timestamp}</td>
//                                             <td>{row.ist_timestamp}</td>
//                                             <td>{row.AX_LT_011}</td>
//                                             <td>{row.Test_Name}</td>
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



// import React, { useState } from "react";
// import { Select, MenuItem, FormControl, InputLabel, Button } from "@mui/material";
// import { DataGrid, GridToolbar } from "@mui/x-data-grid";

// function IoTDataViewer() {
//   const [startTime, setStartTime] = useState("");
//   const [endTime, setEndTime] = useState("");
//   const [allData, setAllData] = useState([]); // Complete dataset
//   const [uniqueTestNames, setUniqueTestNames] = useState([]); // Unique Test-Names
//   const [selectedTestName, setSelectedTestName] = useState(""); // Selected Test-Name
//   const [filteredRows, setFilteredRows] = useState([]); // Filtered data for selected Test-Name
//   const [error, setError] = useState("");

//   const fetchData = async () => {
//     try {
//       const response = await fetch(
//         "https://phhm5ulen4skthqhefp7r5gp2u0yzxzd.lambda-url.us-east-1.on.aws/",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ start_time: startTime, end_time: endTime }),
//         }
//       );

//       const rawResult = await response.json();
//       console.log("Raw API Response:", rawResult);

//       const result = rawResult.body ? JSON.parse(rawResult.body) : rawResult;

//       if (response.ok) {
//         const processedData = (result.data || []).map((row) => ({
//           id: row.timestamp, // Unique ID for DataGrid
//           timestamp: row.timestamp,
//           ist_timestamp: row.ist_timestamp,
//           Test_Name: row.device_data["Test-Name"],
//           AX_LT_011: row.device_data["AX-LT-011"],
//           AX_LT_021: row.device_data["AX-LT-021"],
//           AX_VA_311: row.device_data["AX-VA-311"],
//           AX_VA_312: row.device_data["AX-VA-312"],
//           AX_VA_321: row.device_data["AX-VA-321"],
//           AX_VA_322: row.device_data["AX-VA-322"],
//           AX_VA_351: row.device_data["AX-VA-351"],
//           AX_VA_391: row.device_data["AX-VA-391"],
//           CR_FT_001: row.device_data["CR-FT-001"],
//           CR_LT_011: row.device_data["CR-LT-011"],
//           CR_LT_021: row.device_data["CR-LT-021"],
//           CR_PT_001: row.device_data["CR-PT-001"],
//           CR_PT_011: row.device_data["CR-PT-011"],
//           CR_PT_021: row.device_data["CR-PT-021"],
//           CR_TT_001: row.device_data["CR-TT-001"],
//           CR_TT_002: row.device_data["CR-TT-002"],
//           CW_TT_011: row.device_data["CW-TT-011"],
//           CW_TT_021: row.device_data["CW-TT-021"],
//           DM_VA_301: row.device_data["DM-VA-301"],
//           GS_AT_011: row.device_data["GS-AT-011"],
//           GS_AT_012: row.device_data["GS-AT-012"],
//           GS_AT_022: row.device_data["GS-AT-022"],
//           GS_PT_011: row.device_data["GS-PT-011"],
//           GS_PT_021: row.device_data["GS-PT-021"],
//           GS_TT_011: row.device_data["GS-TT-011"],
//           GS_TT_021: row.device_data["GS-TT-021"],
//           GS_VA_021: row.device_data["GS-VA-021"],
//           GS_VA_022: row.device_data["GS-VA-022"],
//           GS_VA_311: row.device_data["GS-VA-311"],
//           GS_VA_312: row.device_data["GS-VA-312"],
//           GS_VA_321: row.device_data["GS-VA-321"],
//           GS_VA_322: row.device_data["GS-VA-322"],
//           N2_VA_311: row.device_data["N2-VA-311"],
//           N2_VA_321: row.device_data["N2-VA-321"],
//           PR_AT_001: row.device_data["PR-AT-001"],
//           PR_AT_003: row.device_data["PR-AT-003"],
//           PR_AT_005: row.device_data["PR-AT-005"],
//           PR_FT_001: row.device_data["PR-FT-001"],
//           PR_TT_001: row.device_data["PR-TT-001"],
//           PR_TT_061: row.device_data["PR-TT-061"],
//           PR_TT_072: row.device_data["PR-TT-072"],
//           PR_VA_301: row.device_data["PR-VA-301"],
//           PR_VA_312: row.device_data["PR-VA-312"],
//           PR_VA_351: row.device_data["PR-VA-351"],
//           PR_VA_352: row.device_data["PR-VA-352"],
//           DM_LSH_001: row.device_data["DM-LSH-001"],
//           DM_LSL_001: row.device_data["DM-LSL-001"],
//           GS_LSL_011: row.device_data["GS-LSL-011"],
//           GS_LSL_021: row.device_data["GS-LSL-021"],
//           RECT_CT_001: row.device_data["RECT-CT-001"],
//           RECT_VT_001: row.device_data["RECT-VT-001"],
//           DCDB0_CT_001: row.device_data["DCDB0-CT-001"],
//           DCDB0_VT_001: row.device_data["DCDB0-VT-001"],
//           DCDB1_CT_001: row.device_data["DCDB1-CT-001"],
//           DCDB1_VT_001: row.device_data["DCDB1-VT-001"],
//           DCDB2_CT_001: row.device_data["DCDB2-CT-001"],
//           DCDB2_VT_001: row.device_data["DCDB2-VT-001"],
//           DCDB3_CT_001: row.device_data["DCDB3-CT-001"],
//           DCDB3_VT_001: row.device_data["DCDB3-VT-001"],
//           DCDB4_CT_001: row.device_data["DCDB4-CT-001"],
//           DCDB4_VT_001: row.device_data["DCDB4-VT-001"],
//           PR_VA_361Ain: row.device_data["PR-VA-361Ain"],
//           PR_VA_361Bin: row.device_data["PR-VA-361Bin"]
          
//         }));

//         const uniqueNames = Array.from(new Set(processedData.map((row) => row.Test_Name)));

//         setAllData(processedData);
//         setUniqueTestNames(uniqueNames);
//         setError("");
//       } else {
//         setAllData([]);
//         setUniqueTestNames([]);
//         setError(result.message || "Failed to fetch data");
//       }
//     } catch (err) {
//       console.error("Error in Fetch:", err);
//       setAllData([]);
//       setUniqueTestNames([]);
//       setError(err.message || "An unexpected error occurred");
//     }
//   };

//   const handleDropdownChange = (testName) => {
//     setSelectedTestName(testName);
//     const rows = allData.filter((row) => row.Test_Name === testName);
//     setFilteredRows(rows);
//   };

//   const columns = [
//     { field: "Test_Name", headerName: "Test-Name", valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "timestamp", headerName: "Timestamp", valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "ist_timestamp", headerName: "IST Timestamp", valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "AX_LT_011", headerName: "AX-LT-011", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "AX_LT_021", headerName: "AX-LT-021", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "AX_VA_311", headerName: "AX-VA-311", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "AX_VA_312", headerName: "AX-VA-312", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "AX_VA_321", headerName: "AX-VA-321", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "AX_VA_322", headerName: "AX-VA-322", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "AX_VA_351", headerName: "AX-VA-351", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "AX_VA_391", headerName: "AX-VA-391", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "CR_FT_001", headerName: "CR-FT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "CR_LT_011", headerName: "CR-LT-011", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "CR_LT_021", headerName: "CR-LT-021", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "CR_PT_001", headerName: "CR-PT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "CR_PT_011", headerName: "CR-PT-011", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "CR_PT_021", headerName: "CR-PT-021", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "CR_TT_001", headerName: "CR-TT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "CR_TT_002", headerName: "CR-TT-002", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "CW_TT_011", headerName: "CW-TT-011", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "CW_TT_021", headerName: "CW-TT-021", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "DM_VA_301", headerName: "DM-VA-301", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "GS_AT_011", headerName: "GS-AT-011", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "GS_AT_012", headerName: "GS-AT-012", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "GS_AT_022", headerName: "GS-AT-022", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "GS_PT_011", headerName: "GS-PT-011", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "GS_PT_021", headerName: "GS-PT-021", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "GS_TT_011", headerName: "GS-TT-011", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "GS_TT_021", headerName: "GS-TT-021", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "GS_VA_021", headerName: "GS-VA-021", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "GS_VA_022", headerName: "GS-VA-022", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "GS_VA_311", headerName: "GS-VA-311", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "GS_VA_312", headerName: "GS-VA-312", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "GS_VA_321", headerName: "GS-VA-321", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "GS_VA_322", headerName: "GS-VA-322", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "N2_VA_311", headerName: "N2-VA-311", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "N2_VA_321", headerName: "N2-VA-321", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "PR_AT_001", headerName: "PR-AT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "PR_AT_003", headerName: "PR-AT-003", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "PR_AT_005", headerName: "PR-AT-005", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "PR_FT_001", headerName: "PR-FT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "PR_TT_001", headerName: "PR-TT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "PR_TT_061", headerName: "PR-TT-061", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "PR_TT_072", headerName: "PR-TT-072", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "PR_VA_301", headerName: "PR-VA-301", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "PR_VA_312", headerName: "PR-VA-312", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "PR_VA_351", headerName: "PR-VA-351", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "PR_VA_352", headerName: "PR-VA-352", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "DM_LSH_001", headerName: "DM-LSH-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "DM_LSL_001", headerName: "DM-LSL-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "GS_LSL_011", headerName: "GS-LSL-011", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "GS_LSL_021", headerName: "GS-LSL-021", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "RECT_CT_001", headerName: "RECT-CT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "RECT_VT_001", headerName: "RECT-VT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "DCDB0_CT_001", headerName: "DCDB0-CT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "DCDB0_VT_001", headerName: "DCDB0-VT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "DCDB1_CT_001", headerName: "DCDB1-CT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "DCDB1_VT_001", headerName: "DCDB1-VT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "DCDB2_CT_001", headerName: "DCDB2-CT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "DCDB2_VT_001", headerName: "DCDB2-VT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "DCDB3_CT_001", headerName: "DCDB3-CT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "DCDB3_VT_001", headerName: "DCDB3-VT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "DCDB4_CT_001", headerName: "DCDB4-CT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "DCDB4_VT_001", headerName: "DCDB4-VT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "PR_VA_361Ain", headerName: "PR-VA-361Ain", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "PR_VA_361Bin", headerName: "PR-VA-361Bin", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "PR_VA_362Ain", headerName: "PR-VA-362Ain", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "PR_VA_362Bin", headerName: "PR-VA-362Bin", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "Test_Name", headerName: "Test-Name", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "Test_Remarks", headerName: "Test-Remarks", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "PR_VA_361Aout", headerName: "PR-VA-361Aout", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "PR_VA_361Bout", headerName: "PR-VA-361Bout", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "PR_VA_362Aout", headerName: "PR-VA-362Aout", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "PR_VA_362Bout", headerName: "PR-VA-362Bout", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "PLC_TIME_STAMP", headerName: "PLC-TIME-STAMP", valueFormatter: (params) => Number(params.value).toFixed(0) },
// // { field: "Test_description", headerName: "Test-description", valueFormatter: (params) => Number(params.value).toFixed(0) }

    
//   ];

//   return (
//     <div style={{ padding: "20px" }}>
//       <h1>IoT Data Viewer</h1>
//       <div style={{ marginBottom: "20px" }}>
//         <label style={{ marginRight: "10px" }}>
//           Start Time:
//           <input
//             type="datetime-local"
//             value={startTime}
//             onChange={(e) => setStartTime(e.target.value)}
//             style={{ marginLeft: "10px" }}
//           />
//         </label>
//         <label style={{ marginRight: "10px" }}>
//           End Time:
//           <input
//             type="datetime-local"
//             value={endTime}
//             onChange={(e) => setEndTime(e.target.value)}
//             style={{ marginLeft: "10px" }}
//           />
//         </label>
//         <Button variant="contained" onClick={fetchData}>
//           Fetch Data
//         </Button>
//       </div>

//       {error && <p style={{ color: "red" }}>{error}</p>}

//       {uniqueTestNames.length > 0 && (
//         <FormControl fullWidth style={{ marginBottom: "20px" }}>
//           <InputLabel id="test-name-dropdown-label">Select Test-Name</InputLabel>
//           <Select
//             labelId="test-name-dropdown-label"
//             value={selectedTestName}
//             onChange={(e) => handleDropdownChange(e.target.value)}
//           >
//             {uniqueTestNames.map((name, index) => (
//               <MenuItem key={index} value={name}>
//                 {name}
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>
//       )}
//       {selectedTestName && filteredRows.length > 0 && (
//         <div style={{ height: 600, width: "100%" }}>
//           <h2>Details for Test-Name: {selectedTestName}</h2>
//           <DataGrid rows={filteredRows} columns={columns} 
//           components={{
//             Toolbar: GridToolbar,
//           }}
//           componentsProps={{
//             toolbar: {
//               sx: {
//                 '& .MuiButton-root': {
//                   color: 'rgb(34 197 94)',
//                 },
//               },
//             },
//           }}
//           />
//         </div>
//       )}
//     </div>
//   );
// }

// export default IoTDataViewer;




// import React, { useState } from "react";
// import { Select, MenuItem, FormControl, InputLabel, Button } from "@mui/material";
// import { DataGrid, GridToolbar } from "@mui/x-data-grid";

// function IoTDataViewer() {
//   const [startTime, setStartTime] = useState("");
//   const [endTime, setEndTime] = useState("");
//   const [allData, setAllData] = useState([]); // Complete dataset
//   const [uniqueTestNames, setUniqueTestNames] = useState([]); // Unique Test-Names
//   const [selectedTestName, setSelectedTestName] = useState(""); // Selected Test-Name
//   const [filteredRows, setFilteredRows] = useState([]); // Filtered data for selected Test-Name
//   const [error, setError] = useState("");

//   const fetchData = async () => {
//     try {
//       const response = await fetch(
//         "https://phhm5ulen4skthqhefp7r5gp2u0yzxzd.lambda-url.us-east-1.on.aws/",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ start_time: startTime, end_time: endTime }),
//         }
//       );

//       const rawResult = await response.json();
//       console.log("Raw API Response:", rawResult);

//       const result = rawResult.body ? JSON.parse(rawResult.body) : rawResult;

//       if (response.ok) {
//         const processedData = (result.data || []).map((row) => ({
//           id: row.timestamp, // Unique ID for DataGrid
//           timestamp: row.timestamp,
//           ist_timestamp: row.ist_timestamp,
//           Test_Name: row.device_data["Test-Name"],
//           AX_LT_011: row.device_data["AX-LT-011"],
//           AX_LT_021: row.device_data["AX-LT-021"],
//           AX_VA_311: row.device_data["AX-VA-311"],
//           AX_VA_312: row.device_data["AX-VA-312"],
//           AX_VA_321: row.device_data["AX-VA-321"],
//           AX_VA_322: row.device_data["AX-VA-322"],
//           AX_VA_351: row.device_data["AX-VA-351"],
//           AX_VA_391: row.device_data["AX-VA-391"],
//           CR_FT_001: row.device_data["CR-FT-001"],
//           CR_LT_011: row.device_data["CR-LT-011"],
//           CR_LT_021: row.device_data["CR-LT-021"],
//           CR_PT_001: row.device_data["CR-PT-001"],
//           CR_PT_011: row.device_data["CR-PT-011"],
//           CR_PT_021: row.device_data["CR-PT-021"],
//           CR_TT_001: row.device_data["CR-TT-001"],
//           CR_TT_002: row.device_data["CR-TT-002"],
//           CW_TT_011: row.device_data["CW-TT-011"],
//           CW_TT_021: row.device_data["CW-TT-021"],
//           DM_VA_301: row.device_data["DM-VA-301"],
//           GS_AT_011: row.device_data["GS-AT-011"],
//           GS_AT_012: row.device_data["GS-AT-012"],
//           GS_AT_022: row.device_data["GS-AT-022"],
//           GS_PT_011: row.device_data["GS-PT-011"],
//           GS_PT_021: row.device_data["GS-PT-021"],
//           GS_TT_011: row.device_data["GS-TT-011"],
//           GS_TT_021: row.device_data["GS-TT-021"],
//           GS_VA_021: row.device_data["GS-VA-021"],
//           GS_VA_022: row.device_data["GS-VA-022"],
//           GS_VA_311: row.device_data["GS-VA-311"],
//           GS_VA_312: row.device_data["GS-VA-312"],
//           GS_VA_321: row.device_data["GS-VA-321"],
//           GS_VA_322: row.device_data["GS-VA-322"],
//           N2_VA_311: row.device_data["N2-VA-311"],
//           N2_VA_321: row.device_data["N2-VA-321"],
//           PR_AT_001: row.device_data["PR-AT-001"],
//           PR_AT_003: row.device_data["PR-AT-003"],
//           PR_AT_005: row.device_data["PR-AT-005"],
//           PR_FT_001: row.device_data["PR-FT-001"],
//           PR_TT_001: row.device_data["PR-TT-001"],
//           PR_TT_061: row.device_data["PR-TT-061"],
//           PR_TT_072: row.device_data["PR-TT-072"],
//           PR_VA_301: row.device_data["PR-VA-301"],
//           PR_VA_312: row.device_data["PR-VA-312"],
//           PR_VA_351: row.device_data["PR-VA-351"],
//           PR_VA_352: row.device_data["PR-VA-352"],
//           DM_LSH_001: row.device_data["DM-LSH-001"],
//           DM_LSL_001: row.device_data["DM-LSL-001"],
//           GS_LSL_011: row.device_data["GS-LSL-011"],
//           GS_LSL_021: row.device_data["GS-LSL-021"],
//           RECT_CT_001: row.device_data["RECT-CT-001"],
//           RECT_VT_001: row.device_data["RECT-VT-001"],
//           DCDB0_CT_001: row.device_data["DCDB0-CT-001"],
//           DCDB0_VT_001: row.device_data["DCDB0-VT-001"],
//           DCDB1_CT_001: row.device_data["DCDB1-CT-001"],
//           DCDB1_VT_001: row.device_data["DCDB1-VT-001"],
//           DCDB2_CT_001: row.device_data["DCDB2-CT-001"],
//           DCDB2_VT_001: row.device_data["DCDB2-VT-001"],
//           DCDB3_CT_001: row.device_data["DCDB3-CT-001"],
//           DCDB3_VT_001: row.device_data["DCDB3-VT-001"],
//           DCDB4_CT_001: row.device_data["DCDB4-CT-001"],
//           DCDB4_VT_001: row.device_data["DCDB4-VT-001"],
//           PR_VA_361Ain: row.device_data["PR-VA-361Ain"],
//           PR_VA_361Bin: row.device_data["PR-VA-361Bin"]
          
//         }));

//         const uniqueNames = Array.from(new Set(processedData.map((row) => row.Test_Name)));

//         setAllData(processedData);
//         setUniqueTestNames(uniqueNames);
//         setError("");
//       } else {
//         setAllData([]);
//         setUniqueTestNames([]);
//         setError(result.message || "Failed to fetch data");
//       }
//     } catch (err) {
//       console.error("Error in Fetch:", err);
//       setAllData([]);
//       setUniqueTestNames([]);
//       setError(err.message || "An unexpected error occurred");
//     }
//   };

//   const handleDropdownChange = (testName) => {
//     setSelectedTestName(testName);
//     const rows = allData.filter((row) => row.Test_Name === testName);
//     setFilteredRows(rows);
//   };

//   const columns = [
//     { field: "Test_Name", headerName: "Test-Name", valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "timestamp", headerName: "Timestamp", valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "ist_timestamp", headerName: "IST Timestamp", valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "AX_LT_011", headerName: "AX-LT-011", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "AX_LT_021", headerName: "AX-LT-021", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "AX_VA_311", headerName: "AX-VA-311", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "AX_VA_312", headerName: "AX-VA-312", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "AX_VA_321", headerName: "AX-VA-321", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "AX_VA_322", headerName: "AX-VA-322", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "AX_VA_351", headerName: "AX-VA-351", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "AX_VA_391", headerName: "AX-VA-391", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "CR_FT_001", headerName: "CR-FT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "CR_LT_011", headerName: "CR-LT-011", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "CR_LT_021", headerName: "CR-LT-021", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "CR_PT_001", headerName: "CR-PT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "CR_PT_011", headerName: "CR-PT-011", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "CR_PT_021", headerName: "CR-PT-021", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "CR_TT_001", headerName: "CR-TT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "CR_TT_002", headerName: "CR-TT-002", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "CW_TT_011", headerName: "CW-TT-011", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "CW_TT_021", headerName: "CW-TT-021", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "DM_VA_301", headerName: "DM-VA-301", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "GS_AT_011", headerName: "GS-AT-011", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "GS_AT_012", headerName: "GS-AT-012", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "GS_AT_022", headerName: "GS-AT-022", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "GS_PT_011", headerName: "GS-PT-011", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "GS_PT_021", headerName: "GS-PT-021", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "GS_TT_011", headerName: "GS-TT-011", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "GS_TT_021", headerName: "GS-TT-021", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "GS_VA_021", headerName: "GS-VA-021", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "GS_VA_022", headerName: "GS-VA-022", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "GS_VA_311", headerName: "GS-VA-311", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "GS_VA_312", headerName: "GS-VA-312", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "GS_VA_321", headerName: "GS-VA-321", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "GS_VA_322", headerName: "GS-VA-322", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "N2_VA_311", headerName: "N2-VA-311", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "N2_VA_321", headerName: "N2-VA-321", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "PR_AT_001", headerName: "PR-AT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "PR_AT_003", headerName: "PR-AT-003", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "PR_AT_005", headerName: "PR-AT-005", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "PR_FT_001", headerName: "PR-FT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "PR_TT_001", headerName: "PR-TT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "PR_TT_061", headerName: "PR-TT-061", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "PR_TT_072", headerName: "PR-TT-072", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "PR_VA_301", headerName: "PR-VA-301", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "PR_VA_312", headerName: "PR-VA-312", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "PR_VA_351", headerName: "PR-VA-351", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "PR_VA_352", headerName: "PR-VA-352", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "DM_LSH_001", headerName: "DM-LSH-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "DM_LSL_001", headerName: "DM-LSL-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "GS_LSL_011", headerName: "GS-LSL-011", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "GS_LSL_021", headerName: "GS-LSL-021", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "RECT_CT_001", headerName: "RECT-CT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "RECT_VT_001", headerName: "RECT-VT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "DCDB0_CT_001", headerName: "DCDB0-CT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "DCDB0_VT_001", headerName: "DCDB0-VT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "DCDB1_CT_001", headerName: "DCDB1-CT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "DCDB1_VT_001", headerName: "DCDB1-VT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "DCDB2_CT_001", headerName: "DCDB2-CT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "DCDB2_VT_001", headerName: "DCDB2-VT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "DCDB3_CT_001", headerName: "DCDB3-CT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "DCDB3_VT_001", headerName: "DCDB3-VT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "DCDB4_CT_001", headerName: "DCDB4-CT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "DCDB4_VT_001", headerName: "DCDB4-VT-001", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "PR_VA_361Ain", headerName: "PR-VA-361Ain", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "PR_VA_361Bin", headerName: "PR-VA-361Bin", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "PR_VA_362Ain", headerName: "PR-VA-362Ain", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "PR_VA_362Bin", headerName: "PR-VA-362Bin", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "Test_Name", headerName: "Test-Name", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "Test_Remarks", headerName: "Test-Remarks", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "PR_VA_361Aout", headerName: "PR-VA-361Aout", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "PR_VA_361Bout", headerName: "PR-VA-361Bout", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "PR_VA_362Aout", headerName: "PR-VA-362Aout", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "PR_VA_362Bout", headerName: "PR-VA-362Bout", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "PLC_TIME_STAMP", headerName: "PLC-TIME-STAMP", valueFormatter: (params) => Number(params.value).toFixed(0) },
// { field: "Test_description", headerName: "Test-description", valueFormatter: (params) => Number(params.value).toFixed(0) }

    
//   ];

//   return (
//     <div style={{ padding: "20px" }}>
//       <h1>IoT Data Viewer</h1>
//       <div style={{ marginBottom: "20px" }}>
//         <label style={{ marginRight: "10px" }}>
//           Start Time:
//           <input
//             type="datetime-local"
//             value={startTime}
//             onChange={(e) => setStartTime(e.target.value)}
//             style={{ marginLeft: "10px" }}
//           />
//         </label>
//         <label style={{ marginRight: "10px" }}>
//           End Time:
//           <input
//             type="datetime-local"
//             value={endTime}
//             onChange={(e) => setEndTime(e.target.value)}
//             style={{ marginLeft: "10px" }}
//           />
//         </label>
//         <Button variant="contained" onClick={fetchData}>
//           Fetch Data
//         </Button>
//       </div>

//       {error && <p style={{ color: "red" }}>{error}</p>}

//       {uniqueTestNames.length > 0 && (
//         <FormControl fullWidth style={{ marginBottom: "20px" }}>
//           <InputLabel id="test-name-dropdown-label">Select Test-Name</InputLabel>
//           <Select
//             labelId="test-name-dropdown-label"
//             value={selectedTestName}
//             onChange={(e) => handleDropdownChange(e.target.value)}
//           >
//             {uniqueTestNames.map((name, index) => (
//               <MenuItem key={index} value={name}>
//                 {name}
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>
//       )}
//       {selectedTestName && filteredRows.length > 0 && (
//         <div style={{ height: 600, width: "100%" }}>
//           <h2>Details for Test-Name: {selectedTestName}</h2>
//           <DataGrid rows={filteredRows} columns={columns} 
//           components={{
//             Toolbar: GridToolbar,
//           }}
//           componentsProps={{
//             toolbar: {
//               sx: {
//                 '& .MuiButton-root': {
//                   color: 'rgb(34 197 94)',
//                 },
//               },
//             },
//           }}
//           />
//         </div>
//       )}
//     </div>
//   );
// }

// export default IoTDataViewer;




// import React, { useState } from "react";
// import { Select, MenuItem, FormControl, InputLabel, Button } from "@mui/material";
// import { DataGrid, GridToolbar } from "@mui/x-data-grid";

// function IoTDataViewer() {
//   const [startTime, setStartTime] = useState("");
//   const [endTime, setEndTime] = useState("");
//   const [allData, setAllData] = useState([]); // Complete dataset
//   const [uniqueTestNames, setUniqueTestNames] = useState([]); // Unique Test-Names
//   const [selectedTestName, setSelectedTestName] = useState(""); // Selected Test-Name
//   const [filteredRows, setFilteredRows] = useState([]); // Filtered data for selected Test-Name
//   const [error, setError] = useState("");

//   const fetchData = async () => {
//     try {
//       const response = await fetch(
//         "https://phhm5ulen4skthqhefp7r5gp2u0yzxzd.lambda-url.us-east-1.on.aws/",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ start_time: startTime, end_time: endTime }),
//         }
//       );

//       const rawResult = await response.json();
//       console.log("Raw API Response:", rawResult);

//       const result = rawResult.body ? JSON.parse(rawResult.body) : rawResult;

//       if (response.ok) {
//         const processedData = (result.data || []).map((row) => ({
//           id: row.timestamp, // Unique ID for DataGrid
//           timestamp: row.timestamp,
//           ist_timestamp: row.ist_timestamp,
//           Test_Name: row.device_data["Test-Name"],
//           AX_LT_011: row.device_data["AX-LT-011"],
//         }));

//         const uniqueNames = Array.from(new Set(processedData.map((row) => row.Test_Name)));

//         setAllData(processedData);
//         setUniqueTestNames(uniqueNames);
//         setError("");
//       } else {
//         setAllData([]);
//         setUniqueTestNames([]);
//         setError(result.message || "Failed to fetch data");
//       }
//     } catch (err) {
//       console.error("Error in Fetch:", err);
//       setAllData([]);
//       setUniqueTestNames([]);
//       setError(err.message || "An unexpected error occurred");
//     }
//   };

//   const handleDropdownChange = (testName) => {
//     setSelectedTestName(testName);
//     const rows = allData.filter((row) => row.Test_Name === testName);
//     setFilteredRows(rows);
//   };

//   const columns = [
//     { field: "Test_Name", headerName: "Test-Name", valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "timestamp", headerName: "Timestamp", valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "ist_timestamp", headerName: "IST Timestamp", valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "AX_LT_011", headerName: "AX-LT-011", valueFormatter: (params) => Number(params.value).toFixed(0) },
//   ];

//   return (
//     <div style={{ padding: "20px" }}>
//       <h1>IoT Data Viewer</h1>
//       <div style={{ marginBottom: "20px" }}>
//         <label style={{ marginRight: "10px" }}>
//           Start Time:
//           <input
//             type="datetime-local"
//             value={startTime}
//             onChange={(e) => setStartTime(e.target.value)}
//             style={{ marginLeft: "10px" }}
//           />
//         </label>
//         <label style={{ marginRight: "10px" }}>
//           End Time:
//           <input
//             type="datetime-local"
//             value={endTime}
//             onChange={(e) => setEndTime(e.target.value)}
//             style={{ marginLeft: "10px" }}
//           />
//         </label>
//         <Button variant="contained" onClick={fetchData}>
//           Fetch Data
//         </Button>
//       </div>

//       {error && <p style={{ color: "red" }}>{error}</p>}

//       {uniqueTestNames.length > 0 && (
//         <FormControl fullWidth style={{ marginBottom: "20px" }}>
//           <InputLabel id="test-name-dropdown-label">Select Test-Name</InputLabel>
//           <Select
//             labelId="test-name-dropdown-label"
//             value={selectedTestName}
//             onChange={(e) => handleDropdownChange(e.target.value)}
//           >
//             {uniqueTestNames.map((name, index) => (
//               <MenuItem key={index} value={name}>
//                 {name}
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>
//       )}

//       {selectedTestName && filteredRows.length > 0 && (
//         <div style={{ height: 400, width: "100%" }}>
//           <h2>Details for Test-Name: {selectedTestName}</h2>
//           <DataGrid rows={filteredRows} columns={columns} pageSize={50} 
//           components={{ Toolbar: GridToolbar }}
//           />
//         </div>
//       )}
//     </div>
//   );
// }

// export default IoTDataViewer;



// import React, { useState } from "react";

// function IoTDataViewer() {
//   const [startTime, setStartTime] = useState("");
//   const [endTime, setEndTime] = useState("");
//   const [allData, setAllData] = useState([]); // Store the complete dataset
//   const [data, setData] = useState([]); // Store the deduplicated data
//   const [error, setError] = useState("");
//   const [selectedTestName, setSelectedTestName] = useState(null); // State to store the selected Test-Name

//   const fetchData = async () => {
//     try {
//       const response = await fetch(
//         "https://phhm5ulen4skthqhefp7r5gp2u0yzxzd.lambda-url.us-east-1.on.aws/",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ start_time: startTime, end_time: endTime }),
//         }
//       );

//       const rawResult = await response.json();
//       console.log("Raw API Response:", rawResult);

//       const result = rawResult.body ? JSON.parse(rawResult.body) : rawResult;

//       console.log("Parsed Result:", result);

//       if (response.ok) {
//         const processedData = (result.data || []).map((row) => ({
//           timestamp: row.timestamp,
//           ist_timestamp: row.ist_timestamp,
//           Test_Name: row.device_data["Test-Name"],
//           AX_LT_011: row.device_data["AX-LT-011"],
          
//         }));

//         // Deduplicate data to show only the first occurrence of each Test-Name
//         const uniqueTestNames = new Set();
//         const deduplicatedData = processedData.filter((row) => {
//           if (row.Test_Name && !uniqueTestNames.has(row.Test_Name)) {
//             uniqueTestNames.add(row.Test_Name);
//             return true; // Include the row
//           }
//           return false; // Skip the row
//         });

//         setAllData(processedData); // Store the complete dataset
//         setData(deduplicatedData); // Store the deduplicated dataset
//         setError("");
//       } else {
//         setAllData([]);
//         setData([]);
//         setError(result.message || "Failed to fetch data");
//       }
//     } catch (err) {
//       console.error("Error in Fetch:", err);
//       setAllData([]);
//       setData([]);
//       setError(err.message || "An unexpected error occurred");
//     }
//   };

//   const handleTestNameClick = (testName) => {
//     setSelectedTestName(testName); // Set the selected Test-Name
//   };

//   // Filter all rows with the selected Test-Name
//   const filteredRows = selectedTestName
//     ? allData.filter((row) => row.Test_Name === selectedTestName)
//     : [];

//   return (
//     <div>
//       <h1>IoT Data Viewer</h1>
//       <div>
//         <label>
//           Start Time:
//           <input
//             type="datetime-local"
//             value={startTime}
//             onChange={(e) => setStartTime(e.target.value)}
//           />
//         </label>
//         <label>
//           End Time:
//           <input
//             type="datetime-local"
//             value={endTime}
//             onChange={(e) => setEndTime(e.target.value)}
//           />
//         </label>
//         <button onClick={fetchData}>Fetch Data</button>
//       </div>
//       {error && <p style={{ color: "red" }}>{error}</p>}
//       {data.length > 0 ? (
//         <>
//           <table border="1">
//             <thead>
//               <tr>
//                 {" "}
//                 <th className="border-4">Test-Name</th>
//                 <th className="border-4">Timestamp</th>
//                 <th className="border-4">IST Timestamp</th>
//               </tr>
//             </thead>
//             <tbody>
//               {data.map((row, index) => (
//                 <tr key={index}>
//                   <td>
//                     <button
//                       style={{
//                         background: "none",
//                         border: "none",
//                         color: "blue",
//                         cursor: "pointer",
//                       }}
//                       onClick={() => handleTestNameClick(row.Test_Name)}
//                     >
//                       {row.Test_Name}
//                     </button>
//                   </td>
//                   <td>{row.timestamp}</td>
//                   <td>{row.ist_timestamp}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           {selectedTestName && filteredRows.length > 0 && (
//             <>
//               <h2>Details for Test-Name: {selectedTestName}</h2>
//               <table border="1">
//                 <thead>
//                   <tr>
//                     <th className="border-4">Test-Name</th>
//                     <th className="border-4">Timestamp</th>
//                     <th className="border-4">IST Timestamp</th>
//                     <th className="border-4">AX-LT-011</th>
                    
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredRows.map((row, index) => (
//                     <tr key={index}>
//                       <td className="border-4">{row.Test_Name}</td>
//                       <td className="border-4">{row.timestamp}</td>
//                       <td className="border-4">{row.ist_timestamp}</td>
//                       <td className="border-4">{row.AX_LT_011}</td>
                      
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </>
//           )}
//         </>
//       ) : (
//         <p>No data available for the selected date range.</p>
//       )}
//     </div>
//   );
// }

// export default IoTDataViewer; 


// import React, { useState } from "react";
// import { Select, MenuItem, FormControl, InputLabel, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";

// function IoTDataViewer() {
//   const [startTime, setStartTime] = useState("");
//   const [endTime, setEndTime] = useState("");
//   const [allData, setAllData] = useState([]); // Store the complete dataset
//   const [data, setData] = useState([]); // Store the deduplicated data
//   const [error, setError] = useState("");
//   const [selectedTestName, setSelectedTestName] = useState(""); // State to store the selected Test-Name
//   const [filteredData, setFilteredData] = useState([]); // Filtered data for the selected Test-Name

//   const fetchData = async () => {
//     try {
//       const response = await fetch(
//         "https://phhm5ulen4skthqhefp7r5gp2u0yzxzd.lambda-url.us-east-1.on.aws/",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ start_time: startTime, end_time: endTime }),
//         }
//       );

//       const rawResult = await response.json();
//       console.log("Raw API Response:", rawResult);

//       const result = rawResult.body ? JSON.parse(rawResult.body) : rawResult;

//       console.log("Parsed Result:", result);

//       if (response.ok) {
//         const processedData = (result.data || []).map((row) => ({
//           timestamp: row.timestamp,
//           ist_timestamp: row.ist_timestamp,
//           Test_Name: row.device_data["Test-Name"],
//           AX_LT_011: row.device_data["AX-LT-011"],
//           AX_LT_021: row.device_data["AX-LT-021"], // Add all your other device tags here...
//         }));

//         // Deduplicate data to show only the first occurrence of each Test-Name
//         const uniqueTestNames = new Set();
//         const deduplicatedData = processedData.filter((row) => {
//           if (row.Test_Name && !uniqueTestNames.has(row.Test_Name)) {
//             uniqueTestNames.add(row.Test_Name);
//             return true; // Include the row
//           }
//           return false; // Skip the row
//         });

//         setAllData(processedData); // Store the complete dataset
//         setData(deduplicatedData); // Store the deduplicated dataset
//         setError("");
//       } else {
//         setAllData([]);
//         setData([]);
//         setError(result.message || "Failed to fetch data");
//       }
//     } catch (err) {
//       console.error("Error in Fetch:", err);
//       setAllData([]);
//       setData([]);
//       setError(err.message || "An unexpected error occurred");
//     }
//   };

//   const handleTestNameChange = (event) => {
//     const selectedTest = event.target.value;
//     setSelectedTestName(selectedTest);

//     if (selectedTest) {
//       // Filter the data based on the selected Test-Name
//       const filteredRows = allData.filter((row) => row.Test_Name === selectedTest);
//       setFilteredData(filteredRows);
//     } else {
//       setFilteredData([]); // Clear filtered data if no test is selected
//     }
//   };

//   return (
//     <div>
//       <h1>IoT Data Viewer</h1>
//       <div>
//         <label>
//           Start Time:
//           <input
//             type="datetime-local"
//             value={startTime}
//             onChange={(e) => setStartTime(e.target.value)}
//           />
//         </label>
//         <label>
//           End Time:
//           <input
//             type="datetime-local"
//             value={endTime}
//             onChange={(e) => setEndTime(e.target.value)}
//           />
//         </label>
//         <Button onClick={fetchData} variant="contained" color="primary">Fetch Data</Button>
//       </div>
//       {error && <p style={{ color: "red" }}>{error}</p>}

//       {data.length > 0 ? (
//         <>
//           {/* Material-UI Dropdown for selecting Test-Name */}
//           <FormControl fullWidth>
//             <InputLabel id="test-name-select-label">Select Test-Name</InputLabel>
//             <Select
//               labelId="test-name-select-label"
//               value={selectedTestName}
//               onChange={handleTestNameChange}
//               label="Test-Name"
//             >
//               <MenuItem value="">-- Select Test-Name --</MenuItem>
//               {data.map((row, index) => (
//                 <MenuItem key={index} value={row.Test_Name}>
//                   {row.Test_Name}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>

//           {/* Display filtered data based on the selected Test-Name using Material-UI Table */}
//           {selectedTestName && filteredData.length > 0 && (
//             <>
//               <h2>Details for Test-Name: {selectedTestName}</h2>
//               <TableContainer component={Paper}>
//                 <Table>
//                   <TableHead>
//                     <TableRow>
//                       <TableCell><strong>Test-Name</strong></TableCell>
//                       <TableCell><strong>Timestamp</strong></TableCell>
//                       <TableCell><strong>IST Timestamp</strong></TableCell>
//                       <TableCell><strong>AX-LT-011</strong></TableCell>
//                       <TableCell><strong>AX-LT-021</strong></TableCell>
//                       {/* Add more columns as needed */}
//                     </TableRow>
//                   </TableHead>
//                   <TableBody>
//                     {filteredData.map((row, index) => (
//                       <TableRow key={index}>
//                         <TableCell>{row.Test_Name}</TableCell>
//                         <TableCell>{row.timestamp}</TableCell>
//                         <TableCell>{row.ist_timestamp}</TableCell>
//                         <TableCell>{row.AX_LT_011}</TableCell>
//                         <TableCell>{row.AX_LT_021}</TableCell>
//                         {/* Add more rows as needed */}
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </TableContainer>
//             </>
//           )}
//         </>
//       ) : (
//         <p>No data available for the selected date range.</p>
//       )}
//     </div>
//   );
// }

// export default IoTDataViewer;




// import React, { useState } from "react";
// import { Select, MenuItem, FormControl, InputLabel, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";

// function IoTDataViewer() {
//   const [startTime, setStartTime] = useState("");
//   const [endTime, setEndTime] = useState("");
//   const [allData, setAllData] = useState([]); // Store the complete dataset
//   const [data, setData] = useState([]); // Store the deduplicated data
//   const [error, setError] = useState("");
//   const [selectedTestName, setSelectedTestName] = useState(""); // State to store the selected Test-Name
//   const [filteredData, setFilteredData] = useState([]); // Filtered data for the selected Test-Name

//   const fetchData = async () => {
//     try {
//       const response = await fetch(
//         "https://phhm5ulen4skthqhefp7r5gp2u0yzxzd.lambda-url.us-east-1.on.aws/",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ start_time: startTime, end_time: endTime }),
//         }
//       );

//       const rawResult = await response.json();
//       console.log("Raw API Response:", rawResult);

//       const result = rawResult.body ? JSON.parse(rawResult.body) : rawResult;

//       console.log("Parsed Result:", result);

//       if (response.ok) {
//         const processedData = (result.data || []).map((row) => ({
//           timestamp: row.timestamp,
//           ist_timestamp: row.ist_timestamp,
//           Test_Name: row.device_data["Test-Name"],
//           AX_LT_011: row.device_data["AX-LT-011"],
//           AX_LT_021: row.device_data["AX-LT-021"], // Add all your other device tags here...
//         }));

//         // Deduplicate data to show only the first occurrence of each Test-Name
//         const uniqueTestNames = new Set();
//         const deduplicatedData = processedData.filter((row) => {
//           if (row.Test_Name && !uniqueTestNames.has(row.Test_Name)) {
//             uniqueTestNames.add(row.Test_Name);
//             return true; // Include the row
//           }
//           return false; // Skip the row
//         });

//         setAllData(processedData); // Store the complete dataset
//         setData(deduplicatedData); // Store the deduplicated dataset
//         setError("");
//       } else {
//         setAllData([]);
//         setData([]);
//         setError(result.message || "Failed to fetch data");
//       }
//     } catch (err) {
//       console.error("Error in Fetch:", err);
//       setAllData([]);
//       setData([]);
//       setError(err.message || "An unexpected error occurred");
//     }
//   };

//   const handleTestNameChange = (event) => {
//     const selectedTest = event.target.value;
//     setSelectedTestName(selectedTest);

//     if (selectedTest) {
//       // Filter the data based on the selected Test-Name
//       const filteredRows = allData.filter((row) => row.Test_Name === selectedTest);
//       setFilteredData(filteredRows);
//     } else {
//       setFilteredData([]); // Clear filtered data if no test is selected
//     }
//   };

//   return (
//     <div>
//       <h1>IoT Data Viewer</h1>
//       <div>
//         <label>
//           Start Time:
//           <input
//             type="datetime-local"
//             value={startTime}
//             onChange={(e) => setStartTime(e.target.value)}
//           />
//         </label>
//         <label>
//           End Time:
//           <input
//             type="datetime-local"
//             value={endTime}
//             onChange={(e) => setEndTime(e.target.value)}
//           />
//         </label>
//         <Button onClick={fetchData} variant="contained" color="primary">Fetch Data</Button>
//       </div>
//       {error && <p style={{ color: "red" }}>{error}</p>}

//       {data.length > 0 ? (
//         <>
//           {/* Material-UI Dropdown for selecting Test-Name */}
//           <FormControl fullWidth>
//             <InputLabel id="test-name-select-label">Select Test-Name</InputLabel>
//             <Select
//               labelId="test-name-select-label"
//               value={selectedTestName}
//               onChange={handleTestNameChange}
//               label="Test-Name"
//             >
//               <MenuItem value="">-- Select Test-Name --</MenuItem>
//               {data.map((row, index) => (
//                 <MenuItem key={index} value={row.Test_Name}>
//                   {row.Test_Name}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>

//           {/* Display filtered data based on the selected Test-Name using Material-UI Table */}
//           {selectedTestName && filteredData.length > 0 && (
//             <>
//               <h2>Details for Test-Name: {selectedTestName}</h2>
//               <TableContainer component={Paper}>
//                 <Table>
//                   <TableHead>
//                     <TableRow>
//                       <TableCell><strong>Test-Name</strong></TableCell>
//                       <TableCell><strong>Timestamp</strong></TableCell>
//                       <TableCell><strong>IST Timestamp</strong></TableCell>
//                       <TableCell><strong>AX-LT-011</strong></TableCell>
//                       <TableCell><strong>AX-LT-021</strong></TableCell>
//                       {/* Add more columns as needed */}
//                     </TableRow>
//                   </TableHead>
//                   <TableBody>
//                     {filteredData.map((row, index) => (
//                       <TableRow key={index}>
//                         <TableCell>{row.Test_Name}</TableCell>
//                         <TableCell>{row.timestamp}</TableCell>
//                         <TableCell>{row.ist_timestamp}</TableCell>
//                         <TableCell>{row.AX_LT_011}</TableCell>
//                         <TableCell>{row.AX_LT_021}</TableCell>
//                         {/* Add more rows as needed */}
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </TableContainer>
//             </>
//           )}
//         </>
//       ) : (
//         <p>No data available for the selected date range.</p>
//       )}
//     </div>
//   );
// }

// export default IoTDataViewer;




// import React, { useState } from "react";
// import { Select, MenuItem, FormControl, InputLabel, Button } from "@mui/material";

// function IoTDataViewer() {
//   const [startTime, setStartTime] = useState("");
//   const [endTime, setEndTime] = useState("");
//   const [allData, setAllData] = useState([]); // Store the complete dataset
//   const [data, setData] = useState([]); // Store the deduplicated data
//   const [error, setError] = useState("");
//   const [selectedTestName, setSelectedTestName] = useState(""); // State to store the selected Test-Name
//   const [filteredData, setFilteredData] = useState([]); // Filtered data for the selected Test-Name

//   const fetchData = async () => {
//     try {
//       const response = await fetch(
//         "https://phhm5ulen4skthqhefp7r5gp2u0yzxzd.lambda-url.us-east-1.on.aws/",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ start_time: startTime, end_time: endTime }),
//         }
//       );

//       const rawResult = await response.json();
//       console.log("Raw API Response:", rawResult);

//       const result = rawResult.body ? JSON.parse(rawResult.body) : rawResult;

//       console.log("Parsed Result:", result);

//       if (response.ok) {
//         const processedData = (result.data || []).map((row) => ({
//           timestamp: row.timestamp,
//           ist_timestamp: row.ist_timestamp,
//           Test_Name: row.device_data["Test-Name"],
//           AX_LT_011: row.device_data["AX-LT-011"],
//           AX_LT_021: row.device_data["AX-LT-021"], // Add all your other device tags here...
//         }));

//         // Deduplicate data to show only the first occurrence of each Test-Name
//         const uniqueTestNames = new Set();
//         const deduplicatedData = processedData.filter((row) => {
//           if (row.Test_Name && !uniqueTestNames.has(row.Test_Name)) {
//             uniqueTestNames.add(row.Test_Name);
//             return true; // Include the row
//           }
//           return false; // Skip the row
//         });

//         setAllData(processedData); // Store the complete dataset
//         setData(deduplicatedData); // Store the deduplicated dataset
//         setError("");
//       } else {
//         setAllData([]);
//         setData([]);
//         setError(result.message || "Failed to fetch data");
//       }
//     } catch (err) {
//       console.error("Error in Fetch:", err);
//       setAllData([]);
//       setData([]);
//       setError(err.message || "An unexpected error occurred");
//     }
//   };

//   const handleTestNameChange = (event) => {
//     const selectedTest = event.target.value;
//     setSelectedTestName(selectedTest);

//     if (selectedTest) {
//       // Filter the data based on the selected Test-Name
//       const filteredRows = allData.filter((row) => row.Test_Name === selectedTest);
//       setFilteredData(filteredRows);
//     } else {
//       setFilteredData([]); // Clear filtered data if no test is selected
//     }
//   };

//   return (
//     <div>
//       <h1>IoT Data Viewer</h1>
//       <div>
//         <label>
//           Start Time:
//           <input
//             type="datetime-local"
//             value={startTime}
//             onChange={(e) => setStartTime(e.target.value)}
//           />
//         </label>
//         <label>
//           End Time:
//           <input
//             type="datetime-local"
//             value={endTime}
//             onChange={(e) => setEndTime(e.target.value)}
//           />
//         </label>
//         <Button onClick={fetchData} variant="contained" color="primary">Fetch Data</Button>
//       </div>
//       {error && <p style={{ color: "red" }}>{error}</p>}

//       {data.length > 0 ? (
//         <>
//           {/* Material-UI Dropdown for selecting Test-Name */}
//           <FormControl fullWidth>
//             <InputLabel id="test-name-select-label">Select Test-Name</InputLabel>
//             <Select
//               labelId="test-name-select-label"
//               value={selectedTestName}
//               onChange={handleTestNameChange}
//               label="Test-Name"
//             >
//               <MenuItem value="">-- Select Test-Name --</MenuItem>
//               {data.map((row, index) => (
//                 <MenuItem key={index} value={row.Test_Name}>
//                   {row.Test_Name}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>

//           {/* Display filtered data based on the selected Test-Name */}
//           {selectedTestName && filteredData.length > 0 && (
//             <>
//               <h2>Details for Test-Name: {selectedTestName}</h2>
//               <div>
//                 {filteredData.map((row, index) => (
//                   <div key={index}>
//                     <p><strong>Test-Name:</strong> {row.Test_Name}</p>
//                     <p><strong>Timestamp:</strong> {row.timestamp}</p>
//                     <p><strong>IST Timestamp:</strong> {row.ist_timestamp}</p>
//                     <p><strong>AX-LT-011:</strong> {row.AX_LT_011}</p>
//                     <p><strong>AX-LT-021:</strong> {row.AX_LT_021}</p>
//                     {/* Add more tags as needed */}
//                   </div>
//                 ))}
//               </div>
//             </>
//           )}
//         </>
//       ) : (
//         <p>No data available for the selected date range.</p>
//       )}
//     </div>
//   );
// }

// export default IoTDataViewer;





// import React, { useState } from "react";

// function IoTDataViewer() {
//   const [startTime, setStartTime] = useState("");
//   const [endTime, setEndTime] = useState("");
//   const [allData, setAllData] = useState([]); // Store the complete dataset
//   const [data, setData] = useState([]); // Store the deduplicated data
//   const [error, setError] = useState("");
//   const [selectedTestName, setSelectedTestName] = useState(null); // State to store the selected Test-Name

//   const fetchData = async () => {
//     try {
//       const response = await fetch(
//         "https://phhm5ulen4skthqhefp7r5gp2u0yzxzd.lambda-url.us-east-1.on.aws/",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ start_time: startTime, end_time: endTime }),
//         }
//       );

//       const rawResult = await response.json();
//       console.log("Raw API Response:", rawResult);

//       const result = rawResult.body ? JSON.parse(rawResult.body) : rawResult;

//       console.log("Parsed Result:", result);

//       if (response.ok) {
//         const processedData = (result.data || []).map((row) => ({
//           timestamp: row.timestamp,
//           ist_timestamp: row.ist_timestamp,
//           Test_Name: row.device_data["Test-Name"],
//           AX_LT_011: row.device_data["AX-LT-011"],
//           AX_LT_021: row.device_data["AX-LT-021"],
//           AX_VA_311: row.device_data["AX-VA-311"],
//           AX_VA_312: row.device_data["AX-VA-312"],
//           AX_VA_321: row.device_data["AX-VA-321"],
//           AX_VA_322: row.device_data["AX-VA-322"],
//           AX_VA_351: row.device_data["AX-VA-351"],
//           AX_VA_391: row.device_data["AX-VA-391"],
//           CR_FT_001: row.device_data["CR-FT-001"],
//           CR_LT_011: row.device_data["CR-LT-011"],
//           CR_LT_021: row.device_data["CR-LT-021"],
//           CR_PT_001: row.device_data["CR-PT-001"],
//           CR_PT_011: row.device_data["CR-PT-011"],
//           CR_PT_021: row.device_data["CR-PT-021"],
//           CR_TT_001: row.device_data["CR-TT-001"],
//           CR_TT_002: row.device_data["CR-TT-002"],
//           CW_TT_011: row.device_data["CW-TT-011"],
//           CW_TT_021: row.device_data["CW-TT-021"],
//           DM_VA_301: row.device_data["DM-VA-301"],
//           GS_AT_011: row.device_data["GS-AT-011"],
//           GS_AT_012: row.device_data["GS-AT-012"],
//           GS_AT_022: row.device_data["GS-AT-022"],
//           GS_PT_011: row.device_data["GS-PT-011"],
//           GS_PT_021: row.device_data["GS-PT-021"],
//           GS_TT_011: row.device_data["GS-TT-011"],
//           GS_TT_021: row.device_data["GS-TT-021"],
//           GS_VA_021: row.device_data["GS-VA-021"],
//           GS_VA_022: row.device_data["GS-VA-022"],
//           GS_VA_311: row.device_data["GS-VA-311"],
//           GS_VA_312: row.device_data["GS-VA-312"],
//           GS_VA_321: row.device_data["GS-VA-321"],
//           GS_VA_322: row.device_data["GS-VA-322"],
//           N2_VA_311: row.device_data["N2-VA-311"],
//           N2_VA_321: row.device_data["N2-VA-321"],
//           PR_AT_001: row.device_data["PR-AT-001"],
//           PR_AT_003: row.device_data["PR-AT-003"],
//           PR_AT_005: row.device_data["PR-AT-005"],
//           PR_FT_001: row.device_data["PR-FT-001"],
//           PR_TT_001: row.device_data["PR-TT-001"],
//           PR_TT_061: row.device_data["PR-TT-061"],
//           PR_TT_072: row.device_data["PR-TT-072"],
//           PR_VA_301: row.device_data["PR-VA-301"],
//           PR_VA_312: row.device_data["PR-VA-312"],
//           PR_VA_351: row.device_data["PR-VA-351"],
//           PR_VA_352: row.device_data["PR-VA-352"],
//           DM_LSH_001: row.device_data["DM-LSH-001"],
//           DM_LSL_001: row.device_data["DM-LSL-001"],
//           GS_LSL_011: row.device_data["GS-LSL-011"],
//           GS_LSL_021: row.device_data["GS-LSL-021"],
//           RECT_CT_001: row.device_data["RECT-CT-001"],
//           RECT_VT_001: row.device_data["RECT-VT-001"],
//           DCDB0_CT_001: row.device_data["DCDB0-CT-001"],
//           DCDB0_VT_001: row.device_data["DCDB0-VT-001"],
//           DCDB1_CT_001: row.device_data["DCDB1-CT-001"],
//           DCDB1_VT_001: row.device_data["DCDB1-VT-001"],
//           DCDB2_CT_001: row.device_data["DCDB2-CT-001"],
//           DCDB2_VT_001: row.device_data["DCDB2-VT-001"],
//           DCDB3_CT_001: row.device_data["DCDB3-CT-001"],
//           DCDB3_VT_001: row.device_data["DCDB3-VT-001"],
//           DCDB4_CT_001: row.device_data["DCDB4-CT-001"],
//           DCDB4_VT_001: row.device_data["DCDB4-VT-001"],
//           PR_VA_361Ain: row.device_data["PR-VA-361Ain"],
//           PR_VA_361Bin: row.device_data["PR-VA-361Bin"],
//           PR_VA_362Ain: row.device_data["PR-VA-362Ain"],
//           PR_VA_362Bin: row.device_data["PR-VA-362Bin"],
//           Test_Remarks: row.device_data["Test-Remarks"],
//           PR_VA_361Aout: row.device_data["PR-VA-361Aout"],
//           PR_VA_361Bout: row.device_data["PR-VA-361Bout"],
//           PR_VA_362Aout: row.device_data["PR-VA-362Aout"],
//           PR_VA_362Bout: row.device_data["PR-VA-362Bout"],
//           PLC_TIME_STAMP: row.device_data["PLC-TIME-STAMP"],
//           Test_description: row.device_data["Test-description"],
//         }));

//         // Deduplicate data to show only the first occurrence of each Test-Name
//         const uniqueTestNames = new Set();
//         const deduplicatedData = processedData.filter((row) => {
//           if (row.Test_Name && !uniqueTestNames.has(row.Test_Name)) {
//             uniqueTestNames.add(row.Test_Name);
//             return true; // Include the row
//           }
//           return false; // Skip the row
//         });

//         setAllData(processedData); // Store the complete dataset
//         setData(deduplicatedData); // Store the deduplicated dataset
//         setError("");
//       } else {
//         setAllData([]);
//         setData([]);
//         setError(result.message || "Failed to fetch data");
//       }
//     } catch (err) {
//       console.error("Error in Fetch:", err);
//       setAllData([]);
//       setData([]);
//       setError(err.message || "An unexpected error occurred");
//     }
//   };

//   const handleTestNameClick = (testName) => {
//     setSelectedTestName(testName); // Set the selected Test-Name
//   };

//   // Filter all rows with the selected Test-Name
//   const filteredRows = selectedTestName
//     ? allData.filter((row) => row.Test_Name === selectedTestName)
//     : [];

//   return (
//     <div>
//       <h1>IoT Data Viewer</h1>
//       <div>
//         <label>
//           Start Time:
//           <input
//             type="datetime-local"
//             value={startTime}
//             onChange={(e) => setStartTime(e.target.value)}
//           />
//         </label>
//         <label>
//           End Time:
//           <input
//             type="datetime-local"
//             value={endTime}
//             onChange={(e) => setEndTime(e.target.value)}
//           />
//         </label>
//         <button onClick={fetchData}>Fetch Data</button>
//       </div>
//       {error && <p style={{ color: "red" }}>{error}</p>}
//       {data.length > 0 ? (
//         <>
//           <table border="1">
//             <thead>
//               <tr>
//                 {" "}
//                 <th className="border-4">Test-Name</th>
//                 <th className="border-4">Timestamp</th>
//                 <th className="border-4">IST Timestamp</th>
//               </tr>
//             </thead>
//             <tbody>
//               {data.map((row, index) => (
//                 <tr key={index}>
//                   <td>
//                     <button
//                       style={{
//                         background: "none",
//                         border: "none",
//                         color: "blue",
//                         cursor: "pointer",
//                       }}
//                       onClick={() => handleTestNameClick(row.Test_Name)}
//                     >
//                       {row.Test_Name}
//                     </button>
//                   </td>
//                   <td>{row.timestamp}</td>
//                   <td>{row.ist_timestamp}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           {selectedTestName && filteredRows.length > 0 && (
//             <>
//               <h2>Details for Test-Name: {selectedTestName}</h2>
//               <table border="1">
//                 <thead>
//                   <tr>
//                     <th className="border-4">Test-Name</th>
//                     <th className="border-4">Timestamp</th>
//                     <th className="border-4">IST Timestamp</th>
//                     <th className="border-4">AX-LT-011</th>
//                     <th className="border-4">AX-LT-021</th>
//                     <th className="border-4">AX-VA-311</th>
//                     <th className="border-4">AX-VA-312</th>
//                     <th className="border-4">AX-VA-321</th>
//                     <th className="border-4">AX-VA-322</th>
//                     <th className="border-4">AX-VA-351</th>
//                     <th className="border-4">AX-VA-391</th>
//                     <th className="border-4">CR-FT-001</th>
//                     <th className="border-4">CR-LT-011</th>
//                     <th className="border-4">CR-LT-021</th>
//                     <th className="border-4">CR-PT-001</th>
//                     <th className="border-4">CR-PT-011</th>
//                     <th className="border-4">CR-PT-021</th>
//                     <th className="border-4">CR-TT-001</th>
//                     <th className="border-4">CR-TT-002</th>
//                     <th className="border-4">CW-TT-011</th>
//                     <th className="border-4">CW-TT-021</th>
//                     <th className="border-4">DM-VA-301</th>
//                     <th className="border-4">GS-AT-011</th>
//                     <th className="border-4">GS-AT-012</th>
//                     <th className="border-4">GS-AT-022</th>
//                     <th className="border-4">GS-PT-011</th>
//                     <th className="border-4">GS-PT-021</th>
//                     <th className="border-4">GS-TT-011</th>
//                     <th className="border-4">GS-TT-021</th>
//                     <th className="border-4">GS-VA-021</th>
//                     <th className="border-4">GS-VA-022</th>
//                     <th className="border-4">GS-VA-311</th>
//                     <th className="border-4">GS-VA-312</th>
//                     <th className="border-4">GS-VA-321</th>
//                     <th className="border-4">GS-VA-322</th>
//                     <th className="border-4">N2-VA-311</th>
//                     <th className="border-4">N2-VA-321</th>
//                     <th className="border-4">PR-AT-001</th>
//                     <th className="border-4">PR-AT-003</th>
//                     <th className="border-4">PR-AT-005</th>
//                     <th className="border-4">PR-FT-001</th>
//                     <th className="border-4">PR-TT-001</th>
//                     <th className="border-4">PR-TT-061</th>
//                     <th className="border-4">PR-TT-072</th>
//                     <th className="border-4">PR-VA-301</th>
//                     <th className="border-4">PR-VA-312</th>
//                     <th className="border-4">PR-VA-351</th>
//                     <th className="border-4">PR-VA-352</th>
//                     <th className="border-4">Test-Name</th>
//                     <th className="border-4">DM-LSH-001</th>
//                     <th className="border-4">DM-LSL-001</th>
//                     <th className="border-4">GS-LSL-011</th>
//                     <th className="border-4">GS-LSL-021</th>
//                     <th className="border-4">RECT-CT-001</th>
//                     <th className="border-4">RECT-VT-001</th>
//                     <th className="border-4">DCDB0-CT-001</th>
//                     <th className="border-4">DCDB0-VT-001</th>
//                     <th className="border-4">DCDB1-CT-001</th>
//                     <th className="border-4">DCDB1-VT-001</th>
//                     <th className="border-4">DCDB2-CT-001</th>
//                     <th className="border-4">DCDB2-VT-001</th>
//                     <th className="border-4">DCDB3-CT-001</th>
//                     <th className="border-4">DCDB3-VT-001</th>
//                     <th className="border-4">DCDB4-CT-001</th>
//                     <th className="border-4">DCDB4-VT-001</th>
//                     <th className="border-4">PR-VA-361Ain</th>
//                     <th className="border-4">PR-VA-361Bin</th>
//                     <th className="border-4">PR-VA-362Ain</th>
//                     <th className="border-4">PR-VA-362Bin</th>
//                     <th className="border-4">Test-Remarks</th>
//                     <th className="border-4">PR-VA-361Aout</th>
//                     <th className="border-4">PR-VA-361Bout</th>
//                     <th className="border-4">PR-VA-362Aout</th>
//                     <th className="border-4">PR-VA-362Bout</th>
//                     <th className="border-4">PLC-TIME-STAMP</th>
//                     <th className="border-4">Test-description</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredRows.map((row, index) => (
//                     <tr key={index}>
//                       <td className="border-4">{row.Test_Name}</td>
//                       <td className="border-4">{row.timestamp}</td>
//                       <td className="border-4">{row.ist_timestamp}</td>
//                       <td className="border-4">{row.AX_LT_011}</td>
//                       <td className="border-4">{row.AX_LT_021}</td>
//                       <td className="border-4">{row.AX_VA_311}</td>
//                       <td className="border-4">{row.AX_VA_312}</td>
//                       <td className="border-4">{row.AX_VA_321}</td>
//                       <td className="border-4">{row.AX_VA_322}</td>
//                       <td className="border-4">{row.AX_VA_351}</td>
//                       <td className="border-4">{row.AX_VA_391}</td>
//                       <td className="border-4">{row.CR_FT_001}</td>
//                       <td className="border-4">{row.CR_LT_011}</td>
//                       <td className="border-4">{row.CR_LT_021}</td>
//                       <td className="border-4">{row.CR_PT_001}</td>
//                       <td className="border-4">{row.CR_PT_011}</td>
//                       <td className="border-4">{row.CR_PT_021}</td>
//                       <td className="border-4">{row.CR_TT_001}</td>
//                       <td className="border-4">{row.CR_TT_002}</td>
//                       <td className="border-4">{row.CW_TT_011}</td>
//                       <td className="border-4">{row.CW_TT_021}</td>
//                       <td className="border-4">{row.DM_VA_301}</td>
//                       <td className="border-4">{row.GS_AT_011}</td>
//                       <td className="border-4">{row.GS_AT_012}</td>
//                       <td className="border-4">{row.GS_AT_022}</td>
//                       <td className="border-4">{row.GS_PT_011}</td>
//                       <td className="border-4">{row.GS_PT_021}</td>
//                       <td className="border-4">{row.GS_TT_011}</td>
//                       <td className="border-4">{row.GS_TT_021}</td>
//                       <td className="border-4">{row.GS_VA_021}</td>
//                       <td className="border-4">{row.GS_VA_022}</td>
//                       <td className="border-4">{row.GS_VA_311}</td>
//                       <td className="border-4">{row.GS_VA_312}</td>
//                       <td className="border-4">{row.GS_VA_321}</td>
//                       <td className="border-4">{row.GS_VA_322}</td>
//                       <td className="border-4">{row.N2_VA_311}</td>
//                       <td className="border-4">{row.N2_VA_321}</td>
//                       <td className="border-4">{row.PR_AT_001}</td>
//                       <td className="border-4">{row.PR_AT_003}</td>
//                       <td className="border-4">{row.PR_AT_005}</td>
//                       <td className="border-4">{row.PR_FT_001}</td>
//                       <td className="border-4">{row.PR_TT_001}</td>
//                       <td className="border-4">{row.PR_TT_061}</td>
//                       <td className="border-4">{row.PR_TT_072}</td>
//                       <td className="border-4">{row.PR_VA_301}</td>
//                       <td className="border-4">{row.PR_VA_312}</td>
//                       <td className="border-4">{row.PR_VA_351}</td>
//                       <td className="border-4">{row.PR_VA_352}</td>
//                       <td className="border-4">{row.Test_Name}</td>
//                       <td className="border-4">{row.DM_LSH_001}</td>
//                       <td className="border-4">{row.DM_LSL_001}</td>
//                       <td className="border-4">{row.GS_LSL_011}</td>
//                       <td className="border-4">{row.GS_LSL_021}</td>
//                       <td className="border-4">{row.RECT_CT_001}</td>
//                       <td className="border-4">{row.RECT_VT_001}</td>
//                       <td className="border-4">{row.DCDB0_CT_001}</td>
//                       <td className="border-4">{row.DCDB0_VT_001}</td>
//                       <td className="border-4">{row.DCDB1_CT_001}</td>
//                       <td className="border-4">{row.DCDB1_VT_001}</td>
//                       <td className="border-4">{row.DCDB2_CT_001}</td>
//                       <td className="border-4">{row.DCDB2_VT_001}</td>
//                       <td className="border-4">{row.DCDB3_CT_001}</td>
//                       <td className="border-4">{row.DCDB3_VT_001}</td>
//                       <td className="border-4">{row.DCDB4_CT_001}</td>
//                       <td className="border-4">{row.DCDB4_VT_001}</td>
//                       <td className="border-4">{row.PR_VA_361Ain}</td>
//                       <td className="border-4">{row.PR_VA_361Bin}</td>
//                       <td className="border-4">{row.PR_VA_362Ain}</td>
//                       <td className="border-4">{row.PR_VA_362Bin}</td>
//                       <td className="border-4">{row.Test_Remarks}</td>
//                       <td className="border-4">{row.PR_VA_361Aout}</td>
//                       <td className="border-4">{row.PR_VA_361Bout}</td>
//                       <td className="border-4">{row.PR_VA_362Aout}</td>
//                       <td className="border-4">{row.PR_VA_362Bout}</td>
//                       <td className="border-4">{row.PLC_TIME_STAMP}</td>
//                       <td className="border-4">{row.Test_description}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </>
//           )}
//         </>
//       ) : (
//         <p>No data available for the selected date range.</p>
//       )}
//     </div>
//   );
// }

// export default IoTDataViewer;

// import React, { useState } from 'react';

// function IoTDataViewer() {
//     const [startTime, setStartTime] = useState('');
//     const [endTime, setEndTime] = useState('');
//     const [data, setData] = useState([]);
//     const [error, setError] = useState('');

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
//                 const filteredData = (result.data || []).map((row) => ({
//                     timestamp: row.timestamp,
//                     ist_timestamp: row.ist_timestamp,
//                     AX_LT_011: row.device_data["AX-LT-011"],
//                     Test_Name: row.device_data["Test-Name"],
//                 }));

//                 // Use a Set to track unique Test-Name values
//                 const uniqueTestNames = new Set();
//                 const processedData = filteredData.filter((row) => {
//                     if (row.Test_Name && !uniqueTestNames.has(row.Test_Name)) {
//                         uniqueTestNames.add(row.Test_Name);
//                         return true; // Include the row
//                     }
//                     return false; // Skip the row
//                 });

//                 setData(processedData);
//                 setError('');
//             } else {
//                 setData([]);
//                 setError(result.message || 'Failed to fetch data');
//             }
//         } catch (err) {
//             console.error("Error in Fetch:", err);
//             setData([]);
//             setError(err.message || 'An unexpected error occurred');
//         }
//     };

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
//                 <table border="1">
//                     <thead>
//                         <tr>
//                             <th>Timestamp</th>
//                             <th>IST Timestamp</th>
//                             <th>AX-LT-011</th>
//                             <th>Test-Name</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {data.map((row, index) => (
//                             <tr key={index}>
//                                 <td>{row.timestamp}</td>
//                                 <td>{row.ist_timestamp}</td>
//                                 <td>{row.AX_LT_011}</td>
//                                 <td>{row.Test_Name}</td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
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
//     const [data, setData] = useState([]); // Initialize data as an empty array
//     const [error, setError] = useState('');

//     const fetchData = async () => {
//       try {
//           const response = await fetch('https://phhm5ulen4skthqhefp7r5gp2u0yzxzd.lambda-url.us-east-1.on.aws/', {
//               method: 'POST',
//               headers: {
//                   'Content-Type': 'application/json',
//               },
//               body: JSON.stringify({ start_time: startTime, end_time: endTime }),
//           });

//           const rawResult = await response.json();
//           console.log("Raw API Response:", rawResult); // Log the raw response

//           // Parse `body` if it is a JSON string
//           const result = rawResult.body ? JSON.parse(rawResult.body) : rawResult;

//           console.log("Parsed Result:", result); // Log the parsed result

//           if (response.ok) {
//               const filteredData = (result.data || []).map((row) => ({
//                   timestamp: row.timestamp,
//                   ist_timestamp: row.ist_timestamp,
//                   AX_LT_011: row.device_data["AX-LT-011"],
//                   Test_Name: row.device_data["Test-Name"],
//               }));
//               setData(filteredData);
//               setError('');
//           } else {
//               setData([]);
//               setError(result.message || 'Failed to fetch data');
//           }
//       } catch (err) {
//           console.error("Error in Fetch:", err);
//           setData([]);
//           setError(err.message || 'An unexpected error occurred');
//       }
//   };

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
//                 <table border="1">
//                     <thead>
//                         <tr>
//                             <th>Timestamp</th>
//                             <th>IST Timestamp</th>
//                             <th>AX-LT-011</th>
//                             <th>Test-Name</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {data.map((row, index) => (
//                             <tr key={index} className='border-4'>
//                                 <td className='border-4'> {row.timestamp}</td>
//                                 <td className='border-4'>{row.ist_timestamp}</td>
//                                 <td className='border-4'>{row.AX_LT_011}</td>
//                                 <td className='border-4'>{row.Test_Name}</td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
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
// import GridLayout from "react-grid-layout";
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
//   DateTimePicker
// } from "@mui/x-date-pickers/DateTimePicker";
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
// import { W3CWebSocket as WebSocketClient } from "websocket";
// import axios from "axios";
// import { format } from "date-fns";

// const CustomScatterCharts = () => {
//   const [data, setData] = useState({});
//   const [charts, setCharts] = useState([]);
//   const [layout, setLayout] = useState(() => {
//     const savedLayout = localStorage.getItem("scatterChartsLayout");
//     return savedLayout ? JSON.parse(savedLayout) : [];
//   });
//   const [chartDialogOpen, setChartDialogOpen] = useState(false);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [tempChartData, setTempChartData] = useState(null);
//   const [startDate, setStartDate] = useState(null);
//   const [endDate, setEndDate] = useState(null);
//   const [mode, setMode] = useState("A");
//   const [dateDialogOpen, setDateDialogOpen] = useState(false);
//   const [selectedChartId, setSelectedChartId] = useState(null);
//   const wsClientRefs = useRef({});
//   const [loading, setLoading] = useState(false);

//   const saveLayoutToLocalStorage = (updatedLayout) => {
//     setLayout(updatedLayout);
//     localStorage.setItem("scatterChartsLayout", JSON.stringify(updatedLayout));
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
//           "RECT-CT-001": receivedData["RECT-CT-001"] || null,
//           "RECT-VT-001": receivedData["RECT-VT-001"] || null,
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
//       setTimeout(() => setupRealTimeWebSocket(chartId), 1000);
//     };
//   };

//   const fetchHistoricalData = async (chartId) => {
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
//       const fetchedData = parsedBody.data.map((item) => ({
//         time_bucket: item[0],
//         "AX-LT-011": item[1],
//         "AX-LT-021": item[2],
//         "CW-TT-011": item[3],
//         "CW-TT-021": item[4],
//       }));

//       setData((prevData) => ({
//         ...prevData,
//         [chartId]: fetchedData,
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

//   const handleDateRangeApply = () => {
//     setDateDialogOpen(false);
//     if (mode === "B") {
//       charts.forEach((chart) => fetchHistoricalData(chart.id));
//     } else if (mode === "C") {
//       charts.forEach((chart) => fetchHistoricalData(chart.id));
//     }
//   };

//   const addCustomChart = () => {
//     const newChartId = Date.now();
//     const newChart = {
//       id: newChartId,
//       xAxisDataKey: "CW-TT-011",
//       yAxisDataKey: "CW-TT-021",
//       xAxisRange: ["auto", "auto"],
//       yAxisRange: ["auto", "auto"],
//       color: "#FF0000",
//     };
//     setCharts((prevCharts) => [...prevCharts, newChart]);
//     saveLayoutToLocalStorage([...layout, { i: newChartId.toString(), x: 0, y: Infinity, w: 6, h: 8 }]);
//     setChartDialogOpen(false);
//   };

//   const deleteChart = (chartId) => {
//     setCharts((prevCharts) => prevCharts.filter((chart) => chart.id !== chartId));
//     saveLayoutToLocalStorage(layout.filter((l) => l.i !== chartId.toString()));
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
//         <Tooltip />
//         <Legend />
//         <Scatter
//           name={`${chart.xAxisDataKey} vs ${chart.yAxisDataKey}`}
//           data={data[chart.id] || []}
//           fill={chart.color}
//         />
//       </ScatterChart>
//     </ResponsiveContainer>
//   );

//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       <Container>
//         <Box display="flex" justifyContent="flex-end" marginBottom={4}>
//           <Button
//             variant="contained"
//             color="secondary"
//             onClick={() => setChartDialogOpen(true)}
//           >
//             Add Scatter Chart
//           </Button>
//         </Box>
//         <GridLayout
//           className="layout"
//           layout={layout}
//           cols={12}
//           rowHeight={30}
//           width={1200}
//           onLayoutChange={saveLayoutToLocalStorage}
//           draggableHandle=".drag-handle"
//           isResizable
//         >
//           {charts.map((chart) => (
//             <Box
//               key={chart.id}
//               data-grid={layout.find((l) => l.i === chart.id.toString()) || { x: 0, y: Infinity, w: 6, h: 8 }}
//               sx={{
//                 position: "relative",
//                 border: "1px solid #ccc",
//                 borderRadius: "8px",
//                 overflow: "hidden",
//                 padding: 2,
//               }}
//             >
//               <Box display="flex" justifyContent="space-between" p={1}>
//                 <IconButton className="drag-handle">
//                   <DeleteIcon />
//                 </IconButton>
//                 <IconButton
//                   aria-label="delete"
//                   onClick={() => deleteChart(chart.id)}
//                 >
//                   <DeleteIcon />
//                 </IconButton>
//               </Box>
//               {renderChart(chart)}
//               <Box display="flex" justifyContent="center" mt={2} gap={2}>
//                 <Button
//                   variant="contained"
//                   color="secondary"
//                   onClick={() => {
//                     setTempChartData(chart);
//                     setDialogOpen(true);
//                   }}
//                 >
//                   Configure Chart
//                 </Button>
//                 <Button
//                   variant="contained"
//                   color="primary"
//                   onClick={() => {
//                     setSelectedChartId(chart.id);
//                     setDateDialogOpen(true);
//                   }}
//                 >
//                   Select Date Range
//                 </Button>
//               </Box>
//             </Box>
//           ))}
//         </GridLayout>

//         <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
//           <DialogTitle>Select Chart Type</DialogTitle>
//           <DialogContent>
//             <Box display="flex" flexDirection="column" gap={2}>
//               <Button variant="contained" onClick={addCustomChart}>
//                 Add XY Chart
//               </Button>
//             </Box>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setChartDialogOpen(false)} color="secondary">
//               Cancel
//             </Button>
//           </DialogActions>
//         </Dialog>

//         <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="md">
//           <DialogTitle>Configure Chart</DialogTitle>
//           <DialogContent>
//             <FormControl fullWidth margin="normal">
//               <InputLabel>X-Axis Data Key</InputLabel>
//               <Select
//                 value={tempChartData?.xAxisDataKey}
//                 onChange={(e) =>
//                   setTempChartData((prevChart) => ({
//                     ...prevChart,
//                     xAxisDataKey: e.target.value,
//                   }))
//                 }
//               >
//                 <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//                 <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
//                 <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
//                 <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
//                 <MenuItem value="RECT-CT-001">RECT-CT-001</MenuItem>
//                 <MenuItem value="RECT-VT-001">RECT-VT-001</MenuItem>
//               </Select>
//             </FormControl>

//             <FormControl fullWidth margin="normal">
//               <InputLabel>Y-Axis Data Key</InputLabel>
//               <Select
//                 value={tempChartData?.yAxisDataKey}
//                 onChange={(e) =>
//                   setTempChartData((prevChart) => ({
//                     ...prevChart,
//                     yAxisDataKey: e.target.value,
//                   }))
//                 }
//               >
//                 <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
//                 <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
//                 <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
//                 <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
//                 <MenuItem value="RECT-CT-001">RECT-CT-001</MenuItem>
//                 <MenuItem value="RECT-VT-001">RECT-VT-001</MenuItem>
//               </Select>
//             </FormControl>

//             <Button onClick={() => setDialogOpen(true)}>Select Color</Button>
//             <SketchPicker color={tempChartData?.color} onChangeComplete={(color) => {
//               setTempChartData((prevChart) => ({
//                 ...prevChart,
//                 color: color.hex
//               }));
//             }} />
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setDialogOpen(false)} color="secondary">
//               Cancel
//             </Button>
//             <Button
//               onClick={() => {
//                 setCharts((prevCharts) =>
//                   prevCharts.map((chart) =>
//                     chart.id === tempChartData.id ? tempChartData : chart
//                   )
//                 );
//                 setDialogOpen(false);
//               }}
//               color="primary"
//             >
//               Save
//             </Button>
//           </DialogActions>
//         </Dialog>

//         <Dialog open={dateDialogOpen} onClose={() => setDateDialogOpen(false)} fullWidth maxWidth="sm">
//           <DialogTitle>Select Date Range</DialogTitle>
//           <DialogContent>
//             <FormControl component="fieldset">
//               <RadioGroup row value={mode} onChange={(e) => setMode(e.target.value)}>
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
//                 />
//               </Grid>
//               <Grid item xs={6}>
//                 <DateTimePicker
//                   label="End Date and Time"
//                   value={endDate}
//                   onChange={setEndDate}
//                   renderInput={(params) => <TextField {...params} fullWidth />}
//                   disabled={mode === "B"}
//                 />
//               </Grid>
//             </Grid>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setDateDialogOpen(false)} color="secondary">
//               Cancel
//             </Button>
//             <Button onClick={handleDateRangeApply} color="primary">
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
//   Container,
//   Box,
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   FormControl,
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
// import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
// import { format } from "date-fns";
// import axios from "axios";
// import DeleteIcon from "@mui/icons-material/Delete";

// const HistoricalCharts = () => {
//   const [charts, setCharts] = useState([]);
//   const [chartData, setChartData] = useState({});
//   const [startDate, setStartDate] = useState(null);
//   const [endDate, setEndDate] = useState(null);
//   const [dateDialogOpen, setDateDialogOpen] = useState(false);
//   const [dateRangeOption, setDateRangeOption] = useState(""); // Predefined range option
//   const [mode, setMode] = useState("B"); // B for historical range, C for real-time + historical
//   const [currentChartId, setCurrentChartId] = useState(null);

//   // Load saved charts from localStorage on component mount
//   useEffect(() => {
//     const savedCharts = localStorage.getItem("customCharts");
//     if (savedCharts) {
//       setCharts(JSON.parse(savedCharts));
//     }
//   }, []);

//   // Save chart configurations to localStorage whenever charts are updated
//   const saveChartsToLocalStorage = (updatedCharts) => {
//     const chartConfigurations = updatedCharts.map((chart) => ({
//       id: chart.id,
//       type: chart.type,
//       xAxisDataKey: chart.xAxisDataKey,
//       yAxisDataKeys: chart.yAxisDataKeys,
//     }));
//     localStorage.setItem("customCharts", JSON.stringify(chartConfigurations));
//   };

//   // Fetch chart data based on selected date range
//   const fetchChartData = async (chartId) => {
//     if (!startDate) return; // Ensure start date is set

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
//         "CR-PT-001": item[10],
//       }));

//       setChartData((prevData) => ({
//         ...prevData,
//         [chartId]: fetchedData,
//       }));
//     } catch (error) {
//       console.error("Error fetching data from the API:", error);
//     }
//   };

//   // Helper function to calculate shortcut date ranges
//   const applyShortcutDateRange = (range) => {
//     const now = new Date();
//     let start = null;
//     switch (range) {
//       case "lastSixHours":
//         start = new Date(now - 6 * 60 * 60 * 1000);
//         break;
//       case "lastDay":
//         start = new Date(now - 24 * 60 * 60 * 1000);
//         break;
//       case "lastSevenDays":
//         start = new Date(now - 7 * 24 * 60 * 60 * 1000);
//         break;
//       case "lastFifteenDays":
//         start = new Date(now - 15 * 24 * 60 * 60 * 1000);
//         break;
//       case "lastMonth":
//         start = new Date(now - 30 * 24 * 60 * 60 * 1000);
//         break;
//       default:
//         return;
//     }
//     setStartDate(start);
//     setEndDate(now);
//   };

//   const handleDateRangeOptionChange = (event) => {
//     const selectedRange = event.target.value;
//     setDateRangeOption(selectedRange);
//     if (selectedRange !== "custom") {
//       applyShortcutDateRange(selectedRange);
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
//     setDateDialogOpen(false);
//   };

//   const deleteChart = (chartId) => {
//     const updatedCharts = charts.filter((chart) => chart.id !== chartId);
//     setCharts(updatedCharts);
//     saveChartsToLocalStorage(updatedCharts); // Save the updated charts to localStorage
//     const updatedChartData = { ...chartData };
//     delete updatedChartData[chartId];
//     setChartData(updatedChartData);
//   };

//   const renderLineChart = (chart) => (
//     <ResponsiveContainer width="100%" height={400}>
//       <LineChart data={chartData[chart.id]}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis
//           dataKey="timestamp"
//           tickFormatter={(tick) => new Date(tick).toLocaleString()}
//         />
//         <YAxis domain={[0, 500]} stroke="#8884d8" />
//         <Tooltip />
//         <Legend />
//         <Line type="monotone" dataKey="AX-LT-011" stroke="#FF0000" />
//         <Brush height={30} dataKey="timestamp" stroke="#8884d8" />
//       </LineChart>
//     </ResponsiveContainer>
//   );

//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       <Container>
//         <Box display="flex" justifyContent="flex-end" marginBottom={4}>
//           <Button
//             variant="contained"
//             color="secondary"
//             onClick={() => setDateDialogOpen(true)}
//           >
//             Add Line Chart
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
//               {renderLineChart(chart)}
//               <Box
//                 display="flex"
//                 justifyContent="flex-end"
//                 gap={2}
//                 marginTop={2}
//               >
//                 <Button
//                   variant="outlined"
//                   color="secondary"
//                   onClick={() => setCurrentChartId(chart.id)}
//                 >
//                   Select Date Range
//                 </Button>
//               </Box>
//             </Box>
//           </Box>
//         ))}

//         <Dialog
//           open={dateDialogOpen}
//           onClose={() => setDateDialogOpen(false)}
//           fullWidth
//           maxWidth="sm"
//         >
//           <DialogTitle>Select Date Range</DialogTitle>
//           <DialogContent>
//             <FormControl fullWidth margin="normal">
//               <Select
//                 value={dateRangeOption}
//                 onChange={handleDateRangeOptionChange}
//               >
//                 <MenuItem value="lastSixHours">Last Six Hours</MenuItem>
//                 <MenuItem value="lastDay">Last Day</MenuItem>
//                 <MenuItem value="lastSevenDays">Last Seven Days</MenuItem>
//                 <MenuItem value="lastFifteenDays">Last Fifteen Days</MenuItem>
//                 <MenuItem value="lastMonth">Last Month</MenuItem>
//                 <MenuItem value="custom">Custom Range</MenuItem>
//               </Select>
//             </FormControl>

//             {dateRangeOption === "custom" && (
//               <Grid container spacing={2} alignItems="center">
//                 <Grid item xs={6}>
//                   <DateTimePicker
//                     label="Start Date and Time"
//                     value={startDate}
//                     onChange={setStartDate}
//                     renderInput={(params) => (
//                       <TextField {...params} fullWidth />
//                     )}
//                   />
//                 </Grid>
//                 <Grid item xs={6}>
//                   <DateTimePicker
//                     label="End Date and Time"
//                     value={endDate}
//                     onChange={setEndDate}
//                     renderInput={(params) => (
//                       <TextField {...params} fullWidth />
//                     )}
//                     disabled={mode === "C"}
//                   />
//                 </Grid>
//               </Grid>
//             )}
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

//   // Fetch data using the handleSubmit logic for both historical and real-time data
//   const fetchChartData = async (chartId) => {
//     if (!startDate || !endDate) return;

//     try {
//       const formattedStartDate = format(startDate, 'yyyy-MM-dd');
//       const formattedStartTime = format(startDate, 'HH:mm');
//       const formattedEndDate = format(endDate, 'yyyy-MM-dd');
//       const formattedEndTime = format(endDate, 'HH:mm');

//       // Use the new API URL with the handleSubmit logic
//       const response = await axios.post('https://xdeuid6slkki7yxz4zhdbqbzfq0hirkk.lambda-url.us-east-1.on.aws/', {
//         start_time: `${formattedStartDate}T${formattedStartTime}`,
//         end_time: `${formattedEndDate}T${formattedEndTime}`,
//       });

//       // Parse and map the data to the chart structure
//       const parsedBody = JSON.parse(response.data.body);
//       const fetchedData = parsedBody.data.map(item => ({
//         timestamp: item[0],  // Assuming the first element is the timestamp
//         'AX-LT-011': item[1],  // Adjust based on the actual data structure
//         'AX-LT-021': item[2],
//         'CW-TT-011': item[3],
//         'CW-TT-021': item[4],
//       }));

//       setChartData(prevData => ({
//         ...prevData,
//         [chartId]: fetchedData,
//       }));

//       if (mode === 'C') {
//         setupRealTimeWebSocket(chartId); // If mode C, fetch real-time data too
//       }
//     } catch (error) {
//       console.error('Error fetching data from the API:', error);
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
//       fetchChartData(currentChartId);
//     }
//   };

//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       <Container>
//         <Box display="flex" justifyContent="flex-end" marginBottom={4}>
//           <Button variant="contained" color="primary" onClick={() => setChartDialogOpen(true)}>
//             Add Historical - Realtime Custom Chart
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
// import { SketchPicker } from 'react-color';
//  import DeleteIcon from '@mui/icons-material/Delete';

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
//   const [loading, setLoading] = useState(false);

//   const fetchDataFromNewAPI = async () => {
//     if (!startDate || !endDate) return;
//     setLoading(true);

//     try {
//       const formattedStartDate = format(startDate, 'yyyy-MM-dd');
//       const formattedStartTime = format(startDate, 'HH:mm');
//       const formattedEndDate = format(endDate, 'yyyy-MM-dd');
//       const formattedEndTime = format(endDate, 'HH:mm');

//       // Fetch data from the new API using handleSubmit functionality
//       const response = await axios.post('https://xdeuid6slkki7yxz4zhdbqbzfq0hirkk.lambda-url.us-east-1.on.aws/', {
//         start_time: `${formattedStartDate}T${formattedStartTime}`,
//         end_time: `${formattedEndDate}T${formattedEndTime}`,
//       });

//       // Assuming the response follows a similar structure to the handleSubmit
//       const parsedBody = JSON.parse(response.data.body);
//       const fetchedData = parsedBody.data.map(item => ({
//         timestamp: item[0],  // Assuming the first element is the timestamp
//         'AX-LT-011': item[1],  // Adjust based on the actual data structure
//         'AX-LT-021': item[2],
//         'CW-TT-011': item[3],
//       }));

//       setData(fetchedData);  // Set data to plot on the graph

//     } catch (error) {
//       console.error('Error fetching data from new API:', error);
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
//                   control={<Switch checked={loading} onChange={(e) => setLoading(e.target.checked)} />}
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
//                 />
//               </Grid>
//             </Grid>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setDateDialogOpen(false)} color="secondary">Cancel</Button>
//             <Button
//               onClick={() => {
//                 setDateDialogOpen(false);
//                 fetchDataFromNewAPI(); // Call the new API instead of fetchHistoricalData
//               }}
//               color="primary"
//               disabled={!startDate || !endDate}
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

// import React, { useState } from 'react';
// import axios from 'axios';

// const FetchData = () => {
//     const [startDate, setStartDate] = useState('');
//     const [endDate, setEndDate] = useState('');
//     const [data, setData] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);

//     const apiEndpoint = 'https://3di0yc14j3.execute-api.us-east-1.amazonaws.com/dev/iot-data';

//     const fetchData = async (queryType, customStart = null, customEnd = null) => {
//         setLoading(true);
//         setError(null);

//         try {
//             let payload = {};
//             if (queryType === 'custom') {
//                 payload = {
//                     query_type: 'custom',
//                     start_date: customStart,
//                     end_date: customEnd
//                 };
//             } else {
//                 payload = { query_type: queryType };
//             }

//             const response = await axios.post(apiEndpoint, payload);
//             setData(response.data);
//         } catch (err) {
//             setError('Error fetching data');
//         }
//         setLoading(false);
//     };

//     const handleFetch = (queryType) => {
//         if (queryType === 'custom' && (!startDate || !endDate)) {
//             alert('Please select a valid date range');
//             return;
//         }
//         fetchData(queryType, startDate, endDate);
//     };

//     return (
//         <div>
//             <h1>Fetch IoT Data</h1>

//             <div>
//                 <h2>Select Date Range</h2>
//                 <label>Start Date</label>
//                 <input
//                     type="datetime-local"
//                     value={startDate}
//                     onChange={(e) => setStartDate(e.target.value)}
//                 />
//                 <label>End Date</label>
//                 <input
//                     type="datetime-local"
//                     value={endDate}
//                     onChange={(e) => setEndDate(e.target.value)}
//                 />
//                 <button onClick={() => handleFetch('custom')}>Fetch Custom Date Range</button>
//             </div>

//             <div>
//                 <h2>Quick Select</h2>
//                 <button onClick={() => handleFetch('last_month')}>Fetch Last Month</button>
//                 <button onClick={() => handleFetch('last_year')}>Fetch Last Year</button>
//             </div>

//             <div>
//                 {loading ? <p>Loading...</p> :
//                     data.length > 0 ? (
//                         <table>
//                             <thead>
//                                 <tr>
//                                     <th>Device ID</th>
//                                     <th>Data Value</th>
//                                     <th>Timestamp</th>
//                                     <th>IST Timestamp</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {data.map((item, index) => (
//                                     <tr key={index}>
//                                         <td>{item.device_id}</td>
//                                         <td>{item.data_value}</td>
//                                         <td>{item.timestamp}</td>
//                                         <td>{item.ist_timestamp}</td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     ) : <p>No data available</p>
//                 }
//                 {error && <p>{error}</p>}
//             </div>
//         </div>
//     );
// };

// export default FetchData;

// import React, { useState, useEffect, useRef } from 'react';
// import {
//   Container, Button, Dialog, DialogTitle, DialogContent, DialogActions,
//   RadioGroup, FormControlLabel, Radio, FormControl, Select, MenuItem, Grid, TextField
// } from '@mui/material';
// import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import axios from 'axios';
// import { subMinutes, subHours, subDays } from 'date-fns';
// import { w3cwebsocket as W3CWebSocket } from 'websocket';

// // Predefined time ranges for Option B
// const timeRangeOptions = [
//   { label: "Last 1 minute", value: '1m' },
//   { label: "Last 30 minutes", value: '30m' },
//   { label: "Last 1 hour", value: '1h' },
//   { label: "Last 12 hours", value: '12h' },
//   { label: "Last 1 day", value: '1d' },
//   { label: "Last 7 days (1 week)", value: '1w' },
//   { label: "Last 1 month", value: '1mo' },
// ];

// const CustomCharts = () => {
//   const [charts, setCharts] = useState([]);
//   const [data, setData] = useState({});
//   const [mode, setMode] = useState('A'); // Default mode is Real-Time Data Only
//   const [selectedTimeRange, setSelectedTimeRange] = useState('1h'); // Default time range for Option B
//   const [startDate, setStartDate] = useState(null); // For Option C
//   const [endDate, setEndDate] = useState(null); // For Option C
//   const [realTimeData, setRealTimeData] = useState(false);
//   const [dateDialogOpen, setDateDialogOpen] = useState(false);
//   const wsClientRefs = useRef({}); // WebSocket references

//   // Helper to calculate the start date based on the time range for Option B
//   const calculateStartDate = (timeRange) => {
//     const now = new Date();
//     switch (timeRange) {
//       case '1m':
//         return subMinutes(now, 1);
//       case '30m':
//         return subMinutes(now, 30);
//       case '1h':
//         return subHours(now, 1);
//       case '12h':
//         return subHours(now, 12);
//       case '1d':
//         return subDays(now, 1);
//       case '1w':
//         return subDays(now, 7);
//       case '1mo':
//         return subDays(now, 30);
//       default:
//         return subHours(now, 1); // Default to last 1 hour
//     }
//   };

//   // Function to open WebSocket for real-time data streaming
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
//         setData((prevData) => ({
//           ...prevData,
//           [chartId]: [...(prevData[chartId] || []), newData],
//         }));
//       } catch (error) {
//         console.error("Error processing WebSocket message:", error);
//       }
//     };

//     wsClientRefs.current[chartId].onclose = () => {
//       console.log(`WebSocket disconnected for chart ${chartId}`);
//     };
//   };

//   // Function to close WebSocket connection
//   const closeWebSocket = (chartId) => {
//     if (wsClientRefs.current[chartId]) {
//       wsClientRefs.current[chartId].close();
//       delete wsClientRefs.current[chartId];
//       console.log(`WebSocket closed for chart ${chartId}`);
//     }
//   };

//   // Fetch historical data and then start WebSocket for real-time data
//   const fetchHistoricalData = async (chartId, fetchEndDate = false, customStartDate = null) => {
//     const start = customStartDate || startDate; // Use custom start date or default startDate
//     if (!start || (fetchEndDate && !endDate)) return;

//     try {
//       const historicalData = [];
//       let currentDate = start;
//       const endDateToUse = fetchEndDate ? endDate : new Date();

//       while (currentDate <= endDateToUse) {
//         const formattedStartDate = currentDate.toISOString().split('T')[0];
//         const formattedStartTime = currentDate.toTimeString().split(' ')[0].slice(0, 5);

//         const nextHour = new Date(currentDate.getTime() + 60 * 60 * 1000);
//         const formattedEndDate = nextHour.toISOString().split('T')[0];
//         const formattedEndTime = nextHour.toTimeString().split(' ')[0].slice(0, 5);

//         const response = await axios.post('https://7ko9a0hlo2.execute-api.us-east-1.amazonaws.com/dev/data', {
//           start_date: formattedStartDate,
//           start_time: formattedStartTime,
//           end_date: formattedEndDate,
//           end_time: formattedEndTime,
//           plot_all: true
//         });

//         const hourlyData = response.data.data.map(item => ({
//           timestamp: item.timestamp,
//           'AX-LT-011': item.payload['AX-LT-011'],
//           'AX-LT-021': item.payload['AX-LT-021'],
//           'CW-TT-011': item.payload['CW-TT-011'],
//           'CR-LT-011': item.payload['CR-LT-011'],
//         }));

//         historicalData.push(...hourlyData);
//         currentDate = nextHour;
//       }

//       setData((prevData) => ({
//         ...prevData,
//         [chartId]: historicalData,
//       }));

//       setupRealTimeWebSocket(chartId); // After fetching, start real-time data
//     } catch (error) {
//       console.error('Error fetching historical data:', error);
//     }
//   };

//   // Handle mode change and apply data fetching
//   const handleDateRangeApply = (mode, selectedTimeRange, startDate, endDate) => {
//     if (mode === 'A') {
//       setRealTimeData(true);
//       charts.forEach(chart => setupRealTimeWebSocket(chart.id));
//     } else if (mode === 'B') {
//       const calculatedStartDate = calculateStartDate(selectedTimeRange); // Calculate the start date based on dropdown
//       charts.forEach(chart => {
//         setRealTimeData(false); // Stop real-time temporarily
//         fetchHistoricalData(chart.id, false, calculatedStartDate); // Fetch historical data, then start real-time
//       });
//     } else if (mode === 'C') {
//       charts.forEach(chart => {
//         setRealTimeData(false); // Stop real-time
//         closeWebSocket(chart.id); // Stop WebSocket if it's running
//         fetchHistoricalData(chart.id, true, startDate); // Fetch historical data for specified range
//       });
//     }
//     setDateDialogOpen(false); // Close the dialog
//   };

//   // Add a custom chart and start real-time plotting by default
//   const addCustomChart = () => {
//     const newChart = {
//       id: Date.now(),
//       yAxisDataKeys: [
//         { id: 'left-0', dataKeys: ['AX-LT-011'], range: '0-500', color: "#FF0000", lineStyle: 'solid' }
//       ],
//     };
//     setCharts((prevCharts) => [...prevCharts, newChart]);
//     setupRealTimeWebSocket(newChart.id); // Automatically start real-time WebSocket for new chart
//     setRealTimeData(true); // Real-time data by default
//   };

//   // Render the charts
//   const renderChart = (chart) => {
//     const chartData = data[chart.id] || [];
//     return (
//       <ResponsiveContainer width="100%" height={400}>
//         <LineChart data={chartData}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="timestamp" />
//           <YAxis />
//           <Tooltip />
//           <Legend />
//           <Line type="monotone" dataKey="AX-LT-011" stroke="#8884d8" />
//           <Line type="monotone" dataKey="AX-LT-021" stroke="#82ca9d" />
//         </LineChart>
//       </ResponsiveContainer>
//     );
//   };

//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       <Container>
//         <Button variant="contained" color="primary" onClick={addCustomChart}>
//           Add Custom Chart (Real-Time by Default)
//         </Button>
//         <Button variant="outlined" color="secondary" onClick={() => setDateDialogOpen(true)}>
//           Open Date Range Selector
//         </Button>

//         {charts.map((chart) => (
//           <div key={chart.id} style={{ marginTop: '20px' }}>
//             {renderChart(chart)}
//           </div>
//         ))}

//         <DateRangeSelectionDialog
//           open={dateDialogOpen}
//           handleClose={() => setDateDialogOpen(false)}
//           handleApply={handleDateRangeApply}
//         />
//       </Container>
//     </LocalizationProvider>
//   );
// };

// const DateRangeSelectionDialog = ({ open, handleClose, handleApply }) => {
//   const [mode, setMode] = useState('A');
//   const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
//   const [startDate, setStartDate] = useState(null);
//   const [endDate, setEndDate] = useState(null);

//   return (
//     <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
//       <DialogTitle>Select Date Range</DialogTitle>
//       <DialogContent>
//         <FormControl component="fieldset">
//           <RadioGroup row value={mode} onChange={(e) => setMode(e.target.value)}>
//             <FormControlLabel value="A" control={<Radio />} label="Real-Time Data Only" />
//             <FormControlLabel value="B" control={<Radio />} label="Start Date & Continue Real-Time" />
//             <FormControlLabel value="C" control={<Radio />} label="Select Date Range" />
//           </RadioGroup>
//         </FormControl>

//         {mode === 'B' && (
//           <FormControl fullWidth margin="normal">
//             <Select value={selectedTimeRange} onChange={(e) => setSelectedTimeRange(e.target.value)}>
//               {timeRangeOptions.map((option) => (
//                 <MenuItem key={option.value} value={option.value}>
//                   {option.label}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>
//         )}

//         {mode === 'C' && (
//           <Grid container spacing={2}>
//             <Grid item xs={6}>
//               <DateTimePicker
//                 label="Start Date and Time"
//                 value={startDate}
//                 onChange={setStartDate}
//                 renderInput={(params) => <TextField {...params} fullWidth />}
//               />
//             </Grid>
//             <Grid item xs={6}>
//               <DateTimePicker
//                 label="End Date and Time"
//                 value={endDate}
//                 onChange={setEndDate}
//                 renderInput={(params) => <TextField {...params} fullWidth />}
//               />
//             </Grid>
//           </Grid>
//         )}
//       </DialogContent>
//       <DialogActions>
//         <Button onClick={handleClose} color="secondary">Cancel</Button>
//         <Button
//           onClick={() => handleApply(mode, selectedTimeRange, startDate, endDate)}
//           color="primary"
//           disabled={mode === 'C' && (!startDate || !endDate)}
//         >
//           Apply
//         </Button>
//       </DialogActions>
//     </Dialog>
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
//           <Button variant="contained" color="primary" onClick={() => setChartDialogOpen(true)}>
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

// // import React, { useState, useEffect, useRef } from "react";
// // import {
// //   ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
// // } from "recharts";
// // import {
// //   Container, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
// //   FormControl, InputLabel, Select, MenuItem, IconButton, Grid, TextField, FormControlLabel, RadioGroup, Radio
// // } from "@mui/material";
// // import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// // import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// // import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// // import axios from 'axios';
// // import { format } from 'date-fns';
// // import { w3cwebsocket as W3CWebSocket } from "websocket";
// // import DeleteIcon from '@mui/icons-material/Delete';
// // import { SketchPicker } from 'react-color';

// // const CustomScatterCharts = () => {
// //   const [data, setData] = useState([]);
// //   const [charts, setCharts] = useState([]);
// //   const [chartDialogOpen, setChartDialogOpen] = useState(false);
// //   const [dialogOpen, setDialogOpen] = useState(false);
// //   const [tempChartData, setTempChartData] = useState(null);

// //   const [startDate, setStartDate] = useState(null);
// //   const [realTimeData, setRealTimeData] = useState(false);
// //   const [dateDialogOpen, setDateDialogOpen] = useState(false);
// //   const [loading, setLoading] = useState(false);

// //   const [mode, setMode] = useState('A'); // A: Real-Time, B: Start Date & Continue Real-Time

// //   const wsClientRef = useRef(null);

// //   // WebSocket and real-time data handling
// //   useEffect(() => {
// //     if (realTimeData) {
// //       if (wsClientRef.current) wsClientRef.current.close();

// //       wsClientRef.current = new W3CWebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");

// //       wsClientRef.current.onmessage = (message) => {
// //         try {
// //           const receivedData = JSON.parse(message.data);
// //           const payload = receivedData.payload || {};
// //           const newData = {
// //             timestamp: receivedData.timestamp || Date.now(),
// //             'AX-LT-011': payload['AX-LT-011'] || null,
// //             'AX-LT-021': payload['AX-LT-021'] || null,
// //             'CW-TT-011': payload['CW-TT-011'] || null,
// //             'CW-TT-021': payload['CW-TT-021'] || null,
// //           };

// //           if (newData['AX-LT-011'] !== null || newData['AX-LT-021'] !== null || newData['CW-TT-011'] !== null) {
// //             setData((prevData) => [...prevData, newData]);
// //           }
// //         } catch (error) {
// //           console.error("Error processing WebSocket message:", error);
// //         }
// //       };

// //       wsClientRef.current.onclose = () => {
// //         console.log("WebSocket disconnected. Reconnecting...");
// //         setTimeout(() => {
// //           wsClientRef.current = new W3CWebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");
// //         }, 1000);
// //       };

// //       return () => {
// //         if (wsClientRef.current) wsClientRef.current.close();
// //       };
// //     }
// //   }, [realTimeData]);

// //   // Fetch historical data for Option B
// //   const fetchHistoricalData = async () => {
// //     if (!startDate) return;
// //     setLoading(true);

// //     try {
// //       const formattedStartDate = format(startDate, 'yyyy-MM-dd');
// //       const formattedStartTime = format(startDate, 'HH:mm');

// //       const response = await axios.post('https://7ko9a0hlo2.execute-api.us-east-1.amazonaws.com/dev/data', {
// //         start_date: formattedStartDate,
// //         start_time: formattedStartTime,
// //         end_date: null, // No end date for continuous real-time
// //         plot_all: true
// //       });

// //       const historicalData = response.data.data.map(item => ({
// //         timestamp: item.timestamp,
// //         'AX-LT-011': item.payload['AX-LT-011'],
// //         'AX-LT-021': item.payload['AX-LT-021'],
// //         'CW-TT-011': item.payload['CW-TT-011'],
// //         'CW-TT-021': item.payload['CW-TT-021'],
// //       }));

// //       setData(historicalData);
// //     } catch (error) {
// //       console.error('Error fetching historical data:', error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // Date range apply logic based on selected mode
// //   const handleDateRangeApply = () => {
// //     setDateDialogOpen(false);

// //     if (mode === 'A') {
// //       // Real-Time Data Only: Clear data and start WebSocket streaming
// //       setRealTimeData(true);
// //       setData([]); // Clear previous data
// //     } else if (mode === 'B') {
// //       // Start Date & Continue Real-Time: Fetch historical data, then start WebSocket streaming
// //       setRealTimeData(false);
// //       fetchHistoricalData().then(() => {
// //         setRealTimeData(true); // After fetching historical data, enable real-time updates
// //       });
// //     }
// //   };

// //   const addCustomChart = () => {
// //     const newChart = {
// //       id: Date.now(),
// //       xAxisDataKey: 'AX-LT-011',
// //       yAxisDataKey: 'AX-LT-021',
// //       xAxisRange: ['auto', 'auto'],
// //       yAxisRange: ['auto', 'auto'],
// //       color: "#FF0000",
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

// //   const handleXAxisKeyChange = (event) => {
// //     const { value } = event.target;
// //     setTempChartData((prevChart) => ({
// //       ...prevChart,
// //       xAxisDataKey: value
// //     }));
// //   };

// //   const handleYAxisKeyChange = (event) => {
// //     const { value } = event.target;
// //     setTempChartData((prevChart) => ({
// //       ...prevChart,
// //       yAxisDataKey: value
// //     }));
// //   };

// //   const handleXAxisRangeChange = (event) => {
// //     const { name, value } = event.target;
// //     setTempChartData((prevChart) => ({
// //       ...prevChart,
// //       xAxisRange: name === 'min' ? [parseFloat(value), prevChart.xAxisRange[1]] : [prevChart.xAxisRange[0], parseFloat(value)]
// //     }));
// //   };

// //   const handleYAxisRangeChange = (event) => {
// //     const { name, value } = event.target;
// //     setTempChartData((prevChart) => ({
// //       ...prevChart,
// //       yAxisRange: name === 'min' ? [parseFloat(value), prevChart.yAxisRange[1]] : [prevChart.yAxisRange[0], parseFloat(value)]
// //     }));
// //   };

// //   const handleColorChange = (color) => {
// //     setTempChartData((prevChart) => ({
// //       ...prevChart,
// //       color: color.hex
// //     }));
// //   };

// //   const deleteChart = (chartId) => {
// //     setCharts((prevCharts) => prevCharts.filter((chart) => chart.id !== chartId));
// //   };

// //   const renderChart = (chart) => (
// //     <ResponsiveContainer width="100%" height={400}>
// //       <ScatterChart>
// //         <CartesianGrid strokeDasharray="3 3" />
// //         <XAxis
// //           type="number"
// //           dataKey={chart.xAxisDataKey}
// //           name={chart.xAxisDataKey}
// //           domain={[chart.xAxisRange[0], chart.xAxisRange[1]]}
// //           tickFormatter={(value) => value.toFixed(4)}
// //         />
// //         <YAxis
// //           type="number"
// //           dataKey={chart.yAxisDataKey}
// //           name={chart.yAxisDataKey}
// //           domain={[chart.yAxisRange[0], chart.yAxisRange[1]]}
// //           tickFormatter={(value) => value.toFixed(4)}
// //         />
// //         <Tooltip cursor={{ strokeDasharray: '3 3' }} />
// //         <Legend />
// //         <Scatter
// //           name={`${chart.xAxisDataKey} vs ${chart.yAxisDataKey}`}
// //           data={data.filter(item => item[chart.xAxisDataKey] !== null && item[chart.yAxisDataKey] !== null)}
// //           fill={chart.color}
// //         />
// //       </ScatterChart>
// //     </ResponsiveContainer>
// //   );

// //   return (
// //     <LocalizationProvider dateAdapter={AdapterDateFns}>
// //       <Container>
// //         <Box display="flex" justifyContent="flex-end" marginBottom={4}>
// //           <Button variant="contained" color="primary" onClick={() => setChartDialogOpen(true)}>
// //             Add Custom Scatter Chart
// //           </Button>
// //           {/* Button for selecting the date range */}
// //           <Button
// //             variant="contained"
// //             color="secondary"
// //             onClick={() => setDateDialogOpen(true)}
// //             style={{ marginLeft: '10px' }}
// //           >
// //             Select Date Range
// //           </Button>
// //         </Box>

// //         <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
// //           <DialogTitle>Select Chart Type</DialogTitle>
// //           <DialogContent>
// //             <Box display="flex" flexDirection="column" gap={2}>
// //               <Button variant="contained" onClick={addCustomChart}>Add Scatter Chart</Button>
// //             </Box>
// //           </DialogContent>
// //           <DialogActions>
// //             <Button onClick={() => setChartDialogOpen(false)} color="secondary">Cancel</Button>
// //           </DialogActions>
// //         </Dialog>

// //         {charts.map((chart) => (
// //           <Box key={chart.id} marginY={4} position="relative">
// //             <IconButton
// //               aria-label="delete"
// //               onClick={() => deleteChart(chart.id)}
// //               style={{ position: "absolute", right: 0, top: 0, zIndex: 10 }}
// //             >
// //               <DeleteIcon />
// //             </IconButton>
// //             <Box border={1} padding={2}>
// //               {renderChart(chart)}
// //               <Box display="flex" justifyContent="space-between">
// //                 <Button variant="outlined" color="primary" onClick={() => openDialog(chart)}>
// //                   Configure Chart
// //                 </Button>
// //               </Box>
// //             </Box>
// //           </Box>
// //         ))}

// //         {tempChartData && (
// //           <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
// //             <DialogTitle>Configure Chart</DialogTitle>
// //             <DialogContent>
// //               <Box display="flex" flexDirection="column" maxHeight="400px" overflow="auto">
// //                 <FormControl fullWidth margin="normal">
// //                   <InputLabel>X-Axis Data Key</InputLabel>
// //                   <Select
// //                     value={tempChartData.xAxisDataKey}
// //                     onChange={handleXAxisKeyChange}
// //                   >
// //                     <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
// //                     <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
// //                     <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
// //                     <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
// //                   </Select>
// //                 </FormControl>
// //                 <TextField
// //                   label="X-Axis Min Range"
// //                   type="number"
// //                   name="min"
// //                   value={tempChartData.xAxisRange[0]}
// //                   onChange={handleXAxisRangeChange}
// //                   fullWidth
// //                   margin="normal"
// //                   inputProps={{ step: 0.0001 }}
// //                 />
// //                 <TextField
// //                   label="X-Axis Max Range"
// //                   type="number"
// //                   name="max"
// //                   value={tempChartData.xAxisRange[1]}
// //                   onChange={handleXAxisRangeChange}
// //                   fullWidth
// //                   margin="normal"
// //                   inputProps={{ step: 0.0001 }}
// //                 />
// //                 <FormControl fullWidth margin="normal">
// //                   <InputLabel>Y-Axis Data Key</InputLabel>
// //                   <Select
// //                     value={tempChartData.yAxisDataKey}
// //                     onChange={handleYAxisKeyChange}
// //                   >
// //                     <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
// //                     <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
// //                     <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
// //                     <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
// //                   </Select>
// //                 </FormControl>
// //                 <TextField
// //                   label="Y-Axis Min Range"
// //                   type="number"
// //                   name="min"
// //                   value={tempChartData.yAxisRange[0]}
// //                   onChange={handleYAxisRangeChange}
// //                   fullWidth
// //                   margin="normal"
// //                   inputProps={{ step: 0.0001 }}
// //                 />
// //                 <TextField
// //                   label="Y-Axis Max Range"
// //                   type="number"
// //                   name="max"
// //                   value={tempChartData.yAxisRange[1]}
// //                   onChange={handleYAxisRangeChange}
// //                   fullWidth
// //                   margin="normal"
// //                   inputProps={{ step: 0.0001 }}
// //                 />
// //                 <Button onClick={() => setDialogOpen(true)}>Select Color</Button>
// //                 <SketchPicker color={tempChartData.color} onChangeComplete={handleColorChange} />
// //               </Box>
// //             </DialogContent>
// //             <DialogActions>
// //               <Button onClick={closeDialog} color="secondary">Cancel</Button>
// //               <Button onClick={saveConfiguration} color="primary">Save</Button>
// //             </DialogActions>
// //           </Dialog>
// //         )}

// //         {/* Date Range Selection Dialog */}
// //         <Dialog open={dateDialogOpen} onClose={() => setDateDialogOpen(false)} fullWidth maxWidth="sm">
// //           <DialogTitle>Select Date Range</DialogTitle>
// //           <DialogContent>
// //             <FormControl component="fieldset">
// //               <RadioGroup
// //                 row
// //                 value={mode}
// //                 onChange={(e) => setMode(e.target.value)}
// //               >
// //                 <FormControlLabel value="A" control={<Radio />} label="Real-Time Data Only" />
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
// //                   disabled={mode === 'A'}
// //                 />
// //               </Grid>
// //             </Grid>
// //           </DialogContent>
// //           <DialogActions>
// //             <Button onClick={() => setDateDialogOpen(false)} color="secondary">Cancel</Button>
// //             <Button onClick={handleDateRangeApply} color="primary" disabled={!startDate && mode === 'B'}>
// //               Apply
// //             </Button>
// //           </DialogActions>
// //         </Dialog>
// //       </Container>
// //     </LocalizationProvider>
// //   );
// // };

// // export default CustomScatterCharts;

// // import React, { useState, useEffect, useRef } from "react";
// // import {
// //   ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
// // } from "recharts";
// // import {
// //   Container, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
// //   FormControl, InputLabel, Select, MenuItem, IconButton, Grid, TextField, Switch, FormControlLabel
// // } from "@mui/material";
// // import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// // import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// // import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// // import axios from 'axios';
// // import { format } from 'date-fns';
// // import { w3cwebsocket as W3CWebSocket } from "websocket";
// // import DeleteIcon from '@mui/icons-material/Delete';
// // import { SketchPicker } from 'react-color';

// // const CustomScatterCharts = () => {
// //   const [data, setData] = useState([]);
// //   const [charts, setCharts] = useState([]);
// //   const [chartDialogOpen, setChartDialogOpen] = useState(false);
// //   const [dialogOpen, setDialogOpen] = useState(false);
// //   const [tempChartData, setTempChartData] = useState(null);

// //   const [startDate, setStartDate] = useState(null);
// //   const [endDate, setEndDate] = useState(null);
// //   const [realTimeData, setRealTimeData] = useState(false);
// //   const [dateDialogOpen, setDateDialogOpen] = useState(false);
// //   const [loading, setLoading] = useState(false);

// //   const wsClientRef = useRef(null);

// //   // Establish WebSocket connection and handle real-time data
// //   useEffect(() => {
// //     if (realTimeData) {
// //       if (wsClientRef.current) wsClientRef.current.close();

// //       wsClientRef.current = new W3CWebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");

// //       wsClientRef.current.onmessage = (message) => {
// //         try {
// //           const receivedData = JSON.parse(message.data);
// //           const payload = receivedData.payload || {};
// //           const newData = {
// //             timestamp: receivedData.timestamp || Date.now(),
// //             'AX-LT-011': payload['AX-LT-011'] || null,
// //             'AX-LT-021': payload['AX-LT-021'] || null,
// //             'CW-TT-011': payload['CW-TT-011'] || null,
// //             'CW-TT-021': payload['CW-TT-021'] || null,
// //           };

// //           // Append new data point to the existing data array
// //           if (newData['AX-LT-011'] !== null || newData['AX-LT-021'] !== null || newData['CW-TT-011'] !== null) {
// //             setData((prevData) => [...prevData, newData]);
// //           }
// //         } catch (error) {
// //           console.error("Error processing WebSocket message:", error);
// //         }
// //       };

// //       wsClientRef.current.onclose = () => {
// //         console.log("WebSocket disconnected. Reconnecting...");
// //         setTimeout(() => {
// //           wsClientRef.current = new W3CWebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");
// //         }, 1000);
// //       };

// //       return () => {
// //         if (wsClientRef.current) wsClientRef.current.close();
// //       };
// //     }
// //   }, [realTimeData]);

// //   // Fetch historical data based on selected date range
// //   const fetchHistoricalData = async () => {
// //     if (!startDate || !endDate) return;
// //     setLoading(true);

// //     try {
// //       const formattedStartDate = format(startDate, 'yyyy-MM-dd');
// //       const formattedStartTime = format(startDate, 'HH:mm');
// //       const formattedEndDate = format(endDate, 'yyyy-MM-dd');
// //       const formattedEndTime = format(endDate, 'HH:mm');

// //       // Fetch data from API
// //       const response = await axios.post('https://7ko9a0hlo2.execute-api.us-east-1.amazonaws.com/dev/data', {
// //         start_date: formattedStartDate,
// //         start_time: formattedStartTime,
// //         end_date: formattedEndDate,
// //         end_time: formattedEndTime,
// //         plot_all: true
// //       });

// //       // Parse the historical data
// //       const historicalData = response.data.data.map(item => ({
// //         timestamp: item.timestamp,
// //         'AX-LT-011': item.payload['AX-LT-011'],
// //         'AX-LT-021': item.payload['AX-LT-021'],
// //         'CW-TT-011': item.payload['CW-TT-011'],
// //         'CW-TT-021': item.payload['CW-TT-021'],
// //       }));

// //       setData(historicalData);
// //     } catch (error) {
// //       console.error('Error fetching historical data:', error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const addCustomChart = () => {
// //     const newChart = {
// //       id: Date.now(),
// //       xAxisDataKey: 'AX-LT-011',
// //       yAxisDataKey: 'AX-LT-021',
// //       xAxisRange: ['auto', 'auto'],  // Default auto X-axis range
// //       yAxisRange: ['auto', 'auto'],  // Default auto Y-axis range
// //       color: "#FF0000",
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

// //   const handleXAxisKeyChange = (event) => {
// //     const { value } = event.target;
// //     setTempChartData((prevChart) => ({
// //       ...prevChart,
// //       xAxisDataKey: value
// //     }));
// //   };

// //   const handleYAxisKeyChange = (event) => {
// //     const { value } = event.target;
// //     setTempChartData((prevChart) => ({
// //       ...prevChart,
// //       yAxisDataKey: value
// //     }));
// //   };

// //   const handleXAxisRangeChange = (event) => {
// //     const { name, value } = event.target;
// //     setTempChartData((prevChart) => ({
// //       ...prevChart,
// //       xAxisRange: name === 'min' ? [parseFloat(value), prevChart.xAxisRange[1]] : [prevChart.xAxisRange[0], parseFloat(value)]
// //     }));
// //   };

// //   const handleYAxisRangeChange = (event) => {
// //     const { name, value } = event.target;
// //     setTempChartData((prevChart) => ({
// //       ...prevChart,
// //       yAxisRange: name === 'min' ? [parseFloat(value), prevChart.yAxisRange[1]] : [prevChart.yAxisRange[0], parseFloat(value)]
// //     }));
// //   };

// //   const handleColorChange = (color) => {
// //     setTempChartData((prevChart) => ({
// //       ...prevChart,
// //       color: color.hex
// //     }));
// //   };

// //   const deleteChart = (chartId) => {
// //     setCharts((prevCharts) => prevCharts.filter((chart) => chart.id !== chartId));
// //   };

// //   const renderChart = (chart) => (
// //     <ResponsiveContainer width="100%" height={400}>
// //       <ScatterChart>
// //         <CartesianGrid strokeDasharray="3 3" />
// //         <XAxis
// //           type="number"
// //           dataKey={chart.xAxisDataKey}
// //           name={chart.xAxisDataKey}
// //           domain={[chart.xAxisRange[0], chart.xAxisRange[1]]}
// //           tickFormatter={(value) => value.toFixed(4)}
// //         />
// //         <YAxis
// //           type="number"
// //           dataKey={chart.yAxisDataKey}
// //           name={chart.yAxisDataKey}
// //           domain={[chart.yAxisRange[0], chart.yAxisRange[1]]}
// //           tickFormatter={(value) => value.toFixed(4)}
// //         />
// //         <Tooltip cursor={{ strokeDasharray: '3 3' }} />
// //         <Legend />
// //         <Scatter
// //           name={`${chart.xAxisDataKey} vs ${chart.yAxisDataKey}`}
// //           data={data.filter(item => item[chart.xAxisDataKey] !== null && item[chart.yAxisDataKey] !== null)}
// //           fill={chart.color}
// //         />
// //       </ScatterChart>
// //     </ResponsiveContainer>
// //   );

// //   return (
// //     <LocalizationProvider dateAdapter={AdapterDateFns}>
// //       <Container>
// //         <Box display="flex" justifyContent="flex-end" marginBottom={4}>
// //           <Button variant="contained" color="primary" onClick={() => setChartDialogOpen(true)}>
// //             Add Custom Scatter Chart
// //           </Button>
// //           {/* Button for selecting the date range */}
// //           <Button
// //             variant="contained"
// //             color="secondary"
// //             onClick={() => setDateDialogOpen(true)}
// //             style={{ marginLeft: '10px' }}
// //           >
// //             Select Date Range
// //           </Button>
// //         </Box>

// //         <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
// //           <DialogTitle>Select Chart Type</DialogTitle>
// //           <DialogContent>
// //             <Box display="flex" flexDirection="column" gap={2}>
// //               <Button variant="contained" onClick={addCustomChart}>Add Scatter Chart</Button>
// //             </Box>
// //           </DialogContent>
// //           <DialogActions>
// //             <Button onClick={() => setChartDialogOpen(false)} color="secondary">Cancel</Button>
// //           </DialogActions>
// //         </Dialog>

// //         {charts.map((chart) => (
// //           <Box key={chart.id} marginY={4} position="relative">
// //             <IconButton
// //               aria-label="delete"
// //               onClick={() => deleteChart(chart.id)}
// //               style={{ position: "absolute", right: 0, top: 0, zIndex: 10 }}
// //             >
// //               <DeleteIcon />
// //             </IconButton>
// //             <Box border={1} padding={2}>
// //               {renderChart(chart)}
// //               <Box display="flex" justifyContent="space-between">
// //                 <Button variant="outlined" color="primary" onClick={() => openDialog(chart)}>
// //                   Configure Chart
// //                 </Button>
// //               </Box>
// //             </Box>
// //           </Box>
// //         ))}

// //         {tempChartData && (
// //           <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
// //             <DialogTitle>Configure Chart</DialogTitle>
// //             <DialogContent>
// //               <Box display="flex" flexDirection="column" maxHeight="400px" overflow="auto">
// //                 <FormControl fullWidth margin="normal">
// //                   <InputLabel>X-Axis Data Key</InputLabel>
// //                   <Select
// //                     value={tempChartData.xAxisDataKey}
// //                     onChange={handleXAxisKeyChange}
// //                   >
// //                     <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
// //                     <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
// //                     <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
// //                     <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
// //                   </Select>
// //                 </FormControl>
// //                 <TextField
// //                   label="X-Axis Min Range"
// //                   type="number"
// //                   name="min"
// //                   value={tempChartData.xAxisRange[0]}
// //                   onChange={handleXAxisRangeChange}
// //                   fullWidth
// //                   margin="normal"
// //                   inputProps={{ step: 0.0001 }}
// //                 />
// //                 <TextField
// //                   label="X-Axis Max Range"
// //                   type="number"
// //                   name="max"
// //                   value={tempChartData.xAxisRange[1]}
// //                   onChange={handleXAxisRangeChange}
// //                   fullWidth
// //                   margin="normal"
// //                   inputProps={{ step: 0.0001 }}
// //                 />
// //                 <FormControl fullWidth margin="normal">
// //                   <InputLabel>Y-Axis Data Key</InputLabel>
// //                   <Select
// //                     value={tempChartData.yAxisDataKey}
// //                     onChange={handleYAxisKeyChange}
// //                   >
// //                     <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
// //                     <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
// //                     <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
// //                     <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
// //                   </Select>
// //                 </FormControl>
// //                 <TextField
// //                   label="Y-Axis Min Range"
// //                   type="number"
// //                   name="min"
// //                   value={tempChartData.yAxisRange[0]}
// //                   onChange={handleYAxisRangeChange}
// //                   fullWidth
// //                   margin="normal"
// //                   inputProps={{ step: 0.0001 }}
// //                 />
// //                 <TextField
// //                   label="Y-Axis Max Range"
// //                   type="number"
// //                   name="max"
// //                   value={tempChartData.yAxisRange[1]}
// //                   onChange={handleYAxisRangeChange}
// //                   fullWidth
// //                   margin="normal"
// //                   inputProps={{ step: 0.0001 }}
// //                 />
// //                 <Button onClick={() => setDialogOpen(true)}>Select Color</Button>
// //                 <SketchPicker color={tempChartData.color} onChangeComplete={handleColorChange} />
// //               </Box>
// //             </DialogContent>
// //             <DialogActions>
// //               <Button onClick={closeDialog} color="secondary">Cancel</Button>
// //               <Button onClick={saveConfiguration} color="secondary">Save</Button>
// //             </DialogActions>
// //           </Dialog>
// //         )}

// //         {/* Dialog for date range selection */}
// //         <Dialog open={dateDialogOpen} onClose={() => setDateDialogOpen(false)} fullWidth maxWidth="sm">
// //           <DialogTitle>Select Date Range</DialogTitle>
// //           <DialogContent>
// //             <Grid container spacing={2} alignItems="center">
// //               <Grid item xs={12}>
// //                 <FormControlLabel
// //                   control={<Switch checked={realTimeData} onChange={(e) => setRealTimeData(e.target.checked)} />}
// //                   label="Switch to Real-Time Data"
// //                 />
// //               </Grid>
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
// //                   disabled={realTimeData}
// //                 />
// //               </Grid>
// //             </Grid>
// //           </DialogContent>
// //           <DialogActions>
// //             <Button onClick={() => setDateDialogOpen(false)} color="secondary">Cancel</Button>
// //             <Button
// //               onClick={() => {
// //                 setDateDialogOpen(false);
// //                 if (!realTimeData) fetchHistoricalData();
// //               }}
// //               color="secondary"
// //               disabled={!startDate || (!realTimeData && !endDate)}
// //             >
// //               Apply
// //             </Button>
// //           </DialogActions>
// //         </Dialog>
// //       </Container>
// //     </LocalizationProvider>
// //   );
// // };

// // export default CustomScatterCharts;

// // import React, { useState, useEffect, useRef } from "react";
// // import {
// //   ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
// // } from "recharts";
// // import {
// //   Container, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
// //   FormControl, InputLabel, Select, MenuItem, IconButton, Grid, TextField, Switch, FormControlLabel
// // } from "@mui/material";
// // import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// // import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// // import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// // import axios from 'axios';
// // import { format } from 'date-fns';
// // import { w3cwebsocket as W3CWebSocket } from "websocket";
// // import DeleteIcon from '@mui/icons-material/Delete';
// // import { SketchPicker } from 'react-color';

// // const CustomScatterCharts = () => {
// //   const [data, setData] = useState([]);
// //   const [charts, setCharts] = useState([]);
// //   const [chartDialogOpen, setChartDialogOpen] = useState(false);
// //   const [dialogOpen, setDialogOpen] = useState(false);
// //   const [tempChartData, setTempChartData] = useState(null);

// //   const [startDate, setStartDate] = useState(null);
// //   const [endDate, setEndDate] = useState(null);
// //   const [realTimeData, setRealTimeData] = useState(false);
// //   const [dateDialogOpen, setDateDialogOpen] = useState(false);
// //   const [loading, setLoading] = useState(false);

// //   const wsClientRef = useRef(null);

// //   // Establish WebSocket connection and handle real-time data
// //   useEffect(() => {
// //     if (realTimeData) {
// //       if (wsClientRef.current) wsClientRef.current.close();

// //       wsClientRef.current = new W3CWebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");

// //       wsClientRef.current.onmessage = (message) => {
// //         try {
// //           const receivedData = JSON.parse(message.data);
// //           const payload = receivedData.payload || {};
// //           const newData = {
// //             timestamp: receivedData.timestamp || Date.now(),
// //             'AX-LT-011': payload['AX-LT-011'] || null,
// //             'AX-LT-021': payload['AX-LT-021'] || null,
// //             'CW-TT-011': payload['CW-TT-011'] || null,
// //             'CW-TT-021': payload['CW-TT-021'] || null,
// //           };

// //           // Append new data point to the existing data array
// //           if (newData['AX-LT-011'] !== null || newData['AX-LT-021'] !== null || newData['CW-TT-011'] !== null) {
// //             setData((prevData) => [...prevData, newData]);
// //           }
// //         } catch (error) {
// //           console.error("Error processing WebSocket message:", error);
// //         }
// //       };

// //       wsClientRef.current.onclose = () => {
// //         console.log("WebSocket disconnected. Reconnecting...");
// //         setTimeout(() => {
// //           wsClientRef.current = new W3CWebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");
// //         }, 1000);
// //       };

// //       return () => {
// //         if (wsClientRef.current) wsClientRef.current.close();
// //       };
// //     }
// //   }, [realTimeData]);

// //   // Fetch historical data based on selected date range
// //   const fetchHistoricalData = async () => {
// //     if (!startDate || !endDate) return;
// //     setLoading(true);

// //     try {
// //       const formattedStartDate = format(startDate, 'yyyy-MM-dd');
// //       const formattedStartTime = format(startDate, 'HH:mm');
// //       const formattedEndDate = format(endDate, 'yyyy-MM-dd');
// //       const formattedEndTime = format(endDate, 'HH:mm');

// //       // Fetch data from API
// //       const response = await axios.post('https://7ko9a0hlo2.execute-api.us-east-1.amazonaws.com/dev/data', {
// //         start_date: formattedStartDate,
// //         start_time: formattedStartTime,
// //         end_date: formattedEndDate,
// //         end_time: formattedEndTime,
// //         plot_all: true
// //       });

// //       // Parse the historical data
// //       const historicalData = response.data.data.map(item => ({
// //         timestamp: item.timestamp,
// //         'AX-LT-011': item.payload['AX-LT-011'],
// //         'AX-LT-021': item.payload['AX-LT-021'],
// //         'CW-TT-011': item.payload['CW-TT-011'],
// //         'CW-TT-021': item.payload['CW-TT-021'],
// //       }));

// //       setData(historicalData);
// //     } catch (error) {
// //       console.error('Error fetching historical data:', error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const addCustomChart = () => {
// //     const newChart = {
// //       id: Date.now(),
// //       xAxisDataKey: 'AX-LT-011',
// //       yAxisDataKey: 'AX-LT-021',
// //       xAxisRange: ['auto', 'auto'],  // Default auto X-axis range
// //       yAxisRange: ['auto', 'auto'],  // Default auto Y-axis range
// //       color: "#FF0000",
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

// //   const handleXAxisKeyChange = (event) => {
// //     const { value } = event.target;
// //     setTempChartData((prevChart) => ({
// //       ...prevChart,
// //       xAxisDataKey: value
// //     }));
// //   };

// //   const handleYAxisKeyChange = (event) => {
// //     const { value } = event.target;
// //     setTempChartData((prevChart) => ({
// //       ...prevChart,
// //       yAxisDataKey: value
// //     }));
// //   };

// //   const handleXAxisRangeChange = (event) => {
// //     const { name, value } = event.target;
// //     setTempChartData((prevChart) => ({
// //       ...prevChart,
// //       xAxisRange: name === 'min' ? [parseFloat(value), prevChart.xAxisRange[1]] : [prevChart.xAxisRange[0], parseFloat(value)]
// //     }));
// //   };

// //   const handleYAxisRangeChange = (event) => {
// //     const { name, value } = event.target;
// //     setTempChartData((prevChart) => ({
// //       ...prevChart,
// //       yAxisRange: name === 'min' ? [parseFloat(value), prevChart.yAxisRange[1]] : [prevChart.yAxisRange[0], parseFloat(value)]
// //     }));
// //   };

// //   const handleColorChange = (color) => {
// //     setTempChartData((prevChart) => ({
// //       ...prevChart,
// //       color: color.hex
// //     }));
// //   };

// //   const deleteChart = (chartId) => {
// //     setCharts((prevCharts) => prevCharts.filter((chart) => chart.id !== chartId));
// //   };

// //   const renderChart = (chart) => (
// //     <ResponsiveContainer width="100%" height={400}>
// //       <ScatterChart>
// //         <CartesianGrid strokeDasharray="3 3" />
// //         <XAxis
// //           type="number"
// //           dataKey={chart.xAxisDataKey}
// //           name={chart.xAxisDataKey}
// //           domain={[chart.xAxisRange[0], chart.xAxisRange[1]]}
// //           tickFormatter={(value) => value.toFixed(4)}
// //         />
// //         <YAxis
// //           type="number"
// //           dataKey={chart.yAxisDataKey}
// //           name={chart.yAxisDataKey}
// //           domain={[chart.yAxisRange[0], chart.yAxisRange[1]]}
// //           tickFormatter={(value) => value.toFixed(4)}
// //         />
// //         <Tooltip cursor={{ strokeDasharray: '3 3' }} />
// //         <Legend />
// //         <Scatter
// //           name={`${chart.xAxisDataKey} vs ${chart.yAxisDataKey}`}
// //           data={data.filter(item => item[chart.xAxisDataKey] !== null && item[chart.yAxisDataKey] !== null)}
// //           fill={chart.color}
// //         />
// //       </ScatterChart>
// //     </ResponsiveContainer>
// //   );

// //   return (
// //     <LocalizationProvider dateAdapter={AdapterDateFns}>
// //       <Container>
// //         <Box display="flex" justifyContent="flex-end" marginBottom={4}>
// //           <Button variant="contained" color="primary" onClick={() => setChartDialogOpen(true)}>
// //             Add Custom Scatter Chart
// //           </Button>
// //           {/* Button for selecting the date range */}
// //           <Button
// //             variant="contained"
// //             color="secondary"
// //             onClick={() => setDateDialogOpen(true)}
// //             style={{ marginLeft: '10px' }}
// //           >
// //             Select Date Range
// //           </Button>
// //         </Box>

// //         <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
// //           <DialogTitle>Select Chart Type</DialogTitle>
// //           <DialogContent>
// //             <Box display="flex" flexDirection="column" gap={2}>
// //               <Button variant="contained" onClick={addCustomChart}>Add Scatter Chart</Button>
// //             </Box>
// //           </DialogContent>
// //           <DialogActions>
// //             <Button onClick={() => setChartDialogOpen(false)} color="secondary">Cancel</Button>
// //           </DialogActions>
// //         </Dialog>

// //         {charts.map((chart) => (
// //           <Box key={chart.id} marginY={4} position="relative">
// //             <IconButton
// //               aria-label="delete"
// //               onClick={() => deleteChart(chart.id)}
// //               style={{ position: "absolute", right: 0, top: 0, zIndex: 10 }}
// //             >
// //               <DeleteIcon />
// //             </IconButton>
// //             <Box border={1} padding={2}>
// //               {renderChart(chart)}
// //               <Box display="flex" justifyContent="space-between">
// //                 <Button variant="outlined" color="primary" onClick={() => openDialog(chart)}>
// //                   Configure Chart
// //                 </Button>
// //               </Box>
// //             </Box>
// //           </Box>
// //         ))}

// //         {tempChartData && (
// //           <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
// //             <DialogTitle>Configure Chart</DialogTitle>
// //             <DialogContent>
// //               <Box display="flex" flexDirection="column" maxHeight="400px" overflow="auto">
// //                 <FormControl fullWidth margin="normal">
// //                   <InputLabel>X-Axis Data Key</InputLabel>
// //                   <Select
// //                     value={tempChartData.xAxisDataKey}
// //                     onChange={handleXAxisKeyChange}
// //                   >
// //                     <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
// //                     <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
// //                     <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
// //                     <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
// //                   </Select>
// //                 </FormControl>
// //                 <TextField
// //                   label="X-Axis Min Range"
// //                   type="number"
// //                   name="min"
// //                   value={tempChartData.xAxisRange[0]}
// //                   onChange={handleXAxisRangeChange}
// //                   fullWidth
// //                   margin="normal"
// //                   inputProps={{ step: 0.0001 }}
// //                 />
// //                 <TextField
// //                   label="X-Axis Max Range"
// //                   type="number"
// //                   name="max"
// //                   value={tempChartData.xAxisRange[1]}
// //                   onChange={handleXAxisRangeChange}
// //                   fullWidth
// //                   margin="normal"
// //                   inputProps={{ step: 0.0001 }}
// //                 />
// //                 <FormControl fullWidth margin="normal">
// //                   <InputLabel>Y-Axis Data Key</InputLabel>
// //                   <Select
// //                     value={tempChartData.yAxisDataKey}
// //                     onChange={handleYAxisKeyChange}
// //                   >
// //                     <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
// //                     <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
// //                     <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
// //                     <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
// //                   </Select>
// //                 </FormControl>
// //                 <TextField
// //                   label="Y-Axis Min Range"
// //                   type="number"
// //                   name="min"
// //                   value={tempChartData.yAxisRange[0]}
// //                   onChange={handleYAxisRangeChange}
// //                   fullWidth
// //                   margin="normal"
// //                   inputProps={{ step: 0.0001 }}
// //                 />
// //                 <TextField
// //                   label="Y-Axis Max Range"
// //                   type="number"
// //                   name="max"
// //                   value={tempChartData.yAxisRange[1]}
// //                   onChange={handleYAxisRangeChange}
// //                   fullWidth
// //                   margin="normal"
// //                   inputProps={{ step: 0.0001 }}
// //                 />
// //                 <Button onClick={() => setDialogOpen(true)}>Select Color</Button>
// //                 <SketchPicker color={tempChartData.color} onChangeComplete={handleColorChange} />
// //               </Box>
// //             </DialogContent>
// //             <DialogActions>
// //               <Button onClick={closeDialog} color="secondary">Cancel</Button>
// //               <Button onClick={saveConfiguration} color="primary">Save</Button>
// //             </DialogActions>
// //           </Dialog>
// //         )}

// //         {/* Dialog for date range selection */}
// //         <Dialog open={dateDialogOpen} onClose={() => setDateDialogOpen(false)} fullWidth maxWidth="sm">
// //           <DialogTitle>Select Date Range</DialogTitle>
// //           <DialogContent>
// //             <Grid container spacing={2} alignItems="center">
// //               <Grid item xs={12}>
// //                 <FormControlLabel
// //                   control={<Switch checked={realTimeData} onChange={(e) => setRealTimeData(e.target.checked)} />}
// //                   label="Switch to Real-Time Data"
// //                 />
// //               </Grid>
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
// //                   disabled={realTimeData}
// //                 />
// //               </Grid>
// //             </Grid>
// //           </DialogContent>
// //           <DialogActions>
// //             <Button onClick={() => setDateDialogOpen(false)} color="secondary">Cancel</Button>
// //             <Button
// //               onClick={() => {
// //                 setDateDialogOpen(false);
// //                 if (!realTimeData) fetchHistoricalData();
// //               }}
// //               color="primary"
// //               disabled={!startDate || (!realTimeData && !endDate)}
// //             >
// //               Apply
// //             </Button>
// //           </DialogActions>
// //         </Dialog>
// //       </Container>
// //     </LocalizationProvider>
// //   );
// // };

// // export default CustomScatterCharts;

// // import React, { useState, useEffect, useRef } from "react";
// // import {
// //   ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
// // } from "recharts";
// // import {
// //   Container, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
// //   FormControl, InputLabel, Select, MenuItem, Typography, IconButton, Grid, TextField, Switch, FormControlLabel
// // } from "@mui/material";
// // import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// // import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// // import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// // import axios from 'axios';
// // import { format } from 'date-fns';
// // import { w3cwebsocket as W3CWebSocket } from "websocket";
// // import DeleteIcon from '@mui/icons-material/Delete';
// // import { SketchPicker } from 'react-color';

// // const CustomScatterCharts = () => {
// //   const [data, setData] = useState([]);
// //   const [charts, setCharts] = useState([]);
// //   const [chartDialogOpen, setChartDialogOpen] = useState(false);
// //   const [dialogOpen, setDialogOpen] = useState(false);
// //   const [tempChartData, setTempChartData] = useState(null);

// //   const [dateDialogOpen, setDateDialogOpen] = useState(false);
// //   const [startDate, setStartDate] = useState(null);
// //   const [endDate, setEndDate] = useState(null);
// //   const [realTimeData, setRealTimeData] = useState(false);
// //   const [loading, setLoading] = useState(false);

// //   const wsClientRef = useRef(null);

// //   useEffect(() => {
// //     if (realTimeData) {
// //       if (wsClientRef.current) wsClientRef.current.close();

// //       wsClientRef.current = new W3CWebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");

// //       wsClientRef.current.onmessage = (message) => {
// //         try {
// //           const receivedData = JSON.parse(message.data);
// //           const payload = receivedData.payload || {};
// //           const newData = {
// //             timestamp: receivedData.timestamp || Date.now(),
// //             'AX-LT-011': payload['AX-LT-011'] || null,
// //             'AX-LT-021': payload['AX-LT-021'] || null,
// //             'CW-TT-011': payload['CW-TT-011'] || null,
// //             'CW-TT-021': payload['CW-TT-021'] || null,
// //           };

// //           if (newData['AX-LT-011'] !== null || newData['AX-LT-021'] !== null || newData['CW-TT-011'] !== null) {
// //             setData((prevData) => [...prevData, newData]);
// //           }
// //         } catch (error) {
// //           console.error("Error processing WebSocket message:", error);
// //         }
// //       };

// //       wsClientRef.current.onclose = () => {
// //         console.log("WebSocket disconnected. Reconnecting...");
// //         setTimeout(() => {
// //           wsClientRef.current = new W3CWebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");
// //         }, 1000);
// //       };

// //       return () => {
// //         if (wsClientRef.current) wsClientRef.current.close();
// //       };
// //     }
// //   }, [realTimeData]);

// //   const downsampleData = (data, factor) => {
// //     return data.filter((_, index) => index % factor === 0);
// //   };

// //   const fetchHistoricalData = async () => {
// //     if (!startDate || !endDate) return;
// //     setLoading(true);

// //     try {
// //       const formattedStartDate = format(startDate, 'yyyy-MM-dd');
// //       const formattedStartTime = format(startDate, 'HH:mm');
// //       const formattedEndDate = format(endDate, 'yyyy-MM-dd');
// //       const formattedEndTime = format(endDate, 'HH:mm');

// //       const response = await axios.post('https://7ko9a0hlo2.execute-api.us-east-1.amazonaws.com/dev/data', {
// //         start_date: formattedStartDate,
// //         start_time: formattedStartTime,
// //         end_date: formattedEndDate,
// //         end_time: formattedEndTime,
// //         plot_all: true
// //       });

// //       let historicalData = response.data.data.map(item => ({
// //         timestamp: item.timestamp,
// //         'AX-LT-011': item.payload['AX-LT-011'],
// //         'AX-LT-021': item.payload['AX-LT-021'],
// //         'CW-TT-011': item.payload['CW-TT-011'],
// //         'CW-TT-021': item.payload['CW-TT-021'],
// //       }));

// //       if (historicalData.length > 86400) {
// //         historicalData = downsampleData(historicalData, 10);
// //       }

// //       setData(historicalData);

// //     } catch (error) {
// //       console.error('Error fetching historical data:', error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const addCustomChart = (type) => {
// //     const newChart = {
// //       id: Date.now(),
// //       type,
// //       xAxisDataKey: 'AX-LT-011',
// //       yAxisDataKey: 'AX-LT-021',
// //       color: "#FF0000",
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

// //   const handleXAxisKeyChange = (event) => {
// //     const { value } = event.target;
// //     setTempChartData((prevChart) => ({
// //       ...prevChart,
// //       xAxisDataKey: value
// //     }));
// //   };

// //   const handleYAxisKeyChange = (event) => {
// //     const { value } = event.target;
// //     setTempChartData((prevChart) => ({
// //       ...prevChart,
// //       yAxisDataKey: value
// //     }));
// //   };

// //   const handleColorChange = (color) => {
// //     setTempChartData((prevChart) => ({
// //       ...prevChart,
// //       color: color.hex
// //     }));
// //   };

// //   const deleteChart = (chartId) => {
// //     setCharts((prevCharts) => prevCharts.filter((chart) => chart.id !== chartId));
// //   };

// //   const renderChart = (chart) => (
// //     <ResponsiveContainer width="100%" height={400}>
// //       <ScatterChart>
// //         <CartesianGrid strokeDasharray="3 3" />
// //         <XAxis type="number" dataKey={chart.xAxisDataKey} name={chart.xAxisDataKey} />
// //         <YAxis type="number" dataKey={chart.yAxisDataKey} name={chart.yAxisDataKey} />
// //         <Tooltip cursor={{ strokeDasharray: '3 3' }} />
// //         <Legend />
// //         <Scatter
// //           name={`${chart.xAxisDataKey} vs ${chart.yAxisDataKey}`}
// //           data={data.filter(item => item[chart.xAxisDataKey] !== null && item[chart.yAxisDataKey] !== null)}
// //           fill={chart.color}
// //         />
// //       </ScatterChart>
// //     </ResponsiveContainer>
// //   );

// //   return (
// //     <LocalizationProvider dateAdapter={AdapterDateFns}>
// //       <Container>
// //         <Box display="flex" justifyContent="flex-end" marginBottom={4}>
// //           <Button variant="contained" color="primary" onClick={() => setChartDialogOpen(true)}>
// //             Add Custom Scatter Chart
// //           </Button>
// //         </Box>

// //         <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
// //           <DialogTitle>Select Chart Type</DialogTitle>
// //           <DialogContent>
// //             <Box display="flex" flexDirection="column" gap={2}>
// //               <Button variant="contained" onClick={() => addCustomChart('Scatter')}>Add Scatter Chart</Button>
// //             </Box>
// //           </DialogContent>
// //           <DialogActions>
// //             <Button onClick={() => setChartDialogOpen(false)} color="secondary">Cancel</Button>
// //           </DialogActions>
// //         </Dialog>

// //         {charts.map((chart) => (
// //           <Box key={chart.id} marginY={4} position="relative">
// //             <IconButton
// //               aria-label="delete"
// //               onClick={() => deleteChart(chart.id)}
// //               style={{ position: "absolute", right: 0, top: 0, zIndex: 10 }}
// //             >
// //               <DeleteIcon />
// //             </IconButton>
// //             <Box border={1} padding={2}>
// //               {renderChart(chart)}
// //               <Box display="flex" justifyContent="space-between">
// //                 <Button variant="outlined" color="primary" onClick={() => openDialog(chart)}>
// //                   Configure Chart
// //                 </Button>
// //                 <Button variant="outlined" color="primary" onClick={() => setDateDialogOpen(true)}>
// //                   Date Range Select
// //                 </Button>
// //               </Box>
// //             </Box>
// //           </Box>
// //         ))}

// //         {tempChartData && (
// //           <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
// //             <DialogTitle>Configure Chart</DialogTitle>
// //             <DialogContent>
// //               <Box display="flex" flexDirection="column" maxHeight="400px" overflow="auto">
// //                 <FormControl fullWidth margin="normal">
// //                   <InputLabel>X-Axis Data Key</InputLabel>
// //                   <Select
// //                     value={tempChartData.xAxisDataKey}
// //                     onChange={handleXAxisKeyChange}
// //                   >
// //                     <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
// //                     <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
// //                     <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
// //                     <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
// //                   </Select>
// //                 </FormControl>
// //                 <FormControl fullWidth margin="normal">
// //                   <InputLabel>Y-Axis Data Key</InputLabel>
// //                   <Select
// //                     value={tempChartData.yAxisDataKey}
// //                     onChange={handleYAxisKeyChange}
// //                   >
// //                     <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
// //                     <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
// //                     <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
// //                     <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
// //                   </Select>
// //                 </FormControl>
// //                 <Button onClick={() => setDialogOpen(true)}>Select Color</Button>
// //                 <SketchPicker color={tempChartData.color} onChangeComplete={handleColorChange} />
// //               </Box>
// //             </DialogContent>
// //             <DialogActions>
// //               <Button onClick={closeDialog} color="secondary">Cancel</Button>
// //               <Button onClick={saveConfiguration} color="primary">Save</Button>
// //             </DialogActions>
// //           </Dialog>
// //         )}

// //         <Dialog open={dateDialogOpen} onClose={() => setDateDialogOpen(false)} fullWidth maxWidth="sm">
// //           <DialogTitle>Select Date Range</DialogTitle>
// //           <DialogContent>
// //             <Grid container spacing={2} alignItems="center">
// //               <Grid item xs={12}>
// //                 <FormControlLabel
// //                   control={<Switch checked={realTimeData} onChange={(e) => setRealTimeData(e.target.checked)} />}
// //                   label="Switch to Real-Time Data"
// //                 />
// //               </Grid>
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
// //                   disabled={realTimeData}
// //                 />
// //               </Grid>
// //             </Grid>
// //           </DialogContent>
// //           <DialogActions>
// //             <Button onClick={() => setDateDialogOpen(false)} color="secondary">Cancel</Button>
// //             <Button
// //               onClick={() => {
// //                 setDateDialogOpen(false);
// //                 if (!realTimeData) fetchHistoricalData();
// //               }}
// //               color="primary"
// //               disabled={!startDate || (!realTimeData && !endDate)}
// //             >
// //               Apply
// //             </Button>
// //           </DialogActions>
// //         </Dialog>
// //       </Container>
// //     </LocalizationProvider>
// //   );
// // };

// // export default CustomScatterCharts;

// // import React, { useState, useEffect, useRef } from "react";
// // import {
// //   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, Brush
// // } from "recharts";
// // import {
// //   Container, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
// //   Typography, IconButton, Grid, TextField, FormControlLabel, Radio, RadioGroup, FormControl, Select, MenuItem, InputLabel
// // } from "@mui/material";
// // import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// // import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// // import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// // import axios from 'axios';
// // import { format } from 'date-fns';
// // import { w3cwebsocket as W3CWebSocket } from "websocket";
// // import DeleteIcon from '@mui/icons-material/Delete';
// // import { SketchPicker } from 'react-color';

// // const lineStyles = [
// //   { value: 'solid', label: 'Solid' },
// //   { value: 'dotted', label: 'Dotted' },
// //   { value: 'dashed', label: 'Dashed' }
// // ];

// // const HistoricalCharts = () => {
// //   const [data, setData] = useState([]); // Stores all data points for the charts
// //   const [charts, setCharts] = useState([]); // Stores custom chart configurations
// //   const [chartDialogOpen, setChartDialogOpen] = useState(false);
// //   const [dateDialogOpen, setDateDialogOpen] = useState(false);
// //   const [dialogOpen, setDialogOpen] = useState(false);
// //   const [tempChartData, setTempChartData] = useState(null); // Temp chart configuration data
// //   const [selectedYAxisId, setSelectedYAxisId] = useState(null);
// //   const [colorPickerOpen, setColorPickerOpen] = useState(false);
// //   const [startDate, setStartDate] = useState(null);
// //   const [endDate, setEndDate] = useState(null);
// //   const [mode, setMode] = useState('A'); // Modes: 'A' (Real-time), 'B' (Historical), 'C' (Start Historical + Real-time)
// //   const [loading, setLoading] = useState(false);

// //   const wsClientRef = useRef(null);

// //   // Real-time data handling
// //   useEffect(() => {
// //     if (mode === 'A' || mode === 'C') {
// //       if (wsClientRef.current) wsClientRef.current.close();

// //       wsClientRef.current = new W3CWebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");

// //       wsClientRef.current.onmessage = (message) => {
// //         try {
// //           const receivedData = JSON.parse(message.data);
// //           const payload = receivedData.payload || {};
// //           const newData = {
// //             timestamp: receivedData.timestamp || Date.now(),
// //             'AX-LT-011': payload['AX-LT-011'] || null,
// //             'AX-LT-021': payload['AX-LT-021'] || null,
// //             'CW-TT-011': payload['CW-TT-011'] || null,
// //           };

// //           if (newData['AX-LT-011'] !== null || newData['AX-LT-021'] !== null || newData['CW-TT-011'] !== null) {
// //             setData((prevData) => [...prevData, newData]); // Append real-time data
// //           }
// //         } catch (error) {
// //           console.error("Error processing WebSocket message:", error);
// //         }
// //       };

// //       wsClientRef.current.onclose = () => {
// //         console.log("WebSocket disconnected. Reconnecting...");
// //         setTimeout(() => {
// //           wsClientRef.current = new W3CWebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");
// //         }, 1000);
// //       };

// //       return () => {
// //         if (wsClientRef.current) wsClientRef.current.close();
// //       };
// //     }
// //   }, [mode]);

// //   // Fetch historical data for Option B and C
// //   const fetchHistoricalData = async () => {
// //     if (!startDate) return;
// //     setLoading(true);

// //     try {
// //       const formattedStartDate = format(startDate, 'yyyy-MM-dd');
// //       const formattedStartTime = format(startDate, 'HH:mm');
// //       const formattedEndDate = endDate ? format(endDate, 'yyyy-MM-dd') : null;
// //       const formattedEndTime = endDate ? format(endDate, 'HH:mm') : null;

// //       const requestData = {
// //         start_date: formattedStartDate,
// //         start_time: formattedStartTime,
// //         plot_all: true,  // Ensures all data is returned for plotting
// //       };

// //       if (mode === 'B' && endDate) {
// //         requestData.end_date = formattedEndDate;
// //         requestData.end_time = formattedEndTime;
// //       }

// //       const response = await axios.post('https://7ko9a0hlo2.execute-api.us-east-1.amazonaws.com/dev/data', requestData);

// //       let historicalData = response.data.data.map(item => ({
// //         timestamp: item.timestamp,
// //         'AX-LT-011': item.payload['AX-LT-011'],
// //         'AX-LT-021': item.payload['AX-LT-021'],
// //         'CW-TT-011': item.payload['CW-TT-011'],
// //       }));

// //       setData(historicalData);  // Set historical data points to state

// //       // If mode is C (start with historical, then switch to real-time)
// //       if (mode === 'C') {
// //         setMode('A');  // Switch to real-time mode after fetching historical data
// //       }
// //     } catch (error) {
// //       console.error('Error fetching historical data:', error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

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

// //   const deleteChart = (chartId) => {
// //     setCharts((prevCharts) => prevCharts.filter((chart) => chart.id !== chartId));
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

// //   const openColorPicker = (yAxisId) => {
// //     setSelectedYAxisId(yAxisId);
// //     setColorPickerOpen(true);
// //   };

// //   const handleDataKeyChange = (yAxisId, event) => {
// //     const { value } = event.target;
// //     setTempChartData((prevChart) => ({
// //       ...prevChart,
// //       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
// //         yAxis.id === yAxisId ? { ...yAxis, dataKeys: [value] } : yAxis
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

// //   const getYAxisDomain = (range) => {
// //     switch (range) {
// //       case "0-500": return [0, 500];
// //       case "0-100": return [0, 100];
// //       case "0-200": return [0, 200];
// //       case "0-10": return [0, 10];
// //       default: return [0, 500];
// //     }
// //   };

// //   // Function to render XY Chart (ScatterChart)
// //   const renderXYChart = (chart) => (
// //     <ResponsiveContainer width="100%" height={400}>
// //       <ScatterChart data={data}>
// //         <CartesianGrid strokeDasharray="3 3" />
// //         <XAxis dataKey="timestamp" type="number" domain={['auto', 'auto']} />
// //         {chart.yAxisDataKeys.map((yAxis) => (
// //           <YAxis
// //             key={yAxis.id}
// //             yAxisId={yAxis.id}
// //             domain={getYAxisDomain(yAxis.range)}
// //             stroke={yAxis.color}
// //           />
// //         ))}
// //         <Tooltip />
// //         <Legend />
// //         {chart.yAxisDataKeys.map((yAxis) =>
// //           yAxis.dataKeys.map((key) => (
// //             <Scatter
// //               key={key}
// //               dataKey={key}
// //               fill={yAxis.color}
// //               yAxisId={yAxis.id}
// //             />
// //           ))
// //         )}

// //       </ScatterChart>
// //     </ResponsiveContainer>
// //   );

// //   // Function to render Line Chart
// //   const renderLineChart = (chart) => (
// //     <ResponsiveContainer width="100%" height={400}>
// //       <LineChart data={data} syncId="syncChart">
// //         <CartesianGrid strokeDasharray="3 3" />
// //         <XAxis dataKey="timestamp" />
// //         {chart.yAxisDataKeys.map((yAxis) => (
// //           <YAxis
// //             key={yAxis.id}
// //             yAxisId={yAxis.id}
// //             domain={getYAxisDomain(yAxis.range)}
// //             stroke={yAxis.color}
// //           />
// //         ))}
// //         <Tooltip />
// //         <Legend />
// //         <Brush dataKey="timestamp" height={30} stroke="#8884d8" />  {/* Allows zooming */}
// //         {chart.yAxisDataKeys.map((yAxis) =>
// //           yAxis.dataKeys.map((key) => (
// //             <Line
// //               key={key}
// //               type="monotone"
// //               dataKey={key}
// //               stroke={yAxis.color}
// //               strokeDasharray={
// //                 yAxis.lineStyle === 'solid'
// //                   ? ''
// //                   : yAxis.lineStyle === 'dotted'
// //                   ? '1 1'
// //                   : '5 5'
// //               }
// //               yAxisId={yAxis.id}
// //             />
// //           ))
// //         )}
// //       </LineChart>
// //     </ResponsiveContainer>
// //   );

// //   const renderChart = (chart) => {
// //     switch (chart.type) {
// //       case "Line":
// //         return renderLineChart(chart);
// //       case "XY":
// //         return renderXYChart(chart);
// //       default:
// //         return null;
// //     }
// //   };

// //   return (
// //     <LocalizationProvider dateAdapter={AdapterDateFns}>
// //       <Container>
// //         <Box display="flex" justifyContent="flex-end" marginBottom={4}>
// //           <Button variant="contained" color="primary" onClick={() => setChartDialogOpen(true)}>
// //             Add Custom Chart
// //           </Button>
// //         </Box>

// //         <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
// //           <DialogTitle>Select Chart Type</DialogTitle>
// //           <DialogContent>
// //             <Box display="flex" flexDirection="column" gap={2}>
// //               <Button variant="contained" onClick={() => addCustomChart('Line')}>Add Line Chart</Button>
// //               <Button variant="contained" onClick={() => addCustomChart('XY')}>Add XY Chart</Button>
// //             </Box>
// //           </DialogContent>
// //           <DialogActions>
// //             <Button onClick={() => setChartDialogOpen(false)} color="secondary">Cancel</Button>
// //           </DialogActions>
// //         </Dialog>

// //         {charts.map((chart) => (
// //           <Box key={chart.id} marginY={4} position="relative">
// //             <IconButton
// //               aria-label="delete"
// //               onClick={() => deleteChart(chart.id)}
// //               style={{ position: "absolute", right: 0, top: 0, zIndex: 10 }}
// //             >
// //               <DeleteIcon />
// //             </IconButton>
// //             <Box border={1} padding={2}>
// //               {renderChart(chart)}
// //               <Box display="flex" justifyContent="space-between" marginTop={2}>
// //                 <Button variant="outlined" color="primary" onClick={() => openDialog(chart)}>
// //                   Configure Chart
// //                 </Button>
// //                 <Button variant="outlined" color="secondary" onClick={() => setDateDialogOpen(true)}>
// //                   Select Date Range
// //                 </Button>
// //               </Box>
// //             </Box>
// //           </Box>
// //         ))}

// //         {/* Configure Chart Dialog */}
// //         {tempChartData && (
// //           <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
// //             <DialogTitle>Configure Chart</DialogTitle>
// //             <DialogContent>
// //               <Box display="flex" flexDirection="column" gap={2}>
// //                 {tempChartData.yAxisDataKeys.map((yAxis) => (
// //                   <Box key={yAxis.id} display="flex" flexDirection="column" gap={2}>
// //                     <FormControl fullWidth>
// //                       <InputLabel>Data Key</InputLabel>
// //                       <Select
// //                         value={yAxis.dataKeys[0]}
// //                         onChange={(event) => handleDataKeyChange(yAxis.id, event)}
// //                       >
// //                         <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
// //                         <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
// //                         <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
// //                       </Select>
// //                     </FormControl>
// //                     <FormControl fullWidth>
// //                       <InputLabel>Line Style</InputLabel>
// //                       <Select
// //                         value={yAxis.lineStyle}
// //                         onChange={(event) => handleLineStyleChange(yAxis.id, event)}
// //                       >
// //                         {lineStyles.map((style) => (
// //                           <MenuItem key={style.value} value={style.value}>
// //                             {style.label}
// //                           </MenuItem>
// //                         ))}
// //                       </Select>
// //                     </FormControl>
// //                     <Button onClick={() => openColorPicker(yAxis.id)}>Select Color</Button>
// //                     {colorPickerOpen && selectedYAxisId === yAxis.id && (
// //                       <SketchPicker color={yAxis.color} onChangeComplete={handleColorChange} />
// //                     )}
// //                   </Box>
// //                 ))}
// //               </Box>
// //             </DialogContent>
// //             <DialogActions>
// //               <Button onClick={closeDialog} color="secondary">Cancel</Button>
// //               <Button onClick={saveConfiguration} color="primary">Save</Button>
// //             </DialogActions>
// //           </Dialog>
// //         )}

// //         {/* Date Range Selection Dialog */}
// //         <Dialog open={dateDialogOpen} onClose={() => setDateDialogOpen(false)} fullWidth maxWidth="sm">
// //           <DialogTitle>Select Date Range and Mode</DialogTitle>
// //           <DialogContent>
// //             <Grid container spacing={2} alignItems="center">
// //               <Grid item xs={12}>
// //                 <FormControl component="fieldset">
// //                   <RadioGroup
// //                     row
// //                     value={mode}
// //                     onChange={(e) => setMode(e.target.value)}
// //                   >
// //                     <FormControlLabel value="A" control={<Radio />} label="Real-Time Data Only" />
// //                     <FormControlLabel value="B" control={<Radio />} label="Select Date Range" />
// //                     <FormControlLabel value="C" control={<Radio />} label="Start Date & Continue Real-Time" />
// //                   </RadioGroup>
// //                 </FormControl>
// //               </Grid>
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
// //                   disabled={mode === 'A' || mode === 'C'}
// //                 />
// //               </Grid>
// //             </Grid>
// //           </DialogContent>
// //           <DialogActions>
// //             <Button onClick={() => setDateDialogOpen(false)} color="secondary">Cancel</Button>
// //             <Button
// //               onClick={() => {
// //                 setDateDialogOpen(false);
// //                 if (mode === 'B' || mode === 'C') fetchHistoricalData();
// //               }}
// //               color="primary"
// //               disabled={!startDate || (mode === 'B' && !endDate)}
// //             >
// //               Apply
// //             </Button>
// //           </DialogActions>
// //         </Dialog>
// //       </Container>
// //     </LocalizationProvider>
// //   );
// // };

// // export default HistoricalCharts;

// // import React, { useState, useEffect, useRef } from "react";
// // import {
// //   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, Brush
// // } from "recharts";
// // import {
// //   Container, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
// //   Typography, IconButton, Grid, TextField, FormControlLabel, Radio, RadioGroup, FormControl, Select, MenuItem, InputLabel
// // } from "@mui/material";
// // import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// // import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// // import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// // import axios from 'axios';
// // import { format } from 'date-fns';
// // import { w3cwebsocket as W3CWebSocket } from "websocket";
// // import DeleteIcon from '@mui/icons-material/Delete';
// // import { SketchPicker } from 'react-color';

// // const lineStyles = [
// //   { value: 'solid', label: 'Solid' },
// //   { value: 'dotted', label: 'Dotted' },
// //   { value: 'dashed', label: 'Dashed' }
// // ];

// // const HistoricalCharts = () => {
// //   const [data, setData] = useState([]); // Stores all data points for the charts
// //   const [charts, setCharts] = useState([]); // Stores custom chart configurations
// //   const [chartDialogOpen, setChartDialogOpen] = useState(false);
// //   const [dateDialogOpen, setDateDialogOpen] = useState(false);
// //   const [dialogOpen, setDialogOpen] = useState(false);
// //   const [tempChartData, setTempChartData] = useState(null); // Temp chart configuration data
// //   const [selectedYAxisId, setSelectedYAxisId] = useState(null);
// //   const [colorPickerOpen, setColorPickerOpen] = useState(false);
// //   const [startDate, setStartDate] = useState(null);
// //   const [endDate, setEndDate] = useState(null);
// //   const [mode, setMode] = useState('A'); // Modes: 'A' (Real-time), 'B' (Historical), 'C' (Start Historical + Real-time)
// //   const [loading, setLoading] = useState(false);

// //   const wsClientRef = useRef(null);

// //   // Real-time data handling
// //   useEffect(() => {
// //     if (mode === 'A' || mode === 'C') {
// //       if (wsClientRef.current) wsClientRef.current.close();

// //       wsClientRef.current = new W3CWebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");

// //       wsClientRef.current.onmessage = (message) => {
// //         try {
// //           const receivedData = JSON.parse(message.data);
// //           const payload = receivedData.payload || {};
// //           const newData = {
// //             timestamp: receivedData.timestamp || Date.now(),
// //             'AX-LT-011': payload['AX-LT-011'] || null,
// //             'AX-LT-021': payload['AX-LT-021'] || null,
// //             'CW-TT-011': payload['CW-TT-011'] || null,
// //           };

// //           if (newData['AX-LT-011'] !== null || newData['AX-LT-021'] !== null || newData['CW-TT-011'] !== null) {
// //             setData((prevData) => [...prevData, newData]); // Append real-time data
// //           }
// //         } catch (error) {
// //           console.error("Error processing WebSocket message:", error);
// //         }
// //       };

// //       wsClientRef.current.onclose = () => {
// //         console.log("WebSocket disconnected. Reconnecting...");
// //         setTimeout(() => {
// //           wsClientRef.current = new W3CWebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");
// //         }, 1000);
// //       };

// //       return () => {
// //         if (wsClientRef.current) wsClientRef.current.close();
// //       };
// //     }
// //   }, [mode]);

// //   // Fetch historical data for Option B and C
// //   const fetchHistoricalData = async () => {
// //     if (!startDate) return;
// //     setLoading(true);

// //     try {
// //       const formattedStartDate = format(startDate, 'yyyy-MM-dd');
// //       const formattedStartTime = format(startDate, 'HH:mm');
// //       const formattedEndDate = endDate ? format(endDate, 'yyyy-MM-dd') : null;
// //       const formattedEndTime = endDate ? format(endDate, 'HH:mm') : null;

// //       const requestData = {
// //         start_date: formattedStartDate,
// //         start_time: formattedStartTime,
// //         plot_all: true,  // Ensures all data is returned for plotting
// //       };

// //       if (mode === 'B' && endDate) {
// //         requestData.end_date = formattedEndDate;
// //         requestData.end_time = formattedEndTime;
// //       }

// //       const response = await axios.post('https://7ko9a0hlo2.execute-api.us-east-1.amazonaws.com/dev/data', requestData);

// //       let historicalData = response.data.data.map(item => ({
// //         timestamp: item.timestamp,
// //         'AX-LT-011': item.payload['AX-LT-011'],
// //         'AX-LT-021': item.payload['AX-LT-021'],
// //         'CW-TT-011': item.payload['CW-TT-011'],
// //       }));

// //       setData(historicalData);  // Set historical data points to state

// //       // If mode is C (start with historical, then switch to real-time)
// //       if (mode === 'C') {
// //         setMode('A');  // Switch to real-time mode after fetching historical data
// //       }
// //     } catch (error) {
// //       console.error('Error fetching historical data:', error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

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

// //   const deleteChart = (chartId) => {
// //     setCharts((prevCharts) => prevCharts.filter((chart) => chart.id !== chartId));
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

// //   const openColorPicker = (yAxisId) => {
// //     setSelectedYAxisId(yAxisId);
// //     setColorPickerOpen(true);
// //   };
// //   const handleXAxisDataKeyChange = (event) => {
// //     const { value } = event.target;
// //     setTempChartData((prevChart) => ({
// //       ...prevChart,
// //       xAxisDataKey: value,
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

// //   const deleteYAxis = (yAxisId) => {
// //     setTempChartData((prevChart) => ({
// //       ...prevChart,
// //       yAxisDataKeys: prevChart.yAxisDataKeys.filter((yAxis) => yAxis.id !== yAxisId),
// //     }));
// //   };

// //   const handleDataKeyChange = (yAxisId, event) => {
// //     const { value } = event.target;
// //     setTempChartData((prevChart) => ({
// //       ...prevChart,
// //       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
// //         yAxis.id === yAxisId ? { ...yAxis, dataKeys: [value] } : yAxis
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

// //   const getYAxisDomain = (range) => {
// //     switch (range) {
// //       case "0-500": return [0, 500];
// //       case "0-100": return [0, 100];
// //       case "0-200": return [0, 200];
// //       case "0-10": return [0, 10];
// //       default: return [0, 500];
// //     }
// //   };

// //   // Function to render XY Chart (ScatterChart)
// //   const renderXYChart = (chart) => {

// //     return (
// //       <ResponsiveContainer width="100%" height={400}>
// //         <ScatterChart>
// //           <CartesianGrid strokeDasharray="3 3" />
// //           <XAxis
// //             dataKey={chart.xAxisDataKey}
// //             name={chart.xAxisDataKey}
// //             type="number"
// //             domain={['auto', 'auto']}
// //             label={{ value: chart.xAxisDataKey, position: 'insideBottomRight', offset: -5 }}
// //           />
// //           {chart.yAxisDataKeys.map((yAxis) => (
// //             <YAxis
// //               key={yAxis.id}
// //               yAxisId={yAxis.id}
// //               type="number"
// //               domain={['auto', 'auto']}
// //               stroke={yAxis.color}
// //               label={{ value: yAxis.dataKeys.join(', '), angle: -90, position: 'insideLeft' }}
// //             />
// //           ))}
// //           <Tooltip cursor={{ strokeDasharray: '3 3' }} />
// //           <Legend />
// //           {chart.yAxisDataKeys.map((yAxis) =>
// //             yAxis.dataKeys.map((key) => (
// //               <Scatter
// //                 key={key}
// //                 name={key}

// //                 dataKey={key}
// //                 fill={yAxis.color}
// //                 yAxisId={yAxis.id}
// //               />
// //             ))
// //           )}
// //         </ScatterChart>
// //       </ResponsiveContainer>
// //     );
// //   };

// //   // Function to render Line Chart
// //   const renderLineChart = (chart) => (
// //     <ResponsiveContainer width="100%" height={400}>
// //       <LineChart data={data} syncId="syncChart">
// //         <CartesianGrid strokeDasharray="3 3" />
// //         <XAxis dataKey="timestamp" />
// //         {chart.yAxisDataKeys.map((yAxis) => (
// //           <YAxis
// //             key={yAxis.id}
// //             yAxisId={yAxis.id}
// //             domain={getYAxisDomain(yAxis.range)}
// //             stroke={yAxis.color}
// //           />
// //         ))}
// //         <Tooltip />
// //         <Legend />
// //         <Brush dataKey="timestamp" height={30} stroke="#8884d8" />  {/* Allows zooming */}
// //         {chart.yAxisDataKeys.map((yAxis) =>
// //           yAxis.dataKeys.map((key) => (
// //             <Line
// //               key={key}
// //               type="monotone"
// //               dataKey={key}
// //               stroke={yAxis.color}
// //               strokeDasharray={
// //                 yAxis.lineStyle === 'solid'
// //                   ? ''
// //                   : yAxis.lineStyle === 'dotted'
// //                   ? '1 1'
// //                   : '5 5'
// //               }
// //               yAxisId={yAxis.id}
// //             />
// //           ))
// //         )}
// //       </LineChart>
// //     </ResponsiveContainer>
// //   );

// //   const renderChart = (chart) => {
// //     switch (chart.type) {
// //       case "Line":
// //         return renderLineChart(chart);
// //       case "XY":
// //         return renderXYChart(chart);
// //       default:
// //         return null;
// //     }
// //   };

// //   return (
// //     <LocalizationProvider dateAdapter={AdapterDateFns}>
// //       <Container>
// //         <Box display="flex" justifyContent="flex-end" marginBottom={4}>
// //           <Button variant="contained" color="primary" onClick={() => setChartDialogOpen(true)}>
// //             Add Custom Chart
// //           </Button>
// //         </Box>

// //         <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
// //           <DialogTitle>Select Chart Type</DialogTitle>
// //           <DialogContent>
// //             <Box display="flex" flexDirection="column" gap={2}>
// //               <Button variant="contained" onClick={() => addCustomChart('Line')}>Add Line Chart</Button>
// //               <Button variant="contained" onClick={() => addCustomChart('XY')}>Add XY Chart</Button>
// //             </Box>
// //           </DialogContent>
// //           <DialogActions>
// //             <Button onClick={() => setChartDialogOpen(false)} color="secondary">Cancel</Button>
// //           </DialogActions>
// //         </Dialog>

// //         {charts.map((chart) => (
// //           <Box key={chart.id} marginY={4} position="relative">
// //             <IconButton
// //               aria-label="delete"
// //               onClick={() => deleteChart(chart.id)}
// //               style={{ position: "absolute", right: 0, top: 0, zIndex: 10 }}
// //             >
// //               <DeleteIcon />
// //             </IconButton>
// //             <Box border={1} padding={2}>
// //               {renderChart(chart)}
// //               <Box display="flex" justifyContent="space-between" marginTop={2}>
// //                 <Button variant="outlined" color="primary" onClick={() => openDialog(chart)}>
// //                   Configure Chart
// //                 </Button>
// //                 <Button variant="outlined" color="secondary" onClick={() => setDateDialogOpen(true)}>
// //                   Select Date Range
// //                 </Button>
// //               </Box>
// //             </Box>
// //           </Box>
// //         ))}

// //         {/* Configure Chart Dialog */}
// //           {/* Chart Configuration Dialog */}
// //           {tempChartData && (
// //             <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
// //               <DialogTitle>Configure Chart</DialogTitle>
// //               <DialogContent>
// //                 <Box display="flex" flexDirection="column" maxHeight="400px" overflow="auto">
// //                   {tempChartData.type === 'XY' && (
// //                     <Box marginBottom={2}>
// //                       <Typography variant="h6">X-Axis</Typography>
// //                       <FormControl fullWidth margin="normal">
// //                         <InputLabel>X-Axis Data Key</InputLabel>
// //                         <Select
// //                           value={tempChartData.xAxisDataKey}
// //                           onChange={handleXAxisDataKeyChange}
// //                         >
// //                           <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
// //                           <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
// //                           <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
// //                           <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
// //                           <MenuItem value="CR-PT-001">CR-PT-001</MenuItem>
// //                         </Select>
// //                       </FormControl>
// //                     </Box>
// //                   )}
// //                   {tempChartData.yAxisDataKeys.map((yAxis, index) => (
// //                     <Box key={yAxis.id} display="flex" flexDirection="column" marginBottom={2}>
// //                       <Box display="flex" justifyContent="space-between" alignItems="center">
// //                         <Typography variant="h6">Y-Axis {index + 1}</Typography>
// //                         <IconButton onClick={() => deleteYAxis(yAxis.id)}>
// //                           <DeleteIcon />
// //                         </IconButton>
// //                       </Box>
// //                       <FormControl fullWidth margin="normal">
// //                         <InputLabel>Data Keys</InputLabel>
// //                         <Select
// //                           multiple
// //                           value={yAxis.dataKeys}
// //                           onChange={(event) => handleDataKeyChange(yAxis.id, event)}
// //                         >
// //                           <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
// //                           <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
// //                           <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
// //                           <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
// //                           <MenuItem value="CR-PT-001">CR-PT-001</MenuItem>
// //                         </Select>
// //                       </FormControl>
// //                       <FormControl fullWidth margin="normal">
// //                         <InputLabel>Range</InputLabel>
// //                         <Select
// //                           value={yAxis.range}
// //                           onChange={(event) => handleRangeChange(yAxis.id, event)}
// //                         >
// //                           <MenuItem value="0-500">0-500</MenuItem>
// //                           <MenuItem value="0-100">0-100</MenuItem>
// //                           <MenuItem value="0-10">0-10</MenuItem>
// //                         </Select>
// //                       </FormControl>
// //                       <FormControl fullWidth margin="normal">
// //                         <InputLabel>Line Style</InputLabel>
// //                         <Select
// //                           value={yAxis.lineStyle}
// //                           onChange={(event) => handleLineStyleChange(yAxis.id, event)}
// //                         >
// //                           {lineStyles.map((style) => (
// //                             <MenuItem key={style.value} value={style.value}>
// //                               {style.label}
// //                             </MenuItem>
// //                           ))}
// //                         </Select>
// //                       </FormControl>
// //                       <Button onClick={() => openColorPicker(yAxis.id)}>Select Color</Button>
// //                       {colorPickerOpen && selectedYAxisId === yAxis.id && (
// //                         <SketchPicker color={yAxis.color} onChangeComplete={handleColorChange} />
// //                       )}
// //                     </Box>
// //                   ))}
// //                   <Button variant="contained" color="secondary" onClick={() => setTempChartData((prevChart) => ({
// //                     ...prevChart,
// //                     yAxisDataKeys: [
// //                       ...prevChart.yAxisDataKeys,
// //                       { id: `left-${prevChart.yAxisDataKeys.length}`, dataKeys: [], range: '0-500', color: '#FF0000', lineStyle: 'solid' },
// //                     ],
// //                   }))}>
// //                     Add Y-Axis
// //                   </Button>
// //                 </Box>
// //               </DialogContent>
// //               <DialogActions>
// //                 <Button onClick={closeDialog} color="secondary">Cancel</Button>
// //                 <Button onClick={saveConfiguration} color="primary">Save</Button>
// //               </DialogActions>
// //             </Dialog>
// //           )}
// //         {/* Date Range Selection Dialog */}
// //         <Dialog open={dateDialogOpen} onClose={() => setDateDialogOpen(false)} fullWidth maxWidth="sm">
// //           <DialogTitle>Select Date Range and Mode</DialogTitle>
// //           <DialogContent>
// //             <Grid container spacing={2} alignItems="center">
// //               <Grid item xs={12}>
// //                 <FormControl component="fieldset">
// //                   <RadioGroup
// //                     row
// //                     value={mode}
// //                     onChange={(e) => setMode(e.target.value)}
// //                   >
// //                     <FormControlLabel value="A" control={<Radio />} label="Real-Time Data Only" />
// //                     <FormControlLabel value="B" control={<Radio />} label="Select Date Range" />
// //                     <FormControlLabel value="C" control={<Radio />} label="Start Date & Continue Real-Time" />
// //                   </RadioGroup>
// //                 </FormControl>
// //               </Grid>
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
// //                   disabled={mode === 'A' || mode === 'C'}
// //                 />
// //               </Grid>
// //             </Grid>
// //           </DialogContent>
// //           <DialogActions>
// //             <Button onClick={() => setDateDialogOpen(false)} color="secondary">Cancel</Button>
// //             <Button
// //               onClick={() => {
// //                 setDateDialogOpen(false);
// //                 if (mode === 'B' || mode === 'C') fetchHistoricalData();
// //               }}
// //               color="primary"
// //               disabled={!startDate || (mode === 'B' && !endDate)}
// //             >
// //               Apply
// //             </Button>
// //           </DialogActions>
// //         </Dialog>
// //       </Container>
// //     </LocalizationProvider>
// //   );
// // };

// // export default HistoricalCharts;

// // import React, { useState, useEffect, useRef } from "react";
// // import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, Brush } from "recharts";
// // import {
// //   Container, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
// //   FormControl, InputLabel, Select, MenuItem, Typography, IconButton, Grid, TextField,
// //   FormControlLabel,
// //   Radio,
// //   RadioGroup
// // } from "@mui/material";
// // import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// // import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// // import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// // import { SketchPicker } from 'react-color';
// // import DeleteIcon from '@mui/icons-material/Delete';
// // import { w3cwebsocket as W3CWebSocket } from "websocket";
// // import axios from 'axios';
// // import { format, parseISO } from 'date-fns';

// // const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// // const lineStyles = [
// //   { value: 'solid', label: 'Solid' },
// //   { value: 'dotted', label: 'Dotted' },
// //   { value: 'dashed', label: 'Dashed' },
// //   { value: 'dot-dash', label: 'Dot Dash' },
// //   { value: 'dash-dot-dot', label: 'Dash Dot Dot' },
// // ];

// // const HistoricalCharts = () => {
// //   const [charts, setCharts] = useState([]); // Stores custom chart configurations
// //   const [chartData, setChartData] = useState({}); // Stores data for each chart independently
// //   const [tempChartData, setTempChartData] = useState(null);
// //   const [chartDialogOpen, setChartDialogOpen] = useState(false);
// //   const [dialogOpen, setDialogOpen] = useState(false);
// //   const [colorPickerOpen, setColorPickerOpen] = useState(false);
// //   const [selectedYAxisId, setSelectedYAxisId] = useState(null);
// //   const [dateDialogOpen, setDateDialogOpen] = useState(false);
// //   const [startDate, setStartDate] = useState(null);
// //   const [endDate, setEndDate] = useState(null);
// //   const [mode, setMode] = useState('A'); // A for real-time, B for historical range, C for real-time + historical
// //   const [currentChartId, setCurrentChartId] = useState(null); // The ID of the chart currently configuring date range
// //   const wsClientRefs = useRef({}); // Use a map of refs for WebSocket clients

// //   // Load saved charts from localStorage on component mount
// //   useEffect(() => {
// //     const savedCharts = localStorage.getItem('customCharts');
// //     if (savedCharts) {
// //       setCharts(JSON.parse(savedCharts));
// //     }
// //   }, []);
// //   // Function to fetch all data at once from Lambda
// //   const fetchDataForAll = async (chartId, start_date, start_time, end_date, end_time) => {
// //     try {
// //       const response = await axios.post('https://7ko9a0hlo2.execute-api.us-east-1.amazonaws.com/dev/data', {
// //         start_date,
// //         start_time,
// //         end_date,
// //         end_time,
// //         plot_all: true,  // This flag indicates we want all data points
// //       });

// //       const allData = response.data.data;
// //       setChartData(prevData => ({
// //         ...prevData,
// //         [chartId]: allData,  // Store all data points for the chart
// //       }));
// //     } catch (error) {
// //       console.error('Error fetching data:', error);
// //     }
// //   };

// //   // Save chart configurations (without data points) to localStorage whenever charts are updated
// //   const saveChartsToLocalStorage = (updatedCharts) => {
// //     const chartConfigurations = updatedCharts.map(chart => ({
// //       id: chart.id,
// //       type: chart.type,
// //       xAxisDataKey: chart.xAxisDataKey,
// //       yAxisDataKeys: chart.yAxisDataKeys,
// //     }));
// //     localStorage.setItem('customCharts', JSON.stringify(chartConfigurations));
// //   };

// //   const fetchHistoricalData = async (chartId) => {
// //     if (!startDate) return;

// //     try {
// //       const formattedStartDate = format(startDate, 'yyyy-MM-dd');
// //       const formattedStartTime = format(startDate, 'HH:mm');

// //       const requestData = {
// //         start_date: formattedStartDate,
// //         start_time: formattedStartTime,
// //       };

// //       if (mode === 'B' && endDate) {
// //         requestData.end_date = format(endDate, 'yyyy-MM-dd');
// //         requestData.end_time = format(endDate, 'HH:mm');
// //       }

// //       const response = await axios.post(
// //         'https://7ko9a0hlo2.execute-api.us-east-1.amazonaws.com/dev/data',
// //         requestData
// //       );

// //       const historicalData = response.data.data.map(item => ({
// //         timestamp: parseISO(item.payload['PLC-TIME-STAMP']),
// //         'AX-LT-011': item.payload['AX-LT-011'],
// //         'AX-LT-021': item.payload['AX-LT-021'],
// //         'CW-TT-011': item.payload['CW-TT-011'],
// //         'CW-TT-021': item.payload['CW-TT-021'],
// //       }));

// //       setChartData(prevData => ({
// //         ...prevData,
// //         [chartId]: historicalData,
// //       }));

// //       if (mode === 'C') {
// //         setupRealTimeWebSocket(chartId);
// //       }
// //     } catch (error) {
// //       console.error('Error fetching historical data:', error);
// //     }
// //   };

// //   const setupRealTimeWebSocket = (chartId) => {
// //     if (wsClientRefs.current[chartId]) {
// //       wsClientRefs.current[chartId].close();
// //     }

// //     wsClientRefs.current[chartId] = new W3CWebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");

// //     wsClientRefs.current[chartId].onopen = () => {
// //       console.log(`WebSocket connection established for chart ${chartId}`);
// //     };

// //     wsClientRefs.current[chartId].onmessage = (message) => {
// //       try {
// //         const receivedData = JSON.parse(message.data);
// //         const newData = {
// //           timestamp: parseISO(receivedData['PLC-TIME-STAMP']) || new Date(),
// //           'AX-LT-011': receivedData['AX-LT-011'] || null,
// //           'AX-LT-021': receivedData['AX-LT-021'] || null,
// //           'CW-TT-011': receivedData['CW-TT-011'] || null,
// //           'CW-TT-021': receivedData['CW-TT-021'] || null,
// //         };

// //         // Append new data to existing chart data to ensure continuity
// //         setChartData((prevData) => ({
// //           ...prevData,
// //           [chartId]: [...(prevData[chartId] || []), newData],  // Accumulate data
// //         }));
// //       } catch (error) {
// //         console.error("Error processing WebSocket message:", error);
// //       }
// //     };

// //     wsClientRefs.current[chartId].onclose = (event) => {
// //       console.error(`WebSocket disconnected for chart ${chartId} (code: ${event.code}, reason: ${event.reason}). Reconnecting...`);
// //       setTimeout(() => setupRealTimeWebSocket(chartId), 1000);
// //     };
// //   };

// // const addCustomChart = (type) => {
// //     const newChartId = Date.now();
// //     const newChart = {
// //       id: newChartId,
// //       type,
// //       xAxisDataKey: 'AX-LT-011', // Example data key, replace with your actual data key
// //       yAxisDataKeys: [{ id: 'left-0', dataKeys: ['AX-LT-011'], color: "#FF0000", lineStyle: 'solid' }],
// //     };
// //     setCharts([...charts, newChart]);
// //     setChartDialogOpen(false);

// //     // Start fetching all data for this chart as soon as it's created
// //     if (startDate && endDate) {
// //       fetchDataForAll(newChartId, startDate, '00:00', endDate, '23:59');
// //     }
// //   };

// //   const deleteChart = (chartId) => {
// //     const updatedCharts = charts.filter(chart => chart.id !== chartId);
// //     setCharts(updatedCharts);
// //     saveChartsToLocalStorage(updatedCharts); // Save the updated charts to localStorage
// //     // Optionally remove chart data from chartData
// //     const updatedChartData = { ...chartData };
// //     delete updatedChartData[chartId];
// //     setChartData(updatedChartData);
// //   };

// //   const openDialog = (chart) => {
// //     setTempChartData(chart);
// //     setDialogOpen(true);
// //   };

// //   const closeDialog = () => setDialogOpen(false);

// //   const saveConfiguration = () => {
// //     const updatedCharts = charts.map((chart) =>
// //       chart.id === tempChartData.id ? tempChartData : chart
// //     );
// //     setCharts(updatedCharts);
// //     saveChartsToLocalStorage(updatedCharts); // Save the updated configuration to localStorage
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

// //   const handleXAxisDataKeyChange = (event) => {
// //     const { value } = event.target;
// //     setTempChartData((prevChart) => ({
// //       ...prevChart,
// //       xAxisDataKey: value,
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

// //   const handleRangeChange = (yAxisId, event) => {
// //     const { value } = event.target;
// //     setTempChartData((prevChart) => ({
// //       ...prevChart,
// //       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
// //         yAxis.id === yAxisId ? { ...yAxis, range: value } : yAxis
// //       ),
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

// //   const renderLineChart = (chart) => (
// //     <ResponsiveContainer width="100%" height={400}>
// //       <LineChart data={chartData[chart.id]}>
// //         <CartesianGrid strokeDasharray="3 3" />
// //         <XAxis dataKey="timestamp" tickFormatter={(tick) => new Date(tick).toLocaleString()} />
// //         {chart.yAxisDataKeys.map((yAxis) => (
// //           <YAxis
// //             key={yAxis.id}
// //             yAxisId={yAxis.id}
// //             domain={getYAxisDomain(yAxis.range)}
// //             stroke={yAxis.color}
// //           />
// //         ))}
// //         <Tooltip />
// //         <Legend />
// //         {chart.yAxisDataKeys.map((yAxis) =>
// //           yAxis.dataKeys.map((key) => (
// //             <Line
// //               key={key}
// //               type="monotone"
// //               dataKey={key}
// //               stroke={yAxis.color}
// //               strokeDasharray={
// //                 yAxis.lineStyle === 'solid'
// //                   ? ''
// //                   : yAxis.lineStyle === 'dotted'
// //                   ? '1 1'
// //                   : yAxis.lineStyle === 'dashed'
// //                   ? '5 5'
// //                   : yAxis.lineStyle === 'dot-dash'
// //                   ? '3 3 1 3'
// //                   : '3 3 1 1 1 3'
// //               }
// //               yAxisId={yAxis.id}
// //             />
// //           ))
// //         )}
// //         <Brush height={30} dataKey="timestamp" stroke="#8884d8" />
// //       </LineChart>
// //     </ResponsiveContainer>
// //   );

// //   const renderXYChart = (chart) => {
// //     const xDomain = [0, 50];  // Modify the domain according to your needs
// //     const yDomain = [0, 50];

// //     return (
// //       <ResponsiveContainer width="100%" height={400}>
// //         <ScatterChart data={chartData[chart.id]}>
// //           <CartesianGrid strokeDasharray="3 3" />
// //           <XAxis
// //             dataKey={chart.xAxisDataKey}
// //             type="number"
// //             domain={xDomain}
// //             allowDataOverflow
// //           />
// //           {chart.yAxisDataKeys.map((yAxis) => (
// //             <YAxis
// //               key={yAxis.id}
// //               yAxisId={yAxis.id}
// //               type="number"
// //               domain={yDomain}
// //               allowDataOverflow
// //               stroke={yAxis.color}
// //             />
// //           ))}
// //           <Tooltip />
// //           <Legend />
// //           {chart.yAxisDataKeys.map((yAxis) =>
// //             yAxis.dataKeys.map((key) => (
// //               <Scatter
// //                 key={key}
// //                 dataKey={key}
// //                 fill={yAxis.color}
// //                 yAxisId={yAxis.id}
// //               />
// //             ))
// //           )}
// //         </ScatterChart>
// //       </ResponsiveContainer>
// //     );
// //   };

// //   const renderChart = (chart) => {
// //     switch (chart.type) {
// //       case "Line":
// //         return renderLineChart(chart);
// //       case "XY":
// //         return renderXYChart(chart);
// //       default:
// //         return null;
// //     }
// //   };

// //   const handleDateRangeApply = () => {
// //     setDateDialogOpen(false);
// //     if (mode === 'A') {
// //       setupRealTimeWebSocket(currentChartId);
// //     } else {
// //       fetchHistoricalData(currentChartId);
// //     }
// //   };

// //   return (
// //     <LocalizationProvider dateAdapter={AdapterDateFns}>
// //       <Container>
// //         <Box display="flex" justifyContent="flex-end" marginBottom={4}>
// //           <Button variant="contained" color="primary" onClick={() => setChartDialogOpen(true)}>
// //             Add Custom Chart
// //           </Button>
// //         </Box>

// //         {/* Render Custom Charts */}
// //         {charts.map((chart) => (
// //           <Box key={chart.id} marginY={4} position="relative">
// //             <IconButton
// //               aria-label="delete"
// //               onClick={() => deleteChart(chart.id)}
// //               style={{ position: "absolute", right: 0, top: 0, zIndex: 10 }}
// //             >
// //               <DeleteIcon />
// //             </IconButton>
// //             <Box border={1} padding={2}>
// //               {renderChart(chart)}
// //               <Box display="flex" justifyContent="flex-end" gap={2} marginTop={2}>
// //                 <Button variant="outlined" color="primary" onClick={() => openDialog(chart)}>
// //                   Configure Chart
// //                 </Button>
// //                 <Button
// //                   variant="outlined"
// //                   color="secondary"
// //                   onClick={() => {
// //                     setCurrentChartId(chart.id);
// //                     setDateDialogOpen(true);
// //                   }}
// //                 >
// //                   Select Date Range
// //                 </Button>
// //               </Box>
// //             </Box>
// //           </Box>
// //         ))}

// //         {/* Add Chart Dialog */}
// //         <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
// //           <DialogTitle>Select Chart Type</DialogTitle>
// //           <DialogContent>
// //             <Box display="flex" flexDirection="column" gap={2}>
// //               <Button variant="contained" onClick={() => addCustomChart('Line')}>Add Line Chart</Button>
// //               <Button variant="contained" onClick={() => addCustomChart('XY')}>Add XY Chart</Button>
// //             </Box>
// //           </DialogContent>
// //           <DialogActions>
// //             <Button onClick={() => setChartDialogOpen(false)} color="secondary">Cancel</Button>
// //           </DialogActions>
// //         </Dialog>

// //         {/* Date Range Selection Dialog */}
// //         <Dialog open={dateDialogOpen} onClose={() => setDateDialogOpen(false)} fullWidth maxWidth="sm">
// //           <DialogTitle>Select Date Range</DialogTitle>
// //           <DialogContent>
// //             <FormControl component="fieldset">
// //               <RadioGroup
// //                 row
// //                 value={mode}
// //                 onChange={(e) => setMode(e.target.value)}
// //               >
// //                 <FormControlLabel value="A" control={<Radio />} label="Real-Time Data Only" />
// //                 <FormControlLabel value="B" control={<Radio />} label="Select Date Range" />
// //                 <FormControlLabel value="C" control={<Radio />} label="Start Date & Continue Real-Time" />
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
// //                   disabled={mode === 'A' || mode === 'C'}
// //                 />
// //               </Grid>
// //             </Grid>
// //           </DialogContent>
// //           <DialogActions>
// //             <Button onClick={() => setDateDialogOpen(false)} color="secondary">Cancel</Button>
// //             <Button onClick={handleDateRangeApply} color="primary" disabled={!startDate || (mode === 'B' && !endDate)}>
// //               Apply
// //             </Button>
// //           </DialogActions>
// //         </Dialog>

// //         {/* Chart Configuration Dialog */}
// //         {tempChartData && (
// //           <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
// //             <DialogTitle>Configure Chart</DialogTitle>
// //             <DialogContent>
// //               <Box display="flex" flexDirection="column" maxHeight="400px" overflow="auto">
// //                 {tempChartData.type === 'XY' && (
// //                   <Box marginBottom={2}>
// //                     <Typography variant="h6">X-Axis</Typography>
// //                     <FormControl fullWidth margin="normal">
// //                       <InputLabel>X-Axis Data Key</InputLabel>
// //                       <Select
// //                         value={tempChartData.xAxisDataKey}
// //                         onChange={handleXAxisDataKeyChange}
// //                       >
// //                         <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
// //                         <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
// //                         <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
// //                         <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
// //                         <MenuItem value="CR-PT-001">CR-PT-001</MenuItem>
// //                       </Select>
// //                     </FormControl>
// //                   </Box>
// //                 )}
// //                 {tempChartData.yAxisDataKeys.map((yAxis, index) => (
// //                   <Box key={yAxis.id} display="flex" flexDirection="column" marginBottom={2}>
// //                     <Box display="flex" justifyContent="space-between" alignItems="center">
// //                       <Typography variant="h6">Y-Axis {index + 1}</Typography>
// //                       <IconButton onClick={() => deleteYAxis(yAxis.id)}>
// //                         <DeleteIcon />
// //                       </IconButton>
// //                     </Box>
// //                     <FormControl fullWidth margin="normal">
// //                       <InputLabel>Data Keys</InputLabel>
// //                       <Select
// //                         multiple
// //                         value={yAxis.dataKeys}
// //                         onChange={(event) => handleDataKeyChange(yAxis.id, event)}
// //                       >
// //                         <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
// //                         <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
// //                         <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
// //                         <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
// //                         <MenuItem value="CR-PT-001">CR-PT-001</MenuItem>
// //                       </Select>
// //                     </FormControl>
// //                     <FormControl fullWidth margin="normal">
// //                       <InputLabel>Range</InputLabel>
// //                       <Select
// //                         value={yAxis.range}
// //                         onChange={(event) => handleRangeChange(yAxis.id, event)}
// //                       >
// //                         <MenuItem value="0-500">0-500</MenuItem>
// //                         <MenuItem value="0-100">0-100</MenuItem>
// //                         <MenuItem value="0-10">0-10</MenuItem>
// //                       </Select>
// //                     </FormControl>
// //                     <FormControl fullWidth margin="normal">
// //                       <InputLabel>Line Style</InputLabel>
// //                       <Select
// //                         value={yAxis.lineStyle}
// //                         onChange={(event) => handleLineStyleChange(yAxis.id, event)}
// //                       >
// //                         {lineStyles.map((style) => (
// //                           <MenuItem key={style.value} value={style.value}>
// //                             {style.label}
// //                           </MenuItem>
// //                         ))}
// //                       </Select>
// //                     </FormControl>
// //                     <Button onClick={() => openColorPicker(yAxis.id)}>Select Color</Button>
// //                     {colorPickerOpen && selectedYAxisId === yAxis.id && (
// //                       <SketchPicker color={yAxis.color} onChangeComplete={handleColorChange} />
// //                     )}
// //                   </Box>
// //                 ))}
// //                 <Button variant="contained" color="secondary" onClick={() => setTempChartData((prevChart) => ({
// //                   ...prevChart,
// //                   yAxisDataKeys: [
// //                     ...prevChart.yAxisDataKeys,
// //                     { id: `left-${prevChart.yAxisDataKeys.length}`, dataKeys: [], range: '0-500', color: '#FF0000', lineStyle: 'solid' },
// //                   ],
// //                 }))}>
// //                   Add Y-Axis
// //                 </Button>
// //               </Box>
// //             </DialogContent>
// //             <DialogActions>
// //               <Button onClick={closeDialog} color="secondary">Cancel</Button>
// //               <Button onClick={saveConfiguration} color="primary">Save</Button>
// //             </DialogActions>
// //           </Dialog>
// //         )}
// //       </Container>
// //     </LocalizationProvider>
// //   );
// // };

// // export default HistoricalCharts;

// // import React, { useState, useEffect, useRef } from "react";
// // import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, Brush } from "recharts";
// // import {
// //   Container, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
// //   FormControl, InputLabel, Select, MenuItem, Typography, IconButton, Grid, TextField,
// //   FormControlLabel,
// //   Radio,
// //   RadioGroup
// // } from "@mui/material";
// // import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// // import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// // import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// // import { SketchPicker } from 'react-color';
// // import DeleteIcon from '@mui/icons-material/Delete';
// // import { w3cwebsocket as W3CWebSocket } from "websocket";
// // import axios from 'axios';
// // import { format, parseISO } from 'date-fns';

// // const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// // const lineStyles = [
// //   { value: 'solid', label: 'Solid' },
// //   { value: 'dotted', label: 'Dotted' },
// //   { value: 'dashed', label: 'Dashed' },
// //   { value: 'dot-dash', label: 'Dot Dash' },
// //   { value: 'dash-dot-dot', label: 'Dash Dot Dot' },
// // ];

// // const HistoricalCharts = () => {
// //   const [charts, setCharts] = useState([]); // Stores custom chart configurations
// //   const [chartData, setChartData] = useState({}); // Stores data for each chart independently
// //   const [tempChartData, setTempChartData] = useState(null);
// //   const [chartDialogOpen, setChartDialogOpen] = useState(false);
// //   const [dialogOpen, setDialogOpen] = useState(false);
// //   const [colorPickerOpen, setColorPickerOpen] = useState(false);
// //   const [selectedYAxisId, setSelectedYAxisId] = useState(null);
// //   const [dateDialogOpen, setDateDialogOpen] = useState(false);
// //   const [startDate, setStartDate] = useState(null);
// //   const [endDate, setEndDate] = useState(null);
// //   const [mode, setMode] = useState('A'); // A for real-time, B for historical range, C for real-time + historical
// //   const [currentChartId, setCurrentChartId] = useState(null); // The ID of the chart currently configuring date range
// //   const wsClientRefs = useRef({}); // Use a map of refs for WebSocket clients

// //   // Load saved charts from localStorage on component mount
// //   useEffect(() => {
// //     const savedCharts = localStorage.getItem('customCharts');
// //     if (savedCharts) {
// //       setCharts(JSON.parse(savedCharts));
// //     }
// //   }, []);

// //   // Save chart configurations (without data points) to localStorage whenever charts are updated
// //   const saveChartsToLocalStorage = (updatedCharts) => {
// //     const chartConfigurations = updatedCharts.map(chart => ({
// //       id: chart.id,
// //       type: chart.type,
// //       xAxisDataKey: chart.xAxisDataKey,
// //       yAxisDataKeys: chart.yAxisDataKeys,
// //     }));
// //     localStorage.setItem('customCharts', JSON.stringify(chartConfigurations));
// //   };

// //   const fetchHistoricalData = async (chartId) => {
// //     if (!startDate) return;

// //     try {
// //       const formattedStartDate = format(startDate, 'yyyy-MM-dd');
// //       const formattedStartTime = format(startDate, 'HH:mm');

// //       const requestData = {
// //         start_date: formattedStartDate,
// //         start_time: formattedStartTime,
// //       };

// //       if (mode === 'B' && endDate) {
// //         requestData.end_date = format(endDate, 'yyyy-MM-dd');
// //         requestData.end_time = format(endDate, 'HH:mm');
// //       }

// //       const response = await axios.post(
// //         'https://7ko9a0hlo2.execute-api.us-east-1.amazonaws.com/dev/data',
// //         requestData
// //       );

// //       const historicalData = response.data.data.map(item => ({
// //         timestamp: parseISO(item.payload['PLC-TIME-STAMP']),
// //         'AX-LT-011': item.payload['AX-LT-011'],
// //         'AX-LT-021': item.payload['AX-LT-021'],
// //         'CW-TT-011': item.payload['CW-TT-011'],
// //         'CW-TT-021': item.payload['CW-TT-021'],
// //       }));

// //       setChartData(prevData => ({
// //         ...prevData,
// //         [chartId]: historicalData,
// //       }));

// //       if (mode === 'C') {
// //         setupRealTimeWebSocket(chartId);
// //       }
// //     } catch (error) {
// //       console.error('Error fetching historical data:', error);
// //     }
// //   };

// //   const setupRealTimeWebSocket = (chartId) => {
// //     if (wsClientRefs.current[chartId]) {
// //       wsClientRefs.current[chartId].close();
// //     }

// //     wsClientRefs.current[chartId] = new W3CWebSocket("wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/");

// //     wsClientRefs.current[chartId].onopen = () => {
// //       console.log(`WebSocket connection established for chart ${chartId}`);
// //     };

// //     wsClientRefs.current[chartId].onmessage = (message) => {
// //       try {
// //         const receivedData = JSON.parse(message.data);
// //         const newData = {
// //           timestamp: parseISO(receivedData['PLC-TIME-STAMP']) || new Date(),
// //           'AX-LT-011': receivedData['AX-LT-011'] || null,
// //           'AX-LT-021': receivedData['AX-LT-021'] || null,
// //           'CW-TT-011': receivedData['CW-TT-011'] || null,
// //           'CW-TT-021': receivedData['CW-TT-021'] || null,
// //         };

// //         // Append new data to existing chart data to ensure continuity
// //         setChartData((prevData) => ({
// //           ...prevData,
// //           [chartId]: [...(prevData[chartId] || []), newData],  // Accumulate data
// //         }));
// //       } catch (error) {
// //         console.error("Error processing WebSocket message:", error);
// //       }
// //     };

// //     wsClientRefs.current[chartId].onclose = (event) => {
// //       console.error(`WebSocket disconnected for chart ${chartId} (code: ${event.code}, reason: ${event.reason}). Reconnecting...`);
// //       setTimeout(() => setupRealTimeWebSocket(chartId), 1000);
// //     };
// //   };

// //   const addCustomChart = (type) => {
// //     const newChartId = Date.now();
// //     const newChart = {
// //       id: newChartId,
// //       type,
// //       data: [],
// //       xAxisDataKey: '',
// //       yAxisDataKeys: [{ id: 'left-0', dataKeys: ['AX-LT-011'], range: '0-500', color: "#FF0000", lineStyle: 'solid' }],
// //     };
// //     const updatedCharts = [...charts, newChart];
// //     setCharts(updatedCharts);
// //     saveChartsToLocalStorage(updatedCharts); // Save the updated charts to localStorage
// //     setChartDialogOpen(false);
// //   };

// //   const deleteChart = (chartId) => {
// //     const updatedCharts = charts.filter(chart => chart.id !== chartId);
// //     setCharts(updatedCharts);
// //     saveChartsToLocalStorage(updatedCharts); // Save the updated charts to localStorage
// //     // Optionally remove chart data from chartData
// //     const updatedChartData = { ...chartData };
// //     delete updatedChartData[chartId];
// //     setChartData(updatedChartData);
// //   };

// //   const openDialog = (chart) => {
// //     setTempChartData(chart);
// //     setDialogOpen(true);
// //   };

// //   const closeDialog = () => setDialogOpen(false);

// //   const saveConfiguration = () => {
// //     const updatedCharts = charts.map((chart) =>
// //       chart.id === tempChartData.id ? tempChartData : chart
// //     );
// //     setCharts(updatedCharts);
// //     saveChartsToLocalStorage(updatedCharts); // Save the updated configuration to localStorage
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

// //   const handleXAxisDataKeyChange = (event) => {
// //     const { value } = event.target;
// //     setTempChartData((prevChart) => ({
// //       ...prevChart,
// //       xAxisDataKey: value,
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

// //   const handleRangeChange = (yAxisId, event) => {
// //     const { value } = event.target;
// //     setTempChartData((prevChart) => ({
// //       ...prevChart,
// //       yAxisDataKeys: prevChart.yAxisDataKeys.map((yAxis) =>
// //         yAxis.id === yAxisId ? { ...yAxis, range: value } : yAxis
// //       ),
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

// //   const renderLineChart = (chart) => (
// //     <ResponsiveContainer width="100%" height={400}>
// //       <LineChart data={chartData[chart.id]}>
// //         <CartesianGrid strokeDasharray="3 3" />
// //         <XAxis dataKey="timestamp" tickFormatter={(tick) => new Date(tick).toLocaleString()} />
// //         {chart.yAxisDataKeys.map((yAxis) => (
// //           <YAxis
// //             key={yAxis.id}
// //             yAxisId={yAxis.id}
// //             domain={getYAxisDomain(yAxis.range)}
// //             stroke={yAxis.color}
// //           />
// //         ))}
// //         <Tooltip />
// //         <Legend />
// //         {chart.yAxisDataKeys.map((yAxis) =>
// //           yAxis.dataKeys.map((key) => (
// //             <Line
// //               key={key}
// //               type="monotone"
// //               dataKey={key}
// //               stroke={yAxis.color}
// //               strokeDasharray={
// //                 yAxis.lineStyle === 'solid'
// //                   ? ''
// //                   : yAxis.lineStyle === 'dotted'
// //                   ? '1 1'
// //                   : yAxis.lineStyle === 'dashed'
// //                   ? '5 5'
// //                   : yAxis.lineStyle === 'dot-dash'
// //                   ? '3 3 1 3'
// //                   : '3 3 1 1 1 3'
// //               }
// //               yAxisId={yAxis.id}
// //             />
// //           ))
// //         )}
// //         <Brush height={30} dataKey="timestamp" stroke="#8884d8" />
// //       </LineChart>
// //     </ResponsiveContainer>
// //   );

// //   const renderXYChart = (chart) => {
// //     const xDomain = [0, 50];
// //     const yDomain = [0, 50];

// //     return (
// //       <ResponsiveContainer width="100%" height={400}>
// //         <ScatterChart data={chartData[chart.id]}>
// //           <CartesianGrid strokeDasharray="3 3" />

// //           <XAxis
// //             dataKey={chart.xAxisDataKey}
// //             type="number"
// //             domain={xDomain}
// //             allowDataOverflow
// //           />

// //           {chart.yAxisDataKeys.map((yAxis) => (
// //             <YAxis
// //               key={yAxis.id}
// //               yAxisId={yAxis.id}
// //               type="number"
// //               domain={yDomain}
// //               allowDataOverflow
// //               stroke={yAxis.color}
// //             />
// //           ))}

// //           <Tooltip />
// //           <Legend />

// //           {chart.yAxisDataKeys.map((yAxis) =>
// //             yAxis.dataKeys.map((key) => (
// //               <Scatter
// //                 key={key}
// //                 dataKey={key}
// //                 fill={yAxis.color}
// //                 yAxisId={yAxis.id}
// //               />
// //             ))
// //           )}
// //         </ScatterChart>
// //       </ResponsiveContainer>
// //     );
// //   };

// //   const renderChart = (chart) => {
// //     switch (chart.type) {
// //       case "Line":
// //         return renderLineChart(chart);
// //       case "XY":
// //         return renderXYChart(chart);
// //       default:
// //         return null;
// //     }
// //   };

// //   const handleDateRangeApply = () => {
// //     setDateDialogOpen(false);
// //     if (mode === 'A') {
// //       setupRealTimeWebSocket(currentChartId);
// //     } else {
// //       fetchHistoricalData(currentChartId);
// //     }
// //   };

// //   return (
// //     <LocalizationProvider dateAdapter={AdapterDateFns}>
// //       <Container>
// //         <Box display="flex" justifyContent="flex-end" marginBottom={4}>
// //           <Button variant="contained" color="primary" onClick={() => setChartDialogOpen(true)}>
// //             Add Custom Chart
// //           </Button>
// //         </Box>

// //         {/* Render Custom Charts */}
// //         {charts.map((chart) => (
// //           <Box key={chart.id} marginY={4} position="relative">
// //             <IconButton
// //               aria-label="delete"
// //               onClick={() => deleteChart(chart.id)}
// //               style={{ position: "absolute", right: 0, top: 0, zIndex: 10 }}
// //             >
// //               <DeleteIcon />
// //             </IconButton>
// //             <Box border={1} padding={2}>
// //               {renderChart(chart)}
// //               <Box display="flex" justifyContent="flex-end" gap={2} marginTop={2}>
// //                 <Button variant="outlined" color="primary" onClick={() => openDialog(chart)}>
// //                   Configure Chart
// //                 </Button>
// //                 <Button
// //                   variant="outlined"
// //                   color="secondary"
// //                   onClick={() => {
// //                     setCurrentChartId(chart.id);
// //                     setDateDialogOpen(true);
// //                   }}
// //                 >
// //                   Select Date Range
// //                 </Button>
// //               </Box>
// //             </Box>
// //           </Box>
// //         ))}

// //         {/* Add Chart Dialog */}
// //         <Dialog open={chartDialogOpen} onClose={() => setChartDialogOpen(false)}>
// //           <DialogTitle>Select Chart Type</DialogTitle>
// //           <DialogContent>
// //             <Box display="flex" flexDirection="column" gap={2}>
// //               <Button variant="contained" onClick={() => addCustomChart('Line')}>Add Line Chart</Button>
// //               <Button variant="contained" onClick={() => addCustomChart('XY')}>Add XY Chart</Button>
// //             </Box>
// //           </DialogContent>
// //           <DialogActions>
// //             <Button onClick={() => setChartDialogOpen(false)} color="secondary">Cancel</Button>
// //           </DialogActions>
// //         </Dialog>

// //         {/* Date Range Selection Dialog */}
// //         <Dialog open={dateDialogOpen} onClose={() => setDateDialogOpen(false)} fullWidth maxWidth="sm">
// //           <DialogTitle>Select Date Range</DialogTitle>
// //           <DialogContent>
// //             <FormControl component="fieldset">
// //               <RadioGroup
// //                 row
// //                 value={mode}
// //                 onChange={(e) => setMode(e.target.value)}
// //               >
// //                 <FormControlLabel value="A" control={<Radio />} label="Real-Time Data Only" />
// //                 <FormControlLabel value="B" control={<Radio />} label="Select Date Range" />
// //                 <FormControlLabel value="C" control={<Radio />} label="Start Date & Continue Real-Time" />
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
// //                   disabled={mode === 'A' || mode === 'C'}
// //                 />
// //               </Grid>
// //             </Grid>
// //           </DialogContent>
// //           <DialogActions>
// //             <Button onClick={() => setDateDialogOpen(false)} color="secondary">Cancel</Button>
// //             <Button onClick={handleDateRangeApply} color="primary" disabled={!startDate || (mode === 'B' && !endDate)}>
// //               Apply
// //             </Button>
// //           </DialogActions>
// //         </Dialog>

// //         {/* Chart Configuration Dialog */}
// //         {tempChartData && (
// //           <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
// //             <DialogTitle>Configure Chart</DialogTitle>
// //             <DialogContent>
// //               <Box display="flex" flexDirection="column" maxHeight="400px" overflow="auto">
// //                 {tempChartData.type === 'XY' && (
// //                   <Box marginBottom={2}>
// //                     <Typography variant="h6">X-Axis</Typography>
// //                     <FormControl fullWidth margin="normal">
// //                       <InputLabel>X-Axis Data Key</InputLabel>
// //                       <Select
// //                         value={tempChartData.xAxisDataKey}
// //                         onChange={handleXAxisDataKeyChange}
// //                       >
// //                         <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
// //                         <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
// //                         <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
// //                         <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
// //                         <MenuItem value="CR-PT-001">CR-PT-001</MenuItem>
// //                       </Select>
// //                     </FormControl>
// //                   </Box>
// //                 )}
// //                 {tempChartData.yAxisDataKeys.map((yAxis, index) => (
// //                   <Box key={yAxis.id} display="flex" flexDirection="column" marginBottom={2}>
// //                     <Box display="flex" justifyContent="space-between" alignItems="center">
// //                       <Typography variant="h6">Y-Axis {index + 1}</Typography>
// //                       <IconButton onClick={() => deleteYAxis(yAxis.id)}>
// //                         <DeleteIcon />
// //                       </IconButton>
// //                     </Box>
// //                     <FormControl fullWidth margin="normal">
// //                       <InputLabel>Data Keys</InputLabel>
// //                       <Select
// //                         multiple
// //                         value={yAxis.dataKeys}
// //                         onChange={(event) => handleDataKeyChange(yAxis.id, event)}
// //                       >
// //                         <MenuItem value="AX-LT-011">AX-LT-011</MenuItem>
// //                         <MenuItem value="AX-LT-021">AX-LT-021</MenuItem>
// //                         <MenuItem value="CW-TT-011">CW-TT-011</MenuItem>
// //                         <MenuItem value="CW-TT-021">CW-TT-021</MenuItem>
// //                         <MenuItem value="CR-PT-001">CR-PT-001</MenuItem>
// //                       </Select>
// //                     </FormControl>
// //                     <FormControl fullWidth margin="normal">
// //                       <InputLabel>Range</InputLabel>
// //                       <Select
// //                         value={yAxis.range}
// //                         onChange={(event) => handleRangeChange(yAxis.id, event)}
// //                       >
// //                         <MenuItem value="0-500">0-500</MenuItem>
// //                         <MenuItem value="0-100">0-100</MenuItem>
// //                         <MenuItem value="0-10">0-10</MenuItem>
// //                       </Select>
// //                     </FormControl>
// //                     <FormControl fullWidth margin="normal">
// //                       <InputLabel>Line Style</InputLabel>
// //                       <Select
// //                         value={yAxis.lineStyle}
// //                         onChange={(event) => handleLineStyleChange(yAxis.id, event)}
// //                       >
// //                         {lineStyles.map((style) => (
// //                           <MenuItem key={style.value} value={style.value}>
// //                             {style.label}
// //                           </MenuItem>
// //                         ))}
// //                       </Select>
// //                     </FormControl>
// //                     <Button onClick={() => openColorPicker(yAxis.id)}>Select Color</Button>
// //                     {colorPickerOpen && selectedYAxisId === yAxis.id && (
// //                       <SketchPicker color={yAxis.color} onChangeComplete={handleColorChange} />
// //                     )}
// //                   </Box>
// //                 ))}
// //                 <Button variant="contained" color="secondary" onClick={() => setTempChartData((prevChart) => ({
// //                   ...prevChart,
// //                   yAxisDataKeys: [
// //                     ...prevChart.yAxisDataKeys,
// //                     { id: `left-${prevChart.yAxisDataKeys.length}`, dataKeys: [], range: '0-500', color: '#FF0000', lineStyle: 'solid' },
// //                   ],
// //                 }))}>
// //                   Add Y-Axis
// //                 </Button>
// //               </Box>
// //             </DialogContent>
// //             <DialogActions>
// //               <Button onClick={closeDialog} color="secondary">Cancel</Button>
// //               <Button onClick={saveConfiguration} color="primary">Save</Button>
// //             </DialogActions>
// //           </Dialog>
// //         )}
// //       </Container>
// //     </LocalizationProvider>
// //   );
// // };

// // export default HistoricalCharts;
