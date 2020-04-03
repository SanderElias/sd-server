import {pages} from '../commands';
import {installCommand, resetDeck} from '../streamDeck/installCommand';

let activePage = 0;

export async function activatePage(n = activePage) {
  activePage = n;
  await resetDeck();
  pages[n].forEach(installCommand);
}

export function activateNextPage() {
  activePage += 1;
  if (activePage > pages.length - 1) {
    activePage = 0;
  }
  return activatePage(activePage);
}
export function activatePrevPage() {
  activePage -= 1;
  if (activePage < 0) {
    activePage = pages.length - 1;
  }
  return activatePage(activePage);
}
