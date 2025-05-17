"use client";

import { createContext, useState, useContext } from "react";

// 1. Buat Context
const UserContext = createContext();

// 2. Buat Provider
export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

// 3. Custom Hook (biar enak makainya)
export function useUser() {
  return useContext(UserContext);
}
