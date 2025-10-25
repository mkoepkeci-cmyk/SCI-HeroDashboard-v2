import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

// Read credentials from .env
const envContent = fs.readFileSync('.env', 'utf-8');
const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.+)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/);

const supabaseUrl = urlMatch ? urlMatch[1].trim() : '';
const supabaseKey = keyMatch ? keyMatch[1].trim() : '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Could not read Supabase credentials from .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function auditDashboardData() {
  console.log('='.repeat(80));
  console.log('DASHBOARD DATA ACCURACY AUDIT');
  console.log('='.repeat(80));
  console.log('Checking all data displayed on the dashboard...\n');

  try {
    // 1. Team Members
    console.log('📊 TEAM MEMBERS');
    console.log('─'.repeat(80));
    const { data: teamMembers, error: tmError } = await supabase
      .from('team_members')
      .select('*')
      .order('name');

    if (tmError) {
      console.error('❌ Error fetching team members:', tmError.message);
      return;
    }

    console.log(`Total Team Members: ${teamMembers?.length || 0}\n`);

    if (teamMembers && teamMembers.length > 0) {
      console.log('Team Member Details:');
      teamMembers.forEach((member, index) => {
        console.log(`\n${index + 1}. ${member.name}`);
        console.log(`   ID: ${member.id}`);
        console.log(`   Role: ${member.role || 'not set'}`);
        console.log(`   Specialty: ${member.specialty || 'not set'}`);
        console.log(`   Total Assignments: ${member.total_assignments || 0}`);
        console.log(`   Revenue Impact: ${member.revenue_impact || 'not set'}`);
      });
    }

    // 2. Work Type Summary (Aggregate Counts)
    console.log('\n\n📊 WORK TYPE SUMMARY (Aggregate Assignment Counts)');
    console.log('─'.repeat(80));
    const { data: workTypeSummary, error: wtsError } = await supabase
      .from('work_type_summary')
      .select('*');

    if (wtsError) {
      console.error('❌ Error fetching work type summary:', wtsError.message);
    } else {
      const summaryByMember = workTypeSummary?.reduce((acc: any, item) => {
        if (!acc[item.team_member_id]) {
          const member = teamMembers?.find(tm => tm.id === item.team_member_id);
          acc[item.team_member_id] = {
            name: member?.name || 'Unknown',
            total: 0,
            types: []
          };
        }
        acc[item.team_member_id].total += item.count;
        acc[item.team_member_id].types.push({
          type: item.work_type,
          count: item.count
        });
        return acc;
      }, {});

      for (const memberId in summaryByMember) {
        const summary = summaryByMember[memberId];
        const member = teamMembers?.find(tm => tm.id === parseInt(memberId));

        console.log(`\n${summary.name}:`);
        console.log(`  Total from work_type_summary: ${summary.total}`);
        console.log(`  Total from team_members: ${member?.total_assignments || 0}`);

        if (summary.total !== member?.total_assignments) {
          console.log(`  ⚠️  MISMATCH! work_type_summary (${summary.total}) ≠ team_members (${member?.total_assignments})`);
        } else {
          console.log(`  ✅ Totals match`);
        }

        console.log(`  Breakdown:`);
        summary.types.forEach((t: any) => {
          console.log(`    - ${t.type}: ${t.count}`);
        });
      }
    }

    // 3. Initiatives
    console.log('\n\n📊 INITIATIVES');
    console.log('─'.repeat(80));
    const { data: initiatives, error: initError } = await supabase
      .from('initiatives')
      .select('*')
      .order('team_member_id, status');

    if (initError) {
      console.error('❌ Error fetching initiatives:', initError.message);
    } else {
      console.log(`Total Initiatives: ${initiatives?.length || 0}\n`);

      // Group by team member
      const initiativesByMember = initiatives?.reduce((acc: any, init) => {
        const memberId = init.team_member_id || 'unassigned';
        if (!acc[memberId]) {
          acc[memberId] = [];
        }
        acc[memberId].push(init);
        return acc;
      }, {});

      for (const memberId in initiativesByMember) {
        const member = teamMembers?.find(tm => tm.id === parseInt(memberId));
        const memberInits = initiativesByMember[memberId];

        console.log(`\n${member?.name || 'Unassigned'} (${memberInits.length} initiatives):`);

        // Status breakdown
        const statusCounts = memberInits.reduce((acc: any, init: any) => {
          acc[init.status] = (acc[init.status] || 0) + 1;
          return acc;
        }, {});

        console.log(`  By Status:`);
        for (const status in statusCounts) {
          console.log(`    ${status}: ${statusCounts[status]}`);
        }

        // Check new fields
        const withPhase = memberInits.filter((i: any) => i.phase).length;
        const withEffort = memberInits.filter((i: any) => i.work_effort).length;
        const withRole = memberInits.filter((i: any) => i.role).length;
        const withEHR = memberInits.filter((i: any) => i.ehrs_impacted).length;
        const withServiceLine = memberInits.filter((i: any) => i.service_line).length;

        console.log(`  Data Completeness:`);
        console.log(`    With Phase: ${withPhase}/${memberInits.length} (${Math.round(withPhase/memberInits.length*100)}%)`);
        console.log(`    With Work Effort: ${withEffort}/${memberInits.length} (${Math.round(withEffort/memberInits.length*100)}%)`);
        console.log(`    With Role: ${withRole}/${memberInits.length} (${Math.round(withRole/memberInits.length*100)}%)`);
        console.log(`    With EHR: ${withEHR}/${memberInits.length} (${Math.round(withEHR/memberInits.length*100)}%)`);
        console.log(`    With Service Line: ${withServiceLine}/${memberInits.length} (${Math.round(withServiceLine/memberInits.length*100)}%)`);

        // Check is_active
        const activeCount = memberInits.filter((i: any) => i.is_active === true).length;
        const inactiveCount = memberInits.filter((i: any) => i.is_active === false).length;
        const nullActive = memberInits.filter((i: any) => i.is_active === null).length;

        console.log(`  Active Status:`);
        console.log(`    Active (is_active=true): ${activeCount}`);
        console.log(`    Inactive (is_active=false): ${inactiveCount}`);
        if (nullActive > 0) {
          console.log(`    ⚠️  NULL is_active: ${nullActive} (needs backfill)`);
        }
      }
    }

    // 4. Data Quality Issues
    console.log('\n\n⚠️  DATA QUALITY ISSUES');
    console.log('─'.repeat(80));

    const issues: string[] = [];

    // Check for initiatives with Completed/On Hold but is_active = true
    const wrongActive = initiatives?.filter(i =>
      ['Completed', 'On Hold', 'Cancelled'].includes(i.status) && i.is_active === true
    );
    if (wrongActive && wrongActive.length > 0) {
      issues.push(`${wrongActive.length} initiatives marked Completed/On Hold but is_active=true`);
      console.log(`\n❌ ${wrongActive.length} initiatives have wrong is_active flag:`);
      wrongActive.slice(0, 5).forEach(i => {
        console.log(`   - ${i.initiative_name} (${i.status}, is_active=${i.is_active})`);
      });
    }

    // Check for missing critical fields
    const missingRole = initiatives?.filter(i => !i.role);
    if (missingRole && missingRole.length > 0) {
      issues.push(`${missingRole.length} initiatives missing Role field`);
    }

    const missingEHR = initiatives?.filter(i => !i.ehrs_impacted);
    if (missingEHR && missingEHR.length > 0) {
      issues.push(`${missingEHR.length} initiatives missing EHRs Impacted field`);
    }

    const missingServiceLine = initiatives?.filter(i => !i.service_line);
    if (missingServiceLine && missingServiceLine.length > 0) {
      issues.push(`${missingServiceLine.length} initiatives missing Service Line field`);
    }

    // Check for work_type_summary vs total_assignments mismatch
    if (workTypeSummary && teamMembers) {
      teamMembers.forEach(member => {
        const summary = workTypeSummary
          .filter(wt => wt.team_member_id === member.id)
          .reduce((sum, wt) => sum + wt.count, 0);

        if (summary !== member.total_assignments) {
          issues.push(`${member.name}: work_type_summary total (${summary}) ≠ total_assignments (${member.total_assignments})`);
        }
      });
    }

    if (issues.length === 0) {
      console.log('\n✅ No data quality issues found!');
    } else {
      console.log(`\nFound ${issues.length} issues:`);
      issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
    }

    // 5. Summary
    console.log('\n\n' + '='.repeat(80));
    console.log('DASHBOARD DATA SUMMARY');
    console.log('='.repeat(80));
    console.log(`Team Members: ${teamMembers?.length || 0}`);
    console.log(`Total Initiatives: ${initiatives?.length || 0}`);
    console.log(`  - Active/Planning/Scaling: ${initiatives?.filter(i => i.is_active === true).length || 0}`);
    console.log(`  - Completed/On Hold: ${initiatives?.filter(i => i.is_active === false).length || 0}`);
    console.log(`Work Type Summary Entries: ${workTypeSummary?.length || 0}`);
    console.log(`Data Quality Issues: ${issues.length}`);

    // 6. Recommendations
    console.log('\n\n📋 RECOMMENDATIONS');
    console.log('─'.repeat(80));

    if (issues.length > 0) {
      console.log('\n1. Fix data quality issues identified above');
    }

    const missingPhase = initiatives?.filter(i => !i.phase).length || 0;
    const missingEffort = initiatives?.filter(i => !i.work_effort).length || 0;

    if (missingPhase > 0 || missingEffort > 0) {
      console.log(`\n2. Populate new fields for existing initiatives:`);
      console.log(`   - ${missingPhase} initiatives missing Phase`);
      console.log(`   - ${missingEffort} initiatives missing Work Effort`);
    }

    console.log('\n3. Continue with Quick Wins implementation:');
    console.log('   - Add status-based tabs (Active/Completed filtering)');
    console.log('   - Add phase/effort badges to cards');
    console.log('   - Filter overview by active initiatives only');

    console.log('\n' + '='.repeat(80));
    console.log('AUDIT COMPLETE');
    console.log('='.repeat(80));

  } catch (error: any) {
    console.error('\n❌ Unexpected error:', error.message);
  }
}

auditDashboardData();
