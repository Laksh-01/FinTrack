const express = require('express');
const { getAccountWithTransactions  , getAccountWithTransactionsAll} = require('../controllers/account');
const { seedTransactions } = require('../controllers/dataFeeding');
const router = express.Router();


module.exports = () => {
    router.post('/get-accounts-with-Transaction' , getAccountWithTransactions);
    router.post('/get-accounts-with-Transaction-all' , getAccountWithTransactionsAll);
    router.get('/seed' , seedTransactions) 
    return router;
}