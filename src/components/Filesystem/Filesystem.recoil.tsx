import {atomFamily, selectorFamily} from "recoil";
import {DirectorySelection} from "../DirectorySelector/DirectorySelector";
import {CombyRewriteStatus} from "./Filesystem.types";
import {defaultExtensionFamily} from "../Playground/Playground.recoil";

export const directorySelectionFamily = atomFamily<DirectorySelection, string>({
  key: 'filesystemDirectorySelection',
  default: {path: '', expanded: ''},
});

export const filesystemResultFamily = atomFamily<Array<CombyRewriteStatus>|null, string>({
  key: 'filesystemResult',
  default: null
});

export const filesystemLoadingFamily = atomFamily<Boolean, string>({
  key: 'filesystemLoading',
  default: false
});

export const filesystemExtensionMask = atomFamily({
  key: 'filesystemExtensionMask',
  default: selectorFamily({
    key: 'filesystemExtensionMask/Default',
    get: param => ({get}) => {
      return get(defaultExtensionFamily(param));
    },
  }),
});

export const filesystemInvalidExtensionFamily = atomFamily({
  key: 'filesystemInvalidExtension',
  default: false
});
