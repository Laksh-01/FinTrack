const express = require("express");
const { getInvestments, askAIInvesments, chatAI, PredictReturns, calculateInvestValue } = require("../controllers/investments");
const router = express.Router();


module.exports = () => {
    router.post('/investments/get-data',  getInvestments);
    router.post('/investments/askAi' , askAIInvesments);
    router.post('/investments/chat' , chatAI);
    router.post('/investments/predict' , PredictReturns);
    router.post('/investments/calculate-total' , calculateInvestValue);
    return router;
}