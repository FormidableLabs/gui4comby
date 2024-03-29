import { Button, Nav, Tab } from "react-bootstrap";
import TabIcon, { TabType } from "../TabIcon/TabIcon";
import { useRecoilState } from "recoil";
import { getId, tabsState } from "../../App.recoil";
import { useNavigate } from "react-router-dom";
import { CSSProperties } from "react";

type Props = {
  type: TabType;
  text?: string;
  style?: CSSProperties;
};
const NewTabButton = ({ type, text, style }: Props) => {
  const [tabs, setTabs] = useRecoilState(tabsState);
  const navigate = useNavigate();

  function add() {
    const id = getId();
    let title = "";
    let segment = "tab";
    switch (type) {
      case TabType.Index:
        title = "Getting Started";
        segment = "tab";
        break;
      case TabType.Playground:
        title = `Playground ${tabs.length}`;
        segment = "playground";
        break;
      case TabType.Filesystem:
        title = `Filesystem ${tabs.length}`;
        segment = "filesystem";
        break;
      case TabType.Docs:
        title = "Docs";
        segment = "docs";
        break;
      case TabType.Settings:
        title = "Settings";
        segment = "settings";
        break;
    }

    setTabs((oldState) => [
      ...oldState,
      { id, type, title, path: `/${segment}/${id}` },
    ]);
    navigate(`/${segment}/${id}`);
  }

  return (
    <Button onClick={add} style={style}>
      <TabIcon type={type} />
      {text ? ` ${text}` : null}
    </Button>
  );
};
export default NewTabButton;
