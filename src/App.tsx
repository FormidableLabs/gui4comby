import {Tab} from "react-bootstrap";
import VerticalExpander from "./components/VerticalExpander/verticalExpander";
import TabBar from "./components/TabBar/TabBar";
import 'bootstrap/dist/css/bootstrap.min.css';
import './themes.css';
import {useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {activeTabState, tabsState} from "./App.recoil";
import TabContent from "./components/TabContent/TabContent";

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
