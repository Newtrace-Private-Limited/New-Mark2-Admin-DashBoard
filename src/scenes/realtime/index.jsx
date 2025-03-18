import React, { useState, useEffect } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Box, useTheme } from "@mui/material";
import { format, differenceInMilliseconds } from "date-fns";
import { tokens } from "../../theme";
import Header from "src/component/Header";
import { useWebSocket } from "src/WebSocketProvider";

const RealTime = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [rows, setRows] = useState([]);
  const data = useWebSocket();

  const [dimensions, setDimensions] = useState({
    height: window.innerWidth > 1280 ? 820 : 560,
    width: window.innerWidth > 1280 ? "100%" : "100%",
  });

  const [columns] = useState([
    { field: "id", headerName: "ID", hide: true },
    { field: "date", headerName: "Date", width: 80 },
    { field: "time", headerName: "Time", width: 70 },

    {
      field: "Test-Name",
      headerName: "Test-Name",
      width: 100,
      valueFormatter: (params) => params.value || "",
    },
    {
      field: "Test-Remarks",
      headerName: "Test-Remarks",
      width: 150,
      valueFormatter: (params) => params.value || "",
    },
    {
      field: "Test-description",
      headerName: "Test-description",
      width: 150,
      valueFormatter: (params) => params.value || "",
    },
    {
      field: "LICR-0101-PV",
      headerName: "LICR-0101-PV",
      width: 120,
      valueFormatter: (params) => Number(params.value).toFixed(4),
    },
    {
      field: "LICR-0102-PV",
      headerName: "LICR-0102-PV",
      width: 120,
      valueFormatter: (params) => Number(params.value).toFixed(4),
    },
    {
      field: "LICR-0103-PV",
      headerName: "LICR-0103-PV",
      width: 120,
      valueFormatter: (params) => Number(params.value).toFixed(4),
    },
    {
      field: "PICR-0101-PV",
      headerName: "PICR-0101-PV",
      width: 120,
      valueFormatter: (params) => Number(params.value).toFixed(4),
    },
    {
      field: "PICR-0102-PV",
      headerName: "PICR-0102-PV",
      width: 120,
      valueFormatter: (params) => Number(params.value).toFixed(4),
    },
    {
      field: "PICR-0103-PV",
      headerName: "PICR-0103-PV",
      width: 120,
      valueFormatter: (params) => Number(params.value).toFixed(4),
    },
    {
      field: "TICR-0101-PV",
      headerName: "TICR-0101-PV",
      width: 120,
      valueFormatter: (params) => Number(params.value).toFixed(4),
    },
    {
      field: "ABB-Flow-Meter",
      headerName: "ABB-Flow-Meter",
      width: 120,
      valueFormatter: (params) => Number(params.value).toFixed(4),
    },
    {
      field: "H2-Flow",
      headerName: "H2-Flow",
      width: 70,
      valueFormatter: (params) => Number(params.value).toFixed(4),
    },
    {
      field: "O2-Flow",
      headerName: "O2-Flow",
      width: 70,
      valueFormatter: (params) => Number(params.value).toFixed(4),
    },
    {
      field: "Cell-back-pressure",
      headerName: "Cell-back-pressure",
      width: 150,
      valueFormatter: (params) => Number(params.value).toFixed(4),
    },
    {
      field: "H2-Pressure-outlet",
      headerName: "H2-Pressure-outlet",
      width: 150,
      valueFormatter: (params) => Number(params.value).toFixed(4),
    },
    {
      field: "O2-Pressure-outlet",
      headerName: "O2-Pressure-outlet",
      width: 150,
      valueFormatter: (params) => Number(params.value).toFixed(4),
    },
    {
      field: "H2-Stack-pressure-difference",
      headerName: "H2-Stack-pressure-difference",
      width: 170,
      valueFormatter: (params) => Number(params.value).toFixed(4),
    },
    {
      field: "O2-Stack-pressure-difference",
      headerName: "O2-Stack-pressure-difference",
      width: 170,
      valueFormatter: (params) => Number(params.value).toFixed(4),
    },
    {
      field: "Ly-Rectifier-current",
      headerName: "Ly-Rectifier-current",
      width: 150,
      valueFormatter: (params) => Number(params.value).toFixed(4),
    },
    {
      field: "Ly-Rectifier-voltage",
      headerName: "Ly-Rectifier-voltage",
      width: 150,
      valueFormatter: (params) => Number(params.value).toFixed(4),
    },
    {
      field: "Cell-Voltage-Multispan",
      headerName: "Cell-Voltage-Multispan",
      width: 150,
      valueFormatter: (params) => Number(params.value).toFixed(4),
    },
    { field: "PLC-TIME-STAMP", headerName: "PLC-TIME-STAMP", width: 170 },
  ]);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        height: window.innerWidth > 1280 ? 750 : 500,
        width: window.innerWidth > 1280 ? "100%" : "90%",
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const currentTime = new Date();
    const istDateObject = new Date(data["PLC-TIME-STAMP"]);
    const timeDifference = differenceInMilliseconds(currentTime, istDateObject);

    setRows((prevRows) => {
      // Check if a row with the same timestamp already exists
      const isDuplicate = prevRows.some(
        (row) => row["PLC-TIME-STAMP"] === data["PLC-TIME-STAMP"]
      );

      if (isDuplicate) {
        // Replace the existing row data
        return prevRows.map((row) =>
          row["PLC-TIME-STAMP"] === data["PLC-TIME-STAMP"]
            ? {
                ...data,
                id: row.id,
                date: format(istDateObject, "yyyy-MM-dd"),
                time: format(istDateObject, "HH:mm:ss"),
                differenceBetweenTime: timeDifference,
              }
            : row
        );
      } else {
        // Add a new row
        const newRow = {
          ...data,
          id: prevRows.length + 1,
          date: format(istDateObject, "yyyy-MM-dd"),
          time: format(istDateObject, "HH:mm:ss"),
          differenceBetweenTime: timeDifference,
        };
        return [...prevRows, newRow].sort(
          (a, b) =>
            new Date(b["PLC-TIME-STAMP"]) - new Date(a["PLC-TIME-STAMP"])
        );
      }
    });
  }, [data]);

  return (
    <Box m="15px" mt="-60px">
      <div
        style={{
          height: dimensions.height,
          width: dimensions.width,
          margin: "0 auto",
        }}
      >
        <Header
          title="Real Time Data Table"
          subtitle="Welcome to your Real Time Data Table"
        />
        <DataGrid
          rows={rows}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
          rowsPerPageOptions={[25, 50, 100]}
          loading={rows.length === 0}
          disableSelectionOnClick
          getRowId={(row) => row.id}
          componentsProps={{
            toolbar: {
              sx: {
                "& .MuiButton-root": {
                  color: "rgb(34 197 94)",
                },
              },
            },
          }}
        />
      </div>
    </Box>
  );
};
export default RealTime;

