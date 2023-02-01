import { Form, InputGroup, OverlayTrigger, Tooltip } from "react-bootstrap";
import {
  MutableRefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { invoke } from "@tauri-apps/api/tauri";
import useToaster, { ToastVariant } from "../Toaster/useToaster";
import LanguageSelect, {
  LanguageOption,
} from "../LanguageSelect/LanguageSelect";

import useResizeObserver from "@react-hook/resize-observer";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  aceModeFamily,
  languageFamily,
  loadingFamily,
  matchedFamily,
  matchesFamily,
  matchTemplateFamily,
  rewritesFamily,
  rewriteTemplateFamily,
  rewrittenFamily,
  ruleErrorFamily,
  ruleFamily,
  sourceFamily,
} from "./Playground.recoil";
import { useDebounce } from "usehooks-ts";
import { CombyMatch, CombyRewrite } from "./Comby";
import AceWrapper from "../AceWrapper/AceWrapper";
import { AiOutlineImport, AiOutlineWarning } from "react-icons/all";
import sanitize from "./Sanitize";
import { IMarker } from "react-ace";
import { useSize } from "../../hooks/useSize";
import Textarea from "../Textarea";
import ImportButton from "./ImportButton";

enum PlaygroundResultType {
  Match = "Match",
  Rewrite = "Rewrite",
}

type PlaygroundResult = {
  result_type: PlaygroundResultType;
  result: string | null;
  warning?: string;
};
type PlaygroundMatchResult = {
  result_type: PlaygroundResultType.Match;
  result: CombyMatch;
  warning?: string;
};
type PlaygroundRewriteResult = {
  result_type: PlaygroundResultType.Rewrite;
  result: CombyRewrite;
  warning?: string;
};

