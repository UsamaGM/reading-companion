import { useAuthStore } from "@/store/authStore";
import { useRootNavigationState, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

export default function NavigationHandler() {
  const user = useAuthStore((s) => s.user);
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (user && inAuthGroup) {
      router.replace("/(main)");
    }
  }, [user, segments, navigationState?.key]);

  return null;
}
