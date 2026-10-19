const skills = require("../data/skills/skills.json");


const TRIAL_KEYS = ["statue", "crystal", "water", "rescue"];


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
    // `hasCharacter(id)` is optional; when given, teachers are checked too.
    validate(roles, hasCharacter) {

        const problems = [];

        const starting = new Set(roles.map((role) => role.startingSkill));
        const seconds = new Set(roles.map((role) => role.secondSkill));

        for (const skill of this.skills.values()) {

            if (!skill.name || !skill.description) {

                problems.push(`${skill.id}: needs a name and a description`);

            }

            if (starting.has(skill.id)) {

                for (const key of TRIAL_KEYS) {

                    if (!skill.trials || !skill.trials[key]) {

                        problems.push(`${skill.id}: missing trials.${key}`);

                    }

                }

            }

            if (seconds.has(skill.id)) {

                if (!skill.learn) {

                    problems.push(`${skill.id}: missing learn text`);

                }

                if (!skill.teacher) {

                    problems.push(`${skill.id}: missing teacher`);

                } else if (hasCharacter && !hasCharacter(skill.teacher)) {

                    problems.push(
                        `${skill.id}: unknown teacher "${skill.teacher}"`
                    );

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

            if (!role.secondSkill) {

                problems.push(`role ${role.id}: no secondSkill`);

            } else if (!this.skills.has(role.secondSkill)) {

                problems.push(
                    `role ${role.id}: unknown secondSkill "${role.secondSkill}"`
                );

            }

            for (const friend of ["gandar", "wulan", "darpa"]) {

                if (!role.bonds || !role.bonds[friend]) {

                    problems.push(`role ${role.id}: missing bonds.${friend}`);

                }

            }

        }

        return problems;

    }

}


module.exports = SkillEngine;
