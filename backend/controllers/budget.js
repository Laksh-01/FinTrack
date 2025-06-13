const db = require("../lib/prisma");

const getCurrentBudget = async (req, res) => {
  try {
    const { clerkUserId, accountId } = req.body;

    if (!clerkUserId) {
      console.log("No clerkUserId present");
      return res.status(400).json({ error: "Missing clerkUserId." });
    }

    const user = await db.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    let budget = await db.budget.findFirst({
      where: {
        userId: user.id,
      },
    });

    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const { _sum } = await db.transaction.aggregate({
      where: {
        userId: user.id,
        type: "EXPENSE",
        accountId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });



    budget =
      budget && typeof budget.amount === "object" && budget.amount?.toNumber
        ? { ...budget, amount: budget.amount.toNumber() }
        : budget;

    const currentExpenses = _sum.amount ? _sum.amount.toNumber() : 0;

    res.status(201).json({ success: true, budget, currentExpenses });
  } catch (err) {
    console.error("Error in getCurrentBudget:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

const updateBudget = async (req, res) => {
  try {
    const { clerkUserId , amount } = req.body;

    if(!clerkUserId) {
      console.log("No clerkUserId present");
    }

    const user = await db.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const budget = await db.budget.upsert({
        where : {
            userId : user.id
        },
        update : {
            amount ,
        },
        create : {
            userId : user.id ,
            amount,
        },
    });
    
    res.status(201).json({ success: true, budget , amount: budget.amount.toNumber() });
  } catch (err) {
    console.error("Error in createAccount:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = {
    updateBudget , getCurrentBudget
}