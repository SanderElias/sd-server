import {pages} from '../commands';
import {installCommand} from '../streamDeck/installCommand';

let activePage = 1;

export function activatePage(n: number) {
  activePage = n;
  pages[n].forEach(installCommand);
}

export function activateNextPage() {
  activePage += 1;
  if (activePage > pages.length - 1) {
    activePage = 0;
  }
  activatePage(activePage);
}
