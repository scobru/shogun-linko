import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { ShogunCoreInstance, UserInfo, PageData } from '../types';
import type { Theme } from '../hooks/useTheme';
import { useUserAvatar } from '../hooks/useUserAvatar';
import Header from '../components/shared/Header';

interface MyPagesPageProps {
  shogun: ShogunCoreInstance | null;
  currentUser: UserInfo | null;
  isLoggedIn: boolean;
  logout: () => void;
  theme: Theme;
  toggleTheme: () => void;
}

export default function MyPagesPage({
  shogun,
  currentUser,
  isLoggedIn,
  logout,
  theme,
  toggleTheme,
}: MyPagesPageProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [myPages, setMyPages] = useState<PageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<PageData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { avatarUrl, uploadAvatar } = useUserAvatar(shogun, currentUser);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/');
      return;
    }

    if (shogun && currentUser) {
      loadMyPages();
    }
  }, [shogun, currentUser, isLoggedIn, navigate]);

  const loadMyPages = () => {
    if (!shogun || !currentUser) return;

    setIsLoading(true);
    const pages: PageData[] = [];

    // Load all pages and filter by author
    shogun.db.get('pages').map().once((pageData: any, pageId: string) => {
      if (pageData && pageData.author === currentUser.pub && !pageData.deleted) {
        pages.push({
          id: pageId,
          title: pageData.title || 'Senza Titolo',
          slug: pageData.slug,
          author: pageData.author,
          createdAt: pageData.createdAt || Date.now(),
          updatedAt: pageData.updatedAt || Date.now(),
        });
      }
    });

    setTimeout(() => {
      // Sort by most recent first
      pages.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      setMyPages(pages);
      setIsLoading(false);
    }, 1500);
  };

  const handleDelete = (page: PageData) => {
    setPageToDelete(page);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!shogun || !pageToDelete) return;

    setIsDeleting(true);
      try {
        // Mark page as deleted
        await shogun.db.get('pages').get(pageToDelete.id).put({ deleted: true, deletedAt: Date.now() });
        
        // Delete slug mapping if exists
        if (pageToDelete.slug) {
          await shogun.db.get('slugs').get(pageToDelete.slug).put(null);
        }
        
        // Remove from local state
        setMyPages(myPages.filter(p => p.id !== pageToDelete.id));
        
        setShowDeleteModal(false);
        setPageToDelete(null);
      } catch (error) {
        console.error('Error deleting page:', error);
        alert(t('common.error'));
      } finally {
      setIsDeleting(false);
    }
  };

  const getPageUrl = (page: PageData) => {
    return page.slug ? `/${page.slug}` : `/view/${page.id}`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-8 max-w-5xl">
      <Header
        currentUser={currentUser}
        isLoggedIn={isLoggedIn}
        onLogoutClick={logout}
        showMyPagesButton={false}
        theme={theme}
        onToggleTheme={toggleTheme}
        avatarUrl={avatarUrl}
        onAvatarUpload={uploadAvatar}
      />

      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--linktree-text-primary)' }}>
            <i className="fas fa-folder-open mr-3"></i>
            {t('myPages.title')}
          </h1>
          <p className="text-sm" style={{ color: 'var(--linktree-text-secondary)' }}>
            {t('myPages.description')}
          </p>
        </div>

        {/* New Page Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition shadow-md text-sm sm:text-base"
          >
            <i className="fas fa-plus mr-2"></i>
            {t('myPages.createNew')}
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p style={{ color: 'var(--linktree-text-secondary)' }}>{t('myPages.loading')}</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && myPages.length === 0 && (
          <div
            className="text-center py-16 rounded-2xl border"
            style={{
              backgroundColor: 'var(--linktree-surface)',
              borderColor: 'var(--linktree-outline)',
            }}
          >
            <i
              className="fas fa-folder-open text-6xl mb-4"
              style={{ color: 'var(--linktree-text-disabled)' }}
            ></i>
            <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--linktree-text-primary)' }}>
              {t('myPages.empty.title')}
            </h2>
            <p className="mb-6" style={{ color: 'var(--linktree-text-secondary)' }}>
              {t('myPages.empty.description')}
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition"
            >
              <i className="fas fa-plus mr-2"></i>
              {t('myPages.empty.createFirst')}
            </button>
          </div>
        )}

        {/* Pages List */}
        {!isLoading && myPages.length > 0 && (
          <div className="space-y-4">
            {myPages.map((page) => (
              <div
                key={page.id}
                className="p-6 rounded-2xl border shadow-sm hover:shadow-md transition"
                style={{
                  backgroundColor: 'var(--linktree-surface)',
                  borderColor: 'var(--linktree-outline)',
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Page Info */}
                  <div className="flex-1">
                    <h3
                      className="text-lg sm:text-xl font-semibold mb-1"
                      style={{ color: 'var(--linktree-text-primary)' }}
                    >
                      {page.title}
                    </h3>
                    
                    {/* Slug Badge */}
                    {page.slug && (
                      <div className="inline-flex items-center gap-2 mb-2">
                        <span
                          className="text-xs px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: 'var(--linktree-success-bg)',
                            color: 'var(--linktree-success)',
                          }}
                        >
                          <i className="fas fa-link mr-1"></i>
                          /{page.slug}
                        </span>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-4 text-sm" style={{ color: 'var(--linktree-text-secondary)' }}>
                      <span>
                        <i className="fas fa-calendar mr-1"></i>
                        {t('myPages.created', { date: formatDate(page.createdAt) })}
                      </span>
                      <span>
                        <i className="fas fa-clock mr-1"></i>
                        {t('myPages.modified', { date: formatDate(page.updatedAt) })}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
                    {/* View Button */}
                    <button
                      onClick={() => navigate(getPageUrl(page))}
                      className="px-3 sm:px-4 py-1 sm:py-2 rounded-lg font-medium transition text-xs sm:text-sm"
                      style={{
                        backgroundColor: 'var(--linktree-primary)',
                        color: 'white',
                      }}
                    >
                      <i className="fas fa-eye mr-1 sm:mr-2"></i>
                      <span className="hidden sm:inline">{t('myPages.view')}</span>
                      <span className="sm:hidden">View</span>
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={() => navigate(`/?edit=${page.id}`)}
                      className="px-3 sm:px-4 py-1 sm:py-2 rounded-lg font-medium transition text-xs sm:text-sm border"
                      style={{
                        backgroundColor: 'var(--linktree-surface-variant)',
                        color: 'var(--linktree-text-primary)',
                        borderColor: 'var(--linktree-outline)',
                      }}
                    >
                      <i className="fas fa-edit mr-1 sm:mr-2"></i>
                      <span className="hidden sm:inline">{t('myPages.edit')}</span>
                      <span className="sm:hidden">Edit</span>
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(page)}
                      className="px-3 sm:px-4 py-1 sm:py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition text-xs sm:text-sm font-medium"
                    >
                      <i className="fas fa-trash mr-1 sm:mr-2"></i>
                      <span className="hidden sm:inline">{t('myPages.delete')}</span>
                      <span className="sm:hidden">Del</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {!isLoading && myPages.length > 0 && (
          <div
            className="mt-8 p-6 rounded-2xl border text-center"
            style={{
              backgroundColor: 'var(--linktree-surface-variant)',
              borderColor: 'var(--linktree-outline)',
            }}
          >
            <p className="text-sm" style={{ color: 'var(--linktree-text-secondary)' }}>
              <i className="fas fa-chart-bar mr-2"></i>
              {t('myPages.totalPages', { count: myPages.length })}
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && pageToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div
            className="rounded-2xl shadow-2xl p-8 max-w-md w-full"
            style={{ backgroundColor: 'var(--linktree-surface)' }}
          >
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <i className="fas fa-exclamation-triangle text-red-500"></i>
              <span style={{ color: 'var(--linktree-text-primary)' }}>{t('deleteModal.title')}</span>
            </h2>
            
            <p className="mb-2" style={{ color: 'var(--linktree-text-primary)' }}>
              {t('deleteModal.message')}
            </p>
            
            <div
              className="p-3 rounded-lg mb-4"
              style={{
                backgroundColor: 'var(--linktree-surface-variant)',
              }}
            >
              <p className="font-semibold" style={{ color: 'var(--linktree-text-primary)' }}>
                {pageToDelete.title}
              </p>
              {pageToDelete.slug && (
                <p className="text-sm" style={{ color: 'var(--linktree-text-secondary)' }}>
                  /{pageToDelete.slug}
                </p>
              )}
            </div>

            <p className="text-sm mb-6" style={{ color: 'var(--linktree-text-secondary)' }}>
              {t('deleteModal.warning')}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setPageToDelete(null);
                }}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 rounded-lg transition"
                style={{
                  backgroundColor: 'var(--linktree-surface-variant)',
                  color: 'var(--linktree-text-primary)',
                  borderColor: 'var(--linktree-outline)',
                }}
              >
                {t('deleteModal.cancel')}
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    {t('deleteModal.deleting')}
                  </>
                ) : (
                  <>
                    <i className="fas fa-trash mr-2"></i>
                    {t('myPages.delete')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

