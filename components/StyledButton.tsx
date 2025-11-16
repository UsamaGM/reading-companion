import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

interface PropTypes {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  title: string;
  secondaryTitle?: string;
}

export default function StyledButton({
  onPress,
  loading = false,
  disabled = false,
  title,
  secondaryTitle,
}: PropTypes) {
  return (
    <TouchableOpacity
      disabled={disabled}
      className="btn-container"
      onPress={onPress}
    >
      {loading ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <Text className="btn-text">
          {disabled ? secondaryTitle || title : title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
