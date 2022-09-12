import {ReactNode, useState} from "react";
import {Offcanvas} from "react-bootstrap";
import {useNavigate, useLocation} from "react-router-dom";
import {LocationState} from "../PreserveBackgroundLocationLink/PreserveBackgroundLocationLink";
import {useRecoilValue} from "recoil";
import {sideSheetTitleAtom} from "./SideSheet.recoil";
import {appThemeAtom} from "../../App.recoil";
import {AiOutlineClose} from "react-icons/all";

type SideSheetProps = {
  visible: boolean;
  children?: ReactNode;
}
const SideSheet = ({visible, children}: SideSheetProps) => {
  const [show, setShow] = useState(visible);
  const location = useLocation();
  const state = location.state as LocationState;
  const navigate = useNavigate();
  const title = useRecoilValue(sideSheetTitleAtom);
  const theme = useRecoilValue(appThemeAtom);

  const handleClose = () => {
    setShow(false);
  }

  const handleExit = () => {
    navigate(state.backgroundLocation!, { state: {}, replace: true })
  }

  return (
    <>
      <Offcanvas id={'sidesheet'} className={theme} show={show} onHide={handleClose} onExited={handleExit} placement={'end'}>
        <Offcanvas.Header>
          <Offcanvas.Title>
            {title}
          </Offcanvas.Title>
          <span onClick={handleClose} style={{cursor: 'pointer'}}><AiOutlineClose/></span>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {children}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}
export default SideSheet;
