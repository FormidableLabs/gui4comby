import {Button, Form, InputGroup, Modal} from "react-bootstrap";
import {AiOutlineFileSearch, AiOutlineRight} from "react-icons/ai";
import {ReactNode, useEffect, useRef, useState} from "react";
import {invoke} from "@tauri-apps/api/tauri";
import {useDebounce} from "usehooks-ts";
import useToaster, {ToastVariant} from "../Toaster/useToaster";

type DirInfoResult = {
  resolved_path: string;
  exists: boolean;
  children?: Array<string>;
  candidates?: Array<string>;
  home_dir?: boolean;
  in_home_dir?: boolean;
  path_separator: string;
}

const DirectorySelector = ({...rest}:{[x: string]: string}) => {
  const {push} = useToaster();
  const [show, setShow] = useState(false);
  const [path, setPath] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [dir, setDir] = useState('');
  const debouncedPath = useDebounce(path, 500);
  const [dirInfo, setDirInfo] = useState<DirInfoResult|null>(null);

  useEffect(() => {
    console.log('dir select useEffect', inputRef.current);
    if(show && inputRef.current) {
      console.log('focusing input')
      inputRef.current.focus();
    }
  },[inputRef, show]);

  useEffect(() => {
    (async () => {
      if(debouncedPath === '') { return }
      try {
        let info = await invoke<DirInfoResult>("dir_info", {path});
        console.log('Info', info);
        setDirInfo(info);
      } catch (err) {
        push('Filesystem Error', err as string, ToastVariant.warning);
        setDirInfo(null);
      }
    })();
  }, [debouncedPath]);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return <>
    <InputGroup {...rest} size={'sm'} onClick={handleShow}>
      <Form.Control as="input" placeholder="Select the target directory"/>
      <Button variant="outline-secondary" id="button-addon1">
        <AiOutlineFileSearch />
      </Button>
    </InputGroup>
    <Modal show={show} onHide={handleClose} size={'lg'}>
        <Modal.Header closeButton>
          <AiOutlineFileSearch style={{marginRight: '0.5em'}}/>
          <Form.Control value={path} onChange={e => setPath(e.target.value)} ref={inputRef} as="input" placeholder="" style={{padding: 0, border: 0}}/>
        </Modal.Header>
        {path === '' && <Modal.Body>
          <div>Type <code>~/</code> to browse your user folder.</div>
          <div>Or, type the fully qualified path to your directory.</div>
          <div><i>Note, autocomplete is only available inside the home directory.</i></div>
        </Modal.Body>}
        {dirInfo && <Modal.Body>
          resolved path: {dirInfo.resolved_path}<br/>
          {dirInfo.candidates?.map((path,i) => (
            <Button variant={'info'} key={i} style={{margin: '0.1em'}}>
              {path.split(dirInfo.path_separator).filter(e => e !== '').reduce((prev: null | ReactNode, cur)=>{
                if (prev) {
                  return <>{prev} <AiOutlineRight/> {cur}</>
                } else {
                  return <>{cur}</>
                }
              }, null)}
            </Button>
          ))}
          {dirInfo.children?.map((path,i) => (
            <Button variant={'info'} key={i} style={{maxWidth: '100%', marginBottom: '0.1em', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}}>
              {path.split(dirInfo.path_separator).filter(e => e !== '').reduce((prev: null | ReactNode, cur)=>{
                if (prev) {
                  return <>{prev} <AiOutlineRight/> {cur}</>
                } else {
                  return <>{cur}</>
                }
              }, null)}
            </Button>
          ))}
        </Modal.Body>}
        <Modal.Footer>
          <Button variant={'default'}>Cancel</Button><Button variant={'primary'} disabled={!dirInfo?.exists}>Select</Button>
        </Modal.Footer>
      </Modal>
  </>
}
export default DirectorySelector;
