import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAbridgeDuplicates() {
  console.log('Checking for Abridge initiative duplicates...\n');

  // Find all Abridge initiatives
  const { data: initiatives, error: initiativesError } = await supabase
    .from('initiatives')
    .select('*')
    .ilike('initiative_name', '%abridge%');

  if (initiativesError) {
    console.error('Error fetching initiatives:', initiativesError);
    return;
  }

  console.log(`Found ${initiatives?.length || 0} Abridge initiatives:\n`);

  if (initiatives) {
    for (const initiative of initiatives) {
      console.log(`- ID: ${initiative.id}`);
      console.log(`  Name: ${initiative.initiative_name}`);
      console.log(`  Owner: ${initiative.owner_name}`);
      console.log(`  Type: ${initiative.type}`);
      console.log(`  Status: ${initiative.status}`);
      console.log(`  Created: ${new Date(initiative.created_at).toLocaleString()}`);
      console.log(`  Updated: ${new Date(initiative.updated_at).toLocaleString()}`);
      console.log('');
    }

    // Check for metrics
    const initiativeIds = initiatives.map(i => i.id);
    const { data: metrics, error: metricsError } = await supabase
      .from('initiative_metrics')
      .select('*')
      .in('initiative_id', initiativeIds)
      .order('initiative_id')
      .order('display_order');

    if (metricsError) {
      console.error('Error fetching metrics:', metricsError);
      return;
    }

    console.log(`\nFound ${metrics?.length || 0} total metrics across all Abridge initiatives:\n`);

    if (metrics) {
      const metricsByInitiative: { [key: string]: any[] } = {};

      for (const metric of metrics) {
        if (!metricsByInitiative[metric.initiative_id]) {
          metricsByInitiative[metric.initiative_id] = [];
        }
        metricsByInitiative[metric.initiative_id].push(metric);
      }

      for (const [initiativeId, initiativeMetrics] of Object.entries(metricsByInitiative)) {
        const initiative = initiatives.find(i => i.id === initiativeId);
        console.log(`Initiative: ${initiative?.initiative_name} (ID: ${initiativeId})`);
        console.log(`  ${initiativeMetrics.length} metrics:`);
        for (const metric of initiativeMetrics) {
          console.log(`    - ${metric.metric_name} (${metric.metric_type}) - Order: ${metric.display_order}`);
        }
        console.log('');
      }

      // Check for duplicate metrics (same metric_name within same initiative)
      console.log('\nChecking for duplicate metrics within initiatives:');
      let foundDuplicates = false;

      for (const [initiativeId, initiativeMetrics] of Object.entries(metricsByInitiative)) {
        const metricNames: { [key: string]: number } = {};

        for (const metric of initiativeMetrics) {
          if (metricNames[metric.metric_name]) {
            metricNames[metric.metric_name]++;
          } else {
            metricNames[metric.metric_name] = 1;
          }
        }

        const duplicates = Object.entries(metricNames).filter(([_, count]) => count > 1);

        if (duplicates.length > 0) {
          foundDuplicates = true;
          const initiative = initiatives.find(i => i.id === initiativeId);
          console.log(`\n⚠️  DUPLICATES FOUND in "${initiative?.initiative_name}" (ID: ${initiativeId}):`);
          for (const [metricName, count] of duplicates) {
            console.log(`   - "${metricName}" appears ${count} times`);
          }
        }
      }

      if (!foundDuplicates) {
        console.log('\n✅ No duplicate metrics found within individual initiatives.');
      }
    }

    // Check for duplicate initiatives (same name)
    console.log('\n\nChecking for duplicate initiative records:');
    const initiativeNames: { [key: string]: any[] } = {};

    for (const initiative of initiatives) {
      const name = initiative.initiative_name.toLowerCase().trim();
      if (!initiativeNames[name]) {
        initiativeNames[name] = [];
      }
      initiativeNames[name].push(initiative);
    }

    const duplicateInitiatives = Object.entries(initiativeNames).filter(([_, inits]) => inits.length > 1);

    if (duplicateInitiatives.length > 0) {
      console.log('\n⚠️  DUPLICATE INITIATIVES FOUND:');
      for (const [name, inits] of duplicateInitiatives) {
        console.log(`\n"${name}" appears ${inits.length} times:`);
        for (const init of inits) {
          console.log(`  - ID: ${init.id}, Created: ${new Date(init.created_at).toLocaleString()}`);
        }
      }
    } else {
      console.log('\n✅ No duplicate initiative records found.');
    }
  }
}

checkAbridgeDuplicates().catch(console.error);
