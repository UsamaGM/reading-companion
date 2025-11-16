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
import { DATABASE_ID, databases, USERBOOK_TABLE } from "@/lib/appwrite";
import { AppwriteException, ID, Permission, Role } from "react-native-appwrite";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUiStore } from "@/store/uiStore";
import Toast from "react-native-toast-message";
import AuthButton from "@/components/AuthButton";

export default function AddBookScreen() {
  const user = useAuthStore((s) => s.user);
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
        USERBOOK_TABLE,
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
    <SafeAreaView className="safe-area-container">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <StatusBar style="dark" />
        <View className="p-4">
          <Text className="text-3xl font-bold mb-6">Add New Book</Text>

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

          <AuthButton title="Add Book" onPress={handleSubmit} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
