import { SET_LAYOUT, ADD_CHART, REMOVE_CHART, UPDATE_CHART } from "./layoutActions";

const initialState = {
  // Charts data
  scatterCharts: JSON.parse(localStorage.getItem("scatterCharts")) || [],
  historicalCharts: JSON.parse(localStorage.getItem("historicalCharts")) || [],
  customCharts: JSON.parse(localStorage.getItem("customCharts")) || [],
  overviewCharts: JSON.parse(localStorage.getItem("overviewCharts")) || [],

  // Layouts
  scatterLayout: JSON.parse(localStorage.getItem("scatterChartsLayout")) || [],
  historicalLayout: JSON.parse(localStorage.getItem("historicalChartsLayout")) || [],
  customChartsLayout: JSON.parse(localStorage.getItem("customChartsLayout")) || [],
  overviewChartsLayoutLarge: JSON.parse(localStorage.getItem("overviewChartsLayoutLarge")) || [], // Large screen layout
  overviewChartsLayoutSmall: JSON.parse(localStorage.getItem("overviewChartsLayoutSmall")) || [], // Small screen layout
};

const layoutReducer = (state = initialState, action) => {
  const { chartType, layout, isLargeScreen } = action.payload || {};

  switch (action.type) {
    case SET_LAYOUT: {
      // Handle Overview layouts for different screen sizes
      if (chartType === "overview") {
        const layoutKey = isLargeScreen
          ? "overviewChartsLayoutLarge"
          : "overviewChartsLayoutSmall";

        // Save the layout to localStorage
        localStorage.setItem(layoutKey, JSON.stringify(layout));

        // Update state
        return {
          ...state,
          [layoutKey]: layout,
        };
      }

      // Handle other chart types (if needed)
      const layoutKey =
        chartType === "scatter"
          ? "scatterLayout"
          : chartType === "historical"
          ? "historicalLayout"
          : chartType === "custom"
          ? "customChartsLayout"
          : null;

      if (!layoutKey) return state;

      localStorage.setItem(layoutKey, JSON.stringify(layout));

      return {
        ...state,
        [layoutKey]: layout,
      };
    }

    case ADD_CHART: {
      const chartsKey =
        chartType === "scatter"
          ? "scatterCharts"
          : chartType === "historical"
          ? "historicalCharts"
          : chartType === "custom"
          ? "customCharts"
          : chartType === "overview"
          ? "overviewCharts"
          : null;

      if (!chartsKey) return state;

      const updatedCharts = [...state[chartsKey], action.payload.chart];
      localStorage.setItem(chartsKey, JSON.stringify(updatedCharts));

      return {
        ...state,
        [chartsKey]: updatedCharts,
      };
    }

    case REMOVE_CHART: {
      const chartsKey =
        chartType === "scatter"
          ? "scatterCharts"
          : chartType === "historical"
          ? "historicalCharts"
          : chartType === "custom"
          ? "customCharts"
          : chartType === "overview"
          ? "overviewCharts"
          : null;

      const layoutKey =
        chartType === "scatter"
          ? "scatterLayout"
          : chartType === "historical"
          ? "historicalLayout"
          : chartType === "custom"
          ? "customChartsLayout"
          : chartType === "overview"
          ? isLargeScreen
            ? "overviewChartsLayoutLarge"
            : "overviewChartsLayoutSmall"
          : null;

      if (!chartsKey || !layoutKey) return state;

      const updatedCharts = state[chartsKey].filter(
        (chart) => chart.id !== action.payload.chartId
      );
      const updatedLayout = state[layoutKey].filter(
        (layoutItem) => layoutItem.i !== action.payload.chartId.toString()
      );

      localStorage.setItem(chartsKey, JSON.stringify(updatedCharts));
      localStorage.setItem(layoutKey, JSON.stringify(updatedLayout));

      return {
        ...state,
        [chartsKey]: updatedCharts,
        [layoutKey]: updatedLayout,
      };
    }

    case UPDATE_CHART: {
      const chartsKey =
        chartType === "scatter"
          ? "scatterCharts"
          : chartType === "historical"
          ? "historicalCharts"
          : chartType === "custom"
          ? "customCharts"
          : chartType === "overview"
          ? "overviewCharts"
          : null;

      if (!chartsKey) return state;

      const updatedCharts = state[chartsKey].map((chart) =>
        chart.id === action.payload.updatedChart.id
          ? action.payload.updatedChart
          : chart
      );

      localStorage.setItem(chartsKey, JSON.stringify(updatedCharts));

      return {
        ...state,
        [chartsKey]: updatedCharts,
      };
    }

    default:
      return state;
  }
};

