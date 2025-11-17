import { Client, Databases, Permission, Role } from "node-appwrite";

export default async ({
  req,
  res,
  log,
  error,
}: {
  req: any;
  res: any;
  log: any;
  error: any;
}) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(client);

  try {
    const user = req.body;
    const userId = user.$id;

    if (!userId) {
      throw new Error(
        "User ID not found in payload. Ensure function is triggered by 'users.create'.",
      );
    }

    const newUserDocument = {
      $id: userId,
      email: user.email,
      username: user.name,
      totalXP: 0,
      level: 1,
      currentStreak: 0,
      lastReadingDay: null,
    };

    // Define permissions for the new document
    // The user can read and update their *own* document
    const docPermissions = [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
    ];

    await databases.createDocument(
      process.env.APPWRITE_DB_ID,
      "Users",
      userId,
      newUserDocument,
      docPermissions,
    );

    log(`Successfully created user document for: ${userId}`);
    return res.json({ success: true, userId: userId });
  } catch (e) {
    error(`Error creating user document: ${e.message}`);
    return res.json({ success: false, error: e.message }, 500);
  }
};
