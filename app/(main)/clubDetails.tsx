import React, { useState, useCallback } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { tablesDB } from "@/lib/appwrite";
import { Query, AppwriteException } from "react-native-appwrite";
import {
  CLUBMEMBER_TABLE,
  CLUBS_TABLE,
  DATABASE_ID,
  USERS_TABLE,
} from "@/lib/appwrite";
import { IClubMembers, IUser, LeaderboardEntry } from "@/types";
import { SafeAreaView } from "react-native-safe-area-context";
import LeaderboardCard from "@/components/LeaderboardCard";
import Toast from "react-native-toast-message";

export default function ClubDetailScreen() {
  const [loading, setLoading] = useState(true);
  const { clubId } = useLocalSearchParams<{ clubId: string }>();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [clubName, setClubName] = useState("");

  const fetchLeaderboard = useCallback(async () => {
    if (!clubId) return;

    try {
      const clubPromise = tablesDB.getRow({
        databaseId: DATABASE_ID,
        tableId: CLUBS_TABLE,
        rowId: clubId,
      });

      const membersPromise = tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: CLUBMEMBER_TABLE,
        queries: [Query.equal("clubId", clubId)],
      });

      const [clubDoc, membersRes] = await Promise.all([
        clubPromise,
        membersPromise,
      ]);

      setClubName(clubDoc.clubName);
      const members = membersRes.rows as unknown as IClubMembers[];

      if (members.length === 0) {
        setLeaderboard([]);
        setLoading(false);
        return;
      }

      const userIds = members.map((m) => m.userId);

      const usersRes = await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: USERS_TABLE,
        queries: [Query.equal("$id", userIds)],
      });
      const users = usersRes.rows as unknown as IUser[];

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

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <SafeAreaView className="safe-area-container">
      <FlatList
        data={leaderboard}
        keyExtractor={(item) => item.userId}
        renderItem={({ item, index }) => (
          <LeaderboardCard item={item} rank={index + 1} />
        )}
        ListHeaderComponent={
          <View className="mb-8">
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
