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
  initializeCutsceneMacroMaker();
});
document.body.insertAdjacentHTML('beforeend', `
<div id="screen-select-overlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:10000;">
  <!-- Instruction Text -->
  <div style="position:absolute; top:10px; left:10px; color:white; font-size:14px;">
    Use the mouse and drag a rectangle on the screen to select the area.
  </div>

  <div id="selection-box" style="position:absolute; border:2px dashed #fff;"></div>
</div>

`);

// Define showSelectionOverlay globally
function showSelectionOverlay() {
    return new Promise((resolve) => {
        const overlay = document.getElementById('screen-select-overlay');
        const selectionBox = document.getElementById('selection-box');
        let startX, startY, currentX, currentY;

        overlay.style.display = 'block';

        function mouseMoveHandler(e) {
            currentX = e.clientX;
            currentY = e.clientY;

            const width = Math.abs(currentX - startX);
            const height = Math.abs(currentY - startY);
            const left = Math.min(currentX, startX);
            const top = Math.min(currentY, startY);

            selectionBox.style.width = width + 'px';
            selectionBox.style.height = height + 'px';
            selectionBox.style.left = left + 'px';
            selectionBox.style.top = top + 'px';

            selectionData = { width, height, left, top };
        }

        function mouseUpHandler() {
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
            overlay.style.display = 'none';

            if (selectionData.width > 0 && selectionData.height > 0) {
                resolve({ x: selectionData.left, y: selectionData.top, width: selectionData.width, height: selectionData.height });
            } else {
                console.warn("Invalid selection area. Please try again.");
                resolve(null);
            }
        }

        function mouseDownHandler(e) {
            startX = e.clientX;
            startY = e.clientY;

            selectionBox.style.width = '0px';
            selectionBox.style.height = '0px';
            selectionBox.style.left = startX + 'px';
            selectionBox.style.top = startY + 'px';

            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
        }

        overlay.addEventListener('mousedown', mouseDownHandler);
    });
}

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

function initializeCutsceneMacroMaker() {
    openInitialDialog();

    Hooks.on('getSceneControlButtons', controls => {
        controls.push({
            name: 'cutscene-maker',
            title: 'Cutscene Maker',
            icon: 'fas fa-video',
            layer: 'controls',
            tools: [{
                name: 'openCutsceneMaker',
                title: 'Open Cutscene Maker',
                icon: 'fas fa-film',
                onClick: () => {
                    openCutsceneMakerWindow();
                },
                button: true
            }]
        });
    });
}

function openCutsceneMakerWindow() {
    new CutsceneMakerWindow().render(true);
}

