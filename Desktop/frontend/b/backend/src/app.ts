import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Carrega variáveis de ambiente
dotenv.config();

// Importa configurações
import { serverConfig, securityConfig, uploadConfig } from './config/hikvision';

// Importa rotas
import patientsRouter from './routes/patients';

// Cria o servidor Express
const app = express();

// Cria diretório de uploads se não existir
const uploadDir = path.join(__dirname, '..', uploadConfig.uploadPath);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração de rate limiting
const limiter = rateLimit({
  windowMs: securityConfig.rateLimitWindowMs,
  max: securityConfig.rateLimitMaxRequests,
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
  origin: securityConfig.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
app.use(limiter);

// Logging
if (serverConfig.nodeEnv === 'development') {
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
    message: 'Sistema de Cadastro Hospitalar Hikvision está funcionando',
    timestamp: res.locals.timestamp,
    version: '1.0.0',
    environment: serverConfig.nodeEnv
  });
});

// Rota de informações da API
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'API do Sistema de Cadastro Hospitalar Hikvision',
    timestamp: res.locals.timestamp,
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      patients: {
        list: 'GET /api/patients',
        create: 'POST /api/patients',
        update: 'PUT /api/patients/:employeeNo',
        delete: 'DELETE /api/patients/:employeeNo',
        uploadFace: 'POST /api/patients/:employeeNo/face',
        deleteFace: 'DELETE /api/patients/:employeeNo/face',
        status: 'GET /api/patients/status'
      }
    }
  });
});

// Rotas da API
app.use('/api/patients', patientsRouter);

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
    error: serverConfig.nodeEnv === 'development' ? error.message : 'Erro interno',
    timestamp: res.locals.timestamp
  });
});

// Inicia o servidor
const PORT = serverConfig.port;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Ambiente: ${serverConfig.nodeEnv}`);
  console.log(`🔗 API disponível em: http://localhost:${PORT}/api`);
  console.log(`🏥 Sistema de Cadastro Hospitalar Hikvision`);
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