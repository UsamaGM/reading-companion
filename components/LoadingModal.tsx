import React from "react";
import { Modal, View, ActivityIndicator } from "react-native";
import { useUiStore } from "@/store/uiStore";

export default function LoadingModal() {
  const isLoading = useUiStore((s) => s.isLoading);

  return (
    <Modal transparent={true} animationType="fade" visible={isLoading}>
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white p-6 rounded-lg shadow-xl">
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </View>
    </Modal>
  );
}
