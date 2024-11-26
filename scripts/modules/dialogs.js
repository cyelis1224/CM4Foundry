import { getCutsceneActions, setCutsceneActions } from './cutsceneState.js';
import { generateUniqueId, updateActionList, updateAction, generateScript, importScript } from './utilities.js';

export function openInitialDialog() {
    const dialogContent = `
        <div class="cutscene-maker-buttons">
            ${[
                "Camera", "Switch Scene", "Token Movement", "Screen Flash", "Screen Shake", "Run Macro", "Wait", "Image Display", "Play Animation"
            ].map(action => `<div class="cutscene-maker-button" id="${action.replace(/ /g, '')}Button">${action}</div>`).join('')}
        </div>
    `;

    const dialog = new Dialog({
        title: "Cutscene Macro Maker",
        content: dialogContent,
        buttons: {},
        render: html => {
            console.log("Initial dialog rendered");
            const closeDialogAndExecute = actionFunction => {
                dialog.close();
                actionFunction();
            };

            const actionMappings = [
                { id: "CameraButton", action: addCameraPositionAction },
                { id: "SwitchSceneButton", action: addSwitchSceneAction },
                { id: "TokenMovementButton", action: addTokenMovementAction },
                { id: "ScreenFlashButton", action: addScreenFlashAction },
                { id: "ScreenShakeButton", action: addScreenShakeAction },
                { id: "RunMacroButton", action: addRunMacroAction },
                { id: "WaitButton", action: addWaitAction },
                { id: "ImageDisplayButton", action: addImageDisplayAction },
                { id: "PlayAnimationButton", action: addAnimationAction },
                { id: "HideUIButton", action: addHideUIAction },
                { id: "ShowUIButton", action: addShowUIAction }
            ];

            actionMappings.forEach(({ id, action }) => {
                html.find(`#${id}`).click(() => {
                    console.log(`Button ${id} clicked`);
                    closeDialogAndExecute(action);
                });
            });
        }
    });
    dialog.render(true);
}

export function openImportDialog() {
    new Dialog({
        title: "Import Script",
        content: `
            <form>
                <div class="form-group">
                    <label for="importScript">Paste the script to import:</label>
                    <textarea id="importScript" name="importScript" style="width: 100%; height: 200px;"></textarea>
                </div>
            </form>
        `,
        buttons: {
            import: {
                label: "Import",
                callback: html => {
                    const script = html.find("#importScript").val();
                    if (script) {
                        importScript(script);
                    }
                }
            },
            cancel: {
                label: "Cancel",
                callback: () => {}
            }
        },
        default: "import",
        render: html => {
            console.log("Import dialog rendered");
        }
    }).render(true);
}

export function exportCutsceneScript() {
    const cutsceneActions = getCutsceneActions();
    const scriptContent = cutsceneActions.map(action => generateScript(action.type, action.params)).join("\n\n");
    new Dialog({
        title: "Export Script",
        content: `
            <textarea id="cutsceneScript" style="width:100%; height:300px;">${scriptContent}</textarea>
        `,
        buttons: {
            copy: {
                label: "Copy to Clipboard",
                callback: html => {
                    const copyText = document.getElementById("cutsceneScript");
                    copyText.select();
                    document.execCommand("copy");
                    ui.notifications.info("Script copied to clipboard.");
                }
            },
            close: {
                label: "Close",
                callback: html => {
                    const dialog = html.closest('.window-app');
                    if (dialog) {
                        dialog.remove();
                    }
                }
            }
        },
        default: "close",
        render: html => {
            setTimeout(() => {}, 0);
        }
    }).render(true);
}

export function openCustomActionDialog(existingAction) {
    const cutsceneActions = getCutsceneActions();
    const action = existingAction || {};
    const dialog = new Dialog({
        title: "Edit Custom Action",
        content: `
            <form>
                <div class="form-group">
                    <label for="customScript">Custom Script:</label>
                    <textarea id="customScript" name="customScript" style="width: 100%; height: 200px;">${action.params?.script || ''}</textarea>
                </div>
            </form>
        `,
        buttons: {
            save: {
                label: "Save",
                callback: html => {
                    const script = html.find("#customScript").val();
                    const params = { script };
                    const description = "Custom Action";

                    if (existingAction) {
                        updateAction(cutsceneActions, existingAction.id, params, description);
                    } else {
                        const actionId = generateUniqueId();
                        cutsceneActions.push({ id: actionId, description, type: "custom", params });
                    }
                    setCutsceneActions(cutsceneActions);
                    updateActionList(cutsceneActions);
                }
            },
            cancel: {
                label: "Cancel",
                callback: () => {}
            }
        },
        default: "save",
        render: html => {
            console.log("Dialog rendered: Edit Custom Action");
        }
    });

    dialog.render(true);
}
