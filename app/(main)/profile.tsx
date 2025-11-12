import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	ActivityIndicator,
	TouchableOpacity,
	Alert,
} from "react-native";
import { useAuthStore } from "@/store/authStore";
import appwriteClient, {
	DATABASE_ID,
	databases,
	USERS_TABLE,
} from "@/lib/appwrite";
import { SafeAreaView } from "react-native-safe-area-context";
import { IUser } from "@/types";
import StatCard from "@/components/StatCard";
import { useUiStore } from "@/store/uiStore";
import { AppwriteException } from "react-native-appwrite";
import Toast from "react-native-toast-message";
import { StatusBar } from "expo-status-bar";

export default function ProfileScreen() {
	const user = useAuthStore((s) => s.user);
	const logOut = useAuthStore((s) => s.logOut);
	const setLoading = useUiStore((s) => s.setLoading);

	const [profile, setProfile] = useState<IUser | null>(null);

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
					USERS_TABLE,
					userId,
				)) as unknown as IUser;

				setProfile(document);
			} catch (error) {
				const e = error as AppwriteException;
				Toast.show({
					type: "error",
					text1: "Failed to fetch profile",
					text2: e.message,
				});
			} finally {
				setLoading(false);
			}
		};

		fetchProfile();

		const userDocumentChannel = `databases.${DATABASE_ID}.tabels.${USERS_TABLE}.rows.${userId}`;

		const unsubscribe = appwriteClient.subscribe(
			userDocumentChannel,
			(response) => {
				setProfile(response.payload as IUser);
			},
		);

		return () => {
			unsubscribe();
		};
	}, [user]);

	if (!profile) {
		return (
			<SafeAreaView className="flex-1 justify-center items-center p-4">
				<Text className="text-lg text-gray-500">Could not load profile.</Text>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="safe-area-container">
			<StatusBar style="dark" />
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

				<View className="flex flex-row justify-between gap-4 mb-8">
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
