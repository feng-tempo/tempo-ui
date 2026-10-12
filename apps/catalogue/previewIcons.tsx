import {Text} from 'react-native';
import antFont from './icon-assets/AntDesign.ttf';import ant from './icon-assets/AntDesign.json';
import ionFont from './icon-assets/Ionicons.ttf';import ion from './icon-assets/Ionicons.json';
import faFont from './icon-assets/FontAwesome.ttf';import fa from './icon-assets/FontAwesome.json';
import fa6Regular from './icon-assets/FontAwesome6_Regular.ttf';import fa6Solid from './icon-assets/FontAwesome6_Solid.ttf';import fa6 from './icon-assets/FontAwesome6.json';
import simpleFont from './icon-assets/SimpleLineIcons.ttf';import simple from './icon-assets/SimpleLineIcons.json';
const fontFaces={AntDesign:antFont,Ionicons:ionFont,FontAwesome:faFont,FontAwesome6Regular:fa6Regular,FontAwesome6Solid:fa6Solid,SimpleLineIcons:simpleFont};
if(typeof document!=='undefined'&&!document.getElementById('tempo-preview-icons')){const style=document.createElement('style');style.id='tempo-preview-icons';style.textContent=Object.entries(fontFaces).map(([family,url])=>`@font-face{font-family:tempo-preview-${family};src:url("${url}") format("truetype");font-display:block}`).join('\n');document.head.appendChild(style);}
type Props={name:string;style?:any;size?:number;color?:string;solid?:boolean;regular?:boolean};
function icon(map:Record<string,number>,family:string){return ({name,style,size=12,color='black'}:Props)=>{if(map[name]===undefined)throw new Error('Unmapped original icon '+family+': '+name);return <Text accessibilityElementsHidden importantForAccessibility="no" style={[{fontFamily:'tempo-preview-'+family,fontSize:size,fontWeight:'normal',fontStyle:'normal',color},style]}>{String.fromCodePoint(map[name])}</Text>;};}
export const AntDesign=icon(ant,'AntDesign'),Ionicons=icon(ion,'Ionicons'),FontAwesome=icon(fa,'FontAwesome'),SimpleLineIcons=icon(simple,'SimpleLineIcons');
export function FontAwesome6(props:Props){const family=props.regular||(!props.solid&&props.name==='calendar')?'FontAwesome6Regular':'FontAwesome6Solid';return icon(fa6,family)(props);}
