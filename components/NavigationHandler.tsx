import { useAuthStore } from "@/store/authStore";
import { useNavigationContainerRef, useRouter, useSegments } from "expo-router";
import { useEffect, useRef } from "react";

export default function NavigationHandler() {
  const user = useAuthStore((s) => s.user);
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useNavigationContainerRef();
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!navigationState.current) return;

    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (user && inAuthGroup) {
      router.replace("/(main)");
    }
  }, [user, segments, navigationState]);

  return null;
}
