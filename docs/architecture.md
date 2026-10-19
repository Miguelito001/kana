# かな。 — arquitetura evolutiva

## Estado auditado

O produto atual é um site estático deliberadamente compacto. A interface, navegação, sessões, histórico diário, treino adaptativo de vocabulário, carregamento do JMdict e o fluxo do INSANITY vivem em `dist/index.html`. Conteúdo local fica em `kanji-data.js` e `vocabulary-data.js`; regras puras do INSANITY ficam em `insanity-core.js`.

Persistência legada preservada como fonte de verdade:

| Chave | Responsabilidade |
| --- | --- |
| `kana-last-session` | resumo e erros da sessão anterior |
| `kana-daily-ranking` | agregados diários |
| `kana-vocabulary-progress-v1` | desempenho e mastery escalar por palavra |
| `kana-nerd-ledger-v1` | acertos, erros e bitset de conhecidas do Nerd ∞ |
| `kana-insanity-stats-v1` | desbloqueio e recordes do INSANITY |
| `kana-insanity-active-v1` | recuperação de run ativa |

## Fundação v2

`platform-core.js` é uma camada UMD, utilizável no navegador e em testes Node. Ela compartilha infraestrutura sem impor comportamento aos modos:

- armazenamento JSON seguro e adaptador IndexedDB para coleções grandes;
- migração versionada, aditiva e idempotente;
- mastery esparso por dimensão (`visualMeaning`, `audioMeaning`, `reading`, `context`, `grammaticalUsage`);
- estados de retenção que exigem recuperação espaçada para `known` e múltiplas dimensões/dias para `mastered`;
- requisitos de desbloqueio compostos e persistentes;
- contratos de sessão e política injetável, incluindo endurance;
- registros de modos, exercícios, conteúdo lazy, áudio, bosses e conquistas significativas;
- normalização e validação por múltiplas respostas aceitas;
- dificuldade persistente, maldição/quebra, Nemesis e Cemitério;
- métrica de dependência de português baseada apenas em evidência sem português;
- campos de frequência independentes e opcionais, sem inferência a partir do JMdict.

O mastery legado de Vocabulário pode ser projetado somente em `visualMeaning`. As outras dimensões continuam `null`; nenhum dado inexistente é fabricado. O requisito atual do INSANITY continua usando exatamente o ledger e o limiar escalar existentes, agora avaliado pelo mecanismo genérico com fallback compatível.

## Migração

A inicialização cria somente `kana-platform-meta-v2`, com `schemaVersion: 2` e o registro `v2-foundation`. Não remove, renomeia nem regrava chaves antigas. A migração é repetível e não duplica registros. Dados extensos futuros devem ir ao IndexedDB (`mastery`, `sessions`, `history`, `contentCache`); metadados pequenos permanecem no localStorage.

## Reutilização e limites

- A UI e todos os fluxos atuais permanecem no arquivo existente para evitar regressão durante a fundação.
- O carregamento em 29 chunks do Nerd ∞ não foi alterado nem duplicado.
- A identidade visual e os breakpoints não receberam alterações nesta fase.
- Providers separam engine, conteúdo, origem/licença e áudio; nenhuma fonte paga foi adicionada.
- O catálogo de territórios registra futuros endgames como planejados, sem mostrar cards vazios ao usuário.

## Riscos controlados

- **Migração de estado:** aditiva; antigas chaves seguem canônicas.
- **Falso domínio:** dimensões não observadas são nulas e repetição num único dia não domina.
- **Escala:** registros grandes possuem rota IndexedDB e conteúdo continua sob demanda.
- **Acoplamento:** sessões recebem políticas próprias; endgames não herdam uma regra universal.
- **Regressão do INSANITY:** requisitos, isolamento pedagógico e persistência continuam cobertos pelos testes existentes.

## Fases

A classificação canônica está em `docs/product-status.md`. “Fundação” significa apenas que o núcleo consegue representar o recurso; não significa que ele esteja disponível ao usuário.

1. **Fundação — em fechamento:** auditoria, schema aditivo, mastery multidimensional conectado, retenção, desbloqueios, sessões/exercícios e providers.
2. **Modos atuais — concluído:** BLITZ, ALIEN e CHIMERA jogáveis, persistentes e sincronizados sem contaminar o ranking pedagógico.
3. **Territórios — concluído:** Gramática/FRACTURE, Escuta/VOID e Leitura/LABYRINTH estão jogáveis, persistentes e sincronizados.
4. **Metassistemas — concluído:** amaldiçoados, Nemesis, Cemitério, boss 境界, perfil e dependência de português.
5. **Global — concluído:** THE TRIAL adaptativo entre sete habilidades e contrato final não jogável do TRUE INSANITY.

