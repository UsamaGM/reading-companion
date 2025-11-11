import React, { useEffect } from "react";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useAuthStore, initializeAuth } from "@/store/authStore";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";

initializeAuth();

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();

      if (user) {
        router.replace("/(main)/bookshelf");
      } else {
        router.replace("/(auth)/login");
      }
    }
  }, [isLoading, user]);

  if (isLoading) {
    return (
      <View className="flex flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(main)" options={{ headerShown: false }} />
    </Stack>
  );
}
