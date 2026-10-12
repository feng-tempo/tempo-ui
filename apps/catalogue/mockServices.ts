export const demoOptions=[{label:'Design',value:'design'},{label:'Engineering',value:'engineering'},{label:'Operations',value:'operations'}];
const pause=()=>new Promise(resolve=>setTimeout(resolve,100));
export async function loadDropdownPageFromConfig(config:any,page=1){
 if(!String(config.endpoint).startsWith('mock:'))throw new Error('Catalogue accepts local mock endpoints only');
 await pause();return {options:page===1?demoOptions:[],hasMore:false,total:demoOptions.length};
}
export async function loadLookupPageFromConfig(config:any,args:{page:number;pageSize?:number;searchText?:string}){
 if(!String(config.endpoint).startsWith('mock:'))throw new Error('Catalogue accepts local mock endpoints only');
 await pause();const search=(args.searchText??'').toLowerCase();let options=demoOptions.filter(item=>item.label.toLowerCase().includes(search));
 if(config.extraQuery?.selectedValue)options=options.filter(item=>item.value===config.extraQuery.selectedValue);
 const size=args.pageSize??20,start=(args.page-1)*size;
 return {items:options.slice(start,start+size).map(item=>({...item,description:'Local catalogue example',row:{id:item.value,name:item.label,department:'Sample team'}})),hasMore:start+size<options.length,total:options.length};
}
let uploadCount=0;
export async function uploadFile({file,fileName,uploadSessionId}:{file:File;fileName:string;uploadSessionId:string}){
 await pause();return {fileId:`local-${++uploadCount}`,fileName,originalFileName:fileName,blobPath:`mock/${fileName}`,contentType:file.type,size:file.size,status:'temp',uploadSessionId};
}
export async function deleteFile(_args:{fileId:string}){await pause();return {deleted:true};}
let notification='';const listeners=new Set<()=>void>();
export function openNotificationPanel(message:{title?:string;message?:string}){notification=[message.title,message.message].filter(Boolean).join(': ');listeners.forEach(fn=>fn());}
export function closeNotificationPanel(){notification='';listeners.forEach(fn=>fn());}
export const notificationStore={subscribe(fn:()=>void){listeners.add(fn);return ()=>{listeners.delete(fn);};},snapshot(){return notification;}};
