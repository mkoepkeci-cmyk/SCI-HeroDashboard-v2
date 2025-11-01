import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

async function checkProgress() {
  const names = ['Van', 'Yvette'];

  for (const name of names) {
    const { data: member } = await supabase
      .from('team_members')
      .select('id')
      .ilike('name', name)
      .single();

    if (!member) continue;

    const { data: assignments, count } = await supabase
      .from('assignments')
      .select('*', { count: 'exact' })
      .eq('team_member_id', member.id);

    const missing = assignments?.filter(a =>
      !a.work_effort || !a.phase || !a.role_type
    ) || [];

    console.log(`${name}: ${count} total assignments, ${missing.length} with missing data`);

    if (missing.length > 0) {
      console.log(`  Missing breakdown:`);
      const missingEffort = missing.filter(a => !a.work_effort).length;
      const missingPhase = missing.filter(a => !a.phase).length;
      const missingRole = missing.filter(a => !a.role_type).length;
      console.log(`    - Work Effort: ${missingEffort}`);
      console.log(`    - Phase: ${missingPhase}`);
      console.log(`    - Role Type: ${missingRole}`);
    }
  }
}

checkProgress().catch(console.error);
