/**
 * Toast with Sound
 * Ported from the Outcess CRM. Wraps Sonner toasts to also play a short sound.
 */

import { toast } from "sonner";
import { playNotificationSound } from "./soundEffects";

type ToastOptions = Parameters<typeof toast>[1];

export const toastSuccess = (message: string, options?: ToastOptions) => {
  playNotificationSound("success");
  return toast.success(message, options);
};

export const toastError = (message: string, options?: ToastOptions) => {
  playNotificationSound("error");
  return toast.error(message, options);
};

export const toastWarning = (message: string, options?: ToastOptions) => {
  playNotificationSound("warning");
  return toast.warning(message, options);
};

export const toastInfo = (message: string, options?: ToastOptions) => {
  playNotificationSound("info");
  return toast.info(message, options);
};

/**
 * Show an incoming-notification toast with the notification chime.
 * Maps the app's notification type to the matching toast style + sound.
 */
export const toastNotification = (
  title: string,
  description?: string,
  type: "info" | "success" | "warning" | "error" = "info"
) => {
  playNotificationSound(
    type === "warning" || type === "error" ? type : "notification"
  );
  const opts = { description } as ToastOptions;
  switch (type) {
    case "success":
      return toast.success(title, opts);
    case "warning":
      return toast.warning(title, opts);
    case "error":
      return toast.error(title, opts);
    default:
      return toast.info(title, opts);
  }
};

export { toast };
