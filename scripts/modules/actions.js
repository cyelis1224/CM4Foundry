import { generateUniqueId, updateActionList, updateAction } from './utilities.js';
import { getCutsceneActions, setCutsceneActions } from './cutsceneState.js';

export function addCameraPositionAction(cutsceneActions, existingAction = null) {
    console.log("Add Camera Position Action");
    const action = existingAction || {};
    let currentX, currentY, currentZoom;

    const updateCurrentPosition = () => {
        const viewPosition = canvas.scene._viewPosition;
        currentX = viewPosition.x;
        currentY = viewPosition.y;
        currentZoom = viewPosition.scale;
    };

    if (!action.params) {
        updateCurrentPosition();
    } else {
        currentX = action.params.x;
        currentY = action.params.y;
        currentZoom = action.params.scale;
    }

    const dialog = new Dialog({
        title: "Camera Position Action",
        content: `
            <form>
                <div class="form-group">
                    <label for="cameraX">Camera X:</label>
                    <input type="number" id="cameraX" name="cameraX" value="${currentX}" style="width: 100%;">
                </div>
                <div class="form-group">
                    <label for="cameraY">Camera Y:</label>
                    <input type="number" id="cameraY" name="cameraY" value="${currentY}" style="width: 100%;">
                </div>
                <div class="form-group">
                    <label for="cameraZoom">Zoom Level:</label>
                    <input type="number" id="cameraZoom" name="cameraZoom" value="${currentZoom}" step="0.1" style="width: 100%;">
                </div>
                <div class="form-group">
                    <label for="panDuration">Pan Duration (in milliseconds):</label>
                    <input type="number" id="panDuration" name="panDuration" value="${action.params ? action.params.duration : 1000}" step="100" style="width: 100%;">
                </div>
                <button type="button" id="getCurrentPosition" style="width: 100%;">Get Current Camera Position</button>
            </form>
            <p>Specify the camera position and zoom level, or copy the current screen position.</p>
        `,
        buttons: {
            ok: {
                label: "OK",
                callback: html => {
                    const x = parseFloat(html.find("#cameraX").val());
                    const y = parseFloat(html.find("#cameraY").val());
                    const scale = parseFloat(html.find("#cameraZoom").val());
                    const duration = parseInt(html.find("#panDuration").val());
                    const params = { x, y, scale, duration };
                    const description = `Camera Position (X: ${x}, Y: ${y}, Zoom: ${scale}, Duration: ${duration}ms)`;

                    if (existingAction) {
                        updateAction(cutsceneActions, existingAction.id, params, description);
                    } else {
                        const actionId = generateUniqueId();
                        cutsceneActions.push({ id: actionId, description, type: "camera", params });
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
        default: "ok",
        render: html => {
            console.log("Dialog rendered: Camera Position Action");
            html.find("#getCurrentPosition").click(() => {
                updateCurrentPosition();
                html.find("#cameraX").val(currentX);
                html.find("#cameraY").val(currentY);
                html.find("#cameraZoom").val(currentZoom);
            });
        }
    });

    dialog.render(true);
}

export function addSwitchSceneAction(cutsceneActions, existingAction = null) {
    console.log("Add Switch Scene Action");
    const action = existingAction || {};
    const dialog = new Dialog({
        title: "Switch Scene",
        content: `
            <form>
                <div class="form-group">
                    <label for="sceneId">Scene ID:</label>
                    <input type="text" id="sceneId" name="sceneId" value="${action.params ? action.params.sceneId : ''}" placeholder="Enter the scene ID here" style="width: 100%;">
                </div>
            </form>
            <p>Enter the ID of the scene you wish to switch to.</p>
        `,
        buttons: {
            ok: {
                label: "OK",
                callback: html => {
                    const sceneId = html.find("#sceneId").val();
                    const scene = game.scenes.get(sceneId);
                    const sceneName = scene ? scene.name : "Unknown Scene";
                    const params = { sceneId };
                    const description = `Switch Scene to ${sceneName} (ID: ${sceneId})`;

                    if (existingAction) {
                        updateAction(cutsceneActions, existingAction.id, params, description);
                    } else {
                        const actionId = generateUniqueId();
                        cutsceneActions.push({ id: actionId, description, type: "switchScene", params });
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
        default: "ok",
        render: html => {
            console.log("Dialog rendered: Switch Scene Action");
        }
    });

    dialog.render(true);
}

export function addTokenMovementAction(cutsceneActions, existingAction = null) {
    console.log("Add Token Movement Action");
    const action = existingAction || {};
    const selectedTokenId = canvas.tokens.controlled.length === 1 ? canvas.tokens.controlled[0].id : (action.params ? action.params.id : "");
    const waitForCompletionChecked = action.params && typeof action.params.waitForCompletion !== 'undefined' ? action.params.waitForCompletion : true;
    
    const dialog = new Dialog({
        title: "Token Movement",
        content: `
            <form>
                <div class="form-group">
                    <label for="tokenId">Token ID:</label>
                    <input type="text" id="tokenId" name="tokenId" value="${selectedTokenId}" style="width: 100%;">
                </div>
                <button type="button" id="getSelectedToken" style="width: 100%;">Get currently selected token</button>
                <div class="form-group">
                    <label for="animatePan">Enable Screen Panning:</label>
                    <input type="checkbox" id="animatePan" name="animatePan" value="1" ${action.params && action.params.animatePan ? 'checked' : ''} style="margin-top: 5px;">
                    <p style="font-size: 0.8em; margin-top: 5px;">Camera Panning.</p>
                </div>
                <div class="form-group">
                    <label for="teleport">Teleport:</label>
                    <input type="checkbox" id="teleport" name="teleport" ${action.params && action.params.teleport ? 'checked' : ''} style="margin-top: 5px;">
                    <p style="font-size: 0.8em; margin-top: 5px;">Instantly move to the new position without animation.</p>
                </div>
                <div class="form-group">
                    <label for="tokenRotation">Token Rotation (in degrees):</label>
                    <input type="number" id="tokenRotation" name="tokenRotation" value="${action.params ? action.params.rotation : 0}" step="1" style="width: 100%;">
                </div>
                <div class="form-group">
                    <label for="movementSpeed">Movement Speed (pixels per second):</label>
                    <input type="number" id="movementSpeed" name="movementSpeed" value="${action.params ? action.params.speed : 200}" step="10" style="width: 100%;">
                </div>
                <div class="form-group">
                    <label for="waitForCompletion">Wait for Completion:</label>
                    <input type="checkbox" id="waitForCompletion" name="waitForCompletion" ${waitForCompletionChecked ? 'checked' : ''} style="margin-top: 5px;">
                    <p style="font-size: 0.8em; margin-top: 5px;">Wait for movement to complete before proceeding.</p>
                </div>
            </form>
        `,
        buttons: {
            ok: {
                label: "OK",
                callback: html => {
                    const tokenId = html.find("#tokenId").val();
                    const newPosition = { x: canvas.tokens.get(tokenId)?.x || 0, y: canvas.tokens.get(tokenId)?.y || 0 };
                    const newRotation = parseFloat(html.find("#tokenRotation").val());
                    const animatePan = html.find("#animatePan")[0].checked;
                    const teleport = html.find("#teleport")[0].checked;
                    const speed = parseFloat(html.find("#movementSpeed").val());
                    const waitForCompletion = html.find("#waitForCompletion")[0].checked;
                    const params = { id: tokenId, x: newPosition.x, y: newPosition.y, rotation: newRotation, animatePan, teleport, speed, waitForCompletion };
                    const description = teleport
                        ? `Token Teleport (X: ${params.x}, Y: ${params.y}, Rotation: ${params.rotation}°)`
                        : `Token Movement (X: ${params.x}, Y: ${params.y}, Rotation: ${params.rotation}°, Speed: ${params.speed}px/s, Pan: ${params.animatePan ? 'Yes' : 'No'})`;

                    if (existingAction) {
                        updateAction(cutsceneActions, existingAction.id, params, description);
                    } else {
                        const actionId = generateUniqueId();
                        cutsceneActions.push({ id: actionId, description, type: "tokenMovement", params });
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
        default: "ok",
        render: html => {
            console.log("Dialog rendered: Token Movement Action");
            html.find("#getSelectedToken").click(() => {
                if (canvas.tokens.controlled.length === 1) {
                    html.find("#tokenId").val(canvas.tokens.controlled[0].id);
                } else {
                    ui.notifications.warn("Please select exactly one token.");
                }
            });
        }
    });

    dialog.render(true);
}

export function addTokenSayAction(cutsceneActions, existingAction = null) {
    console.log("Add Token Say Action");
    const action = existingAction || {};
    const selectedTokenId = canvas.tokens.controlled.length === 1 ? canvas.tokens.controlled[0].id : (action.params ? action.params.tokenId : "");

    const dialog = new Dialog({
        title: "Token Say",
        content: `
            <form>
                <div class="form-group">
                    <label for="tokenId">Token ID:</label>
                    <input type="text" id="tokenId" name="tokenId" value="${selectedTokenId}" style="width: 100%;">
                </div>
                <button type="button" id="getSelectedToken" style="width: 100%;">Get currently selected token</button>
                <div class="form-group">
                    <label for="tokenMessage">Message:</label>
                    <textarea id="tokenMessage" name="tokenMessage" style="width: 100%;" rows="4">${action.params ? action.params.message : ''}</textarea>
                </div>
            </form>
        `,
        buttons: {
            ok: {
                label: "OK",
                callback: html => {
                    const tokenId = html.find("#tokenId").val();
                    const message = html.find("#tokenMessage").val();
                    const params = { tokenId, message };
                    const description = `Token ${tokenId} says: ${message}`;

                    if (existingAction) {
                        updateAction(cutsceneActions, existingAction.id, params, description);
                    } else {
                        const actionId = generateUniqueId();
                        cutsceneActions.push({ id: actionId, description, type: "tokenSay", params });
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
        default: "ok",
        render: html => {
            console.log("Dialog rendered: Token Say Action");
            html.find("#getSelectedToken").click(() => {
                if (canvas.tokens.controlled.length === 1) {
                    html.find("#tokenId").val(canvas.tokens.controlled[0].id);
                } else {
                    ui.notifications.warn("Please select exactly one token.");
                }
            });
        }
    });

    dialog.render(true);
}

export function addPlayAudioAction(cutsceneActions, existingAction = null) {
    console.log("Add Play Audio Action");
    const action = existingAction || {};
    const soundType = action.params ? action.params.soundType : 'music';
    const volume = action.params ? action.params.volume : 0.8;
    const repeat = action.params ? action.params.repeat : false;
    const fadeDuration = action.params ? action.params.fadeDuration : 0;

    const dialog = new Dialog({
        title: "Play Audio",
        content: `
            <form>
                <div class="form-group">
                    <label for="audioFile">Audio File:</label>
                    <input type="text" id="audioFilePath" name="audioFilePath" value="${action.params ? action.params.audioFilePath : ''}" placeholder="Select an audio file" style="width: 100%;">
                </div>
                <button type="button" id="browseAudio" style="width: 100%;">Browse Audio Files</button>
                <div class="form-group">
                    <label for="soundType">Audio Channel:</label>
                    <select id="soundType" name="soundType" style="width: 100%;">
                        <option value="music" ${soundType === 'music' ? 'selected' : ''}>Music</option>
                        <option value="environment" ${soundType === 'environment' ? 'selected' : ''}>Environment</option>
                        <option value="interface" ${soundType === 'interface' ? 'selected' : ''}>Interface</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="volume">Sound Volume:</label>
                    <input type="range" id="volume" name="volume" min="0" max="1" step="0.01" value="${volume}" style="width: 100%;">
                </div>
                <div class="form-group">
                    <label for="repeat">Repeat:</label>
                    <input type="checkbox" id="repeat" name="repeat" ${repeat ? 'checked' : ''}>
                </div>
                <div class="form-group">
                    <label for="fadeDuration">Fade Duration (ms):</label>
                    <input type="number" id="fadeDuration" name="fadeDuration" value="${fadeDuration}" step="100" style="width: 100%;">
                </div>
            </form>
        `,
        buttons: {
            ok: {
                label: "OK",
                callback: html => {
                    const audioFilePath = html.find("#audioFilePath").val();
                    const soundType = html.find("#soundType").val();
                    const volume = parseFloat(html.find("#volume").val());
                    const repeat = html.find("#repeat").is(":checked");
                    const fadeDuration = parseInt(html.find("#fadeDuration").val());
                    const params = { audioFilePath, soundType, volume, repeat, fadeDuration };
                    const description = `Play Audio: ${audioFilePath} (${soundType})`;

                    if (existingAction) {
                        updateAction(cutsceneActions, existingAction.id, params, description);
                    } else {
                        const actionId = generateUniqueId();
                        cutsceneActions.push({ id: actionId, description, type: "playAudio", params });
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
        default: "ok",
        render: html => {
            console.log("Dialog rendered: Play Audio Action");
            html.find("#browseAudio").click(async () => {
                const filePicker = new FilePicker({
                    type: "audio",
                    callback: path => {
                        html.find("#audioFilePath").val(path);
                    }
                });
                filePicker.browse();
            });
        }
    });

    dialog.render(true);
}

export function addDoorStateAction(cutsceneActions, existingAction = null) {
    console.log("Add Door State Action");
    const action = existingAction || {};
    const selectedWallId = canvas.walls.controlled.length === 1 ? canvas.walls.controlled[0].id : (action.params ? action.params.wallId : "");
    const doorState = action.params && typeof action.params.doorState !== 'undefined' ? action.params.doorState : "0";

    const dialog = new Dialog({
        title: "Door State Action",
        content: `
            <form>
                <div class="form-group">
                    <label for="wallId">Wall ID:</label>
                    <input type="text" id="wallId" name="wallId" value="${selectedWallId}" style="width: 100%;">
                </div>
                <button type="button" id="getSelectedWall" style="width: 100%;">Get currently selected wall</button>
                <div class="form-group">
                    <label for="doorState">Door State:</label>
                    <select id="doorState" name="doorState" style="width: 100%;">
                        <option value="0" ${doorState === "0" ? "selected" : ""}>Closed</option>
                        <option value="1" ${doorState === "1" ? "selected" : ""}>Open</option>
                        <option value="2" ${doorState === "2" ? "selected" : ""}>Locked</option>
                    </select>
                </div>
            </form>
        `,
        buttons: {
            ok: {
                label: "OK",
                callback: html => {
                    const wallId = html.find("#wallId").val();
                    const doorState = html.find("#doorState").val();
                    const params = { wallId, doorState };
                    const description = `Door State (State: ${doorState === "1" ? "Open" : doorState === "2" ? "Locked" : "Closed"})`;

                    if (existingAction) {
                        updateAction(cutsceneActions, existingAction.id, params, description);
                    } else {
                        const actionId = generateUniqueId();
                        cutsceneActions.push({ id: actionId, description, type: "doorState", params });
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
        default: "ok",
        render: html => {
            console.log("Dialog rendered: Door State Action");
            html.find("#getSelectedWall").click(() => {
                if (canvas.walls.controlled.length === 1) {
                    const wall = canvas.walls.controlled[0];
                    html.find("#wallId").val(wall.id);
                } else {
                    ui.notifications.warn("Please select exactly one wall.");
                }
            });
        }
    });

    dialog.render(true);
}

export function addWaitAction(cutsceneActions, existingAction = null) {
    console.log("Add Wait Action");
    const action = existingAction || {};
    const dialog = new Dialog({
        title: "Wait Duration",
        content: `
            <form>
                <div class="form-group">
                    <label for="waitDuration">Enter wait duration in milliseconds:</label>
                    <input type="number" id="waitDuration" name="waitDuration" min="0" step="100" value="${action.params ? action.params.duration : 1000}" style="width: 100%;">
                </div>
            </form>
        `,
        buttons: {
            ok: {
                label: "OK",
                callback: html => {
                    const duration = parseInt(html.find("#waitDuration").val());
                    const params = { duration };
                    const description = `Wait for ${duration} ms`;

                    if (existingAction) {
                        updateAction(cutsceneActions, existingAction.id, params, description);
                    } else {
                        const actionId = generateUniqueId();
                        cutsceneActions.push({ id: actionId, description, type: "wait", params });
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
        default: "ok",
        render: html => {
            console.log("Dialog rendered: Wait Duration");
            setTimeout(() => {}, 0);
        }
    });

    dialog.render(true);
}

export function addTileMovementAction(cutsceneActions, existingAction = null) {
    console.log("Add Tile Movement Action");
    const action = existingAction || {};
    const selectedTile = canvas.tiles.controlled.length === 1 ? canvas.tiles.controlled[0] : null;
    const selectedTileId = selectedTile ? selectedTile.id : (action.params ? action.params.tileId : "");
    const selectedTileX = selectedTile ? selectedTile.x : (action.params ? action.params.x : 0);
    const selectedTileY = selectedTile ? selectedTile.y : (action.params ? action.params.y : 0);

    const dialog = new Dialog({
        title: "Tile Movement",
        content: `
            <form>
                <div class="form-group">
                    <label for="tileId">Tile ID:</label>
                    <input type="text" id="tileId" name="tileId" value="${selectedTileId}" style="width: 100%;">
                </div>
                <button type="button" id="getSelectedTile" style="width: 100%;">Get currently selected tile</button>
                <div class="form-group">
                    <label for="tileX">Tile X:</label>
                    <input type="number" id="tileX" name="tileX" value="${selectedTileX}" style="width: 100%;">
                </div>
                <div class="form-group">
                    <label for="tileY">Tile Y:</label>
                    <input type="number" id="tileY" name="tileY" value="${selectedTileY}" style="width: 100%;">
                </div>
                <div class="form-group">
                    <label for="tileRotation">Tile Rotation (in degrees):</label>
                    <input type="number" id="tileRotation" name="tileRotation" value="${action.params ? action.params.rotation : 0}" step="1" style="width: 100%;">
                </div>
                <div class="form-group">
                    <label for="animateTilePan">Enable Screen Panning:</label>
                    <input type="checkbox" id="animateTilePan" name="animateTilePan" value="1" ${action.params && action.params.animatePan ? 'checked' : ''} style="margin-top: 5px;">
                    <p style="font-size: 0.8em; margin-top: 5px;">Camera Panning.</p>
                </div>
            </form>
        `,
        buttons: {
            ok: {
                label: "OK",
                callback: html => {
                    const tileId = html.find("#tileId").val();
                    const newPosition = { x: parseFloat(html.find("#tileX").val()), y: parseFloat(html.find("#tileY").val()) };
                    const newRotation = parseFloat(html.find("#tileRotation").val());
                    const animatePan = html.find("#animateTilePan")[0].checked;
                    const params = { tileId, x: newPosition.x, y: newPosition.y, rotation: newRotation, animatePan };
                    const description = `Tile Movement (X: ${newPosition.x}, Y: ${newPosition.y}, Rotation: ${newRotation}°, Pan: ${animatePan ? 'Yes' : 'No'})`;

                    if (existingAction) {
                        updateAction(cutsceneActions, existingAction.id, params, description);
                    } else {
                        const actionId = generateUniqueId();
                        cutsceneActions.push({ id: actionId, description, type: "tileMovement", params });
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
        default: "ok",
        render: html => {
            console.log("Dialog rendered: Tile Movement Action");
            html.find("#getSelectedTile").click(() => {
                if (canvas.tiles.controlled.length === 1) {
                    const tile = canvas.tiles.controlled[0];
                    html.find("#tileId").val(tile.id);
                    html.find("#tileX").val(tile.x);
                    html.find("#tileY").val(tile.y);
                } else {
                    ui.notifications.warn("Please select exactly one tile.");
                }
            });
        }
    });

    dialog.render(true);
}

export function addScreenFlashAction(cutsceneActions, existingAction = null) {
    console.log("Add Screen Flash Action");
    const action = existingAction || {};
    const dialog = new Dialog({
        title: "Add Screen Flash Effect",
        content: `
            <form>
                <div class="form-group">
                    <label for="flashColor">Flash Color (hex):</label>
                    <input type="text" id="flashColor" name="flashColor" value="${action.params ? action.params.color : '#FFFFFF'}" placeholder="#FFFFFF" style="width: 100%;">
                </div>
                <div class="form-group">
                    <label for="flashOpacity">Opacity (0.0 - 1.0):</label>
                    <input type="number" id="flashOpacity" name="flashOpacity" step="0.1" min="0.0" max="1.0" value="${action.params ? action.params.opacity : 0.5}" style="width: 100%;">
                </div>
                <div class="form-group">
                    <label for="flashDuration">Duration (milliseconds):</label>
                    <input type="number" id="flashDuration" name="flashDuration" step="100" min="100" value="${action.params ? action.params.duration : 1000}" style="width: 100%;">
                </div>
            </form>
        `,
        buttons: {
            ok: {
                label: "OK",
                callback: html => {
                    const color = html.find("#flashColor").val();
                    const opacity = parseFloat(html.find("#flashOpacity").val());
                    const duration = parseInt(html.find("#flashDuration").val());
                    const params = { color, opacity, duration };
                    const description = `Screen Flash (Color: ${color}, Opacity: ${opacity}, Duration: ${duration}ms)`;

                    if (existingAction) {
                        updateAction(cutsceneActions, existingAction.id, params, description);
                    } else {
                        const actionId = generateUniqueId();
                        cutsceneActions.push({ id: actionId, description, type: "screenFlash", params });
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
        default: "ok",
        render: html => {
            console.log("Dialog rendered: Screen Flash Action");
        }
    });

    dialog.render(true);
}

export function addScreenShakeAction(cutsceneActions, existingAction = null) {
    console.log("Add Screen Shake Action");
    const action = existingAction || {};
    const dialog = new Dialog({
        title: "Add Screen Shake Effect",
        content: `
            <form>
                <div class="form-group">
                    <label for="shakeDuration">Duration (milliseconds):</label>
                    <input type="number" id="shakeDuration" name="shakeDuration" value="${action.params ? action.params.duration : 1000}" step="100" min="100" style="width: 100%;">
                </div>
                <div class="form-group">
                    <label for="shakeSpeed">Speed (frequency of shakes):</label>
                    <input type="number" id="shakeSpeed" name="shakeSpeed" value="${action.params ? action.params.speed : 10}" step="1" min="1" style="width: 100%;">
                </div>
                <div class="form-group">
                    <label for="shakeIntensity">Intensity (pixel displacement):</label>
                    <input type="number" id="shakeIntensity" name="shakeIntensity" value="${action.params ? action.params.intensity : 5}" step="1" min="1" style="width: 100%;">
                </div>
            </form>
        `,
        buttons: {
            ok: {
                label: "OK",
                callback: html => {
                    const duration = parseInt(html.find("#shakeDuration").val());
                    const speed = parseInt(html.find("#shakeSpeed").val());
                    const intensity = parseInt(html.find("#shakeIntensity").val());
                    const params = { duration, speed, intensity };
                    const description = `Screen Shake (Duration: ${duration}ms, Speed: ${speed}, Intensity: ${intensity}px)`;

                    if (existingAction) {
                        updateAction(cutsceneActions, existingAction.id, params, description);
                    } else {
                        const actionId = generateUniqueId();
                        cutsceneActions.push({ id: actionId, description, type: "screenShake", params });
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
        default: "ok",
        render: html => {
            console.log("Dialog rendered: Add Screen Shake Action");
            setTimeout(() => {}, 0);
        }
    });

    dialog.render(true);
}

export function addRunMacroAction(cutsceneActions, existingAction = null) {
    console.log("Add Run Macro Action");
    const action = existingAction || {};
    const dialog = new Dialog({
        title: "Run Macro Action",
        content: `
            <form>
                <div class="form-group">
                    <label for="macroName">Macro Name:</label>
                    <input type="text" id="macroName" name="macroName" value="${action.params ? action.params.macroName : ''}" placeholder="Enter macro name here" style="width: 100%;">
                </div>
            </form>
            <p>Enter the name of the macro you wish to run.</p>
        `,
        buttons: {
            ok: {
                label: "OK",
                callback: html => {
                    const macroName = html.find("#macroName").val();
                    const params = { macroName };
                    const description = `Run Macro: ${macroName}`;

                    if (existingAction) {
                        updateAction(cutsceneActions, existingAction.id, params, description);
                    } else {
                        const actionId = generateUniqueId();
                        cutsceneActions.push({ id: actionId, description, type: "runMacro", params });
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
        default: "ok",
        render: html => {
            console.log("Dialog rendered: Run Macro Action");
        }
    });

    dialog.render(true);
}

export function addImageDisplayAction(cutsceneActions, existingAction = null) {
    console.log("Add Image Display Action");
    const action = existingAction || {};
    const dialog = new Dialog({
        title: "Add Image Display Action",
        content: `
            <form>
                <div class="form-group">
                    <label for="imageUrl">Image URL:</label>
                    <input type="text" id="imageUrl" name="imageUrl" value="${action.params ? action.params.imageUrl : ''}" placeholder="http://example.com/image.png" style="width: 100%;">
                </div>
                <button type="button" id="browseImage" style="width: 100%;">Select File</button>
            </form>
        `,
        buttons: {
            ok: {
                label: "OK",
                callback: html => {
                    const imageUrl = html.find("#imageUrl").val();
                    const params = { imageUrl };
                    const description = `Display Image: ${imageUrl}`;

                    if (existingAction) {
                        updateAction(cutsceneActions, existingAction.id, params, description);
                    } else {
                        const actionId = generateUniqueId();
                        cutsceneActions.push({ id: actionId, description, type: "imageDisplay", params });
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
        default: "ok",
        render: html => {
            console.log("Dialog rendered: Image Display Action");
            html.find("#browseImage").click(async () => {
                const filePicker = new FilePicker({
                    type: "image",
                    callback: path => {
                        html.find("#imageUrl").val(path);
                    }
                });
                filePicker.browse();
            });
        }
    });

    dialog.render(true);
}

// export function addAnimationAction(cutsceneActions, existingAction = null) {
//     console.log("Add Animation Action");
//     if (canvas.tokens.controlled.length === 0) {
//         ui.notifications.warn("Please select a token.");
//         return;
//     }
//     const sourceToken = canvas.tokens.controlled[0];
//     let targetedTokens = Array.from(game.user.targets);
//     let targetToken = targetedTokens.length > 0 ? targetedTokens[0] : null;

//     const action = existingAction || {};
//     const dialog = new Dialog({
//         title: "Add Animation",
//         content: `
//             <form>
//                 <div class="form-group">
//                     <label for="animationUrl">Animation URL:</label>
//                     <input type="text" id="animationUrl" name="animationUrl" value="${action.params ? action.params.animationUrl : ''}" placeholder="https://example.com/animation.webm" style="width: 100%;">
//                 </div>
//                 <div class="form-group">
//                     <label for="scale">Scale:</label>
//                     <input type="number" id="scale" name="scale" value="${action.params ? action.params.scale : 1}" step="0.1" min="0.1" style="width: 100%;">
//                 </div>
//                 <div class="form-group">
//                     <label for="rotation">Rotation (degrees):</label>
//                     <input type="number" id="rotation" name="rotation" value="${action.params ? action.params.rotation : 0}" step="1" style="width: 100%;">
//                 </div>
//                 <div class="form-group">
//                     <label for="duration">Duration (ms):</label>
//                     <input type="number" id="duration" name="duration" value="${action.params ? action.params.duration : 1000}" step="100" min="100" style="width: 100%;">
//                 </div>
//             </form>
//         `,
//         buttons: {
//             ok: {
//                 label: "OK",
//                 callback: html => {
//                     const animationUrl = html.find("#animationUrl").val();
//                     const scale = parseFloat(html.find("#scale").val());
//                     const rotation = parseInt(html.find("#rotation").val());
//                     const duration = parseInt(html.find("#duration").val());
//                     let sequencerScript = `
//                         // Animation Action
//                         // This script plays an animation from the specified URL. It either attaches the animation to a target token
//                         // or stretches the animation from the selected token to a target token, depending on the presence of a target token.
//                         new Sequence()`;

//                     if (targetToken) {
//                         sequencerScript += `
//                             // Stretch the animation from the selected token to the target token.
//                             .effect()
//                             .file("${animationUrl}") // URL of the animation file
//                             .attachTo(canvas.tokens.get("${sourceToken.id}")) // Attach the animation to the selected token
//                             .stretchTo(canvas.tokens.get("${targetToken.id}")) // Stretch the animation to the target token
//                             .scale(${scale}) // Scale of the animation
//                             .rotate(${rotation}) // Rotation of the animation in degrees
//                             .duration(${duration}) // Duration of the animation in milliseconds
//                             .play();`;
//                     } else {
//                         sequencerScript += `
//                             // Play the animation at the location of the selected token.
//                             .effect()
//                             .file("${animationUrl}") // URL of the animation file
//                             .atLocation(canvas.tokens.get("${sourceToken.id}")) // Play the animation at the selected token's location
//                             .scale(${scale}) // Scale of the animation
//                             .rotate(${rotation}) // Rotation of the animation in degrees
//                             .duration(${duration}) // Duration of the animation in milliseconds
//                             .play();`;
//                     }

//                     const params = { animationUrl, scale, rotation, duration, sourceTokenId: sourceToken.id, targetTokenId: targetToken ? targetToken.id : null };
//                     if (existingAction) {
//                         updateAction(existingAction.id, params, `Play Animation (URL: ${animationUrl}, Scale: ${scale}, Rotation: ${rotation}, Duration: ${duration}ms)`);
//                     } else {
//                         const actionId = generateUniqueId();
//                         cutsceneActions.push({ id: actionId, description: `Play Animation (URL: ${animationUrl}, Scale: ${scale}, Rotation: ${rotation}, Duration: ${duration}ms)`, type: "animation", params });
//                     }
//                     updateActionList(cutsceneActions);
//                 }
//             },
//             cancel: {
//                 label: "Cancel",
//                 callback: () => {}
//             }
//         },
//         default: "ok",
//         render: html => {
//             console.log("Dialog rendered: Add Animation Action");
//             setTimeout(() => {}, 0);
//         }
//     });

//     dialog.render(true);
// }

export function addFadeOutAction(cutsceneActions, existingAction = null) {
    console.log("Add Fade Out Action");
    const action = existingAction || {};
    const dialog = new Dialog({
        title: "Fade Out",
        content: `
            <form>
                <div class="form-group">
                    <label for="fadeOutDuration">Fade Out Duration (ms):</label>
                    <input type="number" id="fadeOutDuration" name="fadeOutDuration" value="${action.params ? action.params.fadeDuration : 2000}" step="100" style="width: 100%;">
                </div>
            </form>
        `,
        buttons: {
            ok: {
                label: "OK",
                callback: html => {
                    const fadeDuration = parseInt(html.find("#fadeOutDuration").val());
                    const params = { fadeDuration };
                    const description = `Fade Out (Duration: ${fadeDuration}ms)`;
                    if (existingAction) {
                        updateAction(cutsceneActions, existingAction.id, params, description);
                    } else {
                        const actionId = generateUniqueId();
                        cutsceneActions.push({ id: actionId, description, type: "fadeOut", params });
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
        default: "ok",
        render: html => {
            console.log("Dialog rendered: Fade Out Action");
        }
    });

    dialog.render(true);
}

export function addFadeInAction(cutsceneActions, existingAction = null) {
    console.log("Add Fade In Action");
    const action = existingAction || {};
    const dialog = new Dialog({
        title: "Fade In",
        content: `
            <form>
                <div class="form-group">
                    <label for="fadeInDuration">Fade In Duration (ms):</label>
                    <input type="number" id="fadeInDuration" name="fadeInDuration" value="${action.params ? action.params.fadeDuration : 2000}" step="100" style="width: 100%;">
                </div>
            </form>
        `,
        buttons: {
            ok: {
                label: "OK",
                callback: html => {
                    const fadeDuration = parseInt(html.find("#fadeInDuration").val());
                    const params = { fadeDuration };
                    const description = `Fade In (Duration: ${fadeDuration}ms)`;
                    if (existingAction) {
                        updateAction(cutsceneActions, existingAction.id, params, description);
                    } else {
                        const actionId = generateUniqueId();
                        cutsceneActions.push({ id: actionId, description, type: "fadeIn", params });
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
        default: "ok",
        render: html => {
            console.log("Dialog rendered: Fade In Action");
        }
    });

    dialog.render(true);
}

export function addHideUIAction(cutsceneActions, existingAction = null) {
    console.log("Add Hide UI Action");
    const action = existingAction || {};
    const dialog = new Dialog({
        title: "Hide UI",
        content: `
            <form>
                <div class="form-group">
                    <label for="hideUIDuration">Hide UI Duration (ms):</label>
                    <input type="number" id="hideUIDuration" name="hideUIDuration" value="${action.params ? action.params.duration : 500}" step="100" style="width: 100%;">
                </div>
            </form>
        `,
        buttons: {
            ok: {
                label: "OK",
                callback: html => {
                    const duration = parseInt(html.find("#hideUIDuration").val());
                    const params = { duration };
                    const description = `Hide UI (Duration: ${duration}ms)`;
                    if (existingAction) {
                        updateAction(cutsceneActions, existingAction.id, params, description);
                    } else {
                        const actionId = generateUniqueId();
                        cutsceneActions.push({ id: actionId, description, type: "hideUI", params });
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
        default: "ok",
        render: html => {
            console.log("Dialog rendered: Hide UI Action");
        }
    });

    dialog.render(true);
}

export function addShowUIAction(cutsceneActions, existingAction = null) {
    console.log("Add Show UI Action");
    const action = existingAction || {};
    const dialog = new Dialog({
        title: "Show UI",
        content: `
            <form>
                <div class="form-group">
                    <label for="showUIDuration">Show UI Duration (ms):</label>
                    <input type="number" id="showUIDuration" name="showUIDuration" value="${action.params ? action.params.duration : 500}" step="100" style="width: 100%;">
                </div>
            </form>
        `,
        buttons: {
            ok: {
                label: "OK",
                callback: html => {
                    const duration = parseInt(html.find("#showUIDuration").val());
                    const params = { duration };
                    const description = `Show UI (Duration: ${duration}ms)`;
                    if (existingAction) {
                        updateAction(cutsceneActions, existingAction.id, params, description);
                    } else {
                        const actionId = generateUniqueId();
                        cutsceneActions.push({ id: actionId, description, type: "showUI", params });
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
        default: "ok",
        render: html => {
            console.log("Dialog rendered: Show UI Action");
        }
    });

    dialog.render(true);
}

export function showHideAction(cutsceneActions, existingAction = null) {
    console.log("Add Show/Hide Token Action");
    const action = existingAction || {};
    const selectedTokenId = canvas.tokens.controlled.length === 1 ? canvas.tokens.controlled[0].id : (action.params ? action.params.tokenId : "");
    const isAsync = action.params && typeof action.params.async !== 'undefined' ? action.params.async : false;

    const dialog = new Dialog({
        title: "Show/Hide Token Action",
        content: `
            <form>
                <div class="form-group">
                    <label for="tokenId">Token ID:</label>
                    <input type="text" id="tokenId" name="tokenId" value="${selectedTokenId}" style="width: 100%;">
                </div>
                <button type="button" id="getSelectedToken" style="width: 100%;">Get currently selected token</button>
                <div class="form-group">
                    <label for="asyncAction">Asynchronous:</label>
                    <input type="checkbox" id="asyncAction" name="asyncAction" ${isAsync ? 'checked' : ''} style="margin-top: 5px;">
                    <p style="font-size: 0.8em; margin-top: 5px;">If checked, the action will run asynchronously.</p>
                </div>
            </form>
        `,
        buttons: {
            ok: {
                label: "OK",
                callback: html => {
                    const tokenId = html.find("#tokenId").val();
                    const asyncAction = html.find("#asyncAction")[0].checked;
                    const params = { tokenId, async: asyncAction };
                    const description = `Show/Hide Token (ID: ${tokenId}, Async: ${asyncAction ? 'Yes' : 'No'})`;

                    if (existingAction) {
                        updateAction(cutsceneActions, existingAction.id, params, description);
                    } else {
                        const actionId = generateUniqueId();
                        cutsceneActions.push({ id: actionId, description, type: "showHideToken", params });
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
        default: "ok",
        render: html => {
            console.log("Dialog rendered: Show/Hide Token Action");
            html.find("#getSelectedToken").click(() => {
                if (canvas.tokens.controlled.length === 1) {
                    html.find("#tokenId").val(canvas.tokens.controlled[0].id);
                } else {
                    ui.notifications.warn("Please select exactly one token.");
                }
            });
        }
    });

    dialog.render(true);
}
