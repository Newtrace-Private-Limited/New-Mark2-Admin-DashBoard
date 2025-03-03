// src/context/DashboardContext.js
import React, { createContext, useContext, useState } from 'react';

const DashboardContext = createContext();

export const useDashboard = () => {
  return useContext(DashboardContext);
};

export const DashboardProvider = ({ children }) => {
  const [dashboardState, setDashboardState] = useState({
    emailsSent: { title: "12,361", subtitle: "Emails Sent", progress: "0.75", increase: "+14%" },
    salesObtained: { title: "431,225", subtitle: "Sales Obtained", progress: "0.50", increase: "+21%" },
    newClients: { title: "32,441", subtitle: "New Clients", progress: "0.30", increase: "+5%" },
    trafficReceived: { title: "1,325,134", subtitle: "Traffic Received", progress: "0.80", increase: "+43%" },
    revenueGenerated: { title: "$59,342.32", subtitle: "Revenue Generated" },
    recentTransactions: [],
    campaign: { revenue: "$48,352", description: "Includes extra misc expenditures and costs" },
    salesQuantity: {},
    geographyBasedTraffic: {},
  });

  const value = { dashboardState, setDashboardState };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};
