import { CombyMatch, CombyRewrite } from "../Playground/Comby";

export enum FilesystemResultType {
  Match = "Match",
  Rewrite = "Rewrite",
  RewriteFile = "RewriteFile",
}

export type FilesystemResult = {
  result_type: FilesystemResultType;
  result: string | null;
  warning?: string;
};
export type FilesystemMatchResult = {
  result_type: FilesystemResultType.Match;
  result: Array<CombyMatch>;
  warning?: string;
};
export type FilesystemRewriteResult = {
  result_type: FilesystemResultType.Rewrite;
  result: Array<CombyRewrite>;
  warning?: string;
};
export type FilesystemRewriteFileResult = {
  result_type: FilesystemResultType.Rewrite;
  result?: string;
  warning?: string;
};

type RewriteStatus = {
  applied?: boolean;
  skipped?: boolean;
};

export type CombyRewriteStatus = CombyRewrite & RewriteStatus;
