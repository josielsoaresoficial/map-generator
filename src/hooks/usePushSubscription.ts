import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const VAPID_PUBLIC_KEY = "BH6Dhg7z5ND1SYboeGUQkxLLIu9wHPirJiCaesPcjjRhCB1GdVAiBh3E6sUg269FcK9cvWwpXkETmyQH-2-YR8E";

export const usePushSubscription = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.log("[Push] Push notifications not supported");
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      
      if (sub) {
        setSubscription(sub);
        setIsSubscribed(true);
        console.log("[Push] Already subscribed:", sub.endpoint);
      }
    } catch (error) {
      console.error("[Push] Error checking subscription:", error);
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribe = useCallback(async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      toast.error("Push notifications não suportadas neste navegador");
      return false;
    }

    setIsLoading(true);

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission !== "granted") {
        toast.error("Permissão de notificação negada");
        setIsLoading(false);
        return false;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      console.log("[Push] New subscription:", sub);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Usuário não autenticado");
        setIsLoading(false);
        return false;
      }

      // Save subscription to database
      const subscriptionData = sub.toJSON();
      const { error } = await supabase
        .from("push_subscriptions")
        .insert({
          user_id: user.id,
          endpoint: subscriptionData.endpoint!,
          p256dh: subscriptionData.keys!.p256dh,
          auth: subscriptionData.keys!.auth,
        });

      if (error) {
        console.error("[Push] Error saving subscription:", error);
        toast.error("Erro ao salvar inscrição");
        setIsLoading(false);
        return false;
      }

      setSubscription(sub);
      setIsSubscribed(true);
      toast.success("Notificações push ativadas!");
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("[Push] Error subscribing:", error);
      toast.error("Erro ao ativar notificações push");
      setIsLoading(false);
      return false;
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    if (!subscription) {
      return false;
    }

    setIsLoading(true);

    try {
      // Unsubscribe from push
      await subscription.unsubscribe();

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Remove from database
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("endpoint", subscription.endpoint);
      }

      setSubscription(null);
      setIsSubscribed(false);
      toast.success("Notificações push desativadas");
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("[Push] Error unsubscribing:", error);
      toast.error("Erro ao desativar notificações push");
      setIsLoading(false);
      return false;
    }
  }, [subscription]);

  const sendPushNotification = useCallback(async (
    title: string,
    body: string,
    options?: {
      tag?: string;
      icon?: string;
      requireInteraction?: boolean;
      vibrate?: number[];
      data?: any;
    }
  ) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error("[Push] No active session");
        return false;
      }

      const response = await supabase.functions.invoke("notify", {
        body: {
          title,
          body,
          tag: options?.tag,
          icon: options?.icon,
          requireInteraction: options?.requireInteraction,
          vibrate: options?.vibrate,
          data: options?.data,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        console.error("[Push] Error sending notification:", response.error);
        return false;
      }

      console.log("[Push] Notification sent:", response.data);
      return true;
    } catch (error) {
      console.error("[Push] Error sending push notification:", error);
      return false;
    }
  }, []);

  return {
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
    sendPushNotification,
  };
};
