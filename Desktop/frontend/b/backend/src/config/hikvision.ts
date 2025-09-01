import { HikvisionConfig } from '../types';

/**
 * Configuração do dispositivo Hikvision DS-K1T342MFWX
 * As variáveis são carregadas do arquivo .env
 */
export const hikvisionConfig: HikvisionConfig = {
  ip: process.env['HIKVISION_IP'] || '192.168.15.187',
  port: parseInt(process.env['HIKVISION_PORT'] || '80'),
  username: process.env['HIKVISION_USER'] || 'admin',
  password: process.env['HIKVISION_PASS'] || 'ORBITA2025',
  protocol: process.env['HIKVISION_PROTOCOL'] || 'http',
  baseUrl: `${process.env['HIKVISION_PROTOCOL'] || 'http'}://${process.env['HIKVISION_IP'] || '192.168.15.187'}:${process.env['HIKVISION_PORT'] || '80'}`
};

/**
 * Configurações de upload de imagens
 */
export const uploadConfig = {
  maxFileSize: parseInt(process.env['MAX_FILE_SIZE'] || '5242880'), // 5MB
  allowedImageTypes: (process.env['ALLOWED_IMAGE_TYPES'] || 'image/jpeg,image/jpg').split(','),
  uploadPath: process.env['UPLOAD_PATH'] || './uploads'
};

/**
 * Configurações de segurança
 */
export const securityConfig = {
  corsOrigin: process.env['CORS_ORIGIN'] || 'http://localhost:3000',
  rateLimitWindowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000'), // 15 minutos
  rateLimitMaxRequests: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100')
};

/**
 * Configurações do servidor
 */
export const serverConfig = {
  port: parseInt(process.env['PORT'] || '3001'),
  nodeEnv: process.env['NODE_ENV'] || 'development'
}; 