import { db } from '../../config/firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { Product, PriceBreak } from '../models/Product';

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

export class FirestoreProductRepository {
  private static COLLECTION = 'products';

  static async create(product: Omit<Product, 'id'>): Promise<Product> {
    const docRef = await addDoc(collection(db, this.COLLECTION), {
      ...product,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false
    });

    return {
      id: docRef.id,
      ...product,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false
    };
  }

  static async findById(id: string): Promise<Product | null> {
    const docRef = doc(db, this.COLLECTION, id);
    const docSnap = await getDocs(query(collection(db, this.COLLECTION), where('id', '==', id)));
    
    if (docSnap.empty) return null;
    const data = docSnap.docs[0].data();
    return {
      id: docSnap.docs[0].id,
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate()
    } as Product;
  }

  static async findByBarcode(barcode: string): Promise<Product | null> {
    const q = query(
      collection(db, this.COLLECTION),
      where('barcode', '==', barcode),
      where('isDeleted', '==', false)
    );
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate()
    } as Product;
  }

  static async findAll(): Promise<Product[]> {
    const q = query(
      collection(db, this.COLLECTION),
      where('isDeleted', '==', false),
      orderBy('name')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    } as Product));
  }

  static async update(id: string, productData: Partial<Product>): Promise<Product | null> {
    const docRef = doc(db, this.COLLECTION, id);
    await updateDoc(docRef, {
      ...productData,
      updatedAt: new Date()
    });

    return this.findById(id);
  }

  static async delete(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, this.COLLECTION, id);
      await updateDoc(docRef, {
        isDeleted: true,
        updatedAt: new Date()
      });
      return true;
    } catch {
      return false;
    }
  }

  static async restore(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, this.COLLECTION, id);
      await updateDoc(docRef, {
        isDeleted: false,
        updatedAt: new Date()
      });
      return true;
    } catch {
      return false;
    }
  }

  static async updateStock(id: string, quantity: number): Promise<boolean> {
    try {
      const product = await this.findById(id);
      if (!product || product.isDeleted) return false;

      const docRef = doc(db, this.COLLECTION, id);
      await updateDoc(docRef, {
        stock: (product.stock || 0) + quantity,
        updatedAt: new Date()
      });
      return true;
    } catch {
      return false;
    }
  }

  static async search(query: string): Promise<Product[]> {
    const q = query.toLowerCase();
    const querySnapshot = await getDocs(collection(db, this.COLLECTION));
    
    return querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      } as Product))
      .filter(product => 
        !product.isDeleted &&
        (product.name.toLowerCase().includes(q) ||
        (product.barcode?.toLowerCase().includes(q)))
      );
  }

  static async findByCategory(category: string): Promise<Product[]> {
    const q = query(
      collection(db, this.COLLECTION),
      where('category', '==', category),
      where('isDeleted', '==', false)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    } as Product));
  }

  static async getCategories(): Promise<string[]> {
    const products = await this.findAll();
    const categories = new Set(products
      .map(p => p.category)
      .filter((category): category is string => category !== undefined)
    );
    return Array.from(categories).sort();
  }

  static async getSuppliers(): Promise<string[]> {
    const products = await this.findAll();
    const suppliers = new Set(products
      .map(p => p.supplier)
      .filter((supplier): supplier is string => supplier !== undefined)
    );
    return Array.from(suppliers).sort();
  }
}