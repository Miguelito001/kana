-- Execute em um projeto local Supabase após aplicar as migrations.
begin;
select plan(6);
select tests.create_supabase_user('user_a');select tests.create_supabase_user('user_b');
select tests.authenticate_as('user_a');
select lives_ok($$insert into public.sessions(id,user_id,device_id,mode,territory,started_at,status) values(gen_random_uuid(),tests.get_supabase_uid('user_a'),'a','hiragana','hiragana',now(),'completed')$$,'A grava seus dados');
select is((select count(*) from public.sessions where user_id=tests.get_supabase_uid('user_a')),1::bigint,'A lê seus dados');
select is((select count(*) from public.sessions where user_id=tests.get_supabase_uid('user_b')),0::bigint,'A não lê B');
select throws_ok(format('insert into public.sessions(id,user_id,device_id,mode,territory,started_at,status) values(gen_random_uuid(),%L,''a'',''x'',''x'',now(),''completed'')',tests.get_supabase_uid('user_b')),'42501',null,'A não grava como B');
select tests.clear_authentication();
select is((select count(*) from public.sessions),0::bigint,'anon não lê progresso privado');
select throws_ok($$insert into public.attempts(id,user_id,content_id,content_type,correct,occurred_at) values(gen_random_uuid(),gen_random_uuid(),'x','word',true,now())$$,'42501',null,'anon não grava progresso privado');
select * from finish();rollback;
