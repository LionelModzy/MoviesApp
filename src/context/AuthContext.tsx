import React, { createContext, useState, useContext } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

interface User {
  uid: string;
  email: string;
  name: string;
}

interface AuthContextData {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    try {
      const response = await auth().signInWithEmailAndPassword(email, password);
      const userDoc = await firestore()
        .collection('users')
        .doc(response.user.uid)
        .get();
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUser({
          uid: response.user.uid,
          email: response.user.email!,
          name: userData?.name || '',
        });
        setIsAuthenticated(true);
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await auth().createUserWithEmailAndPassword(email, password);
      
      // Save additional user data to Firestore
      await firestore().collection('users').doc(response.user.uid).set({
        name,
        email,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      setUser({
        uid: response.user.uid,
        email: response.user.email!,
        name,
      });
      setIsAuthenticated(true);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    try {
      await auth().signOut();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 