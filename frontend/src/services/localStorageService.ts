import { Product, Sale } from '../types';

const PRODUCTS_KEY = 'bebidas_produtos';
const SALES_KEY = 'bebidas_vendas';

// Gera ID único de 5 dígitos
const generateUniqueId = (existingIds: string[]): string => {
  let id: string;
  do {
    // Gera número aleatório entre 10000 e 99999
    id = Math.floor(10000 + Math.random() * 90000).toString();
  } while (existingIds.includes(id));
  return id;
};

// Produtos
export const productsLocalStorage = {
  getAll: (): Product[] => {
    const data = localStorage.getItem(PRODUCTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  save: (products: Product[]): void => {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  },

  add: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product => {
    const products = productsLocalStorage.getAll();
    const existingIds = products.map(p => p.id);
    const newProduct: Product = {
      ...product,
      id: generateUniqueId(existingIds),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    products.push(newProduct);
    productsLocalStorage.save(products);
    return newProduct;
  },

  update: (id: string, updates: Partial<Product>): Product | null => {
    const products = productsLocalStorage.getAll();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    products[index] = {
      ...products[index],
      ...updates,
      id: products[index].id,
      createdAt: products[index].createdAt,
      updatedAt: new Date(),
    };
    productsLocalStorage.save(products);
    return products[index];
  },

  delete: (id: string): boolean => {
    const products = productsLocalStorage.getAll();
    const filtered = products.filter(p => p.id !== id);
    if (filtered.length === products.length) return false;
    productsLocalStorage.save(filtered);
    return true;
  },

  getById: (id: string): Product | null => {
    const products = productsLocalStorage.getAll();
    return products.find(p => p.id === id) || null;
  },
};

// Vendas
export const salesLocalStorage = {
  getAll: (): Sale[] => {
    const data = localStorage.getItem(SALES_KEY);
    if (!data) return [];
    const sales = JSON.parse(data);
    return sales.map((sale: any) => ({
      ...sale,
      createdAt: new Date(sale.createdAt),
    }));
  },

  save: (sales: Sale[]): void => {
    localStorage.setItem(SALES_KEY, JSON.stringify(sales));
  },

  add: (sale: Omit<Sale, 'id' | 'createdAt'>): Sale => {
    const sales = salesLocalStorage.getAll();
    const existingIds = sales.map(s => s.id);
    const newSale: Sale = {
      ...sale,
      id: generateUniqueId(existingIds),
      createdAt: new Date(),
    };
    sales.push(newSale);
    salesLocalStorage.save(sales);
    return newSale;
  },

  getById: (id: string): Sale | null => {
    const sales = salesLocalStorage.getAll();
    return sales.find(s => s.id === id) || null;
  },
};

// Limpa todos os dados
export const clearAllData = () => {
  localStorage.removeItem(PRODUCTS_KEY);
  localStorage.removeItem(SALES_KEY);
};

// Verifica se há IDs duplicados ou inválidos
const hasInvalidIds = (products: Product[]): boolean => {
  if (products.length === 0) return false;
  
  const ids = products.map(p => p.id);
  const uniqueIds = new Set(ids);
  
  // Verifica se há duplicados
  if (ids.length !== uniqueIds.size) return true;
  
  // Verifica se algum ID não tem 5 dígitos
  return products.some(p => !p.id || p.id.length !== 5 || isNaN(Number(p.id)));
};

// Inicializar com dados de exemplo se estiver vazio
export const initializeData = () => {
  const products = productsLocalStorage.getAll();
  
  // Se há IDs inválidos ou duplicados, limpa e reinicializa
  if (products.length > 0 && hasInvalidIds(products)) {
    console.warn('⚠️ IDs inválidos detectados. Limpando dados e reinicializando...');
    clearAllData();
  }
  
  // Inicializa produtos se estiver vazio
  if (productsLocalStorage.getAll().length === 0) {
    const sampleProducts = [
      {
        name: 'Cerveja Heineken 350ml',
        description: 'Cerveja premium holandesa long neck',
        price: 8.90,
        quantity: 50,
        category: 'Cerveja',
      },
      {
        name: 'Vinho Tinto Cabernet',
        description: 'Vinho tinto seco 750ml',
        price: 45.00,
        quantity: 20,
        category: 'Vinho',
      },
      {
        name: 'Whisky Johnnie Walker Red Label',
        description: 'Whisky escocês 1L',
        price: 89.90,
        quantity: 15,
        category: 'Whisky',
      },
      {
        name: 'Vodka Absolut',
        description: 'Vodka sueca premium 1L',
        price: 79.90,
        quantity: 12,
        category: 'Vodka',
      },
      {
        name: 'Refrigerante Coca-Cola 2L',
        description: 'Refrigerante de cola',
        price: 9.50,
        quantity: 100,
        category: 'Refrigerante',
      },
      {
        name: 'Água Mineral Crystal 500ml',
        description: 'Água mineral sem gás',
        price: 2.50,
        quantity: 200,
        category: 'Água',
      },
    ];

    sampleProducts.forEach(product => productsLocalStorage.add(product));
    console.log('✅ Produtos inicializados com IDs únicos de 5 dígitos');
    
    // Mostra os IDs gerados
    const newProducts = productsLocalStorage.getAll();
    console.log('📋 Produtos criados:');
    newProducts.forEach(p => console.log(`  - ${p.name} (ID: ${p.id})`));
  }
};
