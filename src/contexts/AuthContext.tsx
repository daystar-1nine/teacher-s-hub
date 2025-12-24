import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string, role: UserRole, schoolCode: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for testing
const DEMO_USERS: User[] = [
  {
    id: 'teacher-1',
    email: 'teacher@school.edu',
    name: 'Ms. Sarah Johnson',
    role: 'teacher',
    schoolCode: 'DEMO2024',
    createdAt: new Date(),
    avatarUrl: undefined,
  },
  {
    id: 'student-1',
    email: 'student@school.edu',
    name: 'Alex Thompson',
    role: 'student',
    schoolCode: 'DEMO2024',
    createdAt: new Date(),
    avatarUrl: undefined,
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved session
    const savedUser = localStorage.getItem('teachersdesk_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('teachersdesk_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Demo login
      const demoUser = DEMO_USERS.find(u => u.email === email);
      if (demoUser && password === 'password123') {
        setUser(demoUser);
        localStorage.setItem('teachersdesk_user', JSON.stringify(demoUser));
        return { success: true };
      }
      
      // Check localStorage for registered users
      const registeredUsers = JSON.parse(localStorage.getItem('teachersdesk_registered_users') || '[]');
      const registeredUser = registeredUsers.find((u: User & { password: string }) => 
        u.email === email && u.password === password
      );
      
      if (registeredUser) {
        const { password: _, ...userWithoutPassword } = registeredUser;
        setUser(userWithoutPassword);
        localStorage.setItem('teachersdesk_user', JSON.stringify(userWithoutPassword));
        return { success: true };
      }
      
      return { success: false, error: 'Invalid email or password' };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Demo Google login - would normally redirect to Google OAuth
      return { success: false, error: 'Google Sign-In requires backend configuration. Use email/password for demo.' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    email: string, 
    password: string, 
    name: string, 
    role: UserRole, 
    schoolCode: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Validate school code
      const validSchoolCodes = ['DEMO2024', 'SCHOOL001', 'TEST123'];
      if (!validSchoolCodes.includes(schoolCode.toUpperCase())) {
        return { success: false, error: 'Invalid school code. Try: DEMO2024' };
      }
      
      // Check if user already exists
      const registeredUsers = JSON.parse(localStorage.getItem('teachersdesk_registered_users') || '[]');
      if (registeredUsers.some((u: User) => u.email === email)) {
        return { success: false, error: 'An account with this email already exists' };
      }
      
      const newUser: User = {
        id: `user-${Date.now()}`,
        email,
        name,
        role,
        schoolCode: schoolCode.toUpperCase(),
        createdAt: new Date(),
      };
      
      // Save to localStorage
      registeredUsers.push({ ...newUser, password });
      localStorage.setItem('teachersdesk_registered_users', JSON.stringify(registeredUsers));
      
      setUser(newUser);
      localStorage.setItem('teachersdesk_user', JSON.stringify(newUser));
      
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('teachersdesk_user');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('teachersdesk_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      loginWithGoogle,
      signup,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
