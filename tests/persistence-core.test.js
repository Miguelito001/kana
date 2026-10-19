const assert=require('node:assert/strict');
const p=require('../dist/persistence-core.js');

const legacy={
 [p.KEYS.lastSession]:JSON.stringify({hits:97,misses:3}),
 [p.KEYS.daily]:JSON.stringify({'2026-09-15':{hits:97,misses:3}}),
 [p.KEYS.vocabulary]:JSON.stringify({'vocab-saru':{attempts:4,mastery:2}}),
 [p.KEYS.nerd]:JSON.stringify({known:12,hits:20,errors:2,bits:'AA=='}),
 [p.KEYS.insanityStats]:JSON.stringify({unlockedAt:1,best:4827}),
 [p.KEYS.insanityRun]:JSON.stringify({status:'active',streak:8}),
 [p.KEYS.endgames]:JSON.stringify({blitz:{bestStreak:40}})
};
const storage=new p.MemoryStorage(legacy),created=p.createRepositories(storage,{clock:()=>1000});
assert.equal(created.migration.completed,true);
assert.equal(created.repositories.sessions.getLast().hits,97);
assert.equal(created.repositories.mastery.getNerd().known,12);
assert.equal(created.repositories.unlocks.getInsanityStats().best,4827);
assert.equal(created.repositories.records.getEndgames().blitz.bestStreak,40);
for(const[key,value]of Object.entries(legacy))assert.equal(storage.getItem(key),value,`${key} preservada`);
const backup=JSON.parse(storage.getItem(p.BACKUP_KEY));assert.equal(backup.raw[p.KEYS.insanityStats],legacy[p.KEYS.insanityStats]);
const again=p.migrateLegacy(storage,()=>2000);assert.equal(again.idempotent,true);assert.equal(JSON.parse(storage.getItem(p.BACKUP_KEY)).createdAt,backup.createdAt,'não duplica backup');

const broken=new p.MemoryStorage({[p.KEYS.daily]:'{quebrado'}),failed=p.migrateLegacy(broken,()=>1000);
assert.equal(failed.completed,false);assert.equal(broken.getItem(p.KEYS.daily),'{quebrado');assert.ok(broken.getItem(p.BACKUP_KEY),'backup existe antes da falha');

const word={id:'dict-4-92',written:'猿',reading:'さる',category:'noun'};
const first=p.contentIdentity(word,'jmdict-pt'),moved=p.contentIdentity({...word,id:'dict-9-1'},'jmdict-pt');
assert.equal(first.contentId,moved.contentId,'ID canônico não depende do chunk/posição');assert.notEqual(first.legacyId,moved.legacyId);

const queue=created.repositories.queue,op=queue.enqueue({id:'11111111-1111-4111-8111-111111111111',kind:'attempts',entityId:'a',payload:{correct:true}});
queue.enqueue({...op});assert.equal(queue.list().length,1,'operação repetida é idempotente');
queue.fail([op.id],()=>1000);assert.equal(queue.batch(100,()=>1000).length,0,'backoff impede retry imediato');assert.equal(queue.batch(100,()=>5000).length,1);
queue.fail([op.id],()=>1000);queue.release(null);assert.equal(queue.batch(100,()=>1000).length,1,'retorno do app libera retry pendente imediatamente');
const oldOperationId=queue.list()[0].id;queue.renew([oldOperationId]);assert.notEqual(queue.list()[0].id,oldOperationId,'gravação não confirmada recebe novo recibo para reenvio');

const owned=new p.SyncQueue(new p.LocalDocumentStore(new p.MemoryStorage()));
owned.enqueue({id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',ownerId:'user-a',kind:'settings',entityId:'a',payload:{}});
owned.enqueue({id:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',ownerId:'user-b',kind:'settings',entityId:'b',payload:{}});
owned.enqueue({id:'cccccccc-cccc-4ccc-8ccc-cccccccccccc',kind:'settings',entityId:'guest',payload:{}});
assert.equal(owned.batch(100,Date.now,'user-a').length,1,'conta A não envia operações da conta B');
assert.equal(owned.claimUnowned('user-a'),2,'primeira conta reivindica apenas operações guest');
assert.equal(owned.batch(100,Date.now,'user-a').length,2);
assert.equal(owned.batch(100,Date.now,'user-b').length,1);
owned.upsert({id:'dddddddd-dddd-4ddd-8ddd-dddddddddddd',ownerId:'user-a',kind:'sessions',entityId:'run-1',payload:{summary:{hits:1}}});
owned.upsert({id:'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',ownerId:'user-a',kind:'sessions',entityId:'run-1',payload:{summary:{hits:2}}});
assert.equal(owned.list().filter(item=>item.entityId==='run-1').length,1,'snapshot pendente da sessão é substituído pelo mais recente');
assert.equal(owned.list().find(item=>item.entityId==='run-1').payload.summary.hits,2);
owned.clear();assert.equal(owned.list().length,0,'troca de identidade descarta toda fila local anterior');

assert.equal(p.mergeConflict('records',{value:10},{value:8}).value,10);
assert.equal(p.mergeConflict('unlocks',{unlockedAt:1},{unlockedAt:null}).unlockedAt,1);
assert.equal(p.mergeConflict('attempts',[{id:'a'}],[{id:'a'},{id:'b'}]).length,2);
assert.equal(p.mergeConflict('mastery',{contentId:'x',evidence:[{id:'a'}]},{contentId:'x',evidence:[{id:'b'}]}).needsRecalculation,true);

const aggregate=p.aggregateSessions([
 {id:'pc',mode:'hiragana',started_at:'2026-09-15T10:00:00Z',summary:{dateKey:'2026-09-15',hits:3,errors:1,attempts:4}},
 {id:'phone',mode:'vocabulary',started_at:'2026-09-15T11:00:00Z',summary:{dateKey:'2026-09-15',hits:2,errors:0,attempts:2,wrongAnswers:[]}}
 ,{id:'blitz',mode:'blitz',started_at:'2026-09-15T12:00:00Z',summary:{dateKey:'2026-09-15',hits:40,errors:1,attempts:41,excludeFromDaily:true}}
],{'2026-09-15':{hits:99,misses:99,vocabulary:{hits:99,misses:99,newWords:{old:true}}}});
assert.deepEqual({hits:aggregate.days['2026-09-15'].hits,misses:aggregate.days['2026-09-15'].misses},{hits:5,misses:1},'servidor substitui totais locais divergentes');
assert.deepEqual({hits:aggregate.days['2026-09-15'].vocabulary.hits,misses:aggregate.days['2026-09-15'].vocabulary.misses},{hits:2,misses:0});
assert.equal(aggregate.last.hits,2,'última sessão é igual em todos os aparelhos');

let calls=0;const remote={pushBatch:async batch=>{calls++;return{acceptedIds:batch.map(item=>item.id)}}};
const coordinator=new p.SyncCoordinator(queue,remote);
coordinator.flush().then(result=>{assert.equal(result.status,'synced');assert.equal(calls,1);assert.equal(queue.list().length,0);});

const exported=created.repositories.export();assert.equal(exported.format,'kana-export-v1');assert.equal(exported.data.insanityStats.best,4827);
created.repositories.settings.saveGrammarCapabilities({schemaVersion:1,unlocked:['past']});assert.deepEqual(created.repositories.settings.getGrammarCapabilities(null).unlocked,['past'],'capacidades gramaticais são aditivas');
assert.equal(created.repositories.auth.mode(),'guest');
console.log('PERSISTENCE: legado, backup, repositories, offline e conflitos aprovados');
