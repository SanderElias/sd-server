import {exec} from 'child_process';
import open from 'open';
import {distinctUntilChanged, filter, map, repeat, tap} from 'rxjs/operators';
import {buroToggle, isBuroAan, isTestBuroAan, tradfriInit, disco, discoff} from './homeAutomation/tradfri';
import {i3Command, i3Outputs, i3Tree, I3Tree, i3WorksSpaces, moveWP, PurpleNode} from './i3Command';
import {Command} from './streamDeck/Command.interface';
import {loadImage} from './streamDeck/loadImage';
import {dblClick, longPress} from './streamDeck/streamDeck';
import {activateNextPage, activatePage} from './utils/activePage';
import {getFiles} from './utils/getFiles';
import {i3} from './utils/i3';
import {page2Base} from './page2Base';

const commands = [
  {
    tile: 0,
    image: 'angular.png',
    action: () => {
      i3.command('workspace number 2');
      exec('xdotool key alt+1');
    },
  },
  {
    tile: 1,
    image: 'mo.png',
    action: () => {
      i3.command('workspace number 2');
      exec('xdotool key alt+7');
    },
  },
  {
    tile: 2,
    image: 'hero-devs-logo-400x400.jpg',
    action: () => {
      i3.command('workspace number 2');
      exec('xdotool key alt+2');
    },
  },
  {
    tile: 3,
    image: 'dag.png',
    action: () => {
      i3.command('workspace number 2');
      exec('xdotool key alt+3');
    },
  },
  {
    tile: 4,
    image: 'left.png',
    action: () => {
      i3.command('move workspace to output left');
    },
  },
  {
    tile: 5,
    image: 'dev.png',
    action: () => {
      exec('google-chrome -incognito --new-window http://localhost:3000').unref();
    },
  },
  {
    tile: 6,
    image: 'gmail.png',
    action: () => {
      open('https://gmail.com');
    },
  },
  {
    tile: 7,
    image: 'Octocat.png',
    action: () => {
      open('https://github.com/scullyio/scully/pulls');
    },
  },
  {
    tile: 8,
    image: 'flameshot.png',
    action: () => {
      exec('flameshot gui').unref();
    },
  },
  {
    tile: 13,
    image: 'terminal-icon.png',
    action: () => {
      i3.command('workspace number 1');
    },
  },
  {
    tile: 12,
    image: 'visual-studio-code-insiders-icon.png',
    action: () => {
      i3.command('workspace number 3');
    },
  },
  {
    tile: 11,
    image: 'Chrome-icon.png',
    action: () => {
      i3.command('workspace number 2');
    },
  },
  {
    tile: 11,
    modifier: dblClick,
    image: 'Chrome-icon.png',
    action: () => {
      i3.command('workspace number 2');
      exec('google-chrome http://localhost:3000/buttons');
    },
  },
  {
    tile: 14,
    image: 'refresh.png',
    action: async () => {
      await getFiles('/home/sander/Documents/talks/ngConf-2020/presentation/videos/');
      activateNextPage();
    },
  },
];

