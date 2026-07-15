class ChoiceEngine {

    constructor() {
        console.log("[ChoiceEngine] Created");
    }

    choose(storyboard, choiceIndex) {

        const choice = storyboard.choices[choiceIndex];

        if (!choice) {
            console.log("[ChoiceEngine] Invalid choice");
            return null;
        }

        console.log(`[ChoiceEngine] Selected: ${choice.text}`);

        return choice.target;
    }

}

module.exports = ChoiceEngine;