import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { useAuthStore } from "@/store/authStore";
import client, { DATABASE_ID, tablesDB, USERBOOK_TABLE } from "@/lib/appwrite";
import { AppwriteException, Query } from "react-native-appwrite";
import { router } from "expo-router";
import BookCard from "@/components/BookCard";
import { IUserBook } from "@/types";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import StyledButton from "@/components/StyledButton";

export default function BookshelfScreen() {
	const user = useAuthStore((s) => s.user);
	const [loading, setLoading] = useState(true);
	const [books, setBooks] = useState<IUserBook[]>([]);

	const fetchBooks = useCallback(async () => {
		if (!user) return;

		try {
			const response = await tablesDB.listRows({
				databaseId: DATABASE_ID,
				tableId: USERBOOK_TABLE,
				queries: [Query.equal("userId", user.$id)],
			});

			setBooks(response.rows as unknown as IUserBook[]);
		} catch (error) {
			const e = error as AppwriteException;
			Toast.show({
				type: "error",
				text1: "Failed to Add Book",
				text2: e.message || "An unknown error occurred.",
			});
		} finally {
			setLoading(false);
		}
	}, [user]);

	useEffect(() => {
		fetchBooks();
	}, [fetchBooks]);

	useEffect(() => {
		const channel = `databases.${DATABASE_ID}.tabels.${USERBOOK_TABLE}.rows.*`;

		const unsubscribe = client.subscribe(channel, () => {
			fetchBooks();
		});

		return () => {
			unsubscribe();
		};
	}, [fetchBooks]);

	const handleAddNewBook = () => {
		router.push("/(main)/addBook");
	};

	if (loading) return <ActivityIndicator size="large" />;

	return (
		<SafeAreaView className="safe-area-container">
			<View className="flex-row justify-end mb-4">
				<StyledButton title="Add Book" onPress={handleAddNewBook} />
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
				contentContainerClassName="pb-24"
			/>
		</SafeAreaView>
	);
}
