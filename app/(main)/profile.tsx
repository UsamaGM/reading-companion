import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	ActivityIndicator,
	TouchableOpacity,
	Alert,
} from "react-native";
import { useAuthStore } from "@/store/authStore";
import appwriteClient, { databases } from "@/lib/appwrite";
import { Models } from "react-native-appwrite";
import { SafeAreaView } from "react-native-safe-area-context";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID_USERS = "users";

interface IUserProfile extends Models.Document {
	username: string;
	email: string;
	totalXP: number;
	level: number;
	currentStreak: number;
	lastReadingDay: string | null;
}

const StatCard = ({
	label,
	value,
}: {
	label: string;
	value: string | number;
}) => (
	<View className="bg-white p-4 rounded-lg shadow-md items-center flex-1">
		<Text className="text-3xl font-bold text-blue-500">{value}</Text>
		<Text className="text-sm font-semibold text-gray-500 uppercase mt-1">
			{label}
		</Text>
	</View>
);

export default function ProfileScreen() {
	const user = useAuthStore((s) => s.user);
	const logOut = useAuthStore((s) => s.logOut);

	const [profile, setProfile] = useState<IUserProfile | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!user) {
			setLoading(false);
			return;
		}

		const userId = user.$id;

		const fetchProfile = async () => {
			try {
				setLoading(true);
				const document = (await databases.getDocument(
					DATABASE_ID,
					COLLECTION_ID_USERS,
					userId,
				)) as unknown as IUserProfile;

				setProfile(document);
			} catch (error) {
				console.error("Failed to fetch profile:", error);
				Alert.alert("Error", "Could not load profile.");
			} finally {
				setLoading(false);
			}
		};

		fetchProfile();

		const userDocumentChannel = `databases.${DATABASE_ID}.tabels.${COLLECTION_ID_USERS}.rows.${userId}`;

		const unsubscribe = appwriteClient.subscribe(
			userDocumentChannel,
			(response) => {
				setProfile(response.payload as IUserProfile);
			},
		);

		return () => {
			unsubscribe();
		};
	}, [user]);

	if (loading) {
		return (
			<View className="flex-1 justify-center items-center">
				<ActivityIndicator size="large" />
			</View>
		);
	}

	if (!profile) {
		return (
			<SafeAreaView className="flex-1 justify-center items-center p-4">
				<Text className="text-lg text-gray-500">Could not load profile.</Text>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-gray-100">
			<View className="p-6">
				<View className="items-center mb-8">
					<View className="w-24 h-24 bg-blue-500 rounded-full justify-center items-center shadow-lg mb-4">
						<Text className="text-white text-5xl font-bold">
							{profile.username.charAt(0).toUpperCase()}
						</Text>
					</View>
					<Text className="text-3xl font-bold">{profile.username}</Text>
					<Text className="text-lg text-gray-500">{profile.email}</Text>
				</View>

				<View className="flex-row justify-between space-x-4 mb-8">
					<StatCard label="Level" value={profile.level} />
					<StatCard label="Streak" value={`${profile.currentStreak} days`} />
				</View>
				<StatCard label="Total XP" value={profile.totalXP} />

				<TouchableOpacity
					onPress={logOut}
					className="bg-red-500 py-3 px-4 rounded-lg shadow-md mt-12"
				>
					<Text className="text-white font-bold text-center text-lg">
						Log Out
					</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}
