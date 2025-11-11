import {
    Client,
    Account,
    Databases,
    Functions,
    ID,
} from "react-native-appwrite";

const client = new Client();

client
    .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)
    .setPlatform(process.env.EXPO_PUBLIC_APPWRITE_PLATFORM!);

export const account = new Account(client);
export const databases = new Databases(client);
export const functions = new Functions(client);

export default client;
