import fs from 'fs';
import path from 'path';
import glob from 'glob';

let output = '';
glob.sync(path.resolve('themes/*.json')).forEach(filename => {
  const themeContent = fs.readFileSync(filename).toString('utf8');
  const theme = JSON.parse(themeContent);

  const className = path.basename(filename).split('.').shift();

  const cssContent = `
.${className} {
  background: ${theme.colors['panel.background']};
  color: ${theme.colors['editor.foreground']};
  --bs-border-color: ${theme.colors['tab.border']};
  --bs-table-striped-bg: ${theme.colors['tab.activeBackground']};
  --bs-table-striped-color: ${theme.colors['tab.activeForeground']};
  
  --theme-focus-bg: ${theme.colors['list.activeSelectionBackground']};
  --theme-focus-color: ${theme.colors['list.highlightForeground']};  
} 

.${className} .text-muted {
  color: ${theme.colors['tab.inactiveForeground']};
  --bs-table-striped-color: ${theme.colors['tab.inactiveForeground']};
}

.${className} .nav {
  --bs-nav-link-color: ${theme.colors['tab.inactiveForeground']};
  --bs-nav-link-hover-color: ${theme.colors['tab.activeForeground']};
  --bs-nav-link-disabled-color: ${theme.colors['tab.unfocusedInactiveForeground']};
}

.${className} .nav-tabs {
  --bs-nav-link-color: ${theme.colors["tab.inactiveForeground"]};
  --bs-nav-tabs-border-color: ${theme.colors['tab.border']};
  --bs-nav-tabs-border-radius: 0;
  --bs-nav-tabs-link-hover-border-color: ${theme.colors['tab.activeBorder']};
  --bs-nav-tabs-link-active-color: ${theme.colors['tab.activeForeground']};
  --bs-nav-tabs-link-active-bg: ${theme.colors['tab.activeBackground']};
  --bs-nav-tabs-link-active-border-color: ${theme.colors['tab.activeBorderTop']};  
}

.${className} .nav-link {
  border-color: var(--bs-nav-tabs-border-color);
  border-left: solid 1px transparent;
}
.${className} .nav-link.active {
  border-left: solid 1px ${theme.colors['tab.activeBorderTop']};
}

.${className} .form-control {
  color: ${theme.colors['input.foreground']};
  background: ${theme.colors['input.background']};
  border-color: ${theme.colors['input.border']};
  --bs-input-focus-bg:                        $input-bg;
  --bs-input-focus-border-color:              tint-color($component-active-bg, 50%);
  --bs-input-focus-color:                     $input-color;
  --bs-input-placeholder-color:               $gray-600;
  --bs-input-plaintext-color:                 $body-color;
}

.${className} .btn {
  --bs-btn-color: ${theme.colors['input.foreground']};
  --bs-btn-bg: ${theme.colors['input.background']};
  --bs-btn-border-color: ${theme.colors['input.border']};
}

.${className} .btn.btn-primary {
  --bs-btn-color: ${theme.colors['tab.inactiveForeground']};
  --bs-btn-bg: ${theme.colors['input.background']};
  --bs-btn-border-color: ${theme.colors['input.border']};
  --bs-btn-hover-color: ${theme.colors['input.activeForeground']};
  --bs-btn-hover-bg: ${theme.colors['input.activeBackground']};
  --bs-btn-hover-border-color: ${theme.colors['tab.activeBorderTop']};
  --bs-btn-focus-shadow-rgb: 49,132,253;
  --bs-btn-active-color: ${theme.colors['input.activeForeground']};
  --bs-btn-active-bg: ${theme.colors['input.activeBackground']};
  --bs-btn-active-border-color: ${theme.colors['tab.activeBorderTop']};
  /*
  --bs-btn-disabled-color: #fff;
  --bs-btn-disabled-bg: #0d6efd;
  --bs-btn-disabled-border-color: #0d6efd;
  */  
}
.${className} .btn:active {
  --bs-btn-color: ${theme.colors['tab.activeForeground']};
  --bs-btn-bg: ${theme.colors['tab.activeBackground']};
  --bs-btn-border-color: ${theme.colors['tab.activeBorderTop']};  
}

.${className} .form-select {
  color: ${theme.colors['list.highlightForeground']};
  background-color: ${theme.colors['list.activeSelectionBackground']};
  border-color: ${theme.colors['list.focusOutline']};
}

.${className} .input-group-text {
  color: ${theme.colors['list.highlightForeground']};
  background-color: ${theme.colors['list.activeSelectionBackground']};
  border-color: ${theme.colors['list.focusOutline']};
}

/* ACE Editor Theme */
.${className} .ace_gutter {
background: ${theme.colors['editorWidget.background']};
color: ${theme.colors['editor.foreground']};
}

.${className} .ace_print-margin {
background: ${theme.colors['editor.background']}
}

.${className} .ace_editor {
  background: ${theme.colors['editor.background']};
  color: ${theme.colors['editor.foreground']};
}

.${className} .ace-layer..ace_marker-layer .ace_active-line {
  background: ${theme.colors['list.activeSelectionBackground']};
  color: ${theme.colors['list.activeSelectionForeground']};
}

.${className} .ace-tm .ace_gutter-active-line {
  background: ${theme.colors['list.focusBackground']};
  color: ${theme.colors['list.focusForeground']};
}
`;

    output += cssContent;
    console.log(cssContent);
})

fs.writeFileSync(path.resolve('src/themes.css'), output);
