import { View } from "react-native";

export default function HappinessBar({ value }: { value: number }) {
  const width = Math.max(0, Math.min(100, value));

  return (
    <View className="w-full bg-gray-300 rounded-full h-4">
      <View
        style={{ width: `${width}%` }}
        className="bg-green-500 h-4 rounded-full"
      />
    </View>
  );
}
