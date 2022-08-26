import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { api } from '~/services/api';
import Router from 'next/router';

import { setCookie, parseCookies } from 'nookies';
import { decodeToken } from 'react-jwt';

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
  const [user, setUser] = useState<User>(undefined);
  const isAuthenticated = !!user;

  useEffect(() => {
    const { 'auth.token': token } = parseCookies();

    if (token) {
      api.get('/me').then((response) => {
        const { email, permissions, roles } = response.data;

        setUser({ email, permissions, roles });
      });
    }
  }, []);

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

      api.defaults.headers['Authorization'] = `Bearer ${token}`;

      Router.push('/dashboard');
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
