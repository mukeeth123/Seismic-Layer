import { createContext, useContext, useState, useCallback } from 'react';
import { USERS, PERMISSIONS, PROJECTS } from '../mock/users';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null); // null = not logged in

  const login = useCallback((username, password, projectId) => {
    const user = USERS.find(u => u.username === username && u.password === password);
    if (!user) return false;
    const project = PROJECTS.find(p => p.id === projectId) || PROJECTS[0];
    const permissions = PERMISSIONS[user.role] || {};
    setAuth({ user, role: user.role, project, permissions });
    return true;
  }, []);

  const logout = useCallback(() => setAuth(null), []);

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
