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
    console.log("--------------------------------");

    if (scene.levelUp) {
        console.log(
            `\n*** NAIK LEVEL ${scene.levelUp.from} -> ${scene.levelUp.to} ***`
        );
    }

    scene.lines.forEach((line) => console.log(`\n${line}`));

    if (scene.status) {

        const status = scene.status;

        console.log("\n[ JENDELA STATUS ]");
        console.log(`Nama  : ${status.name}`);
        console.log(`Role  : ${status.role}`);
        console.log(`Level : ${status.level}`);

        status.skills.forEach((skill) => {
            console.log(
                `Berkah Awal: ${skill.name}${skill.type ? ` (${skill.type})` : ""}`
            );
            console.log(`  ${skill.description}`);
        });

        if (status.party && status.party.length) {
            console.log(
                `Party: ${status.party.map((m) => m.name).join(", ")}`
            );
        }

    }

}


async function main() {

    let game = gameEngine.begin();

    while (true) {

        const { scene, state } = game;

        printScene(scene);

        try {

            if (scene.kind === "input_name") {

                const name = await ask(`\n${scene.prompt}: `);

                game = gameEngine.submitName(state, name);

            } else if (scene.kind === "choose_role") {

                console.log("");

                scene.roles.forEach((role, index) => {
                    console.log(`${index + 1}. ${role.name} - ${role.description}`);
                });

                const answer = await ask("\nPilih role: ");
                const role = scene.roles[Number(answer) - 1];

                game = gameEngine.submitRole(state, role && role.id);

            } else {

                if (scene.choices.length === 0) {
                    console.log("\n(Cerita ini belum berlanjut.)");
                    break;
                }

                console.log("");

                scene.choices.forEach((choice, index) => {
                    console.log(`${index + 1}. ${choice.text}`);
                });

                const answer = await ask("\nPilih tindakan: ");

                game = gameEngine.choose(state, Number(answer) - 1);

            }

        } catch (error) {

            // Bad input: say why and show the same scene again.
            console.log(error.message);

        }

    }

    rl.close();

}


main();
