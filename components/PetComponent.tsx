import React, { useState, useCallback } from "react";
import { View, Text, Image, StyleSheet, ActivityIndicator } from "react-native";
import { useAuthStore } from "@/store/authStore";
import {
  DATABASE_ID,
  PETITEM_TABLE,
  PETTYPE_TABLE,
  tablesDB,
  USERPET_TABLE,
} from "@/lib/appwrite";
import { Query } from "react-native-appwrite";
import { router, useFocusEffect } from "expo-router";
import { IPetType, IUserPet, IPetItem } from "@/types";
import { AppwriteException } from "node-appwrite";
import Toast from "react-native-toast-message";
import StyledButton from "./StyledButton";

const HappinessBar = ({ value }: { value: number }) => {
  const width = Math.max(0, Math.min(100, value));
  return (
    <View className="w-full bg-gray-300 rounded-full h-4">
      <View
        style={{ width: `${width}%` }}
        className="bg-green-500 h-4 rounded-full"
      />
    </View>
  );
};

export default function PetComponent() {
  const user = useAuthStore((s) => s.user);

  const [isLoading, setLoading] = useState(true);
  const [userPet, setUserPet] = useState<IUserPet | null>(null);
  const [petType, setPetType] = useState<IPetType | null>(null);
  const [equippedItems, setEquippedItems] = useState<IPetItem[]>([]);

  const fetchPetData = useCallback(async () => {
    if (!user) return;

    try {
      const petRes = await tablesDB.listRows({
        databaseId: DATABASE_ID,
        tableId: USERPET_TABLE,
        queries: [Query.equal("userId", user.$id), Query.limit(1)],
      });

      if (petRes.total === 0) {
        setLoading(false);
        return;
      }

      const pet = petRes.rows[0] as unknown as IUserPet;
      setUserPet(pet);

      const typeRes = await tablesDB.getRow({
        databaseId: DATABASE_ID,
        tableId: PETTYPE_TABLE,
        rowId: pet.petTypeId,
      });
      setPetType(typeRes as unknown as IPetType);

      if (pet.equippedItems && pet.equippedItems.length > 0) {
        const itemsRes = await tablesDB.listRows({
          databaseId: DATABASE_ID,
          tableId: PETITEM_TABLE,
          queries: [Query.equal("$id", pet.equippedItems)],
        });

        setEquippedItems(itemsRes.rows as unknown as IPetItem[]);
      } else {
        setEquippedItems([]);
      }
    } catch (error) {
      const e = error as AppwriteException;
      Toast.show({
        type: "error",
        text1: "Failed to fetch pet data",
        text2: e.message,
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchPetData();
    }, [fetchPetData]),
  );

  if (isLoading) return <ActivityIndicator />;
  else if (!userPet || !petType)
    return (
      <StyledButton
        title="Adopt a Pet"
        onPress={() => router.push("/(main)/petOnboarding")}
      />
    );

  return (
    <View className="p-4 bg-white rounded-lg shadow-md items-center">
      <Text className="text-2xl font-bold mb-2">{userPet.nickname}</Text>

      <View className="w-48 h-48 rounded-lg mb-4" style={styles.petContainer}>
        <Image
          source={{ uri: petType.baseImageUrl }}
          style={styles.imageLayer}
          resizeMode="contain"
        />

        {equippedItems.map((item) => (
          <Image
            key={item.$id}
            source={{ uri: item.imageUrl }}
            style={styles.imageLayer}
            resizeMode="contain"
          />
        ))}
      </View>

      <View className="w-full">
        <Text className="text-sm font-semibold text-gray-600 mb-1">
          Happiness: {userPet.happiness}%
        </Text>
        <HappinessBar value={userPet.happiness} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  petContainer: {
    position: "relative",
    width: 192,
    height: 192,
  },
  imageLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
});
