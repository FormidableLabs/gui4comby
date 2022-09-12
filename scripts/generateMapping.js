// sample represents the simplified color palette.
// themeFile represents the vscode theme
// for each sample color, find all the vscode theme entries w/ a matching color
// displays a list of each sample entry and potential candidates
// which is then used as a reference when crafting the mapping by hand
import fs from 'fs';
const themeFile = fs.readFileSync('./themes/sources/ayu-ayu-mirage-bordered.json').toString('utf-8');
const theme = JSON.parse(themeFile);
const sample = {
  "syntax": {
    "tag": "#5ccfe6",
    "func": "#ffd173",
    "entity": "#73d0ff",
    "string": "#d5ff80",
    "regexp": "#95e6cb",
    "markup": "#f28779",
    "keyword": "#ffad66",
    "special": "#ffdfb3",
    "comment": "#b8cfe680",
    "constant": "#dfbfff",
    "operator": "#f29e74"
  },
  "vcs": {
    "added": "#87d96c",
    "modified": "#80bfff",
    "removed": "#f27983"
  },
  "editor": {
    "fg": "#cccac2",
    "bg": "#242936",
    "line": "#1a1f29",
    "selection": {
      "active": "#409fff40",
      "inactive": "#409fff21"
    },
    "findMatch": {
      "active": "#695380",
      "inactive": "#69538066"
    },
    "gutter": {
      "active": "#8a9199cc",
      "normal": "#8a919966"
    },
    "indentGuide": {
      "active": "#8a919959",
      "normal": "#8a91992e"
    }
  },
  "ui": {
    "fg": "#707a8c",
    "bg": "#1f2430",
    "line": "#171b24",
    "selection": {
      "active": "#63759926",
      "normal": "#69758c1f"
    },
    "panel": {
      "bg": "#1c212b",
      "shadow": "#12151cb3"
    }
  },
  "common": {
    "accent": "#ffcc66",
    "error": "#ff6666"
  }
};

const identify = (obj, label= null) => {
  for(let key of Object.keys(obj)) {
    if(typeof obj[key] === 'object') {
      identify(obj[key], label ? `${label}.${key}` : key);
    } else {
      let color = obj[key];
      let color_candidates = Object.keys(theme.colors).filter(key => theme.colors[key] === color);
      let token_candidates = theme.tokenColors
        .filter(token => token.settings.foreground === color || token.settings.background === color)
        .map(token => {
          if(token.settings.foreground === color) {
            return {scope: token.scope, foreground: token.settings.foreground}
          } else {
            return {scope: token.scope, background: token.settings.background}
          }
        })
      console.log(label ? `${label}.${key}`: key, color, color_candidates, token_candidates);
    }
  }
}

identify(sample);