// import React, { useState, useEffect } from "react";
// import { DataGrid, GridToolbar } from "@mui/x-data-grid";
// import { useTheme } from "@mui/material";
// import { format, differenceInMilliseconds } from "date-fns";
// import { tokens } from "../../theme";
// import Header from "src/component/Header";
// import { useWebSocket } from "src/WebSocketProvider";

// const RealTime = () => {
//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);
//   const [rows, setRows] = useState([]);
//   const data = useWebSocket();

//   const [columns] = useState([
//     { field: "id", headerName: "ID", hide: true },
//     { field: "date", headerName: "Date", width: 80 },
//     { field: "time", headerName: "Time", width: 70 },
//     { field: "AX-LT-011", headerName: "AX-LT-011", width: 70 },
//     { field: "AX-LT-021", headerName: "AX-LT-021", width: 70 },
//   ]);

//   useEffect(() => {
//     const currentTime = new Date();
//     const istDateObject = new Date(data["PLC-TIME-STAMP"]);
//     const timeDifference = differenceInMilliseconds(currentTime, istDateObject);

//     setRows((prevRows) => {
//       // Check if a row with the same timestamp already exists
//       const isDuplicate = prevRows.some(
//         (row) => row["PLC-TIME-STAMP"] === data["PLC-TIME-STAMP"]
//       );

//       if (isDuplicate) {
//         // If duplicate, replace the existing row data instead of adding a new row
//         return prevRows.map((row) =>
//           row["PLC-TIME-STAMP"] === data["PLC-TIME-STAMP"]
//             ? {
//                 ...data,
//                 id: row.id,
//                 date: format(istDateObject, "yyyy-MM-dd"),
//                 time: format(istDateObject, "HH:mm:ss"),
//                 differenceBetweenTime: timeDifference,
//               }
//             : row
//         );
//       } else {
//         // Otherwise, add a new row
//         const newRow = {
//           ...data,
//           id: prevRows.length + 1,
//           date: format(istDateObject, "yyyy-MM-dd"),
//           time: format(istDateObject, "HH:mm:ss"),
//           differenceBetweenTime: timeDifference,
//         };
//         return [...prevRows, newRow].sort(
//           (a, b) => new Date(b["PLC-TIME-STAMP"]) - new Date(a["PLC-TIME-STAMP"])
//         );
//       }
//     });
//   }, [data]);
//   const formatNumber = (value) => {
//     if (typeof value === "number") {
//       return value.toFixed(0);
//     }
//     return value;
//   };