export default layoutReducer;




// import { SET_LAYOUT, ADD_CHART, REMOVE_CHART, UPDATE_CHART } from "./layoutActions";

// const initialState = {
//   // Charts data
//   scatterCharts: JSON.parse(localStorage.getItem("scatterCharts")) || [],
//   historicalCharts: JSON.parse(localStorage.getItem("historicalCharts")) || [],
//   customCharts: JSON.parse(localStorage.getItem("customCharts")) || [],
//   overviewCharts: JSON.parse(localStorage.getItem("overviewCharts")) || [],

//   // Layouts for large and small screens
//   scatterLayoutLarge: JSON.parse(localStorage.getItem("scatterLayoutLarge")) || [],
//   scatterLayoutSmall: JSON.parse(localStorage.getItem("scatterLayoutSmall")) || [],
//   historicalLayoutLarge: JSON.parse(localStorage.getItem("historicalLayoutLarge")) || [],
//   historicalLayoutSmall: JSON.parse(localStorage.getItem("historicalLayoutSmall")) || [],
//   customChartsLayoutLarge: JSON.parse(localStorage.getItem("customChartsLayoutLarge")) || [],
//   customChartsLayoutSmall: JSON.parse(localStorage.getItem("customChartsLayoutSmall")) || [],
//   overviewChartsLayoutLarge: JSON.parse(localStorage.getItem("overviewChartsLayoutLarge")) || [],
//   overviewChartsLayoutSmall: JSON.parse(localStorage.getItem("overviewChartsLayoutSmall")) || [],
// };

// const layoutReducer = (state = initialState, action) => {
//   const { chartType, layout, isLargeScreen } = action.payload || {};
//   const layoutKeySuffix = isLargeScreen ? "Large" : "Small";

//   switch (action.type) {
//     case SET_LAYOUT: {
//       const layoutKey = 
//         chartType === "scatter" ? `scatterLayout${layoutKeySuffix}` :
//         chartType === "historical" ? `historicalLayout${layoutKeySuffix}` :
//         chartType === "custom" ? `customChartsLayout${layoutKeySuffix}` :
//         chartType === "overview" ? `overviewChartsLayout${layoutKeySuffix}` :
//         null;

//       if (!layoutKey) return state;

//       // Save layout to localStorage
//       localStorage.setItem(layoutKey, JSON.stringify(layout));

//       // Update state
//       return {
//         ...state,
//         [layoutKey]: layout,
//       };
//     }
//     case ADD_CHART: {
//       const chartsKey =
//         chartType === "scatter" ? "scatterCharts" :
//         chartType === "historical" ? "historicalCharts" :
//         chartType === "custom" ? "customCharts" :
//         chartType === "overview" ? "overviewCharts" :
//         null;

//       if (!chartsKey) return state;

//       const updatedCharts = [...state[chartsKey], action.payload.chart];
//       localStorage.setItem(chartsKey, JSON.stringify(updatedCharts));

//       return {
//         ...state,
//         [chartsKey]: updatedCharts,
//       };
//     }
//     case REMOVE_CHART: {
//       const chartsKey =
//         chartType === "scatter" ? "scatterCharts" :
//         chartType === "historical" ? "historicalCharts" :
//         chartType === "custom" ? "customCharts" :
//         chartType === "overview" ? "overviewCharts" :
//         null;

//       const layoutKey =
//         chartType === "scatter" ? `scatterLayout${layoutKeySuffix}` :
//         chartType === "historical" ? `historicalLayout${layoutKeySuffix}` :
//         chartType === "custom" ? `customChartsLayout${layoutKeySuffix}` :
//         chartType === "overview" ? `overviewChartsLayout${layoutKeySuffix}` :
//         null;

//       if (!chartsKey || !layoutKey) return state;

//       // Filter out the chart and its layout
//       const updatedCharts = state[chartsKey].filter((chart) => chart.id !== action.payload.chartId);
//       const updatedLayout = state[layoutKey].filter((layout) => layout.i !== action.payload.chartId.toString());

//       localStorage.setItem(chartsKey, JSON.stringify(updatedCharts));
//       localStorage.setItem(layoutKey, JSON.stringify(updatedLayout));

