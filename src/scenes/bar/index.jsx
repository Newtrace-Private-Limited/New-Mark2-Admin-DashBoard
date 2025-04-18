import Barcharts from "src/component/Graphas/BarCharts";
import Header from "../../component/Header";
import { Box } from "@mui/material";

const Bar = () => {
  return (
    <Box m="20px">
      <Header title="Bar Chart" subtitle="Simple Bar Chart" />
      <Box height="75vh">    
        <Barcharts />
      </Box>
    </Box>
  );
};

export default Bar;

