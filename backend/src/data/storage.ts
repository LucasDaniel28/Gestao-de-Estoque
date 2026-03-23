import { Product, Sale } from '../types';

// Armazenamento em memória
export const productsStorage: Product[] = [];
export const salesStorage: Sale[] = [];

// Gera ID único de 5 dígitos
const generateUniqueId = (existingIds: string[]): string => {
  let id: string;
  do {
    // Gera número aleatório entre 10000 e 99999
    id = Math.floor(10000 + Math.random() * 90000).toString();
  } while (existingIds.includes(id));
  return id;
};

// Dados iniciais de exemplo
const sampleProducts: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Cerveja Heineken 350ml',
    description: 'Cerveja premium holandesa long neck',
    price: 8.90,
    quantity: 50,
    category: 'Cerveja',
    packageQuantity: 12, // 12 unidades por caixa
    packagePrice: 99.90, // Preço da caixa com 12 unidades
  },
  {
    name: 'Vinho Tinto Cabernet',
    description: 'Vinho tinto seco 750ml',
    price: 45.00,
    quantity: 20,
    category: 'Vinho',
    packageQuantity: 6, // 6 garrafas por caixa
    packagePrice: 255.00,
  },
  {
    name: 'Whisky Johnnie Walker Red Label',
    description: 'Whisky escocês 1L',
    price: 89.90,
    quantity: 15,
    category: 'Whisky',
    packageQuantity: 12,
    packagePrice: 999.00,
  },
  {
    name: 'Vodka Absolut',
    description: 'Vodka sueca premium 1L',
    price: 79.90,
    quantity: 12,
    category: 'Vodka',
    packageQuantity: 6,
    packagePrice: 450.00,
  },
  {
    name: 'Refrigerante Coca-Cola 2L',
    description: 'Refrigerante de cola',
    price: 9.50,
    quantity: 100,
    category: 'Refrigerante',
    packageQuantity: 6, // Pack com 6 garrafas
    packagePrice: 54.00,
  },
  {
    name: 'Água Mineral Crystal 500ml',
    description: 'Água mineral sem gás',
    price: 2.50,
    quantity: 200,
    category: 'Água',
    packageQuantity: 12, // Fardo com 12 garrafas
    packagePrice: 28.00,
  },
];

// Inicializa os produtos de exemplo
export const initializeData = () => {
  if (productsStorage.length === 0) {
    const existingIds: string[] = [];
    sampleProducts.forEach((product) => {
      const id = generateUniqueId(existingIds);
      existingIds.push(id);
      productsStorage.push({
        id,
        ...product,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
    console.log('✅ Produtos inicializados com IDs únicos de 5 dígitos');
    console.log('📋 Produtos criados:');
    productsStorage.forEach(p => console.log(`  - ${p.name} (ID: ${p.id})`));
  }
};

// Função auxiliar para gerar ID único para uso externo
export const getUniqueId = (type: 'product' | 'sale'): string => {
  const existingIds = type === 'product' 
    ? productsStorage.map(p => p.id)
    : salesStorage.map(s => s.id);
  return generateUniqueId(existingIds);
};
