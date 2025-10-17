import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../hooks/useLanguage';

interface DisclaimerProps {
  onAgree: () => void;
}

export default function Disclaimer({ onAgree }: DisclaimerProps) {
  const { t } = useTranslation();
  const { language, toggleLanguage } = useLanguage();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div
        className="rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{ 
          backgroundColor: 'var(--linktree-surface)',
          borderColor: 'var(--linktree-outline)',
          border: '1px solid var(--linktree-outline)'
        }}
      >
        <div className="text-center mb-6">
          <div className="flex justify-between items-start mb-4">
            <div></div>
            <button
              onClick={toggleLanguage}
              className="px-3 py-2 border rounded-full hover:bg-gray-50 transition font-medium text-sm"
              style={{
                backgroundColor: 'var(--linktree-surface-variant)',
                color: 'var(--linktree-text-primary)',
                borderColor: 'var(--linktree-outline)',
              }}
              title={language === 'en' ? 'Passa all\'italiano' : 'Switch to English'}
            >
              <i className="fas fa-language mr-1"></i>
              <span className="font-bold">{language.toUpperCase()}</span>
            </button>
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--linktree-text-primary)' }}>
            {t('disclaimer.title')}
          </h1>
          <p className="text-lg font-semibold" style={{ color: 'var(--linktree-accent)' }}>
            {t('disclaimer.subtitle')}
          </p>
        </div>

        <div className="space-y-4 mb-8 text-sm leading-relaxed" style={{ color: 'var(--linktree-text-secondary)' }}>
          <p>
            {t('disclaimer.content1')}
          </p>
          
          <p>
            {t('disclaimer.content2')}
          </p>
          
          <p>
            {t('disclaimer.content3')}
          </p>
        </div>

        <div className="text-center">
          <button
            onClick={onAgree}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition shadow-lg text-lg"
          >
            {t('disclaimer.agreeButton')}
          </button>
        </div>
      </div>
    </div>
  );
}
