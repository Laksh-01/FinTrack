const db = require("../lib/prisma");
const { subDays } = require("date-fns");

// --- Helper functions from your script (they are perfect) ---
const CATEGORIES = {
  INCOME: [
    { name: "salary", range: [5000, 8000] },
    { name: "freelance", range: [1000, 3000] },
    { name: "investments", range: [500, 2000] },
    { name: "other-income", range: [100, 1000] },
  ],
  EXPENSE: [
    { name: "housing", range: [1000, 2000] },
    { name: "transportation", range: [100, 500] },
    { name: "groceries", range: [200, 600] },
    { name: "utilities", range: [100, 300] },
    { name: "entertainment", range: [50, 200] },
    { name: "food", range: [50, 150] },
    { name: "shopping", range: [100, 500] },
    { name: "healthcare", range: [100, 1000] },
    { name: "education", range: [200, 1000] },
    { name: "travel", range: [500, 2000] },
  ],
};
function getRandomAmount(min, max) {
  return Number((Math.random() * (max - min) + min).toFixed(2));
}
function getRandomCategory(type) {
  const categories = CATEGORIES[type];
  const category = categories[Math.floor(Math.random() * categories.length)];
  const amount = getRandomAmount(category.range[0], category.range[1]);
  return { category: category.name, amount };
}
// --- The Controller Function ---
const seedTransactions = async (req, res) => {
  try {
    clerkUserId = "user_2yEQu1UNW58OTs0wG5EPdER1SJ1";

    // Find the user and their first account to seed data into.
    const user = await db.user.findUnique({
      where: { clerkUserId },
      include: { accounts: { take: 1 } }, // Get the first account
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    if (!user.accounts || user.accounts.length === 0) {
      return res.status(404).json({ error: "User has no accounts to seed." });
    }

    const accountId ="73600446-ccdd-4864-98e3-02cda97462b9" ;
    const userId = "6550e794-e50c-421b-8cd5-3bde9cba02ea";

    // --- Your transaction generation logic (mostly unchanged) ---
    const transactions = [];
    for (let i = 90; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const transactionsPerDay = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < transactionsPerDay; j++) {
        const type = Math.random() < 0.4 ? "INCOME" : "EXPENSE";
        const { category, amount } = getRandomCategory(type);
        transactions.push({
          type,
          amount,
          description: `${type === "INCOME" ? "Received" : "Paid for"} ${category}`,
          date,
          category,
          status: "COMPLETED",
          userId: userId, // Use dynamic user ID
          accountId: accountId, // Use dynamic account ID
        });
      }
    }

    // Calculate the new balance based on the generated transactions
    const totalIncome = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);
    const finalBalance = totalIncome - totalExpense;

    // --- Database transaction ---
    await db.$transaction(async (tx) => {
      await tx.transaction.deleteMany({ where: { accountId: accountId } });
      await tx.transaction.createMany({ data: transactions });
      await tx.account.update({
        where: { id: accountId },
        data: { balance: finalBalance },
      });
    });

    res.status(200).json({
      success: true,
      message: `Successfully created ${transactions.length} transactions.`,
    });

  } catch (error) {
    console.error("Error seeding transactions:", error);
    res.status(500).json({ success: false, error: "Failed to seed data." });
  }
};

module.exports = {
  seedTransactions,
};