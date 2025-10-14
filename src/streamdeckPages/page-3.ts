import { exec, execSync } from 'child_process';
import { dimRelative } from '../homeAutomation/dimRelative.js';
import { resetHelper } from '../homeAutomation/resetHelper.js';
import { I3Tree, focusWP, i3Command, i3Outputs, i3Tree, i3WorksSpaces, moveWP } from '../i3Command.js';
import { Command } from '../streamDeck/Command.interface.js';
import { resetDeckConnection } from '../streamDeck/streamDeck.js';
import { activateNextPage } from '../utils/activePage.js';
import { i3 } from '../utils/i3.js';
import { videoBright } from '../utils/setBrightness.js';
import { get } from 'http';

export const page3: Command[] = [
  {
    tile: 0,
    image: 'display.png',
    action: async () => {
      const displays = await i3Outputs;
      const lookups = Object.fromEntries(Object.entries(displays).map(([key, name]) => [name, key]));
      console.log({ displays, lookups });
      const ws = (await i3WorksSpaces()).map(({ name, output, num }) => ({ num, output: lookups[output], name }));
      console.log({ displays, ws });
      const log = (result) => console.log(result);
      const cmd = `focus output ${displays.middle}` as const
      console.log(cmd);
      await i3Command(cmd);
    },
  },
  {
    tile: 1,
    image: 'display.png',
    action: async () => {
      const log = (err?, result?) => console.log(err, result) as unknown as any;
      await exec('/home/sander/.screenlayout/default.sh');
      await moveWP(5, 'left');
      await moveWP(7, 'left');
      await moveWP(1, 'left');

      await moveWP(4, 'middle');
      await moveWP(15, 'middle');
      await moveWP(3, 'middle');
      await moveWP(2, 'middle');

      await moveWP(9, 'right');
      await moveWP(8, 'right');
      await moveWP(16, 'right');
      await moveWP(17, 'right');
      await moveWP(18, 'right');
      await moveWP(19, 'right');
      await moveWP(10, 'right');

      // await focusWP(1, 'left');
      // await focusWP(3, 'middle');
      await focusWP(2, 'middle');
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
    image: 'Bluetooth.png',
    action: async () => {
      // i3Command('workspace number 8');
      // open('https://meet.google.com/srw-ehtf-bof?authuser=1&hs=122');
      const stopNotice = execSync('sudo service bluetooth stop');
      console.log({ stopNotice });
      await new Promise((r) => setTimeout(r, 2000));
      const startNotice = execSync('sudo service bluetooth start');
      console.log({ startNotice });
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
      exec('nautilus').unref();
    },
  },
  {
    tile: 6,
    image: 'i3.png',
    // title: 'h',
    action: async () => {
      interface Node extends I3Tree {
        parentId: number;
      }
      const nodes: Node[] = [];
      const tree = await i3Tree(); //.filter(row => row.name && row.name.includes('Disp'));
      const walkTree = (node: Node, parentId = 0) => {
        // if (node.type && node.type === 'con') {
        nodes.push({ ...node, parentId } as Node);
        // }
        // tslint:disable-next-line: no-angle-bracket-type-assertion
        node.nodes.forEach((n) => walkTree(n as Node, node.id));
      };
      console.log(tree);
      walkTree(tree as Node);
      const getById = (id: number) => nodes.find((n) => n.id === id);
      // writeFileSync(join(__dirname, `../nodes.json`), JSON.stringify(tree));
      console.log(
        nodes
          .filter((node) => node.type === 'con')
          .map((n) => ({
            class: n.type,
            title: n.window_properties?.title,
            size: n.percent,
            name: n.name,
            x: n.output,
            parent: n.parentId,
            layout: n.layout,
          }))
          .sort((x, y) => (x.parent < y.parent ? -1 : 1)),
      );
    },
  },
  {
    tile: 7,
    image: 'bulbOn.png',
    action: resetHelper,
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
    action: () => dimRelative('BuroSanderLamp', -10),
  },
  {
    tile: 13,
    image: 'contrast.png',
    // action: setBrightness(-0.5),
    action: () => dimRelative('BuroSanderLamp', 10),
  },
  {
    tile: 14,
    image: 'refresh.png',
    action: async () => {
      await activateNextPage();
    },
  },
];
