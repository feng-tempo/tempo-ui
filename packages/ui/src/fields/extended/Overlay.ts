import {openDropdownPanel as open,closeDropdownPanel,updateDropdownPanelContent} from '../../overlays/DropdownPanel';
import type {DropdownRequest} from '../../overlays/DropdownPanel.types';
export {closeDropdownPanel,updateDropdownPanelContent};
// Web staging overlay retains existing collision/anchor geometry. Animation hint is unsupported.
export function openDropdownPanel(request:DropdownRequest & {widthMode?:'content'|'matchAnchor';animate?:boolean}){open(request);}
export function isInDropdownPanel(node:unknown){return typeof document!=="undefined"&&node instanceof Node&&!!document.querySelector("[data-tempo-overlay]")?.contains(node);}
