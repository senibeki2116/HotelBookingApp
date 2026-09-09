import { createContext, useState } from "react";

const normalizeToken = (token) => {
  if (!token || token === "null" || token === "undefined") return null;
  return token.replace(/^Bearer\s+/i, "").trim();
};

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(
    normalizeToken(localStorage.getItem("token")) || null,
  );

  const login = (userData, tokenValue) => {
    const cleanToken = normalizeToken(tokenValue);
    const preparedUser = {
      ...userData,
      _id: userData?._id || userData?.id,
      id: userData?.id || userData?._id,
    };

    setUser(preparedUser);
    setToken(cleanToken);

    localStorage.setItem("user", JSON.stringify(preparedUser));
    localStorage.setItem("token", cleanToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
