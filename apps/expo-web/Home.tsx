import {useState,type MouseEvent} from 'react';
import {BubbleSwitch,NavBtn,TextInputField} from '@tempo/ui';
import {Text} from 'react-native';
import {useFonts} from 'expo-font';
import glyphs from '../catalogue/icon-assets/FontAwesome6.json';
import {fieldStyle} from '../catalogue/fieldStyle';
import {demos,type DemoSlug} from './registry';
const symbols:Record<DemoSlug,string>={"date":"calendar-days","async-dropdown":"cloud-arrow-down","lookup":"magnifying-glass","reference-data":"database","multi-dropdown":"tags","cascading-multi-dropdown":"sitemap","cascading-dropdown":"diagram-project","json":"code","money":"dollar-sign","money-with-currency":"coins","percentage":"percent","duration":"hourglass-half","file-upload":"file-arrow-up","long-text":"align-left","radio":"circle-dot","multi-checkbox":"clipboard-check","switch":"toggle-on","button":"bolt","nav-button":"compass","confirmation":"circle-check","text":"font","number":"hashtag","checkbox":"square-check","dropdown":"list","comment-display":"comment","comment-preview":"comments","comment-thread":"comment-dots"};
const colours:Record<string,string>={Fields:'#286e9d',Actions:'#95733c',Comments:'#488272'};
export default function Home({navigate,go,colour}:{navigate:(event:MouseEvent<HTMLAnchorElement>,href:string)=>void;go:(href:string)=>void;colour:string}){
 const [search,setSearch]=useState(''),[focused,setFocused]=useState(false),[list,setList]=useState(false);
 const [fontsLoaded]=useFonts({DemoHomeIcons:require('../catalogue/icon-assets/FontAwesome6_Solid.ttf')});
 const visible=demos.filter(d=>`${d.name} ${d.group} ${d.description}`.toLowerCase().includes(search.trim().toLowerCase()));
 const icon=(slug:DemoSlug,group:string)=><span aria-hidden="true" className="home-icon" style={{fontFamily:'DemoHomeIcons',color:colours[group],visibility:fontsLoaded?'visible':'hidden'}}>{String.fromCodePoint((glyphs as Record<string,number>)[symbols[slug]])}</span>;
 const link=(slug:DemoSlug,title:string,className?:string)=><a className={className} href={'/controls/'+slug} onClick={e=>navigate(e,'/controls/'+slug)}>{title}</a>;
 return <div className="home-page"><h1>All components</h1><p className="home-subtitle">Explore the controls used across Tempo.</p><div className="home-toolbar"><div className="home-search"><TextInputField value={search} onChange={setSearch} placeHolder="Search all components…" style={fieldStyle(focused,false,colour)} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}/></div><div className="view-switch"><BubbleSwitch variant="choice" value={list} onChange={setList} falseLabel="Card" trueLabel="Banner"/></div></div>
 {!search&&<div className="home-shortcuts" aria-label="Quick access">{(['text','dropdown','comment-thread'] as DemoSlug[]).map(slug=>{const item=demos.find(d=>d.slug===slug)!;return <a key={slug} href={'/controls/'+slug} onClick={e=>navigate(e,'/controls/'+slug)}>{icon(slug,item.group)}<span>{slug==='comment-thread'?'Comments':slug==='dropdown'?'Dropdown':'Text field'}</span></a>;})}</div>}
 {visible.length===0?<p className="home-empty">No matching components.</p>:['Fields','Actions','Comments'].map(group=>{const items=visible.filter(d=>d.group===group);return items.length?<section key={group} className="home-group"><div className="home-group-heading"><h2>{group}</h2><span>({items.length})</span><div/></div><div className={'home-grid '+(list?'home-list':'')}>{items.map(item=>list?<a className="home-banner" key={item.slug} href={'/controls/'+item.slug} onClick={e=>navigate(e,'/controls/'+item.slug)}>{icon(item.slug,item.group)}<span>{item.name}</span></a>:<article key={item.slug}><div className="home-card-heading">{icon(item.slug,item.group)}<h3>{link(item.slug,item.name)}</h3></div><p>{item.description}</p><footer><div className="card-action-slot"><NavBtn theme="secondary" accessibilityLabel={"View "+item.name} cusStyle={{btn:{paddingHorizontal:8,paddingVertical:8}}} onPress={()=>go("/controls/"+item.slug)}><Text accessibilityElementsHidden importantForAccessibility="no-hide-descendants" {...({"aria-hidden":true} as any)} style={{fontFamily:"DemoHomeIcons",fontSize:18,paddingRight:6,color:colour}}>{String.fromCodePoint(glyphs.eye)}</Text><Text style={{fontSize:13}}>View</Text></NavBtn></div></footer></article>)}</div></section>:null;})}
 </div>;
}


