"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config();
const hikvision_1 = require("./config/hikvision");
const patients_1 = __importDefault(require("./routes/patients"));
const app = (0, express_1.default)();
const uploadDir = path_1.default.join(__dirname, '..', hikvision_1.uploadConfig.uploadPath);
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const limiter = (0, express_rate_limit_1.default)({
    windowMs: hikvision_1.securityConfig.rateLimitWindowMs,
    max: hikvision_1.securityConfig.rateLimitMaxRequests,
    message: {
        success: false,
        message: 'Muitas requisições. Tente novamente mais tarde.',
        timestamp: new Date().toISOString()
    },
    standardHeaders: true,
    legacyHeaders: false
});
app.use((0, helmet_1.default)({
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
app.use((0, cors_1.default)({
    origin: hikvision_1.securityConfig.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(limiter);
if (hikvision_1.serverConfig.nodeEnv === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
else {
    app.use((0, morgan_1.default)('combined'));
}
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((req, res, next) => {
    res.locals.timestamp = new Date().toISOString();
    next();
});
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Sistema de Cadastro Hospitalar Hikvision está funcionando',
        timestamp: res.locals.timestamp,
        version: '1.0.0',
        environment: hikvision_1.serverConfig.nodeEnv
    });
});
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
app.use('/api/patients', patients_1.default);
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Rota não encontrada',
        timestamp: res.locals.timestamp,
        path: req.originalUrl
    });
});
app.use((error, req, res, next) => {
    console.error('Erro não tratado:', error);
    res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: hikvision_1.serverConfig.nodeEnv === 'development' ? error.message : 'Erro interno',
        timestamp: res.locals.timestamp
    });
});
const PORT = hikvision_1.serverConfig.port;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📊 Ambiente: ${hikvision_1.serverConfig.nodeEnv}`);
    console.log(`🔗 API disponível em: http://localhost:${PORT}/api`);
    console.log(`🏥 Sistema de Cadastro Hospitalar Hikvision`);
    console.log(`📅 ${new Date().toLocaleString('pt-BR')}`);
});
process.on('SIGTERM', () => {
    console.log('SIGTERM recebido. Encerrando servidor...');
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('SIGINT recebido. Encerrando servidor...');
    process.exit(0);
});
exports.default = app;
//# sourceMappingURL=app.js.map