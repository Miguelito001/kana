(function(root,factory){
  const platform=root?.KANA_PLATFORM||(typeof require==='function'?require('./platform-core.js'):null);
  const api=factory(platform);
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.KANA_INSANITY=api;
})(typeof globalThis!=='undefined'?globalThis:null,function(platform){
  const KNOWN_REQUIRED=200000;
  const ACCURACY_REQUIRED=75;
  const MASTERY_REQUIRED=4;
  const TRUE_INSANITY_CONTRACT=Object.freeze({
    status:'prepared-not-playable',
    source:'jmdict-lemma-plus-validated-forms',
    preservesInsanity:true,
    requires:['insanity_mastery','rare_lexicon','grammar_capabilities'],
    forms:['negative','past','te_form','potential','passive','causative','causative_passive','conditional'],
    runtimeGeneration:'deterministic-only',
    duplicateLexemes:false
  });

  function nerdMetrics(progress){
    let known=0,hits=0,errors=0;
    Object.entries(progress||{}).forEach(([id,stat])=>{
      if(!id.startsWith('dict-')||!stat) return;
      hits+=Number(stat.hits)||0;
      errors+=Number(stat.errors)||0;
      if((Number(stat.mastery)||0)>=MASTERY_REQUIRED) known++;
    });
    const attempts=hits+errors;
    return {known,hits,errors,attempts,accuracy:attempts?hits/attempts*100:0};
  }

  function unlockState(progress,wasUnlocked){
    const metrics=nerdMetrics(progress);
    return unlockFromMetrics(metrics,wasUnlocked);
  }

  function unlockFromMetrics(metrics,wasUnlocked){
    const requirement={all:[
      {type:'metric_at_least',path:'known',value:KNOWN_REQUIRED},
      {type:'metric_at_least',path:'accuracy',value:ACCURACY_REQUIRED}
    ]};
    const qualifies=platform?.evaluateRequirement?platform.evaluateRequirement(requirement,metrics).passed:metrics.known>=KNOWN_REQUIRED&&metrics.accuracy>=ACCURACY_REQUIRED;
    return {metrics,qualifies,unlocked:Boolean(wasUnlocked||qualifies),justUnlocked:Boolean(!wasUnlocked&&qualifies)};
  }

  function emptyStats(){
    return {attempts:0,totalCorrect:0,best:0,bestAt:null,bestDurationMs:0,lastRun:null,unlockedAt:null};
  }

  function finishRun(previous,run,defeat,endedAt){
    const stats={...emptyStats(),...(previous||{})};
    const end=Number(endedAt)||Date.now(), streak=Math.max(0,Number(run?.streak)||0), durationMs=Math.max(0,end-(Number(run?.startedAt)||end));
    const result={streak,durationMs,endedAt:end,defeat:defeat||null};
    stats.attempts++;
    stats.totalCorrect+=streak;
    stats.lastRun=result;
    if(streak>stats.best){ stats.best=streak; stats.bestAt=end; stats.bestDurationMs=durationMs; stats.bestDefeat=defeat||null; }
    return {stats,result};
  }

  function acceptsAnswer(given,accepted,normalizer){
    const clean=normalizer(given);
    return (accepted||[]).some(value=>normalizer(value)===clean);
  }

  function shouldCountKnown(beforeMastery,afterMastery,alreadyKnown){
    return !alreadyKnown&&(Number(beforeMastery)||0)<MASTERY_REQUIRED&&(Number(afterMastery)||0)>=MASTERY_REQUIRED;
  }

  return {KNOWN_REQUIRED,ACCURACY_REQUIRED,MASTERY_REQUIRED,TRUE_INSANITY_CONTRACT,nerdMetrics,unlockState,unlockFromMetrics,emptyStats,finishRun,acceptsAnswer,shouldCountKnown};
});
