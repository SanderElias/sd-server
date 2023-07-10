import { resolve } from 'path';
import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';
import sharp from 'sharp';
import { Command } from './Command.interface.js';
import { drawText } from './drawtext.js';
import { deck$ } from './streamDeck.js';
import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

export async function loadImage(cmd: Command) {
  const { tile, image: fileName, title }: { tile: number; image?: string; title?: string } = cmd;
  if (title) {
    return drawText(title, tile);
  }
  if (fileName === undefined) {
    return;
  }
  const asset = resolve(__dirname, '../../../assets', fileName);

  const streamDeck = await firstValueFrom( deck$.pipe(take(1)))!;

  // const writableStreamBuffer = drawText('hello',1)

  sharp(asset)
    .flatten() // Eliminate alpha channel, if any.
    .resize(streamDeck.ICON_SIZE, streamDeck.ICON_SIZE) // Scale up/down to the right size, cropping if necessary.
    .raw() // Give us uncompressed RGB.
    .toBuffer()
    .then((buffer) => {
      /** hook up after (dis)connect */
      deck$.subscribe((sd) => sd.fillImage(tile, buffer));
    })
    .catch((err) => {
      console.error(err);
    });
}
