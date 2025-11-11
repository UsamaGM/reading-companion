import { Stack } from "expo-router";

export default function AuthLayout() {
	return (
		<Stack>
			<Stack.Screen name="login" options={{ title: "Login" }} />
			<Stack.Screen name="signUp" options={{ title: "Create Account" }} />
		</Stack>
	);
}
