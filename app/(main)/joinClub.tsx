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
import {
  CLUBMEMBER_TABLE,
  CLUBS_TABLE,
  DATABASE_ID,
  databases,
} from "@/lib/appwrite";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { IClub, IClubMembers, IUser } from "@/types";
import { ID, Query } from "react-native-appwrite";
import AuthButton from "@/components/AuthButton";

export default function JoinClubScreen() {
  const user = useAuthStore((s) => s.user);
  const setLoading = useUiStore((s) => s.setLoading);
  const [inviteCode, setInviteCode] = useState("");

  const handleSubmit = async () => {
    if (!inviteCode || !user) {
      Toast.show({ type: "error", text1: "Invite code is required." });
      return;
    }

    try {
      setLoading(true);

      const [clubs, memberEntries] = await Promise.all([
        databases.listDocuments(DATABASE_ID, CLUBS_TABLE, [
          Query.equal("inviteCode", inviteCode.trim()),
        ]),
        databases.listDocuments(DATABASE_ID, CLUBMEMBER_TABLE, [
          Query.equal("userId", user.$id),
        ]),
      ]);

      const club = clubs.documents[0] as unknown as IClub;
      const clubsWhereMember =
        memberEntries.documents as unknown as IClubMembers[];

      if (clubsWhereMember.some((c) => c.clubId == club.$id)) {
        Toast.show({
          type: "info",
          text1: "Already a Member",
          text2: `You are already a member of ${club.clubName}.`,
        });
        router.back();
        return;
      }

      await databases.createDocument(
        DATABASE_ID,
        CLUBMEMBER_TABLE,
        ID.unique(),
        {
          userId: user.$id,
          clubId: club.$id,
        },
      );

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

          <AuthButton title="Join Club" onPress={handleSubmit} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
