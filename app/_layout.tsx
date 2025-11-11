import React, { useEffect } from "react";
import { Stack, router, useRootNavigationState } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useAuthStore, initializeAuth } from "@/store/authStore";
import "react-native-reanimated";
import "./global.css";

initializeAuth();

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const rootNavigationState = useRootNavigationState();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    if (isLoading) return;

    SplashScreen.hideAsync();

    if (user) {
      router.replace("/(main)/bookshelf");
    } else {
      router.replace("/(auth)/login");
    }
  }, [isLoading, user]);

  if (!rootNavigationState.key) return null;

  return (
    <Stack
      screenOptions={{
        statusBarStyle: "auto",
      }}
    >
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(main)" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
