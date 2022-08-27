import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { api } from '~/services/apiClient';
import Router from 'next/router';

import { setCookie, parseCookies, destroyCookie } from 'nookies';

interface User {
  email: string;
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
  signOut(): void;
  user: User;
}

interface AuthProviderProps {
  children: ReactNode;
}

export let authChannel: BroadcastChannel;

export function signOut() {
  destroyCookie(undefined, 'auth.token');
  destroyCookie(undefined, 'auth.refreshToken');

  Router.push('/');
}

const AuthContext = createContext({} as AuthContextData);

function AuthProvider({ children }: AuthProviderProps) {
  const effectRan = useRef(false);
  const broadcastEffectRan = useRef(false);

  const [user, setUser] = useState<User>(undefined);
  const isAuthenticated = !!user;

  // Listening the auth broadcast channel
  useEffect(() => {
    authChannel = new BroadcastChannel('auth');

    // Prevent duplicate execution off useEffect caused by strictMode (React v18)
    if (!broadcastEffectRan.current) {
      authChannel.onmessage = (message) => {
        switch (message.data) {
          case 'signOut':
            signOut();
            break;
          case 'signIn':
            Router.reload();
            break;
          default:
            break;
        }
      };
    }

    return () => {
      broadcastEffectRan.current = true;
    };
  }, []);

  useEffect(() => {
    const { 'auth.token': token } = parseCookies();

    if (token && !effectRan.current) {
      api
        .get('/me')
        .then((response) => {
          const { email, permissions, roles } = response.data;

          setUser({ email, permissions, roles });
        })
        .catch((error) => {
          if (process.browser) signOut();
        });
    }

    return () => {
      effectRan.current = true;
    };
  }, []);

  async function signIn({ email, password }: SignInCredentials) {
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

      // Router.push('/dashboard');
      // Router.reload();
      authChannel.postMessage('signIn');
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, signIn, signOut, user }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const authContextData = useContext(AuthContext);

  return authContextData;
}

export { AuthProvider, useAuth, AuthContext };
