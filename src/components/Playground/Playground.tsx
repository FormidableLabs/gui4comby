import {Button, Container, Form} from "react-bootstrap";
import {useEffect, useState} from "react";
import { invoke } from "@tauri-apps/api/tauri";
import useToaster, { ToastVariant } from "../Toaster/useToaster";

type PlaygroundResult = {
  result: string;
  warning?: string;
}

const Playground = () => {
  const {push} = useToaster();
  const [source, setSource] = useState(`func main() {
      fmt.Println("hello world")
  }`);
  const [matchTemplate, setMatchTemplate] = useState(`fmt.Println(:[arguments])`);
  const [rewriteTemplate, setRewriteTemplate] = useState(`fmt.Println(fmt.Sprintf("comby says %s", :[arguments]))`);
  const [rule, setRule] = useState('where true');
  const [matched, setMatched] = useState('');
  const [rewritten, setRewritten] = useState('');
  const [language, setLanguage] = useState('.go');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('playground mount');
  }, []);

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
      ])).map((r) => ({...(JSON.parse(r.result as string)), warning: r.warning}));

      //[match_results, rewrite_results]
      const match_results = results.find(result => typeof result.matches !== 'undefined');
      const rewrite_results = results.find(result => typeof result.rewritten_source !== 'undefined');

      if(match_results.warning) {
        push('Matcher Warning', match_results.warning, ToastVariant.warning)
      }
      if(rewrite_results.warning) {
        push('Rewriter Warning', rewrite_results.warning, ToastVariant.warning)
      }
      console.log('playground', JSON.stringify({match_results, rewrite_results}));

      setMatched(match_results.matches.map((match: Record<string, unknown>) => match.matched).join("\n"));
      setRewritten(rewrite_results.rewritten_source);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }

  return <div style={{padding: '1em 1em'}}>
    <Form>
      <Form.Group className="mb-3" controlId="sourceSample">
        <Form.Label><strong><small>Source Code</small></strong></Form.Label>
        <Form.Control as="textarea" rows={3} placeholder="Paste your source code here" value={source} onChange={e => setSource(e.target.value)}/>
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
          <Form.Control as="textarea" rows={3} placeholder="" value={matched}/>
        </Form.Group>
        <Form.Group className="mb-3" controlId="rewritten">
          <Form.Label><strong><small>Rewritten</small></strong></Form.Label>
          <Form.Control as="textarea" rows={3} placeholder="" value={rewritten}/>
        </Form.Group>
        <Button onClick={() => run()} disabled={loading} variant={loading ? 'disabled' : 'primary'}>Run</Button>
      </div>
    </Form>
  </div>
}
export default Playground;
