# Backend Template

A clean **Node.js + Express + TypeScript + MongoDB** backend template with authentication, validation, and common utilities.

## Features

- ✅ User Registration & Login (JWT-based)
- ✅ Email Verification & Password Reset
- ✅ OTP System
- ✅ Zod Validation
- ✅ Centralized Error Handling
- ✅ Winston Logging
- ✅ File Upload (AWS S3)
- ✅ Email Service (AWS SES)
- ✅ Role-based Middleware (customizable)
- ✅ ESLint + Prettier
- ✅ Husky Git Hooks

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB (Mongoose)
- **Validation:** Zod
- **Logging:** Winston
- **Auth:** JWT (jsonwebtoken)

## Getting Started

### Prerequisites

- Node.js v18+
- pnpm (or npm)
- MongoDB instance

### Installation

```bash
# Clone the repo
git clone <repo-url>
cd backend-template

# Install dependencies
pnpm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Run development server
pnpm dev
```

### Environment Variables

Create a `.env` file (see `.env.example`):

```env
PORT=3000
ENVIRONMENT=development
DB_URI=mongodb://localhost:27017
ACCESS_TOKEN_PRIVATE_KEY=your-access-token-key
REFRESH_TOKEN_PRIVATE_KEY=your-refresh-token-key
```

## Project Structure

```
src/
├── app.ts              # Entry point
├── server.ts           # Server setup with middleware chain
├── config/             # Configuration (DB, CORS, Server)
├── constant/           # Enums and error messages
├── controllers/        # Request handlers
├── interfaces/         # TypeScript interfaces
├── middleware/         # Express middlewares
├── models/             # Mongoose schemas
├── repositories/       # Database access layer
├── routes/             # API route definitions
├── services/           # Business logic
├── utils/              # Utility functions
├── validators/         # Zod validation schemas
└── templates/          # Email templates
```

## Request Flow Pattern

```
Route → Validator → Controller → Service → Repository → Model
```

## Adding a New Feature

### 1. Create Model (`src/models/product/product.model.ts`)

```typescript
import { Schema, model } from 'mongoose';
import type { Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  price: number;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { timestamps: true }
);

export const ProductModel = model<IProduct>('product', productSchema);
```

### 2. Create Repository (`src/repositories/product/product.repository.ts`)

```typescript
import { ProductModel } from '../../models/product/product.model';
import type { IProduct } from '../../models/product/product.model';

const create = async (data: Partial<IProduct>): Promise<IProduct> => {
  return ProductModel.create(data);
};

const findById = async (id: string): Promise<IProduct | null> => {
  return ProductModel.findById(id);
};

const ProductRepository = { create, findById };
export default ProductRepository;
```

### 3. Create Service (`src/services/product/product.service.ts`)

```typescript
import { DynamicMessages } from '../../constant/error';
import ProductRepository from '../../repositories/product/product.repository';
import createError from '../../utils/http.error';

const createProduct = async (payload: any) => {
  return ProductRepository.create(payload);
};

const getProductById = async (id: string) => {
  const product = await ProductRepository.findById(id);
  if (!product) {
    throw createError(404, DynamicMessages.notFoundMessage('Product'));
  }
  return product;
};

const ProductService = { createProduct, getProductById };
export default ProductService;
```

### 4. Create Controller (`src/controllers/product/product.controller.ts`)

```typescript
import { DynamicMessages } from '../../constant/error';
import ProductService from '../../services/product/product.service';
import type { Request, Response, NextFunction } from 'express';

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await ProductService.createProduct(req.body);
    res.status(201).json({
      success: true,
      message: DynamicMessages.createMessage('Product'),
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const ProductController = { create };
export default ProductController;
```

### 5. Create Validator (`src/validators/product.validator.ts`)

```typescript
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().positive('Price must be positive'),
});

const ProductValidator = { createSchema };
export default ProductValidator;
```

### 6. Create Route (`src/routes/v1/product.routes.ts`)

```typescript
import { Router } from 'express';
import ProductController from '../../controllers/product/product.controller';
import { validateRequestBody } from '../../middleware/validation.middleware';
import ProductValidator from '../../validators/product.validator';

const productRouter = Router();

productRouter.post('/', validateRequestBody(ProductValidator.createSchema), ProductController.create);

export default productRouter;
```

### 7. Register Route (`src/routes/v1/v1.routes.ts`)

```typescript
import productRouter from './product.routes';
v1Router.use('/products', productRouter);
```

## Available Middleware

| Middleware | Usage |
|------------|-------|
| `authenticationMiddleware` | JWT authentication |
| `validateRequestBody` | Zod body validation |
| `validateRequestParams` | Zod params validation |
| `validateRequestQuery` | Zod query validation |
| `requireRole` | Role-based access (customizable) |
| `requireAdmin` | Admin-only access |
| `requireOwnership` | Resource ownership check |

## Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm lint         # Run ESLint
pnpm lint:fix     # Fix ESLint issues
pnpm prettier:fix # Format code
pnpm style:fix    # Run all style fixes
```

## Customization Checklist

- [ ] Update `src/constant/enum.ts` - Change `APP_NAME` and user roles
- [ ] Update `src/config/db.config.ts` - Change `dbPrefix` for database name
- [ ] Update `package.json` - Change name and description
- [ ] Create `.env` from `.env.example`

## License

ISC
