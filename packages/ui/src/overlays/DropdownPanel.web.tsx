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
  const close=(restoreFocus=true)=>{const old=active.current;active.current=null;setRequest(null);old?.onClose?.();if(restoreFocus)old?.anchorRef?.querySelector?.('[tabindex="0"]')?.focus();};
  useLayoutEffect(()=>{
    const controller:Controller={open:r=>{if(active.current)close();active.current=r;setRequest(r);},close,update:(id,content)=>{
      if(active.current?.id===id){active.current={...active.current,content};setRequest(active.current);}
    }};
    current=controller;
    return ()=>{active.current?.onClose?.();active.current=null;if(current===controller)current=null;};
  },[]);
  useLayoutEffect(()=>{
    if(!request)return;
    const outside=(event:PointerEvent)=>{const target=event.target as Node;if(!panel.current?.contains(target)&&!request.anchorRef?.contains?.(target))close(false);};
    const keyboard=(event:KeyboardEvent)=>{if(event.key==='Escape'&&!event.defaultPrevented){event.preventDefault();close();request.anchorRef?.querySelector?.('[tabindex="0"]')?.focus();}};
    const dispose=()=>close(false);
    const scroll=(event:Event)=>{if(event.target instanceof Node&&panel.current?.contains(event.target))return;dispose();};
    document.addEventListener('pointerdown',outside,true);document.addEventListener('keydown',keyboard);window.addEventListener('resize',dispose);window.addEventListener('scroll',scroll,true);
    return ()=>{document.removeEventListener('pointerdown',outside,true);document.removeEventListener('keydown',keyboard);window.removeEventListener('resize',dispose);window.removeEventListener('scroll',scroll,true);};
  },[request]);
  const rect=request?.anchorRef?.getBoundingClientRect?.();
  const width=Math.min(request?.preferredWidth??rect?.width??240,typeof window==='undefined'?400:window.innerWidth-24);
  const topPlacement=!!(rect&&request?.collision&&rect.bottom+260>window.innerHeight&&rect.top>260);
  const left=rect?Math.max(12,Math.min(rect.left,window.innerWidth-width-12)):12;
  return <>{children}{request&&typeof document!=='undefined'&&createPortal(<div ref={panel} data-tempo-overlay={request.id} style={{position:'fixed',left,width,...(topPlacement?{bottom:window.innerHeight-rect.top}:{top:Math.min(rect?.bottom??12,window.innerHeight-48)}),zIndex:theme.tokens.overlayLayer,background:'#fff',border:'1px solid #edebe9',overflow:'hidden',boxShadow:topPlacement?'1px -2px 6px rgba(0,0,0,0.2)':'1px 2px 6px rgba(0,0,0,0.2)'}}>
    {typeof request.content==='function'?request.content(close,topPlacement?'top':'bottom'):request.content}
  </div>,document.body)}</>;
}
