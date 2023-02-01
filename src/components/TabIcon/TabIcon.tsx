import {
  AiOutlineExperiment,
  AiOutlineFileSearch,
  AiOutlineRead,
  AiOutlineSetting,
} from "react-icons/ai";
import { IconType } from "react-icons/lib";

export enum TabType {
  Index,
  Playground,
  Filesystem,
  Docs,
  Settings,
}

type Props = {
  type: TabType;
};
const TabIcon = ({ type }: Props) => {
  let Icon: IconType = AiOutlineRead;

  switch (type) {
    case TabType.Playground:
      Icon = AiOutlineExperiment;
      break;
    case TabType.Filesystem:
      Icon = AiOutlineFileSearch;
      break;
    case TabType.Settings:
      Icon = AiOutlineSetting;
      break;
    case TabType.Docs:
      Icon = AiOutlineRead;
      break;
    case TabType.Index:
      Icon = AiOutlineRead;
      break;
  }

  return <Icon />;
};
export default TabIcon;
