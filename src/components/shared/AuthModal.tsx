import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string, password: string) => Promise<void>;
  onSignUp: (username: string, password: string) => Promise<void>;
  onLoginWithKeypair?: (keypairJson: string) => Promise<void>;
}

export default function AuthModal({ isOpen, onClose, onLogin, onSignUp, onLoginWithKeypair }: AuthModalProps) {
  const { t } = useTranslation();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isKeypairMode, setIsKeypairMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [keypairJson, setKeypairJson] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isKeypairMode) {
      if (!keypairJson.trim()) {
        setFeedback(t('auth.keypairPlaceholder'));
        return;
      }
      
      if (!onLoginWithKeypair) {
        setFeedback(t('auth.keypairLoginError'));
        return;
      }

      setIsLoading(true);
      setFeedback('');

      try {
        await onLoginWithKeypair(keypairJson);
        setKeypairJson('');
        setFeedback('');
      } catch (error) {
        setFeedback(t('auth.keypairLoginError'));
      } finally {
        setIsLoading(false);
      }
    } else {
      if (!username || !password) {
        setFeedback(t('auth.enterCredentials'));
        return;
      }

      setIsLoading(true);
      setFeedback('');

      try {
        if (isRegisterMode) {
          await onSignUp(username, password);
        } else {
          await onLogin(username, password);
        }
        setUsername('');
        setPassword('');
        setFeedback('');
      } catch (error) {
        setFeedback(isRegisterMode ? t('auth.registrationError') : t('auth.invalidCredentials'));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const toggleKeypairMode = () => {
    setIsKeypairMode(!isKeypairMode);
    setFeedback('');
    setIsRegisterMode(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div
        className="rounded-2xl shadow-2xl p-8 max-w-md w-full text-center transform transition-all"
        style={{ backgroundColor: 'var(--linktree-surface)', borderColor: 'var(--linktree-outline)' }}
      >
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--linktree-text-primary)' }}>
          {isKeypairMode ? t('auth.keypairLogin') : isRegisterMode ? t('auth.registerTitle') : t('auth.title')}
        </h2>
        <p className="mb-6" style={{ color: 'var(--linktree-text-secondary)' }}>
          {isKeypairMode ? t('auth.keypairPlaceholder') : isRegisterMode ? t('auth.registerDescription') : t('auth.description')}
        </p>

        <form onSubmit={handleSubmit}>
          {isKeypairMode ? (
            <div className="mb-6">
              <textarea
                placeholder={t('auth.keypairPlaceholder')}
                value={keypairJson}
                onChange={(e) => setKeypairJson(e.target.value)}
                disabled={isLoading}
                rows={6}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition font-mono text-sm"
                style={{
                  backgroundColor: 'var(--linktree-surface)',
                  color: 'var(--linktree-text-primary)',
                  borderColor: 'var(--linktree-outline)',
                  resize: 'vertical',
                }}
              />
            </div>
          ) : (
            <>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder={t('auth.username')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                  style={{
                    backgroundColor: 'var(--linktree-surface)',
                    color: 'var(--linktree-text-primary)',
                    borderColor: 'var(--linktree-outline)',
                  }}
                />
              </div>
              <div className="mb-6">
                <input
                  type="password"
                  placeholder={t('auth.password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                  style={{
                    backgroundColor: 'var(--linktree-surface)',
                    color: 'var(--linktree-text-primary)',
                    borderColor: 'var(--linktree-outline)',
                  }}
                />
              </div>
            </>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full px-6 py-2 text-white font-bold rounded-lg transition mb-3 ${
              isKeypairMode ? 'bg-purple-600 hover:bg-purple-700' : isRegisterMode ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isLoading ? (
              <i className="fas fa-spinner fa-spin mr-2"></i>
            ) : (
              <i className={`fas fa-${isKeypairMode ? 'key' : isRegisterMode ? 'user-plus' : 'sign-in-alt'} mr-2`}></i>
            )}
            {isLoading ? t('auth.loading') : isKeypairMode ? t('auth.keypairLogin') : isRegisterMode ? t('auth.register') : t('auth.login')}
          </button>
          
          {/* Mode toggle buttons */}
          <div className="flex flex-col gap-2">
            {!isKeypairMode && (
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(!isRegisterMode);
                  setFeedback('');
                }}
                className="text-indigo-600 hover:text-indigo-800 transition"
              >
                {isRegisterMode ? t('auth.hasAccount') : t('auth.noAccount')}
              </button>
            )}
            {onLoginWithKeypair && (
              <button
                type="button"
                onClick={toggleKeypairMode}
                className="text-purple-600 hover:text-purple-800 transition text-sm"
              >
                <i className="fas fa-key mr-1"></i>
                {isKeypairMode ? t('auth.useCredentials') : t('auth.useKeypair')}
              </button>
            )}
          </div>
        </form>

        {feedback && (
          <div className="text-red-600 h-5 mt-2 font-semibold">{feedback}</div>
        )}
        
        <button
          onClick={() => {
            onClose();
            setFeedback('');
            setUsername('');
            setPassword('');
            setKeypairJson('');
            setIsKeypairMode(false);
          }}
          className="mt-4 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
          style={{
            backgroundColor: 'var(--linktree-surface-variant)',
            color: 'var(--linktree-text-primary)',
          }}
        >
          {t('auth.cancel')}
        </button>
      </div>
    </div>
  );
}


