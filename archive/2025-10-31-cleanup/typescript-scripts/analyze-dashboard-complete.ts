import Excel from 'exceljs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function analyzeDashboard() {
  const excelPath = path.join(__dirname, '..', 'documents', 'SCI Workload Tracker - New System.xlsx');
  const workbook = new Excel.Workbook();
  await workbook.xlsx.readFile(excelPath);

  const dashboard = workbook.getWorksheet('Dashboard');
  if (!dashboard) {
    console.error('Dashboard sheet not found');
    process.exit(1);
  }

  console.log('COMPLETE DASHBOARD TAB ANALYSIS');
  console.log('='.repeat(80));
  console.log('');

  // Get all headers
  const headerRow = dashboard.getRow(1);
  const headers: string[] = [];

  for (let i = 1; i <= 30; i++) {
    const cell = headerRow.getCell(i);
    if (cell.value) {
      headers.push(cell.value.toString());
    } else {
      break;
    }
  }

  console.log('ALL COLUMNS IN DASHBOARD TAB:');
  console.log('-'.repeat(80));
  headers.forEach((header, index) => {
    console.log(`Column ${String.fromCharCode(65 + index)}: ${header}`);
  });

  console.log('');
  console.log(`Total Columns: ${headers.length}`);
  console.log('');

  // Show Marty and Dawn as examples
  console.log('SAMPLE DATA:');
  console.log('='.repeat(80));

  const sampleNames = ['Marty', 'Dawn'];

  dashboard.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const name = row.getCell(1).value;
    if (name && sampleNames.includes(name.toString())) {
      console.log('');
      console.log(`${name}:`);
      console.log('-'.repeat(80));
      headers.forEach((header, index) => {
        const value = row.getCell(index + 1).value;
        console.log(`  ${header}: ${value}`);
      });
    }
  });

  process.exit(0);
}

analyzeDashboard();
