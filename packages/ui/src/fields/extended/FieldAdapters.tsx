import {createContext,useContext,type ReactNode} from 'react';
import type {AsyncDropdownConfig,DropdownPageResult,LookupFieldConfig,LookupPageResult} from './adapterTypes';
import type {UploadedFileItem} from './BaseUploadField';
export type FieldAdapters={
 loadDropdownPageFromConfig:(config:AsyncDropdownConfig,page?:number)=>Promise<DropdownPageResult>;
 loadLookupPageFromConfig:(config:LookupFieldConfig,args:{page:number;pageSize?:number;searchText?:string})=>Promise<LookupPageResult>;
 uploadFile:(args:{file:File;fileName:string;uploadSessionId:string})=>Promise<UploadedFileItem>;
 deleteFile:(args:{fileId:string})=>Promise<unknown>;
 openNotificationPanel:(message:{title?:string;message?:string;kind?:string;autoHide?:boolean;autoHideMs?:number})=>void;
 closeNotificationPanel:()=>void;
};
const missing=async()=>{throw Error('This field requires consumer-supplied FieldAdaptersProvider adapters');};
const context=createContext<FieldAdapters>({loadDropdownPageFromConfig:missing,loadLookupPageFromConfig:missing,uploadFile:missing,deleteFile:missing,openNotificationPanel:()=>{},closeNotificationPanel:()=>{}});
export function FieldAdaptersProvider({adapters,children}:{adapters:FieldAdapters;children:ReactNode}){return <context.Provider value={adapters}>{children}</context.Provider>;}
export const useFieldAdapters=()=>useContext(context);
