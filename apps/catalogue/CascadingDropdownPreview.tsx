import {useLayoutEffect,useRef} from 'react';
import CascadingDropdown from 'mobile-field:cascadingDropdown';

// Web-preview adapter: the source connector's fixed bottom does not track
// the following label's line box. Keep its start/width and align its endpoint.
export default function CascadingDropdownPreview(props:any){
 const host=useRef<HTMLDivElement>(null);
 useLayoutEffect(()=>{
  const root=host.current;if(!root)return;
  const align=()=>{
   const group=root.firstElementChild;if(!group)return;
   const rows=Array.from(group.children).filter(el=>el.firstElementChild?.firstElementChild?.firstElementChild);
   rows.slice(0,-1).forEach((row,index)=>{
    const line=Array.from(row.querySelectorAll<HTMLElement>('div')).find(el=>{
     const style=getComputedStyle(el);
     return style.position==='absolute'&&style.borderLeftStyle==='solid'&&style.borderBottomStyle==='solid'&&style.borderLeftColor==='rgb(102, 102, 102)';
    });
    const label=rows[index+1].firstElementChild?.firstElementChild?.firstElementChild;
    if(!line||!label)return;
    const text=label.getBoundingClientRect(),start=line.getBoundingClientRect();
    const border=parseFloat(getComputedStyle(line).borderBottomWidth)||1;
    line.style.bottom='auto';
    line.style.height=Math.max(0,text.top+text.height/2-start.top+border/2)+'px';
   });
  };
  align();
  const observer=new ResizeObserver(align);observer.observe(root);
  return()=>observer.disconnect();
 },[props.value,props.multiRowsStyle?.layout]);
 return <div ref={host}><CascadingDropdown {...props}/></div>;
}
