import PetComponent from "@/components/PetComponent";
import StatCard from "@/components/StatCard";
import appwriteClient, {
  DATABASE_ID,
  tablesDB,
  USERS_TABLE,
} from "@/lib/appwrite";
import { useAuthStore } from "@/store/authStore";
import { IUser } from "@/types";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AppwriteException } from "react-native-appwrite";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logOut = useAuthStore((s) => s.logOut);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<IUser | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const userId = user.$id;
    const fetchProfile = async () => {
      try {
        const row = (await tablesDB.getRow({
          databaseId: DATABASE_ID,
          tableId: USERS_TABLE,
          rowId: userId,
        })) as unknown as IUser;

        setProfile(row);
      } catch (error) {
        const e = error as AppwriteException;
        Toast.show({
          type: "error",
          text1: "Failed to fetch profile",
          text2: e.message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    const userDocumentChannel = `databases.${DATABASE_ID}.tables.${USERS_TABLE}.rows.${userId}`;

    const unsubscribe = appwriteClient.subscribe(
      userDocumentChannel,
      (response) => {
        setProfile(response.payload as IUser);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user]);

  if (loading) return <ActivityIndicator size="large" />;
  else if (!profile) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center p-4">
        <Text className="text-lg text-gray-500">Could not load profile.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="safe-area-container">
      <ScrollView className="flex-1">
        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-blue-500 rounded-full justify-center items-center shadow-lg mb-4">
            <Text className="text-white text-5xl font-bold">
              {profile.username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text className="text-3xl font-bold">{profile.username}</Text>
          <Text className="text-lg text-gray-500">{profile.email}</Text>
        </View>

        <View className="flex flex-row justify-between gap-4 my-8">
          <StatCard label="Level" value={profile.level} />
          <StatCard label="Streak" value={`${profile.currentStreak} days`} />
        </View>
        <View className="flex flex-row justify-between gap-4 mb-8">
          <StatCard label="Total XP" value={profile.totalXP} />
          <StatCard label="Treats" value={profile.treats} />
        </View>

        <PetComponent />

        <TouchableOpacity onPress={logOut} className="log-out-btn-container">
          <Text className="log-out-btn-text">Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
