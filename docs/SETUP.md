# Setup Guide - PurrHealth 🐾

## Prerequisites

- **Node.js** 16+ ([Download](https://nodejs.org))
- **npm** or **yarn** (comes with Node.js)
- **Git** ([Download](https://git-scm.com))
- **Text Editor** (VS Code recommended)
- **Anthropic API Key** ([Get here](https://console.anthropic.com))

## Step 1: Clone the Repository

```bash
git clone https://github.com/Purrhealth/purrhealth-.git
cd purrhealth-
```

## Step 2: Install Dependencies

```bash
npm install
# or
yarn install
```

## Step 3: Get API Keys

### Anthropic API Key (for document scanning)

1. Visit [Anthropic Console](https://console.anthropic.com)
2. Sign up/login
3. Create new API key
4. Copy the key (starts with `sk-ant-`)

## Step 4: Setup Environment Variables

```bash
# Copy example file
cp .env.example .env.local

# Edit .env.local and add your API key
VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here
```

## Step 5: Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Step 6: Verify Installation

1. Open browser to `http://localhost:5173`
2. Should see PurrHealth homepage
3. Try adding a cat profile
4. Test document scanning feature

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 5173
lsof -i :5173

# Kill process
kill -9 <PID>

# Or use different port
npm run dev -- --port 3000
```

### API Key Issues

```bash
# Verify .env.local is in .gitignore
cat .gitignore | grep .env

# Check environment variable
echo $VITE_ANTHROPIC_API_KEY

# Should not be empty
```

### Node Modules Issues

```bash
# Clear cache
npm cache clean --force

# Reinstall
rm -rf node_modules package-lock.json
npm install
```

### Vite Build Issues

```bash
# Clear Vite cache
rm -rf .vite

# Try again
npm run dev
```

## Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint (when added)
npm run format     # Format code with Prettier (when added)
```

## Next Steps

1. **Explore the code:** Check `src/App.jsx`
2. **Read architecture:** See `docs/ARCHITECTURE.md`
3. **Start developing:** Create feature branches
4. **Join discussions:** GitHub Discussions

## Need Help?

- 📖 Check [README.md](../README.md)
- 🏗️ Review [ARCHITECTURE.md](./ARCHITECTURE.md)
- 🤝 Open [GitHub Issue](https://github.com/Purrhealth/purrhealth-/issues)
- 💬 Start [Discussion](https://github.com/Purrhealth/purrhealth-/discussions)
