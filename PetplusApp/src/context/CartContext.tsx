import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  selectedConditionId?: string;
  source?: 'shop' | 'consultation';
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, petId?: string, context?: { conditionId?: string; source?: 'shop' | 'consultation' }) => void;
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

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: Product, petId?: string, context?: { conditionId?: string; source?: 'shop' | 'consultation' }) => {
    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                selectedPetId: petId || item.selectedPetId,
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

  const clearCart = () => setItems([]);

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
