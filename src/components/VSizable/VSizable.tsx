import {ReactNode, useCallback, useState} from "react";
import {Resizable} from "react-resizable";

type VSizableProps = {
  children?: ReactNode;
  sizable?: ReactNode;
  defaultHeight?: number;
};

export const VSizable = ({children, sizable, defaultHeight}: VSizableProps) => {
  const [height, setHeight] = useState(defaultHeight || 200);
  let onResize = useCallback((event: unknown, {size}: { size: { height: number } }) => {
    setHeight(size.height);
  }, [setHeight]);
  const handle = <div style={{
    background: 'var(--border-color)',
    width: '100%',
    color: '#fff',
    position: 'absolute',
    top: 0,
    height: '0.35em',
    cursor: 'ns-resize',
  }}/>
  return (<div className={'box'}
               style={{position: "relative", height: '100%', display: 'grid', gridTemplateRows: `auto ${height}px`}}>
    <div>{children}</div>
    <Resizable width={100} axis={'y'} height={height} onResize={onResize} resizeHandles={['ne']} handle={handle}>
      <div style={{paddingTop: '0.35em'}}>{sizable}</div>
    </Resizable>
  </div>)
}
