import { exec } from 'child_process';

export async function runScript(cmd: string) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        // log(stderr);
        reject(err);
      } else {
        resolve(stdout);
      }
    });
  });
}
