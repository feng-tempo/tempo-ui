import {execFileSync} from 'node:child_process';import path from 'node:path';
const compiler=path.resolve('node_modules/typescript/bin/tsc');
for(const config of ['tsconfig.json','tsconfig.catalogue.json','tests/consumer/tsconfig.json'])execFileSync(process.execPath,[compiler,'-p',config,'--pretty','false'],{stdio:'inherit'});
console.log('Library declarations, catalogue and packed-consumer type checks passed. Native build is unrun.');
