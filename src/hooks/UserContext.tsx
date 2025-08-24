import React, { createContext, useState } from "react";

export const UserContext = createContext({ user: null, updateUser: () => {} });

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  // Safely parse the user info from localStorage
  const storedUserInfo = localStorage.getItem("userInfo-eezy-health");
  const parsedUserInfo = storedUserInfo ? JSON.parse(storedUserInfo) : null;

  const [user, setUser] = useState(parsedUserInfo);

  const updateUser = (userData: Record<string, unknown>) => {
    setUser(userData);
    // Optionally, update the localStorage whenever user data changes
    localStorage.setItem("userInfo-eezy-health", JSON.stringify(userData));
  };

  return (
    <UserContext.Provider value={{ user, updateUser: () => updateUser(user) }}>
      {children}
    </UserContext.Provider>
  );
};
