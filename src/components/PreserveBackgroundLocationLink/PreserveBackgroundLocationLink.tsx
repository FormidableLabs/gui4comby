import {Link, useLocation} from 'react-router-dom'
import {ReactNode} from "react";
const PreserveBackgroundLocationLink = ({children, to}: {children: ReactNode, to: string}) => {
    const location = useLocation();
    let state = location.state as { backgroundLocation?: Location };
    return (<Link to={to} state={{backgroundLocation: state?.backgroundLocation || location}}>{children}</Link>)
}

export default PreserveBackgroundLocationLink;
