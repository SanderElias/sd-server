import {exec} from 'child_process';
import open from 'open';
import {launch} from 'puppeteer-core';
import {reloadAll} from './server';
import {installCommand} from './streamDeck/installCommand';
import {dblClick} from './streamDeck/streamDeck';
import {i3} from './utils/i3';

installCommand({
  tile: 0,
  image: 'angular.png',
  action: () => {
    i3.command('workspace number 2');
    exec('xdotool key alt+1');
  },
});

installCommand({
  tile: 1,
  image: 'mo.png',
  action: () => {
    i3.command('workspace number 2');
    exec('xdotool key alt+7');
  },
});

installCommand({
  tile: 2,
  image: 'hero-devs-logo-400x400.jpg',
  action: () => {
    i3.command('workspace number 2');
    exec('xdotool key alt+2');
  },
});
installCommand({
  tile: 3,
  image: 'dag.png',
  action: () => {
    i3.command('workspace number 2');
    exec('xdotool key alt+3');
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
  tile: 5,
  image: 'dev.png',
  action: () => {
    exec('google-chrome -incognito --new-window http://localhost:3000').unref();
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
  tile: 8,
  image: 'flameshot.png',
  action: () => {
    exec('flameshot gui').unref();
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
  tile: 11,
  modifier: dblClick,
  image: 'Chrome-icon.png',
  action: () => {
    i3.command('workspace number 2');
    exec('google-chrome http://localhost:3000/buttons');
  },
});

installCommand({
  tile: 14,
  image: 'refresh.png',
  action: () => {
    reloadAll();
  },
});

async function chromeConnect() {
  console.log('run crhime');
  const browser = await launch({
    headless: false,
    executablePath: '/usr/bin/google-chrome',
    defaultViewport: null,
  });
  const page = await browser.newPage();
  await page.goto('https://google.com');

  // Type "JavaScript" into the search bar
  await page.evaluate(() => {
    if (document) {
      (document.querySelector('input[name="q"]') as HTMLInputElement).value = 'JavaScript';
    }
  });

  // Click on the "Google Search" button and wait for the page to load
  const waitForLoad = new Promise(resolve => page.on('load', () => resolve()));
  await page.evaluate(() => {
    (document.querySelector('input[value="Google Search"]') as HTMLInputElement).click();
  });
  await waitForLoad;

  await new Promise(resolve => setTimeout(resolve, 5000));
  await browser.close();
}