const page3: Command[] = [
  {
    tile: 0,
    image: 'display.png',
    action: async () => {
      const displays = await i3Outputs();
      const ws = (await i3WorksSpaces()).map(({name, output, num}) => ({num, output}));
      console.log({displays, ws});
      // : ws.map(({num, output, name}) => ({num, output, name})})
      // i3.workspaces((err, w) => {
      //   // console.log(w.map(({num, output, name}) => ({num, output, name})));
      //   console.log(w);
      // });
      const log = result => console.log(result);
      // await i3Command(`[workspace="1"] move workspace  to output "DisplayPort-0"`).then(log);
      // await i3Command(`[workspace="2"] move workspace  to output "DisplayPort-1"`).then(log);
      // await i3Command(`[workspace="3"] move workspace  to output "DisplayPort-1"`).then(log);
      // await i3Command(`[workspace="10"] move workspace  to output "DisplayPort-2"`).then(log);
      // await i3Command(`[workspace="19"] move workspace  to output "DisplayPort-2"`).then(log);
      // await i3Command(`workspace 1 focus`);
      // await i3Command(`workspace 3 focus`);
      // await i3Command(`workspace 19 focus`);
    },
  },
  {
    tile: 1,
    image: 'display.png',
    action: async () => {
      const log = (err?, result?) => (console.log(err, result) as unknown) as any;
      await moveWP(3, 'middle');
      await moveWP(10, 'right');
      await moveWP(7, 'right');
      await moveWP(1, 'left');
      await moveWP(19, 'right');
      await moveWP(2, 'middle');
    },
  },
  {
    tile: 2,
    image: 'jorgeHangout.png',
    action: () => {
      i3Command('workspace number 8');
    },
  },
  {
    tile: 3,
    image: 'hdHangout.png',
    action: () => {
      i3Command('workspace number 8');
      open('https://meet.google.com/srw-ehtf-bof?authuser=1&hs=122');
    },
  },
  {
    tile: 4,
    image: 'PokeBall.png',
    action: async () => {
      interface MyNode extends PurpleNode {
        parentId: number;
      }
      const nodes: MyNode[] = [];
      const tree = await i3Tree(); //.filter(row => row.name && row.name.includes('Disp'));
      const walkTree = (node: I3Tree, parentId = 0) => {
        // if (node.type && node.type === 'con') {
        nodes.push(({...node, parentId} as unknown) as MyNode);
        // }
        // tslint:disable-next-line: no-angle-bracket-type-assertion
        node.nodes.forEach(n => walkTree(<any>n, node.id));
      };
      walkTree(tree);
      const getById = (id: number) => nodes.find(n => n.id === id);
      // writeFileSync(join(__dirname, `../nodes.json`), JSON.stringify(tree));
      console.log(
        nodes
          .filter(node => node.window_properties)
          .map(n => ({
            class: n.type,
            title: n.window_properties?.title,
            name: n.name,
            parent: n.parentId,
            r: getById(n.parentId)?.layout,
          }))
          .sort((x, y) => (x.parent < y.parent ? -1 : 1))
      );
    },
  },
  {
    tile: 5,
    image: 'drive.png',
    action: () => {
      exec('nautilus');
    },
  },
  {
    tile: 6,
    image: 'bulbOff.png',
    action: async () => {
      await tradfriInit();
      await updateTest();
    },
  },
  {
    tile: 7,
    image: 'bulbOff.png',
    action: async () => {
      const me = getTile(page3, 7);
      await buroToggle();
      await updateBuro();
    },
  },
  {
    tile: 8,
    image: 'bulbOff.png',
    action: async () => {
      await toctick();
    },
  },
  {
    tile: 14,
    image: 'refresh.png',
    action: async () => {
      await activateNextPage();
    },
  },
];

export const page2 = [...page2Base];

export const pages = [commands, page3];

activatePage(1);

function getTile(page: Command[], num: any) {
  return page.find(r => r.tile === num);
}

async function bulb(tile, prom) {
  const t = getTile(page3, tile)!;
  if (await prom) {
    t.image = 'bulbOn.png';
  } else {
    t.image = 'bulbOff.png';
  }
  loadImage(t);
}
async function updateBuro() {
  return await bulb(7, isBuroAan());
}
async function updateTest() {
  /** put in a small timeout to account for new status settling in */
  await new Promise(r => setTimeout(r, 150));
  return await bulb(6, isTestBuroAan());
}
setTimeout(() => {
  updateBuro();
  updateTest();
}, 1500);

const cyclePages = () => {
  longPress(14)
    .pipe(
      map(r => Math.floor(r.delay / 1500)),
      distinctUntilChanged(),
      filter(Boolean),
      tap(k => activateNextPage()),
      repeat()
    )
    .subscribe({
      next: p => {},
    });
};

cyclePages();

let x = true;
function toctick() {
  if (x) {
    disco();
  } else {
    discoff();
  }
  bulb(8,x)
  x = !x;
}
