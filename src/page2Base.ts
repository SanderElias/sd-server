import { Command } from './streamDeck/Command.interface';
import { resetDeck } from './streamDeck/installCommand';
import { dblClick } from './streamDeck/streamDeck';
import { activateNextPage, activatePage } from './utils/activePage';
import { getFiles } from './utils/getFiles';
import { clearCountDown, countDown } from './utils/timer';
import { page2 } from './commands';
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
