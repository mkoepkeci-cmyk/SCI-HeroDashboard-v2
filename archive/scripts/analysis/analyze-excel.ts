import XLSX from 'xlsx';
import * as fs from 'fs';

const filePath = './documents/SCI Workload Tracker - New System (3).xlsx';

// Read the Excel file
const workbook = XLSX.readFile(filePath);

console.log('='.repeat(80));
console.log('EXCEL FILE ANALYSIS: SCI Workload Tracker - New System (3)');
console.log('='.repeat(80));
console.log('\n📊 AVAILABLE TABS:\n');

workbook.SheetNames.forEach((sheetName, index) => {
  console.log(`${index + 1}. ${sheetName}`);
});

console.log('\n' + '='.repeat(80));

// Analyze each sheet
workbook.SheetNames.forEach((sheetName) => {
  console.log(`\n\n${'*'.repeat(80)}`);
  console.log(`TAB: ${sheetName}`);
  console.log('*'.repeat(80));

  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  if (data.length === 0) {
    console.log('  (Empty sheet)');
    return;
  }

  // Get headers (first row)
  const headers = data[0] as any[];
  console.log('\n📋 COLUMNS:');
  headers.forEach((header, index) => {
    if (header) {
      console.log(`  ${index + 1}. ${header}`);
    }
  });

  // Show row count
  console.log(`\n📊 DATA ROWS: ${data.length - 1} (excluding header)`);

  // If this is the Workload tab, show more details
  if (sheetName.toLowerCase().includes('workload')) {
    console.log('\n🔍 WORKLOAD TAB DETAILS:');
    console.log('\nFirst 5 data rows:');
    for (let i = 1; i < Math.min(6, data.length); i++) {
      console.log(`\nRow ${i}:`);
      const row = data[i] as any[];
      headers.forEach((header, colIndex) => {
        if (header && row[colIndex] !== undefined && row[colIndex] !== '') {
          console.log(`  ${header}: ${row[colIndex]}`);
        }
      });
    }
  }

  // For individual SCI tabs, show structure
  if (sheetName !== 'Workload' && data.length > 1) {
    console.log('\n🔍 SAMPLE DATA (First 3 rows):');

    // Look for weighted value and active status columns
    const weightedColIndex = headers.findIndex(h =>
      h && h.toString().toLowerCase().includes('weighted')
    );
    const activeColIndex = headers.findIndex(h =>
      h && h.toString().toLowerCase().includes('active')
    );

    if (weightedColIndex >= 0) {
      console.log(`\n✅ Found "Weighted" column at position ${weightedColIndex + 1}`);
    }
    if (activeColIndex >= 0) {
      console.log(`✅ Found "Active" column at position ${activeColIndex + 1}`);
    }

    for (let i = 1; i < Math.min(4, data.length); i++) {
      console.log(`\n  Row ${i}:`);
      const row = data[i] as any[];
      headers.forEach((header, colIndex) => {
        if (header && row[colIndex] !== undefined && row[colIndex] !== '') {
          // Highlight weighted and active columns
          const prefix = (colIndex === weightedColIndex || colIndex === activeColIndex) ? '    ⭐ ' : '      ';
          console.log(`${prefix}${header}: ${row[colIndex]}`);
        }
      });
    }
  }
});

console.log('\n\n' + '='.repeat(80));
console.log('ANALYSIS COMPLETE');
console.log('='.repeat(80));
