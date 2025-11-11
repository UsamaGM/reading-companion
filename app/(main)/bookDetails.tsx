import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { databases } from "@/lib/appwrite";
import type { IUserBook } from "@/types";
import LogSessionModal from "@/components/logScreenModal";
import { SafeAreaView } from "react-native-safe-area-context";
import ProgressBar from "@/components/ProgressBar";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID_USERBOOKS = "userbook";

export default function BookDetailScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  console.log(bookId);
  const [book, setBook] = useState<IUserBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchBook = useCallback(async () => {
    if (!bookId) return;
    try {
      setLoading(true);
      const document = (await databases.getDocument(
        DATABASE_ID,
        COLLECTION_ID_USERBOOKS,
        bookId,
      )) as unknown as IUserBook;

      setBook(document);
    } catch (error) {
      console.error("Failed to fetch book details:", error);
      Alert.alert("Error", "Could not load book details.");
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    fetchBook();
  }, [fetchBook]);

  const handleModalClose = (didLogSession: boolean) => {
    setModalVisible(false);
    if (didLogSession) {
      fetchBook();
    }
  };

  if (loading || !book) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="p-4">
        <Text className="text-3xl font-bold">{book.title}</Text>
        <Text className="text-lg text-gray-600 mt-2">
          Page {book.currentPage} of {book.totalPages}
        </Text>

        <ProgressBar current={book.currentPage} total={book.totalPages} />

        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="bg-blue-500 py-3 px-4 rounded-lg shadow-md"
        >
          <Text className="text-white font-bold text-center text-lg">
            Log Reading Session
          </Text>
        </TouchableOpacity>
      </View>

      <LogSessionModal
        visible={modalVisible}
        book={book}
        onClose={handleModalClose}
      />
    </SafeAreaView>
  );
}
