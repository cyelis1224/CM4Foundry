let cutsceneActions = [];

export function getCutsceneActions() {
    return cutsceneActions;
}

export function setCutsceneActions(actions) {
    cutsceneActions = actions;
}

export function clearCutsceneActions() {
    setCutsceneActions([]);
} 
