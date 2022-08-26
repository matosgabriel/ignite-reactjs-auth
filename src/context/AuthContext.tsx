import { createContext, ReactNode, useCallback, useContext } from 'react';

interface SignInCredentials {
  email: string;
  password: string;
}

interface AuthContextData {
  isAuthenticated: boolean;
  signIn(credentials: SignInCredentials): Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext({} as AuthContextData);

function AuthProvider({ children }: AuthProviderProps) {
  const isAuthenticated = false;

  const signIn = useCallback(async ({ email, password }: SignInCredentials) => {
    console.log({ email, password });
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, signIn }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const authContextData = useContext(AuthContext);

  return authContextData;
}

export { AuthProvider, useAuth };
