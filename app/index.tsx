import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";

export default function Index() {
  const isLoading = useUiStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);

  if (isLoading) return null;

  return <Redirect href={user ? "/(main)" : "/(auth)/login"} />;
}
