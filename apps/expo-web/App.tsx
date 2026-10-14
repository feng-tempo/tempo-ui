import {FieldAdaptersProvider} from '@tempo/ui';
import {fieldAdapters} from '../catalogue/mockServices';
import {useEffect,useState,type MouseEvent} from 'react';
import {TempoThemeProvider,DropdownPanelProvider,TooltipProvider,CheckBox,closeDropdownPanel} from '@tempo/ui';
import {demos} from './registry';import Demo from './Demos';import Home from './Home';import './styles.css';
export default function App(){
 const [pathname,setPathname]=useState(window.location.pathname),[disabled,setDisabled]=useState(false);
 useEffect(()=>{const change=()=>{closeDropdownPanel();setPathname(window.location.pathname);};window.addEventListener('popstate',change);return()=>window.removeEventListener('popstate',change);},[]);
 const navigate=(event:MouseEvent<HTMLAnchorElement>,href:string)=>{if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();closeDropdownPanel();history.pushState(null,'',href);setPathname(href);};
 const active=demos.find(item=>pathname==='/controls/'+item.slug),home=pathname==='/',colour='#0061a3';
 useEffect(()=>{document.title=(active?.name??(home?'Home':'Page not found'))+' · Tempo UI';document.querySelector('.demo-workspace')?.scrollTo(0,0);},[pathname]);
 const go=(href:string)=>{closeDropdownPanel();history.pushState(null,'',href);setPathname(href);};
 const link=(href:string,title:string)=><a href={href} onClick={e=>navigate(e,href)} aria-current={pathname===href?'page':undefined}>{title}</a>;
 return <TempoThemeProvider tokens={{focus:colour,primary:'#1b5f99'}}><FieldAdaptersProvider adapters={fieldAdapters}><DropdownPanelProvider><TooltipProvider><div className="demo-shell"><header className="demo-header" aria-label="Demo menu"><strong>Tempo UI</strong><div className="demo-toolbar"><div className="menu-checkbox-slot"><CheckBox label="Disable example" value={disabled} onChange={setDisabled}/></div></div></header><div className="demo-body"><nav aria-label="Component navigation" className="demo-nav">
 {link('/','Home')}{['Fields','Actions','Comments'].map(group=><section key={group}><h2>{group}</h2>{demos.filter(d=>d.group===group).map(d=><div key={d.slug}>{link('/controls/'+d.slug,d.name)}</div>)}</section>)}</nav><main className="demo-workspace" id="demo-content">{home?<Home navigate={navigate} go={go} colour={colour}/>:active?<><h1>{active.name}</h1><p>{active.description}</p><Demo key={active.slug} slug={active.slug} disabled={disabled} colour={colour}/></>:<><h1>Page not found</h1>{link('/','Return home')}</>}</main></div></div></TooltipProvider></DropdownPanelProvider></FieldAdaptersProvider></TempoThemeProvider>;
}
