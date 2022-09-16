import './TitleBar.scss';
import {AiOutlineExperiment, AiOutlineFileSearch, AiOutlineRead, AiOutlineSetting} from "react-icons/ai";
import {Button, Nav} from "react-bootstrap";
import {useState} from "react";

const TitleBar = () => {
  const [activeKey, setActiveKey] = useState('get-started');
  const reveal = (id:string) => {
    setActiveKey(id);
    // make sure tab is fully on screen
    let parent = document.getElementById('titlebar-tabs');
    if(!parent) { return }
    let tab = document.getElementById(id);
    if(!tab) { return }

    let navsRightEdge = parent.offsetWidth;
    let tabRightEdge = tab.offsetLeft + tab.clientWidth;
    let tabLeftEdge = tab.offsetLeft;
    if(tabRightEdge > navsRightEdge + parent.scrollLeft) {
      let scrollLeft = tabRightEdge - navsRightEdge;
      parent.scrollTo({left: scrollLeft, behavior: 'smooth'});
    } else if(tabLeftEdge < parent.scrollLeft) {
      parent.scrollTo({left: tab.offsetLeft, behavior: 'smooth'})
    }
  }

  return (
    <div data-tauri-drag-region className="titlebar">
      {/*<strong>GUI 4 Comby</strong>*/}
      <Nav variant="tabs" activeKey={activeKey} style={{flexGrow: 1}} id={'titlebar-tabs'} onSelect={(key) => reveal(key!)}>
        <Nav.Item>
          <Nav.Link eventKey="get-started">Get Started</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="link-1">Option 2</Nav.Link>
        </Nav.Item>
        {['a','b','c','d','e','f'].map(e => (
          <Nav.Item key={e} id={`link-${e}`}>
            <Nav.Link eventKey={`link-${e}`}>Option {e}</Nav.Link>
          </Nav.Item>
        ))}
        <Nav.Item>
          <Nav.Link eventKey="disabled" disabled>
            Disabled
          </Nav.Link>
        </Nav.Item>
      </Nav>
      <span style={{marginLeft: 'auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', columnGap: '0.25em'}}>
        <Button onClick={() => reveal('link-a')}><AiOutlineExperiment/></Button>
        <Button onClick={() => reveal('link-c')}><AiOutlineFileSearch/></Button>
        <Button onClick={() => reveal('link-e')}><AiOutlineRead/></Button>
        <Button onClick={() => reveal('link-g')}><AiOutlineSetting/></Button>
      </span>
    </div>
  )
}
export default TitleBar;
