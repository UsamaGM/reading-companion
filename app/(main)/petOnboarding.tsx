import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import {
  DATABASE_ID,
  databases,
  PETTYPE_TABLE,
  USERPET_TABLE,
  USERS_TABLE,
} from "@/lib/appwrite";
import { AppwriteException, ID, Permission, Role } from "react-native-appwrite";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { IPetType } from "@/types";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import AuthButton from "@/components/AuthButton";

export default function PetOnboardingScreen() {
  const user = useAuthStore((s) => s.user);
  const setLoading = useUiStore((s) => s.setLoading);
  const [petTypes, setPetTypes] = useState<IPetType[]>([]);

  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    const fetchPetTypes = async () => {
      try {
        setLoading(true);
        const response = await databases.listDocuments(
          DATABASE_ID,
          PETTYPE_TABLE,
        );
        setPetTypes(response.documents as unknown as IPetType[]);
      } catch (error) {
        const e = error as AppwriteException;
        Toast.show({
          type: "error",
          text1: "Could not load pet types.",
          text2: e.message,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchPetTypes();
  }, []);

  const handleAdopt = async () => {
    if (!selectedPetId || !nickname || !user) {
      Toast.show({
        type: "error",
        text1: "Please choose a pet and give it a name.",
      });
      return;
    }

    setLoading(true);
    try {
      const petPromise = databases.createDocument(
        DATABASE_ID,
        USERPET_TABLE,
        ID.unique(),
        {
          userId: user.$id,
          petTypeId: selectedPetId,
          nickname: nickname,
          happiness: 80,
          equippedItems: [],
        },
        [
          Permission.read(Role.user(user.$id)),
          Permission.update(Role.user(user.$id)),
        ],
      );

      const userPromise = databases.updateDocument(
        DATABASE_ID,
        USERS_TABLE,
        user.$id,
        {
          hasActivePet: true,
        },
      );

      await Promise.all([petPromise, userPromise]);

      Toast.show({
        type: "success",
        text1: "Welcome!",
        text2: `You've adopted ${nickname}!`,
      });
      router.back();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Adoption Failed",
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="safe-area-container">
      <StatusBar style="dark" />
      <View className="p-4">
        <Text className="text-3xl font-bold mb-4">Choose Your Pet!</Text>

        <View className="flex-row justify-around mb-6">
          {petTypes.map((pet) => (
            <TouchableOpacity
              key={pet.$id}
              onPress={() => setSelectedPetId(pet.$id)}
              className={`p-4 bg-white rounded-lg shadow ${
                selectedPetId === pet.$id ? "border-2 border-blue-500" : ""
              }`}
            >
              <Image
                source={{ uri: pet.baseImageUrl }}
                className="w-32 h-32 rounded"
              />
              <Text className="text-lg font-bold text-center mt-2">
                {pet.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="text-lg font-semibold mb-2">
          Give your pet a name:
        </Text>
        <TextInput
          value={nickname}
          onChangeText={setNickname}
          placeholder="e.g., Fluffy"
          className="bg-white p-3 rounded-lg border border-gray-300 mb-6 text-base"
        />

        <AuthButton title="Adopt Pet" onPress={handleAdopt} />
      </View>
    </SafeAreaView>
  );
}
