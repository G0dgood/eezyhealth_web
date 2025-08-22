# Toast Utilities

This folder contains utility functions for showing toast notifications using Sonner.

## Installation

Sonner is already installed in the project:
```bash
npm install sonner
```

## Basic Usage

### Import the toast function directly
```tsx
import { toast } from "sonner";

// Success toast
toast.success("Success message");

// Error toast
toast.error("Error message");

// Warning toast
toast.warning("Warning message");

// Info toast
toast.info("Info message");

// Basic toast
toast("Basic message");
```

### Import utility functions
```tsx
import { showSuccess, showError, showWarning, showInfo } from "@/utils/toast";

showSuccess("Patient Saved", "Patient information has been saved successfully");
showError("Save Failed", "Failed to save. Please try again.");
showWarning("Appointment Conflict", "This time slot conflicts with an existing appointment");
showInfo("System Update", "New features are available");
```

## Available Utility Functions

### Success Notifications
- `showSuccess(title, description?)` - Show success toast
- `showPatientSaved()` - Pre-configured patient saved message
- `showAppointmentBooked()` - Pre-configured appointment booked message
- `showVitalsRecorded()` - Pre-configured vitals recorded message
- `showReportGenerated()` - Pre-configured report generated message

### Error Notifications
- `showError(title, description?)` - Show error toast
- `showSaveError()` - Pre-configured save error message
- `showNetworkError()` - Pre-configured network error message
- `showValidationError()` - Pre-configured validation error message

### Warning Notifications
- `showWarning(title, description?)` - Show warning toast
- `showUnsavedChanges()` - Pre-configured unsaved changes message
- `showAppointmentConflict()` - Pre-configured appointment conflict message

### Info Notifications
- `showInfo(title, description?)` - Show info toast
- `showSystemUpdate()` - Pre-configured system update message
- `showMaintenance()` - Pre-configured maintenance notice message

### Loading States
- `showLoading(title)` - Show loading toast, returns toast ID
- `dismissLoading(toastId)` - Dismiss loading toast by ID

### Promise-based Notifications
```tsx
import { showPromise } from "@/utils/toast";

const savePromise = savePatientData();

showPromise(savePromise, {
  loading: "Saving patient...",
  success: "Patient saved successfully!",
  error: "Failed to save patient",
});
```

### Custom Toast with Actions
```tsx
import { showActionToast } from "@/utils/toast";

showActionToast(
  "Unsaved Changes",
  "You have unsaved changes. Do you want to save them?",
  {
    label: "Save Now",
    onClick: () => handleSave(),
  }
);
```

## Toast Configuration

The Sonner Toaster is configured in `src/app/layout.tsx` with these settings:

```tsx
<Toaster 
  position="top-right"    // Position on screen
  richColors             // Use rich colors
  closeButton            // Show close button
  duration={4000}        // Auto-dismiss after 4 seconds
/>
```

## Examples in Components

### Basic Success Toast
```tsx
import { showSuccess } from "@/utils/toast";

const handleSave = () => {
  try {
    // Save logic here
    showSuccess("Saved!", "Your changes have been saved successfully");
  } catch (error) {
    showError("Save Failed", "Please try again");
  }
};
```

### Loading State
```tsx
import { showLoading, dismissLoading, showSuccess } from "@/utils/toast";

const handleSubmit = async () => {
  const loadingToast = showLoading("Submitting form...");
  
  try {
    await submitForm();
    dismissLoading(loadingToast);
    showSuccess("Form submitted successfully!");
  } catch (error) {
    dismissLoading(loadingToast);
    showError("Submission failed");
  }
};
```

### Promise-based
```tsx
import { showPromise } from "@/utils/toast";

const handleDelete = () => {
  const deletePromise = deletePatient(patientId);
  
  showPromise(deletePromise, {
    loading: "Deleting patient...",
    success: "Patient deleted successfully",
    error: "Failed to delete patient",
  });
};
```

## Migration from Custom Toast System

The old custom toast system has been replaced with Sonner. Here's what changed:

### Before (Custom System)
```tsx
import { useNotifications } from "@/contexts/NotificationContext";

const { addToast } = useNotifications();
addToast({
  type: "success",
  title: "Success",
  message: "Operation completed",
  duration: 5000
});
```

### After (Sonner)
```tsx
import { toast } from "sonner";
// or
import { showSuccess } from "@/utils/toast";

toast.success("Success", { description: "Operation completed" });
// or
showSuccess("Success", "Operation completed");
```

## Benefits of Sonner

1. **Better Performance** - Optimized rendering and animations
2. **Accessibility** - Built-in ARIA support and keyboard navigation
3. **Rich Features** - Actions, promises, loading states
4. **Customization** - Easy to style and configure
5. **TypeScript** - Full type safety
6. **Bundle Size** - Smaller than custom implementation
7. **Maintenance** - Actively maintained and updated

## Styling Customization

You can customize Sonner's appearance by modifying the Toaster component in the layout:

```tsx
<Toaster 
  position="top-right"
  richColors
  closeButton
  duration={4000}
  toastOptions={{
    style: {
      background: 'var(--background)',
      color: 'var(--foreground)',
      border: '1px solid var(--border)',
    },
  }}
/>
```
