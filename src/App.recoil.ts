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

export const tabsState = atom<Tab[]>({
  key: 'appTabs',
  default: []
});

export const activeTabState = atom<string>({
  key: 'appTabsActiveTab',
  default: '0'
})
