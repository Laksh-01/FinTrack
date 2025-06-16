const db = require("../lib/prisma");

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






module.exports = {
  getInvestments

};