//       return {
//         ...state,
//         [chartsKey]: updatedCharts,
//         [layoutKey]: updatedLayout,
//       };
//     }

//     case UPDATE_CHART: {
//       const chartsKey =
//         chartType === "scatter" ? "scatterCharts" :
//         chartType === "historical" ? "historicalCharts" :
//         chartType === "custom" ? "customCharts" :
//         chartType === "overview" ? "overviewCharts" :
//         null;

//       if (!chartsKey) return state;

//       const updatedCharts = state[chartsKey].map((chart) =>
//         chart.id === action.payload.updatedChart.id ? action.payload.updatedChart : chart
//       );

//       localStorage.setItem(chartsKey, JSON.stringify(updatedCharts));

//       return {
//         ...state,
//         [chartsKey]: updatedCharts,
//       };
//     }

//     default:
//       return state;
//   }
// };

// export default layoutReducer;




// import { SET_LAYOUT, ADD_CHART, REMOVE_CHART, UPDATE_CHART } from "./layoutActions";

// const initialState = {
//   scatterCharts: JSON.parse(localStorage.getItem("scatterCharts")) || [],
//   historicalCharts: JSON.parse(localStorage.getItem("historicalCharts")) || [],
//   customCharts: JSON.parse(localStorage.getItem("customCharts")) || [],
//   overviewCharts: JSON.parse(localStorage.getItem("overviewCharts")) || [],

//   scatterLayout: JSON.parse(localStorage.getItem("scatterChartsLayout")) || [],
//   historicalLayout: JSON.parse(localStorage.getItem("historicalChartsLayout")) || [],
//   customChartsLayout: JSON.parse(localStorage.getItem("customChartsLayout")) || [],
//   overviewChartsLayout: JSON.parse(localStorage.getItem("overviewChartsLayout")) || [],
// };

// const layoutReducer = (state = initialState, action) => {
//   const { chartType } = action.payload || {};

//   switch (action.type) {
//     case SET_LAYOUT: {
//       const layoutKey =
//         chartType === "scatter" ? "scatterLayout" :
//         chartType === "historical" ? "historicalLayout" :
//         chartType === "custom" ? "customChartsLayout" :
//         chartType === "overview" ? "overviewChartsLayout" :
//         null;

//       if (!layoutKey) return state;

//       localStorage.setItem(layoutKey, JSON.stringify(action.payload.layout));

//       return {
//         ...state,
//         [layoutKey]: action.payload.layout,
//       };
//     }

//     case ADD_CHART: {
//       const chartsKey =
//         chartType === "scatter" ? "scatterCharts" :
//         chartType === "historical" ? "historicalCharts" :
//         chartType === "custom" ? "customCharts" :
//         chartType === "overview" ? "overviewCharts" :
//         null;

//       if (!chartsKey) return state;

//       const updatedCharts = [...state[chartsKey], action.payload.chart];
//       localStorage.setItem(chartsKey, JSON.stringify(updatedCharts));

//       return {
//         ...state,
//         [chartsKey]: updatedCharts,
//       };
//     }

//     case REMOVE_CHART: {
//       const chartsKey =
//         chartType === "scatter" ? "scatterCharts" :
//         chartType === "historical" ? "historicalCharts" :
//         chartType === "custom" ? "customCharts" :
//         chartType === "overview" ? "overviewCharts" :
//         null;

//       const layoutKey =
//         chartType === "scatter" ? "scatterLayout" :
//         chartType === "historical" ? "historicalLayout" :
//         chartType === "custom" ? "customChartsLayout" :
//         chartType === "overview" ? "overviewChartsLayout" :
//         null;

//       if (!chartsKey || !layoutKey) return state;

//       const updatedCharts = state[chartsKey].filter((chart) => chart.id !== action.payload.chartId);
//       const updatedLayout = state[layoutKey].filter((layout) => layout.i !== action.payload.chartId.toString());

//       localStorage.setItem(chartsKey, JSON.stringify(updatedCharts));
//       localStorage.setItem(layoutKey, JSON.stringify(updatedLayout));

//       return {
//         ...state,
//         [chartsKey]: updatedCharts,
//         [layoutKey]: updatedLayout,
//       };
//     }

