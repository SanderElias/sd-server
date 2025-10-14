import { log } from 'console';
// import { listStreamDecks, openStreamDeck, StreamDeck } from 'elgato-stream-deck';
import { listStreamDecks, openStreamDeck, StreamDeck } from '@elgato-stream-deck/node';
import { BehaviorSubject, interval, merge, Observable, race, Subject, timer } from 'rxjs';
import {
  bufferCount,
  debounceTime,
  filter,
  first,
  map,
  repeat,
  switchMap,
  takeWhile,
  tap,
} from 'rxjs/operators';
import { logError, logWarn } from '../utils/log.js';

// const i3 = I3
const deck = new BehaviorSubject<StreamDeck | undefined>(undefined);
/** filter out empty results. */
export const deck$ = deck.pipe(filter((d) => d !== undefined)) as Observable<StreamDeck>;

let pollTimeOut: NodeJS.Timeout | undefined;
let pollInterval = 250;
// tslint:disable-next-line: variable-name
let _deck: StreamDeck | undefined;
const counter = 0;

/**
 * function to poll for stream deck. takes care of the case when the stream deck is not connected, or other issues.
 * it will iterate slower with each interval until it finds the deck, or times out.
 * when it times out, it will leave it to the watchdog to restart the stream deck.
 * @param lastInterval
 * @returns
 */
async function pollIt(lastInterval = 0) {
  pollInterval = Math.max(pollInterval + 50, 2500);
  if (lastInterval === 5000) {
    /** cancel retry and leave it to watchdog to restart */
    return;
  }
  // tslint:disable-next-line: no-unused-expression
  pollTimeOut !== undefined && clearTimeout(pollTimeOut);
  if (_deck) {
    try {
      _deck.removeAllListeners();
      _deck.close();
      _deck = undefined;
      logWarn('closed deck from poll');
    } catch (e) {
      _deck = undefined;
    }
    return pollIt();
  }

  // if (++counter > 25) {
  //   /** temporary kill switch */
  //   logError('exited by kill switch in streamdeck.ts');
  //   process.exit(15);
  // }
  const decks = await listStreamDecks();
  if (decks.length === 0) {
    pollTimeOut = setTimeout(() => pollIt(pollInterval), pollInterval);
    return;
  }

  // TODO: add support for multiple decks!
  const { path } = decks[0];
  try {
    _deck = await openStreamDeck(path);
    deck.next(_deck);
    log('StreamDeck assigned from poll');
  } catch (e) {
    _deck = undefined;
    pollTimeOut = setTimeout(() => pollIt(pollInterval), pollInterval);
    return;
  }
  pollInterval = 250;
}

/** watchdog, check if deck is up, check every 10 seconds if the deck is there, if not, restart polling. */
timer(0, 10 * 1000)
  .pipe(
    filter(() => deck.value === undefined), // only poll if deck is not connected
    tap(() => {
      logWarn('start polling for streamDeck');
      pollIt();
    }),
  )
  .subscribe();

// pollIt();
export const resetDeckConnection = async () => {
  deck.next(undefined);
};

const down$ = new Subject<number>();
const up$ = new Subject<number>();

deck$.subscribe({
  next: async (strDeck) => {
    await strDeck.removeAllListeners();
    await strDeck.clearPanel();
    strDeck.on('down', (keyNumber) => {
      // console.log('key down', keyNumber);
      down$.next(keyNumber.index);
    });
    strDeck.on('up', (keyNumber) => {
      // console.log('key up', keyNumber);
      up$.next(keyNumber.index);
    });
    strDeck.on('error', async () => {
      logWarn('stream-deck Error, start polling for device');
      try {
        await strDeck.removeAllListeners();
        await strDeck.close();
      } catch {
        logWarn('failed to close deck');
      }
      deck.next(undefined);
      // pollIt();
    });
  },
});

const cycle$ = down$.pipe(
  switchMap((key) => {
    const start = Date.now();
    return up$.pipe(
      filter((k) => k === key),
      map((key) => ({ key, delay: Date.now() - start, double: false, long: false })),
    );
  }),
);

const longPress$ = down$.pipe(
  switchMap((key) => {
    const start = Date.now();
    return merge(
      up$.pipe(
        filter((k) => k === key),
        map(() => true),
      ),
      interval(25),
    ).pipe(
      map((r) => ({
        key,
        delay: Date.now() - start,
        double: false,
        long: true,
        up: typeof r === 'boolean',
      })),
    );
  }),
  takeWhile((r) => !r.up),
  filter((r) => r.delay > 210),
  repeat(),
);

const interClick$ = cycle$.pipe(
  filter((r) => r.delay < 210),
  debounceTime(200),
);
const limit$ = cycle$.pipe(
  bufferCount(2),
  map(([a, e]) => {
    e.double = a.key === e.key;
    return e;
  }),
);

const gate$ = race(interClick$, limit$, longPress$).pipe(
  first(),
  repeat(),
  filter((k) => !k.long),
);

export function click(key: number) {
  return gate$.pipe(
    filter((k) => !k.double && k.key === key),
    map((k) => k.delay),
  );
}

export function dblClick(key: number) {
  return gate$.pipe(
    filter((k) => k.double && k.key === key),
    map((k) => k.delay),
  );
}

export function longClick(key: number) {
  return longPress$.pipe(
    filter((k) => k.key === key),
    first(),
    map((k) => k.delay),
    repeat(),
  );
}

export function longPress(key: number) {
  return longPress$.pipe(filter((k) => k.key === key));
}
