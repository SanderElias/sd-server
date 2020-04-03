import {drawText} from '../streamDeck/drawtext';
import { deck$ } from '../streamDeck/streamDeck';
import { take } from 'rxjs/operators';

let timer: NodeJS.Timeout;

export async function countDown(minutes = 20) {
  const mills = minutes * 60 * 1000;
  const startTime = new Date().getTime();
  const endTime = startTime + mills;
  clearTimeout(timer);
  const update = async () => {
    const now = new Date().getTime();
    const elapsed = (endTime - now) / 1000;
    const mins = Math.floor(elapsed / 60);
    const secs = Math.floor(elapsed - mins * 60);
    await drawText(('' + mins).padStart(2, '0'), 10);
    await drawText(('' + secs).padStart(2, '0'), 11);
    if (endTime > now) {
      timer = setTimeout(update, 1000);
    }
  };
  update();
}

export async function clearCountDown() {
  clearTimeout(timer)
  const sd = await deck$.pipe(take(1)).toPromise()
  sd.clearKey(10)
  sd.clearKey(11)
}
