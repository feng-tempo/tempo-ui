import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useTempoTheme } from '../theme';
import type { DropdownRequest } from './DropdownPanel.types';
export type { DropdownRequest } from './DropdownPanel.types';
type Controller={open:(r:DropdownRequest)=>void;close:()=>void;update:(id:string,c:DropdownRequest['content'])=>void};
let current: Controller|null=null;
export function openDropdownPanel(request:DropdownRequest){if(!current)throw new Error('Mount DropdownPanelProvider before opening a dropdown');current.open(request);}
export function closeDropdownPanel(){current?.close();}
export function updateDropdownPanelContent(id:string,content:DropdownRequest['content']){current?.update(id,content);}
export function DropdownPanelProvider({children}:{children:ReactNode}){
  const [request,setRequest]=useState<DropdownRequest|null>(null);
  const active=useRef<DropdownRequest|null>(null);const panel=useRef<HTMLDivElement>(null);
  const theme=useTempoTheme();
  const close=(restoreFocus=true)=>{if(active.current?.dismissible&&!active.current.dismissible())return;const old=active.current;active.current=null;setRequest(null);old?.onClose?.();if(restoreFocus){const anchor=old?.anchorRef;const focus=anchor?.matches?.('[tabindex],button,input')?anchor:anchor?.querySelector?.('[tabindex="0"]');focus?.focus?.();}};
  useLayoutEffect(()=>{
    const controller:Controller={open:r=>{if(active.current?.dismissible&&!active.current.dismissible())return;if(active.current)close();active.current=r;setRequest(r);},close,update:(id,content)=>{
      if(active.current?.id===id){active.current={...active.current,content};setRequest(active.current);}
    }};
    current=controller;
    return ()=>{active.current?.onClose?.();active.current=null;if(current===controller)current=null;};
  },[]);
  useLayoutEffect(()=>{
    if(!request)return;
    const outside=(event:PointerEvent)=>{const target=event.target as Node;if(request.bodyMask)return;if(!panel.current?.contains(target)&&!request.anchorRef?.contains?.(target))close(false);};
    const keyboard=(event:KeyboardEvent)=>{if(request.trapFocus&&event.key==='Tab'){const buttons=Array.from(panel.current?.querySelectorAll<HTMLElement>('[tabindex="0"],button:not(:disabled),input:not(:disabled),textarea:not(:disabled)')??[]).filter(el=>el.getAttribute('aria-disabled')!=='true');const first=buttons[0],last=buttons[buttons.length-1];if(buttons.length&&(event.shiftKey?(document.activeElement===first||!panel.current?.contains(document.activeElement)):(document.activeElement===last||!panel.current?.contains(document.activeElement)))){event.preventDefault();(event.shiftKey?last:first)?.focus();}}if(event.key==='Escape'&&!event.defaultPrevented){event.preventDefault();close();}};
    const dispose=()=>close(false);
    const scroll=(event:Event)=>{if(event.target instanceof Node&&panel.current?.contains(event.target))return;dispose();};
    document.addEventListener('pointerdown',outside,true);document.addEventListener('keydown',keyboard);window.addEventListener('resize',dispose);window.addEventListener('scroll',scroll,true);
    return ()=>{document.removeEventListener('pointerdown',outside,true);document.removeEventListener('keydown',keyboard);window.removeEventListener('resize',dispose);window.removeEventListener('scroll',scroll,true);};
  },[request]);
  useLayoutEffect(()=>{if(request?.trapFocus)panel.current?.querySelector<HTMLElement>('[tabindex="0"],button')?.focus();},[request?.id]);
  const rect=request?.anchorRef?.getBoundingClientRect?.();
  const width=Math.min(request?.preferredWidth??rect?.width??240,typeof window==='undefined'?400:window.innerWidth-24);
  const topPlacement=!!(rect&&request?.collision&&rect.bottom+260>window.innerHeight&&rect.top>260);
  const centered=request?.placementMode==='center';
  const left=centered?(window.innerWidth-width)/2:rect?Math.max(12,Math.min(request?.align==='right'?rect.right-width:rect.left,window.innerWidth-width-12)):12;
  return <>{children}{request?.bodyMask&&typeof document!=='undefined'&&createPortal(<div data-tempo-mask style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.15)',zIndex:theme.tokens.overlayLayer-1}}/>,document.body)}{request&&typeof document!=='undefined'&&createPortal(<div role={request.role} aria-label={request.label} aria-modal={request.trapFocus?true:undefined} ref={panel} data-tempo-overlay={request.id} style={{position:'fixed',left,width,...(centered?{top:'50%',transform:'translateY(-50%)'}:topPlacement?{bottom:window.innerHeight-rect.top}:{top:Math.min(rect?.bottom??12,window.innerHeight-48)}),zIndex:theme.tokens.overlayLayer,background:'#fff',border:'1px solid #edebe9',overflow:'hidden',boxShadow:topPlacement?'1px -2px 6px rgba(0,0,0,0.2)':'1px 2px 6px rgba(0,0,0,0.2)'}}>
    {typeof request.content==='function'?request.content(close,topPlacement?'top':'bottom'):request.content}
  </div>,document.body)}</>;
}
