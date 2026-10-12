export {openDropdownPanel,closeDropdownPanel,updateDropdownPanelContent} from '@tempo/ui';
export function isInDropdownPanel(node:unknown){return typeof document!=='undefined'&&node instanceof Node&&!!document.querySelector('[data-tempo-overlay]')?.contains(node);}
