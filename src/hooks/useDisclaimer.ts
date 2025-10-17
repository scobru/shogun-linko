import { useState, useEffect } from 'react';

export const useDisclaimer = () => {
  const [hasAgreedToDisclaimer, setHasAgreedToDisclaimer] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has already agreed to disclaimer
    const agreed = localStorage.getItem('disclaimerAgreed');
    setHasAgreedToDisclaimer(agreed === 'true');
    setIsLoading(false);
  }, []);

  const agreeToDisclaimer = () => {
    localStorage.setItem('disclaimerAgreed', 'true');
    setHasAgreedToDisclaimer(true);
  };

  return {
    hasAgreedToDisclaimer,
    agreeToDisclaimer,
    isLoading
  };
};
