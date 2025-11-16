import { useState } from "react";
import {
  View,
  TextInput,
  Text,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import Toast from "react-native-toast-message";
import { AppwriteException } from "react-native-appwrite";
import AuthButton from "@/components/AuthButton";
import StyledLink from "@/components/StyledLink";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = useAuthStore((s) => s.logIn);
  const setLoading = useUiStore((s) => s.setLoading);

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please fill in all fields.",
      });
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
    } catch (error: any) {
      const e = error as AppwriteException;
      Toast.show({ type: "error", text1: "Login Failed", text2: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="safe-area-container">
      <KeyboardAvoidingView
        className="flex-1 justify-center"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="auth-container">
          <Text className="auth-title">Welcome Back!</Text>
          <TextInput
            className="auth-input"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            className="auth-input"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <AuthButton onPress={handleLogin} title="Login" />

          <View className="flex flex-row justify-center mt-5">
            <Text className="text-lg text-gray-700">
              Don't have an account?{" "}
            </Text>
            <StyledLink href="/(auth)/signUp" title="Sign Up" />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
