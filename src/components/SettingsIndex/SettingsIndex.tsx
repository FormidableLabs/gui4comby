import PreserveBackgroundLocationLink from "../PreserveBackgroundLocationLink/PreserveBackgroundLocationLink";
import { useTitle } from "../SideSheet/SideSheet.recoil";

const SettingsIndex = () => {
  useTitle("Settings");

  return (
    <div>
      <PreserveBackgroundLocationLink to={"/settings/docker"}>
        Docker
      </PreserveBackgroundLocationLink>
      <PreserveBackgroundLocationLink to={"/settings/theme"}>
        Theme
      </PreserveBackgroundLocationLink>
    </div>
  );
};
export default SettingsIndex;
