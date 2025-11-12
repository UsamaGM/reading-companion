import React from "react";
import { Slot } from "expo-router";
import { initializeAuth } from "@/store/authStore";
import Toast from "react-native-toast-message";
import LoadingModal from "@/components/LoadingModal";
import NavigationHandler from "@/components/NavigationHandler";
import "react-native-reanimated";
import "./global.css";

initializeAuth();

export default function RootLayout() {
  return (
    <>
      <NavigationHandler />
      <Slot />
      <LoadingModal />
      <Toast topOffset={80} />
    </>
  );
}
