const StoryboardEngine = require("./StoryboardEngine");
const ChoiceEngine = require("./ChoiceEngine");
const PlayerEngine = require("./PlayerEngine");
const RoleEngine = require("./RoleEngine");
const WorldEngine = require("./WorldEngine");
const CharacterEngine = require("./CharacterEngine");

class EngineManager {

    constructor() {

        console.log("[EngineManager] Created");

        this.storyboardEngine = new StoryboardEngine();
        this.choiceEngine = new ChoiceEngine();
        this.playerEngine = new PlayerEngine();
        this.roleEngine = new RoleEngine();
        this.worldEngine = new WorldEngine();
        this.characterEngine = new CharacterEngine();

    }

    initialize() {

        console.log("[EngineManager] Initializing...");

        this.storyboardEngine.initialize();
        this.roleEngine.initialize();
        this.worldEngine.initialize();
        this.characterEngine.initialize();

    }

}

module.exports = EngineManager;