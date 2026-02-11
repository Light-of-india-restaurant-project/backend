const corsConfig = {
  origin: [
    'http://0.0.0.0:3001',
    'http://localhost',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:8081',
    'http://localhost:8082',
  ],
  optionsSuccessStatus: 200,
  methods: 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
  allowedHeaders: ['Content-Type', 'Authorization', 'X-ADMIN-TOKEN', 'X-SESSION'],
  credentials: true,
  preflightContinue: true,
};

export default corsConfig;
