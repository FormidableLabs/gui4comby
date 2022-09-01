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
import EventLog from "./components/EventLog/EventLog";
import {useRecoilState} from "recoil";
import {eventLogState} from "./components/EventLog/EventLog.recoil";
import Docs from "./components/Docs/Docs";
import DocPage from "./components/Docs/DocPage";


function App() {
  const location = useLocation();
  const state = location.state as LocationState;
  const [eventLog, setEventLog] = useRecoilState(eventLogState);

  console.log('app location', location);

  useEffect(() => {
    const unlisten = listen('server-log', (event) => {
      let payload = event.payload as {time: number, message: string};
      setEventLog((oldState) => {
        let combined = [
          ...oldState,
          {...payload, id: event.id}
        ];
        // only keep last 99 messages
        return combined.slice(-99);
      });
    });
    console.log('App mount');

    return () => {
      (async()=>{
        (await unlisten)();
      })();
    }
  }, [])

  return (
    <div className={'ayu-mirage-bordered'} style={{width: '100vw', height: '100vh'}}>
      <Routes location={state?.backgroundLocation || location}>
        <Route path={"/"} element={<VerticalExpander header={<TabBar/>} footer={<EventLog/>}>
          <Outlet/>
          <Toaster/>
        </VerticalExpander>}>
          {/* TODO deprecate tab/ path */}
          <Route path="tab/:tabId" element={<TabContent/>}/>
          <Route path="playground/:tabId" element={<TabContent/>}/>
          <Route path="filesystem/:tabId" element={<TabContent/>}/>
          <Route path="docs/:tabId" element={<Docs/>}>
            <Route path={":docId"} element={<DocPage/>}/>
          </Route>
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
