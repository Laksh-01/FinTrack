// controllers/clerkWebhookController.js

const db = require('../lib/prisma');


const syncUser = async (req, res) => {
  const {clerkUserId , email , name , imageUrl } = req.body ;
  console.log(req.body);

  if(!clerkUserId || !email){
    return res.status(400).json({
      error : "ClerkUserId and email are required"
    });
  }

  if(!db){
    console.log("db issues");
  }



  try{
    const user = await db.user.upsert({
      where : {clerkUserId},
      create: {        
        clerkUserId:clerkUserId,
        email:email,
        name : name || '',
        imageUrl : imageUrl || '',
  
      } ,
      update : {
        email:email,
        name : name || '',
        imageUrl : imageUrl || '',
      }
    })

    res.status(200).json({ success: true, user: user });
  }catch(error){
    console.log(error);
  }



};





module.exports = {
  syncUser

};