import type { Merchant, Product } from './types';
import { MERCHANTS, PRODUCTS } from './data';

export function loadMerchants(): Merchant[] {
  return MERCHANTS;
}

export function loadProducts(): Product[] {
  return PRODUCTS;
}
