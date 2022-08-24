import "./App.css";
import {Link, Outlet, Route, Routes, useLocation, useNavigate} from "react-router-dom";
import {Alert, Paragraph, SideSheet} from "evergreen-ui";
import Greeter from "./components/Greeter/Greeter";
import Stub from "./components/Stub/Stub";
import React from "react";
import Layout from "./components/Layout/Layout";
import "./App.css";
import PreserveBackgroundLocationLink from "./components/PreserveBackgroundLocationLink/PreserveBackgroundLocationLink";

function App() {
    const location = useLocation();
    const navigate = useNavigate();
    let state = location.state as { backgroundLocation?: Location };
    console.log('state', state);
    console.log('location', location);
    return (
        <>
            <Routes location={state?.backgroundLocation || location}>
              <Route path="/" element={<Layout />}>
                <Route index element={<Greeter />} />
                <Route path="stub" element={<Stub />} />
                {/*<Route path="teams" element={<Teams />}>*/}
                {/*  <Route path=":teamId" element={<Team />} />*/}
                {/*  <Route path="new" element={<NewTeamForm />} />*/}
                {/*  <Route index element={<LeagueStandings />} />*/}
                {/*</Route>*/}
              </Route>
            </Routes>
            {state?.backgroundLocation && (
                <Routes>
                  <Route path="/settings/docker" element={<SideSheet isShown={true} onCloseComplete={() => navigate(state.backgroundLocation!, { state: {} })}><Paragraph margin={40}>
                      Docker Settings
                      <PreserveBackgroundLocationLink to={'/settings/language'}>go to Language Settings</PreserveBackgroundLocationLink>
                  </Paragraph></SideSheet>} />
                  <Route path="/settings/language" element={<SideSheet isShown={true} onCloseComplete={() => navigate(state.backgroundLocation!, { state: {} })}><Paragraph margin={40}>Language Settings</Paragraph></SideSheet>} />
                </Routes>
            )}
        </>
    );
}

export default App;
