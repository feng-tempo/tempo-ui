import {formPreviewPlugin} from './form-preview-plugin.mjs';
import {build} from 'esbuild';import fs from 'node:fs';import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const project=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
if(path.resolve('.')!==project)throw new Error('Run build from this pilot project root');
for(const config of ['tsconfig.json','tsconfig.catalogue.json'])execFileSync(process.execPath,[path.join(project,'node_modules/typescript/bin/tsc'),'-p',config,'--pretty','false'],{stdio:'inherit'});
const generated=path.join(project,'packages/ui/dist/web');
if(!generated.startsWith(project+path.sep))throw new Error('Generated target outside project');
// Preserve generated files as well while deletion approval is pending.
fs.mkdirSync(generated,{recursive:true});
const common={bundle:true,format:'esm',platform:'browser',jsx:'automatic',target:'es2020',resolveExtensions:['.web.tsx','.web.ts','.tsx','.ts','.js'],alias:{'react-native':'react-native-web'},loader:{'.ttf':'dataurl'},logLevel:'info'};
const entries={'fields/extended':'packages/ui/src/entries/extended.ts','fields/selection':'packages/ui/src/entries/selection.ts','fields/switch':'packages/ui/src/entries/switch.ts','actions/nav':'packages/ui/src/entries/nav.ts','overlays/confirm':'packages/ui/src/entries/confirm.ts',comments:'packages/ui/src/entries/comments.ts',index:'packages/ui/src/index.ts','actions/button':'packages/ui/src/entries/button.ts','fields/text':'packages/ui/src/entries/text.ts','fields/number':'packages/ui/src/entries/number.ts','fields/checkbox':'packages/ui/src/entries/checkbox.ts','fields/dropdown':'packages/ui/src/entries/dropdown.ts',overlays:'packages/ui/src/overlays/DropdownPanel.web.tsx',theme:'packages/ui/src/theme/index.tsx'};
const result=await build({...common,entryPoints:entries,outdir:'packages/ui/dist/web',external:['react','react/jsx-runtime','react-dom','react-native-web'],splitting:true,metafile:true});
const libraryOnly=process.argv.includes('--library-only');
const libraryEvidence=libraryOnly?'evidence/expo-web':'../T-2026-0042-pilot/evidence';
fs.mkdirSync(libraryEvidence,{recursive:true});fs.writeFileSync(libraryEvidence+'/library-build-metafile.json',JSON.stringify(result.metafile,null,2));
if(libraryOnly){console.log('Built web library only; no mobileapp source or native build.');process.exit(0);}
const demo=await build({...common,entryPoints:['apps/catalogue/App.tsx'],plugins:[formPreviewPlugin(project)],tsconfigRaw:{compilerOptions:{jsx:'react-jsx'}},outfile:'dist/catalogue/catalogue.js',alias:{...common.alias,'@tempo/ui':path.resolve('packages/ui/dist/web/index.js')},metafile:true,define:{'process.env.NODE_ENV':'"development"'}});
for(const file of ['index.html','catalogue.css'])fs.copyFileSync('apps/catalogue/'+file,'dist/catalogue/'+file);
fs.writeFileSync('../T-2026-0042-pilot/evidence/catalogue-build-metafile.json',JSON.stringify(demo.metafile,null,2));
console.log('Built web library and catalogue from package artifact. Native build not performed.');
