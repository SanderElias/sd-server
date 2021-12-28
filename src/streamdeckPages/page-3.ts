import { exec } from 'child_process';
import open from 'open';
import { pulsateBulb } from '../homeAutomation/deconz';
import { i3Command, i3Outputs, i3Tree, I3Tree, i3WorksSpaces, moveWP, PurpleNode } from '../i3Command';
import { Command } from '../streamDeck/Command.interface';
import { resetDeckConnection } from '../streamDeck/streamDeck';
import { activateNextPage } from '../utils/activePage';
import { i3 } from '../utils/i3';
import { setBrightness, videoBright } from '../utils/setBrightness';

export const page3: Command[] = [
  {
    tile: 0,
    image: 'display.png',
    action: async () => {
      const displays = await i3Outputs();
      const ws = (await i3WorksSpaces()).map(({ name, output, num }) => ({ num, output }));
      console.log({ displays, ws });
      // : ws.map(({num, output, name}) => ({num, output, name})})
      // i3.workspaces((err, w) => {
      //   // console.log(w.map(({num, output, name}) => ({num, output, name})));
      //   console.log(w);
      // });
      const log = (result) => console.log(result);
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
      await exec('/home/sander/.screenlayout/default.sh');
      await moveWP(4, 'middle');
      await moveWP(3, 'middle');
      await moveWP(2, 'middle');
      await moveWP(5, 'left');
      await moveWP(1, 'left');
      await moveWP(8, 'right');
      await moveWP(10, 'right');
      await moveWP(18, 'right');
      await moveWP(17, 'right');
      await moveWP(19, 'right');
    },
  },
  {
    tile: 2,
    image: 'streamdeck.png',
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
    image: 'left.png',
    action: () => {
      i3.command('move workspace to output left');
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
    image: 'i3.png',
    // title: 'h',
    action: async () => {
      interface MyNode extends PurpleNode {
        parentId: number;
      }
      const nodes: MyNode[] = [];
      const tree = await i3Tree(); //.filter(row => row.name && row.name.includes('Disp'));
      const walkTree = (node: I3Tree, parentId = 0) => {
        // if (node.type && node.type === 'con') {
        nodes.push(({ ...node, parentId } as unknown) as MyNode);
        // }
        // tslint:disable-next-line: no-angle-bracket-type-assertion
        node.nodes.forEach((n) => walkTree(<any>n, node.id));
      };
      console.log(tree);
      walkTree(tree);
      const getById = (id: number) => nodes.find((n) => n.id === id);
      // writeFileSync(join(__dirname, `../nodes.json`), JSON.stringify(tree));
      console.log(
        nodes
          .filter((node) => node.window_properties)
          .map((n) => ({
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
    tile: 7,
    image: 'bulbOn.png',
    action: async () => await pulsateBulb('BuroSignaal')
  },
  {
    tile: 8,
    image: 'flameshot.png',
    action: () => {
      exec('flameshot gui').unref();
    },
  },
  {
    tile: 9,
    image: 'rigth.png',
    action: () => {
      i3.command('move workspace to output right');
    },
  },
  {
    tile: 10,
    image: 'focus.png',
    action: async () => {
      videoBright();
    },
  },
  {
    tile: 11,
    image: 'warn.png',
    action: async () => {
      await resetDeckConnection();
    },
  },

  {
    tile: 12,
    image: 'contrast.png',
    action: setBrightness(0.5),
  },
  {
    tile: 13,
    image: 'contrast.png',
    action: setBrightness(-0.5),
  },
  {
    tile: 14,
    image: 'refresh.png',
    action: async () => {
      await activateNextPage();
    },
  },
];
