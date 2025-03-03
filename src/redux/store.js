// store.js

import { createStore, combineReducers } from "redux";
import layoutReducer from "./layoutReducer";

// Combine Reducers (useful for larger apps)
const rootReducer = combineReducers({
  layout: layoutReducer,
});

// Create Store
const store = createStore(rootReducer);

export default store;