TRUE INSANITY está representável como endgame futuro, mas não foi implementado nem alterou o INSANITY atual.

## Fase 5 — sistema global

`trial-core.js` concentra o corpus inicial e as regras puras; `trial-ui.js` integra a prova ao Perfil sem alterar os territórios existentes. O card existe bloqueado até que as sete habilidades tenham evidência, o menor eixo alcance 25 e existam 350 tentativas oficiais. O desbloqueio é monotônico e sincronizado pelo snapshot dos metassistemas.

- o seletor dá mais peso às fraquezas reais, mas equilibra territórios e impede repetição imediata;
- a prova muda qualitativamente entre reconhecimento, contexto, tempo real e caçada, em vez de apenas aumentar números;
- três rupturas encerram a run; cinco acertos consecutivos podem reparar uma ruptura, testando recuperação sob pressão;
- runs ativas, recordes e totais próprios sobrevivem a refresh e sincronizam entre dispositivos;
- tentativas do THE TRIAL não alteram mastery, ranking diário, dependência de português, maldições ou requisitos pedagógicos;
- áudio continua passando pelo `AudioProvider`; nos estágios avançados o estímulo toca uma vez;
- o contrato `TRUE_INSANITY_CONTRACT` declara lemas, capabilities e geração determinística de formas como fronteira futura, sem expor UI nem mudar o INSANITY atual.

## Fase 2 — modos atuais

`endgame-core.js` contém regras puras e conteúdo revisável. `endgames-ui.js` controla apenas as telas dos territórios e desafios; não participa das sessões pedagógicas antigas.

- **BLITZ:** run de sobrevivência por tempo, limite progressivo de 4,5 s até 1,35 s, introdução qualitativa de kana isolado → combinações → palavras curtas, recorde, média e telemetria por estímulo.
- **ALIEN:** sessão de 15 sinais, progressão por transparência da adaptação, distratores preferencialmente da mesma categoria, desempenho e mastery próprios por item.
- **CHIMERA:** corpus inicial curado de compostos atestados e transparentes, seleção que prioriza componentes fortes no histórico de Kanji, alternativas plausíveis, sinônimos aceitos e explicação após cada hipótese.

Os dados desta fase usam `kana-endgames-v1`, separados de histórico diário, mastery de vocabulário, ledger Nerd ∞ e INSANITY. Os treinos normais continuam usando seus motores e formatos de resposta anteriores.

## Fase 3 — novos territórios

`phase3-core.js` mantém o conteúdo revisável e as regras puras. `phase3-ui.js` compartilha a infraestrutura de sessão e persistência, mas cada território conserva comportamento próprio.

- **Gramática:** exercícios estruturais liberam capabilities consumidas pelo Vocabulário N3.
- **FRACTURE:** frases são reconstruídas por blocos e cada item pode declarar mais de uma ordem japonesa válida.
- **Escuta:** o provider de áudio fica isolado da UI; desempenho auditivo usa `audioMeaning`, sem contaminar reconhecimento visual.
- **VOID:** não mostra transcrição e desabilita repetição do estímulo.
- **Leitura:** perguntas avaliam conteúdo, não tradução literal, gravando evidência em `context`.
- **LABYRINTH:** começa com perguntas em português, passa por assistência bilíngue e termina com pergunta e respostas em japonês.

As sessões da Fase 3 não percorrem mais os arrays desde o primeiro item. `selectAdaptive` monta um conjunto sem reposição, reduz fortemente a presença dos itens recentes e aumenta a probabilidade de itens novos, fracos ou errados. Os treinos normais são contínuos: percorrem todo o banco antes de iniciar outro ciclo adaptativo e só terminam quando o usuário volta. FRACTURE, VOID e LABYRINTH conservam limites próprios por serem endgames. Escuta e VOID compartilham um corpus de 100 estímulos, mas mantêm mastery e histórico independentes por modo.

## Fase 4 — metassistemas

`meta-core.js` mantém regras puras e versionadas; `meta-ui.js` apresenta o perfil, a área de lore e o primeiro Boss. O estado é salvo em `kana-meta-systems-v1` e sincronizado como `meta-systems`, sem nova tabela ou quebra de schema.

