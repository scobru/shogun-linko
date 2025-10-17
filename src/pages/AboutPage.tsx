import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import Header from '../components/shared/Header';

export default function AboutPage() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--linktree-background)' }}>
      <Header 
        currentUser={null}
        isLoggedIn={false}
        theme={theme}
        onToggleTheme={toggleTheme}
        showNewPageButton={true}
        showMyPagesButton={true}
      />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: 'var(--linktree-text-primary)' }}>
              {t('about.title')}
            </h1>
            <p className="text-lg sm:text-xl" style={{ color: 'var(--linktree-text-secondary)' }}>
              {t('about.subtitle')}
            </p>
          </div>

          {/* Main Description */}
          <div className="rounded-2xl p-6 sm:p-8 shadow-lg" style={{ backgroundColor: 'var(--linktree-surface)' }}>
            <h2 className="text-2xl font-bold mb-4 flex items-center" style={{ color: 'var(--linktree-text-primary)' }}>
              <i className="fas fa-info-circle mr-3 text-blue-500"></i>
              {t('about.what.title')}
            </h2>
            <p className="mb-4 leading-relaxed" style={{ color: 'var(--linktree-text-secondary)' }}>
              {t('about.what.description')}
            </p>
          </div>

          {/* Features */}
          <div className="rounded-2xl p-6 sm:p-8 shadow-lg" style={{ backgroundColor: 'var(--linktree-surface)' }}>
            <h2 className="text-2xl font-bold mb-6 flex items-center" style={{ color: 'var(--linktree-text-primary)' }}>
              <i className="fas fa-star mr-3 text-yellow-500"></i>
              {t('about.features.title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--linktree-surface-variant)' }}>
                <h3 className="font-semibold mb-2 flex items-center" style={{ color: 'var(--linktree-text-primary)' }}>
                  <i className="fas fa-shield-alt mr-2 text-green-500"></i>
                  {t('about.features.decentralized.title')}
                </h3>
                <p className="text-sm" style={{ color: 'var(--linktree-text-secondary)' }}>
                  {t('about.features.decentralized.description')}
                </p>
              </div>
              <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--linktree-surface-variant)' }}>
                <h3 className="font-semibold mb-2 flex items-center" style={{ color: 'var(--linktree-text-primary)' }}>
                  <i className="fas fa-user-check mr-2 text-purple-500"></i>
                  {t('about.features.authenticated.title')}
                </h3>
                <p className="text-sm" style={{ color: 'var(--linktree-text-secondary)' }}>
                  {t('about.features.authenticated.description')}
                </p>
              </div>
              <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--linktree-surface-variant)' }}>
                <h3 className="font-semibold mb-2 flex items-center" style={{ color: 'var(--linktree-text-primary)' }}>
                  <i className="fas fa-user-secret mr-2 text-blue-500"></i>
                  {t('about.features.privacy.title')}
                </h3>
                <p className="text-sm" style={{ color: 'var(--linktree-text-secondary)' }}>
                  {t('about.features.privacy.description')}
                </p>
              </div>
              <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--linktree-surface-variant)' }}>
                <h3 className="font-semibold mb-2 flex items-center" style={{ color: 'var(--linktree-text-primary)' }}>
                  <i className="fas fa-code mr-2 text-orange-500"></i>
                  {t('about.features.opensource.title')}
                </h3>
                <p className="text-sm" style={{ color: 'var(--linktree-text-secondary)' }}>
                  {t('about.features.opensource.description')}
                </p>
              </div>
            </div>
          </div>

          {/* Technology Stack */}
          <div className="rounded-2xl p-6 sm:p-8 shadow-lg" style={{ backgroundColor: 'var(--linktree-surface)' }}>
            <h2 className="text-2xl font-bold mb-6 flex items-center" style={{ color: 'var(--linktree-text-primary)' }}>
              <i className="fas fa-cogs mr-3 text-purple-500"></i>
              {t('about.tech.title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'var(--linktree-surface-variant)' }}>
                <i className="fab fa-react text-4xl mb-2" style={{ color: '#61DAFB' }}></i>
                <p className="font-semibold" style={{ color: 'var(--linktree-text-primary)' }}>React</p>
              </div>
              <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'var(--linktree-surface-variant)' }}>
                <i className="fas fa-shield-alt text-4xl mb-2" style={{ color: '#4CAF50' }}></i>
                <p className="font-semibold" style={{ color: 'var(--linktree-text-primary)' }}>Shogun</p>
              </div>
              <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'var(--linktree-surface-variant)' }}>
                <i className="fas fa-database text-4xl mb-2" style={{ color: '#FF6B6B' }}></i>
                <p className="font-semibold" style={{ color: 'var(--linktree-text-primary)' }}>GunDB</p>
              </div>
              <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'var(--linktree-surface-variant)' }}>
                <i className="fas fa-lock text-4xl mb-2" style={{ color: '#4CAF50' }}></i>
                <p className="font-semibold" style={{ color: 'var(--linktree-text-primary)' }}>SEA</p>
              </div>
            </div>
          </div>

          {/* Project Info */}
          <div className="rounded-2xl p-6 sm:p-8 shadow-lg" style={{ backgroundColor: 'var(--linktree-surface)' }}>
            <h2 className="text-2xl font-bold mb-6 flex items-center" style={{ color: 'var(--linktree-text-primary)' }}>
              <i className="fas fa-heart mr-3 text-red-500"></i>
              {t('about.project.title')}
            </h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <i className="fas fa-code-branch text-2xl mr-4 mt-1" style={{ color: 'var(--linktree-primary)' }}></i>
                <div>
                  <h3 className="font-semibold mb-1" style={{ color: 'var(--linktree-text-primary)' }}>
                    {t('about.project.repository')}
                  </h3>
                  <a
                    href="https://github.com/scobru/shogun-linko"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:underline"
                    style={{ color: 'var(--linktree-primary)' }}
                  >
                    github.com/scobru/shogun-linko
                  </a>
                </div>
              </div>
              <div className="flex items-start">
                <i className="fas fa-user text-2xl mr-4 mt-1" style={{ color: 'var(--linktree-secondary)' }}></i>
                <div>
                  <h3 className="font-semibold mb-1" style={{ color: 'var(--linktree-text-primary)' }}>
                    {t('about.project.developer')}
                  </h3>
                  <a
                    href="https://github.com/scobru"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:underline"
                    style={{ color: 'var(--linktree-primary)' }}
                  >
                    @scobru
                  </a>
                </div>
              </div>
              <div className="flex items-start">
                <i className="fas fa-folder-open text-2xl mr-4 mt-1" style={{ color: 'var(--linktree-warning)' }}></i>
                <div>
                  <h3 className="font-semibold mb-1" style={{ color: 'var(--linktree-text-primary)' }}>
                    {t('about.project.partof')}
                  </h3>
                  <a
                    href="https://shogun-eco.xyz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:underline"
                    style={{ color: 'var(--linktree-primary)' }}
                  >
                    {t('about.project.shogun')}
                  </a>
                </div>
              </div>
              <div className="flex items-start">
                <i className="fas fa-coffee text-2xl mr-4 mt-1" style={{ color: 'var(--linktree-success)' }}></i>
                <div>
                  <h3 className="font-semibold mb-1" style={{ color: 'var(--linktree-text-primary)' }}>
                    {t('about.project.support')}
                  </h3>
                  <a
                    href="https://buymeacoffee.com/scobru"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:underline"
                    style={{ color: 'var(--linktree-primary)' }}
                  >
                    buymeacoffee.com/scobru
                  </a>
                </div>
              </div>
              
              {/* Crypto Donations */}
              <div className="mt-6 p-4 rounded-xl" style={{ backgroundColor: 'var(--linktree-surface-variant)' }}>
                <h3 className="font-semibold mb-3 flex items-center" style={{ color: 'var(--linktree-text-primary)' }}>
                  <i className="fas fa-coins mr-2 text-yellow-500"></i>
                  {t('about.project.cryptoDonations')}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="font-medium mr-3" style={{ color: 'var(--linktree-text-secondary)' }}>ETH:</span>
                      <code className="text-sm bg-gray-800 text-gray-200 px-2 py-1 rounded" style={{ backgroundColor: 'var(--linktree-surface)', color: 'var(--linktree-text-primary)' }}>
                        0xA6591dCDfF5C7616110b4f84207184aef7835048
                      </code>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText('0xA6591dCDfF5C7616110b4f84207184aef7835048')}
                      className="px-3 py-1 bg-gray-700 text-white rounded text-xs hover:bg-gray-600 transition"
                      style={{ backgroundColor: 'var(--linktree-surface)', color: 'var(--linktree-text-primary)' }}
                    >
                      <i className="fas fa-copy mr-1"></i>Copy
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="font-medium mr-3" style={{ color: 'var(--linktree-text-secondary)' }}>BTC:</span>
                      <code className="text-sm bg-gray-800 text-gray-200 px-2 py-1 rounded" style={{ backgroundColor: 'var(--linktree-surface)', color: 'var(--linktree-text-primary)' }}>
                        bc1q47j2va60zk3fsmp5wwagdj36qqkja5epv8v2tz
                      </code>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText('bc1q47j2va60zk3fsmp5wwagdj36qqkja5epv8v2tz')}
                      className="px-3 py-1 bg-gray-700 text-white rounded text-xs hover:bg-gray-600 transition"
                      style={{ backgroundColor: 'var(--linktree-surface)', color: 'var(--linktree-text-primary)' }}
                    >
                      <i className="fas fa-copy mr-1"></i>Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* License */}
          <div className="rounded-2xl p-6 sm:p-8 shadow-lg" style={{ backgroundColor: 'var(--linktree-surface)' }}>
            <h2 className="text-2xl font-bold mb-4 flex items-center" style={{ color: 'var(--linktree-text-primary)' }}>
              <i className="fas fa-balance-scale mr-3 text-blue-500"></i>
              {t('about.license.title')}
            </h2>
            <p className="leading-relaxed" style={{ color: 'var(--linktree-text-secondary)' }}>
              {t('about.license.description')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

