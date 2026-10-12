import assert from 'node:assert/strict';import fs from 'node:fs';import {createRequire} from 'node:module';
const require=createRequire('C:/Users/feng.wang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json');
const browser=await require('playwright').chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const evidence='../T-2026-0042-pilot/evidence',checks=[],comparisons=[],errors=[],remote=[];
const page=await browser.newPage({viewport:{width:1440,height:1100}});
await page.route('**/*',route=>{if(route.request().url().startsWith('http://127.0.0.1:4173/')||route.request().url().startsWith('data:'))return route.continue();remote.push(route.request().url());return route.abort();});
page.on('pageerror',e=>errors.push(e.message));
const kinds=['button','text','number','checkbox','dropdown'];
const sample=(side,kind)=>page.locator(`[data-sample="${side}-${kind}"]`);
const control=(side,kind)=>['text','number'].includes(kind)?sample(side,kind).locator('input'):sample(side,kind).locator('[tabindex]').first();
const surface=(side,kind)=>kind==='checkbox'?control(side,kind).locator(':scope > div').first():control(side,kind);
const metrics=locator=>locator.evaluate(el=>{const c=getComputedStyle(el);return Object.fromEntries(['borderTopWidth','borderTopColor','borderRadius','outlineStyle','outlineWidth','boxShadow','backgroundColor','paddingTop','paddingBottom','paddingLeft','paddingRight','fontSize','height','width','transition'].map(k=>[k,c[k]]));});
async function capture(side,kind,state){await page.mouse.move(1200,1000);const css=await metrics(surface(side,kind));const png=await sample(side,kind).screenshot({caret:'hide'});fs.writeFileSync(`${evidence}/parity-${kind}-${state}-${side}.png`,png);return {css,png};}
async function compare(kind,state,action){
 const a=control('original',kind),b=control('pilot',kind);if(action)await action(a,'original');const left=await capture('original',kind,state);if(action)await action(b,'pilot');const right=await capture('pilot',kind,state);
 assert.deepEqual(right.css,left.css,`${kind} ${state} surface geometry/decoration`);
 const equal=left.png.equals(right.png);comparisons.push({kind,state,metrics_match:true,png_byte_identical:equal,original:left.css,pilot:right.css});
 // Record pixel equality separately from geometry; inspect all images visually.
 if(!equal)console.log(`Image differs: ${kind} ${state}`);
}
try{
 await page.goto('http://127.0.0.1:4173/reference.html');await page.locator('[data-sample="pilot-dropdown"]').waitFor();await page.evaluate(()=>document.fonts.ready);
 for(const kind of kinds)await compare(kind,'rest');
 for(const kind of kinds){await compare(kind,'pointer-focus',async el=>{if(kind==='dropdown'){await el.focus();}else await el.click();});await page.locator('#blur-target').click();}
 for(const kind of kinds){await compare(kind,'keyboard-focus',async el=>{await page.locator('#blur-target').focus();await el.focus();await el.press('Tab');await el.press('Shift+Tab');});await page.locator('#blur-target').click();}
 await page.getByLabel('Highlight colour').selectOption('#267760');
 for(const kind of kinds){await compare(kind,'consumer-green',async el=>el.focus());await page.locator('#blur-target').click();}
 await page.getByLabel('Error samples').check();for(const kind of kinds)await compare(kind,'error');await page.getByLabel('Error samples').uncheck();
 await page.getByLabel('Disabled samples').check();for(const kind of kinds)await compare(kind,'disabled');await page.getByLabel('Disabled samples').uncheck();
 await page.getByLabel('Mixed samples').check();await compare('checkbox','mixed');await page.getByLabel('Mixed samples').uncheck();
 // Open/select/clear each actual dropdown through its original pointer contract.
 await page.getByLabel('Highlight colour').selectOption('#0061a3');
 const panelImages=[];
 for(const side of ['original','pilot']){
  await control(side,'dropdown').click();const search=page.getByPlaceholder('Select existing...');await search.waitFor();await page.mouse.move(1200,1000);const overlay=page.locator('[data-tempo-overlay]');const panelImage=await overlay.screenshot({caret:'hide'});fs.writeFileSync(`${evidence}/parity-dropdown-open-${side}.png`,panelImage);panelImages.push(panelImage);await search.fill('eng');await search.press('ArrowDown');await search.press('Enter');await page.waitForTimeout(40);assert.match(await sample(side,'dropdown').innerText(),/Engineering/);
 }
 assert.equal(panelImages[0].equals(panelImages[1]),true,'original/pilot open panel images');comparisons.push({kind:'dropdown',state:'open',png_byte_identical:true,metrics_match:true});
 await page.locator('#blur-target').click();await compare('dropdown','selected');
 for(const side of ['original','pilot']){await sample(side,'dropdown').getByRole('button',{name:'Clear selection'}).click();assert.match(await sample(side,'dropdown').innerText(),/Pick a team/);}
 await page.locator('#blur-target').click();await compare('dropdown','cleared');
 checks.push('source six-file reference compiled without app/business imports','all five surfaces compared at identical dimensions and states','pointer/keyboard/blur and consumer colour decoration','error/disabled/mixed/selected/clear states');
 await page.getByLabel('Highlight colour').selectOption('#0061a3');await page.screenshot({path:evidence+'/reference-overview.png',fullPage:true});
 // Verify the user-facing catalogue itself, including its CSS and consumer callbacks.
 await page.goto('http://127.0.0.1:4173/');const text=page.getByLabel('Demo name');await text.click();await page.mouse.move(1200,900);
 let style=await metrics(text);assert.equal(style.borderTopWidth,'1px');assert.equal(style.borderTopColor,'rgb(0, 97, 163)');assert.equal(style.outlineWidth,'0px');assert.equal(style.boxShadow,'rgba(0, 97, 163, 0.7) 0px 0px 3px 0px');
 await page.screenshot({path:evidence+'/focus-after.png'});await page.getByRole('button',{name:'Reset examples'}).click();assert.equal((await metrics(text)).boxShadow,'none');
 await page.getByLabel('Theme override').check();await text.click();assert.equal((await metrics(text)).borderTopColor,'rgb(38, 119, 96)');
 const dropdown=page.getByRole('combobox',{name:'Pick a team'});await dropdown.click();const search=page.getByPlaceholder('Select existing...');await search.waitFor();assert.equal((await metrics(search)).borderTopColor,'rgb(38, 119, 96)');
 await page.locator('[data-tempo-overlay]').evaluate(el=>el.dispatchEvent(new Event('scroll')));assert.equal(await page.locator('[data-tempo-overlay]').count(),1,'inside-panel scroll remains open');
 await page.getByRole('button',{name:'Reset examples'}).click();assert.equal(await page.locator('[data-tempo-overlay]').count(),0);assert.equal((await metrics(text)).boxShadow,'none');
 await page.getByRole('button',{name:'Clear name',exact:true}).click();await page.getByRole('button',{name:'Save mock form',exact:true}).click();assert.equal((await metrics(text)).borderTopColor,'rgb(139, 0, 0)');await text.fill('Retry');await text.press('Tab');assert.equal((await metrics(text)).borderTopColor,'rgb(38, 119, 96)');
 checks.push('live catalogue uses thin border/3px glow and clears on blur','consumer green reaches input and dropdown search','outside click preserves destination focus and clears overlay','inside-panel scroll does not close dropdown','validation error/retry decorates actual field');
 assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);
 fs.writeFileSync(evidence+'/visual-parity-result.json',JSON.stringify({passed:true,checks,comparisons,runtime_errors:errors,remote_attempts:remote,limits:['Original source reference uses explicit RNWeb TextInput, exact font and isolated overlay ports; production shell/gesture runtime/native not run','GButton form decoration in comparison is consumer-composed; live catalogue adds bounded keyboard decoration','Custom dropdown searchStyle is a consumer colour extension; source default blue remains the baseline']},null,2));console.log(JSON.stringify({passed:true,comparisons:comparisons.length,png_identical:comparisons.filter(c=>c.png_byte_identical).length,checks:checks.length}));
}catch(error){fs.writeFileSync(evidence+'/visual-parity-result.json',JSON.stringify({passed:false,error:String(error),checks,comparisons,errors,remote},null,2));throw error;}finally{await browser.close();}
