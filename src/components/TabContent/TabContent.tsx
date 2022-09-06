import {TabType} from "../TabIcon/TabIcon";
import Playground from "../Playground/Playground";
import DockerVersion from "../DockerVersion/DockerVersion";
import Greeter from "../Greeter/Greeter";
import {useEffect} from "react";
import {useParams} from "react-router-dom";
import {useRecoilValue} from "recoil";
import {tabsState} from "../../App.recoil";
import Docs from "../Docs/Docs";

type Props = {

}
const TabContent = ({}:Props) => {
  const params = useParams();
  const tabs = useRecoilValue(tabsState);
  const tab = tabs.find(t => t.id === params.tabId);

  useEffect(() => {
    console.log('TabContent mount');
  }, []);

  if(!tab) {
    return <div>Tab not found :(</div>
  }

  let Component  = <div>Todo</div>;
  switch(tab.type){
    case TabType.Index: Component = <div>Getting Started Placeholder <Greeter/></div>; break;
    case TabType.Playground: Component = <Playground id={params.tabId!}/>; break;
    case TabType.Filesystem: Component = <div>Filesystem Placeholder</div>; break;
    case TabType.Docs: Component = <Docs/>; break;
    case TabType.Settings: Component = <div>Settings Placeholder <DockerVersion/></div>; break;
  }
  return Component;
}
export default TabContent;
