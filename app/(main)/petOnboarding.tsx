import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useAuthStore } from "@/store/authStore";
import {
  DATABASE_ID,
  PETTYPE_TABLE,
  tablesDB,
  USERPET_TABLE,
  USERS_TABLE,
} from "@/lib/appwrite";
import { AppwriteException, ID } from "react-native-appwrite";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { IPetType } from "@/types";
import { SafeAreaView } from "react-native-safe-area-context";
import StyledButton from "@/components/StyledButton";

export default function PetOnboardingScreen() {
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(true);
  const [petAdopting, setPetAdopting] = useState(false);
  const [petTypes, setPetTypes] = useState<IPetType[]>([]);

  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    const fetchPetTypes = async () => {
      try {
        setLoading(true);

        const response = await tablesDB.listRows({
          databaseId: DATABASE_ID,
          tableId: PETTYPE_TABLE,
        });

        setPetTypes(response.rows as unknown as IPetType[]);
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

    try {
      setPetAdopting(true);

      const newPetData = {
        userId: user.$id,
        petTypeId: selectedPetId,
        nickname: nickname,
        happiness: 80,
        equippedItems: [],
      };
      const petPromise = tablesDB.createRow({
        databaseId: DATABASE_ID,
        tableId: USERPET_TABLE,
        rowId: ID.unique(),
        data: newPetData,
      });

      const userPromise = tablesDB.updateRow({
        databaseId: DATABASE_ID,
        tableId: USERS_TABLE,
        rowId: user.$id,
        data: {
          hasActivePet: true,
        },
      });

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
      setPetAdopting(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <SafeAreaView className="safe-area-container">
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

      <Text className="text-lg font-semibold mb-2">Give your pet a name:</Text>
      <TextInput
        value={nickname}
        onChangeText={setNickname}
        placeholder="e.g., Fluffy"
        className="bg-white p-3 rounded-lg border border-gray-300 mb-6 text-base"
      />

      <StyledButton
        title="Adopt Pet"
        onPress={handleAdopt}
        loading={petAdopting}
        disabled={petAdopting}
      />
    </SafeAreaView>
  );
}
