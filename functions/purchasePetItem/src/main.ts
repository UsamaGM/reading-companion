import { Client, Databases, ID, Permission, Role } from "node-appwrite";

export default async function purchasePetItem({ req, res, log, error }) {
  const {
    APPWRITE_FUNCTION_ENDPOINT,
    APPWRITE_FUNCTION_PROJECT_ID,
    APPWRITE_API_KEY,
    APPWRITE_DATABASE_ID,
  } = process.env;

  if (
    !APPWRITE_DATABASE_ID ||
    !APPWRITE_API_KEY ||
    !APPWRITE_FUNCTION_ENDPOINT ||
    !APPWRITE_FUNCTION_PROJECT_ID
  ) {
    error(
      "Missing environment variables: APPWRITE_DATABASE_ID or APPWRITE_API_KEY",
    );
    return res.json({ success: false, error: "Function not configured." }, 500);
  }

  const client = new Client()
    .setEndpoint(APPWRITE_FUNCTION_ENDPOINT)
    .setProject(APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  const databases = new Databases(client);

  try {
    const userId = req.user.$id;
    const { itemId } = JSON.parse(req.body);

    if (!itemId) {
      throw new Error("itemId is required.");
    }

    const userPromise = databases.getDocument(
      APPWRITE_DATABASE_ID,
      "users",
      userId,
    );
    const itemPromise = databases.getDocument(
      APPWRITE_DATABASE_ID,
      "petitems",
      itemId,
    );

    const [user, item] = await Promise.all([userPromise, itemPromise]);

    if (user.treats < item.price) {
      throw new Error("Not enough treats.");
    }

    const newTreats = user.treats - item.price;
    const userUpdatePromise = databases.updateDocument(
      APPWRITE_DATABASE_ID,
      "users",
      userId,
      { treats: newTreats },
    );

    const inventoryPromise = databases.createDocument(
      APPWRITE_DATABASE_ID,
      "userinventory",
      ID.unique(),
      {
        userId: userId,
        itemId: itemId,
      },
      [
        Permission.read(Role.user(userId)),
        Permission.delete(Role.user(userId)),
      ],
    );

    await Promise.all([userUpdatePromise, inventoryPromise]);

    log(
      `Purchase complete: User ${userId} bought ${itemId} for ${item.price} treats.`,
    );
    return res.json({ success: true, newTreats: newTreats });
  } catch (e) {
    error(`Error processing purchase: ${e.message}`);
    // Send a user-friendly error
    return res.json({ success: false, error: e.message }, 400);
  }
}
