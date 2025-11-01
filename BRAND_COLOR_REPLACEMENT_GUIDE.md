# Brand Color Replacement Guide

## Overview
This guide documents the replacement of hardcoded brand colors with CSS variables to enable dynamic theming.

## Color Mappings

### Old Colors → New Tailwind Classes

| Old Color | Context | New Tailwind Class | CSS Variable |
|-----------|---------|-------------------|--------------|
| `#9B2F6A` | Primary buttons, headers | `bg-brand` | `var(--primary-brand-color)` |
| `#9B2F6A` | Text color | `text-brand` | `var(--primary-brand-color)` |
| `#9B2F6A` | Border color | `border-brand` | `var(--primary-brand-color)` |
| `#7d2555` | Hover states (darker) | `bg-brand-dark` or `hover:bg-brand-dark` | `var(--primary-brand-color-dark)` |
| `bg-pink-50` | Selected tab backgrounds (soft) | `bg-brand-soft` | `var(--primary-brand-color-soft)` |

## Replacement Patterns

### Pattern 1: Background Colors
```tsx
// Old
className="bg-[#9B2F6A]"

// New
className="bg-brand"
```

### Pattern 2: Hover States
```tsx
// Old
className="bg-[#9B2F6A] hover:bg-[#7d2555]"

// New
className="bg-brand hover:bg-brand-dark"
```

### Pattern 3: Selected/Active States
```tsx
// Old
className={`${isActive ? 'bg-[#9B2F6A] text-white' : 'bg-gray-100'}`}

// New
className={`${isActive ? 'bg-brand text-white' : 'bg-gray-100'}`}
```

### Pattern 4: Soft Highlights (Tab Backgrounds)
```tsx
// Old
className={`${isActive ? 'border-[#9B2F6A] text-[#9B2F6A] bg-pink-50' : '...'}`}

// New
className={`${isActive ? 'border-brand text-brand bg-brand-soft' : '...'}`}
```

### Pattern 5: Text and Icons
```tsx
// Old
<Settings className="w-6 h-6 text-[#9B2F6A]" />

// New
<Settings className="w-6 h-6 text-brand" />
```

### Pattern 6: Focus Rings
```tsx
// Old
className="focus:ring-[#9B2F6A] focus:border-transparent"

// New
className="focus:ring-brand focus:border-transparent"
```

## Files to Update

Run this command to find all instances:
```bash
grep -r "#9B2F6A\|#7d2555\|#b04a85" src/components/ --include="*.tsx"
```

### Key Components (108 total instances):
- AdminTabContainer.tsx
- ApplicationSettings.tsx
- FieldOptionsSettings.tsx
- TeamManagementPanel.tsx
- ManagersPanel.tsx
- WorkloadCalculatorSettings.tsx
- GovernancePortalView.tsx
- InitiativeModal.tsx
- UnifiedWorkItemForm.tsx
- TeamCapacityView.tsx
- And many more...

## Testing Checklist

After replacements, test these views:
- [ ] Landing page (hero cards, buttons)
- [ ] Dashboard (navigation tabs, active states)
- [ ] Admin panel (all sub-tabs)
- [ ] Team Management (buttons, modals)
- [ ] Governance Portal (headers, buttons)
- [ ] Browse Initiatives (filters, badges)
- [ ] My Effort (headers, selected states)

## Notes

- The `useBrandColor()` hook loads the color from `application_config` table
- CSS variables are auto-updated when config changes
- Tailwind classes `bg-brand`, `text-brand`, etc. reference the CSS variables
- Page refresh may be needed for some components to pick up color changes
