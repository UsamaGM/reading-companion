import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { DATABASE_ID, databases, USERBOOK_TABLE } from "@/lib/appwrite";
import type { IUserBook } from "@/types";
import LogSessionModal from "@/components/LogSessionModal";
import { SafeAreaView } from "react-native-safe-area-context";
import ProgressBar from "@/components/ProgressBar";
import { useUiStore } from "@/store/uiStore";
import { AppwriteException } from "react-native-appwrite";
import Toast from "react-native-toast-message";
import { StatusBar } from "expo-status-bar";

export default function BookDetailScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const setLoading = useUiStore((s) => s.setLoading);

  const [book, setBook] = useState<IUserBook | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchBook = useCallback(async () => {
    if (!bookId) return;
    try {
      setLoading(true);
      const document = (await databases.getDocument(
        DATABASE_ID,
        USERBOOK_TABLE,
        bookId,
      )) as unknown as IUserBook;

      setBook(document);
    } catch (error) {
      const e = error as AppwriteException;
      Toast.show({
        type: "error",
        text1: "Error",
        text2: `${e.message} Failed to fetch book details`,
      });
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

  if (!book) return null;

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar style="dark" />
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
