# Quick Start Guide

## Prerequisites

- Node.js 20+
- npm 9+
- Docker and Docker Compose (for database)

## Setup Steps

### 1. Install Dependencies

```bash
# From project root
npm install
```

### 2. Start Database

```bash
# Start PostgreSQL container
npm run docker:up

# Wait a few seconds for the database to be ready
```

### 3. Backend Setup

```bash
cd apps/backend

# Create .env file
cp .env.example .env

# Edit .env and set:
# DATABASE_URL=postgresql://lifeworld:lifeworld_dev@localhost:5432/lifeworld
# JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
# PORT=3001

# Generate Prisma client
npm run generate

# Run database migrations
npm run migrate

# Seed the database (optional)
npm run seed

# Start backend server
npm run dev
```

The backend will run on `http://localhost:3001`

### 4. Frontend Setup

```bash
# In a new terminal, from project root
cd apps/frontend

# Create .env file
echo "VITE_API_URL=http://localhost:3001" > .env

# Start frontend dev server
npm run dev
```

The frontend will run on `http://localhost:5173`

### 5. Access the Application

Open your browser and navigate to `http://localhost:5173`

## Quick Start (Both Services)

From the root directory:

```bash
# Install dependencies
npm install

# Start database
npm run docker:up

# Setup backend (in apps/backend)
cd apps/backend
cp .env.example .env
# Edit .env with your settings
npm run generate
npm run migrate

# Start both frontend and backend
cd ../..
npm run dev
```

## Environment Variables

### Backend (.env in apps/backend/)

```env
DATABASE_URL=postgresql://lifeworld:lifeworld_dev@localhost:5432/lifeworld
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=7d
NODE_ENV=development
PORT=3001
```

### Frontend (.env in apps/frontend/)

```env
VITE_API_URL=http://localhost:3001
```

## Development Commands

### From Root Directory

```bash
npm run dev              # Start both frontend and backend
npm run build            # Build all apps
npm run docker:up        # Start PostgreSQL container
npm run docker:down      # Stop PostgreSQL container
npm run migrate          # Run database migrations
npm run seed             # Seed database
npm run studio           # Open Prisma Studio
```

### Backend Only

```bash
cd apps/backend
npm run dev              # Development server with hot reload
npm run build            # Build for production
npm run start            # Start production server
npm run migrate          # Run database migrations
npm run generate         # Generate Prisma client
npm run seed             # Seed database
npm run studio           # Open Prisma Studio
```

### Frontend Only

```bash
cd apps/frontend
npm run dev              # Development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run type-check       # Type check without building
```

## Troubleshooting

### Database Connection Issues

- Ensure Docker is running: `docker ps`
- Check if PostgreSQL container is up: `docker ps | grep postgres`
- Verify DATABASE_URL in backend/.env matches docker-compose.yml

### Port Already in Use

- Backend default: 3001 - change PORT in backend/.env
- Frontend default: 5173 - change in vite.config.ts
- PostgreSQL default: 5432 - change in docker-compose.yml

### Prisma Issues

- Reset database: `npm run docker:down && npm run docker:up`
- Re-run migrations: `cd apps/backend && npm run migrate`
- Regenerate client: `cd apps/backend && npm run generate`

## Next Steps

1. Register a new account
2. Explore the dashboard
3. Record your first activity to earn XP
4. Check your category levels and balance
5. Manage your engines and resources


