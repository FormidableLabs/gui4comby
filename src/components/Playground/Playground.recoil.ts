import {atomFamily} from "recoil";

export const sourceFamily = atomFamily({
  key: 'playgroundSource',
  default: '',
});

export const matchTemplateFamily = atomFamily({
  key: 'playgroundMatchTemplate',
  default: '',
});

export const rewriteTemplateFamily = atomFamily({
  key: 'playgroundRewriteTemplate',
  default: '',
});

export const ruleFamily = atomFamily({
  key: 'playgroundRule',
  default: '',
});

export const matchedFamily = atomFamily({
  key: 'playgroundMatched',
  default: '',
});

export const rewrittenFamily = atomFamily({
  key: 'playgroundRewritten',
  default: '',
});

export const languageFamily = atomFamily({
  key: 'playgroundLanguage',
  default: '.generic',
});

export const loadingFamily = atomFamily({
  key: 'playgroundLoading',
  default: false,
});

export const aceModeFamily = atomFamily({
  key: 'playgroundAceMode',
  default: '',
});