//   const formattedRows = rows.map((row) => ({
//     ...row,
//     "AX-LT-011": formatNumber(row["AX-LT-011"]),
//     "AX-LT-021": formatNumber(row["AX-LT-021"]),
//   }));

//   const backgroundColor =
//     theme.palette.mode === "light" ? "#f2f0f0" : "#353F53";

//   return (
//     <div style={{ height: 750, width: "100%", backgroundColor }}>
//       <Header
//         title="Real Time Data Table"
//         subtitle="Welcome to your Real Time Data Table"
//       />
//       <DataGrid
//         rows={formattedRows}
//         columns={columns}
//         components={{ Toolbar: GridToolbar }}
//         rowsPerPageOptions={[25, 50, 100]}
//         loading={rows.length === 0}
//         disableSelectionOnClick
//         getRowId={(row) => row.id}
//         componentsProps={{
//           toolbar: {
//             sx: {
//               "& .MuiButton-root": {
//                 color: "rgb(34 197 94);",
//                 },
//               }
//             },
//         }}
//       />
//     </div>
//   );
// };

// export default RealTime;

// import React, { useState, useEffect } from "react";
// import { DataGrid, GridToolbar } from "@mui/x-data-grid";
// import { useTheme } from "@mui/material";
// import { format, differenceInMilliseconds } from "date-fns";
// import { tokens } from "../../theme";
// import Header from "src/component/Header";
// import { useWebSocket } from "src/WebSocketProvider";

// const RealTime = () => {
//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);
//   const [rows, setRows] = useState([]);
//   const data = useWebSocket();

