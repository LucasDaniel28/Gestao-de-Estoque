import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { productsStorage, getUniqueId } from '../data/storage';
import { Product, ProductCreateRequest, ProductUpdateRequest, ApiResponse } from '../types';

const router = express.Router();

// Listar todos os produtos
router.get('/', async (req: Request, res: Response) => {
  try {
    const response: ApiResponse<Product[]> = {
      success: true,
      message: 'Produtos listados com sucesso',
      data: productsStorage,
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error: any) {
    console.error('Erro ao listar produtos:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao listar produtos',
      error: error.message,
      timestamp: new Date().toISOString()
    };
    res.status(500).json(response);
  }
});

// Buscar produto por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = productsStorage.find(p => p.id === id);

    if (!product) {
      const response: ApiResponse = {
        success: false,
        message: 'Produto não encontrado',
        timestamp: new Date().toISOString()
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<Product> = {
      success: true,
      message: 'Produto encontrado',
      data: product,
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error: any) {
    console.error('Erro ao buscar produto:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao buscar produto',
      error: error.message,
      timestamp: new Date().toISOString()
    };
    res.status(500).json(response);
  }
});

// Criar novo produto
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
    body('description').trim().notEmpty().withMessage('Descrição é obrigatória'),
    body('price').isFloat({ min: 0 }).withMessage('Preço deve ser um número positivo'),
    body('quantity').isInt({ min: 0 }).withMessage('Quantidade deve ser um número inteiro positivo'),
    body('category').trim().notEmpty().withMessage('Categoria é obrigatória')
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

      const productData: ProductCreateRequest = req.body;
      const productId = getUniqueId('product');

      const newProduct: Product = {
        id: productId,
        ...productData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      productsStorage.push(newProduct);

      const response: ApiResponse<Product> = {
        success: true,
        message: 'Produto criado com sucesso',
        data: newProduct,
        timestamp: new Date().toISOString()
      };

      res.status(201).json(response);
    } catch (error: any) {
      console.error('Erro ao criar produto:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Erro ao criar produto',
        error: error.message,
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  }
);

// Atualizar produto
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: ProductUpdateRequest = req.body;

    const index = productsStorage.findIndex(p => p.id === id);

    if (index === -1) {
      const response: ApiResponse = {
        success: false,
        message: 'Produto não encontrado',
        timestamp: new Date().toISOString()
      };
      return res.status(404).json(response);
    }

    productsStorage[index] = {
      ...productsStorage[index],
      ...updateData,
      updatedAt: new Date()
    };

    const response: ApiResponse<Product> = {
      success: true,
      message: 'Produto atualizado com sucesso',
      data: productsStorage[index],
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error: any) {
    console.error('Erro ao atualizar produto:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao atualizar produto',
      error: error.message,
      timestamp: new Date().toISOString()
    };
    res.status(500).json(response);
  }
});

// Deletar produto
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const index = productsStorage.findIndex(p => p.id === id);

    if (index === -1) {
      const response: ApiResponse = {
        success: false,
        message: 'Produto não encontrado',
        timestamp: new Date().toISOString()
      };
      return res.status(404).json(response);
    }

    productsStorage.splice(index, 1);

    const response: ApiResponse = {
      success: true,
      message: 'Produto deletado com sucesso',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error: any) {
    console.error('Erro ao deletar produto:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao deletar produto',
      error: error.message,
      timestamp: new Date().toISOString()
    };
    res.status(500).json(response);
  }
});

export default router;
