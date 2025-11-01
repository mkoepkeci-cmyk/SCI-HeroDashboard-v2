import Excel from 'exceljs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkDawnExcel() {
  const excelPath = path.join(__dirname, '..', 'documents', 'SCI Workload Tracker - New System.xlsx');

  const workbook = new Excel.Workbook();
  await workbook.xlsx.readFile(excelPath);

  const dashboard = workbook.getWorksheet('Dashboard');
  if (!dashboard) {
    console.error('Dashboard sheet not found');
    process.exit(1);
  }

  console.log('Dashboard Tab - Dawn\'s Data:');
  console.log('='.repeat(60));

  // Find Dawn's row
  dashboard.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      console.log('Headers:');
      for (let i = 1; i <= 7; i++) {
        const cell = row.getCell(i);
        console.log(`  Column ${String.fromCharCode(64 + i)}: ${cell.value}`);
      }
      console.log('');
      return;
    }

    const nameCell = row.getCell(1);
    if (nameCell.value && nameCell.value.toString().trim() === 'Dawn') {
      console.log(`Found Dawn in row ${rowNumber}`);
      console.log('');
      console.log('Column A (Name):', row.getCell(1).value);
      console.log('Column B (Total Assignments):', row.getCell(2).value);
      console.log('Column C (Active Assignments):', row.getCell(3).value);
      console.log('Column D (Active hrs/wk):', row.getCell(4).value);
      console.log('Column E (Available hrs):', row.getCell(5).value);
      console.log('Column F (%):', row.getCell(6).value);
      console.log('Column G (Capacity):', row.getCell(7).value);
    }
  });

  process.exit(0);
}

checkDawnExcel();
