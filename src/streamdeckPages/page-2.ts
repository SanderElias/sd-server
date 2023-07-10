import { Command } from '../streamDeck/Command.interface.js';
import { resetDeck } from '../streamDeck/installCommand.js';
import { dblClick } from '../streamDeck/streamDeck.js';
import { activateNextPage, activatePage } from '../utils/activePage.js';
import { getFiles } from '../utils/getFiles.js';
import { clearCountDown, countDown } from '../utils/timer.js';

export const page2: Command[] = [];
export const page2Base: Command[] = [
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
      page2Base.forEach((a) => page2.push(a));
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
