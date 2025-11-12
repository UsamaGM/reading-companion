import React from "react";
import { Stack } from "expo-router";
import { initializeAuth } from "@/store/authStore";
import Toast from "react-native-toast-message";
import LoadingModal from "@/components/LoadingModal";
import "react-native-reanimated";
import "./global.css";

initializeAuth();

export default function RootLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(main)" options={{ headerShown: false }} />
      </Stack>
      <LoadingModal />
      <Toast />
    </>
  );
}
