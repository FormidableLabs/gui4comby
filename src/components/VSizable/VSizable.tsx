import {ReactNode, useCallback, useEffect, useState} from "react";
import {Resizable} from "react-resizable";

type VSizableProps = {
  children?: ReactNode;
  sizable?: ReactNode;
  defaultHeight?: number;
};

export const VSizable = ({children, sizable, defaultHeight}: VSizableProps) => {
  const [height, setHeight] = useState(defaultHeight || 200);
  useEffect(() => {
    if(sizable === null) {
      setHeight(0)
    } else if(height === 0) {
      setHeight(defaultHeight || 200)
    }
  }, [sizable, defaultHeight])
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
  return (<div style={{height: '100%', display: 'grid', gridTemplateRows: `auto ${height}px`}}>
    {children}
    <Resizable width={100} axis={'y'} height={height} onResize={onResize} resizeHandles={['ne']} handle={handle}>
      <div style={{paddingTop: '0.35em', height: '100%'}}>{sizable}</div>
    </Resizable>
  </div>)
}
export default VSizable;
