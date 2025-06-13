// controllers/transactionController.js
const Prisma = require("../generated/prisma");
const db = require("../lib/prisma");
const deleteBulkTransactions = async (req, res) => {
  try {
    const { clerkUserId, transactionIds } = req.body;

    // --- 1. Validation and User Fetching ---
    if (!clerkUserId || !transactionIds || !Array.isArray(transactionIds)) {
      return res.status(400).json({ error: "clerkUserId and transactionIds array are required." });
    }

    const user = await db.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // --- 2. Fetch all transactions to be deleted to calculate balance changes ---
    // This is a crucial security step: ensure all transactions belong to the user.
    const transactionsToDelete = await db.transaction.findMany({
      where: {
        id: { in: transactionIds },
        userId: user.id, // Security: Only fetch transactions owned by the user
      },
    });

    if (transactionsToDelete.length !== transactionIds.length) {
      // This means the user tried to delete transactions that don't exist or don't belong to them.
      return res.status(403).json({ error: "Forbidden: You can only delete your own transactions." });
    }

    // --- 3. Calculate the necessary balance changes for each account ---
   const accountBalanceChanges = new Map();

    for (const transaction of transactionsToDelete) {
      // Create a Prisma.Decimal object from the transaction's amount.
      const transactionAmount =  new Prisma.Decimal(transaction.amount);

      // To revert a transaction: add back an expense, subtract an income.
      const change = transaction.type === "EXPENSE" 
        ? transactionAmount 
        : transactionAmount.negated(); // .negated() safely makes it negative

      // Get the current total change for this account, or initialize it to zero.
      const currentChange = accountBalanceChanges.get(transaction.accountId) || new Prisma.Decimal(0);

      // Use the .plus() method for safe addition of Decimal objects.
      accountBalanceChanges.set(transaction.accountId, currentChange.plus(change));
    } 

    // --- 4. Perform all database operations within a single atomic transaction ---
    await db.$transaction(async (tx) => {
      // A) Delete all the specified transactions
      // *** BUG FIX #2: Correctly reference `transactionIds` from req.body ***
      await tx.transaction.deleteMany({
        where: {
          id: { in: transactionIds },
          userId: user.id,
        },
      });

      // B) Loop through the calculated changes and update each account
      for (const [accountId, balanceChange] of Object.entries(accountBalanceChanges)) {
        await tx.account.update({
          where: { 
            id: accountId,
            // Another security layer: ensure the account also belongs to the user
            userId: user.id 
          },
          data: {
            // Use Prisma's atomic increment to safely update the balance
            balance: {
              increment: balanceChange,
            },
          },
        });
      }
    });

    // Use 204 No Content for successful deletions that don't return data.
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

    const user = await db.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }


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
      // 1. Calculate the balance change.
      const balanceChange =
        transactionToDelete.type === "EXPENSE"
          ? new Prisma.Decimal(transactionToDelete.amount)
          : new Prisma.Decimal(transactionToDelete.amount).negated();

      // 2. Update the account balance.
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

      // 3. Delete the transaction.
      await tx.transaction.delete({
        where: {
          id: transactionId,
        },
      });
    });

    // Use 204 No Content for successful deletions that don't return data.
    res.status(204).json({success:true});

  } catch (error) {
    console.error("Error in deleteTransaction:", error);
    if (error.message.includes("Transaction not found")) {
        return res.status(404).json({ error: error.message });
    }
    // Otherwise, it's a generic server error
    res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = {
  deleteBulkTransactions, deleteTransaction
};