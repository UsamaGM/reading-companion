import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAuthStore } from "@/store/authStore";
import { databases } from "@/lib/appwrite";
import { AppwriteException, ID, Permission, Role } from "react-native-appwrite";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUiStore } from "@/store/uiStore";
import Toast from "react-native-toast-message";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID_USERBOOKS = "userbook";

export default function AddBookScreen() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useUiStore((s) => s.isLoading);
  const setLoading = useUiStore((s) => s.setLoading);

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

      const permissions = [
        Permission.read(Role.user(userId)),
        Permission.update(Role.user(userId)),
        Permission.delete(Role.user(userId)),
      ];

      await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID_USERBOOKS,
        ID.unique(),
        newBookData,
        permissions,
      );

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
    <SafeAreaView className="flex-1 bg-gray-100">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="p-4">
          <Text className="text-3xl font-bold mb-6">Add New Book</Text>

          {/* Book Title Input */}
          <Text className="text-lg font-semibold mb-2">Book Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g., Dune"
            className="bg-white p-3 rounded-lg border border-gray-300 mb-4 text-base"
          />

          {/* Total Pages Input */}
          <Text className="text-lg font-semibold mb-2">Total Pages</Text>
          <TextInput
            value={totalPages}
            onChangeText={setTotalPages}
            placeholder="e.g., 412"
            keyboardType="numeric"
            className="bg-white p-3 rounded-lg border border-gray-300 mb-6 text-base"
          />

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading}
            className={`py-3 px-4 rounded-lg shadow-md ${
              isLoading ? "bg-gray-400" : "bg-blue-500"
            }`}
          >
            <Text className="text-white font-bold text-center text-lg">
              Add Book
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
