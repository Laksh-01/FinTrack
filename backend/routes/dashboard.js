const express = require("express");
const router = express.Router();
const { createAccount, getUserAccounts, updateDefaultAccount, getDashboardData } = require("../controllers/dashboard");

module.exports = () => {
  router.post('/create-account',  createAccount);
  router.post('/get-accounts', getUserAccounts);
  router.post('/update-default-accounts', updateDefaultAccount);
  router.post('/get-data', getDashboardData);

  return router;
};
