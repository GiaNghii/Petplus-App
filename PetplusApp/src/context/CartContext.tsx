import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { PRODUCTS } from '../data/products';

export interface Product {
  id: string;
  name: string;
  price: number;
  type: 'OTC' | 'prescription';
  category: string;
  description?: string;
  imageUrl?: string;
  imageLocal?: any;
  stock?: number;
  unit?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedPetId?: string;
  selectedPetName?: string;
  selectedConditionId?: string;
  source?: 'shop' | 'consultation';
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, petId?: string, context?: { conditionId?: string; source?: 'shop' | 'consultation'; petName?: string }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
  totalAmount: 0,
});

export const useCart = () => useContext(CartContext);

const CART_STORAGE_KEY = 'mock_cart';

function hydrateCartItems(items: CartItem[]): CartItem[] {
  return items.map(item => {
    const localProduct = PRODUCTS.find(product => product.id === item.product.id);
    if (!localProduct) return item;

    return {
      ...item,
      product: {
        ...localProduct,
        ...item.product,
        imageLocal: localProduct.imageLocal,
      },
    };
  });
}

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadCart = async () => {
      try {
        const cartJson = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (mounted && cartJson) {
          setItems(hydrateCartItems(JSON.parse(cartJson)));
        }
      } catch (e) {
        console.error('Load cart error:', e);
      } finally {
        if (mounted) {
          setHydrated(true);
        }
      }
    };

    loadCart();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items)).catch(e => {
      console.error('Save cart error:', e);
    });
  }, [hydrated, items]);

  const addItem = (product: Product, petId?: string, context?: { conditionId?: string; source?: 'shop' | 'consultation'; petName?: string }) => {
    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                selectedPetId: petId || item.selectedPetId,
                selectedPetName: context?.petName || item.selectedPetName,
                selectedConditionId: context?.conditionId || item.selectedConditionId,
                source: context?.source || item.source,
              }
            : item
        );
      }
      return [...prev, {
        product,
        quantity: 1,
        selectedPetId: petId,
        selectedPetName: context?.petName,
        selectedConditionId: context?.conditionId,
        source: context?.source,
      }];
    });
  };

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setItems(prev => prev
      .map(item => {
        if (item.product.id === productId) {
          const newQty = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
      .filter(item => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setItems([]);
    AsyncStorage.removeItem(CART_STORAGE_KEY).catch(e => {
      console.error('Clear cart error:', e);
    });
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems,
      totalAmount,
    }}>
      {children}
    </CartContext.Provider>
  );
};
