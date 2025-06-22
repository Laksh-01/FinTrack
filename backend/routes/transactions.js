const express = require("express");
const { deleteBulkTransactions, deleteTransaction } = require("../controllers/transactions");

const router = express.Router();
module.exports = () => {
    router.post('/account/deleteBulkTransactions',  deleteBulkTransactions);
    router.post('/account/deleteTransaction',  deleteTransaction);
    return router;
};