import { useState, useEffect, useCallback } from 'react';
import type { ShogunCoreInstance, UserInfo } from '../types';

export const useUserAvatar = (shogun: ShogunCoreInstance | null, currentUser: UserInfo | null) => {
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  useEffect(() => {
    if (shogun && currentUser) {
      loadAvatar();
    } else {
      setAvatarUrl('');
    }
  }, [shogun, currentUser]);

  const loadAvatar = async () => {
    if (!shogun || !currentUser) return;

    try {
      await shogun.db.user.get('avatar').once((avatarData: string) => {
        if (avatarData && avatarData !== null) {
          setAvatarUrl(avatarData);
        } else {
          setAvatarUrl(getDefaultAvatar(currentUser.alias));
        }
      });
    } catch (error) {
      console.error('Error loading avatar:', error);
      setAvatarUrl(getDefaultAvatar(currentUser.alias));
    }
  };

  const getDefaultAvatar = (alias: string) => {
    const initials = alias ? alias.substring(0, 2).toUpperCase() : 'U';
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="20" fill="#4F46E5"/>
        <text x="20" y="26" text-anchor="middle" fill="white" font-family="Arial" font-size="14" font-weight="bold">${initials}</text>
      </svg>
    `)}`;
  };

  const uploadAvatar = useCallback(
    async (file: File) => {
      if (!shogun || !currentUser) return;

      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const result = e.target?.result as string;
          try {
            await shogun.db.user.get('avatar').put(result);
            setAvatarUrl(result);
            resolve(result);
          } catch (error) {
            console.error('Error saving avatar:', error);
            reject(error);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },
    [shogun, currentUser]
  );

  return {
    avatarUrl: avatarUrl || (currentUser ? getDefaultAvatar(currentUser.alias) : ''),
    uploadAvatar,
    loadAvatar,
  };
};

