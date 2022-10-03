import sanitize, {isSanitized} from "./Playground/Sanitize";
import {Form} from "react-bootstrap";
import {ChangeEvent, KeyboardEvent, useCallback, useEffect, useRef, useState} from "react";
import {RecoilState, useRecoilState} from "recoil";

type TextareaProps = {
  state: RecoilState<string>;
  name?: string;
  [x:string]: unknown;
};
const Textarea = ({state, name, className, ...rest}:TextareaProps) => {
  const [value, setValue] = useRecoilState(state);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [cursor, setCursor] = useState({selectionStart: 0, selectionEnd: 0});
  const [lastActivity, setLastActivity] = useState(0);

  // input state management
  const onChange = useCallback((e:ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  }, [inputRef.current]);

  // any activity on input should reset timer
  const onKeydown = useCallback((e:KeyboardEvent<HTMLTextAreaElement>) => {
    setLastActivity(Date.now());
  }, [inputRef.current]);


  // update recoil state value when input settles down
  // better than useDebounce because cursor movement resets timer
  useEffect(() => {
    // no need for timer if value hasn't changed
    if(inputValue === value) { return }
    const timer = setTimeout(() => {
      // set the recoil state value
      setValue(inputValue);
    }, 500)

    return () => {
      clearTimeout(timer)
    }
  }, [lastActivity, value, inputValue])

  // turn off spellcheck on field to prevent smart punctuation replacements
  useEffect(() => {
    if(!inputRef.current) { return }
    inputRef.current.spellcheck = false;
  }, [inputRef.current])


  return (
    <textarea key={`textarea-${name}`} name={name} ref={inputRef} value={inputValue} onChange={onChange} onKeyDown={onKeydown} className={`form-control ${className}`} {...rest}/>
  )
}
export default Textarea;
