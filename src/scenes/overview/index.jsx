import React from 'react'

const index = () => {
  return (
    <div>
      Overview
    </div>
  )
}

export default index



// import React, { useState, useEffect } from "react";
// import { useDispatch } from "react-redux";
// import GridLayout from "react-grid-layout";
// import { Box, Typography, IconButton, useTheme, Button } from "@mui/material";
// import DragHandleIcon from "@mui/icons-material/DragHandle";
// import { debounce } from "lodash";
// import RawGasImpurities from "src/component/separator/RawGasImpurities";
// import H2RawGas from "src/component/AuxSystem/H2RawGas";
// import H2ProcessGas from "src/component/AuxSystem/H2ProcessGas";
// import Separator from "src/component/separator/Separator";
// import Electrolyte from "src/component/Electrolyte/Electrolyte";
// import RectifierControl from "src/component/separator/RectifierControl";
// import { setLayout as setLayoutAction } from "../../redux/layoutActions";
// import { tokens } from "../../theme";
// import "react-grid-layout/css/styles.css";
// import "react-resizable/css/styles.css";
// import Header from "src/component/Header";

// const Overview = () => {
//   const dispatch = useDispatch();
//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);

//   const largeScreenKey = "overviewChartsLayoutLarge";
//   const smallScreenKey = "overviewChartsLayoutSmall";

//   // Default layouts for large and small screens
//   const largeScreenLayout = [
//     { i: "Seperator", x: 0, y: 1, w: 2.5, h: 10, minW: 2, maxW: 4, minH: 10, maxH: 10 },
//     { i: "Electrolyte", x: 2.5, y: 0, w: 2.5, h: 10, minW: 2.5, maxW: 4, minH: 9, maxH: 13 },
//     { i: "RawGas", x: 5, y: 0, w: 5, h: 10, minW: 4.5, maxW: 7, minH: 9, maxH: 13 },
//     { i: "H2RAW", x: 0, y: 2, w: 6, h: 10.5, minW: 4.5, maxW: 7, minH: 9, maxH: 13 },
//     { i: "RECTIFIER", x: 10, y: 0, w: 2, h: 10, minW: 2, maxW: 4, minH: 2, maxH: 11 },
//     { i: "H2PROCESS", x: 6, y: 3, w: 6, h: 10.5, minW: 4.5, maxW: 7, minH: 9, maxH: 13 },
//   ];

//   const smallScreenLayout = [
//     { i: "Seperator", x: 0, y: 1, w: 3.5, h: 10, minW: 2.5, maxW: 4, minH: 9, maxH: 13 },
//     { i: "Electrolyte", x: 3.5, y: 0, w: 3.2, h: 10, minW: 2.5, maxW: 4, minH: 9, maxH: 13 },
//     { i: "RawGas", x: 0, y: 1, w: 4.8, h: 10.7, minW: 4.5, maxW: 7, minH: 9, maxH: 13 },
//     { i: "H2RAW", x: 4.8, y: 1, w: 5, h: 10.5, minW: 4, maxW: 8, minH: 10, maxH: 13 },
//     { i: "RECTIFIER", x: 6.7, y: 0, w: 3, h: 10, minW: 2, maxW: 12, minH: 2, maxH: 15 },
//     { i: "H2PROCESS", x: 0, y: 3, w: 9.8, h: 10.5, minW: 4, maxW: 8, minH: 10, maxH: 13 },
//   ];

//   // Responsive layout state
//   const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth > 1280);
//   const [layoutState, setLayoutState] = useState(() => {
//     const storedLayout = JSON.parse(localStorage.getItem(isLargeScreen ? largeScreenKey : smallScreenKey));
//     return storedLayout || (isLargeScreen ? largeScreenLayout : smallScreenLayout);
//   });

//   // Handle screen size changes
//   useEffect(() => {
//     const handleResize = () => {
//       const isLarge = window.innerWidth > 1280;
//       setIsLargeScreen(isLarge);

//       // Load appropriate layout from localStorage
//       const storedLayout = JSON.parse(localStorage.getItem(isLarge ? largeScreenKey : smallScreenKey));
//       setLayoutState(storedLayout || (isLarge ? largeScreenLayout : smallScreenLayout));
//     };

//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   // Save layout with debounce
//   const saveLayout = debounce((newLayout) => {
//     setLayoutState(newLayout);
//     const layoutKey = isLargeScreen ? largeScreenKey : smallScreenKey;

//     // Dispatch action to save layout in Redux store
//     dispatch(setLayoutAction({ layout: newLayout, isLargeScreen }));
//     localStorage.setItem(layoutKey, JSON.stringify(newLayout));
//   }, 500);

//   // Reset layout to default
//   const resetLayout = () => {
//     const layoutToReset = isLargeScreen ? largeScreenLayout : smallScreenLayout;
//     setLayoutState(layoutToReset);

//     const layoutKey = isLargeScreen ? largeScreenKey : smallScreenKey;
//     dispatch(setLayoutAction({ layout: layoutToReset, isLargeScreen }));
//     localStorage.setItem(layoutKey, JSON.stringify(layoutToReset));
//   };

//   // Calculate box dimensions dynamically
//   const calculateBoxDimensions = (item) => {
//     const baseWidth = isLargeScreen ? 160 : 120;
//     const baseHeight = 30;
//     return {
//       width: item.w * baseWidth,
//       height: item.h * baseHeight,
//     };
//   };
//   return (
//     <Box m="15px" mt="-60px">
//       <Box display="flex" justifyContent="space-between" alignItems="center">
//         <Header title="Overview" subtitle="Welcome to your Overview" />
//         <Button variant="contained" color="secondary" onClick={resetLayout} className="top-6">
//           Reset Layout
//         </Button>
//       </Box>
//       <GridLayout
//         className="layout"
//         layout={layoutState}
//         cols={12}
//         rowHeight={30}
//         width={isLargeScreen ? 1630 : 1200}
//         onLayoutChange={(newLayout) => saveLayout(newLayout)}
//         onResizeStop={(newLayout) => saveLayout(newLayout)}
//         isResizable
//         isDraggable
//         draggableHandle=".drag-handle"
//       >
//         {layoutState.map((item) => {
//           const dimensions = calculateBoxDimensions(item);
//           return (
//             <Box key={item.i} sx={{ backgroundColor: colors.primary[400] }}>
//               <Box display="flex" justifyContent="space-between" p="8px">
//                 <IconButton className="drag-handle" style={{ cursor: "move" }}>
//                   <DragHandleIcon />
//                 </IconButton>
//                 <Typography variant="h6">{item.i.toUpperCase()}</Typography>
//               </Box>
//               <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//                 {item.i === "RawGas" && <RawGasImpurities width={dimensions.width} height={dimensions.height} />}
//                 {item.i === "H2RAW" && <H2RawGas width={dimensions.width} height={dimensions.height} />}
//                 {item.i === "H2PROCESS" && <H2ProcessGas width={dimensions.width} height={dimensions.height} />}
//                 {item.i === "Seperator" && <Separator />}
//                 {item.i === "Electrolyte" && <Electrolyte />}
//                 {item.i === "RECTIFIER" && <RectifierControl />}
//               </Box>
//             </Box>
//           );
//         })}
//       </GridLayout>
//     </Box>
//   );
// };
// export default Overview;

// import React, { useState, useEffect } from "react";
// import { useDispatch } from "react-redux";
// import GridLayout from "react-grid-layout";
// import { Box, Typography, IconButton, useTheme, Button } from "@mui/material";
// import DragHandleIcon from "@mui/icons-material/DragHandle";
// import { debounce } from "lodash";
// import RawGasImpurities from "src/component/separator/RawGasImpurities";
// import H2RawGas from "src/component/AuxSystem/H2RawGas";
// import H2ProcessGas from "src/component/AuxSystem/H2ProcessGas";
// import Separator from "src/component/separator/Separator";
// import Electrolyte from "src/component/Electrolyte/Electrolyte";
// import RectifierControl from "src/component/separator/RectifierControl";
// import { setLayout as setLayoutAction } from "../../redux/layoutActions";
// import { tokens } from "../../theme";
// import "react-grid-layout/css/styles.css";
// import "react-resizable/css/styles.css";
// import Header from "src/component/Header";

// const Overview = () => {
//   const dispatch = useDispatch();
//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);

//   // Define layouts for large and small screens
//   const largeScreenLayout = [
//     { i: "Seperator", x: 0, y: 1, w: 2.5, h: 10, minW: 2.5, maxW: 4, minH: 9, maxH: 10 },
//     { i: "Electrolyte", x: 2.5, y: 0, w: 2.5, h: 10, minW: 2.5, maxW: 4, minH: 9, maxH: 13 },
//     { i: "RawGas", x: 5, y: 0, w: 5, h: 10, minW: 4.5, maxW: 7, minH: 9, maxH: 13 },
//     { i: "H2RAW", x: 0, y: 2, w: 6, h: 10.5, minW: 4.5, maxW: 7, minH: 9, maxH: 13 },
//     { i: "RECTIFIER", x: 10, y: 0, w: 2, h: 10, minW: 2, maxW: 4, minH: 2, maxH: 11 },
//     { i: "H2PROCESS", x: 6, y: 3, w: 6, h: 10.5, minW: 4.5, maxW: 7, minH: 9, maxH: 13 },
//   ];

//   const smallScreenLayout = [
//     { i: "Seperator", x: 0, y: 1, w: 3.5, h: 10, minW: 2.5, maxW: 4, minH: 9, maxH: 13 },
//     { i: "Electrolyte", x: 3.5, y: 0, w: 3.2, h: 10, minW: 2.5, maxW: 4, minH: 9, maxH: 13 },
//     { i: "RawGas", x: 0, y: 1, w: 4.8, h: 10.7, minW: 4.5, maxW: 7, minH: 9, maxH: 13 },
//     { i: "H2RAW", x: 4.8, y: 1, w: 5, h: 10.5, minW: 4, maxW: 8, minH: 10, maxH: 13 },
//     { i: "RECTIFIER", x: 6.7, y: 0, w: 3, h: 10, minW: 2, maxW: 12, minH: 2, maxH: 15 },
//     { i: "H2PROCESS", x: 0, y: 3, w: 9.8, h: 10.5, minW: 4, maxW: 8, minH: 10, maxH: 13 },
//   ];

//   // Responsive layout state
//   const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth > 1280);
//   const [layoutState, setLayoutState] = useState(() => {
//     return (
//       JSON.parse(localStorage.getItem("overviewChartsLayout")) ||
//       (isLargeScreen ? largeScreenLayout : smallScreenLayout)
//     );
//   });

