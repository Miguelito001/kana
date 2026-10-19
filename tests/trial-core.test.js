const assert=require('node:assert/strict');
const core=require('../dist/trial-core.js');

assert.equal(core.QUESTIONS.length,28);
for(const territory of core.TERRITORIES)assert.equal(core.QUESTIONS.filter(item=>item.territory===territory).length,4);
assert.equal(core.stageFor(0),1);assert.equal(core.stageFor(10),2);assert.equal(core.stageFor(25),3);assert.equal(core.stageFor(50),4);

const profile=Object.fromEntries(core.TERRITORIES.map(id=>[id,25]));
assert.equal(core.unlockStatus({...profile,reading:undefined},1000,{}).unlocked,false);
assert.equal(core.unlockStatus(profile,349,{}).unlocked,false);
const unlocked=core.unlockStatus(profile,350,{});assert.equal(unlocked.unlocked,true);
assert.equal(core.unlockStatus({},0,{unlockedAt:123}).unlocked,true,'desbloqueio global é monotônico');

const picked=core.pickQuestion({profile,correct:0,counts:{},recent:[],lastTerritory:'hiragana'},()=>0);
assert.notEqual(picked.territory,'hiragana','território não repete imediatamente quando há alternativas');
const advanced=core.pickQuestion({profile,correct:50,counts:{},recent:[],lastTerritory:null},()=>0);
assert.ok(advanced.minStage>=3,'endgame muda a natureza das questões');

let run={correct:0,errors:0,threat:0,recovery:0};
run=core.applyAnswer(run,false);run=core.applyAnswer(run,false);run=core.applyAnswer(run,false);
assert.equal(run.ended,true,'três rupturas encerram a prova');
run={correct:0,errors:1,threat:1,recovery:0};
for(let i=0;i<5;i++)run=core.applyAnswer(run,true);
assert.equal(run.threat,0,'recuperação consistente repara uma ruptura');

const first=core.finishRun({best:80,attempts:1,totalCorrect:80},{correct:30,errors:3,startedAt:0,counts:{kanji:4}},1000);
assert.equal(first.stats.best,80,'run menor não sobrescreve recorde');
assert.equal(first.stats.attempts,2);assert.equal(first.stats.totalCorrect,110);
console.log('TRIAL: seleção adaptativa, unlock, pressão e recordes aprovados');
