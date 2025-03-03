import Header from "../../component/Header";
import CustomeChart from "../../component/Graphas/CustomeChart";
import { Box } from "@mui/material";

const CustomeCharts = () => {
  return (
    <Box m="15px" mt="-60px">
      <Header title="Custome Analytics" subtitle="Welcome to your Custome Analytics" />
      <Box height="75vh">
        <CustomeChart />
      </Box>
    </Box>
  );
};

export default CustomeCharts;
