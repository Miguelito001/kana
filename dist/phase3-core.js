(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.KANA_PHASE3_CORE=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const GRAMMAR=[
 {id:'topic-wa',prompt:'わたし＿学生です。',question:'Qual partícula marca o tópico?',choices:['は','が','を'],answer:'は',capability:'topic_wa',note:'は apresenta わたし como tópico.'},
 {id:'object-wo',prompt:'パン＿食べます。',question:'Qual partícula marca o objeto?',choices:['を','に','で'],answer:'を',capability:'particle_wo',note:'を marca aquilo que é comido.'},
 {id:'destination-ni',prompt:'学校＿行きます。',question:'Qual partícula marca o destino?',choices:['に','を','が'],answer:'に',capability:'particle_ni',note:'に marca o destino de 行きます.'},
 {id:'place-de',prompt:'図書館＿勉強します。',question:'Onde a ação acontece?',choices:['で','に','の'],answer:'で',capability:'particle_de',note:'で marca o local de uma ação.'},
 {id:'possessive-no',prompt:'わたし＿本です。',question:'Qual partícula conecta “meu” e “livro”?',choices:['の','も','は'],answer:'の',capability:'particle_no',note:'の conecta dois nomes: わたしの本.'},
 {id:'also-mo',prompt:'田中さん＿学生です。',question:'Como dizer que Tanaka também é estudante?',choices:['も','を','で'],answer:'も',capability:'particle_mo',note:'も acrescenta o sentido de “também”.'},
 {id:'negative',prompt:'今日は行きません。',question:'O que a frase afirma?',choices:['Hoje não vou.','Ontem fui.','Hoje quero ir.'],answer:'Hoje não vou.',capability:'negative',note:'ません é a forma polida negativa.'},
 {id:'past',prompt:'昨日、映画を見ました。',question:'Quando a ação aconteceu?',choices:['No passado','Agora','No futuro'],answer:'No passado',capability:'past',note:'ました marca passado polido afirmativo.'},
 {id:'te-form',prompt:'ドアを開けてください。',question:'Qual é a função de 開けてください?',choices:['Fazer um pedido','Negar uma ação','Expressar passado'],answer:'Fazer um pedido',capability:'te_form',note:'Forma て + ください cria um pedido.'},
 {id:'potential',prompt:'日本語が読めます。',question:'O que 読めます expressa?',choices:['Capacidade de ler','Desejo de ler','Obrigação de ler'],answer:'Capacidade de ler',capability:'potential',note:'読めます é a forma potencial polida de 読む.'},
 {id:'desire',prompt:'日本へ行きたいです。',question:'O que 行きたい expressa?',choices:['Desejo de ir','Proibição de ir','Ação concluída'],answer:'Desejo de ir',capability:'desire_tai',note:'たい se liga à base verbal para expressar desejo.'},
 {id:'volitional',prompt:'いっしょに食べよう。',question:'Qual nuance aparece em 食べよう?',choices:['Vamos comer','Não coma','Já comi'],answer:'Vamos comer',capability:'volitional',note:'A forma volitiva pode propor uma ação conjunta.'}
];
const FRACTURE=[
 {id:'f1',tokens:['わたし','は','パン','を','食べます'],accepted:[['わたし','は','パン','を','食べます']],meaning:'Eu como pão.'},
 {id:'f2',tokens:['田中さん','は','図書館','で','勉強します'],accepted:[['田中さん','は','図書館','で','勉強します'],['図書館','で','田中さん','は','勉強します']],meaning:'Tanaka estuda na biblioteca.'},
 {id:'f3',tokens:['明日','学校','に','行きます'],accepted:[['明日','学校','に','行きます'],['学校','に','明日','行きます']],meaning:'Amanhã vou à escola.'},
 {id:'f4',tokens:['ねこ','が','部屋','に','います'],accepted:[['ねこ','が','部屋','に','います'],['部屋','に','ねこ','が','います']],meaning:'Há um gato no quarto.'},
 {id:'f5',tokens:['これは','わたし','の','本','です'],accepted:[['これは','わたし','の','本','です']],meaning:'Este é o meu livro.'},
 {id:'f6',tokens:['昨日','映画','を','見ました'],accepted:[['昨日','映画','を','見ました'],['映画','を','昨日','見ました']],meaning:'Ontem assisti a um filme.'},
 {id:'f7',tokens:['水','を','飲んで','ください'],accepted:[['水','を','飲んで','ください']],meaning:'Por favor, beba água.'},
 {id:'f8',tokens:['日本語','は','少し','読めます'],accepted:[['日本語','は','少し','読めます'],['少し','日本語','は','読めます']],meaning:'Consigo ler um pouco de japonês.'},
 {id:'f9',tokens:['雨','だから','家','に','います'],accepted:[['雨','だから','家','に','います']],meaning:'Como está chovendo, fico em casa.'},
 {id:'f10',tokens:['母','が','作った','料理','を','食べました'],accepted:[['母','が','作った','料理','を','食べました']],meaning:'Comi a comida que minha mãe fez.'}
];
const LISTENING_BASE=[
 {id:'l1',text:'ねこ',meanings:['gato'],choices:['gato','cachorro','coelho']},{id:'l2',text:'みず',meanings:['água'],choices:['água','chá','leite']},
 {id:'l3',text:'おはよう',meanings:['bom dia'],choices:['bom dia','boa noite','até amanhã']},{id:'l4',text:'ありがとう',meanings:['obrigado','obrigada'],choices:['obrigado','desculpe','por favor']},
 {id:'l5',text:'パンを食べます',meanings:['comer pão','eu como pão'],choices:['comer pão','beber água','comprar arroz']},{id:'l6',text:'学校に行きます',meanings:['ir para a escola','vou para a escola'],choices:['ir para a escola','voltar para casa','estudar na biblioteca']},
 {id:'l7',text:'今日は雨です',meanings:['hoje está chovendo','hoje é chuva'],choices:['hoje está chovendo','amanhã fará sol','ontem nevou']},{id:'l8',text:'本を読んでいます',meanings:['estou lendo um livro','ler um livro'],choices:['estou lendo um livro','estou escrevendo uma carta','estou vendo um filme']},
 {id:'l9',text:'コーヒーは飲みません',meanings:['não bebo café'],choices:['não bebo café','quero café','bebi café']},{id:'l10',text:'駅はどこですか',meanings:['onde fica a estação?','onde é a estação?'],choices:['onde fica a estação?','que horas sai o trem?','quanto custa a passagem?']},
 {id:'l11',text:'もう一度言ってください',meanings:['por favor, diga novamente'],choices:['por favor, diga novamente','fale mais rápido','não precisa falar']},{id:'l12',text:'明日は早く起きなければなりません',meanings:['amanhã preciso acordar cedo'],choices:['amanhã preciso acordar cedo','ontem dormi cedo','amanhã não vou trabalhar']}
];
const LISTENING_GROUPS=[
 [['こんにちは','olá'],['こんばんは','boa noite'],['おやすみなさい','boa noite, durma bem'],['いってきます','estou saindo'],['いってらっしゃい','vá e volte bem'],['ただいま','cheguei em casa'],['おかえりなさい','bem-vindo de volta'],['はじめまして','prazer em conhecer você']],
 [['今は三時です','agora são três horas'],['今日は月曜日です','hoje é segunda-feira'],['明日は休みです','amanhã é folga'],['昨日は寒かったです','ontem estava frio'],['午後から雨が降ります','vai chover à tarde'],['朝はよく晴れていました','de manhã estava ensolarado'],['今夜は風が強いです','o vento estará forte esta noite'],['来週は忙しくなります','a próxima semana ficará corrida']],
 [['窓を開けてください','por favor, abra a janela'],['電気を消しました','apaguei a luz'],['鍵は机の上にあります','a chave está sobre a mesa'],['部屋を掃除しています','estou limpando o quarto'],['洗濯物を外に干します','vou estender a roupa do lado de fora'],['台所で料理を作ります','vou cozinhar na cozinha'],['玄関に荷物が届きました','uma encomenda chegou à entrada'],['冷蔵庫に卵がありません','não há ovos na geladeira']],
 [['朝ご飯を食べました','tomei café da manhã'],['水をもう一杯ください','mais um copo de água, por favor'],['この料理は少し辛いです','esta comida é um pouco apimentada'],['魚より肉のほうが好きです','prefiro carne a peixe'],['昼ご飯はうどんにします','vou escolher udon para o almoço'],['砂糖を入れないでください','não coloque açúcar, por favor'],['この店のカレーは有名です','o curry deste restaurante é famoso'],['お腹がいっぱいです','estou de barriga cheia']],
 [['次の駅で降ります','vou descer na próxima estação'],['電車が十分遅れています','o trem está dez minutos atrasado'],['空港までバスで行きます','vou ao aeroporto de ônibus'],['切符を二枚買いました','comprei duas passagens'],['この電車は東京に止まりますか','este trem para em Tóquio?'],['道に迷ってしまいました','acabei me perdendo'],['ホテルは駅の近くです','o hotel fica perto da estação'],['飛行機は午後に着きます','o avião chega à tarde']],
 [['宿題をもう終えました','já terminei a lição de casa'],['先生に質問があります','tenho uma pergunta para o professor'],['会議は九時に始まります','a reunião começa às nove'],['今日は家で働きます','hoje vou trabalhar de casa'],['漢字を毎日練習しています','pratico kanji todos os dias'],['資料をメールで送りました','enviei o material por e-mail'],['試験は来月あります','a prova será no próximo mês'],['同僚と昼ご飯を食べます','vou almoçar com um colega']],
 [['これはいくらですか','quanto custa isto?'],['もう少し安い物はありますか','há algo um pouco mais barato?'],['カードで払えますか','posso pagar com cartão?'],['この靴を試してもいいですか','posso experimentar estes sapatos?'],['袋は要りません','não preciso de sacola'],['赤いシャツを探しています','estou procurando uma camisa vermelha'],['レシートをください','dê-me o recibo, por favor'],['店は八時に閉まります','a loja fecha às oito']],
 [['頭が少し痛いです','minha cabeça dói um pouco'],['昨日から熱があります','estou com febre desde ontem'],['薬を飲んで休みます','vou tomar remédio e descansar'],['毎朝三十分歩きます','caminho trinta minutos toda manhã'],['今日は気分がいいです','hoje estou me sentindo bem'],['無理をしないでください','não se esforce demais'],['病院を予約しました','marquei uma consulta no hospital'],['夜は早く寝たほうがいいです','é melhor dormir cedo à noite']],
 [['週末に映画を見ました','assisti a um filme no fim de semana'],['音楽を聞きながら勉強します','estudo enquanto ouço música'],['写真を撮るのが好きです','gosto de tirar fotografias'],['友達とゲームをしました','joguei com um amigo'],['新しい本を読み始めました','comecei a ler um livro novo'],['日曜日にサッカーをします','vou jogar futebol no domingo'],['ギターを弾くことができます','sei tocar violão'],['最近、日本のドラマを見ています','ultimamente estou assistindo a dramas japoneses']],
 [['明日早く起きるつもりです','pretendo acordar cedo amanhã'],['夏に日本へ行きたいです','quero ir ao Japão no verão'],['仕事のあとで買い物をします','vou fazer compras depois do trabalho'],['今度いっしょに食べませんか','quer comer comigo na próxima vez?'],['雨なら家にいるつもりです','se chover, pretendo ficar em casa'],['駅で七時に会いましょう','vamos nos encontrar na estação às sete'],['来年、新しい仕事を探します','no próximo ano procurarei um novo trabalho'],['週末は何をする予定ですか','o que planeja fazer no fim de semana?']],
 [['銀行は郵便局の隣です','o banco fica ao lado do correio'],['この道をまっすぐ行ってください','siga reto por esta rua'],['二つ目の角を右に曲がります','vire à direita na segunda esquina'],['公園の前にコンビニがあります','há uma loja de conveniência em frente ao parque'],['図書館は駅から遠くありません','a biblioteca não fica longe da estação'],['橋を渡ると学校が見えます','ao atravessar a ponte, você verá a escola'],['階段を上がって左です','suba as escadas e fica à esquerda'],['交番で道を聞きました','perguntei o caminho no posto policial']]
];
const LISTENING_EXTRA=LISTENING_GROUPS.flatMap((group,groupIndex)=>group.map(([text,meaning],index)=>({id:`lx${groupIndex+1}-${index+1}`,text,meanings:[meaning],choices:[meaning,group[(index+1)%group.length][1],group[(index+2)%group.length][1]],tier:1+Math.floor(groupIndex/3),category:`group-${groupIndex+1}`})));
const LISTENING=[...LISTENING_BASE,...LISTENING_EXTRA];
const READING=[
 {id:'r1',text:'ゆきさんは朝七時に起きます。パンを食べて、学校へ行きます。',question:'O que Yuki faz antes de ir à escola?',choices:['Come pão','Lê um livro','Toma banho'],answer:'Come pão',jpQuestion:'ゆきさんは学校へ行く前に、何をしますか。',jpChoices:['パンを食べます','本を読みます','お風呂に入ります'],jpAnswer:'パンを食べます'},
 {id:'r2',text:'今日は雨です。田中さんは傘を持って会社へ行きました。',question:'Por que Tanaka levou um guarda-chuva?',choices:['Porque estava chovendo','Porque estava muito quente','Porque nevou'],answer:'Porque estava chovendo',jpQuestion:'田中さんはどうして傘を持って行きましたか。',jpChoices:['雨だからです','暑いからです','雪だからです'],jpAnswer:'雨だからです'},
 {id:'r3',text:'ねこは机の下にいます。犬は庭で遊んでいます。',question:'Onde está o gato?',choices:['Debaixo da mesa','No jardim','Em cima da cadeira'],answer:'Debaixo da mesa',jpQuestion:'ねこはどこにいますか。',jpChoices:['机の下です','庭です','いすの上です'],jpAnswer:'机の下です'},
 {id:'r4',text:'さくらさんは本屋で日本語の辞書を買いました。',question:'O que Sakura comprou?',choices:['Um dicionário de japonês','Um romance','Uma revista'],answer:'Um dicionário de japonês',jpQuestion:'さくらさんは何を買いましたか。',jpChoices:['日本語の辞書','小説','雑誌'],jpAnswer:'日本語の辞書'},
 {id:'r5',text:'電車は九時に出ます。今は八時四十分です。駅まで十分かかります。',question:'Há tempo suficiente para chegar antes da partida?',choices:['Sim, sobram dez minutos','Não, chegará atrasado','O texto não informa'],answer:'Sim, sobram dez minutos',jpQuestion:'電車が出る前に駅に着けますか。',jpChoices:['はい、十分早く着きます','いいえ、遅れます','分かりません'],jpAnswer:'はい、十分早く着きます'},
 {id:'r6',text:'昨日は忙しかったので、昼ご飯を食べませんでした。夜、家でたくさん食べました。',question:'Por que a pessoa comeu muito à noite?',choices:['Não almoçou','Fez exercício','Recebeu visitas'],answer:'Não almoçou',jpQuestion:'どうして夜たくさん食べましたか。',jpChoices:['昼ご飯を食べなかったからです','運動したからです','友達が来たからです'],jpAnswer:'昼ご飯を食べなかったからです'},
 {id:'r7',text:'山田さんが作ったケーキは甘くて、とてもおいしかったです。',question:'Quem fez o bolo?',choices:['Yamada','O narrador','Uma confeitaria'],answer:'Yamada',jpQuestion:'だれがケーキを作りましたか。',jpChoices:['山田さん','話している人','ケーキ屋'],jpAnswer:'山田さん'},
 {id:'r8',text:'もし明日晴れたら、公園で友達とサッカーをします。雨なら、家で映画を見ます。',question:'O que acontecerá se chover?',choices:['Assistirá a um filme em casa','Jogará futebol no parque','Irá trabalhar'],answer:'Assistirá a um filme em casa',jpQuestion:'雨なら、何をしますか。',jpChoices:['家で映画を見ます','公園でサッカーをします','仕事に行きます'],jpAnswer:'家で映画を見ます'}
];
function normalize(v){return String(v??'').normalize('NFKC').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/[。！？!?\s]+/g,'');}
function accepts(value,answers){return (Array.isArray(answers)?answers:[answers]).some(answer=>normalize(answer)===normalize(value));}
function validateFracture(item,tokens){return item.accepted.some(order=>order.length===tokens.length&&order.every((token,index)=>token===tokens[index]));}
function shuffled(values,random=Math.random){const copy=[...values];for(let i=copy.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}return copy;}
function selectAdaptive(items,limit,progress={},recent=[],random=Math.random){const available=[...items],chosen=[],recentSet=new Set(recent||[]);while(available.length&&chosen.length<Math.min(limit,items.length)){const weighted=available.map(item=>{const stat=progress[item.id]||{},attempts=Number(stat.attempts)||0,errors=Number(stat.errors)||0,mastery=Number(stat.mastery)||0;return{item,weight:1+(attempts?errors/attempts*3:2)+(5-mastery)*.25+(recentSet.has(item.id)?-1.15:0)};});let roll=random()*weighted.reduce((sum,row)=>sum+Math.max(.08,row.weight),0),picked=weighted.at(-1);for(const row of weighted){roll-=Math.max(.08,row.weight);if(roll<=0){picked=row;break;}}chosen.push(picked.item);available.splice(available.indexOf(picked.item),1);}return chosen;}
function labyrinthStage(turn){return turn<3?1:turn<6?2:3;}
function readingPrompt(item,stage=1){return stage===1?{question:item.question,choices:item.choices,answer:item.answer,language:'pt'}:stage===2?{question:`${item.jpQuestion} · ${item.question}`,choices:item.jpChoices,answer:item.jpAnswer,language:'ja-assisted'}:{question:item.jpQuestion,choices:item.jpChoices,answer:item.jpAnswer,language:'ja'};}
return{GRAMMAR,FRACTURE,LISTENING,READING,normalize,accepts,validateFracture,shuffled,selectAdaptive,labyrinthStage,readingPrompt};
});
