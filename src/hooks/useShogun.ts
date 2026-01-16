import { useState, useEffect, useCallback } from "react";
import type { UserInfo } from "../types";
import Gun from "gun";
import "gun/sea";
import { ShogunCore } from "shogun-core";
import 'shogun-relays';

declare global {
  interface Window {
    SHOGUN_CORE: (config: any) => ShogunCore;
    ShogunRelays: {
      forceListUpdate: () => Promise<string[]>;
    };
  }
}

const REGISTRY_PEERS = [
            'https://gun.defucc.me/gun',
            'https://gun.o8.is/gun',
            'https://shogun-relay.scobrudot.dev/gun',
            'https://relay.peer.ooo/gun',
        ];

export const useShogun = () => {
  const [shogun, setShogun] = useState<ShogunCore | null>(null);
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize Shogun with relay list
    const initShogun = async () => {
      try {
        const freshRelays = await window.ShogunRelays.forceListUpdate();

        console.log("freshRelays", freshRelays);

        const gun = Gun({
          peers: REGISTRY_PEERS.concat(freshRelays),
          localStorage: false,
          multicast: false,
          radisk: false,
          wire: true,
          rtc: {
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:stun.cloudflare.com:3478" },
              { urls: "stun:stun.services.mozilla.com" },
            ],
            dataChannel: { ordered: false, maxRetransmits: 2 },
            sdp: {
              mandatory: {
                OfferToReceiveAudio: false,
                OfferToReceiveVideo: false,
              },
            },
            max: 55,
            room: "linkthree-webring",
          },
        });


        const shogunInstance = new ShogunCore({ gunInstance: gun });

        setShogun(shogunInstance);
        setIsInitialized(true);

        // Check for existing session
        checkExistingSession(shogunInstance);
      } catch (error) {
        console.error("Error initializing Shogun:", error);
        // Fallback to default peers if relay fetch fails
        const fallbackGun = Gun({
          peers: REGISTRY_PEERS,
          localStorage: false,
          multicast: false,
          radisk: false,
          wire: true,
          rtc: {
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:stun.cloudflare.com:3478" },
              { urls: "stun:stun.services.mozilla.com" },
            ],
            dataChannel: { ordered: false, maxRetransmits: 2 },
            sdp: {
              mandatory: {
                OfferToReceiveAudio: false,
                OfferToReceiveVideo: false,
              },
            },
            max: 55,
            room: "linkthree-webring",
          },
        });
        const shogunInstance = new ShogunCore({ gunInstance: fallbackGun });
        setShogun(shogunInstance);
        setIsInitialized(true);
        checkExistingSession(shogunInstance);
      }
    };

    initShogun();
  }, []);

  const checkExistingSession = useCallback(
    (shogunInstance: ShogunCore) => {
      try {
        const savedPub = localStorage.getItem("currentUserPub");
        const savedAlias = localStorage.getItem("currentUserAlias");

        if (savedPub) {
          setCurrentUser({
            sea: { pub: savedPub },
            alias: savedAlias || savedPub.substring(0, 8) + "...",
            pub: savedPub,
          });
        } else if (shogunInstance.isLoggedIn()) {
          const user = shogunInstance.getCurrentUser();
          if (user) {
            const username = (user.user as any)?.username || user.pub.substring(0, 8) + "...";
            const userInfo: UserInfo = {
              sea: { pub: user.pub },
              alias: username,
              pub: user.pub,
            };
            setCurrentUser(userInfo);
            localStorage.setItem("currentUserPub", user.pub);
            localStorage.setItem("currentUserAlias", username);
          }
        }
      } catch (error) {
        console.error("Error checking session:", error);
      }
    },
    []
  );

  const login = useCallback(
    async (username: string, password: string) => {
      if (!shogun) return { success: false, error: "Shogun not initialized" };

      try {
        const result = await shogun.login(username, password);

        if (result.success && result.userPub && result.sea) {
          const userInfo: UserInfo = {
            sea: { pub: result.sea.pub },
            alias: result.username || result.userPub.substring(0, 8) + "...",
            pub: result.userPub,
          };
          setCurrentUser(userInfo);
          localStorage.setItem("currentUserPub", result.userPub);
          localStorage.setItem("currentUserAlias", result.username || "");
          return { success: true };
        } else {
          return { success: false, error: result.error || "Login failed" };
        }
      } catch (error) {
        console.error("Login error:", error);
        return { success: false, error: "Login failed" };
      }
    },
    [shogun]
  );

  const signUp = useCallback(
    async (username: string, password: string) => {
      if (!shogun) return { success: false, error: "Shogun not initialized" };

      try {
        const result = await shogun.signUp(username, password);

        if (result.success && result.userPub && result.sea) {
          const userInfo: UserInfo = {
            sea: { pub: result.sea.pub },
            alias: result.username || result.userPub.substring(0, 8) + "...",
            pub: result.userPub,
          };
          setCurrentUser(userInfo);
          localStorage.setItem("currentUserPub", result.userPub);
          localStorage.setItem("currentUserAlias", result.username || "");
          return { success: true };
        } else {
          return { success: false, error: result.error || "Sign up failed" };
        }
      } catch (error) {
        console.error("Sign up error:", error);
        return { success: false, error: "Sign up failed" };
      }
    },
    [shogun]
  );

  const logout = useCallback(() => {
    if (shogun) {
      try {
        shogun.logout();
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
    setCurrentUser(null);
    localStorage.removeItem("currentUserPub");
    localStorage.removeItem("currentUserAlias");
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
