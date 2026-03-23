import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import PDFDocument from 'pdfkit';
import { productsStorage, salesStorage, getUniqueId } from '../data/storage';
import { Sale, SaleCreateRequest, ApiResponse } from '../types';

const router = express.Router();

// Listar todas as vendas
router.get('/', async (req: Request, res: Response) => {
  try {
    const response: ApiResponse<Sale[]> = {
      success: true,
      message: 'Vendas listadas com sucesso',
      data: salesStorage,
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error: any) {
    console.error('Erro ao listar vendas:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao listar vendas',
      error: error.message,
      timestamp: new Date().toISOString()
    };
    res.status(500).json(response);
  }
});

// Buscar venda por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sale = salesStorage.find(s => s.id === id);

    if (!sale) {
      const response: ApiResponse = {
        success: false,
        message: 'Venda não encontrada',
        timestamp: new Date().toISOString()
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<Sale> = {
      success: true,
      message: 'Venda encontrada',
      data: sale,
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error: any) {
    console.error('Erro ao buscar venda:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao buscar venda',
      error: error.message,
      timestamp: new Date().toISOString()
    };
    res.status(500).json(response);
  }
});

// Criar nova venda
router.post(
  '/',
  [
    body('items').isArray({ min: 1 }).withMessage('Deve haver pelo menos um item'),
    body('paymentMethod').trim().notEmpty().withMessage('Forma de pagamento é obrigatória')
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const response: ApiResponse = {
          success: false,
          message: 'Dados inválidos',
          error: errors.array().map(e => e.msg).join(', '),
          timestamp: new Date().toISOString()
        };
        return res.status(400).json(response);
      }

      const saleData: SaleCreateRequest = req.body;
      const saleId = getUniqueId('sale');

      // Calcula o total
      const total = saleData.items.reduce((sum, item) => sum + item.subtotal, 0);

      // Atualiza o estoque dos produtos
      for (const item of saleData.items) {
        const productIndex = productsStorage.findIndex(p => p.id === item.productId);
        
        if (productIndex !== -1) {
          const product = productsStorage[productIndex];
          const currentQuantity = product.quantity;
          
          // Calcula quantas unidades estão sendo vendidas
          let unitsToDeduct = item.quantity;
          
          if (item.saleUnit === 'pacote') {
            // Se for venda por pacote, multiplica pela quantidade de unidades no pacote
            const packageQty = product.packageQuantity || 1;
            unitsToDeduct = item.quantity * packageQty;
          }
          
          const newQuantity = currentQuantity - unitsToDeduct;
          
          if (newQuantity < 0) {
            const unitType = item.saleUnit === 'pacote' ? 'pacote(s)' : 'unidade(s)';
            const response: ApiResponse = {
              success: false,
              message: `Estoque insuficiente para o produto ${item.productName}. Você está tentando vender ${item.quantity} ${unitType}, mas há apenas ${currentQuantity} unidades em estoque.`,
              timestamp: new Date().toISOString()
            };
            return res.status(400).json(response);
          }
          
          productsStorage[productIndex].quantity = newQuantity;
          productsStorage[productIndex].updatedAt = new Date();
        }
      }

      const newSale: Sale = {
        id: saleId,
        ...saleData,
        total,
        createdAt: new Date()
      };

      salesStorage.push(newSale);

      const response: ApiResponse<Sale> = {
        success: true,
        message: 'Venda realizada com sucesso',
        data: newSale,
        timestamp: new Date().toISOString()
      };

      res.status(201).json(response);
    } catch (error: any) {
      console.error('Erro ao criar venda:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Erro ao criar venda',
        error: error.message,
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  }
);

// Gerar PDF da nota fiscal
router.get('/:id/pdf', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sale = salesStorage.find(s => s.id === id);

    if (!sale) {
      const response: ApiResponse = {
        success: false,
        message: 'Venda não encontrada',
        timestamp: new Date().toISOString()
      };
      return res.status(404).json(response);
    }

    // Cria o documento PDF
    const doc = new PDFDocument({ margin: 50 });

    // Define o cabeçalho da resposta
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=nota-fiscal-${id}.pdf`);

    // Pipe o PDF para a resposta
    doc.pipe(res);

    // Cabeçalho
    doc.fontSize(20).text('NOTA FISCAL DE VENDA', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(12).text(`Sistema Depósito`, { align: 'center' });
    doc.fontSize(10).text(`CNPJ: 00.000.000/0001-00`, { align: 'center' });
    doc.text(`Endereço: Rua Principal, 123 - Centro`, { align: 'center' });
    doc.text(`Telefone: (00) 0000-0000`, { align: 'center' });
    doc.moveDown();

    // Linha divisória
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Informações da venda
    doc.fontSize(12).text(`Nota Fiscal Nº: ${id.substring(0, 8).toUpperCase()}`, { align: 'left' });
    doc.text(`Data: ${sale.createdAt.toLocaleDateString('pt-BR')} ${sale.createdAt.toLocaleTimeString('pt-BR')}`, { align: 'left' });
    doc.text(`Forma de Pagamento: ${sale.paymentMethod}`, { align: 'left' });
    doc.moveDown();

    // Informações do cliente (se houver)
    if (sale.customerName) {
      doc.fontSize(10).text(`Cliente: ${sale.customerName}`);
      if (sale.customerCPF) doc.text(`CPF: ${sale.customerCPF}`);
      if (sale.customerPhone) doc.text(`Telefone: ${sale.customerPhone}`);
      doc.moveDown();
    }

    // Linha divisória
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Cabeçalho da tabela
    doc.fontSize(10).text('ITENS DA VENDA', { underline: true });
    doc.moveDown(0.5);

    const tableTop = doc.y;
    const itemX = 50;
    const quantityX = 300;
    const priceX = 380;
    const subtotalX = 480;

    doc.fontSize(10);
    doc.text('Produto', itemX, tableTop, { width: 240 });
    doc.text('Qtd', quantityX, tableTop, { width: 70, align: 'center' });
    doc.text('Preço Un.', priceX, tableTop, { width: 90, align: 'right' });
    doc.text('Subtotal', subtotalX, tableTop, { width: 70, align: 'right' });

    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    // Itens
    let currentY = doc.y;
    sale.items.forEach((item) => {
      doc.fontSize(9);
      
      // Nome do produto
      doc.text(item.productName, itemX, currentY, { width: 240 });
      
      // Quantidade com tipo (unidade/pacote)
      const unitLabel = item.saleUnit === 'pacote' ? 'pct' : 'un';
      doc.text(`${item.quantity} ${unitLabel}`, quantityX, currentY, { width: 70, align: 'center' });
      
      // Preço unitário/por pacote
      doc.text(`R$ ${item.price.toFixed(2)}`, priceX, currentY, { width: 90, align: 'right' });
      
      // Subtotal
      doc.text(`R$ ${item.subtotal.toFixed(2)}`, subtotalX, currentY, { width: 70, align: 'right' });
      
      currentY += 20;
      doc.moveDown(0.8);
    });

    // Linha divisória
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Total
    doc.fontSize(14).font('Helvetica-Bold').text(`TOTAL: R$ ${sale.total.toFixed(2)}`, { align: 'right' });
    doc.font('Helvetica');
    doc.moveDown(2);

    // Rodapé
    doc.fontSize(8).text('Obrigado pela preferência!', { align: 'center' });
    doc.text('Esta nota fiscal foi gerada eletronicamente.', { align: 'center' });

    // Finaliza o PDF
    doc.end();
  } catch (error: any) {
    console.error('Erro ao gerar PDF:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao gerar PDF',
      error: error.message,
      timestamp: new Date().toISOString()
    };
    res.status(500).json(response);
  }
});

export default router;
