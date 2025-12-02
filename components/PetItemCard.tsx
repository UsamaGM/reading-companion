import { functions, PURCHASE_PETITEM_FN_ID } from "@/lib/appwrite";
import { IPetItem } from "@/types";
import { useState } from "react";
import { Image, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import StyledButton from "./StyledButton";

export default function PetItemCard({
  item,
  userTreats,
}: {
  item: IPetItem;
  userTreats: number;
}) {
  const [loading, setLoading] = useState(false);

  const canAfford = userTreats >= item.price;

  const handleBuy = async () => {
    try {
      setLoading(true);
      const response = await functions.createExecution({
        functionId: PURCHASE_PETITEM_FN_ID,
        body: JSON.stringify({ itemId: item.$id }),
      });

      if (response.responseStatusCode !== 200) {
        throw new Error(JSON.parse(response.responseBody).error);
      }

      Toast.show({
        type: "success",
        text1: "Purchase Complete!",
        text2: `You bought a ${item.name}.`,
      });
    } catch (e: any) {
      const errorMsg = e.message.includes("Not enough treats")
        ? "You don't have enough treats for this item."
        : e.message;

      Toast.show({
        type: "error",
        text1: "Purchase Failed",
        text2: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 m-2 bg-white rounded-lg shadow-md overflow-hidden">
      <Image
        source={{ uri: item.imageUrl }}
        className="w-full h-32"
        resizeMode="contain"
      />
      <View className="p-3">
        <Text className="text-base font-semibold">{item.name}</Text>
        <Text className="text-lg font-bold text-yellow-600 my-1">
          {item.price} Treats
        </Text>

        <StyledButton
          title="Buy"
          secondaryTitle="Not Enough Treats"
          onPress={handleBuy}
          disabled={!canAfford}
          loading={loading}
        />
      </View>
    </View>
  );
}
