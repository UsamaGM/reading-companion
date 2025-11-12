import { LeaderboardEntry } from "@/types";
import { Text, View } from "react-native";

export default function LeaderboardCard({
  item,
  rank,
}: {
  item: LeaderboardEntry;
  rank: number;
}) {
  return (
    <View className="flex-row bg-white p-4 mb-2 rounded-lg shadow-sm items-center">
      <Text className="text-lg font-bold w-10">{rank}.</Text>
      <View className="flex-1">
        <Text className="text-base font-semibold">{item.username}</Text>
      </View>
      <Text className="text-lg font-bold text-blue-500">
        {item.weeklyPages} <Text className="text-sm text-gray-500">pgs</Text>
      </Text>
    </View>
  );
}
