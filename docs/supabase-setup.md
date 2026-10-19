# Conectar o Supabase ao かな。

O frontend opera offline em modo convidado e oferece login opcional por e-mail e senha. Magic link permanece apenas como acesso/recuperação auxiliar. Nunca adicione uma `service_role` ao navegador.

## Valores necessários

Depois de criar o projeto Supabase, serão necessários apenas:

- **Project URL** (`https://...supabase.co`)
- **Publishable/anon key** destinada ao cliente

A chave `service_role` nunca deve ser fornecida ao frontend ou commitada.

## Aplicar o banco

As migrations reproduzíveis estão em `supabase/migrations`. A `001` cria tabelas, índices, trigger de perfil, cascatas, RLS e policies; a `002` cria o RPC autenticado/idempotente; a `003` acrescenta mastery esparso ao lote; a `004` faz o corte único para o modelo em que a conta é a fonte oficial; a `005` permite inserir recibos idempotentes somente para o próprio usuário; a `006` torna o RPC o único escritor privilegiado, ainda rigidamente vinculado a `auth.uid()`. O teste de isolamento está em `supabase/tests/rls.sql` e deve ser executado num ambiente Supabase local/CI com pgTAP.

## Fluxo ativo

1. O jogo continua salvando localmente sem bloquear respostas.
2. Ao entrar ou trocar de conta, o cache do aparelho é limpo e reposto exclusivamente pelos dados daquela conta. Progresso de convidado nunca é importado. Um usuário já conectado por magic link pode definir uma senha no painel da conta e depois entrar diretamente em outros aparelhos.
3. O progresso legado é importado em lotes de no máximo 100.
4. Novas tentativas, sessões, recordes, desbloqueios e configurações entram na fila offline.
5. O pull restaura estado esparso; o bitset do Nerd continua sendo a representação compacta das conhecidas.

Cadastre a URL pública em **Authentication → URL Configuration → Redirect URLs**. O logout remove apenas a sessão local; dados do jogo continuam disponíveis no dispositivo.
