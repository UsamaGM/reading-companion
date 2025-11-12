import { Models } from "react-native-appwrite";

export interface IUser extends Models.Document {
  username: string;
  email: string;
  totalXP: number;
  level: number;
  currentStreak: number;
  lastReadingDay: string;
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
