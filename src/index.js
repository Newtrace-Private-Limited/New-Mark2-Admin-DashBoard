import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";


// Redux setup
import { Provider } from "react-redux";
import store from "./redux/store";
import App from "./App";


// Create the root element
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Provider store={store}>
    <BrowserRouter>
      <App/>
          </BrowserRouter>
  </Provider>
);



// import React from "react";
// import ReactDOM from "react-dom/client";
// import "./index.css";
// import { BrowserRouter } from "react-router-dom";

// import { Amplify } from "aws-amplify";
// import config from "./aws-exports";
// import Auth from "./Auth";

// Amplify.configure(config);
// const root = ReactDOM.createRoot(document.getElementById("root"));
// root.render(
//   <BrowserRouter>
//     <Auth />
//   </BrowserRouter>
// );
