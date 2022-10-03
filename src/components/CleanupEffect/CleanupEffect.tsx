import {useRecoilState} from "recoil";
import {tabsState} from "../../App.recoil";
import {useEffect} from "react";
import {appWindow} from "@tauri-apps/api/window";
import {invoke} from "@tauri-apps/api/tauri";

const CleanupEffect = () => {
  const [tabs, setTabs] = useRecoilState(tabsState);
  useEffect(() => {
    console.log('setting up cleanup listener');
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
        console.log('tearing down cleanup listener');
        (await unlisten)();
      })()
    }
  }, [tabs]);

  return <></>
}
export default CleanupEffect;
