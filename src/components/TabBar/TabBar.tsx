import {Nav} from "react-bootstrap";
import HorizontalExpander from "../HorizontalExpander/HorizontalExpander";
import './TabBar.css';
import NewTabButton from "../NewTabButton/NewTabButton";
import TabIcon, {TabType} from "../TabIcon/TabIcon";
import {activeTabState, getId, tabsState} from "../../App.recoil";
import {AiOutlineClose} from "react-icons/all";
import {useRecoilState, useSetRecoilState} from "recoil";
import {useEffect, useState} from "react";

type Props = {
    active?: string
}


const TabBar = ({active}: Props) => {
    const [tabs, setTabs] = useRecoilState(tabsState);
    const [activeTab, setActiveTab] = useRecoilState(activeTabState);
    const [position, setPosition] = useState(tabs.findIndex(tab => tab.id === activeTab));

    useEffect(() => {
      if(!tabs.find(tab => tab.id === activeTab)){
        let newPosition = Math.max(position-1, 0);
        setPosition(newPosition);
        setActiveTab(tabs[newPosition].id);
      } else {
        setPosition(tabs.findIndex(tab => tab.id === activeTab))
      }
    }, [tabs, activeTab, position, setActiveTab])

    const close = (id: string) => {

      setTabs((oldState) => {
        let newState = oldState.filter(tab => tab.id !== id);
        if(newState.length < 1) {
          newState.push({type: TabType.Index, title: 'Getting Started', id: getId()})
        }
        return newState;
      });

    }



    return (
      <HorizontalExpander right={<Nav className={'nav-tabs tabbar'}>
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
              <NewTabButton type={TabType.Settings}/>
          </Nav.Item>
      </Nav>}>
        <Nav className={'nav-tabs buttons'} style={{overflowX: 'scroll', flex: 'none', flexWrap: 'nowrap'}}>
            {tabs.map(tab => (
                <Nav.Item key={tab.id} style={{flexShrink: 0}}>
                    <Nav.Link eventKey={tab.id} className={active == tab.id ? 'active':''}>
                      <TabIcon type={tab.type}/>{' '}{tab.title}
                      <AiOutlineClose size={14} style={{marginLeft: '0.5em'}} onClick={(e) => {close(tab.id); e.stopPropagation()}}/>
                    </Nav.Link>
                </Nav.Item>
            ))}
        </Nav>
      </HorizontalExpander>

    )
}
export default TabBar;
