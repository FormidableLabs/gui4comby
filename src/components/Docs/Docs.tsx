import {Outlet, Link, useNavigate, useParams, useLocation} from "react-router-dom";
import HorizontalExpander from "../HorizontalExpander/HorizontalExpander";
import { docs } from '../../docs';
import {Nav} from "react-bootstrap";
import {unTitleCase} from "./DocPage";
import {useEffect} from "react";
import {useRecoilState} from "recoil";
import {docPageScrollFamily} from "./Docs.recoil";
import "./Docs.scss";

const Docs = () => {
  const location = useLocation();
  const params = useParams() as {tabId: string}
  const [scroll, _] = useRecoilState(docPageScrollFamily(params.tabId));

  // on tab focus, reset scroll position to last saved value (or 0)
  useEffect(() => {
    const container = document.getElementById('main')!;
    container.scrollTop = scroll;
  }, [params.tabId, location.pathname]);

  return (<HorizontalExpander style={{width: '100%', overflowX: 'scroll'}} left={<DocsNav/>} className={'docs'}>
    <Outlet/>
  </HorizontalExpander>)
}
export default Docs;


const DocsNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams() as {pageId: string, tabId: string};
  const navPath = `/docs/${params.tabId}/`
  return (
    <Nav className="flex-column" style={{flexBasis: 166, flexShrink: 0, paddingTop: '1em'}}>
      <h1 style={{paddingLeft: '0.5em'}}>Docs</h1>
      {Object.keys(docs).map(key => (
        <Nav.Link onClick={(e) => {
          navigate(`/docs/${params.tabId}/${key}${location.hash}`);
          e.stopPropagation()}}>{unTitleCase(key)}
        </Nav.Link>
      ))}
    </Nav>
  )
}
