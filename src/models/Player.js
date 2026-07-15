class Player {

    constructor(name, role) {

        this.id = Date.now();

        this.name = name;
        this.role = role;

        this.level = 1;

        this.currentStoryboard = "SB_0001";

    }

}

module.exports = Player;