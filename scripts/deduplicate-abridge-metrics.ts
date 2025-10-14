import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function deduplicateAbridgeMetrics() {
  console.log('Deduplicating Abridge metrics...\n');

  const initiativeId = '5a8c9e83-3cf9-4120-9f59-a7ac84f1c6e4'; // Abridge AI Pilot

  // Get all metrics for this initiative
  const { data: metrics, error: metricsError } = await supabase
    .from('initiative_metrics')
    .select('*')
    .eq('initiative_id', initiativeId)
    .order('created_at', { ascending: true }); // Keep oldest first

  if (metricsError) {
    console.error('Error fetching metrics:', metricsError);
    return;
  }

  console.log(`Found ${metrics?.length || 0} metrics for Abridge AI Pilot\n`);

  if (!metrics || metrics.length === 0) {
    console.log('No metrics to deduplicate');
    return;
  }

  // Group metrics by metric_name
  const metricGroups: { [key: string]: any[] } = {};

  for (const metric of metrics) {
    if (!metricGroups[metric.metric_name]) {
      metricGroups[metric.metric_name] = [];
    }
    metricGroups[metric.metric_name].push(metric);
  }

  console.log('Metrics grouped by name:');
  for (const [name, group] of Object.entries(metricGroups)) {
    console.log(`  - ${name}: ${group.length} entries`);
  }
  console.log('');

  // For each group, keep only the most recent (last created) entry
  const metricsToKeep: string[] = [];
  const metricsToDelete: string[] = [];

  for (const [name, group] of Object.entries(metricGroups)) {
    if (group.length > 1) {
      // Sort by created_at descending to get the most recent
      const sorted = [...group].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      // Keep the most recent one
      metricsToKeep.push(sorted[0].id);

      // Delete all others
      for (let i = 1; i < sorted.length; i++) {
        metricsToDelete.push(sorted[i].id);
      }

      console.log(`${name}:`);
      console.log(`  ✅ Keeping: ${sorted[0].id} (${new Date(sorted[0].created_at).toLocaleString()})`);
      console.log(`  🗑️  Deleting ${sorted.length - 1} duplicates`);
    } else {
      // Only one entry, keep it
      metricsToKeep.push(group[0].id);
      console.log(`${name}:`);
      console.log(`  ✅ Keeping: ${group[0].id} (only one entry)`);
    }
  }

  console.log(`\n\nSummary:`);
  console.log(`  Total metrics: ${metrics.length}`);
  console.log(`  Unique metrics to keep: ${metricsToKeep.length}`);
  console.log(`  Duplicates to delete: ${metricsToDelete.length}`);

  if (metricsToDelete.length === 0) {
    console.log('\n✅ No duplicates to remove!');
    return;
  }

  console.log('\n⚠️  About to delete duplicates...');

  // Delete duplicates
  const { error: deleteError } = await supabase
    .from('initiative_metrics')
    .delete()
    .in('id', metricsToDelete);

  if (deleteError) {
    console.error('\n❌ Error deleting duplicates:', deleteError);
    return;
  }

  console.log(`\n✅ Successfully deleted ${metricsToDelete.length} duplicate metrics!`);

  // Update display_order for remaining metrics
  console.log('\nUpdating display_order for remaining metrics...');

  const { data: remainingMetrics, error: fetchError } = await supabase
    .from('initiative_metrics')
    .select('*')
    .eq('initiative_id', initiativeId)
    .order('metric_name', { ascending: true });

  if (fetchError) {
    console.error('Error fetching remaining metrics:', fetchError);
    return;
  }

  if (remainingMetrics) {
    for (let i = 0; i < remainingMetrics.length; i++) {
      const { error: updateError } = await supabase
        .from('initiative_metrics')
        .update({ display_order: i })
        .eq('id', remainingMetrics[i].id);

      if (updateError) {
        console.error(`Error updating display_order for ${remainingMetrics[i].metric_name}:`, updateError);
      }
    }

    console.log(`✅ Updated display_order for ${remainingMetrics.length} metrics`);

    console.log('\nFinal metrics:');
    for (let i = 0; i < remainingMetrics.length; i++) {
      console.log(`  ${i}. ${remainingMetrics[i].metric_name} (${remainingMetrics[i].metric_type})`);
    }
  }

  console.log('\n✅ Deduplication complete!');
}

deduplicateAbridgeMetrics().catch(console.error);
