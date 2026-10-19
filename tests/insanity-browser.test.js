const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');

const root=path.resolve(__dirname,'../dist');
const server=http.createServer((req,res)=>{
  const relative=req.url==='/'?'index.html':req.url.replace(/^\//,'');
  const file=path.join(root,relative);
  if(!file.startsWith(root)||!fs.existsSync(file)){ res.writeHead(404).end(); return; }
  res.setHeader('content-type',file.endsWith('.js')?'text/javascript':'text/html');
  res.end(fs.readFileSync(file));
});

function ledger(known,hits,errors){
  const bits=Buffer.alloc(Math.ceil(284196/8));
  for(let i=0;i<known;i++) bits[i>>3]|=1<<(i&7);
  return JSON.stringify({known,hits,errors,bits:bits.toString('base64')});
}

async function contextWith(browser,{known,hits,errors,unlocked=false}={known:0,hits:0,errors:0}){
  const context=await browser.newContext({viewport:{width:390,height:844}});
  await context.addInitScript(({ledgerValue,unlocked})=>{
    localStorage.setItem('kana-nerd-ledger-v1',ledgerValue);
    if(unlocked) localStorage.setItem('kana-insanity-stats-v1',JSON.stringify({unlockedAt:1,best:0,attempts:0,totalCorrect:0}));
  },{ledgerValue:ledger(known,hits,errors),unlocked});
  return context;
}

(async()=>{
  if(!fs.existsSync(chromium.executablePath())){ console.log('INSANITY: navegador não instalado; teste E2E preservado para ambiente com Chromium'); return; }
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin=`http://127.0.0.1:${server.address().port}`;
  const browser=await chromium.launch({headless:true});
  const fixture=[['猫','ねこ','n','',2,['gato','gata'],1,''],['犬','いぬ','n','',2,['cachorro','cão'],2,''],['猿','さる','n','',2,['macaco'],3,'']];

  for(const sample of [
    {known:199999,hits:100,errors:0,expected:false,label:'199.999 + 100%'},
    {known:200000,hits:7499,errors:2501,expected:false,label:'200.000 + 74,99%'},
    {known:200000,hits:7500,errors:2500,expected:true,label:'200.000 + 75%'}
  ]){
    const context=await contextWith(browser,sample),page=await context.newPage(); await page.goto(origin); await page.click('[data-mode="vocabulary"]');
    assert.equal(await page.locator('#insanityCard').isVisible(),true,'card sempre visível');
    assert.equal(await page.locator('#insanityCard').evaluate(el=>el.classList.contains('unlocked')),sample.expected,sample.label);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth),true,'sem overflow mobile');
    await context.close();
  }

  const context=await contextWith(browser,{known:1,hits:0,errors:100,unlocked:true}),page=await context.newPage();
  await page.route('https://cdn.jsdelivr.net/**',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(fixture)}));
  await page.goto(origin); await page.click('[data-mode="vocabulary"]');
  assert.equal(await page.locator('#insanityCard').evaluate(el=>el.classList.contains('unlocked')),true,'não relocka após queda');
  const vocabBefore=await page.evaluate(()=>localStorage.getItem('kana-vocabulary-progress-v1'));
  const ledgerBefore=await page.evaluate(()=>localStorage.getItem('kana-nerd-ledger-v1'));
  await page.click('#insanityCard'); await page.click('#startInsanity'); await page.waitForSelector('#game:not([hidden])');
  assert.equal(await page.locator('.game-head').isVisible(),false,'contador oculto durante run');
  const first=await page.locator('#vocabWord').textContent(),answers={猫:'gato',犬:'cachorro',猿:'macaco'};
  await page.fill('#answer',answers[first]); await page.press('#answer','Enter'); await page.waitForTimeout(100);
  assert.equal(await page.locator('#game').isVisible(),true,'acerto continua a run');
  const resumedWord=await page.locator('#vocabWord').textContent(); await page.reload(); await page.click('[data-mode="vocabulary"]'); await page.click('#insanityCard');
  assert.equal(await page.locator('#startInsanity').textContent(),'CONTINUAR RUN','refresh oferece retomada'); await page.click('#startInsanity');
  assert.equal(await page.locator('#vocabWord').textContent(),resumedWord,'refresh preserva questão');
  await page.fill('#answer','resposta definitivamente errada'); await page.press('#answer','Enter'); await page.waitForSelector('#insanityResultPanel:not([hidden])');
  assert.equal(await page.locator('#insanityResultStreak').textContent(),'1','primeiro erro encerra com sequência correta');
  assert.equal(await page.evaluate(()=>localStorage.getItem('kana-insanity-active-v1')),null,'derrota não pode ser desfeita por refresh');
  assert.equal(await page.evaluate(()=>localStorage.getItem('kana-vocabulary-progress-v1')),vocabBefore,'não altera mastery');
  assert.equal(await page.evaluate(()=>localStorage.getItem('kana-nerd-ledger-v1')),ledgerBefore,'não altera estatísticas Nerd');
  const stats=await page.evaluate(()=>JSON.parse(localStorage.getItem('kana-insanity-stats-v1'))); assert.equal(stats.best,1); assert.equal(stats.attempts,1); assert.equal(stats.totalCorrect,1);

  await context.close(); await browser.close(); server.close();
  console.log('INSANITY: testes mobile e de integração aprovados');
})().catch(error=>{ console.error(error); server.close(); process.exit(1); });