//   // Screen size change detection
//   useEffect(() => {
//     const handleResize = () => {
//       const isLarge = window.innerWidth > 1280;
//       setIsLargeScreen(isLarge);
//       if (!JSON.parse(localStorage.getItem("overviewChartsLayout"))) {
//         setLayoutState(isLarge ? largeScreenLayout : smallScreenLayout);
//       }
//     };

//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   // Save layout with debounce
//   const saveLayout = debounce((newLayout) => {
//     setLayoutState(newLayout);
//     dispatch(setLayoutAction(newLayout, "overviewCharts")); // Unique chart type for Overview
//     localStorage.setItem("overviewChartsLayout", JSON.stringify(newLayout));
//   }, 500);

//   // Reset layout to default
//   const resetLayout = () => {
//     const layoutToReset = isLargeScreen ? largeScreenLayout : smallScreenLayout;
//     setLayoutState(layoutToReset);
//     dispatch(setLayoutAction(layoutToReset, "overviewCharts"));
//     localStorage.setItem("overviewChartsLayout", JSON.stringify(layoutToReset));
//   };

//   // Dynamic dimensions for components
//   const calculateBoxDimensions = (item) => {
//     const baseWidth = isLargeScreen ? 160 : 120;
//     const baseHeight = 30;
//     return {
//       width: item.w * baseWidth,
//       height: item.h * baseHeight,
//     };
//   };

//   return (
//     <Box m="15px" mt="-60px">
//       <Box display="flex" justifyContent="space-between" alignItems="center">
//         <Header title="Overview" subtitle="Welcome to your Overview" />
//         <Button variant="contained" color="secondary" onClick={resetLayout} className="top-6">
//           Reset Layout
//         </Button>
//       </Box>
//       <GridLayout
//         className="layout"
//         layout={layoutState}
//         cols={12}
//         rowHeight={30}
//         width={isLargeScreen ? 1630 : 1200}
//         onLayoutChange={(newLayout) => saveLayout(newLayout)}
//         onResizeStop={(newLayout) => saveLayout(newLayout)}
//         isResizable
//         isDraggable
//         draggableHandle=".drag-handle"
//       >
//         {layoutState.map((item) => {
//           const dimensions = calculateBoxDimensions(item);
//           return (
//             <Box key={item.i} sx={{ backgroundColor: colors.primary[400] }}>
//               <Box display="flex" justifyContent="space-between" p="8px">
//                 <IconButton className="drag-handle" style={{ cursor: "move" }}>
//                   <DragHandleIcon />
//                 </IconButton>
//                 <Typography variant="h6">{item.i.toUpperCase()}</Typography>
//               </Box>
//               <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//                 {item.i === "RawGas" && <RawGasImpurities width={dimensions.width} height={dimensions.height} />}
//                 {item.i === "H2RAW" && <H2RawGas width={dimensions.width} height={dimensions.height} />}
//                 {item.i === "H2PROCESS" && <H2ProcessGas width={dimensions.width} height={dimensions.height} />}
//                 {item.i === "Seperator" && <Separator />}
//                 {item.i === "Electrolyte" && <Electrolyte />}
//                 {item.i === "RECTIFIER" && <RectifierControl />}
//               </Box>
//             </Box>
//           );
//         })}
//       </GridLayout>
//     </Box>
//   );
// };

// export default Overview;




// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import GridLayout from 'react-grid-layout';
// import { Box, Typography, IconButton, useTheme, Button } from "@mui/material";
// import DragHandleIcon from '@mui/icons-material/DragHandle';
// import { debounce } from 'lodash';
// import RawGasImpurities from "src/component/separator/RawGasImpurities";
// import H2RawGas from "src/component/AuxSystem/H2RawGas";
// import H2ProcessGas from "src/component/AuxSystem/H2ProcessGas";
// import Separator from 'src/component/separator/Separator';
// import Electrolyte from 'src/component/Electrolyte/Electrolyte';
// import RectifierControl from 'src/component/separator/RectifierControl';
// import { setLayout as setLayoutAction } from '../../redux/layoutActions';
// import { tokens } from "../../theme";
// import 'react-grid-layout/css/styles.css';
// import 'react-resizable/css/styles.css';
// import Header from 'src/component/Header';
 
// const Overview = () => {
//   const dispatch = useDispatch();
//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);
 
//   // Define layouts for small and large screens
//   const largeScreenLayout = [
//     { i: 'Seperator', x: 0, y: 1, w: 2.5, h: 10, minW: 2.5, maxW: 4, minH: 9, maxH: 10 },
//    { i: 'Electrolyte', x: 2.5, y: 0, w: 2.5, h: 10 , minW: 2.5, maxW: 4, minH: 9, maxH: 13},
//    { i: 'RawGas', x: 5, y: 0, w: 5, h: 10 , minW: 4.5, maxW: 7, minH: 9, maxH: 13},
//    { i: 'H2RAW', x: 0, y: 2, w: 6, h: 10.5, minW: 4.5, maxW: 7, minH: 9, maxH: 13 },
//    { i: 'RECTIFIER', x: 10, y: 0, w: 2, h: 10 , minW: 2, maxW: 4, minH: 2, maxH: 11},
//    { i: 'H2PROCESS', x: 6, y: 3, w: 6, h: 10.5 , minW: 4.5, maxW: 7, minH: 9, maxH: 13},
//  ];

//  const smallScreenLayout = [
//    { i: 'Seperator', x: 0, y: 1, w: 3.5, h: 10, minW: 2.5, maxW: 4, minH: 9, maxH: 13 },
//    { i: 'Electrolyte', x: 3.5, y: 0, w: 3.2, h: 10 , minW: 2.5, maxW: 4, minH: 9, maxH: 13},
//    { i: 'RawGas', x: 0, y: 1, w: 4.8, h: 10.7 , minW: 4.5, maxW: 7, minH: 9, maxH: 13},
//    { i: 'H2RAW', x: 4.8, y: 1, w: 5, h: 10.5, minW: 4, maxW: 8, minH: 10, maxH: 13 },
//    { i: 'RECTIFIER', x: 6.7, y: 0, w: 3, h: 10 , minW: 2, maxW: 12, minH: 2, maxH: 15},
//    { i: 'H2PROCESS', x: 0, y: 3, w: 9.8, h: 10.5 , minW: 4, maxW: 8, minH: 10, maxH: 13}, 
//  ];
//   // Manage responsive layout state
//   const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth > 1280);
//   useEffect(() => {
//     const savedLayout = JSON.parse(localStorage.getItem("overviewChartsLayout")) || 
//                         (isLargeScreen ? largeScreenLayout : smallScreenLayout);
//     setLayoutState(savedLayout);
//     dispatch(setLayoutAction(savedLayout, "overviewCharts"));
//   }, [dispatch, isLargeScreen]);

  
//   const [layoutState, setLayoutState] = useState(
//     () => JSON.parse(localStorage.getItem("overviewChartsLayout")) || (isLargeScreen ? largeScreenLayout : smallScreenLayout)
//   );

//   // Detect screen size changes
//   useEffect(() => {
//     const handleResize = () => {
//       const isLarge = window.innerWidth > 1280;
//       setIsLargeScreen(isLarge);
//       if (!JSON.parse(localStorage.getItem("overviewChartsLayout"))) {
//         setLayoutState(isLarge ? largeScreenLayout : smallScreenLayout);
//       }
//     };

//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   const saveLayout = debounce((newLayout) => {
//     setLayoutState(newLayout); // Update local state
//     dispatch(setLayoutAction(newLayout, "overviewCharts")); // For Overview// Save to Redux
//     localStorage.setItem("overviewChartsLayout", JSON.stringify(newLayout)); // Save to localStorage
//   }, 500);

//   // Reset layout
//   const resetLayout = () => {
//     const layoutToReset = isLargeScreen ? largeScreenLayout : smallScreenLayout;
//     setLayoutState(layoutToReset);
//     dispatch(setLayoutAction(layoutToReset, "custom"));
//     localStorage.setItem("overviewChartsLayout", JSON.stringify(layoutToReset));
//   };

//   // Dynamic Dimensions for Each Component
//   const calculateBoxDimensions = (item) => {
//     const baseWidth = isLargeScreen ? 160 : 120; // Width multiplier
//     const baseHeight = 30; // Height multiplier
//     return {
//       width: item.w * baseWidth,
//       height: item.h * baseHeight,
//     };
//   };
//   return (
//     <Box m="15px" mt="-60px">
//       <Box display="flex" justifyContent="space-between" alignItems="center">
//       <Header
//       title="Overview"
//       subtitle="Welcome to your Overview"
//     />
//         <Button variant="contained" color="secondary"  onClick={resetLayout} className='top-6'>
//           Reset Layout
//         </Button>
//       </Box>
//       <GridLayout
//         className="layout"
//         layout={layoutState}
//         cols={12}
//         rowHeight={30}
//         width={isLargeScreen ? 1600 : 1200} // Adjust width based on screen size
//         onLayoutChange={(newLayout) => saveLayout(newLayout)} // Save layout on change
//         onResizeStop={(newLayout) => saveLayout(newLayout)} // Save layout on resize
//         isResizable
//         isDraggable
//         draggableHandle=".drag-handle"
//       >
//       {layoutState.map((item) => {
//         const dimensions = calculateBoxDimensions(item);
//         return (
//           <Box key={item.i} sx={{ backgroundColor: colors.primary[400] }}>
//             <Box display="flex" justifyContent="space-between" p="8px">
//               <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//                 <DragHandleIcon />
//               </IconButton>
//               <Typography variant="h6">{item.i.toUpperCase()}</Typography>
//             </Box>
//             <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//               {item.i === "RawGas" && (
//                 <RawGasImpurities width={dimensions.width} height={dimensions.height} />
//               )}
//               {item.i === "H2RAW" && (
//                 <H2RawGas width={dimensions.width} height={dimensions.height} />
//               )}
//               {item.i === "H2PROCESS" && (
//                 <H2ProcessGas width={dimensions.width} height={dimensions.height} />
//               )}
//               {item.i === "Seperator" && <Separator />}
//               {item.i === "Electrolyte" && <Electrolyte />}
//               {item.i === "RECTIFIER" && <RectifierControl />}
//             </Box>
//           </Box>
//         );
//       })}
//       </GridLayout>
//     </Box>
//   );
// };

// export default Overview;




// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import GridLayout from 'react-grid-layout';
// import { Box, Typography, IconButton, useTheme, Button } from "@mui/material";
// import DragHandleIcon from '@mui/icons-material/DragHandle';
// import { debounce } from 'lodash';

