// Story files are loaded in this order. Add new chapters here.
const sources = [
    require("../data/storyboards/prologue.json"),
    require("../data/storyboards/berkah.json"),
    require("../data/storyboards/perjanjian.json"),
    require("../data/storyboards/main.json")
];

// A scene's type decides what the player does in it:
//   story        pick one of `choices` (default)
//   input_name   type a character name, then continue to `next`
//   choose_role  pick a role, then continue to `next`
const SCENE_TYPES = ["story", "input_name", "choose_role"];

class StoryboardEngine {

    constructor() {
        this.storyboards = new Map();

        console.log("[StoryboardEngine] Created");
    }

    initialize() {
        console.log("[StoryboardEngine] Initializing...");

        for (const list of sources) {

            for (const storyboard of list) {

                if (this.storyboards.has(storyboard.id)) {
                    console.warn(`[StoryboardEngine] Duplicate id ${storyboard.id}`);
                }

                this.storyboards.set(storyboard.id, storyboard);

            }

        }

        console.log(`[StoryboardEngine] Loaded ${this.storyboards.size} storyboard(s)`);

        this.validate().forEach((problem) => {
            console.warn(`[StoryboardEngine] ${problem}`);
        });
    }

    getStoryboard(id) {
        return this.storyboards.get(id);
    }

    // Returns a list of problems in the story graph (empty when it is sound).
    validate() {
        const problems = [];

        for (const storyboard of this.storyboards.values()) {

            const type = storyboard.type || "story";

            if (!SCENE_TYPES.includes(type)) {
                problems.push(`${storyboard.id}: unknown type "${type}"`);
                continue;
            }

            if (type === "story") {

                for (const choice of storyboard.choices || []) {

                    if (!this.storyboards.has(choice.target)) {
                        problems.push(
                            `${storyboard.id}: choice "${choice.text}" targets missing scene ${choice.target}`
                        );
                    }

                    for (const key of ["ifFlags", "unlessFlags"]) {
                        if (choice[key] !== undefined && !Array.isArray(choice[key])) {
                            problems.push(
                                `${storyboard.id}: choice "${choice.text}" ${key} must be a list`
                            );
                        }
                    }

                }

            } else if (!this.storyboards.has(storyboard.next)) {

                problems.push(
                    `${storyboard.id}: ${type} needs a valid "next" (got ${storyboard.next})`
                );

            }

        }

        return problems;
    }

}

module.exports = StoryboardEngine;
