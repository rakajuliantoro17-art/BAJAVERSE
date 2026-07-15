const StoryboardEngine = require("./StoryboardEngine");
const ChoiceEngine = require("./ChoiceEngine");
const PlayerEngine = require("./PlayerEngine");
const RoleEngine = require("./RoleEngine");
const WorldEngine = require("./WorldEngine");

class EngineManager {

    constructor() {

        console.log("[EngineManager] Created");

        this.storyboardEngine = new StoryboardEngine();
        this.choiceEngine = new ChoiceEngine();
        this.playerEngine = new PlayerEngine();
        this.roleEngine = new RoleEngine();
        this.worldEngine = new WorldEngine();

    }

    initialize() {

        console.log("[EngineManager] Initializing...");

        this.storyboardEngine.initialize();
        this.roleEngine.initialize();
        this.worldEngine.initialize();

    }

}

module.exports = EngineManager;