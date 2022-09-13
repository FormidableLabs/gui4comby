import {Badge, Button, Form, InputGroup, Modal} from "react-bootstrap";
import {AiOutlineFileSearch, AiOutlineRight} from "react-icons/ai";
import {ReactNode, useCallback, useEffect, useRef, useState} from "react";
import {invoke} from "@tauri-apps/api/tauri";
import {useDebounce} from "usehooks-ts";
import useToaster, {ToastVariant} from "../Toaster/useToaster";

type DirInfoResult = {
  resolved_path: string;
  exists: boolean;
  children?: Array<string>;
  candidates?: Array<string>;
  home_dir?: string;
  in_home_dir?: boolean;
  path_separator: string;
}
type DirectorySelectorProps = {
   onSelect: (path: string | undefined) => void;
   [key: string]: unknown;
};

// TODO: Handle Up/Down arrow keys cycle through candidates
// TODO: Handle tab auto complete/drill down active candidate
// TODO: Handle return to select
const DirectorySelector = ({onSelect, ...rest}:DirectorySelectorProps) => {
  const {push} = useToaster();
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [path, setPath] = useState('');
  const [inputPath, setInputPath] = useState('');
  const debouncedInputPath = useDebounce(inputPath, 500);
  const [selected, setSelected] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dirInfo, setDirInfo] = useState<DirInfoResult|null>(null);
  const getDirInfo = useCallback(async (path: string) => {
    setLoading(true);
    try {
      let info = await invoke<DirInfoResult>("dir_info", {path});
      setDirInfo(info);
    } catch (err) {
      push('Filesystem Error', err as string, ToastVariant.warning);
      setDirInfo(null);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setDirInfo, push]);

  // when modal shows, initialize to selected value
  // when modal hides, reset path values
  useEffect(() => {
    if(show && inputRef.current) {
      inputRef.current.focus();
      if(selected) {
        setLoading(true);
        setInputPath(selected);
      }
    } else if (!show) {
      setPath('');
      setInputPath('');
    }
  },[inputRef, show, selected]);

  // when input settles down, update path
  useEffect(() => {
    setPath(debouncedInputPath);
  }, [debouncedInputPath]);

  // when patch changes, fetch dir info
  useEffect(() => {
    if(path === '') {
      setDirInfo(null);
      return
    }
    getDirInfo(path).catch(console.error);
  }, [path]);

  // when selected changes, let our caller know
  useEffect(() => {
    if(onSelect){
      onSelect(selected);
    }
  }, [selected, onSelect]);



  const handleClose = () => {
    setShow(false);
  }
  const handleShow = () => setShow(true);
  const shorten = (path:string) => path.replace(dirInfo?.home_dir || '', '~/');
  const drillDown = (path:string) => {
    setInputPath(path + dirInfo?.path_separator);
    setPath(path + dirInfo?.path_separator);
    if(show && inputRef.current) {
      inputRef.current.focus();
    }
  };
  const onSelectClick = () => {
    setSelected(path);
    handleClose();
  }

  return <>
    <InputGroup {...rest} size={'sm'} onClick={handleShow}>
      <Form.Control as="input" value={selected} placeholder="Select the target directory"/>
      <Button variant="outline-secondary" id="button-addon1">
        <AiOutlineFileSearch />
      </Button>
    </InputGroup>
    <Modal show={show} onHide={handleClose} size={'lg'}>
        <Modal.Header closeButton>
          <AiOutlineFileSearch style={{marginRight: '0.5em'}}/>
          <Form.Control value={inputPath} onChange={e => setInputPath(e.target.value)} ref={inputRef} as="input" placeholder="" style={{padding: 0, border: 0}}/>
        </Modal.Header>
        {!loading && path === '' && <Modal.Body>
          <div>Type <code>~/</code> to browse your user folder.</div>
          <div>Or, type the fully qualified path to your directory.</div>
          <div><i>Note, autocomplete is only available inside the home directory.</i></div>
        </Modal.Body>}
        {!loading && dirInfo && <Modal.Body style={{display: 'flex', flexDirection: 'column', minHeight: '120px', maxHeight: '120px', overflowY: 'scroll'}}>
          {dirInfo.candidates?.map(shorten).map((path,i) => (
            <Candidate key={i} onClick={() => drillDown(path)} path={path} dirInfo={dirInfo}/>
          ))}
          {dirInfo.children?.map(shorten).map((path,i) => (
            <Candidate key={i} onClick={() => drillDown(path)} path={path} dirInfo={dirInfo}/>
          ))}
        </Modal.Body>}
      {loading && <Modal.Body>
        Loading ...
      </Modal.Body>}
        <Modal.Footer style={{flexWrap: 'nowrap'}}>
          <span style={{flexGrow: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}}>{dirInfo?.exists ? shorten(dirInfo.resolved_path):''}</span>
          <Button variant={'default'} onClick={handleClose}>Cancel</Button>
          <Button variant={'primary'} onClick={onSelectClick} disabled={!dirInfo?.exists}>Select</Button>
        </Modal.Footer>
      </Modal>
  </>
}
export default DirectorySelector;

const Candidate = ({onClick, path, dirInfo}: {onClick: ()=>void, path: string, dirInfo:DirInfoResult}) => {
  return (
    <Badge onClick={onClick} style={{flexShrink: 0, textAlign: 'left', marginBottom: '0.25em', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}}>
      {path.split(dirInfo.path_separator).filter(e => e !== '').reduce((prev: null | ReactNode, cur)=>{
        if (prev) {
          return <>{prev} <AiOutlineRight/> {cur}</>
        } else {
          return <>{cur}</>
        }
      }, null)}
    </Badge>
  )
}
