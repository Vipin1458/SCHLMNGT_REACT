import { createContext, useContext, useState } from "react";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const user = localStorage.getItem("user");
    const access = localStorage.getItem("access");
    const refresh = localStorage.getItem("refresh");
    return user && access && refresh
      ? {
          user: JSON.parse(user),
          access,
          refresh,
        }
      : null;
  });

  const login = ({ user, access, refresh }) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);
    setAuth({ user, access, refresh });
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setAuth(null);
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
