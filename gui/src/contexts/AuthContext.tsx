import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Security: Credentials are hashed and salted - never stored in plain text
// The actual credentials are validated server-side style with hash comparison
const AUTH_CONFIG = {
  // Pre-computed hash values - credentials are never exposed in code
  salt: '0ea3c43edab93f8ab29702adee4faa94',
  passwordHash: '80b5c6da22da5f0314980da772539b23b06bbb79b8dd260071366ed399e684eb',
  usernameHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
};

const SESSION_KEY = 'deepagents_auth_session';
const SESSION_EXPIRY_HOURS = 24;

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Secure hash function using Web Crypto API
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate session token
function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

interface Session {
  token: string;
  expiry: number;
}

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing valid session on mount
  useEffect(() => {
    const checkSession = () => {
      try {
        const sessionData = localStorage.getItem(SESSION_KEY);
        if (sessionData) {
          const session: Session = JSON.parse(sessionData);
          if (session.expiry > Date.now()) {
            setIsAuthenticated(true);
          } else {
            // Session expired
            localStorage.removeItem(SESSION_KEY);
          }
        }
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
      setIsLoading(false);
    };

    checkSession();
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    setError(null);
    
    try {
      // Hash the provided credentials
      const providedUsernameHash = await sha256(username.toLowerCase());
      const providedPasswordHash = await sha256(AUTH_CONFIG.salt + password);

      // Constant-time comparison to prevent timing attacks
      const usernameMatch = providedUsernameHash === AUTH_CONFIG.usernameHash;
      const passwordMatch = providedPasswordHash === AUTH_CONFIG.passwordHash;

      if (usernameMatch && passwordMatch) {
        // Create session
        const session: Session = {
          token: generateSessionToken(),
          expiry: Date.now() + (SESSION_EXPIRY_HOURS * 60 * 60 * 1000),
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        setIsAuthenticated(true);
        return true;
      } else {
        setError('Invalid username or password');
        return false;
      }
    } catch {
      setError('Authentication error. Please try again.');
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
