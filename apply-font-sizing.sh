#!/bin/bash
# Script to apply Dashboard compact font sizing across all components
# This script uses sed to replace font size patterns systematically

FILES=(
  "src/components/WorkloadDashboard.tsx"
  "src/components/TeamCapacityView.tsx"
  "src/components/GovernancePortalView.tsx"
  "src/components/GovernanceRequestDetail.tsx"
  "src/components/GovernanceRequestForm.tsx"
  "src/components/InitiativeCard.tsx"
  "src/components/InitiativeModal.tsx"
  "src/components/InitiativesView.tsx"
  "src/components/InitiativesTableView.tsx"
  "src/components/StaffDetailModal.tsx"
  "src/components/ReassignModal.tsx"
  "src/components/EffortLogModal.tsx"
  "src/components/LoadBalanceModal.tsx"
  "src/components/SCIRequestsCard.tsx"
  "src/components/AdminTabContainer.tsx"
  "src/components/TeamManagementPanel.tsx"
  "src/components/ManagersPanel.tsx"
  "src/components/WorkloadCalculatorSettings.tsx"
  "src/components/InsightsChat.tsx"
  "src/components/LandingPage.tsx"
  "src/components/EffortTrackingView.tsx"
  "src/components/UnifiedWorkItemForm.tsx"
  "src/components/UnifiedWorkItemForm/Tab4Content.tsx"
  "src/components/OtherWorkForm.tsx"
  "src/components/OtherWorkForm/AssignmentTab.tsx"
  "src/components/OtherWorkForm/CollaborationTab.tsx"
  "src/components/UnassignedWorkView.tsx"
  "src/components/CapacityGauge.tsx"
  "src/components/CompletionIndicator.tsx"
)

echo "Applying Dashboard compact font sizing to ${#FILES[@]} files..."

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing: $file"

    # Backup original
    cp "$file" "${file}.bak"

    # Apply replacements for HEADERS (not metric values)
    # Replace text-2xl with text-lg for page headers (not values)
    sed -i 's/className="\([^"]*\)text-2xl font-bold\([^"]*\)">\([^<]*[A-Za-z][^<]*\)</className="\1text-lg font-semibold\2">\3</g' "$file"

    # Replace text-xl with text-sm for section headers (not values)
    sed -i 's/className="\([^"]*\)text-xl font-semibold/className="\1text-sm font-semibold/g' "$file"
    sed -i 's/className="\([^"]*\)text-xl font-bold\([^"]*\)">\([^0-9$][^<]*\)</className="\1text-sm font-semibold\2">\3</g' "$file"

    # Replace text-lg with text-sm for subsection headers (not values)
    sed -i 's/className="\([^"]*\)text-lg font-semibold/className="\1text-sm font-semibold/g' "$file"
    sed -i 's/className="\([^"]*\)text-lg font-bold\([^"]*\)">\([^0-9$%][^<]*\)</className="\1text-sm font-semibold\2">\3</g' "$file"

    # Replace text-base with text-sm for body text and normal headers
    sed -i 's/text-base font-medium/text-xs font-medium/g' "$file"
    sed -i 's/text-base"/text-sm"/g' "$file"
    sed -i 's/text-base /text-sm /g' "$file"

    echo "  ✓ Updated $file"
  else
    echo "  ✗ File not found: $file"
  fi
done

echo ""
echo "Font sizing updates complete!"
echo "Backup files created with .bak extension"
echo ""
echo "To verify changes, run: git diff src/components/"
echo "To remove backups: find src/components -name '*.bak' -delete"