// import RawGasImpurities from "src/component/separator/RawGasImpurities";
// import H2RawGas from "src/component/AuxSystem/H2RawGas";
// import H2ProcessGas from "src/component/AuxSystem/H2ProcessGas";
// import Separator from 'src/component/separator/Separator';
// import Electrolyte from 'src/component/Electrolyte/Electrolyte';
// import RectifierControl from 'src/component/separator/RectifierControl';
// import { setLayout as setLayoutAction } from '../../redux/layoutActions';
// import { tokens } from "../../theme";
// import 'react-grid-layout/css/styles.css';
// import 'react-resizable/css/styles.css';

// const Overview = () => {
//   const dispatch = useDispatch();
//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);

  // // Define layouts for small and large screens
  // const largeScreenLayout = [
  //    { i: 'Seperator', x: 0, y: 1, w: 2.5, h: 10, minW: 2.5, maxW: 4, minH: 9, maxH: 13 },
  //   { i: 'Electrolyte', x: 2.5, y: 0, w: 2.5, h: 10 , minW: 2.5, maxW: 4, minH: 9, maxH: 13},
  //   { i: 'RawGas', x: 5, y: 0, w: 5, h: 10 , minW: 4.5, maxW: 7, minH: 9, maxH: 13},
  //   { i: 'H2RAW', x: 0, y: 2, w: 6, h: 10.5, minW: 4, maxW: 8, minH: 10, maxH: 13 },
  //   { i: 'RECTIFIER', x: 10, y: 0, w: 2, h: 10 , minW: 2, maxW: 12, minH: 2, maxH: 15},
  //   { i: 'H2PROCESS', x: 6, y: 3, w: 6, h: 10.5 , minW: 4, maxW: 8, minH: 10, maxH: 13},
  // ];

  // const smallScreenLayout = [
  //   { i: 'Seperator', x: 0, y: 1, w: 3.5, h: 10, minW: 2.5, maxW: 4, minH: 9, maxH: 13 },
  //   { i: 'Electrolyte', x: 3.5, y: 0, w: 3.2, h: 10 , minW: 2.5, maxW: 4, minH: 9, maxH: 13},
  //   { i: 'RawGas', x: 0, y: 1, w: 4.8, h: 10.7 , minW: 4.5, maxW: 7, minH: 9, maxH: 13},
  //   { i: 'H2RAW', x: 4.8, y: 1, w: 5, h: 10.5, minW: 4, maxW: 8, minH: 10, maxH: 13 },
  //   { i: 'RECTIFIER', x: 6.7, y: 0, w: 3, h: 10 , minW: 2, maxW: 12, minH: 2, maxH: 15},
  //   { i: 'H2PROCESS', x: 0, y: 3, w: 9.8, h: 10.5 , minW: 4, maxW: 8, minH: 10, maxH: 13},
    
  // ];

//   // Manage responsive layout state
//   const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth > 1280);
//   const [layoutState, setLayoutState] = useState(isLargeScreen ? largeScreenLayout : smallScreenLayout);

//   // Detect screen size changes
//   useEffect(() => {
//     const handleResize = () => {
//       const isLarge = window.innerWidth > 1280;
//       setIsLargeScreen(isLarge);
//       setLayoutState(isLarge ? largeScreenLayout : smallScreenLayout);
//     };

//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   const saveLayout = debounce((newLayout) => {
//     dispatch(setLayoutAction(newLayout, "custom"));
//     localStorage.setItem("customChartsLayout", JSON.stringify(newLayout));
//   }, 500);


//   // Reset layout
//   const resetLayout = () => {
//     const layoutToReset = isLargeScreen ? largeScreenLayout : smallScreenLayout;
//     setLayoutState(layoutToReset);
//     dispatch(setLayoutAction(layoutToReset, "custom"));
//     localStorage.setItem("customChartsLayout", JSON.stringify(layoutToReset));
//   };

  // // Dynamic Dimensions for Each Component
  // const calculateBoxDimensions = (item) => {
  //   const baseWidth = isLargeScreen ? 160 : 120; // Width multiplier
  //   const baseHeight = 30; // Height multiplier
  //   return {
  //     width: item.w * baseWidth,
  //     height: item.h * baseHeight,
  //   };
  // };
//   return (
//     <Box m="20px">
//       <Box display="flex" justifyContent="space-between" alignItems="center">
//         <Typography variant="h4">Overview</Typography>
//         <Button variant="contained" color="secondary" onClick={resetLayout}>
//           Reset Layout
//         </Button>
//       </Box>

//       <GridLayout
//         className="layout"
//         layout={layoutState}
//         cols={12}
//         rowHeight={30}
//         width={isLargeScreen ? 1600 : 1200} // Adjust width based on screen size
//         onLayoutChange={(newLayout) => {
//           setLayoutState(newLayout);
//           saveLayout(newLayout);
//         }}
//         isResizable
//         isDraggable
//         draggableHandle=".drag-handle"
      // >
        // {layoutState.map((item) => {
        //   const dimensions = calculateBoxDimensions(item);
        //   return (
        //     <Box key={item.i} sx={{ backgroundColor: colors.primary[400] }}>
        //       <Box display="flex" justifyContent="space-between" p="8px">
        //         <IconButton className="drag-handle" style={{ cursor: 'move' }}>
        //           <DragHandleIcon />
        //         </IconButton>
        //         <Typography variant="h6">{item.i.toUpperCase()}</Typography>
        //       </Box>
        //       <Box display="flex" alignItems="center" justifyContent="center" height="100%">
        //         {item.i === "RawGas" && (
        //           <RawGasImpurities width={dimensions.width} height={dimensions.height} />
        //         )}
        //         {item.i === "H2RAW" && (
        //           <H2RawGas width={dimensions.width} height={dimensions.height} />
        //         )}
        //         {item.i === "H2PROCESS" && (
        //           <H2ProcessGas width={dimensions.width} height={dimensions.height} />
        //         )}
        //         {item.i === "Seperator" && <Separator />}
        //         {item.i === "Electrolyte" && <Electrolyte />}
        //         {item.i === "RECTIFIER" && <RectifierControl />}
        //       </Box>
        //     </Box>
        //   );
        // })}
//       </GridLayout>
//     </Box>
//   );
// };

// export default Overview;



// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import GridLayout from 'react-grid-layout';
// import { Box, Typography, IconButton, useTheme, Button } from "@mui/material";
// import DragHandleIcon from '@mui/icons-material/DragHandle';
// import { debounce } from 'lodash';

// import RawGasImpurities from "src/component/separator/RawGasImpurities";
// import H2RawGas from "src/component/AuxSystem/H2RawGas";
// import H2ProcessGas from "src/component/AuxSystem/H2ProcessGas";
// import Separator from 'src/component/separator/Separator';
// import Electrolyte from 'src/component/Electrolyte/Electrolyte';
// import RectifierControl from 'src/component/separator/RectifierControl';
// import { setLayout as setLayoutAction } from '../../redux/layoutActions';
// import { tokens } from "../../theme";
// import 'react-grid-layout/css/styles.css';
// import 'react-resizable/css/styles.css';

// const Overview = () => {
//   const dispatch = useDispatch();
//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);

//   // Define layouts for small and large screens
//   const largeScreenLayout = [
//     { i: 'Seperator', x: 0, y: 1, w: 3, h: 10, minW: 2.5, maxW: 4, minH: 9, maxH: 13 },
//     { i: 'Electrolyte', x: 3, y: 0, w: 3, h: 10, minW: 2.5, maxW: 4, minH: 9, maxH: 13 },
//     { i: 'RawGas', x: 0, y: 2, w: 6, h: 10, minW: 4.5, maxW: 7, minH: 9, maxH: 13 },
//     { i: 'H2RAW', x: 0, y: 3, w: 6, h: 10.5, minW: 4, maxW: 8, minH: 10, maxH: 13 },
//     { i: 'RECTIFIER', x: 6, y: 0, w: 3, h: 10, minW: 2, maxW: 12, minH: 2, maxH: 15 },
//     { i: 'H2PROCESS', x: 6, y: 1, w: 6, h: 10.5, minW: 4, maxW: 8, minH: 10, maxH: 13 },
//   ];

//   const smallScreenLayout = [
//     { i: 'Seperator', x: 0, y: 1, w: 4, h: 8, minW: 3, maxW: 5, minH: 8, maxH: 12 },
//     { i: 'Electrolyte', x: 0, y: 2, w: 4, h: 8, minW: 3, maxW: 5, minH: 8, maxH: 12 },
//     { i: 'RawGas', x: 0, y: 3, w: 5, h: 10, minW: 4.5, maxW: 6, minH: 9, maxH: 13 },
//     { i: 'H2RAW', x: 0, y: 4, w: 5, h: 10, minW: 4, maxW: 6, minH: 9, maxH: 13 },
//     { i: 'RECTIFIER', x: 0, y: 5, w: 4, h: 8, minW: 3, maxW: 5, minH: 8, maxH: 12 },
//     { i: 'H2PROCESS', x: 0, y: 6, w: 5, h: 10, minW: 4.5, maxW: 6, minH: 9, maxH: 13 },
//   ];

//   // Manage responsive layout state
//   const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth > 1280);
//   const [layoutState, setLayoutState] = useState(isLargeScreen ? largeScreenLayout : smallScreenLayout);

//   // Detect screen size changes
//   useEffect(() => {
//     const handleResize = () => {
//       const isLarge = window.innerWidth > 1280;
//       setIsLargeScreen(isLarge);
//       setLayoutState(isLarge ? largeScreenLayout : smallScreenLayout);
//     };

//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   const saveLayout = debounce((newLayout) => {
//     dispatch(setLayoutAction(newLayout, "custom"));
//     localStorage.setItem("customChartsLayout", JSON.stringify(newLayout));
//   }, 500);

//   // Reset layout
//   const resetLayout = () => {
//     const layoutToReset = isLargeScreen ? largeScreenLayout : smallScreenLayout;
//     setLayoutState(layoutToReset);
//     dispatch(setLayoutAction(layoutToReset, "custom"));
//     localStorage.setItem("customChartsLayout", JSON.stringify(layoutToReset));
//   };

//   return (
//     <Box m="20px">
//       <Box display="flex" justifyContent="space-between" alignItems="center">
//         <Typography variant="h4">Overview</Typography>
//         <Button variant="contained" color="primary" onClick={resetLayout}>
//           Reset Layout
//         </Button>
//       </Box>

