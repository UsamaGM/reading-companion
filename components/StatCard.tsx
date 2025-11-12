import { Text, View } from "react-native";

export default function StatCard({
	label,
	value,
}: {
	label: string;
	value: string | number;
}) {
	return (
		<View className="bg-white p-4 rounded-lg shadow-md items-center flex-1 min-h-24 h-max">
			<Text className="text-3xl font-bold text-blue-500">{value}</Text>
			<Text className="text-sm font-semibold text-gray-500 uppercase mt-1">
				{label}
			</Text>
		</View>
	);
}
