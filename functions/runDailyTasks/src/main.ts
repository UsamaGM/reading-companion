import { Client, Databases, Query } from "node-appwrite";

const COLLECTION_ID_USERPETS = "userpets";
const COLLECTION_ID_CLUBMEMBERS = "clubmembers";
const HAPPINESS_DECAY = 10;
const MIN_HAPPINESS = 20;

async function decayPetHappiness(databases, log) {
  log("Starting daily pet happiness decay...");
  let offset = 0;
  let petsUpdated = 0;
  const limit = 100;

  while (true) {
    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTION_ID_USERPETS,
      [Query.limit(limit), Query.offset(offset)],
    );
    const pets = response.documents;
    if (pets.length === 0) break;

    const updatePromises = [];
    for (const pet of pets) {
      if (pet.happiness > MIN_HAPPINESS) {
        const newHappiness = Math.max(
          MIN_HAPPINESS,
          pet.happiness - HAPPINESS_DECAY,
        );
        updatePromises.push(
          databases.updateDocument(
            process.env.APPWRITE_DATABASE_ID,
            COLLECTION_ID_USERPETS,
            pet.$id,
            { happiness: newHappiness },
          ),
        );
        petsUpdated++;
      }
    }
    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
    }
    offset += pets.length;
  }
  log(`Pet decay complete. Updated ${petsUpdated} pets.`);
  return petsUpdated;
}

async function resetLeaderboards(databases, log) {
  log("Starting weekly leaderboard reset...");
  let offset = 0;
  let documentsProcessed = 0;
  const limit = 100;

  while (true) {
    const response = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      COLLECTION_ID_CLUBMEMBERS,
      [Query.limit(limit), Query.offset(offset)],
    );
    const documents = response.documents;
    if (documents.length === 0) break;

    const updatePromises = documents.map((doc) =>
      databases.updateDocument(
        process.env.APPWRITE_DATABASE_ID,
        COLLECTION_ID_CLUBMEMBERS,
        doc.$id,
        { weeklyPages: 0 },
      ),
    );
    await Promise.all(updatePromises);
    documentsProcessed += documents.length;
    offset += documents.length;
  }
  log(`Leaderboard reset complete. Processed ${documentsProcessed} documents.`);
  return documentsProcessed;
}

export default async function ({ req, res, log, error }) {
  const {
    APPWRITE_FUNCTION_ENDPOINT,
    APPWRITE_FUNCTION_PROJECT_ID,
    APPWRITE_API_KEY,
    APPWRITE_DATABASE_ID,
  } = process.env;

  if (
    !APPWRITE_DATABASE_ID ||
    !APPWRITE_API_KEY ||
    !APPWRITE_FUNCTION_PROJECT_ID ||
    !APPWRITE_FUNCTION_ENDPOINT
  ) {
    error("Missing environment variables.");
    return res.json({ success: false, error: "Function not configured." }, 500);
  }

  const client = new Client()
    .setEndpoint(APPWRITE_FUNCTION_ENDPOINT || "https://cloud.appwrite.io/v1")
    .setProject(APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

  const databases = new Databases(client);

  try {
    const today = new Date();
    const dayOfWeek = today.getDay();

    const petsUpdated = await decayPetHappiness(databases, log);

    let leaderboardsReset = 0;
    if (dayOfWeek === 0) {
      log("Today is Sunday. Running weekly leaderboard reset...");
      leaderboardsReset = await resetLeaderboards(databases, log);
    } else {
      log("Today is not Sunday. Skipping weekly leaderboard reset.");
    }

    return res.json({ success: true, petsUpdated, leaderboardsReset });
  } catch (e) {
    error(`Error in daily tasks: ${e.message}`);
    return res.json({ success: false, error: e.message }, 500);
  }
}
