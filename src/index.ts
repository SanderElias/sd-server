import './utils/exitHandler'
import './test'
import {sdServer, reloadAll} from './server/'

sdServer();

setTimeout(() => reloadAll(),2000)

