import {CombyMatch, CombyRewrite} from "../Playground/Comby";

export enum FilesystemResultType {
  Match = 'Match',
  Rewrite = 'Rewrite'
}

export type FilesystemResult = {
  result_type: FilesystemResultType;
  result: string | null;
  warning?: string;
}
export type FilesystemMatchResult = {
  result_type: FilesystemResultType.Match;
  result: Array<CombyMatch>;
  warning?: string;
}
export type FilesystemRewriteResult = {
  result_type: FilesystemResultType.Rewrite;
  result: Array<CombyRewrite>;
  warning?: string;
}
