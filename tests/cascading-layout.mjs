import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire('C:/Users/feng.wang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const browser=await require('playwright').chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const evidence='../T-2026-0042-pilot/evidence',checks=[],errors=[],remote=[];
page.on('pageerror',e=>errors.push(e.message));
await page.route('**/*',r=>{const url=r.request().url();if(url.startsWith('http://127.0.0.1:4173/')||url.startsWith('data:')||url.startsWith('blob:'))return r.continue();remote.push(url);return r.abort();});
const card=page.locator('[data-field-type="cascadingDropdown"]');
const triggers=()=>card.locator('[tabindex="0"]');
const settle=()=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
async function assertEndpoints(){
 const deltas=await card.evaluate(el=>{
  const labels=['Team','Focus'].map(text=>Array.from(el.querySelectorAll('div')).find(n=>n.textContent===text&&n.children.length===0)).filter(Boolean);
  const lines=Array.from(el.querySelectorAll('div')).filter(n=>{const s=getComputedStyle(n);return s.position==='absolute'&&s.borderLeftStyle==='solid'&&s.borderBottomStyle==='solid'&&s.borderLeftColor==='rgb(102, 102, 102)';});
  return lines.map((line,i)=>{const b=line.getBoundingClientRect(),label=labels[i].getBoundingClientRect();return b.bottom-parseFloat(getComputedStyle(line).borderBottomWidth)/2-label.top-label.height/2;});
 });
 assert.ok(deltas.length>0);assert.ok(deltas.every(delta=>Math.abs(delta)<0.6),JSON.stringify(deltas));return deltas;
}
async function select(index,label){const trigger=triggers().nth(index);await trigger.scrollIntoViewIfNeeded();await settle();await trigger.click();await page.locator('[data-tempo-overlay]').getByText(label,{exact:true}).click();await settle();}
async function geometry(){return card.evaluate(el=>{const labels=['Division','Team','Focus'].map(label=>Array.from(el.querySelectorAll('div')).find(n=>n.textContent===label&&n.children.length===0)).filter(Boolean);return {width:el.getBoundingClientRect().width,labels:labels.map(n=>({text:n.textContent,x:n.getBoundingClientRect().x,y:n.getBoundingClientRect().y})),controls:Array.from(el.querySelectorAll('[tabindex="0"]')).map(n=>({x:n.getBoundingClientRect().x,height:n.getBoundingClientRect().height})),connectors:Array.from(el.querySelectorAll('div')).filter(n=>getComputedStyle(n).borderLeftStyle==='solid'&&getComputedStyle(n).borderBottomStyle==='solid'&&getComputedStyle(n).borderLeftColor==='rgb(102, 102, 102)').length};});}
try{
 await page.goto('http://127.0.0.1:4173/');await card.waitFor();await page.evaluate(()=>document.fonts.ready);
 await select(0,'Product');
 const wide=await geometry();assert.ok(wide.width>600);assert.equal(wide.controls.length,2);assert.equal(wide.labels.length,2);assert.equal(wide.labels[1].x-wide.labels[0].x,58);assert.ok(Math.abs(wide.controls[0].x-wide.controls[1].x)<1);assert.ok(wide.connectors>0);assert.ok(wide.controls.every(n=>n.height===27));checks.push('wide panels preserve standard source rows, 58px indentation, connectors and natural 27px controls');
 assert.equal(await card.getByText('Conditional',{exact:true}).count(),0);checks.push('runtime initially shows two levels without designer-preview badge');
 await select(1,'Engineering');await select(2,'Web');
 const selected=await geometry();assert.equal(selected.controls.length,3);assert.equal(selected.labels[2].x-selected.labels[0].x,116);assert.ok(selected.controls.every(n=>Math.abs(n.x-selected.controls[0].x)<1));checks.push('conditional third level retains source indentation and aligned inputs');
 selected.endpointOffsets=await assertEndpoints();
 await page.setViewportSize({width:1280,height:900});await settle();await assertEndpoints();
 await page.setViewportSize({width:1000,height:900});await settle();await assertEndpoints();
 await page.setViewportSize({width:1440,height:1000});await settle();await assertEndpoints();
 checks.push('both connector endpoints match next label centres across two-column and one-column widths');
 await card.scrollIntoViewIfNeeded();await settle();await page.screenshot({path:evidence+'/cascading-wide.png'});
 await select(0,'Service');assert.equal(await triggers().count(),2);const value=JSON.parse(await page.getByTestId('cascadingDropdown-value').innerText());assert.equal(value[0].value,'service');assert.ok(!value[1]&&!value[2]);checks.push('changing parent clears descendants and hides third level');
 await page.setViewportSize({width:390,height:844});await settle();const narrow=await geometry();assert.equal(narrow.labels[1].x-narrow.labels[0].x,0);assert.equal(narrow.connectors,0);assert.ok(narrow.controls.every(n=>n.height===27));assert.ok(await page.evaluate(()=>{const w=document.querySelector('.workspace');return w.scrollWidth<=w.clientWidth&&document.documentElement.scrollWidth<=innerWidth;}));checks.push('narrow panels use existing stacked source variant without overflow or stretched inputs');
 await card.scrollIntoViewIfNeeded();await settle();await page.screenshot({path:evidence+'/cascading-narrow.png'});
 assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);
 fs.writeFileSync(evidence+'/cascading-layout-result.json',JSON.stringify({passed:true,checks,wide,selected,narrow,errors,remote},null,2));console.log(JSON.stringify({passed:true,checks}));
}finally{await browser.close();}
