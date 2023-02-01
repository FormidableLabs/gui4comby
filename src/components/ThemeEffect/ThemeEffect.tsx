import { useRecoilValue } from "recoil";
import { appThemeAtom } from "../../App.recoil";
import { useEffect } from "react";

const ThemeEffect = () => {
  const theme = useRecoilValue(appThemeAtom);
  useEffect(() => {
    document.body.classList.remove("dark");
    document.body.classList.remove("light");

    document.body.classList.add(theme);
    if (!document.body.classList.contains("theme")) {
      document.body.classList.add("theme");
    }
  }, [theme]);

  return <></>;
};
export default ThemeEffect;
