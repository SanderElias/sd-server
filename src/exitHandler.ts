import {streamDeck} from './streamDeck';

/**
 * The following code is to make sure puppeteer will be closed properly.
 * Future additions on cleanup might to be handled here too.
 */
process.stdin.resume(); // so the program will not close instantly


function exitHandler(options, exitCode) {
  if (options.cleanup) {
  }
  if (exitCode || exitCode === 0) {
    // console.log('exit', exitCode);
  }
  if (streamDeck) {
    // streamDeck.clearAllKeys();
    // streamDeck.close();
  }
  if (options.exit) {
    process.exit();
  }
}
// do something when app is closing
process.on('exit', exitHandler.bind(null, {cleanup: true}));
// catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit: true}));
// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit: true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit: true}));
process.on('SIGTERM', exitHandler.bind(null, {exit: true}));
// catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit: true}));
