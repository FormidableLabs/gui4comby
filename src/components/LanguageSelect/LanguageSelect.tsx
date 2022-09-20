import {ChangeEvent, CSSProperties, useCallback, useEffect, useState} from "react";
import {AiOutlineCode } from "react-icons/all";
import { Form, InputGroup } from "react-bootstrap";

export type LanguageOption = {
  value: string;
  label: string;
  extensions: string;
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
      "label": "Generic",
      "extensions": ".*",
    },
    {
      "value": ".s",
      "label": "Assembly",
      "extensions": ".s",
    },
    {
      "value": ".sh",
      "label": "Bash",
      "extensions": ".sh",
    },
    {
      "value": ".c",
      "label": "C/C++",
      "extensions": ".c,.h,.cpp",
    },
    {
      "value": ".cs",
      "label": "C#",
      "extensions": ".cs",
    },
    {
      "value": ".clj",
      "label": "Clojure",
      "extensions": ".clj",
    },
    {
      "value": ".css",
      "label": "CSS",
      "extensions": ".css,.scss",
    },
    {
      "value": ".dart",
      "label": "Dart",
      "extensions": ".dart",
    },
    {
      "value": ".elm",
      "label": "Elm",
      "extensions": ".elm",
    },
    {
      "value": ".erl",
      "label": "Erlang",
      "extensions": ".erl",
    },
    {
      "value": ".ex",
      "label": "Elixir",
      "extensions": ".ex",
    },
    {
      "value": ".html",
      "label": "HTML/XML",
      "extensions": ".html,.xml",
    },
    {
      "value": ".hs",
      "label": "Haskell",
      "extensions": ".hs",
    },
    {
      "value": ".go",
      "label": "Go",
      "extensions": ".go",
    },
    {
      "value": ".java",
      "label": "Java",
      "extensions": ".java",
    },
    {
      "value": ".js",
      "label": "JS/Typescript",
      "mode": "javascript",
      "extensions": ".js,.ts,.jsx,.tsx",
    },
    {
      "value": ".json",
      "label": "JSON",
      "extensions": ".json",
    },
    {
      "value": ".jl",
      "label": "Julia",
      "extensions": ".jl",
    },
    {
      "value": ".tex",
      "label": "Latex",
      "extensions": ".tex",
    },
    {
      "value": ".ml",
      "label": "OCaml",
      "extensions": ".ml",
    },
    {
      "value": ".php",
      "label": "PHP",
      "extensions": ".php",
    },
    {
      "value": ".py",
      "label": "Python",
      "extensions": ".py",
    },
    {
      "value": ".re",
      "label": "Reason",
      "extensions": ".re",
    },
    {
      "value": ".rb",
      "label": "Ruby",
      "extensions": ".rb",
    },
    {
      "value": ".rs",
      "label": "Rust",
      "extensions": ".rs",
    },
    {
      "value": ".scala",
      "label": "Scala",
      "extensions": ".scala",
    },
    {
      "value": ".sql",
      "label": "SQL",
      "extensions": ".sql",
    },
    {
      "value": ".swift",
      "label": "Swift",
      "extensions": ".swift",
    },
    {
      "value": ".xml",
      "label": "XML",
      "extensions": ".xml",
    },
    {
      "value": ".txt",
      "label": "Text",
      "extensions": ".txt",
    }
];
  const [selectedIndex, setSelectedIndex] = useState(0);
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
