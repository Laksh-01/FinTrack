const db = require("../lib/prisma");


const {GoogleGenerativeAI} = require("@google/generative-ai");

const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


const getInvestments = async (req, res) => {
  try {
    const { clerkUserId, accountId  } = req.body;

    if (!clerkUserId || !accountId) {
      return res.status(400).json({ error: "Missing clerkUserId or accountId" });
    }

    const user = await db.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

   

    const account = await db.account.findUnique({
      where: {
        id: accountId,
        userId: user.id,
      },
    });

    if(!account){
        return res.status(404).json({
            error:"Accoutn not found. "
        });
    }


    const investments = await db.transaction.findMany ({
        where:{
            userId : user.id ,
            accountId ,
            type : "INVESTMENTS",
        },


        orderBy : {
            date: "desc",
        }
    })


     res.status(200).json({ success: true, data: investments });
  } catch (err) {
    console.error("Error in createTransaction:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};


const askAIInvesments = async (req, res) => {
  try {
    const { clerkUserId, accountId } = req.body;

    if (!clerkUserId || !accountId) {
      return res.status(400).json({ error: "Missing clerkUserId or accountId" });
    }

    const user = await db.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const account = await db.account.findUnique({
      where: {
        id: accountId,
        userId: user.id,
      },
    });

    if (!account) {
      return res.status(404).json({ error: "Account not found." });
    }

    const investments = await db.transaction.findMany({
      where: {
        userId: user.id,
        accountId,
        type: "INVESTMENTS",
      },
      orderBy: {
        date: "desc",
      },
    });

    const model = genAi.getGenerativeModel({ model: "gemini-1.5-flash" });

 const investmentText = investments.map(inv => {
  const amount = `₹${inv.amount}`;
  const date = inv.date.toDateString();
  const category = inv.category || "Unspecified Investment";
  const recurring = inv.isRecurring ? "Recurring" : "One-time";
   const description = inv.description || "No additional notes";
 return `- ${amount} on ${date} in ${category} (${recurring}) → ${description}`;
}).join('\n');



   const prompt = `
You are an expert financial advisor AI integrated in a FinTracker app. The user has made the following investments:

${investmentText}

Each investment includes amount, date, category (e.g., mutual fund, stock, etc.), recurrence (Recurring/One-time), and a description provided by the user.

Your task is to:
1. Analyze the user’s past investment decisions in detail.
2. Compare their choices with the latest **market data**, including:
   - Mutual fund returns (large-cap, mid-cap, ELSS)
   - Stock and ETF performance
   - Options trading trends
   - Government and fixed-income instruments
3. Consider **risk profiles** of the chosen instruments (volatility, exposure, diversification).
4. Factor in **recent political, economic, or global news** that may influence investments (e.g., interest rate hikes, budget changes, elections, global trade issues).
5. Identify any inefficient or suboptimal investment patterns based on the above.
6. Recommend smarter strategies the user could have used or can switch to now.
7. Compare the strategies with other strategies in the same category 

Respond in a structured, friendly, and practical format:

1. **Summary Insight** – What the user has done so far and what's potentially lacking or risky.
2. **Alternative Strategy** – Suggest better fund allocation, diversification, or switching to safer/higher-return assets.
3. **Expected Benefit** – Clearly state what improvement they could have seen (better ROI, lower risk, more liquidity, etc.).
4. **Relevant Market Data & Events** – Support your suggestions with recent market performance metrics and key news or events influencing those suggestions.

Avoid financial jargon. Prioritize clarity, personalization, and usefulness.

Provide output as if you are talking to an investor who understands basics but wants smart, current, and actionable advice.
`;


    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    res.status(200).json({ suggestions: text });

  } catch (err) {
    console.error("Error in askAIInvesments:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};



const chatAI = async (req, res) => {
  try {
    const { clerkUserId, accountId, question, history = [] } = req.body;


    if (!clerkUserId || !accountId) {
      return res.status(400).json({ error: "Missing clerkUserId or accountId" });
    }

    const user = await db.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const account = await db.account.findUnique({
      where: {
        id: accountId,
        userId: user.id,
      },
    });

    const formattedHistory = history
  .map((msg) => `${msg.type === 'user' ? 'User' : 'AI'}: ${msg.text}`)
  .join('\n')


    if (!account) {
      return res.status(404).json({ error: "Account not found." });
    }

    const investments = await db.transaction.findMany({
      where: {
        userId: user.id,
        accountId,
        type: "INVESTMENTS",
      },
      orderBy: {
        date: "desc",
      },
    });

    const model = genAi.getGenerativeModel({ model: "gemini-1.5-flash" });

  const investmentText = investments.map(inv => {
    const amount = `₹${inv.amount}`;
    const date = inv.date.toDateString();
    const category = inv.category || "Unspecified Investment";
    const recurring = inv.isRecurring ? "Recurring" : "One-time";
    const description = inv.description || "No additional notes";
  return `- ${amount} on ${date} in ${category} (${recurring}) → ${description}`;
  }).join('\n');



   const prompt = `
   chat context ${formattedHistory}
You are an expert financial advisor AI integrated in a FinTracker app. The user has made the following investments:

${investmentText}.


Each investment includes amount, date, category (e.g., mutual fund, stock, etc.), recurrence (Recurring/One-time), and a description provided by the user.

Your context is :
1. Analyze the user’s past investment decisions in detail.
2. Compare their choices with the latest **market data**, including:
   - Mutual fund returns (large-cap, mid-cap, ELSS)
   - Stock and ETF performance
   - Options trading trends
   - Government and fixed-income instruments
3. Consider **risk profiles** of the chosen instruments (volatility, exposure, diversification).
4. Factor in **recent political, economic, or global news** that may influence investments (e.g., interest rate hikes, budget changes, elections, global trade issues).
5. Identify any inefficient or suboptimal investment patterns based on the above.
6. Recommend smarter strategies the user could have used or can switch to now.
7. Compare the strategies with other strategies in the same category 

Your main task is to :
1. Answer the user as user asked the following question: "${question}"



Answer clearly and concisely. Avoid financial jargon.
Tailor the answer assuming the user is familiar with basic finance and wants practical insights.

Be helpful, friendly, and smart.
Try to be short and useful.
Provide output as if you are talking to an investor who understands basics but wants smart, current, and actionable advice also give disclamer that ai is not responsible for your investments.
`;


    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    res.status(200).json({ suggestions: text });

  } catch (err) {
    console.error("Error in askAIInvesments:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};







module.exports = {
  getInvestments,
  askAIInvesments,
  chatAI

};
