// Tipos para o sistema de gestão de loja de bebidas

export type SaleUnit = 'unidade' | 'pacote';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  image?: string;
  // Informações sobre pacote
  packageQuantity?: number; // Quantas unidades tem em um pacote
  packagePrice?: number; // Preço do pacote (se não fornecido, será calculado)
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCreateRequest {
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  image?: string;
  packageQuantity?: number;
  packagePrice?: number;
}

export interface ProductUpdateRequest {
  name?: string;
  description?: string;
  price?: number;
  quantity?: number;
  category?: string;
  image?: string;
  packageQuantity?: number;
  packagePrice?: number;
}

export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
  saleUnit: SaleUnit; // 'unidade' ou 'pacote'
}

export interface Sale {
  id: string;
  items: CartItem[];
  total: number;
  paymentMethod: string;
  customerName?: string;
  customerCPF?: string;
  customerPhone?: string;
  createdAt: Date;
}

export interface SaleCreateRequest {
  items: CartItem[];
  paymentMethod: string;
  customerName?: string;
  customerCPF?: string;
  customerPhone?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'entrada' | 'saida';
  quantity: number;
  unitPrice: number;
  totalValue: number;
  createdAt: Date;
  reason: string;
}
