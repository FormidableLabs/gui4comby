import {useLocation, useNavigate, useParams} from "react-router-dom";
import { docs } from '../../docs';
import {useRecoilState} from "recoil";
import {tabsState} from "../../App.recoil";
import {useEffect} from "react";
import {H1, H2, H3, H4, H5, H6} from "./Headings";
import VerticalExpander from "../VerticalExpander/verticalExpander";

export const unTitleCase = (s: string) => s.replace(/(^[a-z]|-[a-z])/g, (m: string) => {
  if(m.length === 1) { return m.toUpperCase() }
  return ' ' + m.slice(-1).toUpperCase()
})


const DocPage = () => {
  const [tabs, setTabs] = useRecoilState(tabsState);
  const location = useLocation();
  const params = useParams() as {docId: string, tabId: string};
  const navigate = useNavigate();
  console.log(tabs);
  // TODO: update tab path to include docId
  useEffect(() => {
    const tab = tabs.find(tab => tab.id === params.tabId);
    if(tab && tab.path === location.pathname){ return }

    console.log('updating doc path', location, params);
    setTabs(old => [...old.map(tab => {
      if(tab.id === params.tabId) {
        return {
          ...tab,
          path: location.pathname,
          title: `${params.docId !== '' ? unTitleCase(params.docId) : 'Docs'}`
        }
      } else { return tab }
    })]);
  },[params.tabId, params.docId, location.pathname]);

  // scroll to header
  useEffect(() => {
    const el = document.getElementById(location.hash.slice(1));
    const container = document.getElementById('mainContent-expander-inner');
    if(el && container) {
      container.scrollTop = el.offsetTop - 40;
    }
  }, [location.hash]);

  if (!params.docId || ! docs[params.docId]) {
    return (<div>Page not found :(</div>)
  }

  const Component = docs[params.docId!] as JSX.Element;
  return (<VerticalExpander style={{padding: '1em'}}>
    <h1>{unTitleCase(params.docId)}</h1>
    {/*@ts-ignore*/}
    <Component components={{
      a: (props: Record<string,string>) => {
        if(props.href?.indexOf('#') >= 0) {
          let {children, href, ...rest} = props;
          let segment = props.href.slice(0, props.href.indexOf('#'));
          let anchor = props.href.slice(props.href.indexOf('#')+1);

          return <a
            className={'link-primary'}
            href={`javascript://`}
            style={{display: 'inline'}}
            {...rest}
            onClick={(e) => {
              // const el = document.getElementById(anchor);
              // const container = document.getElementById('mainContent-expander-inner');
              // if(el && container) {
              //   container.scrollTop = el.offsetTop - 40;
              // }
              navigate(`/docs/${params.tabId}/${segment ? segment : params.docId}#${anchor}`);
              e.stopPropagation();
            }}
          >{children}</a>
        }
        return <a  {...props} target={"_blank"}/>
      },
      h1: H1,
      h2: H2,
      h3: H3,
      h4: H4,
      h5: H5,
      h6: H6
    }}/>
  </VerticalExpander>)
}
export default DocPage;
