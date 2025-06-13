// controllers/inngest.js
const { inngest } = require('../src/inngest/index');

const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    console.log("Function triggered with name:", event.data.name);
    return { message: `Hello ${event.data.name}` };
  }
);

module.exports = { helloWorld };