//       <GridLayout
//         className="layout"
//         layout={layoutState}
//         cols={12}
//         rowHeight={30}
//         width={isLargeScreen ? 1600 : 1200} // Adjust width based on screen size
//         onLayoutChange={(newLayout) => {
//           setLayoutState(newLayout);
//           saveLayout(newLayout);
//         }}
//         isResizable
//         isDraggable
//         draggableHandle=".drag-handle"
//       >
//         <Box key="Seperator" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="8px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">SEPARATOR</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <Separator />
//           </Box>
//         </Box>

//         <Box key="Electrolyte" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">ELECTROLYTE</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <Electrolyte />
//           </Box>
//         </Box>

//         <Box key="RawGas" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">RAW GAS IMPURITIES</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <RawGasImpurities />
//           </Box>
//         </Box>

//         <Box key="H2RAW" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">H2 RAW GAS</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <H2RawGas />
//           </Box>
//         </Box>

//         <Box key="H2PROCESS" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">H2 PROCESS GAS</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <H2ProcessGas />
//           </Box>
//         </Box>

//         <Box key="RECTIFIER" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">RECTIFIER CONTROL</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <RectifierControl />
//           </Box>
//         </Box>
//       </GridLayout>
//     </Box>
//   );
// };

// export default Overview;



// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import GridLayout from 'react-grid-layout';
// import { Box, Typography, IconButton, useTheme, Button } from "@mui/material";
// import DragHandleIcon from '@mui/icons-material/DragHandle';
// import { debounce } from 'lodash';

// import RawGasImpurities from "src/component/separator/RawGasImpurities";
// import H2RawGas from "src/component/AuxSystem/H2RawGas";
// import H2ProcessGas from "src/component/AuxSystem/H2ProcessGas";
// import Separator from 'src/component/separator/Separator';
// import Electrolyte from 'src/component/Electrolyte/Electrolyte';
// import RectifierControl from 'src/component/separator/RectifierControl';
// import { setLayout as setLayoutAction } from '../../redux/layoutActions';
// import { tokens } from "../../theme";
// import 'react-grid-layout/css/styles.css';
// import 'react-resizable/css/styles.css';

// const Overview = () => {
//   const dispatch = useDispatch();
//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);

//   // Define the initial layout
//   const initialLayout = [
//     { i: 'Seperator', x: 0, y: 1, w: 2.5, h: 10, minW: 2.5, maxW: 4, minH: 9, maxH: 13 },
//     { i: 'Electrolyte', x: 2.5, y: 0, w: 2.5, h: 10, minW: 2.5, maxW: 4, minH: 9, maxH: 13 },
//     { i: 'RawGas', x: 0, y: 3, w: 5, h: 10, minW: 4.5, maxW: 7, minH: 9, maxH: 13 },
//     { i: 'H2RAW', x: 0, y: 2, w: 6, h: 10.5, minW: 4, maxW: 8, minH: 10, maxH: 13 },
//     { i: 'RECTIFIER', x: 5, y: 0, w: 2, h: 10, minW: 2, maxW: 12, minH: 2, maxH: 15 },
//     { i: 'H2PROCESS', x: 5, y: 2, w: 6, h: 10.5, minW: 4, maxW: 8, minH: 10, maxH: 13 },
//   ];

//   // Initialize layout state directly with initialLayout
//   const storedLayout = useSelector((state) => state.layout.customChartsLayout);
//   const [layoutState, setLayoutState] = useState(storedLayout?.length ? storedLayout : initialLayout);

//   // Load dimensions from localStorage or set defaults
//   const getPersistedDimensions = (key, defaultDimensions) =>
//     JSON.parse(localStorage.getItem(key)) || defaultDimensions;

//   const [rawGasDimensions, setRawGasDimensions] = useState(
//     getPersistedDimensions('rawGasDimensions', { width: 800, height: 300 })
//   );
//   const [h2RawGasDimensions, setH2RawGasDimensions] = useState(
//     getPersistedDimensions('h2RawGasDimensions', { width: 800, height: 300 })
//   );
//   const [h2ProcessGasDimensions, setH2ProcessGasDimensions] = useState(
//     getPersistedDimensions('h2ProcessGasDimensions', { width: 800, height: 300 })
//   );

//   // Save layout to Redux and localStorage
//   const saveLayout = debounce((newLayout) => {
//     dispatch(setLayoutAction(newLayout, "custom"));
//     localStorage.setItem("customChartsLayout", JSON.stringify(newLayout));
//   }, 500);

//   // Persist dimensions on resize
//   const persistDimensions = (key, dimensions) => {
//     localStorage.setItem(key, JSON.stringify(dimensions));
//   };

//   // Reset layout to initial
//   const resetLayout = () => {
//     setLayoutState(initialLayout); // Reset local state
//     dispatch(setLayoutAction(initialLayout, "custom")); // Reset Redux state
//     localStorage.setItem("customChartsLayout", JSON.stringify(initialLayout)); // Update localStorage
//   };

//   return (
//     <Box m="20px">
//       <Box display="flex" justifyContent="space-between" alignItems="center">
//         <Typography variant="h4">Overview</Typography>
//         <Button variant="contained" color="primary" onClick={resetLayout}>
//           Reset Layout
//         </Button>
//       </Box>

//       <GridLayout
//         className="layout"
//         layout={layoutState}
//         cols={12}
//         rowHeight={30}
//         width={1600}
//         onLayoutChange={(newLayout) => {
//           setLayoutState(newLayout); // Update local state
//           saveLayout(newLayout); // Save to Redux and localStorage
//         }}
//         onResizeStop={(newLayout, oldItem, newItem) => {
//           const dimensionKeyMap = {
//             RawGas: 'rawGasDimensions',
//             H2RAW: 'h2RawGasDimensions',
//             H2PROCESS: 'h2ProcessGasDimensions',
//           };

//           const key = dimensionKeyMap[newItem.i];
//           if (key) {
//             const newDimensions = { width: newItem.w * 160, height: newItem.h * 30 };
//             persistDimensions(key, newDimensions);
//             if (key === 'rawGasDimensions') setRawGasDimensions(newDimensions);
//             if (key === 'h2RawGasDimensions') setH2RawGasDimensions(newDimensions);
//             if (key === 'h2ProcessGasDimensions') setH2ProcessGasDimensions(newDimensions);
//           }

//           saveLayout(newLayout);
//         }}
//         isResizable
//         isDraggable
//         draggableHandle=".drag-handle"
//       >
//         <Box key="Seperator" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="8px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">SEPARATOR</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <Separator />
//           </Box>
//         </Box>

//         <Box key="Electrolyte" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">ELECTROLYTE</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <Electrolyte />
//           </Box>
//         </Box>

//         <Box key="RawGas" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle"  style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">RAW GAS IMPURITIES</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <RawGasImpurities width={rawGasDimensions.width} height={rawGasDimensions.height} />
//           </Box>
//         </Box>

//         <Box key="H2RAW" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">H2 RAW GAS</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <H2RawGas width={h2RawGasDimensions.width} height={h2RawGasDimensions.height} />
//           </Box>
//         </Box>

//         <Box key="H2PROCESS" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">H2 PROCESS GAS</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <H2ProcessGas width={h2ProcessGasDimensions.width} height={h2ProcessGasDimensions.height} />
//           </Box>
//         </Box>

//         <Box key="RECTIFIER" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">RECTIFIER CONTROL</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <RectifierControl />
//           </Box>
//         </Box>
//       </GridLayout>
//     </Box>
//   );
// };

// export default Overview;



// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import GridLayout from 'react-grid-layout';
// import { Box, Typography, IconButton, useTheme, Button } from "@mui/material";
// import DragHandleIcon from '@mui/icons-material/DragHandle';
// import { debounce } from 'lodash';

// import RawGasImpurities from "src/component/separator/RawGasImpurities";
// import H2RawGas from "src/component/AuxSystem/H2RawGas";
// import H2ProcessGas from "src/component/AuxSystem/H2ProcessGas";
// import Separator from 'src/component/separator/Separator';
// import Electrolyte from 'src/component/Electrolyte/Electrolyte';
// import RectifierControl from 'src/component/separator/RectifierControl';
// import { setLayout as setLayoutAction } from '../../redux/layoutActions'; // Rename to avoid conflict
// import { tokens } from "../../theme";
// import 'react-grid-layout/css/styles.css';
// import 'react-resizable/css/styles.css';

// const Overview = () => {
//   const dispatch = useDispatch();
//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);

//   // Define the initial layout
//   const initialLayout = [
//     { i: 'Seperator', x: 0, y: 1, w: 2.5, h: 10, minW: 2.5, maxW: 4, minH: 9, maxH: 13 },
//     { i: 'Electrolyte', x: 2.5, y: 0, w: 2.5, h: 10, minW: 2.5, maxW: 4, minH: 9, maxH: 13 },
//     { i: 'RawGas', x: 0, y: 3, w: 5, h: 10, minW: 4.5, maxW: 7, minH: 9, maxH: 13 },
//     { i: 'H2RAW', x: 0, y: 2, w: 6, h: 10.5, minW: 4, maxW: 8, minH: 10, maxH: 13 },
//     { i: 'RECTIFIER', x: 5, y: 0, w: 2, h: 10, minW: 2, maxW: 12, minH: 2, maxH: 15 },
//     { i: 'H2PROCESS', x: 5, y: 2, w: 6, h: 10.5, minW: 4, maxW: 8, minH: 10, maxH: 13 },
//   ];

//   // Load saved layout or fallback to initial layout
//   const storedLayout = useSelector((state) => state.layout.customChartsLayout) 
//     || JSON.parse(localStorage.getItem("customChartsLayout")) 
//     || initialLayout;

//   const [layoutState, setLayoutState] = useState(storedLayout); // Rename state updater

//   // Load dimensions from localStorage or set defaults
//   const getPersistedDimensions = (key, defaultDimensions) =>
//     JSON.parse(localStorage.getItem(key)) || defaultDimensions;

//   const [rawGasDimensions, setRawGasDimensions] = useState(
//     getPersistedDimensions('rawGasDimensions', { width: 5000, height: 3000 })
//   );
//   const [h2RawGasDimensions, setH2RawGasDimensions] = useState(
//     getPersistedDimensions('h2RawGasDimensions', { width: 500, height: 300 })
//   );
//   const [h2ProcessGasDimensions, setH2ProcessGasDimensions] = useState(
//     getPersistedDimensions('h2ProcessGasDimensions', { width: 500, height: 300 })
//   );

//   const saveLayout = debounce((newLayout) => {
//     dispatch(setLayoutAction(newLayout, "custom")); // Dispatch valid Redux action
//     localStorage.setItem("customChartsLayout", JSON.stringify(newLayout));
//   }, 500);

//   // Persist dimensions on resize
//   const persistDimensions = (key, dimensions) => {
//     localStorage.setItem(key, JSON.stringify(dimensions));
//   };

