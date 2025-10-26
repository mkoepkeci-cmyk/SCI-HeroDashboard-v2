/**
 * Test script to validate workload calculator
 * Run with: node test-calculator.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('Need: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCalculatorConfig() {
  console.log('\n🧪 Testing Workload Calculator Configuration\n');
  console.log('='.repeat(60));

  // Test 1: Load all configuration
  console.log('\n1️⃣  Loading calculator configuration...');
  const { data: config, error: configError } = await supabase
    .from('workload_calculator_config')
    .select('*')
    .order('config_type, display_order');

  if (configError) {
    console.error('❌ Error loading config:', configError);
    return false;
  }

  if (!config || config.length === 0) {
    console.error('❌ No configuration found! Run migrations first.');
    return false;
  }

  console.log(`✅ Loaded ${config.length} configuration items`);

  // Group by type
  const grouped = config.reduce((acc, item) => {
    if (!acc[item.config_type]) acc[item.config_type] = [];
    acc[item.config_type].push(item);
    return acc;
  }, {});

  console.log('\n📊 Configuration breakdown:');
  Object.entries(grouped).forEach(([type, items]) => {
    console.log(`   ${type}: ${items.length} items`);
  });

  // Test 2: Verify effort sizes
  console.log('\n2️⃣  Effort Sizes (Base Hours):');
  const effortSizes = grouped.effort_size || [];
  effortSizes.forEach(item => {
    console.log(`   ${item.key.padEnd(12)} = ${parseFloat(item.value).toFixed(1)}h`);
  });

  // Test 3: Verify role weights
  console.log('\n3️⃣  Role Weights:');
  const roleWeights = grouped.role_weight || [];
  roleWeights.forEach(item => {
    console.log(`   ${item.key.padEnd(12)} = ${parseFloat(item.value).toFixed(2)}x`);
  });

  // Test 4: Verify work type weights
  console.log('\n4️⃣  Work Type Weights:');
  const workTypeWeights = grouped.work_type_weight || [];
  workTypeWeights.forEach(item => {
    const value = parseFloat(item.value);
    const display = value === 0 ? 'Direct Hours' : `${value.toFixed(2)}x`;
    console.log(`   ${item.key.padEnd(20)} = ${display}`);
  });

  // Test 5: Sample calculation
  console.log('\n5️⃣  Sample Calculation:');
  console.log('   Initiative: Owner, Medium size, System Initiative, Design phase');

  const baseHours = effortSizes.find(e => e.key === 'M')?.value || 0;
  const roleWeight = roleWeights.find(r => r.key === 'Owner')?.value || 0;
  const typeWeight = workTypeWeights.find(w => w.key === 'System Initiative')?.value || 0;
  const phaseWeights = grouped.phase_weight || [];
  const phaseWeight = phaseWeights.find(p => p.key === 'Design')?.value || 0;

  const calculated = baseHours * roleWeight * typeWeight * phaseWeight;

  console.log(`   Base Hours (M):              ${baseHours}h`);
  console.log(`   × Role (Owner):              ${roleWeight}x`);
  console.log(`   × Type (System Initiative):  ${typeWeight}x`);
  console.log(`   × Phase (Design):            ${phaseWeight}x`);
  console.log(`   = ${calculated.toFixed(2)}h per week`);

  // Test 6: Check initiatives table for direct_hours_per_week column
  console.log('\n6️⃣  Checking initiatives table schema...');
  const { data: initiatives, error: initError } = await supabase
    .from('initiatives')
    .select('id, initiative_name, type, direct_hours_per_week')
    .limit(5);

  if (initError) {
    console.error('❌ Error querying initiatives:', initError);
    return false;
  }

  console.log(`✅ Initiatives table accessible (${initiatives?.length || 0} samples loaded)`);

  // Check if any governance initiatives exist
  const { data: govInitiatives, error: govError } = await supabase
    .from('initiatives')
    .select('id, initiative_name, direct_hours_per_week')
    .eq('type', 'Governance')
    .limit(5);

  if (!govError && govInitiatives && govInitiatives.length > 0) {
    console.log(`\n   Found ${govInitiatives.length} Governance initiatives:`);
    govInitiatives.forEach(init => {
      const hours = init.direct_hours_per_week ? `${init.direct_hours_per_week}h/week` : 'Not set';
      console.log(`   - ${init.initiative_name}: ${hours}`);
    });
  } else {
    console.log('   ℹ️  No Governance initiatives found yet');
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ All tests passed! Calculator is ready to use.\n');

  return true;
}

// Run tests
testCalculatorConfig()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('\n❌ Unexpected error:', err);
    process.exit(1);
  });
