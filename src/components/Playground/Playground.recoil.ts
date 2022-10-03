import {atomFamily, selectorFamily} from "recoil";
import { LanguageOptions } from "../LanguageSelect/LanguageOptions";
import {CombyMatch, CombyRewrite} from "./Comby";

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
  default: 'where true',
});

export const ruleErrorFamily = atomFamily<string|null, string>({
  key: 'playgroundRuleError',
  default: null
});

export const matchedFamily = atomFamily({
  key: 'playgroundMatched',
  default: '',
});

export const matchesFamily = atomFamily<CombyMatch["matches"], string>({
  key: 'playgroundMatches',
  default: []
});

export const rewrittenFamily = atomFamily({
  key: 'playgroundRewritten',
  default: '',
});

export const rewritesFamily = atomFamily<CombyRewrite["in_place_substitutions"],string>({
  key: 'playgroundRewrites',
  default: []
})

export const defaultLanguageFamily = atomFamily({
  key: 'playgroundDefaultLanguageFamily',
  default: '.js'
});

export const languageFamily = atomFamily({
  key: 'playgroundLanguageFamily',
  default: selectorFamily({
    key: 'playgroundLanguage/Default',
    get: param => ({get}) => {
      return get(defaultLanguageFamily(param));
    },
  }),
});

export const defaultExtensionFamily = selectorFamily({
  key: 'playgroundDefaultExtensionFamily',
  get: param => ({get}) => {
    let language = get(languageFamily(param));
    return LanguageOptions.find(o => o.value === language)?.extensions || '';
  }
})

export const loadingFamily = atomFamily({
  key: 'playgroundLoading',
  default: false,
});

export const aceModeFamily = atomFamily({
  key: 'playgroundAceMode',
  default: selectorFamily({
    key: 'playgroundAceMode/Default',
    get: param => ({get}) => {
      let language = get(defaultLanguageFamily(param));
      return LanguageOptions.find(o => o.value === language)?.mode || ''
    },
  }),
});

