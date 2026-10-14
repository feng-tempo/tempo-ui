import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import * as ui from '../packages/ui/dist/web/index.js';
import {execFileSync} from 'node:child_process';
const root=path.resolve('.');const manifest=JSON.parse(fs.readFileSync('packages/ui/package.json','utf8'));
test('root and named/default subpath exports expose the same five implementations',async()=>{
 for(const [entry,name] of [['actions/button','GButton'],['fields/text','TextInputField'],['fields/number','NumberInputField'],['fields/checkbox','CheckBox'],['fields/dropdown','RichDropDown']]){
  const module=await import('../packages/ui/dist/web/'+entry+'.js');assert.equal(module[name],ui[name]);assert.equal(module.default,ui[name]);assert.equal(typeof ui[name],'function');
 }
});
test('disabled button and mixed checkbox retain semantic state in rendered package output',()=>{
 const button=renderToStaticMarkup(React.createElement(ui.GButton,{label:'Blocked',disabled:true}));assert.match(button,/role="button"/);assert.match(button,/aria-disabled="true"/);assert.match(button,/Blocked/);
 const checkbox=renderToStaticMarkup(React.createElement(ui.CheckBox,{value:false,indeterminate:true,label:'Mixed',disabled:true}));assert.match(checkbox,/aria-checked="mixed"/);assert.match(checkbox,/aria-disabled="true"/);
});
test('text controlled value and disabled editability survive public package boundary',()=>{
 const markup=renderToStaticMarkup(React.createElement(ui.TextInputField,{value:'fixture only',disabled:true,placeHolder:'Hint'}));assert.match(markup,/value="fixture only"/);assert.match(markup,/readonly=""/);assert.match(markup,/placeholder="Hint"/);
});
test('public declarations and all export targets exist; no publish lifecycle scripts',()=>{
 assert.equal(manifest.private,true);assert.equal(manifest.scripts,undefined);
 for(const entry of Object.values(manifest.exports))for(const target of Object.values(entry))assert.ok(fs.existsSync(path.join(root,'packages/ui',target)),target);
 assert.match(fs.readFileSync('packages/ui/dist/types/fields/NumberInputField.d.ts','utf8'),/outputAs\?: "string" \| "number"/);
});
test('library import closure contains no app auth/API/navigation or business transport',()=>{
 const meta=JSON.parse(fs.readFileSync('../T-2026-0042-pilot/evidence/library-build-metafile.json','utf8'));
 for(const filename of Object.keys(meta.inputs))assert.ok(filename.startsWith('packages/ui/src/')||/^node_modules\/\.pnpm\/(?:date-fns@|@codemirror\+|@uiw\+|@lezer\+|@marijn\+find-cluster-break@|style-mod@|w3c-keyname@|crelt@|@babel\+runtime@)/.test(filename),filename);
 function visit(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const filename=path.join(dir,entry.name);if(entry.isDirectory())visit(filename);else if(/\.(tsx?|jsx?|mjs)$/.test(filename)){const source=fs.readFileSync(filename,'utf8');assert.doesNotMatch(source,/@\/|apiService|authContext|expo-router|\bfetch\s*\(|XMLHttpRequest|WebSocket/);}}}visit('packages/ui/src');
});
test('source provenance snapshots match immutable source and explicit staging ownership',()=>{
 const evidence=JSON.parse(fs.readFileSync('source-provenance.json','utf8'));assert.equal(evidence.files.length,6);
 for(const item of evidence.files){const digest=buffer=>crypto.createHash('sha256').update(buffer).digest('hex');assert.equal(digest(fs.readFileSync(item.snapshot)),item.sha256);const committed=execFileSync('git',['-C',evidence.source_checkout,'show',item.revision+':'+item.original],{encoding:'utf8'});assert.equal(fs.readFileSync(item.snapshot,'utf8').replace(/\r\n/g,'\n'),committed.replace(/\r\n/g,'\n'));assert.match(item.ownership,/staging/);}
});
