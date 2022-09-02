import {useLocation, useNavigate, useParams} from "react-router-dom";
import { docs } from '../../docs';
import {useRecoilState} from "recoil";
import {tabsState} from "../../App.recoil";
import {useEffect} from "react";
import {H1, H2, H3, H4, H5, H6} from "./Headings";
import VerticalExpander from "../VerticalExpander/verticalExpander";
import {BiWindowOpen} from "react-icons/all";

export const unTitleCase = (s: string) => s.replace(/(^[a-z]|-[a-z])/g, (m: string) => {
  if(m.length === 1) { return m.toUpperCase() }
  return ' ' + m.slice(-1).toUpperCase()
})


const DocPage = () => {
  const [tabs, setTabs] = useRecoilState(tabsState);
  const location = useLocation();
  const params = useParams() as {pageId: string, tabId: string};
  const navigate = useNavigate();

  useEffect(() => {
    console.log('updating doc path', location, params);
    const tab = tabs.find(tab => tab.id === params.tabId);
    const newPath = `${location.pathname}${location.hash}`;
    if(tab && tab.path === newPath){ return }

    setTabs(old => [...old.map(tab => {
      if(tab.id === params.tabId) {
        return {
          ...tab,
          path: newPath,
          title: `${params.pageId !== '' ? unTitleCase(params.pageId) : 'Docs'}`
        }
      } else { return tab }
    })]);
  },[params.tabId, params.pageId, location.pathname, location.hash]);

  // scroll to header
  useEffect(() => {
    const container = document.getElementById('main')!;

    const el = document.getElementById(location.hash.slice(1));
    if(el) {
      container.scrollTop = el.offsetTop - 40;
    }
  }, [location.hash]);

  if (!params.pageId || ! docs[params.pageId]) {
    return (<div>Page not found :(</div>)
  }

  const Component = docs[params.pageId!] as JSX.Element;
  return (<div style={{padding: '1em'}}>
    <h1>{unTitleCase(params.pageId)}</h1>
    {/*@ts-ignore*/}
    <Component components={{
      a: (props: Record<string,string>) => {
        if(props.href?.indexOf('://') !== -1) {
          return <a  {...props} target={"_blank"}>{props.children}<BiWindowOpen style={{marginLeft: '0.25em'}}/></a>
        } else {
          let {children, href, ...rest} = props;
          let segment = props.href.slice(0, props.href.indexOf('#'));
          let anchor = props.href.slice(props.href.indexOf('#')+1);

          return <a
            className={'link-primary'}
            href={`javascript://`}
            style={{display: 'inline'}}
            {...rest}
            onClick={(e) => {
              navigate(`/docs/${params.tabId}/${segment ? segment : params.pageId}#${anchor}`);
              e.stopPropagation();
            }}
          >{children}</a>
        }
      },
      h1: H1,
      h2: H2,
      h3: H3,
      h4: H4,
      h5: H5,
      h6: H6
    }}/>
  </div>)
}
export default DocPage;
