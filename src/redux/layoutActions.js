// layoutActions.js
export const SET_LAYOUT = "SET_LAYOUT";
export const ADD_CHART = "ADD_CHART";
export const REMOVE_CHART = "REMOVE_CHART";
export const UPDATE_CHART = "UPDATE_CHART";

export const setLayout = (layout, chartType) => ({
  type: SET_LAYOUT,
  payload: { layout, chartType },
});

export const addChart = (chart, chartType) => ({
  type: ADD_CHART,
  payload: { chart, chartType },
});

export const removeChart = (chartId, chartType) => ({
  type: REMOVE_CHART,
  payload: { chartId, chartType },
});

export const updateChart = (updatedChart, chartType) => ({
  type: UPDATE_CHART,
  payload: { updatedChart, chartType },
});



// // layoutActions.js
// export const SET_LAYOUT = "SET_LAYOUT";
// export const ADD_CHART = "ADD_CHART";
// export const REMOVE_CHART = "REMOVE_CHART";
// export const UPDATE_CHART = "UPDATE_CHART";

// export const setLayout = (layout) => ({
//   type: SET_LAYOUT,
//   payload: layout,
// });

// export const addChart = (chart) => ({
//   type: ADD_CHART,
//   payload: chart,
// });

// export const removeChart = (chartId) => ({
//   type: REMOVE_CHART,
//   payload: chartId,
// });

// export const updateChart = (updatedChart) => ({
//   type: UPDATE_CHART,
//   payload: updatedChart,
// });




// // // layoutActions.js

// // // Action Types
// // export const SET_LAYOUT = "SET_LAYOUT";
// // export const ADD_CHART = "ADD_CHART";
// // export const REMOVE_CHART = "REMOVE_CHART";

// // // Action Creators
// // export const setLayout = (layout) => ({
// //   type: SET_LAYOUT,
// //   payload: layout,
// // });

// // export const addChart = (chart) => ({
// //   type: ADD_CHART,
// //   payload: chart,
// // });

// // export const removeChart = (chartId) => ({
// //   type: REMOVE_CHART,
// //   payload: chartId,
// // });
