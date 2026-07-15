const readline = require("readline");

class GameEngine {

    constructor() {

        console.log("[GameEngine] Created");

        this.engineManager = null;

        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

    }


    setEngineManager(engineManager) {

        this.engineManager = engineManager;

    }


    initialize() {

        console.log("[GameEngine] Initializing...");

    }


    load() {

        console.log("[GameEngine] Loading data...");

    }


    start() {

        console.log("[GameEngine] Starting engine...");

        this.createCharacter();

    }


    createCharacter() {

        this.rl.question(
            "\nMasukkan nama karakter: ",
            (name) => {


                console.log("\nPilih Role:");

                const roles =
                    this.engineManager.roleEngine.getRoles();


                roles.forEach((role, index) => {

                    console.log(
                        `${index + 1}. ${role.name} - ${role.description}`
                    );

                });


                this.rl.question(
                    "\nPilih role: ",
                    (answer) => {


                        const roleIndex =
                            Number(answer) - 1;


                        const selectedRole =
                            roles[roleIndex];


                        if (!selectedRole) {

                            console.log("Role tidak ditemukan");

                            this.rl.close();

                            return;

                        }


                        this.engineManager.playerEngine.createPlayer(
                            name,
                            selectedRole.name
                        );


                        const player =
                            this.engineManager.playerEngine.getPlayer();
                            this.engineManager.worldEngine.setFlag(
    "met_guard",
    true
);

console.log(
    this.engineManager.worldEngine.getFlag("met_guard")
);


                        console.log("\n--------------------");
                        console.log("PLAYER CREATED");
                        console.log("--------------------");

                        console.log(player);


                        console.log(
                            "\nMemasuki dunia BAJAVERSE..."
                        );


                        this.playStoryboard(
                            player.currentStoryboard
                        );


                    }
                );


            }
        );

    }


    playStoryboard(id) {

        const storyboard =
            this.engineManager.storyboardEngine.getStoryboard(id);


        if (!storyboard) {

            console.log("Storyboard tidak ditemukan");

            return;

        }


        console.log("\n--------------------------------");
        console.log(storyboard.title);
        console.log(storyboard.description);
        console.log("--------------------------------");


        storyboard.choices.forEach((choice, index) => {

            console.log(
                `${index + 1}. ${choice.text}`
            );

        });


        this.rl.question(
            "\nPilih tindakan: ",
            (answer) => {


                const choiceIndex =
                    Number(answer) - 1;


                const nextStoryboard =
                    this.engineManager.choiceEngine.choose(
                        storyboard,
                        choiceIndex
                    );


                if (nextStoryboard) {

                    this.playStoryboard(nextStoryboard);

                }

            }
        );

    }

}


module.exports = GameEngine;