//   const [columns] = useState([
//     { field: "id", headerName: "ID", hide: true },
//     { field: "date", headerName: "Date", width: 80 },
//     { field: "time", headerName: "Time", width: 70 },
//     // {
//     //   field: "differenceBetweenTime",
//     //   headerName: "Difference Between Time (ms)",
//     //   width: 70,
//     // },
//     { field: "AX-LT-011", headerName: "AX-LT-011", width: 70 },
//     { field: "AX-LT-021", headerName: "AX-LT-021", width: 70 },
//     { field: "CW-TT-011", headerName: "CW-TT-011", width: 70 },
//     { field: "CW-TT-021", headerName: "CW-TT-021", width: 70 },
//     { field: "CR-LT-011", headerName: "CR-LT-011", width: 70 },
//     { field: "CR-PT-011", headerName: "CR-PT-011", width: 70 },
//     { field: "CR-LT-021", headerName: "CR-LT-021", width: 70 },
//     { field: "CR-PT-021", headerName: "CR-PT-021", width: 70 },
//     { field: "CR-PT-001", headerName: "CR-PT-001", width: 70 },
//     { field: "CR-TT-001", headerName: "CR-TT-001", width: 70 },
//     { field: "CR-FT-001", headerName: "CR-FT-001", width: 70 },
//     { field: "CR-TT-002", headerName: "CR-TT-002", width: 70 },
//     { field: "GS-AT-011", headerName: "GS-AT-011", width: 70 },
//     { field: "GS-AT-012", headerName: "GS-AT-012", width: 70 },
//     { field: "GS-PT-011", headerName: "GS-PT-011", width: 70 },
//     { field: "GS-TT-011", headerName: "GS-TT-011", width: 70 },
//     { field: "GS-AT-022", headerName: "GS-AT-022", width: 70 },
//     { field: "GS-PT-021", headerName: "GS-PT-021", width: 70 },
//     { field: "GS-TT-021", headerName: "GS-TT-021", width: 70 },
//     { field: "PR-TT-001", headerName: "PR-TT-001", width: 70 },
//     { field: "PR-TT-061", headerName: "PR-TT-061", width: 70 },
//     { field: "PR-TT-072", headerName: "PR-TT-072", width: 70 },
//     { field: "PR-FT-001", headerName: "PR-FT-001", width: 70 },
//     { field: "PR-AT-001", headerName: "PR-AT-001", width: 70 },
//     { field: "PR-AT-003", headerName: "PR-AT-003", width: 70 },
//     { field: "PR-AT-005", headerName: "PR-AT-005", width: 70 },
//     { field: "DM-LSH-001", headerName: "DM-LSH-001", width: 70 },
//     { field: "DM-LSL-001", headerName: "DM-LSL-001", width: 70 },
//     { field: "GS-LSL-021", headerName: "GS-LSL-021", width: 70 },
//     { field: "GS-LSL-011", headerName: "GS-LSL-011", width: 70 },
//     { field: "PR-VA-301", headerName: "PR-VA-301", width: 70 },
//     { field: "PR-VA-352", headerName: "PR-VA-352", width: 70 },
//     { field: "PR-VA-312", headerName: "PR-VA-312", width: 70 },
//     { field: "PR-VA-351", headerName: "PR-VA-351", width: 70 },
//     { field: "PR-VA-361Ain", headerName: "PR-VA-361Ain", width: 70 },
//     { field: "PR-VA-361Aout", headerName: "PR-VA-361Aout", width: 70 },
//     { field: "PR-VA-361Bin", headerName: "PR-VA-361Bin", width: 70 },
//     { field: "PR-VA-361Bout", headerName: "PR-VA-361Bout", width: 70 },
//     { field: "PR-VA-362Ain", headerName: "PR-VA-362Ain", width: 70 },
//     { field: "PR-VA-362Aout", headerName: "PR-VA-362Aout", width: 70 },
//     { field: "PR-VA-362Bin", headerName: "PR-VA-362Bin", width: 70 },
//     { field: "PR-VA-362Bout", headerName: "PR-VA-362Bout", width: 70 },
//     { field: "N2-VA-311", headerName: "N2-VA-311", width: 70 },
//     { field: "GS-VA-311", headerName: "GS-VA-311", width: 70 },
//     { field: "GS-VA-312", headerName: "GS-VA-312", width: 70 },
//     { field: "N2-VA-321", headerName: "N2-VA-321", width: 70 },
//     { field: "GS-VA-321", headerName: "GS-VA-321", width: 70 },
//     { field: "GS-VA-322", headerName: "GS-VA-322", width: 70 },
//     { field: "GS-VA-022", headerName: "GS-VA-022", width: 70 },
//     { field: "GS-VA-021", headerName: "GS-VA-021", width: 70 },
//     { field: "AX-VA-351", headerName: "AX-VA-351", width: 70 },
//     { field: "AX-VA-311", headerName: "AX-VA-311", width: 70 },
//     { field: "AX-VA-312", headerName: "AX-VA-312", width: 70 },
//     { field: "AX-VA-321", headerName: "AX-VA-321", width: 70 },
//     { field: "AX-VA-322", headerName: "AX-VA-322", width: 70 },
//     { field: "AX-VA-391", headerName: "AX-VA-391", width: 70 },
//     { field: "DM-VA-301", headerName: "DM-VA-301", width: 70 },
//     { field: "DCDB0-VT-001", headerName: "DCDB0-VT-001", width: 90 },
//     { field: "DCDB0-CT-001", headerName: "DCDB0-CT-001", width: 90 },
//     { field: "DCDB1-VT-001", headerName: "DCDB1-VT-001", width: 90 },
//     { field: "DCDB1-CT-001", headerName: "DCDB1-CT-001", width: 90 },
//     { field: "DCDB2-VT-001", headerName: "DCDB2-VT-001", width: 90 },
//     { field: "DCDB2-CT-001", headerName: "DCDB2-CT-001", width: 90 },
//     { field: "DCDB3-VT-001", headerName: "DCDB3-VT-001", width: 90 },
//     { field: "DCDB3-CT-001", headerName: "DCDB3-CT-001", width: 90 },
//     { field: "DCDB4-VT-001", headerName: "DCDB4-VT-001", width: 90 },
//     { field: "DCDB4-CT-001", headerName: "DCDB4-CT-001", width: 90 },
//     { field: "RECT-CT-001", headerName: "RECT-CT-001", width: 90 },
//     { field: "RECT-VT-001", headerName: "RECT-VT-001", width: 90 },
//     { field: "PLC-TIME-STAMP", headerName: "PLC-TIME-STAMP", width: 170 },
//   ]);

//   useEffect(() => {
//     const currentTime = new Date();
//     const istDateObject = new Date(data["PLC-TIME-STAMP"]);
//     const timeDifference = differenceInMilliseconds(currentTime, istDateObject);

