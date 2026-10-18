const characters = require("../data/characters/characters.json");


class CharacterEngine {

    constructor() {

        this.characters = new Map();

        console.log("[CharacterEngine] Created");

    }


    initialize() {

        console.log("[CharacterEngine] Initializing...");

        for (const character of characters) {

            this.characters.set(character.id, character);

        }

        console.log(
            `[CharacterEngine] Loaded ${this.characters.size} character(s)`
        );

    }


    getCharacter(id) {

        return this.characters.get(id);

    }

}


module.exports = CharacterEngine;
