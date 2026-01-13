# Advanced Frontend Components & Hooks Documentation

This document explains the usage of complex components and hooks in the application.

## Components

### UniversalSelector
`@/features/UniversalSelect`

A versatile dropdown component that supports multiple selection modes (e.g., specifications).

**Props:**
- `mode`: `"specification"` | ... (Determines what data to fetch/display)
- `onSelect`: `(ids: number[], names: string[]) => void` (Callback with selected items)
- `valueIds`: `number[]` (Controlled value for pre-selection)

**Usage Example:**
```tsx
<UniversalSelector
  mode="specification"
  valueIds={formData.specificationIds}
  onSelect={(ids, names) => handleSpecificationsChange(ids, names)}
/>
```

### ProductCard
`@/components/ProductCard`

Displays product information in a grid or list view. Supports different modes (`display`, `admin`, etc.).

**Props:**
- `product`: `Product` object.
- `mode`: String indicating valid display mode (e.g., "display").

## Hooks

### useAuth
`@/components/AuthProvider`

Provides access to the current user's authentication state and profile.

**Returns:**
- `user`: The current `Gebruiker` object or `null`.
- `refreshUser`: Function to re-fetch user data.
- `login` / `logout`: Methods to manage session.

**Usage:**
```tsx
const { user, refreshUser } = useAuth();
if (user) {
  console.log("Logged in as:", user.naam);
}
```
