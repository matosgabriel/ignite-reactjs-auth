import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';
import { api } from '~/services/api';
import Router from 'next/router';

import { setCookie } from 'nookies';

interface User {
  email: string;
  permissions: string[];
  roles: string[];
}

interface Jwt {
  exp: number;
  iat: number;
  sub: string;
  permissions: string[];
  roles: string[];
}

interface SignInCredentials {
  email: string;
  password: string;
}

interface AuthContextData {
  isAuthenticated: boolean;
  signIn(credentials: SignInCredentials): Promise<void>;
  user: User;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext({} as AuthContextData);

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user;

  const signIn = useCallback(async ({ email, password }: SignInCredentials) => {
    try {
      const response = await api.post('/sessions', { email, password });
      const { token, refreshToken, permissions, roles } = response.data;

      setCookie(undefined, 'auth.token', token, {
        maxAge: 60 * 60 * 24 * 30, // 30 days,
        path: '/',
      });

      setCookie(undefined, 'auth.refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // 30 days,
        path: '/',
      });

      setUser({ email, permissions, roles });

      Router.push('/dashboard');
      console.log(user);
    } catch (err) {
      console.log(err);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, signIn, user }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const authContextData = useContext(AuthContext);

  return authContextData;
}

export { AuthProvider, useAuth };