class CutsceneMakerWindow extends Application {
    constructor(options = {}) {
        super(options);
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "cutscene-maker-window",
            title: "Cutscene Maker",
            template: "modules/cutscene-maker/templates/cutscene-maker.html",
            width: 700,
            resizable: true,
            classes: ["cutscene-maker"]
        });
    }

    getData() {
        return {};
    }

    activateListeners(html) {
        super.activateListeners(html);
        
        this.populateActionButtons(html);
        this.updateActionList();
        
        html.find("#testRunButton").click(() => {
            testRunActions();
        });

        html.find("#clearButton").click(() => {
            new Dialog({
                title: "Clear All Actions",
                content: "<p>Are you sure you want to clear all actions?</p>",
                buttons: {
                    yes: {
                        label: "Yes",
                        callback: () => {
                            setCutsceneActions([]);
                            updateActionList();
                            ui.notifications.info("All actions cleared.");
                        }
                    },
                    no: {
                        label: "No",
                        callback: () => {}
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

        html.find("#recTestRunButton").click(async () => {
            try {
                const selection = await showSelectionOverlay();
                const suggestedName = "screen-recording.webm";
                const handle = await window.showSaveFilePicker({ suggestedName });
                const writable = await handle.createWritable();
                await recTestRunActions(writable, selection);
            } catch (error) {
                console.error("Error during file save dialog:", error);
            }
        });
    }

    populateActionButtons(html) {
        const actions = [
            { id: "CameraButton", label: "Camera", action: () => addCameraPositionAction(getCutsceneActions()) },
            { id: "SwitchSceneButton", label: "Switch Scene", action: () => addSwitchSceneAction(getCutsceneActions()) },
            { id: "TokenMovementButton", label: "Token Movement", action: () => addTokenMovementAction(getCutsceneActions()) },
            { id: "WaitButton", label: "Wait", action: () => addWaitAction(getCutsceneActions()) },
            { id: "ScreenFlashButton", label: "Screen Flash", action: () => addScreenFlashAction(getCutsceneActions()) },
            { id: "ScreenShakeButton", label: "Screen Shake", action: () => addScreenShakeAction(getCutsceneActions()) },
            { id: "RunMacroButton", label: "Run Macro", action: () => addRunMacroAction(getCutsceneActions()) },
            { id: "ImageDisplayButton", label: "Image Display", action: () => addImageDisplayAction(getCutsceneActions()) },
            // { id: "PlayAnimationButton", label: "Play Animation", action: () => addAnimationAction(getCutsceneActions()) },
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

        const availableActionsContainer = html.find("#availableActions");

        actions.forEach(({ id, label, action }) => {
            const button = $(`<button id="${id}" class="cutscene-maker-button">${label}</button>`);
            button.click(action);
            availableActionsContainer.append(button);
        });
    }

    updateActionList() {
        const cutsceneActions = getCutsceneActions();
        const actionList = $("#actionList");
        actionList.empty();
        cutsceneActions.forEach(action => {
            actionList.append(`
                <li id="${action.id}" class="ui-state-default" style="display: flex; justify-content: space-between; align-items: center; padding: 5px 4px;">
                    <span class="drag-handle" style="cursor: move; margin-right: 10px;">&#9776;</span>
                    <span class="action-description" style="flex-grow: 1; overflow: overlay;">${action.description}</span>
                    <span style="display: flex; gap: 5px;">
                        <button class="edit-button" data-id="${action.id}" style="min-width: 60px; max-width: 60px;">Edit</button>
                        <button class="remove-button" data-id="${action.id}" style="min-width: 60px; max-width: 60px;">Remove</button>
                    </span>
                </li>
            `);
        });

        $(".edit-button").click(function() {
            const actionId = $(this).data("id");
            const action = cutsceneActions.find(action => action.id === actionId);
            if (action) {
                switch (action.type) {
                    case "camera":
                        addCameraPositionAction(cutsceneActions, action);
                        break;
                    case "switchScene":
                        addSwitchSceneAction(cutsceneActions, action);
                        break;
                    case "tokenMovement":
                        addTokenMovementAction(cutsceneActions, action);
                        break;
                    case "showHideToken":
                        showHideAction(cutsceneActions, action);
                        break;
                    case "wait":
                        addWaitAction(cutsceneActions, action);
                        break;
                    case "screenShake":
                        addScreenShakeAction(cutsceneActions, action);
                        break;
                    case "screenFlash":
                        addScreenFlashAction(cutsceneActions, action);
                        break;
                    case "runMacro":
                        addRunMacroAction(cutsceneActions, action);
                        break;
                    case "imageDisplay":
                        addImageDisplayAction(cutsceneActions, action);
                        break;
                    // case "animation":
                    //     addAnimationAction(cutsceneActions, action);
                    //     break;
                    case "fadeOut":
                        addFadeOutAction(cutsceneActions, action);
                        break;
                    case "fadeIn":
                        addFadeInAction(cutsceneActions, action);
                        break;
                    case "hideUI":
                        addHideUIAction(cutsceneActions, action);
                        break;
                    case "showUI":
                        addShowUIAction(cutsceneActions, action);
                        break;
                    case "doorState":
                        addDoorStateAction(cutsceneActions, action);
                        break;
                    case "playAudio":
                        addPlayAudioAction(cutsceneActions, action);
                        break;
                    case "tokenSay":
                        addTokenSayAction(cutsceneActions, action);
                        break;
                    default:
                        break;
                }
            }
        });

        $(".remove-button").click(function() {
            const actionId = $(this).data("id");
            removeAction(cutsceneActions, actionId);
        });

        if (!actionList.data('ui-sortable')) {
            actionList.sortable({
                handle: '.drag-handle',
                update: function(event, ui) {
                    const newOrder = $(this).sortable("toArray");
                    const reorderedActions = newOrder.map(id => cutsceneActions.find(action => action.id === id));
                    setCutsceneActions(reorderedActions);
                }
            });
        }
        actionList.disableSelection();
    }
}

function testRunActions() {
	const cutsceneActions = getCutsceneActions();
	const scriptContent = cutsceneActions
		.filter(action => action && action.type) // Filter out any undefined or invalid actions
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
					}, 1000); // Add a 1-second delay before maximizing
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