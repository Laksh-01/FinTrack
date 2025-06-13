const express = require('express');
const prisma = require('./lib/prisma');
const { inngest } = require("./src/inngest/index.js");

const inngestHandler = require('./routes/inngest.js');
const dashboardRoutes = require('../backend/routes/dashboard');
const cors = require('cors');
const postgres = require('postgres');
const userAuth = require('./routes/userAuth');
const account = require('./routes/account');
const transactions = require('./routes/transactions');
const budget = require('./routes/budget');
const transactionHandler  = require('./routes/createtransaction.js');


// require('./src/inngest/registerFunction.js'); // ✅ This handles function registration

const app = express();

const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString);

app.use(cors({
  origin: 'http://localhost:5173'
}));

app.use(express.json());

app.use('/api', dashboardRoutes());
app.use('/api', userAuth());
app.use('/api', account());
app.use('/api', transactions());
app.use('/api', budget());
app.use('/api', transactionHandler());

app.use('/api/inngest', inngestHandler); // POST to this sends events

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
