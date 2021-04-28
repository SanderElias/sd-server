import {exec} from 'child_process';
import {readdir} from 'fs';
import {basename, extname} from 'path';
import {page2} from '../commands';
import {i3} from './i3';
import {activatePage} from './activePage';

export async function getFiles(folder) {
  const files: string[] = await new Promise(r => readdir(folder, (_, f) => r(f)));
  if (!files) {
    return;
  }
  let tile = -1;
  files.forEach(file => {
    const title = basename(file, '.flv');
    if (extname(file) !== '.flv') {
      return;
    }
    tile += 1;
    page2.push({
      tile,
      title,
      action: async () => {
        console.log(title);
        await i3.command('workspace number 5; fullscreen disable');
        // await i3.command('workspace number 5');
        await new Promise<void>(r =>
          exec(playVid(title), (err, std, ste) => {
            console.log('vlc', {err, std, ste});
            r();
          })
        );
        await i3.command('workspace number 5; fullscreen enable');
        await new Promise<void>(r =>
          exec('killall -9 vlc', res => {
            // console.log('kill', res);
            r();
          })
        );
      },
    });
  });
}
function playVid(filename) {
  return `vlc "/home/sander/Documents/talks/ngConf-2020/presentation/videos/${filename}.flv"  --no-osd vlc://quit`;
}

getFiles('/home/sander/Documents/talks/ngConf-2020/presentation/videos/');
// .then(() => {
//   activatePage(1);
// });
