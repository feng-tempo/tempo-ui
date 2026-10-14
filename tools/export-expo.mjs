import {spawnSync} from 'node:child_process';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const build=spawnSync(process.execPath,['tools/build.mjs','--library-only'],{stdio:'inherit'});
if(build.status!==0)process.exit(build.status??1);
const result=spawnSync(process.execPath,[require.resolve('expo/bin/cli'),'export','--platform','web','--output-dir','expo-dist'],{stdio:'inherit',env:{...process.env,EXPO_NO_TELEMETRY:'1',EXPO_OFFLINE:'1',EXPO_NO_TYPESCRIPT_SETUP:'1'}});
process.exit(result.status??1);
