import VerticalExpander from "./components/VerticalExpander/verticalExpander";
import TabBar from "./components/TabBar/TabBar";
import 'bootstrap/dist/css/bootstrap.min.css';
import './themes.css';
import TabContent from "./components/TabContent/TabContent";
import {MutableRefObject, useEffect, useLayoutEffect, useRef, useState} from "react";
import {Routes, Route, Outlet, useLocation, useNavigate} from "react-router-dom";
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
import useResizeObserver from "@react-hook/resize-observer";
import {mainSizeAtom, MainSizeState} from "./App.recoil";

export const useMainSizeObserver = () => {
  const [sizeState, setSizeState] = useRecoilState(mainSizeAtom);
  const target = useRef(null);

  useLayoutEffect(() => {
    if (target.current) {
      setSizeState({
        sized: true,
        // @ts-ignore
        rect: target.current.getBoundingClientRect()
      })
    }
  }, [target])

  // @ts-ignore
  useResizeObserver(target, (entry) => setSizeState({
    sized: true,
    rect: entry.contentRect
  }))
  return {ref: target, sized: sizeState.sized, rect: sizeState.rect}
}

function App() {
  const location = useLocation();
  const state = location.state as LocationState;
  const [_, setEventLog] = useRecoilState(eventLogState);
  const {sized, ref} = useMainSizeObserver();

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

    return () => {
      (async()=>{
        (await unlisten)();
      })();
    }
  }, [])


  return (
    <>
      <Routes location={state?.backgroundLocation || location}>
        <Route path={"/"} element={
          <div id={'app'} className={'ayu-mirage-bordered'}>
            <TabBar id={'header'}/>
            <div id="content">
              <div ref={ref} id={'main'}>
                {sized && <Outlet/>}
              </div>
            </div>
            <EventLog id={'footer'}/>
            <Toaster/>
          </div>
          }>
            {/* TODO deprecate tab/ path */}
            <Route path="tab/:tabId" element={<TabContent/>}/>
            <Route path="playground/:tabId" element={<TabContent/>}/>
            <Route path="filesystem/:tabId" element={<TabContent/>}/>
            <Route path="docs/:tabId" element={<Docs/>}>
              <Route path={":pageId"} element={<DocPage/>}/>
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
        {/*<div id="sidebar">Sidebar</div>*/}
    </>
  )
}

export default App;
