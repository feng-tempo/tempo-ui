import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';
export function formPreviewPlugin(project){
 const source=path.resolve(project,'../tempomobileapp'),form=path.join(source,'components/ui/web/form'),require=createRequire(path.join(project,'package.json'));
 const modes=JSON.parse(fs.readFileSync(path.join(project,'apps/catalogue/form-fields.json'),'utf8'));
 const entries=Object.fromEntries(modes.map(item=>[item.type,path.join(source,item.source)]));
 const packaged={'TextInputField':'fields/text.js','DropdownGroup':'fields/dropdown.js','NumberInputField':'fields/number.js','CheckBox':'fields/checkbox.js'};
 const lookup=filename=>{for(const ext of ['.web.tsx','.web.ts','.tsx','.ts','.js'])if(fs.existsSync(filename+ext))return filename+ext;throw new Error('Unknown local preview import '+filename);};
 return {name:'actual-form-fields-with-local-ports',setup(builder){
  builder.onResolve({filter:/^mobile-field:/},args=>{const file=entries[args.path.slice(13)];if(!file)throw new Error('Unmapped field '+args.path);return {path:file.replace('JsonCodeEditorField.tsx','JsonCodeEditorField.web.tsx')};});
  builder.onResolve({filter:/^react-native-gesture-handler$/},()=>({path:'text-input',namespace:'preview-port'}));
  builder.onLoad({filter:/.*/,namespace:'preview-port'},()=>({contents:'export {TextInput} from "react-native-web";',loader:'js',resolveDir:project}));
  builder.onResolve({filter:/^@expo\/vector-icons(?:\/.*)?$/},args=>args.path==='@expo/vector-icons'?{path:path.join(project,'apps/catalogue/previewIcons.tsx')}:{path:args.path.split('/').pop(),namespace:'preview-icon'});
  builder.onLoad({filter:/.*/,namespace:'preview-icon'},args=>({contents:`export {${args.path} as default} from ${JSON.stringify(path.join(project,'apps/catalogue/previewIcons.tsx'))};`,loader:'js',resolveDir:project}));
  builder.onResolve({filter:/^@\//},args=>{
   if(args.path==='@/components/ui/web/general/DropdownPanel')return {path:path.join(project,'apps/catalogue/previewOverlay.ts')};
   if(args.path==='@/components/ui/web/general/NotificationPanel'||['@/service/apiService/form/lookupFieldSer','@/service/apiService/form/asyncDropdownSer','@/service/apiService/files/fileSer'].includes(args.path))return {path:path.join(project,'apps/catalogue/mockServices.ts')};
   if(args.path==='@/components/ui/web/general/ErrorPanel')return {path:'error',namespace:'general-preview-port'};
   if(args.path.startsWith('@/components/ui/web/form/')){const name=args.path.split('/').pop();return {path:packaged[name]?path.join(project,'packages/ui/dist/web',packaged[name]):lookup(path.join(source,args.path.slice(2)))};}
   throw new Error('Blocked application boundary in preview: '+args.path);
  });
  builder.onLoad({filter:/.*/,namespace:'general-preview-port'},()=>({contents:`export {ErrorPanel as default} from ${JSON.stringify(path.join(project,'apps/catalogue/previewPorts.tsx'))};`,loader:'js',resolveDir:project}));
  builder.onResolve({filter:/^\./},args=>{
   if(!args.importer.startsWith(source+path.sep))return;
   if(args.path.endsWith('/ErrorPanel'))return {path:'error',namespace:'general-preview-port'};
   if(args.path.endsWith('/tooltip/useTooltip'))return {path:path.join(project,'apps/catalogue/previewPorts.tsx')};
   const name=path.basename(args.path);if(packaged[name])return {path:path.join(project,'packages/ui/dist/web',packaged[name])};
   return {path:lookup(path.resolve(path.dirname(args.importer),args.path))};
  });
  builder.onResolve({filter:/^[^./@]|^@(?:codemirror|uiw)\//},args=>{if(args.importer.startsWith(source+path.sep))return {path:require.resolve(args.path==='react-native'?'react-native-web':args.path)};});
  builder.onLoad({filter:/\.(tsx|ts)$/},args=>{
   if(!args.path.startsWith(source+path.sep))return;
   if(!args.path.startsWith(form+path.sep)&&args.path!==path.join(source,'components/ui/web/button/NavBtn.tsx'))throw new Error('Unapproved source module '+args.path);
   let contents=fs.readFileSync(args.path,'utf8');
   // Catalogue preference: currency selection is required, so omit its clear action.
   // Apply only at this consumer; leave the original checkout and other dropdowns unchanged.
   if(args.path===path.join(form,'MoneyWithCurrencyField.tsx')){
    const clearProp=/\ballowClear\s*\n/;
    if(!clearProp.test(contents))throw new Error('Currency preview clear-option source changed');
    contents=contents.replace(clearProp,'allowClear={false}\n');
   }
   return {contents,loader:args.path.endsWith('tsx')?'tsx':'ts'};
  });
 }};
}
