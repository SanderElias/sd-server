import './utils/exitHandler';
import './commands';
import {sdServer, reloadAll} from './server/';
import './homeAutomation/deconz';

sdServer();

setTimeout(() => reloadAll(), 1500);
