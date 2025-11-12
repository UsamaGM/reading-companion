import { Stack } from "expo-router";

export default function AuthLayout() {
	return (
		<Stack screenOptions={{ statusBarHidden: false, statusBarStyle: "dark" }}>
			<Stack.Screen name="login" options={{ headerShown: false }} />
			<Stack.Screen name="signUp" options={{ headerShown: false }} />
		</Stack>
	);
}
