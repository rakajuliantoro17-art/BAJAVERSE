const storyboards = require("../data/storyboards/main.json");

class StoryboardEngine {

    constructor() {
        this.storyboards = new Map();

        console.log("[StoryboardEngine] Created");
    }

    initialize() {
        console.log("[StoryboardEngine] Initializing...");

        for (const storyboard of storyboards) {
            this.storyboards.set(storyboard.id, storyboard);
        }

        console.log(`[StoryboardEngine] Loaded ${this.storyboards.size} storyboard(s)`);
    }

    getStoryboard(id) {
        return this.storyboards.get(id);
    }

}

module.exports = StoryboardEngine;