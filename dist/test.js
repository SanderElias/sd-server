"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const open_1 = __importDefault(require("open"));
const i3_1 = require("./i3");
const installCommand_1 = require("./installCommand");
installCommand_1.installCommand({
    tile: 0,
    image: 'flameshot.png',
    action: () => {
        child_process_1.exec('flameshot gui').unref();
    },
});
installCommand_1.installCommand({
    tile: 1,
    image: 'checklist-icon.png',
    action: () => {
        i3_1.i3.tree((_err, r) => {
            // r.nodes.forEach(node => console.log(node.name))
            const logNodes = (node) => {
                node.type.includes('con') && console.log(node.name, '|', node.type);
                node.nodes.forEach(logNodes);
            };
            logNodes(r);
        });
    },
});
installCommand_1.installCommand({
    tile: 4,
    image: 'left.png',
    action: () => {
        i3_1.i3.command('move workspace to output left');
    },
});
installCommand_1.installCommand({
    tile: 6,
    image: 'gmail.png',
    action: () => {
        open_1.default('https://gmail.com');
    },
});
installCommand_1.installCommand({
    tile: 7,
    image: 'Octocat.png',
    action: () => {
        open_1.default('https://github.com/scullyio/scully/pulls');
    },
});