//     case UPDATE_CHART: {
//       const chartsKey =
//         chartType === "scatter" ? "scatterCharts" :
//         chartType === "historical" ? "historicalCharts" :
//         chartType === "custom" ? "customCharts" :
//         chartType === "overview" ? "overviewCharts" :
//         null;

//       if (!chartsKey) return state;

//       const updatedCharts = state[chartsKey].map((chart) =>
//         chart.id === action.payload.updatedChart.id ? action.payload.updatedChart : chart
//       );

//       localStorage.setItem(chartsKey, JSON.stringify(updatedCharts));

//       return {
//         ...state,
//         [chartsKey]: updatedCharts,
//       };
//     }

//     default:
//       return state;
//   }
// };

// export default layoutReducer;



// // layoutReducer.js
// import { SET_LAYOUT, ADD_CHART, REMOVE_CHART, UPDATE_CHART } from "./layoutActions";

// const initialState = {
//   scatterCharts: JSON.parse(localStorage.getItem("scatterCharts")) || [],
//   historicalCharts: JSON.parse(localStorage.getItem("historicalCharts")) || [],
//   customCharts: JSON.parse(localStorage.getItem("customCharts")) || [],
//   scatterLayout: JSON.parse(localStorage.getItem("scatterChartsLayout")) || [],
//   historicalLayout: JSON.parse(localStorage.getItem("historicalChartsLayout")) || [],
//   customChartsLayout: JSON.parse(localStorage.getItem("customChartsLayout")) || [], // Added for custom charts
// };

// const layoutReducer = (state = initialState, action) => {
//   const { chartType } = action.payload || {};

//   switch (action.type) {
//     case SET_LAYOUT: {
//       const layoutKey = chartType === "scatter" ? "scatterLayout" :
//                         chartType === "historical" ? "historicalLayout" :
//                         chartType === "customCharts" ? "customChartsLayout" :
//                         "overviewChartsLayout";
//       localStorage.setItem(layoutKey, JSON.stringify(action.payload.layout));
//       return {
//         ...state,
//         [layoutKey]: action.payload.layout,
//       };
//     }
    

//     case ADD_CHART: {
//       const chartsKey = chartType === "scatter" ? "scatterCharts" :
//                         chartType === "historical" ? "historicalCharts" :
//                         "customCharts";
//       const updatedCharts = [...state[chartsKey], action.payload.chart];
//       localStorage.setItem(chartsKey, JSON.stringify(updatedCharts));

//       return {
//         ...state,
//         [chartsKey]: updatedCharts,
//       };
//     }

//     case REMOVE_CHART: {
//       const chartsKey = chartType === "scatter" ? "scatterCharts" :
//                         chartType === "historical" ? "historicalCharts" :
//                         "customCharts"; 
//       const updatedCharts = state[chartsKey].filter((chart) => chart.id !== action.payload.chartId);
//       localStorage.setItem(chartsKey, JSON.stringify(updatedCharts));

//       const layoutKey = chartType === "scatter" ? "scatterLayout" :
//                         chartType === "historical" ? "historicalLayout" :
//                         "customChartsLayout";
//       const updatedLayout = state[layoutKey].filter((layout) => layout.i !== action.payload.chartId.toString());
//       localStorage.setItem(layoutKey, JSON.stringify(updatedLayout));

//       return {
//         ...state,
//         [chartsKey]: updatedCharts,
//         [layoutKey]: updatedLayout,
//       };
//     }

//     case UPDATE_CHART: {
//       const chartsKey = chartType === "scatter" ? "scatterCharts" :
//                         chartType === "historical" ? "historicalCharts" :
//                         "customCharts";
//       const updatedCharts = state[chartsKey].map((chart) =>
//         chart.id === action.payload.updatedChart.id ? action.payload.updatedChart : chart
//       );
//       localStorage.setItem(chartsKey, JSON.stringify(updatedCharts));

//       return {
//         ...state,
//         [chartsKey]: updatedCharts,
//       };
//     }

//     default:
//       return state;
//   }
// };

// export default layoutReducer;


// // layoutReducer.js
// import { SET_LAYOUT, ADD_CHART, REMOVE_CHART, UPDATE_CHART } from "./layoutActions";

