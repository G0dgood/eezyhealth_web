import DataService from '../features/Auth/dataService';

// Create an instance of DataService
const dataService = DataService();

// Define getUserAuthorizationConfig function
export async function getUserAuthorizationConfig() {
  try {
    // Retrieve the token from the data service
    const token = dataService.getToken(); 
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
