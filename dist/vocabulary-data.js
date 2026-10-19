window.KANA_VOCABULARY_PACKS = {
  1: {
    id: 1,
    title: 'Fundamentos',
    description: '50 palavras essenciais do cotidiano',
    words: [
      {id:'dog',written:'犬',reading:'いぬ',meanings:['cachorro','cão'],category:'animal',level:1,audio:null},
      {id:'cat',written:'猫',reading:'ねこ',meanings:['gato','gata'],category:'animal',level:1,audio:null},
      {id:'bird',written:'鳥',reading:'とり',meanings:['pássaro','ave'],category:'animal',level:1,audio:null},
      {id:'fish',written:'魚',reading:'さかな',meanings:['peixe'],category:'animal',level:1,audio:null},
      {id:'monkey',written:'猿',reading:'さる',meanings:['macaco'],category:'animal',level:1,audio:null},
      {id:'water',written:'水',reading:'みず',meanings:['água'],category:'food',level:1,audio:null},
      {id:'tea',written:'お茶',reading:'おちゃ',meanings:['chá'],category:'food',level:1,audio:null},
      {id:'rice',written:'ご飯',reading:'ごはん',meanings:['arroz','refeição'],category:'food',level:1,audio:null},
      {id:'bread',written:'パン',reading:'ぱん',meanings:['pão'],category:'food',level:1,audio:null},
      {id:'meat',written:'肉',reading:'にく',meanings:['carne'],category:'food',level:1,audio:null},
      {id:'vegetables',written:'野菜',reading:'やさい',meanings:['legumes','verduras','vegetais'],category:'food',level:1,audio:null},
      {id:'fruit',written:'果物',reading:'くだもの',meanings:['fruta','fruto'],category:'food',level:1,audio:null},
      {id:'egg',written:'卵',reading:'たまご',meanings:['ovo'],category:'food',level:1,audio:null},
      {id:'eat',written:'食べる',reading:'たべる',meanings:['comer'],category:'action-food',level:1,audio:null},
      {id:'drink',written:'飲む',reading:'のむ',meanings:['beber','tomar'],category:'action-food',level:1,audio:null},
      {id:'cook',written:'料理する',reading:'りょうりする',meanings:['cozinhar','preparar comida'],category:'action-food',level:1,audio:null},
      {id:'see',written:'見る',reading:'みる',meanings:['ver','olhar'],category:'action-sense',level:1,audio:null},
      {id:'hear',written:'聞く',reading:'きく',meanings:['ouvir','escutar'],category:'action-sense',level:1,audio:null},
      {id:'read',written:'読む',reading:'よむ',meanings:['ler'],category:'action-language',level:1,audio:null},
      {id:'write',written:'書く',reading:'かく',meanings:['escrever'],category:'action-language',level:1,audio:null},
      {id:'speak',written:'話す',reading:'はなす',meanings:['falar','conversar'],category:'action-language',level:1,audio:null},
      {id:'go',written:'行く',reading:'いく',meanings:['ir'],category:'action-movement',level:1,audio:null},
      {id:'come',written:'来る',reading:'くる',meanings:['vir'],category:'action-movement',level:1,audio:null},
      {id:'return',written:'帰る',reading:'かえる',meanings:['voltar','retornar'],category:'action-movement',level:1,audio:null},
      {id:'sleep',written:'寝る',reading:'ねる',meanings:['dormir'],category:'action-routine',level:1,audio:null},
      {id:'wake',written:'起きる',reading:'おきる',meanings:['acordar','levantar'],category:'action-routine',level:1,audio:null},
      {id:'buy',written:'買う',reading:'かう',meanings:['comprar'],category:'action-routine',level:1,audio:null},
      {id:'make',written:'作る',reading:'つくる',meanings:['fazer','criar','produzir'],category:'action-routine',level:1,audio:null},
      {id:'home',written:'うち',reading:'うち',meanings:['casa','lar'],category:'place',level:1,audio:null},
      {id:'school',written:'学校',reading:'がっこう',meanings:['escola'],category:'place',level:1,audio:null},
      {id:'station',written:'駅',reading:'えき',meanings:['estação'],category:'place',level:1,audio:null},
      {id:'store',written:'店',reading:'みせ',meanings:['loja','estabelecimento'],category:'place',level:1,audio:null},
      {id:'hospital',written:'病院',reading:'びょういん',meanings:['hospital'],category:'place',level:1,audio:null},
      {id:'park',written:'公園',reading:'こうえん',meanings:['parque'],category:'place',level:1,audio:null},
      {id:'i',written:'私',reading:'わたし',meanings:['eu'],category:'person',level:1,audio:null},
      {id:'friend',written:'友達',reading:'ともだち',meanings:['amigo','amiga'],category:'person',level:1,audio:null},
      {id:'teacher',written:'先生',reading:'せんせい',meanings:['professor','professora'],category:'person',level:1,audio:null},
      {id:'family',written:'家族',reading:'かぞく',meanings:['família'],category:'person',level:1,audio:null},
      {id:'mother',written:'お母さん',reading:'おかあさん',meanings:['mãe','mamãe'],category:'person',level:1,audio:null},
      {id:'father',written:'お父さん',reading:'おとうさん',meanings:['pai','papai'],category:'person',level:1,audio:null},
      {id:'today',written:'今日',reading:'きょう',meanings:['hoje'],category:'time',level:1,audio:null},
      {id:'tomorrow',written:'明日',reading:'あした',meanings:['amanhã'],category:'time',level:1,audio:null},
      {id:'yesterday',written:'昨日',reading:'きのう',meanings:['ontem'],category:'time',level:1,audio:null},
      {id:'morning',written:'朝',reading:'あさ',meanings:['manhã'],category:'time',level:1,audio:null},
      {id:'night',written:'夜',reading:'よる',meanings:['noite'],category:'time',level:1,audio:null},
      {id:'cute',written:'かわいい',reading:'かわいい',meanings:['fofo','fofa','bonito','bonita'],category:'description',level:1,audio:null},
      {id:'big',written:'大きい',reading:'おおきい',meanings:['grande'],category:'description',level:1,audio:null},
      {id:'small',written:'小さい',reading:'ちいさい',meanings:['pequeno','pequena'],category:'description',level:1,audio:null},
      {id:'new',written:'新しい',reading:'あたらしい',meanings:['novo','nova'],category:'description',level:1,audio:null},
      {id:'old',written:'古い',reading:'ふるい',meanings:['velho','velha','antigo','antiga'],category:'description',level:1,audio:null}
    ]
  }
};

