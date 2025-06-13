const db = require("../lib/prisma");

const getAccountWithTransactions = async (req, res) => {
  try {
    const { accountId, clerkUserId } = req.body;

    // Get pagination parameters from the query string, with defaults
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;

    if (!clerkUserId || !accountId) {
      return res.status(400).json({ success: false, error: "clerkUserId and accountId are required." });
    }

    const user = await db.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    // --- PAGINATION LOGIC STARTS HERE ---
    const [account, transactions, totalTransactions] = await db.$transaction([
      // Query 1: Get the account details itself, but WITHOUT transactions.
      // This also serves as our security check.
      db.account.findUnique({
        where: {
          id: accountId,
          userId: user.id, // Crucial security check
        },
      }),

      // Query 2: Get ONLY the paginated transactions for this account.
      db.transaction.findMany({
        where: {
          accountId: accountId,
          userId: user.id, // Second security check for defense-in-depth
        },
        orderBy: { date: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),

      // Query 3: Get the TOTAL count of transactions for this account.
      db.transaction.count({
        where: {
          accountId: accountId,
          userId: user.id,
        },
      }),
    ]);

    // --- END OF PAGINATION LOGIC ---

    // After the queries, check if the account was actually found.
    if (!account) {
      return res.status(404).json({ success: false, error: "Account not found or access denied." });
    }

    // Manually combine the results into the structure your frontend expects.
    const responseData = {
      ...account, // Includes id, name, type, balance, etc.
      transactions: transactions, // The paginated list of transactions
      _count: {
        transactions: totalTransactions, // The total count for all pages
      },
    };

    // Calculate pagination metadata to send to the frontend
    const totalPages = Math.ceil(totalTransactions / pageSize);
    
    res.json({
      success: true,
      data: responseData,
      pagination: {
        currentPage: page,
        pageSize: pageSize,
        totalItems: totalTransactions,
        totalPages: totalPages,
      },
    });

  } catch (error) {
    console.error("Error in getAccountWithTransactions:", error);
    res.status(500).json({ success: false, error: "Internal server error." });
  }
};


const getAccountWithTransactionsAll = async (req, res) => {
  try {
    const { accountId, clerkUserId } = req.body;

    // 🔒 Basic validation
    if (!clerkUserId || !accountId) {
      return res.status(400).json({
        success: false,
        error: "clerkUserId and accountId are required.",
      });
    }

    // 🔍 Find user
    const user = await db.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found.",
      });
    }

    // 📦 Run all queries in a transaction
    const [account, transactions, totalTransactions] = await db.$transaction([
      // Account (without relations)
      db.account.findUnique({
        where: {
          id: accountId,
          userId: user.id, // Secure: only user who owns it
        },
      }),

      // All transactions (non-paginated)
      db.transaction.findMany({
        where: {
          accountId: accountId,
          userId: user.id,
        },
        orderBy: {
          date: 'desc',
        },
      }),

      // Count transactions
      db.transaction.count({
        where: {
          accountId: accountId,
          userId: user.id,
        },
      }),
    ]);

    // ❌ If account doesn't exist or not owned by user
    if (!account) {
      return res.status(404).json({
        success: false,
        error: "Account not found or access denied.",
      });
    }

    // ✅ Combine and return the data
    const responseData = {
      ...account,
      transactions,
      _count: {
        transactions: totalTransactions,
      },
    };

    return res.json({
      success: true,
      data: responseData,
    });

  } catch (error) {
    console.error("❌ Error in getAccountWithTransactionsAll:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error.",
    });
  }
};



module.exports = {
  getAccountWithTransactions,getAccountWithTransactionsAll
};