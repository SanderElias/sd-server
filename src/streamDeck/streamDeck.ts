import {openStreamDeck, getStreamDeckInfo} from 'elgato-stream-deck';
import {race, Subject, interval} from 'rxjs';
import {
  bufferCount,
  debounceTime,
  filter,
  first,
  map,
  repeat,
  switchMap,
  tap,
  takeUntil,
} from 'rxjs/operators';
// const i3 = I3
export const streamDeck = openStreamDeck();
streamDeck.clearAllKeys();

// console.log(getStreamDeckInfo(''))

// Fired whenever an error is detected by the `node-hid` library.
// Always add a listener for this event! If you don't, errors will be silently dropped.
streamDeck.on('error', (error: any) => {
  console.error(error);
});

const down$ = new Subject<number>();
streamDeck.on('down', (keyNumber: number) => down$.next(keyNumber));
const up$ = new Subject<number>();
streamDeck.on('up', (keyNumber: number) => up$.next(keyNumber));

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
    return interval(25).pipe(map(() => ({key, delay: Date.now() - start, double: false, long: true})));
  }),
  filter(r => r.delay > 210),
  takeUntil(up$),
  repeat()
);

const interClick$ = cycle$.pipe(
  filter(r => r.delay < 210),
  debounceTime(200)
);
const limit$ = cycle$.pipe(
  bufferCount(2),
  map(([_a, e]) => {
    e.double = true;
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
