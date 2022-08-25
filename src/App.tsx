import {Tab} from "react-bootstrap";
import VerticalExpander from "./components/VerticalExpander/verticalExpander";
import TabBar from "./components/TabBar/TabBar";
import 'bootstrap/dist/css/bootstrap.min.css';
import './themes.css';
import TabContent from "./components/TabContent/TabContent";
import {useEffect} from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import Greeter from "./components/Greeter/Greeter";

function App() {
  useEffect(() => {
    console.log('App mount');
  }, [])

  return (
    <div className={'ayu-light-bordered'} style={{width: '100vw', height: '100vh'}}>
      <Routes>
        <Route path={"/"} element={<VerticalExpander header={<TabBar/>}>
          <Outlet/>
        </VerticalExpander>}>
          <Route path="tab/:tabId" element={<TabContent />} />
          <Route index element={<Greeter />} />
        </Route>
      </Routes>
    </div>

  );
}

export default App;