//   const resetLayout = () => {
//     localStorage.removeItem("customChartsLayout");
//     setLayoutState(initialLayout); // Update local state
//     dispatch(setLayoutAction(initialLayout, "custom")); // Dispatch valid Redux action
//   };

//   return (
//     <Box m="20px">
//       <Box display="flex" justifyContent="space-between" alignItems="center">
//         <Typography variant="h4">Overview</Typography>
//         <Button variant="contained" color="primary" onClick={resetLayout}>
//           Reset Layout
//         </Button>
//       </Box>

//       <GridLayout
//         className="layout"
//         layout={layoutState}
//         cols={12}
//         rowHeight={30}
//         width={1600}
//         onLayoutChange={(newLayout) => {
//           setLayoutState(newLayout); // Update local state
//           saveLayout(newLayout); // Save to Redux and localStorage
//         }}
//         onResizeStop={(newLayout, oldItem, newItem) => {
//           const dimensionKeyMap = {
//             RawGas: 'rawGasDimensions',
//             H2RAW: 'h2RawGasDimensions',
//             H2PROCESS: 'h2ProcessGasDimensions',
//           };

//           const key = dimensionKeyMap[newItem.i];
//           if (key) {
//             const newDimensions = { width: newItem.w * 160, height: newItem.h * 30 };
//             persistDimensions(key, newDimensions);
//             if (key === 'rawGasDimensions') setRawGasDimensions(newDimensions);
//             if (key === 'h2RawGasDimensions') setH2RawGasDimensions(newDimensions);
//             if (key === 'h2ProcessGasDimensions') setH2ProcessGasDimensions(newDimensions);
//           }

//           saveLayout(newLayout);
//         }}
//         isResizable
//         isDraggable
//         draggableHandle=".drag-handle"
//       >
//         <Box key="Seperator" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="8px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">SEPARATOR</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <Separator />
//           </Box>
//         </Box>

//         <Box key="Electrolyte" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">ELECTROLYTE</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <Electrolyte />
//           </Box>
//         </Box>

//         <Box key="RawGas" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">RAW GAS IMPURITIES</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <RawGasImpurities width={rawGasDimensions.width} height={rawGasDimensions.height} />
//           </Box>
//         </Box>

//         <Box key="H2RAW" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">H2 RAW GAS</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <H2RawGas width={h2RawGasDimensions.width} height={h2RawGasDimensions.height} />
//           </Box>
//         </Box>

//         <Box key="H2PROCESS" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">H2 PROCESS GAS</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <H2ProcessGas width={h2ProcessGasDimensions.width} height={h2ProcessGasDimensions.height} />
//           </Box>
//         </Box>

//         <Box key="RECTIFIER" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">RECTIFIER CONTROL</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <RectifierControl />
//           </Box>
//         </Box>
//       </GridLayout>
//     </Box>
//   );
// };

// export default Overview;




// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import GridLayout from 'react-grid-layout';
// import { Box, Typography, IconButton, useTheme } from "@mui/material";
// import DragHandleIcon from '@mui/icons-material/DragHandle';
// import { debounce } from 'lodash';

// import RawGasImpurities from "src/component/separator/RawGasImpurities";
// import H2RawGas from "src/component/AuxSystem/H2RawGas";
// import H2ProcessGas from "src/component/AuxSystem/H2ProcessGas";
// import Separator from 'src/component/separator/Separator';
// import Electrolyte from 'src/component/Electrolyte/Electrolyte';
// import RectifierControl from 'src/component/separator/RectifierControl';
// import { setLayout as setLayoutAction } from '../../redux/layoutActions';
// import { tokens } from "../../theme";
// import 'react-grid-layout/css/styles.css';
// import 'react-resizable/css/styles.css';

// const Overview = () => {
//   const dispatch = useDispatch();
//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);

//   const [layoutState, setLayoutState] = useState(storedLayout); // Rename state updater

//   // Define the initial layout
//   const initialLayout = [
//     { i: 'Seperator', x: 0, y: 1, w: 2.5, h: 10, minW: 2.5, maxW: 4, minH: 9, maxH: 13 },
//     { i: 'Electrolyte', x: 2.5, y: 0, w: 2.5, h: 10, minW: 2.5, maxW: 4, minH: 9, maxH: 13 },
//     { i: 'RawGas', x: 0, y: 3, w: 5, h: 10, minW: 4.5, maxW: 7, minH: 9, maxH: 13 },
//     { i: 'H2RAW', x: 0, y: 2, w: 6, h: 10.5, minW: 4, maxW: 8, minH: 10, maxH: 13 },
//     { i: 'RECTIFIER', x: 5, y: 0, w: 2, h: 10, minW: 2, maxW: 12, minH: 2, maxH: 15 },
//     { i: 'H2PROCESS', x: 5, y: 2, w: 6, h: 10.5, minW: 4, maxW: 8, minH: 10, maxH: 13 },
//   ];

//   // Load saved layout or fallback to initial layout
//   const storedLayout = useSelector((state) => state.layout.customChartsLayout) 
//     || JSON.parse(localStorage.getItem("customChartsLayout")) 
//     || initialLayout;

//   const [layout, setLayout] = useState(storedLayout);

//   // Load dimensions from localStorage or set defaults
//   const getPersistedDimensions = (key, defaultDimensions) =>
//     JSON.parse(localStorage.getItem(key)) || defaultDimensions;

//   const [rawGasDimensions, setRawGasDimensions] = useState(
//     getPersistedDimensions('rawGasDimensions', { width: 500, height: 300 })
//   );
//   const [h2RawGasDimensions, setH2RawGasDimensions] = useState(
//     getPersistedDimensions('h2RawGasDimensions', { width: 500, height: 300 })
//   );
//   const [h2ProcessGasDimensions, setH2ProcessGasDimensions] = useState(
//     getPersistedDimensions('h2ProcessGasDimensions', { width: 500, height: 300 })
//   );

//   const saveLayout = debounce((newLayout) => {
//     console.log('Saving layout:', newLayout);
//     const action = setLayout(newLayout, "custom"); // Ensure setLayout returns a valid object
//     console.log('Dispatching action:', action);
//     dispatch(action); // Dispatch the valid action
//     localStorage.setItem("customChartsLayout", JSON.stringify(newLayout));
//   }, 500);
  

//   // Persist dimensions on resize
//   const persistDimensions = (key, dimensions) => {
//     localStorage.setItem(key, JSON.stringify(dimensions));
//   };

//   const resetLayout = () => {
//     localStorage.removeItem("customChartsLayout");
//     setLayoutState(initialLayout); // Update local state
//     dispatch(setLayoutAction(initialLayout, "custom")); // Dispatch valid Redux action
//   };

//   return (
//     <Box m="20px">
//       <Box display="flex" justifyContent="space-between" alignItems="center">
//         <Typography variant="h4">Overview</Typography>
//         <button onClick={resetLayout}>Reset Layout</button>
//       </Box>

//       <GridLayout
//         className="layout"
//         layout={layout}
//         cols={12}
//         rowHeight={30}
//         width={1600}
//         onLayoutChange={(newLayout) => {
//           setLayout(newLayout);
//           saveLayout(newLayout);
//         }}
//         onResizeStop={(newLayout, oldItem, newItem) => {
//           const dimensionKeyMap = {
//             RawGas: 'rawGasDimensions',
//             H2RAW: 'h2RawGasDimensions',
//             H2PROCESS: 'h2ProcessGasDimensions',
//           };

//           const key = dimensionKeyMap[newItem.i];
//           if (key) {
//             const newDimensions = { width: newItem.w * 160, height: newItem.h * 30 };
//             persistDimensions(key, newDimensions);
//             if (key === 'rawGasDimensions') setRawGasDimensions(newDimensions);
//             if (key === 'h2RawGasDimensions') setH2RawGasDimensions(newDimensions);
//             if (key === 'h2ProcessGasDimensions') setH2ProcessGasDimensions(newDimensions);
//           }

//           saveLayout(newLayout);
//         }}
//         isResizable
//         isDraggable
//         draggableHandle=".drag-handle"
//       >
//         <Box key="Seperator" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="8px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">SEPARATOR</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <Separator />
//           </Box>
//         </Box>

//         <Box key="Electrolyte" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">ELECTROLYTE</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <Electrolyte />
//           </Box>
//         </Box>

//         <Box key="RawGas" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">RAW GAS IMPURITIES</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <RawGasImpurities width={rawGasDimensions.width} height={rawGasDimensions.height} />
//           </Box>
//         </Box>

//         <Box key="H2RAW" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">H2 RAW GAS</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <H2RawGas width={h2RawGasDimensions.width} height={h2RawGasDimensions.height} />
//           </Box>
//         </Box>

//         <Box key="H2PROCESS" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">H2 PROCESS GAS</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <H2ProcessGas width={h2ProcessGasDimensions.width} height={h2ProcessGasDimensions.height} />
//           </Box>
//         </Box>

//         <Box key="RECTIFIER" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">RECTIFIER CONTROL</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <RectifierControl />
//           </Box>
//         </Box>
//       </GridLayout>
//     </Box>
//   );
// };

// export default Overview;


// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import GridLayout from 'react-grid-layout';
// import { Box, Typography,  IconButton, useTheme } from "@mui/material";
// import DragHandleIcon from '@mui/icons-material/DragHandle';
// import { debounce } from 'lodash';

// import RawGasImpurities from "src/component/separator/RawGasImpurities";
// import H2RawGas from "src/component/AuxSystem/H2RawGas";
// import H2ProcessGas from "src/component/AuxSystem/H2ProcessGas";
// import { setLayout } from '../../redux/layoutActions';
// import { tokens } from "../../theme";
// import 'react-grid-layout/css/styles.css';
// import 'react-resizable/css/styles.css';
// import Separator from 'src/component/separator/Separator';
// import Electrolyte from 'src/component/Electrolyte/Electrolyte';
// import RectifierControl from 'src/component/separator/RectifierControl';

// const Overview = () => {
//   const dispatch = useDispatch();
//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);

//   // Load dimensions from localStorage or set defaults
//   const getPersistedDimensions = (key, defaultDimensions) =>
//     JSON.parse(localStorage.getItem(key)) || defaultDimensions;

//   const [rawGasDimensions, setRawGasDimensions] = useState(
//     getPersistedDimensions('rawGasDimensions', { width: 500, height: 300 })
//   );
//   const [h2RawGasDimensions, setH2RawGasDimensions] = useState(
//     getPersistedDimensions('h2RawGasDimensions', { width: 500, height: 300 })
//   );
//   const [h2ProcessGasDimensions, setH2ProcessGasDimensions] = useState(
//     getPersistedDimensions('h2ProcessGasDimensions', { width: 500, height: 300 })
//   );

