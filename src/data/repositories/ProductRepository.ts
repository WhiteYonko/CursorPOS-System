import { v4 as uuidv4 } from 'uuid';
import { db } from '../database';
import { Product } from '../models/Product';

export enum StockStatus {
  InStock = 'IN_STOCK',
  LowStock = 'LOW_STOCK',
  OutOfStock = 'OUT_OF_STOCK'
}

export interface ProductFilter {
  search?: string;
  category?: string;
  supplier?: string;
  stockStatus?: StockStatus;
  lowStockThreshold?: number;
}

export class ProductRepository {
  // Create a new product
  static async create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const newProduct: Product = {
      ...product,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false

      
    };
    
    await db.products.add(newProduct);
    return newProduct;
  }
  
  // Get a product by ID
  static async findById(id: string): Promise<Product | null> {
    const product = await db.products.get(id);
    return product && product.isDeleted !== true ? product : null;
  }
  
  // Get a product by barcode
  static async findByBarcode(barcode: string): Promise<Product | null> {
    return await db.products.where('barcode').equals(barcode).filter(p => p.isDeleted !== true).first() || null;
  }
  
  // Get all products (excluding deleted ones)
  static async findAll(): Promise<Product[]> {
    return await db.products.orderBy('name').filter(p => p.isDeleted !== true).toArray();
  }
  
  // Update a product
  static async update(id: string, productData: Partial<Product>): Promise<Product | null> {
    const existingProduct = await this.findById(id);
    if (!existingProduct || existingProduct.isDeleted === true) return null;
    
    const updatedProduct: Product = {
      ...existingProduct,
      ...productData,
      updatedAt: new Date()
    };
    
    await db.products.put(updatedProduct);
    return updatedProduct;
  }
  
  // Soft delete a product
  static async delete(id: string): Promise<boolean> {
    try {
      const product = await this.findById(id);
      if (!product) return false;
      
      await db.products.update(id, {
        isDeleted: true,
        updatedAt: new Date()
      });
      return true;
    } catch {
      return false;
    }
  }

  // Restore a deleted product
  static async restore(id: string): Promise<boolean> {
    try {
      const product = await db.products.get(id);
      if (!product) return false;
      
      await db.products.update(id, {
        isDeleted: false,
        updatedAt: new Date()
      });
      return true;
    } catch {
      return false;
    }
  }
  
  // Update stock quantity
  static async updateStock(id: string, quantity: number): Promise<boolean> {
    try {
      await db.transaction('rw', db.products, async () => {
        const product = await this.findById(id);
        if (!product || product.isDeleted === true) throw new Error('Product not found');
        
        await db.products.update(id, {
          stock: (product.stock || 0) + quantity,
          updatedAt: new Date()
        });
      });
      return true;
    } catch {
      return false;
    }
  }
  
  // Search products by name or barcode
  static async search(query: string): Promise<Product[]> {
    const searchQuery = query.toLowerCase();
    return await db.products
      .filter(product => 
        product.isDeleted !== true &&
        ((product.name?.toLowerCase().includes(searchQuery) ?? false) ||
        (product.barcode?.toLowerCase().includes(searchQuery) ?? false))
      )
      .toArray();
  }
  
  // Find products by category (excluding deleted ones)
  static async findByCategory(category: string): Promise<Product[]> {
    const results = await db.products.where('category').equalsIgnoreCase(category).filter(p => p.isDeleted !== true).toArray();
    return results || [];
  }

  // Enhanced search with multiple criteria and filters
  static async searchProducts(filters: ProductFilter): Promise<Product[]> {
    const {
      search,
      category,
      supplier,
      stockStatus,
      lowStockThreshold = 5 // Default low stock threshold
    } = filters;

    return await db.products
      .filter((product: Product): boolean => {
        if (product.isDeleted === true) return false;

        // Search by text (name, SKU, or barcode)
        const searchMatch = !search || 
          product.name.toLowerCase().includes(search.toLowerCase()) ||
          (product.sku?.toLowerCase() || '').includes(search.toLowerCase()) ||
          (product.barcode?.toLowerCase() || '').includes(search.toLowerCase());

        // Filter by category
        const categoryMatch = !category || product.category?.toLowerCase() === category.toLowerCase();

        // Filter by supplier
        const supplierMatch = !supplier || product.supplier?.toLowerCase() === supplier.toLowerCase();

        // Filter by stock status
        const stockMatch = !stockStatus || this.matchesStockStatus(product, stockStatus, lowStockThreshold);

        return searchMatch && categoryMatch && supplierMatch && stockMatch;
      })
      .toArray();
  }

  // Helper method to check if a product matches a stock status
  private static matchesStockStatus(product: Product, status: StockStatus, lowStockThreshold: number): boolean {
    switch (status) {
      case StockStatus.InStock:
        return (product.stock || 0) > lowStockThreshold;
      case StockStatus.LowStock:
        return (product.stock || 0) > 0 && (product.stock || 0) <= lowStockThreshold;
      case StockStatus.OutOfStock:
        return (product.stock || 0) <= 0;
      default:
        return true;
    }
  }

  // Get unique categories
  static async getCategories(): Promise<string[]> {
    const products = await this.findAll();
    const categories = new Set(products.map(p => p.category).filter((category): category is string => category !== undefined));
    return Array.from(categories).sort();
  }

  // Get unique suppliers
  static async getSuppliers(): Promise<string[]> {
    const products = await this.findAll();
    const suppliers = new Set(products.map(p => p.supplier).filter((supplier): supplier is string => supplier !== undefined));
    return Array.from(suppliers).sort();
  }
}