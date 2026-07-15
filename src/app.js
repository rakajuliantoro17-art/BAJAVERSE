const express = require("express");
const GameEngine = require("./engine/GameEngine");
const EngineManager = require("./engine/EngineManager");

const app = express();
const PORT = 3000;


const engineManager = new EngineManager();

const gameEngine = new GameEngine();

gameEngine.setEngineManager(engineManager);


engineManager.initialize();

gameEngine.initialize();
gameEngine.load();
gameEngine.start();


app.get("/", (req, res) => {
    res.send("BAJAVERSE Engine Running");
});


app.listen(PORT, () => {
    console.log("======================================");
    console.log(`Server : http://localhost:${PORT}`);
    console.log("Status : ONLINE");
    console.log("======================================");
});