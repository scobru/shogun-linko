import { Routes, Route } from 'react-router-dom';
import { useShogun } from './hooks/useShogun';
import { useTheme } from './hooks/useTheme';
import { useDisclaimer } from './hooks/useDisclaimer';
import { FullscreenProvider, useFullscreen } from './contexts/FullscreenContext';
import EditorPage from './pages/EditorPage';
import ViewerPage from './pages/ViewerPage';
import MyPagesPage from './pages/MyPagesPage';
import AboutPage from './pages/AboutPage';
import LegacyRedirect from './components/shared/LegacyRedirect';
import Disclaimer from './components/shared/Disclaimer';

function AppContent() {
  const shogunContext = useShogun();
  const themeContext = useTheme();
  const disclaimerContext = useDisclaimer();
  const { isFullscreen } = useFullscreen();

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
        <Route path="/about" element={<AboutPage />} />
        <Route path="/view/:pageId" element={<ViewerPage {...shogunContext} {...themeContext} />} />
        {/* Catch-all route for custom slugs - must be last */}
        <Route path="/:slug" element={<ViewerPage {...shogunContext} {...themeContext} />} />
      </Routes>
      {!isFullscreen && (
        <footer className="w-full py-5 px-1 mt-auto">
        <div className="w-full">
          <ul className="menu menu-horizontal w-full">
            <div className="flex justify-center items-center gap-2 text-sm w-full">
              <div className="text-center">
                <a href="https://github.com/scobru/shogun-linko" target="_blank" rel="noreferrer" className="link">
                  Fork me
                </a>
              </div>
              <span>·</span>
              <div className="flex justify-center items-center gap-2">
                <p className="m-0 text-center">
                  Built with 
                  <svg xmlns="http://www.w3.org/2000/svg" className="inline-block h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  at
                </p>
                <a
                  className="flex justify-center items-center gap-1"
                  href="https://shogun-eco.xyz/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="link">Shogun Ecosystem</span>
                </a>
                <span>·</span>
                <span className="text-center">by <a href="https://github.com/scobru" target="_blank" rel="noreferrer" className="link">scobru</a></span>
              </div>
              <span>·</span>
              <div className="text-center">
                <a href="https://t.me/shogun_eco" target="_blank" rel="noreferrer" className="link">
                  Support
                </a>
              </div>
            </div>
          </ul>
        </div>
      </footer>
      )}
    </div>
  );
}

function App() {
  return (
    <FullscreenProvider>
      <AppContent />
    </FullscreenProvider>
  );
}

export default App;

