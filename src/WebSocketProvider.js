import React, { createContext, useContext, useEffect, useState } from 'react';

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const [data, setData] = useState({
    "CR-FT-001": 0,
    flowPercentage: 0,
    suctionOpen: true,
    dischargeOpen: false,
    "CR-TT-002": 25,
    "RECT-VT-001": 0,  
    "CR-LT-011": 190,
    gasFlowRate: 3.48,
    totalizedFlow: 10,
    h2: 0,
    n2: 0,
    o2: 0,
    h2o: 0,
    graphData: Array(20).fill(0),
    temperatureChange: 0,
    voltageChange: 0,
    'CR-PT-011': 0,
    'CR-LT-021': 150,
    'CR-PT-021': 0,
    'CW-TT-011': 25,
    'CW-TT-021': 25,
    'CR-TT-001': 25,
    'GS-AT-012': 0,
    'GS-AT-022': 0,
    Vy: 0,
    Vb: 0,
    setTargetVoltage: 0,
    setTargetCurrent: 0,
    highLimitVoltage: 0,
    highLimitCurrent: 0,
    risingVoltage: 0,
    risingCurrent: 0,
    fallingVoltage: 0,
    fallingCurrent: 0,
    demandVoltage: 0,
    demandCurrent: 0,
    actualPower: 0,
    "RECT-CT-001": 0,
    "AX-LT-011": 0,
    "AX-LT-021": 0,
    "GS-TT-011": 0,
    "GS-PT-011": 0,
    "GS-PT-021": 0,
    "GS-TT-021": 0,
    "PR-TT-001": 0,
    "PR-TT-061": 0,
    "PR-TT-072": 0,
    "PR-FT-001": 0,
    "PR-AT-001": 0,
    "PR-AT-003": 0,
    "PR-AT-005": 0,
    "DM-LSH-001": 0,
    "DM-LSL-001": 0,
    "GS-LSL-021": 0,
    "GS-LSL-011": 0,
    "PR-VA-301": 0,
    "PR-VA-352": 0,
    "PR-VA-312": 0,
    "PR-VA-351": 0,
    "PR-VA-361Ain": 0,
    "PR-VA-361Aout": 0,
    "PR-VA-361Bin": 0,
    "PR-VA-361Bout": 0,
    "PR-VA-362Ain": 0,
    "PR-VA-362Aout": 0,
    "PR-VA-362Bin": 0,
    "PR-VA-362Bout": 0,
    "N2-VA-311": 0,
    "GS-VA-311": 0,
    "GS-VA-312": 0,
    "N2-VA-321": 0,
    "GS-VA-321": 0,
    "GS-VA-322": 0,
    "GS-VA-022": 0,
    "GS-VA-021": 0,
    "AX-VA-351": 0,
    "AX-VA-311": 0,
    "AX-VA-312": 0,
    "AX-VA-321": 0,
    "AX-VA-322": 0,
    "AX-VA-391": 0,
    "DM-VA-301": 0,
    "DCDB0-VT-001": 0,
    "DCDB0-CT-001": 0,
    "DCDB1-VT-001": 0,
    "DCDB1-CT-001": 0,
    "DCDB2-VT-001": 0,
    "DCDB2-CT-001": 0,
    "DCDB3-VT-001": 0,
    "DCDB3-CT-001": 0,
    "DCDB4-VT-001": 0,
    "DCDB4-CT-001": 0,
    "PLC-TIME-STAMP": 0,
    "Value1" : 0,
    "Value2" :0,
    "Value3" :0,
    "Value4":0,
    "Value5":0,
    "Value6":0,
    "Value7":0,
    "Value8" : 0,
    "Value9" : 0,
    "Value10" :0,
    "Value17" :0,
    "TotalizedFlowProcessGas" :0,
    "TotalizedFlowRawGas": 0,
    "Value18":0,
    "H20PerRawGas" : 0,
    "H2OPPM" : 0,
    "H2PerRawGas" : 0,
    "H2PurityProcessGas": 0,
    "N2PercProcessGas" : 0,
    "timestamp" : 0,
    "N2PerRawsGas" : 0,
    "prftoo1" : 0,
    "CR-TT-002-degC-per-hour": 0
  });

  useEffect(() => {
    // First WebSocket connections
    const ws1 = new WebSocket('wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/');
    
    // Second WebSocket connection
    const ws2 = new WebSocket('wss://fq7qduf1ia.execute-api.us-east-1.amazonaws.com/dev/');

    const handleMessage = (event) => {
      const message = JSON.parse(event.data);
      // Merge data from both WebSocket connections
      setData((prevData) => ({
        ...prevData,
        ...message,
      }));
    };

    ws1.onopen = () => {
      console.log('WebSocket 1 connection established');
    };

    ws1.onmessage = handleMessage;

    ws1.onerror = (error) => {
      console.error('WebSocket 1 error:', error);
    };

    ws1.onclose = () => {
      console.log('WebSocket 1 connection closed');
    };

    ws2.onopen = () => {
      console.log('WebSocket 2 connection established');
    };

    ws2.onmessage = handleMessage;

    ws2.onerror = (error) => {
      console.error('WebSocket 2 error:', error);
    };

    ws2.onclose = () => {
      console.log('WebSocket 2 connection closed');
    };

    return () => {
      ws1.close();
      ws2.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={data}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);



// import React, { createContext, useContext, useEffect, useState } from 'react';

// const WebSocketContext = createContext();

// export const WebSocketProvider = ({ children }) => {
//   const [data, setData] = useState({
//     "CR-FT-001": 0,
//     flowPercentage: 0,
//     suctionOpen: true,
//     dischargeOpen: false,
//     "CR-TT-002": 25,
//     "RECT-VT-001": 0,  
//     "CR-LT-011": 190,
//     gasFlowRate: 3.48,
//     totalizedFlow: 10,
//     h2: 0,
//     n2: 0,
//     o2: 0,
//     h2o: 0,
//     graphData: Array(20).fill(0),
//     temperatureChange: 0,
//     voltageChange: 0,
//     'CR-PT-011': 0,
//     'CR-LT-021': 150,
//     'CR-PT-021': 0,
//     'CW-TT-011': 25,
//     'CR-TT-001': 25,
//     'GS-AT-012': 0,
//     'GS-AT-022': 0,
//     Vy: 0,
//     Vb: 0,
//     setTargetVoltage: 0,
//     setTargetCurrent: 0,
//     highLimitVoltage: 0,
//     highLimitCurrent: 0,
//     risingVoltage: 0,
//     risingCurrent: 0,
//     fallingVoltage: 0,
//     fallingCurrent: 0,
//     demandVoltage: 0,
//     demandCurrent: 0,
//     actualPower: 0,
//     "RECT-CT-001": 0,
//     "AX-LT-011": 99,
//     "AX-LT-021": 0,
//     "GS-TT-011": 0,
//     "GS-PT-011": 0,
//     "GS-PT-021": 0,
//     "GS-TT-021": 0,
//     "PR-TT-001": 0,
//     "PR-TT-061": 0,
//     "PR-TT-072": 0,
//     "PR-FT-001": 0,
//     "PR-AT-001": 0,
//     "PR-AT-003": 0,
//     "PR-AT-005": 0,
//     "DM-LSH-001": 0,
//     "DM-LSL-001": 0,
//     "GS-LSL-021": 0,
//     "GS-LSL-011": 0,
//     "PR-VA-301": 0,
//     "PR-VA-352": 0,
//     "PR-VA-312": 0,
//     "PR-VA-351": 0,
//     "PR-VA-361Ain": 0,
//     "PR-VA-361Aout": 0,
//     "PR-VA-361Bin": 0,
//     "PR-VA-361Bout": 0,
//     "PR-VA-362Ain": 0,
//     "PR-VA-362Aout": 0,
//     "PR-VA-362Bin": 0,
//     "PR-VA-362Bout": 0,
//     "N2-VA-311": 0,
//     "GS-VA-311": 0,
//     "GS-VA-312": 0,
//     "N2-VA-321": 0,
//     "GS-VA-321": 0,
//     "GS-VA-322": 0,
//     "GS-VA-022": 0,
//     "GS-VA-021": 0,
//     "AX-VA-351": 0,
//     "AX-VA-311": 0,
//     "AX-VA-312": 0,
//     "AX-VA-321": 0,
//     "AX-VA-322": 0,
//     "AX-VA-391": 0,
//     "DM-VA-301": 0,
//     "DCDB0-VT-001": 0,
//     "DCDB0-CT-001": 0,
//     "DCDB1-VT-001": 0,
//     "DCDB1-CT-001": 0,
//     "DCDB2-VT-001": 0,
//     "DCDB2-CT-001": 0,
//     "DCDB3-VT-001": 0,
//     "DCDB3-CT-001": 0,
//     "DCDB4-VT-001": 0,
//     "DCDB4-CT-001": 0,
//     "PLC-TIME-STAMP": 0,
//     "Value1" : 0,
   
//   });

//   useEffect(() => {
//     const ws = new WebSocket('wss://otiq3un7zb.execute-api.us-east-1.amazonaws.com/dev/');

//     ws.onopen = () => {
//       console.log('WebSocket connection established'); 
//     };

//     ws.onmessage = (event) => {
//       const message = JSON.parse(event.data);
//       // console.log('Message received:', message);

//       setData((prevData) => ({
//         ...prevData,
//         ...message,
//       }));
//     };

//     ws.onerror = (error) => {
//       console.error('WebSocket error:', error);
//     };

//     ws.onclose = () => {
//       console.log('WebSocket connection closed');
//     };

//     return () => {
//       ws.close();
//     };
//   }, []);

//   return (
//     <WebSocketContext.Provider value={data}>
//       {children}
//     </WebSocketContext.Provider>
//   );
// };

// export const useWebSocket = () => useContext(WebSocketContext);






