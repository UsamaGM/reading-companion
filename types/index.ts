import { Models } from "react-native-appwrite";

export interface IUser extends Models.Document {
  username: string;
  email: string;
  totalXP: number;
  level: number;
  currentStreak: number;
  lastReadingDay: string | null;
  treats: number;
  hasActivePet: boolean;
}

export interface IPetType extends Models.Document {
  name: string;
  baseImageUrl: string;
}

export interface IUserPet extends Models.Document {
  userId: string;
  petTypeId: string;
  nickname: string;
  happiness: number;
  equippedItems: string[];
}

export interface IPetItem extends Models.Document {
  name: string;
  price: number;
  imageUrl: string;
}

export interface IUserBook extends Models.Document {
  userId: string;
  title: string;
  totalPages: number;
  currentPage: number;
  status: "reading" | "finished";
}

export interface IReadingSession extends Models.Document {
  userId: string;
  bookId: string;
  pagesRead: number;
  timeSpent: number;
}

export interface IClub extends Models.Document {
  clubName: string;
  inviteCode: string;
  creatorId: string;
}

export interface IClubMembers extends Models.Document {
  userId: string;
  clubId: string;
  weeklyPages: number;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  weeklyPages: number;
}
