import {ReactNode, useState} from "react";
import {Offcanvas} from "react-bootstrap";
import {useNavigate, useLocation} from "react-router-dom";
import {LocationState} from "../PreserveBackgroundLocationLink/PreserveBackgroundLocationLink";

type SideSheetProps = {
  visible: boolean;
  children?: ReactNode;
}
const SideSheet = ({visible, children}: SideSheetProps) => {
  const [show, setShow] = useState(visible);
  const location = useLocation();
  const state = location.state as LocationState;
  const navigate = useNavigate();

  const handleClose = () => {
    setShow(false);
  }

  const handleExit = () => {
    navigate(state.backgroundLocation!, { state: {}, replace: true })
  }

  return (
    <>
      <Offcanvas show={show} onHide={handleClose} onExited={handleExit} placement={'end'}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Title</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {children}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}
export default SideSheet;
