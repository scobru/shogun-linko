import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useShogun } from './hooks/useShogun';
import { useTheme } from './hooks/useTheme';
import { useDisclaimer } from './hooks/useDisclaimer';
import EditorPage from './pages/EditorPage';
import ViewerPage from './pages/ViewerPage';
import MyPagesPage from './pages/MyPagesPage';
import AboutPage from './pages/AboutPage';
import LegacyRedirect from './components/shared/LegacyRedirect';
import Disclaimer from './components/shared/Disclaimer';

import { sitesData, mountOnionRing } from 'shogun-onion';
import 'shogun-onion/onion.css';

function App() {
  const shogunContext = useShogun();
  const themeContext = useTheme();
  const disclaimerContext = useDisclaimer();

  // Mount onion widget once app is ready and disclaimer is accepted
  useEffect(() => {
    // Only mount if disclaimer is accepted (element will be in DOM)
    if (!disclaimerContext.hasAgreedToDisclaimer) return;
    
    async function mount() {
      try {
        // Wait for the element to exist in DOM
        let attempts = 0;
        const maxAttempts = 50;
        while (attempts < maxAttempts) {
          const element = document.getElementById('shogun-ring');
          if (element) {
            await mountOnionRing({
              ringName: 'Shogun Network',
              ringID: 'shogun-ring',
              useIndex: true,
              useRandom: true,
              sitesData: sitesData,
            });
            console.log('onion widget mounted');
            return;
          }
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        console.warn('onion widget: element #shogun-ring not found after', maxAttempts * 100, 'ms');
      } catch (err) {
        // Silently ignore if package not installed yet
        console.debug('onion widget not mounted:', err);
      }
    }
    mount();
    return () => {
        console.log('onion widget unmounted');
    };
  }, [disclaimerContext.hasAgreedToDisclaimer]);

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
      {/* Onion ring widget mount point */}
      <div id="shogun-ring"></div>
    </div>
  );
}

export default App;

