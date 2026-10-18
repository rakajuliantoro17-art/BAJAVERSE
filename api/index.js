// Vercel entrypoint: exposes the Express app as a serverless function.
// vercel.json rewrites /api/* to this file.
module.exports = require("../src/app");
