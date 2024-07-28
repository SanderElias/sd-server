export class Deferred<T> {
  resolve!: (value: T | PromiseLike<T>) => void;
  error!: (reason: any) => void;
  promise = new Promise<T>((r, e) => {
    this.resolve = r;
    this.error = e;
  });
}
