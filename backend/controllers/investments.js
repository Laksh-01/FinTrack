const db = require("../lib/prisma");


const {GoogleGenerativeAI} = require("@google/generative-ai");

const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


const getInvestments = async (req, res) => {
  try {
    const {  accountId  } = req.body;

    if (!accountId) {
      return res.status(400).json({ error: "Missing clerkUserId or accountId" });
    }
  

    const account = await db.account.findUnique({
      where: {
        id: accountId,
      }
    });

    if(!account){
        return res.status(404).json({
            error:"Accoutn not found. "
        });
    }


    const investments = await db.transaction.findMany ({
        where:{
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




const PredictReturns = async (req, res) => {
  try {
    const { accountId } = req.body;


    if (!accountId) {
      return res.status(400).json({ error: "Missing clerkUserId or accountId" });
    }

  

    const account = await db.account.findUnique({
      where: {
        id: accountId,
      },
    });


    if (!account) {
      return res.status(404).json({ error: "Account not found." });
    }

    const investments = await db.transaction.findMany({
      where: {
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
You are a highly intelligent financial advisor AI integrated within a FinTracker app.

The user has made the following investments:
${investmentText}

Each investment includes:
- amount
- date
- category (e.g., mutual fund, stock, ETF, government bond)
- recurrence (Recurring/One-time)
- interest rate (if applicable)
- a user-provided description

Your tasks:

1. Analyze the user's past investment decisions based on this data.
2. Using the latest available market insights (assumed accessible to you), compare the user's choices with:
   - Average returns in mutual fund categories (large-cap, mid-cap, ELSS)
   - Stock and ETF performance benchmarks (NIFTY, SENSEX, Nasdaq, etc.)
   - Government and fixed-income options (PPF, FD, RD, Bonds)
   - Current trends in options trading and market volatility
3. Predict the **future value of the portfolio** for time periods of:
   - 1 year
   - 2 years
   - 3 years
   - 4 years
   - 5 years
   - 6 years
   - 7 years
   - 8 years
   - 9 years
   - 10 years
4. Also add projected **Inflation rate** for each year.

**Calculation rules**:
- Use **compound annual growth rate (CAGR)** for one-time investments.
- Use **monthly compounding** for recurring investments (SIPs, RDs).
- Apply different growth rates based on investment type:
  - Mutual Funds: 12% annually
  - Stocks: 14% annually
  - Government Bonds/FDs: 6.5% annually
  - ELSS or debt funds: slightly lower than 12%
- Always apply compounding accurately year-over-year.

**Output format:**

For each year (1 to 10), return in exactly this format:

Year: X  
Projected Portfolio Value: ₹[calculated_value]  
Projected Gain/Loss: [+/-][percentage]%  
Summary: [Short 1-line explanation]  
Inflation Projected: [percentage]%

Only give the structured output, no intro or conclusion. Be precise, concise, and compound-focused.
`;



    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    res.status(200).json({data: text });

  } catch (err) {
    console.error("Error in askAIInvesments:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};





const calculateInvestValue = async (req, res) => {
  try {
    const { accountId } = req.body;
    if (!accountId) return res.status(400).json({ error: "Missing accountId" });

    const investments = await db.transaction.findMany({
      where: { accountId, type: "INVESTMENTS" },
      orderBy: { date: "asc" },
    });

    const yearlyInvestment = Array.from({ length: 10 }, (_, i) => ({
      year: i + 1,
      invested: 0,
    }));

    const currentYear = new Date().getFullYear();

    investments.forEach((inv) => {
      const amount = Number(inv.amount);
      const startYear = new Date(inv.date).getFullYear();
      const interval = inv.recurringInterval || "MONTHLY";
      const isRecurring = inv.isRecurring;

      let freqPerYear = 0;
      if (isRecurring) {
        if (interval === "MONTHLY") freqPerYear = 12;
        else if (interval === "QUARTERLY") freqPerYear = 4;
        else if (interval === "HALF_YEARLY") freqPerYear = 2;
        else if (interval === "YEARLY") freqPerYear = 1;
      }

      for (let i = 0; i < 10; i++) {
        const targetYear = currentYear + i;

        if (targetYear < startYear) continue;

        const yearsElapsed = targetYear - startYear + 1;

        if (isRecurring) {
          yearlyInvestment[i].invested += amount * freqPerYear * yearsElapsed;
        } else {
          if (targetYear === startYear) {
            yearlyInvestment[i].invested += amount;
          }
        }
      }
    });

    res.status(200).json({ data: yearlyInvestment });
  } catch (err) {
    console.error("Error in calculateInvestValue:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};








module.exports = {
  getInvestments,
  askAIInvesments,
  chatAI,
  PredictReturns,
  calculateInvestValue

};
