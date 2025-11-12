import { Client, Account, Databases, Functions } from "react-native-appwrite";

const client = new Client();

client
    .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)
    .setPlatform(process.env.EXPO_PUBLIC_APPWRITE_PLATFORM!);

export const account = new Account(client);
export const databases = new Databases(client);
export const functions = new Functions(client);

// Environment Variables
export const PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!;
export const ENDPOINT = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!;
export const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
export const PLATFORM = process.env.EXPO_PUBLIC_APPWRITE_PLATFORM!;

// Tables
export const USERS_TABLE = "users";
export const USERBOOK_TABLE = "userbook";
export const READINGSESSION_TABLE = "readingsession";
export const CLUBS_TABLE = "clubs";
export const CLUBMEMBER_TABLE = "clubmembers";
export const PETTYPE_TABLE = "pettypes";
export const USERPET_TABLE = "userpets";
export const PETITEM_TABLE = "petitems";

export default client;
