"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const sharp_1 = __importDefault(require("sharp"));
const streamDeck_1 = require("./streamDeck");
function loadImage(cmd) {
    const { tile, image: fileName } = cmd;
    const asset = path_1.resolve(__dirname, '../assets', fileName);
    //   const textSVG = `<svg>
    //   <rect x="0" y="0" width="${streamDeck.ICON_SIZE}" height="${streamDeck.ICON_SIZE}" />
    //   <text x="0" y="50" font-size="12" fill="#fff">test</text>
    // </svg>`;
    sharp_1.default(asset)
        .flatten() // Eliminate alpha channel, if any.
        .resize(streamDeck_1.streamDeck.ICON_SIZE, streamDeck_1.streamDeck.ICON_SIZE) // Scale up/down to the right size, cropping if necessary.
        .raw() // Give us uncompressed RGB.
        .toBuffer()
        .then(buffer => {
        streamDeck_1.streamDeck.fillImage(tile, buffer);
    })
        .catch(err => {
        console.error(err);
    });
}
exports.loadImage = loadImage;
