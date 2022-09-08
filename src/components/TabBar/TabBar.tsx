import {Nav} from "react-bootstrap";
import HorizontalExpander from "../HorizontalExpander/HorizontalExpander";
import './TabBar.scss';
import NewTabButton from "../NewTabButton/NewTabButton";
import TabIcon, {TabType} from "../TabIcon/TabIcon";
import {getId, tabsState} from "../../App.recoil";
import {AiOutlineClose} from "react-icons/all";
import {useRecoilState, useSetRecoilState} from "recoil";
import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {AiOutlineSetting} from "react-icons/ai";
import PreserveBackgroundLocationLink from "../PreserveBackgroundLocationLink/PreserveBackgroundLocationLink";

type Props = {
  [x: string]: unknown
}

const TabBar = ({...rest}: Props) => {
    const [tabs, setTabs] = useRecoilState(tabsState);
    const params = useParams();
    const navigate = useNavigate();
    const [position, setPosition] = useState(tabs.findIndex(tab => tab.id === params.tabId));

    useEffect(() => console.log('TabBar mount'), []);
    //
    // // if there are no tabs, add a default tab
    useEffect(() => {
      if(tabs.length < 1) {
        let newId = getId();
        setTabs([{type: TabType.Index, title: 'Getting Started', id: newId, path: `/tab/${newId}`}]);
      }
    }, [tabs]);

    // // when tab no longer exists, focus on a new tab
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

    // remove tab from list
    const close = (id: string) => {
      setTabs((oldState) => {
        let newState = oldState.filter(tab => tab.id !== id);
        return newState;
      });
    }



    return (
      <HorizontalExpander {...rest} right={<Nav className={'nav-tabs tabbar'}>
        <Nav.Item>
          <NewTabButton type={TabType.Playground}/>
        </Nav.Item>
        <Nav.Item>
          <NewTabButton type={TabType.Filesystem}/>
        </Nav.Item>
        <Nav.Item>
          <NewTabButton type={TabType.Docs}/>
        </Nav.Item>
        <Nav.Item>
          <PreserveBackgroundLocationLink to={'/settings'}><AiOutlineSetting/> Settings</PreserveBackgroundLocationLink>
        </Nav.Item>
      </Nav>}>
        <Nav className={'nav-tabs buttons'} style={{overflowX: 'scroll', flex: 'none', flexWrap: 'nowrap', overflowY: 'hidden'}}>
            {tabs.map((tab, idx) => {
              return (
                <Nav.Item key={idx + '-' + tab.id} style={{flexShrink: 0}}>
                    <Nav.Link className={params.tabId === tab.id ? 'active':''} onClick={() => navigate(tab.path)}>
                      <TabIcon type={tab.type}/>{' '}{tab.title}
                      <AiOutlineClose size={14} style={{marginLeft: '0.5em'}} onClick={(e) => {close(tab.id); e.stopPropagation()}}/>
                    </Nav.Link>
                </Nav.Item>
              )
            })}
        </Nav>
      </HorizontalExpander>

    )
}
export default TabBar;
