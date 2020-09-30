import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storagedProducts = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );

      if (storagedProducts) {
        setProducts(JSON.parse(storagedProducts));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      const [productExists] = products.filter(item => item.id === product.id);

      if (!productExists) {
        const newProduct = product;

        newProduct.quantity = 1;

        const newProducts = [...products, newProduct];

        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(newProducts),
        );

        setProducts(newProducts);
      } else {
        let updatedProduct = {} as Product;

        const updatedProducts = products.map(item => {
          if (item.id === product.id) {
            updatedProduct = item;

            updatedProduct.quantity += 1;

            return updatedProduct;
          }

          return item;
        });

        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(updatedProducts),
        );

        setProducts(updatedProducts);
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      let product = {} as Product;

      const updatedProducts = products.map(item => {
        if (item.id === id) {
          product = item;

          product.quantity += 1;

          return product;
        }

        return item;
      });

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(updatedProducts),
      );

      setProducts(updatedProducts);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      let product = {} as Product;

      let updatedProducts = products.map(item => {
        if (item.id === id) {
          product = item;

          product.quantity -= 1;

          return product;
        }

        return item;
      });

      if (product.quantity === 0) {
        updatedProducts = products.filter(item => item.quantity !== 0);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(updatedProducts),
      );

      setProducts(updatedProducts);
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
