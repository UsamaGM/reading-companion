import { useState, useCallback } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { useAuthStore } from "@/store/authStore";
import {
  CLUBMEMBER_TABLE,
  CLUBS_TABLE,
  DATABASE_ID,
  tablesDB,
} from "@/lib/appwrite";
import { AppwriteException, Query } from "react-native-appwrite";
import { router, useFocusEffect } from "expo-router";
import { IClub } from "@/types";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import ClubCard from "@/components/ClubCard";
import StyledButton from "@/components/StyledButton";

export default function ClubsScreen() {
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(true);
  const [clubs, setClubs] = useState<IClub[]>([]);

  const fetchClubs = useCallback(async () => {
    if (!user) return;

    try {
      const memberEntries = await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: CLUBMEMBER_TABLE,
        queries: [Query.equal("userId", user.$id)],
      });

      if (!memberEntries.total) {
        setClubs([]);
        return;
      }

      const clubIds = memberEntries.rows.map((doc) => doc.clubId);

      const clubData = await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: CLUBS_TABLE,
        queries: [Query.equal("$id", clubIds)],
      });

      setClubs(clubData.rows as unknown as IClub[]);
    } catch (error) {
      const e = error as AppwriteException;
      Toast.show({
        type: "error",
        text1: "Failed to fetch Clubs",
        text2: e.message,
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchClubs();
    }, [fetchClubs]),
  );

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <SafeAreaView className="safe-area-container">
      <View className="flex-row mb-4 gap-4">
        <StyledButton
          title="Create Club"
          onPress={() => router.push("/(main)/createClub")}
        />
        <StyledButton
          title="Join Club"
          onPress={() => router.push("/(main)/joinClub")}
        />
      </View>

      <Text className="text-xl font-bold mb-4">My Clubs</Text>
      <FlatList
        data={clubs}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => <ClubCard item={item} />}
        ListEmptyComponent={
          <View className="mt-10 items-center">
            <Text className="text-lg text-gray-500">
              You haven't joined any clubs.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
