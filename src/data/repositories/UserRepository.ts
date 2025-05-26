import { db } from '../database';
import { User, UserRole } from '../models/User';
import bcrypt from 'bcryptjs';

export class UserRepository {
  static async createUser(username: string, password: string, role: UserRole): Promise<User> {
    const passwordHash = await bcrypt.hash(password, 10);
    const id = await db.users.add({ username, passwordHash, role } as User);
    return { id, username, passwordHash, role };
  }

  static async getUserByUsername(username: string): Promise<User | undefined> {
    return db.users.where('username').equals(username).first();
  }

  static async getAllUsers(): Promise<User[]> {
    return db.users.toArray();
  }

  static async updateUser(id: number, updates: Partial<Omit<User, 'id'>>): Promise<void> {
    await db.users.update(id, updates);
  }

  static async deleteUser(id: number): Promise<void> {
    await db.users.delete(id);
  }

  static async authenticateUser(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    return isMatch ? user : null;
  }
} 