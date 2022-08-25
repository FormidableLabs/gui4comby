import {TabType} from "../TabIcon/TabIcon";
import Playground from "../Playground/Playground";

type Props = {
  type: TabType
}
const TabContent = ({type}:Props) => {
  let Component  = <div>Todo</div>;
  switch(type){
    case TabType.Index: Component = <div>Getting Started Placeholder</div>; break;
    case TabType.Playground: Component = <Playground/>; break;
    case TabType.Filesystem: Component = <div>Filesystem Placeholder</div>; break;
    case TabType.Docs: Component = <div>Docs Placeholder</div>; break;
    case TabType.Settings: Component = <div>Settings Placeholder</div>; break;
  }
  return Component;
}
export default TabContent;
