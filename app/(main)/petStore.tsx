import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList } from "react-native";
import { useAuthStore } from "@/store/authStore";
import appwriteClient, {
  DATABASE_ID,
  databases,
  PETITEM_TABLE,
  USERS_TABLE,
} from "@/lib/appwrite";
import { IUser, IPetItem } from "@/types";
import { useFocusEffect } from "expo-router";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import PetItemCard from "@/components/PetItemCard";
import { useUiStore } from "@/store/uiStore";

export default function PetStoreScreen() {
  const user = useAuthStore((s) => s.user);
  const setLoading = useUiStore((s) => s.setLoading);
  const [profile, setProfile] = useState<IUser | null>(null);
  const [items, setItems] = useState<IPetItem[]>([]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const userProfilePromise = databases.getDocument(
        DATABASE_ID,
        USERS_TABLE,
        user.$id,
      );
      const storeItemsPromise = databases.listDocuments(
        DATABASE_ID,
        PETITEM_TABLE,
      );

      const [userProfile, storeItems] = await Promise.all([
        userProfilePromise,
        storeItemsPromise,
      ]);

      setProfile(userProfile as unknown as IUser);
      setItems(storeItems.documents as unknown as IPetItem[]);
    } catch (error) {
      console.error("Failed to fetch store data:", error);
      Toast.show({ type: "error", text1: "Could not load store." });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchData();
    }, [fetchData]),
  );

  useEffect(() => {
    if (!user) return;

    const channel = `databases.${DATABASE_ID}.tabels.${USERS_TABLE}.rows.${user.$id}`;
    const unsubscribe = appwriteClient.subscribe(channel, (response) => {
      setProfile(response.payload as IUser);
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  const userTreats = profile?.treats ?? 0;

  return (
    <SafeAreaView className="safe-area-container">
      <FlatList
        data={items}
        renderItem={({ item }) => (
          <PetItemCard item={item} userTreats={userTreats} />
        )}
        keyExtractor={(item) => item.$id}
        numColumns={2}
        ListHeaderComponent={
          <View className="p-4">
            <Text className="text-3xl font-bold">Pet Store</Text>
            <View className="p-3 bg-yellow-200 border border-yellow-300 rounded-lg mt-4">
              <Text className="text-xl font-bold text-yellow-700">
                Your Treats: {userTreats}
              </Text>
            </View>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}
