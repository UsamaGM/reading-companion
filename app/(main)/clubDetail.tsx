import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { databases } from "@/lib/appwrite";
import { Query, Models, AppwriteException } from "react-native-appwrite";
import {
  CLUBMEMBER_TABLE,
  CLUBS_TABLE,
  DATABASE_ID,
  USERS_TABLE,
} from "@/lib/appwrite";
import { IUser, LeaderboardEntry } from "@/types";
import { SafeAreaView } from "react-native-safe-area-context";
import LeaderboardCard from "@/components/LeaderboardCard";
import Toast from "react-native-toast-message";
import { useUiStore } from "@/store/uiStore";

interface IClubMember extends Models.Document {
  userId: string;
  clubId: string;
  weeklyPages: number;
}

export default function ClubDetailScreen() {
  const setLoading = useUiStore((s) => s.setLoading);
  const { clubId } = useLocalSearchParams<{ clubId: string }>();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [clubName, setClubName] = useState("");

  const fetchLeaderboard = useCallback(async () => {
    if (!clubId) return;

    try {
      setLoading(true);

      const clubPromise = databases.getDocument(
        DATABASE_ID,
        CLUBS_TABLE,
        clubId,
      );

      const membersPromise = databases.listDocuments(
        DATABASE_ID,
        CLUBMEMBER_TABLE,
        [Query.equal("clubId", clubId)],
      );

      const [clubDoc, membersRes] = await Promise.all([
        clubPromise,
        membersPromise,
      ]);

      setClubName(clubDoc.clubName);
      const members = membersRes.documents as unknown as IClubMember[];

      if (members.length === 0) {
        setLeaderboard([]);
        setLoading(false);
        return;
      }

      const userIds = members.map((m) => m.userId);

      const usersRes = await databases.listDocuments(DATABASE_ID, USERS_TABLE, [
        Query.equal("$id", userIds),
      ]);
      const users = usersRes.documents as unknown as IUser[];

      const userMap = new Map<string, string>();
      users.forEach((u) => userMap.set(u.$id, u.username));

      const combinedData: LeaderboardEntry[] = members.map((member) => ({
        userId: member.userId,
        weeklyPages: member.weeklyPages,
        username: userMap.get(member.userId) || "Unknown User",
      }));

      combinedData.sort((a, b) => b.weeklyPages - a.weeklyPages);

      setLeaderboard(combinedData);
    } catch (error) {
      const e = error as AppwriteException;
      Toast.show({
        type: "error",
        text1: "Failed to fetch leaderboard",
        text2: e.message,
      });
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useFocusEffect(
    useCallback(() => {
      fetchLeaderboard();
    }, [fetchLeaderboard]),
  );

  return (
    <SafeAreaView className="safe-area-container">
      <FlatList
        data={leaderboard}
        keyExtractor={(item) => item.userId}
        renderItem={({ item, index }) => (
          <LeaderboardCard item={item} rank={index + 1} />
        )}
        ListHeaderComponent={
          <View className="p-4">
            <Text className="text-3xl font-bold mb-1">{clubName}</Text>
            <Text className="text-xl font-semibold text-gray-700">
              Weekly Leaderboard
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View className="mt-10 items-center">
            <Text className="text-lg text-gray-500">
              No members have logged pages yet.
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}
