import {Pressable,Text,View} from 'react-native';
export function ErrorPanel({error,message,onRetry}:{error?:unknown;message?:string;onRetry?:()=>void}){return <View><Text accessibilityRole="alert">{message??(error instanceof Error?error.message:'Local sample could not load')}</Text>{onRetry?<Pressable onPress={onRetry}><Text>Try again</Text></Pressable>:null}</View>;}
export default function useTooltip(){return {id:undefined,show(_anchor:unknown){},dismiss(){}};}
