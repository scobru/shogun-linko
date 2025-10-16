import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ShogunCoreInstance, UserInfo, ComponentData, ComponentType } from '../types';
import type { Theme } from '../hooks/useTheme';
import { useUserAvatar } from '../hooks/useUserAvatar';
import { slugify, isValidSlug, isSlugAvailable } from '../utils/slugify';
import Header from '../components/shared/Header';
import AuthModal from '../components/shared/AuthModal';
import ComponentWrapper from '../components/editor/ComponentWrapper';

interface EditorPageProps {
  shogun: ShogunCoreInstance | null;
  currentUser: UserInfo | null;
  isLoggedIn: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  theme: Theme;
  toggleTheme: () => void;
}

export default function EditorPage({
  shogun,
  currentUser,
  isLoggedIn,
  login,
  signUp,
  logout,
  theme,
  toggleTheme,
}: EditorPageProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pageTitle, setPageTitle] = useState('');
  const [pageSlug, setPageSlug] = useState('');
  const [slugError, setSlugError] = useState('');
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [components, setComponents] = useState<ComponentData[]>([]);
  const [deletedComponentIds] = useState<Set<string>>(new Set()); // Track deleted components
  const [currentPageId, setCurrentPageId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [searchParams] = useSearchParams();
  const { avatarUrl, uploadAvatar } = useUserAvatar(shogun, currentUser);

  // Load page from URL if editing, or add sample components
  useEffect(() => {
    const pageParam = searchParams.get('edit');
    if (pageParam && shogun) {
      loadPageForEdit(pageParam);
    }
    // Don't add sample components here to avoid duplicate key warnings
    // They will be added on first render below
  }, [searchParams, shogun]);

  // Initialize with sample components only once on mount (not when editing)
  useEffect(() => {
    if (!searchParams.get('edit') && components.length === 0 && !currentPageId) {
      // Add sample components for new pages
      const h1Component: ComponentData = {
        type: 'h1',
        id: generateComponentId(),
        order: 0,
        alignment: 'center',
        content: '',
      };
      const pComponent: ComponentData = {
        type: 'p',
        id: generateComponentId(),
        order: 1,
        alignment: 'justify',
        content: '',
      };
      setComponents([h1Component, pComponent]);
    }
  }, []); // Run only once on mount

  const generateComponentId = () => {
    return 'comp_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const addComponent = (type: ComponentType) => {
    const newComponent: ComponentData = {
      type,
      id: generateComponentId(),
      order: components.length,
    };

    // Set default values based on type
    if (type === 'h1') {
      newComponent.alignment = 'center';
      newComponent.content = '';
    } else if (type === 'p') {
      newComponent.alignment = 'justify';
      newComponent.content = '';
    } else if (type === 'spacer') {
      newComponent.height = '16px';
    }

    setComponents([...components, newComponent]);
  };

  const updateComponent = (id: string, updates: Partial<ComponentData>) => {
    setComponents(components.map(comp =>
      comp.id === id ? { ...comp, ...updates } : comp
    ));
  };

  const moveComponentUp = (id: string) => {
    const index = components.findIndex(c => c.id === id);
    if (index > 0) {
      const newComponents = [...components];
      [newComponents[index - 1], newComponents[index]] = [newComponents[index], newComponents[index - 1]];
      // Update order
      newComponents.forEach((comp, idx) => comp.order = idx);
      setComponents(newComponents);
    }
  };

  const moveComponentDown = (id: string) => {
    const index = components.findIndex(c => c.id === id);
    if (index < components.length - 1) {
      const newComponents = [...components];
      [newComponents[index], newComponents[index + 1]] = [newComponents[index + 1], newComponents[index]];
      // Update order
      newComponents.forEach((comp, idx) => comp.order = idx);
      setComponents(newComponents);
    }
  };

  const removeComponent = (id: string) => {
    // Add to deleted set
    deletedComponentIds.add(id);
    
    // Remove from local state
    setComponents(components.filter(c => c.id !== id).map((comp, idx) => ({
      ...comp,
      order: idx
    })));

    // Mark as deleted in database if we're editing an existing page
    if (currentPageId && shogun) {
      const deletedData = { deleted: true, deletedAt: Date.now() };
      shogun.db.get(id).put(deletedData);
      shogun.db.get('pages').get(currentPageId).get('components').get(id).put(deletedData);
      console.log('Component marked as deleted in DB:', id);
    }
  };

  const checkSlugAvailability = async (slug: string) => {
    if (!shogun || !slug) return true;

    setIsCheckingSlug(true);
    try {
      return new Promise<boolean>((resolve) => {
        shogun.db.get('slugs').get(slug).once((existingPageId: string) => {
          // Slug is available if it doesn't exist or if it's the current page
          const available = !existingPageId || existingPageId === currentPageId;
          resolve(available);
        });
        // Timeout after 1 second
        setTimeout(() => resolve(true), 1000);
      });
    } finally {
      setIsCheckingSlug(false);
    }
  };

  const handleSlugChange = async (value: string) => {
    const sanitized = slugify(value);
    setPageSlug(sanitized);
    setSlugError('');

    if (!sanitized) return;

    // Validate format
    if (!isValidSlug(sanitized)) {
      setSlugError('Solo lettere minuscole, numeri e trattini');
      return;
    }

    // Check if reserved
    if (!isSlugAvailable(sanitized)) {
      setSlugError('Questo slug è riservato');
      return;
    }

    // Check database availability
    const available = await checkSlugAvailability(sanitized);
    if (!available) {
      setSlugError('Questo slug è già in uso');
    }
  };

  const loadPageForEdit = async (pageId: string) => {
    if (!shogun) return;

    // Clear existing components and deleted tracking
    setComponents([]);
    deletedComponentIds.clear(); // Reset deleted tracking for new page
    setCurrentPageId(pageId);

    try {
      const pageNode = shogun.db.get('pages').get(pageId);

      pageNode.get('title').once((title: string) => {
        if (title) setPageTitle(title);
      });

      pageNode.get('slug').once((slug: string) => {
        if (slug) setPageSlug(slug);
      });

      const loadedComponentsMap = new Map<string, ComponentData>();
      let hasLoadedComponents = false;
      
      // Use .map().once() but with a flag to prevent re-adding
      pageNode.get('components').map().once((compData: any, compId: string) => {
        // Skip if:
        // - Data is null/undefined
        // - Component is marked as deleted
        // - No type (invalid data)
        // - Component is in our local deleted set
        if (compData && 
            !compData.deleted && 
            compData.type && 
            compId && 
            !deletedComponentIds.has(compId)) {
          loadedComponentsMap.set(compId, compData);
        }
      });

      setTimeout(() => {
        if (!hasLoadedComponents) {
          hasLoadedComponents = true;
          // Convert Map to Array and sort
          const loadedComponents = Array.from(loadedComponentsMap.values());
          loadedComponents.sort((a, b) => (a.order || 0) - (b.order || 0));
          setComponents(loadedComponents);
        }
      }, 1500); // Increased timeout to ensure all data is loaded
    } catch (error) {
      console.error('Error loading page:', error);
    }
  };

  const savePage = async () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }

    if (!pageTitle.trim()) {
      alert('Per favore, inserisci un titolo per la pagina.');
      return;
    }

    // Validate slug if provided
    if (pageSlug) {
      if (slugError) {
        alert(`Errore nello slug: ${slugError}`);
        return;
      }

      if (!isValidSlug(pageSlug)) {
        alert('Lo slug contiene caratteri non validi.');
        return;
      }

      if (!isSlugAvailable(pageSlug)) {
        alert('Questo slug è riservato dal sistema.');
        return;
      }

      const available = await checkSlugAvailability(pageSlug);
      if (!available) {
        alert('Questo slug è già utilizzato da un\'altra pagina.');
        return;
      }
    }

    if (!shogun || !currentUser) {
      alert('Errore: utente non autenticato.');
      return;
    }

    setIsSaving(true);

    try {
      const pageId = currentPageId || 'page_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const pageNode = shogun.db.get('pages').get(pageId);

      const pageData: any = {
        title: pageTitle,
        author: currentUser.pub,
        updatedAt: Date.now(),
        ...(currentPageId ? {} : { createdAt: Date.now() })
      };

      // Add slug if provided
      if (pageSlug) {
        pageData.slug = pageSlug;
        // Create slug->pageId mapping
        shogun.db.get('slugs').get(pageSlug).put(pageId);
      }

      pageNode.put(pageData);

      // Save only non-deleted components
      components.forEach((comp, index) => {
        // Skip if component is marked as deleted
        if (!deletedComponentIds.has(comp.id)) {
          const componentData = { ...comp, order: index };
          shogun.db.get(comp.id).put(componentData);
          pageNode.get('components').get(comp.id).put(componentData);
          console.log('Saving component:', comp.id, comp.type);
        } else {
          console.log('Skipping deleted component:', comp.id);
        }
      });

      // Clear deleted components tracking after save
      deletedComponentIds.clear();
      
      setCurrentPageId(pageId);
      
      // Create both links - custom slug and ID-based
      const shortLink = pageSlug ? `${window.location.origin}/${pageSlug}` : '';
      const fullLink = `${window.location.origin}/view/${pageId}`;
      setShareLink(shortLink || fullLink);
      setShowShareModal(true);
    } catch (error) {
      console.error('Error saving page:', error);
      alert('Errore durante il salvataggio.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogin = async (username: string, password: string) => {
    const result = await login(username, password);
    if (result.success) {
      setShowAuthModal(false);
    } else {
      throw new Error(result.error || 'Login failed');
    }
  };

  const handleSignUp = async (username: string, password: string) => {
    const result = await signUp(username, password);
    if (result.success) {
      setShowAuthModal(false);
    } else {
      throw new Error(result.error || 'Sign up failed');
    }
  };

  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-8 max-w-5xl">
      <Header
        currentUser={currentUser}
        isLoggedIn={isLoggedIn}
        onLoginClick={() => setShowAuthModal(true)}
        onLogoutClick={logout}
        theme={theme}
        onToggleTheme={toggleTheme}
        avatarUrl={avatarUrl}
        onAvatarUpload={uploadAvatar}
      />

        {/* Main Editor Area */}
        <div className="max-w-sm sm:max-w-md mx-auto">
        <div
          className="p-4 sm:p-6 rounded-2xl shadow-sm border mb-6"
          style={{
            backgroundColor: 'var(--linktree-surface)',
            borderColor: 'var(--linktree-outline)',
          }}
        >
          <div className="mb-4">
            <label
              htmlFor="page-title"
              className="block text-sm font-medium mb-2 text-center"
              style={{ color: 'var(--linktree-text-secondary)' }}
            >
              Nome della Pagina
            </label>
            <input
              type="text"
              id="page-title"
              placeholder="Il mio profilo"
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-center font-medium text-sm sm:text-base"
              style={{
                backgroundColor: 'var(--linktree-surface)',
                color: 'var(--linktree-text-primary)',
                borderColor: 'var(--linktree-outline)',
              }}
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="page-slug"
              className="block text-sm font-medium mb-2 text-center"
              style={{ color: 'var(--linktree-text-secondary)' }}
            >
              Link Personalizzato (opzionale)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <span className="text-sm" style={{ color: 'var(--linktree-text-secondary)' }}>/</span>
              </div>
                <input
                  type="text"
                  id="page-slug"
                  placeholder="miapagina"
                  value={pageSlug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 pl-6 sm:pl-7 border rounded-xl focus:ring-2 transition text-center font-medium text-sm sm:text-base ${
                    slugError ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  style={{
                    backgroundColor: 'var(--linktree-surface)',
                    color: 'var(--linktree-text-primary)',
                    borderColor: slugError ? '#ef4444' : 'var(--linktree-outline)',
                  }}
                />
              {isCheckingSlug && (
                <div className="absolute inset-y-0 right-3 flex items-center">
                  <i className="fas fa-spinner fa-spin text-sm" style={{ color: 'var(--linktree-text-secondary)' }}></i>
                </div>
              )}
            </div>
            {slugError && (
              <p className="text-xs text-red-500 mt-1 text-center">
                <i className="fas fa-exclamation-circle mr-1"></i>
                {slugError}
              </p>
            )}
            {pageSlug && !slugError && !isCheckingSlug && (
              <p className="text-xs mt-1 text-center" style={{ color: 'var(--linktree-success)' }}>
                <i className="fas fa-check-circle mr-1"></i>
                Disponibile: {window.location.origin}/{pageSlug}
              </p>
            )}
            <p className="text-xs mt-1 text-center" style={{ color: 'var(--linktree-text-disabled)' }}>
              Es: "miapagina" diventa /{pageSlug || 'miapagina'}
            </p>
          </div>

          <div className="space-y-3 mb-6">
            {components.map((comp) => (
              <ComponentWrapper
                key={comp.id}
                component={comp}
                onUpdate={updateComponent}
                onMoveUp={moveComponentUp}
                onMoveDown={moveComponentDown}
                onRemove={removeComponent}
              />
            ))}
            {components.length === 0 && (
              <p className="text-center text-sm py-8" style={{ color: 'var(--linktree-text-secondary)' }}>
                Aggiungi componenti alla tua pagina usando i pulsanti qui sotto
              </p>
            )}
          </div>

          <div className="border-t pt-6" style={{ borderColor: 'var(--linktree-outline)' }}>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => addComponent('h1')}
                className="px-4 py-3 font-medium rounded-xl hover:bg-gray-100 transition text-sm border"
                style={{
                  backgroundColor: 'var(--linktree-surface-variant)',
                  color: 'var(--linktree-text-primary)',
                  borderColor: 'var(--linktree-outline)',
                }}
              >
                <i className="fas fa-heading mr-2"></i>Titolo
              </button>
              <button
                onClick={() => addComponent('p')}
                className="px-4 py-3 font-medium rounded-xl hover:bg-gray-100 transition text-sm border"
                style={{
                  backgroundColor: 'var(--linktree-surface-variant)',
                  color: 'var(--linktree-text-primary)',
                  borderColor: 'var(--linktree-outline)',
                }}
              >
                <i className="fas fa-paragraph mr-2"></i>Testo
              </button>
              <button
                onClick={() => addComponent('img')}
                className="px-4 py-3 font-medium rounded-xl hover:bg-gray-100 transition text-sm border"
                style={{
                  backgroundColor: 'var(--linktree-surface-variant)',
                  color: 'var(--linktree-text-primary)',
                  borderColor: 'var(--linktree-outline)',
                }}
              >
                <i className="fas fa-image mr-2"></i>Immagine
              </button>
              <button
                onClick={() => addComponent('avatar')}
                className="px-4 py-3 font-medium rounded-xl hover:bg-gray-100 transition text-sm border"
                style={{
                  backgroundColor: 'var(--linktree-surface-variant)',
                  color: 'var(--linktree-text-primary)',
                  borderColor: 'var(--linktree-outline)',
                }}
              >
                <i className="fas fa-user-circle mr-2"></i>Profilo
              </button>
              <button
                onClick={() => addComponent('link')}
                className="px-4 py-3 font-medium rounded-xl hover:bg-gray-100 transition text-sm border"
                style={{
                  backgroundColor: 'var(--linktree-surface-variant)',
                  color: 'var(--linktree-text-primary)',
                  borderColor: 'var(--linktree-outline)',
                }}
              >
                <i className="fas fa-link mr-2"></i>Link
              </button>
              <button
                onClick={() => addComponent('spacer')}
                className="px-4 py-3 font-medium rounded-xl hover:bg-gray-100 transition text-sm border"
                style={{
                  backgroundColor: 'var(--linktree-surface-variant)',
                  color: 'var(--linktree-text-primary)',
                  borderColor: 'var(--linktree-outline)',
                }}
              >
                <i className="fas fa-arrows-alt-v mr-2"></i>Spazio
              </button>
              <button
                onClick={() => addComponent('code')}
                className="px-4 py-3 font-medium rounded-xl hover:bg-gray-100 transition text-sm border col-span-2"
                style={{
                  backgroundColor: 'var(--linktree-surface-variant)',
                  color: 'var(--linktree-text-primary)',
                  borderColor: 'var(--linktree-outline)',
                }}
              >
                <i className="fas fa-code mr-2"></i>Codice
              </button>
            </div>

            <button
              onClick={savePage}
              disabled={isSaving || !!slugError || isCheckingSlug}
              className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition shadow-sm disabled:opacity-50 text-sm sm:text-base"
            >
              {isSaving ? (
                <><i className="fas fa-spinner fa-spin mr-2"></i>Salvataggio...</>
              ) : (
                <><i className="fas fa-save mr-2"></i>Salva Pagina</>
              )}
            </button>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
        onSignUp={handleSignUp}
      />

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div
            className="rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center"
            style={{ backgroundColor: 'var(--linktree-surface)' }}
          >
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--linktree-text-primary)' }}>
              Pagina Salvata con Successo!
            </h2>
            <p className="mb-6" style={{ color: 'var(--linktree-text-secondary)' }}>
              {pageSlug
                ? 'La tua pagina è accessibile tramite il link personalizzato:'
                : 'Condividi questo link per far vedere la tua pagina a chiunque.'}
            </p>

            {/* Primary Link (Custom slug or ID-based) */}
            <div className="mb-4">
              {pageSlug && (
                <p className="text-xs mb-1 font-semibold" style={{ color: 'var(--linktree-success)' }}>
                  <i className="fas fa-star mr-1"></i>
                  Link Personalizzato
                </p>
              )}
              <div className="relative p-3 rounded-lg border" style={{ backgroundColor: 'var(--linktree-surface-variant)', borderColor: 'var(--linktree-outline)' }}>
                <input
                  type="text"
                  readOnly
                  value={shareLink}
                  className="w-full bg-transparent focus:outline-none pr-10 text-sm"
                  style={{ color: 'var(--linktree-text-primary)' }}
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareLink);
                    alert('Link copiato!');
                  }}
                  className="absolute top-1/2 right-2 transform -translate-y-1/2 hover:text-indigo-600"
                  style={{ color: 'var(--linktree-text-secondary)' }}
                >
                  <i className="fas fa-copy text-xl"></i>
                </button>
              </div>
            </div>

            {/* Alternative Link (ID-based, shown only if custom slug is set) */}
            {pageSlug && currentPageId && (
              <div className="mb-4">
                <p className="text-xs mb-1" style={{ color: 'var(--linktree-text-secondary)' }}>
                  Link alternativo (ID-based):
                </p>
                <div className="relative p-2 rounded-lg border" style={{ backgroundColor: 'var(--linktree-surface)', borderColor: 'var(--linktree-outline)' }}>
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/view/${currentPageId}`}
                    className="w-full bg-transparent focus:outline-none pr-10 text-xs"
                    style={{ color: 'var(--linktree-text-secondary)' }}
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/view/${currentPageId}`);
                      alert('Link alternativo copiato!');
                    }}
                    className="absolute top-1/2 right-2 transform -translate-y-1/2 hover:text-indigo-600"
                    style={{ color: 'var(--linktree-text-secondary)' }}
                  >
                    <i className="fas fa-copy text-sm"></i>
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowShareModal(false)}
              className="mt-6 px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition"
            >
              Chiudi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

