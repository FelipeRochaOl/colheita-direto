import type { Offer } from '@colheita/contracts';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const CART_STORAGE_KEY = 'colheita-direta:cart';

export interface CartItem {
  offer: Offer;
  boxes: number;
}

interface CartContextValue {
  items: CartItem[];
  totalBoxes: number;
  productsTotal: number;
  addItem: (offer: Offer, boxes: number) => void;
  updateBoxes: (offerId: string, boxes: number) => void;
  removeItem: (offerId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function loadStoredCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? '[]') as CartItem[];
  } catch {
    return [];
  }
}

/** Carrinho do comprador, guardado no navegador. Pode ter ofertas de vários produtores. */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadStoredCart);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Navegação privada: o carrinho continua funcionando só na memória.
    }
  }, [items]);

  const addItem = useCallback((offer: Offer, boxes: number) => {
    setItems((current) => {
      const existing = current.find((item) => item.offer.id === offer.id);
      if (!existing) return [...current, { offer, boxes }];
      return current.map((item) =>
        item.offer.id === offer.id ? { ...item, boxes: Math.min(item.boxes + boxes, offer.availableBoxes) } : item,
      );
    });
  }, []);

  const updateBoxes = useCallback((offerId: string, boxes: number) => {
    setItems((current) => current.map((item) => (item.offer.id === offerId ? { ...item, boxes } : item)));
  }, []);

  const removeItem = useCallback((offerId: string) => {
    setItems((current) => current.filter((item) => item.offer.id !== offerId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      totalBoxes: items.reduce((sum, item) => sum + item.boxes, 0),
      productsTotal: items.reduce((sum, item) => sum + item.boxes * item.offer.pricePerBox, 0),
      addItem,
      updateBoxes,
      removeItem,
      clear,
    }),
    [items, addItem, updateBoxes, removeItem, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart precisa estar dentro de <CartProvider>');
  return context;
}
