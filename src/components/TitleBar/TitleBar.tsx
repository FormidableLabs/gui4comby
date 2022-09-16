import './TitleBar.scss';
import {AiOutlineExperiment, AiOutlineFileSearch, AiOutlineRead, AiOutlineSetting} from "react-icons/ai";
import {Button, Nav} from "react-bootstrap";

const TitleBar = () => {
  return (
    <div data-tauri-drag-region className="titlebar">
      {/*<strong>GUI 4 Comby</strong>*/}
      <Nav variant="tabs" defaultActiveKey="/home" style={{flexGrow: 1}}>
        <Nav.Item>
          <Nav.Link eventKey="get-started">Get Started</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="link-1">Option 2</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="disabled" disabled>
            Disabled
          </Nav.Link>
        </Nav.Item>
      </Nav>
      <span style={{marginLeft: 'auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', columnGap: '0.25em'}}>
        <Button><AiOutlineExperiment/></Button>
        <Button><AiOutlineFileSearch/></Button>
        <Button><AiOutlineRead/></Button>
        <Button><AiOutlineSetting/></Button>
      </span>
    </div>
  )
}
export default TitleBar;
