# Shogun LinkThree - React + TypeScript Edition

A modern, Linktree-style page builder powered by GunDB and Shogun Core, built with React, TypeScript, and Vite.

## Features

- 🎨 **Linktree-inspired Design** - Clean, modern UI with dark mode support
- ⚡ **Real-time Sync** - Powered by GunDB for decentralized data storage
- 🔐 **Authentication** - Secure user authentication with Shogun Core
- 📱 **Responsive** - Mobile-first design with TailwindCSS
- 🎯 **TypeScript** - Full type safety throughout the application
- 🚀 **Fast** - Built with Vite for lightning-fast development

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Routing**: React Router v6
- **Styling**: TailwindCSS + CSS Variables
- **Database**: GunDB via Shogun Core
- **Build Tool**: Vite
- **Icons**: Font Awesome 6

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn or npm

### Installation

1. Install dependencies:
```bash
yarn install
```

2. Start the development server:
```bash
yarn dev
```

3. Build for production:
```bash
yarn build
```

4. Preview production build:
```bash
yarn preview
```

## Project Structure

```
shogun-linkthree/
├── src/
│   ├── components/      # React components
│   ├── hooks/          # Custom React hooks
│   │   ├── useShogun.ts    # Shogun Core integration
│   │   └── useTheme.ts     # Dark/Light theme management
│   ├── pages/          # Route pages
│   │   ├── EditorPage.tsx  # Page editor
│   │   └── ViewerPage.tsx  # Page viewer
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── App.tsx         # Main app component with routing
│   ├── main.tsx        # App entry point
│   └── index.css       # Global styles + Tailwind
├── index-new.html      # HTML template
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
├── tailwind.config.js  # TailwindCSS configuration
└── package.json        # Dependencies and scripts
```

## Routes

- `/` - Editor page (create/edit pages)
- `/view/:pageId` - View a specific page

## Development Notes

### Legacy Files

The following files contain the original implementation and can be used as reference:
- `linkthree.html` - Original HTML structure
- `linkthree.js` - Original JavaScript logic (2,840 lines)
- `linkthree.css` - Original CSS styles

### Migration Status

- ✅ Basic project structure
- ✅ Vite + React + TypeScript setup
- ✅ TailwindCSS integration
- ✅ Shogun Core hook
- ✅ Theme management hook
- ✅ Basic routing setup
- ✅ Authentication modal
- ✅ Component editor (H1, P, Image, Avatar, Link, Spacer, Code)
- ✅ Component renderer
- ✅ Page persistence (save/load)
- ✅ Navigation between pages (prev/next/random)
- ✅ Code templates (MySpace, GeoCities, Marquee, Guestbook, HitCounter, Rainbow, Matrix)
- ✅ Delete page functionality
- 🚧 Drag & drop (pending - can be added)

## Contributing

This is part of the Shogun ecosystem. Follow the main project's contribution guidelines.

## License

See the main Shogun project for license information.

