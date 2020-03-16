import {resolve} from 'path';
import {take} from 'rxjs/operators';
import sharp from 'sharp';
import {Command} from './Command.interface';
import {deck$} from './streamDeck';

export async function loadImage(cmd: Command) {
  const {tile, image: fileName} = cmd;
  const asset = resolve(__dirname, '../../../assets', fileName);
  //   const textSVG = `<svg>
  //   <rect x="0" y="0" width="${streamDeck.ICON_SIZE}" height="${streamDeck.ICON_SIZE}" />
  //   <text x="0" y="50" font-size="12" fill="#fff">test</text>
  // </svg>`;
  const streamDeck = await deck$.pipe(take(1)).toPromise();

  sharp(asset)
    .flatten() // Eliminate alpha channel, if any.
    .resize(streamDeck.ICON_SIZE, streamDeck.ICON_SIZE) // Scale up/down to the right size, cropping if necessary.
    .raw() // Give us uncompressed RGB.
    .toBuffer()
    .then(buffer => {
      /** hook up after (dis)connect */
      deck$.subscribe(sd => sd.fillImage(tile, buffer));
    })
    .catch(err => {
      console.error(err);
    });
}
