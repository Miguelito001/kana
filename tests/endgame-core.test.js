const assert=require('node:assert/strict');
const core=require('../dist/endgame-core.js');

assert.equal(core.blitzLimit(0),4500);
assert.ok(core.blitzLimit(25)<core.blitzLimit(4),'BLITZ precisa acelerar progressivamente');
assert.equal(core.blitzLimit(10000),1350,'limite mínimo evita tempo absurdo');
assert.equal(core.blitzPool(0).includes(core.BLITZ_COMBOS[0]),false);
assert.equal(core.blitzPool(15).includes(core.BLITZ_COMBOS[0]),true);
assert.equal(core.blitzPool(31).includes(core.BLITZ_WORDS[0]),true);
assert.equal(core.accepts(' CÃO ',['cachorro','cão']),true);

const first=core.ALIEN[0],different=core.pickDifferent(core.ALIEN,first.id,()=>0);
assert.notEqual(different.id,first.id,'não repete o mesmo sinal imediatamente');
for(const item of core.ALIEN){
  const choices=core.alienChoices(item,()=>.4);
  assert.equal(choices.length,3,`${item.id} precisa ter três alternativas`);
  assert.ok(choices.includes(item.answers[0]));
  assert.equal(new Set(choices).size,3);
}
assert.ok(core.alienPool(0).every(item=>item.tier===1));
assert.ok(core.alienPool(14).some(item=>item.tier===4),'ALIEN deve mudar qualitativamente até adaptações difíceis');

let stats=core.emptyStats();
stats=core.recordAlien(stats,first,false,900);
assert.equal(stats.alien.errors,1); assert.equal(stats.alien.items[first.id].mastery,0);
stats=core.recordAlien(stats,first,true,500);
assert.equal(stats.alien.hits,1); assert.equal(stats.alien.items[first.id].mastery,8);
const done=core.finishBlitz(stats,{startedAt:1000,streak:12},'wrong',['きょ','kyo'],5000);
assert.equal(done.result.streak,12); assert.equal(done.stats.blitz.bestStreak,12);
assert.equal(core.CHIMERA_CONTRACT.punishAmbiguity,false);
assert.ok(core.CHIMERA_CONTRACT.requires.includes('attestedCompound'));
assert.equal(core.CHIMERA_CONTRACT.status,'playable-curated');
assert.ok(core.CHIMERA.length>=12,'CHIMERA precisa de uma sessão completa sem repetir');
for(const item of core.CHIMERA){assert.equal(core.chimeraChoices(item,()=>.4).length,3);assert.ok(item.answers.length);assert.ok(item.components.length>=2);}
stats=core.recordChimera(stats,core.CHIMERA[0],true,700);assert.equal(stats.chimera.hits,1);
stats=core.recordChimera(stats,core.CHIMERA[0],false,900);assert.equal(stats.chimera.errors,1);
assert.equal(core.accepts('trilha da montanha',core.CHIMERA.find(item=>item.id==='mountain-path').answers),true,'sinônimo válido não pode ser punido');
console.log('ENDGAMES: regras de BLITZ, ALIEN e CHIMERA aprovadas');
