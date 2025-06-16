const express = require("express");
const { getInvestments, askAIInvesments } = require("../controllers/investments");
const router = express.Router();


module.exports = () => {
    router.post('/investments/get-data',  getInvestments);
    router.post('/investments/askAi' , askAIInvesments);
    return router;
}