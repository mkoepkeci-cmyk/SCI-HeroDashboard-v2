import pandas as pd
import sys

# Read the Excel file
excel_file = 'documents/SCI Workload Tracker - New System.xlsx'

print(f"Reading {excel_file}...\n")

# Get all sheet names
xl_file = pd.ExcelFile(excel_file)
print(f"Sheets in file: {xl_file.sheet_names}\n")

# Check a sample SCI sheet (Josh)
sheet_name = 'Josh'
print(f"Checking sheet: {sheet_name}")
print("=" * 80)

df = pd.read_excel(excel_file, sheet_name=sheet_name)

print(f"\nTotal columns: {len(df.columns)}")
print(f"\nAll column names (A-{chr(65 + len(df.columns) - 1)}):")
for idx, col in enumerate(df.columns):
    col_letter = chr(65 + idx) if idx < 26 else f"{chr(65 + idx // 26 - 1)}{chr(65 + idx % 26)}"
    print(f"  {col_letter}: {col}")

print(f"\n\nColumns R-Y specifically (calculated fields in Excel):")
if len(df.columns) >= 25:
    for idx in range(17, min(25, len(df.columns))):  # R=17, Y=24
        col_letter = chr(65 + idx)
        col_name = df.columns[idx]
        print(f"  {col_letter}: {col_name}")
        # Show first non-null value
        first_val = df[col_name].dropna().head(1).values
        if len(first_val) > 0:
            print(f"       Example: {first_val[0]}")
else:
    print(f"  Only {len(df.columns)} columns found (need at least 25 for Y)")
