import {
  Badge,
  Button,
  Form,
  FormControl,
  InputGroup,
  Modal,
} from "react-bootstrap";
import { AiOutlineFolderOpen, AiOutlineRight } from "react-icons/ai";
import {
  ChangeEvent,
  KeyboardEvent,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { useDebounce } from "usehooks-ts";
import useToaster, { ToastVariant } from "../Toaster/useToaster";
import "./DirectorySelector.scss";
import { AiOutlineClose } from "react-icons/all";

type DirInfoResult = {
  resolved_path: string;
  exists: boolean;
  children?: Array<string>;
  candidates?: Array<string>;
  home_dir?: string;
  in_home_dir?: boolean;
  path_separator: string;
};

export type DirectorySelection = {
  path: string;
  expanded: string;
};

type DirectorySelectorProps = {
  defaultValue?: DirectorySelection;
  onSelect?: (selected: DirectorySelection) => void;
  [key: string]: unknown;
};

const DirectorySelector = ({
  defaultValue,
  onSelect,
  ...rest
}: DirectorySelectorProps) => {
  const [show, setShow] = useState(false);
  const [value, setValue] = useState(
    defaultValue || { path: "", expanded: "" }
  );

  useEffect(() => {
    if (onSelect) {
      console.log("calling onSelect", value);
      onSelect(value);
    }
  }, [value, onSelect]);

  const handleClose = () => setShow(false);
  const handleSelect = (selected: DirectorySelection) => {
    console.log("handled select", selected);
    setValue(selected);
    setShow(false);
  };
  return (
    <>
      <InputGroup {...rest} size={"sm"} onClick={() => setShow(true)}>
        <Form.Control
          as="input"
          value={value.path}
          readOnly
          placeholder="Select the target directory"
        />
        <Button variant="outline-secondary" id="button-addon1">
          <AiOutlineFolderOpen />
        </Button>
      </InputGroup>
      {show && (
        <DirectorySelectorModal
          value={value.path}
          handleClose={handleClose}
          handleSelect={handleSelect}
        />
      )}
    </>
  );
};
type DirectorySelectorModalProps = {
  value?: string;
  handleClose: () => void;
  handleSelect: ({ path, expanded }: DirectorySelection) => void;
};

// TODO: Handle Up/Down arrow keys cycle through candidates
// TODO: Handle tab auto complete/drill down active candidate
// TODO: Handle return to select
const DirectorySelectorModal = ({
  handleClose,
  handleSelect,
  value,
}: DirectorySelectorModalProps) => {
  const { push } = useToaster();
  const [input, setInput] = useState(value);
  const [search, setSearch] = useState(value);
  const debouncedInput = useDebounce(input, 200);
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<DirInfoResult>();
  const [activeIndex, setActiveIndex] = useState<number>();
  const candidatesRef = useRef<HTMLDivElement>(null);

  const getDirInfo = useCallback(
    async (path: string) => {
      setLoading(true);
      try {
        let info = await invoke<DirInfoResult>("dir_info", { path });
        setSearchResults(info);
      } catch (err) {
        push("Filesystem Error", err as string, ToastVariant.warning);
        setSearchResults(undefined);
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setSearchResults, push]
  );

  // focus input on show
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef]);

  // when text input settles down, update search
  useEffect(() => {
    setSearch(input);
  }, [debouncedInput]);

  // when search changes, fetch dir info
  useEffect(() => {
    if (!search) {
      setSearchResults(undefined);
      return;
    }
    getDirInfo(search).catch(console.error);
  }, [search]);
  // when activeIndex changes, make sure selected candidate is on screen
  useEffect(() => {
    if (!candidatesRef.current || typeof activeIndex === "undefined") {
      return;
    }

    let candidate = document.getElementById(`candidate-${activeIndex}`);
    if (!candidate) {
      return;
    }

    let padding = 5;

    let parent = candidatesRef.current;
    if (candidate.offsetTop < parent.scrollTop) {
      parent.scrollTo({
        behavior: "smooth",
        top: candidate.offsetTop - padding,
      });
      console.log("scrolling", {
        behavior: "smooth",
        top: candidate.offsetTop - padding,
      });
    } else if (
      candidate.offsetTop + candidate.clientHeight >
      parent.scrollTop + parent.clientHeight
    ) {
      parent.scrollTo({
        behavior: "smooth",
        top:
          candidate.offsetTop +
          candidate.clientHeight +
          padding -
          parent.clientHeight,
      });
    }
  }, [activeIndex, candidatesRef]);

  const drillDown = (path: string) => {
    if (!path) {
      return;
    }
    setInput(path);
    setSearch(path);
    setActiveIndex(0);

    if (inputRef.current) inputRef.current.focus();
  };

  const onSelectClick = () => {
    if (!search) {
      return;
    }
    const homePrefix = `~${searchResults?.path_separator}`;
    let withSeparator =
      search +
      (search[search.length - 1] === searchResults?.path_separator
        ? ""
        : searchResults?.path_separator);
    let selected = {
      path: withSeparator,
      expanded: searchResults?.home_dir
        ? withSeparator.replace(homePrefix, searchResults.home_dir)
        : withSeparator,
    };
    handleSelect(selected);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setActiveIndex(undefined);
  };

  const shorten = (path: string) =>
    path.replace(searchResults?.home_dir || "", "~/");

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    let candidates = searchResults?.candidates || searchResults?.children;
    switch (e.key) {
      case "Tab":
      case "Enter":
        e.preventDefault();
        if (candidates) {
          drillDown(
            shorten(candidates[activeIndex || 0]) +
              searchResults?.path_separator
          );
        }
        break;
      case "Down":
      case "ArrowDown":
        e.preventDefault();
        if (candidates) {
          if (typeof activeIndex === "undefined") {
            setActiveIndex(0);
          } else {
            setActiveIndex(
              activeIndex < candidates.length - 1 ? activeIndex + 1 : 0
            );
          }
        }
        break;
      case "Up":
      case "ArrowUp":
        e.preventDefault();
        if (candidates) {
          if (typeof activeIndex === "undefined") {
            setActiveIndex(candidates.length - 1);
          } else {
            setActiveIndex(
              activeIndex > 0 ? activeIndex - 1 : candidates.length - 1
            );
          }
        }
        break;
    }
  };

  return (
    <Modal
      show={true}
      onHide={handleClose}
      size={"lg"}
      className={"directory-selector-modal"}
    >
      <Modal.Header>
        <AiOutlineFolderOpen style={{ marginRight: "0.5em" }} />
        <Form.Control
          onKeyDown={onKeyDown}
          value={input}
          onChange={onChange}
          ref={inputRef}
          as="input"
          placeholder=""
          style={{ padding: 0, border: 0 }}
        />
        <span onClick={handleClose} style={{ cursor: "pointer" }}>
          <AiOutlineClose />
        </span>
      </Modal.Header>
      {!loading && input === "" && (
        <Modal.Body>
          <div>
            Type <code>~/</code> to browse your user folder.
          </div>
          <div>Or, type the fully qualified path to your directory.</div>
          <div>
            <i>
              Note, autocomplete is only available inside the home directory.
            </i>
          </div>
        </Modal.Body>
      )}

      {loading && <Modal.Body>Loading ...</Modal.Body>}

      {!loading && searchResults && (
        <Modal.Body
          ref={candidatesRef}
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "120px",
            maxHeight: "120px",
            overflowY: "scroll",
          }}
        >
          {(searchResults.candidates || searchResults.children)?.map(
            (path, i) => (
              <Candidate
                id={`candidate-${i}`}
                key={i}
                onClick={drillDown}
                path={path}
                dirInfo={searchResults}
                active={i === activeIndex}
              />
            )
          )}
        </Modal.Body>
      )}

      <Modal.Footer style={{ flexWrap: "nowrap" }}>
        <span
          style={{
            flexGrow: 1,
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          {searchResults?.exists ? search : ""}
        </span>
        <Button variant={"default"} onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant={"primary"}
          onClick={onSelectClick}
          disabled={!searchResults?.exists}
        >
          Select
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
export default DirectorySelector;

type CandidateProps = {
  onClick: (path: string) => void;
  path: string;
  dirInfo: DirInfoResult;
  active?: boolean;
  id?: string;
};
const Candidate = ({ id, onClick, path, dirInfo, active }: CandidateProps) => {
  const shorten = (path: string) => path.replace(dirInfo.home_dir || "", "~/");

  return (
    <Badge
      id={id}
      className={`candidate ${active ? "active" : ""}`}
      onClick={() => onClick(shorten(path) + dirInfo.path_separator)}
    >
      {shorten(path)
        .split(dirInfo.path_separator)
        .filter((e) => e !== "")
        .reduce((prev: null | ReactNode, cur) => {
          if (prev) {
            return (
              <>
                {prev} <AiOutlineRight /> {cur}
              </>
            );
          } else {
            return <>{cur}</>;
          }
        }, null)}
    </Badge>
  );
};
