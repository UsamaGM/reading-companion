import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/authStore";

export default function Index() {
  const user = useAuthStore((s) => s.user);

  return <Redirect href={user ? "/(main)" : "/(auth)/login"} />;
}
