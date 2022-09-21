import {ChangeEvent, CSSProperties, useCallback, useState} from "react";
import {AiOutlineCode} from "react-icons/all";
import {Form, InputGroup} from "react-bootstrap";
import { LanguageOptions } from "./LanguageOptions";

export type LanguageOption = {
  value: string; // value sent to comby -matcher arg
  label: string; // display value in form element
  extensions: string; // File extension mask to use for searching
  mode?: string; // ACE mode value
}

type Props = {
  style?: CSSProperties;
  onChange?: (value: string, option: LanguageOption) => void;
  excludes?: Array<string>;
  defaultValue?: string;
}

const LanguageSelect = ({onChange, defaultValue, excludes, ...rest}: Props) => {
  const options = LanguageOptions.filter(s => (excludes || []).indexOf(s.value) === -1);
  const [selectedIndex, setSelectedIndex] = useState(Math.max(options.findIndex(o => o.value === defaultValue),0));
  const selected = options[selectedIndex];

  const onSelected = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    let index = e.target.selectedIndex;
    setSelectedIndex(index);
    if(onChange) {
      onChange(options[index].value, options[index]);
    }
  }, [onChange]);


  return (
    <InputGroup {...rest} size={'sm'}>
      <InputGroup.Text id="basic-addon1"><AiOutlineCode /></InputGroup.Text>
      <Form.Select value={selected.value} onChange={onSelected} aria-label="language matcher">
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </Form.Select>
    </InputGroup>
  );

}
export default LanguageSelect;
