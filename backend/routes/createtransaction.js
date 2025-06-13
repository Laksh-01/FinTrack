const express = require("express");
const { createTransaction  ,scanReceipt, getTransaction, updateTransaction} = require("../controllers/createtransaction");

const router = express.Router();
const upload = require("../middleware/upload");

module.exports = () => {
    router.post('/transaction/create-transaction',  createTransaction);
    
    router.post('/transaction/scan-receipt', upload.single("file") ,  scanReceipt);

    router.post('/transaction/get-transaction' , getTransaction);
     router.post('/transaction/update-transaction' , updateTransaction);

  
    return router;
};