import {Tab} from "react-bootstrap";
import VerticalExpander from "./components/VerticalExpander/verticalExpander";
import TabBar from "./components/TabBar/TabBar";
import 'bootstrap/dist/css/bootstrap.min.css';
import './themes.css';
import TabContent from "./components/TabContent/TabContent";
import {useEffect} from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import Greeter from "./components/Greeter/Greeter";
import Toaster from "./components/Toaster/Toaster";
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';
import useToaster from "./components/Toaster/useToaster";
TimeAgo.addDefaultLocale(en);

function App() {
  const {push} = useToaster();
  useEffect(() => {
    console.log('App mount');
  }, [])

  return (
    <div className={'ayu-light-bordered'} style={{width: '100vw', height: '100vh'}}>
      <Routes>
        <Route path={"/"} element={<VerticalExpander header={<TabBar/>}>
          <Outlet/>
          <Toaster/>
        </VerticalExpander>}>
          <Route path="tab/:tabId" element={<TabContent />} />
          <Route index element={<Greeter />} />
        </Route>
      </Routes>

    </div>

  );
}

export default App;
