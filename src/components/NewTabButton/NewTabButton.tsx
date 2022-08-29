import {Nav, Tab} from "react-bootstrap";
import TabIcon, {TabType} from "../TabIcon/TabIcon";
import {useRecoilState} from "recoil";
import {getId, tabsState} from "../../App.recoil";
import {useNavigate} from "react-router-dom";

type Props = {
  type: TabType;
}
const NewTabButton = ({type}:Props) => {
  const [tabs, setTabs] = useRecoilState(tabsState);
  const navigate = useNavigate();

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

    setTabs((oldState) => [
      ...oldState,
      {id, type, title}
    ]);
    navigate(`/tab/${id}`);
  }

  return (
    <Nav.Link className={'button'} onClick={add}><TabIcon type={type}/></Nav.Link>
  )
}
export default NewTabButton;
