const corsConfig = {
  origin: [
    'http://0.0.0.0:3001',
    'http://localhost',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:8080',
    'http://localhost:8081',
    'http://localhost:8082',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:8080',
    'http://[::]:8080',
  ],
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-ADMIN-TOKEN', 'X-SESSION', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  credentials: true,
  preflightContinue: false,
  maxAge: 86400, // 24 hours
};

export default corsConfig;