//     setRows((prevRows) => {
//       // Check if a row with the same timestamp already exists
//       const isDuplicate = prevRows.some(
//         (row) => row["PLC-TIME-STAMP"] === data["PLC-TIME-STAMP"]
//       );

//       if (isDuplicate) {
//         // If duplicate, replace the existing row data instead of adding a new row
//         return prevRows.map((row) =>
//           row["PLC-TIME-STAMP"] === data["PLC-TIME-STAMP"]
//             ? {
//                 ...data,
//                 id: row.id,
//                 date: format(istDateObject, "yyyy-MM-dd"),
//                 time: format(istDateObject, "HH:mm:ss"),
//                 differenceBetweenTime: timeDifference,
//               }
//             : row
//         );
//       } else {
//         // Otherwise, add a new row
//         const newRow = {
//           ...data,
//           id: prevRows.length + 1,
//           date: format(istDateObject, "yyyy-MM-dd"),
//           time: format(istDateObject, "HH:mm:ss"),
//           differenceBetweenTime: timeDifference,
//         };
//         return [...prevRows, newRow].sort(
//           (a, b) => new Date(b["PLC-TIME-STAMP"]) - new Date(a["PLC-TIME-STAMP"])
//         );
//       }
//     });
//   }, [data]);

// useEffect(() => {
//   const currentTime = new Date();
//   const istDateObject = new Date(data["PLC-TIME-STAMP"]);
//   const timeDifference = differenceInMilliseconds(currentTime, istDateObject);

//   setRows((prevRows) => {
//     const newRows = [
//       ...prevRows,
//       {
//         ...data,
//         id: prevRows.length + 1,
//         date: format(istDateObject, "yyyy-MM-dd"),
//         time: format(istDateObject, "HH:mm:ss"),
//         differenceBetweenTime: timeDifference,
//       },
//     ];
//     return newRows.sort(
//       (a, b) => new Date(b["PLC-TIME-STAMP"]) - new Date(a["PLC-TIME-STAMP"])
//     );
//   });
// }, [data]);

//   const formatNumber = (value) => {
//     if (typeof value === "number") {
//       return value.toFixed(0);
//     }
//     return value;
//   };

