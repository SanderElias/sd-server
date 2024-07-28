/* eslint-disable @typescript-eslint/ban-ts-comment */
import { resolve } from 'path';
import * as PImage from 'pureimage';
import { firstValueFrom, take } from 'rxjs';
import * as url from 'url';
import { deck$ } from './streamDeck.js';
// const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const createCanvas = PImage.make.bind(PImage);

const fontFolder = resolve(__dirname, '../../../assets');
const sans = resolve(fontFolder, 'SourceSansPro-Regular.ttf');
const verdana = resolve(fontFolder, 'Verdana.ttf');
const font = PImage.registerFont(sans, 'Source Sans Pro');
const font1 = PImage.registerFont(verdana, 'verdana');

// const {createCanvas, loadImage} = require('canvas');

export async function drawText(txt: string, tile: number) {
  try {
    const streamDeck = await firstValueFrom(deck$.pipe(take(1)))!;
    await font.load();

    const canvas = createCanvas(streamDeck.ICON_SIZE, streamDeck.ICON_SIZE);
    // @ts-expect-error
    const context = canvas.getContext('2d', { pixelFormat: 'RGB24' });
    context.strokeStyle = 'black';
    context.fillStyle = '#ffffff';

    const fitTextOnCanvas = (text, fontface, yPosition) => {
      let fontsize = 100;

      // lower the font size until the text fits the canvas
      do {
        fontsize--;
        context.font = fontsize + 'px ' + fontface;
      } while (context.measureText(text).width > canvas.width);

      const h = Math.abs(context.measureText(text).emHeightDescent);
      /** calculate to vertically center. the 2 is found by trail and error */
      yPosition = (streamDeck.ICON_SIZE + h * 2) / 2;
      // draw the text
      context.fillText(text, 0, yPosition);
    };

    fitTextOnCanvas(txt, 'Source Sans Pro', streamDeck.ICON_SIZE / 2);

    // @ts-ignore
    const { data } = context.getImageData();
    const out: number[] = [];
    let c = 0;
    for (let i = 0; i < data.byteLength; i += 4) {
      const x = data[i];
      if (++c === 4) {
        c = 0;
        continue;
      }
      out.push(x);
    }

    streamDeck.fillImage(tile, Buffer.from(out));
  } catch (e) {
    console.error(e);
    return undefined;
  }
}
