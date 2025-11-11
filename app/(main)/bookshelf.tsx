import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	FlatList,
	TouchableOpacity,
	ActivityIndicator,
} from "react-native";
import { useAuthStore } from "@/store/authStore";
import { databases } from "@/lib/appwrite";
import { Query } from "react-native-appwrite";
import { router } from "expo-router";
import BookCard from "@/components/BookCard";
import { IUserBook } from "@/types";
import { SafeAreaView } from "react-native-safe-area-context";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID_USERBOOKS = "userbook";

export default function BookshelfScreen() {
	const { user } = useAuthStore();
	const [books, setBooks] = useState<IUserBook[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!user) {
			setLoading(false);
			return;
		}

		const fetchBooks = async () => {
			try {
				setLoading(true);
				const response = await databases.listDocuments(
					DATABASE_ID,
					COLLECTION_ID_USERBOOKS,
					[Query.equal("userId", user.$id)],
				);

				setBooks(response.documents as unknown as IUserBook[]);
			} catch (error) {
				console.error("Failed to fetch books:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchBooks();
	}, [user]);

	const handleAddNewBook = () => {
		router.push("/(main)/addBook");
	};

	if (loading) {
		return (
			<View className="flex-1 justify-center items-center">
				<ActivityIndicator size="large" />
			</View>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-gray-100">
			<View className="p-4">
				<View className="flex-row justify-between items-center mb-4">
					<Text className="text-3xl font-bold">My Bookshelf</Text>
					<TouchableOpacity
						onPress={handleAddNewBook}
						className="bg-blue-500 py-2 px-4 rounded-lg"
					>
						<Text className="text-white font-semibold">Add Book</Text>
					</TouchableOpacity>
				</View>

				<FlatList
					data={books}
					keyExtractor={(item) => item.$id}
					renderItem={({ item }) => <BookCard item={item} />}
					ListEmptyComponent={
						<View className="mt-20 items-center">
							<Text className="text-lg text-gray-500">
								Your bookshelf is empty.
							</Text>
							<Text className="text-gray-400">
								Tap 'Add Book' to get started!
							</Text>
						</View>
					}
					contentContainerStyle={{ paddingBottom: 100 }}
				/>
			</View>
		</SafeAreaView>
	);
}
