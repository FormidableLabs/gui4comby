import {atom, selector} from "recoil";
import {TabType} from "./components/TabIcon/TabIcon";

let id = 0;
export function getId() {
  return `${Date.now()}-${id++}`;
}

export type Tab = {
  id: string;
  type: TabType;
  title: string;
  path: string;
}

export type TabState = {
  type: TabType.Docs,
  document: string;
} | {
  type: TabType.Playground,
};

export const tabsState = atom<Tab[]>({
  key: 'appTabs',
  default: []
});

export const activeTabState = atom<string>({
  key: 'appTabsActiveTab',
  default: '0'
})

export type MainSizeState = {
  sized: boolean;
  rect?: DOMRectReadOnly;
}
export const mainSizeAtom = atom<MainSizeState>({
  key: 'appMainSize',
  default: {
    sized: false,
  }
});
