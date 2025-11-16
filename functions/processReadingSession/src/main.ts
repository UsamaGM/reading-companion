const { Client, Databases, Query } = require("node-appwrite");

/**
 * Gets the start of a given day (00:00:00)
 * @param {Date} date
 * @returns {Date}
 */
const getStartOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

// --- Constants ---
const HAPPINESS_BOOST = 5;
const XP_PER_PAGE = 10;
const XP_PER_MINUTE = 2;
const LEVEL_UP_MULTIPLIER = 150;

module.exports = async ({ req, res, log, error }) => {
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
    const session = req.body;
    const { pagesRead, timeSpent } = session;

    const userId =
      typeof session.userId === "object" && session.userId !== null
        ? session.userId.$id
        : session.userId;
    const bookId =
      typeof session.bookId === "object" && session.bookId !== null
        ? session.bookId.$id
        : session.bookId;

    if (!userId || !bookId || !pagesRead || !timeSpent) {
      throw new Error("Invalid session payload. Missing required fields.");
    }

    const xpGained = pagesRead * XP_PER_PAGE + timeSpent * XP_PER_MINUTE;
    const treatsGained = Math.round(xpGained / 4);

    log(
      `Processing session for user ${userId}. XP Gained: ${xpGained}, Treats Gained: ${treatsGained}`,
    );

    const userPromise = databases.getDocument(
      APPWRITE_DATABASE_ID,
      "users",
      userId,
    );
    const bookPromise = databases.getDocument(
      APPWRITE_DATABASE_ID,
      "userbook",
      bookId,
    );
    const clubMembershipsPromise = databases.listDocuments(
      APPWRITE_DATABASE_ID,
      "clubmembers",
      [Query.equal("userId", userId)],
    );
    const userPetPromise = databases.listDocuments(
      APPWRITE_DATABASE_ID,
      "userpets",
      [Query.equal("userId", userId), Query.limit(1)],
    );

    const [user, book, clubMemberships, userPetResponse] = await Promise.all([
      userPromise,
      bookPromise,
      clubMembershipsPromise,
      userPetPromise,
    ]);

    const updatePromises = [];

    const today = getStartOfDay(new Date());
    const lastDay = user.lastReadingDay
      ? getStartOfDay(new Date(user.lastReadingDay))
      : null;
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    let newStreak = user.currentStreak;
    if (!lastDay) newStreak = 1;
    else if (lastDay.getTime() === yesterday.getTime()) newStreak++;
    else if (lastDay.getTime() < yesterday.getTime()) newStreak = 1;

    const newTotalXP = user.totalXP + xpGained;
    const nextLevelXP = user.level * LEVEL_UP_MULTIPLIER;
    const newLevel = newTotalXP >= nextLevelXP ? user.level + 1 : user.level;
    const newTreats = user.treats + treatsGained;

    updatePromises.push(
      databases.updateDocument(APPWRITE_DATABASE_ID, "users", user.$id, {
        totalXP: newTotalXP,
        level: newLevel,
        currentStreak: newStreak,
        lastReadingDay: new Date().toISOString(),
        treats: newTreats,
      }),
    );
    log(
      `User ${user.$id} updated: XP +${xpGained}, Treats +${treatsGained}, Streak ${newStreak}`,
    );

    const newCurrentPage = book.currentPage + pagesRead;
    const newStatus =
      newCurrentPage >= book.totalPages ? "completed" : book.status;

    updatePromises.push(
      databases.updateDocument(APPWRITE_DATABASE_ID, "userbook", book.$id, {
        currentPage: newCurrentPage,
        status: newStatus,
      }),
    );
    log(`Book ${book.$id} updated: Page ${newCurrentPage}`);

    clubMemberships.documents.forEach((member) => {
      const newWeeklyPages = member.weeklyPages + pagesRead;
      updatePromises.push(
        databases.updateDocument(
          APPWRITE_DATABASE_ID,
          "clubmembers",
          member.$id,
          { weeklyPages: newWeeklyPages },
        ),
      );
    });
    log(
      `Updating ${clubMemberships.documents.length} club memberships for user ${userId}`,
    );

    if (userPetResponse.documents.length > 0) {
      const userPet = userPetResponse.documents[0];
      const newHappiness = Math.min(100, userPet.happiness + HAPPINESS_BOOST);

      updatePromises.push(
        databases.updateDocument(
          APPWRITE_DATABASE_ID,
          "UserPets",
          userPet.$id,
          { happiness: newHappiness },
        ),
      );
      log(`Pet ${userPet.$id} happiness updated to ${newHappiness}`);
    } else {
      log(`User ${userId} has no pet, skipping happiness update.`);
    }

    await Promise.all(updatePromises);

    return res.json({ success: true, xpGained, treatsGained });
  } catch (e) {
    error(`Error processing session: ${e.message}`);
    return res.json({ success: false, error: e.tostring() }, 500);
  }
};
