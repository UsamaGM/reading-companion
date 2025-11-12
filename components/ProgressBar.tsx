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
    <View className="relative w-full bg-gray-200 rounded-lg h-8 my-4">
      <View
        style={{ width: `${percentage}%` }}
        className="bg-blue-500 h-8 rounded-lg"
      />
      <Text className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 text-center font-bold text-gray-800">
        {Math.floor(percentage)}%
      </Text>
    </View>
  );
}
