import { GButton } from '@tempo/ui/actions/button';
import { TextInputField, type TextInputFieldProps } from '@tempo/ui/fields/text';
import { NumberInputField } from '@tempo/ui/fields/number';
import { CheckBox } from '@tempo/ui/fields/checkbox';
import { RichDropDown, type RichDropdownItem } from '@tempo/ui/fields/dropdown';
import { DropdownPanelProvider, TempoThemeProvider } from '@tempo/ui';
const text: TextInputFieldProps = {value:'Consumer fixture',onChange:(_value:string)=>{},placeHolder:'Name',disabled:false};
const item: RichDropdownItem = {label:'Local option',value:'local'};
export function Example(){return <TempoThemeProvider tokens={{controlBorder:'#123456'}}><DropdownPanelProvider>
 <GButton label="Mock action" theme="primary" onPress={()=>{}}/><TextInputField {...text}/>
 <NumberInputField value={12.5} outputAs="number" onChange={value=>console.log(value)}/>
 <CheckBox value={false} label="Fixture" onChange={()=>{}}/><RichDropDown value={item} options={[item]} onChange={()=>{}}/>
</DropdownPanelProvider></TempoThemeProvider>;}
// Public types must reject unsupported values; these directives fail if types widen unsafely.
// @ts-expect-error unsupported theme
const invalidButton = <GButton theme="danger"/>;
// @ts-expect-error unsupported output type
const invalidNumber = <NumberInputField outputAs="decimal"/>;

const searchDecoration = <RichDropDown searchStyle={{borderColor:'#267760',boxShadow:'0 0 3px rgba(38,119,96,0.7)'}}/>;
// @ts-expect-error shadow must be a CSS string or shadow values, not a number
const invalidSearchDecoration = <RichDropDown searchStyle={{boxShadow:42}}/>;
