import {Button, Form, InputGroup, Spinner} from "react-bootstrap";
import {useRecoilState, useRecoilValue} from "recoil";
import {
  defaultExtensionFamily,
  languageFamily,
  matchTemplateFamily,
  rewriteTemplateFamily,
  ruleFamily
} from "../Playground/Playground.recoil";
import DirectorySelector, {DirectorySelection} from "../DirectorySelector/DirectorySelector";
import {ChangeEvent, useCallback, useEffect, useState} from "react";
import {invoke} from "@tauri-apps/api/tauri";
import useToaster, {ToastVariant} from "../Toaster/useToaster";
import {useParams} from "react-router-dom";
import {
  FilesystemResult,
  FilesystemRewriteFileResult,
  CombyRewriteStatus
} from "./Filesystem.types";
import ResultsExplorer from "./ResultsExplorer";
import {CombyRewrite} from "../Playground/Comby";
import {directorySelectionFamily} from "./Filesystem.recoil";
import {VSizable} from "../VSizable/VSizable";
import LanguageSelect, {LanguageOption} from "../LanguageSelect/LanguageSelect";
import {useDebounce} from "usehooks-ts";


const Filesystem = ({id}:{id:string})=> {
  const {push} = useToaster();
  const params = useParams() as {tabId: string};
  const [matchTemplate, setMatchTemplate] = useRecoilState(matchTemplateFamily(id));
  const [rewriteTemplate, setRewriteTemplate] = useRecoilState(rewriteTemplateFamily(id));
  const [rule, setRule] = useRecoilState(ruleFamily(id));
  const [directorySelection, setDirectorySelection] = useRecoilState<DirectorySelection>(directorySelectionFamily(id));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Array<CombyRewriteStatus>|null>(null);
  const [language, setLanguage] = useRecoilState(languageFamily(id));
  const defaultExtension = useRecoilValue(defaultExtensionFamily(id));
  const [extensionMask, setExtensionMask] = useState<string>(defaultExtension);
  const [invalidExtensions, setInvalidExtensions] = useState(false);
  const debouncedExtensionMask = useDebounce(extensionMask, 200);

  useEffect(() => {
    let re = /^\.[a-zA-Z]+(?:,\.[a-zA-Z]+)*$/;
    if (!re.test(debouncedExtensionMask)){
      setInvalidExtensions(true);
    } else {
      setInvalidExtensions(false);
    }
  }, [debouncedExtensionMask, setInvalidExtensions])


  const onLanguageChange = useCallback((value:string, selected: LanguageOption) => {
    setLanguage(_ => value);
    setExtensionMask(_ => selected.extensions);
  }, []);

  const run = useCallback(async () => {
    console.log('invoking rpc', {matchTemplate, rewriteTemplate, rule, directorySelection, tabId: params.tabId});
    try {
      setLoading(true);
      const rewrite_args = {
          matchTemplate,
          rewriteTemplate,
          language,
          tabId: params.tabId,
          hostPath: directorySelection.expanded,
          extensions: (extensionMask||'').split(','),
          excludeDirs: ["node_modules", "build", "dist", "target"],
        };

      const results = await invoke<FilesystemResult>("filesystem_rewrite", rewrite_args);
      if(results.warning) {
        push('Rewriter Warning', results.warning, ToastVariant.warning)
      }
      setResult(results.result?.split("\n").map(r => {
        try {
          return JSON.parse(r)
        } catch (err) {
          return null;
        }
      }).filter(val => val) as Array<CombyRewrite>);
    } catch (error) {
      console.error(error);
      // @ts-ignore
      push('App Error', error?.message || error, ToastVariant.danger);
    } finally {
      setLoading(false);
    }
  }, [
    matchTemplate, rewriteTemplate, rule, directorySelection, params.tabId, extensionMask, language
  ]);

  const apply = useCallback(async (filePath: string) => {
    console.log('invoking rpc', {filePath, matchTemplate, rewriteTemplate, rule, directorySelection, tabId: params.tabId});
    try {
      setLoading(true);
      const rewrite_file_args = {
          filePath,
          matchTemplate,
          rewriteTemplate,
          language,
          tabId: params.tabId,
          hostPath: directorySelection.expanded
        };

      const results = await invoke<FilesystemRewriteFileResult>("filesystem_rewrite_file", rewrite_file_args);
      if(results.result) {
        // UNKNOWN: is there a scenario where comby rewrite in place std out will be non-empty?
        push('Rewrite File Info', results.result, ToastVariant.info)
      }
      if(results.warning) {
        push('Rewrite File Warning', results.warning, ToastVariant.warning)
      }
      // mark the result as applied
      setResult((current):Array<CombyRewriteStatus> => {
        return (current || []).map(r => (r.uri === filePath ? {
          ...r,
          applied: true,
          skipped: false,
        }: r));
      });

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

  const skip = useCallback(async (uri: string) => {
    setResult((current):Array<CombyRewriteStatus> => {
        return (current || []).map(r => (r.uri === uri ? {
          ...r,
          applied: false,
          skipped: true,
        } : r));
      });
  }, [matchTemplate, rewriteTemplate, rule, directorySelection, params.tabId]);

  const onSelect = useCallback((selected:DirectorySelection) => {
    setDirectorySelection(selected)
  }, [setDirectorySelection]);

  const onExtensionChanged = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setExtensionMask(e.target.value);
  }, [setExtensionMask]);

  /* TODO:
      measure distance between bottom of run button and available height
      and set default height to match available space
  */

  return <VSizable defaultHeight={result ? 200 : 0} sizable={result ? <ResultsExplorer applyFunc={apply} skipFunc={skip} results={result} path={directorySelection.path}/> : null}>
      <div style={{padding: '1em 1em', height: '100%', overflowY: 'scroll'}}>
        <Form>
          <div  style={{alignItems: 'center', display: 'flex'}} className={'mb-3'}>
            <Form.Group controlId="dirSelect" style={{flexGrow: 1, marginRight: '1em'}}>
              <Form.Label>
                <strong><small>Directory</small></strong>
              </Form.Label>
              <DirectorySelector defaultValue={directorySelection} onSelect={onSelect}/>
            </Form.Group>
            <Form.Group style={{flexShrink: 1, width: '5em'}}>
              <Form.Label><strong><small>File ext</small></strong></Form.Label>
                <Form.Control as="input" value={extensionMask} size={'sm'} onChange={onExtensionChanged} isInvalid={invalidExtensions}/>
            </Form.Group>
            <Form.Group style={{flexShrink: 1, marginLeft: "1em"}}>
              <Form.Label><strong><small>Language</small></strong></Form.Label>
                <LanguageSelect defaultValue={language} excludes={['.generic']} onChange={onLanguageChange}/>
            </Form.Group>
          </div>
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
          {loading ? <Spinner animation="border" /> : <Button onClick={run} disabled={invalidExtensions || loading || !Boolean(directorySelection.expanded) || !Boolean(matchTemplate) || !Boolean(rewriteTemplate)}>Run</Button>}
        </Form>
      </div>
    </VSizable>;
}
export default Filesystem;
