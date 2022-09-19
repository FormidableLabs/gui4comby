import {atomFamily} from "recoil";
import {DirectorySelection} from "../DirectorySelector/DirectorySelector";

export const directorySelectionFamily = atomFamily<DirectorySelection, string>({
  key: 'filesystemDirectorySelection',
  default: {path: '', expanded: ''},
});
