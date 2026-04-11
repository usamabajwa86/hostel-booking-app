import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('uaf_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('uaf_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('uaf_user');
    }
  }, [user]);

  const login = useCallback((userData) => {
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  // Merge new fields into the cached user (used after profile update)
  const updateUser = useCallback((patch) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  // Re-fetch the user from server to pick up latest profile/booking state
  const refreshUser = useCallback(async () => {
    if (!user?.id) return null;
    try {
      const res = await fetch(`/api/users/${user.id}`);
      if (!res.ok) return null;
      const fresh = await res.json();
      setUser(fresh);
      return fresh;
    } catch {
      return null;
    }
  }, [user?.id]);

  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'student';
  const isSuperintendent = user?.role === 'superintendent';

  // Profile is "complete" if all required fields are filled
  const isProfileComplete = Boolean(
    user?.profile &&
    user.profile.degreeName &&
    user.profile.semester &&
    user.profile.cnic &&
    user.profile.phone &&
    user.profile.fatherName &&
    user.profile.address &&
    user.profile.emergencyContact &&
    user.profile.guardianName &&
    user.profile.guardianContact
  );

  const value = {
    user,
    login,
    logout,
    updateUser,
    refreshUser,
    isAdmin,
    isStudent,
    isSuperintendent,
    isProfileComplete,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
