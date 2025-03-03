
import React from 'react'
import { Box } from "@mui/material";
import Barcharts from 'src/component/Graphas/BarCharts'
import Header from 'src/component/Header';


const index = () => {
  return (
    <Box m="20px">
      <Header title="Pie Chart" subtitle="Simple Pie Chart" />
      <Box height="75vh">
        <Barcharts/>
      </Box>
    </Box>
  )
}

export default index
