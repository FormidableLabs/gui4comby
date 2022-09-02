import {Outlet, Link, useNavigate, useParams} from "react-router-dom";
import HorizontalExpander from "../HorizontalExpander/HorizontalExpander";
import { docs } from '../../docs';
import {Nav} from "react-bootstrap";
import {unTitleCase} from "./DocPage";

const Docs = () => {
  return (<HorizontalExpander style={{width: '100%', overflowX: 'scroll'}} left={<DocsNav/>} id={'docs'}>
    <Outlet/>
  </HorizontalExpander>)
}
export default Docs;


const DocsNav = () => {
  const navigate = useNavigate();
  const params = useParams() as {docId: string};
  return (
    <Nav className="flex-column" style={{flexBasis: 166, flexShrink: 0, paddingTop: '1em'}}>
      <h1 style={{paddingLeft: '0.5em'}}>Docs</h1>
      {Object.keys(docs).map(key => (
        <Nav.Link onClick={(e) => {navigate(key); e.stopPropagation()}}>{unTitleCase(key)}</Nav.Link>
      ))}
    </Nav>
  )
}
