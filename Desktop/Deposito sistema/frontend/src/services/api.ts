import { Product, ProductCreateRequest, ProductUpdateRequest, Sale, SaleCreateRequest } from '../types';
import jsPDF from 'jspdf';

const API_URL = 'http://localhost:3001/api';

// Produtos
export const productsService = {
  getAll: async (): Promise<Product[]> => {
    const response = await fetch(`${API_URL}/products`);
    if (!response.ok) throw new Error('Erro ao buscar produtos');
    const data = await response.json();
    return data.data.map((p: any) => ({
      ...p,
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt),
    }));
  },

  getById: async (id: string): Promise<Product> => {
    const response = await fetch(`${API_URL}/products/${id}`);
    if (!response.ok) throw new Error('Produto não encontrado');
    const data = await response.json();
    return {
      ...data.data,
      createdAt: new Date(data.data.createdAt),
      updatedAt: new Date(data.data.updatedAt),
    };
  },

  create: async (product: ProductCreateRequest): Promise<Product> => {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (!response.ok) throw new Error('Erro ao criar produto');
    const data = await response.json();
    return {
      ...data.data,
      createdAt: new Date(data.data.createdAt),
      updatedAt: new Date(data.data.updatedAt),
    };
  },

  update: async (id: string, product: ProductUpdateRequest): Promise<Product> => {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (!response.ok) throw new Error('Erro ao atualizar produto');
    const data = await response.json();
    return {
      ...data.data,
      createdAt: new Date(data.data.createdAt),
      updatedAt: new Date(data.data.updatedAt),
    };
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Erro ao deletar produto');
  },
};

// Vendas
export const salesService = {
  getAll: async (): Promise<Sale[]> => {
    const response = await fetch(`${API_URL}/sales`);
    if (!response.ok) throw new Error('Erro ao buscar vendas');
    const data = await response.json();
    return data.data.map((s: any) => ({
      ...s,
      createdAt: new Date(s.createdAt),
    }));
  },

  getById: async (id: string): Promise<Sale> => {
    const response = await fetch(`${API_URL}/sales/${id}`);
    if (!response.ok) throw new Error('Venda não encontrada');
    const data = await response.json();
    return {
      ...data.data,
      createdAt: new Date(data.data.createdAt),
    };
  },

  create: async (saleData: SaleCreateRequest): Promise<Sale> => {
    const response = await fetch(`${API_URL}/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(saleData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao criar venda');
    }
    const data = await response.json();
    return {
      ...data.data,
      createdAt: new Date(data.data.createdAt),
    };
  },

  downloadPDF: async (id: string): Promise<void> => {
    // Busca a venda da API
    const sale = await salesService.getById(id);

    // Cria o documento PDF usando jsPDF
    const doc = new jsPDF();

    // Cabeçalho
    doc.setFontSize(20);
    doc.text('NOTA FISCAL DE VENDA', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('Sistema Depósito', 105, 30, { align: 'center' });
    doc.setFontSize(10);
    doc.text('CNPJ: 00.000.000/0001-00', 105, 36, { align: 'center' });
    doc.text('Endereço: Rua Principal, 123 - Centro', 105, 42, { align: 'center' });
    doc.text('Telefone: (00) 0000-0000', 105, 48, { align: 'center' });

    // Linha divisória
    doc.line(20, 52, 190, 52);

    // Informações da venda
    let y = 60;
    doc.setFontSize(12);
    doc.text(`Nota Fiscal Nº: ${id.substring(0, 8).toUpperCase()}`, 20, y);
    y += 6;
    doc.text(`Data: ${sale.createdAt.toLocaleDateString('pt-BR')} ${sale.createdAt.toLocaleTimeString('pt-BR')}`, 20, y);
    y += 6;
    doc.text(`Forma de Pagamento: ${sale.paymentMethod}`, 20, y);
    y += 8;

    // Informações do cliente (se houver)
    if (sale.customerName) {
      doc.setFontSize(10);
      doc.text(`Cliente: ${sale.customerName}`, 20, y);
      y += 5;
      if (sale.customerCPF) {
        doc.text(`CPF: ${sale.customerCPF}`, 20, y);
        y += 5;
      }
      if (sale.customerPhone) {
        doc.text(`Telefone: ${sale.customerPhone}`, 20, y);
        y += 5;
      }
      y += 3;
    }

    // Linha divisória
    doc.line(20, y, 190, y);
    y += 8;

    // Cabeçalho da tabela
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('ITENS DA VENDA', 20, y);
    y += 6;

    doc.text('Produto', 20, y);
    doc.text('Qtd', 120, y, { align: 'center' });
    doc.text('Preço Un.', 145, y, { align: 'right' });
    doc.text('Subtotal', 180, y, { align: 'right' });
    y += 2;

    doc.line(20, y, 190, y);
    y += 6;

    // Itens
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    sale.items.forEach((item) => {
      // Quebra o nome do produto se for muito longo
      const productName = item.productName.length > 50 
        ? item.productName.substring(0, 47) + '...' 
        : item.productName;
      
      // Adiciona indicador de tipo (un/pct)
      const unitLabel = item.saleUnit === 'pacote' ? 'pct' : 'un';
      
      doc.text(productName, 20, y);
      doc.text(`${item.quantity} ${unitLabel}`, 120, y, { align: 'center' });
      doc.text(`R$ ${item.price.toFixed(2)}`, 145, y, { align: 'right' });
      doc.text(`R$ ${item.subtotal.toFixed(2)}`, 180, y, { align: 'right' });
      y += 6;
    });

    // Linha divisória
    y += 2;
    doc.line(20, y, 190, y);
    y += 8;

    // Total
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL: R$ ${sale.total.toFixed(2)}`, 180, y, { align: 'right' });
    y += 15;

    // Rodapé
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Obrigado pela preferência!', 105, y, { align: 'center' });
    y += 4;
    doc.text('Esta nota fiscal foi gerada eletronicamente.', 105, y, { align: 'center' });

    // Salva o PDF
    doc.save(`nota-fiscal-${id}.pdf`);
  },
};

export default {
  products: productsService,
  sales: salesService,
};
