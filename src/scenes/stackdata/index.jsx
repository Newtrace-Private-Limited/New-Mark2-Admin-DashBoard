

import React, { useState } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import axios from 'axios';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Box, Button, Grid, TextField, useTheme } from '@mui/material';
import Header from 'src/component/Header';
import { tokens } from "../../theme";
import { format } from 'date-fns';


const DataTable = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [pageSize, setPageSize] = useState(100);
  const [error, setError] = useState('');

  const fetchData = async (start, end, page, pageSize) => {
    setLoading(true);
    setError('');
    try {
      // Format the start and end date to 'yyyy-MM-dd HH:mm' format
      const formattedStartTime = format(start, 'yyyy-MM-dd HH:mm');
      const formattedEndTime = format(end, 'yyyy-MM-dd HH:mm');

      // Ensure both start and end date are selected
      if (!start || !end) {
        throw new Error('Start Date and End Date are required.');
      }

      const response = await axios.post(
        'https://3di0yc14j3.execute-api.us-east-1.amazonaws.com/dev/iot-data',
        {
          start_time: formattedStartTime,
          end_time: formattedEndTime,
          page,
          page_size: pageSize,
        },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (response.status === 200) {
        const result = response.data;
        const processedData = (result.data || []).map((row, index) => ({
          id: index + (page - 1) * pageSize, // Ensure unique ID for pagination
          timestamp: row.timestamp || row.time_bucket,
                    ist_timestamp: row.ist_timestamp || row.time_bucket,
                    Test_Name: row.device_data?.["Test-Name"] || row["test_name"],
                    AX_LT_011: row.device_data?.["AX-LT-011"] !== undefined && row.device_data?.["AX-LT-011"] !== null
                    ? row.device_data?.["AX-LT-011"]
                    : row["avg_ax_lt_011"] || 0,

                    AX_LT_021: row.device_data?.["AX-LT-021"] || row["avg_ax_lt_021"],
                    AX_VA_311: row.device_data?.["AX-VA-311"] !== undefined && row.device_data?.["AX-VA-311"] !== null
  ? row.device_data?.["AX-VA-311"]
  : row["ax_va_311"] || 0,
  AX_VA_312: row.device_data?.["AX-VA-312"] !== undefined && row.device_data?.["AX-VA-312"] !== null
  ? row.device_data?.["AX-VA-312"]
  : row["ax_va_312"] || 0,
CR_FT_001: row.device_data?.["CR-FT-001"] || row["cr_ft_001"],
CR_LT_011: row.device_data?.["CR-LT-011"] || row["cr_lt_011"],
CR_LT_021: row.device_data?.["CR-LT-021"] || row["cr_lt_021"],
CR_PT_001: row.device_data?.["CR-PT-001"] || row["cr_pt_001"],
CR_PT_011: row.device_data?.["CR-PT-011"] || row["cr_pt_011"],
CR_PT_021: row.device_data?.["CR-PT-021"] || row["cr_pt_021"],
CR_TT_001: row.device_data?.["CR-TT-001"] || row["cr_tt_001"],
CR_TT_002: row.device_data?.["CR-TT-002"] || row["cr_tt_002"],
CW_TT_011: row.device_data?.["CW-TT-011"] || row["cw_tt_011"],
CW_TT_021: row.device_data?.["CW-TT-021"] || row["cw_tt_021"],
GS_AT_011: row.device_data?.["GS-AT-011"] || row["gs_at_011"],
GS_AT_012: row.device_data?.["GS-AT-012"] || row["gs_at_012"],
GS_AT_022: row.device_data?.["GS-AT-022"] || row["gs_at_022"],
GS_PT_011: row.device_data?.["GS-PT-011"] || row["gs_pt_011"],
GS_PT_021: row.device_data?.["GS-PT-021"] || row["gs_pt_021"],
GS_TT_011: row.device_data?.["GS-TT-011"] || row["gs_tt_011"],
GS_TT_021: row.device_data?.["GS-TT-021"] || row["gs_tt_021"],
GS_VA_311: row.device_data?.["GS-VA-311"] || row["gs_va_311"],
GS_VA_312: row.device_data?.["GS-VA-312"] || row["gs_va_312"],
GS_VA_321: row.device_data?.["GS-VA-321"] || row["gs_va_321"],
GS_VA_322: row.device_data?.["GS-VA-322"] || row["gs_va_322"],
PR_AT_001: row.device_data?.["PR-AT-001"] || row["pr_at_001"],
PR_AT_003: row.device_data?.["PR-AT-003"] || row["pr_at_003"],
PR_AT_005: row.device_data?.["PR-AT-005"] || row["pr_at_005"],
PR_FT_001: row.device_data?.["PR-FT-001"] || row["pr_ft_001"],
PR_TT_001: row.device_data?.["PR-TT-001"] || row["pr_tt_001"],
PR_TT_061: row.device_data?.["PR-TT-061"] || row["pr_tt_061"],
PR_TT_072: row.device_data?.["PR-TT-072"] || row["pr_tt_072"],
PR_VA_352: row.device_data?.["PR-VA-352"] || row["pr_va_352"],
AX_VA_321: row.device_data?.["AX-VA-321"] !== undefined && row.device_data?.["AX-VA-321"] !== null
? row.device_data?.["AX-VA-321"]
: row["ax_va_321"] || 0,
AX_VA_322: row.device_data?.["AX-VA-322"] !== undefined && row.device_data?.["AX-VA-322"] !== null
? row.device_data?.["AX-VA-322"]
: row["ax_va_322"] || 0,
AX_VA_351: row.device_data?.["AX-VA-351"] !== undefined && row.device_data?.["AX-VA-351"] !== null
? row.device_data?.["AX-VA-351"]
: row["ax_va_351"] || 0,
AX_VA_391: row.device_data?.["AX-VA-391"] !== undefined && row.device_data?.["AX-VA-391"] !== null
? row.device_data?.["AX-VA-391"]
: row["ax_va_391"] || 0,
DM_VA_301: row.device_data?.["DM-VA-301"] !== undefined && row.device_data?.["DM-VA-301"] !== null
? row.device_data?.["DM-VA-301"]
: row["dm_va_301"] || 0,
GS_VA_021: row.device_data?.["GS-VA-021"] !== undefined && row.device_data?.["GS-VA-021"] !== null
? row.device_data?.["GS-VA-021"]
: row["gs_va_021"] || 0,
GS_VA_022: row.device_data?.["GS-VA-022"] !== undefined && row.device_data?.["GS-VA-022"] !== null
? row.device_data?.["GS-VA-022"]
: row["gs_va_022"] || 0,
N2_VA_311: row.device_data?.["N2-VA-311"] !== undefined && row.device_data?.["N2-VA-311"] !== null
? row.device_data?.["N2-VA-311"]
: row["n2_va_311"] || 0,
N2_VA_321: row.device_data?.["N2-VA-321"] !== undefined && row.device_data?.["N2-VA-321"] !== null
? row.device_data?.["N2-VA-321"]
: row["n2_va_321"] || 0,
PR_VA_301: row.device_data?.["PR-VA-301"] !== undefined && row.device_data?.["PR-VA-301"] !== null
? row.device_data?.["PR-VA-301"]
: row["pr_va_301"] || 0,
PR_VA_312: row.device_data?.["PR-VA-312"] !== undefined && row.device_data?.["PR-VA-312"] !== null
? row.device_data?.["PR-VA-312"]
: row["pr_va_312"] || 0,
PR_VA_351: row.device_data?.["PR-VA-351"] !== undefined && row.device_data?.["PR-VA-351"] !== null
? row.device_data?.["PR-VA-351"]
: row["pr_va_351"] || 0,
PR_VA_361Ain: row.device_data?.["PR-VA-361Ain"] !== undefined && row.device_data?.["PR-VA-361Ain"] !== null
? row.device_data?.["PR-VA-361Ain"]
: row["pr_va_361ain"] || 0,
PR_VA_361Bin: row.device_data?.["PR-VA-361Bin"] !== undefined && row.device_data?.["PR-VA-361Bin"] !== null
? row.device_data?.["PR-VA-361Bin"]
: row["pr_va_361bin"] || 0,
PR_VA_362Ain: row.device_data?.["PR-VA-362Ain"] !== undefined && row.device_data?.["PR-VA-362Ain"] !== null
? row.device_data?.["PR-VA-362Ain"]
: row["pr_va_362ain"] || 0,
PR_VA_362Bin: row.device_data?.["PR-VA-362Bin"] !== undefined && row.device_data?.["PR-VA-362Bin"] !== null
? row.device_data?.["PR-VA-362Bin"]
: row["pr_va_362bin"] || 0,
PR_VA_361Aout: row.device_data?.["PR-VA-361Aout"] !== undefined && row.device_data?.["PR-VA-361Aout"] !== null
? row.device_data?.["PR-VA-361Aout"]
: row["pr_va_361aout"] || 0,
PR_VA_361Bout: row.device_data?.["PR-VA-361Bout"] !== undefined && row.device_data?.["PR-VA-361Bout"] !== null
? row.device_data?.["PR-VA-361Bout"]
: row["pr_va_361bout"] || 0,
PR_VA_362Aout: row.device_data?.["PR-VA-362Aout"] !== undefined && row.device_data?.["PR-VA-362Aout"] !== null
? row.device_data?.["PR-VA-362Aout"]
: row["pr_va_362aout"] || 0,
PR_VA_362Bout: row.device_data?.["PR-VA-362Bout"] !== undefined && row.device_data?.["PR-VA-362Bout"] !== null
? row.device_data?.["PR-VA-362Bout"]
: row["pr_va_362bout"] || 0,
RECT_CT_001: row.device_data?.["RECT-CT-001"] !== undefined && row.device_data?.["RECT-CT-001"] !== null
? row.device_data?.["RECT-CT-001"]
: row["rect_ct_001"] || 0,
RECT_VT_001: row.device_data?.["RECT-VT-001"] !== undefined && row.device_data?.["RECT-VT-001"] !== null
? row.device_data?.["RECT-VT-001"]
: row["rect_vt_001"] || 0,
DCDB0_CT_001: row.device_data?.["DCDB0-CT-001"] !== undefined && row.device_data?.["DCDB0-CT-001"] !== null
? row.device_data?.["DCDB0-CT-001"]
: row["dcdb0_ct_001"] || 0,
DCDB0_VT_001: row.device_data?.["DCDB0-VT-001"] !== undefined && row.device_data?.["DCDB0-VT-001"] !== null
? row.device_data?.["DCDB0-VT-001"]
: row["dcdb0_vt_001"] || 0,
DCDB1_CT_001: row.device_data?.["DCDB1-CT-001"] !== undefined && row.device_data?.["DCDB1-CT-001"] !== null
? row.device_data?.["DCDB1-CT-001"]
: row["dcdb1_ct_001"] || 0,
DCDB1_VT_001: row.device_data?.["DCDB1-VT-001"] !== undefined && row.device_data?.["DCDB1-VT-001"] !== null
? row.device_data?.["DCDB1-VT-001"]
: row["dcdb1_vt_001"] || 0,
DCDB2_CT_001: row.device_data?.["DCDB2-CT-001"] !== undefined && row.device_data?.["DCDB2-CT-001"] !== null
? row.device_data?.["DCDB2-CT-001"]
: row["dcdb2_ct_001"] || 0,
DCDB2_VT_001: row.device_data?.["DCDB2-VT-001"] !== undefined && row.device_data?.["DCDB2-VT-001"] !== null
? row.device_data?.["DCDB2-VT-001"]
: row["dcdb2_vt_001"] || 0,
DCDB3_CT_001: row.device_data?.["DCDB3-CT-001"] !== undefined && row.device_data?.["DCDB3-CT-001"] !== null
? row.device_data?.["DCDB3-CT-001"]
: row["dcdb3_ct_001"] || 0,
DCDB3_VT_001: row.device_data?.["DCDB3-VT-001"] !== undefined && row.device_data?.["DCDB3-VT-001"] !== null
? row.device_data?.["DCDB3-VT-001"]
: row["dcdb3_vt_001"] || 0,
DCDB4_CT_001: row.device_data?.["DCDB4-CT-001"] !== undefined && row.device_data?.["DCDB4-CT-001"] !== null
? row.device_data?.["DCDB4-CT-001"]
: row["dcdb4_ct_001"] || 0,
DCDB4_VT_001: row.device_data?.["DCDB4-VT-001"] !== undefined && row.device_data?.["DCDB4-VT-001"] !== null
? row.device_data?.["DCDB4-VT-001"]
: row["dcdb4_vt_001"] || 0,
PLC_TIME_STAMP: row.device_data?.["PLC-TIME-STAMP"] !== undefined && row.device_data?.["PLC-TIME-STAMP"] !== null
? row.device_data?.["PLC-TIME-STAMP"]
: row["plc_time_stamp"] || 0,
Test_Description: row.device_data?.["Test-description"] !== undefined && row.device_data?.["Test-description"] !== null
? row.device_data?.["Test-description"]
: row["test_description"] || 0,
Test_Remarks: row.device_data?.["Test-Remarks"] !== undefined && row.device_data?.["Test-Remarks"] !== null
? row.device_data?.["Test-Remarks"]
: row["test_remarks"] || 0,
DM_LSH_001: row.device_data?.["DM-LSH-001"] !== undefined && row.device_data?.["DM-LSH-001"] !== null
  ? row.device_data?.["DM-LSH-001"]
  : row["dm_lsh_001"] !== undefined && row["dm_lsh_001"] !== null
  ? row["dm_lsh_001"]
  : false,

DM_LSL_001: row.device_data?.["DM-LSL-001"] !== undefined && row.device_data?.["DM-LSL-001"] !== null
? row.device_data?.["DM-LSL-001"]
: row["dm_lsl_001"] || 0,
GS_LSL_011: row.device_data?.["GS-LSL-011"] !== undefined && row.device_data?.["GS-LSL-011"] !== null
? row.device_data?.["GS-LSL-011"]
: row["gs_lsl_011"] || 0,
GS_LSL_021: row.device_data?.["GS-LSL-021"] !== undefined && row.device_data?.["GS-LSL-021"] !== null
? row.device_data?.["GS-LSL-021"]
: row["gs_lsl_021"] || 0,
        }));
        setRows(processedData);
      } else { 
        throw new Error('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setRows([]);
      setError(error.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchData = () => {
    if (startDate && endDate) {
      fetchData(startDate, endDate, 1, pageSize); // Pass selected dates and pagination params
    }
  };

  const columns = [  
    { field: 'ist_timestamp', headerName: 'IST Timestamp' ,width: 200},
    // { field: 'timestamp', headerName: 'Timestamp' ,width: 170},
    { field: 'Test_Name', headerName: 'Test Name', width: 170, },
    {
      field: "AX_LT_011", headerName: "AX-LT-011", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "AX_LT_021", headerName: "AX-LT-021", width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(4) },
    
    {
      field: "CW_TT_011", headerName: "CW-TT-011", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "CW_TT_021", headerName: "CW-TT-021", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "CR_LT_011", headerName: "CR-LT-011", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "CR_PT_011", headerName: "CR-PT-011", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "CR_LT_021", headerName: "CR-LT-021", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "CR_PT_021", headerName: "CR-PT-021", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "CR_PT_001", headerName: "CR-PT-001", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "CR_TT_001", headerName: "CR-TT-001", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "CR_FT_001", headerName: "CR-FT-001", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "CR_TT_002", headerName: "CR-TT-002", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "GS_AT_011", headerName: "GS-AT-011", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "GS_AT_012", headerName: "GS-AT-012", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "GS_PT_011", headerName: "GS-PT-011", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "GS_TT_011", headerName: "GS-TT-011", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "GS_AT_022", headerName: "GS-AT-022", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "GS_PT_021", headerName: "GS-PT-021", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "GS_TT_021", headerName: "GS-TT-021", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "PR_TT_001", headerName: "PR-TT-001", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "PR_TT_061", headerName: "PR-TT-061", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "PR_TT_072", headerName: "PR-TT-072", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "PR_FT_001", headerName: "PR-FT-001", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "PR_AT_001", headerName: "PR-AT-001", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "PR_AT_003", headerName: "PR-AT-003", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "PR_AT_005", headerName: "PR-AT-005", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "DM_LSH_001", headerName: "DM-LSH-001", width: 70, valueFormatter: (params) => String(params.value) },
    {
      field: "DM_LSL_001", headerName: "DM-LSL-001", width: 70, valueFormatter: (params) => String(params.value) },
    {
      field: "GS_LSL_021", headerName: "GS-LSL-021", width: 70, valueFormatter: (params) => String(params.value) },
    {
      field: "GS_LSL_011", headerName: "GS-LSL-011", width: 70, valueFormatter: (params) => String(params.value) },
    {
      field: "PR_VA_301", headerName: "PR-VA-301", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "PR_VA_352", headerName: "PR-VA-352", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "PR_VA_312", headerName: "PR-VA-312", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "PR_VA_351", headerName: "PR-VA-351", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "PR_VA_361Ain", headerName: "PR-VA-361Ain", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "PR_VA_361Aout", headerName: "PR-VA-361Aout", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "PR_VA_361Bin", headerName: "PR-VA-361Bin", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "PR_VA_361Bout", headerName: "PR-VA-361Bout", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "PR_VA_362Ain", headerName: "PR-VA-362Ain", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "PR_VA_362Aout", headerName: "PR-VA-362Aout", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "PR_VA_362Bin", headerName: "PR-VA-362Bin", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "PR_VA_362Bout", headerName: "PR-VA-362Bout", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "N2_VA_311", headerName: "N2-VA-311", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "GS_VA_311", headerName: "GS-VA-311", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "GS_VA_312", headerName: "GS-VA-312", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "N2_VA_321", headerName: "N2-VA-321", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "GS_VA_321", headerName: "GS-VA-321", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "GS_VA_322", headerName: "GS-VA-322", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "GS_VA_022", headerName: "GS-VA-022", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "GS_VA_021", headerName: "GS-VA-021", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "AX_VA_351", headerName: "AX-VA-351", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "AX_VA_311", headerName: "AX-VA-311", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "AX_VA_312", headerName: "AX-VA-312", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "AX_VA_321", headerName: "AX-VA-321", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "AX_VA_322", headerName: "AX-VA-322", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "AX_VA_391", headerName: "AX-VA-391", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "DM_VA_301", headerName: "DM-VA-301", width: 70, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "DCDB0_VT_001", headerName: "DCDB0-VT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "DCDB0_CT_001", headerName: "DCDB0-CT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "DCDB1_VT_001", headerName: "DCDB1-VT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "DCDB1_CT_001", headerName: "DCDB1-CT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "DCDB2_VT_001", headerName: "DCDB2-VT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "DCDB2_CT_001", headerName: "DCDB2-CT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "DCDB3_VT_001", headerName: "DCDB3-VT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "DCDB3_CT_001", headerName: "DCDB3-CT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "DCDB4_VT_001", headerName: "DCDB4-VT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "DCDB4_CT_001", headerName: "DCDB4-CT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "RECT_CT_001", headerName: "RECT-CT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(4) },
    {
      field: "RECT_VT_001", headerName: "RECT-VT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(4) },
    { 
      field: "PLC_TIME_STAMP", headerName: "PLC-TIME-STAMP", width: 180, valueFormatter: (params) => params.value },
    {
      field: "Test_Remarks", headerName: "Test-Remarks", width: 150, valueFormatter: (params) => params.value },
    {
      field: "Test_description", headerName: "Test-description", width: 150, valueFormatter: (params) => params.value }
    
    

];
  return (
    <Box m="15px" mt="-60px">
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Header title="Historical Data Table" subtitle="Fetch data using start_time and end_time" />
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={3}>
            <DateTimePicker
              label="Start Date and Time"
              value={startDate}
              onChange={setStartDate}
              renderInput={(params) => <TextField {...params} />}
            />
          </Grid>
          <Grid item xs={3}>
            <DateTimePicker
              label="End Date and Time"
              value={endDate}
              onChange={setEndDate}
              renderInput={(params) => <TextField {...params} />}
            />
          </Grid>
          <Grid item xs={3}>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleFetchData}
              disabled={!startDate || !endDate}
            >
              Fetch Data
            </Button>
          </Grid>
        </Grid>
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        <div style={{ height: 730, width: '100%', marginTop: 20 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={pageSize}
            onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
            rowsPerPageOptions={[25, 50, 100]}
            loading={loading}
            components={{
              Toolbar: GridToolbar,
            }}
            componentsProps={{
              toolbar:{
                sx: {
                  "& .MuiButton-root": {
                    color: "rgb(34 197 94)",
                  },
                },
              },
            }}
          />
        </div>
      </LocalizationProvider>
    </Box>
  );
};
export default DataTable;



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



// import React, { useState, useEffect } from 'react';
// import { DataGrid, GridToolbar } from '@mui/x-data-grid';
// import axios from 'axios';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import { Box, Button, Grid, TextField, useTheme } from '@mui/material';
// import { format } from 'date-fns';
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

//   const fetchData = async (start, end, page, pageSize) => {
//     setLoading(true);
//     try {
//       const formattedStartTime = format(start, 'yyyy-MM-dd HH:mm');
//       const formattedEndTime = format(end, 'yyyy-MM-dd HH:mm');

//       const response = await axios.post(
//         'https://3di0yc14j3.execute-api.us-east-1.amazonaws.com/dev/iot-data',
//         {
//           start_time: formattedStartTime,
//           end_time: formattedEndTime,
//           page,
//           page_size: pageSize,
//         }
//       );

//       if (response.data && Array.isArray(response.data.data)) {
//         const data = response.data.data;
//         const parsedRows = data.map((item, index) => ({
//           id: index + (page - 1) * pageSize,
//           timestamp: item[0], // Assuming item[0] is timestamp
//           'AX-LT-011': item[1],
//           'AX-LT-021': item[2],
//         }));
//         setRows(parsedRows);
//       }
//     } catch (error) {
//       console.error('Error fetching data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleFetchData = () => {
//     if (startDate && endDate) {
//       fetchData(startDate, endDate, 1, pageSize);
//     }
//   };

  // const columns = [
  //   { field: 'timestamp', headerName: 'Timestamp', width: 170 },
  //   { field: "AX-LT-011", headerName: "AX-LT-011", width: 120 },
  //   { field: "AX-LT-021", headerName: "AX-LT-021", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
  // ];

//   return (
//     <Box m="20px">
//       <div>
//         <LocalizationProvider dateAdapter={AdapterDateFns}>
//           <Header title="Historical Data Table" subtitle="Fetch data using start_time and end_time" />
//           <Grid container spacing={2} alignItems="center">
//             <Grid item xs={3}>
//               <DateTimePicker
//                 label="Start Date and Time"
//                 value={startDate}
//                 onChange={setStartDate}
//                 renderInput={(params) => <TextField {...params} />}
//               />
//             </Grid>
//             <Grid item xs={3}>
//               <DateTimePicker
//                 label="End Date and Time"
//                 value={endDate}
//                 onChange={setEndDate}
//                 renderInput={(params) => <TextField {...params} />}
//               />
//             </Grid>
//             <Grid item xs={3}>
//               <Button
//                 variant="contained"
//                 color="secondary"
//                 onClick={handleFetchData}
//                 disabled={!startDate || !endDate}
//               >
//                 Fetch Data
//               </Button>
//             </Grid>
//           </Grid>
//           <div style={{ height: 670, width: '100%', marginTop: 20 }}>
//             <DataGrid
//               rows={rows}
//               columns={columns}
//               pageSize={pageSize}
//               loading={loading}
//               components={{
//                 Toolbar: GridToolbar,
//               }}
//             />
//           </div>
//         </LocalizationProvider>
//       </div>
//     </Box>
//   );
// };

// export default DataTable;




// import React, { useState, useEffect } from 'react';
// import { DataGrid, GridToolbar } from '@mui/x-data-grid';
// import axios from 'axios';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import { Box, Button, Grid, TextField, useTheme } from '@mui/material';
// import { format } from 'date-fns';
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
//   const [page, setPage] = useState(1);
//   const [totalItems, setTotalItems] = useState(0);

//   const [dimensions, setDimensions] = useState({
//     height: window.innerWidth > 1280 ? 750 : 350,
//     width: window.innerWidth > 1280 ? "100%" : "100%",
//   });

//     useEffect(() => {
//       const handleResize = () => {
//         setDimensions({
//           height: window.innerWidth > 1280 ? 750 : 500,
//           width: window.innerWidth > 1280 ? "100%" : "90%",
//         });
//       };
  
//       window.addEventListener("resize", handleResize);
//       return () => window.removeEventListener("resize", handleResize);
//     }, []);

//     const fetchData = async (start, end, page, pageSize) => {
//       setLoading(true);
//       try {
//         const formattedStartTime = format(start, 'yyyy-MM-dd HH:mm'); // Format in IST format
//         const formattedEndTime = format(end, 'yyyy-MM-dd HH:mm'); // Format in IST format
    
//         const response = await axios.post(
//           'https://3di0yc14j3.execute-api.us-east-1.amazonaws.com/dev/iot-data',
//           {
//             start_time: formattedStartTime,
//             end_time: formattedEndTime,
//             page,
//             page_size: pageSize,
//           }
//         );
    
//         // Debugging response
//         console.log('Full Response:', response);
    
//         const parsedBody = JSON.parse(response.data.body);
//         console.log('Parsed Body:', parsedBody);
    
//         if (Array.isArray(parsedBody.data)) {
//           const data = parsedBody.data;
//           const parsedRows = data.map((item, index) => ({
//             id: index + (page - 1) * pageSize,
//             timestamp: item[0], // Assuming item[0] is timestamp
//             'AX-LT-011': item[1],
//             'AX-LT-021': item[2],
//           }));
//           setRows(parsedRows);
//           setTotalItems(parsedBody.total_items || 0);
//         }
//       } catch (error) {
//         console.error('Error fetching data:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
    

//   const handleFetchData = () => {
//     if (startDate && endDate) {
//       fetchData(startDate, endDate, 1, pageSize);
//     }
//   };

//   const handlePageChange = (newPage) => {
//     setPage(newPage + 1);
//     if (startDate && endDate) {
//       fetchData(startDate, endDate, newPage + 1, pageSize);
//     }
//   };
//   const columns = [
//     { field: 'timestamp', headerName: 'Timestamp', width: 170 },
//     { field: "AX-LT-011", headerName: "AX-LT-011", width: 120 },
//     { field: "AX-LT-021", headerName: "AX-LT-021", width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0)},
//     { field: "CW-TT-011", headerName: "CW-TT-011", width: 70,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "CW-TT-021", headerName: "CW-TT-021", width: 70,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "CR-LT-011", headerName: "CR-LT-011", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "CR-PT-011", headerName: "CR-PT-011", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "CR-LT-021", headerName: "CR-LT-021", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "CR-PT-021", headerName: "CR-PT-021", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "CR-PT-001", headerName: "CR-PT-001", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "CR-TT-001", headerName: "CR-TT-001", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "CR-FT-001", headerName: "CR-FT-001", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "CR-TT-002", headerName: "CR-TT-002", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "GS-AT-011", headerName: "GS-AT-011", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "GS-AT-012", headerName: "GS-AT-012", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "GS-PT-011", headerName: "GS-PT-011", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "GS-TT-011", headerName: "GS-TT-011", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "GS-AT-022", headerName: "GS-AT-022", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "GS-PT-021", headerName: "GS-PT-021", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "GS-TT-021", headerName: "GS-TT-021", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-TT-001", headerName: "PR-TT-001", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-TT-061", headerName: "PR-TT-061", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-TT-072", headerName: "PR-TT-072", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-FT-001", headerName: "PR-FT-001", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-AT-001", headerName: "PR-AT-001", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-AT-003", headerName: "PR-AT-003", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-AT-005", headerName: "PR-AT-005", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "DM-LSH-001", headerName: "DM-LSH-001", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "DM-LSL-001", headerName: "DM-LSL-001", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "GS-LSL-021", headerName: "GS-LSL-021", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "GS-LSL-011", headerName: "GS-LSL-011", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-VA-301", headerName: "PR-VA-301", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-VA-352", headerName: "PR-VA-352", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-VA-312", headerName: "PR-VA-312", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-VA-351", headerName: "PR-VA-351", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-VA-361Ain", headerName: "PR-VA-361Ain", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-VA-361Aout", headerName: "PR-VA-361Aout", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-VA-361Bin", headerName: "PR-VA-361Bin",width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-VA-361Bout", headerName: "PR-VA-361Bout", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-VA-362Ain", headerName: "PR-VA-362Ain", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-VA-362Aout", headerName: "PR-VA-362Aout", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-VA-362Bin", headerName: "PR-VA-362Bin", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-VA-362Bout", headerName: "PR-VA-362Bout", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "N2-VA-311", headerName: "N2-VA-311", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "GS-VA-311", headerName: "GS-VA-311", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "GS-VA-312", headerName: "GS-VA-312", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "N2-VA-321", headerName: "N2-VA-321", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "GS-VA-321", headerName: "GS-VA-321", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "GS-VA-322", headerName: "GS-VA-322", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "GS-VA-022", headerName: "GS-VA-022", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "GS-VA-021", headerName: "GS-VA-021", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "AX-VA-351", headerName: "AX-VA-351", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "AX-VA-311", headerName: "AX-VA-311", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "AX-VA-312", headerName: "AX-VA-312", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "AX-VA-321", headerName: "AX-VA-321", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "AX-VA-322", headerName: "AX-VA-322", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "AX-VA-391", headerName: "AX-VA-391", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "DM-VA-301", headerName: "DM-VA-301", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "DCDB0-VT-001", headerName: "DCDB0-VT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "DCDB0-CT-001", headerName: "DCDB0-CT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "DCDB1-VT-001", headerName: "DCDB1-VT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "DCDB1-CT-001", headerName: "DCDB1-CT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "DCDB2-VT-001", headerName: "DCDB2-VT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "DCDB2-CT-001", headerName: "DCDB2-CT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "DCDB3-VT-001", headerName: "DCDB3-VT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "DCDB3-CT-001", headerName: "DCDB3-CT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "DCDB4-VT-001", headerName: "DCDB4-VT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "DCDB4-CT-001", headerName: "DCDB4-CT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "RECT-CT-001", headerName: "RECT-CT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "RECT-VT-001", headerName: "RECT-VT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PLC-TIME-STAMP", headerName: "PLC-TIME-STAMP", width: 170 }
//   ];
//   return (
//     <Box m="20px">
//     <div
//       style={{
//         height: dimensions.height,
//         width: dimensions.width,
       
//         margin: "0 auto",
//       }}
//     >
//       <LocalizationProvider dateAdapter={AdapterDateFns}>
//         <Header
//           title="Historical Data Table"
//           subtitle="Fetch data using start_time and end_time"
//         />
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
//               onClick={handleFetchData}
//               disabled={!startDate || !endDate}
//             >
//               Fetch Data
//             </Button>
//           </Grid>
//         </Grid>
//         <div style={{ height: 670, width: '100%', marginTop: 20 }}>
//           <DataGrid
//             rows={rows}
//             columns={columns}
//             pageSize={pageSize}
//             onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
           
//             loading={loading}
//             components={{
//               Toolbar: GridToolbar,
//             }}
//             componentsProps={{
//               toolbar: {
//                 sx: {
//                   '& .MuiButton-root': {
//                     color: 'rgb(34 197 94)',
//                   },
//                 },
//               },
//             }}
//           />
//         </div>
//       </LocalizationProvider>
//     </div>
//     </Box>
//   );
// };

// export default DataTable;




// import React, { useState } from 'react';
// import { DataGrid, GridToolbar } from '@mui/x-data-grid';
// import axios from 'axios';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import { Button, Grid, TextField, useTheme } from '@mui/material';
// import { format } from 'date-fns';
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
//   const [page, setPage] = useState(1);
//   const [totalItems, setTotalItems] = useState(0);

//   const backgroundColor =
//   theme.palette.mode === "light" ? "#f2f0f0" : "#353F53";


//   // New API Fetch function with start_time and end_time instead of start_date/end_date
//   const fetchData = async (start, end, page, pageSize) => {
//     setLoading(true);
//     try {
//       const formattedStartTime = format(start, 'yyyy-MM-dd HH:mm');  // Format in IST format
//       const formattedEndTime = format(end, 'yyyy-MM-dd HH:mm');  // Format in IST format
  
//       const response = await axios.post('https://xdeuid6slkki7yxz4zhdbqbzfq0hirkk.lambda-url.us-east-1.on.aws/', {
//         start_time: formattedStartTime,
//         end_time: formattedEndTime,
//         page: page,
//         page_size: pageSize,
//       });
  
//       // Assuming the response follows the same structure as before
//       const parsedBody = JSON.parse(response.data.body);
//       if (Array.isArray(parsedBody.data)) {
//         const data = parsedBody.data;
//         const parsedRows = data.map((item, index) => ({
//           id: index + (page - 1) * pageSize,
//           timestamp: item[0],  // Assuming item[0] is timestamp
//           'AX-LT-011': item[1],
//           'AX-LT-021': item[2],
//           'CW-TT-011': item[3],
//           'CW-TT-021': item[4],
//           'CR-LT-011': item[5],
//           'CR-PT-011': item[6],
//           'CR-LT-021': item[7],
//           'CR-PT-021': item[8],
//           'CR-PT-001': item[9],
//           'CR-TT-001': item[10],
//           'CR-FT-001': item[11],
//           'CR-TT-002': item[12],
//           'GS-AT-011': item[13],
//           'GS-AT-012': item[14],
//           'GS-PT-011': item[15],
//           'GS-TT-011': item[16],
//           'GS-AT-022': item[17],
//           'GS-PT-021': item[18],
//           'GS-TT-021': item[19],
//           'PR-TT-001': item[20],
//           'PR-TT-061': item[21],
//           'PR-TT-072': item[22],
//           'PR-FT-001': item[23],
//           'PR-AT-001': item[24],
//           'PR-AT-003': item[25],
//           'PR-AT-005': item[26],
//           'DM-LSH-001': item[27],
//           'DM-LSL-001': item[28],
//           'GS-LSL-021': item[29],
//           'GS-LSL-011': item[30],
//           'PR-VA-301': item[31],
//           'PR-VA-352': item[32],
//           'PR-VA-312': item[33],
//           'PR-VA-351': item[34],
//           'PR-VA-361Ain': item[35],
//           'PR-VA-361Aout': item[36],
//           'PR-VA-361Bin': item[37],
//           'PR-VA-361Bout': item[38],
//           'PR-VA-362Ain': item[39],
//           'PR-VA-362Aout': item[40],
//           'PR-VA-362Bin': item[41],
//           'PR-VA-362Bout': item[42],
//           'N2-VA-311': item[43],
//           'GS-VA-311': item[44],
//           'GS-VA-312': item[45],
//           'N2-VA-321': item[46],
//           'GS-VA-321': item[47],
//           'GS-VA-322': item[48],
//           'GS-VA-022': item[49],
//           'GS-VA-021': item[50],
//           'AX-VA-351': item[51],
//           'AX-VA-311': item[52],
//           'AX-VA-312': item[53],
//           'AX-VA-321': item[54],
//           'AX-VA-322': item[55],
//           'AX-VA-391': item[56],
//           'DM-VA-301': item[57],
//           'DCDB0-VT-001': item[58],
//           'DCDB0-CT-001': item[59],
//           'DCDB1-VT-001': item[60],
//           'DCDB1-CT-001': item[61],
//           'DCDB2-VT-001': item[62],
//           'DCDB2-CT-001': item[63],
//           'DCDB3-VT-001': item[64],
//           'DCDB3-CT-001': item[65],
//           'DCDB4-VT-001': item[66],
//           'DCDB4-CT-001': item[67],
//           'RECT-CT-001': item[68],
//           'RECT-VT-001': item[69],
//           'PLC-TIME-STAMP': item[70] // Assuming the final item corresponds to this field
//         }));
//         setRows(parsedRows);
//         setTotalItems(parsedBody.total_items || 0);
//       }
//     } catch (error) {
//       console.error('Error fetching data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };
  

//   const handleFetchData = () => {
//     if (startDate && endDate) {
//       fetchData(startDate, endDate, 1, pageSize);
//     }
//   };

//   const handlePageChange = (newPage) => {
//     setPage(newPage + 1);
//     if (startDate && endDate) {
//       fetchData(startDate, endDate, newPage + 1, pageSize);
//     }
//   };
//   const columns = [
//     { field: 'timestamp', headerName: 'Timestamp', width: 170 },
//     { field: "AX-LT-011", headerName: "AX-LT-011", width: 120 },
//     { field: "AX-LT-021", headerName: "AX-LT-021", width: 70 ,valueFormatter: (params) => Number(params.value).toFixed(0)},
//     { field: "CW-TT-011", headerName: "CW-TT-011", width: 70,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "CW-TT-021", headerName: "CW-TT-021", width: 70,valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "CR-LT-011", headerName: "CR-LT-011", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "CR-PT-011", headerName: "CR-PT-011", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "CR-LT-021", headerName: "CR-LT-021", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "CR-PT-021", headerName: "CR-PT-021", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "CR-PT-001", headerName: "CR-PT-001", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "CR-TT-001", headerName: "CR-TT-001", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "CR-FT-001", headerName: "CR-FT-001", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "CR-TT-002", headerName: "CR-TT-002", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "GS-AT-011", headerName: "GS-AT-011", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "GS-AT-012", headerName: "GS-AT-012", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "GS-PT-011", headerName: "GS-PT-011", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "GS-TT-011", headerName: "GS-TT-011", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "GS-AT-022", headerName: "GS-AT-022", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "GS-PT-021", headerName: "GS-PT-021", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "GS-TT-021", headerName: "GS-TT-021", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-TT-001", headerName: "PR-TT-001", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-TT-061", headerName: "PR-TT-061", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-TT-072", headerName: "PR-TT-072", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-FT-001", headerName: "PR-FT-001", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-AT-001", headerName: "PR-AT-001", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-AT-003", headerName: "PR-AT-003", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-AT-005", headerName: "PR-AT-005", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "DM-LSH-001", headerName: "DM-LSH-001", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "DM-LSL-001", headerName: "DM-LSL-001", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "GS-LSL-021", headerName: "GS-LSL-021", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "GS-LSL-011", headerName: "GS-LSL-011", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-VA-301", headerName: "PR-VA-301", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-VA-352", headerName: "PR-VA-352", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-VA-312", headerName: "PR-VA-312", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-VA-351", headerName: "PR-VA-351", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-VA-361Ain", headerName: "PR-VA-361Ain", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-VA-361Aout", headerName: "PR-VA-361Aout", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-VA-361Bin", headerName: "PR-VA-361Bin",width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-VA-361Bout", headerName: "PR-VA-361Bout", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-VA-362Ain", headerName: "PR-VA-362Ain", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-VA-362Aout", headerName: "PR-VA-362Aout", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-VA-362Bin", headerName: "PR-VA-362Bin", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-VA-362Bout", headerName: "PR-VA-362Bout", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "N2-VA-311", headerName: "N2-VA-311", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "GS-VA-311", headerName: "GS-VA-311", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "GS-VA-312", headerName: "GS-VA-312", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "N2-VA-321", headerName: "N2-VA-321", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "GS-VA-321", headerName: "GS-VA-321", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "GS-VA-322", headerName: "GS-VA-322", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "GS-VA-022", headerName: "GS-VA-022", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "GS-VA-021", headerName: "GS-VA-021", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "AX-VA-351", headerName: "AX-VA-351", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "AX-VA-311", headerName: "AX-VA-311", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "AX-VA-312", headerName: "AX-VA-312", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "AX-VA-321", headerName: "AX-VA-321", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "AX-VA-322", headerName: "AX-VA-322", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "AX-VA-391", headerName: "AX-VA-391", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "DM-VA-301", headerName: "DM-VA-301", width: 70, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "DCDB0-VT-001", headerName: "DCDB0-VT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "DCDB0-CT-001", headerName: "DCDB0-CT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "DCDB1-VT-001", headerName: "DCDB1-VT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "DCDB1-CT-001", headerName: "DCDB1-CT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "DCDB2-VT-001", headerName: "DCDB2-VT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "DCDB2-CT-001", headerName: "DCDB2-CT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "DCDB3-VT-001", headerName: "DCDB3-VT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "DCDB3-CT-001", headerName: "DCDB3-CT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "DCDB4-VT-001", headerName: "DCDB4-VT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "DCDB4-CT-001", headerName: "DCDB4-CT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "RECT-CT-001", headerName: "RECT-CT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "RECT-VT-001", headerName: "RECT-VT-001", width: 90, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PLC-TIME-STAMP", headerName: "PLC-TIME-STAMP", width: 170 }
//   ];
//   return (
//     <div style={{ height: 750, width: "100%", backgroundColor }}>
//     <LocalizationProvider dateAdapter={AdapterDateFns}>
//       <Header title="Historical Data Table" subtitle="Fetch data using start_time and end_time" />
//       <Grid container spacing={2} alignItems="center">
//         <Grid item xs={3}>
//           <DateTimePicker
//             label="Start Date and Time"
//             value={startDate}
//             onChange={setStartDate}
//             renderInput={(params) => <TextField {...params} />}
//           />
//         </Grid>
//         <Grid item xs={3}>
//           <DateTimePicker
//             label="End Date and Time"
//             value={endDate}
//             onChange={setEndDate}
//             renderInput={(params) => <TextField {...params} />}
//           />
//         </Grid>
//         <Grid item xs={3}>
//           <Button
//             variant="contained"
//             color="secondary"
//             onClick={handleFetchData}
//             disabled={!startDate || !endDate}
//           >
//             Fetch Data
//           </Button>
//         </Grid>
//       </Grid>
//       <div style={{ height: 670, width: '100%', marginTop: 20 }}>
//         <DataGrid
//           rows={rows}
//           columns={columns}
//           pageSize={pageSize}
//           onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
//           rowsPerPageOptions={[25, 50, 100]}
//           pagination
//           paginationMode="server"
//           rowCount={totalItems}
//           onPageChange={handlePageChange}
//           loading={loading}
//           components={{
//             Toolbar: GridToolbar,
//           }}
//           componentsProps={{
//             toolbar: {
//               sx: {
//                 "& .MuiButton-root": {
//                   color: "rgb(34 197 94)", 
//                   },
//                 }
//               },
//           }}
//         />
//       </div>
//     </LocalizationProvider>
//     </div>
//   );
// };

// export default DataTable;



// import React, { useState } from 'react';
// import { DataGrid, GridToolbar } from '@mui/x-data-grid';
// import axios from 'axios';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import { Button, Grid, TextField, useTheme } from '@mui/material';
// import { format, parseISO, addMinutes } from 'date-fns';
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
//   const [page, setPage] = useState(1);
//   const [totalItems, setTotalItems] = useState(0);

//   const fetchData = async (start, end, page, pageSize) => {
//     setLoading(true);
//     try {
//       const formattedStartDate = format(start, 'yyyy-MM-dd');
//       const formattedStartTime = format(start, 'HH:mm');
//       const formattedEndDate = format(end, 'yyyy-MM-dd');
//       const formattedEndTime = format(end, 'HH:mm');

//       const response = await axios.post('https://7ko9a0hlo2.execute-api.us-east-1.amazonaws.com/dev/data', {
//         start_date: formattedStartDate,
//         start_time: formattedStartTime,
//         end_date: formattedEndDate,
//         end_time: formattedEndTime,
//         page: page,
//         page_size: pageSize
//       });

//       const data = response.data.data;
//       const parsedRows = data.map((item, index) => {
//         const utcDate = parseISO(item.timestamp);
//         const istDate = addMinutes(utcDate, 0); // Convert UTC to IST by adding 330 minutes (5 hours 30 minutes)
//         const formattedISTDate = format(istDate, 'yyyy-MM-dd HH:mm:ss');

//         return {
//           id: index + (page - 1) * pageSize,
//           timestamp: formattedISTDate,
//           ...item.payload
//         };
//       });

//       setRows(parsedRows);
//       setTotalItems(response.data.total_items);
//     } catch (error) {
//       console.error('Error fetching data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleFetchData = () => {
//     if (startDate && endDate) {
//       fetchData(startDate, endDate, 1, pageSize);
//     }
//   };

//   const handlePageChange = (newPage) => {
//     setPage(newPage + 1);
//     if (startDate && endDate) {
//       fetchData(startDate, endDate, newPage + 1, pageSize);
//     }
//   };

//   const handleExport = async () => {
//     if (startDate && endDate) {
//       setLoading(true);
//       try {
//         const formattedStartDate = format(startDate, 'yyyy-MM-dd');
//         const formattedStartTime = format(startDate, 'HH:mm');
//         const formattedEndDate = format(endDate, 'yyyy-MM-dd');
//         const formattedEndTime = format(endDate, 'HH:mm');

//         const response = await axios.post('https://7ko9a0hlo2.execute-api.us-east-1.amazonaws.com/dev/data', {
//           start_date: formattedStartDate,
//           start_time: formattedStartTime,
//           end_date: formattedEndDate,
//           end_time: formattedEndTime,
//           download_all: true
//         });

//         const downloadUrls = response.data.download_urls;

//         for (const url of downloadUrls) {
//           const a = document.createElement('a');
//           a.setAttribute('href', url);
//           a.setAttribute('download', `data_${url.split('/').pop()}`);
//           document.body.appendChild(a);
//           a.click();
//           document.body.removeChild(a);
//         }
//       } catch (error) {
//         console.error('Error exporting data:', error);
//       } finally {
//         setLoading(false);
//       }
//     }
//   };
//   const backgroundColor = theme.palette.mode === 'light' ? '#f2f0f0' : '#1F2A40';

//   const columns = [
//     { field: 'timestamp', headerName: 'Timestamp', width: 170 },
//     { field: "AX-LT-011", headerName: "AX-LT-011", width: 200 ,  },
//     { field: "AX-LT-021", headerName: "AX-LT-021",width: 200   },
//     { field: "CW-TT-011", headerName: "CW-TT-011",width: 200  },
//     { field: "CW-TT-021", headerName: "CW-TT-021", width: 200   },
//     { field: "CR-LT-011", headerName: "CR-LT-011", width: 200   },
//     { field: "CR-PT-011", headerName: "CR-PT-011", width: 200   },
//     { field: "CR-LT-021", headerName: "CR-LT-021", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "CR-PT-021", headerName: "CR-PT-021", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "CR-PT-001", headerName: "CR-PT-001", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "CR-TT-001", headerName: "CR-TT-001", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "CR-FT-001", headerName: "CR-FT-001", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "CR-TT-002", headerName: "CR-TT-002", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "GS-AT-011", headerName: "GS-AT-011", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "GS-AT-012", headerName: "GS-AT-012", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "GS-PT-011", headerName: "GS-PT-011", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "GS-TT-011", headerName: "GS-TT-011", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "GS-AT-022", headerName: "GS-AT-022", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "GS-PT-021", headerName: "GS-PT-021", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "GS-TT-021", headerName: "GS-TT-021", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-TT-001", headerName: "PR-TT-001", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-TT-061", headerName: "PR-TT-061", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-TT-072", headerName: "PR-TT-072", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-FT-001", headerName: "PR-FT-001", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-AT-001", headerName: "PR-AT-001", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-AT-003", headerName: "PR-AT-003", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-AT-005", headerName: "PR-AT-005", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "DM-LSH-001", headerName: "DM-LSH-001", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "DM-LSL-001", headerName: "DM-LSL-001", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "GS-LSL-021", headerName: "GS-LSL-021", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "GS-LSL-011", headerName: "GS-LSL-011", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-VA-301", headerName: "PR-VA-301", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-VA-352", headerName: "PR-VA-352", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-VA-312", headerName: "PR-VA-312", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-VA-351", headerName: "PR-VA-351", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-VA-361Ain", headerName: "PR-VA-361Ain", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-VA-361Aout", headerName: "PR-VA-361Aout", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-VA-361Bin", headerName: "PR-VA-361Bin", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-VA-361Bout", headerName: "PR-VA-361Bout", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-VA-362Ain", headerName: "PR-VA-362Ain", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-VA-362Aout", headerName: "PR-VA-362Aout", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-VA-362Bin", headerName: "PR-VA-362Bin", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PR-VA-362Bout", headerName: "PR-VA-362Bout", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "N2-VA-311", headerName: "N2-VA-311", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "GS-VA-311", headerName: "GS-VA-311", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "GS-VA-312", headerName: "GS-VA-312", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "N2-VA-321", headerName: "N2-VA-321", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "GS-VA-321", headerName: "GS-VA-321", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "GS-VA-322", headerName: "GS-VA-322", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "GS-VA-022", headerName: "GS-VA-022", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "GS-VA-021", headerName: "GS-VA-021", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "AX-VA-351", headerName: "AX-VA-351", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "AX-VA-311", headerName: "AX-VA-311", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "AX-VA-312", headerName: "AX-VA-312", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "AX-VA-321", headerName: "AX-VA-321", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "AX-VA-322", headerName: "AX-VA-322", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "AX-VA-391", headerName: "AX-VA-391", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "DM-VA-301", headerName: "DM-VA-301", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "DCDB0-VT-001", headerName: "DCDB0-VT-001", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "DCDB0-CT-001", headerName: "DCDB0-CT-001", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "DCDB1-VT-001", headerName: "DCDB1-VT-001", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "DCDB1-CT-001", headerName: "DCDB1-CT-001", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "DCDB2-VT-001", headerName: "DCDB2-VT-001", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "DCDB2-CT-001", headerName: "DCDB2-CT-001", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "DCDB3-VT-001", headerName: "DCDB3-VT-001", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "DCDB3-CT-001", headerName: "DCDB3-CT-001", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "DCDB4-VT-001", headerName: "DCDB4-VT-001", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "DCDB4-CT-001", headerName: "DCDB4-CT-001", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "RECT-CT-001", headerName: "RECT-CT-001", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "RECT-VT-001", headerName: "RECT-VT-001", flex: 1, valueFormatter: (params) => Number(params.value).toFixed(0) },
//     { field: "PLC-TIME-STAMP", headerName: "PLC-TIME-STAMP",  width: 170 },
//   ];

//   return (
//     <LocalizationProvider dateAdapter={AdapterDateFns} backgroundColor>
//       <Header title="Historical Data Table" subtitle="Welcome to your Historical Data Table" />
//       <Grid container spacing={2} alignItems="center">
//         <Grid item xs={3}>
//           <DateTimePicker
//             label="Start Date and Time"
//             value={startDate}
//             onChange={setStartDate}
//             renderInput={(params) => <TextField {...params} />}
//           />
//         </Grid>
//         <Grid item xs={3}>
//           <DateTimePicker
//             label="End Date and Time"
//             value={endDate}
//             onChange={setEndDate}
//             renderInput={(params) => <TextField {...params} />}
//           />
//         </Grid>
//         <Grid item xs={3}>
//           <Button
//             variant="contained"
//             color="secondary"
//             onClick={handleFetchData}
//             disabled={!startDate || !endDate}
//           >
//             Fetch Data
//           </Button>
//         </Grid>
       
//       </Grid>
//       <div style={{ height: 670, width: '100%', marginTop: 20 , backgroundColor}}>
//         <DataGrid
//           rows={rows}
//           columns={columns}
//           pageSize={pageSize}
//           onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
//           rowsPerPageOptions={[25, 50, 100]}
//           pagination
      
//           paginationMode="server"
//           rowCount={totalItems}
//           onPageChange={handlePageChange}
//           loading={loading}
//           components={{
//             Toolbar: GridToolbar
//           }}
          
//         />
//       </div>
//     </LocalizationProvider>
//   );
// };

// export default DataTable;
