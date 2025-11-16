import { Text, TouchableOpacity } from "react-native";

export default function AuthButton({
  onPress,
  title,
}: {
  onPress: () => void;
  title: string;
}) {
  return (
    <TouchableOpacity className="auth-btn-container" onPress={onPress}>
      <Text className="auth-btn-text">{title}</Text>
    </TouchableOpacity>
  );
}