// const initialState = {
//   scatterCharts: JSON.parse(localStorage.getItem("scatterCharts")) || [],
//   historicalCharts: JSON.parse(localStorage.getItem("historicalCharts")) || [],
//   customCharts: JSON.parse(localStorage.getItem("customCharts")) || [],
//   scatterLayout: JSON.parse(localStorage.getItem("scatterChartsLayout")) || [],
//   historicalLayout: JSON.parse(localStorage.getItem("historicalChartsLayout")) || [],
//   customChartsLayout: JSON.parse(localStorage.getItem("customChartsLayout")) || [], // Added for custom charts
// };

// const layoutReducer = (state = initialState, action) => {
//   const { chartType } = action.payload || {};

//   switch (action.type) {
//     case SET_LAYOUT: {
//       const layoutKey = chartType === "scatter" ? "scatterLayout" :
//                         chartType === "historical" ? "historicalLayout" :
//                         "customChartsLayout";
//       localStorage.setItem(layoutKey, JSON.stringify(action.payload.layout));

//       return {
//         ...state,
//         [layoutKey]: action.payload.layout,
//       };
//     }

//     case ADD_CHART: {
//       const chartsKey = chartType === "scatter" ? "scatterCharts" :
//                         chartType === "historical" ? "historicalCharts" :
//                         "customCharts";
//       const updatedCharts = [...state[chartsKey], action.payload.chart];
//       localStorage.setItem(chartsKey, JSON.stringify(updatedCharts));

//       return {
//         ...state,
//         [chartsKey]: updatedCharts,
//       };
//     }

//     case REMOVE_CHART: {
//       const chartsKey = chartType === "scatter" ? "scatterCharts" :
//                         chartType === "historical" ? "historicalCharts" :
//                         "customCharts"; 
//       const updatedCharts = state[chartsKey].filter((chart) => chart.id !== action.payload.chartId);
//       localStorage.setItem(chartsKey, JSON.stringify(updatedCharts));

//       const layoutKey = chartType === "scatter" ? "scatterLayout" :
//                         chartType === "historical" ? "historicalLayout" :
//                         "customChartsLayout";
//       const updatedLayout = state[layoutKey].filter((layout) => layout.i !== action.payload.chartId.toString());
//       localStorage.setItem(layoutKey, JSON.stringify(updatedLayout));

//       return {
//         ...state,
//         [chartsKey]: updatedCharts,
//         [layoutKey]: updatedLayout,
//       };
//     }

//     case UPDATE_CHART: {
//       const chartsKey = chartType === "scatter" ? "scatterCharts" :
//                         chartType === "historical" ? "historicalCharts" :
//                         "customCharts";
//       const updatedCharts = state[chartsKey].map((chart) =>
//         chart.id === action.payload.updatedChart.id ? action.payload.updatedChart : chart
//       );
//       localStorage.setItem(chartsKey, JSON.stringify(updatedCharts));

//       return {
//         ...state,
//         [chartsKey]: updatedCharts,
//       };
//     }

//     default:
//       return state;
//   }
// };

// export default layoutReducer;






// // layoutReducer.js
// import { SET_LAYOUT, ADD_CHART, REMOVE_CHART, UPDATE_CHART } from "./layoutActions";

// const initialState = {
//   scatterCharts: JSON.parse(localStorage.getItem("scatterCharts")) || [],
//   historicalCharts: JSON.parse(localStorage.getItem("historicalCharts")) || [],
//   customCharts: JSON.parse(localStorage.getItem("customCharts")) || [], // Add custom charts state
//   scatterLayout: JSON.parse(localStorage.getItem("scatterChartsLayout")) || [],
//   historicalLayout: JSON.parse(localStorage.getItem("historicalChartsLayout")) || [],
//   customChartsLayout: JSON.parse(localStorage.getItem("customChartsLayout")) || [], // Add custom charts layout state
// };

// const layoutReducer = (state = initialState, action) => {
//   const { chartType } = action.payload || {};

//   switch (action.type) {
//     case SET_LAYOUT: {
//       let layoutKey;
//       if (chartType === "scatter") {
//         layoutKey = "scatterLayout";
//       } else if (chartType === "historical") {
//         layoutKey = "historicalLayout";
//       } else if (chartType === "custom") {
//         layoutKey = "customChartsLayout";
//       }
//       localStorage.setItem(layoutKey, JSON.stringify(action.payload.layout));

//       return {
//         ...state,
//         [layoutKey]: action.payload.layout,
//       };
//     }

