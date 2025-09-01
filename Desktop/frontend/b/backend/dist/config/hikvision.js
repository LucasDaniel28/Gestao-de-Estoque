"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverConfig = exports.securityConfig = exports.uploadConfig = exports.hikvisionConfig = void 0;
exports.hikvisionConfig = {
    ip: process.env['HIKVISION_IP'] || '192.168.15.187',
    port: parseInt(process.env['HIKVISION_PORT'] || '80'),
    username: process.env['HIKVISION_USER'] || 'admin',
    password: process.env['HIKVISION_PASS'] || 'ORBITA2025',
    protocol: process.env['HIKVISION_PROTOCOL'] || 'http',
    baseUrl: `${process.env['HIKVISION_PROTOCOL'] || 'http'}://${process.env['HIKVISION_IP'] || '192.168.15.187'}:${process.env['HIKVISION_PORT'] || '80'}`
};
exports.uploadConfig = {
    maxFileSize: parseInt(process.env['MAX_FILE_SIZE'] || '5242880'),
    allowedImageTypes: (process.env['ALLOWED_IMAGE_TYPES'] || 'image/jpeg,image/jpg').split(','),
    uploadPath: process.env['UPLOAD_PATH'] || './uploads'
};
exports.securityConfig = {
    corsOrigin: process.env['CORS_ORIGIN'] || 'http://localhost:3000',
    rateLimitWindowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000'),
    rateLimitMaxRequests: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100')
};
exports.serverConfig = {
    port: parseInt(process.env['PORT'] || '3001'),
    nodeEnv: process.env['NODE_ENV'] || 'development'
};
//# sourceMappingURL=hikvision.js.map