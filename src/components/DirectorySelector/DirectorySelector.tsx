import {Badge, Button, Form, InputGroup, Modal} from "react-bootstrap";
import {AiOutlineFolderOpen, AiOutlineRight} from "react-icons/ai";
import {ReactNode, useCallback, useEffect, useRef, useState} from "react";
import {invoke} from "@tauri-apps/api/tauri";
import {useDebounce} from "usehooks-ts";
import useToaster, {ToastVariant} from "../Toaster/useToaster";
import "./DirectorySelector.scss";
import {AiOutlineClose} from "react-icons/all";

type DirInfoResult = {
  resolved_path: string;
  exists: boolean;
  children?: Array<string>;
  candidates?: Array<string>;
  home_dir?: string;
  in_home_dir?: boolean;
  path_separator: string;
}

export type DirectorySelection = {
  path: string;
  expanded: string;
}

type DirectorySelectorProps = {
  defaultValue?: DirectorySelection;
  onSelect?: (selected:DirectorySelection) => void;
  [key: string]: unknown;
};

const DirectorySelector = ({defaultValue, onSelect, ...rest}:DirectorySelectorProps) => {
  const [show, setShow] = useState(false);
  const [value, setValue] = useState(defaultValue || {path:'', expanded: ''});

  useEffect(() => {
    if(onSelect){
      console.log('calling onSelect', value);
      onSelect(value);
    }
  }, [value, onSelect]);

  const handleClose = () => setShow(false);
  const handleSelect = (selected:DirectorySelection) => {
    console.log('handled select', selected);
    setValue(selected);
    setShow(false);
  }
  return (<>
    <InputGroup {...rest} size={'sm'} onClick={() => setShow(true)}>
      <Form.Control as="input" value={value.path} readOnly placeholder="Select the target directory"/>
      <Button variant="outline-secondary" id="button-addon1">
        <AiOutlineFolderOpen />
      </Button>
    </InputGroup>
    {show && <DirectorySelectorModal value={value.path} handleClose={handleClose} handleSelect={handleSelect}/>}
  </>)
}
type DirectorySelectorModalProps = {
  value?: string;
  handleClose: () => void;
  handleSelect: ({path, expanded}: DirectorySelection) => void;
};

// TODO: Handle Up/Down arrow keys cycle through candidates
// TODO: Handle tab auto complete/drill down active candidate
// TODO: Handle return to select
const DirectorySelectorModal = ({handleClose, handleSelect, value}:DirectorySelectorModalProps) => {
  const {push} = useToaster();
  const [input, setInput] = useState(value);
  const [search, setSearch] = useState(value);
  const debouncedInput = useDebounce(input, 200);
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<DirInfoResult>();

  const getDirInfo = useCallback(async (path: string) => {
    setLoading(true);
    try {
      let info = await invoke<DirInfoResult>("dir_info", {path});
      setSearchResults(info);
    } catch (err) {
      push('Filesystem Error', err as string, ToastVariant.warning);
      setSearchResults(undefined);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setSearchResults, push]);


  // focus input on show
  useEffect(() => {
    if(inputRef.current) {
      inputRef.current.focus()
    }
  }, [inputRef]);

  // when text input settles down, update search
  useEffect(() => {
    setSearch(input);
  }, [debouncedInput]);

  // when search changes, fetch dir info
  useEffect(() => {
    if(!search) {
      setSearchResults(undefined)
      return
    }
    getDirInfo(search).catch(console.error);
  }, [search]);

  const drillDown = (path:string) => {
    setInput(path);
    setSearch(path);

    if(inputRef.current) inputRef.current.focus();
  };

  const onSelectClick = ()=> {
    if(!search) { return }
    const homePrefix = `~${searchResults?.path_separator}`;
    let selected = {
      path: search,
      expanded: searchResults?.home_dir ? search.replace(homePrefix, searchResults.home_dir) : search
    };
    handleSelect(selected);
  }

  return (<Modal show={true} onHide={handleClose} size={'lg'} className={'directory-selector-modal'}>
    <Modal.Header>
      <AiOutlineFolderOpen style={{marginRight: '0.5em'}}/>
      <Form.Control value={input} onChange={e => setInput(e.target.value)} ref={inputRef} as="input" placeholder="" style={{padding: 0, border: 0}}/>
      <span onClick={handleClose} style={{cursor: 'pointer'}}><AiOutlineClose/></span>
    </Modal.Header>
    {!loading && input === '' && <Modal.Body>
      <div>Type <code>~/</code> to browse your user folder.</div>
      <div>Or, type the fully qualified path to your directory.</div>
      <div><i>Note, autocomplete is only available inside the home directory.</i></div>
    </Modal.Body>}

    {loading && <Modal.Body>
        Loading ...
    </Modal.Body>}

    {!loading && searchResults && <Modal.Body style={{display: 'flex', flexDirection: 'column', minHeight: '120px', maxHeight: '120px', overflowY: 'scroll'}}>
      {(searchResults.candidates || searchResults.children)?.map((path,i) => (
        <Candidate key={i} onClick={drillDown} path={path} dirInfo={searchResults}/>
      ))}
    </Modal.Body>}


    <Modal.Footer style={{flexWrap: 'nowrap'}}>
      <span style={{flexGrow: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}}>
        {searchResults?.exists ? search : ''}
      </span>
      <Button variant={'default'} onClick={handleClose}>Cancel</Button>
      <Button variant={'primary'} onClick={onSelectClick} disabled={!searchResults?.exists}>Select</Button>
    </Modal.Footer>
  </Modal>)
}
export default DirectorySelector;

const Candidate = ({onClick, path, dirInfo}: {onClick: (path:string) => void, path: string, dirInfo:DirInfoResult}) => {
  const shorten = (path:string) => path.replace(dirInfo.home_dir || '', '~/');

  return (
    <Badge className={'candidate'} onClick={() => onClick(shorten(path)+dirInfo.path_separator)}>
      {shorten(path).split(dirInfo.path_separator).filter(e => e !== '').reduce((prev: null | ReactNode, cur)=>{
        if (prev) {
          return <>{prev} <AiOutlineRight/> {cur}</>
        } else {
          return <>{cur}</>
        }
      }, null)}
    </Badge>
  )
}