//     case ADD_CHART: {
//       let chartsKey;
//       if (chartType === "scatter") {
//         chartsKey = "scatterCharts";
//       } else if (chartType === "historical") {
//         chartsKey = "historicalCharts";
//       } else if (chartType === "custom") {
//         chartsKey = "customCharts";
//       }
//       const updatedCharts = [...state[chartsKey], action.payload.chart];
//       localStorage.setItem(chartsKey, JSON.stringify(updatedCharts));

//       return {
//         ...state,
//         [chartsKey]: updatedCharts,
//       };
//     }

//     case REMOVE_CHART: {
//       let chartsKey;
//       if (chartType === "scatter") {
//         chartsKey = "scatterCharts";
//       } else if (chartType === "historical") {
//         chartsKey = "historicalCharts";
//       } else if (chartType === "custom") {
//         chartsKey = "customCharts";
//       }
//       const updatedCharts = state[chartsKey].filter((chart) => chart.id !== action.payload.chartId);
//       localStorage.setItem(chartsKey, JSON.stringify(updatedCharts));

//       let layoutKey;
//       if (chartType === "scatter") {
//         layoutKey = "scatterLayout";
//       } else if (chartType === "historical") {
//         layoutKey = "historicalLayout";
//       } else if (chartType === "custom") {
//         layoutKey = "customChartsLayout";
//       }
//       const updatedLayout = state[layoutKey].filter((layout) => layout.i !== action.payload.chartId.toString());
//       localStorage.setItem(layoutKey, JSON.stringify(updatedLayout));

//       return {
//         ...state,
//         [chartsKey]: updatedCharts,
//         [layoutKey]: updatedLayout,
//       };
//     }

//     case UPDATE_CHART: {
//       let chartsKey;
//       if (chartType === "scatter") {
//         chartsKey = "scatterCharts";
//       } else if (chartType === "historical") {
//         chartsKey = "historicalCharts";
//       } else if (chartType === "custom") {
//         chartsKey = "customCharts";
//       }
//       const updatedCharts = state[chartsKey].map((chart) =>
//         chart.id === action.payload.updatedChart.id ? action.payload.updatedChart : chart
//       );
//       localStorage.setItem(chartsKey, JSON.stringify(updatedCharts));

//       return {
//         ...state,
//         [chartsKey]: updatedCharts,
//       };
//     }

//     default:
//       return state;
//   }
// };

// export default layoutReducer;


// import { SET_LAYOUT, ADD_CHART, REMOVE_CHART, UPDATE_CHART } from "./layoutActions";

// const initialState = {
//   scatterCharts: JSON.parse(localStorage.getItem("scatterCharts")) || [],
//   historicalCharts: JSON.parse(localStorage.getItem("historicalCharts")) || [],
//   scatterLayout: JSON.parse(localStorage.getItem("scatterChartsLayout")) || [],
//   historicalLayout: JSON.parse(localStorage.getItem("historicalChartsLayout")) || [],
// };

// const layoutReducer = (state = initialState, action) => { 
//   const { chartType } = action.payload || {};

//   switch (action.type) {
//     case SET_LAYOUT: {
//       const layoutKey = chartType === "scatter" ? "scatterLayout" : "historicalLayout";
//       localStorage.setItem(layoutKey, JSON.stringify(action.payload.layout));

//       return {
//         ...state,
//         [layoutKey]: action.payload.layout,
//       };
//     }

//     case ADD_CHART: {
//       const chartsKey = chartType === "scatter" ? "scatterCharts" : "historicalCharts";
//       const updatedCharts = [...state[chartsKey], action.payload.chart];

//       localStorage.setItem(chartType === "scatter" ? "scatterCharts" : "historicalCharts", JSON.stringify(updatedCharts));

//       return {
//         ...state,
//         [chartsKey]: updatedCharts,
//       };
//     }

//     case REMOVE_CHART: {
//       const chartsKey = chartType === "scatter" ? "scatterCharts" : "historicalCharts";
//       const updatedCharts = state[chartsKey].filter((chart) => chart.id !== action.payload.chartId);

//       localStorage.setItem(chartType === "scatter" ? "scatterCharts" : "historicalCharts", JSON.stringify(updatedCharts));

//       return {
//         ...state,
//         [chartsKey]: updatedCharts,
//       };
//     }

//     case UPDATE_CHART: {
//       const chartsKey = chartType === "scatter" ? "scatterCharts" : "historicalCharts";
//       const updatedCharts = state[chartsKey].map((chart) =>
//         chart.id === action.payload.updatedChart.id ? action.payload.updatedChart : chart
//       );

