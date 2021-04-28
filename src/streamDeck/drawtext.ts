import {deck$} from './streamDeck';
import {take} from 'rxjs/operators';
import sharp from 'sharp';
import * as PImage from 'pureimage';
import {resolve} from 'path';
import * as streamBuffers from 'stream-buffers';

const createCanvas = PImage.make.bind(PImage);

const fontFolder = resolve(__dirname, '../../../assets');
console.log(fontFolder);
const font = PImage.registerFont(resolve(fontFolder, 'SourceSansPro-Regular.ttf'), 'Source Sans Pro');

const font1 = PImage.registerFont(resolve(fontFolder, 'Verdana.ttf'), 'verdana');

const loadFont = new Promise<void>(res =>
  font.load(() => {
    // console.log('font loaded');
    res();
  })
);

// const {createCanvas, loadImage} = require('canvas');

export async function drawText(txt: string, tile: number) {
  try {
    const streamDeck = await deck$.pipe(take(1)).toPromise();
    await loadFont;

    const canvas = createCanvas(streamDeck.ICON_SIZE, streamDeck.ICON_SIZE);
    const context = canvas.getContext('2d', {pixelFormat: 'RGB24'});
    context.strokeStyle = 'black';
    context.fillStyle = '#ffffff';
    // if (false) {
    //   const asset = resolve(__dirname, '../../../assets', img);
    //   const icon = await sharp(asset)
    //     .flatten() // Eliminate alpha channel, if any.
    //     .resize(streamDeck.ICON_SIZE, streamDeck.ICON_SIZE) // Scale up/down to the right size, cropping if necessary.
    //     .raw()
    //     .toBuffer() // Give us uncompressed RGB.
    //   console.log(icon);
    //   context.drawImage(icon,0,0)
    // }

    fitTextOnCanvas(txt, 'Source Sans Pro', streamDeck.ICON_SIZE / 2);

    function fitTextOnCanvas(text, fontface, yPosition) {
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
    }

    const {data} = context.getImageData();
    const out: number[] = [];
    let c = 0;
    for (let x of data) {
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
