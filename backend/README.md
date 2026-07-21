# PurrHealth Backend API 🐾

Production-ready Node.js/Express server for the PurrHealth application.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- PostgreSQL 12+ (or Supabase)
- npm or yarn

### Installation

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env

# Start development server
npm run dev
```

Server runs on `http://localhost:3001`

## 📋 Available Scripts

```bash
npm run dev           # Start with nodemon (auto-reload)
npm start             # Start production server
npm test              # Run tests
npm run lint          # Check code style
npm run lint:fix      # Auto-fix style issues
npm run format        # Format code with Prettier
```

## 📁 Project Structure

```
src/
├── server.js              # Express app setup
├── middleware/            # Request processing
│   ├── errorHandler.js    # Global error handling
│   ├── authMiddleware.js  # JWT authentication
│   └── validation.js      # Input validation
├── routes/                # API endpoints
│   ├── health.js          # Health checks
│   └── auth.js            # Authentication
├── utils/                 # Helper functions
│   ├── jwt.js             # Token generation
│   └── validators.js      # Validation utilities
└── constants/
    └── index.js           # App constants
```

## 🔌 API Endpoints (Phase 1)

### Health Check
```
GET /api/health           # Server status
GET /api/health/ready     # Readiness probe
GET /api/health/live      # Liveness probe
```

### Authentication (Placeholder)
```
POST /api/auth/signup     # Register new user
POST /api/auth/login      # User login
POST /api/auth/logout     # User logout
POST /api/auth/refresh    # Refresh token
GET  /api/auth/me         # Get current user
```

## 🔐 Environment Variables

Required variables in `.env`:

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret_key
FIREBASE_PROJECT_ID=...
ANTHROPIC_API_KEY=sk-ant-...
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## 📝 Code Style

- **ESLint** - Code quality
- **Prettier** - Code formatting
- **2 spaces** indentation
- **Single quotes** for strings
- **Semicolons** required

## 🔒 Security

- Helmet.js for security headers
- CORS properly configured
- JWT authentication
- Input validation & sanitization
- Rate limiting (coming Phase 2)
- Environment variables for secrets

## 📚 Documentation

Detailed docs coming:
- API Documentation (Swagger/OpenAPI)
- Database Schema
- Authentication Flow
- Error Handling Guide

## 🐛 Troubleshooting

### Port Already in Use
```bash
lsof -i :3001
kill -9 <PID>
```

### Module Not Found
```bash
rm -rf node_modules package-lock.json
npm install
```

### Database Connection Error
- Check `DATABASE_URL` in `.env`
- Verify PostgreSQL is running
- Check credentials

## 🤝 Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## 📞 Support

- Issues: GitHub Issues
- Discussions: GitHub Discussions
- Docs: See `/docs` folder

---

**🐾 Made with ❤️ for cat lovers everywhere**
