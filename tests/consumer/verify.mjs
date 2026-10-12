import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';import crypto from 'node:crypto';
import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import * as ui from '@tempo/ui';
import {TextInputField} from '@tempo/ui/fields/text';import {GButton} from '@tempo/ui/actions/button';
assert.equal(ui.TextInputField,TextInputField);assert.equal(ui.GButton,GButton);
const html=renderToStaticMarkup(React.createElement(TextInputField,{value:'Packed consumer',disabled:true}));assert.match(html,/value="Packed consumer"/);assert.match(html,/readonly=""/);
const require=createRequire(import.meta.url);const pkgRequire=createRequire(require.resolve('@tempo/ui'));
assert.equal(require.resolve('react'),pkgRequire.resolve('react'));
const installedRoot=path.resolve(path.dirname(require.resolve('@tempo/ui')),'../..');const sourceRoot=path.resolve('../../packages/ui');
assert.deepEqual(JSON.parse(fs.readFileSync(installedRoot+'/package.json','utf8')).exports,JSON.parse(fs.readFileSync(sourceRoot+'/package.json','utf8')).exports);
let files=0;function compare(folder){for(const entry of fs.readdirSync(sourceRoot+'/'+folder,{withFileTypes:true})){const relative=folder+'/'+entry.name;if(entry.isDirectory())compare(relative);else{assert.equal(fs.readFileSync(sourceRoot+'/'+relative).compare(fs.readFileSync(installedRoot+'/'+relative)),0,relative);files++;}}}
compare('src');compare('dist');
const tarball=fs.readFileSync('../../artifacts/tempo-ui-0.1.0-dev.1.tgz');
const report={passed:true,package:'@tempo/ui@0.1.0-dev.1',installation:'local tarball; initial install offline, metadata-refresh setup permitted; lifecycle scripts disabled',checks:['root and subpath exports agree','packed control renders from consumer installation','same React runtime resolved by consumer and package','all current source/dist files match installed artifact'],matched_files:files,tarball_sha256:crypto.createHash('sha256').update(tarball).digest('hex'),mobileapp_integration:'deferred; not modified or executed',native_runtime:'not tested'};
fs.writeFileSync('../../../T-2026-0042-pilot/evidence/packed-consumer-correction-result.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
