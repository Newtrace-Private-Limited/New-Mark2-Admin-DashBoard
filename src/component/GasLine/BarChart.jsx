import React, { Component } from "react";
import CanvasJSReact from "@canvasjs/react-charts";

const CanvasJS = CanvasJSReact.CanvasJS;
const CanvasJSChart = CanvasJSReact.CanvasJSChart;
const apiUrl =
  "http://43.205.24.112:8000/path1?startdate=2024-04-02&enddate=2024-04-08&start_time=00:48:00&end_time=00:50:00";

class BarChart extends Component {
  constructor() {
    super();
    this.state = {
      dataPoints: [
        { label: "PR-AT-005", y: 0 },
        { label: "PR-VA-362Ain", y: 0 },
        { label: "PR-AT-001", y: 0 },
        { label: "CW-TT-021", y: 0 },
      ],
    };
  }

  componentDidMount() {
    this.updateChart();
    setInterval(this.updateChart, 1000); // Update every 10 seconds
  }

  updateChart = () => {
    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Fetched data:", data);
        const newDataPoints = data.map((item) => ({
          label: item["PLC-TIME-STAMP"],
          y: item["CW-TT-021"],
        }));
        console.log("New data points:", newDataPoints);
        this.setState({ dataPoints: newDataPoints });
      })
      .catch((error) => console.error("Error fetching data:", error));
  };

  render() {
    const customGreyTheme = {
      colorSet: "grey", // Define a custom color set
      backgroundColor: "transparent",
      theme: "light2",
      axisX: {
        lineColor: "#666666",
        labelFontColor: "#666666",
        tickColor: "#666666",
      },
      axisY: {
        lineColor: "#666666",
        labelFontColor: "#666666",
        tickColor: "#666666",
      },
    };

    const options = {
      ...customGreyTheme,
      title: {
        text: "CPU Usage",
      },
      subtitles: [
        {
          text: "Intel Core i7 980X @ 3.33GHz",
        },
      ],
      axisY: {
        title: "CPU Usage (%)",
        includeZero: true,
        suffix: "%",
        maximum: 100,
      },
      data: [
        {
          type: "column",
          yValueFormatString: "#,###'%'",
          indexLabel: "{y}",
          dataPoints: this.state.dataPoints,
        },
      ],
    };

    return (
      <div>
        <CanvasJSChart options={options} />
      </div>
    );
  }
}

export default BarChart;


// import React, { useEffect, useState } from "react";

// const ElectrolyteFlow = () => {
//   const [value, setValue] = useState(0);

//   useEffect(() => {
//     const ws = new WebSocket('wss://j3ffd3pw0l.execute-api.us-east-1.amazonaws.com/dev/');

//     ws.onopen = () => {
//       console.log('WebSocket connection established');
//     };

//     ws.onmessage = (event) => {
//       const message = JSON.parse(event.data);
//       console.log('Message received:', message);

//       if (message['PR-AT-005'] !== undefined) {
//         setValue(message['PR-AT-005']);
//       }
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
//     <div style={{ position: "relative" }}>
//       <h2 style={{ textAlign: "center" }}>{value.toFixed(4)} L/min</h2>
//       <div style={{ width: '250px', height: '60px', position: 'relative' }}>
//         <div
//           style={{
//             width: `${value}%`,
//             height: '100%',
//             backgroundColor: '#69f0ae',
//             position: 'absolute',
//             top: 0,
//             left: 0,
//           }}
//         ></div>
//         <div
//           style={{
//             position: 'absolute',
//             top: '50%',
//             left: '50%',
//             transform: 'translate(-50%, -50%)',
//             fontWeight: 'bold',
//           }}
//         >
//           {value.toFixed(4)}%
//         </div>
//       </div>
//       <h2 style={{ textAlign: "end" }}>{value.toFixed(4)} degC</h2>
//       <h2 className="">Flow Control</h2>
//       <h2 style={{ textAlign: "end" }}>{value.toFixed(4)} degC</h2>
//       <h2 style={{ textAlign: "end" }}>{value.toFixed(4)} degC</h2>
//       <h2 style={{ textAlign: "end" }}>{value.toFixed(4)} degC</h2>
//     </div>
//   );
// };

// export default ElectrolyteFlow;
