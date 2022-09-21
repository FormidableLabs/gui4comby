import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-assembly_x86";
import "ace-builds/src-noconflict/mode-sh";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/mode-csharp";
import "ace-builds/src-noconflict/mode-clojure";
import "ace-builds/src-noconflict/mode-css";
import "ace-builds/src-noconflict/mode-dart";
import "ace-builds/src-noconflict/mode-elm";
import "ace-builds/src-noconflict/mode-erlang";
import "ace-builds/src-noconflict/mode-elixir";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/mode-haskell";
import "ace-builds/src-noconflict/mode-golang";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-typescript";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/mode-julia";
import "ace-builds/src-noconflict/mode-latex";
import "ace-builds/src-noconflict/mode-ocaml";
import "ace-builds/src-noconflict/mode-php";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-ocaml";
import "ace-builds/src-noconflict/mode-ruby";
import "ace-builds/src-noconflict/mode-rust";
import "ace-builds/src-noconflict/mode-scala";
import "ace-builds/src-noconflict/mode-sql";
import "ace-builds/src-noconflict/mode-swift";
import "ace-builds/src-noconflict/mode-xml";

import "ace-builds/src-noconflict/theme-one_dark";
import "ace-builds/src-noconflict/theme-dawn";
import {useRecoilValue} from "recoil";
import {appThemeAtom} from "../../App.recoil";


type AceWrapperProps = {
  width: number;
  height: number;
  value: string;
  onChange: (value: string) => void;
  language: string;
};
const AceWrapper = ({width, height, language, onChange, value}:AceWrapperProps) => {
  const theme = useRecoilValue(appThemeAtom);
  return (
    <AceEditor
      placeholder="Paste your source code here"
      mode={language}
      width={`${width}px`}
      height={`${height}px`}
      theme={theme === 'dark' ? 'one_dark':'dawn'}
      name="sourceSampleAce"
      onChange={onChange}
      fontSize={14}
      showPrintMargin={true}
      showGutter={true}
      highlightActiveLine={true}
      value={value}
      className={'themed'}
      setOptions={{
        enableBasicAutocompletion: false,
        enableLiveAutocompletion: false,
        enableSnippets: false,
        showLineNumbers: true,
        tabSize: 2,
      }}/>
  )
}
export default AceWrapper;
