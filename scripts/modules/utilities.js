import { getCutsceneActions, setCutsceneActions } from './cutsceneState.js';
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
} from './actions.js';
import { openCustomActionDialog } from './dialogs.js';

let actionCounter = 0;

export function generateUniqueId() {
    return `action-${actionCounter++}`;
}

export function updateActionList(cutsceneActions) {
    const actionList = $("#actionList");
    actionList.empty();
    cutsceneActions.forEach(action => {
        if (!action || !action.id || !action.description) {
            console.error("Action is missing required properties or is undefined:", action);
            return;
        }
        actionList.append(`
            <li id="${action.id}" class="ui-state-default" style="display: flex; justify-content: space-between; align-items: center; padding: 5px 4px; background: rgba(255, 255, 240, 0.8);">
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
                case "tileMovement":
                    addTileMovementAction(cutsceneActions, action);
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
                case "custom":
                    openCustomActionDialog(action);
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
                const reorderedActions = newOrder.map(id => {
                    const action = cutsceneActions.find(action => action.id === id);
                    if (!action) {
                        console.error("Reordered action not found:", id);
                    }
                    return action;
                }).filter(action => action !== undefined); // Ensure no undefined actions
                setCutsceneActions(reorderedActions);
            }
        });
    }
    actionList.disableSelection();
}

export function removeAction(cutsceneActions, actionId) {
    const updatedActions = cutsceneActions.filter(action => action.id !== actionId);
    setCutsceneActions(updatedActions);
    updateActionList(updatedActions);
}

export function updateAction(cutsceneActions, actionId, params, description) {
    if (!Array.isArray(cutsceneActions)) {
        console.error("cutsceneActions is not an array:", cutsceneActions);
        return;
    }
    const actionIndex = cutsceneActions.findIndex(action => action.id === actionId);
    if (actionIndex !== -1) {
        cutsceneActions[actionIndex].params = params;
        cutsceneActions[actionIndex].description = description;
        updateActionList(cutsceneActions);
    }
}

export function closeAllDialogs() {
    Object.values(ui.windows).forEach(dialog => dialog.close());
}

export function generateScript(type, params) {
    switch (type) {
        case "camera":
            return `
                // Camera Position Action
                (async function() {
                    try {
                        const targetPosition = {
                            x: ${params.x},
                            y: ${params.y},
                            scale: ${params.scale}
                        };
                        await canvas.animatePan({
                            x: targetPosition.x,
                            y: targetPosition.y,
                            scale: targetPosition.scale,
                            duration: ${params.duration}
                        });
                        await new Promise(resolve => setTimeout(resolve, ${params.duration}));
                    } catch (error) {
                        console.error("Error in camera position action:", error);
                    }
                })();
            `;
        case "switchScene":
            console.log("Switch Scene Params:", params); // Debug log
            return `
                // Switch Scene Action
                (async function() {
                    try {
                        const sceneId = "${params.sceneId}";
                        console.log("Attempting to switch to scene:", sceneId); // Debug log
                        const scene = game.scenes.get(sceneId);
                        if (scene) {
                            await scene.activate();
                            console.log("Successfully switched to scene:", scene.name);
                        } else {
                            console.warn("Scene not found with ID:", sceneId);
                            // Try finding scene by name as fallback
                            const sceneByName = game.scenes.find(s => s.name === sceneId);
                            if (sceneByName) {
                                await sceneByName.activate();
                                console.log("Successfully switched to scene by name:", sceneByName.name);
                            } else {
                                console.error("Could not find scene by ID or name:", sceneId);
                            }
                        }
                    } catch (error) {
                        console.error("Error in switch scene action:", error);
                    }
                })();
            `;
        case "tokenMovement":
            console.log("Token Movement Params:", params);
            return `
                // Token Movement Action
                (async function() {
                    try {
                        const token = canvas.tokens.get("${params.id}");
                        if (token) {
                            const startX = token.x;
                            const startY = token.y;
                            const distance = Math.sqrt(Math.pow(${params.x} - startX, 2) + Math.pow(${params.y} - startY, 2));
                            const duration = distance / ${params.speed} * 1000; // Calculate duration based on speed
                            
                            if (${params.teleport}) {
                                await token.document.update({ x: ${params.x}, y: ${params.y}, rotation: ${params.rotation} });
                            } else {
                                // Use Foundry's built-in animation system with speed
                                await token.document.update({
                                    x: ${params.x},
                                    y: ${params.y},
                                    rotation: ${params.rotation}
                                }, {
                                    animate: {
                                        duration: duration,
                                        movementSpeed: ${params.speed} // Add movement speed
                                    }
                                });

                                // Wait for the movement to complete
                                await new Promise(resolve => setTimeout(resolve, duration));
                            }
                            
                            if (${params.animatePan}) {
                                const panParams = { x: ${params.x}, y: ${params.y}, duration: duration };
                                await canvas.animatePan(panParams);
                            }
                        }
                    } catch (error) {
                        console.error("Error in token movement action:", error);
                    }
                })();
            `;
        case "wait":
            return `
                // Wait Action
                await new Promise(resolve => setTimeout(resolve, ${params.duration}));
            `;
        case "screenFlash":
            return `
                // Screen Flash Action
                (async function() {
                    try {
                        const flashEffect = document.createElement("div");
                        flashEffect.style.position = "fixed";
                        flashEffect.style.left = 0;
                        flashEffect.style.top = 0;
                        flashEffect.style.width = "100vw";
                        flashEffect.style.height = "100vh";
                        flashEffect.style.backgroundColor = "${params.color}";
                        flashEffect.style.opacity = ${params.opacity};
                        flashEffect.style.pointerEvents = "none";
                        flashEffect.style.zIndex = "10000";
                        document.body.appendChild(flashEffect);

                        setTimeout(() => {
                            flashEffect.style.transition = "opacity ${params.duration}ms";
                            flashEffect.style.opacity = 0;
                        }, 50);

                        setTimeout(() => {
                            flashEffect.remove();
                        }, ${params.duration} + 50);
                    } catch (error) {
                        console.error("Error in screen flash action:", error);
                    }
                })();
            `;
        case "screenShake":
            return `
                // Screen Shake Action
                (async function() {
                    try {
                        const originalPosition = { x: canvas.stage.pivot.x, y: canvas.stage.pivot.y };
                        const shake = (intensity, speed, duration) => {
                            return new Promise(resolve => {
                                const startTime = Date.now();
                                const shakeInterval = setInterval(() => {
                                    const elapsed = Date.now() - startTime;
                                    if (elapsed >= duration) {
                                        clearInterval(shakeInterval);
                                        canvas.stage.pivot.set(originalPosition.x, originalPosition.y);
                                        resolve();
                                    } else {
                                        const offsetX = (Math.random() - 0.5) * intensity;
                                        const offsetY = (Math.random() - 0.5) * intensity;
                                        canvas.stage.pivot.set(originalPosition.x + offsetX, originalPosition.y + offsetY);
                                    }
                                }, speed);
                            });
                        };
                        await shake(${params.intensity}, ${params.speed}, ${params.duration});
                    } catch (error) {
                        console.error("Error in screen shake action:", error);
                    }
                })();
            `;
        case "runMacro":
            return `
                // Run Macro Action
                (async function() {
                    try {
                        const macro = game.macros.find(m => m.name === "${params.macroName}");
                        if (macro) {
                            await macro.execute();
                            console.log("Executed macro: ${params.macroName}");
                        } else {
                            console.warn("Macro not found: ${params.macroName}");
                        }
                    } catch (error) {
                        console.error("Error in run macro action:", error);
                    }
                })();
            `;
        case "playAudio":
            return `
                // Play Audio Action
                (async function() {
                    try {
                        const sound = {
                            src: "${params.audioFilePath}",
                            volume: ${params.volume},
                            loop: ${params.repeat},
                            fade: ${params.fadeDuration}
                        };
                        await AudioHelper.play(sound, true);
                        console.log("Playing audio: ${params.audioFilePath} as ${params.soundType}");
                    } catch (error) {
                        console.error("Error in play audio action:", error);
                    }
                })();
            `;
        case "tokenSay":
            return `
                // Token Say Action
                (async function() {
                    try {
                        const token = canvas.tokens.get("${params.tokenId}");
                        if (token) {
                            let chatData = {
                                user: game.user._id,
                                speaker: ChatMessage.getSpeaker(token),
                                content: "${params.message}"
                            };
                            // Attempt to process the message as a command
                            if (game.chatCommands) {
                                game.chatCommands.process(chatData.content, chatData);
                            } else {
                                // Fallback to creating a chat message
                                ChatMessage.create(chatData, { chatBubble: true });
                            }
                        }
                    } catch (error) {
                        console.error("Error in token say action:", error);
                    }
                })();
            `;
        case "tileMovement":
            return `
                // Tile Movement Action
                (async function() {
                    try {
                        const tile = canvas.tiles.get("${params.tileId}");
                        if (tile) {
                            await tile.document.update({ x: ${params.x}, y: ${params.y}, rotation: ${params.rotation} });
                            ${params.animatePan ? `await canvas.animatePan({ x: ${params.x}, y: ${params.y}, duration: 1000 });` : ""}
                            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for movement to complete
                        }
                    } catch (error) {
                        console.error("Error in tile movement action:", error);
                    }
                })();
            `;
        case "doorState":
            return `
                // Door State Action
                (async function() {
                    try {
                        const wall = canvas.walls.get("${params.wallId}");
                        if (wall) {
                            await wall.document.update({
                                ds: ${params.doorState}
                            });
                            console.log("Door state changed to: ${params.doorState === "1" ? "Open" : params.doorState === "2" ? "Locked" : "Closed"}");
                        }
                    } catch (error) {
                        console.error("Error in door state action:", error);
                    }
                })();
            `;
        case "fadeOut":
            return `
                // Fade Out Action
                (async function() {
                    try {
                        const canvasElement = document.querySelector("canvas#board");
                        canvasElement.style.transition = "filter ${params.fadeDuration}ms ease-in-out";
                        canvasElement.style.filter = "brightness(0)";
                        await new Promise(resolve => setTimeout(resolve, ${params.fadeDuration}));
                        console.log("Screen faded out over ${params.fadeDuration}ms.");
                    } catch (error) {
                        console.error("Error in fade out action:", error);
                    }
                })();
            `;
        case "fadeIn":
            return `
                // Fade In Action
                (async function() {
                    try {
                        const canvasElement = document.querySelector("canvas#board");
                        canvasElement.style.transition = "filter ${params.fadeDuration}ms ease-in-out";
                        canvasElement.style.filter = "brightness(1)";
                        await new Promise(resolve => setTimeout(resolve, ${params.fadeDuration}));
                        console.log("Screen faded in over ${params.fadeDuration}ms.");
                    } catch (error) {
                        console.error("Error in fade in action:", error);
                    }
                })();
            `;
        case "hideUI":
            return `
                // Hide UI Action
                (async function() {
                    try {
                        const uiSelectors = ["#ui-left", "#ui-top", "#taskbar", "#ui-right", "#players", "#hotbar"];
                        uiSelectors.forEach(selector => {
                            const element = document.querySelector(selector);
                            if (element) {
                                element.style.transition = 'transform ${params.duration}ms ease, opacity ${params.duration}ms ease';
                                element.style.opacity = '0';
                            }
                        });
                        await new Promise(resolve => setTimeout(resolve, ${params.duration}));
                        console.log("UI elements hidden over ${params.duration}ms.");
                    } catch (error) {
                        console.error("Error in hide UI action:", error);
                    }
                })();
            `;
        case "showUI":
            return `
                // Show UI Action
                (async function() {
                    try {
                        const uiSelectors = ["#ui-left", "#ui-top", "#taskbar", "#ui-right", "#players", "#hotbar"];
                        uiSelectors.forEach(selector => {
                            const element = document.querySelector(selector);
                            if (element) {
                                element.style.transition = 'transform ${params.duration}ms ease, opacity ${params.duration}ms ease';
                                element.style.opacity = '1';
                            }
                        });
                        await new Promise(resolve => setTimeout(resolve, ${params.duration}));
                        console.log("UI elements shown over ${params.duration}ms.");
                    } catch (error) {
                        console.error("Error in show UI action:", error);
                    }
                })();
            `;
        case "custom":
            return `
                // Custom Action
                (async function() {
                    try {
                        ${params.script}
                    } catch (error) {
                        console.error("Error in custom action:", error);
                    }
                })();
            `;
        case "imageDisplay":
            return `
                // Image Display Action
                (async function() {
                    try {
                        const imagePopout = new ImagePopout("${params.imageUrl}", {
                            title: "Image Display",
                            shareable: true,
                            uuid: null
                        });
                        imagePopout.render(true);
                        console.log("Displayed image: ${params.imageUrl}");
                    } catch (error) {
                        console.error("Error in image display action:", error);
                    }
                })();
            `;
        case "showHideToken":
            return `
                // Show/Hide Token Action
                (async function() {
                    try {
                        const token = canvas.tokens.get("${params.tokenId}");
                        if (token) {
                            const isVisible = token.document.hidden;
                            await token.document.update({ hidden: !isVisible });
                            console.log("Token ${params.tokenId} is now " + (!isVisible ? "hidden" : "visible"));
                        } else {
                            console.warn("Token not found: ${params.tokenId}");
                        }
                    } catch (error) {
                        console.error("Error in show/hide token action:", error);
                    }
                })();
            `;
        default:
            return "// Unknown Action";
    }
}

export function parseScript(script) {
    const actions = script.split("\n\n").map(section => {
        const type = parseActionType(section);
        if (type === "dummy") {
            // Check if the section is part of a known action
            if (section.includes("flashEffect.style.transition") || section.includes("flashEffect.remove")) {
                return null; // Ignore these parts as they are part of the screenFlash action
            }
            // Create a custom action for unrecognized sections
            return { type: "custom", params: { script: section }, description: "Custom Action" };
        }
        const params = parseParamsFromScript(section, type);
        return { type, params, description: generateDescription(type, section) };
    }).filter(action => action !== null); // Filter out null values
    return actions;
}

export function parseActionType(section) {
    if (section.includes("Camera Position Action")) return "camera";
    if (section.includes("Wait Action")) return "wait";
    if (section.includes("Switch Scene Action")) return "switchScene";
    if (section.includes("Token Teleport Action") || section.includes("Token Movement Action")) return "tokenMovement";
    if (section.includes("Show/Hide Token Action")) return "showHideToken";
    if (section.includes("Tile Movement Action")) return "tileMovement";
    if (section.includes("Screen Shake Action")) return "screenShake";
    if (section.includes("Screen Flash Action")) return "screenFlash";
    if (section.includes("Run Macro Action")) return "runMacro";
    if (section.includes("Image Display Action")) return "imageDisplay";
    if (section.includes("Animation Action")) return "animation";
    if (section.includes("Fade Out Action")) return "fadeOut";
    if (section.includes("Fade In Action")) return "fadeIn";
    if (section.includes("Hide UI Action")) return "hideUI";
    if (section.includes("Show UI Action")) return "showUI";
    if (section.includes("Door State Action")) return "doorState";
    return "dummy"; // Default to "dummy" if no match is found
}

export function parseParamsFromScript(section, type) {
    const params = {};

    const getMatch = (regex, defaultValue = null) => {
        const match = section.match(regex);
        return match ? match[1] : defaultValue;
    };

    switch (type) {
        case "camera":
            params.x = parseFloat(getMatch(/x: (\d+\.?\d*)/, 0));
            params.y = parseFloat(getMatch(/y: (\d+\.?\d*)/, 0));
            params.scale = parseFloat(getMatch(/scale: (\d+\.?\d*)/, 1));
            params.duration = parseInt(getMatch(/duration: (\d+)/, 1000));
            break;
        case "wait":
            params.duration = parseInt(getMatch(/setTimeout\(resolve, (\d+)\)/, 1000));
            break;
        case "switchScene":
            params.sceneId = getMatch(/get\("(.+?)"\)/, "");
            break;
        case "tokenMovement":
            params.id = getMatch(/get\("(.+?)"\)/, "");
            params.x = parseFloat(getMatch(/x: (\d+\.?\d*)/, 0));
            params.y = parseFloat(getMatch(/y: (\d+\.?\d*)/, 0));
            params.rotation = parseFloat(getMatch(/rotation: (\d+\.?\d*)/, 0));
            params.teleport = section.includes("Token Teleport Action");
            params.animatePan = section.includes("animatePan");
            params.waitForCompletion = section.includes("await new Promise(resolve => setTimeout(resolve");
            break;
        case "showHideToken":
            params.tokenId = getMatch(/canvas\.tokens\.get\("(.+?)"\)/, "");
            params.async = getMatch(/async: (true|false)/, "false") === "true";
            break;
        case "tileMovement":
            params.tileId = getMatch(/get\("(.+?)"\)/, "");
            params.x = parseFloat(getMatch(/x: (\d+\.?\d*)/, 0));
            params.y = parseFloat(getMatch(/y: (\d+\.?\d*)/, 0));
            params.rotation = parseFloat(getMatch(/rotation: (\d+\.?\d*)/, 0));
            params.animatePan = section.includes("animateTilePan");
            break;
        case "doorState":
            params.wallId = getMatch(/get\("(.+?)"\)/, "");
            params.doorState = getMatch(/ds: (0|1|2)/, "0");
            break;
        case "screenShake":
            params.duration = parseInt(getMatch(/duration: (\d+)/, 1000));
            params.speed = parseInt(getMatch(/speed: (\d+)/, 10));
            params.intensity = parseInt(getMatch(/intensity: (\d+)/, 5));
            break;
        case "screenFlash":
            params.color = getMatch(/backgroundColor = "(.+?)"/, "#FFFFFF");
            params.opacity = parseFloat(getMatch(/opacity = (\d+\.?\d*)/, 0.5));
            params.duration = parseInt(getMatch(/duration = (\d+)/, 1000));
            break;
        case "runMacro":
            params.macroName = getMatch(/find\(m => m\.name === "(.+?)"\)/, "");
            break;
        case "imageDisplay":
            params.imageUrl = getMatch(/new ImagePopout\("(.+?)"/, "");
            break;
        case "animation":
            params.animationUrl = getMatch(/file\("(.+?)"\)/, "");
            params.scale = parseFloat(getMatch(/scale\((\d+\.?\d*)\)/, 1));
            params.rotation = parseInt(getMatch(/rotate\((\d+\.?\d*)\)/, 0));
            params.duration = parseInt(getMatch(/duration\((\d+)\)/, 1000));
            params.sourceTokenId = getMatch(/attachTo\(canvas\.tokens\.get\("(.+?)"\)\)/, null);
            params.targetTokenId = getMatch(/stretchTo\(canvas\.tokens\.get\("(.+?)"\)\)/, null);
            break;
        case "fadeOut":
            params.fadeDuration = parseInt(getMatch(/fadeDuration: (\d+)/, 2000));
            break;
        case "fadeIn":
            params.fadeDuration = parseInt(getMatch(/fadeDuration: (\d+)/, 2000));
            break;
        case "hideUI":
            params.duration = parseInt(getMatch(/duration: (\d+)/, 500));
            break;
        case "showUI":
            params.duration = parseInt(getMatch(/duration: (\d+)/, 500));
            break;
        case "playAudio":
            params.audioFilePath = getMatch(/src: "(.+?)"/, "");
            params.soundType = getMatch(/soundType: "(.+?)"/, "music");
            break;
        case "tokenSay":
            params.tokenId = getMatch(/canvas\.tokens\.get\("(.+?)"\)/, "");
            params.message = getMatch(/content: "(.+?)"/, "");
            break;
        default:
            break;
    }

    return params;
}

export function generateDescription(type, section) {
    const getMatch = (regex, defaultValue = "") => {
        const match = section.match(regex);
        return match ? match[1] : defaultValue;
    };

    switch (type) {
        case "camera":
            const camX = getMatch(/x: (\d+\.?\d*)/, 0);
            const camY = getMatch(/y: (\d+\.?\d*)/, 0);
            const camScale = getMatch(/scale: (\d+\.?\d*)/, 1);
            const camDuration = getMatch(/duration: (\d+)/, 1000);
            return `Camera Position (X: ${camX}, Y: ${camY}, Zoom: ${camScale}, Duration: ${camDuration}ms)`;
        case "wait":
            const waitDuration = getMatch(/setTimeout\(resolve, (\d+)\)/, 1000);
            return `Wait for ${waitDuration} ms`;
        case "switchScene":
            const sceneId = getMatch(/get\("(.+?)"\)/, "");
            return `Switch Scene to (ID: ${sceneId})`;
        case "tokenMovement":
            const tokenId = getMatch(/get\("(.+?)"\)/, "");
            const tokenX = getMatch(/x: (\d+\.?\d*)/, 0);
            const tokenY = getMatch(/y: (\d+\.?\d*)/, 0);
            const tokenRotation = getMatch(/rotation: (\d+\.?\d*)/, 0);
            return section.includes("Token Teleport Action")
                ? `Token Teleport (X: ${tokenX}, Y: ${tokenY}, Rotation: ${tokenRotation}°)`
                : `Token Movement (X: ${tokenX}, Y: ${tokenY}, Rotation: ${tokenRotation}°, Pan: ${section.includes("animatePan") ? 'Yes' : 'No'})`;
        case "showHideToken":
            const tokenIdSingle = getMatch(/canvas\.tokens\.get\("(.+?)"\)/, "");
            const asyncSingle = getMatch(/async: (true|false)/, "false");
            return `Show/Hide Token (ID: ${tokenIdSingle}, Async: ${asyncSingle === "true" ? "Yes" : "No"})`;
        case "tileMovement":
            const tileId = getMatch(/tileId: "(.+?)"/, "");
            const tileX = getMatch(/x: (\d+\.?\d*)/, 0);
            const tileY = getMatch(/y: (\d+\.?\d*)/, 0);
            const tileRotation = getMatch(/rotation: (\d+\.?\d*)/, 0);
            const tilePan = getMatch(/animatePan: (true|false)/, "false");
            return `Tile Movement (X: ${tileX}, Y: ${tileY}, Rotation: ${tileRotation}°, Pan: ${tilePan === "true" ? 'Yes' : 'No'})`;
        case "doorState":
            const doorState = getMatch(/ds: (0|1|2)/, "0");
            const doorStateText = doorState === "1" ? "Open" : doorState === "2" ? "Locked" : "Closed";
            return `Door State (State: ${doorStateText})`;
        case "screenShake":
            const shakeDuration = getMatch(/duration: (\d+)/, 1000);
            const shakeSpeed = getMatch(/speed: (\d+)/, 10);
            const shakeIntensity = getMatch(/intensity: (\d+)/, 5);
            return `Screen Shake (Duration: ${shakeDuration}ms, Speed: ${shakeSpeed}, Intensity: ${shakeIntensity}px)`;
        case "screenFlash":
            const flashColor = getMatch(/backgroundColor = "(.+?)"/, "#FFFFFF");
            const flashOpacity = getMatch(/opacity = (\d+\.?\d*)/, 0.5);
            const flashDuration = getMatch(/duration = (\d+)/, 1000);
            return `Screen Flash (Color: ${flashColor}, Opacity: ${flashOpacity}, Duration: ${flashDuration}ms)`;
        case "runMacro":
            const macroName = getMatch(/find\(m => m\.name === "(.+?)"\)/, "");
            return `Run Macro: ${macroName}`;
        case "imageDisplay":
            const imageUrl = getMatch(/new ImagePopout\("(.+?)"/, "");
            return `Display Image: ${imageUrl}`;
        case "animation":
            const animationUrl = getMatch(/file\("(.+?)"\)/, "");
            const animationScale = getMatch(/scale\((\d+\.?\d*)\)/, 1);
            const animationRotation = getMatch(/rotate\((\d+\.?\d*)\)/, 0);
            const animationDuration = getMatch(/duration\((\d+)\)/, 1000);
            return `Play Animation (URL: ${animationUrl}, Scale: ${animationScale}, Rotation: ${animationRotation}, Duration: ${animationDuration}ms)`;
        case "fadeOut":
            const fadeOutDuration = getMatch(/fadeDuration: (\d+)/, 2000);
            return `Fade Out (Duration: ${fadeOutDuration}ms)`;
        case "fadeIn":
            const fadeInDuration = getMatch(/fadeDuration: (\d+)/, 2000);
            return `Fade In (Duration: ${fadeInDuration}ms)`;
        case "hideUI":
            const hideUIDuration = getMatch(/duration: (\d+)/, 500);
            return `Hide UI (Duration: ${hideUIDuration}ms)`;
        case "showUI":
            const showUIDuration = getMatch(/duration: (\d+)/, 500);
            return `Show UI (Duration: ${showUIDuration}ms)`;
        case "playAudio":
            const audioFilePath = getMatch(/src: "(.+?)"/, "");
            const soundType = getMatch(/soundType: "(.+?)"/, "music");
            return `Play Audio: ${audioFilePath} as ${soundType}`;
        case "tokenSay":
            const tokenMessage = getMatch(/content: "(.+?)"/, "");
            return `Token says: ${tokenMessage}`;
        default:
            return "Unregistered Action"; // Default to a generic description
    }
}

export function reconstructActions(parsedActions) {
    const cutsceneActions = getCutsceneActions();
    parsedActions.forEach((action, index) => {
        const actionId = `action-${cutsceneActions.length + index}`;
        cutsceneActions.push({
            id: actionId,
            type: action.type,
            params: action.params,
            description: action.description
        });
    });
    setCutsceneActions(cutsceneActions);
    updateActionList(cutsceneActions);
}

export function importScript(script) {
    const parsedActions = parseScript(script);
    reconstructActions(parsedActions);
}
