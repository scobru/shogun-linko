import { useState, useEffect, useCallback } from 'react';
import type { ShogunCoreInstance, UserInfo } from '../types';
import { ShogunCore } from 'shogun-core';

declare global {
  interface Window {
    SHOGUN_CORE: (config: any) => ShogunCoreInstance;
  }
}

export const useShogun = () => {
  const [shogun, setShogun] = useState<ShogunCoreInstance | null>(null);
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
      const shogunInstance = new ShogunCore({
        gunOptions: {
          peers: [
            'https://peer.wallie.io/gun',
            'https://v5g5jseqhgkp43lppgregcfbvi.srv.us/gun',
            'https://relay.shogun-eco.xyz/gun',
          ],
          localStorage: true,
          multicast: false,
          radisk: true,
          wire: true,
          rtc: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun.cloudflare.com:3478' },
              { urls: 'stun:stun.services.mozilla.com' },
            ],
            dataChannel: { ordered: false, maxRetransmits: 2 },
            sdp: {
              mandatory: {
                OfferToReceiveAudio: false,
                OfferToReceiveVideo: false,
              },
            },
            max: 55,
            room: 'linkthree-webring',
          },
        },
      });

      setShogun(shogunInstance);
      setIsInitialized(true);

      // Check for existing session
      checkExistingSession(shogunInstance);
    
  }, []);

  const checkExistingSession = useCallback((shogunInstance: ShogunCoreInstance) => {
    try {
      const savedPub = localStorage.getItem('currentUserPub');
      const savedAlias = localStorage.getItem('currentUserAlias');

      if (savedPub) {
        setCurrentUser({
          sea: { pub: savedPub },
          alias: savedAlias || savedPub.substring(0, 8) + '...',
          pub: savedPub,
        });
      } else if (shogunInstance.isLoggedIn()) {
        const user = shogunInstance.getCurrentUser();
        if (user) {
          const userInfo: UserInfo = {
            sea: { pub: user.pub },
            alias: user.username,
            pub: user.pub,
          };
          setCurrentUser(userInfo);
          localStorage.setItem('currentUserPub', user.pub);
          localStorage.setItem('currentUserAlias', user.username || '');
        }
      }
    } catch (error) {
      console.error('Error checking session:', error);
    }
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      if (!shogun) return { success: false, error: 'Shogun not initialized' };

      try {
        const result = await shogun.login(username, password);

        if (result.success) {
          const userInfo: UserInfo = {
            sea: result.sea,
            alias: result.username,
            pub: result.userPub,
          };
          setCurrentUser(userInfo);
          localStorage.setItem('currentUserPub', result.userPub);
          localStorage.setItem('currentUserAlias', result.username || '');
          return { success: true };
        } else {
          return { success: false, error: result.error };
        }
      } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Login failed' };
      }
    },
    [shogun]
  );

  const signUp = useCallback(
    async (username: string, password: string) => {
      if (!shogun) return { success: false, error: 'Shogun not initialized' };

      try {
        const result = await shogun.signUp(username, password);

        if (result.success) {
          const userInfo: UserInfo = {
            sea: result.sea,
            alias: result.username,
            pub: result.userPub,
          };
          setCurrentUser(userInfo);
          localStorage.setItem('currentUserPub', result.userPub);
          localStorage.setItem('currentUserAlias', result.username || '');
          return { success: true };
        } else {
          return { success: false, error: result.error };
        }
      } catch (error) {
        console.error('Sign up error:', error);
        return { success: false, error: 'Sign up failed' };
      }
    },
    [shogun]
  );

  const logout = useCallback(() => {
    if (shogun) {
      try {
        shogun.logout();
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    setCurrentUser(null);
    localStorage.removeItem('currentUserPub');
    localStorage.removeItem('currentUserAlias');
  }, [shogun]);

  return {
    shogun,
    currentUser,
    isInitialized,
    login,
    signUp,
    logout,
    isLoggedIn: !!currentUser,
  };
};

