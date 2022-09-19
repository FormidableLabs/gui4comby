import {Link, useLocation, useNavigate} from 'react-router-dom'
import {ReactNode} from "react";
import {Button, Nav} from 'react-bootstrap';
export type LocationState = {
     backgroundLocation?: Location
}

const PreserveBackgroundLocationButton = ({children, to}: {children: ReactNode, to: string}) => {
    const location = useLocation();
    const navigate = useNavigate();

    let state = location.state as LocationState;
    return (<Button onClick={() => navigate(to, {
        state: {
            backgroundLocation: state?.backgroundLocation || location
        },
        replace: true,
    })}>{children}</Button>)
}

export default PreserveBackgroundLocationButton;
