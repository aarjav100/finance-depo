import { useState, useEffect, createContext, useContext, useRef, useMemo } from 'react';

interface User {
  id: string;
  email: string;
  fullName?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const authCheckPromise = useRef<Promise<void> | null>(null);
  const lastAuthCheck = useRef<number>(0);
  const signInPromise = useRef<Promise<{ error: any }> | null>(null);
  const signUpPromise = useRef<Promise<{ error: any }> | null>(null);
  const lastSignInAttempt = useRef<number>(0);
  const lastSignUpAttempt = useRef<number>(0);
  const AUTH_CHECK_THROTTLE = 5000; // 5 seconds
  const SIGN_IN_THROTTLE = 2000; // 2 seconds
  const SIGN_UP_THROTTLE = 2000; // 2 seconds

  const checkAuth = async (): Promise<void> => {
    const now = Date.now();
    
    // If we already have a request in progress, return that promise
    if (authCheckPromise.current) {
      return authCheckPromise.current;
    }
    
    // If we checked recently, don't check again
    if (now - lastAuthCheck.current < AUTH_CHECK_THROTTLE) {
      setLoading(false);
      return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    
    lastAuthCheck.current = now;
    
    authCheckPromise.current = fetch('http://localhost:3002/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.data?.user) {
        setUser(data.data.user);
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    })
    .catch(() => {
      localStorage.removeItem('token');
      setUser(null);
    })
    .finally(() => {
      setLoading(false);
      authCheckPromise.current = null;
    });
    
    return authCheckPromise.current;
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const now = Date.now();
    
    // If we already have a sign-up request in progress, return that promise
    if (signUpPromise.current) {
      return signUpPromise.current;
    }
    
    // If we attempted sign-up recently, throttle the request
    if (now - lastSignUpAttempt.current < SIGN_UP_THROTTLE) {
      return { error: { message: 'Please wait before attempting to sign up again' } };
    }
    
    lastSignUpAttempt.current = now;
    
    signUpPromise.current = (async () => {
      try {
        const response = await fetch('http://localhost:3002/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password, fullName })
        });

        const data = await response.json();
        
        if (!response.ok) {
          return { error: { message: data.error } };
        }

        // Store token and user data
        localStorage.setItem('token', data.data.token);
        setUser(data.data.user);
        
        return { error: null };
      } catch (error: any) {
        return { error: { message: error.message } };
      } finally {
        signUpPromise.current = null;
      }
    })();
    
    return signUpPromise.current;
  };

  const signIn = async (email: string, password: string) => {
    const now = Date.now();
    
    // If we already have a sign-in request in progress, return that promise
    if (signInPromise.current) {
      return signInPromise.current;
    }
    
    // If we attempted sign-in recently, throttle the request
    if (now - lastSignInAttempt.current < SIGN_IN_THROTTLE) {
      return { error: { message: 'Please wait before attempting to sign in again' } };
    }
    
    lastSignInAttempt.current = now;
    
    signInPromise.current = (async () => {
      try {
        const response = await fetch('http://localhost:3002/api/auth/signin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        
        if (!response.ok) {
          return { error: { message: data.error } };
        }

        // Store token and user data
        localStorage.setItem('token', data.data.token);
        setUser(data.data.user);
        
        return { error: null };
      } catch (error: any) {
        return { error: { message: error.message } };
      } finally {
        signInPromise.current = null;
      }
    })();
    
    return signInPromise.current;
  };

  const signOut = async () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = useMemo(() => ({
    user,
    loading,
    signUp,
    signIn,
    signOut
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};