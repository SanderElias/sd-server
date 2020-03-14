import {exec} from 'child_process';
import open from 'open';
import {puppeteer} from 'puppeteer-core';
import {FluffyNode, i3, I3Tree, PurpleNode, TentacledNode} from './utils/i3';
import {installCommand} from './streamDeck/installCommand';

installCommand({
  tile: 0,
  image: 'flameshot.png',
  action: () => {
    exec('flameshot gui').unref();
  },
});

installCommand({
  tile: 1,
  image: 'checklist-icon.png',
  action: () => {
    i3.tree((_err: any, r: I3Tree) => {
      // r.nodes.forEach(node => console.log(node.name))
      const logNodes = (
        node: I3Tree | PurpleNode | FluffyNode | TentacledNode
      ) => {
        node.type.includes('con') && console.log(node.name, '|', node.type);
        node.nodes.forEach(logNodes as any);
      };
      logNodes(r);
    });
  },
});

installCommand({
  tile: 4,
  image: 'left.png',
  action: () => {
    i3.command('move workspace to output left');
  },
});

installCommand({
  tile: 6,
  image: 'gmail.png',
  action: () => {
    open('https://gmail.com');
  },
});

installCommand({
  tile: 7,
  image: 'Octocat.png',
  action: () => {
    open('https://github.com/scullyio/scully/pulls');
  },
});

installCommand({
  tile: 10,
  image: 'terminal-icon.png',
  action: () => {
    i3.command('workspace number 1');
  },
});
installCommand({
  tile: 12,
  image: 'visual-studio-code-insiders-icon.png',
  action: () => {
    i3.command('workspace number 3');
  },
});
installCommand({
  tile: 11,
  image: 'Chrome-icon.png',
  action: () => {
    i3.command('workspace number 2');
  },
});


installCommand({
  tile: 13,
  image: 'Chrome-icon.png',
  action: () => {
    console.log('try to launch')
    // exec('/usr/bin/google-chrome --remote-debugging-port=19222 "http://127.0.0.1:19222"').unref();
    // chromeConnect();
    reloadAll();
  },
});

import {Browser, launch, LaunchOptions} from 'puppeteer-core';
import { reloadAll } from './server';

async function chromeConnect() {
  console.log('run crhime');
  const browser = await launch({headless: false,executablePath:'/usr/bin/google-chrome',defaultViewport:null});
  const page = await browser.newPage();
  await page.goto('https://google.com');

  // Type "JavaScript" into the search bar
  await page.evaluate(() => {
    if (document) {
      (document.querySelector('input[name="q"]') as HTMLInputElement).value =
        'JavaScript';
    }
  });

  // Click on the "Google Search" button and wait for the page to load
  const waitForLoad = new Promise(resolve => page.on('load', () => resolve()));
  await page.evaluate(() => {
    (document.querySelector(
      'input[value="Google Search"]'
    ) as HTMLInputElement).click();
  });
  await waitForLoad;

  await new Promise(resolve => setTimeout(resolve, 5000));
  await browser.close();
}
