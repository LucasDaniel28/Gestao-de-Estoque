import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Carrega variáveis de ambiente
dotenv.config();

// Inicializa dados de exemplo
import { initializeData } from './data/storage';
initializeData();

// Importa rotas
import productsRouter from './routes/products';
import salesRouter from './routes/sales';

// Cria o servidor Express
const app = express();

// Configuração de rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por windowMs
  message: {
    success: false,
    message: 'Muitas requisições. Tente novamente mais tarde.',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Middlewares de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// Configuração CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
app.use(limiter);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para adicionar timestamp em todas as respostas
app.use((req, res, next) => {
  res.locals.timestamp = new Date().toISOString();
  next();
});

// Rota de health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Sistema Depósito está funcionando',
    timestamp: res.locals.timestamp,
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rota de informações da API
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'API do Sistema Depósito',
    timestamp: res.locals.timestamp,
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      products: {
        list: 'GET /api/products',
        get: 'GET /api/products/:id',
        create: 'POST /api/products',
        update: 'PUT /api/products/:id',
        delete: 'DELETE /api/products/:id'
      },
      sales: {
        list: 'GET /api/sales',
        get: 'GET /api/sales/:id',
        create: 'POST /api/sales',
        getPDF: 'GET /api/sales/:id/pdf'
      }
    }
  });
});

// Rotas da API
app.use('/api/products', productsRouter);
app.use('/api/sales', salesRouter);

// Middleware para tratamento de rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
    timestamp: res.locals.timestamp,
    path: req.originalUrl
  });
});

// Middleware global para tratamento de erros
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro não tratado:', error);
  
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno',
    timestamp: res.locals.timestamp
  });
});

// Inicia o servidor
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API disponível em: http://localhost:${PORT}/api`);
  console.log(`📦 Sistema Depósito`);
  console.log(`📅 ${new Date().toLocaleString('pt-BR')}`);
});

// Tratamento de sinais para graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido. Encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT recebido. Encerrando servidor...');
  process.exit(0);
});

export default app;
