import {Nav, Tab} from "react-bootstrap";
import TabIcon, {TabType} from "../TabIcon/TabIcon";
import {useRecoilState, useSetRecoilState} from "recoil";
import {activeTabState, getId, tabsState} from "../../App.recoil";

type Props = {
  type: TabType;
}
const NewTabButton = ({type}:Props) => {
  const [tabs, setTabs] = useRecoilState(tabsState);
  const setActiveTab = useSetRecoilState(activeTabState);

  function add() {
    const id = getId();
    let title = '';
    switch(type){
      case TabType.Index: title = 'Getting Started'; break;
      case TabType.Playground: title = `Playground ${tabs.length}`; break;
      case TabType.Filesystem: title = `Filesystem ${tabs.length}`; break;
      case TabType.Docs: title = 'Docs'; break;
      case TabType.Settings: title = 'Settings'; break;
    }

    setActiveTab(id);
    setTabs((oldState) => [
      ...oldState,
      {id, type, title}
    ]);

  }

  return (
    <Nav.Link className={'button'} onClick={add}><TabIcon type={type}/></Nav.Link>
  )
}
export default NewTabButton;
