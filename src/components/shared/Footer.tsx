import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="w-full py-3 border-t" style={{ 
      borderColor: 'var(--linktree-outline)', 
      backgroundColor: 'var(--linktree-surface-variant)' 
    }}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center text-sm" style={{ color: 'var(--linktree-text-secondary)' }}>
          <a
            href="https://github.com/scobru/shogun-linkthree"
            className="hover:opacity-80 transition mr-2"
            style={{ color: 'var(--linktree-primary)' }}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('footer.repo')}
          </a>
          <span className="mx-2">-</span>
          <span className="mr-1">{t('footer.builtWith')}</span>
          <a
            href="https://github.com/scobru"
            className="hover:opacity-80 transition mr-2"
            style={{ color: 'var(--linktree-primary)' }}
            target="_blank"
            rel="noopener noreferrer"
          >
            scobru
          </a>
          <span className="mx-2">-</span>
          <span className="mr-1">{t('footer.partOf')}</span>
          <a
            href="https://shogun-info.vercel.app"
            className="hover:opacity-80 transition"
            style={{ color: 'var(--linktree-primary)' }}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('footer.shogunProject')}
          </a>
        </div>
      </div>
    </footer>
  );
}
