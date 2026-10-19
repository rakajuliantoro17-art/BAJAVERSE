const START_STORYBOARD = "PR_0001";

class Player {

    // A new player has no name or role yet; the prologue asks for both.
    constructor(name = null, role = null) {

        this.id = Date.now();

        this.name = name;
        this.role = role;

        this.level = 1;

        // Skill ids. The starting skill is granted when the role is chosen.
        this.skills = [];

        this.currentStoryboard = START_STORYBOARD;

    }

}

module.exports = Player;
