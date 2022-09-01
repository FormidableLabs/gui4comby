import fs from 'fs';
import path from 'path';
import glob from 'glob';
import {execSync} from "child_process";
import {basename} from "path";

const cmd = `git checkout comby.dev/master -- website/docs`;
console.log(`updating docs\n$> ${cmd}`);
console.log(execSync(cmd).toString('utf8'));

const mv = `cp -rf website/docs/* src/docs/`;
console.log(`moving docs\n$> ${mv}`);
console.log(execSync(mv).toString('utf8'));

const rm = `rm -rf website/docs/*`;
console.log(`cleaning up\n$> ${rm}`);
console.log(execSync(rm).toString('utf8'));
const rm2 = `rm -rf website`;
console.log(`cleaning up\n$> ${rm2}`);
console.log(execSync(rm2).toString('utf8'));


let output = '';
let mapping = {};
glob.sync(path.resolve('src/docs/*.md')).forEach(filename => {
  const [name, ext] = basename(filename).split('.');
  const componentName = name.replace(/(^[a-zA-Z]|-[a-zA-Z])/g, function(v) {
    return v.slice(-1).toUpperCase();
  });
  output += `import ${componentName} from './${name}.${ext}';\n`;
  mapping[name] = componentName;
});

output += 'export const docs = {\n';
Object.keys(mapping).forEach(key => {
 output += `  "${key}": ${mapping[key]},\n`;
});
output += '};\n';
console.log(output);

const filepath = 'src/docs/index.ts';
fs.writeFileSync(filepath, output);
