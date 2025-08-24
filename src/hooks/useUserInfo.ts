// Custom hook to handle user info retrieval and state management
export const useUserInfo = () => {
  const storedUserInfo = localStorage.getItem("userInfo-eezy-health");
  let userInfo: Record<string, unknown> | null = null;

  try {
    userInfo = storedUserInfo ? JSON.parse(storedUserInfo) : null;
  } catch (error) {
    console.error("Failed to parse userInfo from localStorage:", error);
  }

  return userInfo;
};