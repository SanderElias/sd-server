import {listStreamDecks, openStreamDeck, StreamDeck} from 'elgato-stream-deck';
import {interval, merge, race, ReplaySubject, Subject, BehaviorSubject, Observable, timer} from 'rxjs';
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
  mergeMap,
  take,
} from 'rxjs/operators';
import {logWarn} from '../utils/log';
import {throws} from 'assert';
import {DEFAULT_ECDH_CURVE} from 'tls';
// const i3 = I3
const deck = new BehaviorSubject<StreamDeck | undefined>(undefined);
/** filter out empty results. */
export const deck$ = deck.pipe(filter(d => d !== undefined)) as Observable<StreamDeck>;

let pollTimeOut: NodeJS.Timeout | undefined;
let pollInterval = 250;
let _deck: StreamDeck;
async function pollIt(lastInterval = 0) {
  const myDeck = await deck.pipe(take(1)).toPromise();
  if (myDeck) {
    try {
      myDeck.close();
    } catch {}
  }
  console.log('start streamdeck poll');
  pollInterval = Math.max(pollInterval + 50, 2500);
  if (lastInterval === 2500) {
    /** cancel retry and leave it to watchdog to restart */
    return;
  }
  // tslint:disable-next-line: no-unused-expression
  pollTimeOut !== undefined && clearTimeout(pollTimeOut);
  const decks = listStreamDecks();
  if (decks.length === 0) {
    pollTimeOut = setTimeout(() => pollIt(pollInterval), pollInterval);
    return;
  }
  if (_deck) {
    try {
      logWarn('closing deck from poll')
      _deck.close();
    } catch (e) {}
  }

  // TODO: add support for multiple decks!
  const {path} = decks[0];
  try {
    _deck = openStreamDeck(path);
    deck.next(_deck);
  } catch (e) {
    console.error(e);
    pollTimeOut = setTimeout(() => pollIt(pollInterval), pollInterval);
    return;
  }
  pollInterval = 250;
}

/** watchdog, check if deck is up */
timer(0, 60 * 60 * 1000)
  .pipe(
    mergeMap(() => deck),
    tap((currentDeck: StreamDeck | undefined) => {
      try {
        const ser = currentDeck?.getSerialNumber();
        if (!ser) {
          return pollIt();
        }
      } catch (e) {
        return pollIt();
      }
    })
  )
  .subscribe();

export const resetDeck = async () => {
  const curDeck = await deck.pipe(take(1)).toPromise();
  if (curDeck) {
    curDeck.close();
  }
  deck.next(undefined);
};

const down$ = new Subject<number>();
const up$ = new Subject<number>();

deck$.subscribe({
  next: strDeck => {
    if (!strDeck) {
      return;
    }
    strDeck.clearAllKeys();
    strDeck.on('down', (keyNumber: number) => down$.next(keyNumber));
    strDeck.on('up', (keyNumber: number) => up$.next(keyNumber));
    strDeck.on('error', (error: any) => {
      logWarn('stream-deck Error, start polling for device');
      try {
        strDeck.close();
      } catch {}
      deck.next(undefined);
      // pollIt();
    });
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
