import {Nav} from "react-bootstrap";
import HorizontalExpander from "../HorizontalExpander/HorizontalExpander";
import './TabBar.css';
import NewTabButton from "../NewTabButton/NewTabButton";
import TabIcon, {TabType} from "../TabIcon/TabIcon";
import {getId, tabsState} from "../../App.recoil";
import {AiOutlineClose} from "react-icons/all";
import {useRecoilState, useSetRecoilState} from "recoil";
import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";

type Props = {
}

const TabBar = ({}: Props) => {
    const [tabs, setTabs] = useRecoilState(tabsState);
    const params = useParams();
    const navigate = useNavigate();
    const [position, setPosition] = useState(tabs.findIndex(tab => tab.id === params.tabId));

    useEffect(() => console.log('TabBar mount'), []);

    useEffect(() => {
      if(!tabs.find(tab => tab.id === params.tabId)){
        let newPosition = Math.max(position-1, 0);
        setPosition(newPosition);
        navigate(`/tab/${tabs[newPosition].id}`);
      } else {
        setPosition(tabs.findIndex(tab => tab.id === params.tabId))
      }
    }, [tabs, params.tabId, position, navigate])


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
            {tabs.map((tab, idx) => {
              return (
                <Nav.Item key={idx + '-' + tab.id} style={{flexShrink: 0}}>
                    <Nav.Link className={params.tabId === tab.id ? 'active':''} onClick={() => navigate(`/tab/${tab.id}`)}>
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
