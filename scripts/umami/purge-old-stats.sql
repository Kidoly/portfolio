-- Deletes the Umami audience data older than 25 months, the retention announced in the privacy
-- policy (albanmary.com/confidentialite). Safe to run every month: nothing is old enough before
-- late 2028. Tables follow Umami's PostgreSQL schema; a table the installed version lacks is skipped.
--
-- Monthly, on the server that runs the compose file (crontab -e):
--   0 4 1 * * cd ~ && docker compose exec -T umami-db psql -U umami -d umami -v ON_ERROR_STOP=1 < ~/umami-purge.sql >> ~/umami-purge.log 2>&1
DO $$
DECLARE
  cutoff constant timestamptz := now() - interval '25 months';
  tbl text;
  n bigint;
BEGIN
  RAISE NOTICE '% - purge before %', now()::date, cutoff::date;

  -- Rows attached to events and sessions first, then the events themselves
  FOREACH tbl IN ARRAY ARRAY['event_data', 'session_data', 'revenue', 'session_replay', 'heatmap_event', 'session_link', 'website_event'] LOOP
    IF to_regclass('public.' || tbl) IS NOT NULL THEN
      EXECUTE format('DELETE FROM %I WHERE created_at < $1', tbl) USING cutoff;
      GET DIAGNOSTICS n = ROW_COUNT;
      RAISE NOTICE '%: % deleted', tbl, n;
    END IF;
  END LOOP;

  -- Then the old sessions that no longer have any event
  IF to_regclass('public.session') IS NOT NULL THEN
    DELETE FROM session s
    WHERE s.created_at < cutoff
      AND NOT EXISTS (SELECT 1 FROM website_event e WHERE e.session_id = s.session_id);
    GET DIAGNOSTICS n = ROW_COUNT;
    RAISE NOTICE 'session: % deleted', n;
  END IF;
END $$;
