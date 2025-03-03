import React, { useState, useEffect } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';

const RealTimeData = () => {
  const [rows, setRows] = useState([]);
  const [columns] = useState([
    { field: 'id', headerName: 'ID', hide: true },
    { field: 'AX-LT-011', headerName: 'AX-LT-011', flex: 1 },
    { field: 'AX-LT-021', headerName: 'AX-LT-021', flex: 1 },
    { field: 'PLC-TIME-STAMP', headerName: 'PLC-TIME-STAMP', flex: 1 },
  ]);

  useEffect(() => {
    const ws = new WebSocket('wss://j3ffd3pw0l.execute-api.us-east-1.amazonaws.com/dev/');

    ws.onopen = () => {
      console.log('WebSocket connection established');
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('Message received:', message);

     
      message.id = rows.length + 1;

      setRows((prevRows) => [...prevRows, message]);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };
    return () => {
      ws.close();
    };
  }, [rows]); 

  return (
    <div style={{ height: 600, width: '100%' }}>
      <h1>IoT Data Dashboard</h1>
      <DataGrid
        rows={rows}
        columns={columns}
        components={{ Toolbar: GridToolbar }}
        pageSize={5} 
        loading={rows.length === 0}
        disableSelectionOnClick
        getRowId={(row) => row.id} 
      />
    </div>
  );
};

export default RealTimeData;
