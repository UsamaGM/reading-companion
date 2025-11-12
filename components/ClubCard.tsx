import { IClub } from "@/types";
import { Text, View } from "react-native";

export default function ClubCard({ item }: { item: IClub }) {
  return (
    <View className="bg-white p-4 mb-4 rounded-lg shadow-md">
      <Text className="text-lg font-bold">{item.clubName}</Text>
      <Text className="text-sm text-gray-500 mt-1">
        Invite Code: {item.inviteCode}
      </Text>
    </View>
  );
}
