import { useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useAuthStore } from "@/store/authStore";
import { CLUBMEMBER_TABLE, DATABASE_ID, databases } from "@/lib/appwrite";
import { AppwriteException, Query } from "react-native-appwrite";
import { router, useFocusEffect } from "expo-router";
import { IClub } from "@/types";
import { useUiStore } from "@/store/uiStore";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import ClubCard from "@/components/ClubCard";
import { StatusBar } from "expo-status-bar";

export default function ClubsScreen() {
  const user = useAuthStore((s) => s.user);
  const setLoading = useUiStore((s) => s.setLoading);
  const [clubs, setClubs] = useState<IClub[]>([]);

  const fetchClubs = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);

      const memberEntries = await databases.listDocuments(
        DATABASE_ID,
        CLUBMEMBER_TABLE,
        [Query.equal("userId", user.$id)],
      );

      if (!memberEntries.documents) {
        setClubs([]);
        return;
      }

      const clubIds = memberEntries.documents.map((doc) => doc.clubId);

      const clubData = await databases.listDocuments(DATABASE_ID, "Clubs", [
        Query.equal("$id", clubIds),
      ]);

      setClubs(clubData.documents as unknown as IClub[]);
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

  return (
    <SafeAreaView className="safe-area-continer">
      <StatusBar style="dark" />
      <View className="p-4">
        <Text className="text-3xl font-bold mb-4">Reading Clubs</Text>

        <View className="flex flex-row gap-4 mb-6">
          <TouchableOpacity
            onPress={() => router.push("/(main)/createClub")}
            className="flex-1 bg-blue-500 py-3 rounded-lg shadow-md"
          >
            <Text className="text-white font-semibold text-center">
              Create Club
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/(main)/joinClub")}
            className="flex-1 bg-green-500 py-3 rounded-lg shadow-md"
          >
            <Text className="text-white font-semibold text-center">
              Join Club
            </Text>
          </TouchableOpacity>
        </View>

        <Text className="text-xl font-bold mb-2">My Clubs</Text>
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
      </View>
    </SafeAreaView>
  );
}
