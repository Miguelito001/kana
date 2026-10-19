(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.KANA_PLATFORM=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const SCHEMA_VERSION=4;
  const META_KEY='kana-platform-meta-v2';
  const DIMENSIONS=Object.freeze(['visualMeaning','audioMeaning','reading','context','grammaticalUsage']);
  const RETENTION=Object.freeze({UNSEEN:'unseen',ENCOUNTERED:'encountered',FAMILIAR:'familiar',LEARNED:'learned',KNOWN:'known',MASTERED:'mastered'});
  const FEATURE_STATUS=Object.freeze({COMPLETE:'complete',PARTIAL:'partial',FOUNDATION:'foundation',PLANNED:'planned'});
  const FEATURES=Object.freeze({hiragana:'complete',blitz:'complete',katakana:'complete',alien:'complete',kanji:'complete',chimera:'complete',vocabulary1:'complete',vocabulary2:'complete',vocabulary3:'partial',nerd:'complete',insanity:'complete',trueInsanity:'planned',grammar:'complete',fracture:'complete',listening:'complete',void:'complete',reading:'complete',labyrinth:'complete',theTrial:'complete',multidimensionalMastery:'partial',grammarCapabilities:'partial',portugueseDependency:'complete',curses:'complete',nemesis:'complete',cemetery:'complete',bosses:'complete',globalProfile:'complete'});

  function clone(value){ return value==null?value:JSON.parse(JSON.stringify(value)); }
  function number(value,fallback=0){ const result=Number(value); return Number.isFinite(result)?result:fallback; }
  function readPath(object,path){ return String(path).split('.').reduce((value,key)=>value==null?undefined:value[key],object); }

  class MemoryAdapter{
    constructor(seed={}){ this.data=new Map(Object.entries(seed)); }
    getItem(key){ return this.data.has(key)?this.data.get(key):null; }
    setItem(key,value){ this.data.set(key,String(value)); }
    removeItem(key){ this.data.delete(key); }
  }

  class JsonStore{
    constructor(adapter,prefix=''){ this.adapter=adapter; this.prefix=prefix; }
    key(key){ return this.prefix+key; }
    get(key,fallback=null){ try { const value=this.adapter.getItem(this.key(key)); return value==null?clone(fallback):JSON.parse(value); } catch(_){ return clone(fallback); } }
    set(key,value){ try { this.adapter.setItem(this.key(key),JSON.stringify(value)); return true; } catch(_){ return false; } }
    remove(key){ try { this.adapter.removeItem(this.key(key)); return true; } catch(_){ return false; } }
    update(key,fallback,mutator){ const current=this.get(key,fallback); const next=mutator(clone(current))||current; this.set(key,next); return next; }
  }

  class IndexedDBAdapter{
    constructor(name='kana-platform-v2',version=1){ this.name=name; this.version=version; this.db=null; }
    async open(){
      if(this.db) return this.db;
      if(typeof indexedDB==='undefined') throw new Error('IndexedDB indisponível');
      this.db=await new Promise((resolve,reject)=>{ const request=indexedDB.open(this.name,this.version); request.onupgradeneeded=()=>['mastery','sessions','history','contentCache'].forEach(store=>{ if(!request.result.objectStoreNames.contains(store)) request.result.createObjectStore(store); }); request.onsuccess=()=>resolve(request.result); request.onerror=()=>reject(request.error); });
      return this.db;
    }
    async transact(store,key,value,operation='get'){ const db=await this.open(); return new Promise((resolve,reject)=>{ const tx=db.transaction(store,operation==='get'?'readonly':'readwrite'); const request=operation==='get'?tx.objectStore(store).get(key):operation==='delete'?tx.objectStore(store).delete(key):tx.objectStore(store).put(value,key); request.onsuccess=()=>resolve(request.result); request.onerror=()=>reject(request.error); }); }
    get(store,key){ return this.transact(store,key); }
    put(store,key,value){ return this.transact(store,key,value,'put'); }
    delete(store,key){ return this.transact(store,key,null,'delete'); }
  }

  function migrate(adapter,now=Date.now()){
    const store=new JsonStore(adapter);
    const before=store.get(META_KEY,{schemaVersion:1,migrations:[]});
    const migrations=Array.isArray(before.migrations)?before.migrations.slice():[];
    if(!migrations.some(item=>item.id==='v2-foundation')) migrations.push({id:'v2-foundation',at:now,kind:'additive'});
    if(!migrations.some(item=>item.id==='v3-verb-form-mastery')) migrations.push({id:'v3-verb-form-mastery',at:now,kind:'additive',preserves:'kana-vocabulary-progress-v1'});
    if(!migrations.some(item=>item.id==='v4-live-multidimensional-evidence')) migrations.push({id:'v4-live-multidimensional-evidence',at:now,kind:'additive',preserves:'legacy-mastery-and-history'});
    const next={...before,schemaVersion:SCHEMA_VERSION,migrations,legacyPreserved:true};
    store.set(META_KEY,next);
    return next;
  }

  function emptyDimensions(){ return Object.fromEntries(DIMENSIONS.map(name=>[name,null])); }
  function projectLegacyVocabulary(stat={}){
    const attempts=number(stat.attempts,number(stat.hits)+number(stat.errors));
    const legacyMastery=Math.max(0,Math.min(5,number(stat.mastery)));
    return {dimensions:{...emptyDimensions(),visualMeaning:attempts?{score:legacyMastery*20,attempts,hits:number(stat.hits),errors:number(stat.errors),evaluated:true,source:'legacy-vocabulary-v1'}:null},legacy:{mastery:legacyMastery},retentionEvidence:{encounters:attempts,successfulDays:0,spacedRecoveries:0}};
  }

  function retentionState(evidence={}){
    const encounters=number(evidence.encounters), hits=number(evidence.hits), errors=number(evidence.errors);
    const rate=hits+errors?hits/(hits+errors):0, days=number(evidence.successfulDays), recoveries=number(evidence.spacedRecoveries);
    const scores=(evidence.dimensionScores||[]).filter(Number.isFinite);
    if(!encounters) return RETENTION.UNSEEN;
    if(days>=3&&recoveries>=3&&scores.filter(score=>score>=85).length>=2) return RETENTION.MASTERED;
    if(days>=2&&recoveries>=1&&scores.some(score=>score>=70)) return RETENTION.KNOWN;
    if(hits>=4&&rate>=.65) return RETENTION.LEARNED;
    if(hits>=2) return RETENTION.FAMILIAR;
    return RETENTION.ENCOUNTERED;
  }

  function utcDay(value){ return new Date(value).toISOString().slice(0,10); }
  function boundedUnique(values,value,limit=40){ const list=(Array.isArray(values)?values:[]).filter(item=>item!==value); list.push(value); return list.slice(-limit); }
  function recordMasteryEvidence(state={},event={}){
    if(!DIMENSIONS.includes(event.dimension)) throw new Error(`Dimensão de mastery inválida: ${event.dimension}`);
    const at=number(event.at,Date.now()),correct=Boolean(event.correct),day=utcDay(at),sessionId=event.sessionId||null,dimensions={...emptyDimensions(),...(state.dimensions||{})};
    const before=dimensions[event.dimension]||{},attempts=number(before.attempts)+1,hits=number(before.hits)+(correct?1:0),errors=number(before.errors)+(correct?0:1),streak=correct?number(before.streak)+1:0;
    const oldScore=number(before.score,correct?45:25),score=Math.round(correct?Math.min(100,oldScore*.86+14):Math.max(0,oldScore*.72-8));
    const successfulDays=correct?boundedUnique(before.successfulDayKeys,day):[...(before.successfulDayKeys||[])];
    const sessionIds=sessionId?boundedUnique(before.sessionIds,sessionId,24):[...(before.sessionIds||[])];
    const lastCorrectAt=number(before.lastCorrectAt,0),spaced=correct&&lastCorrectAt>0&&at-lastCorrectAt>=20*60*60*1000;
    const facets={...(before.facets||{})};if(event.facet){const prior=facets[event.facet]||{attempts:0,hits:0,errors:0,streak:0};facets[event.facet]={...prior,attempts:prior.attempts+1,hits:prior.hits+(correct?1:0),errors:prior.errors+(correct?0:1),streak:correct?prior.streak+1:0,lastSeenAt:at,lastResult:correct?'correct':'wrong'};}
    dimensions[event.dimension]={...before,score,attempts,hits,errors,streak,evaluated:true,firstSeenAt:before.firstSeenAt||at,lastSeenAt:at,lastCorrectAt:correct?at:lastCorrectAt||null,successfulDayKeys:successfulDays,sessionIds,spacedRecoveries:number(before.spacedRecoveries)+(spaced?1:0),facets};
    const evaluated=Object.values(dimensions).filter(Boolean),evidence={encounters:evaluated.reduce((sum,item)=>sum+number(item.attempts),0),hits:evaluated.reduce((sum,item)=>sum+number(item.hits),0),errors:evaluated.reduce((sum,item)=>sum+number(item.errors),0),successfulDays:new Set(evaluated.flatMap(item=>item.successfulDayKeys||[])).size,spacedRecoveries:evaluated.reduce((sum,item)=>sum+number(item.spacedRecoveries),0),dimensionScores:evaluated.map(item=>number(item.score))};
    return{schemaVersion:1,dimensions,retentionEvidence:evidence,retentionState:retentionState(evidence),updatedAt:at};
  }

  function evaluateRequirement(rule,metrics={},context={}){
    if(!rule) return {passed:false,reason:'missing-rule'};
    if(rule.all){ const children=rule.all.map(item=>evaluateRequirement(item,metrics,context)); return {passed:children.every(item=>item.passed),children}; }
    if(rule.any){ const children=rule.any.map(item=>evaluateRequirement(item,metrics,context)); return {passed:children.some(item=>item.passed),children}; }
    const current=readPath(metrics,rule.path);
    const target=rule.value;
    const passed=rule.type==='achievement'?Boolean(context.achievements?.includes(rule.id)):
      rule.type==='duration_at_least'?number(current)>=number(target):
      rule.type==='metric_at_least'||rule.type==='record_at_least'||rule.type==='mastery_at_least'?number(current)>=number(target):false;
    return {passed,current,target,type:rule.type,path:rule.path};
  }

  function evaluateUnlock(definition,metrics,previous={}){
    if(previous.unlockedAt) return {...previous,unlocked:true,persisted:true,evaluation:evaluateRequirement(definition.requirement,metrics)};
    const evaluation=evaluateRequirement(definition.requirement,metrics);
    return {unlocked:evaluation.passed,unlockedAt:evaluation.passed?(definition.now||Date.now()):null,persisted:false,evaluation};
  }

  function normalizeAnswer(value){ return String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').trim().replace(/\s+/g,' '); }
  function validateAnswer(value,accepted=[]){ const normalized=normalizeAnswer(value); const match=accepted.find(answer=>normalizeAnswer(answer)===normalized); return {correct:Boolean(match),normalized,matched:match||null}; }

  function createSession({id,mode,territory,startedAt=Date.now(),policy={},metadata={}}={}){ return {id:id||`${mode||'session'}-${startedAt}`,mode,territory,startedAt,endedAt:null,status:'active',answers:[],summary:{attempts:0,hits:0,errors:0},policy:clone(policy),metadata:clone(metadata)}; }
  function recordAnswer(session,answer){ const next=clone(session); if(next.status!=='active') throw new Error('Sessão encerrada'); next.answers.push({...answer,at:answer.at||Date.now()}); next.summary.attempts++; answer.correct?next.summary.hits++:next.summary.errors++; if(next.policy.endOnError&&!answer.correct) return finishSession(next,'failed',answer.at); return next; }
  function finishSession(session,status='completed',endedAt=Date.now()){ const next=clone(session); next.status=status; next.endedAt=endedAt; next.durationMs=Math.max(0,endedAt-next.startedAt); return next; }

  class Registry{
    constructor(){ this.items=new Map(); }
    register(id,value){ if(!id) throw new Error('ID obrigatório'); this.items.set(id,value); return value; }
    get(id){ return this.items.get(id); }
    list(){ return Array.from(this.items.entries()).map(([id,value])=>({id,...value})); }
  }
  class ContentProviderRegistry extends Registry{
    async loadChunk(providerId,request){ const provider=this.get(providerId); if(!provider?.loadChunk) throw new Error('Provider inválido'); return provider.loadChunk(request); }
  }
  class AudioProviderRegistry extends Registry{
    async play(providerId,request){ const provider=this.get(providerId); if(!provider?.play) throw new Error('Provider de áudio inválido'); return provider.play(request); }
  }

  function normalizeContentItem(item,source={}){ return {...item,frequencyRank:item.frequencyRank??null,frequencyBand:item.frequencyBand??null,frequencySource:item.frequencySource??null,source:{id:source.id||item.source?.id||'unknown',license:source.license||item.source?.license||null,provider:source.provider||item.source?.provider||null}}; }

  function updateDifficulty(stat={},result={}){
    const next={attempts:number(stat.attempts)+1,hits:number(stat.hits),errors:number(stat.errors),streak:number(stat.streak),cursed:Boolean(stat.cursed),curseBrokenAt:stat.curseBrokenAt||null};
    if(result.correct){ next.hits++; next.streak++; } else { next.errors++; next.streak=0; }
    const errorRate=next.errors/next.attempts;
    let event=null;
    if(!next.cursed&&next.attempts>=8&&next.errors>=4&&errorRate>=.45){ next.cursed=true; event='curse_started'; }
    else if(next.cursed&&next.streak>=5&&errorRate<.3){ next.cursed=false; next.curseBrokenAt=result.at||Date.now(); event='curse_broken'; }
    return {stat:next,event};
  }
  function isNemesis(stat={}){ return number(stat.runDeaths)>=3&&number(stat.errors)>=8&&number(stat.distinctDays)>=2; }
  function recordCemetery(entries=[],death={}){
    const list=clone(entries), key=`${death.mode}:${death.itemId}`, found=list.find(item=>item.key===key);
    if(found){ found.deaths++; found.lastAt=death.at; found.longestRun=Math.max(number(found.longestRun),number(death.runLength)); found.lastAnswer=death.answer??found.lastAnswer; }
    else list.push({key,itemId:death.itemId,display:death.display,reading:death.reading,mode:death.mode,deaths:1,firstAt:death.at,lastAt:death.at,longestRun:number(death.runLength),lastAnswer:death.answer??null});
    return list;
  }

  function portugueseDependency(events=[]){
    const direct=events.filter(event=>event&&event.requiresPortuguese===false&&typeof event.correct==='boolean');
    if(!direct.length) return {value:null,evidence:0,label:'não avaliada'};
    const success=direct.filter(event=>event.correct).length;
    return {value:Math.round((1-success/direct.length)*100),evidence:direct.length,label:'métrica interna'};
  }

  const TERRITORIES=Object.freeze([
    {id:'hiragana',status:'active',endgames:['blitz']},{id:'katakana',status:'active',endgames:['alien']},{id:'kanji',status:'active',endgames:['chimera']},{id:'vocabulary',status:'active',endgames:['insanity','true-insanity']},
    {id:'grammar',status:'active',endgames:['fracture']},{id:'listening',status:'active',endgames:['void']},{id:'reading',status:'active',endgames:['labyrinth']},{id:'global',status:'active',endgames:['the-trial']}
  ]);

  function createPlatform(adapter){
    return {store:new JsonStore(adapter),largeStore:new IndexedDBAdapter(),modes:new Registry(),exercises:new Registry(),content:new ContentProviderRegistry(),audio:new AudioProviderRegistry(),bosses:new Registry(),achievements:new Registry(),territories:TERRITORIES};
  }
  function bootstrap(options={}){ const adapter=options.storage||(typeof localStorage!=='undefined'?localStorage:new MemoryAdapter()); return {meta:migrate(adapter),platform:createPlatform(adapter)}; }

  return {SCHEMA_VERSION,META_KEY,DIMENSIONS,RETENTION,FEATURE_STATUS,FEATURES,TERRITORIES,MemoryAdapter,JsonStore,IndexedDBAdapter,migrate,emptyDimensions,projectLegacyVocabulary,retentionState,recordMasteryEvidence,evaluateRequirement,evaluateUnlock,normalizeAnswer,validateAnswer,createSession,recordAnswer,finishSession,Registry,ContentProviderRegistry,AudioProviderRegistry,normalizeContentItem,updateDifficulty,isNemesis,recordCemetery,portugueseDependency,createPlatform,bootstrap};
});
