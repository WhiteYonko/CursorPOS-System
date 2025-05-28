export interface User {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'cashier' | 'viewer';
  name: string;
  createdAt: Date;
  lastLogin?: Date;
}

export interface UserSession {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
}