import {useParams} from "react-router-dom";
import { docs } from '../../docs';

export const unTitleCase = (s: string) => s.replace(/(^[a-z]|-[a-z])/g, (m: string) => {
  if(m.length === 1) { return m.toUpperCase() }
  return ' ' + m.slice(-1).toUpperCase()
})


const DocPage = () => {
  const params = useParams() as {docId: string};
  // TODO: update tab path to include docId

  if (!params.docId || ! docs[params.docId]) {
    return (<div>Page not found :(</div>)
  }

  const Component = docs[params.docId!] as JSX.Element;
  return (<div>
    <h1>{unTitleCase(params.docId)}</h1>
    {/*@ts-ignore*/}
    <Component/>
  </div>)
}
export default DocPage;
