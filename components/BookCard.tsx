import { IUserBook } from "@/types";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function BookCard({ item }: { item: IUserBook }) {
  function handlePress() {
    router.push(`/(main)/bookDetails?bookId=${item.$id}`);
  }

  return (
    <TouchableOpacity onPress={handlePress}>
      <View className="bg-white p-4 mb-4 rounded-lg shadow-md">
        <Text className="text-lg font-bold">{item.title}</Text>
        <Text className="text-gray-600">
          Page {item.currentPage} of {item.totalPages}
        </Text>
        <Text className="text-blue-500 capitalize mt-2">{item.status}</Text>
      </View>
    </TouchableOpacity>
  );
}
