const express = require("express");
const router = express.Router();
const { updateBudget, getCurrentBudget } = require("../controllers/budget");


module.exports = () => {
    router.post('/update-budget',  updateBudget);
    router.post('/get-budget', getCurrentBudget)
    return router;
}