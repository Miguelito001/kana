(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.KANA_VERBS=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const CLASSES=Object.freeze({ICHIDAN:'ichidan',GODAN:'godan',SURU:'suru',KURU:'kuru'});
const FORMS=Object.freeze({
 dictionary:{id:'dictionary',depth:1,label:'forma de dicionário',traits:{politeness:'casual',polarity:'affirmative',tense:'nonpast'}},
 casual_negative:{id:'casual_negative',depth:2,label:'casual negativo',traits:{politeness:'casual',polarity:'negative',tense:'nonpast'}},
 polite_affirmative:{id:'polite_affirmative',depth:2,label:'polido afirmativo',traits:{politeness:'polite',polarity:'affirmative',tense:'nonpast'}},
 polite_negative:{id:'polite_negative',depth:2,label:'polido negativo',traits:{politeness:'polite',polarity:'negative',tense:'nonpast'}},
 past:{id:'past',depth:3,label:'passado',capability:'past',traits:{politeness:'casual',polarity:'affirmative',tense:'past'}},
 negative_past:{id:'negative_past',depth:3,label:'negativo passado',capability:'past',traits:{politeness:'casual',polarity:'negative',tense:'past'}},
 te_form:{id:'te_form',depth:3,label:'forma て',capability:'te_form',traits:{form:'te'}},
 potential:{id:'potential',depth:3,label:'potencial',capability:'potential',traits:{politeness:'casual',polarity:'affirmative',tense:'nonpast',mood:'potential'}},
 potential_negative:{id:'potential_negative',depth:3,label:'potencial negativo',capability:'potential',traits:{politeness:'casual',polarity:'negative',tense:'nonpast',mood:'potential'}},
 potential_negative_past:{id:'potential_negative_past',depth:3,label:'potencial negativo passado',capability:'potential',traits:{politeness:'casual',polarity:'negative',tense:'past',mood:'potential'}},
 desire_tai:{id:'desire_tai',depth:3,label:'desejo com たい',capability:'desire_tai',traits:{politeness:'casual',polarity:'affirmative',tense:'nonpast',mood:'desire'}},
 volitional:{id:'volitional',depth:3,label:'volitivo',capability:'volitional',traits:{politeness:'casual',polarity:'affirmative',tense:'nonpast',mood:'volitional'}}
});
const TRAIT_LABELS=Object.freeze({politeness:{casual:'casual',polite:'polido'},polarity:{affirmative:'afirmativo',negative:'negativo'},tense:{nonpast:'não-passado',past:'passado'},form:{te:'forma て'},mood:{potential:'potencial',desire:'desejo',volitional:'volitivo'}});
const ROWS=Object.freeze({
 'う':{a:'わ',i:'い',e:'え',o:'お'},'く':{a:'か',i:'き',e:'け',o:'こ'},'ぐ':{a:'が',i:'ぎ',e:'げ',o:'ご'},'す':{a:'さ',i:'し',e:'せ',o:'そ'},'つ':{a:'た',i:'ち',e:'て',o:'と'},'ぬ':{a:'な',i:'に',e:'ね',o:'の'},'ぶ':{a:'ば',i:'び',e:'べ',o:'ぼ'},'む':{a:'ま',i:'み',e:'め',o:'も'},'る':{a:'ら',i:'り',e:'れ',o:'ろ'}
});
function replaceLast(value,suffix){return String(value).slice(0,-1)+suffix;}
function stem(value,row){return replaceLast(value,row.i);}
function godanTe(value,exception){if(exception==='iku')return replaceLast(value,'って');const end=value.slice(-1),base=value.slice(0,-1);if('うつる'.includes(end))return base+'って';if('むぶぬ'.includes(end))return base+'んで';if(end==='く')return base+'いて';if(end==='ぐ')return base+'いで';if(end==='す')return base+'して';throw new Error(`Final godan não suportado: ${end}`);}
function regular(value,meta,form){
 const type=meta.conjugationClass;
 if(type===CLASSES.ICHIDAN){const base=value.slice(0,-1);switch(form){case'dictionary':return value;case'casual_negative':return base+'ない';case'polite_affirmative':return base+'ます';case'polite_negative':return base+'ません';case'past':return base+'た';case'negative_past':return base+'なかった';case'te_form':return base+'て';case'potential':return base+'られる';case'potential_negative':return base+'られない';case'potential_negative_past':return base+'られなかった';case'desire_tai':return base+'たい';case'volitional':return base+'よう';}}
 if(type===CLASSES.GODAN){const row=ROWS[value.slice(-1)];if(!row)throw new Error(`Metadado godan inválido: ${value}`);const i=stem(value,row),a=replaceLast(value,row.a),e=replaceLast(value,row.e),o=replaceLast(value,row.o);switch(form){case'dictionary':return value;case'casual_negative':return a+'ない';case'polite_affirmative':return i+'ます';case'polite_negative':return i+'ません';case'past':return godanTe(value,meta.exception).replace(/て$/,'た').replace(/で$/,'だ');case'negative_past':return a+'なかった';case'te_form':return godanTe(value,meta.exception);case'potential':return e+'る';case'potential_negative':return e+'ない';case'potential_negative_past':return e+'なかった';case'desire_tai':return i+'たい';case'volitional':return o+'う';}}
 throw new Error(`Classe verbal não suportada: ${type}`);
}
function irregular(value,meta,form,isReading){
 if(meta.conjugationClass===CLASSES.SURU){const suffix=isReading?'する':'する',prefix=value.endsWith(suffix)?value.slice(0,-2):value;const forms={dictionary:'する',casual_negative:'しない',polite_affirmative:'します',polite_negative:'しません',past:'した',negative_past:'しなかった',te_form:'して',potential:'できる',potential_negative:'できない',potential_negative_past:'できなかった',desire_tai:'したい',volitional:'しよう'};return prefix+forms[form];}
 if(meta.conjugationClass===CLASSES.KURU){if(isReading){const forms={dictionary:'くる',casual_negative:'こない',polite_affirmative:'きます',polite_negative:'きません',past:'きた',negative_past:'こなかった',te_form:'きて',potential:'こられる',potential_negative:'こられない',potential_negative_past:'こられなかった',desire_tai:'きたい',volitional:'こよう'};return forms[form];}const forms={dictionary:'来る',casual_negative:'来ない',polite_affirmative:'来ます',polite_negative:'来ません',past:'来た',negative_past:'来なかった',te_form:'来て',potential:'来られる',potential_negative:'来られない',potential_negative_past:'来られなかった',desire_tai:'来たい',volitional:'来よう'};return forms[form];}
 return null;
}
function conjugate(entry,formId){const definition=FORMS[formId];if(!definition)throw new Error(`Forma desconhecida: ${formId}`);const meta=entry.verb;if(!meta?.conjugationClass)throw new Error(`Classe verbal ausente: ${entry.id}`);const specialWritten=meta.forms?.[formId]?.written,specialReading=meta.forms?.[formId]?.reading;const written=specialWritten||irregular(entry.written,meta,formId,false)||regular(entry.written,meta,formId);const reading=specialReading||irregular(entry.reading,meta,formId,true)||regular(entry.reading,meta,formId);return{...entry,id:entry.id,lemmaId:entry.id,lemma:entry.written,lemmaReading:entry.reading,written,reading,verbForm:formId,grammar:{...definition.traits,formId,capability:definition.capability||null,label:definition.label},exerciseDepth:definition.depth};}
function formsForLevel(level,capabilities){const values=Object.values(FORMS);return values.filter(form=>form.depth<=level&&(!form.capability||capabilities?.canUse?.(form.capability)));}
function chooseForm(entry,level,capabilities,random=Math.random,formStats={}){if(!entry.verb||level<=1)return conjugate(entry,'dictionary');const forms=formsForLevel(level,capabilities),targetDepth=level===2?2:3;const weighted=forms.map(form=>{const stat=formStats[form.id]||{},attempts=Number(stat.attempts)||0,errors=Number(stat.errors)||0;let weight=form.depth===targetDepth?5:form.depth===targetDepth-1?1.8:.7;weight*=1+(attempts?errors/attempts*5:1.2);if(stat.lastResult==='wrong')weight*=2.5;return{form,weight};});let roll=random()*weighted.reduce((sum,item)=>sum+item.weight,0);for(const item of weighted){roll-=item.weight;if(roll<=0)return conjugate(entry,item.form.id);}return conjugate(entry,weighted.at(-1).form.id);}
function traitGroups(exercise){const traits=exercise?.grammar||{};return Object.keys(TRAIT_LABELS).filter(key=>traits[key]).map(key=>({key,correct:traits[key],label:key==='politeness'?'Registro':key==='polarity'?'Polaridade':key==='tense'?'Tempo':key==='form'?'Forma':'Valor',options:Object.entries(TRAIT_LABELS[key]).map(([value,label])=>({value,label}))}));}
function describe(exercise){const labels=traitGroups(exercise).map(group=>TRAIT_LABELS[group.key][group.correct]);return[exercise.meanings?.[0],...labels].filter(Boolean).join(' · ');}
function checkTraits(exercise,answers={}){const groups=traitGroups(exercise);return{correct:groups.every(group=>answers[group.key]===group.correct),expected:Object.fromEntries(groups.map(group=>[group.key,group.correct]))};}
function createCapabilities(unlocked=[]){const set=new Set(unlocked);return{canUse:id=>set.has(id),list:()=>[...set],unlock:id=>{set.add(id);return true;},lock:id=>set.delete(id)};}
return{CLASSES,FORMS,TRAIT_LABELS,conjugate,formsForLevel,chooseForm,traitGroups,describe,checkTraits,createCapabilities};
});
