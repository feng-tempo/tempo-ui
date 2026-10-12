import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {GButton,TextInputField,NumberInputField,CheckBox,RichDropDown,DropdownPanelProvider} from '@tempo/ui';
import OriginalButton from 'original:button';
import OriginalText from 'original:text';
import OriginalNumber from 'original:number';
import OriginalCheckBox from 'original:checkbox';
import OriginalDropdown from 'original:dropdown';
import {fieldStyle} from '../apps/catalogue/fieldStyle';
const originals={button:OriginalButton,text:OriginalText,number:OriginalNumber,checkbox:OriginalCheckBox,dropdown:OriginalDropdown};
const pilots={button:GButton,text:TextInputField,number:NumberInputField,checkbox:CheckBox,dropdown:RichDropDown};
type Kind=keyof typeof pilots;
function Sample({side,kind,disabled,error,mixed,colour}:{side:'original'|'pilot';kind:Kind;disabled:boolean;error:boolean;mixed:boolean;colour:string}){
  const [focus,setFocus]=useState(false),[text,setText]=useState('Hello team'),[number,setNumber]=useState<number|string|null|undefined>(12.5),[check,setCheck]=useState(false),[choice,setChoice]=useState<any>(undefined);
  const Comp:any=(side==='original'?originals:pilots)[kind];
  const style=fieldStyle(focus&&!disabled,error,colour);
  const common={disabled,onFocus:()=>setFocus(true),onBlur:()=>setFocus(false),style};
  return <div data-sample={`${side}-${kind}`} className="sample" onFocusCapture={()=>setFocus(true)} onBlurCapture={event=>{if(kind!=='dropdown'&&!event.currentTarget.contains(event.relatedTarget as Node))setFocus(false);}}>
    {kind==='button'?<Comp label="Primary action" theme="primary" disabled={disabled} btnStyle={style} onPress={()=>setText('pressed')}/>:null}
    {kind==='text'?<Comp {...common} value={text} onChange={setText} placeHolder="Name"/>:null}
    {kind==='number'?<Comp {...common} value={number} onChange={setNumber}/>:null}
    {kind==='checkbox'?<Comp {...common} value={check} indeterminate={mixed} onChange={setCheck} label="Accept example"/>:null}
    {kind==='dropdown'?<Comp {...common} value={choice} onChange={setChoice} placeholder="Pick a team" options={[{label:'Design',value:'design'},{label:'Engineering',value:'engineering'},{label:'Operations',value:'operations'}]}/>:null}
  </div>;
}
function Reference(){
 const [disabled,setDisabled]=useState(false),[error,setError]=useState(false),[mixed,setMixed]=useState(false),[colour,setColour]=useState('#0061a3');
 return <DropdownPanelProvider><h1>Source comparison</h1><p>Original source files are compiled read-only with UI-only platform ports. Production shell and native runtime are not exercised.</p><div className="options"><label><input type="checkbox" aria-label="Disabled samples" checked={disabled} onChange={e=>setDisabled(e.target.checked)}/> Disabled</label><label><input type="checkbox" aria-label="Error samples" checked={error} onChange={e=>setError(e.target.checked)}/> Error</label><label><input type="checkbox" aria-label="Mixed samples" checked={mixed} onChange={e=>setMixed(e.target.checked)}/> Mixed</label><select aria-label="Highlight colour" value={colour} onChange={e=>setColour(e.target.value)}><option value="#0061a3">Source blue</option><option value="#267760">Consumer green</option></select><button id="blur-target">Blur target</button></div><div className="comparison"><b>Original source</b><b>tempo-ui</b>{(Object.keys(pilots) as Kind[]).map(kind=><div key={kind} className="pair" data-pair={kind}><h2>{kind}</h2><Sample side="original" kind={kind} disabled={disabled} error={error} mixed={mixed} colour={colour}/><Sample side="pilot" kind={kind} disabled={disabled} error={error} mixed={mixed} colour={colour}/></div>)}</div></DropdownPanelProvider>;
}
createRoot(document.getElementById('root')!).render(<Reference/>);
