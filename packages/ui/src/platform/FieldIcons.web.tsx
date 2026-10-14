import {Text} from 'react-native';
import antFont from './field-icons/AntDesign.ttf';import ant from './field-icons/AntDesign.json';
import ionFont from './field-icons/Ionicons.ttf';import ion from './field-icons/Ionicons.json';
import faFont from './field-icons/FontAwesome.ttf';import fa from './field-icons/FontAwesome.json';
import fa6Regular from './field-icons/FontAwesome6_Regular.ttf';import fa6Solid from './field-icons/FontAwesome6_Solid.ttf';import fa6 from './field-icons/FontAwesome6.json';
import simpleFont from './field-icons/SimpleLineIcons.ttf';import simple from './field-icons/SimpleLineIcons.json';
const fontFaces={AntDesign:antFont,Ionicons:ionFont,FontAwesome:faFont,FontAwesome6Regular:fa6Regular,FontAwesome6Solid:fa6Solid,SimpleLineIcons:simpleFont};
if(typeof document!=='undefined'&&!document.getElementById('tempo-field-icons')){const style=document.createElement('style');style.id='tempo-field-icons';style.textContent=Object.entries(fontFaces).map(([family,url])=>`@font-face{font-family:tempo-field-${family};src:url("${url}") format("truetype");font-display:block}`).join('\n');document.head.appendChild(style);}
type Props={name:string;style?:any;size?:number;color?:string;solid?:boolean;regular?:boolean};
function icon(map:Record<string,number>,family:string){return ({name,style,size=12,color='black'}:Props)=>{if(map[name]===undefined)throw new Error('Unmapped original icon '+family+': '+name);return <Text accessibilityElementsHidden importantForAccessibility="no" style={[{fontFamily:'tempo-field-'+family,fontSize:size,fontWeight:'normal',fontStyle:'normal',color},style]}>{String.fromCodePoint(map[name])}</Text>;};}
export const AntDesign=icon(ant,'AntDesign'),Ionicons=icon(ion,'Ionicons'),FontAwesome=icon(fa,'FontAwesome'),SimpleLineIcons=icon(simple,'SimpleLineIcons');
export function FontAwesome6(props:Props){const family=props.regular||(!props.solid&&props.name==='calendar')?'FontAwesome6Regular':'FontAwesome6Solid';return icon(fa6,family)(props);}
