import { createClient } from '@supabase/supabase-js';

// Use the known Supabase instance from CLAUDE.md
const supabaseUrl = 'https://fiyaolxiarzkihlbhtmz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpeWFvbHhpYXJ6a2lobGJodG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcyMjU5MTcsImV4cCI6MjA1MjgwMTkxN30.UIDUwXKEVvH3cxDIzOZ3uWq_z6ZhWjzOoSvh1O6Ppr0';

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials not available');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function auditDatabase() {
  console.log('='.repeat(80));
  console.log('DATABASE AUDIT - Current State Analysis');
  console.log('='.repeat(80));

  // 1. Get all team members
  const { data: teamMembers, error: tmError } = await supabase
    .from('team_members')
    .select('*')
    .order('name');

  if (tmError) {
    console.error('Error fetching team members:', tmError);
    return;
  }

  console.log(`\n📊 TEAM MEMBERS: ${teamMembers?.length || 0}\n`);
  teamMembers?.forEach(tm => {
    console.log(`  - ${tm.name} (ID: ${tm.id})`);
  });

  // 2. Get all work_type_summary (aggregate counts)
  const { data: workTypeSummary, error: wtsError } = await supabase
    .from('work_type_summary')
    .select('*')
    .order('team_member_id');

  console.log('\n' + '='.repeat(80));
  console.log('WORK TYPE SUMMARY (Aggregate Assignment Counts)');
  console.log('='.repeat(80));

  if (workTypeSummary) {
    const summaryByMember = workTypeSummary.reduce((acc: any, item) => {
      if (!acc[item.team_member_id]) {
        acc[item.team_member_id] = { total: 0, types: [] };
      }
      acc[item.team_member_id].total += item.count;
      acc[item.team_member_id].types.push({
        type: item.work_type,
        count: item.count
      });
      return acc;
    }, {});

    for (const memberId in summaryByMember) {
      const member = teamMembers?.find(tm => tm.id === parseInt(memberId));
      const summary = summaryByMember[memberId];
      console.log(`\n${member?.name || 'Unknown'} - Total: ${summary.total} assignments`);
      summary.types.forEach((t: any) => {
        console.log(`    ${t.type}: ${t.count}`);
      });
    }
  }

  // 3. Get all initiatives
  const { data: initiatives, error: initError } = await supabase
    .from('initiatives')
    .select('*')
    .order('team_member_id, type, status');

  console.log('\n' + '='.repeat(80));
  console.log('INITIATIVES (Detailed Project Tracking)');
  console.log('='.repeat(80));

  if (initiatives) {
    console.log(`\nTotal Initiatives: ${initiatives.length}\n`);

    // Group by team member
    const initiativesByMember = initiatives.reduce((acc: any, init) => {
      if (!acc[init.team_member_id]) {
        acc[init.team_member_id] = [];
      }
      acc[init.team_member_id].push(init);
      return acc;
    }, {});

    for (const memberId in initiativesByMember) {
      const member = teamMembers?.find(tm => tm.id === parseInt(memberId));
      const memberInitiatives = initiativesByMember[memberId];

      console.log(`\n${'─'.repeat(80)}`);
      console.log(`${member?.name || 'Unknown'} - ${memberInitiatives.length} initiatives`);
      console.log('─'.repeat(80));

      // Count by status
      const statusCounts = memberInitiatives.reduce((acc: any, init: any) => {
        acc[init.status] = (acc[init.status] || 0) + 1;
        return acc;
      }, {});

      console.log('\nBy Status:');
      for (const status in statusCounts) {
        console.log(`  ${status}: ${statusCounts[status]}`);
      }

      // Count by type
      const typeCounts = memberInitiatives.reduce((acc: any, init: any) => {
        acc[init.type] = (acc[init.type] || 0) + 1;
        return acc;
      }, {});

      console.log('\nBy Type:');
      for (const type in typeCounts) {
        console.log(`  ${type}: ${typeCounts[type]}`);
      }

      // List all initiatives
      console.log('\nInitiatives:');
      memberInitiatives.forEach((init: any) => {
        const hasRole = init.role ? `[${init.role}]` : '[No Role]';
        const hasEHR = init.ehrs_impacted ? `[${init.ehrs_impacted}]` : '[No EHR]';
        const hasServiceLine = init.service_line ? `[${init.service_line}]` : '[No Service Line]';

        console.log(`  ${init.status.padEnd(12)} ${init.type.padEnd(20)} ${hasRole.padEnd(15)} ${init.name}`);
      });
    }

    // 4. Identify potential issues
    console.log('\n\n' + '='.repeat(80));
    console.log('⚠️  POTENTIAL DATA ISSUES');
    console.log('='.repeat(80));

    const issues = {
      completedActive: initiatives.filter(i =>
        (i.status === 'Completed' || i.status === 'On Hold' || i.status === 'Cancelled') &&
        i.status !== 'Planning' && i.status !== 'Active' && i.status !== 'Scaling'
      ),
      missingRole: initiatives.filter(i => !i.role),
      missingEHR: initiatives.filter(i => !i.ehrs_impacted),
      missingServiceLine: initiatives.filter(i => !i.service_line),
      oldStatus: initiatives.filter(i =>
        !['Planning', 'Active', 'Scaling', 'Completed', 'On Hold', 'Cancelled'].includes(i.status)
      )
    };

    console.log(`\n1. Initiatives with non-active status (Complete/On Hold/Cancelled): ${issues.completedActive.length}`);
    if (issues.completedActive.length > 0) {
      console.log('   These should likely not count toward current workload.');
      issues.completedActive.slice(0, 5).forEach(i => {
        const member = teamMembers?.find(tm => tm.id === i.team_member_id);
        console.log(`   - ${member?.name}: ${i.name} (${i.status})`);
      });
      if (issues.completedActive.length > 5) {
        console.log(`   ... and ${issues.completedActive.length - 5} more`);
      }
    }

    console.log(`\n2. Initiatives missing Role field: ${issues.missingRole.length}`);
    if (issues.missingRole.length > 0) {
      issues.missingRole.slice(0, 5).forEach(i => {
        const member = teamMembers?.find(tm => tm.id === i.team_member_id);
        console.log(`   - ${member?.name}: ${i.name}`);
      });
      if (issues.missingRole.length > 5) {
        console.log(`   ... and ${issues.missingRole.length - 5} more`);
      }
    }

    console.log(`\n3. Initiatives missing EHRs Impacted field: ${issues.missingEHR.length}`);
    if (issues.missingEHR.length > 0) {
      issues.missingEHR.slice(0, 3).forEach(i => {
        const member = teamMembers?.find(tm => tm.id === i.team_member_id);
        console.log(`   - ${member?.name}: ${i.name}`);
      });
      if (issues.missingEHR.length > 3) {
        console.log(`   ... and ${issues.missingEHR.length - 3} more`);
      }
    }

    console.log(`\n4. Initiatives missing Service Line: ${issues.missingServiceLine.length}`);

    console.log(`\n5. Initiatives with non-standard status values: ${issues.oldStatus.length}`);
    if (issues.oldStatus.length > 0) {
      const statusValues = [...new Set(issues.oldStatus.map(i => i.status))];
      console.log(`   Status values found: ${statusValues.join(', ')}`);
    }
  }

  // 5. Check if new weighted workload fields exist
  console.log('\n\n' + '='.repeat(80));
  console.log('DATABASE SCHEMA CHECK - Weighted Workload Fields');
  console.log('='.repeat(80));

  const { data: sampleInit } = await supabase
    .from('initiatives')
    .select('*')
    .limit(1)
    .single();

  if (sampleInit) {
    const hasWeightedFields = {
      work_effort: 'work_effort' in sampleInit,
      role_multiplier: 'role_multiplier' in sampleInit,
      work_type_weight: 'work_type_weight' in sampleInit,
      phase_weight: 'phase_weight' in sampleInit,
      phase: 'phase' in sampleInit,
      base_hours_per_week: 'base_hours_per_week' in sampleInit,
      active_hours_per_week: 'active_hours_per_week' in sampleInit,
      is_active: 'is_active' in sampleInit
    };

    console.log('\nFields Present in Database:');
    for (const [field, exists] of Object.entries(hasWeightedFields)) {
      console.log(`  ${exists ? '✅' : '❌'} ${field}`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('AUDIT COMPLETE');
  console.log('='.repeat(80));
}

auditDatabase().catch(console.error);
