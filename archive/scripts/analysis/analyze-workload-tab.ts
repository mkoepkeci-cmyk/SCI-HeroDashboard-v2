import XLSX from 'xlsx';

const filePath = './documents/SCI Workload Tracker - New System (3).xlsx';

// Read the Excel file
const workbook = XLSX.readFile(filePath);

console.log('='.repeat(80));
console.log('DETAILED WORKLOAD TAB ANALYSIS');
console.log('='.repeat(80));

// Get the Workload sheet
const workloadSheet = workbook.Sheets['Workload'];
const workloadData = XLSX.utils.sheet_to_json(workloadSheet, { header: 1 });

console.log('\n📊 WORKLOAD TAB STRUCTURE:\n');

// Get all headers from first row
const headers = workloadData[0] as any[];
console.log('Columns found:');
headers.forEach((header, index) => {
  if (header) {
    console.log(`  ${String(index + 1).padStart(2, ' ')}. ${header}`);
  }
});

console.log('\n' + '='.repeat(80));
console.log('TEAM MEMBER WORKLOAD DATA');
console.log('='.repeat(80));

// Display all team member rows
for (let i = 2; i < Math.min(25, workloadData.length); i++) {
  const row = workloadData[i] as any[];

  if (row && row[0]) {
    console.log(`\n${'-'.repeat(80)}`);
    console.log(`TEAM MEMBER: ${row[0]}`);
    console.log('-'.repeat(80));

    headers.forEach((header, colIndex) => {
      if (header && row[colIndex] !== undefined && row[colIndex] !== '') {
        console.log(`  ${header}: ${row[colIndex]}`);
      }
    });
  }
}

console.log('\n\n' + '='.repeat(80));
console.log('HOW WORKLOAD IS CALCULATED TAB');
console.log('='.repeat(80));

// Get the calculation methodology sheet
const calcSheet = workbook.Sheets['How Workload is Calculated'];
const calcData = XLSX.utils.sheet_to_json(calcSheet, { header: 1 });

console.log('\nWorkload Calculation Methodology:\n');

for (let i = 0; i < Math.min(50, calcData.length); i++) {
  const row = calcData[i] as any[];
  if (row && row[0]) {
    console.log(row[0]);
  }
}

console.log('\n\n' + '='.repeat(80));
console.log('KEY NEW COLUMNS SUMMARY');
console.log('='.repeat(80));

console.log(`
Based on the analysis:

NEW COLUMNS IN INDIVIDUAL SCI TABS:
✅ Role Multiplier (Column 18)
✅ Work Type Weight (Column 19)
✅ Phase Weight (Column 20)
✅ Base Hrs/Wk (Column 21)
✅ Active Hrs/Wk (Column 22) - CRITICAL: This is the weighted workload calculation
✅ Active (Column 23) - Yes/No status
✅ Missing Data (Column 24) - Data quality check

FORMULA OBSERVED:
Active Hrs/Wk = Base Hrs/Wk × Role Multiplier × Work Type Weight × Phase Weight

EXAMPLES:
- Ashley Row 1: 1.5 (base) × 0.5 (Secondary) × 1 (System Init) × 1 (Design) = 0.75 hrs/wk
- Ashley Row 2: 15 (base) × 1 (Owner) × 1 (System Init) × 0.25 (Did we Deliver) × 0 (Complete) = 0 hrs/wk
- Josh Row 3: 15 (base) × 1 (Co-Owner) × 1 (System Init) × 0.25 (Did we Deliver) = 3.75 hrs/wk

PHASE WEIGHTS:
- Discovery/Define: 0.3
- Design: 1.0
- Deploy: 1.0
- Did we Deliver: 0.25
- N/A: 1.0
- On Hold: 0 (when status is On Hold or Complete)

ROLE MULTIPLIERS:
- Owner/Co-Owner: 1.0
- Secondary: 0.5
- Support: (varies)

WORK TYPE WEIGHTS:
- System Initiative: 1.0
- Epic Gold: 1.0
- System Project: 1.0
- Governance: 0.7
- General Support: 1.0
- Policy: 0.5
`);
