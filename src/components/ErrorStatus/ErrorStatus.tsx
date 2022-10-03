import {OverlayTrigger, Popover} from "react-bootstrap";
import {AiOutlineTool, AiOutlineWarning} from "react-icons/all";
import {IconType} from "react-icons";
import {ReactNode} from "react";

type ErrorStatusProps = {
  error: string;
  hint?: string;
  fixElement?: ReactNode;
  onFixClick?: () => void;
  [x: string]: unknown;
}
export const ErrorStatus = ({error, hint, fixElement, onFixClick, ...rest}: ErrorStatusProps) => {
  const [title, message] = error.indexOf(':') !== -1 ? error.split(':') : ['Error' ,error];
  const handleFixClick = () => {
    if(onFixClick) {
      onFixClick();
    }
  }
  const popover = (
    <Popover id={error}>
      <Popover.Header as="h3">{title}</Popover.Header>
      <Popover.Body style={{display: 'flex', flexDirection: 'column'}}>
        <small>{message.charAt(0).toUpperCase() + message.slice(1)}.</small>
        {hint && <strong><small style={{color: 'var(--bs-success)'}}>
          <AiOutlineTool/> Fix: {hint}
        </small></strong>}
      </Popover.Body>
    </Popover>
  );
  return (
    <div  {...rest}>
      <OverlayTrigger placement={'bottom'} overlay={popover}>
        <span><AiOutlineWarning style={{cursor: 'pointer'}} color={'var(--bs-danger)'}/></span>
      </OverlayTrigger>
      {fixElement ? <span style={{paddingLeft: '0.5em'}} onClick={handleFixClick}>{fixElement}</span> : null}
    </div>
  )
}
