begin;

drop policy if exists own_receipts_insert on public.sync_receipts;
create policy own_receipts_insert
on public.sync_receipts
for insert
to authenticated
with check(user_id=auth.uid());

grant select,insert on public.sync_receipts to authenticated;

commit;
