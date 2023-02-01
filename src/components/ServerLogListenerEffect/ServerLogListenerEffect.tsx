import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { useRecoilState } from "recoil";
import { eventLogState } from "../EventLog/EventLog.recoil";

const ServerLogListenerEffect = () => {
  const [_, setEventLog] = useRecoilState(eventLogState);

  useEffect(() => {
    console.log("setting up server log listener");
    const unlisten = listen("server-log", (event) => {
      let payload = event.payload as { time: number; message: string };
      setEventLog((oldState) => {
        let combined = [...oldState, { ...payload, id: event.id }];
        // only keep last 99 messages
        return combined.slice(-99);
      });
    });

    return () => {
      (async () => {
        console.log("tearing down server log listener");
        (await unlisten)();
      })();
    };
  }, []);

  return <></>;
};
export default ServerLogListenerEffect;
