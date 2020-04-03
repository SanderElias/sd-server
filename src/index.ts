import './utils/exitHandler';
import './commands';
import {sdServer, reloadAll} from './server/';

sdServer();

setTimeout(() => reloadAll(), 500);
