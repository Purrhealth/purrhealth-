# PurrHealth 🐾

**Carnet de santé intelligent pour chats** - Smart health notebook for cats

## 📋 About

PurrHealth is a comprehensive pet health management application designed specifically for cat owners. Track vaccinations, appointments, weight, medical documents, and more in one secure place.

## ✨ Features

### Current
- 🐱 **Cat Profiles** - Store breed, age, weight, microchip info
- 📅 **Appointment Management** - Schedule & track vet visits
- ⚖️ **Weight Tracking** - Visual curves for multiple cats
- 💉 **Vaccination Records** - Track vaccines & reminders
- 📄 **Document Scanner** - AI-powered document analysis
- 🌍 **Multi-Language** - French & English support
- 🎨 **Modern UI** - Beautiful dark theme interface

### Upcoming
- 🔐 **User Authentication** - Secure login & cloud sync
- ☁️ **Cloud Database** - Sync across devices
- 📧 **Email/SMS Alerts** - Appointment reminders
- 🏥 **Vet Integration** - Share profiles with veterinarians
- 💊 **Medication Tracking** - Dosage schedules & reminders
- 📊 **Advanced Analytics** - Health insights & predictions

## 🛠️ Tech Stack

### Frontend
- **React** (v18+)
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Anthropic Claude API** - Document scanning

### Backend (In Progress)
- **Node.js + Express** - API server
- **PostgreSQL** (Supabase) - Database
- **Firebase Auth** - Authentication
- **JWT** - Token-based auth

## 📁 Project Structure

```
purrhealth-/
├── frontend/              # React application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API & external services
│   │   ├── hooks/        # Custom React hooks
│   │   ├── utils/        # Utility functions
│   │   ├── styles/       # Global styles
│   │   └── App.jsx       # Main app component
│   ├── package.json
│   └── vite.config.js
├── backend/               # Node.js/Express API (Coming Soon)
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   ├── controllers/  # Business logic
│   │   ├── models/       # Database models
│   │   ├── middleware/   # Auth, validation
│   │   ├── config/       # Configuration
│   │   └── server.js     # Entry point
│   └── package.json
├── docs/                  # Documentation
│   ├── API.md            # API documentation
│   ├── SETUP.md          # Setup instructions
│   └── ARCHITECTURE.md   # Architecture overview
├── .github/
│   └── workflows/        # CI/CD pipelines
├── .env.example
├── .gitignore
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- Vercel account (for hosting)
- Anthropic API key (for document scanning)

### Frontend Setup

```bash
# Clone repository
git clone https://github.com/Purrhealth/purrhealth-.git
cd purrhealth-

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Add your Anthropic API key
echo "VITE_ANTHROPIC_API_KEY=your_api_key_here" >> .env.local

# Start development server
npm run dev
```

Visit `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## 🔑 Environment Variables

```env
# Frontend (.env.local)
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_API_URL=http://localhost:3001

# Backend (.env)
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret_key
FIREBASE_ADMIN_SDK=...
ANTHROPIC_API_KEY=sk-ant-...
NODE_ENV=development
```

## 📚 Documentation

- [API Documentation](./docs/API.md)
- [Setup Guide](./docs/SETUP.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Contributing](./CONTRIBUTING.md)

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## 📄 License

MIT License - feel free to use this project!

## 🐛 Issues & Support

- Report bugs: [GitHub Issues](https://github.com/Purrhealth/purrhealth-/issues)
- Feature requests: [GitHub Discussions](https://github.com/Purrhealth/purrhealth-/discussions)

## 🙏 Credits

Built with ❤️ for cat lovers everywhere 🐱

---

**Live Demo:** https://purrhealth.vercel.app
