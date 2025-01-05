import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

type User = {
  id: string;
  name: string;
  role: "admin" | "employee";
};

type AuthContextType = {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USERS = [
  { id: "1", name: "admin", role: "admin" as const, password: "admin123" },
  { id: "2", name: "employee", role: "employee" as const, password: "emp123" },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("currentUser");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && user) {
      localStorage.setItem("currentUser", JSON.stringify(user));
    }
  }, [user]);

  const login = (username: string, password: string) => {
    console.log("Login attempt:", username);
    const foundUser = MOCK_USERS.find(
      (u) => u.name === username && u.password === password
    );
    if (foundUser) {
      const userInfo: User = {
        id: foundUser.id,
        name: foundUser.name,
        role: foundUser.role,
      };
      console.log("User logged in:", userInfo);
      setUser(userInfo);
      return true;
    }
    return false;
  };

  const logout = () => {
    console.log("Logging out user:", user?.name);
    localStorage.removeItem("currentUser");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}
