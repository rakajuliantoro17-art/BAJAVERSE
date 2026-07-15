const Player = require("../models/Player");


class PlayerEngine {

    constructor() {

        this.player = null;

        console.log("[PlayerEngine] Created");

    }


    createPlayer(name, role) {

        this.player = new Player(name, role);

        console.log(
            `[PlayerEngine] Player created: ${this.player.name}`
        );

    }


    getPlayer() {

        return this.player;

    }

}


module.exports = PlayerEngine;