(function(packs){
  const verbMetadata={
    eat:{conjugationClass:'ichidan'},drink:{conjugationClass:'godan'},cook:{conjugationClass:'suru'},see:{conjugationClass:'ichidan'},hear:{conjugationClass:'godan'},read:{conjugationClass:'godan'},write:{conjugationClass:'godan'},speak:{conjugationClass:'godan'},go:{conjugationClass:'godan',exception:'iku'},come:{conjugationClass:'kuru'},return:{conjugationClass:'godan'},sleep:{conjugationClass:'ichidan'},wake:{conjugationClass:'ichidan'},buy:{conjugationClass:'godan'},make:{conjugationClass:'godan'}
  };
  packs[1].words.forEach(word=>{if(verbMetadata[word.id])word.verb=verbMetadata[word.id];word.curriculumLevel=1;});
  const levelTwo=[
    {id:'stand',written:'立つ',reading:'たつ',meanings:['ficar de pé','levantar-se'],category:'action-routine',verb:{conjugationClass:'godan'}},
    {id:'sit',written:'座る',reading:'すわる',meanings:['sentar','sentar-se'],category:'action-routine',verb:{conjugationClass:'godan'}},
    {id:'enter',written:'入る',reading:'はいる',meanings:['entrar'],category:'action-movement',verb:{conjugationClass:'godan'}},
    {id:'leave',written:'出る',reading:'でる',meanings:['sair'],category:'action-movement',verb:{conjugationClass:'ichidan'}},
    {id:'meet',written:'会う',reading:'あう',meanings:['encontrar','encontrar-se'],category:'action-social',verb:{conjugationClass:'godan'}},
    {id:'wait',written:'待つ',reading:'まつ',meanings:['esperar'],category:'action-social',verb:{conjugationClass:'godan'}},
    {id:'use',written:'使う',reading:'つかう',meanings:['usar','utilizar'],category:'action-routine',verb:{conjugationClass:'godan'}},
    {id:'understand',written:'分かる',reading:'わかる',meanings:['entender','compreender'],category:'action-mind',verb:{conjugationClass:'godan'}},
    {id:'think',written:'思う',reading:'おもう',meanings:['pensar','achar'],category:'action-mind',verb:{conjugationClass:'godan'}},
    {id:'know',written:'知る',reading:'しる',meanings:['saber','conhecer'],category:'action-mind',verb:{conjugationClass:'godan'}},
    {id:'do',written:'する',reading:'する',meanings:['fazer'],category:'action-routine',verb:{conjugationClass:'suru'}}
  ].map(word=>({...word,level:2,curriculumLevel:2,audio:null}));
  const levelThree=[
    {id:'swim',written:'泳ぐ',reading:'およぐ',meanings:['nadar'],category:'action-movement',verb:{conjugationClass:'godan'}},
    {id:'play',written:'遊ぶ',reading:'あそぶ',meanings:['brincar','divertir-se'],category:'action-leisure',verb:{conjugationClass:'godan'}},
    {id:'work',written:'働く',reading:'はたらく',meanings:['trabalhar'],category:'action-routine',verb:{conjugationClass:'godan'}},
    {id:'rest',written:'休む',reading:'やすむ',meanings:['descansar','folgar'],category:'action-routine',verb:{conjugationClass:'godan'}},
    {id:'teach',written:'教える',reading:'おしえる',meanings:['ensinar'],category:'action-language',verb:{conjugationClass:'ichidan'}},
    {id:'learn',written:'習う',reading:'ならう',meanings:['aprender'],category:'action-language',verb:{conjugationClass:'godan'}},
    {id:'open',written:'開ける',reading:'あける',meanings:['abrir'],category:'action-routine',verb:{conjugationClass:'ichidan'}},
    {id:'close',written:'閉める',reading:'しめる',meanings:['fechar'],category:'action-routine',verb:{conjugationClass:'ichidan'}},
    {id:'die',written:'死ぬ',reading:'しぬ',meanings:['morrer'],category:'action-life',verb:{conjugationClass:'godan'}},
    {id:'call',written:'呼ぶ',reading:'よぶ',meanings:['chamar'],category:'action-social',verb:{conjugationClass:'godan'}}
  ].map(word=>({...word,level:3,curriculumLevel:3,audio:null}));
  packs[2]={id:2,title:'Flexão fundamental',description:'Vocabulário cumulativo · casual, negação e registro polido',words:[...packs[1].words,...levelTwo]};
  packs[3]={id:3,title:'Flexão avançada',description:'Formas avançadas liberadas pela gramática',words:[...packs[1].words,...levelTwo,...levelThree]};
})(window.KANA_VOCABULARY_PACKS);
