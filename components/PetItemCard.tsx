import { functions } from "@/lib/appwrite";
import { useUiStore } from "@/store/uiStore";
import { IPetItem } from "@/types";
import { Image, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

export default function PetItemCard({
  item,
  userTreats,
}: {
  item: IPetItem;
  userTreats: number;
}) {
  const { setLoading } = useUiStore();
  const canAfford = userTreats >= item.price;

  const handleBuy = async () => {
    setLoading(true);
    try {
      const response = await functions.createExecution({
        functionId: "purchasePetItem",
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
        resizeMode="cover"
      />
      <View className="p-3">
        <Text className="text-base font-semibold">{item.name}</Text>
        <Text className="text-lg font-bold text-yellow-600 my-1">
          {item.price} Treats
        </Text>

        <TouchableOpacity
          onPress={handleBuy}
          disabled={!canAfford}
          className={`py-2 px-3 rounded-md mt-2 ${
            canAfford ? "bg-blue-500" : "bg-gray-300"
          }`}
        >
          <Text className="text-white font-bold text-center">
            {canAfford ? "Buy" : "Not Enough"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
