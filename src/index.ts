import './commands';
import {dynamicTs} from './DynamicTs';
import './homeAutomation/deconz';
import {reloadAll, sdServer, hookServer} from './server/';
import './utils/exitHandler';

sdServer();
hookServer();

setTimeout(() => reloadAll(), 250);

dynamicTs('testAction', 'testAction2').then(f => f && f());
