/**
 * Mobile-specific hooks for iOS and Android
 * Uses Capacitor for native platform integration
 */

import { useEffect, useState, useCallback } from "react";
import {
  App,
  AppState,
  BiometricAuth,
  PushNotifications,
  LocalNotifications,
  Keyboard,
  StatusBar,
} from "@capacitor/core";
import { isPlatform } from "@capacitor/core";

/**
 * Hook: Initialize mobile app lifecycle
 */
export function useMobileInit() {
  useEffect(() => {
    if (!isPlatform("hybrid")) return;

    const initMobile = async () => {
      // Hide splash screen
      try {
        await App.hideSplashScreen();
      } catch (e) {
        console.warn("Splash screen already hidden");
      }

      // Setup status bar
      await StatusBar.setBackgroundColor({ color: "#0b0c0e" });
      await StatusBar.setStyle({ style: "dark" });

      // Handle app state changes
      App.addListener("appStateChange", ({ isActive }) => {
        if (isActive) {
          console.log("[Mobile] App resumed");
          // Refresh data
        } else {
          console.log("[Mobile] App paused");
          // Save state
        }
      });

      // Handle app URL schemes (deep linking)
      App.addListener("appUrlOpen", ({ url }) => {
        console.log("[Mobile] Deep link:", url);
        // Parse and navigate
      });

      // Handle back button (Android)
      App.addListener("backButton", ({ canGoBack }) => {
        if (!canGoBack) {
          App.exitApp();
        }
      });
    };

    initMobile();
  }, []);
}

/**
 * Hook: Biometric authentication (Face ID, Touch ID, Fingerprint)
 */
export function useBiometricAuth() {
  const [available, setAvailable] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);

  useEffect(() => {
    const checkBiometric = async () => {
      try {
        const result = await BiometricAuth.isAvailable();
        setAvailable(result.isAvailable);
      } catch (e) {
        setAvailable(false);
      }
    };

    if (isPlatform("hybrid")) {
      checkBiometric();
    }
  }, []);

  const authenticate = useCallback(
    async (reason = "Authenticate to TEMPLE WIRED") => {
      if (!available) return false;

      setAuthenticating(true);
      try {
        const result = await BiometricAuth.authenticate({
          reason,
          negativeButtonText: "Cancel",
          fallbackAuthenticationText: "Use passcode",
        });

        return result.success;
      } catch (e) {
        console.error("Biometric auth failed:", e);
        return false;
      } finally {
        setAuthenticating(false);
      }
    },
    [available],
  );

  return { available, authenticating, authenticate };
}

/**
 * Hook: Push Notifications
 */
export function usePushNotifications() {
  const [permission, setPermission] = useState<"granted" | "denied" | "default">(
    "default",
  );

  useEffect(() => {
    const setupPushNotifications = async () => {
      // Request permission
      const permResult = await PushNotifications.requestPermissions();
      setPermission(permResult.receive === "granted" ? "granted" : "denied");

      if (permResult.receive === "granted") {
        // Register with FCM/APNs
        await PushNotifications.register();

        // Listen for notifications
        PushNotifications.addListener(
          "pushNotificationReceived",
          (notification) => {
            console.log("[Push] Received:", notification);
            // Handle notification
          },
        );

        PushNotifications.addListener(
          "pushNotificationActionPerformed",
          (action) => {
            console.log("[Push] Action:", action.notification);
            // Navigate to relevant screen
          },
        );
      }
    };

    if (isPlatform("hybrid")) {
      setupPushNotifications();
    }
  }, []);

  return { permission };
}

/**
 * Hook: Local notifications for offline alerts
 */
export function useLocalNotifications() {
  const notify = useCallback(
    async (
      title: string,
      body: string,
      id = 1,
      delaySeconds = 0,
    ) => {
      if (!isPlatform("hybrid")) return;

      await LocalNotifications.schedule({
        notifications: [
          {
            id,
            title,
            body,
            smallIcon: "ic_stat_icon_config_sample",
            iconColor: "#00d9ff",
            schedule: delaySeconds > 0 ? { at: new Date(Date.now() + delaySeconds * 1000) } : undefined,
          },
        ],
      });
    },
    [],
  );

  return { notify };
}

/**
 * Hook: Keyboard management (Android soft keyboard)
 */
export function useKeyboard() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isPlatform("hybrid")) return;

    const listener1 = Keyboard.addListener("keyboardWillShow", () => {
      setIsVisible(true);
    });

    const listener2 = Keyboard.addListener("keyboardWillHide", () => {
      setIsVisible(false);
    });

    return () => {
      listener1.remove();
      listener2.remove();
    };
  }, []);

  const hide = useCallback(async () => {
    await Keyboard.hide();
  }, []);

  const show = useCallback(async () => {
    await Keyboard.show();
  }, []);

  return { isVisible, hide, show };
}

/**
 * Hook: Check if running on native app vs web
 */
export function useNativeApp() {
  const isNative = isPlatform("hybrid");
  const isIOS = isPlatform("ios");
  const isAndroid = isPlatform("android");

  return { isNative, isIOS, isAndroid };
}

/**
 * Hook: Safe area insets (notch, home indicator, etc.)
 */
export function useSafeArea() {
  const [insets, setInsets] = useState({ top: 0, bottom: 0, left: 0, right: 0 });

  useEffect(() => {
    if (!isPlatform("hybrid")) return;

    const updateInsets = () => {
      // Simplified - in real app, use capacitor-safe-area plugin
      if (isPlatform("ios")) {
        setInsets({
          top: window.visualViewport?.offsetTop || 0,
          bottom: isPlatform("ios") ? 34 : 0, // Home indicator
          left: 0,
          right: 0,
        });
      }
    };

    updateInsets();
    window.addEventListener("orientationchange", updateInsets);
    return () => window.removeEventListener("orientationchange", updateInsets);
  }, []);

  return insets;
}
