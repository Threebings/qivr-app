# QIVR App

A modern healthcare companion application built with React, TypeScript, and Vite, featuring Supabase integration for secure data management.

## Features

- 🏥 Medical Records Management
- 📊 ODI Assessment Tools
- 🎯 Exercise Guides
- 👨‍⚕️ Healthcare Provider Directory
- 📱 Patient Check-ins
- 🔔 Smart Notifications
- 📈 Progress Tracking
- 🤝 Provider Referral System

## Prerequisites

- Node.js 18.x or later
- npm 9.x or later
- Supabase account for backend services

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Installation

```bash
# Install dependencies
npm ci

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Development

```bash
# Type checking
npm run typecheck

# Lint code
npm run lint
```

## Project Structure

- `/src` - Application source code
  - `/components` - Reusable UI components
  - `/contexts` - React contexts (Auth, etc.)
  - `/lib` - Utility functions and configurations
  - `/pages` - Application routes and pages
- `/public` - Static assets
- `/supabase` - Database migrations and configurations

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Tech Stack

- React 18.3
- TypeScript 5.5
- Vite 5.4
- TailwindCSS 3.4
- Supabase
- ESLint 9.9