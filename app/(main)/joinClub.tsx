import React, { useState } from "react";
import { Text, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { useAuthStore } from "@/store/authStore";
import {
  CLUBMEMBER_TABLE,
  CLUBS_TABLE,
  DATABASE_ID,
  tablesDB,
} from "@/lib/appwrite";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { IClub, IClubMembers } from "@/types";
import { ID, Query } from "react-native-appwrite";
import StyledButton from "@/components/StyledButton";

export default function JoinClubScreen() {
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState("");

  const handleSubmit = async () => {
    if (!inviteCode || !user) {
      Toast.show({ type: "error", text1: "Invite code is required." });
      return;
    }

    try {
      setLoading(true);

      const clubPromise = tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: CLUBS_TABLE,
        queries: [Query.equal("inviteCode", inviteCode.trim())],
      });
      const memberPromise = tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: CLUBMEMBER_TABLE,
        queries: [Query.equal("userId", user.$id)],
      });

      const [clubs, memberEntries] = await Promise.all([
        clubPromise,
        memberPromise,
      ]);

      const club = clubs.rows[0] as unknown as IClub;
      const clubsWhereMember = memberEntries.rows as unknown as IClubMembers[];

      if (clubsWhereMember.some((c) => c.clubId == club.$id)) {
        Toast.show({
          type: "info",
          text1: "Already a Member",
          text2: `You are already a member of ${club.clubName}.`,
        });
        router.back();
        return;
      }

      const newClubData = {
        userId: user.$id,
        clubId: club.$id,
      };

      await tablesDB.createRow({
        databaseId: DATABASE_ID,
        tableId: CLUBMEMBER_TABLE,
        rowId: ID.unique(),
        data: newClubData,
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
        className="flex-1 p-4"
      >
        <Text className="text-3xl font-bold mb-6">Join a Club</Text>

        <Text className="text-lg font-semibold mb-2">Invite Code</Text>
        <TextInput
          value={inviteCode}
          onChangeText={setInviteCode}
          placeholder="Enter the club ID"
          autoCapitalize="none"
          className="bg-white p-3 rounded-lg border border-gray-300 mb-6 text-base"
        />

        <StyledButton
          title="Join Club"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
