import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./app.css";

const target = document.getElementById("spa-root") || document.getElementById("app");

ReactDOM.createRoot(target).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