const Playground2 = ({ id }: { id: string }) => {
  const { push } = useToaster();
  const [source, setSource] = useRecoilState(sourceFamily(id));
  const matchTemplate = useRecoilValue(matchTemplateFamily(id));
  const rewriteTemplate = useRecoilValue(rewriteTemplateFamily(id));
  const rule = useRecoilValue(ruleFamily(id));
  const [matched, setMatched] = useRecoilState(matchedFamily(id));
  const [matches, setMatches] = useRecoilState(matchesFamily(id));
  const [rewritten, setRewritten] = useRecoilState(rewrittenFamily(id));
  const [rewrites, setRewrites] = useRecoilState(rewritesFamily(id));
  const [language, setLanguage] = useRecoilState(languageFamily(id));
  //const [loading, setLoading] = useRecoilState(loadingFamily(id));
  const [aceMode, setAceMode] = useRecoilState(aceModeFamily(id));
  const debounceTime = 200;
  const debouncedSource = useDebounce(source, debounceTime);
  const debouncedMatchTemplate = useDebounce(matchTemplate, debounceTime);
  const debouncedRewriteTemplate = useDebounce(rewriteTemplate, debounceTime);
  const debouncedRule = useDebounce(rule, debounceTime);
  const [ruleError, setRuleError] = useRecoilState(ruleErrorFamily(id));
  const [invokingMatch, setInvokingMatch] = useState(false);
  const [invokingRewrite, setInvokingRewrite] = useState(false);
  const loading = invokingMatch || invokingRewrite;

  const sourceBoxRef = useRef(null);
  const rewrittenBoxRef = useRef(null);
  const sourceSize = useSize(sourceBoxRef);
  const rewrittenSize = useSize(rewrittenBoxRef);

  // invoke match rpc whenever match related input fields change
  useEffect(() => {
    (async () => {
      console.log("invoking match rpc");
      setInvokingMatch(true);
      try {
        let result = await invoke<PlaygroundResult>("playground_match", {
          source,
          matchTemplate,
          language,
          rule,
        });
        let match_results = {
          ...result,
          result: result.result
            ? JSON.parse(result.result)
            : {
                uri: null,
                matches: [],
                in_place_substitutions: [],
                rewritten_source: "",
                diff: "",
              },
        };
        if (match_results.warning) {
          // only have to handle non rule parse errors since those are handled in rewrite warning handling
          if (
            match_results.warning.indexOf("Match rule parse error: :") === -1
          ) {
            push(
              "Matcher Warning",
              match_results.warning,
              ToastVariant.warning
            );
          }
        }
        setMatches(match_results.result.matches);
        setMatched(
          match_results.result.matches
            .map((match: Record<string, unknown>) => match.matched)
            .join("\n")
        );
      } catch (err) {
        console.error(err);
      }
      setInvokingMatch(false);
    })().catch((err) => {
      push(
        "Match Run Error",
        err.message ? err.message : err,
        ToastVariant.danger
      );
    });
  }, [debouncedSource, matchTemplate, language]);

  // invoke rewrite rpc whenever rewrite related input fields change
  useEffect(() => {
    (async () => {
      console.log("invoking rewrite rpc");
      setInvokingMatch(true);
      try {
        let result = await invoke<PlaygroundResult>("playground_rewrite", {
          source,
          language,
          matchTemplate,
          rewriteTemplate,
          rule,
        });
        let rewrite_results = {
          ...result,
          result: result.result
            ? JSON.parse(result.result)
            : {
                uri: null,
                matches: [],
                in_place_substitutions: [],
                rewritten_source: "",
                diff: "",
              },
        };
        if (rewrite_results.warning) {
          // we only handle non-rule parse error in rewriter as it will already be handled by match_results.warning handling
          if (
            rewrite_results.warning.indexOf("Match rule parse error: :") !== -1
          ) {
            setRuleError(
              rewrite_results.warning.replace("Match rule parse error: : ", "")
            );
          } else {
            push(
              "Rewriter Warning",
              rewrite_results.warning,
              ToastVariant.warning
            );
            setRuleError(null);
          }
        } else {
          setRuleError(null);
        }
        setRewrites(rewrite_results.result.in_place_substitutions);
        setRewritten(rewrite_results.result.rewritten_source);
      } catch (err) {
        console.error(err);
      } finally {
        setInvokingMatch(false);
      }
    })().catch((err) => {
      push(
        "Match Run Error",
        err.message ? err.message : err,
        ToastVariant.danger
      );
    });
  }, [
    debouncedSource,
    matchTemplate,
    rewriteTemplate,
    language,
    debouncedRule,
  ]);

  const run = useCallback(async () => {
    if (!rewriteTemplate) {
      return;
    }
    console.log("invoking rpc");
    try {
      //  setLoading(true);
      let results = (
        await Promise.all([
          invoke<PlaygroundResult>("playground_match", {
            source,
            matchTemplate,
            language,
            rule,
          }),
          invoke<PlaygroundResult>("playground_rewrite", {
            source,
            language,
            matchTemplate,
            rewriteTemplate,
            rule,
          }),
        ])
      ).map((r) => {
        return {
          ...r,
          result: r.result
            ? JSON.parse(r.result)
            : {
                uri: null,
                matches: [],
                in_place_substitutions: [],
                rewritten_source: "",
                diff: "",
              },
        };
      }) as unknown as [PlaygroundMatchResult | PlaygroundRewriteResult];

      const match_results: PlaygroundMatchResult = results.find(
        (result) => result.result_type === PlaygroundResultType.Match
      ) as PlaygroundMatchResult;
      const rewrite_results: PlaygroundRewriteResult = results.find(
        (result) => result.result_type === PlaygroundResultType.Rewrite
      ) as PlaygroundRewriteResult;

      if (match_results.warning) {
        if (match_results.warning.indexOf("Match rule parse error: :") !== -1) {
          setRuleError(
            match_results.warning.replace("Match rule parse error: : ", "")
          );
        } else {
          push("Matcher Warning", match_results.warning, ToastVariant.warning);
          setRuleError(null);
        }
      } else {
        setRuleError(null);
      }

      if (rewrite_results.warning) {
        // we dont need to handle rule parse error in rewriter as it will already be handled by match_results.warning handling
        if (
          rewrite_results.warning.indexOf("Match rule parse error: :") === -1
        ) {
          push(
            "Rewriter Warning",
            rewrite_results.warning,
            ToastVariant.warning
          );
        }
      }
      setMatches(match_results.result.matches);
      setMatched(
        match_results.result.matches
          .map((match: Record<string, unknown>) => match.matched)
          .join("\n")
      );
      setRewrites(rewrite_results.result.in_place_substitutions);
      setRewritten(rewrite_results.result.rewritten_source);
    } catch (error) {
      // @ts-ignore
      push("App Error", error.message || error, ToastVariant.danger);
    }
    //setLoading(false);
  }, [
    debouncedSource,
    debouncedMatchTemplate,
    debouncedRewriteTemplate,
    debouncedRule,
    language,
  ]);

  const onLanguageSelect = (value: string, option: LanguageOption) => {
    setLanguage(value);
    setAceMode(option.mode || "");
  };

  const offsetToRowCol = (source: string, offset: number) => {
    let head = source.substring(0, offset);
    let row = (head.match(/\n/g) || []).length;
    let lastNewlineIndex = head.lastIndexOf("\n") || 0;
    let col = head.length - lastNewlineIndex - 1;
    return { row, col };
  };

  const matchedMarkers: IMarker[] = matches.reduce(
    (prev, cur) =>
      [
        ...prev,
        {
          startCol: cur.range.start.column - 1,
          endCol: cur.range.end.column - 1,
          startRow: cur.range.start.line - 1,
          endRow: cur.range.end.line - 1,
          className: "matched",
          type: "text",
        },
        ...cur.environment.map((env) => {
          return {
            startRow: env.range.start.line - 1,
            startCol: env.range.start.column - 1,
            endRow: env.range.end.line - 1,
            endCol: env.range.end.column - 1,
            className: "matched-hole",
            type: "text",
          };
        }),
      ] as IMarker[],
    [] as IMarker[]
  );

  const rewrittenMarkers: IMarker[] = rewrites.reduce((prev, cur) => {
    let start = offsetToRowCol(rewritten, cur.range.start.offset);
    let end = offsetToRowCol(rewritten, cur.range.end.offset);
    return [
      ...prev,
      {
        startRow: start.row,
        startCol: start.col,
        endRow: end.row,
        endCol: end.col,
        className: "rewritten",
        type: "text",
      },
      ...cur.environment.map((env) => {
        const offset = cur.range.start.offset;
        let start = offsetToRowCol(rewritten, offset + env.range.start.offset);
        let end = offsetToRowCol(rewritten, offset + env.range.end.offset);
        return {
          startRow: start.row,
          startCol: start.col,
          endRow: end.row,
          endCol: end.col,
          className: "rewritten-hole",
          type: "text",
        };
      }),
    ] as IMarker[];
  }, [] as IMarker[]);

  return (
    <div style={{ padding: "1em 1em", height: "100%" }}>
      <Form
        style={{ display: "flex", flexDirection: "column", height: "100%" }}
      >
        <Form.Group
          style={{
            flexGrow: 1,
            height: "100%",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            rowGap: "0.5em",
            columnGap: "1em",
            gridTemplateRows: "24px auto",
          }}
        >
          <Form.Label
            style={{
              alignItems: "center",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <strong>
              <small>Source Code </small>
            </strong>
            <small>
              <LanguageSelect
                defaultValue={language}
                onChange={onLanguageSelect}
              />
            </small>
          </Form.Label>
          <Form.Label
            style={{
              alignItems: "center",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <strong>
              <small>Rewritten</small>
            </strong>
            <ImportButton id={id} />
          </Form.Label>
          <div
            ref={sourceBoxRef}
            className={"form-control"}
            style={{
              overflow: "auto",
              resize: "vertical",
              padding: 0,
              minHeight: "calc(3em + 0.5em)",
              width: "100%",
              paddingBottom: "5px",
            }}
          >
            {sourceSize && (
              <AceWrapper
                language={aceMode}
                width={sourceSize.width}
                height={sourceSize.height}
                onChange={(value) => setSource(value)}
                value={source}
                markers={matchedMarkers}
              />
            )}
          </div>
          <div
            ref={rewrittenBoxRef}
            className={"form-control"}
            style={{
              overflow: "auto",
              resize: "vertical",
              padding: 0,
              minHeight: "calc(3em + 0.5em)",
              width: "100%",
              paddingBottom: "5px",
            }}
          >
            {rewrittenSize && (
              <AceWrapper
                language={aceMode}
                width={rewrittenSize.width}
                height={rewrittenSize.height}
                readOnly={true}
                value={rewritten}
                markers={rewrittenMarkers}
              />
            )}
          </div>
        </Form.Group>
        <div
          style={{
            flexShrink: 1,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            columnGap: "1em",
          }}
        >
          <Form.Group className="mb-3" controlId="matchTemplate">
            <Form.Label>
              <strong>
                <small>Match Template</small>
              </strong>
            </Form.Label>
            <Textarea
              state={matchTemplateFamily(id)}
              rows={3}
              placeholder="Match template"
              autoCapitalize={"off"}
              autoCorrect={"off"}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="rewriteTemplate">
            <Form.Label>
              <strong>
                <small>Rewrite Template</small>
              </strong>
            </Form.Label>
            <Textarea
              state={rewriteTemplateFamily(id)}
              rows={3}
              placeholder="Rewrite template"
              autoCapitalize={"off"}
              autoCorrect={"off"}
            />
          </Form.Group>
          <Form.Group
            className="mb-3"
            controlId="rule"
            style={{ gridColumnStart: "span 2" }}
          >
            <Form.Label>
              <strong>
                <small>Rule</small>
              </strong>
            </Form.Label>
            <InputGroup>
              <Textarea
                state={ruleFamily(id)}
                name={"rule"}
                rows={1}
                placeholder="rule expression"
                className={`${ruleError ? "text-warning" : ""}`}
                autoCapitalize={"off"}
                autoCorrect={"off"}
              />
              {ruleError && (
                <OverlayTrigger
                  placement="right"
                  delay={{ show: 250, hide: 400 }}
                  overlay={(props) => (
                    <Tooltip id="button-tooltip" {...props}>
                      {ruleError}
                    </Tooltip>
                  )}
                >
                  <InputGroup.Text className={"text-warning"}>
                    <AiOutlineWarning />
                  </InputGroup.Text>
                </OverlayTrigger>
              )}
            </InputGroup>
          </Form.Group>
        </div>
      </Form>
    </div>
  );
};
export default Playground2;
