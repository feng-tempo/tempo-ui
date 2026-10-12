import {build} from 'esbuild';import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';
const project=path.resolve('.'),source=path.resolve('../tempomobileapp'),require=createRequire(path.join(project,'package.json'));
const entries={button:'components/ui/web/button/Btn.tsx',text:'components/ui/web/form/TextInputField.tsx',number:'components/ui/web/form/NumberInputField.tsx',checkbox:'components/ui/web/form/CheckBox.tsx',dropdown:'components/ui/web/form/DropdownGroup.tsx'};
const allowed=new Set([...Object.values(entries),'components/ui/web/form/FieldClearButton.tsx'].map(p=>path.join(source,p)));
const referencePorts={name:'read-only-original-controls',setup(builder){
 builder.onResolve({filter:/^original:/},args=>({path:path.join(source,entries[args.path.slice(9)])}));
 builder.onResolve({filter:/^react-native-gesture-handler$/},()=>({path:'text-input',namespace:'port'}));
 builder.onLoad({filter:/.*/,namespace:'port'},()=>({contents:'export {TextInput} from "react-native-web";',loader:'js',resolveDir:project}));
 builder.onResolve({filter:/^@expo\/vector-icons\/SimpleLineIcons$/},()=>({path:path.join(project,'packages/ui/src/platform/Icons.web.tsx')}));
 builder.onResolve({filter:/^@\/components\/ui\/web\/general\/DropdownPanel$/},()=>({path:path.join(project,'packages/ui/dist/web/overlays.js')}));
 builder.onResolve({filter:/^(react|react\/jsx-runtime|react-dom|react-dom\/client|react-native-web)$/},args=>({path:require.resolve(args.path)}));
 builder.onLoad({filter:/\.tsx$/},args=>{if(args.path.startsWith(source+path.sep)){if(!allowed.has(args.path))throw new Error('Unapproved reference source '+args.path);return {contents:fs.readFileSync(args.path,'utf8'),loader:'tsx'};}});
}};
const result=await build({bundle:true,format:'esm',platform:'browser',jsx:'automatic',target:'es2020',tsconfigRaw:{compilerOptions:{jsx:'react-jsx'}},entryPoints:['tests/reference.tsx'],outfile:'dist/catalogue/reference.js',plugins:[referencePorts],resolveExtensions:['.web.tsx','.web.ts','.tsx','.ts','.js'],alias:{'react-native':'react-native-web','@tempo/ui':path.join(project,'packages/ui/dist/web/index.js')},loader:{'.ttf':'dataurl'},metafile:true,define:{'process.env.NODE_ENV':'"development"'}});
fs.copyFileSync('tests/reference.html','dist/catalogue/reference.html');fs.writeFileSync('../T-2026-0042-pilot/evidence/reference-build-metafile.json',JSON.stringify(result.metafile,null,2));
console.log('Built comparison using the original six source files read-only; explicit RNWeb TextInput/icon/overlay ports.');
