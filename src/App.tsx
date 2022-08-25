import {AiOutlineExperiment, AiOutlineFileSearch, AiOutlineRead} from "react-icons/ai";
import {Tab} from "react-bootstrap";
import VerticalExpander from "./components/VerticalExpander/verticalExpander";
import TabBar from "./components/TabBar/TabBar";
import 'bootstrap/dist/css/bootstrap.min.css';
import Greeter from "./components/Greeter/Greeter";
import './themes.css';
import {useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {activeTabState, tabsState} from "./App.recoil";
import TabContent from "./components/TabContent/TabContent";
import {useEffect} from "react";

const tabsMock = [
    {id: 'tab-0', icon: AiOutlineExperiment, title: 'Getting Started', path: '/getting-started', component: Greeter},
    {id: 'tab-1', icon: AiOutlineExperiment, title: 'Playground', path: '/playground'},
    {id: 'tab-2', icon: AiOutlineFileSearch, title: 'Filesystem', path: '/filesystem'},
    {id: 'tab-3', icon: AiOutlineRead, title: 'docs', path: '/docs'},
    {id: 'tab-4', icon: AiOutlineRead, title: 'docs: Rewrite Properties', path: '/docs/rewrite'},
    {id: 'tab-5', icon: AiOutlineRead, title: 'docs: Syntax Reference', path: '/docs/syntax'}
]

function App() {
  const tabs = useRecoilValue(tabsState);
  const [activeTab, setActiveTab] = useRecoilState(activeTabState);

  const onSelect = (id:string) => {
    setActiveTab(id)
  }

  return (
    <div className={'ayu-light-bordered'} style={{width: '100vw', height: '100vh'}}>
      <Tab.Container id="editor-tabs" activeKey={activeTab}
      onSelect={(k) => onSelect(k || '')}>
          <VerticalExpander header={<TabBar/>}>
            <Tab.Content>
                {tabs.map(tab => (
                    <Tab.Pane key={tab.id} eventKey={tab.id}>
                      <TabContent type={tab.type}/>
                    </Tab.Pane>
                ))}
          </Tab.Content>
          </VerticalExpander>
      </Tab.Container>
    </div>

  );
}

export default App;
