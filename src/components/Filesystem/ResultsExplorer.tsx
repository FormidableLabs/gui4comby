import {
  AiOutlineArrowLeft,
  AiOutlineArrowRight,
  AiOutlineCheckCircle,
  AiOutlineCloseCircle,
  AiOutlineDiff,
} from "react-icons/all";
import { Button, Spinner } from "react-bootstrap";
import { useCallback, useEffect, useState } from "react";
import ReactDiffViewer, { DiffMethod } from "react-diff-viewer";
import { invoke } from "@tauri-apps/api/tauri";
import useToaster, { ToastVariant } from "../Toaster/useToaster";
import { useRecoilValue } from "recoil";
import { appThemeAtom } from "../../App.recoil";
import { CombyRewriteStatus } from "./Filesystem.types";

type Props = {
  results: Array<CombyRewriteStatus>;
  path: string;
  applyFunc?: (uri: string) => Promise<void>;
  skipFunc?: (uri: string, skipped: boolean) => Promise<void>;
};

const ResultsExplorer = ({ applyFunc, path, results, skipFunc }: Props) => {
  const [index, setIndex] = useState(0);
  const [applying, setApplying] = useState(false);

  const onApplyClick = useCallback(async () => {
    if (!applyFunc) {
      return;
    }
    try {
      setApplying(true);
      await applyFunc(results[index].uri!);
    } catch (err) {
      console.error(err);
    } finally {
      setApplying(false);

      // The results starting after this index, looping back to the start and
      // continuing back to this index
      const upcomingResults = [
        ...results.slice(index + 1), // omit the current result
        ...results.slice(0, index),
      ];

      const nextUnhandledResultOffset =
        upcomingResults.findIndex((r) => !r.applied && !r.skipped) + 1;
      if (nextUnhandledResultOffset > 0) {
        // Advance to the next unhandled result if one exists
        setIndex((index + nextUnhandledResultOffset) % results.length);
      }
    }
  }, [applyFunc, index, setApplying, results]);

  const onSkipClick = useCallback(async () => {
    if (skipFunc) {
      try {
        await skipFunc(results[index].uri!, !results[index].skipped);
      } catch (err) {
        console.error(err);
      }
    }
  }, [skipFunc, index, results]);

  const onApplyAllClick = useCallback(async () => {
    if (!applyFunc) {
      return;
    }
    let order = results.map((_, i) =>
      i + index > results.length - 1 ? i + index - results.length : i + index
    );

    setApplying(true);
    for (let i of order) {
      if (results[i].applied || results[i].skipped) {
        continue;
      }
      try {
        await applyFunc(results[i].uri!);
      } catch (err) {
        console.error(err);
      }
    }
    setApplying(false);
  }, [index, applyFunc, setApplying, results]);

  const next = () => {
    setIndex(index + 1 >= results.length ? 0 : index + 1);
  };

  const prev = () => {
    setIndex(index - 1 < 0 ? results.length - 1 : index - 1);
  };

  const fs_path = results[index].uri!.replace("/mnt/source/", path);
  const applied = Boolean(results[index].applied);
  const skipped = Boolean(results[index].skipped);
  const finished = results.filter((r) => !r.applied && !r.skipped).length === 0;

  return (
    <div
      style={{ height: "100%", display: "grid", gridTemplateRows: "42px auto" }}
    >
      <div
        style={{
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          borderBottom: "solid 2px var(--border-color)",
          padding: "0.25em",
        }}
      >
        <span
          style={{
            display: "grid",
            columnGap: "0.25em",
            gridTemplateColumns: "1fr 1fr 1fr",
            alignItems: "center",
            justifyItems: "center",
            flexShrink: 0,
          }}
        >
          <AiOutlineDiff />
          <Button size={"sm"} variant={"default"} onClick={prev}>
            <AiOutlineArrowLeft />
          </Button>
          <Button size={"sm"} variant={"default"} onClick={next}>
            <AiOutlineArrowRight />
          </Button>
        </span>
        <Button
          disabled
          size={"sm"}
          variant={"secondary"}
          style={{ margin: "0 0.25em", whiteSpace: "nowrap" }}
        >
          {index + 1} of {results.length}
        </Button>
        <span
          style={{
            margin: "0 0.25em",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {fs_path}
        </span>
        <span style={{ marginLeft: "auto" }}>
          <span
            style={{
              display: "grid",
              columnGap: "0.25em",
              gridTemplateColumns: "0.75fr 1fr 1fr",
              alignItems: "center",
              justifyItems: "center",
            }}
          >
            <Button
              size={"sm"}
              variant={"default"}
              style={{ whiteSpace: "nowrap" }}
              onClick={onSkipClick}
              disabled={applied}
            >
              {skipped ? "Skipped" : "Skip"} <AiOutlineCloseCircle />
            </Button>
            {applying ? (
              <Spinner animation="border" />
            ) : (
              <Button
                size={"sm"}
                variant={"success"}
                style={{ whiteSpace: "nowrap" }}
                onClick={onApplyClick}
                disabled={applied || skipped}
              >
                {applied ? "Applied" : "Apply"} <AiOutlineCheckCircle />
              </Button>
            )}
            {
              <Button
                size={"sm"}
                variant={"success"}
                style={{ whiteSpace: "nowrap" }}
                onClick={onApplyAllClick}
                disabled={applying || finished}
              >
                {"Apply All"} <AiOutlineCheckCircle />
              </Button>
            }
          </span>
        </span>
        {/*<Button style={{marginLeft: '0.25em'}} variant={'default'} size={'sm'}><RiLayoutBottom2Line/></Button>*/}
      </div>
      <div style={{ height: "100%", overflowY: "scroll" }}>
        <Diff
          uri={fs_path}
          rewritten={results[index].rewritten_source}
          diff={results[index].diff}
        />
      </div>
    </div>
  );
};
export default ResultsExplorer;

const Diff = ({
  uri,
  rewritten,
  diff,
}: {
  uri: string;
  rewritten: string;
  diff: string;
}) => {
  const theme = useRecoilValue(appThemeAtom);
  const { push } = useToaster();
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState("Loading ...");

  const loadFile = useCallback(
    async (filename: string) => {
      setLoading(true);
      try {
        const results = await invoke<string>("filesystem_content", {
          path: filename,
        });
        setSource(results);
      } catch (err) {
        push("Load File Error", err as string, ToastVariant.danger);
      }
      setLoading(false);
    },
    [setLoading, setSource, push]
  );

  useEffect(() => {
    (async () => loadFile(uri))().catch(console.error);
  }, [uri]);

  if (loading) {
    return <div>Loading ...</div>;
  }

  // TODO if failed to load source content, just render diff (w/ prismJS?)

  return (
    <ReactDiffViewer
      oldValue={source}
      newValue={rewritten}
      splitView={true}
      compareMethod={DiffMethod.LINES}
      useDarkTheme={theme === "dark"}
      styles={
        {
          height: "100%",
        } as any
      }
    />
  );
};
