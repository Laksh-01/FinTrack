// backend/controllers/accountsController.js

const db = require("../lib/prisma");

/**
 * Creates a new account for a user.
 * Wrapped in a transaction to ensure data integrity.
 */
const createAccount = async (req, res) => {
  try {
    const { userId, balance, isDefault, name, type } = req.body;
    clerkUserId = userId;
    if(!clerkUserId) {
      console.log("No clerkUserId present");
    }

    const user = await db.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const balanceFloat = parseFloat(balance);
    if (isNaN(balanceFloat)) {
      return res.status(400).json({ error: "Invalid balance format." });
    }

    // Use a transaction to ensure both operations succeed or neither do.
    const newAccount = await db.$transaction(async (prisma) => {
      const accountCount = await prisma.account.count({
        where: { userId : user.id },
      });

      const shouldBeDefault = accountCount === 0 ? true : isDefault;

      // If this new account is set to be the default,
      // first unset the current default account.
      if (shouldBeDefault) {
        await prisma.account.updateMany({
          where: { userId: user.id,isDefault: true },
          data: { isDefault: false },
        });
      }

      // Finally, create the new account.
      return prisma.account.create({
        data: {
          name,
          type,
          balance: balanceFloat,
          userId: user.id,
          isDefault: shouldBeDefault,
        },
      });
    });

    res.status(201).json({ success: true, data: newAccount });
  } catch (err) {
    console.error("Error in createAccount:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * Retrieves all accounts for a given user.
 */
const getUserAccounts = async (req, res) => {
  try {
    const { clerkUserId } = req.body;
    if (!clerkUserId) {
      return res.status(400).json({ error: "clerkUserId is required." });
    }

    const user = await db.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      // It's not an error if a valid user has no accounts yet.
      // But if the user record itself doesn't exist, that's a 404.
      return res.status(404).json({ error: "User not found." });
    }

    const accounts = await db.account.findMany({
      where: { userId: user.id },
      // orderBy: [
      //  {isDefault: "desc" , createdAt: "desc"}
      // ]
    });

    res.json({ success: true, data: accounts });
  } catch (error) {
    console.error("Error in getUserAccounts:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * Updates which account is the default for a user.
 * Wrapped in a transaction to prevent race conditions.
 */
const updateDefaultAccount = async (req, res) => {
  try {
    const { accountId, clerkUserId } = req.body;

    if (!accountId || !clerkUserId) {
      return res.status(400).json({ error: "accountId and clerkUserId are required." });
    }

    const user = await db.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Use a transaction to make the two-step update atomic.
    const updatedAccount = await db.$transaction(async (prisma) => {
      // 1. Set all of this user's accounts to NOT be the default.
      await prisma.account.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });

      // 2. Set the specified account to be the new default.
      return prisma.account.update({
        where: {
          id: accountId,
          // Extra security: ensure the account belongs to the user
          userId: user.id,
        },
        data: { isDefault: true },
      });
    });

    res.json({ success: true, data: updatedAccount });
  } catch (error) {
    console.error("Error in updateDefaultAccount:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};


const getDashboardData = async(req,res) => {
  try{
    const {clerkUserId} = req.body;
    if(!clerkUserId) throw new Error("Unauthorised");

    const user = await db.user.findUnique({
      where: {
        clerkUserId
      }
    });

    if(!user){
       throw new Error("User not found");
    }

    const transactions = await db.transaction.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  res.status(201).json({ success: true, transactions});

  }catch(error){
console.error("Error in updateDefaultAccount:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}

module.exports = {
  createAccount,
  getUserAccounts,
  updateDefaultAccount,
  getDashboardData
};