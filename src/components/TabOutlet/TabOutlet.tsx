import {Suspense, useLayoutEffect, useRef} from "react";
import TitleBar from "../TitleBar/TitleBar";
import {Outlet} from "react-router-dom";
import EventLog from "../EventLog/EventLog";
import Toaster from "../Toaster/Toaster";
import {useRecoilState} from "recoil";
import {mainSizeAtom} from "../../App.recoil";
import useResizeObserver from "@react-hook/resize-observer";

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


const TabOutlet = () => {
  const {sized, ref} = useMainSizeObserver();

  return (
    <>
      <Suspense fallback={<div>Loading</div>}><TitleBar/></Suspense>
      <div ref={ref} style={{height: '100%', display: 'grid', gridTemplateRows: 'auto 28px'}}>
        {sized && <div id={'main'} style={{height: '100%', overflowY: 'scroll'}}><Outlet/></div>}
        <EventLog id={'footer'}/>
      </div>
      <Toaster/>
    </>
  )
}
export default TabOutlet;
