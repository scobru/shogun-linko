import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { UserInfo, ComponentData, PageData } from '../types';
import type { Theme } from '../hooks/useTheme';
import { useUserAvatar } from '../hooks/useUserAvatar';
import { useFullscreen } from '../contexts/FullscreenContext';
import {
  getLinkoPages,
  getLinkoSlugs,
  resolveSlugWithFallback,
  getPageWithFallback,
  loadAllPagesFromBothPaths,
  getLegacyPages,
  getLegacySlugs,
} from '../utils/gun-paths';
import Header from '../components/shared/Header';
import RenderedComponent from '../components/renderer/RenderedComponent';
import { ShogunCore } from 'shogun-core';

interface ViewerPageProps {
  shogun:  ShogunCore | null;
  currentUser: UserInfo | null;
  isLoggedIn: boolean;
  logout: () => void;
  theme: Theme;
  toggleTheme: () => void;
}

export default function ViewerPage({
  shogun,
  currentUser,
  isLoggedIn,
  logout,
  theme,
  toggleTheme,
}: ViewerPageProps) {
  const { t } = useTranslation();
  const { pageId, slug } = useParams<{ pageId?: string; slug?: string }>();
  const navigate = useNavigate();
  const [resolvedPageId, setResolvedPageId] = useState<string | null>(null);
  const [pageTitle, setPageTitle] = useState('');
  const [components, setComponents] = useState<ComponentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  const [allPages, setAllPages] = useState<PageData[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(-1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [relaySyncResult, setRelaySyncResult] = useState<{ checking: boolean; count: number | null }>({ checking: false, count: null });
  const { isFullscreen, setIsFullscreen } = useFullscreen();
  const { avatarUrl, uploadAvatar } = useUserAvatar(shogun, currentUser);

  // Resolve slug to pageId if slug is provided
  useEffect(() => {
    if (slug && shogun && !pageId) {
      // This is a custom slug route, resolve it to pageId using fallback
      resolveSlugWithFallback(shogun.gun, slug).then((resolvedId) => {
        if (resolvedId) {
          setResolvedPageId(resolvedId);
        } else {
          // Slug not found
          setResolvedPageId('not-found');
        }
      });
    } else if (pageId) {
      // This is a direct pageId route
      setResolvedPageId(pageId);
    }
  }, [slug, pageId, shogun]);

  useEffect(() => {
    if (resolvedPageId && resolvedPageId !== 'not-found' && shogun) {
      loadPage(resolvedPageId);
      loadAllPages();
    }
  }, [resolvedPageId, shogun]);

  const loadPage = async (id: string) => {
    if (!shogun) return;

    setIsLoading(true);
    try {
      // Try new path first, fallback to legacy
      const pageResult = await getPageWithFallback(shogun.gun, id);
      if (!pageResult) {
        console.error('Page not found:', id);
        setIsLoading(false);
        return;
      }

      const { node: pageNode, isLegacy } = pageResult;
      console.log(`Loading page from ${isLegacy ? 'legacy' : 'new'} path:`, id);

      pageNode.get('title').once((title: string) => {
        if (title) {
          setPageTitle(title);
          document.title = title;
        }
      });

      pageNode.get('author').once((author: string) => {
        const canUserEdit = currentUser && currentUser.pub === author;
        setCanEdit(!!canUserEdit);
      });

      const loadedComponentsMap = new Map<string, ComponentData>();
      
      pageNode.get('components').map().once((compData: any, compId: string) => {
        // Use Map to avoid duplicates - GunDB can send same data multiple times
        if (compData && !compData.deleted && compData.type && compId) {
          loadedComponentsMap.set(compId, compData);
        }
      });

      setTimeout(() => {
        // Convert Map to Array and sort
        const loadedComponents = Array.from(loadedComponentsMap.values());
        loadedComponents.sort((a, b) => (a.order || 0) - (b.order || 0));
        setComponents(loadedComponents);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error loading page:', error);
      setIsLoading(false);
    }
  };

  const loadAllPages = () => {
    if (!shogun) return;

    const pagesMap = new Map<string, PageData>();
    
    // Load from both new and legacy paths
    loadAllPagesFromBothPaths(shogun.gun, (pageData, id, isLegacy) => {
      // Use Map to deduplicate (prefer new path over legacy)
      if (!pagesMap.has(id) || !isLegacy) {
        pagesMap.set(id, {
          id,
          title: pageData.title,
          slug: pageData.slug,
          author: pageData.author,
          createdAt: pageData.createdAt,
          updatedAt: pageData.updatedAt,
        });
      }
    });

    setTimeout(() => {
      const pages = Array.from(pagesMap.values());
      pages.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setAllPages(pages);
      const index = pages.findIndex(p => p.id === resolvedPageId);
      setCurrentPageIndex(index >= 0 ? index : -1);
    }, 1500);
  };

  const getPageUrl = (page: PageData) => {
    // Prefer custom slug if available, otherwise use ID
    return page.slug ? `/${page.slug}` : `/view/${page.id}`;
  };

  const navigateToPrevious = () => {
    if (currentPageIndex > 0) {
      navigate(getPageUrl(allPages[currentPageIndex - 1]));
    }
  };

  const navigateToNext = () => {
    if (currentPageIndex < allPages.length - 1) {
      navigate(getPageUrl(allPages[currentPageIndex + 1]));
    }
  };

  const navigateToRandom = () => {
    if (allPages.length === 0) return;
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * allPages.length);
    } while (randomIndex === currentPageIndex && allPages.length > 1);
    navigate(getPageUrl(allPages[randomIndex]));
  };

  const deletePage = async () => {
    if (!shogun || !resolvedPageId) return;

    setIsDeleting(true);
    try {
      // Delete from new namespace
      getLinkoPages(shogun.gun).get(resolvedPageId).put(null);
      // Also delete from legacy path for cleanup
      getLegacyPages(shogun.gun).get(resolvedPageId).put(null);
      
      // Delete slug mapping if exists
      if (slug) {
        getLinkoSlugs(shogun.gun).get(slug).put(null);
        getLegacySlugs(shogun.gun).get(slug).put(null);
      }
      
      if (currentUser) {
        shogun.gun.user().get('pages').get(resolvedPageId).put(null);
      }
      alert(t('deleteModal.success'));
      navigate('/');
    } catch (error) {
      console.error('Error deleting page:', error);
      alert(t('common.error'));
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Handle page not found
  if (resolvedPageId === 'not-found') {
    return (
      <div className="container mx-auto p-4 md:p-8 max-w-5xl">
        <Header
          currentUser={currentUser}
          isLoggedIn={isLoggedIn}
          onLogoutClick={logout}
          showNewPageButton
          theme={theme}
          onToggleTheme={toggleTheme}
          avatarUrl={avatarUrl}
          onAvatarUpload={uploadAvatar}
        />
        <div className="max-w-lg mx-auto text-center py-16">
          <i className="fas fa-exclamation-triangle text-6xl mb-4" style={{ color: 'var(--linktree-accent)' }}></i>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--linktree-text-primary)' }}>
            {t('viewer.notFound.title')}
          </h2>
          <p className="mb-6" style={{ color: 'var(--linktree-text-secondary)' }}>
            {t('viewer.notFound.message', { slug })}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition"
          >
            <i className="fas fa-home mr-2"></i>
            {t('viewer.notFound.backHome')}
          </button>
        </div>
      </div>
    );
  }

  // Force fullscreen on load
  useEffect(() => {
    setIsFullscreen(true);
  }, [setIsFullscreen]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Check how many relays have this page synced
  const checkRelaySync = async () => {
    if (!shogun || !resolvedPageId) return;
    
    setRelaySyncResult({ checking: true, count: null });
    
    try {
      // Get connected peers from Gun's internal state
      const gunInstance = shogun.gun as any;
      const peers = gunInstance.back?.('opt.peers') || gunInstance._?.opt?.peers || {};
      const peerUrls = Object.keys(peers);
      
      if (peerUrls.length === 0) {
        setRelaySyncResult({ checking: false, count: 0 });
        return;
      }

      // Count peers that are connected (have wire state)
      let connectedCount = 0;
      for (const url of peerUrls) {
        const peer = peers[url];
        // Check if peer is connected (has wire or is not disconnected)
        if (peer && (peer.wire || !peer.off)) {
          connectedCount++;
        }
      }

      setRelaySyncResult({ checking: false, count: connectedCount > 0 ? connectedCount : peerUrls.length });
    } catch (error) {
      console.error('Error checking relay sync:', error);
      setRelaySyncResult({ checking: false, count: 0 });
    }
  };

  // If fullscreen, render fullscreen content
  if (isFullscreen) {
    return (
      <div 
        className="fixed inset-0 z-50 overflow-y-auto"
        style={{ backgroundColor: 'var(--linktree-background)' }}
      >
        {/* Fullscreen Exit Button */}
        <button
          onClick={toggleFullscreen}
          className="fixed top-4 right-4 z-60 px-4 py-2 rounded-full shadow-lg transition hover:scale-110"
          style={{
            backgroundColor: 'var(--linktree-surface)',
            color: 'var(--linktree-text-primary)',
            borderColor: 'var(--linktree-outline)',
            border: '2px solid var(--linktree-outline)',
          }}
          title={t('viewer.exitFullscreen')}
        >
          <i className="fas fa-compress-alt mr-2"></i>
          <span className="hidden sm:inline">{t('viewer.exitFullscreen') || 'Esci'}</span>
        </button>

        {/* Fullscreen Content */}
        <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8">
          {/* Page Title */}
          {pageTitle && (
            <div className="max-w-2xl w-full mb-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold break-words text-center" style={{ color: 'var(--linktree-text-primary)' }}>
                {pageTitle}
              </h1>
            </div>
          )}

          {/* Page Content */}
          <div className="max-w-2xl w-full">
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-16">
                  <i className="fas fa-spinner fa-spin text-4xl" style={{ color: 'var(--linktree-text-secondary)' }}></i>
                  <p className="mt-4 text-lg" style={{ color: 'var(--linktree-text-secondary)' }}>
                    {t('viewer.loading')}
                  </p>
                </div>
              ) : components.length > 0 ? (
                components.map((comp) => (
                  <RenderedComponent key={comp.id} component={comp} />
                ))
              ) : (
                <div className="text-center py-16 text-lg" style={{ color: 'var(--linktree-text-secondary)' }}>
                  {t('viewer.noContent')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normal view with header and navigation
  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-8 max-w-5xl">
      <Header
        currentUser={currentUser}
        isLoggedIn={isLoggedIn}
        onLogoutClick={logout}
        showNewPageButton={!canEdit}
        showEditButton={canEdit}
        showDeleteButton={canEdit}
        onEditClick={() => navigate(`/?edit=${resolvedPageId}`)}
        onDeleteClick={() => setShowDeleteModal(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
        avatarUrl={avatarUrl}
        onAvatarUpload={uploadAvatar}
      />

      {/* Navigation */}
      {allPages.length >= 1 && (
        <div className="mb-6 py-3 px-2 sm:px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="flex justify-center items-center gap-2 sm:gap-4 flex-wrap">
              <button
                onClick={navigateToPrevious}
                disabled={currentPageIndex <= 0}
                className="px-2 sm:px-4 py-1 sm:py-2 font-semibold rounded-lg transition text-xs sm:text-sm disabled:opacity-50"
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--linktree-text-primary)',
                }}
              >
                <i className="fas fa-arrow-left mr-1 sm:mr-2"></i>
                <span className="hidden sm:inline">{t('viewer.navigation.previous')}</span>
                <span className="sm:hidden">{t('viewer.navigation.prev')}</span>
              </button>
              <button
                onClick={navigateToRandom}
                className="px-2 sm:px-4 py-1 sm:py-2 font-semibold rounded-lg transition text-xs sm:text-sm"
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--linktree-text-primary)',
                }}
              >
                <i className="fas fa-random mr-1 sm:mr-2"></i>
                <span className="hidden sm:inline">{t('viewer.navigation.random')}</span>
                <span className="sm:hidden">🎲</span>
              </button>
              <button
                onClick={navigateToNext}
                disabled={currentPageIndex >= allPages.length - 1}
                className="px-2 sm:px-4 py-1 sm:py-2 font-semibold rounded-lg transition text-xs sm:text-sm disabled:opacity-50"
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--linktree-text-primary)',
                }}
              >
                <span className="hidden sm:inline">{t('viewer.navigation.next')}</span>
                <span className="sm:hidden">{t('viewer.navigation.next')}</span>
                <i className="fas fa-arrow-right ml-1 sm:ml-2"></i>
              </button>
              {currentPageIndex >= 0 && (
                <span className="text-xs sm:text-sm ml-2 sm:ml-4" style={{ color: 'var(--linktree-text-secondary)' }}>
                  {t('viewer.navigation.ofPages', { current: currentPageIndex + 1, total: allPages.length })}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Page Title Row with Action Buttons */}
      <div className="max-w-sm sm:max-w-lg mx-auto mb-6">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {pageTitle && (
            <h1 className="text-2xl sm:text-3xl font-semibold break-words text-center" style={{ color: 'var(--linktree-text-primary)' }}>
              {pageTitle}
            </h1>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            {/* Verify Sync Button */}
            <button
              onClick={checkRelaySync}
              disabled={relaySyncResult.checking}
              className="px-3 py-2 rounded-full transition hover:scale-110 shadow-md text-xs sm:text-sm"
              style={{
                backgroundColor: relaySyncResult.count !== null 
                  ? (relaySyncResult.count > 0 ? 'var(--linktree-success, #22c55e)' : 'var(--linktree-surface)')
                  : 'var(--linktree-surface)',
                color: relaySyncResult.count !== null && relaySyncResult.count > 0 ? 'white' : 'var(--linktree-text-primary)',
                borderColor: 'var(--linktree-outline)',
                border: '2px solid var(--linktree-outline)',
              }}
              title={t('relaySync.title')}
            >
              {relaySyncResult.checking ? (
                <><i className="fas fa-spinner fa-spin mr-1"></i><span className="hidden sm:inline">{t('relaySync.checking')}</span></>
              ) : relaySyncResult.count !== null ? (
                <><i className="fas fa-check-circle mr-1"></i><span>{relaySyncResult.count}</span><span className="hidden sm:inline ml-1">relays</span></>
              ) : (
                <><i className="fas fa-sync-alt mr-1"></i><span className="hidden sm:inline">{t('relaySync.button')}</span></>
              )}
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="px-3 py-2 rounded-full transition hover:scale-110 shadow-md"
              style={{
                backgroundColor: 'var(--linktree-surface)',
                color: 'var(--linktree-text-primary)',
                borderColor: 'var(--linktree-outline)',
                border: '2px solid var(--linktree-outline)',
              }}
              title={t('viewer.enterFullscreen')}
            >
              <i className="fas fa-expand-alt mr-1 sm:mr-2"></i>
              <span className="hidden sm:inline text-xs">{t('viewer.enterFullscreen') || 'Schermo intero'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-sm sm:max-w-lg mx-auto">

        <div className="space-y-2">
          {isLoading ? (
            <div className="text-center py-8">
              <i className="fas fa-spinner fa-spin text-2xl" style={{ color: 'var(--linktree-text-secondary)' }}></i>
              <p className="mt-2" style={{ color: 'var(--linktree-text-secondary)' }}>
                {t('viewer.loading')}
              </p>
            </div>
          ) : components.length > 0 ? (
            components.map((comp) => (
              <RenderedComponent key={comp.id} component={comp} />
            ))
          ) : (
            <div className="text-center py-8" style={{ color: 'var(--linktree-text-secondary)' }}>
              {t('viewer.noContent')}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div
            className="rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
            style={{ backgroundColor: 'var(--linktree-surface)' }}
          >
            <h2 className="text-xl font-bold mb-4 flex items-center justify-center gap-2">
              <i className="fas fa-exclamation-triangle text-red-500"></i>
              <span style={{ color: 'var(--linktree-text-primary)' }}>{t('deleteModal.title')}</span>
            </h2>
            <p className="mb-4" style={{ color: 'var(--linktree-text-secondary)' }}>
              {t('deleteModal.message')}
            </p>
            <p className="text-sm mb-6" style={{ color: 'var(--linktree-text-secondary)' }}>
              {t('deleteModal.warning')}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg transition"
                style={{
                  backgroundColor: 'var(--linktree-surface-variant)',
                  color: 'var(--linktree-text-primary)',
                  borderColor: 'var(--linktree-outline)',
                }}
              >
                {t('deleteModal.cancel')}
              </button>
              <button
                onClick={deletePage}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
              >
                {isDeleting ? (
                  <><i className="fas fa-spinner fa-spin mr-2"></i>{t('deleteModal.deleting')}</>
                ) : (
                  <><i className="fas fa-trash mr-2"></i>{t('deleteModal.confirm')}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

