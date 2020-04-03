import {exec} from 'child_process';
import open from 'open';
import {Command} from './streamDeck/Command.interface';
import {resetDeck} from './streamDeck/installCommand';
import {dblClick} from './streamDeck/streamDeck';
import {activateNextPage, activatePage} from './utils/activePage';
import {getFiles} from './utils/getFiles';
import {i3} from './utils/i3';
import {clearCountDown, countDown} from './utils/timer';

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

const page2Base: Command[] = [
  {
    tile: 13,
    image: 'alarm.png',
    action: countDown,
  },
  {
    tile: 13,
    modifier: dblClick,
    action: clearCountDown,
  },
  {
    tile: 14,
    modifier: dblClick,
    action: async () => {
      await resetDeck();
      page2.length = 0;
      page2Base.forEach(a => page2.push(a));
      await getFiles('/home/sander/Documents/talks/ngConf-2020/presentation/videos/');
      activatePage(1);
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

export const pages = [commands, page2];

activatePage()
