import { Link, useLocation, useNavigate } from "react-router-dom";
import { ReactNode } from "react";
import { Nav } from "react-bootstrap";
export type LocationState = {
  backgroundLocation?: Location;
};

const PreserveBackgroundLocationLink = ({
  children,
  to,
}: {
  children: ReactNode;
  to: string;
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  let state = location.state as LocationState;
  return (
    <Nav.Link
      className={"button"}
      onClick={() =>
        navigate(to, {
          state: {
            backgroundLocation: state?.backgroundLocation || location,
          },
          replace: true,
        })
      }
    >
      {children}
    </Nav.Link>
  );
};

export default PreserveBackgroundLocationLink;
