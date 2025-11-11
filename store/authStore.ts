import { create } from "zustand";
import { account, databases } from "../lib/appwrite";
import { ID, AppwriteException } from "react-native-appwrite";
import type { Models } from "react-native-appwrite";

type AppwriteUser = Models.User<Models.Preferences>;

interface AuthState {
  user: AppwriteUser | null;
  isLoading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  checkCurrentUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  /**
   * Check for an existing session on app load.
   */
  checkCurrentUser: async () => {
    try {
      const currentUser = await account.get();
      set({ user: currentUser, isLoading: false });
    } catch (error) {
      set({ user: null, isLoading: false });
    }
  },

  /**
   * Sign up a new user.
   * Creates the user and then logs them in.
   */
  signUp: async (email, password, username) => {
    try {
      await account.create(ID.unique(), email, password, username);

      await account.createEmailPasswordSession(email, password);

      const currentUser = await account.get();
      set({ user: currentUser });
    } catch (error) {
      console.error(
        "Appwrite sign-up error:",
        (error as AppwriteException).message,
      );
      throw error;
    }
  },

  /**
   * Log in an existing user.
   */
  logIn: async (email, password) => {
    try {
      await account.createEmailSession(email, password);
      const currentUser = await account.get();
      set({ user: currentUser });
    } catch (error) {
      console.error(
        "Appwrite log-in error:",
        (error as AppwriteException).message,
      );
      throw error;
    }
  },

  /**
   * Log out the current user.
   */
  logOut: async () => {
    try {
      await account.deleteSession("current");
      set({ user: null });
    } catch (error) {
      console.error(
        "Appwrite log-out error:",
        (error as AppwriteException).message,
      );
    }
  },
}));

export const initializeAuth = () => {
  useAuthStore.getState().checkCurrentUser();
};
