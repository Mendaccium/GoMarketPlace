import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';
import { AppRegistry } from 'react-native';

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
  console.log(products);
  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const prod = await AsyncStorage.getItem('@GoMarketPlace:prod');
      console.log(prod);
      if (prod) {
        setProducts([...JSON.parse(prod)]);
      }
    }

    loadProducts();
  }, []);

  // const addToCart = useCallback(
  //   async product => {
  //     const productExist = products.find(prod => prod.id === product.id);
  //     if (productExist) {
  //       setProducts(
  //         products.map(prod =>
  //           prod.id === product.id
  //             ? { ...product, quantity: prod.quantity + 1 }
  //             : prod,
  //         ),
  //       );
  //     } else {
  //       setProducts([...products, { ...product, quantity: 1 }]);
  //     }
  //     await AsyncStorage.setItem(
  //       '@GoMarketPlace:prod',
  //       JSON.stringify(products),
  //     );
  //   },

  //   [products],
  // );

  const addToCart = useCallback(
    async product => {
      const productsExist = products.find(prod => prod.id === product.id);
      if (productsExist) {
        productsExist.quantity += 1;
        setProducts([...products]);
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }
      await AsyncStorage.setItem(
        '@GoMarketplace:prod',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      setProducts(
        products.map(prod =>
          prod.id === id ? { ...prod, quantity: prod.quantity + 1 } : prod,
        ),
      );
      await AsyncStorage.setItem(
        '@GoMarketPlace:prod',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const product = products.find(prod => prod.id === id);
      if (product) {
        if (product.quantity > 1) {
          product.quantity -= 1;
        } else {
          const repositoryIndex = products.findIndex(prod => prod.id === id);
          products.splice(repositoryIndex, 1);
        }
      }
      setProducts([...products]);
      await AsyncStorage.setItem(
        '@GoMarketPlace:prod',
        JSON.stringify(products),
      );
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
