-- ============================================
-- EMERGENCY: Disable the recursive trigger
-- ============================================

-- Disable the trigger immediately
ALTER TABLE initiatives DISABLE TRIGGER trigger_update_initiative_completion;

-- Verify it's disabled
SELECT tgname, tgenabled
FROM pg_trigger
WHERE tgname = 'trigger_update_initiative_completion';

-- Now you can safely update initiatives
SELECT 'Trigger disabled - safe to run UPDATE queries now' as status;
