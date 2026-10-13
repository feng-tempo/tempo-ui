import { createContext, useContext, type ReactNode } from 'react';
export type TempoTokens = {controlBorder:string;disabledBackground:string;text:string;primary:string;focus:string;overlayLayer:number};
export const defaultTokens: Readonly<TempoTokens> = Object.freeze({controlBorder:'#A0A0A0', disabledBackground:'#FAFAFA', text:'#323130', primary:'#1b5f99', focus:'#0061a3', overlayLayer:1000});
const Context = createContext<{tokens: TempoTokens; custom: boolean}>({tokens:defaultTokens, custom:false});
export function TempoThemeProvider({tokens,children}:{tokens?: Partial<TempoTokens>; children:ReactNode}) {
  return <Context.Provider value={{tokens:{...defaultTokens,...tokens},custom:!!tokens}}>{children}</Context.Provider>;
}
export function useTempoTheme(){return useContext(Context);}
