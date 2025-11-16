import React, { useState, useEffect, useCallback } from "react";
import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { DATABASE_ID, tablesDB, USERBOOK_TABLE } from "@/lib/appwrite";
import type { IUserBook } from "@/types";
import LogSessionModal from "@/components/LogSessionModal";
import { SafeAreaView } from "react-native-safe-area-context";
import ProgressBar from "@/components/ProgressBar";
import { AppwriteException } from "react-native-appwrite";
import Toast from "react-native-toast-message";
import StyledButton from "@/components/StyledButton";

export default function BookDetailScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();

  const [loading, setLoading] = useState(true);
  const [book, setBook] = useState<IUserBook | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchBook = useCallback(async () => {
    if (!bookId) return;
    try {
      setLoading(true);
      const document = (await tablesDB.getRow({
        databaseId: DATABASE_ID,
        tableId: USERBOOK_TABLE,
        rowId: bookId,
      })) as unknown as IUserBook;

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
    <SafeAreaView className="safe-area-container">
      <Text className="text-3xl font-bold">{book.title}</Text>
      <Text className="text-lg text-gray-600 mt-2">
        Page {book.currentPage} of {book.totalPages}
      </Text>

      <ProgressBar current={book.currentPage} total={book.totalPages} />

      <StyledButton
        loading={loading}
        disabled={loading}
        title="Log Reading Session"
        onPress={() => setModalVisible(true)}
      />

      <LogSessionModal
        visible={modalVisible}
        book={book}
        onClose={handleModalClose}
      />
    </SafeAreaView>
  );
}
