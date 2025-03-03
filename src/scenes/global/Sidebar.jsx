import {useEffect, useRef, useState } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, Button, IconButton, Typography, useTheme } from "@mui/material";
import { Link } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../theme";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import DatasetIcon from "@mui/icons-material/DatasetOutlined";
import TableChartIcon from '@mui/icons-material/TableChart';
import DashboardIcon from '@mui/icons-material/Dashboard';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';
import StackedLineChartIcon from '@mui/icons-material/StackedLineChart';
import TroubleshootIcon from '@mui/icons-material/Troubleshoot';
const Item = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <MenuItem
      active={selected === title}
      style={{
        color: colors.grey[100],
      }}
      onClick={() => setSelected(title)}
      icon={icon}
    >
      <Typography>{title}</Typography>
      <Link to={to} />
    </MenuItem>
  );
};
const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(localStorage.getItem('imagePreview') || null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const savedFile = localStorage.getItem('selectedFile');
    if (savedFile) {
      setSelectedFile(JSON.parse(savedFile));
    }
  }, []);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageDataUrl = reader.result;
        setPreview(imageDataUrl);
        localStorage.setItem('imagePreview', imageDataUrl);
        localStorage.setItem('selectedFile', JSON.stringify(file));
      };
      reader.readAsDataURL(file);
      await handleUpload(file); // Immediately upload the file
    }
  };

  const handleUpload = async (file) => {
    if (!file) {
      alert("No file selected!");
      return;
    }
    // Perform the upload action here, e.g., send the file to a server
    // Example using fetch:
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/upload-endpoint', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        console.log("File uploaded successfully");
      } else {
        console.error("File upload failed");
      }
    } catch (error) {
      console.error("Error during file upload:", error);
    }
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  return (
    <Box
    height={910}
      sx={{
        "& .pro-sidebar-inner": {
          background: `${colors.primary[400]} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .pro-inner-item:hover": {
          color: "#868dfb !important",
        },
        "& .pro-menu-item.active": {
          color: "#6870fa !important",
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          {/* LOGO AND MENU ICON */}
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color: colors.grey[100],
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <Typography variant="h3" color={colors.grey[100]}>
                  Hello Newtrace
                </Typography>
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {!isCollapsed && (
            <Box mb="25px">
            <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
            <Typography variant="h5" gutterBottom>
              Upload an Image
            </Typography>
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleFileChange}
              ref={fileInputRef}
            />
            {!selectedFile && (
              <Button
                variant="contained"
                component="label"
                startIcon={<UploadFileIcon />}
              >
                Select Image
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFileChange}
                />
              </Button>
            )}
            {preview && (
              <Box mt={2} textAlign="center">
                <img
                  src={preview}
                  alt="Selected"
                  style={{
                    width: '150px',
                    height: '150px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    cursor: 'pointer',
                  }}
                  onClick={handleImageClick}
                />
              </Box>
            )}
          </Box>
              <Box textAlign="center">
                <Typography
                  variant="h2"
                  color={colors.grey[100]}
                  fontWeight="bold"
                  sx={{ m: "10px 0 0 0" }}
                >
                  Newtrace  
                </Typography>

              </Box>
            </Box>
          )}

          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
       
            <Item
              title="Overview"
              to="/"
              icon={<DashboardIcon />}
              selected={selected}
              setSelected={setSelected}
            /> 
            <Item
              title="Report"
              to="/report"
              icon={<TroubleshootIcon/>}
              selected={selected}
              setSelected={setSelected}
            /> 
            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Data
            </Typography>
            <Item
              title="Real Time Data Table"
              to="/realtime"
              icon={<TableChartIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            <Item
              title="Historical Data Table"
              to="/stackdata"
              icon={<DatasetIcon />}
              selected={selected}
              setSelected={setSelected}
            /> 
            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Visual Analytics
            </Typography>
            <Item
              title="Real time Analytics"
              to="/CustomeChart"
              icon={<TimelineOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
            title="Historical Line Analytics"
            to="/HistoricalLineCharts"
            icon={<StackedLineChartIcon />}
            selected={selected}
            setSelected={setSelected}
          />
            <Item
            title="Historical Scatter Analytics"
            to="/HistoricalScatterCharts"
            icon={<ScatterPlotIcon />}
            selected={selected}
            setSelected={setSelected}
          />
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
