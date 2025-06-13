const express = require("express");
const router = express.Router();
const {  syncUser } = require("../controllers/userAuth");

module.exports = () => {
    router.post('/sync', syncUser);  
    return router;
};
