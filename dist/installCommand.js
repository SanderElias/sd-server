"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const loadImage_1 = require("./loadImage");
const streamDeck_1 = require("./streamDeck");
exports.cmdList = new Map();
function installCommand(cmd) {
    const { tile, modifier, action } = cmd;
    const listen = modifier ? modifier(tile) : streamDeck_1.click(tile);
    listen.subscribe(action);
    exports.cmdList.set(tile, cmd);
    loadImage_1.loadImage(cmd);
}
exports.installCommand = installCommand;
