class CutsceneMakerWindow extends Application {
    constructor(options = {}) {
        super(options);
        this._minimized = false;
        this._element = null;
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "cutscene-maker-window",
            title: "Cutscene Maker",
            template: "modules/cutscene-maker/templates/cutscene-maker.html",
            width: 700,
            resizable: true,
            classes: ["cutscene-maker"],
            scrollY: ["#cutscene-maker-content"],
            minimizable: true
        });
    }

    async _renderOuter() {
        const html = await super._renderOuter();
        this._element = html;
        return html;
    }

    minimize() {
        if (!this._minimized) {
            this._minimized = true;
            if (this.element && this.element.length) {
                this.element.addClass("minimized");
                this._savedStyle = {
                    width: this.element.width(),
                    height: this.element.height(),
                    top: this.element.css('top'),
                    left: this.element.css('left')
                };
            }
        }
        return super.minimize();
    }

    maximize() {
        if (this._minimized) {
            this._minimized = false;
            if (this.element && this.element.length) {
                this.element.removeClass("minimized");
                if (this._savedStyle) {
                    this.element.css(this._savedStyle);
                }
            }
        }
        return super.maximize();
    }

    activateListeners(html) {
        super.activateListeners(html);
        
        this.populateActionButtons(html);
        updateActionList(getCutsceneActions());
        
        html.find("#testRunButton").click(() => {
            testRunActions();
        });

        html.find("#clearButton").click(() => {
            new Dialog({
                title: "Confirm Clear",
                content: "<p>Are you sure you want to clear all actions?</p>",
                buttons: {
                    yes: {
                        icon: "<i class='fas fa-check'></i>",
                        label: "Yes",
                        callback: () => {
                            setCutsceneActions([]);
                            updateActionList([]);
                        }
                    },
                    no: {
                        icon: "<i class='fas fa-times'></i>",
                        label: "No"
                    }
                },
                default: "no"
            }).render(true);
        });

        html.find("#importButton").click(() => {
            openImportDialog();
        });

        html.find("#exportButton").click(() => {
            exportCutsceneScript();
        });
    }

    populateActionButtons(html) {
        const availableActionsContainer = html.find("#availableActions");
        const actions = [
            { id: "CameraButton", label: "Camera", action: () => addCameraPositionAction(getCutsceneActions()) },
            { id: "SwitchSceneButton", label: "Switch Scene", action: () => addSwitchSceneAction(getCutsceneActions()) },
            { id: "TokenMovementButton", label: "Token Movement", action: () => addTokenMovementAction(getCutsceneActions()) },
            { id: "WaitButton", label: "Wait", action: () => addWaitAction(getCutsceneActions()) },
            { id: "ScreenFlashButton", label: "Screen Flash", action: () => addScreenFlashAction(getCutsceneActions()) },
            { id: "ScreenShakeButton", label: "Screen Shake", action: () => addScreenShakeAction(getCutsceneActions()) },
            { id: "RunMacroButton", label: "Run Macro", action: () => addRunMacroAction(getCutsceneActions()) },
            { id: "ImageDisplayButton", label: "Image Display", action: () => addImageDisplayAction(getCutsceneActions()) },
            { id: "ShowHideTokenButton", label: "Show/Hide Token", action: () => showHideAction(getCutsceneActions()) },
            { id: "TileMovementButton", label: "Tile Movement", action: () => addTileMovementAction(getCutsceneActions()) },
            { id: "DoorStateButton", label: "Door State", action: () => addDoorStateAction(getCutsceneActions()) },
            { id: "FadeOutButton", label: "Fade Out", action: () => addFadeOutAction(getCutsceneActions()) },
            { id: "FadeInButton", label: "Fade In", action: () => addFadeInAction(getCutsceneActions()) },
            { id: "HideUIButton", label: "Hide UI", action: () => addHideUIAction(getCutsceneActions()) },
            { id: "ShowUIButton", label: "Show UI", action: () => addShowUIAction(getCutsceneActions()) },
            { id: "PlayAudioButton", label: "Play Audio", action: () => addPlayAudioAction(getCutsceneActions()) },
            { id: "TokenSayButton", label: "Token Say", action: () => addTokenSayAction(getCutsceneActions()) }
        ];

        actions.forEach(({ id, label, action }) => {
            const button = $(`<button id="${id}" class="cutscene-maker-button">${label}</button>`);
            button.click(action);
            availableActionsContainer.append(button);
        });
    }
}

