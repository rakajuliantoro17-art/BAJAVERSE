const Player = require("../models/Player");

const MAX_NAME_LENGTH = 30;
const MAX_LEVEL = 10;
const MAX_PARTY = 10;

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
                skills: [...player.skills],
                party: [],
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

        // The index the player sees refers to the choices visible for their
        // flags, not to the raw list in the data file.
        const visible = this.visibleChoices(
            storyboard,
            state.flags,
            state.player
        );

        const target =
            this.engineManager.choiceEngine.choose(
                { choices: visible },
                choiceIndex
            );

        if (!target) {

            throw new GameError("Pilihan tidak valid");

        }

        const picked = visible[choiceIndex];

        return this.moveTo(
            state,
            target,
            this.choiceEffects(state, picked),
            picked.setFlags
        );

    }


    // Changes a choice makes to the player besides flags:
    //   addSkill  a skill id, or "@second" for the role's second skill
    //   addParty  a character id that joins the party (at most MAX_PARTY)
    //   setLevel  raise the player to this level (never lowers, capped at MAX_LEVEL)
    choiceEffects(state, choice) {

        const changes = {};

        if (Number.isInteger(choice.setLevel)) {

            const current = state.player.level || 1;
            const target = Math.min(MAX_LEVEL, choice.setLevel);

            if (target > current) {

                changes.level = target;

            }

        }

        if (choice.addSkill) {

            const role = this.engineManager.roleEngine.getRole(
                state.player.roleId
            );

            const id =
                choice.addSkill === "@second"
                    ? role && role.secondSkill
                    : choice.addSkill;

            const skills = state.player.skills || [];

            if (id && !skills.includes(id)) {

                changes.skills = [...skills, id];

            }

        }

        if (choice.addParty) {

            const party = state.player.party || [];

            if (party.length >= MAX_PARTY) {

                console.warn(
                    `[GameEngine] Party is full (${MAX_PARTY}); "${choice.addParty}" was not added`
                );

            } else if (!party.includes(choice.addParty)) {

                changes.party = [...party, choice.addParty];

            }

        }

        return changes;

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

        // The role's starting skill ("berkah awal") is granted here.
        return this.moveTo(state, storyboard.next, {
            role: role.name,
            roleId: role.id,
            skills: role.startingSkill ? [role.startingSkill] : []
        });

    }


    resume(state) {

        this.validateState(state);

        return { state, scene: this.getScene(state) };

    }


    // flagChanges comes from the story data (a choice's `setFlags`).
    moveTo(state, target, playerChanges = {}, flagChanges = null) {

        if (!this.engineManager.storyboardEngine.getStoryboard(target)) {

            throw new GameError(`Storyboard ${target} tidak ditemukan`, 500);

        }

        const nextState = {

            player: {
                ...state.player,
                ...playerChanges,
                currentStoryboard: target
            },

            flags: { ...state.flags, ...(flagChanges || {}) }

        };

        const scene = this.getScene(nextState);

        // Tells the UI to celebrate; only set on the move that raised the level.
        const from = state.player.level || 1;
        const to = nextState.player.level || 1;

        if (to > from) {

            scene.levelUp = { from, to };

        }

        return { state: nextState, scene };

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

        const skill = this.engineManager.skillEngine.getSkill(
            (player.skills || [])[0]
        );

        const trials = (skill && skill.trials) || {};

        // The role's second skill, who teaches it, and how the player bonds
        // with each companion (all written per role in roles.json).
        const skill2 = role
            ? this.engineManager.skillEngine.getSkill(role.secondSkill)
            : null;

        const teacher = skill2
            ? this.engineManager.characterEngine.getCharacter(skill2.teacher)
            : null;

        const bonds = (role && role.bonds) || {};

        const values = {
            skill2: skill2 ? skill2.name : "keahlian baru",
            skill2Desc: skill2 ? skill2.description : "",
            skill2Learn: skill2 ? skill2.learn || "" : "",
            teacher: teacher ? teacher.name : "Seorang kawan",
            bondGandar: bonds.gandar || "",
            bondWulan: bonds.wulan || "",
            bondDarpa: bonds.darpa || "",
            name: player.name || "Pendatang",
            role: player.role || "Pengembara",
            roleIntro: (role && role.intro) || "",
            skill: skill ? skill.name : "berkahmu",
            skillDesc: skill ? skill.description : "",
            skillStatue: trials.statue || "",
            skillCrystal: trials.crystal || "",
            skillWater: trials.water || "",
            skillRescue: trials.rescue || ""
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
            scene.choices = this.visibleChoices(
                storyboard,
                state.flags,
                state.player
            ).map(
                (choice) => ({ text: fill(choice.text) })
            );

        }

        if (storyboard.showStatus) {

            scene.status = this.buildStatus(state.player);

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


    // A choice can be hidden until flags are set (`ifFlags`, all required)
    // or once they are set (`unlessFlags`, any one hides it). `ifRole` shows
    // it only to players whose role id is in the list.
    visibleChoices(storyboard, flags, player = {}) {

        return (storyboard.choices || []).filter((choice) => {

            const needs = choice.ifFlags || [];
            const blocks = choice.unlessFlags || [];
            const roles = choice.ifRole;

            return (
                needs.every((key) => Boolean(flags[key])) &&
                !blocks.some((key) => Boolean(flags[key])) &&
                (!roles || roles.includes(player.roleId))
            );

        });

    }


    // Data for the "Jendela Status" panel (scenes with `showStatus`).
    buildStatus(player) {

        const skills = (player.skills || [])
            .map((id) => this.engineManager.skillEngine.getSkill(id))
            .filter(Boolean)
            .map((skill, index) => ({
                id: skill.id,
                name: skill.name,
                type: skill.type || null,
                description: skill.description,
                label: index === 0 ? "Berkah Awal" : "Skill Baru"
            }));

        const party = (player.party || [])
            .map((id) => this.engineManager.characterEngine.getCharacter(id))
            .filter(Boolean)
            .map((member) => ({
                id: member.id,
                name: member.name,
                title: member.title || null,
                roles: (member.roles || [])
                    .map((id) => this.engineManager.roleEngine.getRole(id))
                    .filter(Boolean)
                    .map((role) => role.name)
            }));

        return {
            name: player.name || "???",
            role: player.role || "???",
            level: player.level || 1,
            skills,
            party,
            partyMax: MAX_PARTY
        };

    }


    validateState(state) {

        const player = state && state.player;

        const valid =
            state &&
            typeof state === "object" &&
            player &&
            typeof player === "object" &&
            (player.name === null || typeof player.name === "string") &&
            (player.skills === undefined ||
                (Array.isArray(player.skills) &&
                    player.skills.every((id) => typeof id === "string"))) &&
            (player.level === undefined ||
                (Number.isInteger(player.level) &&
                    player.level >= 1 &&
                    player.level <= MAX_LEVEL)) &&
            (player.party === undefined ||
                (Array.isArray(player.party) &&
                    player.party.length <= MAX_PARTY &&
                    player.party.every((id) => typeof id === "string"))) &&
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
