import React, { useEffect } from "react";
import { Stack, router, useRootNavigationState } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useAuthStore, initializeAuth } from "@/store/authStore";
import "react-native-reanimated";
import "./global.css";
import LoadingModal from "@/components/LoadingModal";
import Toast from "react-native-toast-message";
import { useUiStore } from "@/store/uiStore";

initializeAuth();

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const rootNavigationState = useRootNavigationState();
  const user = useAuthStore((s) => s.user);
  const isLoading = useUiStore((s) => s.isLoading);

  useEffect(() => {
    if (isLoading || !rootNavigationState.key) return;

    SplashScreen.hideAsync();

    if (user) {
      router.replace("/(main)/bookshelf");
    } else {
      router.replace("/(auth)/login");
    }
  }, [isLoading, user]);

  return (
    <>
      <Stack
        screenOptions={{
          statusBarStyle: "auto",
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(main)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>

      <LoadingModal />
      <Toast />
    </>
  );
}
