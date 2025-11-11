import { useState, useEffect } from "react";

const USER_NAME_KEY = "routine-assistant-username";

export const useUserName = () => {
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const savedName = localStorage.getItem(USER_NAME_KEY);
    if (savedName) {
      setUserName(savedName);
    }
  }, []);

  const saveUserName = (name: string) => {
    localStorage.setItem(USER_NAME_KEY, name);
    setUserName(name);
  };

  const clearUserName = () => {
    localStorage.removeItem(USER_NAME_KEY);
    setUserName(null);
  };

  return { userName, saveUserName, clearUserName };
};
