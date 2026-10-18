const express = require("express");
const path = require("path");

const GameEngine = require("./engine/GameEngine");
const EngineManager = require("./engine/EngineManager");

const { GameError } = GameEngine;

const engineManager = new EngineManager();
engineManager.initialize();

const gameEngine = new GameEngine();
gameEngine.setEngineManager(engineManager);
gameEngine.initialize();


const app = express();

app.use(express.json({ limit: "10kb" }));

// Locally this serves the web UI. On Vercel, public/ is served by the CDN.
app.use(express.static(path.join(__dirname, "..", "public")));


app.get("/api/health", (req, res) => {

    res.json({ status: "ok", name: "BAJAVERSE" });

});


app.get("/api/roles", (req, res) => {

    res.json({ roles: gameEngine.getRoles() });

});


app.post("/api/begin", (req, res) => {

    res.json(gameEngine.begin());

});


app.post("/api/choose", (req, res) => {

    const { state, choice } = req.body || {};

    res.json(gameEngine.choose(state, choice));

});


app.post("/api/name", (req, res) => {

    const { state, name } = req.body || {};

    res.json(gameEngine.submitName(state, name));

});


app.post("/api/role", (req, res) => {

    const { state, roleId } = req.body || {};

    res.json(gameEngine.submitRole(state, roleId));

});


app.post("/api/resume", (req, res) => {

    const { state } = req.body || {};

    res.json(gameEngine.resume(state));

});


app.use("/api", (req, res) => {

    res.status(404).json({ error: "Endpoint tidak ditemukan" });

});


app.use((err, req, res, next) => {

    if (err instanceof GameError) {

        return res.status(err.status).json({ error: err.message });

    }

    // Malformed JSON body and similar client errors from express.json
    if (err.status && err.status >= 400 && err.status < 500) {

        return res.status(err.status).json({ error: "Request tidak valid" });

    }

    console.error("[App] Unhandled error:", err);

    res.status(500).json({ error: "Terjadi kesalahan pada server" });

});


// Run a long-lived server only when started directly (npm start / npm run dev).
// On Vercel the app is imported by api/index.js and must not call listen().
if (require.main === module) {

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
        console.log("======================================");
        console.log(`Server : http://localhost:${PORT}`);
        console.log("Status : ONLINE");
        console.log("======================================");
    });

}


module.exports = app;