- uma maldição exige ao menos oito tentativas, quatro erros e taxa de erro alta;
- cinco recuperações consecutivas e taxa recuperada podem quebrá-la;
- itens amaldiçoados recebem aumento moderado de prioridade, nunca spam garantido;
- uma Nemesis exige três mortes de run, oito erros e atividade em pelo menos dois dias;
- o Cemitério recebe derrotas de BLITZ e INSANITY sem alterar mastery pedagógico;
- dependência de português usa apenas exercícios marcados explicitamente como independentes de português;
- o Boss 境界 só abre após 100 tentativas dominiais e prática em três territórios, testando sete habilidades em sete selos.

## Fundação offline-first v3

`persistence-core.js` passa a ser a fronteira entre domínio e armazenamento. O controlador e os endgames usam repositories para sessões, mastery, desbloqueios, recordes e configurações. As chaves antigas continuam canônicas nesta etapa para compatibilidade total.

Na primeira execução, a migração:

1. captura as chaves conhecidas em `kana-legacy-backup-v3`;
2. valida o JSON antes de criar o novo envelope;
3. cria identidade guest e metadados versionados em `kana-local-state-v3`;
4. registra conclusão em `kana-local-meta-v3`;
5. não remove o backup nem qualquer chave legada.

Se o backup ou a validação falhar, a conversão para e a origem permanece intocada. A operação é idempotente.

### Identidade de conteúdo

IDs manuais existentes são preservados. Entradas JMdict conservam `dict-{chunk}-{posição}` como alias legado, mas recebem um `contentId` canônico derivado de provider + escrita + leitura + categoria. Assim, mover uma entrada entre chunks não rompe o vínculo. Versões de conteúdo são registradas separadamente; correções de tradução não alteram o ID.

### Offline e sincronização

Respostas permanecem locais e nunca aguardam HTTP. A fila usa operações com UUID, batches, deduplicação e backoff exponencial. Conflitos são tratados por domínio: tentativas/sessões append-only, recordes por máximo, unlocks monotônicos, mastery por união de evidências e recálculo, configurações por revisão/data.

O adaptador remoto está atrás do `SyncCoordinator`. Sem configuração Supabase ele não é instanciado e o modo guest continua integralmente funcional.

## Conta e nuvem

`auth-sync.js` conecta o adaptador ao Supabase com e-mail/senha, atualização de senha, magic link auxiliar e sessão renovável. A autenticação é opcional, mas somente respostas feitas enquanto uma conta está conectada entram na fila oficial. Progresso guest nunca é reivindicado nem importado.

A conta é a fonte de verdade. A migration `004` realiza um corte único do modelo antigo e registra `account-authority-v2`. Ao entrar ou trocar de conta, o cache e a fila locais são descartados antes do pull; ao sair, o cache da conta também é removido. Assim, duas contas usadas no mesmo navegador não compartilham progresso, e um convidado não consegue cultivar desbloqueios para importar depois.

O pull remoto é esparso e paginado. Mastery carrega somente os registros recentes necessários à continuidade; o universo JMdict permanece nos chunks existentes, e o ledger compacto do Nerd é sincronizado como configuração. INSANITY e endgames mantêm métricas próprias e não atualizam mastery pedagógico.

Sessões ativas são atualizadas na nuvem durante o jogo e consolidadas pelo ID da sessão, evitando duplicação. Ao entrar, solicitar sincronização ou voltar para a aba, o cliente primeiro envia a fila e depois relê mastery, configurações e sessões. O histórico diário compartilhado usa as sessões como evidência e conserva agregados legados quando forem maiores; a última sessão também passa a acompanhar a conta.

A fila tenta enviar imediatamente após cada mudança e repete silenciosamente a cada cinco segundos enquanto houver trabalho elegível. A migration `005` completa a política RLS dos recibos idempotentes: leitura e inserção são permitidas apenas quando `user_id = auth.uid()`. A interface não expõe tamanho da fila; mostra apenas conectado, sincronizando ou offline.

O dataset remoto está fixado em uma revisão imutável. A identidade canônica de verbetes deriva de provider + escrita + leitura + categoria e conserva o ID antigo como alias, evitando perda de vínculo quando um verbete muda de chunk.

### PostgreSQL e segurança

A migration em `supabase/migrations` cria somente estado esparso por usuário. O JMdict não é duplicado no PostgreSQL. Todas as tabelas privadas possuem RLS por `auth.uid()` e cascata a partir do perfil; `content_versions` é global. Recordes compartilhados futuros possuem flag de verificação e não devem confiar cegamente no cliente.
