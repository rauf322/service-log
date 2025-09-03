# Service Log

A modern React application for managing service logs with draft functionality, filtering, and persistent storage. Built with React 19, TypeScript, and Redux Toolkit.

## ✨ Features

- **Service Log Management**: Create, edit, and manage service logs
- **Draft System**: Auto-save drafts with persistent storage
- **Advanced Filtering**: Filter logs by various criteria
- **Responsive Design**: Works seamlessly across devices
- **Type-Safe**: Full TypeScript support
- **State Management**: Redux Toolkit for predictable state updates
- **Client-Side Routing**: TanStack Router for smooth navigation
- **Data Fetching**: TanStack Query for efficient data management

## 🚀 Tech Stack

- **React 19** - Latest React with concurrent features
- **TypeScript 5.7** - Type safety and developer experience
- **Redux Toolkit** - Simplified Redux for state management
- **TanStack Router** - Type-safe routing
- **TanStack Query** - Server state management
- **Vite** - Fast build tool and dev server
- **ESLint** - Code quality and consistency

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── DraftManager/    # Draft management functionality
│   ├── SavedLogs/       # Saved logs display
│   ├── ServiceLogForm/  # Main log form
│   ├── Toast/          # Notification system
│   └── logsFilter/     # Log filtering components
├── hooks/              # Custom React hooks
├── lib/                # Third-party library configurations
├── routes/             # Route components
├── store/              # Redux store and slices
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## 🛠️ Getting Started

### Installation

1. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 📜 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run lint` - Run ESLint for code quality checks
- `npm run preview` - Preview production build locally

## 🏗️ Development

### Code Style

- **TypeScript**: Strict mode enabled with comprehensive type checking
- **ESLint**: Configured with React and TypeScript rules
- **Import Style**: Relative imports with file extensions
- **Component Style**: Functional components with TypeScript interfaces

### State Management

The application uses Redux Toolkit with the following structure:

- `store/features/drafts/` - Draft management state
- `store/features/serviceForm/` - Service form state

### Routing

Built with TanStack Router for type-safe navigation:

- `/` - Main service log form
- `/saved` - Saved logs view
- `/drafts` - Draft management

### Data Persistence

- **IndexedDB**: For offline draft storage
- **Local Storage**: For user preferences and settings


