import { db } from '../../config/firebase';
import { collection, doc, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { Sale, SaleItem } from '../models/Sale';
import { startOfDay, endOfDay } from 'date-fns';

export class FirestoreSaleRepository {
  private static SALES_COLLECTION = 'sales';
  private static SALE_ITEMS_COLLECTION = 'saleItems';

  static async create(sale: Omit<Sale, 'id' | 'date'>): Promise<Sale> {
    const newSale: Omit<Sale, 'id'> = {
      ...sale,
      date: new Date()
    };

    const saleRef = await addDoc(collection(db, this.SALES_COLLECTION), newSale);
    
    // Create sale items
    for (const item of sale.items) {
      await addDoc(collection(db, this.SALE_ITEMS_COLLECTION), {
        ...item,
        saleId: saleRef.id
      });
    }

    return {
      id: saleRef.id,
      ...newSale
    };
  }

  static async findById(id: string): Promise<Sale | null> {
    const q = query(collection(db, this.SALES_COLLECTION), where('id', '==', id));
    const saleSnapshot = await getDocs(q);
    
    if (saleSnapshot.empty) return null;
    
    const saleDoc = saleSnapshot.docs[0];
    const saleData = saleDoc.data();

    // Get sale items
    const itemsQuery = query(
      collection(db, this.SALE_ITEMS_COLLECTION),
      where('saleId', '==', saleDoc.id)
    );
    const itemsSnapshot = await getDocs(itemsQuery);
    const items = itemsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as SaleItem));

    return {
      id: saleDoc.id,
      ...saleData,
      date: saleData.date.toDate(),
      items
    } as Sale;
  }

  static async findAll(startDate?: Date, endDate?: Date): Promise<Sale[]> {
    let q = query(collection(db, this.SALES_COLLECTION), orderBy('date', 'desc'));
    
    if (startDate && endDate) {
      q = query(q, 
        where('date', '>=', startDate),
        where('date', '<=', endDate)
      );
    }

    const salesSnapshot = await getDocs(q);
    const sales = await Promise.all(salesSnapshot.docs.map(async doc => {
      const saleData = doc.data();
      
      // Get items for each sale
      const itemsQuery = query(
        collection(db, this.SALE_ITEMS_COLLECTION),
        where('saleId', '==', doc.id)
      );
      const itemsSnapshot = await getDocs(itemsQuery);
      const items = itemsSnapshot.docs.map(itemDoc => ({
        id: itemDoc.id,
        ...itemDoc.data()
      } as SaleItem));

      return {
        id: doc.id,
        ...saleData,
        date: saleData.date.toDate(),
        items
      } as Sale;
    }));

    return sales;
  }

  static async getDailySales(date: Date): Promise<{
    total: number;
    count: number;
    sales: Sale[];
  }> {
    const start = startOfDay(date);
    const end = endOfDay(date);
    
    const sales = await this.findAll(start, end);
    const completedSales = sales.filter(sale => sale.status === 'completed');
    
    return {
      total: completedSales.reduce((sum, sale) => sum + sale.total, 0),
      count: completedSales.length,
      sales: completedSales
    };
  }

  static async getBestSellers(
    startDate: Date,
    endDate: Date,
    limit: number = 10
  ): Promise<{
    productId: string;
    productName: string;
    quantity: number;
    totalSales: number;
  }[]> {
    const sales = await this.findAll(startDate, endDate);
    const completedSales = sales.filter(sale => sale.status === 'completed');
    
    const productSales = new Map<string, {
      productId: string;
      productName: string;
      quantity: number;
      totalSales: number;
    }>();
    
    for (const sale of completedSales) {
      for (const item of sale.items) {
        const existing = productSales.get(item.productId) || {
          productId: item.productId,
          productName: item.productName || '',
          quantity: 0,
          totalSales: 0
        };
        
        existing.quantity += item.quantity;
        existing.totalSales += item.total;
        
        productSales.set(item.productId, existing);
      }
    }
    
    return Array.from(productSales.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit);
  }
}