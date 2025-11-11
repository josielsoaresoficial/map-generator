import { useState, useEffect, useCallback } from "react";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Capacitor } from "@capacitor/core";
import { useVibrationSettings } from "./useVibrationSettings";
import { NotificationSoundType } from "@/utils/alertSound";

let serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false);
  const { getVibrationPattern } = useVibrationSettings();

  useEffect(() => {
    checkPermission();
    registerServiceWorker();
  }, []);

  const registerServiceWorker = async () => {
    if (Capacitor.isNativePlatform() || !('serviceWorker' in navigator)) {
      return;
    }

    try {
      console.log('[Notifications] Registering service worker...');
      
      // Register the custom service worker
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('[Notifications] Service worker registered:', registration);

      // Wait for the service worker to be ready
      await navigator.serviceWorker.ready;
      serviceWorkerRegistration = registration;
      setIsServiceWorkerReady(true);

      console.log('[Notifications] Service worker is ready');
    } catch (error) {
      console.error('[Notifications] Service worker registration failed:', error);
    }
  };

  const checkPermission = async () => {
    if (Capacitor.isNativePlatform()) {
      const result = await LocalNotifications.checkPermissions();
      setPermission(result.display === "granted" ? "granted" : "denied");
    } else {
      setPermission(Notification.permission);
    }
  };

  const requestPermission = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        const result = await LocalNotifications.requestPermissions();
        const newPermission = result.display === "granted" ? "granted" : "denied";
        setPermission(newPermission);
        return newPermission;
      } else {
        // Request notification permission
        const result = await Notification.requestPermission();
        setPermission(result);

        // If granted and service worker is ready, we're all set
        if (result === "granted" && !isServiceWorkerReady) {
          await registerServiceWorker();
        }

        return result;
      }
    } catch (error) {
      console.error("[Notifications] Error requesting permission:", error);
      return "denied";
    }
  };

  const sendNotification = useCallback(async (
    title: string, 
    body: string, 
    options?: {
      tag?: string;
      requireInteraction?: boolean;
      vibrate?: number[];
      soundType?: NotificationSoundType;
    }
  ) => {
    const vibrationPattern = options?.vibrate || getVibrationPattern();
    if (permission !== "granted") {
      console.log("[Notifications] Permission not granted");
      return;
    }

    try {
      if (Capacitor.isNativePlatform()) {
        // Use Capacitor Local Notifications for native platforms
        // Map sound types to different sound files
        const soundMap: Record<NotificationSoundType, string> = {
          task: "beep_task.wav",
          pomodoro: "beep_pomodoro.wav",
          break: "beep_break.wav",
          reminder: "beep_reminder.wav"
        };
        
        const soundFile = options?.soundType ? soundMap[options.soundType] : "beep.wav";
        
        await LocalNotifications.schedule({
          notifications: [
            {
              title,
              body,
              id: Math.floor(Math.random() * 1000000),
              schedule: { at: new Date(Date.now() + 100) },
              sound: soundFile,
              smallIcon: "ic_stat_icon_config_sample",
              iconColor: "#4B9BF5",
              ongoing: false,
              autoCancel: true,
              extra: {
                vibrate: vibrationPattern,
                soundType: options?.soundType || "task",
              },
            },
          ],
        });
        console.log(`[Notifications] Native notification sent with ${soundFile}`);
      } else {
        // Use Service Worker for web to enable persistent notifications
        if (serviceWorkerRegistration && isServiceWorkerReady) {
          console.log("[Notifications] Sending notification via service worker");
          
          // Create a message channel for communication
          const messageChannel = new MessageChannel();
          
          // Listen for response
          messageChannel.port1.onmessage = (event) => {
            if (event.data.success) {
              console.log("[Notifications] Service worker notification sent successfully");
            } else {
              console.error("[Notifications] Service worker notification failed:", event.data.error);
            }
          };

          // Send message to service worker
          serviceWorkerRegistration.active?.postMessage(
            {
              type: 'SHOW_NOTIFICATION',
              title,
              body,
              icon: '/icon-192x192.png',
              tag: options?.tag || `notification-${Date.now()}`,
              requireInteraction: options?.requireInteraction !== undefined ? options.requireInteraction : true,
              vibrate: vibrationPattern,
              soundType: options?.soundType || "task",
            },
            [messageChannel.port2]
          );
        } else {
          // Fallback to regular Notification API
          console.log("[Notifications] Fallback to regular notification API");
          new Notification(title, {
            body,
            icon: "/icon-192x192.png",
            badge: "/icon-192x192.png",
            requireInteraction: options?.requireInteraction !== undefined ? options.requireInteraction : true,
            tag: options?.tag,
          });
        }
      }
    } catch (error) {
      console.error("[Notifications] Error sending notification:", error);
    }
  }, [permission, isServiceWorkerReady, getVibrationPattern]);

  return { 
    permission, 
    requestPermission, 
    sendNotification,
    isServiceWorkerReady 
  };
};
