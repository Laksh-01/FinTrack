const db = require("../lib/prisma");
// const { aj } = require("../arcjet"); // ✅ Correct Arcjet instance
const {GoogleGenerativeAI} = require("@google/generative-ai");

const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
function calculateNextRecurringData(startDate, interval) {
  const date = new Date(startDate);
  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  return date;
}

const createTransaction = async (req, res) => {
  try {
    const { clerkUserId, accountId, data } = req.body;

    if (!clerkUserId || !accountId) {
      return res.status(400).json({ error: "Missing clerkUserId or accountId" });
    }

    const user = await db.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // ✅ Arcjet rate limit check
    // const decision = await aj.protect(req, {
    //   userId: user.id,
    //   requested: 1,
    // });

    // if (decision.isDenied()) {
    //   if (decision.reason.isRateLimit()) {
    //     const { remaining, reset } = decision.reason;
    //     return res.status(429).json({
    //       error: "Rate limit exceeded",
    //       remaining,
    //       resetInSeconds: reset,
    //     });
    //   }
    //   return res.status(403).json({ error: "Request blocked by Arcjet." });
    // }

    const account = await db.account.findUnique({
      where: {
        id: accountId,
        userId: user.id,
      },
    });

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    const balanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;
    const newBalance = account.balance.toNumber() + balanceChange;

    const transaction = await db.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          ...data,
          userId: user.id,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringData(data.date, data.recurringInterval)
              : null,
        },
      });

      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: newBalance },
      });

      return newTransaction;
    });

    res.status(201).json({ success: true, data: transaction });
  } catch (err) {
    console.error("Error in createTransaction:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};



const scanReceipt = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, message: "No file uploaded" });

    const model = genAi.getGenerativeModel({ model: "gemini-1.5-flash" });

    const base64String = file.buffer.toString("base64");

    const prompt = `
      Analyze this receipt image and extract the following information in JSON format:
      - Total amount (just the number)
      - Date (in ISO format)
      - Description or items purchased (brief summary)
      - Merchant/store name
      - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense )

      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }

      If it's not a receipt, return an empty object.
    `;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64String,
          mimeType: file.mimetype,
        },
      },
      { text: prompt },
    ]);

    const response = await result.response;
    const text = await response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    try {
      const data = JSON.parse(cleanedText);
      if (!data.amount) return res.status(200).json({ success: false, message: "Not a receipt", data: {} });

      return res.status(201).json({
        success: true,
        amount: parseFloat(data.amount),
        date: new Date(data.date),
        description: data.description,
        category: data.category,
        merchantName: data.merchantName,
      });
    } catch (err) {
      console.error("JSON Parse Error:", err);
      return res.status(500).json({ success: false, message: "Invalid JSON from Gemini" });
    }
  } catch (error) {
    console.error("Error scanning receipt:", error);
    return res.status(500).json({ success: false, message: "Failed to scan receipt" });
  }
};




const getTransaction = async (req,res)=>{
  try{
    const {clerkUserId , accountId} = req.body;

    if(!clerkUserId) {
      throw new Error("User Not Found");
    }

    const user = await db.user.findUnique({
      where : {clerkUserId}
    })


    if(!user){
      throw new Error("User not Found");
    }

    const transaction = await db.transaction.findUnique({
      where : {
        id : accountId,
        userId : user.id,
      }
    })


    if(!transaction) throw new Error("Transaction not found");
    return res.status(201).json({ success: true, transaction });

    
  }catch(error){
      console.error("Internal server error", error);
    return res.status(500).json({ success: false, message: "error" });
  }
}


const updateTransaction = async (req, res) => {
  try {
    const { clerkUserId, accountId, data, id: transactionId } = req.body;

    if (!clerkUserId) throw new Error("Missing user ID");
    if (!transactionId) throw new Error("Missing transaction ID");

    const user = await db.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) throw new Error("User not found");

    const originalTransaction = await db.transaction.findFirst({
      where: {
        id: transactionId,
        userId: user.id,
      },
      include: {
        account: true,
      },
    });

    if (!originalTransaction) throw new Error("Transaction not found");

    const oldBalanceChange =
      originalTransaction.type === "EXPENSE"
        ? -originalTransaction.amount.toNumber()
        : originalTransaction.amount.toNumber();

    const newBalanceChange =
      data.type === "EXPENSE" ? -data.amount : data.amount;

    const netBalanceChange = newBalanceChange - oldBalanceChange;

    const updatedTransaction = await db.$transaction(async (tx) => {
      // Update transaction
      const updated = await tx.transaction.update({
        where: {
          id: transactionId,
        },
        data: {
          ...data,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      // Update balance
      await tx.account.update({
        where: { id: data.accountId },
        data: {
          balance: {
            increment: netBalanceChange,
          },
        },
      });

      return updated;
    });

    return res.status(200).json({ success: true, transaction: updatedTransaction });
  } catch (error) {
    console.error("Error updating transaction:", error);
    return res.status(500).json({ success: false, message: error.message || "Error updating transaction" });
  }
};






function calculateNextRecurringDate(startDate, interval) {
  const date = new Date(startDate);

  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  return date;
}


module.exports = {
  createTransaction,
  scanReceipt,
  getTransaction,
  updateTransaction

};
