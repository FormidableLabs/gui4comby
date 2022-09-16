import './TitleBar.scss';
import {AiOutlineSetting} from "react-icons/ai";
import {Nav} from "react-bootstrap";
import {useEffect, useState} from "react";
import TabIcon, {TabType} from "../TabIcon/TabIcon";
import NewTabButton from "../NewTabButton/NewTabButton";
import PreserveBackgroundLocationButton from '../PreserveBackgroundLocationLink/PreserveBackgroundLocationButton';
import {AiOutlineClose} from "react-icons/all";
import {useRecoilState} from "recoil";
import {getId, tabsState} from "../../App.recoil";
import {useNavigate, useParams} from "react-router-dom";


const TitleBar = () => {
  const [tabs, setTabs] = useRecoilState(tabsState);
  const params = useParams() as {tabId: string};
  const navigate = useNavigate();
  const [position, setPosition] = useState(tabs.findIndex(tab => tab.id === params.tabId));
  const [activeKey, setActiveKey] = useState('get-started');

  // // if there are no tabs, add a default tab
  useEffect(() => {
    if(tabs.length < 1) {
      let newId = getId();
      setTabs([{type: TabType.Index, title: 'Getting Started', id: newId, path: `/tab/${newId}`}]);
    }
  }, [tabs]);

  // when tab no longer exists, focus on a new tab
  useEffect(() => {
    if(!tabs.find(tab => tab.id === params.tabId) && tabs.length > 0){
      console.log("couldn't find tab for", params.tabId, location, params);
      let newPosition = Math.max(position-1, 0);
      console.log('positions', position, newPosition);
      navigate(`/tab/${tabs[newPosition].id}`);
    } else if ( tabs.find(tab => tab.id === params.tabId) ) {
      let newPosition = tabs.findIndex(tab => tab.id === params.tabId);
      setPosition(newPosition)
    }
  }, [tabs, params.tabId, position, navigate, location.pathname])

  // make sure tab is fully on screen
  useEffect(() => {
    let parent = document.getElementById('titlebar-tabs');
    if(!parent) { return }
    let tab = document.getElementById(params.tabId);
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
  }, [params.tabId])

  // remove tab from list
  const close = (id: string) => {
    setTabs((oldState) => {
      let newState = oldState.filter(tab => tab.id !== id);
      return newState;
    });
  }

  return (
    <div data-tauri-drag-region className="titlebar">
      {/*<strong>GUI 4 Comby</strong>*/}
      <Nav variant="tabs" activeKey={activeKey} style={{flexGrow: 1}} id={'titlebar-tabs'}>
        {tabs.map((tab, idx) => {
          return (
            <Nav.Item key={idx + '-' + tab.id} id={tab.id} style={{flexShrink: 0}}>
                <Nav.Link className={params.tabId === tab.id ? 'active':''} onClick={() => navigate(tab.path)}>
                  <TabIcon type={tab.type}/>{' '}{tab.title}
                  <AiOutlineClose size={14} style={{marginLeft: '0.5em'}} onClick={(e) => {close(tab.id); e.stopPropagation()}}/>
                </Nav.Link>
            </Nav.Item>
          )
        })}
      </Nav>
      <span style={{marginLeft: 'auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', columnGap: '0.25em'}}>
        <NewTabButton type={TabType.Playground}/>
        <NewTabButton type={TabType.Filesystem}/>
        <NewTabButton type={TabType.Docs}/>
        <PreserveBackgroundLocationButton to={'/settings'}><AiOutlineSetting/></PreserveBackgroundLocationButton>
      </span>
    </div>
  )
}
export default TitleBar;
