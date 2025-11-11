import { Tabs } from "expo-router";

export default function MainAppLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="bookshelf"
        options={{
          title: "Bookshelf",
        }}
      />
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
    </Tabs>
  );
}
