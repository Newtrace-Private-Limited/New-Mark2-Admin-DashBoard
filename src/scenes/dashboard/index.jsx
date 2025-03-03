import React, { useState, useEffect } from 'react';
import GridLayout from 'react-grid-layout';
import { Box, Button, Typography, IconButton, useTheme, useMediaQuery } from "@mui/material";
import DragHandleIcon from '@mui/icons-material/DragHandle';
import EmailIcon from "@mui/icons-material/Email";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { tokens } from "../../theme";
import Header from "src/component/Header";
import StatBox from "src/component/StatBox";
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { debounce } from 'lodash';

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));

  const initialLayout = [
    { i: 'emails', x: 0, y: 0, w: isLargeScreen ? 3 : 6, h: 8 },
    { i: 'sales', x: isLargeScreen ? 3 : 0, y: 0, w: isLargeScreen ? 3 : 6, h: 8 },
    { i: 'clients', x: isLargeScreen ? 6 : 0, y: isLargeScreen ? 0 : 8, w: isLargeScreen ? 3 : 6, h: 8 },
  ];

  const [layout, setLayout] = useState(() => {
    const savedLayout = localStorage.getItem('dashboardLayout');
    return savedLayout ? JSON.parse(savedLayout) : initialLayout;
  });

  const saveLayout = debounce((newLayout) => {
    localStorage.setItem('dashboardLayout', JSON.stringify(newLayout));
  }, 500);

  const onLayoutChange = (newLayout) => {
    setLayout(newLayout);
    saveLayout(newLayout);
  };

  const resetLayout = () => {
    localStorage.removeItem('dashboardLayout');
    setLayout(initialLayout);
  };

  // Update layout when screen size changes
  useEffect(() => {
    setLayout((prevLayout) =>
      prevLayout.map((item) => ({
        ...item,
        w: isLargeScreen ? 3 : 6,
      }))
    );
  }, [isLargeScreen]);

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />
        <Button variant="contained" color="primary" onClick={resetLayout}>
          Reset Layout
        </Button>
      </Box>

      <GridLayout
        className="layout"
        layout={layout}
        cols={isLargeScreen ? 12 : 6}
        rowHeight={30}
        width={isLargeScreen ? 1600 : 800}
        draggableHandle=".drag-handle"
        onLayoutChange={onLayoutChange}
        onResizeStop={onLayoutChange}
        onDragStop={onLayoutChange}
        isResizable={isLargeScreen}
        isDraggable={isLargeScreen}
      >
        <Box key="emails" sx={{ backgroundColor: colors.primary[400], height: '100%' }}>
          <Box display="flex" justifyContent="space-between" p={2}>
            <IconButton className="drag-handle" style={{ cursor: 'move' }}>
              <DragHandleIcon />
            </IconButton>
            <Typography variant="h6">Emails Sent</Typography>
          </Box>
          <Box display="flex" alignItems="center" justifyContent="center" height="100%">
            <StatBox
              title="12,361"
              subtitle="Emails Sent"
              progress="0.75"
              increase="+14%"
              icon={<EmailIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />}
            />
          </Box>
        </Box>

        <Box key="clients" sx={{ backgroundColor: colors.primary[400], height: '100%' }}>
          <Box display="flex" justifyContent="space-between" p="10px">
            <IconButton className="drag-handle" style={{ cursor: 'move' }}>
              <DragHandleIcon />
            </IconButton>
            <Typography variant="h6">New Clients</Typography>
          </Box>
          <Box display="flex" alignItems="center" justifyContent="center" height="100%">
            <StatBox
              title="32,441"
              subtitle="New Clients"
              progress="0.30"
              increase="+5%"
              icon={<PersonAddIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />}
            />
          </Box>
        </Box>
        
        {/* Additional Boxes can be added similarly */}
        
      </GridLayout>
    </Box>
  );
};

export default Dashboard;


// import React, { useState, useEffect } from 'react';
// import GridLayout from 'react-grid-layout';
// import { Box, Button, Typography, IconButton, useTheme, useMediaQuery } from "@mui/material";
// import DragHandleIcon from '@mui/icons-material/DragHandle';
// import EmailIcon from "@mui/icons-material/Email";
// import PersonAddIcon from "@mui/icons-material/PersonAdd";
// import { tokens } from "../../theme";
// import Header from "src/component/Header";
// import StatBox from "src/component/StatBox";
// import 'react-grid-layout/css/styles.css';
// import 'react-resizable/css/styles.css';
// import { debounce } from 'lodash';
 
// const Dashboard = () => {
//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);
//   const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));

//   const initialLayout = [
//     { i: 'emails', x: 0, y: 0, w: isLargeScreen ? 3 : 6, h: 8 },
//     { i: 'sales', x: isLargeScreen ? 3 : 0, y: 0, w: isLargeScreen ? 3 : 6, h: 8 },
//     { i: 'clients', x: isLargeScreen ? 6 : 0, y: isLargeScreen ? 0 : 8, w: isLargeScreen ? 3 : 6, h: 8 },
//   ];

//   const [layout, setLayout] = useState(() => {
//     const savedLayout = localStorage.getItem('dashboardLayout');
//     return savedLayout ? JSON.parse(savedLayout) : initialLayout;
//   });

//   const saveLayout = debounce((newLayout) => {
//     localStorage.setItem('dashboardLayout', JSON.stringify(newLayout));
//   }, 500);

