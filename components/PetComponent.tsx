import React, { useState, useCallback } from "react";
import { View, Text, Image } from "react-native";
import { useAuthStore } from "../store/authStore";
import {
  DATABASE_ID,
  databases,
  PETTYPE_TABLE,
  USERPET_TABLE,
} from "@/lib/appwrite";
import { AppwriteException, Query } from "react-native-appwrite";
import { useFocusEffect } from "expo-router";
import { IPetType, IUserPet } from "@/types";
import { useUiStore } from "@/store/uiStore";
import Toast from "react-native-toast-message";
import HappinessBar from "./HappinessBar";

export default function PetComponent() {
  const user = useAuthStore((s) => s.user);
  const setLoading = useUiStore((s) => s.setLoading);
  const [userPet, setUserPet] = useState<IUserPet | null>(null);
  const [petType, setPetType] = useState<IPetType | null>(null);

  const fetchPetData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const petRes = await databases.listDocuments(DATABASE_ID, USERPET_TABLE, [
        Query.equal("userId", user.$id),
        Query.limit(1),
      ]);

      if (petRes.documents.length === 0) {
        setLoading(false);
        return;
      }

      const pet = petRes.documents[0] as unknown as IUserPet;
      setUserPet(pet);

      const typeRes = await databases.getDocument(
        DATABASE_ID,
        PETTYPE_TABLE,
        pet.petTypeId,
      );
      setPetType(typeRes as unknown as IPetType);
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

  if (!userPet || !petType) {
    return null;
  }

  return (
    <View className="p-4 bg-white rounded-lg shadow-md items-center">
      <Text className="text-2xl font-bold mb-2">{userPet.nickname}</Text>

      <Image
        source={{ uri: petType.baseImageUrl }}
        className="w-48 h-48 rounded-lg mb-4"
      />

      <View className="w-full">
        <Text className="text-sm font-semibold text-gray-600 mb-1">
          Happiness: {userPet.happiness}%
        </Text>
        <HappinessBar value={userPet.happiness} />
      </View>
    </View>
  );
}
