export interface User {
  id: string;
  username: string;
  passwordHash: string;
  tenantId: string;
  createdAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  tenantId: string;
  token: string;
  expiresAt: Date;
}

export interface AuthService {
  login(username: string, password: string): Promise<Session>;
  logout(sessionToken: string): Promise<void>;
  validateSession(sessionToken: string): Promise<Session | null>;
  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hash: string): Promise<boolean>;
}
