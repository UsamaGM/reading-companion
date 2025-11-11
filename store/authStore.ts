import { create } from "zustand";
import { account } from "../lib/appwrite";
import { ID, AppwriteException } from "react-native-appwrite";
import { useUiStore } from "./uiStore";
import Toast from "react-native-toast-message";
import { IUser } from "@/types";

interface AuthState {
  user: IUser | null;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  checkCurrentUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,

  /**
   * Check for an existing session on app load.
   */
  checkCurrentUser: async () => {
    const setLoading = useUiStore.getState().setLoading;

    try {
      setLoading(true);

      const currentUser = (await account.get()) as unknown as IUser;
      set({ user: currentUser });
    } catch (error) {
      set({ user: null });
    } finally {
      setLoading(false);
    }
  },

  /**
   * Sign up a new user.
   * Creates the user and then logs them in.
   */
  signUp: async (email, password, username) => {
    const setLoading = useUiStore.getState().setLoading;

    try {
      setLoading(true);

      await account.create({
        userId: ID.unique(),
        email,
        password,
        name: username,
      });

      await account.createEmailPasswordSession({ email, password });

      const currentUser = (await account.get()) as unknown as IUser;
      set({ user: currentUser });
    } catch (error) {
      const e = error as AppwriteException;
      Toast.show({
        type: "error",
        text1: "SignUp Failed",
        text2: e.message || "An unknown error occurred.",
      });
    } finally {
      setLoading(false);
    }
  },

  /**
   * Log in an existing user.
   */
  logIn: async (email, password) => {
    const setLoading = useUiStore.getState().setLoading;

    try {
      setLoading(true);

      await account.createEmailPasswordSession({ email, password });
      const currentUser = (await account.get()) as unknown as IUser;
      set({ user: currentUser });
    } catch (error) {
      const e = error as AppwriteException;
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: e.message || "An unknown error occurred.",
      });
    } finally {
      setLoading(false);
    }
  },

  /**
   * Log out the current user.
   */
  logOut: async () => {
    const setLoading = useUiStore.getState().setLoading;

    try {
      setLoading(true);
      await account.deleteSession({ sessionId: "current" });
      set({ user: null });
    } catch (error) {
      const e = error as AppwriteException;
      Toast.show({
        type: "error",
        text1: "LogOut Failed",
        text2: e.message || "An unknown error occurred.",
      });
    } finally {
      setLoading(false);
    }
  },
}));

export const initializeAuth = () => {
  useAuthStore.getState().checkCurrentUser();
};
