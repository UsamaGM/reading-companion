import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { DATABASE_ID, READINGSESSION_TABLE, tablesDB } from "@/lib/appwrite";
import { useAuthStore } from "@/store/authStore";
import { AppwriteException, ID } from "react-native-appwrite";
import type { IUserBook } from "@/types";
import Toast from "react-native-toast-message";
import StyledButton from "./StyledButton";

interface Props {
  visible: boolean;
  book: IUserBook;
  onClose: (didLogSession: boolean) => void;
}

export default function LogSessionModal({ visible, book, onClose }: Props) {
  const user = useAuthStore((s) => s.user);

  const [loading, setLoading] = useState(false);
  const [pagesRead, setPagesRead] = useState("");
  const [timeSpent, setTimeSpent] = useState("");

  const handleSubmit = async () => {
    if (!pagesRead || !timeSpent || !user) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please fill in all fields",
      });
      return;
    }

    const pagesReadNum = parseInt(pagesRead, 10);
    const timeSpentNum = parseInt(timeSpent, 10);
    const userId = user.$id;

    if (isNaN(pagesReadNum) || isNaN(timeSpentNum) || pagesReadNum <= 0) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter valid numbers",
      });
      return;
    }

    try {
      setLoading(true);

      const newSessionData = {
        userId: userId,
        bookId: book.$id,
        pagesRead: pagesReadNum,
        timeSpent: timeSpentNum,
      };
      await tablesDB.createRow({
        databaseId: DATABASE_ID,
        tableId: READINGSESSION_TABLE,
        rowId: ID.unique(),
        data: newSessionData,
      });

      setPagesRead("");
      setTimeSpent("");
      onClose(true);
    } catch (error: any) {
      const e = error as AppwriteException;
      Toast.show({
        type: "error",
        text1: "Error",
        text2: `${e.message} Failed to Log Session`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => onClose(false)}
    >
      <TouchableWithoutFeedback onPress={() => onClose(false)}>
        <View className="flex-1 justify-center bg-black/50 p-4">
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="bg-white p-6 rounded-2xl gap-4 pb-20">
              <Text className="text-2xl font-bold">Log Session</Text>

              <InputWithLabel
                label="Pages Read"
                value={pagesRead}
                onChangeText={setPagesRead}
                placeholder="e.g., 25"
              />
              <InputWithLabel
                label="Time Spent (minutes)"
                value={timeSpent}
                onChangeText={setTimeSpent}
                placeholder="e.g., 45"
              />

              <StyledButton
                title="Save Session"
                onPress={handleSubmit}
                loading={loading}
                disabled={loading}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

interface PropTypes {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
}

function InputWithLabel({
  label,
  value,
  onChangeText,
  placeholder,
}: PropTypes) {
  return (
    <View className="flex gap-2">
      <Text className="text-base font-semibold mb-2">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType="numeric"
        className="bg-gray-100 p-3 rounded-lg border border-gray-300 mb-4 text-base"
      />
    </View>
  );
}
