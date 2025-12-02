import PetItemCard from "@/components/PetItemCard";
import appwriteClient, {
  DATABASE_ID,
  PETITEM_TABLE,
  tablesDB,
  USERS_TABLE,
} from "@/lib/appwrite";
import { useAuthStore } from "@/store/authStore";
import { IPetItem, IUser } from "@/types";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function PetStoreScreen() {
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<IUser | null>(null);
  const [items, setItems] = useState<IPetItem[]>([]);

  const fetchData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      const userProfilePromise = tablesDB.getRow({
        databaseId: DATABASE_ID,
        tableId: USERS_TABLE,
        rowId: user.$id,
      });
      const storeItemsPromise = tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: PETITEM_TABLE,
      });

      const [userProfile, storeItems] = await Promise.all([
        userProfilePromise,
        storeItemsPromise,
      ]);

      setProfile(userProfile as unknown as IUser);
      setItems(storeItems.rows as unknown as IPetItem[]);
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
    }, [fetchData])
  );

  useEffect(() => {
    if (!user) return;

    const channel = `databases.${DATABASE_ID}.tables.${USERS_TABLE}.rows.${user.$id}`;
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
          <View className="flex-row items-center justify-between">
            <Text className="text-3xl font-bold">Pet Store</Text>
            <View className="">
              <Text className="text-2xl font-bold text-yellow-700">
                <Text className="text-gray-900">Treats: </Text>
                {userTreats}
              </Text>
            </View>
          </View>
        }
        contentContainerClassName="pb-5"
      />
    </SafeAreaView>
  );
}
