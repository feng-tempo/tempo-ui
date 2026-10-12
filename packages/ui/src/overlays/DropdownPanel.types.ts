import type {ReactNode} from 'react';
export type DropdownRequest={id:string;anchorRef?:any;preferredWidth?:number;collision?:boolean;content:ReactNode|((close:()=>void,placement:'bottom'|'top')=>ReactNode);onClose?:()=>void};
