class WorldEngine {

    constructor() {

        console.log("[WorldEngine] Created");

        this.flags = {};

    }

    initialize() {

        console.log("[WorldEngine] Initializing...");

    }

    setFlag(key, value) {

        this.flags[key] = value;

    }

    getFlag(key) {

        return this.flags[key];

    }

}

module.exports = WorldEngine;