begin;

-- O RPC valida auth.uid() internamente e escreve sempre usando esse uid.
-- SECURITY DEFINER evita que uma policy/grant intermediária cancele o lote inteiro.
alter function public.apply_sync_batch(jsonb) security definer;
alter function public.apply_sync_batch(jsonb) set search_path=public;

revoke all on function public.apply_sync_batch(jsonb) from public,anon;
grant execute on function public.apply_sync_batch(jsonb) to authenticated;

-- O pull continua passando por RLS e só consegue ler o próprio usuário.
grant select on public.profiles,public.sessions,public.attempts,
  public.user_mastery,public.unlocks,public.records,public.achievements,
  public.curses,public.nemeses,public.graveyard,public.user_settings,
  public.sync_receipts to authenticated;

commit;
