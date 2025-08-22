import { toast } from "sonner";

// Success notifications
export const showSuccess = (title: string, description?: string) => {
  toast.success(title, {
    description,
    duration: 4000,
  });
};

export const showPatientSaved = () => {
  showSuccess("Patient Saved", "Patient information has been saved successfully");
};

export const showAppointmentBooked = () => {
  showSuccess("Appointment Booked", "Appointment has been scheduled successfully");
};

export const showVitalsRecorded = () => {
  showSuccess("Vitals Recorded", "Patient vital signs have been recorded");
};

export const showReportGenerated = () => {
  showSuccess("Report Generated", "Report has been generated and is ready for download");
};

// Error notifications
export const showError = (title: string, description?: string) => {
  toast.error(title, {
    description,
    duration: 6000,
  });
};

export const showSaveError = () => {
  showError("Save Failed", "Failed to save. Please try again.");
};

export const showNetworkError = () => {
  showError("Network Error", "Please check your connection and try again.");
};

export const showValidationError = () => {
  showError("Validation Error", "Please check your input and try again.");
};

// Warning notifications
export const showWarning = (title: string, description?: string) => {
  toast.warning(title, {
    description,
    duration: 5000,
  });
};

export const showUnsavedChanges = () => {
  showWarning("Unsaved Changes", "You have unsaved changes. Are you sure you want to leave?");
};

export const showAppointmentConflict = () => {
  showWarning("Appointment Conflict", "This time slot conflicts with an existing appointment");
};

// Info notifications
export const showInfo = (title: string, description?: string) => {
  toast.info(title, {
    description,
    duration: 4000,
  });
};

export const showSystemUpdate = () => {
  showInfo("System Update", "New features are available. Please refresh to see changes.");
};

export const showMaintenance = () => {
  showInfo("Maintenance Notice", "System maintenance scheduled for tonight at 2 AM");
};

// Loading states
export const showLoading = (title: string) => {
  return toast.loading(title);
};

export const dismissLoading = (toastId: string) => {
  toast.dismiss(toastId);
};

// Promise-based notifications
export const showPromise = <T>(
  promise: Promise<T>,
  {
    loading,
    success,
    error,
  }: {
    loading: string;
    success: string;
    error: string;
  }
) => {
  return toast.promise(promise, {
    loading,
    success,
    error,
  });
};

// Custom toast with actions
export const showActionToast = (
  title: string,
  description: string,
  action?: {
    label: string;
    onClick: () => void;
  }
) => {
  toast(title, {
    description,
    action: action ? {
      label: action.label,
      onClick: action.onClick,
    } : undefined,
    duration: 6000,
  });
};
