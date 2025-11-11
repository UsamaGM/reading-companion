// 1. Users Collection
export interface IUser {
  $id: string;
  username: string;
  email: string;
  totalXP: number;
  level: number;
  currentStreak: number;
  lastReadingDay: string;
}

// 2. UserBooks Collection
export interface IUserBook {
  $id: string;
  $collectionId: string;
  $createdAt: string;
  userId: string;
  title: string;
  totalPages: number;
  currentPage: number;
  status: "reading" | "finished";
}

// 3. ReadingSessions Collection
export interface IReadingSession {
  $id: string;
  $collectionId: string;
  $createdAt: string;
  userId: string;
  bookId: string;
  pagesRead: number;
  timeSpent: number;
}
