import pandas as pd
import sys

# Read the Excel file
excel_file = 'documents/SCI Workload Tracker - New System.xlsx'

print(f"Reading Dashboard tab from {excel_file}...\n")

# Read Dashboard sheet
df = pd.read_excel(excel_file, sheet_name='Dashboard')

print(f"Dashboard tab dimensions: {df.shape[0]} rows x {df.shape[1]} columns")
print(f"\nAll column names (A-{chr(65 + len(df.columns) - 1) if len(df.columns) <= 26 else 'Z+'}):")
print("=" * 80)

for idx, col in enumerate(df.columns):
    if idx < 26:
        col_letter = chr(65 + idx)
    else:
        col_letter = f"{chr(65 + (idx // 26) - 1)}{chr(65 + (idx % 26))}"

    # Count non-null values
    non_null = df[col].notna().sum()

    print(f"  {col_letter:3s}: {str(col):50s} ({non_null} non-null values)")

print("\n" + "=" * 80)
print("\nFirst 5 rows (transposed for readability):")
print("=" * 80)

# Show first 5 rows with SCI names
for idx in range(min(5, len(df))):
    sci_name = df.iloc[idx, 0] if pd.notna(df.iloc[idx, 0]) else "N/A"
    print(f"\nRow {idx + 1}: {sci_name}")
    for col_idx, col_name in enumerate(df.columns[:10]):  # First 10 columns
        val = df.iloc[idx, col_idx]
        if pd.notna(val):
            print(f"  {col_name}: {val}")

print("\n" + "=" * 80)
print("\nColumns G onwards (capacity status and work type breakdowns):")
print("=" * 80)

# Show columns from G onwards
for idx, col in enumerate(df.columns):
    if idx >= 6:  # G is column 6 (0-indexed)
        col_letter = chr(65 + idx) if idx < 26 else f"{chr(65 + (idx // 26) - 1)}{chr(65 + (idx % 26))}"
        sample_val = df[col].dropna().iloc[0] if len(df[col].dropna()) > 0 else "N/A"
        print(f"  {col_letter:3s}: {str(col):50s}")
        print(f"       Example: {sample_val}")
