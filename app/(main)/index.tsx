import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useAuthStore } from "@/store/authStore";
import client, { DATABASE_ID, databases, USERBOOK_TABLE } from "@/lib/appwrite";
import { AppwriteException, Query } from "react-native-appwrite";
import { router } from "expo-router";
import BookCard from "@/components/BookCard";
import { IUserBook } from "@/types";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUiStore } from "@/store/uiStore";
import Toast from "react-native-toast-message";
import { StatusBar } from "expo-status-bar";

export default function BookshelfScreen() {
	const user = useAuthStore((s) => s.user);
	const setLoading = useUiStore((s) => s.setLoading);
	const [books, setBooks] = useState<IUserBook[]>([]);

	const fetchBooks = useCallback(async () => {
		if (!user) return;

		try {
			setLoading(true);
			const response = await databases.listDocuments(
				DATABASE_ID,
				USERBOOK_TABLE,
				[Query.equal("userId", user.$id)],
			);

			setBooks(response.documents as unknown as IUserBook[]);
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
		const channel = `databases.${DATABASE_ID}.collections.${USERBOOK_TABLE}.documents`;

		const unsubscribe = client.subscribe(channel, (response) => {
			fetchBooks();
		});

		return () => {
			unsubscribe();
		};
	}, [fetchBooks]);

	const handleAddNewBook = () => {
		router.push("/(main)/addBook");
	};

	return (
		<SafeAreaView className="safe-area-container">
			<StatusBar style="dark" />
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
