import type { ReactNode } from 'react';
import type {DropdownRequest} from './DropdownPanel.types';
export type {DropdownRequest} from './DropdownPanel.types';
export function DropdownPanelProvider({children}:{children:ReactNode}){return children;}
export function openDropdownPanel(_request:DropdownRequest){}
export function closeDropdownPanel(){}
export function updateDropdownPanelContent(_id:string,_content:DropdownRequest['content']){}
