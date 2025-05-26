export type UserRole = 'admin' | 'manager' | 'cashier';

export interface User {
  id: number;
  username: string;
  passwordHash: string;
  role: UserRole;
} 