//   const layout = useSelector(
//     (state) => state.layout.customChartsLayout
//   ) || JSON.parse(localStorage.getItem("customChartsLayout")) || [];

//   const saveLayout = debounce((newLayout) => {
//     dispatch(setLayout(newLayout, "custom"));
//     localStorage.setItem("customChartsLayout", JSON.stringify(newLayout));
//   }, 500);

//   // Persist dimensions on resize
//   const persistDimensions = (key, dimensions) => {
//     localStorage.setItem(key, JSON.stringify(dimensions));
//   };

//   return (
//     <Box m="20px">
//       <Box display="flex" justifyContent="space-between" alignItems="center">
//         <Typography variant="h4">Overview</Typography>
  
//       </Box>

//       <GridLayout
//         className="layout"
//         layout={layout}
//         cols={12}
//         rowHeight={30}
//         width={1600}
//         onLayoutChange={(newLayout) => dispatch(setLayout(newLayout, "custom"))}
//         onResizeStop={(newLayout, oldItem, newItem) => {
//           if (newItem.i === 'RawGas') {
//             const newDimensions = { width: newItem.w * 160, height: newItem.h * 30 };
//             setRawGasDimensions(newDimensions);
//             persistDimensions('rawGasDimensions', newDimensions);
//           } else if (newItem.i === 'H2RAW') {
//             const newDimensions = { width: newItem.w * 160, height: newItem.h * 30 };
//             setH2RawGasDimensions(newDimensions);
//             persistDimensions('h2RawGasDimensions', newDimensions);
//           } else if (newItem.i === 'H2PROCESS') {
//             const newDimensions = { width: newItem.w * 160, height: newItem.h * 30 };
//             setH2ProcessGasDimensions(newDimensions);
//             persistDimensions('h2ProcessGasDimensions', newDimensions);
//           }
//           saveLayout(newLayout);
//         }}
//         isResizable
//         isDraggable
//         draggableHandle=".drag-handle"
//       >
//       <Box key="Seperator" sx={{ backgroundColor: colors.primary[400] }}>
//       <Box display="flex" justifyContent="space-between" p="8px">
//         <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//           <DragHandleIcon />
//         </IconButton>
//         <Typography variant="h6">SEPARATOR</Typography>
//       </Box>
//       <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//         <Separator />
//       </Box>
//     </Box>

//     <Box key="Electrolyte" sx={{ backgroundColor: colors.primary[400] }}>
//     <Box display="flex" justifyContent="space-between" p="10px">
//       <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//         <DragHandleIcon />
//       </IconButton>
//       <Typography variant="h6">ELECTROLYTE</Typography>
//     </Box>
//     <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//       <Electrolyte />
//     </Box>
//   </Box>

//         <Box key="RawGas" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">RAW GAS IMPURITIES</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <RawGasImpurities width={rawGasDimensions.width} height={rawGasDimensions.height} />
//           </Box>
//         </Box>

//         <Box key="H2RAW" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">H2 RAW GAS</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <H2RawGas width={h2RawGasDimensions.width} height={h2RawGasDimensions.height} />
//           </Box>
//         </Box>

//         <Box key="H2PROCESS" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">H2 PROCESS GAS</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <H2ProcessGas width={h2ProcessGasDimensions.width} height={h2ProcessGasDimensions.height} />
//           </Box>
//         </Box>

//         <Box key="RECTIFIER" sx={{ backgroundColor: colors.primary[400] }}>
//         <Box display="flex" justifyContent="space-between" p="10px">
//           <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//             <DragHandleIcon />
//           </IconButton>
//           <Typography variant="h6">RECTIFIER CONTROL</Typography>
//         </Box>
//         <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//           <RectifierControl />
//         </Box>
//       </Box>

//       </GridLayout>
//     </Box>
//   );
// };

// export default Overview;


// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import GridLayout from 'react-grid-layout';
// import { Box, Typography,  IconButton, useTheme } from "@mui/material";
// import DragHandleIcon from '@mui/icons-material/DragHandle';
// import { debounce } from 'lodash';

// import RawGasImpurities from "src/component/separator/RawGasImpurities";
// import H2RawGas from "src/component/AuxSystem/H2RawGas";
// import H2ProcessGas from "src/component/AuxSystem/H2ProcessGas";
// import { setLayout } from '../../redux/layoutActions';
// import { tokens } from "../../theme";
// import 'react-grid-layout/css/styles.css';
// import 'react-resizable/css/styles.css';

// const Overview = () => {
//   const dispatch = useDispatch();
//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);


//   // Load dimensions from localStorage or set defaults
//   const getPersistedDimensions = (key, defaultDimensions) =>
//     JSON.parse(localStorage.getItem(key)) || defaultDimensions;

//   const [rawGasDimensions, setRawGasDimensions] = useState(
//     getPersistedDimensions('rawGasDimensions', { width: 500, height: 300 })
//   );
//   const [h2RawGasDimensions, setH2RawGasDimensions] = useState(
//     getPersistedDimensions('h2RawGasDimensions', { width: 500, height: 300 })
//   );
//   const [h2ProcessGasDimensions, setH2ProcessGasDimensions] = useState(
//     getPersistedDimensions('h2ProcessGasDimensions', { width: 500, height: 300 })
//   );

//   const layout = useSelector(
//     (state) => state.layout.customChartsLayout
//   ) || JSON.parse(localStorage.getItem("customChartsLayout")) || [];

//   const saveLayout = debounce((newLayout) => {
//     dispatch(setLayout(newLayout, "custom"));
//     localStorage.setItem("customChartsLayout", JSON.stringify(newLayout));
//   }, 500);

//   // Persist dimensions on resize
//   const persistDimensions = (key, dimensions) => {
//     localStorage.setItem(key, JSON.stringify(dimensions));
//   };

//   return (
//     <Box m="20px">
//       <Box display="flex" justifyContent="space-between" alignItems="center">
//         <Typography variant="h4">Overview</Typography>
  
//       </Box>

//       <GridLayout
//         className="layout"
//         layout={layout}
//         cols={12}
//         rowHeight={30}
//         width={1600}
//         onLayoutChange={(newLayout) => dispatch(setLayout(newLayout, "custom"))}
//         onResizeStop={(newLayout, oldItem, newItem) => {
//           if (newItem.i === 'RawGas') {
//             const newDimensions = { width: newItem.w * 160, height: newItem.h * 30 };
//             setRawGasDimensions(newDimensions);
//             persistDimensions('rawGasDimensions', newDimensions);
//           } else if (newItem.i === 'H2RAW') {
//             const newDimensions = { width: newItem.w * 160, height: newItem.h * 30 };
//             setH2RawGasDimensions(newDimensions);
//             persistDimensions('h2RawGasDimensions', newDimensions);
//           } else if (newItem.i === 'H2PROCESS') {
//             const newDimensions = { width: newItem.w * 160, height: newItem.h * 30 };
//             setH2ProcessGasDimensions(newDimensions);
//             persistDimensions('h2ProcessGasDimensions', newDimensions);
//           }
//           saveLayout(newLayout);
//         }}
//         isResizable
//         isDraggable
//         draggableHandle=".drag-handle"
//       >
//         <Box key="RawGas" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">RAW GAS IMPURITIES</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <RawGasImpurities width={rawGasDimensions.width} height={rawGasDimensions.height} />
//           </Box>
//         </Box>

//         <Box key="H2RAW" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">H2 RAW GAS</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <H2RawGas width={h2RawGasDimensions.width} height={h2RawGasDimensions.height} />
//           </Box>
//         </Box>

//         <Box key="H2PROCESS" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">H2 PROCESS GAS</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <H2ProcessGas width={h2ProcessGasDimensions.width} height={h2ProcessGasDimensions.height} />
//           </Box>
//         </Box>
//       </GridLayout>
//     </Box>
//   );
// };

// export default Overview;



// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import GridLayout from 'react-grid-layout';
// import { Box, Typography, Button, IconButton, useTheme } from "@mui/material";
// import DragHandleIcon from '@mui/icons-material/DragHandle';
// import { debounce } from 'lodash';

// import RawGasImpurities from "src/component/separator/RawGasImpurities";
// import H2RawGas from "src/component/AuxSystem/H2RawGas";
// import { setLayout } from '../../redux/layoutActions';
// import { tokens } from "../../theme";
// import 'react-grid-layout/css/styles.css';
// import 'react-resizable/css/styles.css';

// const Overview = () => {
//   const dispatch = useDispatch();
//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);

//   // Load dimensions from localStorage or set defaults
//   const getPersistedDimensions = (key, defaultDimensions) =>
//     JSON.parse(localStorage.getItem(key)) || defaultDimensions;

//   const [rawGasDimensions, setRawGasDimensions] = useState(
//     getPersistedDimensions('rawGasDimensions', { width: 500, height: 300 })
//   );
//   const [h2RawGasDimensions, setH2RawGasDimensions] = useState(
//     getPersistedDimensions('h2RawGasDimensions', { width: 500, height: 300 })
//   );

//   const layout = useSelector(
//     (state) => state.layout.customChartsLayout
//   ) || JSON.parse(localStorage.getItem("customChartsLayout")) || [];

//   const saveLayout = debounce((newLayout) => {
//     dispatch(setLayout(newLayout, "custom"));
//     localStorage.setItem("customChartsLayout", JSON.stringify(newLayout));
//   }, 500);

//   // Persist dimensions on resize
//   const persistDimensions = (key, dimensions) => {
//     localStorage.setItem(key, JSON.stringify(dimensions));
//   };

//   return (
//     <Box m="20px">
//       <Box display="flex" justifyContent="space-between" alignItems="center">
//         <Typography variant="h4">Overview</Typography>
//       </Box>

//       <GridLayout
//         className="layout"
//         layout={layout}
//         cols={12}
//         rowHeight={30}
//         width={1600}
//         onLayoutChange={(newLayout) => dispatch(setLayout(newLayout, "custom"))}
//         onResizeStop={(newLayout, oldItem, newItem) => {
//           if (newItem.i === 'RawGas') {
//             const newDimensions = { width: newItem.w * 160, height: newItem.h * 30 };
//             setRawGasDimensions(newDimensions);
//             persistDimensions('rawGasDimensions', newDimensions);
//           } else if (newItem.i === 'H2RAW') {
//             const newDimensions = { width: newItem.w * 160, height: newItem.h * 30 };
//             setH2RawGasDimensions(newDimensions);
//             persistDimensions('h2RawGasDimensions', newDimensions);
//           }
//           saveLayout(newLayout);
//         }}
//         isResizable
//         isDraggable
//         draggableHandle=".drag-handle"
//       >
//         <Box key="RawGas" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">RAW GAS IMPURITIES</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <RawGasImpurities width={rawGasDimensions.width} height={rawGasDimensions.height} />
//           </Box>
//         </Box>

