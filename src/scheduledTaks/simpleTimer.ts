import {timer} from 'rxjs';
import {filter} from 'rxjs/operators';

interface Time {
  second: number;
  minute: number;
  hour: number;
  days: number[];
}

const timeDefaults: Time = {
  second: 0,
  minute: 0,
  hour: 0,
  days: [0, 1, 2, 3, 4, 5, 6],
};

const day = 24 * 60 * 60 * 1000;

/**
 *  creates an observable that emites daily on the given time.
 * can filter on weekdays
 * @param givenTime takes a `Time` interface or a time string
 */
export function dailyTimer(givenTime: Partial<Time> | string) {
  if (typeof givenTime === 'string') {
    const [hour, minute, second] = givenTime
      .split(':')
      .map(x => +x)
      .concat(0, 0, 0);
    givenTime = {hour, minute, second};
  }
  const d = new Date();
  const time = {...timeDefaults, ...givenTime};
  const run = new Date(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
    time.hour,
    time.minute,
    time.second
  ).getTime();
  const now = d.getTime();
  const dueTime = run - now < 0 ? run - now + day : run - now;
  return timer(dueTime, day).pipe(filter(() => time.days.includes(new Date().getDay())));
}
