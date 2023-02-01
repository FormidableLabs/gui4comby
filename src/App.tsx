import "bootstrap/dist/css/bootstrap.min.css";
import "./App.scss";
import "./style.css";
import "react-resizable/css/styles.css";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";
TimeAgo.addDefaultLocale(en);
import ThemeEffect from "./components/ThemeEffect/ThemeEffect";
import CleanupEffect from "./components/CleanupEffect/CleanupEffect";
import ServerLogListenerEffect from "./components/ServerLogListenerEffect/ServerLogListenerEffect";
import AppRoutes from "./components/AppRoutes/AppRoutes";

function App() {
  console.log("App render");

  return (
    <>
      <ThemeEffect />
      <CleanupEffect />
      <ServerLogListenerEffect />
      <AppRoutes />
    </>
  );
}

export default App;
