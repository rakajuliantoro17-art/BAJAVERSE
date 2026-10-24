const StoryboardEngine = require("./StoryboardEngine");
const ChoiceEngine = require("./ChoiceEngine");
const PlayerEngine = require("./PlayerEngine");
const RoleEngine = require("./RoleEngine");
const WorldEngine = require("./WorldEngine");
const CharacterEngine = require("./CharacterEngine");
const SkillEngine = require("./SkillEngine");

class EngineManager {

    constructor() {

        console.log("[EngineManager] Created");

        this.storyboardEngine = new StoryboardEngine();
        this.choiceEngine = new ChoiceEngine();
        this.playerEngine = new PlayerEngine();
        this.roleEngine = new RoleEngine();
        this.worldEngine = new WorldEngine();
        this.characterEngine = new CharacterEngine();
        this.skillEngine = new SkillEngine();

    }

    initialize() {

        console.log("[EngineManager] Initializing...");

        this.storyboardEngine.initialize();
        this.roleEngine.initialize();
        this.worldEngine.initialize();
        this.characterEngine.initialize();
        this.skillEngine.initialize();

        this.skillEngine
            .validate(
                this.roleEngine.getRoles(),
                (id) => Boolean(this.characterEngine.getCharacter(id))
            )
            .forEach((problem) => {
                console.warn(`[SkillEngine] ${problem}`);
            });

        this.characterEngine
            .validate((id) => Boolean(this.roleEngine.getRole(id)))
            .forEach((problem) => {
                console.warn(`[CharacterEngine] ${problem}`);
            });

        for (const storyboard of this.storyboardEngine.storyboards.values()) {
            for (const choice of storyboard.choices || []) {
                for (const id of choice.ifRole || []) {
                    if (!this.roleEngine.getRole(id)) {
                        console.warn(
                            `[StoryboardEngine] ${storyboard.id}: choice "${choice.text}" ifRole has unknown role "${id}"`
                        );
                    }
                }
            }
        }

    }

}

module.exports = EngineManager;