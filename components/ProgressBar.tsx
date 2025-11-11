import { Text, View } from "react-native";

export default function ProgressBar({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <View className="w-full bg-gray-200 rounded-full h-4 my-4">
      <View
        style={{ width: `${percentage}%` }}
        className="bg-blue-500 h-4 rounded-full"
      />
      <Text className="text-center text-xs font-bold -mt-4 text-white">
        {Math.floor(percentage)}%
      </Text>
    </View>
  );
}
