const Player = require("../models/Player");

const MAX_NAME_LENGTH = 30;

class GameError extends Error {

    constructor(message, status = 400) {

        super(message);

        this.name = "GameError";
        this.status = status;

    }

}


/*
 * GameEngine is stateless: it never keeps a player in memory and never
 * reads from stdin. Every call receives the full game state and returns
 * the new state plus the scene to show. This is what lets it run on
 * serverless hosting (Vercel) where memory does not survive between
 * requests, and lets the same logic drive the web UI and the CLI.
 *
 * state = {
 *     player: { id, name, role, level, currentStoryboard },
 *     flags: { [key]: any }
 * }
 */
class GameEngine {

    constructor() {

        console.log("[GameEngine] Created");

        this.engineManager = null;

    }


    setEngineManager(engineManager) {

        this.engineManager = engineManager;

    }


    initialize() {

        console.log("[GameEngine] Initializing...");

    }


    getRoles() {

        return this.engineManager.roleEngine.getRoles();

    }


    start(name, roleId) {

        const cleanName =
            typeof name === "string" ? name.trim() : "";

        if (!cleanName) {

            throw new GameError("Nama karakter wajib diisi");

        }

        if (cleanName.length > MAX_NAME_LENGTH) {

            throw new GameError(
                `Nama karakter maksimal ${MAX_NAME_LENGTH} karakter`
            );

        }

        const role =
            this.engineManager.roleEngine.getRole(roleId);

        if (!role) {

            throw new GameError("Role tidak ditemukan");

        }

        const player = new Player(cleanName, role.name);

        const state = {

            player: {
                id: player.id,
                name: player.name,
                role: player.role,
                level: player.level,
                currentStoryboard: player.currentStoryboard
            },

            flags: {}

        };

        return {
            state,
            scene: this.getScene(state.player.currentStoryboard)
        };

    }


    choose(state, choiceIndex) {

        this.validateState(state);

        const storyboard =
            this.engineManager.storyboardEngine.getStoryboard(
                state.player.currentStoryboard
            );

        if (!storyboard) {

            throw new GameError("Storyboard tidak ditemukan");

        }

        if (!Number.isInteger(choiceIndex)) {

            throw new GameError("Pilihan tidak valid");

        }

        const target =
            this.engineManager.choiceEngine.choose(
                storyboard,
                choiceIndex
            );

        if (!target) {

            throw new GameError("Pilihan tidak valid");

        }

        const scene = this.getScene(target);

        const nextState = {

            player: {
                ...state.player,
                currentStoryboard: target
            },

            flags: { ...state.flags }

        };

        return { state: nextState, scene };

    }


    resume(state) {

        this.validateState(state);

        return {
            state,
            scene: this.getScene(state.player.currentStoryboard)
        };

    }


    getScene(id) {

        const storyboard =
            this.engineManager.storyboardEngine.getStoryboard(id);

        if (!storyboard) {

            throw new GameError(
                `Storyboard ${id} tidak ditemukan`,
                500
            );

        }

        const characters = [];

        for (const characterId of storyboard.characters || []) {

            const character =
                this.engineManager.characterEngine.getCharacter(
                    characterId
                );

            if (!character) {

                console.warn(
                    `[GameEngine] ${storyboard.id}: unknown character "${characterId}"`
                );

                continue;

            }

            characters.push({
                id: character.id,
                name: character.name,
                title: character.title || null,
                image: character.image || null
            });

        }

        // Only the text of each choice leaves the engine; targets stay server-side.
        return {

            id: storyboard.id,
            title: storyboard.title,
            description: storyboard.description,

            background: storyboard.background || null,
            characters,

            choices: storyboard.choices.map((choice) => ({
                text: choice.text
            }))

        };

    }


    validateState(state) {

        const valid =
            state &&
            typeof state === "object" &&
            state.player &&
            typeof state.player === "object" &&
            typeof state.player.name === "string" &&
            typeof state.player.currentStoryboard === "string" &&
            state.flags &&
            typeof state.flags === "object" &&
            !Array.isArray(state.flags);

        if (!valid) {

            throw new GameError("State permainan tidak valid");

        }

    }

}


module.exports = GameEngine;
module.exports.GameError = GameError;
