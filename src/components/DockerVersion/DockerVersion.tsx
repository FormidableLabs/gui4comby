import {useEffect, useState} from "react";
import { invoke } from "@tauri-apps/api/tauri";
import {OverlayTrigger, Popover, Spinner} from "react-bootstrap";
import {AiOutlineTool, AiOutlineWarning} from "react-icons/all";

const DockerVersion = () => {
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState<string>();
  const [error, setError] = useState<string>();
  const [hint, setHint] = useState<string>();

  useEffect(() => {
    (async () => {
      try {
        let v: string = await invoke("docker_version");
        setLoading(false);
        setVersion(v);
      } catch (error) {
        if(typeof error === 'string'){
          setError(error as string);
          setLoading(false);
          if(error.indexOf('No such file or directory') !== -1){
            setHint('Check if docker is running')
          }
        }

      }
    })();
  }, []);

  return <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
    <small><strong>Docker Version:</strong></small>
    <span style={{paddingLeft: '1em'}}>
      {loading && <Spinner animation="border" role="status" size={'sm'}>
          <span className="visually-hidden">Loading...</span>
        </Spinner>}
      {!loading && error && <ErrorStatus error={error} hint={hint}/>}
      {!loading && !error && <small style={{color: 'var(--bs-success)'}}>{version}</small>}
    </span>
  </div>
}

type ErrorStatusProps = {
  error: string;
  hint?: string;
  [x: string]: unknown;
}
const ErrorStatus = ({error, hint, ...rest}:ErrorStatusProps) => {
  const [title, message] = error.split(': ');

  const popover = (
  <Popover id={error}>
    <Popover.Header as="h3">{title}</Popover.Header>
    <Popover.Body style={{display:'flex', flexDirection: 'column'}}>
      <small style={{color: 'var(--bs-danger)'}}>{message.charAt(0).toUpperCase() + message.slice(1)}.</small>
      {hint && <strong><small style={{color: 'var(--bs-success)'}}>
        <AiOutlineTool/> Fix: {hint}
      </small></strong>}
    </Popover.Body>
  </Popover>
);
  return (
    <OverlayTrigger placement={'bottom'} overlay={popover}>
      <span {...rest}><AiOutlineWarning style={{cursor: 'pointer'}} color={'var(--bs-danger)'}/></span>
    </OverlayTrigger>
  )
}

export default DockerVersion;
