 // Helper function to extract error message
    const getErrorMessage = (err: unknown): string => {
      if (err && typeof err === 'object') {
        if ('data' in err && err.data && typeof err.data === 'object' && 'error' in err.data) {
          return (err.data as { error: string }).error;
        }
        if ('error' in err) {
          return (err as { error: string }).error;
        }
      }
      return "Doctor not found";
    };
    
   


export { getErrorMessage };
