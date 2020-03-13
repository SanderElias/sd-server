import {exec} from 'child_process';
import open from 'open';
import {FluffyNode, i3, I3Tree, PurpleNode, TentacledNode} from './i3';
import {installCommand} from './installCommand';

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
