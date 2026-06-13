import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { mockPetService, mockAppointmentService, mockOrderService } from './mockDataService';
import { PRODUCTS } from '../data/products';
import type { Product } from '../data/products';

export const petService = mockPetService;
export const appointmentService = mockAppointmentService;
export const orderService = mockOrderService;

export const productService = {
  async getProducts(): Promise<{ success: boolean; products: Product[] }> {
    try {
      const q = query(collection(db, 'products'), orderBy('id'));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.log('[Firestore] products collection empty, using local fallback');
        return { success: true, products: PRODUCTS };
      }

      const products = snapshot.docs.map(doc => {
        const data = doc.data();
        const localProduct = PRODUCTS.find(p => p.id === doc.id);

        return {
          ...data,
          imageLocal: localProduct?.imageLocal,
          createdAt: data.createdAt?.toDate?.() || new Date(),
        } as unknown as Product;
      });

      return { success: true, products };
    } catch (error) {
      console.log('[Firestore] fetch failed, using local fallback:', error);
      return { success: true, products: PRODUCTS };
    }
  },
};
