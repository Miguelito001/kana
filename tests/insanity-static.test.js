const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync('dist/index.html','utf8');
const persistence=fs.readFileSync('dist/persistence-core.js','utf8');
const corpus=html+persistence;
const inline=html.match(/<script>\s*([\s\S]*?)<\/script>\s*<\/body>/)[1];
new vm.Script(inline,{filename:'inline.js'});
for(const file of ['dist/insanity-core.js','dist/vocabulary-data.js','dist/kanji-data.js']) new vm.Script(fs.readFileSync(file,'utf8'),{filename:file});

const requirements={
  'card permanente':'id="insanityCard"',
  'painel bloqueado':'id="insanityLockedPanel"',
  'preparação':'id="insanityPrepPanel"',
  'resultado':'id="insanityResultPanel"',
  'contador oculto':'.game.insanity-run .game-head',
  'run persistente':'kana-insanity-active-v1',
  'recorde persistente':'kana-insanity-stats-v1',
  'isolamento de resposta':"screen==='insanity-run'",
  'sem atualização pedagógica':'submitInsanityAnswer(raw)',
  'chunks sob demanda':'loadInsanityShard',
  'rotação de chunks':'insanityRun.streak%250===0'
};
for(const [label,needle] of Object.entries(requirements)) assert.ok(corpus.includes(needle),label);
const insanityBody=html.slice(html.indexOf('async function submitInsanityAnswer'),html.indexOf('function getAccepted'));
assert.ok(!insanityBody.includes('updateVocabProgress'),'INSANITY não pode alterar mastery');
assert.ok(!insanityBody.includes('recordDaily'),'INSANITY não pode alterar ranking pedagógico');
assert.ok(!insanityBody.includes('registerAttempt'),'INSANITY não pode alterar sessão normal');
console.log('INSANITY: integração e isolamento aprovados');
