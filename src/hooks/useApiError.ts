import { useEffect } from "react";
import { toast } from "sonner";
import { usePathname } from "next/navigation";

/**
 * Custom hook to handle API errors and display toast notifications.
 *
 * @param isError - Boolean indicating if an error occurred
 * @param error - The error object returned from the API
 * @param fallbackMessage - Default message to show if no specific error message is found
 * @param options - Optional configuration for error handling
 */
export const useApiError = (
  isError: boolean,
  error: unknown,
  fallbackMessage: string = "An error occurred",
  options: { hideInAdmin?: boolean; suppress401?: boolean } = {}
) => {
  const pathname = usePathname();

  useEffect(() => {
    if (!isError || !error) {
      return;
    }

    // Suppress 401 errors if suppress401 is true (useful for silent profile checks)
    if (options.suppress401 && (error as any)?.status === 401) {
      return;
    }

    // Suppress error if we are on an admin route and hideInAdmin is true
    if (options.hideInAdmin && pathname?.startsWith("/admin")) {
      return;
    }

    let message: string | undefined;

    if (typeof error === "string") {
      message = error;
    } else if (typeof error === "object" && error !== null) {
      const err = error as any;
      
      // 1. Try err.data.message (RTK Query standard)
      if (err.data) {
        const data = err.data;
        if (typeof data === "string") {
          message = data;
        } else if (typeof data === "object" && data !== null) {
          message = data.message || data.Message || data.error || data.Error;
          
          if (!message && Array.isArray(data.errors) && data.errors.length > 0) {
            const first = data.errors[0];
            message = first.message || first.Message;
          }
        }
      }

      // 2. Try err.message (Fetch error or other)
      if (!message && typeof err.message === "string") {
        message = err.message;
      }

      // 3. Try err.error (RTK Query fallback)
      if (!message && typeof err.error === "string") {
        message = err.error;
      }
    }

    const finalMessage = typeof message === "string" ? message : fallbackMessage;
    toast.error(finalMessage);
  }, [isError, error, fallbackMessage]);
};
