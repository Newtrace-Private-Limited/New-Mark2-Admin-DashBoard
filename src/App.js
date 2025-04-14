import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import Prediction from "./scenes/HistoricalScatterCharts";
import Analytics from "./scenes/analytics";
import Stackdata from "./scenes/stackdata";
import Report from "./scenes/Report";
import TestingData from "./scenes/testingdata";
import CustomeChart from "./scenes/CustomeChart";
import FAQ from "./scenes/faq";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import Schedular from "./scenes/schedular";
import Overview from "./scenes/overview";
import TimeSeries from "./scenes/HistoricalLineCharts";
import RealTime from "./scenes/realtime";
import Bar from "./scenes/bar";
import Line from "./scenes/line";
import { WebSocketProvider } from "./WebSocketProvider";
import { DashboardProvider } from "./context/DashboardContext";

import store from "./redux/store";

function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  return (
       <WebSocketProvider store={store}>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <DashboardProvider>
            <div className="app">
              <Sidebar isSidebar={isSidebar} />
              <main className="content">
                <Topbar setIsSidebar={setIsSidebar} />  
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/" element={<Overview />} />
                  <Route path="/realtime" element={<RealTime />} />
                  <Route path="/HistoricalScatterCharts" element={<Prediction />} />
                  <Route path="/stackdata" element={<Stackdata />} />
                  <Route path="/HistoricalLineCharts" element={<TimeSeries />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/report" element={<Report />} />
                  <Route path="/testingdata" element={<TestingData />} />
                  <Route path="/bar" element={<Bar />} />
                  <Route path="/CustomeChart" element={<CustomeChart />} />
                  <Route path="/line" element={<Line />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/schedular" element={<Schedular />} />
                </Routes>
              </main>
            </div>
          </DashboardProvider>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </WebSocketProvider>
   
  );
}

export default App;
