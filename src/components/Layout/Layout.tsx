import {Link, Outlet, useLocation, useNavigate} from "react-router-dom";
import {Alert} from "evergreen-ui";
import React from "react";
import PreserveBackgroundLocationLink from "../PreserveBackgroundLocationLink/PreserveBackgroundLocationLink";

function Layout() {
    const location = useLocation();
    let state = location.state as { backgroundLocation?: Location };
    return (
      <div>
        <div>
            <Alert intent="danger" title="Docker Error">
                There is something wrong w/ your docker configuration
                {' '}<PreserveBackgroundLocationLink to={'/settings/docker'}>Click here to fix</PreserveBackgroundLocationLink>
            </Alert>
            <Alert intent="warning" title="Language Detection">
                Using JS as the language.
                {' '}<PreserveBackgroundLocationLink to={'/settings/language'}>Click here to change</PreserveBackgroundLocationLink>
            </Alert>
        </div>
        <div><Link to={'/'}>Home</Link>{' '}<Link to={'/stub'}>Stub</Link></div>
        <Outlet/>
      </div>
    );
}

export default Layout;
