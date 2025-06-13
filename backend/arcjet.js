const { shield, tokenBucket } = require("@arcjet/node");

const aj = shield({
  key: process.env.ARCJET_KEY,
  characteristics: ["userId"],
  rules: [
    tokenBucket({
      mode: "LIVE",
      refillRate: 10,     // 10 requests per hour
      interval: 3600,
      capacity: 10,
    }),
  ],
});

module.exports = aj;
