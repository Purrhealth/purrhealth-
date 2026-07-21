# PurrHealth Architecture 🏗️

## Overview

PurrHealth is a modern web application with a clear separation of concerns:

```
┌─────────────────────────────────────────────────────┐
│                  Frontend (React)                    │
│              Vercel / Netlify Deploy                 │
└────────────────────┬────────────────────────────────┘
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────┐
│              Backend API (Node.js)                   │
│          Secure Authentication Layer                 │
│           (JWT + Firebase Auth)                      │
└────────────────────┬────────────────────────────────┘
                     │
         ┌───────────┼───────────┐
         ▼           ▼           ▼
    ┌────────┐  ┌─────────┐  ┌──────────┐
    │ Database│  │ Auth    │  │ External │
    │ Postgres│  │ Firebase│  │ Services │
    │Supabase │  └─────────┘  └──────────┘
    └────────┘
```

## Frontend Architecture

### Structure

```
src/
├── components/
│   ├── CatProfile/      # Cat-related components
│   ├── Appointments/    # Appointment components
│   ├── Scanner/         # Document scanner UI
│   ├── Stats/          # Analytics components
│   ├── Auth/           # Auth-related components
│   └── Common/         # Shared UI components
├── pages/              # Page-level components
├── services/
│   ├���─ api.js          # API calls
│   ├── auth.js         # Auth service
│   ├── claude.js       # Claude API integration
│   └── storage.js      # Local storage utilities
├── hooks/
│   ├── useAuth.js      # Auth hook
│   ├── useCats.js      # Cats data hook
│   └── useApi.js       # API calls hook
├── utils/
│   ├── format.js       # Date/number formatting
│   ├── validators.js   # Input validation
│   └── constants.js    # App constants
└── App.jsx            # Root component
```

### Data Flow

1. **User Action** → Component state update
2. **Component State** → API call via service
3. **API Response** → Update local state
4. **State Change** → Component re-render
5. **Render** → DOM update

### State Management

Currently uses React hooks + localStorage. Future: Redux/Zustand for complex state.

## Backend Architecture (Planned)

### API Layers

```
Request → Middleware (Auth, Validation)
    ↓
Routes (API endpoints)
    ↓
Controllers (Business logic)
    ↓
Services (Database queries, external APIs)
    ↓
Models (Database schema)
    ↓
Response
```

### Database Schema (PostgreSQL)

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  firebase_uid VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Cats table
CREATE TABLE cats (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(100) NOT NULL,
  breed VARCHAR(100),
  birthdate DATE,
  microchip VARCHAR(50),
  emoji VARCHAR(10),
  gender CHAR(1),
  weight DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Appointments table
CREATE TABLE appointments (
  id UUID PRIMARY KEY,
  cat_id UUID REFERENCES cats(id),
  type VARCHAR(50),
  date DATE NOT NULL,
  time TIME,
  veterinarian VARCHAR(100),
  clinic VARCHAR(100),
  notes TEXT,
  done BOOLEAN DEFAULT false,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Vaccines table
CREATE TABLE vaccines (
  id UUID PRIMARY KEY,
  cat_id UUID REFERENCES cats(id),
  type VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  next_date DATE,
  veterinarian VARCHAR(100),
  lot_number VARCHAR(50),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Weight records table
CREATE TABLE weight_records (
  id UUID PRIMARY KEY,
  cat_id UUID REFERENCES cats(id),
  weight DECIMAL(5,2) NOT NULL,
  date DATE NOT NULL,
  note TEXT,
  created_at TIMESTAMP
);

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  cat_id UUID REFERENCES cats(id),
  type VARCHAR(50),
  title VARCHAR(255),
  date DATE,
  veterinarian VARCHAR(100),
  clinic VARCHAR(100),
  image_url VARCHAR(500),
  extracted_data JSONB,
  resume TEXT,
  created_at TIMESTAMP
);
```

## Authentication Flow

```
1. User signs up/logs in
   ↓
2. Firebase Auth handles credentials
   ↓
3. Get ID token from Firebase
   ↓
4. Backend verifies token
   ↓
5. Generate JWT for API calls
   ↓
6. Store JWT in secure HTTP-only cookie
   ↓
7. Every API request includes JWT
```

## External Services Integration

### Anthropic Claude API
- **Purpose:** Document scanning & analysis
- **Endpoint:** `/v1/messages`
- **Model:** claude-sonnet-4-20250514
- **Use:** Extract data from veterinary documents

### Firebase Auth
- **Purpose:** User authentication
- **Services:** Sign up, login, password reset
- **Free tier:** Sufficient for MVP

### Supabase PostgreSQL
- **Purpose:** Primary database
- **Free tier:** 500MB storage
- **Benefits:** Built-in auth, real-time subscriptions

### Vercel
- **Purpose:** Frontend hosting
- **Benefits:** Git integration, auto-deploy, edge functions

## Security Considerations

1. **Authentication:** JWT + Firebase
2. **Authorization:** Role-based access control (RBAC)
3. **Data Encryption:** HTTPS + encrypted at rest
4. **Input Validation:** Client-side + server-side
5. **API Rate Limiting:** Prevent abuse
6. **CORS:** Whitelist trusted origins
7. **Environment Variables:** Never commit secrets

## Performance Optimization

1. **Frontend:**
   - Code splitting with React.lazy()
   - Image optimization
   - CSS-in-JS for critical styles
   - Memoization for expensive computations

2. **Backend:**
   - Database query optimization
   - Caching layer (Redis - future)
   - API pagination
   - Compression (gzip)

3. **General:**
   - CDN for static assets
   - Lazy loading images
   - Minification & bundling

## Deployment Pipeline

```
Git Push → GitHub Actions
    ↓
    ├─ Lint & Format Check
    ├─ Unit Tests
    ├─ Integration Tests
    └─ Build
         ↓
    Staging Deploy
         ↓
    Manual Approval
         ↓
    Production Deploy (Vercel)
```

## Future Enhancements

- [ ] PWA for offline support
- [ ] Push notifications
- [ ] Real-time sync (WebSockets)
- [ ] Advanced analytics
- [ ] Mobile app (React Native)
- [ ] Veterinary clinic integration
- [ ] Insurance claim automation
