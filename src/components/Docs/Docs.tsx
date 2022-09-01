import {Outlet, Link, useNavigate, useParams} from "react-router-dom";
import HorizontalExpander from "../HorizontalExpander/HorizontalExpander";
import { docs } from '../../docs';
import {Nav} from "react-bootstrap";
import {unTitleCase} from "./DocPage";

const Docs = () => {
  return (<HorizontalExpander left={<DocsNav/>} style={{}}>
    <Outlet/>
  </HorizontalExpander>)
}
export default Docs;


const DocsNav = () => {
  const navigate = useNavigate();
  const params = useParams() as {docId: string};
  return (
    <Nav defaultActiveKey="/docs" className="flex-column" style={{flexBasis: 166, flexShrink: 0}}>
      {Object.keys(docs).map(key => (
        <Nav.Link onClick={() => navigate(key)}>{unTitleCase(key)}</Nav.Link>
      ))}
    </Nav>
  )
}
