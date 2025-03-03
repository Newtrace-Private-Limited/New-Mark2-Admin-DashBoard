import LineCharts from "src/component/Graphas/LineChart";
import Header from "../../component/Header";
import { Box } from "@mui/material";

const Line = () => {
  return (
    <Box m="20px">
      <Header title="Line Chart" subtitle="Simple Line Chart" />
      <Box height="75vh">
        <LineCharts />
      </Box>
    </Box>
  );
};

export default Line;
