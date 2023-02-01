import { Route, Routes, useLocation } from "react-router-dom";
import TabOutlet from "../TabOutlet/TabOutlet";
import TabContent from "../TabContent/TabContent";
import Docs from "../Docs/Docs";
import DocPage from "../Docs/DocPage";
import SideSheet from "../SideSheet/SideSheet";
import SettingsIndex from "../SettingsIndex/SettingsIndex";
import DockerSettings from "../DockerSettings/DockerSettings";
import ThemeSettings from "../ThemeSettings/ThemeSettings";
import { LocationState } from "../PreserveBackgroundLocationLink/PreserveBackgroundLocationLink";

const AppRoutes = () => {
  const location = useLocation();
  const state = location.state as LocationState;

  return (
    <>
      <Routes location={state?.backgroundLocation || location}>
        <Route path={"/"} element={<TabOutlet />}>
          {/* TODO deprecate tab/ path */}
          <Route path="tab/:tabId" element={<TabContent />} />
          <Route path="playground/:tabId" element={<TabContent />} />
          <Route path="filesystem/:tabId" element={<TabContent />} />
          <Route path="docs/:tabId" element={<Docs />}>
            <Route path={":pageId"} element={<DocPage />} />
          </Route>
        </Route>
      </Routes>
      {state?.backgroundLocation && (
        <Routes>
          <Route path={"/settings"}>
            <Route
              index={true}
              element={
                <SideSheet visible={true}>
                  <SettingsIndex />
                </SideSheet>
              }
            />
            <Route
              path="/settings/docker"
              element={
                <SideSheet visible={true}>
                  <DockerSettings />
                </SideSheet>
              }
            />
            <Route
              path="/settings/theme"
              element={
                <SideSheet visible={true}>
                  <ThemeSettings />
                </SideSheet>
              }
            />
          </Route>
        </Routes>
      )}
    </>
  );
};
export default AppRoutes;
