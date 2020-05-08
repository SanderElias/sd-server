import {listStreamDecks, openStreamDeck, StreamDeck} from 'elgato-stream-deck';
import {interval, merge, race, ReplaySubject, Subject} from 'rxjs';
import {bufferCount, debounceTime, filter, first, map, repeat, switchMap, takeWhile} from 'rxjs/operators';
import {logWarn} from '../utils/log';
// const i3 = I3
const deck = new ReplaySubject<StreamDeck>();
/** filter out empty results. */
export const deck$ = deck.pipe(filter(d => d instanceof Object));
let currentDeck: StreamDeck | undefined;

export const getStreamDeck = () => currentDeck;

function pollIt() {
  const decks = listStreamDecks();
  if (decks.length === 0) {
    setTimeout(() => pollIt(), 250);
    return;
  }

  // TODO: add support for multiple decks!
  const {path} = decks[0];
  let sd: StreamDeck;
  try {
    sd = openStreamDeck(path);
  } catch (e) {
    console.error(e);
    setTimeout(() => pollIt(), 250);
    return;
  }
  deck.next(sd);
}

pollIt();

const down$ = new Subject<number>();
const up$ = new Subject<number>();

deck$.subscribe({
  next: strDeck => {
    if(!strDeck) { return}
    strDeck.clearAllKeys();
    strDeck.on('down', (keyNumber: number) => down$.next(keyNumber));
    strDeck.on('up', (keyNumber: number) => up$.next(keyNumber));
    strDeck.on('error', (error: any) => {
      logWarn('stream-deck Error, start polling for device');
      currentDeck = undefined;
      try {
        strDeck.close();
      } catch {}
      pollIt();
    });
    currentDeck = strDeck;
  },
});

const cycle$ = down$.pipe(
  switchMap(key => {
    const start = Date.now();
    return up$.pipe(
      filter(k => k === key),
      map(key => ({key, delay: Date.now() - start, double: false, long: false}))
    );
  })
);

const longPress$ = down$.pipe(
  switchMap(key => {
    const start = Date.now();
    return merge(
      up$.pipe(
        filter(k => k === key),
        map(() => true)
      ),
      interval(25)
    ).pipe(
      map(r => ({
        key,
        delay: Date.now() - start,
        double: false,
        long: true,
        up: typeof r === 'boolean',
      }))
    );
  }),
  takeWhile(r => !r.up),
  filter(r => r.delay > 210),
  repeat()
);

const interClick$ = cycle$.pipe(
  filter(r => r.delay < 210),
  debounceTime(200)
);
const limit$ = cycle$.pipe(
  bufferCount(2),
  map(([a, e]) => {
    e.double = a.key === e.key;
    return e;
  })
);

const gate$ = race(interClick$, limit$, longPress$).pipe(
  first(),
  repeat(),
  filter(k => !k.long)
);

export function click(key: number) {
  return gate$.pipe(
    filter(k => !k.double && k.key === key),
    map(k => k.delay)
  );
}

export function dblClick(key: number) {
  return gate$.pipe(
    filter(k => k.double && k.key === key),
    map(k => k.delay)
  );
}

export function longClick(key: number) {
  return longPress$.pipe(
    filter(k => k.key === key),
    first(),
    map(k => k.delay),
    repeat()
  );
}

export function longPress(key: number) {
  return longPress$.pipe(filter(k => k.key === key));
}
