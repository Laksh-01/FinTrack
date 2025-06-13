// registerFunctions.js
const { inngest } = require("./index");
const { helloWorld } = require("../../controllers/inngest");

inngest.register([helloWorld]); // 👈 Proper registration here
