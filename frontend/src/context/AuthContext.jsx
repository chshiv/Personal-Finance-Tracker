import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
  
    if (token && storedUser) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const parsedUser = JSON.parse(storedUser);
  
        if (payload?.role) {
          setUser({
            name: parsedUser.name || "User",
            role: payload.role
          });
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        }
  
      } catch (err) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      }
  
    } else {
      setUser(null);
    }
  
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData)); 
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const value = useMemo(() => {   //optimization for context as authcontext re-render every time because component using it rerender
    return { user, login, logout, loading };
  }, [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}