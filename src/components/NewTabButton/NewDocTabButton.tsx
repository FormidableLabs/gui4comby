import { Nav } from "react-bootstrap";
import TabIcon, { TabType } from "../TabIcon/TabIcon";
import { useRecoilState } from "recoil";
import { getId, tabsState } from "../../App.recoil";
import { useNavigate } from "react-router-dom";
import { CSSProperties } from "react";

type Props = {
  text?: string;
  style?: CSSProperties;
  docId?: string;
  hash?: string;
};
const NewDocTabButton = ({ text, style, docId, hash }: Props) => {
  const [tabs, setTabs] = useRecoilState(tabsState);
  const navigate = useNavigate();
  const title = "Docs";
  const segment = "docs";

  function add() {
    const id = getId();
    const path = `/${segment}/${id}${docId ? `/${docId}` : ""}${
      hash ? `#${hash}` : ""
    }`;

    setTabs((oldState) => [
      ...oldState,
      { id, type: TabType.Docs, title, path },
    ]);
    navigate(path);
  }

  return (
    <Nav.Link className={"button"} onClick={add} style={style}>
      <TabIcon type={TabType.Docs} />
      {text ? ` ${text}` : null}
    </Nav.Link>
  );
};
export default NewDocTabButton;
