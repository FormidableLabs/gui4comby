import { atom, useSetRecoilState } from "recoil";
import { useEffect } from "react";

export const sideSheetTitleAtom = atom({
  key: "sideSheetTitle",
  default: "Settings",
});

export const useTitle = (title: string) => {
  const setTitle = useSetRecoilState(sideSheetTitleAtom);
  useEffect(() => {
    setTitle(title);
  }, [setTitle, title]);
};
