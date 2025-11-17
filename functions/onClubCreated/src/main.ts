import { Client, Databases, ID, Permission, Role } from "node-appwrite";

export default async ({ req, res, log, error }) => {
  const {
    APPWRITE_FUNCTION_ENDPOINT,
    APPWRITE_FUNCTION_PROJECT_ID,
    APPWRITE_API_KEY,
    APPWRITE_DATABASE_ID,
  } = process.env;

  const client = new Client()
    .setEndpoint(APPWRITE_FUNCTION_ENDPOINT)
    .setProject(APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  const databases = new Databases(client);

  try {
    const club = req.body;
    const creatorId = club.creatorId;
    const clubId = club.$id;

    if (!creatorId) {
      throw new Error("Missing creatorId in club payload.");
    }

    const newMemberData = {
      userId: creatorId,
      clubId: clubId,
      weeklyPages: 0,
    };

    const permissions = [
      Permission.read(Role.user(creatorId)),
      Permission.update(Role.user(creatorId)),
      Permission.delete(Role.user(creatorId)),
    ];

    await databases.createDocument(
      APPWRITE_DATABASE_ID,
      "clubmembers",
      ID.unique(),
      newMemberData,
      permissions,
    );

    log(`Created initial member entry for user ${creatorId} in club ${clubId}`);
    return res.json({ success: true });
  } catch (e) {
    error(`Error creating club member: ${e.message}`);
    return res.json({ success: false, error: e.message }, 500);
  }
};
