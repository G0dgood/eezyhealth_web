// Define getUserAuthorizationConfig function
export async function getUserAuthorizationConfig() {
  try {
    // Retrieve the token from localStorage (same approach as RTK Query)
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    // Check if the token exists
    if (!token) {
      throw new Error('Token not found');
    }

    // Construct the configuration object with the token included in the headers
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };

    return config;
  } catch (error) {
    // Handle errors
    console.error('Error while getting user authorization config:', error);
    return null; // You can return null or handle the error in your application logic.
  }
}
