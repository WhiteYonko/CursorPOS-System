import Dexie, { Table } from 'dexie';
import { Product } from './models/Product';
import { Sale, SaleItem } from './models/Sale';
import { User } from './models/User';
import { UserRepository } from './repositories/UserRepository';

// NOTE: Some linter errors may appear due to Dexie's dynamic typing (e.g., 'version' and 'open' methods), but this code is correct for Dexie usage.

export class RetailDatabase extends Dexie {
  products!: Table<Product>;
  sales!: Table<Sale>;
  saleItems!: Table<SaleItem>;
  users!: Table<User>;

  constructor() {
    super('RetailPOS');
    
    this.version(1).stores({
      products: 'id, barcode, name, category',
      sales: 'id, date, status, payment_method',
      saleItems: 'id, sale_id, product_id'
    });

    this.version(2).stores({
      products: 'id, barcode, name, category',
      sales: 'id, date, status, payment_method',
      saleItems: 'id, saleId, product_id'
    });

    this.version(3).stores({
      products: 'id, barcode, name, category, is_deleted'
    });

    this.version(4).stores({
      products: 'id, barcode, name, category, is_deleted',
      sales: 'id, date, status, payment_method',
      saleItems: 'id, saleId, product_id',
      users: '++id, username, role'
    });
  }
}

export const db = new RetailDatabase();

export async function initializeDatabase(): Promise<void> {
  try {
    await db.open();
    // Seed initial admin user if none exists
    const users = await db.users.toArray();
    if (users.length === 0) {
      await UserRepository.createUser('admin', 'admin123', 'admin');
      console.log('Seeded initial admin user: admin/admin123');
    }
    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}