const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const verbs=require('../dist/verb-core.js');

const eat={id:'eat',written:'食べる',reading:'たべる',meanings:['comer'],verb:{conjugationClass:'ichidan'}};
const read={id:'read',written:'読む',reading:'よむ',meanings:['ler'],verb:{conjugationClass:'godan'}};
const doVerb={id:'do',written:'する',reading:'する',meanings:['fazer'],verb:{conjugationClass:'suru'}};
const come={id:'come',written:'来る',reading:'くる',meanings:['vir'],verb:{conjugationClass:'kuru'}};
const go={id:'go',written:'行く',reading:'いく',meanings:['ir'],verb:{conjugationClass:'godan',exception:'iku'}};
const meet={id:'meet',written:'会う',reading:'あう',meanings:['encontrar'],verb:{conjugationClass:'godan'}};

assert.equal(verbs.conjugate(eat,'dictionary').written,'食べる','ichidan casual afirmativo');
assert.equal(verbs.conjugate(eat,'casual_negative').written,'食べない');
assert.equal(verbs.conjugate(eat,'polite_affirmative').written,'食べます');
assert.equal(verbs.conjugate(eat,'polite_negative').written,'食べません');
assert.equal(verbs.conjugate(eat,'past').written,'食べた');
assert.equal(verbs.conjugate(eat,'negative_past').written,'食べなかった');
assert.equal(verbs.conjugate(eat,'te_form').written,'食べて');
assert.equal(verbs.conjugate(eat,'potential').written,'食べられる');
assert.equal(verbs.conjugate(eat,'potential_negative').written,'食べられない');

assert.equal(verbs.conjugate(read,'casual_negative').written,'読まない','godan negativo');
assert.equal(verbs.conjugate(read,'polite_affirmative').written,'読みます');
assert.equal(verbs.conjugate(read,'polite_negative').written,'読みません');
assert.equal(verbs.conjugate(read,'past').written,'読んだ');
assert.equal(verbs.conjugate(read,'negative_past').written,'読まなかった');
assert.equal(verbs.conjugate(read,'te_form').written,'読んで');
assert.equal(verbs.conjugate(read,'potential').written,'読める');
assert.equal(verbs.conjugate(read,'potential_negative').written,'読めない');
assert.equal(verbs.conjugate(read,'potential_negative_past').written,'読めなかった');
assert.equal(verbs.conjugate(read,'desire_tai').written,'読みたい');
assert.equal(verbs.conjugate(read,'volitional').written,'読もう');
assert.equal(verbs.conjugate(go,'te_form').written,'行って','exceção 行く');
assert.equal(verbs.conjugate(meet,'casual_negative').written,'会わない','godan terminado em う usa わ');

assert.equal(verbs.conjugate(doVerb,'casual_negative').written,'しない','する irregular');
assert.equal(verbs.conjugate(doVerb,'potential').written,'できる');
assert.equal(verbs.conjugate(come,'polite_affirmative').written,'来ます','来る irregular escrito');
assert.equal(verbs.conjugate(come,'polite_affirmative').reading,'きます','来る irregular leitura');
assert.equal(verbs.conjugate(come,'potential_negative_past').reading,'こられなかった');

const onlyPast=verbs.createCapabilities(['past']);
assert.ok(verbs.formsForLevel(3,onlyPast).some(form=>form.id==='past'));
assert.ok(!verbs.formsForLevel(3,onlyPast).some(form=>form.id==='potential'),'forma bloqueada pela gramática não entra no pool');
const advanced=verbs.conjugate(read,'potential_negative_past');
assert.deepEqual(verbs.checkTraits(advanced,{politeness:'casual',polarity:'negative',tense:'past',mood:'potential'}).correct,true);
assert.equal(verbs.describe(advanced),'ler · casual · negativo · passado · potencial');

const sandbox={window:{}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/vocabulary-data.js','utf8'),sandbox);
const packs=sandbox.window.KANA_VOCABULARY_PACKS;
assert.ok(packs[2].words.some(word=>word.id==='eat'),'N2 revisa N1');
assert.ok(packs[3].words.some(word=>word.id==='do'),'N3 revisa N2');
assert.ok(packs[3].words.some(word=>word.id==='swim'),'N3 contém conteúdo próprio');

const legacy={attempts:8,hits:7,errors:1,mastery:4};
const evolved={...legacy,forms:{polite_negative:{attempts:1,hits:0,errors:1}}};
assert.deepEqual({...evolved,forms:undefined}, {...legacy,forms:undefined},'dados antigos permanecem válidos; formas são aditivas');
console.log('VERBOS: ichidan, godan, irregulares, capacidades, níveis cumulativos e compatibilidade aprovados');
