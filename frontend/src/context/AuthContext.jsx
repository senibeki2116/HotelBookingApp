import { createContext, useState } from "react";

export const AuthContext = createContext();

const normalizeToken = (token) => {
  if (!token || token === "null" || token === "undefined") {
    return null;
  }

  let cleanToken = token;

  try {
    const parsed = JSON.parse(token);

    if (typeof parsed === "string") {
      cleanToken = parsed;
    }
  } catch {
    // Already a normal string
  }

  cleanToken = cleanToken.replace(/^Bearer\s+/i, "").trim();

  return cleanToken || null;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return normalizeToken(localStorage.getItem("token"));
  });

  const login = (userData, tokenValue) => {
    const cleanToken = normalizeToken(tokenValue);

    if (!cleanToken) {
      console.error("Login failed: no valid token received.");
      return false;
    }

    const preparedUser = {
      ...userData,
      _id: userData?._id || userData?.id,
      id: userData?.id || userData?._id,
    };

    setUser(preparedUser);
    setToken(cleanToken);

    localStorage.setItem("user", JSON.stringify(preparedUser));

    localStorage.setItem("token", cleanToken);

    console.log("Login successful");
    console.log("Token saved:", cleanToken);

    return true;
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
