import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { databases } from "@/lib/appwrite";
import { useAuthStore } from "@/store/authStore";
import { ID, Permission, Role } from "react-native-appwrite";
import type { IUserBook } from "@/types";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID_READINGSESSIONS = "readingsession";

interface Props {
  visible: boolean;
  book: IUserBook;
  onClose: (didLogSession: boolean) => void;
}

export default function LogSessionModal({ visible, book, onClose }: Props) {
  const { user } = useAuthStore();
  const [pagesRead, setPagesRead] = useState("");
  const [timeSpent, setTimeSpent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!pagesRead || !timeSpent || !user) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    const pagesReadNum = parseInt(pagesRead, 10);
    const timeSpentNum = parseInt(timeSpent, 10);
    const userId = user.$id;

    if (isNaN(pagesReadNum) || isNaN(timeSpentNum) || pagesReadNum <= 0) {
      Alert.alert("Error", "Please enter valid numbers.");
      return;
    }

    setLoading(true);

    try {
      await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID_READINGSESSIONS,
        ID.unique(),
        {
          userId: userId,
          bookId: book.$id,
          pagesRead: pagesReadNum,
          timeSpent: timeSpentNum,
        },
        [
          Permission.read(Role.user(userId)),
          Permission.update(Role.user(userId)),
        ],
      );

      setLoading(false);
      setPagesRead("");
      setTimeSpent("");
      onClose(true);
    } catch (error: any) {
      setLoading(false);
      console.error("Failed to log session:", error);
      Alert.alert("Error", error.message || "Could not log session.");
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => onClose(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={() => onClose(false)}>
          <View className="flex-1 justify-end bg-black/50">
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View className="bg-white p-6 rounded-t-2xl shadow-lg">
                <Text className="text-2xl font-bold mb-4">Log Session</Text>

                <Text className="text-base font-semibold mb-2">Pages Read</Text>
                <TextInput
                  value={pagesRead}
                  onChangeText={setPagesRead}
                  placeholder="e.g., 25"
                  keyboardType="numeric"
                  className="bg-gray-100 p-3 rounded-lg border border-gray-300 mb-4 text-base"
                />

                <Text className="text-base font-semibold mb-2">
                  Time Spent (minutes)
                </Text>
                <TextInput
                  value={timeSpent}
                  onChangeText={setTimeSpent}
                  placeholder="e.g., 45"
                  keyboardType="numeric"
                  className="bg-gray-100 p-3 rounded-lg border border-gray-300 mb-6 text-base"
                />

                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={loading}
                  className={`py-3 rounded-lg shadow-md ${
                    loading ? "bg-gray-400" : "bg-blue-500"
                  }`}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white font-bold text-center text-lg">
                      Save Session
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}
