import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";

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
        name="(club)/clubs"
        options={{
          title: "Clubs",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="users" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="(pet)/petStore"
        options={{
          title: "Store",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="shopping-cart" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="(profile)/index"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="user" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="(book)/addBook"
        options={{ href: null, title: "Add Book" }}
      />
      <Tabs.Screen
        name="(book)/bookDetails"
        options={{ href: null, title: "Book Details" }}
      />
      <Tabs.Screen
        name="(club)/createClub"
        options={{ href: null, title: "Create Club" }}
      />
      <Tabs.Screen
        name="(club)/joinClub"
        options={{ href: null, title: "Join Club" }}
      />
      <Tabs.Screen
        name="(club)/clubDetails"
        options={{ href: null, title: "Club Details" }}
      />
      <Tabs.Screen
        name="(pet)/petOnboarding"
        options={{ href: null, title: "Adopt Pet" }}
      />
    </Tabs>
  );
}