function openCutsceneMakerWindow() {
    new CutsceneMakerWindow().render(true);
}

function initializeCutsceneMacroMaker() {
    // Use the proper GM check for V11/V12
    Hooks.on('getSceneControlButtons', controls => {
        if (!game.user || !game.user.isGM) return;
        
        controls.push({
            name: 'cutscene-maker',
            title: 'Cutscene Maker',
            icon: 'fas fa-video',
            layer: 'controls',
            visible: game.user.isGM,
            tools: [{
                name: 'openCutsceneMaker',
                title: 'Open Cutscene Maker',
                icon: 'fas fa-film',
                visible: true,
                onClick: () => {
                    openCutsceneMakerWindow();
                },
                button: true
            }]
        });
    });
}

// Load jQuery UI for sortable functionality
let recorder; // Define the recorder variable globally
let selectionData = {};

const loadScript = (url, callback) => {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = url;
    script.onload = callback;
    document.head.appendChild(script);
};

const addStylesheet = url => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    document.head.appendChild(link);
};

addStylesheet("https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css");

loadScript("https://code.jquery.com/ui/1.12.1/jquery-ui.js", () => {
    console.log("jQuery UI loaded");
});

document.body.insertAdjacentHTML('beforeend', `
    <div id="screen-select-overlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:10000;">
        <div style="position:absolute; top:10px; left:10px; color:white; font-size:14px;">
            Use the mouse and drag a rectangle on the screen to select the area.
        </div>
        <div id="selection-box" style="position:absolute; border:2px dashed #fff;"></div>
    </div>
`);

import {
    addCameraPositionAction,
    addSwitchSceneAction,
    addTokenMovementAction,
    addTokenSayAction,
    addPlayAudioAction,
    addDoorStateAction,
    addWaitAction,
    addTileMovementAction,
    addScreenFlashAction,
    addScreenShakeAction,
    addRunMacroAction,
    addImageDisplayAction,
    addFadeOutAction,
    addFadeInAction,
    addHideUIAction,
    addShowUIAction,
    showHideAction
} from './modules/actions.js';

import { openImportDialog, openInitialDialog, exportCutsceneScript } from './modules/dialogs.js';
import { generateUniqueId, updateActionList, removeAction, updateAction, closeAllDialogs, generateScript } from './modules/utilities.js';
import { getCutsceneActions, setCutsceneActions } from './modules/cutsceneState.js';

function testRunActions() {
    const cutsceneActions = getCutsceneActions();
    const scriptContent = cutsceneActions
        .filter(action => action && action.type)
        .map(action => generateScript(action.type, action.params))
        .join("\n\n");

    console.log("Generated Script Content:", scriptContent);

    const wrappedScript = `
        (async function() {
            try {
                const windowApp = ui.windows[Object.keys(ui.windows).find(key => ui.windows[key].id === 'cutscene-maker-window')];
                if (windowApp) {
                    windowApp.minimize();
                }

                ${scriptContent}

                if (windowApp) {
                    setTimeout(() => {
                        windowApp.maximize();
                    }, 1000);
                }
            } catch (error) {
                console.error("Error executing cutscene script: ", error);
                ui.notifications.error("Error executing cutscene script. Check the console for details.");
                throw error;
            }
        })();
    `;

    try {
        new Function(wrappedScript)();
        ui.notifications.info("Test run executed successfully.");
    } catch (error) {
        console.error("Error during test run:", error);
    }
}

// Keep only this initialization
Hooks.once('init', () => {
    console.log('Cutscene Maker | Initializing');
    initializeCutsceneMacroMaker();
});

// Export both functions
export { initializeCutsceneMacroMaker, openCutsceneMakerWindow };