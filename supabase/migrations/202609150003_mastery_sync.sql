begin;
create or replace function public.apply_sync_batch(operations jsonb)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare op jsonb; uid uuid:=auth.uid(); op_id uuid; kind text; payload jsonb; accepted jsonb:='[]'::jsonb;
begin
  if uid is null then raise exception 'authentication required' using errcode='42501'; end if;
  if jsonb_typeof(operations)<>'array' or jsonb_array_length(operations)>100 then raise exception 'invalid batch'; end if;
  for op in select value from jsonb_array_elements(operations) loop
    op_id:=(op->>'id')::uuid;kind:=op->>'kind';payload:=coalesce(op->'payload','{}'::jsonb);
    if exists(select 1 from public.sync_receipts where operation_id=op_id and user_id=uid) then accepted:=accepted||to_jsonb(op_id::text);continue;end if;
    if kind='sessions' then
      insert into public.sessions(id,user_id,device_id,mode,territory,started_at,ended_at,status,summary) values((payload->>'id')::uuid,uid,payload->>'deviceId',payload->>'mode',payload->>'territory',(payload->>'startedAt')::timestamptz,nullif(payload->>'endedAt','')::timestamptz,payload->>'status',coalesce(payload->'summary','{}'::jsonb)) on conflict(id) do update set ended_at=coalesce(excluded.ended_at,public.sessions.ended_at),status=excluded.status,summary=excluded.summary;
    elsif kind='attempts' then
      insert into public.attempts(id,user_id,session_id,content_id,content_type,dimension,correct,response_ms,occurred_at,evidence) values((payload->>'id')::uuid,uid,nullif(payload->>'sessionId','')::uuid,payload->>'contentId',payload->>'contentType',payload->>'dimension',(payload->>'correct')::boolean,nullif(payload->>'responseMs','')::integer,(payload->>'occurredAt')::timestamptz,coalesce(payload->'evidence','{}'::jsonb)) on conflict(id) do nothing;
    elsif kind='mastery' then
      insert into public.user_mastery(user_id,content_id,content_type,dimensions,retention_state,first_seen_at,last_seen_at,last_correct_at,next_review_at,evidence_version) values(uid,payload->>'contentId',payload->>'contentType',coalesce(payload->'dimensions','{}'::jsonb),coalesce(payload->>'retentionState','encountered'),nullif(payload->>'firstSeenAt','')::timestamptz,nullif(payload->>'lastSeenAt','')::timestamptz,nullif(payload->>'lastCorrectAt','')::timestamptz,nullif(payload->>'nextReviewAt','')::timestamptz,coalesce((payload->>'evidenceVersion')::bigint,0)) on conflict(user_id,content_id,content_type) do update set dimensions=case when excluded.evidence_version>=public.user_mastery.evidence_version then public.user_mastery.dimensions||excluded.dimensions else excluded.dimensions||public.user_mastery.dimensions end,retention_state=case when excluded.evidence_version>=public.user_mastery.evidence_version then excluded.retention_state else public.user_mastery.retention_state end,first_seen_at=least(public.user_mastery.first_seen_at,excluded.first_seen_at),last_seen_at=greatest(public.user_mastery.last_seen_at,excluded.last_seen_at),last_correct_at=greatest(public.user_mastery.last_correct_at,excluded.last_correct_at),next_review_at=case when excluded.evidence_version>=public.user_mastery.evidence_version then excluded.next_review_at else public.user_mastery.next_review_at end,evidence_version=greatest(public.user_mastery.evidence_version,excluded.evidence_version),updated_at=now();
    elsif kind='unlocks' then
      insert into public.unlocks(user_id,unlock_id,unlocked_at,evidence) values(uid,payload->>'unlockId',(payload->>'unlockedAt')::timestamptz,coalesce(payload->'evidence','{}'::jsonb)) on conflict(user_id,unlock_id) do update set unlocked_at=least(public.unlocks.unlocked_at,excluded.unlocked_at),evidence=public.unlocks.evidence||excluded.evidence;
    elsif kind='records' then
      insert into public.records(user_id,record_id,value,achieved_at,evidence) values(uid,payload->>'recordId',(payload->>'value')::numeric,(payload->>'achievedAt')::timestamptz,coalesce(payload->'evidence','{}'::jsonb)) on conflict(user_id,record_id) do update set value=greatest(public.records.value,excluded.value),achieved_at=case when excluded.value>public.records.value then excluded.achieved_at else public.records.achieved_at end,evidence=case when excluded.value>public.records.value then excluded.evidence else public.records.evidence end;
    elsif kind='settings' then
      insert into public.user_settings(user_id,setting_key,value,revision,updated_at) values(uid,payload->>'key',payload->'value',(payload->>'revision')::bigint,(payload->>'updatedAt')::timestamptz) on conflict(user_id,setting_key) do update set value=excluded.value,revision=excluded.revision,updated_at=excluded.updated_at where excluded.revision>public.user_settings.revision or(excluded.revision=public.user_settings.revision and excluded.updated_at>public.user_settings.updated_at);
    else raise exception 'unsupported sync kind: %',kind;end if;
    insert into public.sync_receipts(operation_id,user_id,entity_kind,entity_id) values(op_id,uid,kind,coalesce(op->>'entityId','')) on conflict(operation_id) do nothing;accepted:=accepted||to_jsonb(op_id::text);
  end loop;return jsonb_build_object('acceptedIds',accepted);
end$$;
grant execute on function public.apply_sync_batch(jsonb) to authenticated;
commit;
