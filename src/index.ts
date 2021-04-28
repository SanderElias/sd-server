import './commands';
import './homeAutomation/deconz';
import {reloadAll, sdServer, hookServer} from './server/';
import './utils/exitHandler';

sdServer();
hookServer();

console.log('start your engine');
setTimeout(() => {
  console.log('going to reload');
  reloadAll();
}, 1000);
// dynamicTs('testAction', 'testAction2').then(f => f && f());
