begin;

create or replace function public.initialize_account_v2()
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  uid uuid:=auth.uid();
  already_initialized boolean;
begin
  if uid is null then
    raise exception 'authentication required' using errcode='42501';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(uid::text,0));

  select exists(
    select 1 from public.user_settings
    where user_id=uid and setting_key='account-authority-v2'
  ) into already_initialized;

  if already_initialized then
    return jsonb_build_object('initialized',true,'reset',false);
  end if;

  -- Corte único e intencional: remove o modelo antigo, que misturava snapshots locais.
  delete from public.attempts where user_id=uid;
  delete from public.sessions where user_id=uid;
  delete from public.user_mastery where user_id=uid;
  delete from public.unlocks where user_id=uid;
  delete from public.records where user_id=uid;
  delete from public.achievements where user_id=uid;
  delete from public.curses where user_id=uid;
  delete from public.nemeses where user_id=uid;
  delete from public.graveyard where user_id=uid;
  delete from public.sync_receipts where user_id=uid;
  delete from public.user_settings where user_id=uid;

  insert into public.user_settings(user_id,setting_key,value,revision,updated_at)
  values(uid,'account-authority-v2',jsonb_build_object('initializedAt',now()),1,now());

  return jsonb_build_object('initialized',true,'reset',true);
end$$;

revoke all on function public.initialize_account_v2() from public,anon;
grant execute on function public.initialize_account_v2() to authenticated;

commit;
