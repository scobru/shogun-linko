import { Routes, Route } from 'react-router-dom';
import { useShogun } from './hooks/useShogun';
import { useTheme } from './hooks/useTheme';
import { useDisclaimer } from './hooks/useDisclaimer';
import EditorPage from './pages/EditorPage';
import ViewerPage from './pages/ViewerPage';
import MyPagesPage from './pages/MyPagesPage';
import LegacyRedirect from './components/shared/LegacyRedirect';
import Disclaimer from './components/shared/Disclaimer';

function App() {
  const shogunContext = useShogun();
  const themeContext = useTheme();
  const disclaimerContext = useDisclaimer();

  if (!shogunContext.isInitialized || disclaimerContext.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--linktree-background)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4" style={{ color: 'var(--linktree-text-secondary)' }}>Loading Shogun Core...</p>
        </div>
      </div>
    );
  }

  // Show disclaimer if user hasn't agreed yet
  if (!disclaimerContext.hasAgreedToDisclaimer) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--linktree-background)' }}>
        <Disclaimer onAgree={disclaimerContext.agreeToDisclaimer} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--linktree-background)' }}>
      <LegacyRedirect />
      <Routes>
        <Route path="/" element={<EditorPage {...shogunContext} {...themeContext} />} />
        <Route path="/my-pages" element={<MyPagesPage {...shogunContext} {...themeContext} />} />
        <Route path="/view/:pageId" element={<ViewerPage {...shogunContext} {...themeContext} />} />
        {/* Catch-all route for custom slugs - must be last */}
        <Route path="/:slug" element={<ViewerPage {...shogunContext} {...themeContext} />} />
      </Routes>
    </div>
  );
}

export default App;

