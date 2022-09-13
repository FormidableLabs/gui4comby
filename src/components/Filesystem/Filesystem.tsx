import {Form} from "react-bootstrap";
import {useRecoilState} from "recoil";
import {languageFamily, matchTemplateFamily, rewriteTemplateFamily, ruleFamily} from "../Playground/Playground.recoil";
import DirectorySelector from "../DirectorySelector/DirectorySelector";
import {useState} from "react";

const Filesystem = ({id}:{id:string})=> {
  const [matchTemplate, setMatchTemplate] = useRecoilState(matchTemplateFamily(id));
  //const [rewriteTemplate, setRewriteTemplate] = useState(`fmt.Println(fmt.Sprintf("comby says %s", :[arguments]))`);
  const [rewriteTemplate, setRewriteTemplate] = useRecoilState(rewriteTemplateFamily(id));
  //const [rule, setRule] = useState('where true');
  const [rule, setRule] = useRecoilState(ruleFamily(id));
  const [language, setLanguage] = useRecoilState(languageFamily(id));
  const [dir, setDir] = useState<string|undefined>();


  return <div style={{padding: '1em 1em'}}>
    <Form>
      <Form.Group className="mb-3" controlId="dirSelect">
          <Form.Label><strong><small>Directory</small></strong></Form.Label>
          <DirectorySelector onSelect={(path) => setDir(path)}/>
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
      </div>
    </Form>
  </div>
}
export default Filesystem;
