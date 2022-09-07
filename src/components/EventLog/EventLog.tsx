import {ReactNode, useState} from "react";
import {AiOutlineMessage} from "react-icons/all";
import {useRecoilState} from "recoil";
import {eventLogState} from "./EventLog.recoil";
import formatDate from '@bitty/format-date';

type Props = {
  [x: string]: unknown;
}
const EventLog = ({...rest}:Props) => {
  const [show, setShow] = useState(false);
  const [log, _] = useRecoilState(eventLogState);

  return (
    <div {...rest} style={{ borderTop: 'solid 1px var(--bs-border-color)'}} className={'text-muted'}>
      {show &&
        <div style={{height: '20vh', overflow: 'auto', display: 'flex', flexDirection: 'column'}}>
          {log.map((log, i) => <div key={`${log.id}-${i}`} style={{
            display: 'flex',
            background: i % 2 != 0 ? '':'var(--bs-table-striped-bg)',
            color: i % 2 != 0 ? '' : 'var(--bs-table-striped-color)'
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
        </div>
      }
      <div style={{display: 'flex', alignItems: 'center', borderTop: show ? 'solid 1px var(--bs-border-color)':''}}>
        <span style={{
          marginLeft: '0.5em',
          textOverflow: "ellipsis",
          whiteSpace: 'nowrap',
          overflow: 'hidden'}}>
          {log.length > 0 && <small>
            <span style={{display: 'inline-block'}}>{formatDate(new Date(log[log.length-1].time), 'M/DD/YYYY')}</span>
            <span style={{display: 'inline-block', marginLeft: '0.25em'}}>{formatDate(new Date(log[log.length-1].time), 'H:mm A')}</span>
            <span style={{paddingLeft: '1em'}}><small>{log[log.length-1].message}</small></span>
          </small>}
        </span>
        <span style={{flexShrink:0, cursor: 'pointer', marginLeft: 'auto', marginRight: '0.5em', display: 'flex', alignItems: 'center', paddingLeft: '1em'}} onClick={() => setShow(s => !s)}><AiOutlineMessage/> <small>Event Log</small></span>
      </div>
    </div>
  )
}
export default EventLog;
