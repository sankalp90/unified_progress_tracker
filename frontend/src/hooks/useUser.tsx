import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "../api/client";
import type { User } from "../types";

interface UserContextValue {
  users: User[];
  activeUser: User | null;
  setActiveUser: (user: User | null) => void;
  refreshUsers: () => Promise<void>;
  loading: boolean;
}

const UserContext = createContext<UserContextValue | null>(null);

const STORAGE_KEY = "upt_logged_in_user_id";

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [activeUser, setActiveUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUsers = async () => {
    const data = await api.getUsers();
    setUsers(data);
    const storedId = localStorage.getItem(STORAGE_KEY);
    if (storedId) {
      const found = data.find((u) => u.id === Number(storedId));
      if (found) setActiveUserState(found);
    }
  };

  const setActiveUser = (user: User | null) => {
    setActiveUserState(user);
    if (user) localStorage.setItem(STORAGE_KEY, String(user.id));
    else localStorage.removeItem(STORAGE_KEY);
  };

  useEffect(() => {
    refreshUsers()
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <UserContext.Provider
      value={{ users, activeUser, setActiveUser, refreshUsers, loading }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
