import {Button, Form} from "react-bootstrap";
import {MutableRefObject, useEffect, useLayoutEffect, useRef, useState} from "react";
import {invoke} from "@tauri-apps/api/tauri";
import useToaster, {ToastVariant} from "../Toaster/useToaster";
import LanguageSelect, {LanguageOption} from "../LanguageSelect/LanguageSelect";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";

import useResizeObserver from '@react-hook/resize-observer'
import {useRecoilState} from "recoil";
import {
  aceModeFamily,
  languageFamily, loadingFamily,
  matchedFamily,
  matchTemplateFamily,
  rewriteTemplateFamily,
  rewrittenFamily,
  ruleFamily,
  sourceFamily
} from "./Playground.recoil";

const useSize = (target: MutableRefObject<HTMLElement | null>) => {
  const [size, setSize] = useState<DOMRectReadOnly>()

  useLayoutEffect(() => {
    if(target.current){
      setSize(target.current.getBoundingClientRect())
    }
  }, [target])

  // Where the magic happens
  useResizeObserver(target, (entry) => setSize(entry.contentRect))
  return size
}

type CombyPosition = {
  offset: number;
  line: number;
  column: number;
}
type CombyRange = {
  start: CombyPosition,
  end: CombyPosition;
}
type CombyEnvironment = {
  variable: string;
  value: string;
  range: CombyRange;
}
type CombyMatch = {
  uri?: string;
  matches: Array<{
    matched: string;
    range: CombyRange;
    environment: Array<CombyEnvironment>
  }>
}
type CombyRewrite = {
  uri?: string;
  rewritten_source: string;
  in_place_substitutions: Array<{
    range: CombyRange;
    replacement_content: string;
    environment: Array<CombyEnvironment>
  }>;
  diff: string;
}

enum PlaygroundResultType {
  Match = 'Match',
  Rewrite = 'Rewrite'
}

type PlaygroundResult = {
  result_type: PlaygroundResultType;
  result: string | null;
  warning?: string;
}
type PlaygroundMatchResult = {
  result_type: PlaygroundResultType.Match;
  result: CombyMatch;
  warning?: string;
}
type PlaygroundRewriteResult = {
  result_type: PlaygroundResultType.Rewrite;
  result: CombyRewrite;
  warning?: string;
}

