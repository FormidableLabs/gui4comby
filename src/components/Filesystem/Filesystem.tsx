import {Button, Form} from "react-bootstrap";
import {useRecoilState} from "recoil";
import {languageFamily, matchTemplateFamily, rewriteTemplateFamily, ruleFamily} from "../Playground/Playground.recoil";
import DirectorySelector, {DirectorySelection} from "../DirectorySelector/DirectorySelector";
import {useCallback, useState} from "react";
import {invoke} from "@tauri-apps/api/tauri";
import useToaster, {ToastVariant} from "../Toaster/useToaster";
import {useParams} from "react-router-dom";
import {FilesystemMatchResult, FilesystemResult, FilesystemResultType, FilesystemRewriteResult} from "./Filesystem.types";
import ResultsExplorer from "./ResultsExplorer";
import {CombyMatch} from "../Playground/Comby";
import {directorySelectionFamily} from "./Filesystem.recoil";

const Filesystem = ({id}:{id:string})=> {
  const {push} = useToaster();
  const params = useParams() as {tabId: string};
  const [matchTemplate, setMatchTemplate] = useRecoilState(matchTemplateFamily(id));
  const [rewriteTemplate, setRewriteTemplate] = useRecoilState(rewriteTemplateFamily(id));
  const [rule, setRule] = useRecoilState(ruleFamily(id));
  const [language, setLanguage] = useRecoilState(languageFamily(id));
  const [directorySelection, setDirectorySelection] = useRecoilState<DirectorySelection>(directorySelectionFamily(id));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{matched: Array<CombyMatch>}|null>(null);

  const run = useCallback(async () => {
    console.log('invoking rpc', {matchTemplate, rewriteTemplate, rule, directorySelection, tabId: params.tabId});
    try {
      setLoading(true);
      const match_args = {
          matchTemplate,
          language,
          tabId: params.tabId,
          hostPath: directorySelection.expanded,
          extensions: [".md"],
          excludeDirs: ["node_modules"],
        };
      console.log({match_args});

      let results = (await Promise.all([
        invoke<FilesystemResult>("filesystem_match", match_args),
        // invoke<PlaygroundResult>("playground_rewrite", {
        //   source,
        //   language,
        //   matchTemplate,
        //   rewriteTemplate
        // }),
      ])).map((r) => {
        console.log('r', r);
        console.log(r.result);
        return {
          ...r,
          result: r.result ? r.result.split("\n").map(r => {
            try {
              return JSON.parse(r)
            } catch (err) {
              return null;
            }
          }).filter(val => val) :  {uri: null, matches: [], in_place_substitutions: [], rewritten_source: '', diff: ''}
        }
      }) as unknown as [FilesystemMatchResult | FilesystemRewriteResult];

      const match_results: FilesystemMatchResult = results.find(result => result.result_type === FilesystemResultType.Match) as FilesystemMatchResult;
      //const rewrite_results: FilesystemRewriteResult = results.find(result => result.result_type === FilesystemResultType.Rewrite) as FilesystemRewriteResult;

      if(match_results.warning) {
        push('Matcher Warning', match_results.warning, ToastVariant.warning)
      }
      // if(rewrite_results.warning) {
      //   push('Rewriter Warning', rewrite_results.warning, ToastVariant.warning)
      // }
      setResult({matched: match_results.result});
      console.log('filesystem', JSON.stringify({match_results,
      //  rewrite_results
      }));


    } catch (error) {
      console.error(error);
      // @ts-ignore
      push('App Error', error?.message || error, ToastVariant.danger);
    } finally {
      setLoading(false);
    }
  }, [
    matchTemplate, rewriteTemplate, rule, directorySelection, params.tabId
  ]);

  const onSelect = useCallback((selected:DirectorySelection) => {
    setDirectorySelection(selected)
  }, [setDirectorySelection]);

  return <>
      <div style={{padding: '1em 1em'}}>
        <Form>
          <Form.Group className="mb-3" controlId="dirSelect">
              <Form.Label><strong><small>Directory</small></strong></Form.Label>
              <DirectorySelector defaultValue={directorySelection} onSelect={onSelect}/>
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
          <Button onClick={run} disabled={loading || !Boolean(directorySelection.expanded) || !Boolean(matchTemplate) || !Boolean(rewriteTemplate)}>Run</Button>
        </Form>
      </div>
      <ResultsExplorer results={result} path={directorySelection.path}/>
    </>;
}
export default Filesystem;
