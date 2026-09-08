// Build/test tooling only; never imported by the page or scene.
const esbuild = require(process.env.FM_ESBUILD || 'esbuild');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');
const output = path.join(__dirname, 'verification');
fs.mkdirSync(output, {recursive:true});
const bundle = path.join(output, 'scene-budget.js');
esbuild.buildSync({entryPoints:[path.join(__dirname,'../HeroScene3D.tsx')],bundle:true,
  minify:true,format:'esm',target:'es2022',outfile:bundle,
  external:['three','three/*'],define:{'process.env.NODE_ENV':'"production"'}});
const bytes = zlib.gzipSync(fs.readFileSync(bundle)).length;
assert.ok(bytes <= 250000, `Scene exceeds 250 KB gzip excluding Three: ${bytes}`);
const report = {gzipBytesExcludingThree:bytes,limitBytes:250000,
  note:'Standalone minified production bundle; includes React/R3F/Drei dependencies, externalizes three and three/* only.'};
fs.writeFileSync(path.join(output,'code-report.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
const test = path.join(output,'timeline.test.cjs');
esbuild.buildSync({entryPoints:[path.join(__dirname,'timeline.test.ts')],bundle:true,
  platform:'node',format:'cjs',outfile:test});
execFileSync(process.execPath,['--test',test],{stdio:'inherit'});
