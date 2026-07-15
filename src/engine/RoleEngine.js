const roles = require("../data/roles/roles.json");


class RoleEngine {

    constructor() {

        this.roles = new Map();

        console.log("[RoleEngine] Created");

    }


    initialize() {

        console.log("[RoleEngine] Initializing...");


        for (const role of roles) {

            this.roles.set(role.id, role);

        }


        console.log(
            `[RoleEngine] Loaded ${this.roles.size} role(s)`
        );

    }


    getRoles() {

        return Array.from(this.roles.values());

    }


    getRole(id) {

        return this.roles.get(id);

    }

}


module.exports = RoleEngine;