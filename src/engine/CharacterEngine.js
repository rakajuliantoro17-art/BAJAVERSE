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


    // A character may have one role or two (a dual-role companion).
    validate(hasRole) {

        const problems = [];

        for (const character of this.characters.values()) {

            const roles = character.roles || [];

            if (roles.length > 2) {

                problems.push(`${character.id}: at most 2 roles`);

            }

            for (const id of roles) {

                if (!hasRole(id)) {

                    problems.push(`${character.id}: unknown role "${id}"`);

                }

            }

        }

        return problems;

    }

}


module.exports = CharacterEngine;
