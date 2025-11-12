import { Href, Link } from "expo-router";
import { Text, TouchableOpacity } from "react-native";

export default function StyledLink({
  href,
  title,
}: {
  href: Href;
  title: string;
}) {
  return (
    <Link href={href} asChild>
      <TouchableOpacity>
        <Text className="text-lg text-blue-500 font-bold">{title}</Text>
      </TouchableOpacity>
    </Link>
  );
}