//   const formattedRows = rows.map((row) => ({
//     ...row,
//     "AX-LT-011": formatNumber(row["AX-LT-011"]),
//     "AX-LT-021": formatNumber(row["AX-LT-021"]),
//     "CW-TT-011": formatNumber(row["CW-TT-011"]),
//     "CW-TT-021": formatNumber(row["CW-TT-021"]),
//     "CR-LT-011": formatNumber(row["CR-LT-011"]),
//     "CR-PT-011": formatNumber(row["CR-PT-011"]),
//     "CR-LT-021": formatNumber(row["CR-LT-021"]),
//     "CR-PT-021": formatNumber(row["CR-PT-021"]),
//     "CR-PT-001": formatNumber(row["CR-PT-001"]),
//     "CR-TT-001": formatNumber(row["CR-TT-001"]),
//     "CR-FT-001": formatNumber(row["CR-FT-001"]),
//     "CR-TT-002": formatNumber(row["CR-TT-002"]),
//     "GS-TT-011": formatNumber(row["GS-TT-011"]),
//     "GS-AT-011": formatNumber(row["GS-AT-011"]),
//     "GS-AT-012": formatNumber(row["GS-AT-012"]),
//     "GS-PT-011": formatNumber(row["GS-PT-011"]),
//     "GS-TT-011": formatNumber(row["GS-TT-011"]),
//     "GS-AT-022": formatNumber(row["GS-AT-022"]),
//     "GS-PT-021": formatNumber(row["GS-PT-021"]),
//     "GS-TT-021": formatNumber(row["GS-TT-021"]),
//     "PR-TT-001": formatNumber(row["PR-TT-001"]),
//     "PR-TT-061": formatNumber(row["PR-TT-061"]),
//     "PR-TT-072": formatNumber(row["PR-TT-072"]),
//     "PR-FT-001": formatNumber(row["PR-FT-001"]),
//     "PR-AT-001": formatNumber(row["PR-AT-001"]),
//     "PR-AT-003": formatNumber(row["PR-AT-003"]),
//     "PR-AT-005": formatNumber(row["PR-AT-005"]),
//     "DM-LSH-001": formatNumber(row["DM-LSH-001"]),
//     "DM-LSL-001": formatNumber(row["DM-LSL-001"]),
//     "GS-LSL-021": formatNumber(row["GS-LSL-021"]),
//     "GS-LSL-011": formatNumber(row["GS-LSL-011"]),
//     "PR-VA-301": formatNumber(row["PR-VA-301"]),
//     "PR-VA-352": formatNumber(row["PR-VA-352"]),
//     "PR-VA-312": formatNumber(row["PR-VA-312"]),
//     "PR-VA-351": formatNumber(row["PR-VA-351"]),
//     "PR-VA-361Ain": formatNumber(row["PR-VA-361Ain"]),
//     "PR-VA-361Aout": formatNumber(row["PR-VA-361Aout"]),
//     "PR-VA-361Bin": formatNumber(row["PR-VA-361Bin"]),
//     "PR-VA-361Bout": formatNumber(row["PR-VA-361Bout"]),
//     "PR-VA-362Ain": formatNumber(row["PR-VA-362Ain"]),
//     "PR-VA-362Aout": formatNumber(row["PR-VA-362Aout"]),
//     "PR-VA-362Bin": formatNumber(row["PR-VA-362Bin"]),
//     "PR-VA-362Bout": formatNumber(row["PR-VA-362Bout"]),
//     "N2-VA-311": formatNumber(row["N2-VA-311"]),
//     "GS-VA-311": formatNumber(row["GS-VA-311"]),
//     "GS-VA-312": formatNumber(row["GS-VA-312"]),
//     "N2-VA-321": formatNumber(row["N2-VA-321"]),
//     "GS-VA-321": formatNumber(row["GS-VA-321"]),
//     "GS-VA-322": formatNumber(row["GS-VA-322"]),
//     "GS-VA-022": formatNumber(row["GS-VA-022"]),
//     "GS-VA-021": formatNumber(row["GS-VA-021"]),
//     "AX-VA-351": formatNumber(row["AX-VA-351"]),
//     "AX-VA-311": formatNumber(row["AX-VA-311"]),
//     "AX-VA-312": formatNumber(row["AX-VA-312"]),
//     "AX-VA-321": formatNumber(row["AX-VA-321"]),
//     "AX-VA-322": formatNumber(row["AX-VA-322"]),
//     "AX-VA-391": formatNumber(row["AX-VA-391"]),
//     "DM-VA-301": formatNumber(row["DM-VA-301"]),
//     "DCDB0-VT-001": formatNumber(row["DCDB0-VT-001"]),
//     "DCDB0-CT-001": formatNumber(row["DCDB0-CT-001"]),
//     "DCDB1-VT-001": formatNumber(row["DCDB1-VT-001"]),
//     "DCDB1-CT-001": formatNumber(row["DCDB1-CT-001"]),
//     "DCDB2-VT-001": formatNumber(row["DCDB2-VT-001"]),
//     "DCDB2-CT-001": formatNumber(row["DCDB2-CT-001"]),
//     "DCDB3-VT-001": formatNumber(row["DCDB3-VT-001"]),
//     "DCDB3-CT-001": formatNumber(row["DCDB3-CT-001"]),
//     "DCDB4-VT-001": formatNumber(row["DCDB4-VT-001"]),
//     "DCDB4-CT-001": formatNumber(row["DCDB4-CT-001"]),
//     "RECT-CT-001": formatNumber(row["RECT-CT-001"]),
//     "RECT-VT-001": formatNumber(row["RECT-VT-001"]),
//     "PLC-TIME-STAMP": formatNumber(row["PLC-TIME-STAMP"]),
//   }));

//   const backgroundColor =
//     theme.palette.mode === "light" ? "#f2f0f0" : "#353F53";

//   return (
//     <div style={{ height: 750, width: "100%", backgroundColor }}>
//       <Header
//         title="Real Time Data Table"
//         subtitle="Welcome to your Real Time Data Table"
//       />
//       <DataGrid
//         rows={formattedRows}
//         columns={columns}
//         components={{ Toolbar: GridToolbar }}
//         rowsPerPageOptions={[25, 50, 100]}
//         loading={rows.length === 0}
//         disableSelectionOnClick
//         getRowId={(row) => row.id}
//         componentsProps={{
//           toolbar: {
//             sx: {
//               "& .MuiButton-root": {
//                 color: "rgb(34 197 94);",
//                 },
//               }
//             },
//         }}
//       />
//     </div>
//   );
// };

// export default RealTime;
