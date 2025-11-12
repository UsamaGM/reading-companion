import { Tabs } from "expo-router";

export default function MainAppLayout() {
  return (
    <Tabs backBehavior="history">
      <Tabs.Screen
        name="index"
        options={{
          title: "Bookshelf",
        }}
      />
      <Tabs.Screen name="clubs" options={{ title: "Clubs" }} />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
        }}
      />
      <Tabs.Screen name="addBook" options={{ href: null, title: "Add Book" }} />
      <Tabs.Screen
        name="bookDetails"
        options={{ href: null, title: "Book Details" }}
      />
      <Tabs.Screen
        name="joinClub"
        options={{ href: null, title: "Join Club" }}
      />
      <Tabs.Screen
        name="createClub"
        options={{ href: null, title: "Create Club" }}
      />
    </Tabs>
  );
}
