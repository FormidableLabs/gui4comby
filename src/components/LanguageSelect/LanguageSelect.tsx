import {CSSProperties, useEffect, useState} from "react";
import {AiOutlineCode } from "react-icons/all";
import { Form, InputGroup } from "react-bootstrap";

export type LanguageOption = {
  value: string;
  label: string;
  mode?: string;
}

type Props = {
  style?: CSSProperties;
  onChange?: (value: string, option: LanguageOption) => void;
}
const LanguageSelect = ({onChange, ...rest}: Props) => {
  const options = [
    {
        "value": ".generic",
        "label": "Generic"
    },
    {
        "value": ".s",
        "label": "Assembly"
    },
    {
        "value": ".sh",
        "label": "Bash"
    },
    {
        "value": ".c",
        "label": "C/C++"
    },
    {
        "value": ".cs",
        "label": "C#"
    },
    {
        "value": ".clj",
        "label": "Clojure"
    },
    {
        "value": ".css",
        "label": "CSS"
    },
    {
        "value": ".dart",
        "label": "Dart"
    },
    {
        "value": ".elm",
        "label": "Elm"
    },
    {
        "value": ".erl",
        "label": "Erlang"
    },
    {
        "value": ".ex",
        "label": "Elixir"
    },
    {
        "value": ".html",
        "label": "HTML/XML"
    },
    {
        "value": ".hs",
        "label": "Haskell"
    },
    {
        "value": ".go",
        "label": "Go"
    },
    {
        "value": ".java",
        "label": "Java"
    },
    {
        "value": ".js",
        "label": "JS/Typescript",
        "mode": "javascript"
    },
    {
        "value": ".json",
        "label": "JSON"
    },
    {
        "value": ".jl",
        "label": "Julia"
    },
    {
        "value": ".tex",
        "label": "Latex"
    },
    {
        "value": ".ml",
        "label": "OCaml"
    },
    {
        "value": ".php",
        "label": "PHP"
    },
    {
        "value": ".py",
        "label": "Python"
    },
    {
        "value": ".re",
        "label": "Reason"
    },
    {
        "value": ".rb",
        "label": "Ruby"
    },
    {
        "value": ".rs",
        "label": "Rust"
    },
    {
        "value": ".scala",
        "label": "Scala"
    },
    {
        "value": ".sql",
        "label": "SQL"
    },
    {
        "value": ".swift",
        "label": "Swift"
    },
    {
        "value": ".xml",
        "label": "XML"
    },
    {
        "value": ".txt",
        "label": "Text"
    }
];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = options[selectedIndex];

  useEffect(() => {
    if(onChange) {
      onChange(selected.value, selected);
    }
  }, [options, selected, onChange])


  return (
    <InputGroup {...rest} size={'sm'}>
      <InputGroup.Text id="basic-addon1"><AiOutlineCode /></InputGroup.Text>
      <Form.Select value={selected.value} onChange={e => setSelectedIndex(e.target.selectedIndex)} aria-label="language matcher">
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </Form.Select>
    </InputGroup>
  );

}
export default LanguageSelect;
