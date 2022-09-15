import {CombyMatch, CombyRewrite} from "../Playground/Comby";
import {
  AiOutlineArrowLeft,
  AiOutlineArrowRight,
  AiOutlineCheckCircle, AiOutlineCloseCircle,
  AiOutlineDiff,
  AiOutlineSearch, RiLayoutBottom2Line
} from "react-icons/all";
import {Badge, Button, ButtonGroup} from "react-bootstrap";
import {useState} from "react";
import {AiOutlineFileSearch} from "react-icons/ai";

export type Results = {
  matched: Array<CombyMatch>,
  rewritten?: Array<CombyRewrite>
}

type Props = {
  results: Results | null;
  path: string;
};
const ResultsExplorer = ({results, path}:Props) => {
  const [index, setIndex] = useState(0);
  let {matched, rewritten} = results || {matched: [], rewritten: []};

  const next = () => {
    setIndex(index + 1 >= matched.length ? 0 : index+1);
  }
  const prev = () => {
    setIndex(index - 1 < 0 ? matched.length-1 : index-1);
  }

  if(results === null) {
    return null;
  }

  return <div>
    <div style={{display: 'flex', alignItems: 'center', border: 'solid 1px', padding: '0.25em'}}>
      <span style={{display: 'grid', columnGap: '0.25em', gridTemplateColumns: '1fr 1fr 1fr', alignItems: 'center', justifyItems: 'center'}}>
        <AiOutlineDiff/>
        <Button size={'sm'} variant={'default'} onClick={prev}><AiOutlineArrowLeft/></Button>
        <Button size={'sm'} variant={'default'} onClick={next}><AiOutlineArrowRight/></Button>
      </span>
      <Button disabled size={'sm'} variant={'secondary'} style={{ margin: '0 0.25em'}}>{index+1} of {matched.length}</Button>
      <span style={{margin: '0 0.25em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
        {matched[index].uri?.replace('/mnt/source/', path)}
      </span>
      <span style={{marginLeft: 'auto'}}>
        <span style={{display: 'grid', columnGap: '0.25em', gridTemplateColumns: '1fr 1fr', alignItems: 'center', justifyItems: 'center'}}>
          <Button size={'sm'} variant={'default'}>Skip{' '}<AiOutlineCloseCircle/></Button>
          <Button size={'sm'} variant={'success'}>Apply{' '}<AiOutlineCheckCircle/></Button>
        </span>
      </span>
      <Button style={{marginLeft: '0.25em'}} variant={'default'} size={'sm'}><RiLayoutBottom2Line/></Button>
    </div>
    {JSON.stringify(matched[index].matches, null, 2)}
  </div>
}
export default ResultsExplorer;
