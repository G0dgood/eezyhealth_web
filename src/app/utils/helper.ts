 // Helper function to extract error message
    const getErrorMessage = (err: unknown): string => {
      if (err && typeof err === 'object') {
        // Handle payment-related error objects
        if ('message' in err && typeof err.message === 'string') {
          return err.message;
        }
        if ('status' in err && typeof err.status === 'string') {
          return err.status;
        }
        if ('data' in err && err.data && typeof err.data === 'object' && 'error' in err.data) {
          return (err.data as { error: string }).error;
        }
        if ('error' in err) {
          return (err as { error: string }).error;
        }
        // If it's an object with multiple properties, try to extract a meaningful message
        if (Object.keys(err).length > 0) {
          const errorObj = err as Record<string, unknown>;
          if (errorObj.message) return String(errorObj.message);
          if (errorObj.status) return String(errorObj.status);
          if (errorObj.error) return String(errorObj.error);
          // Return a generic message for complex objects
          return "An error occurred";
        }
      }
      return "Doctor not found";
    };
    
   


export { getErrorMessage };
