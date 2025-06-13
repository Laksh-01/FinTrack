// routes/sendEvent.js
const express = require("express");
const router = express.Router();
const { inngest } = require("../src/inngest/index");
const { helloWorld } = require("../controllers/inngest");

router.post("/", async (req, res) => {
  try {
    const name = req.body?.name || "Guest";

    // Send event to Inngest
    await inngest.send({
      name: "test/hello.world",
      data: { name },
    });

    // Manually call your function (simulate function trigger)
    const result = await helloWorld.fn({ event: { data: { name } }, step: { sleep: () => {} } });

    res.status(200).json({ status: "Event processed", result });
  } catch (err) {
    console.error("Inngest manual trigger error:", err);
    res.status(500).json({ error: "Function failed" });
  }
});

module.exports = router;
