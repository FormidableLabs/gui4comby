import {CombyRewrite} from "../Playground/Comby";
import {
  AiOutlineArrowLeft,
  AiOutlineArrowRight,
  AiOutlineCheckCircle,
  AiOutlineCloseCircle,
  AiOutlineDiff,
  RiLayoutBottom2Line
} from "react-icons/all";
import {Button} from "react-bootstrap";
import {useCallback, useEffect, useState} from "react";
import ReactDiffViewer from 'react-diff-viewer'
import {invoke} from "@tauri-apps/api/tauri";
import useToaster, {ToastVariant} from "../Toaster/useToaster";

type Props = {
  results: Array<CombyRewrite>;
  path: string;
};

const ResultsExplorer = ({results, path}:Props) => {
  const [index, setIndex] = useState(0);

  const next = () => {
    setIndex(index + 1 >= results.length ? 0 : index+1);
  }
  const prev = () => {
    setIndex(index - 1 < 0 ? results.length-1 : index-1);
  }
  const fs_path = results[index].uri!.replace('/mnt/source/', path);

  return <div>
    <div style={{display: 'flex', alignItems: 'center', border: 'solid 1px', padding: '0.25em'}}>
      <span style={{display: 'grid', columnGap: '0.25em', gridTemplateColumns: '1fr 1fr 1fr', alignItems: 'center', justifyItems: 'center'}}>
        <AiOutlineDiff/>
        <Button size={'sm'} variant={'default'} onClick={prev}><AiOutlineArrowLeft/></Button>
        <Button size={'sm'} variant={'default'} onClick={next}><AiOutlineArrowRight/></Button>
      </span>
      <Button disabled size={'sm'} variant={'secondary'} style={{ margin: '0 0.25em', whiteSpace: 'nowrap'}}>
        {index+1} of {results.length}
      </Button>
      <span style={{margin: '0 0.25em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
        {fs_path}
      </span>
      <span style={{marginLeft: 'auto'}}>
        <span style={{display: 'grid', columnGap: '0.25em', gridTemplateColumns: '1fr 1fr', alignItems: 'center', justifyItems: 'center'}}>
          <Button size={'sm'} variant={'default'} style={{whiteSpace: 'nowrap'}}>Skip{' '}<AiOutlineCloseCircle/></Button>
          <Button size={'sm'} variant={'success'} style={{whiteSpace: 'nowrap'}}>Apply{' '}<AiOutlineCheckCircle/></Button>
        </span>
      </span>
      <Button style={{marginLeft: '0.25em'}} variant={'default'} size={'sm'}><RiLayoutBottom2Line/></Button>
    </div>
    <Diff uri={fs_path} rewritten={results[index].rewritten_source} diff={results[index].diff}/>
  </div>
}
export default ResultsExplorer;


const Diff = ({uri, rewritten, diff}:{uri: string, rewritten: string, diff: string}) => {
  const {push} = useToaster();
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState('Loading ...');

  const loadFile = useCallback(async (filename: string) => {
    setLoading(true);
    try {
      const results = await invoke<string>("filesystem_content", {path:filename});
      setSource(results);
    } catch (err) {
      push('Load File Error', err as string, ToastVariant.danger);
    }
    setLoading(false);
  }, [setLoading, setSource, push]);

  useEffect(() => {
    (async () => loadFile(uri))().catch(console.error);
  }, [uri]);

  if(loading) { return (<div>Loading ...</div>) }

  // TODO if failed to load source content, just render diff (w/ prismJS?)

  return <ReactDiffViewer
        oldValue={source}
        newValue={rewritten}
        splitView={true}
      />
}
