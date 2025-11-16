import React, { useState } from "react";
import { Text, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { useAuthStore } from "@/store/authStore";
import { DATABASE_ID, tablesDB, USERBOOK_TABLE } from "@/lib/appwrite";
import { AppwriteException, ID } from "react-native-appwrite";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import StyledButton from "@/components/StyledButton";

export default function AddBookScreen() {
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [totalPages, setTotalPages] = useState("");

  const handleSubmit = async () => {
    if (!title || !totalPages || !user) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please fill all the fields",
      });
      return;
    }

    const pages = parseInt(totalPages, 10);
    if (isNaN(pages) || pages <= 0) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter a valid number of pages.",
      });
      return;
    }

    setLoading(true);
    const userId = user.$id;

    try {
      const newBookData = {
        userId: userId,
        title: title,
        totalPages: pages,
        currentPage: 0,
        status: "reading",
      };

      await tablesDB.createRow({
        databaseId: DATABASE_ID,
        tableId: USERBOOK_TABLE,
        rowId: ID.unique(),
        data: newBookData,
      });

      Toast.show({
        type: "success",
        text1: "Book Added!",
        text2: `${title} has been added to your bookshelf.`,
      });

      router.back();
    } catch (error: any) {
      const e = error as AppwriteException;
      Toast.show({
        type: "error",
        text1: "Failed to Add Book",
        text2: e.message || "An unknown error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="safe-area-container">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <Text className="input-label">Book Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="e.g., Dune"
          className="input"
        />

        <Text className="input-label">Total Pages</Text>
        <TextInput
          value={totalPages}
          onChangeText={setTotalPages}
          placeholder="e.g., 412"
          keyboardType="numeric"
          className="input"
        />

        <StyledButton
          title="Add Book"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