const Playground = ({id}:{id:string}) => {
  const {push} = useToaster();
  const [source, setSource] = useRecoilState(sourceFamily(id));
  // const [source, setSource] = useState(`func main() {
  //     fmt.Println("hello world")
  // }`);
  //const [matchTemplate, setMatchTemplate] = useState(`fmt.Println(:[arguments])`);
  const [matchTemplate, setMatchTemplate] = useRecoilState(matchTemplateFamily(id));
  //const [rewriteTemplate, setRewriteTemplate] = useState(`fmt.Println(fmt.Sprintf("comby says %s", :[arguments]))`);
  const [rewriteTemplate, setRewriteTemplate] = useRecoilState(rewriteTemplateFamily(id));
  //const [rule, setRule] = useState('where true');
  const [rule, setRule] = useRecoilState(ruleFamily(id));
  const [matched, setMatched] = useRecoilState(matchedFamily(id));
  const [rewritten, setRewritten] = useRecoilState(rewrittenFamily(id));
  const [language, setLanguage] = useRecoilState(languageFamily(id));
  const [loading, setLoading] = useRecoilState(loadingFamily(id));
  const [aceMode, setAceMode] = useRecoilState(aceModeFamily(id));

  const sourceBoxRef = useRef(null)
  const size = useSize(sourceBoxRef)

  useEffect(() => {
    console.log('playground mount');
  }, []);

  const onLanguageSelect = (value: string, option: LanguageOption) => {
    setLanguage(value);
    setAceMode(option.mode || '');
  }

  const run = async () => {
    console.log('invoking rpc');
    try {
      setLoading(true);
      let results = (await Promise.all([
        invoke<PlaygroundResult>("playground_match", {
          source,
          matchTemplate,
          language
        }),
        invoke<PlaygroundResult>("playground_rewrite", {
          source,
          language,
          matchTemplate,
          rewriteTemplate
        }),
      ])).map((r) => {
        return {
          ...r,
          result: r.result ? JSON.parse(r.result) :  {uri: null, matches: [], in_place_substitutions: [], rewritten_source: '', diff: ''}
        }
      }) as unknown as [PlaygroundMatchResult | PlaygroundRewriteResult];

      const match_results: PlaygroundMatchResult = results.find(result => result.result_type === PlaygroundResultType.Match) as PlaygroundMatchResult;
      const rewrite_results: PlaygroundRewriteResult = results.find(result => result.result_type === PlaygroundResultType.Rewrite) as PlaygroundRewriteResult;

      if(match_results.warning) {
        push('Matcher Warning', match_results.warning, ToastVariant.warning)
      }
      if(rewrite_results.warning) {
        push('Rewriter Warning', rewrite_results.warning, ToastVariant.warning)
      }
      console.log('playground', JSON.stringify({match_results, rewrite_results}));

      setMatched(match_results.result.matches.map((match: Record<string, unknown>) => match.matched).join("\n"));
      setRewritten(rewrite_results.result.rewritten_source);
    } catch (error) {
      // @ts-ignore
      push('App Error', error.message || error, ToastVariant.danger);
    }
    setLoading(false);
  }

  return <div style={{padding: '1em 1em'}}>
    <Form>
      <Form.Group className="mb-3" controlId="sourceSample">
        <Form.Label style={{alignItems: 'center', display: 'flex', justifyContent: 'space-between'}}><strong><small>Source Code </small></strong><small><LanguageSelect onChange={onLanguageSelect}/></small></Form.Label>
        {/*<Form.Control as="textarea" rows={3} placeholder="Paste your source code here" value={source} onChange={e => setSource(e.target.value)}/>*/}
        <div ref={sourceBoxRef} className={'form-control'} style={{
          overflow: 'auto',
          resize: 'vertical',
          padding: 0,
          minHeight: 'calc(3em + 0.5em)',
          width: '100%',
          paddingBottom: '5px',
        }}>
          {size &&
          <AceEditor
            placeholder="Paste your source code here"
            mode={aceMode}
            width={`${size.width}px`}
            height={`${size.height}px`}
            theme=""
            name="sourceSampleAce"
            onChange={value => setSource(value)}
            fontSize={14}
            showPrintMargin={true}
            showGutter={true}
            highlightActiveLine={true}
            value={source}
            setOptions={{
              enableBasicAutocompletion: false,
              enableLiveAutocompletion: false,
              enableSnippets: false,
              showLineNumbers: true,
              tabSize: 2,
            }}/>}
        </div>

      </Form.Group>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '1em'}}>
        <Form.Group className="mb-3" controlId="matchTemplate">
          <Form.Label><strong><small>Match Template</small></strong></Form.Label>
          <Form.Control as="textarea" rows={3} placeholder="Match template" value={matchTemplate} onChange={e => setMatchTemplate(e.target.value)}/>
        </Form.Group>
        <Form.Group className="mb-3" controlId="rewriteTemplate">
          <Form.Label><strong><small>Rewrite Template</small></strong></Form.Label>
          <Form.Control as="textarea" rows={3} placeholder="Rewrite template" value={rewriteTemplate} onChange={e => setRewriteTemplate(e.target.value)}/>
        </Form.Group>
        <Form.Group className="mb-3" controlId="rule">
          <Form.Label><strong><small>Rule</small></strong></Form.Label>
          <Form.Control as="textarea" rows={1} placeholder="rule expression" value={rule} onChange={e => setRule(e.target.value)}/>
        </Form.Group>
        <Form.Group className="mb-3" controlId="matched" style={{gridColumn: 1}}>
          <Form.Label><strong><small>Matched</small></strong></Form.Label>
          <Form.Control as="textarea" rows={3} placeholder="" value={matched} readOnly={true}/>
        </Form.Group>
        <Form.Group className="mb-3" controlId="rewritten">
          <Form.Label><strong><small>Rewritten</small></strong></Form.Label>
          <Form.Control as="textarea" rows={3} placeholder="" value={rewritten} readOnly={true}/>
        </Form.Group>
        <Button onClick={() => run()} disabled={loading} variant={loading ? 'disabled' : 'primary'}>Run</Button>
      </div>
    </Form>
  </div>
}
export default Playground;
