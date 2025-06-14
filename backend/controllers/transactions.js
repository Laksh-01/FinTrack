// controllers/transactionController.js
const { Prisma } = require("../generated/prisma"); 
const db = require("../lib/prisma");

const deleteBulkTransactions = async (req, res) => {
  try {
    const { clerkUserId, transactionIds } = req.body;

    if (!clerkUserId || !transactionIds || !Array.isArray(transactionIds) || transactionIds.length === 0) {
      return res.status(400).json({ error: "clerkUserId and a non-empty transactionIds array are required." });
    }

    const user = await db.user.findUnique({ where: { clerkUserId } });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const transactionsToDelete = await db.transaction.findMany({
      where: {
        id: { in: transactionIds },
        userId: user.id,
      },
    });

    if (transactionsToDelete.length !== transactionIds.length) {
      return res.status(403).json({ error: "Forbidden: You can only delete your own transactions, or some IDs were not found." });
    }

    // Use a Map to correctly group balance changes by accountId
    const accountBalanceChanges = new Map();

    for (const transaction of transactionsToDelete) {
      const transactionAmount = new Prisma.Decimal(transaction.amount);
      const change = transaction.type === "EXPENSE" ? transactionAmount : transactionAmount.negated();
      const currentChange = accountBalanceChanges.get(transaction.accountId) || new Prisma.Decimal(0);
      accountBalanceChanges.set(transaction.accountId, currentChange.plus(change));
    }

    await db.$transaction(async (tx) => {
      await tx.transaction.deleteMany({
        where: {
          id: { in: transactionIds },
          userId: user.id,
        },
      });

      // *** FIX APPLIED HERE ***
      // Iterate directly over the Map object to get key-value pairs.
      for (const [accountId, balanceChange] of accountBalanceChanges) {
        await tx.account.update({
          where: {
            id: accountId,
            userId: user.id,
          },
          data: {
            balance: {
              increment: balanceChange,
            },
          },
        });
      }
    });

    // Correctly send a 204 No Content response
    res.status(204).send();

  } catch (error) {
    console.error("Error in deleteBulkTransactions:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const { clerkUserId, transactionId } = req.body;

    if (!clerkUserId || !transactionId) {
      return res.status(400).json({ error: "clerkUserId and transactionId are required." });
    }

    const user = await db.user.findUnique({ where: { clerkUserId } });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Use a transaction block here as well to find and delete atomically
    const transactionToDelete = await db.transaction.findFirst({
      where: {
        id: transactionId,
        userId: user.id,
      },
    });

    if (!transactionToDelete) {
      return res.status(404).json({ error: "Transaction not found or you do not have permission." });
    }

    await db.$transaction(async (tx) => {
      const balanceChange =
        transactionToDelete.type === "EXPENSE"
          ? new Prisma.Decimal(transactionToDelete.amount)
          : new Prisma.Decimal(transactionToDelete.amount).negated();

      await tx.account.update({
        where: {
          id: transactionToDelete.accountId,
        },
        data: {
          balance: {
            increment: balanceChange,
          },
        },
      });

      await tx.transaction.delete({
        where: {
          id: transactionId,
        },
      });
    });

    // *** FIX APPLIED HERE ***
    // Use .send() for 204 No Content responses.
    res.status(204).send();

  } catch (error) {
    console.error("Error in deleteTransaction:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = {
  deleteBulkTransactions,
  deleteTransaction,
};