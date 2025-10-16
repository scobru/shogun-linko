import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

/**
 * Handles redirects from legacy URL format (?page=xxx) to new format (/view/xxx)
 */
export default function LegacyRedirect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const pageParam = searchParams.get('page');
    if (pageParam) {
      // Redirect from ?page=xxx to /view/xxx
      navigate(`/view/${pageParam}`, { replace: true });
    }
  }, [searchParams, navigate]);

  return null;
}

