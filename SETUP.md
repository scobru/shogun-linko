# Setup Instructions

## Quick Start

1. **Install Dependencies**
   ```bash
   cd shogun-linkthree
   yarn install
   ```

2. **Start Development Server**
   ```bash
   yarn dev
   ```
   
   The app will open at http://localhost:3000

3. **Build for Production**
   ```bash
   yarn build
   ```

## What's Been Done

✅ **Complete Project Structure Created**
- Vite + React + TypeScript configuration
- TailwindCSS integration with custom Linktree-style theme
- React Router v6 setup
- ESLint configuration
- TypeScript strict mode enabled

✅ **Core Hooks Implemented**
- `useShogun.ts` - Shogun Core integration with authentication
- `useTheme.ts` - Dark/Light theme management

✅ **Basic Pages Created**
- `EditorPage.tsx` - Page editor with auth modal
- `ViewerPage.tsx` - Page viewer

✅ **Type Definitions**
- Complete TypeScript types for all data structures
- Shogun Core types
- Component types

## Next Steps

### To Complete the Migration

1. **Create Component Editor Components**
   - `src/components/editor/ComponentList.tsx`
   - `src/components/editor/H1Component.tsx`
   - `src/components/editor/ParagraphComponent.tsx`
   - `src/components/editor/ImageComponent.tsx`
   - `src/components/editor/AvatarComponent.tsx`
   - `src/components/editor/LinkComponent.tsx`
   - `src/components/editor/SpacerComponent.tsx`
   - `src/components/editor/CodeComponent.tsx`

2. **Create Renderer Components**
   - `src/components/renderer/PageRenderer.tsx`
   - Component-specific renderers

3. **Add Data Persistence**
   - Page save/load functionality
   - Component CRUD operations
   - Real-time sync with GunDB

4. **Add Navigation Features**
   - Page navigation (prev/next/random)
   - Page list
   - Search functionality

5. **Port Code Templates**
   - MySpace, GeoCities, etc. templates
   - Template selector component

## File Structure Explanation

```
src/
├── components/       # Reusable React components
│   ├── editor/      # Editor-specific components
│   ├── renderer/    # Page rendering components
│   └── shared/      # Shared UI components
├── hooks/           # Custom React hooks
│   ├── useShogun.ts    # Shogun Core + Auth
│   └── useTheme.ts     # Theme management
├── pages/           # Route pages
│   ├── EditorPage.tsx  # Main editor
│   └── ViewerPage.tsx  # Page viewer
├── types/           # TypeScript definitions
├── utils/           # Helper functions
├── App.tsx          # Root component + Router
├── main.tsx         # Entry point
└── index.css        # Global styles
```

## Development Tips

### Hot Module Replacement (HMR)
Vite provides instant HMR. Changes to React components will update without full page reload.

### Type Checking
Run TypeScript checks separately:
```bash
yarn tsc --noEmit
```

### Linting
```bash
yarn lint
```

### Using the Legacy Code
The original `linkthree.js` file (2,840 lines) is available for reference. Each function can be converted to a React hook or component as needed.

### Theme System
The app uses CSS variables from the original `linkthree.css`. Dark/light mode is controlled by the `data-theme` attribute on the root element.

### Shogun Core Integration
The `useShogun` hook handles all Shogun Core interactions:
- Automatic session restoration from localStorage
- Login/SignUp methods
- Current user state
- GunDB instance access

## Troubleshooting

### Shogun Core not loading
Make sure the Shogun Core script is loaded. It's included via CDN in `index-new.html`.

### TypeScript errors
Check `tsconfig.json` settings. The project uses strict mode.

### Build errors
Clear cache and reinstall:
```bash
rm -rf node_modules dist
yarn install
yarn build
```

## Migration Checklist

- [x] Project setup (Vite + React + TS)
- [x] TailwindCSS configuration
- [x] Router setup
- [x] Shogun Core hook
- [x] Theme hook
- [x] Basic auth flow
- [ ] Component editor UI
- [ ] Drag & drop functionality
- [ ] Component templates
- [ ] Page save/load
- [ ] Page viewer
- [ ] Navigation system
- [ ] Delete confirmation
- [ ] Avatar upload
- [ ] Code component preview

