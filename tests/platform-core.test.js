const assert=require('node:assert/strict');
const core=require('../dist/platform-core.js');

const legacy={'kana-last-session':'{"hits":9,"misses":1}','kana-vocabulary-progress-v1':'{"vocab-saru":{"attempts":5,"hits":4,"errors":1,"mastery":3}}'};
const storage=new core.MemoryAdapter(legacy);
const first=core.migrate(storage,1000),second=core.migrate(storage,2000);
assert.equal(first.schemaVersion,4);
assert.equal(second.migrations.filter(item=>item.id==='v2-foundation').length,1,'migração precisa ser idempotente');
assert.equal(second.migrations.filter(item=>item.id==='v3-verb-form-mastery').length,1,'migração verbal precisa ser aditiva e idempotente');
assert.equal(second.migrations.filter(item=>item.id==='v4-live-multidimensional-evidence').length,1,'mastery conectado precisa de migração aditiva idempotente');
assert.equal(storage.getItem('kana-last-session'),legacy['kana-last-session'],'histórico antigo deve permanecer intacto');
assert.equal(storage.getItem('kana-vocabulary-progress-v1'),legacy['kana-vocabulary-progress-v1'],'mastery antigo deve permanecer intacto');

const projected=core.projectLegacyVocabulary({attempts:5,hits:4,errors:1,mastery:3});
assert.equal(projected.dimensions.visualMeaning.score,60);
assert.equal(projected.dimensions.audioMeaning,null,'não inventa domínio auditivo');
assert.equal(projected.dimensions.context,null,'não inventa domínio contextual');
assert.equal(core.retentionState({encounters:300,hits:300,dimensionScores:[100],successfulDays:1,spacedRecoveries:0}),core.RETENTION.LEARNED,'repetição na mesma sessão não domina');
assert.equal(core.retentionState({encounters:20,hits:19,errors:1,dimensionScores:[90,88],successfulDays:3,spacedRecoveries:3}),core.RETENTION.MASTERED);

let live={};
for(let i=0;i<20;i++)live=core.recordMasteryEvidence(live,{dimension:'visualMeaning',correct:true,at:1000+i,sessionId:'same-session'});
assert.equal(live.retentionState,core.RETENTION.LEARNED,'repetições na mesma sessão não criam retenção temporal');
live=core.recordMasteryEvidence(live,{dimension:'visualMeaning',correct:true,at:24*60*60*1000,sessionId:'day-two'});
live=core.recordMasteryEvidence(live,{dimension:'grammaticalUsage',correct:true,at:2*24*60*60*1000,sessionId:'day-three',facet:'potential'});
assert.equal(live.dimensions.grammaticalUsage.facets.potential.hits,1,'forma verbal mantém evidência própria dentro do lema');
assert.equal(live.retentionEvidence.successfulDays,3);
assert.ok(live.retentionEvidence.spacedRecoveries>=1,'recuperação após espaçamento é evidência real');
assert.throws(()=>core.recordMasteryEvidence(live,{dimension:'invented',correct:true}),/Dimensão/);

const insanityRule={all:[{type:'metric_at_least',path:'nerd.known',value:200000},{type:'metric_at_least',path:'nerd.accuracy',value:75}]};
assert.equal(core.evaluateRequirement(insanityRule,{nerd:{known:199999,accuracy:100}}).passed,false);
assert.equal(core.evaluateRequirement(insanityRule,{nerd:{known:200000,accuracy:75}}).passed,true);
const persisted=core.evaluateUnlock({requirement:insanityRule},{nerd:{known:1,accuracy:0}},{unlockedAt:50});
assert.equal(persisted.unlocked,true,'desbloqueio não deve regredir');

let session=core.createSession({mode:'test',territory:'vocabulary',startedAt:10,policy:{endOnError:true}});
session=core.recordAnswer(session,{correct:true,at:20});
session=core.recordAnswer(session,{correct:false,at:30});
assert.deepEqual(session.summary,{attempts:2,hits:1,errors:1});
assert.equal(session.status,'failed');

assert.equal(core.validateAnswer('  CÃO  ',['cachorro','cão']).correct,true);
const content=new core.ContentProviderRegistry();
let loaded=0;
content.register('lazy',{loadChunk:async request=>{ loaded++; return [request.chunk]; }});
content.loadChunk('lazy',{chunk:7}).then(result=>{ assert.deepEqual(result,[7]); assert.equal(loaded,1); });
const normalized=core.normalizeContentItem({id:'x'},{id:'own',license:'CC0'});
assert.equal(normalized.frequencyRank,null,'frequência ausente não pode ser inventada');

let difficulty={};
for(let i=0;i<8;i++) difficulty=core.updateDifficulty(difficulty,{correct:i>=4,at:i}).stat;
assert.equal(difficulty.cursed,true);
for(let i=0;i<12;i++) difficulty=core.updateDifficulty(difficulty,{correct:true,at:20+i}).stat;
assert.equal(difficulty.cursed,false,'recuperação consistente quebra maldição');
assert.equal(core.isNemesis({runDeaths:3,errors:8,distinctDays:2}),true);
let cemetery=core.recordCemetery([],{mode:'insanity',itemId:'x',display:'朝',runLength:100,at:1});
cemetery=core.recordCemetery(cemetery,{mode:'insanity',itemId:'x',display:'朝',runLength:80,at:2});
assert.equal(cemetery[0].deaths,2); assert.equal(cemetery[0].longestRun,100);
assert.equal(core.portugueseDependency([{requiresPortuguese:true,correct:true}]).value,null);
assert.equal(core.portugueseDependency([{requiresPortuguese:false,correct:true},{requiresPortuguese:false,correct:false}]).value,50);

const platform=core.createPlatform(storage);
assert.ok(platform.audio&&platform.content&&platform.bosses&&platform.achievements);
assert.equal(core.TERRITORIES.find(item=>item.id==='grammar').status,'active');
assert.equal(core.FEATURES.fracture,core.FEATURE_STATUS.COMPLETE);
assert.equal(core.FEATURES.void,core.FEATURE_STATUS.COMPLETE);
assert.equal(core.FEATURES.labyrinth,core.FEATURE_STATUS.COMPLETE);
assert.equal(core.FEATURES.curses,core.FEATURE_STATUS.COMPLETE);
assert.equal(core.FEATURES.nemesis,core.FEATURE_STATUS.COMPLETE);
assert.equal(core.FEATURES.cemetery,core.FEATURE_STATUS.COMPLETE);
assert.equal(core.FEATURES.bosses,core.FEATURE_STATUS.COMPLETE);
assert.equal(core.FEATURES.globalProfile,core.FEATURE_STATUS.COMPLETE);
assert.equal(core.FEATURES.theTrial,core.FEATURE_STATUS.COMPLETE);
assert.equal(core.TERRITORIES.find(item=>item.id==='global').status,'active');
assert.equal(core.FEATURES.chimera,core.FEATURE_STATUS.COMPLETE,'CHIMERA curado e jogável deve constar como completo');
assert.equal(core.FEATURES.blitz,core.FEATURE_STATUS.COMPLETE,'BLITZ sincronizado deve constar como completo');
assert.equal(core.FEATURES.insanity,core.FEATURE_STATUS.COMPLETE);
console.log('PLATFORM: fundação, migração e metassistemas aprovados');
