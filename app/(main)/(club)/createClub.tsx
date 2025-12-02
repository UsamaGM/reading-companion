import React, { useState } from "react";
import { Text, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { useAuthStore } from "@/store/authStore";
import { CLUBS_TABLE, DATABASE_ID, tablesDB } from "@/lib/appwrite";
import { ID } from "react-native-appwrite";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import StyledButton from "@/components/StyledButton";

function generateInviteCode(length: number) {
  const chars = "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function CreateClubScreen() {
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(false);
  const [clubName, setClubName] = useState("");

  const handleSubmit = async () => {
    if (!clubName || !user) {
      Toast.show({ type: "error", text1: "Club name is required." });
      return;
    }

    try {
      setLoading(true);
      const inviteCode = generateInviteCode(6);

      const newClubData = {
        clubName,
        inviteCode,
        creatorId: user.$id,
        weeklyLeaderboard: JSON.stringify({}),
      };

      await tablesDB.createRow({
        databaseId: DATABASE_ID,
        tableId: CLUBS_TABLE,
        rowId: ID.unique(),
        data: newClubData,
      });

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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 p-4"
      >
        <Text className="text-3xl font-bold mb-6">Start a New Club</Text>

        <Text className="text-lg font-semibold mb-2">Club Name</Text>
        <TextInput
          value={clubName}
          onChangeText={setClubName}
          placeholder="e.g., The Fantasy Readers"
          className="input"
        />

        <StyledButton
          title="Create Club"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
