import type { StreamDeckButtonControlDefinitionLcdFeedback } from '@elgato-stream-deck/node';
import { resolve } from 'path';
import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';
import sharp from 'sharp';
import { Command } from './Command.interface.js';
import { drawText } from './drawtext.js';
import { deck$ } from './streamDeck.js';

const __dirname = import.meta.dirname

export async function loadImage(cmd: Command) {
  const { tile, image: fileName, title }: { tile: number; image?: string; title?: string } = cmd;
  if (title) {
    return drawText(title, tile);
  }
  if (fileName === undefined) {
    return;
  }
  const asset = resolve(__dirname, '../../../assets', fileName);
  // console.log('loading image', asset, __dirname);

  const streamDeck = await firstValueFrom(deck$.pipe(take(1)))!;
  const {
    pixelSize: { width, height },
  } = streamDeck.CONTROLS[0] as StreamDeckButtonControlDefinitionLcdFeedback;

  // const writableStreamBuffer = drawText('hello',1)

  try {
    const buffer = await sharp(asset)
      .flatten() // Eliminate alpha channel, if any.
      .resize(width, height) // Scale up/down to the right size, cropping if necessary.
      .raw() // Give us uncompressed RGB.
      .toBuffer();

    // // Re-get the streamDeck, just in case it reconnected
    // streamDeck = await firstValueFrom(deck$);
    await streamDeck.fillKeyBuffer(tile, buffer);
  } catch (e) {
    console.error('could not load image', e);
  }
}
