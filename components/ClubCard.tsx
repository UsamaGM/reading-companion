import { IClub } from "@/types";
import { router } from "expo-router";
import { Text, TouchableOpacity } from "react-native";

export default function ClubCard({ item }: { item: IClub }) {
  const handlePress = () => {
    router.push({
      pathname: "/(main)/clubDetail",
      params: { clubId: item.$id },
    });
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="bg-white p-4 mb-4 rounded-lg shadow-md active:bg-gray-100"
    >
      <Text className="text-lg font-bold">{item.clubName}</Text>
      <Text className="text-sm text-gray-500 mt-1">
        Invite Code: {item.inviteCode}
      </Text>
    </TouchableOpacity>
  );
}
