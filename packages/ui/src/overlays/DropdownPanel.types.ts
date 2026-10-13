import type {ReactNode} from 'react';
export type DropdownRequest={id:string;anchorRef?:any;preferredWidth?:number;collision?:boolean;content:ReactNode|((close:()=>void,placement:'bottom'|'top')=>ReactNode);align?:"auto"|"left"|"right";placementMode?:"anchor"|"center";bodyMask?:boolean;dismissible?:()=>boolean;trapFocus?:boolean;role?:"dialog";label?:string;onClose?:()=>void};
