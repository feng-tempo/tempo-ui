import { Text } from 'react-native';
import fontUrl from './assets/SimpleLineIcons.ttf';
if (typeof document !== 'undefined' && !document.getElementById('tempo-simple-line-icons')) {
  const sheet = document.createElement('style');
  sheet.id = 'tempo-simple-line-icons';
  sheet.textContent = `@font-face{font-family:simple-line-icons;src:url("${fontUrl}") format("truetype");font-display:block}`;
  document.head.appendChild(sheet);
}
export default function Icon({name, style}: {name: string; style?: any}) {
  return <Text accessibilityElementsHidden importantForAccessibility="no" style={[style,{fontFamily:'simple-line-icons',fontWeight:'normal',fontStyle:'normal'}]}>{String.fromCodePoint(name === 'close' ? 57474 : 58884)}</Text>;
}
