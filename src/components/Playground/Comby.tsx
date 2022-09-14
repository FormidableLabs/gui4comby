export type CombyPosition = {
  offset: number;
  line: number;
  column: number;
}
export type CombyRange = {
  start: CombyPosition,
  end: CombyPosition;
}
export type CombyEnvironment = {
  variable: string;
  value: string;
  range: CombyRange;
}
export type CombyMatch = {
  uri?: string;
  matches: Array<{
    matched: string;
    range: CombyRange;
    environment: Array<CombyEnvironment>
  }>
}
export type CombyRewrite = {
  uri?: string;
  rewritten_source: string;
  in_place_substitutions: Array<{
    range: CombyRange;
    replacement_content: string;
    environment: Array<CombyEnvironment>
  }>;
  diff: string;
}