//         <Box key="H2RAW" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">H2 RAW GAS</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <H2RawGas width={h2RawGasDimensions.width} height={h2RawGasDimensions.height} />
//           </Box>
//         </Box>
//       </GridLayout>
//     </Box>
//   );
// };

// export default Overview;



// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import GridLayout from 'react-grid-layout';
// import { Box, Typography, Button, IconButton, useTheme } from "@mui/material";
// import DragHandleIcon from '@mui/icons-material/DragHandle';
// import { debounce } from 'lodash';

// import RawGasImpurities from "src/component/separator/RawGasImpurities";
// import H2RawGas from "src/component/AuxSystem/H2RawGas";
// import { setLayout } from '../../redux/layoutActions';
// import { tokens } from "../../theme";
// import 'react-grid-layout/css/styles.css';
// import 'react-resizable/css/styles.css';

// const Overview = () => {
//   const dispatch = useDispatch();
//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);

//   // Load dimensions from localStorage or set defaults
//   const getPersistedDimensions = (key, defaultDimensions) =>
//     JSON.parse(localStorage.getItem(key)) || defaultDimensions;

//   const [rawGasDimensions, setRawGasDimensions] = useState(
//     getPersistedDimensions('rawGasDimensions', { width: 500, height: 300 })
//   );
//   const [h2RawGasDimensions, setH2RawGasDimensions] = useState(
//     getPersistedDimensions('h2RawGasDimensions', { width: 500, height: 300 })
//   );

//   const layout = useSelector(
//     (state) => state.layout.customChartsLayout
//   ) || JSON.parse(localStorage.getItem("customChartsLayout")) || [];

//   const saveLayout = debounce((newLayout) => {
//     dispatch(setLayout(newLayout, "custom"));
//     localStorage.setItem("customChartsLayout", JSON.stringify(newLayout));
//   }, 500);

//   // Persist dimensions on resize
//   const persistDimensions = (key, dimensions) => {
//     localStorage.setItem(key, JSON.stringify(dimensions));
//   };

//   return (
//     <Box m="20px">
//       <Box display="flex" justifyContent="space-between" alignItems="center">
//         <Typography variant="h4">Overview</Typography>
//        </Box>
//       <GridLayout
//         className="layout"
//         layout={layout}
//         cols={12} 
//         rowHeight={30}
//         width={1600}
//         onLayoutChange={(newLayout) => dispatch(setLayout(newLayout, "custom"))}
//         onResizeStop={(newLayout, oldItem, newItem) => {
//           if (newItem.i === 'RawGas') {
//             const newDimensions = { width: newItem.w * 160, height: newItem.h * 30 };
//             setRawGasDimensions(newDimensions);
//             persistDimensions('rawGasDimensions', newDimensions);
//           } else if (newItem.i === 'H2RAW') {
//             const newDimensions = { width: newItem.w * 160, height: newItem.h * 30 };
//             setH2RawGasDimensions(newDimensions);
//             persistDimensions('h2RawGasDimensions', newDimensions);
//           }
//           saveLayout(newLayout);
//         }}
//         isResizable
//         isDraggable
//         draggableHandle=".drag-handle"
//       >
//         <Box key="RawGas" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">RAW GAS IMPURITIES</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <RawGasImpurities width={rawGasDimensions.width} height={rawGasDimensions.height} />
//           </Box>
//         </Box>

//         <Box key="H2RAW" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">H2 RAW GAS</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <H2RawGas width={h2RawGasDimensions.width} height={h2RawGasDimensions.height} />
//           </Box>
//         </Box>
//       </GridLayout>
//     </Box>
//   );
// };

// export default Overview;



// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import GridLayout from 'react-grid-layout';
// import { Box, Typography, Button, IconButton, useTheme } from "@mui/material";
// import DragHandleIcon from '@mui/icons-material/DragHandle';
// import { debounce } from 'lodash';
// import RawGasImpurities from "src/component/separator/RawGasImpurities";
// import H2RawGas from "src/component/AuxSystem/H2RawGas";
// import { setLayout } from '../../redux/layoutActions';
// import { tokens } from "../../theme";
// import 'react-grid-layout/css/styles.css';
// import 'react-resizable/css/styles.css';

// const Overview = () => {
//   const dispatch = useDispatch();
//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);

//   // Set default initial dimensions
//   const [rawGasDimensions, setRawGasDimensions] = useState({ width: 500, height: 300 });
//   const [h2RawGasDimensions, setH2RawGasDimensions] = useState({ width: 500, height: 300 });

//   const layout = useSelector(
//     (state) => state.layout.customChartsLayout
//   ) || JSON.parse(localStorage.getItem("customChartsLayout")) || [];

//   const saveLayout = debounce((newLayout) => {
//     dispatch(setLayout(newLayout, "custom"));
//     localStorage.setItem("customChartsLayout", JSON.stringify(newLayout));
//   }, 500);

//   return (
//     <Box m="20px">
//       <Box display="flex" justifyContent="space-between" alignItems="center">
//         <Typography variant="h4">Overview</Typography>
//       </Box>

//       <GridLayout
//         className="layout"
//         layout={layout}
//         cols={12}
//         rowHeight={30}
//         width={1600}
//         onLayoutChange={(newLayout) => dispatch(setLayout(newLayout, "custom"))}
//         onResizeStop={(newLayout, oldItem, newItem) => {
//           if (newItem.i === 'RawGas') {
//             setRawGasDimensions({ width: newItem.w * 160, height: newItem.h * 30 });
//           } else if (newItem.i === 'H2RAW') {
//             setH2RawGasDimensions({ width: newItem.w * 160, height: newItem.h * 30 });
//           }
//           saveLayout(newLayout);
//         }}
//         isResizable
//         isDraggable
//         draggableHandle=".drag-handle"
//       >
//         <Box key="RawGas" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">RAW GAS IMPURITIES</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <RawGasImpurities width={rawGasDimensions.width} height={rawGasDimensions.height} />
//           </Box>
//         </Box>

//         <Box key="H2RAW" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">H2 RAW GAS</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <H2RawGas width={h2RawGasDimensions.width} height={h2RawGasDimensions.height} />
//           </Box>
//         </Box>
//       </GridLayout>
//     </Box>
//   );
// };

// export default Overview;





// Raw gas code only

// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import GridLayout from 'react-grid-layout';
// import { Box, Typography, Button, IconButton, useTheme } from "@mui/material";
// import DragHandleIcon from '@mui/icons-material/DragHandle';
// import { debounce } from 'lodash';

// import RawGasImpurities from "src/component/separator/RawGasImpurities";
// import { setLayout } from '../../redux/layoutActions';
// import { tokens } from "../../theme";
// import 'react-grid-layout/css/styles.css';
// import 'react-resizable/css/styles.css';

// const Overview = () => {
//   const dispatch = useDispatch();
//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);

//   const [rawGasDimensions, setRawGasDimensions] = useState({ width: 0, height: 0 });

//   const layout = useSelector(
//     (state) => state.layout.customChartsLayout
//   ) || JSON.parse(localStorage.getItem("customChartsLayout")) || [];

//   const saveLayout = debounce((newLayout) => {
//     dispatch(setLayout(newLayout, "custom"));
//     localStorage.setItem("customChartsLayout", JSON.stringify(newLayout));
//   }, 500);

//   return (
//     <Box m="20px">
//       <Box display="flex" justifyContent="space-between" alignItems="center">
//         <Typography variant="h4">Overview</Typography>

//       </Box>

//       <GridLayout
//         className="layout"
//         layout={layout}
//         cols={12}
//         rowHeight={30}
//         width={1600}
//         onLayoutChange={(newLayout) => dispatch(setLayout(newLayout, "custom"))}
//         onResizeStop={(newLayout, oldItem, newItem) => {
//           if (newItem.i === 'RawGas') {
//             setRawGasDimensions({ width: newItem.w * 160, height: newItem.h * 30 });
//           }
//           saveLayout(newLayout);
//         }}
//         isResizable
//         isDraggable
//         draggableHandle=".drag-handle"
//       >
//         <Box key="RawGas" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">RAW GAS IMPURITIES</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <RawGasImpurities width={rawGasDimensions.width} height={rawGasDimensions.height} />
//           </Box>
//         </Box>
//       </GridLayout>
//     </Box>
//   );
// };

// export default Overview;



// import React, { useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import GridLayout from 'react-grid-layout';
// import { Box, Typography, useTheme, IconButton, Button } from "@mui/material";
// import { tokens } from "../../theme";
// import Header from "src/component/Header";
// import Separator from "src/component/separator/Separator";
// import Electrolyte from "src/component/Electrolyte/Electrolyte";
// import RawGasImpurities from "src/component/separator/RawGasImpurities";
// import H2RawGas from "src/component/AuxSystem/H2RawGas";
// import H2ProcessGas from "src/component/AuxSystem/H2ProcessGas";
// import RectifierControl from "src/component/separator/RectifierControl";
// import DragHandleIcon from '@mui/icons-material/DragHandle';
// import 'react-grid-layout/css/styles.css';
// import 'react-resizable/css/styles.css';
// import { debounce } from 'lodash';

// import { setLayout } from '../../redux/layoutActions'; // Import Redux actions

// const Overview = () => {

//   const initialLayout = [ 
//     { i: 'Seperator', x: 0, y: 1, w: 2.5, h: 10, minW: 2.5, maxW: 4, minH: 9, maxH: 13 },
//     { i: 'Electrolyte', x: 2.5, y: 0, w: 2.5, h: 10, minW: 2.5, maxW: 4, minH: 9, maxH: 13 },
//     { i: 'RawGas', x: 0, y: 3, w: 5, h: 10, minW: 4.5, maxW: 7, minH: 9, maxH: 13 },
//     { i: 'H2RAW', x: 0, y: 2, w: 3, h: 10.5, minW: 4, maxW: 8, minH: 10, maxH: 13 },
//     { i: 'RECTIFIER', x: 5, y: 0, w: 2, h: 10, minW: 2, maxW: 12, minH: 2, maxH: 15 },
//     { i: 'H2PROCESS', x: 3, y: 1, w: 4, h: 10.5, minW: 4, maxW: 8, minH: 10, maxH: 13 },
//   ];

//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);
//   const dispatch = useDispatch();

