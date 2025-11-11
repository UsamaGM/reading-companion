import { Stack } from "expo-router";
import "react-native-reanimated";
import "./global.css";
import { initializeAuth } from "@/store/authStore";

export { ErrorBoundary } from "expo-router";

initializeAuth();

export default function RootLayout() {
  return <Stack initialRouteName="(auth)" />;
}