//       localStorage.setItem(chartType === "scatter" ? "scatterCharts" : "historicalCharts", JSON.stringify(updatedCharts));

//       return {
//         ...state,
//         [chartsKey]: updatedCharts,
//       };
//     }

//     default:
//       return state;
//   }
// };

// export default layoutReducer;



// import { SET_LAYOUT, ADD_CHART, REMOVE_CHART, UPDATE_CHART } from "./layoutActions";

// import { ADD_HISTORICAL_CHART, REMOVE_HISTORICAL_CHART, UPDATE_HISTORICAL_CHART } from "./layoutActions";

// const initialState = {
//   layout: JSON.parse(localStorage.getItem("scatterChartsLayout")) || [],
//   charts: JSON.parse(localStorage.getItem("scatterCharts")) || [],
// };

// const layoutReducer = (state = initialState, action) => {
//   switch (action.type) {
//     case SET_LAYOUT:
//       localStorage.setItem("scatterChartsLayout", JSON.stringify(action.payload));
//       return {
//         ...state,
//         layout: action.payload,
//       };
//     case ADD_CHART:
//       const updatedCharts = [...state.charts, action.payload];
//       localStorage.setItem("scatterCharts", JSON.stringify(updatedCharts));
//       return {
//         ...state,
//         charts: updatedCharts,
//       };
//     case REMOVE_CHART:
//       const remainingCharts = state.charts.filter((chart) => chart.id !== action.payload);
//       localStorage.setItem("scatterCharts", JSON.stringify(remainingCharts));
//       return {
//         ...state,
//         charts: remainingCharts,
//       };
//     case UPDATE_CHART:
//       const updatedChartList = state.charts.map((chart) =>
//         chart.id === action.payload.id ? action.payload : chart
//       );
//       localStorage.setItem("scatterCharts", JSON.stringify(updatedChartList));
//       return {
//         ...state,
//         charts: updatedChartList,
//       };
//     default:
//       return state;
//   }
// };

// export default layoutReducer;



// // // layoutReducer.js

// // import { SET_LAYOUT, ADD_CHART, REMOVE_CHART } from "./layoutActions";

// // // Initial State
// // const initialState = {
// //   layout: JSON.parse(localStorage.getItem("scatterChartsLayout")) || [
// //     { i: "chart1", x: 0, y: 0, w: 6, h: 8 },
// //     { i: "chart2", x: 6, y: 0, w: 6, h: 8 },
// //   ],
// //   charts: JSON.parse(localStorage.getItem("scatterCharts")) || [
// //     { id: "chart1", xAxisDataKey: "CW-TT-011", yAxisDataKey: "CW-TT-021", color: "#FF0000" },
// //     { id: "chart2", xAxisDataKey: "AX-LT-011", yAxisDataKey: "AX-LT-021", color: "#00FF00" },
// //   ],
// // };

// // // Reducer Function
// // const layoutReducer = (state = initialState, action) => {
// //   switch (action.type) {
// //     case SET_LAYOUT:
// //       // Save layout to localStorage
// //       localStorage.setItem("scatterChartsLayout", JSON.stringify(action.payload));
// //       return {
// //         ...state,
// //         layout: action.payload,
// //       };
// //     case ADD_CHART:
// //       // Add a new chart to state and save to localStorage
// //       const updatedCharts = [...state.charts, action.payload];
// //       const newLayoutItem = { i: action.payload.id, x: 0, y: Infinity, w: 6, h: 8 };
// //       localStorage.setItem("scatterCharts", JSON.stringify(updatedCharts));
// //       return {
// //         ...state,
// //         charts: updatedCharts,
// //         layout: [...state.layout, newLayoutItem],
// //       };
// //     case REMOVE_CHART:
// //       // Remove chart from state and save updated state to localStorage
// //       const remainingCharts = state.charts.filter((chart) => chart.id !== action.payload);
// //       const remainingLayout = state.layout.filter((item) => item.i !== action.payload);
// //       localStorage.setItem("scatterCharts", JSON.stringify(remainingCharts));
// //       localStorage.setItem("scatterChartsLayout", JSON.stringify(remainingLayout));
// //       return {
// //         ...state,
// //         charts: remainingCharts,
// //         layout: remainingLayout,
// //       };
// //     default:
// //       return state;
// //   }
// // };

// // export default layoutReducer;
