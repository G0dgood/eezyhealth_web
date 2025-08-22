# Modal Components

This folder contains reusable modal components for the eezyhealth application.

## Components

### Modal
A basic modal component for displaying content with a title and close button.

**Props:**
- `isOpen: boolean` - Controls modal visibility
- `onClose: () => void` - Function called when modal is closed
- `title: string` - Modal title
- `children: React.ReactNode` - Modal content
- `size?: "sm" | "md" | "lg" | "xl"` - Modal size (default: "md")

**Usage:**
```tsx
import { Modal } from "@/components/modals";

<Modal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="Example Modal"
  size="md"
>
  <p>Modal content goes here</p>
</Modal>
```

### ConfirmationModal
A modal for confirm/delete actions with customizable styling.

**Props:**
- `isOpen: boolean` - Controls modal visibility
- `onClose: () => void` - Function called when modal is closed
- `onConfirm: () => void` - Function called when confirmed
- `title: string` - Modal title
- `message: string` - Confirmation message
- `confirmText?: string` - Confirm button text (default: "Confirm")
- `cancelText?: string` - Cancel button text (default: "Cancel")
- `variant?: "danger" | "warning" | "info"` - Modal variant (default: "info")

**Usage:**
```tsx
import { ConfirmationModal } from "@/components/modals";

<ConfirmationModal
  isOpen={isDeleteModalOpen}
  onClose={() => setIsDeleteModalOpen(false)}
  onConfirm={handleDelete}
  title="Delete Patient"
  message="Are you sure you want to delete this patient? This action cannot be undone."
  variant="danger"
  confirmText="Delete"
/>
```

### FormModal
A modal specifically designed for forms with save/cancel actions.

**Props:**
- `isOpen: boolean` - Controls modal visibility
- `onClose: () => void` - Function called when modal is closed
- `onSubmit: () => void` - Function called when form is submitted
- `title: string` - Modal title
- `children: React.ReactNode` - Form content
- `submitText?: string` - Submit button text (default: "Save")
- `cancelText?: string` - Cancel button text (default: "Cancel")
- `size?: "sm" | "md" | "lg" | "xl"` - Modal size (default: "md")
- `isLoading?: boolean` - Shows loading state on submit button

**Usage:**
```tsx
import { FormModal } from "@/components/modals";

<FormModal
  isOpen={isFormModalOpen}
  onClose={() => setIsFormModalOpen(false)}
  onSubmit={handleSubmit}
  title="Add New Patient"
  size="lg"
  isLoading={isSubmitting}
>
  <form>
    {/* Form fields */}
  </form>
</FormModal>
```

## Importing

You can import individual components:
```tsx
import { Modal } from "@/components/modals/Modal";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import { FormModal } from "@/components/modals/FormModal";
```

Or import from the index file:
```tsx
import { Modal, ConfirmationModal, FormModal } from "@/components/modals";
```

## Styling

All modals use Tailwind CSS classes and follow the application's design system:
- Consistent spacing and typography
- Responsive design
- Accessible focus states
- Smooth transitions and animations
- Z-index management for proper layering

## Accessibility

- Proper ARIA attributes
- Keyboard navigation support
- Focus management
- Screen reader compatibility
- Click outside to close functionality
