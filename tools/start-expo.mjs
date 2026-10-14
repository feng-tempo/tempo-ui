import {spawnSync,spawn} from 'node:child_process';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const build=spawnSync(process.execPath,['tools/build.mjs','--library-only'],{stdio:'inherit'});
if(build.status!==0)process.exit(build.status??1);
const child=spawn(process.execPath,[require.resolve('expo/bin/cli'),'start','--web','--localhost','--port',process.env.TEMPO_EXPO_PORT??'8085'],{stdio:'inherit',env:{...process.env,EXPO_NO_TELEMETRY:'1',EXPO_OFFLINE:'1',EXPO_NO_TYPESCRIPT_SETUP:'1'}});
child.on('exit',code=>process.exit(code??0));
process.on('SIGINT',()=>child.kill('SIGINT'));process.on('SIGTERM',()=>child.kill('SIGTERM'));
