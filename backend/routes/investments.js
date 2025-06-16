const express = require("express");
const { getInvestments } = require("../controllers/investments");
const router = express.Router();


module.exports = () => {
    router.post('/investments/get-data',  getInvestments);
    return router;
}