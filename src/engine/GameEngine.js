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
 *     player: { id, name, role, roleId, level, currentStoryboard },
 *     flags: { [key]: any }
 * }
 *
 * The prologue and the main story are the same storyboard graph. What the
 * player does in a scene depends on its `type` (see StoryboardEngine):
 *   story        -> choose(state, index)
 *   input_name   -> submitName(state, name)
 *   choose_role  -> submitRole(state, roleId)
 *
 * Text may use {name}, {role} and {roleIntro}; they are filled in here.
 * Scenes with ids starting "PR_" (prologue) or `"cinematic": true` are
 * shown as slow, line-by-line reveals; `"cinematic": false` turns it off.
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

        return this.engineManager.roleEngine.getRoles().map((role) => ({
            id: role.id,
            name: role.name,
            description: role.description
        }));

    }


    begin() {

        const player = new Player();

        const state = {

            player: {
                id: player.id,
                name: player.name,
                role: player.role,
                roleId: null,
                level: player.level,
                currentStoryboard: player.currentStoryboard
            },

            flags: {}

        };

        return { state, scene: this.getScene(state) };

    }


    choose(state, choiceIndex) {

        this.validateState(state);

        const storyboard = this.currentStoryboard(state);

        if (this.typeOf(storyboard) !== "story") {

            throw new GameError("Adegan ini tidak memakai pilihan");

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

        return this.moveTo(state, target);

    }


    submitName(state, name) {

        this.validateState(state);

        const storyboard = this.currentStoryboard(state);

        if (this.typeOf(storyboard) !== "input_name") {

            throw new GameError("Adegan ini tidak meminta nama");

        }

        return this.moveTo(state, storyboard.next, {
            name: this.cleanName(name)
        });

    }


    submitRole(state, roleId) {

        this.validateState(state);

        const storyboard = this.currentStoryboard(state);

        if (this.typeOf(storyboard) !== "choose_role") {

            throw new GameError("Adegan ini tidak meminta role");

        }

        const role = this.engineManager.roleEngine.getRole(roleId);

        if (!role) {

            throw new GameError("Role tidak ditemukan");

        }

        return this.moveTo(state, storyboard.next, {
            role: role.name,
            roleId: role.id
        });

    }


    resume(state) {

        this.validateState(state);

        return { state, scene: this.getScene(state) };

    }


    moveTo(state, target, playerChanges = {}) {

        if (!this.engineManager.storyboardEngine.getStoryboard(target)) {

            throw new GameError(`Storyboard ${target} tidak ditemukan`, 500);

        }

        const nextState = {

            player: {
                ...state.player,
                ...playerChanges,
                currentStoryboard: target
            },

            flags: { ...state.flags }

        };

        return { state: nextState, scene: this.getScene(nextState) };

    }


    currentStoryboard(state) {

        const storyboard =
            this.engineManager.storyboardEngine.getStoryboard(
                state.player.currentStoryboard
            );

        if (!storyboard) {

            throw new GameError("Storyboard tidak ditemukan");

        }

        return storyboard;

    }


    typeOf(storyboard) {

        return storyboard.type || "story";

    }


    cleanName(name) {

        const clean =
            typeof name === "string"
                ? name.replace(/[\u0000-\u001f\u007f]/g, " ")
                      .replace(/\s+/g, " ")
                      .trim()
                : "";

        if (!clean) {

            throw new GameError("Nama karakter wajib diisi");

        }

        if (clean.length > MAX_NAME_LENGTH) {

            throw new GameError(
                `Nama karakter maksimal ${MAX_NAME_LENGTH} karakter`
            );

        }

        return clean;

    }


    // Fills {name}, {role}, {roleIntro}. One pass only, so a player name
    // that happens to contain braces is never treated as a template.
    fill(template, player) {

        if (typeof template !== "string") {

            return template;

        }

        const role = this.engineManager.roleEngine.getRole(player.roleId);

        const values = {
            name: player.name || "Pendatang",
            role: player.role || "Pengembara",
            roleIntro: (role && role.intro) || ""
        };

        return template.replace(/\{(\w+)\}/g, (match, key) =>
            Object.prototype.hasOwnProperty.call(values, key)
                ? values[key]
                : match
        );

    }


    getScene(state) {

        const storyboard = this.currentStoryboard(state);

        const type = this.typeOf(storyboard);

        const fill = (text) => this.fill(text, state.player);

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

        const cinematic =
            typeof storyboard.cinematic === "boolean"
                ? storyboard.cinematic
                : storyboard.id.startsWith("PR_");

        const scene = {

            kind: type,
            id: storyboard.id,
            title: fill(storyboard.title),

            lines: fill(storyboard.description || "")
                .split(/\n\s*\n/)
                .map((line) => line.trim())
                .filter(Boolean),

            mood: storyboard.mood || "world",
            cinematic,

            background: storyboard.background || null,
            characters

        };

        if (type === "story") {

            // Only the text of each choice leaves the engine; targets stay server-side.
            scene.choices = (storyboard.choices || []).map((choice) => ({
                text: fill(choice.text)
            }));

        }

        if (type === "input_name") {

            scene.prompt = storyboard.prompt || "Namamu";
            scene.placeholder = storyboard.placeholder || "Tuliskan namamu";
            scene.maxLength = MAX_NAME_LENGTH;
            scene.button = storyboard.button || "Ukirkan namaku";

        }

        if (type === "choose_role") {

            scene.roles = this.getRoles();
            scene.button = storyboard.button || "Tempuh jalan ini";

        }

        return scene;

    }


    validateState(state) {

        const player = state && state.player;

        const valid =
            state &&
            typeof state === "object" &&
            player &&
            typeof player === "object" &&
            (player.name === null || typeof player.name === "string") &&
            typeof player.currentStoryboard === "string" &&
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
