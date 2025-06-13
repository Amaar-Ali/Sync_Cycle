# SyncCycle - Period Tracking App

A modern, user-friendly period tracking application built with React, TypeScript, and Firebase.

## Features

- User authentication (email/password and Firebase)
- Period tracking and logging
- Calendar view for cycle visualization
- Insights and analytics
- Relief ideas for period symptoms
- Admin panel for administrators

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Radix UI
- **Backend**: Firebase (Authentication, Firestore)
- **Deployment**: Vercel

## Deployment Guide

### 1. Clone the repository

```bash
git clone https://github.com/Amaar-Ali/Sync_Cycle.git
cd Sync_Cycle
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Firebase

1. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Get your Firebase configuration from Project Settings > General > Your Apps > SDK setup and configuration
5. Update the Firebase configuration in `src/config/firebase.ts`

### 4. Run locally

```bash
npm run dev
```

### 5. Deploy to Vercel

#### Option 1: Using Vercel Dashboard

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com/) and sign up/login
3. Click "New Project" and import your GitHub repository
4. Configure project settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add environment variables if needed (you can securely store Firebase config values)
6. Click "Deploy"

#### Option 2: Using Vercel CLI

1. Install Vercel CLI: `npm install -g vercel`
2. Run `vercel login` and follow the instructions
3. Run `vercel` in the project directory and follow the prompts
4. For production deployment, run `vercel --prod`

### 6. Set up a custom domain (optional)

1. In the Vercel dashboard, go to your project
2. Click on "Settings" > "Domains"
3. Add your custom domain and follow the instructions

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## License

[MIT](LICENSE)
