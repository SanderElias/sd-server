import './commands';
import {dynamicTs} from './DynamicTs';
import {reloadAll, sdServer} from './server/';
import './utils/exitHandler';

sdServer();

setTimeout(() => reloadAll(), 250);

dynamicTs('testAction', 'testAction2').then(f => f && f());
