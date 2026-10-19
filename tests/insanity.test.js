const assert=require('node:assert/strict');
const insanity=require('../dist/insanity-core.js');

function progress(known,hits,errors){
  const data={};
  for(let i=0;i<known;i++) data[`dict-1-${i}`]={mastery:4,hits:i?0:hits,errors:i?0:errors};
  return data;
}

let state=insanity.unlockState(progress(199999,100,0),false);
assert.equal(state.unlocked,false,'199.999 conhecidas deve bloquear');
state=insanity.unlockState(progress(200000,7499,2501),false);
assert.equal(state.unlocked,false,'74,99% deve bloquear');
state=insanity.unlockState(progress(200000,7500,2500),false);
assert.equal(state.unlocked,true,'75% deve desbloquear');
assert.equal(state.justUnlocked,true);
state=insanity.unlockState(progress(1,0,100),true);
assert.equal(state.unlocked,true,'desbloqueio deve persistir');

const first=insanity.finishRun(insanity.emptyStats(),{streak:4827,startedAt:1000},{written:'猿',reading:'さる',given:'gato',correct:['macaco']},61000);
assert.equal(first.result.streak,4827);
assert.equal(first.stats.best,4827);
assert.equal(first.stats.totalCorrect,4827);
assert.equal(first.stats.attempts,1);
const smaller=insanity.finishRun(first.stats,{streak:20,startedAt:70000},{written:'犬'},80000);
assert.equal(smaller.stats.best,4827,'run menor não sobrescreve recorde');
assert.equal(smaller.stats.totalCorrect,4847);

const normalize=value=>String(value).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
assert.equal(insanity.acceptsAnswer(' CÃO ',['cachorro','cão'],normalize),true,'sinônimos normalizados devem valer');
assert.equal(insanity.shouldCountKnown(3.5,4,false),true,'cruzar mastery 4 conta como conhecida');
assert.equal(insanity.shouldCountKnown(4,5,false),false,'palavra já dominada não conta novamente');
assert.equal(insanity.shouldCountKnown(3,4,true),false,'registro compacto impede farm da mesma palavra');

const original=progress(1,8,2), snapshot=JSON.stringify(original);
insanity.finishRun(insanity.emptyStats(),{streak:10,startedAt:1},{written:'猫'},11);
assert.equal(JSON.stringify(original),snapshot,'INSANITY não altera progresso Nerd');

console.log('INSANITY: testes de regra aprovados');
