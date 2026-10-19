const skills = require("../data/skills/skills.json");


const TRIAL_KEYS = ["statue", "crystal", "water"];


class SkillEngine {

    constructor() {

        this.skills = new Map();

        console.log("[SkillEngine] Created");

    }


    initialize() {

        console.log("[SkillEngine] Initializing...");

        for (const skill of skills) {

            this.skills.set(skill.id, skill);

        }

        console.log(
            `[SkillEngine] Loaded ${this.skills.size} skill(s)`
        );

    }


    getSkill(id) {

        return this.skills.get(id);

    }


    // Returns a list of problems in the skill data (empty when it is sound).
    validate(roles) {

        const problems = [];

        for (const skill of this.skills.values()) {

            if (!skill.name || !skill.description) {

                problems.push(`${skill.id}: needs a name and a description`);

            }

            for (const key of TRIAL_KEYS) {

                if (!skill.trials || !skill.trials[key]) {

                    problems.push(`${skill.id}: missing trials.${key}`);

                }

            }

        }

        for (const role of roles) {

            if (!role.startingSkill) {

                problems.push(`role ${role.id}: no startingSkill`);

            } else if (!this.skills.has(role.startingSkill)) {

                problems.push(
                    `role ${role.id}: unknown startingSkill "${role.startingSkill}"`
                );

            }

        }

        return problems;

    }

}


module.exports = SkillEngine;