//   // Load layout and custom charts from Redux
//   const layout = useSelector((state) => state.layout.customChartsLayout) || JSON.parse(localStorage.getItem("customChartsLayout")) || [];
//   const charts = useSelector((state) => state.layout.customCharts) || JSON.parse(localStorage.getItem("customCharts")) || [];

//   useEffect(() => {
//     // Sync layout from localStorage to Redux state on initial load if layout is empty
//     if (!layout.length) {
//       const savedLayout = JSON.parse(localStorage.getItem("customChartsLayout")) || [];
//       dispatch(setLayout(savedLayout, "custom"));
//     }
//   }, [dispatch, layout.length]);

//   const saveLayout = debounce((newLayout) => {
//     dispatch(setLayout(newLayout, "custom"));
//     localStorage.setItem("customChartsLayout", JSON.stringify(newLayout));
//   }, 500);

//   const resetLayout = () => {
//     localStorage.removeItem("customChartsLayout");
//     dispatch(setLayout(initialLayout, "custom"));
//   };

//   return (
//     <Box m="20px">
//       <Box display="flex" justifyContent="space-between" alignItems="center">
//         <Header title="Overview" subtitle="Welcome to your overview" />
//         <Button variant="contained" color="primary" onClick={resetLayout}>
//           Reset Layout
//         </Button>
//       </Box>

//       <GridLayout
//         className="layout"
//         layout={layout}
//         cols={12}
//         rowHeight={30}
//         width={1600}
//         draggableHandle=".drag-handle"
//         onLayoutChange={(newLayout) => dispatch(setLayout(newLayout, "custom"))}
//         onResizeStop={(newLayout) => saveLayout(newLayout)}
//         onDragStop={(newLayout) => saveLayout(newLayout)}
//         isResizable
//         isDraggable
//       >
//         <Box key="Seperator" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="8px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">SEPARATOR</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <Separator />
//           </Box>
//         </Box>

//         <Box key="Electrolyte" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">ELECTROLYTE</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <Electrolyte />
//           </Box>
//         </Box>

//         <Box key="RawGas" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">RAW GAS IMPURITIES</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <RawGasImpurities />
//           </Box>
//         </Box>

//         <Box key="H2RAW" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">H2 RAW GAS</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <H2RawGas />
//           </Box>
//         </Box>

//         <Box key="H2PROCESS" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">H2 PROCESS GAS</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <H2ProcessGas />
//           </Box>
//         </Box>

//         <Box key="RECTIFIER" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">RECTIFIER CONTROL</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <RectifierControl />
//           </Box>
//         </Box>
//       </GridLayout>
//     </Box>
//   );
// };

// export default Overview;




// import React, { useState, useEffect } from 'react';
// import GridLayout from 'react-grid-layout';
// import { Box, Typography, useTheme, IconButton, Button } from "@mui/material";
// import { tokens } from "../../theme";
// import Header from "src/component/Header";
// import Separator from "src/component/separator/Separator";
// import Electrolyte from "src/component/Electrolyte/Electrolyte";
// import RawGasImpurities from "src/component/separator/RawGasImpurities";
// import H2RawGas from "src/component/AuxSystem/H2RawGas";
// import H2ProcessGas from "src/component/AuxSystem/H2ProcessGas";
// import RectifierControl from "src/component/separator/RectifierControl";
// import DragHandleIcon from '@mui/icons-material/DragHandle';
// import 'react-grid-layout/css/styles.css';
// import 'react-resizable/css/styles.css';
// import { debounce } from 'lodash';

// const Overview = () => {
//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);

//   const initialLayout = [ 
//     { i: 'Seperator', x: 0, y: 1, w: 2.5, h: 10, minW: 2.5, maxW: 4, minH: 9, maxH: 13 },
//     { i: 'Electrolyte', x: 2.5, y: 0, w: 2.5, h: 10, minW: 2.5, maxW: 4, minH: 9, maxH: 13 },
//     { i: 'RawGas', x: 0, y: 3, w: 5, h: 10, minW: 4.5, maxW: 7, minH: 9, maxH: 13 },
//     { i: 'H2RAW', x: 0, y: 2, w: 6, h: 10.5, minW: 4, maxW: 8, minH: 10, maxH: 13 },
//     { i: 'RECTIFIER', x: 5, y: 0, w: 2, h: 10, minW: 2, maxW: 12, minH: 2, maxH: 15 },
//     { i: 'H2PROCESS', x: 5, y: 2, w: 6, h: 10.5, minW: 4, maxW: 8, minH: 10, maxH: 13 },
//   ];

//   const [layout, setLayout] = useState(() => {
//     const savedLayout = localStorage.getItem('overviewLayout');
//     return savedLayout ? JSON.parse(savedLayout) : initialLayout;
//   });

//   const saveLayout = debounce((newLayout) => {
//     localStorage.setItem('overviewLayout', JSON.stringify(newLayout));
//   }, 500);

//   const onLayoutChange = (newLayout) => {
//     setLayout(newLayout);
//     saveLayout(newLayout);
//   };

//   const resetLayout = () => {
//     localStorage.removeItem('overviewLayout');
//     setLayout(initialLayout);
//   };

//   return (
//     <Box m="20px">
//       <Box display="flex" justifyContent="space-between" alignItems="center">
//         <Header title="Overview" subtitle="Welcome to your overview" />
//         <Button variant="contained" color="primary" onClick={resetLayout}>
//         Reset Layout
//       </Button>
//       </Box>

//       <GridLayout
//         className="layout"
//         layout={layout}
//         cols={12}
//         rowHeight={30}
//         width={1600}
//         draggableHandle=".drag-handle"
//         onLayoutChange={onLayoutChange}
//         isResizable={true}
//         isDraggable={true}
//       >
//         <Box key="Seperator" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="8px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">SEPARATOR</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <Separator />
//           </Box>
//         </Box>

//         <Box key="Electrolyte" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">ELECTROLYTE</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <Electrolyte />
//           </Box>
//         </Box>

//         <Box key="RawGas" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">RAW GAS IMPURITIES</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <RawGasImpurities />
//           </Box>
//         </Box>

//         <Box key="H2RAW" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">H2 RAW GAS</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <H2RawGas />
//           </Box>
//         </Box>

//         <Box key="H2PROCESS" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">H2 PROCESS GAS</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <H2ProcessGas />
//           </Box>
//         </Box>

//         <Box key="RECTIFIER" sx={{ backgroundColor: colors.primary[400] }}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">RECTIFIER CONTROL</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <RectifierControl />
//           </Box>
//         </Box>
//       </GridLayout>
//     </Box>
//   );
// };

// export default Overview;



// import React from 'react';
// import GridLayout from 'react-grid-layout';
// import { Box, Typography, useTheme, IconButton } from "@mui/material";
// import { tokens } from "../../theme";
// import Header from "src/component/Header";
// import Separator from "src/component/separator/Separator";
// import Electrolyte from "src/component/Electrolyte/Electrolyte";
// import RawGasImpurities from "src/component/separator/RawGasImpurities";
// import H2RawGas from "src/component/AuxSystem/H2RawGas";
// import H2ProcessGas from "src/component/AuxSystem/H2ProcessGas";
// import RectifierControl from "src/component/separator/RectifierControl";
// import DragHandleIcon from '@mui/icons-material/DragHandle';
// import 'react-grid-layout/css/styles.css';
// import 'react-resizable/css/styles.css';
   

// const Overview = () => {
//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);

//   const layout = [
//     { i: 'Seperator', x: 0, y: 1, w: 2.5, h: 10, minW: 2.5, maxW: 4, minH: 9, maxH: 13 },
//     { i: 'Electrolyte', x: 2.5, y: 0, w: 2.5, h: 10 , minW: 2.5, maxW: 4, minH: 9, maxH: 13},
//     { i: 'RawGas', x: 5, y: 0, w: 5, h: 10 , minW: 4.5, maxW: 7, minH: 9, maxH: 13},
//     { i: 'H2RAW', x: 0, y: 2, w: 6, h: 10.5, minW: 4, maxW: 8, minH: 10, maxH: 13 },
//     { i: 'RECTIFIER', x: 10, y: 0, w: 2, h: 10 , minW: 2, maxW: 12, minH: 2, maxH: 15},
//     { i: 'H2PROCESS', x: 6, y: 3, w: 6, h: 10.5 , minW: 4, maxW: 8, minH: 10, maxH: 13},
    
//   ];

//   return (
//     <Box m="20px">
//       <Box display="flex" justifyContent="space-between" alignItems="center">
//         <Header title="Overview" subtitle="Welcome to your overview" />
//       </Box>

//       <GridLayout
//         className="layout"
//         layout={layout}
//         cols={12}
//         rowHeight={30}
//         width={1600} 
//         draggableHandle=".drag-handle"
//       >
//         <Box key="Seperator" backgroundColor={colors.primary[400]}>
//           <Box display="flex" justifyContent="space-between" p="8px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">SEPARATOR</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <Separator />
//           </Box>
//         </Box>
//         <Box key="Electrolyte" backgroundColor={colors.primary[400]}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">ELECTROLYTE</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <Electrolyte />
//           </Box>
//         </Box>
//         <Box key="RawGas" backgroundColor={colors.primary[400]}>
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">RAW GAS IMPURITIES</Typography>
//           </Box>
//           <Box display="flex" alignItems="center" justifyContent="center" height="100%">
//             <RawGasImpurities />
//           </Box>
//         </Box>

//         <Box key="H2RAW" backgroundColor={colors.primary[400]} padding="5px">
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton> 
//             <Typography variant="h6">H2 RAW GAS</Typography>
//           </Box>
//           <Box height="200px" >
//             <H2RawGas />
//           </Box>
//         </Box>
//         <Box key="H2PROCESS" backgroundColor={colors.primary[400]} padding="5px">
//           <Box display="flex" justifyContent="space-between" p="10px">
//             <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//               <DragHandleIcon />
//             </IconButton>
//             <Typography variant="h6">H2 PROCESS GAS</Typography>
//           </Box>
//           <Box height="200px">
//             <H2ProcessGas />
//           </Box>
//         </Box>

//         <Box key="RECTIFIER" backgroundColor={colors.primary[400]}>
//         <Box display="flex" justifyContent="space-between" p="10px">
//           <IconButton className="drag-handle" style={{ cursor: 'move' }}>
//             <DragHandleIcon />
//           </IconButton>
//           <Typography variant="h6">RECTIFIER CONTROL</Typography>
//         </Box>
//         <Box display="flex" alignItems="center" justifyContent="center" >
//           <RectifierControl />
//         </Box>
//       </Box>
        
//       </GridLayout>
//     </Box>
//   );
// };

// export default Overview;
