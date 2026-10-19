const assert=require('node:assert/strict');
const core=require('../dist/phase3-core.js');
assert.ok(core.GRAMMAR.length>=10);assert.ok(core.FRACTURE.length>=10);assert.equal(core.LISTENING.length,100);assert.ok(core.READING.length>=8);
assert.equal(core.accepts('ÁGUA',['água']),true,'normalização preserva respostas equivalentes');
const flexible=core.FRACTURE.find(item=>item.id==='f2');
assert.equal(core.validateFracture(flexible,['田中さん','は','図書館','で','勉強します']),true);
assert.equal(core.validateFracture(flexible,['図書館','で','田中さん','は','勉強します']),true,'ordem japonesa alternativa válida precisa ser aceita');
assert.equal(core.validateFracture(flexible,['田中さん','図書館','は','で','勉強します']),false);
assert.deepEqual([core.labyrinthStage(0),core.labyrinthStage(4),core.labyrinthStage(7)],[1,2,3]);
assert.equal(core.readingPrompt(core.READING[0],1).language,'pt');
assert.equal(core.readingPrompt(core.READING[0],2).language,'ja-assisted');
assert.equal(core.readingPrompt(core.READING[0],3).language,'ja');
for(const item of core.LISTENING){assert.equal(item.choices.length,3);assert.ok(item.choices.includes(item.meanings[0]));}
const selected=core.selectAdaptive(core.LISTENING,10,{},core.LISTENING.slice(0,20).map(item=>item.id),()=>.5);
assert.equal(selected.length,10);assert.equal(new Set(selected.map(item=>item.id)).size,10,'sessão não repete estímulos');
assert.ok(selected.every(item=>!core.LISTENING.slice(0,20).some(recent=>recent.id===item.id)),'itens recentes devem ser evitados quando há conteúdo suficiente');
const fullCycle=core.selectAdaptive(core.LISTENING,core.LISTENING.length,{},[],()=>.5);
assert.equal(fullCycle.length,100);assert.equal(new Set(fullCycle.map(item=>item.id)).size,100,'ciclo completo mostra todos antes de repetir');
console.log('FASE 3: gramática, flexibilidade, escuta e leitura aprovadas');
