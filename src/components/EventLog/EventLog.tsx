import {ReactNode, useState} from "react";
import {AiOutlineClose, AiOutlineMessage} from "react-icons/all";
import {useRecoilState} from "recoil";
import {eventLogState} from "./EventLog.recoil";
import formatDate from '@bitty/format-date';
import {Offcanvas} from "react-bootstrap";
import "./EventLog.scss";

type Props = {
  [x: string]: unknown;
}
const EventLog = ({...rest}:Props) => {
  const [show, setShow] = useState(false);
  const [log, _] = useRecoilState(eventLogState);
  const handleClose = () => setShow(false);

  return (
    <>
      <div {...rest} style={{ width: '100%', overflow: 'hidden', borderTop: 'solid 1px var(--border-color)'}} className={'text-muted'}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          borderTop: show ? 'solid 1px var(--border-color)':'',
          padding: '0 0.5rem'
        }}
        >
          <span style={{
            textOverflow: "ellipsis",
            whiteSpace: 'nowrap',
            overflow: 'hidden'}}>
            {log.length > 0 && <small>
              <span style={{display: 'inline-block'}}>{formatDate(new Date(log[log.length-1].time), 'M/DD/YYYY')}</span>
              <span style={{display: 'inline-block', marginLeft: '0.25em'}}>{formatDate(new Date(log[log.length-1].time), 'H:mm A')}</span>
              <span style={{paddingLeft: '1em'}}><small>{log[log.length-1].message}</small></span>
            </small>}
          </span>
          <span style={{
              flexShrink:0,
              cursor: 'pointer',
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '1em'
            }}
            onClick={() => setShow(s => !s)}>
            <AiOutlineMessage/>{' '}<small>Event Log</small>
          </span>
        </div>
      </div>
      <Offcanvas className={'eventlog'} show={show} onHide={handleClose} placement={'bottom'}>
        <Offcanvas.Header>
          <Offcanvas.Title>
            Event Log
          </Offcanvas.Title>
          <span onClick={handleClose} style={{cursor: 'pointer'}}><AiOutlineClose/></span>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {log.length < 1 && <div style={{padding: '0.5rem 1rem'}}>No events</div>}
          {log.map((log, i) => <div
            key={`${log.id}-${i}`}
            className={`event ${i % 2 == 0 ? 'alt':''}`}
            style={{
              display: 'flex',
            }}>
            <span style={{
              marginLeft: '1em',
              flexBasis: 60, flexShrink: 0, flexGrow: 0,
              marginRight: '1em',
              textAlign: 'right'
            }}>
            <small style={{fontSize: '.875em'}}>
              <span style={{display: 'inline-block'}}>{formatDate(new Date(log.time), 'M/DD/YYYY')}</span>
              <span style={{display: 'inline-block'}}>{formatDate(new Date(log.time), 'H:mm A')}</span>
            </small>
            </span>
            <span style={{whiteSpace: 'pre'}}><small>{log.message}</small></span>
          </div>)}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  )
}
export default EventLog;
