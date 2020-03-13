"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const elgato_stream_deck_1 = require("elgato-stream-deck");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
// const i3 = I3
exports.streamDeck = elgato_stream_deck_1.openStreamDeck();
exports.streamDeck.clearAllKeys();
// console.log(getStreamDeckInfo(''))
// Fired whenever an error is detected by the `node-hid` library.
// Always add a listener for this event! If you don't, errors will be silently dropped.
exports.streamDeck.on('error', (error) => {
    console.error(error);
});
const down$ = new rxjs_1.Subject();
exports.streamDeck.on('down', (keyNumber) => down$.next(keyNumber));
const up$ = new rxjs_1.Subject();
exports.streamDeck.on('up', (keyNumber) => up$.next(keyNumber));
const cycle$ = down$.pipe(operators_1.switchMap(key => {
    const start = Date.now();
    return up$.pipe(operators_1.filter(k => k === key), operators_1.map(key => ({ key, delay: Date.now() - start, double: false, long: false })));
}));
const longPress$ = down$.pipe(operators_1.switchMap(key => {
    const start = Date.now();
    return rxjs_1.interval(25).pipe(operators_1.map(() => ({ key, delay: Date.now() - start, double: false, long: true })));
}), operators_1.filter(r => r.delay > 210), operators_1.takeUntil(up$), operators_1.repeat());
const interClick$ = cycle$.pipe(operators_1.filter(r => r.delay < 210), operators_1.debounceTime(200));
const limit$ = cycle$.pipe(operators_1.bufferCount(2), operators_1.map(([_a, e]) => {
    e.double = true;
    return e;
}));
const gate$ = rxjs_1.race(interClick$, limit$, longPress$).pipe(operators_1.first(), operators_1.repeat(), operators_1.filter(k => !k.long));
exports.click = (key) => gate$.pipe(operators_1.filter(k => !k.double && k.key === key), operators_1.map(k => k.delay));
exports.dblClick = (key) => gate$.pipe(operators_1.filter(k => k.double && k.key === key), operators_1.map(k => k.delay));
exports.longClick = (key) => longPress$.pipe(operators_1.filter(k => k.key === key), operators_1.first(), operators_1.map(k => k.delay), operators_1.repeat());
exports.longPress = (key) => longPress$.pipe(operators_1.filter(k => k.key === key));
