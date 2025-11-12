import React, { useState } from "react";
import { View, TextInput, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import Toast from "react-native-toast-message";
import { AppwriteException } from "react-native-appwrite";
import AuthButton from "@/components/AuthButton";

export default function SignUpScreen() {
  const setLoading = useUiStore((s) => s.setLoading);
  const signUp = useAuthStore((s) => s.signUp);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async () => {
    if (!username || !email || !password) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please fill in all fields",
      });
      return;
    }

    try {
      setLoading(true);
      await signUp(email, password, username);
    } catch (error: any) {
      const e = error as AppwriteException;
      Toast.show({ type: "error", text1: "Sign Up Failed", text2: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="safe-area-container">
      <View className="auth-container">
        <Text className="auth-title">Create Account</Text>
        <TextInput
          className="auth-input"
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
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
        <AuthButton onPress={handleSignUp} title="Sign Up" />
      </View>
    </SafeAreaView>
  );
}
