import {Button, Container, Form} from "react-bootstrap";
import {useEffect, useState} from "react";
import { invoke } from "@tauri-apps/api/tauri";
import useToaster, { ToastVariant } from "../Toaster/useToaster";

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
  const [language, setLanguage] = useState('.generic');

  useEffect(() => {
    console.log('playground mount');
  }, []);

  const run = async () => {
    console.log('invoking rpc');
    try {
      let v: {result: string, warning: string} = await invoke("playground_match", {
        source,
        language,
        "matcher": matchTemplate
      });
      if(v.warning) {
        push('Matcher Warning', v.warning, ToastVariant.warning)
      }
      console.log('playground match', v);
      const result = JSON.parse(v.result);
      setMatched(result.matches.map((match: Record<string, unknown>) => match.matched).join("\n"));
    } catch (error) {
      console.error(error);
    }

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
        <Button onClick={() => run()}>Run</Button>
      </div>
    </Form>
  </div>
}
export default Playground;
