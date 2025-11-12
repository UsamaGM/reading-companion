import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { CLUBS_TABLE, DATABASE_ID, databases } from "@/lib/appwrite";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

export default function JoinClubScreen() {
  const user = useAuthStore((s) => s.user);
  const setLoading = useUiStore((s) => s.setLoading);
  const [inviteCode, setInviteCode] = useState("");

  const handleSubmit = async () => {
    if (!inviteCode || !user) {
      Toast.show({ type: "error", text1: "Invite code is required." });
      return;
    }

    setLoading(true);
    try {
      const club = await databases.getDocument(
        DATABASE_ID,
        CLUBS_TABLE,
        inviteCode.trim(),
      );

      const members = club.members as string[];
      if (members.includes(user.$id)) {
        Toast.show({
          type: "info",
          text1: "Already a Member",
          text2: `You are already in ${club.clubName}.`,
        });
        router.back();
        return;
      }

      const newMembers = [...members, user.$id];
      await databases.updateDocument(DATABASE_ID, CLUBS_TABLE, club.$id, {
        members: newMembers,
      });

      Toast.show({
        type: "success",
        text1: "Joined Club!",
        text2: `Welcome to ${club.clubName}.`,
      });
      router.back();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Failed to Join Club",
        text2: error.message.includes("not_found")
          ? "Invalid invite code. Club not found."
          : error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="safe-area-container">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <StatusBar style="dark" />
        <View className="p-4">
          <Text className="text-3xl font-bold mb-6">Join a Club</Text>

          <Text className="text-lg font-semibold mb-2">Invite Code</Text>
          <TextInput
            value={inviteCode}
            onChangeText={setInviteCode}
            placeholder="Enter the club ID"
            autoCapitalize="none"
            className="bg-white p-3 rounded-lg border border-gray-300 mb-6 text-base"
          />

          <TouchableOpacity
            onPress={handleSubmit}
            className="bg-green-500 py-3 rounded-lg shadow-md"
          >
            <Text className="text-white font-bold text-center text-lg">
              Join Club
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
