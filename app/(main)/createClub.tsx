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
import { ID, Permission, Role } from "react-native-appwrite";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

function generateInviteCode(length: number) {
  const chars = "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function CreateClubScreen() {
  const { user } = useAuthStore();
  const { setLoading } = useUiStore();
  const [clubName, setClubName] = useState("");

  const handleSubmit = async () => {
    if (!clubName || !user) {
      Toast.show({ type: "error", text1: "Club name is required." });
      return;
    }

    setLoading(true);
    try {
      const inviteCode = generateInviteCode(6);

      const newClubData = {
        clubName,
        inviteCode,
        creatorId: user.$id,
        weeklyLeaderboard: JSON.stringify({}),
      };

      const permissions = [
        Permission.read(Role.users()),
        Permission.update(Role.user(user.$id)),
        Permission.delete(Role.user(user.$id)),
      ];

      await databases.createDocument(
        DATABASE_ID,
        CLUBS_TABLE,
        ID.unique(),
        newClubData,
        permissions,
      );

      Toast.show({
        type: "success",
        text1: "Club Created!",
        text2: `${clubName} is ready.`,
      });

      router.back();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Failed to Create Club",
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="safe-area-container">
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="p-4">
          <Text className="text-3xl font-bold mb-6">Start a New Club</Text>

          <Text className="text-lg font-semibold mb-2">Club Name</Text>
          <TextInput
            value={clubName}
            onChangeText={setClubName}
            placeholder="e.g., The Fantasy Readers"
            className="bg-white p-3 rounded-lg border border-gray-300 mb-6 text-base"
          />

          <TouchableOpacity
            onPress={handleSubmit}
            className="bg-blue-500 py-3 rounded-lg shadow-md"
          >
            <Text className="text-white font-bold text-center text-lg">
              Create Club
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
