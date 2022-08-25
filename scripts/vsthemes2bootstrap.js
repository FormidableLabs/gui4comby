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

`;

    output += cssContent;
    console.log(cssContent);
})

fs.writeFileSync(path.resolve('src/themes.css'), output);
