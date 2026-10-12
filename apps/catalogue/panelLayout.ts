const query=typeof window==='undefined'?null:window.matchMedia('(max-width:600px)');
export const panelLayout={
 subscribe(onChange:()=>void){query?.addEventListener('change',onChange);return ()=>query?.removeEventListener('change',onChange);},
 compact(){return query?.matches??false;},
};
