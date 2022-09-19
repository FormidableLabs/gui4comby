import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { RecoilRoot } from 'recoil';
import {BrowserRouter} from "react-router-dom";

console.log('Running in StrictMode - React components will render twice [only in development] to help find errors. Comment out strict mode to test single rendering.')

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  // <React.StrictMode>
    <RecoilRoot>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </RecoilRoot>
  // </React.StrictMode>
);
