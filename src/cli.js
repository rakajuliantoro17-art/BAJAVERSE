// Terminal version of the game. Run with: npm run cli
// It drives the same stateless GameEngine as the web API.

const readline = require("readline");

const GameEngine = require("./engine/GameEngine");
const EngineManager = require("./engine/EngineManager");

const engineManager = new EngineManager();
engineManager.initialize();

const gameEngine = new GameEngine();
gameEngine.setEngineManager(engineManager);
gameEngine.initialize();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


function ask(prompt) {

    return new Promise((resolve) => rl.question(prompt, resolve));

}


function printScene(scene) {

    console.log("\n--------------------------------");
    console.log(scene.title);
    console.log(scene.description);
    console.log("--------------------------------");

    scene.choices.forEach((choice, index) => {
        console.log(`${index + 1}. ${choice.text}`);
    });

}


async function main() {

    const name = await ask("\nMasukkan nama karakter: ");

    const roles = gameEngine.getRoles();

    console.log("\nPilih Role:");

    roles.forEach((role, index) => {
        console.log(`${index + 1}. ${role.name} - ${role.description}`);
    });

    let game = null;

    while (!game) {

        const answer = await ask("\nPilih role: ");
        const role = roles[Number(answer) - 1];

        try {
            game = gameEngine.start(name, role && role.id);
        } catch (error) {
            console.log(error.message);
        }

    }

    console.log("\nMemasuki dunia BAJAVERSE...");

    while (true) {

        printScene(game.scene);

        if (game.scene.choices.length === 0) {
            console.log("\n(Cerita ini belum berlanjut.)");
            break;
        }

        const answer = await ask("\nPilih tindakan: ");

        try {
            game = gameEngine.choose(game.state, Number(answer) - 1);
        } catch (error) {
            console.log(error.message);
        }

    }

    rl.close();

}


main();
