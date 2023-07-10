import './commands.js';
import './homeAutomation/deconz.js';
import { reloadAll } from './server/liveReload.js';
import { hookServer, sdServer } from './server/server.js';
import './utils/exitHandler.js';

sdServer();
hookServer();

console.log('start your engine');
setTimeout(() => {
  console.log('going to reload');
  reloadAll();
}, 1000);
// dynamicTs('testAction', 'testAction2').then(f => f && f());