//   const onLayoutChange = (newLayout) => {
//     setLayout(newLayout);
//     saveLayout(newLayout);
//   };

//   const resetLayout = () => {
//     localStorage.removeItem('dashboardLayout');
//     setLayout(initialLayout);
//   };

//   return (
//     <Box m="20px">
//       <Box display="flex" justifyContent="space-between" alignItems="center">
//         <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />
//         <Button variant="contained" color="primary" onClick={resetLayout}>
//           Reset Layout
//         </Button>
//       </Box>

//       <GridLayout
//         className="layout"
//         layout={layout}
//         cols={isLargeScreen ? 12 : 6}
//         rowHeight={30}
//         width={isLargeScreen ? 1600 : 800}
//         draggableHandle=".drag-handle"
//         onLayoutChange={onLayoutChange}
//         isResizable={isLargeScreen}
//         isDraggable={isLargeScreen}
//       >
//         <Box key="emails" sx={{ backgroundColor: colors.primary[400], height: '100%' }}>
//           <Box display="flex" justifyContent="space-between" p={2}>
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">Emails Sent</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <StatBox
//               title="12,361"
//               subtitle="Emails Sent"
//               progress="0.75"
//               increase="+14%"
//               icon={<EmailIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />}
//             />
//           </Box>
//         </Box>
        
//         <Box key="clients" sx={{ backgroundColor: colors.primary[400], height: '100%' }}>
//         <Box display="flex" justifyContent="space-between" p="10px">
//           <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//             <DragHandleIcon />
//           </IconButton>
//           <Typography variant="h6">New Clients</Typography>
//         </Box>
//         <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//           <StatBox
//             title="32,441"
//             subtitle="New Clients"
//             progress="0.30"
//             increase="+5%"
//             icon={<PersonAddIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />}
//           />
//         </Box>
//       </Box>
        
//       </GridLayout>
//     </Box>
//   );
// };

// export default Dashboard;




// import React, { useState, useEffect } from 'react';
// import GridLayout from 'react-grid-layout';
// import { Box, Button, Typography, IconButton, useTheme, useMediaQuery } from "@mui/material";
// import DragHandleIcon from '@mui/icons-material/DragHandle';
// import EmailIcon from "@mui/icons-material/Email";
// import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
// import PersonAddIcon from "@mui/icons-material/PersonAdd";
// import { tokens } from "../../theme";
// import Header from "src/component/Header";
// import StatBox from "src/component/StatBox";
// import 'react-grid-layout/css/styles.css';
// import 'react-resizable/css/styles.css';

// const Dashboard = () => {
//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);
//   const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));

//   const initialLayout = [
//     { i: 'emails', x: 0, y: 0, w: isLargeScreen ? 3 : 6, h: 8 },
//     { i: 'sales', x: isLargeScreen ? 3 : 0, y: 0, w: isLargeScreen ? 3 : 6, h: 8 },
//     { i: 'clients', x: isLargeScreen ? 6 : 0, y: isLargeScreen ? 0 : 8, w: isLargeScreen ? 3 : 6, h: 8 },
//   ];

//   const [layout, setLayout] = useState(() => {
//     const savedLayout = localStorage.getItem('dashboardLayout');
//     return savedLayout ? JSON.parse(savedLayout) : initialLayout;
//   });

//   useEffect(() => {
//     localStorage.setItem('dashboardLayout', JSON.stringify(layout));
//   }, [layout]);

//   const onLayoutChange = (newLayout) => {
//     setLayout(newLayout);
//   };

//   const resetLayout = () => {
//     localStorage.removeItem('dashboardLayout');
//     setLayout(initialLayout);
//   };

//   return (
//     <Box m="20px">
//       <Box display="flex" justifyContent="space-between" alignItems="center">
//         <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />
//         <Button variant="contained" color="primary" onClick={resetLayout}>
//           Reset Layout
//         </Button>
//       </Box>

//       <GridLayout
//         className="layout"
//         layout={layout}
//         cols={isLargeScreen ? 12 : 6}
//         rowHeight={30}
//         width={isLargeScreen ? 1600 : 800}
//         draggableHandle=".drag-handle"
//         onLayoutChange={onLayoutChange}
//       >
//         <Box key="emails" sx={{ backgroundColor: colors.primary[400], height: '100%' }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">Emails Sent</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <StatBox
//               title="12,361"
//               subtitle="Emails Sent"
//               progress="0.75"
//               increase="+14%"
//               icon={<EmailIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />}
//             />
//           </Box>
//         </Box>
//         <Box key="sales" sx={{ backgroundColor: colors.primary[400], height: '100%' }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">Sales Obtained</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <StatBox
//               title="431,225"
//               subtitle="Sales Obtained"
//               progress="0.50"
//               increase="+21%"
//               icon={<PointOfSaleIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />}
//             />
//           </Box>
//         </Box>
//         <Box key="clients" sx={{ backgroundColor: colors.primary[400], height: '100%' }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">New Clients</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <StatBox
//               title="32,441"
//               subtitle="New Clients"
//               progress="0.30"
//               increase="+5%"
//               icon={<PersonAddIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />}
//             />
//           </Box>
//         </Box>
//       </GridLayout>
//     </Box>
//   );
// };

// export default Dashboard;
