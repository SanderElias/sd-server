import {Observable} from 'rxjs';
export interface Command {
  tile: number;
  id?: string;
  modifier?: (n: number) => Observable<number>;
  title?: string;
  image: string;
  action: () => void;
}
