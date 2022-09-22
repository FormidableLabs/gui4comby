import 'bootstrap/dist/css/bootstrap.min.css';
import "./App.scss";
import "./style.css";
import "react-resizable/css/styles.css";
import { appWindow } from "@tauri-apps/api/window";
import TabContent from "./components/TabContent/TabContent";
import {Suspense, useEffect, useLayoutEffect, useRef } from "react";
import {Routes, Route, Outlet, useLocation } from "react-router-dom";
import Toaster from "./components/Toaster/Toaster";
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';
TimeAgo.addDefaultLocale(en);

import { listen  } from '@tauri-apps/api/event'
import {
  LocationState
} from "./components/PreserveBackgroundLocationLink/PreserveBackgroundLocationLink";
import SideSheet from "./components/SideSheet/SideSheet";
import DockerSettings from "./components/DockerSettings/DockerSettings";
import EventLog from "./components/EventLog/EventLog";
import {useRecoilState, useRecoilValue} from "recoil";
import {eventLogState} from "./components/EventLog/EventLog.recoil";
import Docs from "./components/Docs/Docs";
import DocPage from "./components/Docs/DocPage";
import useResizeObserver from "@react-hook/resize-observer";
import {appThemeAtom, mainSizeAtom, MainSizeState, tabsState} from "./App.recoil";
import ThemeSettings from "./components/ThemeSettings/ThemeSettings";
import SettingsIndex from "./components/SettingsIndex/SettingsIndex";
import TitleBar from "./components/TitleBar/TitleBar";
import {invoke} from "@tauri-apps/api/tauri";
import {ToastVariant} from "./components/Toaster/Toaster.recoil";


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
  const theme = useRecoilValue(appThemeAtom);
  const [tabs, setTabs] = useRecoilState(tabsState);

  useEffect(() =>{
    document.body.classList.remove('dark');
    document.body.classList.remove('light');

    document.body.classList.add(theme);
    if(!document.body.classList.contains('theme')){
      document.body.classList.add('theme');
    }
  }, [theme]);

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

  useEffect(() => {
    const unlisten = appWindow.listen('tauri://close-requested', async () => {
      for(let tab of tabs) {
        try {
          await invoke("filesystem_cleanup", {tabId: tab.id});
        } catch (err) {
          console.error(err);
        }
      }
      appWindow.close();
    });
    return () => {
      (async()=>{
        (await unlisten)();
      })()
    }
  }, [tabs]);

  return (
    <>
      <Routes location={state?.backgroundLocation || location}>
        <Route path={"/"} element={
          <>
            <Suspense fallback={<div>Loading</div>}><TitleBar/></Suspense>
            <div ref={ref} style={{height: '100%', display: 'grid', gridTemplateRows: 'auto 28px'}}>
              {sized && <div id={'main'} style={{height: '100%', overflowY: 'scroll'}}><Outlet/></div>}
              <EventLog id={'footer'}/>
            </div>
            <Toaster/>
          </>
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
              <Route index={true} element={<SideSheet visible={true}><SettingsIndex/></SideSheet>}/>
              <Route path="/settings/docker" element={<SideSheet visible={true}><DockerSettings/></SideSheet>} />
              <Route path="/settings/theme" element={<SideSheet visible={true}><ThemeSettings/></SideSheet>} />
            </Route>
          </Routes>
        )}
        {/*<div id="sidebar">Sidebar</div>*/}
    </>
  )
}

export default App;
