import { Tabs } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function MainAppLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "Bookshelf",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="book" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="clubs"
        options={{
          title: "Clubs",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="users" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="petStore"
        options={{
          title: "Store",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="shopping-cart" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="user" color={color} />
          ),
        }}
      />

      <Tabs.Screen name="addBook" options={{ href: null, title: "Add Book" }} />
      <Tabs.Screen
        name="bookDetails"
        options={{ href: null, title: "Book Details" }}
      />
      <Tabs.Screen
        name="createClub"
        options={{ href: null, title: "Create Club" }}
      />
      <Tabs.Screen
        name="joinClub"
        options={{ href: null, title: "Join Club" }}
      />
      <Tabs.Screen
        name="clubDetails"
        options={{ href: null, title: "Club Details" }}
      />
      <Tabs.Screen
        name="petOnboarding"
        options={{ href: null, title: "Adopt Pet" }}
      />
    </Tabs>
  );
}
