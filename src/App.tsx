import {Tab} from "react-bootstrap";
import VerticalExpander from "./components/VerticalExpander/verticalExpander";
import TabBar from "./components/TabBar/TabBar";
import 'bootstrap/dist/css/bootstrap.min.css';
import './themes.css';
import TabContent from "./components/TabContent/TabContent";
import {useEffect} from "react";
import {Routes, Route, Outlet, useLocation, useNavigate} from "react-router-dom";
import Greeter from "./components/Greeter/Greeter";
import Toaster from "./components/Toaster/Toaster";
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';

TimeAgo.addDefaultLocale(en);
import { listen } from '@tauri-apps/api/event'
import PreserveBackgroundLocationLink, {
  LocationState
} from "./components/PreserveBackgroundLocationLink/PreserveBackgroundLocationLink";
import SideSheet from "./components/SideSheet/SideSheet";
import DockerSettings from "./components/DockerSettings/DockerSettings";


function App() {
  const location = useLocation();
  const state = location.state as LocationState;

  console.log('app location', location);

  useEffect(() => {
    const unlisten = listen('server-log', (event) => {
      console.log('server-log', JSON.stringify(event, null, 2));
    });
    console.log('App mount');

    return () => {
      (async()=>{
        (await unlisten)();
      })();
    }
  }, [])

  return (
    <div className={'ayu-light-bordered'} style={{width: '100vw', height: '100vh'}}>
      <Routes location={state?.backgroundLocation || location}>
        <Route path={"/"} element={<VerticalExpander header={<TabBar/>}>
          <Outlet/>
          <Toaster/>
        </VerticalExpander>}>
          <Route path="tab/:tabId" element={<TabContent />} />
          <Route index element={<Greeter />} />
        </Route>
      </Routes>
      {state?.backgroundLocation && (
          <Routes>
            <Route path={"/settings"}>
              <Route index={true} element={<SideSheet visible={true}>
                Settings Index page
                <PreserveBackgroundLocationLink to={'/settings/docker'}>Docker</PreserveBackgroundLocationLink><br/>
                <PreserveBackgroundLocationLink to={'/settings/language'}>Language</PreserveBackgroundLocationLink>
              </SideSheet>}/>
              <Route path="/settings/docker" element={<SideSheet visible={true}><DockerSettings/></SideSheet>} />
              <Route path="/settings/language" element={<SideSheet visible={true}><p>Language Settings</p></SideSheet>} />
            </Route>
          </Routes>
      )}
    </div>

  );
}

export default App;
